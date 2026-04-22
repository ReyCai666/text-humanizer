import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), ".subscribers.json");

// Variant IDs for daily passes
const DAILY_PASS_VARIANTS: Record<string, { tier: string; hours: number }> = {
  "1553092": { tier: "pro", hours: 24 },   // 1-Day Pass
  "1553096": { tier: "pro", hours: 72 },   // 3-Day Pass
};

// Subscriber record
interface SubscriberRecord {
  tier: string;
  expiresAt?: string; // ISO date for daily passes, undefined for subscriptions
  subscriptionId?: string;
}

type SubscriberDB = Record<string, SubscriberRecord>;

async function loadSubscribers(): Promise<SubscriberDB> {
  try {
    if (existsSync(DB_PATH)) {
      const data = await readFile(DB_PATH, "utf-8");
      const parsed = JSON.parse(data);
      // Migrate from old format (Set of emails)
      if (Array.isArray(parsed)) {
        const db: SubscriberDB = {};
        for (const email of parsed) {
          db[email.toLowerCase()] = { tier: "pro" };
        }
        return db;
      }
      return parsed;
    }
  } catch {}
  return {};
}

async function saveSubscribers(db: SubscriberDB) {
  try {
    await writeFile(DB_PATH, JSON.stringify(db), "utf-8");
  } catch (err) {
    console.error("Failed to save subscribers:", err);
  }
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.LEMON_WEBHOOK_SECRET;
  const rawBody = await req.text();

  // Verify webhook signature if secret is configured
  if (webhookSecret) {
    const signature = req.headers.get("x-signature");
    if (!signature || !verifySignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  try {
    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const attrs = payload.data?.attributes || {};
    const email = attrs.user_email || attrs.customer_email;

    console.log(`[Webhook] ${eventName} — ${email || "no email"}`);

    const db = await loadSubscribers();

    // ─── Monthly subscription events ───────────────────
    if ((eventName === "subscription_created" || eventName === "subscription_active") && email) {
      const variantId = String(attrs.variant_id || "");
      // Map variant to tier
      const tierMap: Record<string, string> = {
        "1553040": "basic",
        "1553066": "pro",
        "1553067": "max",
      };
      const tier = tierMap[variantId] || "pro";
      db[email.toLowerCase()] = {
        tier,
        subscriptionId: String(attrs.subscription_id || payload.data?.id || ""),
      };
      await saveSubscribers(db);
      console.log(`[Webhook] Subscriber added: ${email} (${tier})`);
    }

    if (eventName === "subscription_expired" && email) {
      delete db[email.toLowerCase()];
      await saveSubscribers(db);
      console.log(`[Webhook] Subscriber removed: ${email}`);
    }

    if (eventName === "subscription_cancelled" && email) {
      // Don't remove immediately — they keep access until ends_at
      // The verify API will check if the subscription is still active
      console.log(`[Webhook] Subscription cancelled: ${email} (access continues until period end)`);
    }

    // ─── One-time purchase (Daily Pass) ────────────────
    if (eventName === "order_created" && email) {
      const firstItem = attrs.first_order_item || attrs.order_items?.[0] || {};
      const variantId = String(firstItem.variant_id || "");

      if (DAILY_PASS_VARIANTS[variantId]) {
        const pass = DAILY_PASS_VARIANTS[variantId];
        const expiresAt = new Date(Date.now() + pass.hours * 60 * 60 * 1000).toISOString();

        // If user already has a subscription, don't overwrite
        const existing = db[email.toLowerCase()];
        if (!existing || existing.expiresAt) {
          // Only upgrade if no subscription or already on a daily pass
          db[email.toLowerCase()] = {
            tier: pass.tier,
            expiresAt,
          };
          await saveSubscribers(db);
          console.log(`[Webhook] Daily pass granted: ${email} (${pass.tier} until ${expiresAt})`);
        } else {
          console.log(`[Webhook] Daily pass skipped: ${email} already has ${existing.tier} subscription`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

// Export for other routes to check subscription status
export { loadSubscribers };
