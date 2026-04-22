"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

const PdfPreview = dynamic(() => import("@/components/PdfPreview"), { ssr: false });
const Marketing = dynamic(() => import("@/components/Marketing"), { ssr: false });
const WordLimit = dynamic(() => import("@/components/WordLimit"), { ssr: false });

// ─── Config ────────────────────────────────────────────────
const FREE_HUMANIZE_LIMIT = 3;
const FREE_SCAN_LIMIT = 3;

// ─── Static Text Highlight: just renders text with colored highlights ──
function HighlightedText({
  originalText,
  sentences,
}: {
  originalText: string;
  sentences: { text: string; ai_probability: number; highlight: "none" | "yellow" | "red" }[];
}) {
  // For each flagged sentence, find its position in the original text
  const flagged = sentences
    .map((s, i) => ({ ...s, idx: i }))
    .filter(s => s.highlight !== "none")
    .map(s => {
      const norm = s.text.replace(/\s+/g, " ").trim().toLowerCase();
      const start = originalText.toLowerCase().indexOf(norm.slice(0, Math.min(50, norm.length)));
      return { ...s, start: start >= 0 ? start : -1, norm };
    })
    .filter(s => s.start >= 0)
    .sort((a, b) => a.start - b.start);

  // Build render segments: plain text alternating with highlighted spans
  const parts: { text: string; highlight: "none" | "yellow" | "red"; pct: number }[] = [];
  let pos = 0;

  for (const f of flagged) {
    if (f.start < pos) continue; // skip overlapping
    if (f.start > pos) {
      parts.push({ text: originalText.slice(pos, f.start), highlight: "none", pct: 0 });
    }
    const end = Math.min(f.start + f.text.length, originalText.length);
    parts.push({ text: originalText.slice(f.start, end), highlight: f.highlight, pct: f.ai_probability });
    pos = end;
  }
  if (pos < originalText.length) {
    parts.push({ text: originalText.slice(pos), highlight: "none", pct: 0 });
  }

  if (parts.length === 0) {
    parts.push({ text: originalText, highlight: "none", pct: 0 });
  }

  // Use div (not p) to avoid hydration issues with complex children
  return (
    <div style={{ fontSize: "14px", lineHeight: 1.9, color: "#cbd5e1" }}>
      {parts.map((seg, i) => {
        if (seg.highlight === "none") return <span key={i}>{seg.text}</span>;
        const isRed = seg.highlight === "red";
        return (
          <span key={i} style={{
            backgroundColor: isRed ? "rgba(239,68,68,0.22)" : "rgba(234,179,8,0.18)",
            color: isRed ? "#fecaca" : "#fef08a",
            padding: "1px 3px",
            borderRadius: "3px",
            borderBottom: `2px solid ${isRed ? "#ef4444" : "#eab308"}`,
          }} title={`AI: ${seg.pct}%`}>
            {seg.text}
          </span>
        );
      })}
    </div>
  );
}

const TIER_LIMITS: Record<string, { humanize: number; scan: number; rewrite: number; words: number }> = {
  free:   { humanize: 3,   scan: 3,   rewrite: 3,   words: 1000 },
  basic:  { humanize: 30,  scan: 10,  rewrite: 30,  words: 8000 },
  pro:    { humanize: 100, scan: 50,  rewrite: 100, words: 15000 },
  max:    { humanize: 9999,scan: 300, rewrite: 9999, words: 30000 },
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
  feedback?: string[];
}
interface ContentBlock {
  type: "heading1" | "heading2" | "heading3" | "paragraph";
  text: string;
}

// ─── Main Component ────────────────────────────────────────
function HomeContent() {
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auth
  const [user, setUserState] = useState(getUser());
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Tab
  const [tab, setTab] = useState<"humanize" | "detector" | "rewrite">("detector");

  // Handle tab from URL params
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab === "humanize" || urlTab === "humanizer") setTab("humanize");
    else if (urlTab === "detector") setTab("detector");
    else if (urlTab === "rewrite") setTab("rewrite");
  }, [searchParams]);

  // Rewrite
  const [rewriteMode, setRewriteMode] = useState<"tone" | "perspective" | "rephrase">("tone");
  const [rewriteOption, setRewriteOption] = useState("formal");
  const [rwInput, setRwInput] = useState("");
  const [rwOutput, setRwOutput] = useState("");
  const [rwLoading, setRwLoading] = useState(false);
  const [rwCopied, setRwCopied] = useState(false);
  const [rwUsage, setRwUsage] = useState(() => getUsage("th_rw"));

  // Reset rewrite option when mode changes
  useEffect(() => {
    if (rewriteMode === "tone") setRewriteOption("formal");
    else if (rewriteMode === "perspective") setRewriteOption("first_person");
  }, [rewriteMode]);

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
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[] | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);

  // Rewrite
  const [rewriting, setRewriting] = useState<number | null>(null);
  const [reverifyLoading, setReverifyLoading] = useState(false);

  // Shared
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Paywall modal
  const [showPaywall, setShowPaywall] = useState<null | "scan" | "humanize" | "rewrite">(null);

  // PDF Preview
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const tier = user?.tier || "free";
  const limits = TIER_LIMITS[tier];
  const isPro = tier !== "free";
  const hLeft = isPro ? Infinity : FREE_HUMANIZE_LIMIT - hUsage;
  const dLeft = isPro ? Infinity : FREE_SCAN_LIMIT - dUsage;
  const rwLeft = isPro ? Infinity : FREE_HUMANIZE_LIMIT - rwUsage;
  const canH = hLeft > 0;
  const canD = dLeft > 0;
  const canRw = rwLeft > 0;

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
      // Parse plain text into blocks
      const blocks: ContentBlock[] = t.split(/\n\n+/).filter(p => p.trim()).map(para => {
        const trimmed = para.trim();
        if (trimmed.length < 60 && trimmed === trimmed.toUpperCase()) return { type: "heading1" as const, text: trimmed };
        return { type: "paragraph" as const, text: trimmed };
      });
      setContentBlocks(blocks.length > 0 ? blocks : [{ type: "paragraph", text: t }]);
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
      if (data.text) {
        setDInput(data.text);
        setHInput(data.text);
        setContentBlocks(data.blocks || [{ type: "paragraph", text: data.text }]);
      }
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
    if (!hInput.trim() || hLoading) return;
    if (hInput.length > limits.words) { setError(`Text exceeds your ${limits.words.toLocaleString()} character limit. Shorten it or upgrade your plan.`); return; }
    if (!canH) { setShowPaywall("humanize"); return; }
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

  // ─── Rewrite ──────────────────────────────────────────
  async function handleRewrite() {
    if (!rwInput.trim() || rwLoading) return;
    if (rwInput.length > limits.words) { setError(`Text exceeds your ${limits.words.toLocaleString()} character limit. Shorten it or upgrade your plan.`); return; }
    if (!canRw) { setShowPaywall("rewrite"); return; }
    setRwLoading(true); setError(""); setRwOutput("");
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rwInput, mode: rewriteMode, option: rewriteOption }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setRwOutput(data.result);
        addUsage("th_rw");
        setRwUsage(getUsage("th_rw"));
      } else {
        setError(data.error || "Rewrite failed.");
      }
    } catch { setError("Rewrite failed."); }
    setRwLoading(false);
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
    if (!dInput.trim() || dLoading) return;
    if (dInput.length > limits.words) { setError(`Text exceeds your ${limits.words.toLocaleString()} character limit. Shorten it or upgrade your plan.`); return; }
    if (!canD) { setShowPaywall("scan"); return; }
    setDLoading(true); setError(""); setDResult(null); setSelectedBlock(null);
    // Scroll to results area
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
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
            <img src="/logo.svg" alt="EIGEN AI" className="w-7 h-7" />
            <span className="font-semibold text-sm tracking-tight">EIGEN AI</span>
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
                🎯 AI Score
              </button>
              <button
                onClick={() => setTab("humanize")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  tab === "humanize" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-white"
                }`}
              >
                ✨ Humanizer
              </button>
              <button
                onClick={() => setTab("rewrite")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  tab === "rewrite" ? "bg-violet-500/20 text-violet-300" : "text-slate-400 hover:text-white"
                }`}
              >
                📝 Rewrite
              </button>
            </div>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                {!isPro && (
                  <span className="text-xs text-slate-500">
                    {dLeft} scans left
                  </span>
                )}
                <Link href="/pricing" className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-300 hover:from-amber-500/20 hover:to-orange-500/20 transition-all font-medium">
                  Pricing
                </Link>
                <Link href="/account" className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                  {user.tier.toUpperCase()}
                </Link>
                <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-white transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {!isPro && (
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    {dLeft} free scans left
                  </span>
                )}
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  Sign In
                </button>
                <Link href="/pricing" className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-300 hover:from-amber-500/20 hover:to-orange-500/20 transition-all font-medium">
                  Pricing
                </Link>
              </div>
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
              <Link href="/pricing" onClick={() => setShowLogin(false)} className="text-emerald-400 hover:underline">
                Get started
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ─── Paywall Modal ──────────────────────────────── */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#14141f] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {showPaywall === "scan" ? "Free scans used up" : showPaywall === "humanize" ? "Free humanizations used up" : "Free rewrites used up"}
              </h3>
              <p className="text-sm text-slate-400 mb-1">
                You&apos;ve reached your daily free limit of{" "}
                {showPaywall === "scan" ? `${FREE_SCAN_LIMIT} AI scans` : `${FREE_HUMANIZE_LIMIT} ${showPaywall === "humanize" ? "humanizations" : "rewrites}"}`}.
              </p>
              <p className="text-sm text-slate-400 mb-6">
                Upgrade for more {showPaywall === "scan" ? "scans" : showPaywall === "humanize" ? "humanizations" : "rewrites"} per day.
              </p>
            </div>
            {/* Plan cards */}
            <div className="space-y-2 mb-4">
              {[
                { name: "Basic", price: "$9.99", vid: "1553040", limit: showPaywall === "scan" ? "10 scans/day" : showPaywall === "humanize" ? "30 humanizations/day" : "30 rewrites/day" },
                { name: "Pro", price: "$19.99", vid: "1553066", limit: showPaywall === "scan" ? "50 scans/day" : showPaywall === "humanize" ? "100 humanizations/day" : "100 rewrites/day" },
              ].map(plan => (
                <button
                  key={plan.name}
                  onClick={() => { setShowPaywall(null); handleCheckout(plan.vid); }}
                  disabled={checkoutLoading}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-left disabled:opacity-50"
                >
                  <div>
                    <span className="text-sm font-medium">{plan.name}</span>
                    <span className="text-xs text-slate-500 ml-2">{plan.limit}</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-400">{plan.price}<span className="text-xs text-slate-500">/mo</span></span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowPaywall(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition-all">
                Maybe later
              </button>
              <Link href="/pricing" onClick={() => setShowPaywall(null)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-medium hover:from-amber-400 hover:to-orange-400 transition-all text-center">
                See all plans
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Content ──────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ─── Hero (only if no content yet) ────────────── */}
        {!dResult && !hOutput && !rwOutput && (
          <div className="text-center mb-8 animate-fade-up">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Write with AI. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Submit with confidence.</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              See exactly what gets flagged. Fix it in one click. Pass every detector — Turnitin, GPTZero, Copyleaks, and more.
            </p>
          </div>
        )}


        {/* ─── Mobile Tab Switch ───────────────────────── */}
        <div className="sm:hidden flex mb-4 rounded-xl bg-white/5 p-0.5 border border-white/10">
          <button
            onClick={() => setTab("detector")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === "detector" ? "bg-amber-500/20 text-amber-300" : "text-slate-400"}`}
          >
            🎯 AI Score
          </button>
          <button
            onClick={() => setTab("humanize")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === "humanize" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400"}`}
          >
            ✨ Humanizer
          </button>
          <button
            onClick={() => setTab("rewrite")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === "rewrite" ? "bg-violet-500/20 text-violet-300" : "text-slate-400"}`}
          >
            📝 Rewrite
          </button>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* DETECTOR TAB                                     */}
        {/* ═══════════════════════════════════════════════ */}
        {tab === "detector" && (
          <div className="animate-fade-up">
            {/* Input Area - hidden when loading or has results */}
            {!dResult && !dLoading && (
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
                      <WordLimit current={dInput.length} max={limits.words} tier={tier} />
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

            {/* Results (show when loading or has results) */}
            {(dLoading || dResult) && (
              <div ref={resultsRef} className="animate-fade-up">
                {/* Side-by-side document view */}
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* LEFT: Original text with formatting */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Original Document</span>
                      <button
                        onClick={() => { setDResult(null); setDInput(""); setContentBlocks(null); setSelectedBlock(null); }}
                        className="text-xs text-slate-500 hover:text-white transition-colors"
                      >
                        ← New scan
                      </button>
                    </div>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                      {contentBlocks ? (
                        // Render with formatting
                        contentBlocks.map((block, i) => {
                          const style =
                            block.type === "heading1" ? "text-lg font-bold text-white mb-2 mt-4 first:mt-0" :
                            block.type === "heading2" ? "text-base font-semibold text-slate-200 mb-1 mt-3" :
                            block.type === "heading3" ? "text-sm font-semibold text-slate-300 mb-1 mt-2" :
                            "text-sm text-slate-300 leading-[1.8] mb-3";
                          return <div key={i} className={style}>{block.text}</div>;
                        })
                      ) : (
                        // Fallback: plain text with paragraph breaks
                        dInput.split(/\n\n+/).map((para, i) => (
                          <p key={i} className="text-sm text-slate-300 leading-[1.8] mb-4 last:mb-0 whitespace-pre-wrap">{para}</p>
                        ))
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Analysis with highlights */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Analysis</span>
                      {dLoading && (
                        <span className="flex items-center gap-2 text-xs text-amber-400">
                          <span className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                          Analyzing...
                        </span>
                      )}
                    </div>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                      {dLoading ? (
                        <div className="space-y-4">
                          {(contentBlocks || dInput.split(/\n\n+/).map(t => ({ type: "paragraph" as const, text: t }))).map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-4 bg-slate-800 rounded w-full mb-2" style={{ animationDelay: `${i * 100}ms` }} />
                              <div className="h-4 bg-slate-800 rounded w-3/4" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                            </div>
                          ))}
                          <div className="flex items-center justify-center gap-2 pt-4 text-xs text-slate-500">
                            <span className="w-3.5 h-3.5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                            Scanning for AI patterns...
                          </div>
                        </div>
                      ) : dResult ? (
                        <HighlightedText
                          originalText={dInput}
                          sentences={dResult.sentences}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Bento Grid: Score + Analysis + Patterns + Feedback */}
                <div className="mt-6 space-y-4">
                  {dLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 animate-pulse">
                        <div className="h-10 w-16 bg-slate-800 rounded mx-auto mb-2" />
                        <div className="h-2 bg-slate-800 rounded-full" />
                      </div>
                      <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-5 animate-pulse">
                        <div className="h-3 bg-slate-800 rounded w-full mb-2" />
                        <div className="h-3 bg-slate-800 rounded w-3/4" />
                      </div>
                      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 animate-pulse">
                        <div className="h-3 bg-slate-800 rounded w-full mb-2" />
                        <div className="h-3 bg-slate-800 rounded w-5/6" />
                      </div>
                      <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-5 animate-pulse">
                        <div className="h-3 bg-slate-800 rounded w-full mb-2" />
                        <div className="h-3 bg-slate-800 rounded w-4/5" />
                      </div>
                    </div>
                  ) : dResult && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Row 1: AI Score + Analysis */}
                      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">AI Score</div>
                        <div className={`text-4xl font-bold ${scoreColor(dResult.overall_score)}`}>
                          {dResult.overall_score}%
                        </div>
                        <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${scoreBg(dResult.overall_score)} rounded-full transition-all duration-1000`}
                            style={{ width: `${dResult.overall_score}%` }}
                          />
                        </div>
                        <div className={`text-xs mt-1.5 font-medium ${scoreColor(dResult.overall_score)}`}>{scoreLabel(dResult.overall_score)}</div>
                        <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-red-500/50" /> {dResult.sentences.filter(s => s.highlight === "red").length} flagged</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-yellow-500/50" /> {dResult.sentences.filter(s => s.highlight === "yellow").length} sus</span>
                        </div>
                      </div>

                      <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Analysis</div>
                        <p className="text-sm text-slate-300 leading-relaxed">{dResult.summary}</p>
                      </div>

                      {/* Row 2: Detected AI Patterns + How to Improve */}
                      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                        <div className="text-[10px] uppercase tracking-widest text-red-400/60 mb-3">Detected AI Patterns</div>
                        <div className="space-y-2">
                          {dResult.indicators.length > 0 ? (
                            dResult.indicators.map((ind, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                                <span className="text-red-400/60 mt-0.5 shrink-0">•</span>
                                <span>{ind}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500">No specific patterns detected</p>
                          )}
                        </div>
                      </div>

                      <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">How to Improve</div>
                        <div className="space-y-2 text-xs text-slate-400">
                          {(dResult.feedback && dResult.feedback.length > 0) ? (
                            dResult.feedback.map((fb, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-0.5 shrink-0">→</span>
                                <span>{fb}</span>
                              </div>
                            ))
                          ) : dResult.overall_score >= 70 ? (
                            <>
                              <div className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">→</span><span>Vary sentence length — mix short punchy sentences with longer ones</span></div>
                              <div className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">→</span><span>Add specific examples, numbers, or personal anecdotes</span></div>
                              <div className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">→</span><span>Remove formulaic transitions like "Furthermore" or "In conclusion"</span></div>
                            </>
                          ) : dResult.overall_score >= 30 ? (
                            <>
                              <div className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">→</span><span>Check yellow-highlighted areas for AI patterns</span></div>
                              <div className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">→</span><span>Add more specific details or unique phrasing</span></div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span><span>Text appears naturally written</span></div>
                              <div className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span><span>No significant AI patterns detected</span></div>
                            </>
                          )}
                        </div>
                        {dResult.overall_score >= 30 && (
                          <p className="text-slate-500 text-[10px] mt-3 pt-2 border-t border-white/5">
                            Try <span className="text-emerald-400">Humanizer</span> or <span className="text-violet-400">Rewrite</span> to fix flagged text.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" /> Likely AI (70%+)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500/50" /> Suspicious (30-69%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-700" /> Clean (&lt;30%)</span>
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
                  <WordLimit current={hInput.length} max={limits.words} tier={tier} />
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
        {/* REWRITE TAB                                     */}
        {/* ═══════════════════════════════════════════════ */}
        {tab === "rewrite" && (
          <div className="animate-fade-up">
            {/* Mode selector */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-lg bg-white/5 p-0.5 border border-white/10">
                {(["tone", "perspective", "rephrase"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setRewriteMode(m)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      rewriteMode === m ? "bg-violet-500/20 text-violet-300" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m === "tone" ? "🎭 Tone" : m === "perspective" ? "👁 Perspective" : "🔄 Rephrase"}
                  </button>
                ))}
              </div>
            </div>

            {/* Option chips */}
            {rewriteMode === "tone" && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {[
                  { v: "formal", l: "Formal", ic: "🎓" },
                  { v: "informal", l: "Informal", ic: "💬" },
                  { v: "persuasive", l: "Persuasive", ic: "🔥" },
                  { v: "analytical", l: "Analytical", ic: "📊" },
                  { v: "descriptive", l: "Descriptive", ic: "🎨" },
                ].map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setRewriteOption(o.v)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      rewriteOption === o.v
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                        : "bg-white/[0.02] text-slate-400 border border-white/5 hover:text-white hover:border-white/10"
                    }`}
                  >
                    {o.ic} {o.l}
                  </button>
                ))}
              </div>
            )}
            {rewriteMode === "perspective" && (
              <div className="flex justify-center gap-2 mb-4">
                {[
                  { v: "first_person", l: "First Person", ic: "👤", desc: "I, we, my" },
                  { v: "third_person", l: "Third Person", ic: "👥", desc: "he, she, they" },
                ].map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setRewriteOption(o.v)}
                    className={`px-4 py-2 rounded-lg text-xs transition-all ${
                      rewriteOption === o.v
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                        : "bg-white/[0.02] text-slate-400 border border-white/5 hover:text-white hover:border-white/10"
                    }`}
                  >
                    {o.ic} {o.l} <span className="text-slate-600 ml-1">{o.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Editor */}
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-violet-500/30">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Original Text</span>
                </div>
                <textarea
                  value={rwInput}
                  onChange={(e) => setRwInput(e.target.value)}
                  placeholder="Paste text to rewrite..."
                  className="w-full h-64 sm:h-80 bg-transparent p-5 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none"
                />
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
                  <WordLimit current={rwInput.length} max={limits.words} tier={tier} />
                  <button
                    onClick={handleRewrite}
                    disabled={!rwInput.trim() || rwLoading || !canRw}
                    className="px-5 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                  >
                    {rwLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Rewriting...
                      </span>
                    ) : "📝 Rewrite"}
                  </button>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rewritten</span>
                  {rwOutput && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(rwOutput); setRwCopied(true); setTimeout(() => setRwCopied(false), 2000); }}
                      className="text-xs text-slate-500 hover:text-white transition-colors"
                    >
                      {rwCopied ? "✓ Copied" : "📋 Copy"}
                    </button>
                  )}
                </div>
                <div className="h-64 sm:h-80 p-5 overflow-y-auto">
                  {rwOutput ? (
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{rwOutput}</p>
                  ) : (
                    <p className="text-sm text-slate-600 italic">Rewritten result will appear here...</p>
                  )}
                </div>
                {rwOutput && (
                  <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-slate-600">{rwOutput.length.toLocaleString()} chars</span>
                    <button
                      onClick={() => { setDInput(rwOutput); setTab("detector"); setDResult(null); }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                    >
                      🔍 Verify AI score
                    </button>
                  </div>
                )}
              </div>
            </div>
            {!isPro && <p className="text-center text-xs text-slate-600 mt-3">{rwLeft} free rewrites remaining today</p>}
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* FEATURES                                        */}
        {/* ═══════════════════════════════════════════════ */}
        {!dResult && !hOutput && !rwOutput && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-3xl mx-auto">
            {[
              { icon: "🎯", title: "AI Detection", desc: "Sentence-level scoring" },
              { icon: "✨", title: "One-Click Fix", desc: "Rewrite flagged text" },
              { icon: "📝", title: "Rewrite", desc: "Tone, perspective & more" },
              { icon: "📎", title: "File Upload", desc: "PDF, Word, TXT" },
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
        {/* MARKETING (below tools, above pricing)         */}
        {/* ═══════════════════════════════════════════════ */}
        {!dResult && !hOutput && !rwOutput && <Marketing />}

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
                <Link href="/pricing" className="text-amber-400 hover:underline">
                  Upgrade now
                </Link>
              </span>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 mt-12 py-6 text-center text-[10px] text-slate-600">
        © 2026 EIGEN AI — Write with AI. Submit with confidence.
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
