import { NextRequest, NextResponse } from "next/server";
import { loadSubscribers } from "../webhook/route";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ subscribed: false });
    }
    const subs = await loadSubscribers();
    const isSubscribed = subs.has(email.toLowerCase());
    return NextResponse.json({ subscribed: isSubscribed });
  } catch {
    return NextResponse.json({ subscribed: false });
  }
}
