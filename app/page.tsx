"use client";

import { useState } from "react";

const FREE_DAILY_LIMIT = 3;

function getUsageCount(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().slice(0, 10);
  const stored = localStorage.getItem("th_usage");
  if (!stored) return 0;
  try {
    const data = JSON.parse(stored);
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch {
    return 0;
  }
}

function incrementUsage(): number {
  const today = new Date().toISOString().slice(0, 10);
  const current = getUsageCount();
  const newCount = current + 1;
  localStorage.setItem("th_usage", JSON.stringify({ date: today, count: newCount }));
  return newCount;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState(() => getUsageCount());

  const remaining = FREE_DAILY_LIMIT - usage;
  const canUse = remaining > 0;

  async function handleHumanize() {
    if (!input.trim() || loading || !canUse) return;

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setOutput(data.humanized);
      incrementUsage();
      setUsage(getUsageCount());
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-sm font-bold">
              H
            </div>
            <span className="text-lg font-semibold tracking-tight">HumanizeAI</span>
          </div>
          <span className="text-xs text-slate-400">
            {canUse ? `${remaining} free uses remaining today` : "Free limit reached"}
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Make AI text sound{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              genuinely human
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Paste any AI-generated text and transform it into natural, human-sounding writing.
            Perfect for students, content creators, and professionals.
          </p>
        </div>

        {/* Editor */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Input */}
          <div className="relative">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              AI-Generated Text
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your AI-generated text here..."
              className="w-full h-64 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-500">
              {input.length} chars
            </div>
          </div>

          {/* Output */}
          <div className="relative">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              Humanized Result
            </label>
            <textarea
              value={output}
              readOnly
              placeholder="Your humanized text will appear here..."
              className="w-full h-64 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-100 placeholder-slate-500 resize-none focus:outline-none transition-all"
            />
            {output && (
              <button
                onClick={handleCopy}
                className="absolute bottom-3 right-3 text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleHumanize}
            disabled={!input.trim() || loading || !canUse}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Humanizing...
              </span>
            ) : canUse ? (
              "✨ Humanize Text"
            ) : (
              "🔒 Upgrade to Continue"
            )}
          </button>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Bypass AI Detection</h3>
            <p className="text-sm text-slate-400">
              Transforms robotic AI patterns into natural human writing styles.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Instant Results</h3>
            <p className="text-sm text-slate-400">
              Get your humanized text in seconds, not minutes.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl mb-3">🔒</div>
            <h3 className="font-semibold mb-2">Privacy First</h3>
            <p className="text-sm text-slate-400">
              Your text is never stored. Processed and forgotten.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-xs text-slate-500">
          © 2026 HumanizeAI — Making AI text sound human.
        </div>
      </footer>
    </div>
  );
}
