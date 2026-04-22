import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ChatGPT Humanizer — Make ChatGPT Text Sound Human | EIGEN AI",
  description:
    "Humanize ChatGPT text instantly. Transform ChatGPT output into natural, undetectable human writing. Free tool — bypass AI detectors with one click.",
  keywords: [
    "chatgpt humanizer",
    "humanize chatgpt text",
    "chatgpt to human text",
    "make chatgpt undetectable",
    "chatgpt ai bypass",
    "chatgpt text converter",
    "chatgpt paraphraser",
    "chatgpt rewriter",
    "humanize gpt output",
    "gpt humanizer free",
  ],
  openGraph: {
    title: "ChatGPT Humanizer — Make ChatGPT Text Sound Human",
    description:
      "Humanize ChatGPT text instantly. Free tool — bypass AI detectors with one click.",
    url: "https://eigentexthumanizer.com/chatgpt-humanizer",
    type: "article",
  },
  alternates: {
    canonical: "https://eigentexthumanizer.com/chatgpt-humanizer",
  },
};

export default function ChatGPTHumanizerPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <nav className="text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">ChatGPT Humanizer</span>
        </nav>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">ChatGPT Humanizer</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mb-8">
          ChatGPT writes great content — but AI detectors can spot it instantly. EIGEN AI rewrites your ChatGPT text to sound 100% human. Free, instant, and undetectable.
        </p>
        <Link href="/" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all">
          Humanize ChatGPT Text →
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="text-2xl font-bold mb-6">Why Humanize ChatGPT Text?</h2>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-6">
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Schools, universities, and employers now use AI detectors like Turnitin, GPTZero, and Originality.ai to check if text was written by ChatGPT. Getting flagged can mean a failed assignment, academic probation, or worse.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            EIGEN AI solves this by rewriting ChatGPT text to match natural human writing patterns. The meaning stays the same — but the AI fingerprints are gone.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="text-2xl font-bold mb-6">How to Humanize ChatGPT Text</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Copy from ChatGPT", desc: "Copy the text you want to humanize from ChatGPT (GPT-3.5, GPT-4, GPT-4o — all supported)." },
            { step: "2", title: "Paste into EIGEN AI", desc: "Our AI detector instantly shows you which sentences look AI-written, with a percentage score." },
            { step: "3", title: "Click Humanize", desc: "One click rewrites all flagged sentences. The text now sounds like a real person wrote it." },
            { step: "4", title: "Verify & Submit", desc: "Re-scan to confirm 0% AI detection. Copy and use anywhere — essays, emails, articles, reports." },
          ].map((s, i) => (
            <div key={i} className="flex gap-4 items-start bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">{s.step}</div>
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
            { q: "Can I use EIGEN AI to humanize GPT-4 text?", a: "Yes. EIGEN AI works with text from any version of ChatGPT — GPT-3.5, GPT-4, GPT-4o, and future versions." },
            { q: "Will the humanized text still make sense?", a: "Absolutely. EIGEN AI preserves your original meaning and intent. Only the writing style changes to sound naturally human." },
            { q: "Is it free to humanize ChatGPT text?", a: "Yes — you get 3 free humanizations per day with no sign-up. For unlimited access, plans start at $9.99/month." },
            { q: "Does it work with Claude and Gemini too?", a: "Yes. EIGEN AI works with text from any AI tool — ChatGPT, Claude, Gemini, Bard, Jasper, Copy.ai, and more." },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="text-sm font-medium mb-1">{item.q}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Start Humanizing ChatGPT Text Now</h2>
        <p className="text-sm text-slate-400 mb-6">Free, instant, and undetectable. No sign-up required.</p>
        <Link href="/" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all">
          Humanize My ChatGPT Text →
        </Link>
      </section>

      <footer className="border-t border-white/5 py-6 text-center text-[10px] text-slate-600">
        © 2026 EIGEN AI — Making AI text sound human.
      </footer>
    </main>
  );
}
