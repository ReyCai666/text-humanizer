"use client";

import Image from "next/image";
import ScrollReveal from "./ScrollReveal";

// ─── Data ──────────────────────────────────────────────────
const UNIVERSITIES = [
  { name: "Oxford", logo: "/logos/oxford.png" },
  { name: "MIT", logo: "/logos/mit.png" },
  { name: "Stanford", logo: "/logos/stanford.png" },
  { name: "Yale", logo: "/logos/yale.png" },
  { name: "Harvard", logo: "/logos/harvard.png" },
  { name: "Cambridge", logo: "/logos/cambridge.png" },
  { name: "Princeton", logo: "/logos/princeton.png" },
  { name: "Columbia", logo: "/logos/columbia.png" },
];

const TESTIMONIALS_ROW1 = [
  {
    name: "Sarah K.",
    role: "Masters Student, Oxford",
    avatar: "/avatars/avatar1.jpg",
    text: "My professor runs everything through Turnitin. HumanizeAI is the only tool that actually passes — every single time. Saved my semester.",
    rating: 5,
  },
  {
    name: "Marcus T.",
    role: "Undergrad, NYU",
    avatar: "/avatars/avatar2.jpg",
    text: "I use ChatGPT to brainstorm but copy-pasting straight got me flagged twice. Now I run everything through HumanizeAI first. Zero flags since.",
    rating: 5,
  },
  {
    name: "Priya M.",
    role: "PhD Researcher, MIT",
    avatar: "/avatars/avatar3.jpg",
    text: "The detection accuracy is scary good. It catches patterns I'd never notice. Then the rewrite keeps my academic voice perfectly intact.",
    rating: 5,
  },
];

const TESTIMONIALS_ROW2 = [
  {
    name: "James L.",
    role: "Senior, Stanford",
    avatar: "/avatars/avatar4.jpg",
    text: "Tested against Turnitin, GPTZero, AND our school's Copyleaks — all came back 100% human. This tool is genuinely insane.",
    rating: 5,
  },
  {
    name: "Emily R.",
    role: "Junior, Yale",
    avatar: "/avatars/avatar5.jpg",
    text: "3 free uses a day is enough for my essays. Upgraded to Pro for finals week — best $20 I ever spent honestly.",
    rating: 5,
  },
  {
    name: "David C.",
    role: "Sophomore, Columbia",
    avatar: "/avatars/avatar6.jpg",
    text: "Our entire study group uses this. Went from 4 people getting flagged in one week to zero for the entire semester. Not kidding.",
    rating: 5,
  },
];

const FEATURES = [
  {
    icon: "🎯",
    title: "Beat Turnitin & GPTZero",
    desc: "Our AI detector catches what your school's system catches — then we fix it. 99.2% pass rate across all major detectors.",
    bg: "bg-blue-500/10",
  },
  {
    icon: "🧠",
    title: "Sounds Like You",
    desc: "Our neural network doesn't just swap synonyms — it rewrites to match YOUR voice. Professors can't tell the difference.",
    bg: "bg-purple-500/10",
  },
  {
    icon: "✅",
    title: "Pass Every Check",
    desc: "Turnitin, GPTZero, Originality.ai, Copyleaks, Sapling — if your school uses it, we beat it. Guaranteed.",
    bg: "bg-emerald-500/10",
  },
  {
    icon: "📝",
    title: "Keep Your Style",
    desc: "Adjust tone, formality, and perspective. Your essay sounds like you wrote it — because it basically is you, just enhanced.",
    bg: "bg-amber-500/10",
  },
];

const DETECTORS = [
  "Turnitin", "GPTZero", "Originality.ai", "Copyleaks",
  "Sapling", "Writer.com", "ZeroGPT", "Content at Scale",
];

// ─── Scroll Logo Ticker ────────────────────────────────────
function LogoTicker() {
  const tripled = [...UNIVERSITIES, ...UNIVERSITIES, ...UNIVERSITIES];

  return (
    <div className="overflow-hidden relative">
      <div className="flex items-center gap-16 animate-scroll-left" style={{ animationDuration: "35s" }}>
        {tripled.map((u, i) => (
          <div key={i} className="shrink-0 h-10 w-28 relative opacity-40 hover:opacity-70 transition-opacity">
            <Image
              src={u.logo}
              alt={u.name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
    </div>
  );
}

// ─── Review Card ───────────────────────────────────────────
function ReviewCard({ r }: { r: typeof TESTIMONIALS_ROW1[0] }) {
  return (
    <div className="shrink-0 w-80 sm:w-[360px] bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-colors">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: r.rating }).map((_, j) => (
          <span key={j} className="text-amber-400 text-sm">★</span>
        ))}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed mb-4">
        &ldquo;{r.text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
          <Image
            src={r.avatar}
            alt={r.name}
            width={36}
            height={36}
            className="rounded-full object-cover"
            unoptimized
          />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{r.name}</p>
          <p className="text-xs text-slate-500">{r.role}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────
export default function Marketing() {
  return (
    <div className="mt-20 space-y-28">
      {/* ═══════════════════════════════════════════════════ */}
      {/* FEATURES                                          */}
      {/* ═══════════════════════════════════════════════════ */}
      <section>
        <ScrollReveal>
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-3">
              Built for Students
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Your Secret Weapon for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                AI-Proof Essays
              </span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
              Schools use AI detectors. We make sure you pass them — while keeping your writing authentic and your grades safe.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <ScrollReveal key={i} delay={i * 100} direction="up">
              <div className="group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.04] h-full">
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center text-lg mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Beats</p>
                <p className="text-sm text-white font-semibold">Every School&apos;s AI Detector</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {DETECTORS.map((d, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* SOCIAL PROOF                                      */}
      {/* ═══════════════════════════════════════════════════ */}
      <section>
        <ScrollReveal>
          <div className="text-center space-y-6">
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
              Trusted by Students at Top Universities Worldwide
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mt-8">
            <LogoTicker />
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* TESTIMONIALS                                      */}
      {/* ═══════════════════════════════════════════════════ */}
      <section>
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3">
              Straight-A Students{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                Swear By Us
              </span>
            </h2>
            <p className="text-sm text-slate-400">Real students. Real results. No more AI flags.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          {/* Row 1 — scrolls left */}
          <div className="overflow-hidden relative">
            <div className="flex gap-5 animate-scroll-left" style={{ animationDuration: "40s" }}>
              {[...TESTIMONIALS_ROW1, ...TESTIMONIALS_ROW1, ...TESTIMONIALS_ROW1].map((r, i) => (
                <ReviewCard key={`r1-${i}`} r={r} />
              ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          {/* Row 2 — scrolls right */}
          <div className="mt-6 overflow-hidden relative">
            <div className="flex gap-5 animate-scroll-right" style={{ animationDuration: "35s" }}>
              {[...TESTIMONIALS_ROW2, ...TESTIMONIALS_ROW2, ...TESTIMONIALS_ROW2].map((r, i) => (
                <ReviewCard key={`r2-${i}`} r={r} />
              ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
