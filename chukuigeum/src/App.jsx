import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const RESULT_TIERS = [
  { min: -99, max: 15, amount: 30000, title: "마음만 받을게요 😅", emoji: "🌱", color: "#95a5a6",
    messages: [
      "솔직히 말할게요. 이 분과의 인연은 얇아요. 3만원도 충분한 성의예요.",
      "억지로 더 낼 필요 없어요. 3만원은 예의를 지키는 최소한의 표현이에요.",
      "인연의 깊이가 곧 금액이에요. 얇은 인연엔 얇은 봉투가 정직해요.",
      "3만원이 적다고 느껴진다면, 사실 그게 맞는 금액이에요.",
    ]
  },
  { min: 16, max: 25, amount: 50000, title: "국룰 5만원! 🤝", emoji: "💵", color: "#27ae60",
    messages: [
      "축의금 세계의 황금비율. 5만원은 가장 정직한 표현이에요.",
      "대한민국 직장인의 99%가 선택하는 그 금액. 틀릴 수가 없어요.",
      "5만원은 '우리 사이가 나쁜 건 아니잖아요'의 언어예요.",
      "고민할 필요 없어요. 5만원은 이미 국가 공인 표준이에요.",
    ]
  },
  { min: 26, max: 35, amount: 70000, title: "7만원... 진심 🫡", emoji: "💐", color: "#2980b9",
    messages: [
      "5만원은 좀 적고 10만원은 좀 부담스러운 그 사이. 따뜻한 시그널이에요.",
      "7만원은 '나 너 꽤 챙기는 사람이야'의 언어예요.",
      "어중간해 보여도 이게 의외로 가장 기억에 남는 금액이에요.",
      "5에서 한 걸음 더. 그 한 걸음이 관계를 말해줘요.",
    ]
  },
  { min: 36, max: 45, amount: 100000, title: "10만원, 진짜 친구 ✅", emoji: "👑", color: "#8e44ad",
    messages: [
      "이 분은 당신의 진짜 친구예요. 10만원짜리 우정은 흔하지 않아요.",
      "10만원을 자연스럽게 낼 수 있는 사람이 몇 명이나 돼요? 이 분은 그 안에 있어요.",
      "심리적 마지노선을 넘는 금액. 그만큼 이 분이 소중하다는 뜻이에요.",
      "받는 사람 입장에서 10만원짜리 봉투는 오래 기억해요.",
    ]
  },
  { min: 46, max: 60, amount: 150000, title: "15만원... 형제야? 🥹", emoji: "🫂", color: "#e67e22",
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
  {
    id: "venue",
    botMessage: "예식장이 어디예요?\n직접 검색해보세요 🔍\n(아직 모르면 아래 '몰라요' 버튼을 눌러주세요)",
    type: "venue_search",
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
  botMessage: "집에서 식장까지 거리가 얼마나 돼요?",
  type: "distance_select",  // 새 타입!
  options: [
    { label: "🚶 10km 미만", value: 0 },
    { label: "🚌 10km 이상", value: -1 },
    { label: "🚗 20km 이상", value: -2 },
    { label: "✈️ 타지역 / 지방", value: -4 },
  ],
  },
  {
    id: "after_honeymoon",
    botMessage: "신혼여행 후 6개월 안에\n볼 수 있는 사이예요?",
    type: "select",
    options: [
      { label: "😄 당연히요!", value: 4 },
      { label: "🙂 아마 볼 것 같아요", value: 2 },
      { label: "🤷 모르겠어요", value: 1 },
      { label: "😅 아마 못 볼 것 같아요", value: 0 },
    ],
  },
  {
    id: "gender",
    botMessage: "상대방이 이성이에요, 동성이에요?",
    type: "select",
    options: [
      { label: "👫 이성이에요", value: 2 },
      { label: "👬👭 동성이에요", value: 0 },
      { label: "💫 구분 안 해도 돼요", value: 1 },
    ],
  },
  {
    id: "extra",
    botMessage: "마지막으로! 특이사항이 있나요?\n여러 개 골라도 돼요 😄",
    type: "multi_select",
    options: [
      { label: "💸 빌린 돈 안 갚음", value: -5 },
      { label: "🍺 술자리 페이 항상 본인이", value: 3 },
      { label: "😢 힘들 때 곁에 있어준 사람", value: 5 },
      { label: "🤝 취업/이직 도와줬어요", value: 4 },
      { label: "🙄 연락은 필요할 때만", value: -3 },
      { label: "🎂 내 생일 꼭 챙겨줘요", value: 2 },
      { label: "✨ 없어요", value: 0 },
    ],
  },
];

function formatAmount(n) {
  if (n >= 10000) return `${n / 10000}만원`;
  return `${n?.toLocaleString()}원`;
}

// ─── 알고리즘 상수 ────────────────────────────────────────────────────────────
// ─── 알고리즘 상수 ────────────────────────────────────────────────────────────
const BASE_ID = "relation";
const CORRECTION_IDS = ["venue", "distance", "eat_at_venue"];
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
  const finalScore = Math.round(
    Math.min((rawScore / MAX_RAW_SCORE) * 100, 100) + distanceScore
  );
  // 거리 페널티는 정규화 후 별도 적용 (100점 초과 방지)

  // ⑤ 식대 최솟값 보정
  const venue = answers.venue;
  const eating = answers.eat_at_venue;
  const avgMeal = venue?.avgMeal || null;
  const isEating = (eating?.value ?? -99) >= 2;
  const mealFloor = isEating && avgMeal ? avgMeal : 0;

  const baseTier = RESULT_TIERS.find(t =>
    finalScore >= t.min && finalScore <= t.max
  ) || RESULT_TIERS[RESULT_TIERS.length - 1];

  const finalTier = (mealFloor > 0 && baseTier.amount < mealFloor)
    ? (RESULT_TIERS.find(t => t.amount >= mealFloor) || RESULT_TIERS[RESULT_TIERS.length - 1])
    : baseTier;

  const randomMessage = finalTier.messages[Math.floor(Math.random() * finalTier.messages.length)];

  return {
    total: finalScore,
    breakdown,
    mealFloor,
    venue,
    tier: { ...finalTier, message: randomMessage },
    upgradedByMeal: finalTier !== baseTier,
  };
}

async function fetchSimilarStats(amount) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
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
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    // 1차: venues 직접 검색
    const { data: directData } = await supabase
      .from('venues')
      .select('name, meal_cost, grade, naver_map_url, tmap_url')
      .ilike('name', `%${name}%`)
      .limit(5);

    // 2차: aliases 테이블에서 검색 → venue_id로 venues 조인
    const { data: aliasData } = await supabase
      .from('venue_aliases')
      .select('venues(name, meal_cost, grade, naver_map_url, tmap_url)')
      .ilike('alias', `%${name}%`)
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

function VenueSearch({ onSelect, onReport }) {
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

  const confirm = (manualGrade) => {
    setConfirmed(true);
    const grade = manualGrade || mealInfo?.grade || 3;
    const avgMeal = mealInfo?.meal_cost
      ? mealInfo.meal_cost
      : mealInfo?.meal_cost_min && mealInfo?.meal_cost_max
        ? Math.round((mealInfo.meal_cost_min + mealInfo.meal_cost_max) / 2)
        : null;
    const venueName = selectedPlace?.place_name || query;
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

  if (confirmed) return null;

  return (
    <div style={{ padding: "4px 0 16px 46px", animation: "fadeSlideIn 0.3s ease" }}>
      {(step === "input" || step === "searching") && (
  <div style={{ position: "relative", marginBottom: 12 }}>
    <div style={{ display: "flex", gap: 8 }}>
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
        placeholder="예) 신라호텔, 롯데호텔..."
        style={{
          flex: 1, padding: "12px 14px", borderRadius: 12,
          border: "2px solid #f0f0f0", fontSize: 16,
          fontFamily: "inherit", outline: "none", background: "#fff"
        }}
      />
      <button onClick={searchPlace} disabled={step === "searching"} style={{
        padding: "12px 16px", borderRadius: 12, border: "none",
        background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
        color: "#fff", cursor: "pointer", fontSize: 14,
        fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap"
      }}>
        {step === "searching" ? "🔍..." : "검색"}
      </button>
    </div>

    {showSuggestions && suggestions.length > 0 && (
      <div style={{
        position: "absolute", top: "100%", left: 0, right: 0,
        background: "#fff", borderRadius: 12,
        border: "1.5px solid #f0f0f0",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        overflow: "hidden", zIndex: 100, marginTop: 6
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
    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <input
        type="text" value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && searchPlace()}
        placeholder="예) 신라호텔, 롯데호텔..."
        style={{
          flex: 1, padding: "12px 14px", borderRadius: 12,
          border: "2px solid #f0f0f0", fontSize: 14,
          fontFamily: "inherit", outline: "none", background: "#fff"
        }}
      />
      <button onClick={searchPlace} style={{
        padding: "12px 16px", borderRadius: 12, border: "none",
        background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
        color: "#fff", cursor: "pointer", fontSize: 14,
        fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap"
      }}>검색</button>
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
      position: "fixed", left: -9999, top: 0, // 화면 밖에 숨김
      width: 390, padding: 32,
      background: `linear-gradient(145deg, #fff 0%, ${tier.color}12 100%)`,
      fontFamily: "'Pretendard', -apple-system, sans-serif",
    }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
        }}>💒</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>착한축의금 알아보기</div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#aaa" }}>weddingfee.vercel.app</div>
      </div>

      {/* 메인 금액 */}
      <div style={{
        background: `linear-gradient(135deg, ${tier.color}20, ${tier.color}08)`,
        border: `2px solid ${tier.color}40`,
        borderRadius: 24, padding: "32px 24px", textAlign: "center", marginBottom: 20
      }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>{tier.emoji}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: 2, marginBottom: 8 }}>
          추천 축의금
        </div>
        <div style={{ fontSize: 52, fontWeight: 900, color: "#111", letterSpacing: -2 }}>
          {formatAmount(tier.amount)}
        </div>
        <div style={{
          display: "inline-block", marginTop: 12,
          background: tier.color, color: "#fff",
          padding: "6px 16px", borderRadius: 100,
          fontSize: 13, fontWeight: 700
        }}>
          {tier.title}
        </div>
      </div>

      {/* 인연 점수 */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#fff", borderRadius: 14, padding: "14px 18px", marginBottom: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
      }}>
        <span style={{ fontSize: 13, color: "#666" }}>나와의 인연 점수</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#111" }}>{total}점</span>
      </div>

      {/* 예식장 */}
      {venue?.name && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#fff", borderRadius: 14, padding: "14px 18px", marginBottom: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
        }}>
          <span style={{ fontSize: 13, color: "#666" }}>예식장</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{venue.name}</span>
        </div>
      )}

      {/* 멘트 */}
      <div style={{
        background: "#fff", borderLeft: `4px solid ${tier.color}`,
        borderRadius: "0 14px 14px 0", padding: "14px 16px", marginBottom: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
      }}>
        <p style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.7 }}>
          {tier.message}
        </p>
      </div>

      {/* 하단 */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#bbb" }}>나도 계산하기 →</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#FF6B6B" }}>weddingfee.vercel.app</div>
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
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

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
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= amount) { setDisplayed(amount); clearInterval(timer); }
      else setDisplayed(Math.round(current / 10000) * 10000);
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

function ResultCard({ result, onRetry, onReport }) {
  const { total, tier } = result;

  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [stats, setStats] = useState(null);
  const cardRef = useRef(null);
  const shareCardRef = useRef(null);

  useEffect(() => {
    const saveAndGetToken = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY
        );

        const token = Math.random().toString(36).substring(2, 10);

        await supabase.from('calculations').insert([{
          score: result.total,
          amount: tier.amount,
          share_token: token,
        }]);

        setShareToken(token);
      } catch (e) {
        console.error('토큰 저장 실패:', e);
      }
    };

    saveAndGetToken();
    fetchSimilarStats(tier.amount).then(setStats);
  }, [result.total, tier.amount]);

  const handleCopy = () => {
    const url = shareToken
      ? `https://weddingfee.vercel.app?token=${shareToken}`
      : `https://weddingfee.vercel.app`;
    navigator.clipboard.writeText(
      `💒 축의금 계산 결과: ${formatAmount(tier.amount)}\n"${tier.title}"\n\n축의금, 이걸로 정하면 욕 안 먹습니다!\n나도 계산하기 → ${url}`
    ).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
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

  window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `추천 축의금은 ${formatAmount(tier.amount)}`,
        description: `"${tier.title}"\n축의금, 이걸로 정하면 욕 안 먹습니다!`,
        imageUrl: "https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png",
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

  return (
    <div style={{ padding: "4px 0 16px 0", animation: "fadeSlideIn 0.4s ease" }}>
      {/* 결과 카드 — 이미지 캡처 영역 */}
      <div ref={cardRef} style={{
        background: `linear-gradient(135deg, ${tier.color}18, ${tier.color}06)`,
        border: `2px solid ${tier.color}30`,
        borderRadius: 20, padding: "28px 20px 24px", textAlign: "center", marginBottom: 12,
        animation: "fadeSlideIn 0.4s ease"
      }}>
        {/* 이모지 — 크고 여백 넉넉히 */}
        <div style={{ fontSize: 56, marginBottom: 16, animation: "popIn 0.5s ease 0.1s both", lineHeight: 1 }}>
          {tier.emoji}
        </div>

        {/* 추천 축의금 배지 */}
        <div style={{
          display: "inline-block",
          background: `${tier.color}22`,
          border: `1px solid ${tier.color}44`,
          borderRadius: 100,
          padding: "4px 14px",
          fontSize: 11, fontWeight: 700, color: tier.color,
          letterSpacing: 1, marginBottom: 14,
          animation: "slideUp 0.4s ease 0.15s both"
        }}>
          추천 축의금
        </div>

        {/* 금액 카운트업 */}
        <AmountCountUp amount={tier.amount} color={tier.color} />

        {/* 타이틀 */}
        <div style={{
          fontSize: 16, fontWeight: 700, color: "#444", marginBottom: 12, marginTop: 4,
          animation: "slideUp 0.4s ease 0.35s both"
        }}>
          {tier.title}
        </div>

        {/* 구분선 */}
        <div style={{ width: 32, height: 2, background: `${tier.color}66`, borderRadius: 2, margin: "0 auto 12px", animation: "slideUp 0.4s ease 0.4s both" }} />

        {/* 멘트 */}
        <p style={{
          fontSize: 13, color: "#555", lineHeight: 1.7, margin: 0,
          animation: "slideUp 0.4s ease 0.45s both"
        }}>
          {tier.message}
        </p>
      </div>

      {/* 점수 */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: "14px 16px",
        marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        animation: "staggerIn 0.4s ease 0.3s both"
      }}>
        <ScoreBar score={total} color={tier.color} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          {result.breakdown?.length > 0 && (
            <button
              onClick={() => setBreakdownOpen(o => !o)}
              style={{
                padding: "4px 10px", borderRadius: 100,
                border: "1px solid #f0f0f0", background: "#fafafa",
                color: "#888", cursor: "pointer", fontSize: 11,
                fontFamily: "inherit", fontWeight: 600
              }}
            >
              {breakdownOpen ? "접기 ▲" : "왜 이 금액? ▼"}
            </button>
          )}
        </div>
        {breakdownOpen && result.breakdown?.length > 0 && (
          <div style={{
            borderTop: "1px solid #f5f5f5", paddingTop: 10, marginTop: 10,
            display: "flex", flexDirection: "column", gap: 6,
            animation: "fadeSlideIn 0.2s ease"
          }}>
            {result.breakdown.map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                animation: `staggerIn 0.3s ease ${i * 0.05}s both`
              }}>
                <span style={{ fontSize: 12, color: "#888", flex: 1, marginRight: 8 }}>{item.label}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: item.score > 0 ? "#22C55E" : "#EF4444"
                }}>
                  {item.score > 0 ? `+${item.score}` : item.score}점
                </span>
              </div>
            ))}
            <div style={{
              borderTop: "1px solid #f5f5f5", paddingTop: 8, marginTop: 2,
              display: "flex", justifyContent: "space-between"
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#444" }}>합계</span>
              <span style={{ fontSize: 12, fontWeight: 900, color: "#111" }}>{total}점</span>
            </div>
          </div>
        )}
      </div>
      {result.upgradedByMeal && (
      <div style={{
        fontSize: 12, color: "#B45309",
        background: "#FFFBEB", border: "1px solid #FDE68A",
        borderRadius: 8, padding: "8px 12px", marginTop: 8, textAlign: "center"
      }}>
        💡 {result.venue?.name} 평균 식대({result.mealFloor?.toLocaleString()}원)를 고려해 한 단계 올렸어요
      </div>
    )}

      {/* 비슷한 사람 통계 */}
      {stats && (
        <div style={{
          background: "#fff", border: "1px solid #f0f0f0",
          borderRadius: 16, padding: "16px", marginBottom: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          animation: "staggerIn 0.4s ease 0.5s both"
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#bbb", letterSpacing: 1, marginBottom: 12 }}>
            📊 최근 30일 · {stats.total.toLocaleString()}명 참여
          </div>

          {/* 이 금액 선택 비율 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#555" }}>나와 비슷한 사람들의 선택</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{stats.percent}%</span>
            </div>
            <div style={{ height: 6, background: "#f5f5f5", borderRadius: 100, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 100,
                background: "linear-gradient(90deg, #FF6B6B, #FF8E53)",
                width: `${stats.percent}%`,
                transition: "width 1s ease 0.6s",
              }} />
            </div>
          </div>

          {/* 최다 선택 금액 */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 12px", background: "#fafafa", borderRadius: 10
          }}>
            <span style={{ fontSize: 12, color: "#888" }}>이번 달 가장 많이 낸 금액</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#FF6B6B" }}>
              {formatAmount(stats.mostCommonAmount)}
            </span>
          </div>
        </div>
      )}

      {/* 핵심 문장 */}
      <div style={{
        background: "#f8f8f8", borderLeft: "3px solid #FF6B6B",
        borderRadius: "0 12px 12px 0", padding: "12px 14px", marginBottom: 12
      }}>
        <p style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.7 }}>
          축의금은 <strong style={{ color: "#111" }}>"관계의 깊이 + 평소 교류 빈도"</strong>로<br />
          기준을 잡는 게 가장 안전하다.<br />
          <span style={{ color: "#FF6B6B", fontWeight: 700 }}>감정이 아니라 기준이 필요하다.</span>
        </p>
      </div>

      {/* 공유 버튼 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleCopy} style={{
            flex: 1, padding: "13px", borderRadius: 14, border: "2px solid #f0f0f0",
            background: "#fff", color: "#333", cursor: "pointer",
            fontSize: 14, fontWeight: 700, fontFamily: "inherit"
          }}>
            {copied ? "✅ 복사됨!" : "🔗 링크 복사"}
          </button>
          <button onClick={handleSaveImage} disabled={saving} style={{
            flex: 1, padding: "13px", borderRadius: 14, border: "2px solid #f0f0f0",
            background: saving ? "#f5f5f5" : "#fff", color: saving ? "#bbb" : "#333",
            cursor: saving ? "default" : "pointer",
            fontSize: 14, fontWeight: 700, fontFamily: "inherit"
          }}>
            {saving ? "⏳ 저장 중..." : "🖼️ 이미지 저장"}
          </button>
        </div>
        <button onClick={handleKakaoShare} style={{
          width: "100%", padding: "13px", borderRadius: 14, border: "none",
          background: "#FEE500", color: "#3A1D1D", cursor: "pointer",
          fontSize: 14, fontWeight: 700, fontFamily: "inherit"
        }}>
          💬 카카오 공유
        </button>
      </div>

      {/* 제보하기 */}
      <div style={{
        background: "linear-gradient(135deg, #667eea15, #764ba215)",
        border: "1.5px solid #667eea30", borderRadius: 16,
        padding: "16px", marginBottom: 10, textAlign: "center"
      }}>
        <div style={{ fontSize: 18, marginBottom: 6 }}>📮</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>
          예식장 식대 정보를 알고 있나요?
        </div>
        <p style={{ fontSize: 12, color: "#666", margin: "0 0 10px", lineHeight: 1.5 }}>
          모두가 풍요로운 축의가 될 수 있도록!<br />
          <strong style={{ color: "#667eea" }}>매달 추첨으로 선물 🎁</strong>을 드려요
        </p>
        <button onClick={onReport} style={{
          padding: "9px 20px", borderRadius: 100, border: "none",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit"
        }}>
          제보하기 →
        </button>
      </div>

      {/* 웨딩플래너 배너 */}
      <div style={{
        background: "#fff", border: "1px solid #e8ecff", borderRadius: 14,
        padding: "12px 16px", marginBottom: 12,
        display: "flex", alignItems: "center", gap: 10
      }}>
        <span style={{ fontSize: 24 }}>💍</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#aaa" }}>AD · 제휴문의 welcome</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>웨딩플래너 무료 상담</div>
          <div style={{ fontSize: 11, color: "#888" }}>견적 비교하고 최대 30% 절약</div>
        </div>
        <button style={{
          padding: "7px 12px", borderRadius: 8, border: "1px solid #e8ecff",
          background: "#fff", color: "#667eea", cursor: "pointer",
          fontSize: 12, fontWeight: 700, fontFamily: "inherit"
        }}>상담받기</button>
      </div>

      <button onClick={onRetry} style={{
        width: "100%", padding: "14px", borderRadius: 14, border: "none",
        background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
        color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "inherit",
        boxShadow: "0 4px 16px rgba(255,107,107,0.3)"
      }}>
        🔄 다시 계산하기
      </button>

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
  const [showReport, setShowReport] = useState(false);
  const [result, setResult] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
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

      const { createClient } = await import("@supabase/supabase-js");

      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

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

    const nextStep = stepIndex + 1;

    if (nextStep >= CHAT_FLOW.length) {
      // 결과 계산
      await addBotMessage("좋아요! 이제 최적 금액을 계산할게요... 🧮", 600);
      setTimeout(async () => {
        const r = calcResult(newAnswers);
        setResult(r);
        await addBotMessage(
          `계산 완료됐어요! 🎉\n\n추천 축의금은 아래와 같아요.`,
          800
        );
        setIsDone(true);
        setMessages(prev => [...prev, { type: "result", id: Date.now() }]);
        scrollToBottom();
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

  const retry = () => {
    setMessages([]);
    setAnswers({});
    setIsDone(false);
    setResult(null);
    setTimeout(() => {
      setMessages([{ type: "bot", text: "안녕하세요! 👋\n축의금 얼마 낼지 같이 계산해볼게요.\n\n먼저, 이 분과 어떤 관계예요?", id: Date.now() }]);
      setMessages(prev => [...prev, { type: "options", step: 0, id: Date.now() + 1 }]);
    }, 100);
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
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
        }}>💒</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>착한 축의금을 찾아서...</div>
          <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>● 온라인</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {/* 다크모드 토글 */}
        <button onClick={() => setIsDark(d => !d)} style={{
          padding: "7px 12px", borderRadius: 100, border: "none",
          background: "var(--surface2)", color: "var(--text2)",
          cursor: "pointer", fontSize: 14, fontFamily: "inherit"
        }}>{isDark ? "☀️" : "🌙"}</button>
        {isDone && (
          <button onClick={retry} style={{
            padding: "7px 14px", borderRadius: 100, border: "none",
            background: "var(--surface2)", color: "var(--text2)", cursor: "pointer",
            fontSize: 12, fontWeight: 600, fontFamily: "inherit"
          }}>처음으로</button>
        )}
      </div>
    </div>

          {/* 인트로 배너 */}
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
              <div style={{ textAlign: "center", marginBottom: 24, animation: "popIn 0.6s ease forwards" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>💒</div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111", margin: "0 0 6px", fontFamily: "inherit" }}>착한축의금</h1>
                <p style={{ fontSize: 15, color: "#888", margin: 0 }}>AI 축의금 계산기</p>
              </div>
              <div style={{ animation: "slideUp 0.5s ease 0.2s both" }}>
                <div style={{
                  background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                  borderRadius: 14, padding: "14px 16px", marginBottom: 20
                }}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: "8px 0 0", lineHeight: 1.6 }}>
                    관계의 깊이 + 평소 교류 빈도로<br />
                    감정이 아니라 기준으로 계산해드려요.
                  </p>
                </div>
              </div>
              {[
                { emoji: "🎯", text: "친밀도 기반 점수 계산" },
                { emoji: "🏨", text: "예식장 등급 반영" },
                { emoji: "📍", text: "거리·식사 여부까지 고려" },
                { emoji: "🔗", text: "카카오 공유 가능" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", background: "#fff", borderRadius: 12,
                  marginBottom: 8, border: "1px solid #f0f0f0",
                  animation: `staggerIn 0.4s ease ${0.3 + i * 0.08}s both`,
                }}>
                  <span style={{ fontSize: 20 }}>{item.emoji}</span>
                  <span style={{ fontSize: 14, color: "#444", fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
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
              <div style={{ animation: "slideUp 0.5s ease 0.7s both" }}>
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
                  계산 시작하기 →
                </button>
                <p style={{ textAlign: "center", fontSize: 11, color: "#ccc", marginTop: 12 }}>질문 11개 · 약 2분 소요 · 완전 무료</p>
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
                    onSelect={(answer) => handleAnswer(msg.step, answer)}
                    onReport={() => setShowReport(true)}
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
                  <ResultCard
                    key={msg.id}
                    result={result}
                    onRetry={retry}
                    onReport={() => setShowReport(true)}
                  />
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
    {showReport && <ReportModal onClose={() => setShowReport(false)} />}
    </>
  );
}
