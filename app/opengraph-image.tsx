import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "EIGEN AI — AI Text Humanizer & Detector";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0f",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #10b981, #06b6d4)",
            marginBottom: 32,
            fontSize: 36,
            fontWeight: 800,
            color: "#000",
            alignItems: "center",
            justifyContent: "center",
          }}
        >E</div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Humanize<span style={{ color: "#10b981" }}>AI</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#94a3b8",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          AI Text Humanizer &amp; Detection Tool
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {["Detect AI", "Humanize", "Verify", "Free"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "8px 20px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "#64748b",
                fontSize: 16,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
