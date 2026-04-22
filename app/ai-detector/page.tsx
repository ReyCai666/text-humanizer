import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Detector — Free AI Content Detection Tool | Check AI Writing",
  description:
    "Free AI detector with sentence-level scoring. Check if text is written by ChatGPT, Claude, or Gemini. Color-coded highlights. No sign-up.",
  keywords: [
    "ai detector",
    "ai content detector",
    "chatgpt detector",
    "ai writing detector",
    "detect ai text",
    "ai detection tool",
    "free ai checker",
    "ai plagiarism checker",
    "gpt detector",
    "claude detector",
  ],
  openGraph: {
    title: "AI Detector — Free AI Content Detection Tool",
    description: "Check if text was written by AI with sentence-level scoring and color-coded highlights.",
    url: "https://eigentexthumanizer.com/ai-detector",
    type: "article",
  },
  alternates: { canonical: "https://eigentexthumanizer.com/ai-detector" },
};

export default function AIDetectorPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <nav className="text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">AI Detector</span>
        </nav>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">AI Detector</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mb-8">
          Detect AI-generated text with precision. Get sentence-by-sentence analysis showing exactly which parts were written by ChatGPT, Claude, Gemini, or other AI tools. Free, instant, and accurate.
        </p>
        <Link href="/?tab=detector" className="inline-flex px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-sm font-medium hover:from-amber-400 hover:to-orange-400 transition-all">
          Scan Text for AI →
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-8">How Our AI Detector Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Paste Text", desc: "Copy any text and paste it into the detector. Upload PDF, Word, or TXT files." },
            { step: "2", title: "AI Analysis", desc: "Our advanced AI analyzes every sentence for patterns typical of machine-generated content." },
            { step: "3", title: "See Results", desc: "Get an overall AI score plus sentence-by-sentence highlights — red for likely AI, yellow for suspicious, green for human." },
          ].map((s) => (
            <div key={s.step} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold mb-3">{s.step}</div>
              <h3 className="text-sm font-semibold mb-2">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">What Can It Detect?</h2>
        <div className="flex flex-wrap gap-3">
          {["ChatGPT", "GPT-4", "GPT-4o", "Claude", "Gemini", "Llama", "Mistral", "Copilot", "Jasper", "Writesonic", "Quillbot AI", "Grammarly AI"].map((tool) => (
            <span key={tool} className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">{tool}</span>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">FAQ</h2>
        <div className="space-y-4">
          {[
            { q: "How accurate is the AI detector?", a: "Our detector uses advanced language models to analyze text patterns, sentence structures, and linguistic markers typical of AI writing. While no detector is 100% accurate, ours provides detailed sentence-level scoring to help you identify suspicious content." },
            { q: "Is the AI detector free?", a: "Yes! You get 3 free AI scans per day. Paid plans offer 10-300 scans daily depending on your tier." },
            { q: "Can it detect paraphrased AI text?", a: "Our detector looks at deep linguistic patterns, not just surface-level wording. Even paraphrased AI text often retains detectable structural patterns that our tool can identify." },
          ].map((faq) => (
            <details key={faq.q} className="group bg-white/[0.02] border border-white/5 rounded-xl">
              <summary className="px-5 py-4 cursor-pointer text-sm font-medium hover:text-amber-400 transition-colors list-none flex justify-between items-center">
                {faq.q} <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-5 pb-4 text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center border-t border-white/5">
        <h2 className="text-2xl font-bold mb-3">Check Your Text Now</h2>
        <p className="text-sm text-slate-400 mb-6">Free AI detection with sentence-level analysis.</p>
        <Link href="/?tab=detector" className="inline-flex px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-sm font-medium hover:from-amber-400 hover:to-orange-400 transition-all">
          Scan for AI — Free
        </Link>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "WebApplication", name: "EIGEN AI Detector",
        description: "Free AI content detector with sentence-level scoring and color-coded highlights.",
        url: "https://eigentexthumanizer.com/ai-detector",
        applicationCategory: "UtilityApplication", operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "AUD" },
      }) }} />

      <footer className="border-t border-white/5 py-6 text-center text-[10px] text-slate-600">© 2026 EIGEN</footer>
    </main>
  );
}
