import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HumanizeAI — Free AI Detector & University-Grade Bypass Tool",
  description:
    "Trusted by 10,000+ students. Detect AI content with sentence-level scoring, humanize AI text, and rewrite with tone/perspective controls. Bypass Turnitin AI detection. Free to try.",
  keywords: [
    // 核心
    "AI text humanizer",
    "AI detector",
    "bypass AI detection",
    "humanize AI text free",
    "AI content detector",
    // 学生高搜索量
    "bypass Turnitin AI detection",
    "Turnitin AI checker",
    "GPTZero alternative",
    "student essay tool",
    "university AI detection",
    "academic writing tool",
    // 功能
    "AI detection score",
    "sentence-level AI analysis",
    "remove AI detection",
    "AI to human text",
    "paraphrasing tool",
    "AI text rewriter",
    "change tone of text",
    "rewrite in formal tone",
    // 长尾
    "free AI humanizer no signup",
    "how to make ChatGPT undetectable",
    "AI detection remover online",
    "essay checker before submit",
  ],
  authors: [{ name: "HumanizeAI" }],
  creator: "HumanizeAI",
  publisher: "HumanizeAI",
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
    title: "HumanizeAI — Free AI Detector & University-Grade Bypass Tool",
    description:
      "Trusted by 10,000+ students. Detect AI, humanize text, rewrite with tone controls. Bypass Turnitin. Free to try.",
    url: "https://text-humanizer-theta.vercel.app",
    siteName: "HumanizeAI",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "HumanizeAI — Free AI Detector & Bypass Tool",
    description:
      "Trusted by 10,000+ students. Detect AI content, humanize text, and rewrite with tone controls. Free to try.",
  },
  alternates: {
    canonical: "https://text-humanizer-theta.vercel.app",
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
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "HumanizeAI",
              description:
                "AI text humanizer and detection tool. Transform AI-generated text into natural writing and check AI detection scores.",
              url: "https://text-humanizer-theta.vercel.app",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Web",
              offers: [
                {
                  "@type": "Offer",
                  name: "Free",
                  price: "0",
                  priceCurrency: "AUD",
                },
                {
                  "@type": "Offer",
                  name: "Basic",
                  price: "9.99",
                  priceCurrency: "AUD",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    billingDuration: "P1M",
                  },
                },
                {
                  "@type": "Offer",
                  name: "Pro",
                  price: "19.99",
                  priceCurrency: "AUD",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    billingDuration: "P1M",
                  },
                },
                {
                  "@type": "Offer",
                  name: "Max",
                  price: "39.99",
                  priceCurrency: "AUD",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    billingDuration: "P1M",
                  },
                },
              ],
              author: {
                "@type": "Organization",
                name: "HumanizeAI",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
              },
            }),
          }}
        />
        {/* FAQ Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is HumanizeAI?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "HumanizeAI is a tool that transforms AI-generated text into natural, human-sounding writing. It also includes an AI detection feature that analyzes text sentence-by-sentence and shows you exactly how likely each part is to be flagged as AI.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can HumanizeAI bypass Turnitin and GPTZero?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "HumanizeAI rewrites AI text to sound naturally human by varying sentence structure, adding natural language patterns, and removing robotic markers. You can verify results using the built-in AI detector before submitting.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is there a free version?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! The free plan includes 3 humanizations and 3 AI scans per day, with up to 5,000 characters per input. No credit card required.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does it support file uploads?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! You can upload Word documents (.docx), PDF files, and plain text files (.txt) for both humanization and AI detection analysis.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-[#0a0a0f] text-white antialiased">{children}</body>
    </html>
  );
}
