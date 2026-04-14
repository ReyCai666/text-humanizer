import { NextRequest } from "next/server";
import { createHash } from "crypto";

/**
 * 从请求中提取用户指纹（IP + browser fingerprint hash）
 * 防止清缓存/换浏览器刷免费额度
 */
export function getFingerprint(req: NextRequest, clientFingerprint?: string): string {
  // 获取 IP（兼容 Vercel/Cloudflare）
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || 
             req.headers.get("x-real-ip") || 
             "unknown";

  // 组合 IP + 客户端指纹（如果有）
  // 仅靠 IP 不够（同一学校/公司可能共享 IP），加上浏览器指纹更精准
  const raw = `${ip}:${clientFingerprint || "no-fp"}`;
  
  return createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

/**
 * 获取今天的日期字符串 (YYYY-MM-DD)
 */
export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}
