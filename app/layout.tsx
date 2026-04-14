import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HumanizeAI — Free AI Detector & Bypass Tool | University-Grade",
  description:
    "Free AI text humanizer trusted by 10,000+ students. Bypass Turnitin AI detection, GPTZero, and more. Self-check your essays before submission using the same detection engine used by top universities. Try free — no signup required.",
  keywords: [
    // 核心关键词
    "free AI humanizer",
    "bypass AI detection",
    "AI detector",
    "humanize AI text free",
    "AI to human text",
    "rewrite AI text",
    // 学生相关（高搜索量）
    "bypass Turnitin AI detection",
    "Turnitin AI checker",
    "GPTZero bypass",
    "AI essay humanizer",
    "university AI detection",
    "academic AI bypass",
    // 功能相关
    "AI text rewriter",
    "AI paraphraser",
    "change AI tone",
    "make AI sound human",
    "AI detection remover",
    // 长尾关键词
    "free AI humanizer no signup",
    "bypass AI detection free online",
    "how to make ChatGPT undetectable",
    "AI text humanizer for students",
  ],
  openGraph: {
    title: "HumanizeAI — University-Grade Bypass AI Detector",
    description: "Free AI text humanizer trusted by 10,000+ students. Bypass Turnitin, GPTZero and more. Try free.",
    type: "website",
    siteName: "HumanizeAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "HumanizeAI — Bypass AI Detection Free",
    description: "Trusted by 10,000+ students. Same detection engine used by top universities.",
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* FAQ Schema for SEO — 常见问题结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Can HumanizeAI bypass Turnitin AI detection?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. HumanizeAI uses the same detection engine trusted by top universities to help students self-check their work before submission. Our tool rewrites AI-generated text to sound naturally human.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is HumanizeAI free to use?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! You get 3 free uses per day with no signup required. Upgrade for unlimited access.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What AI detectors can HumanizeAI bypass?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "HumanizeAI is designed to bypass Turnitin AI detection, GPTZero, Originality.ai, and other major AI detection tools.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
