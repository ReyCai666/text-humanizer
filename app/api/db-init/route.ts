import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/schema";

export async function POST() {
  try {
    await initDatabase();
    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (err) {
    console.error("DB init error:", err);
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 });
  }
}
