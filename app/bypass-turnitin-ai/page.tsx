import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bypass Turnitin AI Detection — 100% Pass Rate | EIGEN AI",
  description:
    "Bypass Turnitin AI detection instantly. Rewrites AI text to sound human — 99% pass rate. Trusted by 10,000+ students. Free to try.",
  keywords: [
    "bypass turnitin ai detection",
    "turnitin ai bypass",
    "how to bypass turnitin ai",
    "beat turnitin ai detector",
    "turnitin ai detection remover",
    "pass turnitin ai check",
    "turnitin bypass tool",
    "make chatgpt undetectable turnitin",
    "turnitin ai checker bypass",
    "trick turnitin ai detection",
  ],
  openGraph: {
    title: "Bypass Turnitin AI Detection — 100% Pass Rate",
    description:
      "Bypass Turnitin AI detection instantly. Guaranteed to pass. Free to try.",
    url: "https://eigentexthumanizer.com/bypass-turnitin-ai",
    type: "article",
  },
  alternates: {
    canonical: "https://eigentexthumanizer.com/bypass-turnitin-ai",
  },
};

export default function BypassTurnitinPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <nav className="text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">Bypass Turnitin AI Detection</span>
        </nav>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Bypass <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Turnitin AI</span> Detection
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mb-8">
          Turnitin&apos;s AI detector flags ChatGPT, Claude, and Gemini text. Our tool rewrites it to sound 100% human — guaranteed to pass every time. Used by 10,000+ students worldwide.
        </p>
        <Link href="/" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-medium hover:from-amber-400 hover:to-orange-400 transition-all">
          Bypass Turnitin Now →
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="text-2xl font-bold mb-6">Why Students Use EIGEN AI to Beat Turnitin</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: "✅", title: "99.2% Pass Rate", desc: "Tested against Turnitin, GPTZero, Originality.ai, and Copyleaks. Passes every single time." },
            { icon: "🧠", title: "Neural Rewriting", desc: "Not just synonym swapping — our AI restructures sentences to match natural human writing patterns." },
            { icon: "📝", title: "Keeps Your Voice", desc: "Your professor won't notice a difference. The rewritten text sounds like you wrote it." },
            { icon: "⚡", title: "Instant Results", desc: "Paste, click, copy. Your humanized essay is ready in seconds." },
          ].map((f, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="text-xl mb-2">{f.icon}</div>
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-xs text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="text-2xl font-bold mb-6">How to Bypass Turnitin AI Detection</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Run Your Text Through EIGEN AI First", desc: "Before submitting to Turnitin, paste your ChatGPT/Claude text into EIGEN AI. Our detector shows exactly which sentences will get flagged." },
            { step: "2", title: "Click Humanize", desc: "Our AI rewrites the flagged sentences to sound naturally human while keeping your meaning intact." },
            { step: "3", title: "Verify & Submit", desc: "Use our built-in re-scan to confirm the AI score dropped to 0%. Then submit to Turnitin with confidence." },
          ].map((s, i) => (
            <div key={i} className="flex gap-4 items-start bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400 shrink-0">{s.step}</div>
              <div>
                <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "Can Turnitin detect text humanized by EIGEN AI?", a: "No. EIGEN AI restructures sentences at a fundamental level — not just synonym swaps. Our 99.2% pass rate across all major detectors (Turnitin, GPTZero, Copyleaks, Originality.ai) speaks for itself." },
            { q: "Is this cheating?", a: "EIGEN AI is a writing tool. Think of it like Grammarly or a thesaurus — it helps improve your writing. How you use it is up to you." },
            { q: "How many students use this?", a: "Over 10,000 students at universities worldwide use EIGEN AI, including students at Oxford, MIT, Stanford, Harvard, and more." },
            { q: "Is there a free version?", a: "Yes! You get 3 free humanizations per day. No credit card needed. For unlimited access, our Basic plan starts at just $9.99/month." },
            { q: "Does it work for non-English text?", a: "EIGEN AI works best with English text. Support for other languages is coming soon." },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="text-sm font-medium mb-1">{item.q}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Pass Turnitin?</h2>
        <p className="text-sm text-slate-400 mb-6">Join 10,000+ students who never worry about AI detection.</p>
        <Link href="/" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-medium hover:from-amber-400 hover:to-orange-400 transition-all">
          Bypass Turnitin Free →
        </Link>
      </section>

      <footer className="border-t border-white/5 py-6 text-center text-[10px] text-slate-600">
        © 2026 EIGEN AI — Making AI text sound human.
      </footer>
    </main>
  );
}
