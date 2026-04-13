import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const SYSTEM_PROMPT = `You are a text humanization expert. Your job is to rewrite AI-generated text so it sounds like a real human wrote it.

RULES:
1. Keep the original meaning and key information intact
2. Add natural human touches: occasional contractions, varied sentence lengths, informal connectors
3. Remove robotic patterns: overly structured lists, formulaic transitions ("Furthermore," "In conclusion"), excessive hedging
4. Add subtle personality: mild opinions, natural word choices, conversational flow
5. Break up uniform sentence structures — mix short punchy sentences with longer flowing ones
6. Remove filler phrases like "It's worth noting that" or "It is important to highlight"
7. Keep the same language as the input
8. Output ONLY the rewritten text, no explanations

The goal is text that passes as human-written while preserving all original meaning.`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: "Text must be under 5000 characters" }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

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
                { text: SYSTEM_PROMPT },
                { text: `\n\nRewrite this text to sound human:\n\n${text}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status);
      return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const humanized = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!humanized) {
      return NextResponse.json({ error: "Failed to process text" }, { status: 500 });
    }

    return NextResponse.json({ humanized: humanized.trim() });
  } catch (err) {
    console.error("Humanize error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
