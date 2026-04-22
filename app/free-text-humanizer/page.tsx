import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Text Humanizer Online — Make AI Text Sound 100% Human | EIGEN AI",
  description:
    "Free online text humanizer. Turn AI text into natural, human-sounding writing instantly. Bypass Turnitin, GPTZero & Copyleaks. No sign-up.",
  keywords: [
    "free text humanizer",
    "text humanizer online",
    "free AI humanizer",
    "humanize text free",
    "AI text to human text free",
    "free humanizer no sign up",
    "online text humanizer tool",
    "free AI to human converter",
    "make AI text human free",
    "free paraphrasing tool",
  ],
  openGraph: {
    title: "Free Text Humanizer Online — Make AI Text Sound 100% Human",
    description:
      "Free online text humanizer. Transform AI text into natural writing instantly. No sign-up required.",
    url: "https://eigentexthumanizer.com/free-text-humanizer",
    type: "article",
  },
  alternates: {
    canonical: "https://eigentexthumanizer.com/free-text-humanizer",
  },
};

export default function FreeTextHumanizerPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <nav className="text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">Free Text Humanizer</span>
        </nav>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Text Humanizer</span> Online
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mb-8">
          Paste your AI-generated text and get instant, human-sounding results. 100% free, no sign-up, no credit card. Works with ChatGPT, Claude, Gemini, and any AI writing tool.
        </p>
        <Link href="/" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all">
          Try Free Now →
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="text-2xl font-bold mb-6">Why Use a Free Text Humanizer?</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: "🎯", title: "Bypass AI Detectors", desc: "Turnitin, GPTZero, Originality.ai, Copyleaks — pass them all with human-sounding text." },
            { icon: "⚡", title: "Instant Results", desc: "Get your humanized text in seconds. No waiting, no queues." },
            { icon: "🔒", title: "No Sign-Up Required", desc: "Start using immediately. No email, no account, no credit card." },
            { icon: "📝", title: "Preserves Meaning", desc: "The humanizer keeps your original meaning while changing the writing style to sound natural." },
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
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Paste Your Text", desc: "Copy your AI-generated text from ChatGPT, Claude, or any AI tool and paste it into EIGEN AI." },
            { step: "2", title: "Click Humanize", desc: "Our AI rewrites your text to sound naturally human while preserving your original meaning." },
            { step: "3", title: "Copy & Use", desc: "Copy the humanized text and submit it with confidence. It will pass any AI detector." },
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
            { q: "Is this text humanizer really free?", a: "Yes! EIGEN AI offers 3 free humanizations per day. No credit card needed. For unlimited access, check our affordable paid plans." },
            { q: "Can this bypass Turnitin AI detection?", a: "Yes. Our text humanizer rewrites AI text to match natural human writing patterns, making it undetectable by Turnitin, GPTZero, and other AI detectors." },
            { q: "What AI tools does this work with?", a: "EIGEN AI works with text from any AI writing tool — ChatGPT, Claude, Gemini, Bard, Jasper, Copy.ai, and more." },
            { q: "Does the humanizer change the meaning?", a: "No. The humanizer preserves your original meaning and intent while changing the writing style to sound naturally human." },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="text-sm font-medium mb-1">{item.q}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Humanize Your Text?</h2>
        <p className="text-sm text-slate-400 mb-6">Free, instant, and undetectable. Start now.</p>
        <Link href="/" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all">
          Humanize My Text Free →
        </Link>
      </section>

      <footer className="border-t border-white/5 py-6 text-center text-[10px] text-slate-600">
        © 2026 EIGEN AI — Making AI text sound human.
      </footer>
    </main>
  );
}
