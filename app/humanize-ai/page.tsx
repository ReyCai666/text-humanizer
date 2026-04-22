import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EIGEN AI — Free AI Text Humanizer | Make AI Sound Human",
  description:
    "Humanize AI text instantly. Turn ChatGPT, Claude & Gemini output into natural, undetectable human writing. Free, sentence-level scoring.",
  keywords: [
    "humanize ai",
    "ai humanizer",
    "humanize ai text",
    "ai text humanizer",
    "make ai sound human",
    "ai to human text converter",
    "undetectable ai",
    "ai writing humanizer",
    "chatgpt humanizer",
    "free ai humanizer",
  ],
  openGraph: {
    title: "EIGEN AI — Free AI Text Humanizer",
    description:
      "Transform AI-generated text into natural, human-sounding writing. Free tool with detection scoring.",
    url: "https://eigentexthumanizer.com/humanize-ai",
    type: "article",
  },
  alternates: {
    canonical: "https://eigentexthumanizer.com/humanize-ai",
  },
};

export default function HumanizeAiPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <nav className="text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">Humanize AI</span>
        </nav>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Humanize <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AI</span> Text
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mb-8">
          Transform AI-generated content into natural, human-sounding writing.
          Works with ChatGPT, Claude, Gemini, and any AI writing tool.
          Free, instant, and undetectable.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-sm font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          Try Free →
        </Link>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-8">How to Humanize AI Text</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Paste Your AI Text", desc: "Copy text from ChatGPT, Claude, Gemini, or any AI tool and paste it into our editor." },
            { step: "2", title: "Click Humanize", desc: "Our AI rewrites your text with natural language patterns, varied sentence structures, and human touches." },
            { step: "3", title: "Verify & Submit", desc: "Use our built-in AI detector to confirm your text passes as human-written before submitting." },
          ].map((s) => (
            <div key={s.step} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold mb-3">{s.step}</div>
              <h3 className="text-sm font-semibold mb-2">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Humanize AI */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">Why Humanize AI Content?</h2>
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Bypass AI Detection", desc: "Universities and employers use tools like Turnitin, GPTZero, and Originality.ai to detect AI-written content. Humanizing your text helps it pass these checks naturally." },
              { title: "Improve Readability", desc: "AI text often sounds robotic with repetitive patterns. Humanizing adds natural flow, varied sentence lengths, and conversational tone." },
              { title: "Maintain Your Voice", desc: "Keep your ideas and meaning intact while making the writing sound authentically yours — not like a machine wrote it." },
              { title: "Save Time", desc: "Instead of manually rewriting AI drafts, let our tool transform them in seconds while preserving all key information." },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Tools */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">Works With All AI Writers</h2>
        <div className="flex flex-wrap gap-3">
          {["ChatGPT", "Claude", "Gemini", "GPT-4", "Llama", "Mistral", "Copilot", "Jasper", "Copy.ai", "Writesonic", "Quillbot", "Grammarly AI"].map((tool) => (
            <span key={tool} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">{tool}</span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "What does it mean to humanize AI text?", a: "Humanizing AI text means rewriting machine-generated content so it reads like a real person wrote it. This involves varying sentence structure, adding natural language patterns, removing robotic markers, and creating a conversational flow." },
            { q: "Is humanizing AI text free?", a: "Yes! EIGEN offers 3 free humanizations per day. For unlimited access, upgrade to our Basic ($9.99/mo), Pro ($19.99/mo), or Max ($39.99/mo) plan." },
            { q: "Can humanized text bypass Turnitin?", a: "Our tool restructures AI text to sound naturally human by varying patterns and removing detectable markers. We recommend using our built-in AI detector to verify results before submitting." },
            { q: "What AI tools does this work with?", a: "EIGEN AI works with text from any AI writing tool — ChatGPT, Claude, Gemini, GPT-4, Llama, Mistral, and more. Simply paste the AI-generated text and click Humanize." },
            { q: "Does it preserve the original meaning?", a: "Yes. Our humanization process keeps all key information, facts, and arguments intact while only changing the writing style to sound more natural and human." },
          ].map((faq) => (
            <details key={faq.q} className="group bg-white/[0.02] border border-white/5 rounded-xl">
              <summary className="px-5 py-4 cursor-pointer text-sm font-medium hover:text-emerald-400 transition-colors list-none flex justify-between items-center">
                {faq.q}
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-5 pb-4 text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center border-t border-white/5">
        <h2 className="text-2xl font-bold mb-3">Ready to Humanize Your AI Text?</h2>
        <p className="text-sm text-slate-400 mb-6">Free to try. No credit card required.</p>
        <Link
          href="/"
          className="inline-flex px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-sm font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          Start Humanizing — Free
        </Link>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Humanize AI Text",
            step: [
              { "@type": "HowToStep", name: "Paste AI Text", text: "Copy text from ChatGPT, Claude, or any AI tool and paste it into EIGEN AI AI." },
              { "@type": "HowToStep", name: "Click Humanize", text: "Our AI rewrites the text with natural language patterns." },
              { "@type": "HowToStep", name: "Verify & Submit", text: "Use the built-in AI detector to confirm the text passes as human-written." },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "What does it mean to humanize AI text?", acceptedAnswer: { "@type": "Answer", text: "Humanizing AI text means rewriting machine-generated content so it reads like a real person wrote it." } },
              { "@type": "Question", name: "Is humanizing AI text free?", acceptedAnswer: { "@type": "Answer", text: "Yes! EIGEN offers 3 free humanizations per day with no credit card required." } },
              { "@type": "Question", name: "Can humanized text bypass Turnitin?", acceptedAnswer: { "@type": "Answer", text: "Our tool restructures AI text to sound naturally human. Use the built-in detector to verify results." } },
            ],
          }),
        }}
      />

      <footer className="border-t border-white/5 py-6 text-center text-[10px] text-slate-600">
        © 2026 EIGEN AI — Making AI text sound human.
      </footer>
    </main>
  );
}
