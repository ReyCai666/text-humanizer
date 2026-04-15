"use client";

import { useState } from "react";
import Link from "next/link";
import PLANS from "./PLANS";

export default function PricingPage() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  async function handleCheckout(variantId: string) {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Failed to start checkout.");
    } catch {
      alert("Network error.");
    }
    setCheckoutLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="HumanizeAI" className="w-7 h-7" />
            <span className="font-semibold text-sm tracking-tight">HumanizeAI</span>
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Back to tool
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">pricing</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Start free. Upgrade when you need more. All daily limits reset every 24 hours. Cancel anytime.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-2xl border transition-all duration-300 hover:translate-y-[-2px] flex flex-col ${
                plan.popular
                  ? "bg-amber-500/5 border-amber-500/20"
                  : "bg-white/[0.02] border-white/5 hover:border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[10px] font-semibold">
                  Most Popular
                </div>
              )}
              <div className="text-sm font-semibold mb-1">{plan.name}</div>
              <div className="text-xs text-slate-500 mb-3">{plan.description}</div>
              <div className="text-3xl font-bold mb-1">
                {plan.price === "0" ? "Free" : `$${plan.price}`}
                {plan.period && <span className="text-xs font-normal text-slate-500"> AUD{plan.period}</span>}
              </div>
              {plan.price !== "0" && (
                <div className="text-[10px] text-slate-600 mb-4">Billed monthly · Cancel anytime</div>
              )}
              {plan.price === "0" && <div className="mb-4" />}

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.vid ? (
                <button
                  onClick={() => handleCheckout(plan.vid!)}
                  disabled={checkoutLoading}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white"
                      : "border border-white/10 hover:bg-white/5"
                  }`}
                >
                  Get {plan.name}
                </button>
              ) : (
                <Link
                  href="/"
                  className="block w-full py-2.5 rounded-xl text-sm font-medium text-center border border-white/10 hover:bg-white/5 transition-all"
                >
                  Start free
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          All prices in AUD. Cancel anytime. 7-day money-back guarantee.
        </p>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "What does \"per day\" mean?", a: "All daily limits (scans, humanizations, rewrites, and word count per input) reset every 24 hours at midnight UTC. They don't roll over." },
              { q: "What's the word limit per input?", a: "This is the maximum number of words you can paste or upload in a single submission. Free users can submit up to 3,000 words at once, Basic up to 8,000, Pro up to 15,000, and Max up to 30,000." },
              { q: "Does Basic include rewrite?", a: "Yes! All plans include the Rewrite feature (tone, perspective, and rephrasing tools). The difference between plans is the daily limit and max words per input." },
              { q: "What does \"Priority processing\" on Max mean?", a: "Max plan requests are processed on dedicated infrastructure with higher throughput, resulting in roughly 2× faster response times compared to other plans." },
              { q: "Can I cancel anytime?", a: "Yes! Cancel from your account page or email us. No questions asked. You'll keep access until the end of your billing period." },
              { q: "Do unused daily limits roll over?", a: "No. Daily limits reset every 24 hours at midnight UTC. Unused actions don't carry over to the next day." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards via LemonSqueezy, our secure payment processor." },
              { q: "Is there a free trial for paid plans?", a: "We offer a generous free tier (3 scans, 3 humanizations, 3 rewrites per day) so you can test the tool before upgrading." },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="text-sm font-medium mb-1">{item.q}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
