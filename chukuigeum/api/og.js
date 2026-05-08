// api/og.js
import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get("amount") || "5만원";
  const title = searchParams.get("title") || "국룰 5만원! 🤝";
  const score = searchParams.get("score") || "50";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #fff5f5, #fff)",
          fontFamily: "sans-serif", padding: 48,
        }}
      >
        <div style={{
          fontSize: 24, fontWeight: 800, color: "#FF6B6B",
          marginBottom: 16, letterSpacing: 2
        }}>
          💒 착한 축의금
        </div>
        <div style={{
          fontSize: 96, fontWeight: 900, color: "#111",
          letterSpacing: -4, lineHeight: 1, marginBottom: 16
        }}>
          {amount}
        </div>
        <div style={{
          fontSize: 28, fontWeight: 700, color: "#444",
          marginBottom: 24
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 18, color: "#888",
          background: "#f8f8f8", padding: "8px 20px",
          borderRadius: 100
        }}>
          인연 점수 {score}점
        </div>
        <div style={{
          position: "absolute", bottom: 32,
          fontSize: 16, color: "#bbb", fontWeight: 600
        }}>
          weddingfee.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}