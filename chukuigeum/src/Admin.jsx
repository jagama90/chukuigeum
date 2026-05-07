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
    botMessage: (prev) => `${prev.relation?.label?.split(' ')[1] || ''}군요!\n\n최근 1년 동안 같이 밥은 몇 번 먹었어요?`,
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
    botMessage: "내 결혼식(또는 중요한 행사) 때\n이 분 오셨나요?",
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
      { label: "🚌 10km 이상", value: 3 },
      { label: "🚗 20km 이상", value: 5 },
      { label: "✈️ 타지역 / 지방", value: 7 },
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
  let total = 0;
  CHAT_FLOW.forEach((q) => {
    const ans = answers[q.id];
    if (!ans) return;
    if (q.type === "multi_select") {
      const sum = (Array.isArray(ans) ? ans : [ans]).reduce((s, v) => s + v, 0);
      total += sum;
    } else if (q.type === "venue_search") {
      total += ans.score || 0;
    } else {
      total += ans.value || 0;
    }
  });
  return {
    total,
    tier: RESULT_TIERS.find(t => total >= t.min && total <= t.max) || RESULT_TIERS[RESULT_TIERS.length - 1]
  };
}

// ─── Claude API로 예식장 식대 추정 ───────────────────────────────────────────
async function fetchVenueInfo(venueName) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `한국 예식장 "${venueName}"의 정보를 알려주세요. 다음 JSON 형식으로만 답해주세요 (다른 텍스트 없이):
{
  "name": "정확한 예식장 이름",
  "address": "주소",
  "grade": 등급(1-5 숫자),
  "meal_cost_min": 최소식대(숫자),
  "meal_cost_max": 최대식대(숫자),
  "description": "한 줄 설명",
  "confidence": "high/medium/low"
}
정보가 없으면 null을 반환하세요.`
        }]
      })
    });
    const data = await res.json();
    const text = data.content?.filter(c => c.type === "text").map(c => c.text).join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed;
  } catch {
    return null;
  }
}

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
    <div style={{
      display: "flex", gap: 10, marginBottom: 16,
      animation: isNew ? "fadeSlideIn 0.3s ease" : "none"
    }}>
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
        whiteSpace: "pre-line"
      }}>
        {text}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div style={{
      display: "flex", justifyContent: "flex-end", marginBottom: 16,
      animation: "fadeSlideIn 0.2s ease"
    }}>
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

function SelectOptions({ options, onSelect, selected }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 8,
      padding: "4px 0 16px 46px",
      animation: "fadeSlideIn 0.3s ease"
    }}>
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => !selected && onSelect(opt)}
          style={{
            padding: "11px 16px", borderRadius: 12, textAlign: "left",
            border: selected?.label === opt.label ? "2px solid #FF6B6B" : "2px solid #f0f0f0",
            background: selected?.label === opt.label ? "#FFF5F5" : "#fff",
            color: selected?.label === opt.label ? "#FF6B6B" : "#333",
            cursor: selected ? "default" : "pointer",
            fontSize: 14, fontWeight: selected?.label === opt.label ? 700 : 500,
            fontFamily: "inherit", transition: "all 0.15s",
            opacity: selected && selected.label !== opt.label ? 0.4 : 1,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function MultiSelectOptions({ options, onConfirm }) {
  const [selected, setSelected] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const toggle = (opt) => {
    if (confirmed) return;
    if (opt.value === 0) {
      setSelected([opt]);
      return;
    }
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
            <button
              key={opt.label}
              onClick={() => toggle(opt)}
              style={{
                padding: "11px 16px", borderRadius: 12, textAlign: "left",
                border: isSelected ? "2px solid #FF6B6B" : "2px solid #f0f0f0",
                background: isSelected ? "#FFF5F5" : "#fff",
                color: isSelected ? "#FF6B6B" : "#333",
                cursor: confirmed ? "default" : "pointer",
                fontSize: 14, fontWeight: isSelected ? 700 : 500,
                fontFamily: "inherit", transition: "all 0.15s",
                opacity: confirmed && !isSelected ? 0.4 : 1,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {!confirmed && (
        <button
          onClick={confirm}
          disabled={selected.length === 0}
          style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: selected.length > 0 ? "linear-gradient(135deg, #FF6B6B, #FF8E53)" : "#f0f0f0",
            color: selected.length > 0 ? "#fff" : "#ccc",
            cursor: selected.length > 0 ? "pointer" : "default",
            fontSize: 14, fontWeight: 700, fontFamily: "inherit",
          }}
        >
          선택 완료 ({selected.length}개)
        </button>
      )}
    </div>
  );
}

function VenueSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResult(null);
    setNotFound(false);

    const info = await fetchVenueInfo(query);

    setSearching(false);
    if (info && info.name) {
      setResult(info);
    } else {
      setNotFound(true);
    }
  };

  const gradeMap = { 5: "5성급 호텔", 4: "4성급 / 고급 웨딩홀", 3: "일반 웨딩홀", 2: "일반 예식장", 1: "스몰웨딩" };
  const gradeScore = { 5: 10, 4: 7, 3: 5, 2: 3, 1: 2 };

  const confirm = () => {
    if (!result) return;
    setConfirmed(true);
    const avgMeal = result.meal_cost_min && result.meal_cost_max
      ? Math.round((result.meal_cost_min + result.meal_cost_max) / 2)
      : null;
    onSelect({
      ...result,
      score: gradeScore[result.grade] || 4,
      avgMeal,
      label: result.name,
    });
  };

  if (confirmed) return null;

  return (
    <div style={{ padding: "4px 0 16px 46px", animation: "fadeSlideIn 0.3s ease" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder="예) 신라호텔, 롯데호텔..."
          style={{
            flex: 1, padding: "12px 14px", borderRadius: 12,
            border: "2px solid #f0f0f0", fontSize: 14, fontFamily: "inherit",
            outline: "none", background: "#fff"
          }}
        />
        <button
          onClick={search}
          disabled={searching}
          style={{
            padding: "12px 16px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
            color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
            fontFamily: "inherit", whiteSpace: "nowrap"
          }}
        >
          {searching ? "🔍..." : "검색"}
        </button>
      </div>

      {searching && (
        <div style={{
          background: "#fff", borderRadius: 14, padding: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)", fontSize: 13, color: "#888",
          display: "flex", alignItems: "center", gap: 8
        }}>
          <div style={{ animation: "spin 1s linear infinite", fontSize: 16 }}>⏳</div>
          AI가 예식장 정보를 찾고 있어요...
        </div>
      )}

      {result && !confirmed && (
        <div style={{
          background: "#fff", borderRadius: 14, padding: "16px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)", border: "2px solid #FF6B6B20"
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 12 }}>
            📍 {result.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {[
              { label: "주소", value: result.address },
              { label: "등급", value: gradeMap[result.grade] || "-" },
              { label: "식대 (추정)", value: result.meal_cost_min && result.meal_cost_max
                ? `${result.meal_cost_min.toLocaleString()}~${result.meal_cost_max.toLocaleString()}원`
                : "정보 없음" },
              { label: "설명", value: result.description },
            ].filter(i => i.value).map(item => (
              <div key={item.label} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                <span style={{ color: "#999", width: 70, flexShrink: 0 }}>{item.label}</span>
                <span style={{ color: "#333", fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
          {result.confidence === "low" && (
            <div style={{
              fontSize: 11, color: "#F59E0B", background: "#FFFBEB",
              padding: "6px 10px", borderRadius: 8, marginBottom: 12
            }}>
              ⚠️ AI 추정 정보예요. 실제와 다를 수 있어요.
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={confirm} style={{
              flex: 2, padding: "12px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
              color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit"
            }}>
              ✅ 여기 맞아요!
            </button>
            <button onClick={() => { setResult(null); setQuery(""); }} style={{
              flex: 1, padding: "12px", borderRadius: 12, border: "2px solid #f0f0f0",
              background: "#fff", color: "#666", cursor: "pointer", fontSize: 14, fontFamily: "inherit"
            }}>
              다시 검색
            </button>
          </div>
        </div>
      )}

      {notFound && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{
            background: "#FFF5F5", borderRadius: 12, padding: "12px 14px",
            fontSize: 13, color: "#888"
          }}>
            정확한 정보를 찾지 못했어요. 직접 선택해주세요.
          </div>
          {[
            { label: "5성급 호텔", score: 10 },
            { label: "4성급 / 고급 웨딩홀", score: 7 },
            { label: "일반 웨딩홀", score: 5 },
            { label: "일반 예식장", score: 3 },
            { label: "스몰웨딩 / 야외", score: 2 },
          ].map(opt => (
            <button key={opt.label} onClick={() => {
              setConfirmed(true);
              onSelect({ name: query || "예식장", score: opt.score, label: opt.label });
            }} style={{
              padding: "11px 16px", borderRadius: 12, border: "2px solid #f0f0f0",
              background: "#fff", color: "#333", cursor: "pointer",
              fontSize: 14, fontFamily: "inherit", textAlign: "left"
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
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
    const start = async () => {
      await addBotMessage("안녕하세요! 👋\n축의금 얼마 낼지 같이 계산해볼게요.\n\n먼저, 이 분과 어떤 관계예요?", 600);
      setMessages(prev => [...prev, { type: "options", step: 0, id: Date.now() + 1 }]);
      scrollToBottom();
    };
    start();
  }, []);

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
          {messages.length <= 2 && (
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
    </>
  );
}
