"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface UserData {
  email: string;
  tier: string;
}

interface Subscription {
  id: string;
  status: string;
  productName: string;
  variantName: string;
  price: string;
  renewsAt: string | null;
  endsAt: string | null;
  cancelled: boolean;
  cardBrand: string | null;
  cardLastFour: string | null;
}

function getUsage(key: string): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const d = JSON.parse(localStorage.getItem(key) || "{}");
    return d.date === today ? d.count || 0 : 0;
  } catch { return 0; }
}

const TIER_LIMITS: Record<string, { name: string; scan: number; humanize: number; rewrite: number; words: number }> = {
  free: { name: "Free", scan: 3, humanize: 3, rewrite: 3, words: 5000 },
  basic: { name: "Basic", scan: 10, humanize: 30, rewrite: 30, words: 5000 },
  pro: { name: "Pro", scan: 50, humanize: 100, rewrite: 100, words: 15000 },
  max: { name: "Max", scan: 300, humanize: 9999, rewrite: 9999, words: 30000 },
};

export default function AccountPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("th_user") || "null");
      setUser(u);
    } catch { setUser(null); }
  }, []);

  const fetchSubscription = useCallback(async () => {
    if (!user?.email || user.tier === "free") return;
    setSubLoading(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, action: "status" }),
      });
      const data = await res.json();
      if (data.subscription) setSubscription(data.subscription);
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
    }
    setSubLoading(false);
  }, [user?.email, user?.tier]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const tier = user?.tier || "free";
  const limits = TIER_LIMITS[tier];
  const isPaid = tier !== "free";

  const scanUsed = getUsage("th_d");
  const humanizeUsed = getUsage("th_h");
  const rewriteUsed = getUsage("th_rw");

  async function handleCancel() {
    if (!subscription) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, action: "cancel", subscriptionId: subscription.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Subscription cancelled. You'll keep access until the end of your billing period.");
        setShowCancelConfirm(false);
        fetchSubscription();
      } else {
        setMessage("Failed to cancel. Please try again.");
      }
    } catch { setMessage("Network error."); }
    setActionLoading(false);
  }

  async function handleResume() {
    if (!subscription) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, action: "resume", subscriptionId: subscription.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Subscription resumed! Auto-renewal is back on.");
        fetchSubscription();
      }
    } catch { setMessage("Network error."); }
    setActionLoading(false);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
    const pct = (used / max) * 100;
    const remaining = Math.max(0, max - used);
    const isFull = used >= max;
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">{label}</span>
          <span className={`text-xs font-medium ${isFull ? "text-red-400" : "text-slate-300"}`}>
            {used} / {max} {isFull ? "— limit reached" : `(${remaining} left)`}
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFull ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Please sign in to view your account.</p>
          <Link href="/" className="text-sm text-amber-400 hover:underline">Go to HumanizeAI →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="HumanizeAI" className="w-7 h-7" />
            <span className="font-semibold text-sm tracking-tight">HumanizeAI</span>
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">← Back to tool</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">Account</h1>

        {message && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {/* Plan & Billing */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-slate-400">Current Plan</div>
              <div className="text-xl font-bold mt-1">
                {limits.name}
                {isPaid && subscription && !subscription.cancelled && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                )}
                {subscription?.cancelled && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Cancelling</span>
                )}
              </div>
            </div>
            {!isPaid && (
              <Link href="/pricing" className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-medium hover:from-amber-400 hover:to-orange-400 transition-all">
                Upgrade
              </Link>
            )}
          </div>
          <div className="text-xs text-slate-500 mb-4">{user.email}</div>

          {/* Subscription details for paid users */}
          {isPaid && subscription && (
            <div className="border-t border-white/5 pt-4 space-y-3">
              {subLoading ? (
                <div className="text-xs text-slate-500 animate-pulse">Loading subscription details...</div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className={subscription.cancelled ? "text-amber-400" : "text-emerald-400"}>
                      {subscription.cancelled ? "Cancelling — access until period end" : "Active — auto-renewing"}
                    </span>
                  </div>
                  {subscription.renewsAt && !subscription.cancelled && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Next billing date</span>
                      <span className="text-slate-300">{formatDate(subscription.renewsAt)}</span>
                    </div>
                  )}
                  {subscription.endsAt && subscription.cancelled && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Access ends</span>
                      <span className="text-amber-400">{formatDate(subscription.endsAt)}</span>
                    </div>
                  )}
                  {subscription.cardBrand && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Payment method</span>
                      <span className="text-slate-300 capitalize">{subscription.cardBrand} •••• {subscription.cardLastFour}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Price</span>
                    <span className="text-slate-300">{subscription.price}</span>
                  </div>

                  {/* Cancel / Resume buttons */}
                  <div className="pt-2">
                    {subscription.cancelled ? (
                      <button
                        onClick={handleResume}
                        disabled={actionLoading}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? "Resuming..." : "Resume subscription"}
                      </button>
                    ) : showCancelConfirm ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">Are you sure?</span>
                        <button onClick={handleCancel} disabled={actionLoading} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
                          {actionLoading ? "Cancelling..." : "Yes, cancel"}
                        </button>
                        <button onClick={() => setShowCancelConfirm(false)} className="text-xs text-slate-500 hover:text-white">
                          No, keep it
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setShowCancelConfirm(true)} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                        Cancel subscription
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {isPaid && !subscription && !subLoading && (
            <div className="border-t border-white/5 pt-4">
              <p className="text-xs text-slate-500">
                Subscription details are managed by our payment provider. Your <span className="text-emerald-400 font-medium">{limits.name}</span> plan is active.
              </p>
            </div>
          )}
        </div>

        {/* Usage */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="text-sm font-medium mb-4">Today&apos;s Usage</div>
          <div className="space-y-4">
            <UsageBar label="AI Scans" used={scanUsed} max={limits.scan} />
            <UsageBar label="Humanizations" used={humanizeUsed} max={limits.humanize} />
            <UsageBar label="Rewrites" used={rewriteUsed} max={limits.rewrite} />
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Limits reset daily at midnight. Max {limits.words.toLocaleString()} words per input.
            {!isPaid && <> <Link href="/pricing" className="text-amber-400 hover:underline">Upgrade for more</Link></>}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <div className="text-sm font-medium mb-4">Quick Actions</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/?tab=detector" className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-all">
              <span className="text-lg">🎯</span>
              <div><div className="text-sm font-medium">AI Detector</div><div className="text-xs text-slate-500">Scan text for AI content</div></div>
            </Link>
            <Link href="/?tab=humanize" className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-all">
              <span className="text-lg">✨</span>
              <div><div className="text-sm font-medium">Humanizer</div><div className="text-xs text-slate-500">Make AI text sound human</div></div>
            </Link>
            <Link href="/?tab=rewrite" className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-all">
              <span className="text-lg">📝</span>
              <div><div className="text-sm font-medium">Rewrite</div><div className="text-xs text-slate-500">Change tone & perspective</div></div>
            </Link>
            <Link href="/pricing" className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-all">
              <span className="text-lg">💎</span>
              <div><div className="text-sm font-medium">Plans & Pricing</div><div className="text-xs text-slate-500">View all plans</div></div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
