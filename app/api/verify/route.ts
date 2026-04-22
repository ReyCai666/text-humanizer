import { NextRequest, NextResponse } from "next/server";
import { loadSubscribers } from "../webhook/route";

const LEMON_API_KEY = process.env.LEMON_API_KEY || process.env.LEMONSQUEEZY_API_KEY || "";

// Check if email has an active subscription
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // ─── 1. Check local DB first (daily passes) ───────
    const db = await loadSubscribers();
    const record = db[normalizedEmail];

    if (record?.expiresAt) {
      // Daily pass — check expiry
      const expiresAt = new Date(record.expiresAt);
      if (expiresAt > new Date()) {
        // Still valid
        const hoursLeft = Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60));
        return NextResponse.json({
          verified: true,
          tier: record.tier,
          productName: `Daily Pass (${hoursLeft}h left)`,
          email: normalizedEmail,
          expiresAt: record.expiresAt,
        });
      } else {
        // Expired — clean up
        delete db[normalizedEmail];
        // Note: can't easily save from here, but the record is stale anyway
      }
    }

    // ─── 2. Check LemonSqueezy API for subscriptions ──
    if (!LEMON_API_KEY) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    const res = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions?filter[user_email]=${encodeURIComponent(email)}&filter[status]=active`,
      {
        headers: {
          Authorization: `Bearer ${LEMON_API_KEY}`,
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!res.ok) {
      console.error("LemonSqueezy API error:", res.status);
      return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }

    const data = await res.json();
    const subscriptions = data.data || [];

    if (subscriptions.length > 0) {
      const sub = subscriptions[0];
      const attrs = sub.attributes || {};
      const productName = attrs.product_name || "";
      const cancelled = attrs.cancelled;

      // Determine tier from product name
      let tier = "basic";
      if (productName.toLowerCase().includes("max")) tier = "max";
      else if (productName.toLowerCase().includes("pro")) tier = "pro";

      return NextResponse.json({
        verified: true,
        tier,
        productName: cancelled ? `${productName} (cancelling)` : productName,
        email: normalizedEmail,
        cancelled,
        endsAt: attrs.ends_at,
      });
    }

    // ─── 3. Also check local DB for subscription records ──
    if (record && !record.expiresAt) {
      // Subscription-based record in local DB
      return NextResponse.json({
        verified: true,
        tier: record.tier,
        productName: record.tier.charAt(0).toUpperCase() + record.tier.slice(1),
        email: normalizedEmail,
      });
    }

    return NextResponse.json({ verified: false, error: "No active subscription found for this email" });
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
