import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";

// Simple in-memory pro user store (in production, use a database)
// Key: email, Value: { is_pro: boolean, expires_at: string }
const proUsers = new Map<string, { is_pro: boolean; expires_at: string }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-signature");

    // Verify webhook signature if secret is configured
    if (WEBHOOK_SECRET && signature) {
      const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
      const digest = hmac.update(body).digest("hex");
      if (digest !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const eventName = event.meta?.event_name;
    const attrs = event.data?.attributes;

    console.log(`[LemonSqueezy Webhook] ${eventName}`);

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated": {
        const email = attrs?.user_email;
        const status = attrs?.status;
        const renewsAt = attrs?.renews_at;
        if (email) {
          proUsers.set(email, {
            is_pro: status === "active",
            expires_at: renewsAt || "",
          });
        }
        break;
      }
      case "subscription_expired":
      case "subscription_cancelled": {
        const email = attrs?.user_email;
        if (email) {
          proUsers.set(email, { is_pro: false, expires_at: "" });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Export for use in other routes
export function isProUser(email: string): boolean {
  return proUsers.get(email)?.is_pro ?? false;
}
