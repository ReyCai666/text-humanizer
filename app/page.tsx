"use client";

import { useState, useEffect } from "react";

const FREE_DAILY_LIMIT = 3;

type Tab = "humanize" | "rewrite";
type RewriteMode = "tone" | "perspective" | "rephrase";

const TONE_OPTIONS = [
  { value: "formal", label: "Formal", icon: "🎓", desc: "Professional & academic" },
  { value: "informal", label: "Informal", icon: "💬", desc: "Casual & conversational" },
  { value: "persuasive", label: "Persuasive", icon: "🔥", desc: "Compelling & convincing" },
  { value: "analytical", label: "Analytical", icon: "📊", desc: "Data-driven & objective" },
  { value: "descriptive", label: "Descriptive", icon: "🎨", desc: "Vivid & detailed" },
];

const PERSPECTIVE_OPTIONS = [
  { value: "first_person", label: "First Person", icon: "👤", desc: "I, we, my, our" },
  { value: "third_person", label: "Third Person", icon: "👥", desc: "He, she, they, it" },
];

/**
 * 生成浏览器指纹
 */
function generateFingerprint(): string {
  if (typeof window === "undefined") return "";
  const cached = sessionStorage.getItem("th_fp");
  if (cached) return cached;

  const components = [
    navigator.userAgent, navigator.language, navigator.platform,
    screen.width + "x" + screen.height, screen.colorDepth,
    new Date().getTimezoneOffset().toString(),
  ];

  let hash = 0;
  const raw = components.join("|");
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash = hash & hash;
  }
  const fp = Math.abs(hash).toString(36);
  try { sessionStorage.setItem("th_fp", fp); } catch {}
  return fp;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("humanize");
  const [rewriteMode, setRewriteMode] = useState<RewriteMode>("tone");
  const [selectedOption, setSelectedOption] = useState("formal");

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState(FREE_DAILY_LIMIT);
  const [fingerprint, setFingerprint] = useState("");
  const [usageLoaded, setUsageLoaded] = useState(false);

  useEffect(() => {
    const fp = generateFingerprint();
    setFingerprint(fp);
    fetch(`/api/usage?fp=${fp}`)
      .then(r => r.json())
      .then(data => { if (typeof data.remaining === "number") setRemaining(data.remaining); })
      .catch(() => {})
      .finally(() => setUsageLoaded(true));
  }, []);

  const canUse = remaining > 0;

  // 切换 rewrite mode 时重置 option
  useEffect(() => {
    if (rewriteMode === "tone") setSelectedOption("formal");
    else if (rewriteMode === "perspective") setSelectedOption("first_person");
    else setSelectedOption("rephrase");
  }, [rewriteMode]);

  async function handleHumanize() {
    if (!input.trim() || loading || !canUse) return;
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, fingerprint }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        return;
      }
      setOutput(data.humanized);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      else setRemaining(prev => Math.max(0, prev - 1));
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRewrite() {
    if (!input.trim() || loading || !canUse) return;
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          mode: rewriteMode,
          option: rewriteMode === "rephrase" ? undefined : selectedOption,
          fingerprint,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        return;
      }
      setOutput(data.result);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      else setRemaining(prev => Math.max(0, prev - 1));
    } catch {
      setError("Network error. Please check your connection.");
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

  const currentOptions = rewriteMode === "tone" ? TONE_OPTIONS : rewriteMode === "perspective" ? PERSPECTIVE_OPTIONS : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-sm font-bold">H</div>
            <span className="text-lg font-semibold tracking-tight">HumanizeAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">
              {usageLoaded ? (canUse ? `${remaining} free today` : "Free limit reached") : "Loading..."}
            </span>
            <button className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/30 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            University-grade{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Bypass AI Detector
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Trusted by 10,000+ students worldwide. Self-check your essays before submission
            using the same AI detection engine trusted by top universities.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500">
            <span>✓ Bypass Turnitin</span>
            <span>✓ Bypass GPTZero</span>
            <span>✓ Free to try</span>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
            <button
              onClick={() => setActiveTab("humanize")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "humanize"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ✨ Humanize
            </button>
            <button
              onClick={() => setActiveTab("rewrite")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "rewrite"
                  ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📝 Rewrite
            </button>
          </div>
        </div>

        {/* Rewrite Sub-tabs */}
        {activeTab === "rewrite" && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-slate-800/30 rounded-lg p-1 border border-slate-700/30">
              {(["tone", "perspective", "rephrase"] as RewriteMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setRewriteMode(mode)}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${
                    rewriteMode === mode
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {mode === "tone" ? "🎭 Tone" : mode === "perspective" ? "👁 Perspective" : "🔄 Rephrase"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rewrite Options */}
        {activeTab === "rewrite" && currentOptions.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {currentOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedOption(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    selectedOption === opt.value
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/50"
                      : "bg-slate-800/30 text-slate-400 border border-slate-700/30 hover:text-white hover:border-slate-600"
                  }`}
                >
                  {opt.icon} {opt.label}
                  <span className="block text-xs text-slate-500 mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              {activeTab === "humanize" ? "AI-Generated Text" : "Original Text"}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeTab === "humanize"
                  ? "Paste your AI-generated text here..."
                  : "Paste the text you want to rewrite..."
              }
              className="w-full h-64 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-500">{input.length} / 5000</div>
          </div>

          <div className="relative">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
              {activeTab === "humanize" ? "Humanized Result" : "Rewritten Result"}
            </label>
            <textarea
              value={output}
              readOnly
              placeholder={
                activeTab === "humanize"
                  ? "Your humanized text will appear here..."
                  : "Your rewritten text will appear here..."
              }
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

        {/* Action Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={activeTab === "humanize" ? handleHumanize : handleRewrite}
            disabled={!input.trim() || loading || !canUse}
            className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === "humanize"
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 shadow-emerald-500/25"
                : "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 shadow-violet-500/25"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : canUse ? (
              activeTab === "humanize" ? "✨ Humanize Text" : "🔄 Rewrite Text"
            ) : (
              "🔒 Upgrade to Continue"
            )}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Trust Logos */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm mb-4">Trusted by students at</p>
          <div className="flex items-center justify-center gap-8 text-slate-600 text-sm font-medium">
            <span>Harvard</span><span>MIT</span><span>Stanford</span><span>Oxford</span><span>Cambridge</span>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Bypass AI Detection</h3>
            <p className="text-sm text-slate-400">Passes Turnitin, GPTZero, Originality.ai and more. Same engine used by top universities.</p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Instant Results</h3>
            <p className="text-sm text-slate-400">Get your humanized or rewritten text in seconds, not minutes.</p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl mb-3">🔒</div>
            <h3 className="font-semibold mb-2">Privacy First</h3>
            <p className="text-sm text-slate-400">Your text is never stored. Processed and forgotten.</p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 font-bold">1</div>
              <h3 className="font-semibold mb-2">Paste Your Text</h3>
              <p className="text-sm text-slate-400">Copy any AI-generated content from ChatGPT, Claude, or other tools.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 font-bold">2</div>
              <h3 className="font-semibold mb-2">Choose Your Mode</h3>
              <p className="text-sm text-slate-400">Humanize for AI detection bypass, or Rewrite for tone/perspective changes.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 font-bold">3</div>
              <h3 className="font-semibold mb-2">Submit With Confidence</h3>
              <p className="text-sm text-slate-400">Your text is ready. Pass AI detection tools with ease.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-xs text-slate-500">
          © 2026 HumanizeAI — University-grade Bypass AI Detector
        </div>
      </footer>
    </div>
  );
}
