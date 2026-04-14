import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bypass AI Detection — Make AI Text Undetectable | Free Tool",
  description:
    "Bypass AI detection tools like Turnitin, GPTZero, and Originality.ai. Rewrite AI-generated text to sound naturally human. Free tool with verification scanning.",
  keywords: ["bypass ai detection", "ai detection bypass", "turnitin bypass", "gptzero bypass", "undetectable ai", "avoid ai detection", "ai detection remover", "make ai text undetectable"],
  openGraph: { title: "Bypass AI Detection — Make AI Text Undetectable", description: "Rewrite AI text to pass Turnitin, GPTZero, and Originality.ai checks.", url: "https://text-humanizer-theta.vercel.app/bypass-ai-detection", type: "article" },
  alternates: { canonical: "https://text-humanizer-theta.vercel.app/bypass-ai-detection" },
};

export default function BypassPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <nav className="text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">Bypass AI Detection</span>
        </nav>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Bypass <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AI Detection</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mb-8">
          Make AI-generated text undetectable. Our tool rewrites ChatGPT, Claude, and Gemini output to pass Turnitin, GPTZero, Originality.ai, and other AI detectors. Free to try.
        </p>
        <Link href="/" className="inline-flex px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-sm font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all">
          Bypass AI Detection →
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">How to Bypass AI Detection</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Paste AI Text", desc: "Copy text from any AI writing tool" },
            { step: "2", title: "Humanize", desc: "Our AI rewrites it with human patterns" },
            { step: "3", title: "Verify", desc: "Check the AI score with our detector" },
            { step: "4", title: "Submit", desc: "Download or copy your undetectable text" },
          ].map((s) => (
            <div key={s.step} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold mb-2 mx-auto">{s.step}</div>
              <h3 className="text-xs font-semibold mb-1">{s.title}</h3>
              <p className="text-[11px] text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">Bypass These AI Detectors</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Turnitin", desc: "University plagiarism and AI detection. Our humanizer restructures writing patterns to pass Turnitin's AI detection algorithm." },
            { name: "GPTZero", desc: "Popular AI detector used by educators. We rewrite text with burstiness and perplexity patterns that match human writing." },
            { name: "Originality.ai", desc: "Advanced AI content scanner. Our tool removes detectable AI markers while keeping your original meaning." },
            { name: "Copyleaks", desc: "AI and plagiarism detection platform. Humanized text passes Copyleaks' analysis with natural language patterns." },
          ].map((d) => (
            <div key={d.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-emerald-400 mb-1">{d.name}</h3>
              <p className="text-xs text-slate-400">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">FAQ</h2>
        <div className="space-y-4">
          {[
            { q: "Can AI detection really be bypassed?", a: "Yes. AI detectors look for patterns like uniform sentence length, lack of contractions, and formulaic transitions. By restructuring text with human writing patterns — varied sentence lengths, natural connectors, and conversational tone — we significantly reduce detectability." },
            { q: "Is bypassing AI detection ethical?", a: "AI humanization is a legitimate editing tool. Many professionals use it to improve AI-assisted drafts, just like using Grammarly or a thesaurus. The key is using it responsibly to enhance your work, not to deceive." },
            { q: "Does it work with Turnitin 2025?", a: "Our tool is regularly updated to handle the latest detection algorithms. We recommend always using our built-in verifier to check the AI score before submitting to Turnitin." },
          ].map((faq) => (
            <details key={faq.q} className="group bg-white/[0.02] border border-white/5 rounded-xl">
              <summary className="px-5 py-4 cursor-pointer text-sm font-medium hover:text-emerald-400 transition-colors list-none flex justify-between items-center">
                {faq.q} <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-5 pb-4 text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center border-t border-white/5">
        <h2 className="text-2xl font-bold mb-3">Bypass AI Detection Now</h2>
        <p className="text-sm text-slate-400 mb-6">Free to try. Verify results instantly.</p>
        <Link href="/" className="inline-flex px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-sm font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all">
          Try Free →
        </Link>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "HowTo", name: "How to Bypass AI Detection",
        step: [
          { "@type": "HowToStep", name: "Paste AI Text", text: "Copy text from ChatGPT, Claude, or any AI writing tool." },
          { "@type": "HowToStep", name: "Humanize", text: "Click Humanize to rewrite the text with natural human patterns." },
          { "@type": "HowToStep", name: "Verify", text: "Use the built-in AI detector to confirm the text passes." },
          { "@type": "HowToStep", name: "Submit", text: "Copy or download your undetectable text." },
        ],
      }) }} />

      <footer className="border-t border-white/5 py-6 text-center text-[10px] text-slate-600">© 2026 HumanizeAI</footer>
    </main>
  );
}
