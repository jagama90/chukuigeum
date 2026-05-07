import { useState, useEffect, useRef } from "react";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const RESULT_TIERS = [
  { min: -99, max: 10, amount: 30000, title: "마음만 받을게요 😅", emoji: "🌱", color: "#95a5a6",
    message: "솔직히 말할게요. 이 분과의 인연은 얇아요. 3만원도 충분한 성의예요." },
  { min: 11, max: 18, amount: 50000, title: "국룰 5만원! 🤝", emoji: "💵", color: "#27ae60",
    message: "축의금 세계의 황금비율. 5만원은 가장 정직한 표현이에요." },
  { min: 19, max: 26, amount: 70000, title: "7만원... 진심 🫡", emoji: "💐", color: "#2980b9",
    message: "5만원은 좀 적고 10만원은 좀 부담스러운 그 사이. 따뜻한 시그널이에요." },
  { min: 27, max: 35, amount: 100000, title: "10만원, 진짜 친구 ✅", emoji: "👑", color: "#8e44ad",
    message: "이 분은 당신의 진짜 친구예요. 10만원짜리 우정은 흔하지 않아요." },
  { min: 36, max: 45, amount: 150000, title: "15만원... 형제야? 🥹", emoji: "🫂", color: "#e67e22",
    message: "이 정도면 그냥 가족이에요. 받는 분도 평생 기억할 거예요." },
  { min: 46, max: 999, amount: 200000, title: "20만원+ 전생에 나라 구했나 🏆", emoji: "💎", color: "#c0392b",
    message: "이 분이 당신 삶에 미친 영향은 돈으로 환산이 안 돼요." },
];

const CHAT_FLOW = [
  {
    id: "relation",
    botMessage: "안녕하세요! 👋\n축의금 얼마 낼지 같이 계산해볼게요.\n\n먼저, 이 분과 어떤 관계예요?",
    type: "select",
    options: [
      { label: "👨‍👩‍👧 가족 / 친척", value: 20 },
      { label: "🤗 절친 / 베프", value: 12 },
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
      { label: "✅ 왔어요 (보통으로)", value: 5 },
      { label: "📞 못 왔는데 연락은 했어요", value: 2 },
      { label: "😶 연락 없었어요", value: 0 },
      { label: "💍 나 아직 미혼이에요", value: 3 },
    ],
  },
  {
    id: "kakao_speed",
    botMessage: "카톡 보내면 답장 속도가 어때요?\n(평균적으로)",
    type: "select",
    options: [
      { label: "⚡ 즉시 (1분 이내)", value: 3 },
      { label: "🙂 빠른 편 (1시간 이내)", value: 2 },
      { label: "🐌 느린 편 (하루 이내)", value: 1 },
      { label: "👻 거의 안 읽어요", value: 0 },
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
    botMessage: "예식장이 어디예요?\n이름으로 검색해보세요 🔍",
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
    type: "select",
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

function calcResult(answers) {
  // 관계 점수 (venue, distance, eat_at_venue 제외하고 합산)
  const EXCLUDE = ["venue", "distance", "eat_at_venue"];
  let relationScore = 0;
  CHAT_FLOW.forEach((q) => {
    if (EXCLUDE.includes(q.id)) return;
    const ans = answers[q.id];
    if (!ans) return;
    if (q.type === "multi_select") {
      relationScore += (Array.isArray(ans) ? ans : [ans])
        .reduce((s, v) => s + (typeof v === "object" ? v.value : v), 0);
    } else {
      relationScore += ans.value || 0;
    }
  });

  // 거리 페널티 별도 적용
  relationScore += answers.distance?.value || 0;

  // 식대 최솟값 계산
  const venue = answers.venue;
  const eating = answers.eat_at_venue;
  const avgMeal = venue?.avgMeal || null;
  const isEating = (eating?.value ?? -99) >= 2;
  const mealFloor = isEating && avgMeal ? avgMeal : 0;

  // 관계 점수로 기본 tier 결정
  const baseTier = RESULT_TIERS.find(t =>
    relationScore >= t.min && relationScore <= t.max
  ) || RESULT_TIERS[RESULT_TIERS.length - 1];

  // 식대가 tier 금액보다 높으면 한 단계 상향
  const finalTier = (mealFloor > 0 && baseTier.amount < mealFloor)
    ? (RESULT_TIERS.find(t => t.amount >= mealFloor) || RESULT_TIERS[RESULT_TIERS.length - 1])
    : baseTier;

  return {
    total: relationScore,
    mealFloor,
    venue,
    tier: finalTier,
    upgradedByMeal: finalTier !== baseTier,
  };
}

const KAKAO_REST_KEY = "8d0b83fa198b31cae5def051d09b626f";

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
        fontSize: 14, lineHeight: 1.6,
        boxShadow: "0 2px 8px rgba(255,107,107,0.25)"
      }}>
        {text}
      </div>
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

  const showOptions = !selected || isReselecting;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0 16px 46px", animation: "fadeSlideIn 0.3s ease" }}>
      {showOptions ? (
        options.map((opt) => (
          <button key={opt.label} onClick={() => handleSelect(opt)} style={{
            padding: "11px 16px", borderRadius: 12, textAlign: "left",
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
          <button onClick={() => setIsReselecting(true)} style={{
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
              padding: "11px 16px", borderRadius: 12, textAlign: "left",
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
    const { data } = await supabase
      .from('venues')
      .select('name, meal_cost, grade, naver_map_url, tmap_url')
      .or(`name.ilike.%${name}%,name.ilike.%${name.replace('서울', '').trim()}%`)
      .limit(5);
    return data?.length > 0 ? data : null;
  } catch {
    return null;
  }
}

// ─── Claude API 식대 추정 ────────────────────────────────────────────────────
async function fetchMealCostFromAI(venueName, address) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
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
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return null; // 로컬에서는 CORS로 막힘, 배포 후 정상 작동
  }
}

const GRADE_MAP = { 5: "5성급 호텔", 4: "4성급 / 고급 웨딩홀", 3: "일반 웨딩홀", 2: "일반 예식장", 1: "스몰웨딩" };
const GRADE_SCORE = { 5: 10, 4: 7, 3: 5, 2: 3, 1: 2 };

function VenueSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [step, setStep] = useState("input");
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mealInfo, setMealInfo] = useState(null);
  const [mealLoading, setMealLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // 자동완성 목록
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    const dbData = await searchMealCostFromDB(place.place_name);
    if (dbData && Array.isArray(dbData)) {
      if (dbData.length === 1) {
        setMealInfo({ ...dbData[0], source: "db" });
      } else {
        setMealInfo({ source: "db_multi", list: dbData });
      }
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
    onSelect({
      name: selectedPlace?.place_name || query,
      address: selectedPlace?.address_name || "",
      score: GRADE_SCORE[grade] || 4,
      label: GRADE_MAP[grade] || "웨딩홀",
      avgMeal,
      kakaoUrl: selectedPlace?.place_url,
      naverMapUrl: mealInfo?.naver_map_url,
      tmapUrl: mealInfo?.tmap_url,
    });
  };

  if (confirmed) return null;

  return (
    <div style={{ padding: "4px 0 16px 46px", animation: "fadeSlideIn 0.3s ease" }}>
      {(step === "input" || step === "searching") && (
  <div style={{ position: "relative", marginBottom: 12 }}>
    {/* input + 검색버튼 */}
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
          border: "2px solid #f0f0f0", fontSize: 14,
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

    {/* 드롭다운 — input 아래로 */}
    {showSuggestions && suggestions.length > 0 && (
      <div style={{
        position: "absolute", top: "100%", left: 0, right: 48,
        background: "#fff", borderRadius: "0 0 12px 12px",
        border: "1.5px solid #f0f0f0", borderTop: "none",
        boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
        overflow: "hidden", zIndex: 100, marginTop: 2
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
                    <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 700, marginBottom: 6 }}>✅ 실제 제보 데이터</div>
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
                  <div style={{ fontSize: 13, color: "#888", textAlign: "center" }}>
                    식대 정보를 찾지 못했어요.<br />아래에서 등급을 선택해주세요.
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

function ReportModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ venue: "", address: "", mealCost: "", venueFee: "", email: "", file: null });

  const handleSubmit = async () => {
    if (!form.venue || !form.mealCost) { alert('예식장 이름과 식대는 필수예요!'); return; }
    let fileUrl = null;
    if (form.file) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
      const ext = form.file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { data } = await supabase.storage.from('venue-reports').upload(fileName, form.file);
      if (data) {
        const { data: urlData } = supabase.storage.from('venue-reports').getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }
    }
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
    const { error } = await supabase.from('venue_reports').insert([{
      venue_name: form.venue, address: form.address,
      meal_cost: form.mealCost ? parseInt(form.mealCost) : null,
      venue_fee: form.venueFee ? parseInt(form.venueFee) : null,
      reporter_email: form.email, file_url: fileUrl, status: 'pending'
    }]);
    if (!error) setStep(2);
    else alert('저장 중 오류가 났어요. 다시 시도해주세요!');
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 480, fontFamily: "inherit" }}>
        {step === 1 ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📮</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", fontFamily: "inherit" }}>예식장 정보 제보하기</h3>
              <p style={{ fontSize: 13, color: "#888", margin: 0 }}>모두가 풍요로운 축의가 될 수 있도록!<br />매달 추첨으로 선물을 드려요 🎁</p>
            </div>
            {[
              { key: "venue", label: "예식장 이름 *", placeholder: "예) 롯데호텔 서울" },
              { key: "address", label: "주소", placeholder: "예) 서울 중구 을지로 30" },
              { key: "mealCost", label: "1인 식대 (원) *", placeholder: "예) 80000", type: "number" },
              { key: "venueFee", label: "대관비 (원)", placeholder: "예) 3000000", type: "number" },
              { key: "email", label: "이메일 (추첨 연락용)", placeholder: "example@email.com" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>{f.label}</label>
                <input type={f.type || "text"} placeholder={f.placeholder} value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #f0f0f0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fafafa" }} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>견적서 / 정산서 첨부 (선택)</label>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 10, border: "1.5px dashed #ddd", background: "#fafafa", cursor: "pointer", fontSize: 13, color: "#888" }}>
                📎 {form.file ? form.file.name : "파일 첨부하기"}
                <input type="file" style={{ display: "none" }} accept=".pdf,.jpg,.png" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />
              </label>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1.5px solid #f0f0f0", background: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "inherit", color: "#666", fontWeight: 600 }}>취소</button>
              <button onClick={handleSubmit} style={{ flex: 2, padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>제보 완료!</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", fontFamily: "inherit" }}>제보 감사해요!</h3>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: "0 0 24px" }}>이번 달 추첨에 자동으로 참여됩니다 🎁</p>
            <button onClick={onClose} style={{ padding: "14px 40px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "inherit" }}>확인</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ result, onRetry, onReport }) {
  const { total, tier } = result;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `💒 축의금 계산 결과: ${formatAmount(tier.amount)}\n"${tier.title}"\n\n축의금, 이걸로 정하면 욕 안 먹습니다!\n나도 계산하기 → https://chukuigeum.vercel.app`
    ).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ padding: "4px 0 16px 0", animation: "fadeSlideIn 0.4s ease" }}>
      {/* 결과 카드 */}
      <div style={{
        background: `linear-gradient(135deg, ${tier.color}18, ${tier.color}06)`,
        border: `2px solid ${tier.color}30`,
        borderRadius: 20, padding: "24px 20px", textAlign: "center", marginBottom: 12
      }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>{tier.emoji}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: 1, marginBottom: 6 }}>
          추천 축의금
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: "#111", lineHeight: 1, marginBottom: 8, fontFamily: "inherit" }}>
          {formatAmount(tier.amount)}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#333", marginBottom: 10 }}>{tier.title}</div>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: 0 }}>{tier.message}</p>
      </div>

      {/* 점수 */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: "14px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <span style={{ fontSize: 14, color: "#666" }}>나와의 인연 점수</span>
        <span style={{ fontSize: 24, fontWeight: 900, color: "#111" }}>{total}점</span>
      </div>
      {result.upgradedByMeal && (
      <div style={{
        fontSize: 12, color: "#B45309",
        background: "#FFFBEB", border: "1px solid #FDE68A",
        borderRadius: 8, padding: "8px 12px", marginTop: 8, textAlign: "center"
      }}>
        💡 {result.venue?.name} 식대({result.mealFloor?.toLocaleString()}원)를
        고려해 한 단계 올렸어요
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
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={handleCopy} style={{
          flex: 1, padding: "13px", borderRadius: 14, border: "2px solid #f0f0f0",
          background: "#fff", color: "#333", cursor: "pointer",
          fontSize: 14, fontWeight: 700, fontFamily: "inherit"
        }}>
          {copied ? "✅ 복사됨!" : "🔗 링크 복사"}
        </button>
        <button style={{
          flex: 1, padding: "13px", borderRadius: 14, border: "none",
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
        🔄 다른 사람도 계산하기
      </button>
    </div>
  );
}

// ─── 메인 앱 ─────────────────────────────────────────────────────────────────

export default function App() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [result, setResult] = useState(null);
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

  // 시작
  useEffect(() => {
    if (!started) return;
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
      : answer.label || answer.name || String(answer);

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
    setCurrentStep(0);
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
        body { margin: 0; background: #f2f3f7; font-family: 'Pretendard', -apple-system, sans-serif; }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        button { font-family: 'Pretendard', -apple-system, sans-serif; }
        input { font-family: 'Pretendard', -apple-system, sans-serif; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", justifyContent: "center",
        background: "#f2f3f7"
      }}>
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column" }}>

          {/* 헤더 */}
          <div style={{
            background: "#fff", padding: "14px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
              }}>💒</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#111" }}>얼마 내야 해?</div>
                <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>● 온라인</div>
              </div>
            </div>
            {isDone && (
              <button onClick={retry} style={{
                padding: "7px 14px", borderRadius: 100, border: "none",
                background: "#f5f5f5", color: "#666", cursor: "pointer",
                fontSize: 12, fontWeight: 600, fontFamily: "inherit"
              }}>처음으로</button>
            )}
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
                  {/* 인트로 화면 */}
          {!started && (
            <div style={{ padding: "24px 16px", animation: "fadeSlideIn 0.5s ease" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{ fontSize: 64, marginBottom: 12 }}>💒</div>

                <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111", margin: "0 0 6px", fontFamily: "inherit" }}>얼마 내야 해?</h1>
                <p style={{ fontSize: 15, color: "#888", margin: 0 }}>AI 축의금 계산기</p>
              </div>
              <div style={{ background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.4 }}>💬 축의금, 이걸로 정하면<br />욕 안 먹습니다.</p>
              </div>
              <div style={{ background: "#f8f8f8", borderLeft: "3px solid #FF6B6B", borderRadius: "0 12px 12px 0", padding: "12px 14px", marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.7 }}>
                  축의금은 <strong style={{ color: "#111" }}>"관계의 깊이 + 평소 교류 빈도"</strong>로<br />
                  기준을 잡는 게 가장 안전하다.<br />
                  <span style={{ color: "#FF6B6B", fontWeight: 700 }}>감정이 아니라 기준이 필요하다.</span>
                </p>
              </div>
              {[
                { emoji: "🎯", text: "친밀도 기반 점수 계산" },
                { emoji: "🏨", text: "예식장 등급 반영" },
                { emoji: "📍", text: "거리·식사 여부까지 고려" },
                { emoji: "🔗", text: "카카오 공유 가능" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fff", borderRadius: 12, marginBottom: 8, border: "1px solid #f0f0f0" }}>
                  <span style={{ fontSize: 20 }}>{item.emoji}</span>
                  <span style={{ fontSize: 14, color: "#444", fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
              <div style={{ background: "#f8f9ff", border: "1px solid #e0e8ff", borderRadius: 14, padding: "12px 16px", marginBottom: 20, marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>💍</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#aaa" }}>SPONSORED</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>웨딩 준비 중이신가요?</div>
                  <div style={{ fontSize: 11, color: "#888" }}>제휴 웨딩플래너 무료 상담 →</div>
                </div>
              </div>
              <button onClick={() => setStarted(true)} style={{
                width: "100%", padding: "17px", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                color: "#fff", cursor: "pointer", fontSize: 17, fontWeight: 800,
                fontFamily: "inherit", boxShadow: "0 6px 24px rgba(255,107,107,0.35)"
              }}>계산 시작하기 →</button>
              <p style={{ textAlign: "center", fontSize: 11, color: "#ccc", marginTop: 12 }}>질문 11개 · 약 2분 소요 · 완전 무료</p>
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
                      onSelect={(opt) => !msg.selected && handleAnswer(msg.step, opt)}
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
                      onSelect={(venue) => handleAnswer(msg.step, venue)}
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
