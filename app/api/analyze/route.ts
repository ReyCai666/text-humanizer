import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ANALYSIS_PROMPT = `AI detection expert. Analyze text for AI probability.

Respond ONLY with valid JSON (no markdown, no code blocks):
{"overall_score":<0-100>,"human_score":<0-100>,"summary":"<1 sentence>","sentences":[{"text":"<sentence>","ai_probability":<0-100>,"highlight":"<none|yellow|red>"}],"indicators":["<pattern>"]}

Rules:
- overall_score: 100=definitely AI, 0=definitely human
- highlight: "none" if ai_probability<30, "yellow" if 30-69, "red" if >=70
- Split into sentences, score each
- Be concise. Output ONLY valid JSON`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > 30000) {
      return NextResponse.json({ error: "Text must be under 30,000 characters" }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    // Truncate to avoid token limits — 8000 chars is enough for accurate analysis
    const analysisText = text.length > 8000 ? text.slice(0, 8000) + "\n\n[Truncated]" : text;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: ANALYSIS_PROMPT },
                { text: `\n\nAnalyze:\n\n${analysisText}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status);
      return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: "Failed to analyze text" }, { status: 500 });
    }

    // Parse the JSON response with robust handling
    let result;
    try {
      // Step 1: Strip markdown code blocks (robust — handles any language tag)
      let cleaned = rawText
        .replace(/^```[\w]*\s*\n?/i, "")
        .replace(/\n?\s*```\s*$/i, "")
        .trim();

      // Step 2: Try direct parse first
      try {
        result = JSON.parse(cleaned);
      } catch {
        // Step 3: Extract JSON object using brace matching
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let jsonStr = jsonMatch[0];

          // Step 4: Fix truncated JSON - close open brackets/braces
          result = parsePartialJson(jsonStr);
        } else {
          throw new Error("No JSON found in response");
        }
      }

      // Validate the result has required fields
      if (typeof result.overall_score !== "number") {
        result.overall_score = 50;
      }
      if (typeof result.human_score !== "number") {
        result.human_score = 100 - result.overall_score;
      }
      if (!Array.isArray(result.sentences)) {
        result.sentences = [];
      }
      if (!Array.isArray(result.indicators)) {
        result.indicators = [];
      }
      if (!result.summary) {
        result.summary = "Analysis completed.";
      }
    } catch (err) {
      console.error("Failed to parse AI analysis response:", rawText.slice(0, 500));
      // Return a fallback response
      return NextResponse.json({
        overall_score: 50,
        human_score: 50,
        summary: "Could not fully analyze text. Please try again with shorter text.",
        sentences: [],
        indicators: ["Analysis incomplete"],
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Parse potentially truncated JSON by closing open structures
function parsePartialJson(jsonStr: string): any {
  try {
    return JSON.parse(jsonStr);
  } catch {
    // Try to fix truncated JSON
    let fixed = jsonStr;

    // Count open/close braces and brackets
    let braces = 0;
    let brackets = 0;
    let inString = false;
    let escape = false;

    for (let i = 0; i < fixed.length; i++) {
      const ch = fixed[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (ch === "{") braces++;
      else if (ch === "}") braces--;
      else if (ch === "[") brackets++;
      else if (ch === "]") brackets--;
    }

    // If inside a string, close it
    if (inString) {
      fixed += '"';
    }

    // Close any truncated string value (look for incomplete value)
    // e.g., "highlight": "re  -> add closing quote
    const lastQuote = fixed.lastIndexOf('"');
    if (lastQuote > 0) {
      const afterQuote = fixed.slice(lastQuote + 1).trim();
      if (afterQuote && !afterQuote.startsWith(",") && !afterQuote.startsWith("}") && !afterQuote.startsWith("]")) {
        // Incomplete value after quote - truncate to last complete field
        const lastCompleteField = fixed.lastIndexOf('",');
        if (lastCompleteField > 0) {
          fixed = fixed.slice(0, lastCompleteField + 1);
          // Reset counts
          braces = 0;
          brackets = 0;
          inString = false;
          for (let i = 0; i < fixed.length; i++) {
            const ch = fixed[i];
            if (inString) {
              if (ch === '"') inString = false;
              continue;
            }
            if (ch === '"') {
              inString = true;
              continue;
            }
            if (ch === "{") braces++;
            else if (ch === "}") braces--;
            else if (ch === "[") brackets++;
            else if (ch === "]") brackets--;
          }
        }
      }
    }

    // Remove trailing commas
    fixed = fixed.replace(/,\s*([\]}])/g, "$1");

    // Close open arrays
    while (brackets > 0) {
      fixed += "]";
      brackets--;
    }

    // Close open objects
    while (braces > 0) {
      fixed += "}";
      braces--;
    }

    return JSON.parse(fixed);
  }
}
