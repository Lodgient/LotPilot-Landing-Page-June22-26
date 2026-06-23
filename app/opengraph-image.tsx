import { ImageResponse } from "next/og";

// Dynamic 1200×630 PNG social/AI link-preview image. Replaces the old static
// /og.svg, which platforms (Facebook, LinkedIn, X, Slack, iMessage) don't render.
// Next serves this for both Open Graph and Twitter automatically.
export const alt = "LotPilot — your inventory, recommended by AI; your leads, worked by AI.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0f17",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#8af671",
            }}
          />
          <div style={{ display: "flex", fontSize: "34px", fontWeight: 700, color: "#f5f5f4" }}>
            LotPilot
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "68px",
              fontWeight: 700,
              lineHeight: 1.05,
              color: "#f5f5f4",
              maxWidth: "1000px",
            }}
          >
            Your inventory, recommended by AI. Your leads, worked by AI.
          </div>
          <div style={{ display: "flex", fontSize: "30px", color: "#9ca3af" }}>
            You just send the feed.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "24px", color: "#00C4FF" }}>
          ChatGPT · Perplexity · Gemini · Google AI Overviews · Copilot
        </div>
      </div>
    ),
    { ...size },
  );
}
