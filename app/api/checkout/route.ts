import { NextRequest, NextResponse } from "next/server";

const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY || "";
const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID || "344378";

// LemonSqueezy checkout URL — set this after creating the product
// Format: https://your-store.lemonsqueezy.com/checkout/buy/VARIANT_ID
const CHECKOUT_URL = process.env.LEMONSQUEEZY_CHECKOUT_URL || "";

export async function GET() {
  if (!CHECKOUT_URL) {
    return NextResponse.json(
      { error: "Checkout not configured yet" },
      { status: 503 }
    );
  }
  return NextResponse.json({ checkout_url: CHECKOUT_URL });
}

// Verify a user's subscription status via LemonSqueezy API
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (!LEMON_SQUEEZY_API_KEY) {
      return NextResponse.json({ is_pro: false });
    }

    // Search subscriptions by email
    const res = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions?filter[user_email]=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ is_pro: false });
    }

    const data = await res.json();
    const subs = data.data || [];
    const activeSub = subs.find(
      (s: any) => s.attributes?.status === "active"
    );

    return NextResponse.json({ is_pro: !!activeSub });
  } catch {
    return NextResponse.json({ is_pro: false });
  }
}
