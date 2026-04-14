import { NextRequest, NextResponse } from "next/server";

const LEMON_API_KEY = process.env.LEMON_API_KEY || "";

// Check if email has an active subscription
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!LEMON_API_KEY) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    // Search LemonSqueezy for active subscriptions with this email
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
      const productName = sub.attributes?.product_name || "";
      const variantName = sub.attributes?.variant_name || "";

      // Determine tier from product name
      let tier = "basic";
      if (productName.toLowerCase().includes("max")) tier = "max";
      else if (productName.toLowerCase().includes("pro")) tier = "pro";

      return NextResponse.json({
        verified: true,
        tier,
        productName,
        email: email.toLowerCase(),
      });
    }

    return NextResponse.json({ verified: false, error: "No active subscription found for this email" });
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
