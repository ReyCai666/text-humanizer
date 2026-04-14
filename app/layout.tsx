import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HumanizeAI — AI Text Humanizer & AI Detection Tool for Students",
  description:
    "Transform AI-generated text into natural, human-sounding writing. Check AI detection scores with sentence-level analysis. Free tool for students, content creators, and professionals.",
  keywords: [
    "AI text humanizer",
    "AI detector",
    "bypass AI detection",
    "humanize AI text",
    "AI content detector",
    "student essay tool",
    "academic writing",
    "AI detection score",
    "remove AI detection",
    "AI to human text",
    "GPTZero alternative",
    "Turnitin bypass",
    "paraphrasing tool",
    "AI writing checker",
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
    title: "HumanizeAI — AI Text Humanizer & AI Detection Tool",
    description:
      "Transform AI text into natural writing and check AI detection scores. Free tool for students.",
    url: "https://text-humanizer-theta.vercel.app",
    siteName: "HumanizeAI",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "HumanizeAI — AI Text Humanizer & Detector",
    description:
      "Transform AI text into natural writing. Check AI detection scores with color-coded analysis.",
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
