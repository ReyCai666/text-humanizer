import { NextRequest, NextResponse } from "next/server";
import { loadSubscribers } from "../webhook/route";

const LEMON_API = "https://api.lemonsqueezy.com/v1";

// GET: Get subscription status for a user
export async function POST(req: NextRequest) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const { email, action, subscriptionId } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    };

    // Find subscription by email
    if (action === "status") {
      const res = await fetch(`${LEMON_API}/subscriptions?filter[user_email]=${encodeURIComponent(email)}`, { headers });
      const data = await res.json();
      
      if (!res.ok) {
        console.error("LemonSqueezy status error:", data);
        return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
      }

      const subs = data.data || [];
      if (subs.length === 0) {
        return NextResponse.json({ subscription: null });
      }

      const sub = subs[0];
      const attrs = sub.attributes;
      return NextResponse.json({
        subscription: {
          id: sub.id,
          status: attrs.status, // active, cancelled, expired, past_due
          productName: attrs.product_name,
          variantName: attrs.variant_name,
          price: attrs.price_formatted,
          renewsAt: attrs.renews_at,
          endsAt: attrs.ends_at,
          cancelled: attrs.cancelled,
          billingCycle: attrs.billing_cycle,
          cardBrand: attrs.card_brand,
          cardLastFour: attrs.card_last_four,
        },
      });
    }

    // Cancel subscription
    if (action === "cancel") {
      if (!subscriptionId) {
        return NextResponse.json({ error: "Subscription ID required" }, { status: 400 });
      }

      const res = await fetch(`${LEMON_API}/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          data: {
            type: "subscriptions",
            id: subscriptionId,
            attributes: {
              cancelled: true,
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("LemonSqueezy cancel error:", data);
        return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
      }

      const attrs = data.data.attributes;
      return NextResponse.json({
        success: true,
        subscription: {
          id: data.data.id,
          status: attrs.status,
          cancelled: attrs.cancelled,
          endsAt: attrs.ends_at,
        },
      });
    }

    // Resume (uncancel) subscription
    if (action === "resume") {
      if (!subscriptionId) {
        return NextResponse.json({ error: "Subscription ID required" }, { status: 400 });
      }

      const res = await fetch(`${LEMON_API}/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          data: {
            type: "subscriptions",
            id: subscriptionId,
            attributes: {
              cancelled: false,
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("LemonSqueezy resume error:", data);
        return NextResponse.json({ error: "Failed to resume subscription" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Subscription API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
