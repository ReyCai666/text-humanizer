import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), ".subscribers.json");

// Persistent subscriber store (survives redeployments)
async function loadSubscribers(): Promise<Set<string>> {
  try {
    if (existsSync(DB_PATH)) {
      const data = await readFile(DB_PATH, "utf-8");
      return new Set(JSON.parse(data));
    }
  } catch {}
  return new Set();
}

async function saveSubscribers(subs: Set<string>) {
  try {
    await writeFile(DB_PATH, JSON.stringify([...subs]), "utf-8");
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
    const email =
      payload.data?.attributes?.user_email ||
      payload.data?.attributes?.customer_email;

    console.log(`[Webhook] ${eventName} — ${email || "no email"}`);

    if (
      (eventName === "subscription_created" || eventName === "subscription_active") &&
      email
    ) {
      const subs = await loadSubscribers();
      subs.add(email.toLowerCase());
      await saveSubscribers(subs);
      console.log(`[Webhook] Subscriber added: ${email}`);
    }

    if (eventName === "subscription_expired" && email) {
      const subs = await loadSubscribers();
      subs.delete(email.toLowerCase());
      await saveSubscribers(subs);
      console.log(`[Webhook] Subscriber removed: ${email}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

// Export for other routes to check subscription status
export { loadSubscribers };
