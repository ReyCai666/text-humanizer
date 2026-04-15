import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Split text into sentences
function splitSentences(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  const parts = clean.match(/[^.!?]*[.!?]+(?:\s+|$)|[^.!?]+$/g);
  if (!parts) return [clean];
  return parts.map(s => s.trim()).filter(s => s.length > 0);
}

// Single prompt that does everything: score + analyze
function makePrompt(sentences: string[], fullTextPreview: string): string {
  return `You are an AI detection expert. Analyze this text.

TEXT PREVIEW (first 2000 chars):
${fullTextPreview.slice(0, 2000)}

SENTENCES TO SCORE (numbered):
${sentences.map((s, i) => `[${i}] ${s}`).join("\n")}

Respond ONLY with valid JSON:
{
  "scores": [<one 0-100 number per sentence, exactly ${sentences.length} numbers>],
  "overall_score": <0-100>,
  "summary": "<2-3 sentences analyzing the writing>",
  "indicators": ["<specific AI pattern, be detailed>"],
  "feedback": ["<actionable improvement tip, be specific>"]
}

Rules:
- scores array MUST have exactly ${sentences.length} integers
- Be SPECIFIC: instead of "generic phrasing", say "uses vague words like 'numerous' and 'various' instead of specific examples"
- feedback must be actionable: instead of "be more creative", say "replace 'numerous industries' with specific sectors like 'healthcare diagnostics' or 'supply chain logistics'"
- Output ONLY valid JSON, no markdown`;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
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

    // Split into sentences — limit to first 60 to fit token budget
    const allSentences = splitSentences(text);
    const MAX_SENTENCES = 60;
    const sentencesToScore = allSentences.slice(0, MAX_SENTENCES);

    // Only send first 3000 chars of text for analysis context (keeps prompt small = faster)
    const prompt = makePrompt(sentencesToScore, text.slice(0, 3000));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
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

    // Parse response
    const cleaned = rawText.replace(/^```[\w]*\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "").trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch {}
      }
    }

    if (!parsed) {
      return NextResponse.json({
        overall_score: 50, human_score: 50,
        summary: "Could not parse analysis. Please try again.",
        sentences: [], indicators: [], feedback: [],
      });
    }

    // Build sentence results
    const scores: number[] = Array.isArray(parsed.scores) ? parsed.scores : [];
    const sentences = sentencesToScore.map((sText, i) => {
      const prob = Math.min(100, Math.max(0, scores[i] ?? 30));
      return {
        text: sText,
        ai_probability: prob,
        highlight: prob >= 70 ? "red" as const : prob >= 30 ? "yellow" as const : "none" as const,
      };
    });

    // Pad for remaining sentences (beyond MAX)
    for (let i = MAX_SENTENCES; i < allSentences.length; i++) {
      sentences.push({ text: allSentences[i], ai_probability: 30, highlight: "none" as const });
    }

    console.log(`Analysis done in ${Date.now() - startTime}ms, ${sentences.length} sentences`);

    return NextResponse.json({
      overall_score: typeof parsed.overall_score === "number" ? parsed.overall_score : 50,
      human_score: typeof parsed.overall_score === "number" ? 100 - parsed.overall_score : 50,
      summary: parsed.summary || "Analysis completed.",
      sentences,
      indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
    });
  } catch (err) {
    console.error("Analysis error:", err, `after ${Date.now() - startTime}ms`);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
