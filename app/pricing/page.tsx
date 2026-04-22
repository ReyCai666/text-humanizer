"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PLANS, { DAILY_PASSES } from "./PLANS";

const TIER_ORDER = ["free", "basic", "pro", "max"];

function getUser(): { email: string; tier: string } | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("th_user") || "null"); } catch { return null; }
}
function setUser(email: string, tier: string) {
  localStorage.setItem("th_user", JSON.stringify({ email, tier }));
}

export default function PricingPage() {
  const [user, setUserState] = useState(getUser());
  const [tab, setTab] = useState<"monthly" | "daily">("monthly");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subEndsAt, setSubEndsAt] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Login modal
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const currentTier = user?.tier?.toLowerCase() || "free";
  const currentTierIdx = TIER_ORDER.indexOf(currentTier);

  useEffect(() => {
    if (!user?.email) return;
    fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, action: "status" }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.subscription) {
          setSubscriptionId(data.subscription.id);
          setSubEndsAt(data.subscription.endsAt);
        }
      })
      .catch(() => {});
  }, [user?.email]);

  async function handleLogin() {
    if (!loginEmail.trim()) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail }),
      });
      const data = await res.json();
      if (data.verified) {
        setUser(data.email, data.tier);
        setUserState({ email: data.email, tier: data.tier });
        setShowLogin(false);
      } else {
        setLoginError(data.error || "No active subscription found");
      }
    } catch {
      setLoginError("Verification failed. Try again.");
    } finally {
      setLoginLoading(false);
    }
  }

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

  function handlePlanAction(variantId: string) {
    if (!user) {
      setShowLogin(true);
      return;
    }
    handleCheckout(variantId);
  }

  async function handleCancel() {
    if (!subscriptionId || !user?.email) return;
    setCancelLoading(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, action: "cancel", subscriptionId }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelSuccess(true);
        setSubEndsAt(data.subscription.endsAt);
      } else {
        alert(data.error || "Failed to cancel.");
      }
    } catch {
      alert("Network error.");
    }
    setCancelLoading(false);
  }

  function getMonthlyButtonConfig(plan: typeof PLANS[0]) {
    const planIdx = TIER_ORDER.indexOf(plan.name.toLowerCase());

    if (!user) {
      if (plan.vid) return { text: `Get ${plan.name}`, action: () => handlePlanAction(plan.vid!), style: "default" as const };
      return { text: "Get Started Free", action: null, style: "free" as const, link: "/" };
    }
    if (planIdx === currentTierIdx) {
      return { text: "✓ Current Plan", action: null, style: "current" as const };
    }
    if (planIdx === 0 && currentTierIdx > 0) {
      if (cancelSuccess) return { text: "✓ Cancelling at period end", action: null, style: "current" as const };
      return { text: "Cancel Plan", action: () => setShowCancelModal(true), style: "cancel" as const };
    }
    if (planIdx < currentTierIdx && plan.vid) {
      return { text: `Downgrade to ${plan.name}`, action: () => handlePlanAction(plan.vid!), style: "downgrade" as const };
    }
    if (planIdx > currentTierIdx && plan.vid) {
      return { text: `Upgrade to ${plan.name}`, action: () => handlePlanAction(plan.vid!), style: "upgrade" as const };
    }
    if (plan.vid) return { text: `Get ${plan.name}`, action: () => handlePlanAction(plan.vid!), style: "default" as const };
    return { text: "Get Started Free", action: null, style: "free" as const, link: "/" };
  }

  function getDailyButtonConfig(pass: typeof DAILY_PASSES[0]) {
    return { text: `Buy ${pass.name}`, action: () => handlePlanAction(pass.vid), style: pass.popular ? "upgrade" as const : "default" as const };
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#14141f] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold mb-1">Sign in first</h3>
            <p className="text-sm text-slate-400 mb-4">
              Already a member? Enter your email to check your current plan and avoid duplicate charges.
            </p>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all mb-3"
              autoFocus
            />
            {loginError && <p className="text-red-400 text-xs mb-3">{loginError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowLogin(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={handleLogin} disabled={loginLoading || !loginEmail.trim()} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-medium disabled:opacity-50 transition-all">
                {loginLoading ? "Checking..." : "Verify"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">New here? Just pick a plan after closing this.</p>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#14141f] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
            {cancelSuccess ? (
              <div className="text-center">
                <div className="text-4xl mb-4">👋</div>
                <h3 className="text-lg font-semibold mb-2">Subscription cancelled</h3>
                <p className="text-sm text-slate-400 mb-1">Your plan will remain active until the end of your current billing period.</p>
                {subEndsAt && (
                  <p className="text-sm text-slate-500 mb-4">Access until: <span className="text-slate-300">{new Date(subEndsAt).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}</span></p>
                )}
                <p className="text-xs text-slate-600 mb-6">You won&apos;t be charged again after this period.</p>
                <button onClick={() => { setShowCancelModal(false); setCancelSuccess(false); }} className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all">Got it</button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-4">😢</div>
                <h3 className="text-lg font-semibold mb-2">We&apos;re sorry to see you go</h3>
                <p className="text-sm text-slate-400 mb-6">Are you sure you want to cancel? You&apos;ll keep access until the end of your current billing period, but you won&apos;t be charged again.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition-all">Keep my plan</button>
                  <button onClick={handleCancel} disabled={cancelLoading} className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-all disabled:opacity-50">
                    {cancelLoading ? "Cancelling..." : "Yes, cancel"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="EIGEN AI" className="w-7 h-7" />
            <span className="font-semibold text-sm tracking-tight">EIGEN AI</span>
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">← Back to tool</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">pricing</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            {user
              ? `You're on the ${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} plan. ${currentTierIdx > 0 ? "Manage your subscription below." : "Upgrade anytime for more features."}`
              : "Start free. Upgrade when you need more. Cancel anytime."
            }
          </p>
        </div>

        {/* Toggle: Monthly vs Daily */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/10">
            <button
              onClick={() => setTab("monthly")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === "monthly" ? "bg-amber-500/20 text-amber-300" : "text-slate-400 hover:text-white"
              }`}
            >
              📅 Monthly Plans
            </button>
            <button
              onClick={() => setTab("daily")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === "daily" ? "bg-violet-500/20 text-violet-300" : "text-slate-400 hover:text-white"
              }`}
            >
              ⚡ Daily Pass
            </button>
          </div>
        </div>

        {/* Monthly Plans */}
        {tab === "monthly" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
            {PLANS.map((plan) => {
              const btn = getMonthlyButtonConfig(plan);
              return (
                <div key={plan.name} className={`relative p-6 rounded-2xl border transition-all duration-300 hover:translate-y-[-2px] flex flex-col ${
                  plan.price === "0" ? "bg-cyan-500/5 border-cyan-500/20" :
                  plan.popular ? "bg-amber-500/5 border-amber-500/20" :
                  "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[10px] font-semibold">Most Popular</div>}
                  {plan.price === "0" && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full text-[10px] font-semibold">Free</div>}
                  <div className="text-sm font-semibold mb-1">{plan.name}</div>
                  <div className="text-xs text-slate-500 mb-3">{plan.description}</div>
                  <div className="text-3xl font-bold mb-1">
                    {plan.price === "0" ? "Free" : `$${plan.price}`}
                    {plan.period && <span className="text-xs font-normal text-slate-500"> AUD{plan.period}</span>}
                  </div>
                  {plan.perDay && <div className="text-[10px] text-emerald-400/80 mb-1 font-medium">{plan.perDay} — less than a coffee ☕</div>}
                  {plan.price !== "0" ? (
                    <div className="text-[10px] text-slate-600 mb-4">Billed monthly · Cancel anytime</div>
                  ) : (
                    <div className="text-[10px] text-slate-600 mb-4">No credit card needed</div>
                  )}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5 shrink-0">✓</span><span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {btn.link ? (
                    <Link href={btn.link} className="block w-full py-2.5 rounded-xl text-sm font-medium text-center border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all">{btn.text}</Link>
                  ) : btn.action ? (
                    <button onClick={btn.action} disabled={checkoutLoading} className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                      btn.style === "upgrade" || btn.style === "default"
                        ? plan.popular ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white" : "border border-white/10 hover:bg-white/5"
                        : btn.style === "downgrade" ? "border border-slate-500/30 text-slate-400 hover:bg-slate-500/10"
                        : btn.style === "cancel" ? "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                        : "border border-white/10 hover:bg-white/5"
                    }`}>{btn.text}</button>
                  ) : (
                    <div className={`w-full py-2.5 rounded-xl text-sm font-medium text-center border ${
                      plan.price === "0" && user && currentTier === "free" ? "border-cyan-500/30 text-cyan-400" : "border-white/5 text-slate-500"
                    }`}>{btn.text}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Daily Passes */}
        {tab === "daily" && (
          <div className="max-w-2xl mx-auto animate-fade-up">
            <div className="text-center mb-6">
              <p className="text-xs text-violet-400 font-medium">⚡ Pro-level access, pay per use</p>
              <p className="text-xs text-slate-500 mt-1">No subscription. One-time payment. Full Pro features.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {DAILY_PASSES.map((pass) => {
                const btn = getDailyButtonConfig(pass);
                return (
                  <div key={pass.name} className={`relative p-6 rounded-2xl border transition-all duration-300 hover:translate-y-[-2px] flex flex-col ${
                    pass.popular ? "bg-violet-500/5 border-violet-500/20" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}>
                    {pass.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full text-[10px] font-semibold">Best Value</div>}
                    <div className="text-sm font-semibold mb-1">{pass.name}</div>
                    <div className="text-xs text-slate-500 mb-3">{pass.description}</div>
                    <div className="text-3xl font-bold mb-1">
                      ${pass.price}
                      <span className="text-xs font-normal text-slate-500"> AUD</span>
                    </div>
                    <div className="text-[10px] text-violet-400/80 mb-1 font-medium">Pro access for {pass.duration} — one-time payment</div>
                    <div className="text-[10px] text-slate-600 mb-4">No subscription · No auto-renewal</div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {pass.features.map((f, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-violet-400 mt-0.5 shrink-0">✓</span><span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={btn.action} disabled={checkoutLoading} className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                      pass.popular
                        ? "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white"
                        : "border border-white/10 hover:bg-white/5"
                    }`}>{btn.text}</button>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-400">
                <span className="text-violet-400 font-medium">Daily Pass</span> gives you the same limits as the <span className="text-amber-400 font-medium">Pro plan</span> — 50 scans, 100 humanizations, 100 rewrites per day, and 15,000 character limit per input. Perfect for finals week or a big project.
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-600 mt-8">All prices in AUD. Cancel anytime. 7-day money-back guarantee.</p>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "What's the difference between Monthly and Daily Pass?", a: "Monthly plans are auto-renewing subscriptions. Daily Pass is a one-time payment that gives you Pro-level access for 24 or 72 hours — no subscription, no auto-renewal." },
              { q: "What happens when my Daily Pass expires?", a: "You'll automatically go back to the Free plan. No charges, no surprises." },
              { q: "Can I buy multiple Daily Passes?", a: "Yes! If your current pass is about to expire, you can buy another one to extend your access." },
              { q: "What happens when I upgrade?", a: "Your new plan takes effect immediately. You'll be charged the prorated difference, and your billing cycle resets from today." },
              { q: "What happens when I cancel?", a: "Your plan stays active until the end of your current billing period. You won't be charged again. After that, you'll be on the Free plan." },
              { q: "What does \"per day\" mean?", a: "All daily limits reset every 24 hours at midnight UTC. They don't roll over." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards via LemonSqueezy, our secure payment processor." },
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
