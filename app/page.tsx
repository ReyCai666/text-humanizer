"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const PdfPreview = dynamic(() => import("@/components/PdfPreview"), { ssr: false });

// ─── Config ────────────────────────────────────────────────
const FREE_HUMANIZE_LIMIT = 3;
const FREE_SCAN_LIMIT = 3;

const TIER_LIMITS: Record<string, { humanize: number; scan: number; words: number }> = {
  free: { humanize: 3, scan: 3, words: 5000 },
  basic: { humanize: 30, scan: 10, words: 5000 },
  pro: { humanize: 100, scan: 50, words: 15000 },
  max: { humanize: 9999, scan: 300, words: 30000 },
};

// ─── Local Storage Helpers ─────────────────────────────────
function getUsage(key: string): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const d = JSON.parse(localStorage.getItem(key) || "{}");
    return d.date === today ? d.count || 0 : 0;
  } catch { return 0; }
}
function addUsage(key: string) {
  const today = new Date().toISOString().slice(0, 10);
  const c = getUsage(key) + 1;
  localStorage.setItem(key, JSON.stringify({ date: today, count: c }));
  return c;
}
function getUser(): { email: string; tier: string } | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("th_user") || "null"); } catch { return null; }
}
function setUser(email: string, tier: string) {
  localStorage.setItem("th_user", JSON.stringify({ email, tier }));
}
function clearUser() {
  localStorage.removeItem("th_user");
}

// ─── Types ─────────────────────────────────────────────────
interface Sentence {
  text: string;
  ai_probability: number;
  highlight: "none" | "yellow" | "red";
}
interface AnalysisResult {
  overall_score: number;
  human_score: number;
  summary: string;
  sentences: Sentence[];
  indicators: string[];
}

// ─── Main Component ────────────────────────────────────────
function HomeContent() {
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  // Auth
  const [user, setUserState] = useState(getUser());
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Tab
  const [tab, setTab] = useState<"humanize" | "detector">("detector");

  // Handle tab from URL params
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab === "humanize" || urlTab === "humanizer") setTab("humanize");
    else if (urlTab === "detector") setTab("detector");
  }, [searchParams]);

  // Humanizer
  const [hInput, setHInput] = useState("");
  const [hOutput, setHOutput] = useState("");
  const [hLoading, setHLoading] = useState(false);
  const [hCopied, setHCopied] = useState(false);
  const [hUsage, setHUsage] = useState(() => getUsage("th_h"));

  // Detector
  const [dInput, setDInput] = useState("");
  const [dResult, setDResult] = useState<AnalysisResult | null>(null);
  const [dLoading, setDLoading] = useState(false);
  const [dUsage, setDUsage] = useState(() => getUsage("th_d"));

  // Rewrite
  const [rewriting, setRewriting] = useState<number | null>(null);
  const [reverifyLoading, setReverifyLoading] = useState(false);

  // Shared
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // PDF Preview
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const tier = user?.tier || "free";
  const limits = TIER_LIMITS[tier];
  const isPro = tier !== "free";
  const hLeft = isPro ? Infinity : FREE_HUMANIZE_LIMIT - hUsage;
  const dLeft = isPro ? Infinity : FREE_SCAN_LIMIT - dUsage;
  const canH = hLeft > 0;
  const canD = dLeft > 0;

  // Clear messages
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(""), 5000); return () => clearTimeout(t); }
  }, [error]);
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); }
  }, [success]);

  // Handle checkout success
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowLogin(true);
      setSuccess("Payment successful! Enter your email to activate your plan.");
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  // ─── Auth ──────────────────────────────────────────────
  async function handleLogin() {
    if (!loginEmail.trim()) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail }),
      });
      const data = await res.json();
      if (data.verified) {
        setUser(data.email, data.tier);
        setUserState({ email: data.email, tier: data.tier });
        setShowLogin(false);
        setSuccess(`Welcome back! ${data.tier.toUpperCase()} plan activated.`);
      } else {
        setLoginError(data.error || "No active subscription found");
      }
    } catch {
      setLoginError("Verification failed. Try again.");
    } finally {
      setLoginLoading(false);
    }
  }
  function handleLogout() {
    clearUser();
    setUserState(null);
    setSuccess("Logged out.");
  }

  // ─── Checkout ──────────────────────────────────────────
  async function handleCheckout(variantId?: string) {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError("Failed to start checkout.");
    } catch { setError("Network error."); }
    finally { setCheckoutLoading(false); }
  }

  // ─── File Upload ───────────────────────────────────────
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Max 10MB."); return; }
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if ([".txt", ".md", ".csv"].includes(ext)) {
      const t = await file.text();
      setDInput(t);
      setHInput(t);
      return;
    }
    if (ext === ".pdf") {
      // Show PDF preview instead of raw extraction
      setPdfFile(file);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/extract-text", { method: "POST", body: fd });
      const data = await res.json();
      if (data.text) { setDInput(data.text); setHInput(data.text); }
      else setError(data.error || "Failed to extract text");
    } catch { setError("Failed to process file"); }
  }

  function handlePdfTextExtracted(text: string) {
    setDInput(text);
    setHInput(text);
    setPdfFile(null);
    setSuccess("PDF text extracted successfully!");
  }

  // ─── Humanize ──────────────────────────────────────────
  async function doHumanize(text: string): Promise<string | null> {
    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      return res.ok && data.humanized ? data.humanized : null;
    } catch { return null; }
  }

  async function handleHumanize() {
    if (!hInput.trim() || hLoading || !canH) return;
    setHLoading(true); setError(""); setHOutput("");
    const result = await doHumanize(hInput);
    if (result) {
      setHOutput(result);
      addUsage("th_h");
      setHUsage(getUsage("th_h"));
    } else {
      setError("Humanization failed.");
    }
    setHLoading(false);
  }

  // ─── Analyze ───────────────────────────────────────────
  async function doAnalyze(text: string): Promise<AnalysisResult | null> {
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      return res.ok && data.overall_score !== undefined ? data : null;
    } catch { return null; }
  }

  async function handleAnalyze() {
    if (!dInput.trim() || dLoading || !canD) return;
    setDLoading(true); setError(""); setDResult(null);
    const result = await doAnalyze(dInput);
    if (result) {
      setDResult(result);
      addUsage("th_d");
      setDUsage(getUsage("th_d"));
    } else {
      setError("Analysis failed.");
    }
    setDLoading(false);
  }

  // ─── Rewrite a single sentence ────────────────────────
  async function handleRewriteSentence(idx: number) {
    if (!dResult || rewriting !== null) return;
    setRewriting(idx);
    const sentence = dResult.sentences[idx];
    const rewritten = await doHumanize(sentence.text);
    if (rewritten) {
      const newSentences = [...dResult.sentences];
      newSentences[idx] = { ...sentence, text: rewritten, ai_probability: 0, highlight: "none" };
      // Also update the input text
      const newText = dResult.sentences.map((s, i) => i === idx ? rewritten : s.text).join(" ");
      setDInput(newText);
      setDResult({ ...dResult, sentences: newSentences });
      setSuccess("Sentence rewritten!");
    } else {
      setError("Rewrite failed.");
    }
    setRewriting(null);
  }

  // ─── Rewrite ALL red/yellow sentences ──────────────────
  async function handleRewriteAll() {
    if (!dResult || rewriting !== null) return;
    setRewriting(-1);
    const newSentences = [...dResult.sentences];
    for (let i = 0; i < newSentences.length; i++) {
      if (newSentences[i].highlight !== "none") {
        const rewritten = await doHumanize(newSentences[i].text);
        if (rewritten) {
          newSentences[i] = { ...newSentences[i], text: rewritten, ai_probability: 0, highlight: "none" };
        }
      }
    }
    const newText = newSentences.map(s => s.text).join(" ");
    setDInput(newText);
    setDResult({ ...dResult, sentences: newSentences, overall_score: 0, human_score: 100, indicators: [] });
    setSuccess("All flagged sentences rewritten!");
    setRewriting(null);
  }

  // ─── Re-verify: humanized text → scan again ────────────
  async function handleReverify() {
    if (!dInput.trim() || reverifyLoading) return;
    setReverifyLoading(true);
    const result = await doAnalyze(dInput);
    if (result) {
      setDResult(result);
      setSuccess(`Re-scan complete: AI score dropped to ${result.overall_score}%`);
    }
    setReverifyLoading(false);
  }

  // ─── Score color helpers ───────────────────────────────
  function scoreColor(s: number) {
    if (s >= 70) return "text-red-400";
    if (s >= 30) return "text-yellow-400";
    return "text-emerald-400";
  }
  function scoreBg(s: number) {
    if (s >= 70) return "from-red-500 to-red-600";
    if (s >= 30) return "from-yellow-500 to-orange-500";
    return "from-emerald-500 to-cyan-500";
  }
  function scoreLabel(s: number) {
    if (s >= 70) return "Likely AI";
    if (s >= 30) return "Suspicious";
    return "Likely Human";
  }

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* ─── PDF Preview Modal ──────────────────────────── */}
      {pdfFile && (
        <PdfPreview
          file={pdfFile}
          onTextExtracted={handlePdfTextExtracted}
          onClose={() => setPdfFile(null)}
        />
      )}

      {/* ─── Notifications ─────────────────────────────── */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {error && (
          <div className="animate-slide-in bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="animate-slide-in bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
            ✅ {success}
          </div>
        )}
      </div>

      {/* ─── Header ────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="HumanizeAI" className="w-7 h-7" />
            <span className="font-semibold text-sm tracking-tight">HumanizeAI</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Switch */}
            <div className="hidden sm:inline-flex rounded-lg bg-white/5 p-0.5 border border-white/10">
              <button
                onClick={() => setTab("detector")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  tab === "detector" ? "bg-amber-500/20 text-amber-300" : "text-slate-400 hover:text-white"
                }`}
              >
                🔍 Detector
              </button>
              <button
                onClick={() => setTab("humanize")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  tab === "humanize" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-white"
                }`}
              >
                ✨ Humanizer
              </button>
            </div>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {user.tier.toUpperCase()}
                </span>
                <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-white transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── Login Modal ───────────────────────────────── */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#14141f] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold mb-1">Welcome back</h3>
            <p className="text-sm text-slate-400 mb-4">Enter the email you used to subscribe.</p>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all mb-3"
              autoFocus
            />
            {loginError && <p className="text-red-400 text-xs mb-3">{loginError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogin(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                disabled={loginLoading || !loginEmail.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-medium disabled:opacity-50 transition-all"
              >
                {loginLoading ? "Verifying..." : "Verify"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Don&apos;t have an account?{" "}
              <button onClick={() => { setShowLogin(false); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); }} className="text-emerald-400 hover:underline">
                Get started
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ─── Main Content ──────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ─── Hero (only if no content yet) ────────────── */}
        {!dResult && !hOutput && (
          <div className="text-center mb-8 animate-fade-up">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Detect AI. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Fix AI.</span> Pass checks.
            </h1>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Paste text or upload a file. Get instant AI detection scores with sentence-level highlights and one-click rewriting.
            </p>
          </div>
        )}

        {/* ─── Mobile Tab Switch ───────────────────────── */}
        <div className="sm:hidden flex mb-4 rounded-xl bg-white/5 p-0.5 border border-white/10">
          <button
            onClick={() => setTab("detector")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === "detector" ? "bg-amber-500/20 text-amber-300" : "text-slate-400"}`}
          >
            🔍 AI Detector
          </button>
          <button
            onClick={() => setTab("humanize")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === "humanize" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400"}`}
          >
            ✨ Humanizer
          </button>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* DETECTOR TAB                                     */}
        {/* ═══════════════════════════════════════════════ */}
        {tab === "detector" && (
          <div className="animate-fade-up">
            {/* Input Area (always visible) */}
            {!dResult && (
              <div className="max-w-3xl mx-auto">
                <div className="relative bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-amber-500/30 focus-within:shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                  <textarea
                    value={dInput}
                    onChange={(e) => setDInput(e.target.value)}
                    placeholder="Paste your text here to check for AI content..."
                    className="w-full h-64 sm:h-80 bg-transparent p-5 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none"
                  />
                  <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="text-xs text-slate-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        📎 Upload file
                      </button>
                      <input ref={fileRef} type="file" accept=".txt,.md,.csv,.pdf,.docx" className="hidden" onChange={handleFile} />
                      <span className="text-xs text-slate-600">{dInput.length.toLocaleString()} chars</span>
                    </div>
                    <button
                      onClick={handleAnalyze}
                      disabled={!dInput.trim() || dLoading || !canD}
                      className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    >
                      {dLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Scanning...
                        </span>
                      ) : "🔍 Scan for AI"}
                    </button>
                  </div>
                </div>
                {!isPro && (
                  <p className="text-center text-xs text-slate-600 mt-3">
                    {dLeft} free scans remaining today
                  </p>
                )}
              </div>
            )}

            {/* Results (split layout) */}
            {dResult && (
              <div className="grid lg:grid-cols-2 gap-4 animate-fade-up">
                {/* LEFT: Original text with highlights */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Original Text</span>
                    <button
                      onClick={() => { setDResult(null); }}
                      className="text-xs text-slate-500 hover:text-white transition-colors"
                    >
                      ← New scan
                    </button>
                  </div>
                  <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
                    {dResult.sentences.map((s, i) => {
                      const bg = s.highlight === "red" ? "bg-red-500/10 border-red-500/30" :
                                 s.highlight === "yellow" ? "bg-yellow-500/10 border-yellow-500/30" :
                                 "border-transparent";
                      return (
                        <div
                          key={i}
                          className={`group relative p-3 rounded-xl border transition-all duration-300 ${bg} hover:bg-white/5`}
                        >
                          <p className="text-sm text-slate-300 leading-relaxed pr-16">{s.text}</p>
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <span className={`text-xs font-mono ${s.highlight === "red" ? "text-red-400" : s.highlight === "yellow" ? "text-yellow-400" : "text-slate-600"}`}>
                              {s.ai_probability}%
                            </span>
                            {s.highlight !== "none" && (
                              <button
                                onClick={() => handleRewriteSentence(i)}
                                disabled={rewriting !== null}
                                className="opacity-0 group-hover:opacity-100 text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                              >
                                {rewriting === i ? "..." : "Rewrite"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT: Score + Actions */}
                <div className="space-y-4">
                  {/* Score Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-center">
                      <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">AI Score</div>
                      <div className={`text-4xl font-bold ${scoreColor(dResult.overall_score)} transition-colors duration-500`}>
                        {dResult.overall_score}%
                      </div>
                      <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${scoreBg(dResult.overall_score)} rounded-full transition-all duration-1000`}
                          style={{ width: `${dResult.overall_score}%` }}
                        />
                      </div>
                      <div className={`text-xs mt-2 ${scoreColor(dResult.overall_score)}`}>{scoreLabel(dResult.overall_score)}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-center">
                      <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Human Score</div>
                      <div className="text-4xl font-bold text-emerald-400">
                        {dResult.human_score}%
                      </div>
                      <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000"
                          style={{ width: `${dResult.human_score}%` }}
                        />
                      </div>
                      <div className="text-xs mt-2 text-emerald-400">
                        {dResult.sentences.filter(s => s.highlight === "none").length}/{dResult.sentences.length} clean
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Analysis</div>
                    <p className="text-sm text-slate-300">{dResult.summary}</p>
                  </div>

                  {/* Indicators */}
                  {dResult.indicators.length > 0 && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                      <div className="text-[10px] uppercase tracking-widest text-red-400/60 mb-2">AI Patterns</div>
                      <div className="flex flex-wrap gap-1.5">
                        {dResult.indicators.map((ind, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/20">
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legend */}
                  <div className="flex items-center gap-4 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500/30 border border-red-500/50" /> Likely AI (70%+)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500/30 border border-yellow-500/50" /> Suspicious (30-69%)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-700" /> Clean (&lt;30%)</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {dResult.sentences.some(s => s.highlight !== "none") && (
                      <button
                        onClick={handleRewriteAll}
                        disabled={rewriting !== null}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      >
                        {rewriting !== null ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Rewriting...
                          </span>
                        ) : `✨ Rewrite ${dResult.sentences.filter(s => s.highlight !== "none").length} flagged sentences`}
                      </button>
                    )}
                    <button
                      onClick={handleReverify}
                      disabled={reverifyLoading}
                      className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm transition-all disabled:opacity-50"
                    >
                      {reverifyLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Re-scanning...
                        </span>
                      ) : "🔄 Re-verify score"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* HUMANIZER TAB                                    */}
        {/* ═══════════════════════════════════════════════ */}
        {tab === "humanize" && (
          <div className="animate-fade-up">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Input */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-emerald-500/30">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Text</span>
                  <button onClick={() => fileRef.current?.click()} className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
                    📎 Upload
                  </button>
                </div>
                <textarea
                  value={hInput}
                  onChange={(e) => setHInput(e.target.value)}
                  placeholder="Paste AI-generated text here..."
                  className="w-full h-64 sm:h-80 bg-transparent p-5 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none"
                />
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
                  <span className="text-xs text-slate-600">{hInput.length.toLocaleString()} chars</span>
                  <button
                    onClick={handleHumanize}
                    disabled={!hInput.trim() || hLoading || !canH}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    {hLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Humanizing...
                      </span>
                    ) : "✨ Humanize"}
                  </button>
                </div>
              </div>

              {/* Output */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Humanized</span>
                  {hOutput && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(hOutput); setHCopied(true); setTimeout(() => setHCopied(false), 2000); }}
                      className="text-xs text-slate-500 hover:text-white transition-colors"
                    >
                      {hCopied ? "✓ Copied" : "📋 Copy"}
                    </button>
                  )}
                </div>
                <div className="h-64 sm:h-80 p-5 overflow-y-auto">
                  {hOutput ? (
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{hOutput}</p>
                  ) : (
                    <p className="text-sm text-slate-600 italic">Humanized result will appear here...</p>
                  )}
                </div>
                {hOutput && (
                  <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-slate-600">{hOutput.length.toLocaleString()} chars</span>
                    <button
                      onClick={() => { setDInput(hOutput); setTab("detector"); setDResult(null); }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                    >
                      🔍 Verify AI score
                    </button>
                  </div>
                )}
              </div>
            </div>
            {!isPro && <p className="text-center text-xs text-slate-600 mt-3">{hLeft} free humanizations remaining today</p>}
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* FEATURES                                        */}
        {/* ═══════════════════════════════════════════════ */}
        {!dResult && !hOutput && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-3xl mx-auto">
            {[
              { icon: "🎯", title: "AI Detection", desc: "Sentence-level scoring" },
              { icon: "✨", title: "One-Click Fix", desc: "Rewrite flagged text" },
              { icon: "📎", title: "File Upload", desc: "PDF, Word, TXT" },
              { icon: "🔄", title: "Verify", desc: "Re-check after fix" },
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center hover:border-white/10 transition-all duration-300 hover:translate-y-[-2px]">
                <div className="text-xl mb-1">{f.icon}</div>
                <div className="text-xs font-medium text-slate-300">{f.title}</div>
                <div className="text-[10px] text-slate-500">{f.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* PRICING                                         */}
        {/* ═══════════════════════════════════════════════ */}
        {!isPro && (
          <div id="pricing" className="mt-16 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Choose your plan</h2>
              <p className="text-sm text-slate-400 mt-1">Start free, upgrade when you need more.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { name: "Basic", price: "$9.99", vid: "1524022", features: ["30 humanizations/day", "10 AI scans/day", "5,000 words/input", "File upload"], popular: false },
                { name: "Pro", price: "$19.99", vid: "1524636", features: ["100 humanizations/day", "50 AI scans/day", "15,000 words/input", "Sentence rewrite"], popular: true },
                { name: "Max", price: "$39.99", vid: "1524640", features: ["Unlimited humanizations", "300 AI scans/day", "30,000 words/input", "Priority"], popular: false },
              ].map((plan) => (
                <div key={plan.name} className={`relative p-5 rounded-2xl border transition-all duration-300 hover:translate-y-[-2px] ${
                  plan.popular ? "bg-amber-500/5 border-amber-500/20" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[10px] font-semibold">
                      Popular
                    </div>
                  )}
                  <div className="text-sm font-semibold mb-1">{plan.name}</div>
                  <div className="text-2xl font-bold mb-3">{plan.price} <span className="text-xs font-normal text-slate-500">AUD/mo</span></div>
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleCheckout(plan.vid)}
                    disabled={checkoutLoading}
                    className={`w-full py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      plan.popular
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white"
                        : "border border-white/10 hover:bg-white/5"
                    } disabled:opacity-50`}
                  >
                    Get {plan.name}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-4">All prices in AUD. Cancel anytime.</p>
          </div>
        )}

        {/* Usage indicator */}
        {!isPro && (
          <div className="text-center mt-8 text-xs text-slate-600">
            {canH || canD ? (
              <span>
                Free: {hLeft} humanizations, {dLeft} scans remaining today
              </span>
            ) : (
              <span>
                Free limit reached.{" "}
                <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} className="text-amber-400 hover:underline">
                  Upgrade now
                </button>
              </span>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 mt-12 py-6 text-center text-[10px] text-slate-600">
        © 2026 HumanizeAI — Making AI text sound human.
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <HomeContent />
    </Suspense>
  );
}
