import { NextRequest, NextResponse } from "next/server";

// Content block types
interface ContentBlock {
  type: "heading1" | "heading2" | "heading3" | "paragraph";
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const ext = fileName.substring(fileName.lastIndexOf("."));

    // Plain text files — preserve double newlines as paragraph breaks
    if ([".txt", ".md", ".csv", ".json", ".html", ".xml"].includes(ext)) {
      const raw = await file.text();
      const blocks = parsePlainText(raw);
      const plainText = blocks.map(b => b.text).join("\n\n");
      return NextResponse.json({ text: plainText, blocks, fileName: file.name, wordCount: plainText.split(/\s+/).length });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (ext === ".pdf") {
      const blocks = extractPdfBlocks(buffer);
      if (blocks.length === 0) {
        return NextResponse.json({
          error: "Could not extract text from this PDF. Please copy-paste the text manually.",
        }, { status: 400 });
      }
      const plainText = blocks.map(b => b.text).join("\n\n");
      return NextResponse.json({ text: plainText, blocks, fileName: file.name, wordCount: plainText.split(/\s+/).length });
    }

    if (ext === ".docx") {
      try {
        const blocks = await extractDocxBlocks(buffer);
        if (blocks.length === 0) {
          return NextResponse.json({ error: "Could not extract text from this DOCX file." }, { status: 400 });
        }
        const plainText = blocks.map(b => b.text).join("\n\n");
        return NextResponse.json({ text: plainText, blocks, fileName: file.name, wordCount: plainText.split(/\s+/).length });
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

// ─── Plain Text Parser ────────────────────────────────
function parsePlainText(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const paragraphs = text.split(/\n\n+/);

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Detect headings: short lines, or lines that look like titles
    const lines = trimmed.split("\n");
    const firstLine = lines[0].trim();

    // Heuristic: if first line is short (<60 chars), ALL CAPS, or ends without period → likely heading
    if (lines.length === 1 && firstLine.length < 60 && (firstLine === firstLine.toUpperCase() || !firstLine.endsWith("."))) {
      blocks.push({ type: "heading1", text: firstLine });
    } else if (firstLine.length < 80 && lines.length > 1 && !firstLine.endsWith(".") && !firstLine.endsWith(",")) {
      // First line might be a heading, rest is paragraph
      blocks.push({ type: "heading2", text: firstLine });
      const rest = lines.slice(1).join(" ").trim();
      if (rest) blocks.push({ type: "paragraph", text: rest });
    } else {
      blocks.push({ type: "paragraph", text: trimmed });
    }
  }

  return blocks;
}

// ─── PDF Extraction with Paragraph Detection ─────────
function extractPdfBlocks(buffer: Buffer): ContentBlock[] {
  const content = buffer.toString("latin1");
  const textSegments: string[] = [];

  // Extract text from Tj operators (single strings)
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(content)) !== null) {
    const text = match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")");
    if (text.trim()) textSegments.push(text);
  }

  // Extract from TJ arrays
  const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(content)) !== null) {
    const inner = match[1];
    const strRegex = /\(([^)]+)\)/g;
    let strMatch;
    while ((strMatch = strRegex.exec(inner)) !== null) {
      if (strMatch[1].trim()) textSegments.push(strMatch[1]);
    }
  }

  // Join and split into paragraphs
  const fullText = textSegments.join(" ").replace(/\s+/g, " ").trim();
  if (!fullText) return [];

  // Split by double spaces, newlines, or sentence patterns that suggest new sections
  const rawParagraphs = fullText
    .split(/(?<=[.!?])\s+(?=[A-Z])/g)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const blocks: ContentBlock[] = [];
  for (const para of rawParagraphs) {
    if (para.length < 60 && para === para.toUpperCase()) {
      blocks.push({ type: "heading1", text: para });
    } else if (para.length < 80 && !para.endsWith(".")) {
      blocks.push({ type: "heading2", text: para });
    } else {
      blocks.push({ type: "paragraph", text: para });
    }
  }

  return blocks.length > 0 ? blocks : [{ type: "paragraph", text: fullText }];
}

// ─── DOCX Extraction with Heading Detection ──────────
async function extractDocxBlocks(buffer: Buffer): Promise<ContentBlock[]> {
  const { Readable } = await import("stream");

  // Find word/document.xml in the ZIP
  let xmlContent = "";
  let searchPos = 0;

  while (searchPos < buffer.length) {
    const pkPos = buffer.indexOf(Buffer.from([0x50, 0x4b, 0x03, 0x04]), searchPos);
    if (pkPos === -1) break;
    if (pkPos + 30 > buffer.length) break;

    const compressionMethod = buffer.readUInt16LE(pkPos + 8);
    const compressedSize = buffer.readUInt32LE(pkPos + 18);
    const nameLength = buffer.readUInt16LE(pkPos + 26);
    const extraLength = buffer.readUInt16LE(pkPos + 28);

    if (pkPos + 30 + nameLength > buffer.length) break;
    const fileName = buffer.toString("utf8", pkPos + 30, pkPos + 30 + nameLength);

    if (fileName === "word/document.xml") {
      const dataStart = pkPos + 30 + nameLength + extraLength;
      const dataEnd = dataStart + compressedSize;
      if (dataEnd > buffer.length) break;

      const compressedData = buffer.slice(dataStart, dataEnd);

      if (compressionMethod === 0) {
        xmlContent = new TextDecoder("utf-8").decode(compressedData);
      } else if (compressionMethod === 8) {
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
          xmlContent = new TextDecoder("utf-8").decode(combined);
        } catch { /* fallback below */ }
      }
      break;
    }

    searchPos = pkPos + 30 + nameLength + extraLength + compressedSize;
  }

  if (!xmlContent) {
    // Fallback: try extracting from raw content
    const content = buffer.toString("latin1");
    const xmlMatch = content.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
    if (xmlMatch) xmlContent = xmlMatch[1];
  }

  if (!xmlContent) return [];

  // Parse paragraphs with heading detection
  const blocks: ContentBlock[] = [];

  // Split by paragraph boundaries
  const paraRegex = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
  let paraMatch;

  while ((paraMatch = paraRegex.exec(xmlContent)) !== null) {
    const paraXml = paraMatch[1];

    // Check for heading style
    let blockType: ContentBlock["type"] = "paragraph";
    const styleMatch = paraXml.match(/<w:pStyle\s+w:val="([^"]+)"/);
    if (styleMatch) {
      const style = styleMatch[1].toLowerCase();
      if (style.includes("heading1") || style.includes("title")) blockType = "heading1";
      else if (style.includes("heading2")) blockType = "heading2";
      else if (style.includes("heading3")) blockType = "heading3";
    }

    // Also check for direct formatting (bold + larger font = likely heading)
    const fontSizeMatch = paraXml.match(/<w:sz\s+w:val="(\d+)"/);
    const isBold = /<w:b\s*\/>/.test(paraXml) || /<w:b\s+/.test(paraXml);
    if (!styleMatch && fontSizeMatch) {
      const size = parseInt(fontSizeMatch[1]);
      if (size >= 32 && isBold) blockType = "heading1";      // 16pt+ bold
      else if (size >= 28 && isBold) blockType = "heading2";  // 14pt+ bold
      else if (size >= 24 && isBold) blockType = "heading3";  // 12pt+ bold
    }

    // Extract text content
    const textRuns = paraXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textRuns) {
      const text = textRuns
        .map(t => t.replace(/<w:t[^>]*>/, "").replace(/<\/w:t>/, ""))
        .join("")
        .trim();

      if (text) {
        blocks.push({ type: blockType, text });
      }
    }
  }

  return blocks;
}
