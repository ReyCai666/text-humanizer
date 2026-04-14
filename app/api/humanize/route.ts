import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_PROMPT = `Text humanization expert. Rewrite AI-generated text to sound naturally human.

RULES:
1. Keep original meaning and key info
2. Add natural touches: contractions, varied lengths, informal connectors
3. Remove robotic patterns: formulaic transitions, excessive hedging
4. Add personality: natural word choices, conversational flow
5. Mix short punchy sentences with longer ones
6. Same language as input
7. ONLY output rewritten text, no explanations`;

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
                { text: `\n\nRewrite to sound human:\n\n${text}` },
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
