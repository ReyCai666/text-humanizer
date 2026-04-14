import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getFingerprint, getToday } from "@/lib/fingerprint";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const FREE_DAILY_LIMIT = 3;

// Tone presets with academic-focused options
const TONE_PROMPTS: Record<string, string> = {
  formal: "Rewrite this text in a formal, professional tone. Use precise vocabulary, avoid contractions, and maintain academic rigor.",
  informal: "Rewrite this text in a casual, conversational tone. Use contractions, simple vocabulary, and a friendly voice.",
  persuasive: "Rewrite this text in a persuasive, compelling tone. Use strong rhetoric, emotional appeals, and convincing arguments.",
  analytical: "Rewrite this text in an analytical, objective tone. Focus on data, evidence, logical reasoning, and balanced analysis.",
  descriptive: "Rewrite this text in a descriptive, vivid tone. Use sensory details, rich imagery, and engaging descriptions.",
};

const PERSPECTIVE_PROMPTS: Record<string, string> = {
  first_person: "Rewrite this text using first person (I, we, my, our). Make it personal and direct.",
  third_person: "Rewrite this text using third person (he, she, they, it, one). Make it objective and detached.",
};

async function checkAndIncrementUsage(fingerprint: string): Promise<{ allowed: boolean; remaining: number }> {
  const today = getToday();

  await db.execute({
    sql: `INSERT INTO anonymous_usage (fingerprint, date, use_count)
          VALUES (?, ?, 1)
          ON CONFLICT(fingerprint, date) DO UPDATE SET use_count = use_count + 1`,
    args: [fingerprint, today],
  });

  const result = await db.execute({
    sql: "SELECT use_count FROM anonymous_usage WHERE fingerprint = ? AND date = ?",
    args: [fingerprint, today],
  });

  const used = result.rows[0]?.use_count as number || 0;
  return {
    allowed: used <= FREE_DAILY_LIMIT,
    remaining: Math.max(0, FREE_DAILY_LIMIT - used),
  };
}

export async function POST(req: NextRequest) {
  try {
    const { text, mode, option, fingerprint: clientFp } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: "Text must be under 5000 characters" }, { status: 400 });
    }

    if (!mode || !["tone", "perspective", "rephrase"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode. Use 'tone', 'perspective', or 'rephrase'" }, { status: 400 });
    }

    // Build system prompt based on mode
    let instruction = "";
    if (mode === "tone") {
      instruction = TONE_PROMPTS[option] || TONE_PROMPTS.formal;
    } else if (mode === "perspective") {
      instruction = PERSPECTIVE_PROMPTS[option] || PERSPECTIVE_PROMPTS.third_person;
    } else {
      instruction = "Rephrase this text while keeping the same meaning. Use different words and sentence structures to express the same ideas more clearly and naturally.";
    }

    const systemPrompt = `You are a professional text editor specializing in ${mode} transformation.

RULES:
1. Keep the original meaning and key information intact
2. Apply the requested transformation precisely
3. Keep the same language as the input
4. Output ONLY the rewritten text, no explanations or meta-commentary
5. Maintain natural, fluent writing

Task: ${instruction}`;

    // 服务端用量检查
    const fingerprint = getFingerprint(req, clientFp);
    const { allowed, remaining } = await checkAndIncrementUsage(fingerprint);

    if (!allowed) {
      return NextResponse.json(
        { error: "Daily free limit reached. Upgrade for unlimited access.", remaining: 0 },
        { status: 429 }
      );
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
                { text: systemPrompt },
                { text: `\n\nTransform this text:\n\n${text}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
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
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
      return NextResponse.json({ error: "Failed to process text" }, { status: 500 });
    }

    return NextResponse.json({
      result: result.trim(),
      mode,
      option,
      remaining: remaining - 1,
    });
  } catch (err) {
    console.error("Rewrite error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
