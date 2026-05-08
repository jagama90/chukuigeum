export const config = { runtime: "edge" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get("amount") || "5만원";
  const title = searchParams.get("title") || "국룰 5만원! 🤝";
  const score = searchParams.get("score") || "50";

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fff5f5"/>
      <stop offset="100%" style="stop-color:#ffffff"/>
    </linearGradient>
    <linearGradient id="badge" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FF6B6B"/>
      <stop offset="100%" style="stop-color:#FF8E53"/>
    </linearGradient>
  </defs>

  <!-- 배경 -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- 왼쪽 장식 바 -->
  <rect x="0" y="0" width="8" height="630" fill="url(#badge)"/>

  <!-- 브랜드 배지 -->
  <rect x="80" y="64" width="220" height="44" rx="22" fill="url(#badge)"/>
  <text x="190" y="92" font-family="sans-serif" font-size="18" font-weight="800" fill="white" text-anchor="middle">💒 착한 축의금</text>

  <!-- 메인 금액 -->
  <text x="80" y="280" font-family="sans-serif" font-size="140" font-weight="900" fill="#111" letter-spacing="-4">${amount}</text>

  <!-- 타이틀 -->
  <text x="80" y="360" font-family="sans-serif" font-size="40" font-weight="700" fill="#444">${title}</text>

  <!-- 점수 배지 -->
  <rect x="80" y="400" width="200" height="50" rx="25" fill="#f5f5f5"/>
  <text x="180" y="432" font-family="sans-serif" font-size="22" font-weight="700" fill="#666" text-anchor="middle">인연 점수 ${score}점</text>

  <!-- 하단 URL -->
  <text x="80" y="570" font-family="sans-serif" font-size="24" font-weight="600" fill="#bbb">weddingfee.vercel.app</text>

  <!-- 오른쪽 장식 원 -->
  <circle cx="980" cy="315" r="240" fill="#FF6B6B" opacity="0.06"/>
  <circle cx="1100" cy="160" r="120" fill="#FF8E53" opacity="0.08"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}