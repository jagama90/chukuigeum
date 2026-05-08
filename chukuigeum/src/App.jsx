import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const RESULT_TIERS = [
  { min: -99, max: 15, amount: 50000, title: "국룰 5만원, 딱 여기까지 🤝", emoji: "💵", color: "#95a5a6",
    messages: [
      "솔직히 말할게요. 이 분과의 인연은 얇아요. 5만원이 가장 정직한 표현이에요.",
      "억지로 더 낼 필요 없어요. 5만원은 예의를 지키는 최소한의 표현이에요.",
      "인연의 깊이가 곧 금액이에요. 얇은 인연엔 5만원 봉투가 딱 맞아요.",
      "고민할 필요 없어요. 5만원은 이미 국가 공인 표준이에요.",
    ]
  },
  { min: 16, max: 25, amount: 70000, title: "7만원... 마음은 있어요 🫡", emoji: "💐", color: "#27ae60",
    messages: [
      "5만원은 좀 적고 10만원은 좀 부담스러운 그 사이. 따뜻한 시그널이에요.",
      "7만원은 '나 너 꽤 챙기는 사람이야'의 언어예요.",
      "어중간해 보여도 이게 의외로 가장 기억에 남는 금액이에요.",
      "5에서 한 걸음 더. 그 한 걸음이 관계를 말해줘요.",
    ]
  },
  { min: 26, max: 35, amount: 100000, title: "10만원, 진짜 친구 ✅", emoji: "👑", color: "#2980b9",
    messages: [
      "이 분은 당신의 진짜 친구예요. 10만원짜리 우정은 흔하지 않아요.",
      "10만원을 자연스럽게 낼 수 있는 사람이 몇 명이나 돼요? 이 분은 그 안에 있어요.",
      "심리적 마지노선을 넘는 금액. 그만큼 이 분이 소중하다는 뜻이에요.",
      "받는 사람 입장에서 10만원짜리 봉투는 오래 기억해요.",
    ]
  },
  { min: 36, max: 45, amount: 150000, title: "15만원... 형제야? 🥹", emoji: "🫂", color: "#8e44ad",
    messages: [
      "이 정도면 그냥 가족이에요. 받는 분도 평생 기억할 거예요.",
      "15만원은 '내 결혼식에 꼭 와줘'의 언어예요.",
      "이 분 없는 인생은 상상이 안 되죠? 그 마음이 15만원이에요.",
      "축의금 상위 5%. 이 분은 당신 인생의 핵심 인물이에요.",
    ]
  },
  { min: 61, max: 75, amount: 200000, title: "20만원+ 전생에 나라 구했나 🏆", emoji: "💎", color: "#c0392b",
    messages: [
      "이 분이 당신 삶에 미친 영향은 돈으로 환산이 안 돼요.",
      "20만원을 고민 없이 쓸 수 있는 관계. 당신은 복 받은 사람이에요.",
      "이 분에게 20만원은 사실 너무 적을 수도 있어요. 그래도 예의상 봉투에 담아요.",
      "축의금을 넘어서 이 분의 새 출발을 진심으로 응원하는 금액이에요.",
    ]
  },
  { min: 76, max: 89, amount: 300000, title: "30만원, 이건 진짜 인생 친구 🌟", emoji: "🔥", color: "#e84393",
    messages: [
      "30만원짜리 관계. 당신 인생에 몇 명이나 될까요?",
      "이 분은 당신의 인생 스토리에 반드시 등장하는 사람이에요.",
      "30만원은 '너 없는 내 삶은 상상도 못 해'의 언어예요.",
      "이 봉투를 건네는 순간, 상대방은 평생 기억할 거예요.",
    ]
  },
  { min: 90, max: 99, amount: 500000, title: "50만원... 가족 그 이상 💍", emoji: "👨‍👩‍👧", color: "#6c3483",
    messages: [
      "50만원. 이 분은 당신의 가족이에요. 피가 안 섞였을 뿐.",
      "이 금액을 고민 없이 쓸 수 있다면, 이 분은 당신 삶의 기둥이에요.",
      "평생 곁에 있어준 사람에게 50만원은 오히려 적을 수도 있어요.",
      "이 분의 결혼식은 당신 인생에서도 중요한 날이에요.",
    ]
  },
  { min: 100, max: 999, amount: 1000000, title: "100만원+ 전생에 나라를 구했군요 🏆", emoji: "💎", color: "#c0392b",
    messages: [
      "100만원. 이 분은 당신의 모든 것을 알고도 곁에 있는 사람이에요.",
      "이 금액이 아깝지 않다면, 당신은 정말 복 받은 사람이에요.",
      "돈으로 환산할 수 없는 관계. 그래도 봉투에 담아야 하니까요.",
      "이 분 없는 당신의 인생을 상상할 수 없죠? 그게 100만원이에요.",
    ]
  },
];

// ─── 역방향 계산기 ────────────────────────────────────────────────────────────
function ReverseCalculator({ onClose }) {
  const [received, setReceived] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const n = Number(received.replace(/[^0-9]/g, ""));
    if (!n) return;
    // 받은 금액 기준 → 낼 금액 (동일 or +1티어)
    const tier = RESULT_TIERS.find(t => t.amount >= n) || RESULT_TIERS[RESULT_TIERS.length - 1];
    const same = tier.amount === n;
    setResult({ received: n, recommend: tier.amount, same });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", borderRadius: "24px 24px 0 0",
        padding: "24px 20px 40px", width: "100%", maxWidth: 480,
        fontFamily: "'Pretendard', -apple-system, sans-serif"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>↩️ 받은 축의금 기준 계산</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999" }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 16, lineHeight: 1.6 }}>
          예전에 이 분께 받은 축의금을 입력하면<br />
          이번에 낼 적정 금액을 추천해줘요.
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="number"
            value={received}
            onChange={e => { setReceived(e.target.value); setResult(null); }}
            placeholder="받은 금액 (예: 50000)"
            style={{
              flex: 1, padding: "13px 14px", borderRadius: 12,
              border: "1.5px solid #f0f0f0", fontSize: 15,
              fontFamily: "inherit", outline: "none"
            }}
          />
          <button onClick={calculate} style={{
            padding: "13px 18px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
            color: "#fff", cursor: "pointer", fontSize: 14,
            fontWeight: 700, fontFamily: "inherit"
          }}>계산</button>
        </div>
        {result && (
          <div style={{
            background: "#FFF5F5", border: "2px solid #FF6B6B33",
            borderRadius: 16, padding: "20px", textAlign: "center",
            animation: "fadeSlideIn 0.3s ease"
          }}>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>
              {formatAmount(result.received)} 받았다면 → 이번엔
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#FF6B6B", lineHeight: 1, marginBottom: 8 }}>
              {formatAmount(result.recommend)}
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>
              {result.same
                ? "💚 받은 금액과 동일하게 돌려드리면 돼요"
                : "💡 받은 금액에 맞춰 같은 티어로 돌려드려요"}
            </div>
          </div>
        )}
        {/* 역방향 계산기 안에서 정밀 계산으로 넘어가는 CTA */}
        <button onClick={onClose} style={{
          width: "100%", marginTop: 16, padding: "13px", borderRadius: 12, border: "none",
          background: "#f5f5f5", color: "#666", cursor: "pointer",
          fontSize: 13, fontWeight: 700, fontFamily: "inherit"
        }}>
          더 정밀하게 계산하기 →
        </button>
      </div>
    </div>
  );
}

// ─── 복수 계산 결과 패널 ──────────────────────────────────────────────────────
function MultiResultPanel({ results, onClose }) {
  const total = results.reduce((s, r) => s + r.amount, 0);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", borderRadius: "24px 24px 0 0",
        padding: "24px 20px 40px", width: "100%", maxWidth: 480,
        fontFamily: "'Pretendard', -apple-system, sans-serif",
        maxHeight: "80vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>📋 이번 달 축의금 목록</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999" }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>각 결과 이후 "목록에 추가" 버튼으로 쌓여요</div>
        {results.length === 0 ? (
          <div style={{ textAlign: "center", color: "#ccc", padding: "32px 0", fontSize: 14 }}>
            아직 추가된 결과가 없어요
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {results.map((r, i) => (
                <div key={i} style={{
                  background: "#f8f8f8", borderRadius: 14, padding: "14px 16px",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>{r.name || `${i + 1}번째`}</div>
                    <div style={{ fontSize: 11, color: "#999" }}>{r.relation}</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#FF6B6B" }}>{formatAmount(r.amount)}</div>
                </div>
              ))}
            </div>
            <div style={{
              background: "linear-gradient(135deg, #FF6B6B18, #FF8E5318)",
              border: "2px solid #FF6B6B33",
              borderRadius: 16, padding: "16px", textAlign: "center"
            }}>
              <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>이번 달 축의금 합계</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#FF6B6B" }}>{formatAmount(total)}</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{results.length}명 · 평균 {formatAmount(Math.round(total / results.length / 10000) * 10000)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const CHAT_FLOW = [
  {
    id: "relation",
    botMessage: "안녕하세요! 👋\n축의금 얼마 낼지 같이 계산해볼게요.\n\n먼저, 이 분과 어떤 관계예요?",
    type: "select",
    options: [
      { label: "👨‍👩‍👧 가족 / 친척", value: 20 },
      { label: "🤗 쩔친 / 베프", value: 12 },
      { label: "😊 친한 친구", value: 8 },
      { label: "💼 직장 동료", value: 5 },
      { label: "👋 지인 / 아는 사람", value: 2 },
      { label: "📱 SNS 친구", value: 1 },
    ],
  },
  {
    id: "meal_count",
    botMessage: (prev) => `${prev.relation?.label?.split(' ')[1] || ''}이시군요!\n\n최근 1년 동안 같이 밥은 몇 번 먹었어요?`,
    type: "select",
    options: [
      { label: "🙅 0번", value: 0 },
      { label: "🍱 1~2번", value: 2 },
      { label: "🍜 3~5번", value: 4 },
      { label: "🍣 6~10번", value: 6 },
      { label: "🍽️ 10번 이상", value: 8 },
    ],
  },
  {
    id: "my_wedding",
    botMessage: "본인의 결혼식(또는 중요한 행사) 때\n이 분 오셨나요?",
    type: "select",
    options: [
      { label: "💝 왔고, 축의금도 두둑이", value: 8 },
      { label: "✅ 오긴 왔어요", value: 5 },
      { label: "📞 못 왔는데 연락은 했어요", value: 2 },
      { label: "😶 연락조차 없었어요", value: 0 },
      { label: "💍 나 아직 미혼이에요", value: 3 },
    ],
  },
  {
    id: "kakao_speed",
    botMessage: "카톡 보내면 답장 속도가 어때요?\n(평균적으로)",
    type: "select",
    options: [
      { label: "⚡ 즉시 (5분 이내)", value: 3 },
      { label: "🙂 빠른 편 (1시간 이내)", value: 2 },
      { label: "🐌 느린 편 (하루 이내)", value: 1 },
      { label: "👻 거의 안 읽다시피 해요", value: 0 },
      { label: "😤 읽씹 전문", value: -2 },
    ],
  },
  {
    id: "last_meet",
    botMessage: "마지막으로 직접 만난 게 언제예요?",
    type: "select",
    options: [
      { label: "📅 이번 달", value: 4 },
      { label: "🗓️ 3개월 이내", value: 3 },
      { label: "📆 6개월 이내", value: 2 },
      { label: "🕰️ 1년 이내", value: 1 },
      { label: "⏳ 1년 넘었어요", value: 0 },
    ],
  },
  // ✅ 신규: 청첩장 수신 경로
  {
    id: "invite_route",
    botMessage: "청첩장은 어떻게 받으셨어요?",
    type: "select",
    options: [
      { label: "🤝 직접 손에서 손으로", value: 4 },
      { label: "💌 카톡으로 개인적으로", value: 2 },
      { label: "📢 단체방에서", value: -1 },
      { label: "📸 SNS / 스토리에서", value: -2 },
    ],
  },
  // ✅ 신규: 개인 연락 여부
  {
    id: "personal_contact",
    botMessage: "이 분과 단둘이 연락한 적 있나요?\n(그룹채팅 말고요)",
    type: "select",
    options: [
      { label: "📱 자주 개인 연락해요", value: 4 },
      { label: "💬 가끔 개인 연락해요", value: 2 },
      { label: "👥 그룹 채팅에서만 봐요", value: 0 },
    ],
  },
  {
    id: "venue",
    botMessage: "예식장이 어디예요?\n직접 검색해보세요 🔍\n(아직 모르면 아래 '몰라요' 버튼을 눌러주세요)",
    type: "venue_search",
  },
  // venue 스킵 시에만 노출 (스킵 안 하면 handleAnswer에서 건너뜀)
  {
    id: "region_fallback",
    botMessage: "예식장 지역이 어디예요?\n지역별 평균 식대를 반영할게요 🗺️",
    type: "select",
    options: [
      { label: "🏙️ 서울 강남/서초/송파", value: 0, avgMeal: 130000 },
      { label: "🌆 서울 기타", value: 0, avgMeal: 90000 },
      { label: "🏢 수도권 (경기/인천)", value: 0, avgMeal: 70000 },
      { label: "🌇 지방 광역시", value: 0, avgMeal: 60000 },
      { label: "🏡 그 외 지방", value: 0, avgMeal: 50000 },
    ],
  },
  {
    id: "eat_at_venue",
    botMessage: "식장 가서 밥은 드실 건가요?\n식대가 곧 축의금 원가예요 😄",
    type: "select",
    options: [
      { label: "🍱 당연히 먹죠!", value: 5 },
      { label: "🤔 아마도요", value: 2 },
      { label: "🏃 안 먹을 것 같아요", value: -1 },
      { label: "😢 참석 자체를 못 해요", value: -2 },
    ],
  },
  {
    id: "distance",
    botMessage: "식장까지 이동이 얼마나 걸려요?",
    type: "distance_select",
    options: [
      { label: "🚶 걸어서 or 30분 이내", value: 0 },
      { label: "🚇 대중교통 1시간 이내", value: -1 },
      { label: "🚗 차로 1시간 넘게", value: -2 },
      { label: "🛣️ 당일치기도 빠듯해요", value: -4 },
    ],
  },
  // ✅ 신규: 공통 친구
  {
    id: "common_friends",
    botMessage: "이 분과 공통 친구가 몇 명이나 있어요?",
    type: "select",
    options: [
      { label: "👨‍👩‍👧 여러 명 있어요", value: 3 },
      { label: "👥 1~2명 있어요", value: 1 },
      { label: "👤 나만 아는 사이예요", value: 0 },
    ],
  },
  {
    id: "extra",
    botMessage: "마지막으로! 특이사항이 있나요?\n여러 개 골라도 돼요 😄",
    type: "multi_select",
    options: [
      { label: "🥲 연락 끊겼다 청첩장 받음", value: -5 },
      { label: "💸 빌린 돈 안 갚음", value: -5 },
      { label: "😢 힘들 때 곁에 있어준 사람", value: 5 },
      { label: "🚑 아플 때 연락해준 사람", value: 4 },
      { label: "🤝 취업/이직 도와줬어요", value: 4 },
      { label: "🍺 술자리 페이 항상 본인이", value: 3 },
      { label: "🎁 내 행사 때 선물도 줬어요", value: 3 },
      { label: "🎂 내 생일 꼭 챙겨줘요", value: 2 },
      { label: "🙄 연락은 필요할 때만", value: -3 },
      { label: "✨ 없어요", value: 0 },
    ],
  },
];

// ─── 예식장 최근 검색 유틸 ───────────────────────────────────────────────────
// ─── Supabase 싱글톤 ──────────────────────────────────────────────────────────
let _supabase = null;
async function getSupabase() {
  if (_supabase) return _supabase;
  const { createClient } = await import('@supabase/supabase-js');
  _supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  return _supabase;
}


function loadRecentVenues() {
  try { return JSON.parse(localStorage.getItem("wf_recent_venues") || "[]"); } catch { return []; }
}
function saveRecentVenue(place) {
  try {
    const prev = loadRecentVenues().filter(p => p.place_name !== place.place_name);
    localStorage.setItem("wf_recent_venues", JSON.stringify([place, ...prev].slice(0, 5)));
  } catch {}
}

function formatAmount(n) {
  if (n >= 10000) return `${n / 10000}만원`;
  return `${n?.toLocaleString()}원`;
}

// ─── 히스토리 유틸 ────────────────────────────────────────────────────────────
function loadHistory() {
  try { return JSON.parse(localStorage.getItem("wf_history") || "[]"); } catch { return []; }
}
function saveHistory(entry) {
  try {
    const prev = loadHistory();
    const updated = [entry, ...prev].slice(0, 20); // 최대 20개
    localStorage.setItem("wf_history", JSON.stringify(updated));
  } catch {}
}

function HistoryPanel({ onClose }) {
  const history = loadHistory();
  if (history.length === 0) return null;

  // 통계 계산
  const avg = Math.round(history.reduce((s, h) => s + h.amount, 0) / history.length / 10000) * 10000;
  const max = Math.max(...history.map(h => h.amount));
  const min = Math.min(...history.map(h => h.amount));
  const mostRelation = (() => {
    const cnt = {};
    history.forEach(h => { cnt[h.relation] = (cnt[h.relation] || 0) + 1; });
    return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0];
  })();

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", borderRadius: "24px 24px 0 0",
        padding: "24px 20px 40px", width: "100%", maxWidth: 480,
        fontFamily: "'Pretendard', -apple-system, sans-serif",
        maxHeight: "75vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>📋 내 축의금 패턴</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999" }}>✕</button>
        </div>

        {/* 통계 카드 — 3개 이상일 때만 */}
        {history.length >= 3 && (
          <div style={{
            background: "linear-gradient(135deg, #FFF5F5, #FFF0F0)",
            border: "1.5px solid #FFD0D0", borderRadius: 16,
            padding: "16px", marginBottom: 16
          }}>
            <div style={{ fontSize: 11, color: "#FF6B6B", fontWeight: 700, marginBottom: 10 }}>
              📊 {history.length}번 계산 기준 내 패턴
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {[
                { label: "평균", value: formatAmount(avg) },
                { label: "최고", value: formatAmount(max) },
                { label: "최저", value: formatAmount(min) },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: 1, background: "#fff", borderRadius: 10,
                  padding: "10px 8px", textAlign: "center"
                }}>
                  <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#FF6B6B" }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#888", textAlign: "center" }}>
              나는 주로 <strong style={{ color: "#333" }}>{mostRelation}</strong>에게 가장 많이 냈어요
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {history.map((h, i) => (
            <div key={i} style={{
              background: "#f8f8f8", borderRadius: 14, padding: "14px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>
                  {h.relation} · {h.venue || "예식장 미입력"}
                </div>
                <div style={{ fontSize: 11, color: "#999" }}>{h.date}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#FF6B6B" }}>
                {formatAmount(h.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 알고리즘 상수 ────────────────────────────────────────────────────────────
// ─── 알고리즘 상수 ────────────────────────────────────────────────────────────
const BASE_ID = "relation";
const CORRECTION_IDS = ["venue", "distance", "eat_at_venue", "region_fallback"];
const INTIMACY_IDS_EXCLUDE = [BASE_ID, ...CORRECTION_IDS];

function calcMaxIntimacy() {
  return CHAT_FLOW.reduce((total, q) => {
    if (INTIMACY_IDS_EXCLUDE.includes(q.id)) return total;
    const maxVal = Math.max(...q.options.map(o => o.value));
    return total + (maxVal > 0 ? maxVal : 0);
  }, 0);
}
const MAX_INTIMACY = calcMaxIntimacy();

const MAX_BASE = Math.max(...CHAT_FLOW.find(q => q.id === BASE_ID).options.map(o => o.value));
const MAX_RAW_SCORE = MAX_BASE + MAX_BASE * 1.0; // → 40

function calcResult(answers) {
  const breakdown = [];

  // ① 베이스: 관계 유형
  const baseAnswer = answers[BASE_ID];
  const baseScore = baseAnswer?.value || 0;
  if (baseScore !== 0) {
    breakdown.push({ label: baseAnswer.label, score: baseScore });
  }

  // ② 친밀도 합산
  let intimacySum = 0;
  CHAT_FLOW.forEach((q) => {
    if (INTIMACY_IDS_EXCLUDE.includes(q.id)) return;
    const ans = answers[q.id];
    if (!ans) return;

    if (q.type === "multi_select") {
      const items = Array.isArray(ans) ? ans : [ans];
      const score = items.reduce((s, v) => s + (typeof v === "object" ? v.value : v), 0);
      if (score !== 0) {
        breakdown.push({ label: items.map(v => v.label).join(", "), score });
      }
      intimacySum += score;
    } else {
      const score = ans.value || 0;
      if (score !== 0) {
        breakdown.push({ label: ans.label, score });
      }
      intimacySum += score;
    }
  });

  // ③ 보정: 거리
  const distanceScore = answers.distance?.value || 0;
  if (distanceScore !== 0) {
    breakdown.push({ label: answers.distance?.label, score: distanceScore });
  }

  // ④ 최종 점수: 베이스 + 베이스 × 친밀도계수 + 거리보정
  //    친밀도계수 = intimacySum / MAX_INTIMACY  (음수 허용, floor -1.0)
  const intimacyCoeff = MAX_INTIMACY > 0
    ? Math.max(intimacySum / MAX_INTIMACY, -1)
    : 0;
  const rawScore = baseScore + baseScore * intimacyCoeff;
  const finalScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(Math.min((rawScore / MAX_RAW_SCORE) * 100, 100) + distanceScore)
    )
  );
  // 거리 페널티는 정규화 후 별도 적용 (100점 초과 방지)

  // ⑤ 식대 최솟값 보정
  const venue = answers.venue;
  const eating = answers.eat_at_venue;
  const regionAvgMeal = answers.region_fallback?.avgMeal || null;
  const avgMeal = venue?.avgMeal || regionAvgMeal || null;
  const isEating = (eating?.value ?? -99) >= 2;
  const mealFloor = isEating && avgMeal ? avgMeal : 0;

  const baseTier = RESULT_TIERS.find(t =>
    finalScore >= t.min && finalScore <= t.max
  ) || RESULT_TIERS[RESULT_TIERS.length - 1];

  const extraItems = Array.isArray(answers.extra) ? answers.extra : (answers.extra ? [answers.extra] : []);
  const isGhosted = extraItems.some(e => e.label?.includes("연락 끊겼다"));

  // isGhosted면 식대 업그레이드 무시하고 baseTier 사용
  const finalTier = isGhosted
    ? baseTier
    : (mealFloor > 0 && baseTier.amount < mealFloor)
      ? (RESULT_TIERS.find(t => t.amount >= mealFloor) || RESULT_TIERS[RESULT_TIERS.length - 1])
      : baseTier;

  const randomMessage = finalTier.messages[Math.floor(Math.random() * finalTier.messages.length)];

  return {
    total: finalScore,
    breakdown,
    mealFloor,
    venue,
    tier: {
      ...finalTier,
      message: isGhosted
        ? "연락 끊겼다 청첩장 받은 거, 다들 겪어요. 5만원도 충분한 예의예요. 사실 안 가도 돼요."
        : randomMessage,
    },
    upgradedByMeal: !isGhosted && finalTier !== baseTier,
    relationLabel: answers[BASE_ID]?.label || null,
    isGhosted,
  };
}

async function fetchSimilarStats(amount) {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from('calculations')
      .select('amount')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 최근 30일

    if (!data || data.length < 5) return null; // 데이터 부족시 표시 안 함

    const total = data.length;
    const sameCount = data.filter(d => d.amount === amount).length;
    const percent = Math.round((sameCount / total) * 100);

    // 금액 분포
    const dist = {};
    data.forEach(d => { dist[d.amount] = (dist[d.amount] || 0) + 1; });
    const mostCommon = Object.entries(dist).sort((a, b) => b[1] - a[1])[0];

    return { total, sameCount, percent, mostCommonAmount: Number(mostCommon[0]) };
  } catch {
    return null;
  }
}

const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY;

// ─── 컴포넌트들 ──────────────────────────────────────────────────────────────

function MonthlyTop3Card() {
  const [topAmounts, setTopAmounts] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = await getSupabase();

        const { data } = await supabase
          .from("calculations")
          .select("amount")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (!data || data.length < 3) return;

        const counts = {};
        data.forEach(d => {
          counts[d.amount] = (counts[d.amount] || 0) + 1;
        });

        const top3 = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([amount, count], i) => ({
            rank: i + 1,
            amount: Number(amount),
            count,
          }));

        setTopAmounts(top3);
      } catch {
        setTopAmounts(null);
      }
    };

    load();
  }, []);

  if (!topAmounts) return null;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      padding: 16,
      margin: "18px 0",
      boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#111", marginBottom: 12 }}>
        🏆 이번 달 가장 많이 나온 축의금 TOP3
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {topAmounts.map(item => (
          <div key={item.rank} style={{
            flex: 1,
            background: item.rank === 1 ? "#FFF7ED" : "#F8F8F8",
            border: item.rank === 1 ? "1.5px solid #FED7AA" : "1px solid #eee",
            borderRadius: 14,
            padding: "12px 8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>
              {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : "🥉"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#111" }}>
              {formatAmount(item.amount)}
            </div>
            <div style={{ fontSize: 10, color: "#999" }}>
              {item.count}명 선택
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RelationAvgStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = await getSupabase();
        const { data } = await supabase
          .from("calculations")
          .select("relation_label, amount")
          .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
          .not("relation_label", "is", null);

        if (!data || data.length < 10) return;

        const grouped = {};
        data.forEach(d => {
          if (!d.relation_label) return;
          if (!grouped[d.relation_label]) grouped[d.relation_label] = [];
          grouped[d.relation_label].push(d.amount);
        });

        const result = Object.entries(grouped)
          .filter(([, arr]) => arr.length >= 3)
          .map(([label, arr]) => ({
            label,
            avg: Math.round(arr.reduce((s, v) => s + v, 0) / arr.length / 10000) * 10000,
            count: arr.length,
          }))
          .sort((a, b) => b.avg - a.avg)
          .slice(0, 4);

        if (result.length >= 2) setStats(result);
      } catch { setStats(null); }
    };
    load();
  }, []);

  if (!stats) return null;

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "14px 16px",
      margin: "0 0 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)"
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#bbb", letterSpacing: 0.5, marginBottom: 10 }}>
        📊 관계별 평균 축의금 (최근 90일)
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#f8f8f8", borderRadius: 100,
            padding: "5px 12px", fontSize: 12
          }}>
            <span style={{ color: "#888" }}>{s.label.split(" ").slice(1).join(" ") || s.label}</span>
            <span style={{ fontWeight: 800, color: "#FF6B6B" }}>{formatAmount(s.avg)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VenueCountBadge() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = await getSupabase();
        const { count: c } = await supabase
          .from("venues")
          .select("*", { count: "exact", head: true });
        setCount(c);
      } catch { setCount(null); }
    };
    load();
  }, []);

  if (!count) return null;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "#F0FDF4", border: "1px solid #BBF7D0",
      borderRadius: 100, padding: "5px 12px",
      fontSize: 12, fontWeight: 700, color: "#15803D",
      marginBottom: 16, animation: "fadeSlideIn 0.4s ease"
    }}>
      <span>🏛️</span>
      <span>현재 <strong>{count.toLocaleString()}개</strong> 예식장 DB 등록됨</span>
    </div>
  );
}

function SeasonBanner() {
  const [growth, setGrowth] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = await getSupabase();
        const now = Date.now();
        const [{ count: thisMonth }, { count: lastMonth }] = await Promise.all([
          supabase.from("calculations").select("*", { count: "exact", head: true })
            .gte("created_at", new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from("calculations").select("*", { count: "exact", head: true })
            .gte("created_at", new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString())
            .lt("created_at", new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()),
        ]);
        if (thisMonth && lastMonth && lastMonth > 0) {
          const pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
          if (pct >= 20) setGrowth(pct); // 20% 이상 증가 시만 표시
        }
      } catch {}
    };
    load();
  }, []);

  if (!growth) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #FFF5F5, #FFF0EC)",
      border: "1.5px solid #FFD0B0", borderRadius: 12,
      padding: "10px 14px", marginBottom: 12,
      display: "flex", alignItems: "center", gap: 8,
      animation: "fadeSlideIn 0.4s ease"
    }}>
      <span style={{ fontSize: 18 }}>🔥</span>
      <div style={{ fontSize: 12, color: "#C2410C", fontWeight: 700 }}>
        이번 달 계산 급증 중! 전월 대비 +{growth}%
        <span style={{ fontWeight: 400, color: "#999", marginLeft: 4 }}>결혼 성수기예요</span>
      </div>
    </div>
  );
}

function ControversyBubbles() {
  const bubbles = [
    "💬 직장 상사 결혼식, 5만원 내면 욕 먹을까?",
    "💬 부장님 자녀 결혼식, 안 가고 5만원 가능?",
    "💬 전남친 결혼식인데 축의금 해야 할까?",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "18px 0" }}>
      {bubbles.map((text, i) => (
        <div key={text} style={{
          alignSelf: i % 2 === 0 ? "flex-start" : "flex-end",
          maxWidth: "88%",
          background: i % 2 === 0 ? "#fff" : "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          color: i % 2 === 0 ? "#333" : "#fff",
          borderRadius: i % 2 === 0 ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
          padding: "11px 14px",
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.45,
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
          animation: `fadeSlideIn 0.35s ease ${i * 0.15}s both`
        }}>
          {text}
        </div>
      ))}

      <div style={{ fontSize: 12, color: "#999", textAlign: "center", marginTop: 4 }}>
        다들 한 번쯤 고민하는 그 질문들
      </div>
    </div>
  );
}

// ─── 진행 요약 칩 ─────────────────────────────────────────────────────────────
function AnswerSummaryChips({ answers }) {
  const chips = [];
  const add = (id, emoji) => {
    const ans = answers[id];
    if (!ans) return;
    const text = Array.isArray(ans)
      ? ans.map(a => a.label).join(", ")
      : ans.label || ans.name || "";
    if (text) chips.push({ emoji, text });
  };

  add("relation",          "👤");
  add("meal_count",        "🍽️");
  add("my_wedding",        "💍");
  add("kakao_speed",       "💬");
  add("last_meet",         "📅");
  add("invite_route",      "💌");
  add("personal_contact",  "📱");
  if (answers.venue && !answers.venue.skipped) chips.push({ emoji: "💒", text: answers.venue.name });
  add("eat_at_venue",      "🥢");
  add("distance",          "📍");
  add("common_friends",    "👥");
  add("extra",             "✨");
  if (chips.length === 0) return null;

  return (
    <div style={{
      padding: "8px 16px",
      display: "flex", gap: 6, flexWrap: "wrap",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)",
      position: "sticky", top: 57, zIndex: 9
    }}>
      {chips.map((c, i) => (
        <div key={i} style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "var(--surface2)", borderRadius: 100,
          padding: "4px 10px", fontSize: 11, fontWeight: 600,
          color: "var(--text2)", animation: `staggerIn 0.3s ease ${i * 0.05}s both`
        }}>
          <span>{c.emoji}</span>
          <span>{c.text}</span>
        </div>
      ))}
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "14px 16px", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#ddd",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
    </div>
  );
}

function BotMessage({ text, isNew }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16, animation: isNew ? "fadeSlideIn 0.3s ease" : "none" }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, boxShadow: "0 2px 8px rgba(255,107,107,0.3)"
      }}>💒</div>
      <div style={{
        background: "#fff", borderRadius: "4px 18px 18px 18px",
        padding: "12px 16px", maxWidth: "75%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        fontSize: 14, lineHeight: 1.6, color: "#222",
        whiteSpace: "pre-line", textAlign: "left"
      }}>
        {text}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, animation: "fadeSlideIn 0.2s ease" }}>
      <div style={{
        background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
        color: "#fff", borderRadius: "18px 4px 18px 18px",
        padding: "12px 16px", maxWidth: "75%",
        fontSize: 14, lineHeight: 1.6, textAlign: "left",
        boxShadow: "0 2px 8px rgba(255,107,107,0.25)"
      }}>
        {text}
      </div>
    </div>
  );
}
function DistanceSelect({ options, onSelect, selected, onReselect, venuePlace }) {
  const [loading, setLoading] = useState(false);
  const [showPermissionHint, setShowPermissionHint] = useState(false);

  const handleAuto = async () => {
    setLoading(true);
    setShowPermissionHint(true); // 권한 요청 전 안내 표시
    const userLoc = await getUserLocation();
    setShowPermissionHint(false);

    if (!userLoc) {
      setLoading(false);
      return;
    }
    const km = await getDistanceKm(userLoc.x, userLoc.y, venuePlace?.x, venuePlace?.y);
    if (!km) {
      setLoading(false);
      return;
    }
    const matched =
      km < 10 ? options[0] :
      km < 20 ? options[1] :
      km < 80 ? options[2] : options[3];

    const result = { ...matched, label: `${matched.label.split(' ')[0]} ${km}km (자동계산)` };
    setLoading(false);
    onSelect(result);
  };

  // 선택 완료 상태
  if (selected) {
    return (
      <div style={{ padding: "4px 0 16px 46px", animation: "fadeSlideIn 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            flex: 1, padding: "11px 16px", borderRadius: 12,
            border: "2px solid #FF6B6B", background: "#FFF5F5",
            fontSize: 14, fontWeight: 700, color: "#FF6B6B"
          }}>
            {selected.label}
          </div>
          <button onClick={onReselect} style={{
            padding: "9px 12px", borderRadius: 10, border: "1px solid #f0f0f0",
            background: "#fff", color: "#999", cursor: "pointer",
            fontSize: 12, fontFamily: "inherit", whiteSpace: "nowrap"
          }}>
            ✏️ 다시
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0 16px 46px", animation: "fadeSlideIn 0.3s ease" }}>
      {options.map((opt) => (
        <button key={opt.label} onClick={() => onSelect(opt)} style={{
          padding: "14px 16px", borderRadius: 12, textAlign: "left", minHeight: 44,
          border: "2px solid #f0f0f0", background: "#fff", color: "#333",
          cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "inherit"
        }}>
          {opt.label}
        </button>
      ))}

      {/* 위치 권한 안내 */}
      {showPermissionHint && (
        <div style={{
          padding: "10px 14px", borderRadius: 10,
          background: "#FFF8E1", border: "1px solid #FDE68A",
          fontSize: 12, color: "#B45309", textAlign: "center"
        }}>
          📍 브라우저에서 위치 권한을 허용해주세요
        </div>
      )}

      {/* 자동계산 버튼 */}
      <button onClick={handleAuto} disabled={loading} style={{
        padding: "14px 16px", borderRadius: 12, textAlign: "center", minHeight: 44,
        border: "2px dashed #FF6B6B", background: loading ? "#FFF5F5" : "#fff",
        color: "#FF6B6B", cursor: loading ? "default" : "pointer",
        fontSize: 14, fontWeight: 700, fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6
      }}>
        {loading
          ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> 위치 확인 중...</>
          : "📍 현재 위치로 자동 계산하기"
        }
      </button>
      <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", margin: "0 0 4px" }}>
        위치 권한 허용이 필요해요 · 주소는 저장되지 않아요 🔒
      </p>
    </div>
  );
}

function SelectOptions({ options, onSelect, selected, onReselect }) {
  const [isReselecting, setIsReselecting] = useState(false);

  const handleSelect = (opt) => {
    if (selected && !isReselecting) return;
    setIsReselecting(false);
    onSelect(opt);
  };

  const handleReselect = () => {
    setIsReselecting(true);
    if (onReselect) onReselect(); // App에 "이후 메시지 지워줘" 신호
  };

  const showOptions = !selected || isReselecting;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0 16px 46px", animation: "fadeSlideIn 0.3s ease" }}>
      {showOptions ? (
        options.map((opt) => (
          <button key={opt.label} onClick={() => handleSelect(opt)} style={{
            padding: "14px 16px", borderRadius: 12, textAlign: "left", minHeight: 44,
            border: selected?.label === opt.label && !isReselecting ? "2px solid #FF6B6B" : "2px solid #f0f0f0",
            background: selected?.label === opt.label && !isReselecting ? "#FFF5F5" : "#fff",
            color: selected?.label === opt.label && !isReselecting ? "#FF6B6B" : "#333",
            cursor: "pointer", fontSize: 14, fontWeight: selected?.label === opt.label && !isReselecting ? 700 : 500,
            fontFamily: "inherit", transition: "all 0.15s",
          }}>
            {opt.label}
          </button>
        ))
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            flex: 1, padding: "11px 16px", borderRadius: 12,
            border: "2px solid #FF6B6B", background: "#FFF5F5",
            fontSize: 14, fontWeight: 700, color: "#FF6B6B"
          }}>
            {selected.label}
          </div>
          <button onClick={handleReselect} style={{
            padding: "9px 12px", borderRadius: 10, border: "1px solid #f0f0f0",
            background: "#fff", color: "#999", cursor: "pointer",
            fontSize: 12, fontFamily: "inherit", whiteSpace: "nowrap"
          }}>
            ✏️ 다시
          </button>
        </div>
      )}
    </div>
  );
}

function MultiSelectOptions({ options, onConfirm }) {
  const [selected, setSelected] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const toggle = (opt) => {
    if (confirmed) return;
    if (opt.value === 0) { setSelected([opt]); return; }
    const filtered = selected.filter(s => s.value !== 0);
    const exists = filtered.find(s => s.label === opt.label);
    setSelected(exists ? filtered.filter(s => s.label !== opt.label) : [...filtered, opt]);
  };

  const confirm = () => {
    if (selected.length === 0) return;
    setConfirmed(true);
    onConfirm(selected);
  };

  return (
    <div style={{ padding: "4px 0 16px 46px", animation: "fadeSlideIn 0.3s ease" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {options.map((opt) => {
          const isSelected = selected.find(s => s.label === opt.label);
          return (
            <button key={opt.label} onClick={() => toggle(opt)} style={{
              padding: "14px 16px", borderRadius: 12, textAlign: "left", minHeight: 44,
              border: isSelected ? "2px solid #FF6B6B" : "2px solid #f0f0f0",
              background: isSelected ? "#FFF5F5" : "#fff",
              color: isSelected ? "#FF6B6B" : "#333",
              cursor: confirmed ? "default" : "pointer",
              fontSize: 14, fontWeight: isSelected ? 700 : 500,
              fontFamily: "inherit", transition: "all 0.15s",
              opacity: confirmed && !isSelected ? 0.4 : 1,
            }}>
              {opt.label}
            </button>
          );
        })}
      </div>
      {!confirmed && (
        <button onClick={confirm} disabled={selected.length === 0} style={{
          width: "100%", padding: "13px", borderRadius: 12, border: "none",
          background: selected.length > 0 ? "linear-gradient(135deg, #FF6B6B, #FF8E53)" : "#f0f0f0",
          color: selected.length > 0 ? "#fff" : "#ccc",
          cursor: selected.length > 0 ? "pointer" : "default",
          fontSize: 14, fontWeight: 700, fontFamily: "inherit",
        }}>
          선택 완료 ({selected.length}개)
        </button>
      )}
    </div>
  );
}

// ─── 카카오 장소 검색 ─────────────────────────────────────────────────────────
// ─── 카카오 Directions API로 거리 계산 ────────────────────────────────────────
async function getDistanceKm(originX, originY, destX, destY) {
  try {
    const res = await fetch(
      `https://apis-navi.kakaomobility.com/v1/directions?origin=${originX},${originY}&destination=${destX},${destY}&summary=true`,
      { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
    );
    const data = await res.json();
    const meters = data.routes?.[0]?.summary?.distance;
    return meters ? Math.round(meters / 100) / 10 : null; // km 소수점 1자리
  } catch {
    return null;
  }
}

async function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ x: pos.coords.longitude, y: pos.coords.latitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}

// ─── 카카오 장소 검색 ─────────────────────────────────────────────────────────
async function searchKakaoPlace(query) {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=15`,
      { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
    );
    const data = await res.json();
    return data.documents || [];
  } catch {
    return [];
  }
}

// ─── Supabase DB 식대 조회 ───────────────────────────────────────────────────
async function searchMealCostFromDB(name) {
  try {
    const supabase = await getSupabase();
    // 1차: venues 직접 검색
    // 검색어에서 핵심 키워드 추출 (앞 2~4글자로 재검색)
    const keyword = name.replace(/^(서울|부산|대구|인천|광주|대전|제주)/, "").trim().slice(0, 6);

    const { data: directData } = await supabase
      .from('venues')
      .select('name, meal_cost, grade, naver_map_url, tmap_url')
      .or(`name.ilike.%${name}%,name.ilike.%${keyword}%`)
      .limit(5);
    // 2차: aliases 테이블에서 검색 → venue_id로 venues 조인
    const { data: aliasData } = await supabase
      .from('venue_aliases')
      .select('venues(name, meal_cost, grade, naver_map_url, tmap_url)')
      .or(`alias.ilike.%${name}%,alias.ilike.%${keyword}%`)
      .limit(5);

    const aliasVenues = (aliasData || []).map(a => a.venues).filter(Boolean);

    // 중복 제거 후 합치기
    const allData = [...(directData || []), ...aliasVenues]
      .filter((v, i, arr) => arr.findIndex(x => x.name === v.name) === i);

    const data = allData.length > 0 ? allData : null;
    return data?.length > 0 ? data : null;
  } catch {
    return null;
  }
}

// ─── Claude API 식대 추정 ────────────────────────────────────────────────────
async function fetchMealCostFromAI(venueName, address) {
  try {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `한국 예식장 "${venueName}" (${address || ''})의 웨딩 1인 식대를 검색해서 아래 JSON만 반환하세요 (다른 텍스트 없이):
{"meal_cost_min": 숫자, "meal_cost_max": 숫자, "grade": 1~5숫자, "confidence": "high/medium/low"}
모르면 null만 반환하세요.`
        }]
      })
    });
    if (!res.ok) {
      console.warn(`Claude API ${res.status} — AI 식대 추정 스킵`);
      return null;
    }
    const data = await res.json();
    const text = data.content?.filter(c => c.type === "text").map(c => c.text).join("") || "";
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);

      if (!parsed || typeof parsed !== "object") return null;

      return {
        meal_cost_min: Number(parsed.meal_cost_min) || null,
        meal_cost_max: Number(parsed.meal_cost_max) || null,
        grade: Number(parsed.grade) || 3,
        confidence: parsed.confidence || "low",
      };
    } catch (e) {
      console.error("Claude JSON 파싱 실패:", cleaned);
      return null;
    }
  } catch {
    return null; // 로컬에서는 CORS로 막힘, 배포 후 정상 작동
  }
}

const GRADE_MAP = { 5: "5성급 호텔", 4: "4성급 / 고급 웨딩홀", 3: "일반 웨딩홀", 2: "일반 예식장", 1: "스몰웨딩" };
const GRADE_SCORE = { 5: 10, 4: 7, 3: 5, 2: 3, 1: 2 };

function VenueSearch({ onSelect, onReport, onReselect }) {
  const [query, setQuery] = useState("");
  const [step, setStep] = useState("input");
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mealInfo, setMealInfo] = useState(null);
  const [mealLoading, setMealLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // 자동완성 목록
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoDistanceResult, setAutoDistanceResult] = useState(null);
  const [recentVenues] = useState(() => loadRecentVenues());
  const [venueAvgAmount, setVenueAvgAmount] = useState(null);

  const handleSkip = () => {
    setConfirmed(true);
    onSelect({
      name: "모름",
      label: "아직 몰라요🤷",
      avgMeal: null,
      kakaoPlace: null,
      autoDistance: null,
      skipped: true,
    });
  };

  const searchPlace = async () => {
    if (!query.trim()) return;
    setStep("searching");
    const results = await searchKakaoPlace(query);
    setPlaces(results);
    setStep(results.length > 0 ? "place" : "manual");
  };

  const selectPlace = async (place) => {
  saveRecentVenue(place);
  setSelectedPlace(place);
  setStep("meal");
  setMealLoading(true);

  // 거리 자동계산 시도
  const userLoc = await getUserLocation();
  if (userLoc && place.x && place.y) {
    const km = await getDistanceKm(userLoc.x, userLoc.y, place.x, place.y);
    if (km !== null) {
      // km → distance value 자동 매핑
      const autoDistance =
        km < 10  ? { label: `🚶 ${km}km (자동계산)`, value: 0 } :
        km < 20  ? { label: `🚌 ${km}km (자동계산)`, value: -1 } :
        km < 50  ? { label: `🚗 ${km}km (자동계산)`, value: -2 } :
                   { label: `✈️ ${km}km (자동계산)`, value: -4 };
      setAutoDistanceResult(autoDistance);
    }
  }
    // 이 예식장 평균 축의금 조회
    try {
      const supabase = await getSupabase();
      const { data: venueCalcs } = await supabase
        .from('calculations')
        .select('amount')
        .ilike('venue_name', `%${place.place_name}%`)
        .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());
      if (venueCalcs && venueCalcs.length >= 3) {
        const venueAvg = Math.round(
          venueCalcs.reduce((s, c) => s + c.amount, 0) / venueCalcs.length / 10000
        ) * 10000;
        setVenueAvgAmount({ avg: venueAvg, count: venueCalcs.length });
      }
    } catch {}

    const dbData = await searchMealCostFromDB(place.place_name);
    if (dbData && Array.isArray(dbData)) {
    // 평균 식대 계산 (만 원 단위 반올림)
    const costs = dbData.map(d => d.meal_cost).filter(Boolean);
    const avg = costs.length
      ? Math.round(costs.reduce((s, c) => s + c, 0) / costs.length / 10000) * 10000
      : null;
    setMealInfo({
      source: "db",
      meal_cost: avg,
      grade: dbData[0]?.grade,
      naver_map_url: dbData[0]?.naver_map_url,
      tmap_url: dbData[0]?.tmap_url,
      count: costs.length,
    });
      setMealLoading(false);
      return;
    }
    const aiData = await fetchMealCostFromAI(place.place_name, place.address_name);
    setMealInfo(aiData ? { ...aiData, source: "ai" } : { source: "none" });
    setMealLoading(false);
  };

  // grade별 기본 avgMeal (DB/AI 데이터 없을 때 폴백)
  const GRADE_DEFAULT_MEAL = { 5: 150000, 4: 120000, 3: 80000, 2: 50000, 1: 0 };

  const confirm = (manualGrade) => {
    setConfirmed(true);
    const grade = manualGrade || mealInfo?.grade || 3;
    const avgMealFromInfo = mealInfo?.meal_cost
      ? mealInfo.meal_cost
      : mealInfo?.meal_cost_min && mealInfo?.meal_cost_max
        ? Math.round((mealInfo.meal_cost_min + mealInfo.meal_cost_max) / 2)
        : null;
    // DB/AI 데이터 없으면 grade 기반 기본값으로 폴백
    const avgMeal = avgMealFromInfo || GRADE_DEFAULT_MEAL[grade] || null;
    onSelect({
      name: selectedPlace?.place_name || query,
      address: selectedPlace?.address_name || "",
      score: GRADE_SCORE[grade] || 4,
      label: GRADE_MAP[grade] || "웨딩홀",
      avgMeal,
      kakaoUrl: selectedPlace?.place_url,
      naverMapUrl: mealInfo?.naver_map_url,
      tmapUrl: mealInfo?.tmap_url,
      kakaoPlace: selectedPlace,
      autoDistance: autoDistanceResult,
    });
  };

  if (confirmed) {
    const venueName = selectedPlace?.place_name || query || "아직 몰라요 🤷";
    return (
      <div style={{ padding: "4px 0 16px 46px", animation: "fadeSlideIn 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            flex: 1, padding: "11px 16px", borderRadius: 12,
            border: "2px solid #FF6B6B", background: "#FFF5F5",
            fontSize: 14, fontWeight: 700, color: "#FF6B6B"
          }}>
            💒 {venueName}
          </div>
          {onReselect && (
            <button onClick={onReselect} style={{
              padding: "9px 12px", borderRadius: 10, border: "1px solid #f0f0f0",
              background: "#fff", color: "#999", cursor: "pointer",
              fontSize: 12, fontFamily: "inherit", whiteSpace: "nowrap"
            }}>
              ✏️ 다시
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "4px 0 16px 46px", animation: "fadeSlideIn 0.3s ease" }}>
      {(step === "input" || step === "searching") && (
  <div style={{ position: "relative", marginBottom: 12 }}>
   <div style={{
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 68px",
    gap: 8,
    width: "100%",
    boxSizing: "border-box"
  }}>
    <input
      type="text" value={query}
      onChange={async (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
        const results = await searchKakaoPlace(val);
        setSuggestions(results.slice(0, 10));
        setShowSuggestions(true);
      }}
      onKeyDown={e => e.key === "Enter" && searchPlace()}
      onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300)}
      placeholder="예) 신라호텔, 롯데호텔..."
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        padding: "12px 14px",
        borderRadius: 12,
        border: "2px solid #f0f0f0",
        fontSize: 16,
        fontFamily: "inherit",
        outline: "none",
        background: "#fff"
      }}
    />
    <button onClick={searchPlace} disabled={step === "searching"} style={{
      width: "68px",
      minWidth: 0,
      padding: "12px 0",
      borderRadius: 12,
      border: "none",
      background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
      color: "#fff",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 700,
      fontFamily: "inherit",
      whiteSpace: "nowrap"
    }}>
      {step === "searching" ? "🔍" : "검색"}
    </button>
  </div>

    {!showSuggestions && recentVenues.length > 0 && (
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 11, color: "#bbb", marginBottom: 6, fontWeight: 600 }}>🕐 최근 검색</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {recentVenues.map((p, i) => (
            <button key={i} onClick={() => { setQuery(p.place_name); selectPlace(p); }} style={{
              padding: "10px 14px", borderRadius: 10, border: "1.5px solid #f0f0f0",
              background: "#fafafa", cursor: "pointer", textAlign: "left",
              fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{p.place_name}</span>
              <span style={{ fontSize: 11, color: "#aaa" }}>{p.address_name?.split(" ").slice(0, 2).join(" ")}</span>
            </button>
          ))}
        </div>
      </div>
    )}

    {showSuggestions && suggestions.length > 0 && (
      <div style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        width: "100%",
        boxSizing: "border-box",
        background: "#fff",
        borderRadius: 12,
        border: "1.5px solid #f0f0f0",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        overflow: "hidden",
        zIndex: 100,
        marginTop: 6
      }}>
        {suggestions.map((p, i) => (
          <button key={i} onClick={() => {
            setQuery(p.place_name);
            setShowSuggestions(false);
            selectPlace(p);
          }} style={{
            width: "100%", padding: "12px 14px", border: "none",
            borderBottom: i < suggestions.length - 1 ? "1px solid #f5f5f5" : "none",
            background: "#fff", cursor: "pointer", textAlign: "left",
            fontFamily: "inherit", display: "block"
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{p.place_name}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{p.address_name}</div>
          </button>
        ))}
      </div>
    )}

    {/* 몰라요 버튼 */}
    <button onClick={handleSkip} style={{
      width: "100%", padding: "12px", borderRadius: 12, marginTop: 10,
      border: "1px dashed #ddd", background: "#fafafa",
      color: "#aaa", cursor: "pointer", fontSize: 13,
      fontFamily: "inherit", fontWeight: 600
    }}>
      🤷 아직 예식장을 몰라요 → 직접 고를게요
    </button>
  </div>
)}

      {step === "place" && (
  <div>
    {/* 검색창 다시 보여주기 */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) 68px",
      gap: 8,
      width: "100%",
      marginBottom: 8,
      boxSizing: "border-box"
    }}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && searchPlace()}
        placeholder="다시 검색"
        style={{
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          padding: "12px 14px",
          borderRadius: 12,
          border: "2px solid #f0f0f0",
          fontSize: 14,
          fontFamily: "inherit",
          outline: "none",
          background: "#fff"
        }}
      />

      <button
        onClick={searchPlace}
        style={{
          width: "68px",
          minWidth: 0,
          padding: "12px 0",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          color: "#fff",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "inherit",
          whiteSpace: "nowrap"
        }}
      >
        검색
      </button>
    </div>

    {/* 결과 리스트 — 세로로 */}
    <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 600 }}>
      📍 검색 결과 — 해당하는 곳을 선택해주세요
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {places.map((p, i) => (
        <button key={i} onClick={() => selectPlace(p)} style={{
          width: "100%", padding: "14px 16px", borderRadius: 14,
          border: "2px solid #f0f0f0", background: "#fff",
          cursor: "pointer", textAlign: "left",
          fontFamily: "inherit"
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 3 }}>
            {p.place_name}
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>📍 {p.address_name}</div>
          {p.category_name && <div style={{ fontSize: 11, color: "#bbb" }}>{p.category_name}</div>}
        </button>
      ))}
    </div>

    <button onClick={() => setStep("manual")} style={{
      width: "100%", padding: "10px", borderRadius: 10, marginTop: 8,
      border: "1px dashed #ddd", background: "#fafafa",
      color: "#aaa", cursor: "pointer", fontSize: 12, fontFamily: "inherit"
    }}>찾는 곳이 없어요</button>
  </div>
)}

      {step === "meal" && selectedPlace && (
        <div>
          <div style={{
            background: "#fff", borderRadius: 14, padding: "14px 16px",
            marginBottom: 12, border: "2px solid #FF6B6B30",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
          }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 6 }}>
              📍 {selectedPlace.place_name}
            </div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>
              {selectedPlace.address_name}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {selectedPlace.place_url && (
                <a href={selectedPlace.place_url} target="_blank" rel="noreferrer" style={{
                  flex: 1, padding: "7px", borderRadius: 8,
                  background: "#FFF8E1", color: "#F59E0B",
                  fontSize: 12, fontWeight: 700, textDecoration: "none",
                  textAlign: "center", border: "1px solid #FDE68A"
                }}>🗺️ 카카오맵</a>
              )}
              {mealInfo?.naver_map_url && (
                <a href={mealInfo.naver_map_url} target="_blank" rel="noreferrer" style={{
                  flex: 1, padding: "7px", borderRadius: 8,
                  background: "#F0FFF4", color: "#22C55E",
                  fontSize: 12, fontWeight: 700, textDecoration: "none",
                  textAlign: "center", border: "1px solid #BBF7D0"
                }}>🗺️ 네이버지도</a>
              )}
            </div>
          </div>

          {/* 이 예식장 다녀온 사람들 평균 축의금 */}
              {venueAvgAmount && (
                <div style={{
                  background: "#F0FDF4", border: "1px solid #BBF7D0",
                  borderRadius: 12, padding: "10px 14px", marginBottom: 12,
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <span style={{ fontSize: 12, color: "#15803D" }}>
                    여기서 결혼식 다녀온 {venueAvgAmount.count}명 평균
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#15803D" }}>
                    {formatAmount(venueAvgAmount.avg)}
                  </span>
                </div>
              )}

          {mealLoading ? (
            <div style={{
              background: "#fff", borderRadius: 14, padding: "20px",
              textAlign: "center", color: "#888", fontSize: 13,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
              <div>식대 정보 조회 중...</div>
              <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>DB → AI 순서로 찾고 있어요</div>
            </div>
          ) : (
            <>
              <div style={{
                background: "#fff", borderRadius: 14, padding: "14px 16px",
                marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              }}>
                {mealInfo?.source === "db_multi" && (
                <>
                  <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 700, marginBottom: 8 }}>
                    ✅ DB에서 찾은 예식장 목록
                  </div>
                  {mealInfo.list.map((v, i) => (
                    <button key={i} onClick={() => {
                      setMealInfo({ ...v, source: "db" });
                    }} style={{
                      width: "100%", padding: "12px 14px", borderRadius: 10,
                      border: "1.5px solid #f0f0f0", background: "#fafafa",
                      cursor: "pointer", textAlign: "left", marginBottom: 8,
                      fontFamily: "inherit", display: "flex",
                      justifyContent: "space-between", alignItems: "center"
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{v.name}</span>
                      <span style={{ fontSize: 13, color: "#FF6B6B", fontWeight: 700 }}>
                        {v.meal_cost ? `${v.meal_cost.toLocaleString()}원` : "식대 미등록"}
                      </span>
                    </button>
                  ))}
                </>
              )}
              {mealInfo?.source === "db" && (
                  <>
                    <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 700, marginBottom: 6 }}>✅ 실제 제보 데이터를 기반으로한 평균 식대에요</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#111" }}>{mealInfo.meal_cost?.toLocaleString()}원</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>1인 식대</div>
                  </>
                )}
                {mealInfo?.source === "ai" && (
                  <>
                    <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, marginBottom: 6 }}>🤖 AI 추정</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#111" }}>
                      {mealInfo.meal_cost_min?.toLocaleString()}~{mealInfo.meal_cost_max?.toLocaleString()}원
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>1인 식대 추정 (실제와 다를 수 있어요)</div>
                  </>
                )}
                {mealInfo?.source === "none" && (
                <div style={{
                  background: "linear-gradient(135deg, #FFF7ED, #FFF1F2)",
                  border: "1.5px solid #FED7AA",
                  borderRadius: 14,
                  padding: "16px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📮</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 6 }}>
                    아직 식대 정보가 없어요
                  </div>
                  <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>
                    알고 있는 식대가 있다면 제보해주세요.<br />
                    다음 사람에게 꽤 큰 도움이 돼요.
                  </div>
                  <button onClick={onReport} style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    border: "none",
                    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    fontFamily: "inherit",
                    cursor: "pointer"
                  }}>
                    식대 제보하고 계산 계속하기
                  </button>
                </div>
              )}
              </div>

              {mealInfo?.source !== "none" ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => confirm()} style={{
                    flex: 2, padding: "13px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                    color: "#fff", cursor: "pointer", fontSize: 14,
                    fontWeight: 700, fontFamily: "inherit"
                  }}>✅ 확인, 다음으로!</button>
                  <button onClick={() => setStep("manual")} style={{
                    flex: 1, padding: "13px", borderRadius: 12,
                    border: "2px solid #f0f0f0", background: "#fff",
                    color: "#666", cursor: "pointer", fontSize: 13, fontFamily: "inherit"
                  }}>직접 선택</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "5성급 호텔", grade: 5, meal: "15만원~" },
                    { label: "4성급 / 고급 웨딩홀", grade: 4, meal: "10~14만원" },
                    { label: "일반 웨딩홀", grade: 3, meal: "7~9만원" },
                    { label: "일반 예식장", grade: 2, meal: "4~6만원" },
                    { label: "스몰웨딩 / 야외", grade: 1, meal: "다양해요" },
                  ].map(opt => (
                    <button key={opt.label} onClick={() => confirm(opt.grade)} style={{
                      padding: "12px 16px", borderRadius: 12, border: "2px solid #f0f0f0",
                      background: "#fff", cursor: "pointer", fontSize: 14,
                      fontFamily: "inherit", textAlign: "left",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <span style={{ fontWeight: 600, color: "#333" }}>{opt.label}</span>
                      <span style={{ fontSize: 12, color: "#aaa" }}>식대 {opt.meal}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {step === "manual" && (
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>등급을 직접 선택해주세요</div>
          {[
            { label: "5성급 호텔", grade: 5, meal: "15만원~" },
            { label: "4성급 / 고급 웨딩홀", grade: 4, meal: "10~14만원" },
            { label: "일반 웨딩홀", grade: 3, meal: "7~9만원" },
            { label: "일반 예식장", grade: 2, meal: "4~6만원" },
            { label: "스몰웨딩 / 야외", grade: 1, meal: "다양해요" },
          ].map(opt => (
            <button key={opt.label} onClick={() => confirm(opt.grade)} style={{
              width: "100%", padding: "12px 16px", borderRadius: 12,
              border: "2px solid #f0f0f0", background: "#fff",
              cursor: "pointer", fontSize: 14, fontFamily: "inherit",
              textAlign: "left", marginBottom: 8,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontWeight: 600, color: "#333" }}>{opt.label}</span>
              <span style={{ fontSize: 12, color: "#aaa" }}>식대 {opt.meal}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ShareImageCard({ result, cardRef }) {
  const { tier, total, venue } = result;
  return (
    <div ref={cardRef} style={{
      position: "fixed", left: -9999, top: 0,
      width: 400, height: 560,
      background: `linear-gradient(160deg, ${tier.color}18 0%, #fff 40%, ${tier.color}08 100%)`,
      fontFamily: "'Pretendard', -apple-system, sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* 상단 컬러 바 */}
      <div style={{
        height: 5,
        background: `linear-gradient(90deg, ${tier.color}, ${tier.color}88)`,
      }} />

      <div style={{ padding: "24px 28px", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
            }}>💒</div>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#555" }}>축의금 실시간 계산 중</span>
          </div>
          <span style={{ fontSize: 11, color: "#bbb" }}>weddingfee.vercel.app</span>
        </div>

        {/* 이모지 */}
        <div style={{ textAlign: "center", fontSize: 64, lineHeight: 1, marginBottom: 12 }}>
          {tier.emoji}
        </div>

        {/* 추천 배지 */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span style={{
            display: "inline-block",
            background: `${tier.color}18`,
            border: `1.5px solid ${tier.color}44`,
            borderRadius: 100, padding: "3px 14px",
            fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: 1
          }}>추천 축의금</span>
        </div>

        {/* 금액 */}
        <div style={{
          textAlign: "center", fontSize: 68, fontWeight: 900,
          color: "#111", letterSpacing: -3, lineHeight: 1, marginBottom: 10
        }}>
          {formatAmount(tier.amount)}
        </div>

        {/* 타이틀 배지 */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{
            display: "inline-block",
            background: tier.color, color: "#fff",
            borderRadius: 100, padding: "6px 18px",
            fontSize: 13, fontWeight: 700
          }}>
            {tier.title}
          </span>
        </div>

        {/* 구분선 */}
        <div style={{ height: 1, background: "#f0f0f0", marginBottom: 16 }} />

        {/* 점수 + 예식장 가로 배치 */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{
            flex: 1, background: "#fafafa", borderRadius: 12,
            padding: "12px 14px", textAlign: "center"
          }}>
            <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4 }}>인연 점수</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#111" }}>{total}<span style={{ fontSize: 13, color: "#bbb" }}>점</span></div>
          </div>
          {venue?.name && venue.name !== "모름" && (
            <div style={{
              flex: 2, background: "#fafafa", borderRadius: 12,
              padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center"
            }}>
              <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4 }}>예식장</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{venue.name}</div>
            </div>
          )}
        </div>

        {/* 멘트 */}
        <div style={{
          background: "#fff",
          borderLeft: `3px solid ${tier.color}`,
          borderRadius: "0 10px 10px 0",
          padding: "10px 14px", marginBottom: "auto"
        }}>
          <p style={{ fontSize: 12, color: "#555", margin: 0, lineHeight: 1.7 }}>
            {tier.message}
          </p>
        </div>

        {/* 하단 CTA */}
        <div style={{
          marginTop: 16, textAlign: "center",
          paddingTop: 14, borderTop: "1px solid #f5f5f5"
        }}>
          <div style={{ fontSize: 11, color: "#bbb", marginBottom: 2 }}>나도 계산하기 →</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B6B" }}>weddingfee.vercel.app</div>
        </div>

      </div>
    </div>
  );
}

function ReportModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ venue: "", address: "", mealCost: "", email: "", file: null });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.venue || !form.mealCost) { alert('예식장 이름과 식대는 필수예요!'); return; }
    setSubmitting(true);
    try {
      const supabase = await getSupabase();

      let fileUrl = null;
      if (form.file) {
        const ext = form.file.name.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;
        const { data } = await supabase.storage.from('venue-reports').upload(fileName, form.file);
        if (data) {
          const { data: urlData } = supabase.storage.from('venue-reports').getPublicUrl(fileName);
          fileUrl = urlData.publicUrl;
        }
      }

      await supabase.from('venue_reports').insert([{
        venue_name: form.venue,
        address: form.address,
        meal_cost: Number(form.mealCost),
        reporter_email: form.email || null,
        file_url: fileUrl,
        status: 'pending',
      }]);

      // 이메일 알림
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue: form.venue,
          address: form.address,
          mealCost: form.mealCost,
          reporterEmail: form.email || null,
        }),
      }).catch(() => {});

      setStep(3);
    } catch (e) {
      alert('제보 중 오류가 났어요. 다시 시도해주세요.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 1000, padding: "0"
    }}>
      <div style={{
        background: "#fff", borderRadius: "24px 24px 0 0",
        padding: "24px 20px 40px", width: "100%", maxWidth: 480,
        fontFamily: "'Pretendard', -apple-system, sans-serif"
      }}>
        {step === 3 ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🙏</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>제보 감사해요!</div>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
              검토 후 반영할게요.<br/>매달 추첨으로 선물을 드려요 🎁
            </p>
            <button onClick={onClose} style={{
              marginTop: 16, padding: "12px 32px", borderRadius: 100, border: "none",
              background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
              color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit"
            }}>닫기</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>📮 식대 제보하기</div>
              <button onClick={onClose} style={{
                background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999"
              }}>✕</button>
            </div>

            {[
              { label: "예식장 이름 *", key: "venue", placeholder: "예) 서울신라호텔" },
              { label: "주소 (선택)", key: "address", placeholder: "예) 서울 중구 장충동" },
              { label: "1인 식대 (원) *", key: "mealCost", placeholder: "예) 150000", type: "number" },
              { label: "이메일 (선물 수령용, 선택)", key: "email", placeholder: "example@email.com", type: "email" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6 }}>{f.label}</div>
                <input
                  type={f.type || "text"}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    border: "1.5px solid #f0f0f0", fontSize: 14,
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6 }}>
                증빙 사진 (선택)
              </div>
              <input
                type="file" accept="image/*"
                onChange={e => setForm(p => ({ ...p, file: e.target.files[0] }))}
                style={{ fontSize: 13, color: "#666" }}
              />
            </div>

            <button onClick={handleSubmit} disabled={submitting} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: submitting ? "#f0f0f0" : "linear-gradient(135deg, #FF6B6B, #FF8E53)",
              color: submitting ? "#bbb" : "#fff",
              cursor: submitting ? "default" : "pointer",
              fontSize: 15, fontWeight: 700, fontFamily: "inherit"
            }}>
              {submitting ? "제보 중..." : "제보하기 🚀"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ score, color }) {
  const [displayed, setDisplayed] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    // 카운트업
    let start = 0;
    const step = Math.ceil(score / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= score) { setDisplayed(score); clearInterval(timer); }
      else setDisplayed(start);
    }, 30);

    // 바 애니메이션은 약간 딜레이
    const barTimer = setTimeout(() => setBarWidth(score), 100);
    return () => { clearInterval(timer); clearTimeout(barTimer); };
  }, [score]);

  const getLabel = (s) => {
    if (s >= 90) return "인생 최고의 인연 💎";
    if (s >= 70) return "정말 소중한 사람 🔥";
    if (s >= 50) return "꽤 가까운 사이 😊";
    if (s >= 30) return "알고 지내는 사이 👋";
    return "얕은 인연 🌱";
  };

  return (
    <div style={{ padding: "4px 0 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>나와의 인연 점수</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: color }}>{getLabel(score)}</div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#111", lineHeight: 1, animation: "countUp 0.5s ease 0.2s both" }}>
          {displayed}<span style={{ fontSize: 14, color: "#aaa", fontWeight: 600 }}>점</span>
        </div>
      </div>

      {/* 바 */}
      <div style={{ height: 8, background: "#f0f0f0", borderRadius: 100, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 100,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          width: `${barWidth}%`,
          transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>

      {/* 눈금 */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {["0", "25", "50", "75", "100"].map(v => (
          <span key={v} style={{ fontSize: 10, color: "#ccc" }}>{v}</span>
        ))}
      </div>
    </div>
  );
}

function AmountCountUp({ amount, color }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const increment = amount / steps;
    // 5만원 미만은 1000원 단위, 이상은 10000원 단위
    const unit = amount < 50000 ? 1000 : 10000;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= amount) { setDisplayed(amount); clearInterval(timer); }
      else setDisplayed(Math.round(current / unit) * unit);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [amount]);

  return (
    <div style={{
      fontSize: 48, fontWeight: 900, color: "#111",
      lineHeight: 1, marginBottom: 8, fontFamily: "inherit",
      animation: "popIn 0.6s ease 0.2s both"
    }}>
      {displayed >= 10000 ? `${displayed / 10000}만원` : `${displayed.toLocaleString()}원`}
    </div>
  );
}

function CheckList({ amount }) {
  const items = [
    { id: "envelope", label: "💌 봉투 또는 계좌이체 준비" },
    { id: "amount", label: `💰 ${formatAmount(amount)} 준비` },
    { id: "message", label: "✍️ 축하 메시지 생각해두기" },
    { id: "schedule", label: "📅 당일 일정 확인" },
    ...(amount >= 100000 ? [{ id: "gift", label: "🎁 추가 선물 고려해보기" }] : []),
  ];
  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{
      background: "#fff", border: "1px solid #f0f0f0",
      borderRadius: 16, padding: "16px", marginBottom: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>
          ✅ 축의금 준비 체크리스트
        </div>
        <div style={{ fontSize: 11, color: "#FF6B6B", fontWeight: 700 }}>
          {doneCount}/{items.length}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(item => (
          <button key={item.id} onClick={() => toggle(item.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10,
            border: checked[item.id] ? "1.5px solid #BBF7D0" : "1.5px solid #f0f0f0",
            background: checked[item.id] ? "#F0FDF4" : "#fafafa",
            cursor: "pointer", textAlign: "left", fontFamily: "inherit"
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
              background: checked[item.id] ? "#22C55E" : "#fff",
              border: checked[item.id] ? "2px solid #22C55E" : "2px solid #ddd",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "#fff", fontWeight: 900
            }}>
              {checked[item.id] ? "✓" : ""}
            </div>
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: checked[item.id] ? "#15803D" : "#333",
              textDecoration: checked[item.id] ? "line-through" : "none"
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
      {doneCount === items.length && (
        <div style={{
          textAlign: "center", marginTop: 10, fontSize: 13,
          fontWeight: 700, color: "#22C55E", animation: "popIn 0.4s ease"
        }}>
          🎉 완벽하게 준비됐어요!
        </div>
      )}
    </div>
  );
}

function ResultCard({ result, onRetry, onReport, onAddToList }) {
  const { total } = result;
  const tier = result.tier;

  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [stats, setStats] = useState(null);
  const [vote, setVote] = useState(null);
  const [voteStats, setVoteStats] = useState(null);
  const [shareStyle, setShareStyle] = useState("default");
  const [cardTheme, setCardTheme] = useState("default");
  const [weddingDate, setWeddingDate] = useState("");
  const [dDay, setDDay] = useState(null);
  const cardRef = useRef(null);
  const shareCardRef = useRef(null);

  useEffect(() => {
    // 동적 타이틀
    document.title = `축의금 추천: ${formatAmount(tier.amount)} | 착한 축의금`;
    return () => { document.title = "축의금 계산기 | 착한 축의금"; };
  }, [tier.amount]);

  // 결과 생성 시각 저장
  const [calcTime] = useState(() => new Date());

  useEffect(() => {
    const saveAndGetToken = async () => {
      try {
        const supabase = await getSupabase();

        const token = Math.random().toString(36).substring(2, 10);

        await supabase.from('calculations').insert([{
          score: result.total,
          amount: tier.amount,
          share_token: token,
          relation_label: result.relationLabel || null,
          venue_name: result.venue?.name && result.venue.name !== "모름" ? result.venue.name : null,
        }]);

        setShareToken(token);
      } catch (e) {
        console.error('토큰 저장 실패:', e);
      }
    };

    saveAndGetToken();
    fetchSimilarStats(tier.amount).then(setStats);

    // 투표 통계 로드
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data } = await supabase
          .from('votes')
          .select('vote')
          .eq('amount', tier.amount)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        if (data && data.length >= 3) {
          const upCount = data.filter(d => d.vote === 'up').length;
          setVoteStats({ upCount, total: data.length });
        }
      } catch {}
    })();
  }, [result.total, tier.amount]);

  const getShareText = (style, url) => {
    const amount = formatAmount(tier.amount);
    if (style === "friend") return `친구 결혼식 축의금 고민하다가 계산기 써봤는데 ${amount} 나왔어 ㅋㅋ 너도 해봐 → ${url}`;
    if (style === "work") return `직장 동료 결혼식 축의금, AI한테 물어봤더니 ${amount} 래요. 여러분은요? → ${url}`;
    return `💒 축의금 계산 결과: ${amount}\n"${tier.title}"\n\n축의금, 이걸로 정하면 욕 안 먹습니다!\n나도 계산하기 → ${url}`;
  };

  const handleCopy = () => {
    const url = shareToken
      ? `https://weddingfee.vercel.app?token=${shareToken}`
      : `https://weddingfee.vercel.app`;
    navigator.clipboard.writeText(getShareText(shareStyle, url))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleKakaoShare = () => {
  const kakaoJsKey = import.meta.env.VITE_KAKAO_JS_KEY;

  if (!window.Kakao) {
    alert("카카오 SDK를 불러오지 못했어요.");
    return;
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoJsKey);
  }

  const url = shareToken
    ? `https://weddingfee.vercel.app?token=${shareToken}`
    : `https://weddingfee.vercel.app`;

  const ogImageUrl = `https://weddingfee.vercel.app/api/og?amount=${encodeURIComponent(formatAmount(tier.amount))}&title=${encodeURIComponent(tier.title)}&score=${total}`;

  window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `추천 축의금은 ${formatAmount(tier.amount)}`,
        description: shareStyle === "friend"
          ? `친구 결혼식 축의금 고민하다가 계산기 써봤는데 ${formatAmount(tier.amount)} 나왔어`
          : shareStyle === "work"
          ? `직장 동료 결혼식 축의금, AI한테 물어봤더니 ${formatAmount(tier.amount)} 래요`
          : `"${tier.title}"\n축의금, 이걸로 정하면 욕 안 먹습니다!`,
        imageUrl: ogImageUrl,
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      buttons: [
        {
          title: "나도 계산하기",
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
      ],
    });
  };

  const handleSaveImage = async () => {
    if (!shareCardRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `축의금_${formatAmount(tier.amount)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      alert("이미지 저장에 실패했어요.");
    }
    setSaving(false);
  };

  const handleVote = async (v) => {
    if (vote) return; // 중복 방지
    setVote(v);
    // 낙관적 업데이트
    setVoteStats(prev => {
      const base = prev || { upCount: 0, total: 0 };
      return {
        upCount: base.upCount + (v === 'up' ? 1 : 0),
        total: base.total + 1,
      };
    });
    try {
      const supabase = await getSupabase();
      await supabase.from('votes').insert([{ amount: tier.amount, vote: v }]);
    } catch {}
  };

  const [activeTab, setActiveTab] = useState("info"); // "info" | "share" | "tools"

  return (
    <div style={{ padding: "4px 0 24px 0", animation: "fadeSlideIn 0.4s ease" }}>

      {/* ── 메인 결과 카드 ── */}
      <div ref={cardRef} style={{
        background: cardTheme === "dark"
          ? "linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)"
          : cardTheme === "pastel"
          ? `linear-gradient(160deg, ${tier.color}20 0%, #fff8f8 100%)`
          : `linear-gradient(160deg, ${tier.color}14 0%, #ffffff 60%)`,
        borderRadius: 24,
        padding: "28px 20px 24px",
        marginBottom: 4,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 8px 32px ${tier.color}22`,
      }}>
        {/* 배경 장식 원 */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 160, height: 160, borderRadius: "50%",
          background: `${tier.color}10`, pointerEvents: "none"
        }} />

        {/* 연락 끊겼다 배너 */}
        {result.isGhosted && (
          <div style={{
            background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)",
            borderRadius: 10, padding: "7px 12px", marginBottom: 14,
            fontSize: 12, fontWeight: 700, color: "#C0392B", textAlign: "center"
          }}>
            🥲 연락 끊겼다 청첩장... 다들 공감해요
          </div>
        )}

        {/* 테마 + 금액조정 — 우상단 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { key: "default", label: "기본" },
              { key: "pastel", label: "🌸" },
              { key: "dark", label: "🌙" },
            ].map(t => (
              <button key={t.key} onClick={() => setCardTheme(t.key)} style={{
                padding: "4px 8px", borderRadius: 100,
                border: "none",
                background: cardTheme === t.key
                  ? (cardTheme === "dark" ? "rgba(255,255,255,0.15)" : `${tier.color}22`)
                  : "transparent",
                color: cardTheme === t.key
                  ? (cardTheme === "dark" ? "#fff" : tier.color)
                  : (cardTheme === "dark" ? "#666" : "#ccc"),
                cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit"
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* 이모지 */}
        <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 12, animation: "popIn 0.5s ease 0.1s both" }}>
          {tier.emoji}
        </div>

        {/* 금액 */}
        <AmountCountUp amount={tier.amount} color={cardTheme === "dark" ? "#fff" : tier.color} />

        {/* 타이틀 + 홀수 배지 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <span style={{
            fontSize: 14, fontWeight: 700,
            color: cardTheme === "dark" ? "#ccc" : "#555"
          }}>
            {tier.title}
          </span>
          {[50000, 70000, 150000, 300000, 500000].includes(tier.amount) && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#15803D",
              background: "#F0FDF4", borderRadius: 100, padding: "2px 8px",
              border: "1px solid #BBF7D0"
            }}>홀수 관례</span>
          )}
          {[100000, 200000, 1000000].includes(tier.amount) && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#C2410C",
              background: "#FFF7ED", borderRadius: 100, padding: "2px 8px",
              border: "1px solid #FED7AA"
            }}>10만원 단위 OK</span>
          )}
        </div>

        {/* 멘트 + 역지사지 — 가로 분할 */}
        <div style={{
          background: cardTheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
          borderRadius: 16, padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 10
        }}>
          <p style={{
            fontSize: 13, lineHeight: 1.7, margin: 0,
            color: cardTheme === "dark" ? "#ccc" : "#444"
          }}>
            {tier.message}
          </p>
          <div style={{
            borderTop: cardTheme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
            paddingTop: 10, fontSize: 12,
            color: cardTheme === "dark" ? "#888" : "#999"
          }}>
            {tier.amount === 50000 && "💭 역지사지로? 솔직히 크게 서운하진 않을 것 같아요."}
            {tier.amount === 70000 && "💭 역지사지로? 오, 신경 써줬구나 싶을 거예요."}
            {tier.amount === 100000 && "💭 역지사지로? 진짜 친구구나 싶을 금액이에요."}
            {tier.amount === 150000 && "💭 역지사지로? 이 분은 내 결혼식에 꼭 와줬으면 해요."}
            {tier.amount === 200000 && "💭 역지사지로? 받는 순간 눈물 날 것 같아요."}
            {tier.amount >= 300000 && "💭 역지사지로? 평생 기억할 것 같아요."}
          </div>
        </div>

        {/* 인연점수 — 카드 내부 하단 */}
        <div style={{ marginTop: 16 }}>
          <ScoreBar score={total} color={cardTheme === "dark" ? "#FF6B6B" : tier.color} />
        </div>
      </div>

      {/* ── 식대 업그레이드 알림 ── */}
      {result.upgradedByMeal && (
      <div style={{
        fontSize: 12, color: "#B45309",
        background: "#FFFBEB", border: "1px solid #FDE68A",
        borderRadius: 8, padding: "8px 12px", marginTop: 8, textAlign: "center"
      }}>
        {result.venue?.name && result.venue.name !== "모름"
          ? `💡 ${result.venue.name} 식대(${result.mealFloor?.toLocaleString()}원) 기준으로 한 단계 올렸어요`
          : `💡 지역 평균 식대(${result.mealFloor?.toLocaleString()}원) 기준으로 한 단계 올렸어요`
        }
      </div>
      )}

      {/* ── 탭 네비게이션 ── */}
      <div style={{
        display: "flex", gap: 0, marginBottom: 12, marginTop: 12,
        background: "#f3f4f6", borderRadius: 14, padding: 4
      }}>
        {[
          { key: "info", label: "📊 통계" },
          { key: "share", label: "🔗 공유" },
          { key: "tools", label: "🛠️ 도구" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
            background: activeTab === tab.key ? "#fff" : "transparent",
            color: activeTab === tab.key ? "#111" : "#999",
            cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit",
            boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.15s"
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── 탭: 통계 ── */}
      {activeTab === "info" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeSlideIn 0.25s ease" }}>

          {/* 왜 이 금액 아코디언 */}
          {result.breakdown?.length > 0 && (
            <div style={{
              background: "#fff", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
            }}>
              <button onClick={() => setBreakdownOpen(o => !o)} style={{
                width: "100%", padding: "14px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                border: "none", background: "transparent",
                cursor: "pointer", fontFamily: "inherit"
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>왜 이 금액인가요?</span>
                <span style={{ fontSize: 12, color: "#aaa" }}>{breakdownOpen ? "▲" : "▼"}</span>
              </button>
              {breakdownOpen && (
                <div style={{ padding: "0 16px 14px", borderTop: "1px solid #f5f5f5" }}>
                  <div style={{ fontSize: 11, color: "#bbb", margin: "10px 0 8px" }}>
                    관계 유형 × 친밀도 보정 방식으로 계산돼요
                  </div>
                  {result.breakdown.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8,
                      padding: "6px 0", borderBottom: i < result.breakdown.length - 1 ? "1px solid #f9f9f9" : "none"
                    }}>
                      <span style={{
                        fontSize: 12, color: "#666", flex: 1,
                        wordBreak: "keep-all", lineHeight: 1.5
                      }}>{item.label}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                        color: item.score > 0 ? "#22C55E" : "#EF4444"
                      }}>
                        {item.score > 0 ? `+${item.score}` : item.score}점
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 통계 카드 */}
          {stats && (
            <div style={{
              background: "#fff", borderRadius: 16, padding: "16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#ccc", marginBottom: 12 }}>
                최근 30일 · {stats.total.toLocaleString()}명 참여
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>같은 금액 선택 비율</div>
                  <div style={{ height: 6, background: "#f0f0f0", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 100,
                      background: `linear-gradient(90deg, ${tier.color}, ${tier.color}88)`,
                      width: `${stats.percent}%`, transition: "width 1s ease 0.3s"
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#111", minWidth: 44 }}>
                  {stats.percent}%
                </span>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 12px", background: "#fafafa", borderRadius: 10
              }}>
                <span style={{ fontSize: 12, color: "#888" }}>이번 달 최다 선택</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#FF6B6B" }}>
                  {formatAmount(stats.mostCommonAmount)}
                </span>
              </div>
            </div>
          )}

          {/* 투표 */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)", textAlign: "center"
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 12 }}>
              이 금액, 실제로 내기 괜찮을 것 같아요?
            </div>
            {!vote ? (
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { v: "up", emoji: "👍", label: "괜찮아요", hover: { bg: "#F0FDF4", border: "#86EFAC" } },
                  { v: "down", emoji: "👎", label: "좀 애매해요", hover: { bg: "#FFF5F5", border: "#FCA5A5" } },
                ].map(btn => (
                  <button key={btn.v} onClick={() => handleVote(btn.v)} style={{
                    flex: 1, padding: "12px 8px", borderRadius: 12,
                    border: "1.5px solid #f0f0f0", background: "#fafafa",
                    cursor: "pointer", fontSize: 18, fontFamily: "inherit", transition: "all 0.15s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = btn.hover.bg; e.currentTarget.style.borderColor = btn.hover.border; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#f0f0f0"; }}
                  >
                    {btn.emoji}
                    <div style={{ fontSize: 11, color: "#777", marginTop: 4, fontWeight: 600 }}>{btn.label}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ animation: "fadeSlideIn 0.3s ease" }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{vote === "up" ? "👍" : "👎"}</div>
                {voteStats ? (
                  <>
                    <div style={{ fontSize: 28, fontWeight: 900, color: vote === "up" ? "#22C55E" : "#FF6B6B" }}>
                      {Math.round((voteStats.upCount / voteStats.total) * 100)}%
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                      {formatAmount(tier.amount)}을 낸 {voteStats.total}명 중<br />
                      <strong style={{ color: "#333" }}>{Math.round((voteStats.upCount / voteStats.total) * 100)}%가 괜찮았다고 했어요</strong>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: "#888" }}>투표해줘서 고마워요! 🙏</div>
                )}
              </div>
            )}
          </div>

          {/* 핵심 문장 배너 */}
          <div style={{
            background: `linear-gradient(135deg, ${tier.color}12, ${tier.color}06)`,
            border: `1px solid ${tier.color}25`,
            borderRadius: 16, padding: "18px 20px",
            textAlign: "center", marginTop: 4
          }}>
            <div style={{ fontSize: 11, color: tier.color, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>
              💡 착한 축의금 원칙
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#111", lineHeight: 1.6, marginBottom: 6 }}>
              "관계의 깊이 + 교류 빈도"
            </div>
            <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7 }}>
              이 두 가지로 기준을 잡는 게 가장 안전해요.
            </div>
            <div style={{
              marginTop: 12,
              fontSize: 13, fontWeight: 800,
              color: "#FF6B6B",
              letterSpacing: "-0.3px"
            }}>
              감정이 아니라 — <span style={{ textDecoration: "underline", textDecorationColor: "#FF6B6B55", textUnderlineOffset: 3 }}>기준이 필요해요.</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 탭: 공유 ── */}
      {activeTab === "share" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeSlideIn 0.25s ease" }}>

          {/* 공유 스타일 탭 */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: "14px 16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", marginBottom: 10 }}>공유 문구 스타일</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[
                { key: "default", label: "기본" },
                { key: "friend", label: "친구한테" },
                { key: "work", label: "직장용" },
              ].map(s => (
                <button key={s.key} onClick={() => setShareStyle(s.key)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 10,
                  border: shareStyle === s.key ? `2px solid ${tier.color}` : "2px solid #f0f0f0",
                  background: shareStyle === s.key ? `${tier.color}12` : "#fff",
                  color: shareStyle === s.key ? tier.color : "#888",
                  cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit"
                }}>{s.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={handleCopy} style={{
                width: "100%", padding: "13px", borderRadius: 12, border: "none",
                background: "#f5f5f5", color: "#333", cursor: "pointer",
                fontSize: 14, fontWeight: 700, fontFamily: "inherit"
              }}>
                {copied ? "✅ 복사됨!" : "🔗 링크 복사"}
              </button>
              <button onClick={handleKakaoShare} style={{
                width: "100%", padding: "13px", borderRadius: 12, border: "none",
                background: "#FEE500", color: "#3A1D1D", cursor: "pointer",
                fontSize: 14, fontWeight: 700, fontFamily: "inherit"
              }}>
                💬 카카오 공유
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSaveImage} disabled={saving} style={{
                  flex: 1, padding: "11px", borderRadius: 12,
                  border: "1.5px solid #f0f0f0", background: "#fff",
                  color: saving ? "#bbb" : "#555", cursor: saving ? "default" : "pointer",
                  fontSize: 13, fontWeight: 700, fontFamily: "inherit"
                }}>
                  {saving ? "⏳ 저장 중..." : "🖼️ 이미지 저장"}
                </button>
                <button onClick={() => {
                  const text = [
                    `📋 축의금 계산 결과`,
                    `금액: ${formatAmount(tier.amount)}`,
                    `관계: ${result.relationLabel || "-"}`,
                    result.venue?.name && result.venue.name !== "모름" ? `예식장: ${result.venue.name}` : null,
                    `인연점수: ${total}점`,
                    `날짜: ${new Date().toLocaleDateString("ko-KR")}`,
                  ].filter(Boolean).join("\n");
                  navigator.clipboard.writeText(text).then(() => alert("📋 복사됐어요!"));
                }} style={{
                  flex: 1, padding: "11px", borderRadius: 12,
                  border: "1.5px solid #f0f0f0", background: "#fff",
                  color: "#555", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, fontFamily: "inherit"
                }}>
                  📝 메모앱용
                </button>
              </div>
            </div>
          </div>

          
        </div>
      )}

      {/* ── 탭: 도구 ── */}
      {activeTab === "tools" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeSlideIn 0.25s ease" }}>
          {/* D-Day */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 10 }}>
              📅 결혼식 D-Day
            </div>
            <input
              type="date" value={weddingDate}
              onChange={e => {
                setWeddingDate(e.target.value);
                if (e.target.value) {
                  const diff = Math.ceil((new Date(e.target.value) - new Date()) / (1000 * 60 * 60 * 24));
                  setDDay(diff);
                }
              }}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 10,
                border: "1.5px solid #f0f0f0", fontSize: 14,
                fontFamily: "inherit", outline: "none", boxSizing: "border-box"
              }}
            />
            {dDay !== null && (
              <div style={{ textAlign: "center", marginTop: 12, animation: "fadeSlideIn 0.3s ease" }}>
                <div style={{
                  fontSize: 36, fontWeight: 900,
                  color: dDay <= 7 ? "#EF4444" : dDay <= 30 ? "#F59E0B" : tier.color
                }}>
                  {dDay === 0 ? "D-Day 🎊" : dDay > 0 ? `D-${dDay}` : `D+${Math.abs(dDay)}`}
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
                  {dDay > 0
                    ? dDay <= 7 ? "🔥 곧이에요!" : dDay <= 30 ? "⏰ 한 달 안이에요" : "여유 있어요 😊"
                    : "이미 지난 날짜예요"}
                </div>
              </div>
            )}
          </div>

          {/* 체크리스트 */}
          <CheckList amount={tier.amount} />

          {/* 목록 추가 */}
          {onAddToList && (
            <button onClick={() => onAddToList(tier.amount)} style={{
              width: "100%", padding: "13px", borderRadius: 14, border: "1.5px solid #f0f0f0",
              background: "#fff", color: "#555", cursor: "pointer",
              fontSize: 13, fontWeight: 700, fontFamily: "inherit"
            }}>
              📋 이번 달 목록에 추가하기
            </button>
          )}

          {/* SEO 가이드 */}
          <details>
            <summary style={{
              fontSize: 12, color: "#ccc", cursor: "pointer",
              padding: "8px 0", listStyle: "none", textAlign: "center"
            }}>
              💡 관계별 축의금 가이드 보기
            </summary>
            <div style={{ fontSize: 12, color: "#888", lineHeight: 1.8, marginTop: 8, padding: "0 4px" }}>
              <p><strong style={{ color: "#555" }}>직장 동료 · 상사</strong> — 5만원이 무난해요. 깊을수록 7~10만원.</p>
              <p><strong style={{ color: "#555" }}>친한 친구</strong> — 10만원 기준. 베프면 15~20만원도 자연스러워요.</p>
              <p><strong style={{ color: "#555" }}>지인 · SNS</strong> — 3~5만원이면 충분해요.</p>
              <p><strong style={{ color: "#555" }}>가족 · 친척</strong> — 집안 분위기에 따라 10~30만원.</p>
            </div>
          </details>
        </div>
      )}

      {/* ── 하단 고정 영역 ── */}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>

        {/* 제보하기 */}
        <div style={{
          background: "linear-gradient(135deg, #667eea10, #764ba210)",
          border: "1px solid #667eea20", borderRadius: 16,
          padding: "14px 16px", textAlign: "center"
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 4 }}>
            📮 예식장 식대 알고 있나요?
          </div>
          <p style={{ fontSize: 12, color: "#777", margin: "0 0 10px" }}>
            매달 추첨으로 <strong style={{ color: "#667eea" }}>선물 🎁</strong> 드려요
          </p>
          <button onClick={onReport} style={{
            padding: "8px 20px", borderRadius: 100, border: "none",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit"
          }}>제보하기 →</button>
        </div>

        {/* 광고 */}
        <div style={{
          background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14,
          padding: "12px 16px", display: "flex", alignItems: "center", gap: 10
        }}>
          <span style={{ fontSize: 22 }}>💍</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#ccc" }}>AD · 제휴문의 welcome</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>웨딩플래너 무료 상담</div>
            <div style={{ fontSize: 11, color: "#aaa" }}>견적 비교하고 최대 30% 절약</div>
          </div>
          <button style={{
            padding: "7px 12px", borderRadius: 8, border: "1px solid #e8ecff",
            background: "#fff", color: "#667eea", cursor: "pointer",
            fontSize: 12, fontWeight: 700, fontFamily: "inherit"
          }}>상담받기</button>
        </div>

        <button onClick={onRetry} style={{
          width: "100%", padding: "15px", borderRadius: 16, border: "none",
          background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 800,
          fontFamily: "inherit", boxShadow: "0 4px 16px rgba(255,107,107,0.3)"
        }}>
          🔄 다시 계산하기
        </button>
        <div style={{ textAlign: "center", fontSize: 11, color: "#ddd" }}>
          🕐 {calcTime.toLocaleDateString("ko-KR")} 기준 · 상황이 바뀌면 다시 계산하세요
        </div>
      </div>

      <ShareImageCard result={result} cardRef={shareCardRef} />
    </div>
  );
}

// ─── 메인 앱 ─────────────────────────────────────────────────────────────────

export default function App() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingSharedResult, setLoadingSharedResult] = useState(true);
  const [answers, setAnswers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [result, setResult] = useState(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("darkMode") === "true");
  const bottomRef = useRef(null);
  const resultRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);

  const [showReverse, setShowReverse] = useState(false);
  const [multiResults, setMultiResults] = useState([]);
  const [showMulti, setShowMulti] = useState(false);

  const [undoToast, setUndoToast] = useState(false);
  const undoRef = useRef(null);

  const scrollToBottom = () => {
  setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const scrollToResult = () => {
    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 150);
  };

  const addBotMessage = (text, delay = 800) => {
    return new Promise(resolve => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { type: "bot", text, id: Date.now() }]);
        scrollToBottom();
        resolve();
      }, delay);
    });
  };

  useEffect(() => {
  const loadSharedResult = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setLoadingSharedResult(false);
        return;
      }

      const supabase = await getSupabase();

      const { data, error } = await supabase
        .from("calculations")
        .select("*")
        .eq("share_token", token)
        .single();

      if (error || !data) {
        console.error("공유 결과 조회 실패", error);
        setLoadingSharedResult(false);
        return;
      }

      const matchedTier =
        RESULT_TIERS.find(t => t.amount === data.amount)
        || RESULT_TIERS[1];

      const restoredResult = {
        total: data.score,
        tier: matchedTier,
        upgradedByMeal: false,
        mealFloor: null,
        venue: null,
      };

      setResult(restoredResult);
      setStarted(true);
      setIsDone(true);

      setMessages([
        {
          type: "bot",
          text: "공유된 축의금 계산 결과를 불러왔어요 🎉",
          id: Date.now()
        },
        {
          type: "result",
          id: Date.now() + 1
        }
      ]);
    } catch (e) {
      console.error(e);
    }

    setLoadingSharedResult(false);
  };

  loadSharedResult();
}, []);

  // 시작
  useEffect(() => {
  if (!started || isDone) return;
    const start = async () => {
      await addBotMessage("안녕하세요! 👋\n축의금 얼마 낼지 같이 계산해볼게요.\n\n먼저, 이 분과 어떤 관계예요?", 600);
      setMessages(prev => [...prev, { type: "options", step: 0, id: Date.now() + 1 }]);
      scrollToBottom();
    };
    start();
  }, [started]);

  const handleAnswer = async (stepIndex, answer) => {
    const step = CHAT_FLOW[stepIndex];
    const newAnswers = { ...answers, [step.id]: answer };
    setAnswers(newAnswers);

    // 유저 메시지 추가
    const userText = Array.isArray(answer)
      ? answer.map(a => a.label).join(", ")
      : answer.label || answer.name || (answer.skipped ? "아직 몰라요 🤷" : String(answer));

    setMessages(prev => prev.map(m =>
      m.type === "options" && m.step === stepIndex
        ? { ...m, selected: answer }
        : m
    ));
    setTimeout(() => {
      setMessages(prev => [...prev, { type: "user", text: userText, id: Date.now() }]);
      scrollToBottom();
    }, 150);

    // 예식장 선택 시 추가 정보 메시지
    if (step.id === "venue" && answer.avgMeal) {
      await addBotMessage(
        `${answer.name} 정보를 찾았어요! 🎉\n\n식대: 약 ${answer.avgMeal.toLocaleString()}원\n등급: ${answer.label}\n\n이 정보를 바탕으로 계산할게요.`
      );
    }

    // 스마트 스킵 로직
    let nextStep = stepIndex + 1;

    // venue skipped → distance 스킵, region 표시
    if (newAnswers.venue?.skipped) {
      if (CHAT_FLOW[nextStep]?.id === "distance") nextStep += 1;
      // region 질문은 venue 스킵한 경우만 → 아래 region_fallback 처리
    } else {
      // venue 선택한 경우 region_fallback 스킵
      if (CHAT_FLOW[nextStep]?.id === "region_fallback") nextStep += 1;
    }

    // SNS친구(value=1) / 지인(value=2) → common_friends 스킵
    const relationVal = newAnswers.relation?.value;
    if (relationVal <= 2) {
      if (CHAT_FLOW[nextStep]?.id === "common_friends") nextStep += 1;
    }

    setCurrentStep(nextStep);

    if (nextStep >= CHAT_FLOW.length) {
      // 결과 계산
      await addBotMessage("좋아요! 이제 최적 금액을 계산할게요... 🧮", 600);
      setTimeout(async () => {
        const r = calcResult(newAnswers);
        setResult(r);
        saveHistory({
          relation: newAnswers.relation?.label?.replace(/^[^ ]+ /, "") || "알 수 없음",
          venue: newAnswers.venue?.name !== "모름" ? newAnswers.venue?.name : null,
          amount: r.tier.amount,
          date: new Date().toLocaleDateString("ko-KR"),
        });
        await addBotMessage(
          `계산 완료됐어요! 🎉\n\n추천 축의금은 아래와 같아요.`,
          800
        );
        setIsDone(true);
        setMessages(prev => [...prev, { type: "result", id: Date.now() }]);
        scrollToResult();
      }, 1000);
    } else {
      // 다음 질문
      const nextQ = CHAT_FLOW[nextStep];
      const botText = typeof nextQ.botMessage === "function"
        ? nextQ.botMessage(newAnswers)
        : nextQ.botMessage;

      await addBotMessage(botText);
      setMessages(prev => [...prev, { type: "options", step: nextStep, id: Date.now() + 1 }]);
      scrollToBottom();
    }
  };

  const retrySnapshot = useRef(null);

  const retry = () => {
    // 스냅샷 저장
    retrySnapshot.current = { messages, answers, isDone: true, result };
    setMessages([]);
    setAnswers({});
    setIsDone(false);
    setResult(null);
    setStarted(false);
    setTimeout(() => setStarted(true), 50);

    // undo 토스트 3초
    setUndoToast(true);
    clearTimeout(undoRef.current);
    undoRef.current = setTimeout(() => {
      setUndoToast(false);
      retrySnapshot.current = null;
    }, 3000);
  };

  const undoRetry = () => {
    if (!retrySnapshot.current) return;
    const { messages: m, answers: a, result: r } = retrySnapshot.current;
    setMessages(m);
    setAnswers(a);
    setIsDone(true);
    setResult(r);
    setStarted(true);
    setUndoToast(false);
    retrySnapshot.current = null;
  };
  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin: 0; font-family: 'Pretendard', -apple-system, sans-serif; }
  @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes countUp { from { opacity: 0; transform: translateY(20px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes popIn { 0% { opacity: 0; transform: scale(0.7); } 70% { transform: scale(1.08); } 100% { opacity: 1; transform: scale(1); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes staggerIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes floatSoft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes popInSoft {
  0% { opacity: 0; transform: translateY(14px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 8px 24px rgba(255,107,107,0.08); }
  50% { box-shadow: 0 12px 34px rgba(255,107,107,0.16); }
}
  button { font-family: 'Pretendard', -apple-system, sans-serif; }
  input { font-family: 'Pretendard', -apple-system, sans-serif; }
  ::-webkit-scrollbar { display: none; }

  .app-root { --bg: #f2f3f7; --surface: #ffffff; --surface2: #f8f8f8; --border: #f0f0f0;
    --text: #111111; --text2: #666666; --text3: #aaaaaa; --input-bg: #ffffff; }
  .app-root.dark { --bg: #0f0f0f; --surface: #1a1a1a; --surface2: #222222; --border: #2a2a2a;
    --text: #f0f0f0; --text2: #aaaaaa; --text3: #555555; --input-bg: #222222; }
`}</style>

<div className={`app-root${isDark ? " dark" : ""}`} style={{
  minHeight: "100vh", display: "flex", justifyContent: "center",
  background: "var(--bg)", transition: "background 0.3s"
}}>
  <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column" }}>

    {/* 헤더 */}
    <div style={{
      background: "var(--surface)", padding: "14px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
        }}>💒</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", whiteSpace: "nowrap" }}>축의금 계산기</div>
          <div style={{ fontSize: 10, color: "#22C55E", fontWeight: 600 }}>● 실시간</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        {multiResults.length > 0 && (
          <button onClick={() => setShowMulti(true)} style={{
            padding: "6px 10px", borderRadius: 100, border: "none",
            background: "#FFF5F5", color: "#FF6B6B",
            cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit"
          }}>📋 {multiResults.length}</button>
        )}
        <button onClick={() => setShowHistory(true)} style={{
          width: 32, height: 32, borderRadius: "50%", border: "none",
          background: "var(--surface2)", color: "var(--text2)",
          cursor: "pointer", fontSize: 14, fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>📋</button>
        <button onClick={() => setIsDark(d => { const next = !d; localStorage.setItem("darkMode", next); return next; })} style={{
          width: 32, height: 32, borderRadius: "50%", border: "none",
          background: "var(--surface2)", color: "var(--text2)",
          cursor: "pointer", fontSize: 14, fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>{isDark ? "☀️" : "🌙"}</button>
        {isDone && (
          <button onClick={retry} style={{
            padding: "6px 10px", borderRadius: 100, border: "none",
            background: "var(--surface2)", color: "var(--text2)", cursor: "pointer",
            fontSize: 11, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap"
          }}>처음으로</button>
        )}
      </div>
    </div>

          {/* 진행률 바 */}
          {started && !isDone && (
            <div style={{ height: 3, background: "var(--border)", position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                background: "linear-gradient(90deg, #FF6B6B, #FF8E53)",
                borderRadius: "0 2px 2px 0",
                width: `${Math.min((currentStep / CHAT_FLOW.length) * 100, 100)}%`,
                transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)"
              }} />
            </div>
          )}

          {/* 진행 중 요약 칩 */}
          {started && !isDone && Object.keys(answers).length > 0 && (
            <AnswerSummaryChips answers={answers} />
          )}

          {/* 인트로 배너 - 제거됨 */}
          {false && (
            <div style={{
              margin: "16px 16px 0", background: "#fff", borderRadius: 16,
              padding: "16px", border: "1px solid #f0f0f0",
              animation: "fadeSlideIn 0.5s ease"
            }}>
              <div style={{
                background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                borderRadius: 12, padding: "12px 14px", marginBottom: 10
              }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.4 }}>
                  💬 축의금, 이걸로 정하면<br />욕 안 먹습니다.
                </p>
              </div>
              <p style={{ fontSize: 12, color: "#888", margin: 0, lineHeight: 1.6 }}>
                질문 11개 · 약 2분 · 완전 무료
              </p>
            </div>
          )}
          {loadingSharedResult && (
            <div style={{
              minHeight: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 16,
              color: "#666"
            }}>
              공유 결과 불러오는 중... ⏳
            </div>
          )}
                  {/* 인트로 화면 */}
          {!loadingSharedResult && !started && (
            <div style={{ padding: "24px 16px" }}>

              <div style={{
                textAlign: "center",
                marginBottom: 22,
                paddingTop: 4
              }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "#FFF5F5",
                  color: "#FF6B6B",
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 14,
                  animation: "floatSoft 3s ease-in-out infinite"
                }}>
                  💬 축의금, 이걸로 정하면 욕 안 먹습니다
                </div>

                <div style={{
                  fontSize: 58,
                  lineHeight: 1,
                  marginBottom: 12
                }}>
                  💒
                </div>

                <h1 style={{
                  fontSize: 34,
                  fontWeight: 900,
                  color: "#111",
                  margin: "0 0 8px",
                  fontFamily: "inherit",
                  letterSpacing: "-1.2px",
                  lineHeight: 1.15
                }}>
                  얼마 내야 해?
                </h1>

                <p style={{
                  fontSize: 16,
                  color: "#777",
                  margin: 0,
                  lineHeight: 1.6
                }}>
                  5만원은 애매하고<br />
                  10만원은 부담스러울 때
                </p>
              </div>

              <div style={{
                background: "#fff",
                borderRadius: 20,
                padding: "18px 18px",
                marginBottom: 20,
                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                border: "1px solid #f3f3f3",
                textAlign: "center",
                animation: "popInSoft 0.5s ease both, glowPulse 3.5s ease-in-out infinite"
              }}>
                <div style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: "#111",
                  marginBottom: 8
                }}>
                  AI가 가장 현실적인 축의금을 추천해드려요
                </div>

                <div style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.7
                }}>
                  친밀도 · 예식장 등급 · 거리 · 식사 여부까지<br />
                  가장 무난한 기준으로 계산합니다
                </div>
              </div>
              
              
              <div style={{ animation: "slideUp 0.5s ease 0.7s both" }}>
                <div style={{ textAlign: "center" }}>
                  <VenueCountBadge />
                </div>
                <SeasonBanner />
                <ControversyBubbles />
                <MonthlyTop3Card />
                <RelationAvgStats />
                
                <button onClick={() => setStarted(true)} style={{
                  width: "100%", padding: "17px", borderRadius: 16, border: "none",
                  background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                  color: "#fff", cursor: "pointer", fontSize: 17, fontWeight: 800,
                  fontFamily: "inherit", boxShadow: "0 6px 24px rgba(255,107,107,0.35)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(255,107,107,0.45)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(255,107,107,0.35)"; }}
                >
                  지금 30초만에 확인하기 →
                </button>
                <p style={{ textAlign: "center", fontSize: 11, color: "#ccc", marginTop: 12 }}>질문 11개 · 약 2분 소요 · 완전 무료</p>
                <button onClick={() => setShowReverse(true)} style={{
                  width: "100%", marginTop: 10, padding: "14px", borderRadius: 16, border: "2px solid #f0f0f0",
                  background: "#fff", color: "#666", cursor: "pointer", fontSize: 14,
                  fontWeight: 700, fontFamily: "inherit"
                }}>
                  ↩️ 받은 축의금 기준으로 계산하기
                </button>
              </div>
              <div style={{
                background: "#f8f9ff", border: "1px solid #e0e8ff", borderRadius: 14,
                padding: "12px 16px", marginBottom: 20, marginTop: 12,
                display: "flex", alignItems: "center", gap: 10,
                animation: "staggerIn 0.4s ease 0.65s both",
              }}>
                <span style={{ fontSize: 24 }}>💍</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#aaa" }}>SPONSORED</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>웨딩 준비 중이신가요?</div>
                  <div style={{ fontSize: 11, color: "#888" }}>제휴 웨딩플래너 무료 상담 →</div>
                </div>
              </div>
            </div>
          )}

          {/* 채팅 영역 */}
          <div style={{ flex: 1, padding: "16px", paddingBottom: 32 }}>
            {messages.map((msg) => {
              if (msg.type === "bot") return <BotMessage key={msg.id} text={msg.text} isNew />;
              if (msg.type === "user") return <UserMessage key={msg.id} text={msg.text} />;

              if (msg.type === "options") {
                const step = CHAT_FLOW[msg.step];
                if (!step) return null;

                if (step.type === "select") {
                  return (
                    <SelectOptions
                      key={msg.id}
                      options={step.options}
                      selected={msg.selected}
                      onSelect={(opt) => handleAnswer(msg.step, opt)}
                      onReselect={() => {
                        // 이 step 이후의 메시지 전부 제거 + answers 리셋
                        setMessages(prev => {
                          const idx = prev.findIndex(m => m.id === msg.id);
                          return prev.slice(0, idx + 1).map(m =>
                            m.id === msg.id ? { ...m, selected: null } : m
                          );
                        });
                        setAnswers(prev => {
                          const newA = { ...prev };
                          CHAT_FLOW.slice(msg.step).forEach(q => delete newA[q.id]);
                          return newA;
                        });
                        setIsDone(false);
                        setResult(null);
                      }}
                    />
                  );
                }
                if (step.type === "multi_select") {
                  return (
                    <MultiSelectOptions
                      key={msg.id}
                      options={step.options}
                      onConfirm={(opts) => handleAnswer(msg.step, opts)}
                    />
                  );
                }
                if (step.type === "venue_search") {
                  return (
                    <VenueSearch
                      key={msg.id}
                      onSelect={(answer) => handleAnswer(msg.step, answer)}
                      onReport={() => setShowReport(true)}
                      onReselect={() => {
                        setMessages(prev => {
                          const idx = prev.findIndex(m => m.id === msg.id);
                          return prev.slice(0, idx + 1);
                        });
                        setAnswers(prev => {
                          const newA = { ...prev };
                          CHAT_FLOW.slice(msg.step).forEach(q => delete newA[q.id]);
                          return newA;
                        });
                        setIsDone(false);
                        setResult(null);
                      }}
                    />
                  );
                }
                if (step.type === "distance_select") {
                  return (
                    <DistanceSelect
                      key={msg.id}
                      options={step.options}
                      selected={msg.selected}
                      venuePlace={answers.venue?.kakaoPlace}
                      onSelect={(opt) => handleAnswer(msg.step, opt)}
                      onReselect={() => {
                        setMessages(prev => {
                          const idx = prev.findIndex(m => m.id === msg.id);
                          return prev.slice(0, idx + 1).map(m =>
                            m.id === msg.id ? { ...m, selected: null } : m
                          );
                        });
                        setAnswers(prev => {
                          const newA = { ...prev };
                          CHAT_FLOW.slice(msg.step).forEach(q => delete newA[q.id]);
                          return newA;
                        });
                        setIsDone(false);
                        setResult(null);
                      }}
                    />
                  );
                }
              }

              if (msg.type === "result" && result) {
                return (
                  <div key={msg.id} ref={resultRef}>
                    <ResultCard
                      result={result}
                      onRetry={retry}
                      onReport={() => setShowReport(true)}
                      onAddToList={(amount) => {
                        setMultiResults(prev => [...prev, {
                          amount,
                          name: answers.venue?.name !== "모름" ? answers.venue?.name : null,
                          relation: answers.relation?.label?.replace(/^[^ ]+ /, "") || "",
                        }]);
                        alert("목록에 추가됐어요! 📋");
                      }}
                    />
                  </div>
                );
              }
              return null;
            })}

            {isTyping && (
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
                }}>💒</div>
                <div style={{
                  background: "#fff", borderRadius: "4px 18px 18px 18px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    {/* Undo 토스트 */}
    {undoToast && (
      <div style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        background: "#222", color: "#fff", borderRadius: 100,
        padding: "12px 20px", display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 2000,
        fontSize: 13, fontWeight: 600, fontFamily: "inherit",
        animation: "slideUp 0.3s ease"
      }}>
        <span>초기화됐어요</span>
        <button onClick={undoRetry} style={{
          background: "#FF6B6B", color: "#fff", border: "none",
          borderRadius: 100, padding: "5px 12px", cursor: "pointer",
          fontSize: 12, fontWeight: 700, fontFamily: "inherit"
        }}>↩ 되돌리기</button>
      </div>
    )}
    {showReport && <ReportModal onClose={() => setShowReport(false)} />}
    {showReverse && <ReverseCalculator onClose={() => setShowReverse(false)} />}
    {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    {showMulti && <MultiResultPanel results={multiResults} onClose={() => setShowMulti(false)} />}
    </>
  );
}
