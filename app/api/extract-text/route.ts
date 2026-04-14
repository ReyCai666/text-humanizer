import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const ext = fileName.substring(fileName.lastIndexOf("."));

    // Handle plain text files
    if ([".txt", ".md", ".csv", ".json", ".html", ".xml"].includes(ext)) {
      const text = await file.text();
      return NextResponse.json({ text, fileName: file.name, wordCount: text.split(/\s+/).length });
    }

    // For PDF and DOCX, we extract text server-side
    // Since we can't use native npm packages on Vercel easily,
    // we'll use a simple approach: read as buffer and try basic extraction
    const buffer = Buffer.from(await file.arrayBuffer());

    if (ext === ".pdf") {
      // Basic PDF text extraction - works for text-based PDFs
      const text = extractPdfText(buffer);
      if (!text.trim()) {
        return NextResponse.json({
          error: "Could not extract text from this PDF. Please copy-paste the text manually.",
        }, { status: 400 });
      }
      return NextResponse.json({ text, fileName: file.name, wordCount: text.split(/\s+/).length });
    }

    if (ext === ".docx") {
      // DOCX is a ZIP containing XML - extract text from document.xml
      try {
        const text = await extractDocxText(buffer);
        if (!text.trim()) {
          return NextResponse.json({
            error: "Could not extract text from this DOCX file.",
          }, { status: 400 });
        }
        return NextResponse.json({ text, fileName: file.name, wordCount: text.split(/\s+/).length });
      } catch {
        return NextResponse.json({
          error: "Failed to parse DOCX. Please save as .txt or copy-paste the text.",
        }, { status: 400 });
      }
    }

    return NextResponse.json({ error: `Unsupported file type: ${ext}` }, { status: 400 });
  } catch (err) {
    console.error("File extraction error:", err);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}

// Basic PDF text extraction (extracts text between BT/ET markers)
function extractPdfText(buffer: Buffer): string {
  const content = buffer.toString("latin1");
  const texts: string[] = [];

  // Extract text from Tj and TJ operators
  // Tj: single string
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(content)) !== null) {
    const text = match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")");
    if (text.trim()) texts.push(text);
  }

  // TJ: array of strings
  const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(content)) !== null) {
    const inner = match[1];
    const strRegex = /\(([^)]+)\)/g;
    let strMatch;
    while ((strMatch = strRegex.exec(inner)) !== null) {
      if (strMatch[1].trim()) texts.push(strMatch[1]);
    }
  }

  return texts.join(" ").replace(/\s+/g, " ").trim();
}

// DOCX text extraction (DOCX is a ZIP containing word/document.xml)
async function extractDocxText(buffer: Buffer): Promise<string> {
  // Use the DecompressionStream API (available in Node 18+)
  // DOCX is a ZIP file, we need to extract word/document.xml
  const { Readable } = await import("stream");

  // Find the word/document.xml in the ZIP
  // Simple approach: search for the XML content pattern
  const zipData = buffer;

  // Look for central directory to find word/document.xml
  const docXmlSignature = Buffer.from("word/document.xml");

  // Try to find and decompress the document.xml
  // This is a simplified approach - works for most DOCX files
  const textDecoder = new TextDecoder("utf-8");

  // Find all PK signature entries
  let result = "";
  let searchPos = 0;

  while (searchPos < zipData.length) {
    const pkPos = zipData.indexOf(Buffer.from([0x50, 0x4b, 0x03, 0x04]), searchPos);
    if (pkPos === -1) break;

    // Read local file header
    if (pkPos + 30 > zipData.length) break;

    const compressionMethod = zipData.readUInt16LE(pkPos + 8);
    const compressedSize = zipData.readUInt32LE(pkPos + 18);
    const uncompressedSize = zipData.readUInt32LE(pkPos + 22);
    const nameLength = zipData.readUInt16LE(pkPos + 26);
    const extraLength = zipData.readUInt16LE(pkPos + 28);

    if (pkPos + 30 + nameLength > zipData.length) break;

    const fileName = zipData.toString("utf8", pkPos + 30, pkPos + 30 + nameLength);

    if (fileName === "word/document.xml") {
      const dataStart = pkPos + 30 + nameLength + extraLength;
      const dataEnd = dataStart + compressedSize;

      if (dataEnd > zipData.length) break;

      const compressedData = zipData.slice(dataStart, dataEnd);

      if (compressionMethod === 0) {
        // Stored (no compression)
        result = textDecoder.decode(compressedData);
      } else if (compressionMethod === 8) {
        // Deflate
        try {
          const ds = new DecompressionStream("deflate-raw");
          const writer = ds.writable.getWriter();
          writer.write(compressedData);
          writer.close();

          const reader = ds.readable.getReader();
          const chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
          const combined = new Uint8Array(totalLen);
          let offset = 0;
          for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
          }
          result = textDecoder.decode(combined);
        } catch {
          // Fallback: try raw deflate
        }
      }
      break;
    }

    searchPos = pkPos + 30 + nameLength + extraLength + compressedSize;
  }

  if (!result) {
    // Fallback: just extract text between XML tags
    const content = zipData.toString("latin1");
    const xmlMatch = content.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
    if (xmlMatch) {
      result = xmlMatch[1];
    }
  }

  // Strip XML tags and decode entities
  return result
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/\s+/g, " ")
    .trim();
}
