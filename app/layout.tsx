import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EIGEN AI — Free AI Detector & University-Grade Bypass Tool",
  description:
    "The #1 AI detector bypass tool. Trusted by 10,000+ students. Humanize AI text, beat Turnitin & GPTZero. Free to try.",
  keywords: [
    // Core
    "AI text humanizer",
    "AI detector",
    "bypass AI detection",
    "humanize AI text free",
    "AI content detector",
    "text humanizer",
    "free text humanizer",
    "online text humanizer",
    // Student high-volume
    "bypass Turnitin AI detection",
    "Turnitin AI checker",
    "Turnitin bypass tool",
    "bypass Turnitin AI",
    "GPTZero alternative",
    "student essay tool",
    "university AI detection",
    "academic writing tool",
    // ChatGPT specific
    "ChatGPT humanizer",
    "humanize ChatGPT text",
    "make ChatGPT undetectable",
    "ChatGPT detector",
    "ChatGPT to human text",
    "GPT humanizer",
    "GPT zero bypass",
    // Feature
    "AI detection score",
    "sentence-level AI analysis",
    "remove AI detection",
    "AI to human text",
    "paraphrasing tool",
    "AI text rewriter",
    "change tone of text",
    "rewrite in formal tone",
    "AI writing humanizer",
    // Long-tail
    "free AI humanizer no signup",
    "how to make ChatGPT undetectable",
    "AI detection remover online",
    "essay checker before submit",
    "free online humanizer",
    "turnitin ai detection bypass",
    "copyleaks bypass",
    "originality.ai bypass",
    "ai humanizer free online",
    "undetectable ai text",
  ],
  authors: [{ name: "EIGEN AI" }],
  creator: "EIGEN AI",
  publisher: "EIGEN AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "EIGEN AI — Free AI Detector & University-Grade Bypass Tool",
    description:
      "Trusted by 10,000+ students. Detect AI, humanize text, rewrite with tone controls. Bypass Turnitin. Free to try.",
    url: "https://eigentexthumanizer.com",
    siteName: "EIGEN AI",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "EIGEN AI — Free AI Detector & Bypass Tool",
    description:
      "Trusted by 10,000+ students. Detect AI content, humanize text, and rewrite with tone controls. Free to try.",
  },
  alternates: {
    canonical: "https://eigentexthumanizer.com",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Hints for AI crawlers — llms.txt (https://llmstxt.org/) */}
        <link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt" />
        <link rel="alternate" type="text/plain" title="llms-full.txt" href="/llms-full.txt" />
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "EIGEN AI",
              url: "https://eigentexthumanizer.com",
              logo: "https://eigentexthumanizer.com/logo.svg",
              email: "caiyingzhengrey@gmail.com",
              description:
                "EIGEN AI builds AI text humanization and detection tools for students, writers, and content creators.",
              sameAs: [
                "https://eigentexthumanizer.com",
              ],
            }),
          }}
        />
        {/* JSON-LD: WebSite (enables Sitelinks Search Box) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "EIGEN AI",
              url: "https://eigentexthumanizer.com",
              publisher: { "@type": "Organization", name: "EIGEN AI" },
            }),
          }}
        />
        {/* JSON-LD: SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "EIGEN AI Text Humanizer",
              applicationCategory: "UtilityApplication",
              applicationSubCategory: "WritingApplication",
              operatingSystem: "Web, iOS, Android",
              url: "https://eigentexthumanizer.com",
              description:
                "AI text humanizer and detector with sentence-level scoring. Rewrites AI-generated text to pass Turnitin, GPTZero, Copyleaks, and Originality.ai.",
              featureList: [
                "Sentence-level AI detection",
                "One-click humanization",
                "Tone and perspective controls",
                "File upload (PDF, DOCX, TXT)",
                "Verification re-scan",
              ],
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "AUD",
                availability: "https://schema.org/InStock",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
                bestRating: "5",
                worstRating: "1",
              },
            }),
          }}
        />
        {/* JSON-LD: WebApplication with offers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "EIGEN AI",
              description:
                "AI text humanizer and detection tool. Transform AI-generated text into natural writing and check AI detection scores.",
              url: "https://eigentexthumanizer.com",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Web",
              browserRequirements: "Requires JavaScript. Requires HTML5.",
              offers: [
                { "@type": "Offer", name: "Free", price: "0", priceCurrency: "AUD" },
                {
                  "@type": "Offer",
                  name: "Basic",
                  price: "9.99",
                  priceCurrency: "AUD",
                  priceSpecification: { "@type": "UnitPriceSpecification", billingDuration: "P1M" },
                },
                {
                  "@type": "Offer",
                  name: "Pro",
                  price: "19.99",
                  priceCurrency: "AUD",
                  priceSpecification: { "@type": "UnitPriceSpecification", billingDuration: "P1M" },
                },
                {
                  "@type": "Offer",
                  name: "Max",
                  price: "39.99",
                  priceCurrency: "AUD",
                  priceSpecification: { "@type": "UnitPriceSpecification", billingDuration: "P1M" },
                },
              ],
              author: { "@type": "Organization", name: "EIGEN AI" },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
              },
            }),
          }}
        />
        {/* JSON-LD: HowTo — how to humanize AI text (AI-answer friendly) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: "How to humanize AI-generated text with EIGEN AI",
              description:
                "Turn ChatGPT, Claude, or Gemini output into natural, undetectable human writing in four steps.",
              totalTime: "PT2M",
              supply: [
                { "@type": "HowToSupply", name: "AI-generated draft" },
              ],
              tool: [
                { "@type": "HowToTool", name: "EIGEN AI (https://eigentexthumanizer.com)" },
              ],
              step: [
                {
                  "@type": "HowToStep",
                  position: 1,
                  name: "Paste or upload your text",
                  text: "Paste your AI-generated draft, or upload a PDF, DOCX, or TXT file.",
                  url: "https://eigentexthumanizer.com/humanize-ai#step-1",
                },
                {
                  "@type": "HowToStep",
                  position: 2,
                  name: "Run the AI detector",
                  text: "The detector scores each sentence and color-codes the ones likely to be flagged.",
                  url: "https://eigentexthumanizer.com/ai-detector",
                },
                {
                  "@type": "HowToStep",
                  position: 3,
                  name: "One-click humanize",
                  text: "Humanize only the flagged sentences. Pick tone (academic, casual) and perspective.",
                  url: "https://eigentexthumanizer.com/humanize-ai",
                },
                {
                  "@type": "HowToStep",
                  position: 4,
                  name: "Verify with a re-scan",
                  text: "Re-run the detector on the humanized output to confirm it reads as human before submitting.",
                  url: "https://eigentexthumanizer.com/ai-detector",
                },
              ],
            }),
          }}
        />
        {/*
          Note: FAQPage JSON-LD must be defined per-page (Schema.org/Google
          require exactly one FAQPage entity per document). Subpages like
          /humanize-ai and /chatgpt-detector inject their own FAQPage in
          their own page.tsx. Do not re-introduce a site-wide FAQPage here
          or Search Console will report "Duplicate field 'FAQPage'".
        */}
      </head>
      <body className="bg-[#0a0a0f] text-white antialiased">{children}</body>
    </html>
  );
}
