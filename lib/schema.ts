import db from "./db";

export async function initDatabase() {
  await db.executeMultiple(`
    -- 用户表
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      tier TEXT DEFAULT 'free',
      lemon_customer_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 已登录用户用量追踪（按天）
    CREATE TABLE IF NOT EXISTS usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      date TEXT NOT NULL,
      humanize_count INTEGER DEFAULT 0,
      scan_count INTEGER DEFAULT 0,
      rewrite_count INTEGER DEFAULT 0,
      UNIQUE(user_id, date)
    );

    -- 匿名用户用量追踪（按 IP + fingerprint hash）
    -- 防止清缓存/换浏览器刷免费额度
    CREATE TABLE IF NOT EXISTS anonymous_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fingerprint TEXT NOT NULL,
      date TEXT NOT NULL,
      use_count INTEGER DEFAULT 0,
      UNIQUE(fingerprint, date)
    );

    -- 索引
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_anon_fingerprint_date ON anonymous_usage(fingerprint, date);
  `);
}
