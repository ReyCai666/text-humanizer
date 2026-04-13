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
  title: "HumanizeAI — Make AI Text Sound Human",
  description:
    "Transform AI-generated text into natural, human-sounding writing. Perfect for students, content creators, and professionals who want authentic-sounding text.",
  keywords: [
    "AI humanizer",
    "text humanizer",
    "AI to human text",
    "humanize AI text",
    "bypass AI detection",
    "rewrite AI text",
  ],
  openGraph: {
    title: "HumanizeAI — Make AI Text Sound Human",
    description: "Transform AI-generated text into natural, human-sounding writing.",
    type: "website",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
