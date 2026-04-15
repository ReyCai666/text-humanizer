"use client";

import { useEffect, useRef } from "react";

// ─── Data ──────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🎯",
    title: "Precision Detection",
    desc: "Advanced AI model detection with 99.2% accuracy across ChatGPT, Claude, Gemini, and 50+ AI models.",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-500/10",
  },
  {
    icon: "🧠",
    title: "Neural Humanization",
    desc: "Proprietary neural networks trained on 50M+ text samples transform AI content into authentic human prose.",
    gradient: "from-purple-500 to-pink-600",
    bg: "bg-purple-500/10",
  },
  {
    icon: "✅",
    title: "Bypass Detection",
    desc: "Content passes Turnitin, GPTZero, Originality.ai, and every major AI detection platform.",
    gradient: "from-emerald-500 to-cyan-600",
    bg: "bg-emerald-500/10",
  },
  {
    icon: "📝",
    title: "Tone & Style Control",
    desc: "Adjust perspective, formality, and rephrasing to match your authentic writing voice.",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
  },
];

const AI_MODELS = [
  "ChatGPT", "Claude", "Gemini", "Llama", "Mistral",
  "GPTZero", "Turnitin", "Originality.ai", "Copyleaks", "Sapling",
];

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Graduate Student, Oxford",
    text: "HumanizeAI saved my thesis. My advisor couldn't tell the difference between my original writing and the humanized AI drafts. Game changer for non-native speakers!",
    rating: 5,
  },
  {
    name: "Marcus T.",
    role: "Content Writer, NYC",
    text: "I use ChatGPT for first drafts but clients always flagged them as AI. Since switching to HumanizeAI, zero issues. My productivity doubled.",
    rating: 5,
  },
  {
    name: "Priya M.",
    role: "PhD Researcher, MIT",
    text: "The precision detection is unreal. It catches AI patterns I never noticed. The rewriting keeps my academic tone perfectly while making it sound natural.",
    rating: 5,
  },
  {
    name: "James L.",
    role: "Freelance Journalist",
    text: "Tested against Turnitin, GPTZero, and Originality.ai — all came back 100% human. This tool is the real deal. Worth every penny.",
    rating: 5,
  },
  {
    name: "Emily R.",
    role: "Undergrad, Stanford",
    text: "As a student on a budget, the free tier is incredibly generous. 3 humanizations a day is enough for my essays. Upgraded to Pro — no regrets.",
    rating: 5,
  },
  {
    name: "David C.",
    role: "Marketing Director",
    text: "Our entire content team uses HumanizeAI. We went from 3 flagged articles a week to zero. The tone control feature is chef's kiss.",
    rating: 5,
  },
];

const UNIVERSITIES = [
  "Oxford", "MIT", "Stanford", "Yale", "Harvard", "Cambridge", "Princeton", "Columbia",
];

// ─── Scroll Logo Ticker ────────────────────────────────────
function LogoTicker({ items, speed = 30, direction = "left" }: { items: string[]; speed?: number; direction?: "left" | "right" }) {
  const doubled = [...items, ...items, ...items];
  const anim = direction === "left" ? "animate-scroll-left" : "animate-scroll-right";

  return (
    <div className="overflow-hidden relative">
      <div className={`flex gap-12 ${anim}`} style={{ animationDuration: `${speed}s` }}>
        {doubled.map((item, i) => (
          <span key={i} className="shrink-0 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors tracking-wide uppercase whitespace-nowrap">
            {item}
          </span>
        ))}
      </div>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none" />
    </div>
  );
}

// ─── Review Ticker ─────────────────────────────────────────
function ReviewTicker({ reviews, speed = 60 }: { reviews: typeof TESTIMONIALS; speed?: number }) {
  const doubled = [...reviews, ...reviews];

  return (
    <div className="overflow-hidden relative">
      <div className="flex gap-5 animate-scroll-left" style={{ animationDuration: `${speed}s` }}>
        {doubled.map((r, i) => (
          <div
            key={i}
            className="shrink-0 w-80 sm:w-96 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-colors"
          >
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: r.rating }).map((_, j) => (
                <span key={j} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-4">
              &ldquo;{r.text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                {r.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{r.name}</p>
                <p className="text-xs text-slate-500">{r.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────
export default function Marketing() {
  return (
    <div className="space-y-20 pb-8">
      {/* ── Features Section ────────────────────────────── */}
      <section className="animate-fade-up">
        <div className="text-center mb-10">
          <p className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-2">
            Next Generation Technology
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Detection Meets{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Human Creativity
            </span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Proprietary neural networks trained on 50M+ text samples combine precision AI detection
            with the nuanced creativity of human expression.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.04]"
            >
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center text-lg mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* AI Models bar */}
        <div className="mt-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Detects & Bypasses</p>
              <p className="text-sm text-white font-semibold">Every Major AI Detector</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {AI_MODELS.map((m, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ───────────────────────────────── */}
      <section className="text-center space-y-6">
        {/* Trustpilot-style rating */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-lg font-bold text-white">Excellent</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="text-emerald-400 text-lg">★</span>
            ))}
          </div>
          <span className="text-sm text-slate-400">
            <span className="font-semibold text-white">2,412</span> reviews
          </span>
        </div>

        <p className="text-sm text-slate-300">
          <span className="text-emerald-400 mr-1">✓</span>
          Used by Students & Writers Around the World
        </p>

        {/* University logos ticker */}
        <LogoTicker items={UNIVERSITIES} speed={25} />
      </section>

      {/* ── Testimonials ───────────────────────────────── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            Loved by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              10,000+
            </span>{" "}
            Users
          </h2>
          <p className="text-sm text-slate-400">Real results from students, writers, and professionals.</p>
        </div>

        <ReviewTicker reviews={TESTIMONIALS} speed={50} />

        {/* Second row scrolling opposite direction */}
        <div className="mt-5">
          <ReviewTicker reviews={[...TESTIMONIALS].reverse()} speed={45} />
        </div>
      </section>
    </div>
  );
}
