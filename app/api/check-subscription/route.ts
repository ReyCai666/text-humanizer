import { NextRequest, NextResponse } from "next/server";
import { loadSubscribers } from "../webhook/route";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ subscribed: false });
    }
    const db = await loadSubscribers();
    const record = db[email.toLowerCase()];

    if (!record) {
      return NextResponse.json({ subscribed: false });
    }

    // Check daily pass expiry
    if (record.expiresAt) {
      const isExpired = new Date(record.expiresAt) <= new Date();
      return NextResponse.json({ subscribed: !isExpired, tier: isExpired ? "free" : record.tier });
    }

    return NextResponse.json({ subscribed: true, tier: record.tier });
  } catch {
    return NextResponse.json({ subscribed: false });
  }
}
