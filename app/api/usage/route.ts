import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getFingerprint, getToday } from "@/lib/fingerprint";

const FREE_DAILY_LIMIT = 3;

/**
 * GET /api/usage?fp=xxx
 * 查询今日剩余免费次数
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientFp = searchParams.get("fp") || undefined;
    const fingerprint = getFingerprint(req, clientFp);
    const today = getToday();

    const result = await db.execute({
      sql: "SELECT use_count FROM anonymous_usage WHERE fingerprint = ? AND date = ?",
      args: [fingerprint, today],
    });

    const used = result.rows[0]?.use_count as number || 0;
    const remaining = Math.max(0, FREE_DAILY_LIMIT - used);

    return NextResponse.json({
      used,
      remaining,
      limit: FREE_DAILY_LIMIT,
    });
  } catch (err) {
    console.error("Usage check error:", err);
    return NextResponse.json({ error: "Failed to check usage" }, { status: 500 });
  }
}
