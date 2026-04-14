import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const TONE_PROMPTS: Record<string, string> = {
  formal: "Rewrite in a formal, professional tone. Use precise vocabulary, avoid contractions, maintain academic rigor.",
  informal: "Rewrite in a casual, conversational tone. Use contractions, simple vocabulary, friendly voice.",
  persuasive: "Rewrite in a persuasive, compelling tone. Use strong rhetoric and convincing arguments.",
  analytical: "Rewrite in an analytical, objective tone. Focus on data, evidence, and logical reasoning.",
  descriptive: "Rewrite in a descriptive, vivid tone. Use sensory details and rich imagery.",
};

const PERSPECTIVE_PROMPTS: Record<string, string> = {
  first_person: "Rewrite using first person (I, we, my, our). Make it personal and direct.",
  third_person: "Rewrite using third person (he, she, they, it, one). Make it objective and detached.",
};

export async function POST(req: NextRequest) {
  try {
    const { text, mode, option } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: "Text must be under 5000 characters" }, { status: 400 });
    }

    if (!mode || !["tone", "perspective", "rephrase"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    let instruction = "";
    if (mode === "tone") {
      instruction = TONE_PROMPTS[option] || TONE_PROMPTS.formal;
    } else if (mode === "perspective") {
      instruction = PERSPECTIVE_PROMPTS[option] || PERSPECTIVE_PROMPTS.third_person;
    } else {
      instruction = "Rephrase this text while keeping the same meaning. Use different words and sentence structures to express the same ideas more clearly and naturally.";
    }

    const systemPrompt = `You are a professional text editor.

RULES:
1. Keep original meaning and key information intact
2. Apply the requested transformation precisely
3. Same language as input
4. ONLY output rewritten text, no explanations
5. Maintain natural, fluent writing

Task: ${instruction}`;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemPrompt }, { text: `\n\nTransform this text:\n\n${text}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status);
      return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
      return NextResponse.json({ error: "Failed to process text" }, { status: 500 });
    }

    return NextResponse.json({ result: result.trim(), mode, option });
  } catch (err) {
    console.error("Rewrite error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
