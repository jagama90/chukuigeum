import { useState, useEffect } from "react";
import { saveCalculation, saveVenueReport, uploadReportFile, getCalculationByToken } from './lib/db'


// ─── 데이터 ───────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: "relation",
    emoji: "👥",
    question: "이 사람, 나랑 어떤 사이야?",
    subtitle: "솔직하게 골라봐. 판단 안 해",
    type: "single",
    options: [
      { label: "가족 / 친척", value: 20, desc: "피는 물보다 진하죠" },
      { label: "절친 / 베프", value: 12, desc: "같이 울고 웃은 사이" },
      { label: "친한 친구", value: 8, desc: "연락은 가끔, 만나면 좋은" },
      { label: "직장 동료", value: 5, desc: "점심은 같이 먹는 사이" },
      { label: "지인 / 아는 사람", value: 2, desc: "이름은 아는데..." },
      { label: "SNS 친구", value: 1, desc: "팔로우는 함" },
    ],
  },
  {
    id: "meal_count",
    emoji: "🍽️",
    question: "최근 1년 동안 같이 밥은 몇 번 먹었어?",
    subtitle: "배달음식 시켜먹은 것도 인정",
    type: "single",
    options: [
      { label: "0번", value: 0, desc: "밥친구는 아님" },
      { label: "1~2번", value: 2, desc: "가끔 생각나는 사이" },
      { label: "3~5번", value: 4, desc: "나름 자주 봤네" },
      { label: "6~10번", value: 6, desc: "거의 매달 봤구나" },
      { label: "10번 이상", value: 8, desc: "이 사람이랑 살아?" },
    ],
  },
  {
    id: "my_wedding",
    emoji: "💍",
    question: "나 결혼식 때 이 사람 왔어?",
    subtitle: "미혼이면 과거 생일파티나 중요한 행사로 생각해봐",
    type: "single",
    options: [
      { label: "왔고, 축의금도 두둑이 냈어", value: 8, desc: "갚아야지..." },
      { label: "왔어 (보통으로)", value: 5, desc: "의리는 있어" },
      { label: "못 왔는데 연락은 했어", value: 2, desc: "마음은 전했구나" },
      { label: "아예 몰랐거나 연락 없었어", value: 0, desc: "..." },
      { label: "나 아직 미혼이야", value: 3, desc: "언젠간 올거야" },
    ],
  },
  {
    id: "kakao_speed",
    emoji: "💬",
    question: "카톡 보내면 답장 속도는?",
    subtitle: "평균적으로",
    type: "single",
    options: [
      { label: "즉시 답장 (1분 이내)", value: 3, desc: "폰 손에서 안 놓나봐" },
      { label: "빠른 편 (1시간 이내)", value: 2, desc: "나름 신경 써주는 편" },
      { label: "느린 편 (하루 이내)", value: 1, desc: "바쁜가봐" },
      { label: "거의 안 읽어", value: 0, desc: "읽씹의 달인" },
      { label: "읽씹 전문", value: -2, desc: "...진심이야?" },
    ],
  },
  {
    id: "last_meet",
    emoji: "📅",
    question: "마지막으로 직접 만난 게 언제야?",
    subtitle: "화상통화는 반만 인정",
    type: "single",
    options: [
      { label: "이번 달 이내", value: 4, desc: "최근에 봤구나" },
      { label: "3개월 이내", value: 3, desc: "그래도 자주 보는 편" },
      { label: "6개월 이내", value: 2, desc: "가끔 보는 사이" },
      { label: "1년 이내", value: 1, desc: "시간이 좀 됐네" },
      { label: "1년 넘었어", value: 0, desc: "기억이 가물가물" },
    ],
  },
  {
    id: "venue_grade",
    emoji: "🏨",
    question: "예식장 등급이 어떻게 돼?",
    subtitle: "식대가 곧 축의금 기준선이야",
    type: "single",
    options: [
      { label: "5성급 호텔 (롯데, 신라, 그랜드 등)", value: 10, desc: "식대 10만원~" },
      { label: "4성급 호텔 / 고급 웨딩홀", value: 7, desc: "식대 7~9만원대" },
      { label: "일반 웨딩홀 (중급)", value: 5, desc: "식대 5~7만원대" },
      { label: "일반 예식장 / 뷔페", value: 3, desc: "식대 3~5만원대" },
      { label: "스몰웨딩 / 야외", value: 2, desc: "분위기 있겠다" },
      { label: "잘 모르겠어", value: 4, desc: "평균으로 계산할게" },
    ],
  },
  {
    id: "eat_at_venue",
    emoji: "🥢",
    question: "식장 가서 밥은 먹고 올 거야?",
    subtitle: "식대가 곧 축의금 원가야. 솔직하게",
    type: "single",
    options: [
      { label: "당연히 먹지 🍱", value: 5, desc: "밥값은 해야지" },
      { label: "먹을 수도 있고 아닐 수도 있고", value: 2, desc: "애매한 상황" },
      { label: "안 먹어 (바빠서 / 멀어서)", value: 0, desc: "축의금으로만 성의 표현" },
      { label: "참석 자체를 못 해", value: 0, desc: "마음만 전달" },
    ],
  },
  {
    id: "distance",
    emoji: "📍",
    question: "집에서 식장까지 거리가 얼마나 돼?",
    subtitle: "멀수록 더 성의 있는 거잖아",
    type: "single",
    options: [
      { label: "10km 미만 (가까워)", value: 0, desc: "그냥 동네잖아" },
      { label: "10km 이상 (좀 멀어)", value: 3, desc: "지하철 2~3정거장 이상" },
      { label: "20km 이상 (꽤 멀어)", value: 5, desc: "왕복 1~2시간 각오해야 해" },
      { label: "타지역 / 지방 (엄청 멀어)", value: 7, desc: "당일치기도 빡센 거리" },
    ],
  },
  {
    id: "after_honeymoon",
    emoji: "✈️",
    question: "신혼여행 다녀오면 6개월 안에 볼 수 있는 사이야?",
    subtitle: "관계가 계속될 거냐는 뜻이야",
    type: "single",
    options: [
      { label: "응, 당연히 봐 🙋", value: 4, desc: "앞으로도 계속될 인연" },
      { label: "아마 볼 것 같아", value: 2, desc: "노력하면 볼 수 있는 사이" },
      { label: "솔직히 모르겠어", value: 1, desc: "인생사 모르는 거지..." },
      { label: "아마 못 볼 것 같아 😅", value: 0, desc: "이게 마지막일 수도" },
    ],
  },
  {
    id: "gender",
    emoji: "🚻",
    question: "상대방과 나, 성별은?",
    subtitle: "괜히 물어보는 거 아니야. 이성 친구는 좀 더 챙겨줘야 할 수도",
    type: "single",
    options: [
      { label: "동성이야", value: 0, desc: "의리의 관계" },
      { label: "이성이야", value: 2, desc: "특별히 더 챙겨줄 관계" },
      { label: "굳이 구분 안 해도 돼", value: 1, desc: "그냥 소중한 사람" },
    ],
  },
  {
    id: "extra",
    emoji: "🎲",
    question: "마지막으로... 특이사항 있어?",
    subtitle: "여러 개 골라도 돼",
    type: "multi",
    options: [
      { label: "💸 나한테 빌린 돈 안 갚음", value: -5, desc: "...일단 청구해" },
      { label: "🍺 술자리 페이 항상 본인이 냄", value: 3, desc: "통 큰 친구" },
      { label: "😢 힘들 때 곁에 있어준 사람", value: 5, desc: "진짜 친구" },
      { label: "🤝 나 취업/이직 도와줬어", value: 4, desc: "은인이잖아" },
      { label: "🙄 연락은 필요할 때만 함", value: -3, desc: "계산적인 관계" },
      { label: "📸 SNS에 나 태그 남발함", value: -1, desc: "피곤해..." },
      { label: "🎂 내 생일 꼭 챙겨줌", value: 2, desc: "세심한 친구" },
      { label: "없음", value: 0, desc: "평범한 관계" },
    ],
  },
];

const RESULT_TIERS = [
  {
    min: 0, max: 10,
    amount: 30000,
    title: "마음만 받을게요 😅",
    message: "솔직히 말할게요. 이 분과의 인연은... 얇아요. 3만원도 충분한 성의예요. 어차피 받는 사람도 크게 기대 안 해요.",
    emoji: "🌱",
    color: "#95a5a6",
    tip: "봉투에 정성스러운 한 마디 적어주는 게 더 감동이에요.",
  },
  {
    min: 11, max: 18,
    amount: 50000,
    title: "국룰 5만원! 🤝",
    message: "축의금 세계의 황금비율. 5만원은 '우리 사이가 이 정도'라는 가장 정직한 표현이에요. 주는 사람도 받는 사람도 서로 이해하는 금액.",
    emoji: "💵",
    color: "#27ae60",
    tip: "밥값 이상은 내는 거니까 충분히 성의 있어요.",
  },
  {
    min: 19, max: 26,
    amount: 70000,
    title: "7만원... 애매하지만 진심 🫡",
    message: "5만원은 좀 적고 10만원은 좀 부담스러운 그 사이. 7만원은 '나 그래도 신경 써'라는 따뜻한 시그널이에요.",
    emoji: "💐",
    color: "#2980b9",
    tip: "홀수 금액이 더 진심으로 느껴진다는 연구결과 있어요 (없음).",
  },
  {
    min: 27, max: 35,
    amount: 100000,
    title: "10만원, 진짜 친구 인증 ✅",
    message: "축하해요. 이 분은 당신의 진짜 친구예요. 10만원짜리 우정은 흔하지 않아요. 밥 한 끼도 같이 먹을 수 있는 관계.",
    emoji: "👑",
    color: "#8e44ad",
    tip: "식대 이상 내는 거라 받는 사람이 진짜 감동받을 거예요.",
  },
  {
    min: 36, max: 45,
    amount: 150000,
    title: "15만원... 형제야? 🥹",
    message: "이 정도면 그냥 가족이에요. 평생 곁에 있어줄 사람한테 이 정도는 써야죠. 받는 분도 평생 기억할 거예요.",
    emoji: "🫂",
    color: "#e67e22",
    tip: "같이 사진도 많이 찍어두세요. 나중에 추억이 돼요.",
  },
  {
    min: 46, max: 999,
    amount: 200000,
    title: "20만원 이상... 전생에 나라 구했나 🏆",
    message: "이 분이 당신 삶에 미친 영향은 돈으로 환산이 안 돼요. 20만원도 사실 적을 수 있어요. 마음껏 쓰세요.",
    emoji: "💎",
    color: "#c0392b",
    tip: "현금 말고 특별한 선물을 함께 드리는 것도 고려해보세요.",
  },
];

const SHARE_MESSAGES = [
  "나 축의금 계산했는데 결과 ㄹㅇ 공감됨 ㅋㅋ",
  "이거 해보셈 생각보다 정확해서 소름",
  "친구 결혼식 축의금 얼마 내야 할지 모르겠으면 이거",
  "축의금 고민 끝! 이 사이트 짱임",
];

// ─── 유틸 ───────────────────────────────────────────────────────────────────

function calcResult(answers) {
  let total = 0;
  const breakdown = [];

  QUESTIONS.forEach((q) => {
    const ans = answers[q.id];
    if (!ans) return;
    if (q.type === "multi") {
      const vals = ans.map((v) => {
        const opt = q.options.find((o) => o.value === v);
        return opt;
      }).filter(Boolean);
      const sum = vals.reduce((s, o) => s + o.value, 0);
      total += sum;
      if (sum !== 0) breakdown.push({ question: q.question, score: sum });
    } else {
      const opt = q.options.find((o) => o.value === ans);
      if (opt) {
        total += opt.value;
        breakdown.push({ question: q.question, score: opt.value, label: opt.label });
      }
    }
  });

  const tier = RESULT_TIERS.find((t) => total >= t.min && total <= t.max) || RESULT_TIERS[RESULT_TIERS.length - 1];
  return { total, tier, breakdown };
}

function formatAmount(n) {
  if (n >= 10000) return `${n / 10000}만원`;
  return `${n.toLocaleString()}원`;
}

// ─── 컴포넌트 ───────────────────────────────────────────────────────────────

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#999", fontFamily: "inherit" }}>
          {current} / {total}
        </span>
        <span style={{ fontSize: 12, color: "#999" }}>{pct}%</span>
      </div>
      <div style={{ background: "#f0f0f0", borderRadius: 100, height: 4, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg, #FF6B6B, #FF8E53)",
            borderRadius: 100,
            transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}

function OptionButton({ option, selected, onClick, multi }) {
  const isSelected = multi
    ? Array.isArray(selected) && selected.includes(option.value)
    : selected === option.value;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: 14,
        border: isSelected ? "2px solid #FF6B6B" : "2px solid #f0f0f0",
        background: isSelected ? "#FFF5F5" : "#fff",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
        marginBottom: 8,
        transform: isSelected ? "scale(1.01)" : "scale(1)",
        boxShadow: isSelected ? "0 4px 20px rgba(255,107,107,0.15)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: isSelected ? "#FF6B6B" : "#222", fontFamily: "inherit" }}>
            {option.label}
          </div>
          {option.desc && (
            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{option.desc}</div>
          )}
        </div>
        {isSelected && (
          <div style={{
            width: 22, height: 22, borderRadius: "50%", background: "#FF6B6B",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}

function QuestionScreen({ question, answer, onAnswer, onNext, onPrev, isFirst, isLast, qIndex, total }) {
  const [localSelected, setLocalSelected] = useState(
    question.type === "multi" ? (answer || []) : answer
  );

  useEffect(() => {
    setLocalSelected(question.type === "multi" ? (answer || []) : answer);
  }, [question.id]);

  const handleSingle = (val) => {
    setLocalSelected(val);
    onAnswer(question.id, val);
    setTimeout(() => onNext(), 300);
  };

  const handleMulti = (val) => {
    if (val === 0) {
      setLocalSelected([0]);
      onAnswer(question.id, [0]);
      return;
    }
    const cur = Array.isArray(localSelected) ? localSelected.filter(v => v !== 0) : [];
    const next = cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val];
    setLocalSelected(next);
    onAnswer(question.id, next);
  };

  const canNext = question.type === "multi"
    ? Array.isArray(localSelected) && localSelected.length > 0
    : localSelected !== undefined;

  return (
    <div style={{ animation: "fadeSlideIn 0.35s ease" }}>
      <ProgressBar current={qIndex + 1} total={total} />

      <div style={{ textAlign: "center", margin: "28px 0 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>{question.emoji}</div>
        <h2 style={{
          fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 8px",
          lineHeight: 1.3, fontFamily: "inherit"
        }}>
          {question.question}
        </h2>
        {question.subtitle && (
          <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>{question.subtitle}</p>
        )}
      </div>

      <div>
        {question.options.map((opt) => (
          <OptionButton
            key={opt.value}
            option={opt}
            selected={localSelected}
            multi={question.type === "multi"}
            onClick={() =>
              question.type === "multi" ? handleMulti(opt.value) : handleSingle(opt.value)
            }
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        {!isFirst && (
          <button
            onClick={onPrev}
            style={{
              flex: 1, padding: "15px", borderRadius: 14, border: "2px solid #f0f0f0",
              background: "#fff", cursor: "pointer", fontSize: 15, color: "#666", fontFamily: "inherit", fontWeight: 600
            }}
          >
            ← 이전
          </button>
        )}
        {question.type === "multi" && (
          <button
            onClick={onNext}
            disabled={!canNext}
            style={{
              flex: 2, padding: "15px", borderRadius: 14, border: "none",
              background: canNext ? "linear-gradient(135deg, #FF6B6B, #FF8E53)" : "#f5f5f5",
              color: canNext ? "#fff" : "#ccc", cursor: canNext ? "pointer" : "default",
              fontSize: 15, fontWeight: 700, fontFamily: "inherit",
              transition: "all 0.2s",
              boxShadow: canNext ? "0 4px 20px rgba(255,107,107,0.3)" : "none",
            }}
          >
            {isLast ? "결과 보기 🎉" : "다음 →"}
          </button>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ score, maxScore }) {
  const pct = Math.min(100, Math.round((score / maxScore) * 100));
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ background: "#f5f5f5", borderRadius: 100, height: 6, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: "linear-gradient(90deg, #FF6B6B, #FF8E53)",
          borderRadius: 100, transition: "width 1s ease 0.3s"
        }} />
      </div>
    </div>
  );
}

function ResultScreen({ result, answers, onRetry, onReport }) {
const [shareUrl, setShareUrl] = useState('')
useEffect(() => {
  async function save() {
    const saved = await saveCalculation({
      score: result.total,
      amount: result.tier.amount,
      resultTitle: result.tier.title,
      answers: answers,
    })
    if (saved) {
      setShareUrl(`${window.location.origin}?share=${saved.share_token}`)
    }
  }
  save()
}, [])
useEffect(() => {
  // 결과 화면 뜰 때 자동 저장
  async function save() {
    const saved = await saveCalculation({
      score: result.total,
      amount: result.tier.amount,
      resultTitle: result.tier.title,
      answers: answers,
    })
    if (saved) {
      setShareUrl(`${window.location.origin}?share=${saved.share_token}`)
    }
  }
  save()
}, [])

  const { total, tier, breakdown } = result;
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleCopy = () => {
  const msg = shareUrl
    ? `💒 축의금 계산 결과: ${formatAmount(result.tier.amount)}\n"${result.tier.title}"\n\n나도 계산해보기 → ${shareUrl}`
    : `💒 축의금 계산 결과: ${formatAmount(result.tier.amount)}\n"${result.tier.title}"`

  navigator.clipboard.writeText(msg).then(() => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  })
}


  const handleKakao = () => {
    alert("카카오 SDK 연동 후 활성화돼요! 배포 시 추가됩니다 🙏");
  };

  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
      {/* 결과 카드 */}
      <div style={{
        background: `linear-gradient(135deg, ${tier.color}15, ${tier.color}05)`,
        border: `2px solid ${tier.color}30`,
        borderRadius: 20, padding: "28px 20px", textAlign: "center", marginBottom: 16
      }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{tier.emoji}</div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: tier.color, textTransform: "uppercase",
          letterSpacing: 1, marginBottom: 8
        }}>
          추천 축의금
        </div>
        <div style={{ fontSize: 52, fontWeight: 900, color: "#111", lineHeight: 1, marginBottom: 10, fontFamily: "inherit" }}>
          {formatAmount(tier.amount)}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 12 }}>
          {tier.title}
        </div>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: 0 }}>
          {tier.message}
        </p>
      </div>

      {/* 총점 */}
      <div style={{
        background: "#fafafa", borderRadius: 14, padding: "14px 16px", marginBottom: 16,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ fontSize: 14, color: "#666" }}>나와의 인연 점수</span>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#111" }}>{total}점</span>
          <span style={{ fontSize: 12, color: "#999", marginLeft: 4 }}>/ 65점</span>
        </div>
      </div>
      <ScoreBar score={total} maxScore={65} />

      {/* 팁 */}
      <div style={{
        background: "#FFFBF0", border: "1px solid #FFE58F", borderRadius: 12,
        padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#8B6914"
      }}>
        💡 {tier.tip}
      </div>

      {/* 점수 상세 토글 */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        style={{
          width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #f0f0f0",
          background: "#fff", cursor: "pointer", fontSize: 13, color: "#888",
          fontFamily: "inherit", marginBottom: showBreakdown ? 8 : 16,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6
        }}
      >
        {showBreakdown ? "▲" : "▼"} 점수 상세 보기
      </button>

      {showBreakdown && (
        <div style={{ marginBottom: 16 }}>
          {breakdown.map((b, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", background: "#fafafa", borderRadius: 10, marginBottom: 6
            }}>
              <span style={{ fontSize: 13, color: "#555", flex: 1 }}>{b.label || b.question.slice(0, 16)}</span>
              <span style={{
                fontSize: 14, fontWeight: 700,
                color: b.score > 0 ? "#27ae60" : b.score < 0 ? "#e74c3c" : "#999"
              }}>
                {b.score > 0 ? `+${b.score}` : b.score}점
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 공유 버튼 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button
          onClick={handleKakao}
          style={{
            flex: 1, padding: "14px", borderRadius: 14, border: "none",
            background: "#FEE500", color: "#3A1D1D", cursor: "pointer",
            fontSize: 14, fontWeight: 700, fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6
          }}
        >
          💬 카카오 공유
        </button>
        <button
          onClick={handleCopy}
          style={{
            flex: 1, padding: "14px", borderRadius: 14, border: "2px solid #f0f0f0",
            background: "#fff", color: "#333", cursor: "pointer",
            fontSize: 14, fontWeight: 700, fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6
          }}
        >
          {copied ? "✅ 복사됨!" : "🔗 링크 복사"}
        </button>
      </div>

      {/* 제보하기 */}
      <div style={{
        background: "linear-gradient(135deg, #667eea15, #764ba215)",
        border: "1.5px solid #667eea30",
        borderRadius: 16, padding: "16px", marginBottom: 12, textAlign: "center"
      }}>
        <div style={{ fontSize: 20, marginBottom: 6 }}>📮</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>
          예식장 식대 정보를 알고 있나요?
        </div>
        <p style={{ fontSize: 12, color: "#666", margin: "0 0 10px", lineHeight: 1.5 }}>
          결혼 견적서나 정산서를 제보해주시면<br />
          <strong style={{ color: "#667eea" }}>매달 추첨으로 선물 🎁</strong>을 드려요!
        </p>
        <button
          onClick={onReport}
          style={{
            padding: "10px 20px", borderRadius: 100, border: "none",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit"
          }}
        >
          모두가 풍요로운 축의를 위해 제보하기 →
        </button>
      </div>

      {/* 웨딩플래너 제휴 배너 */}
      <div style={{
        background: "linear-gradient(135deg, #f8f9ff, #fff)",
        border: "1px solid #e8ecff", borderRadius: 16, padding: "14px 16px",
        marginBottom: 16, display: "flex", alignItems: "center", gap: 12
      }}>
        <div style={{ fontSize: 28 }}>💒</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>AD · 제휴문의 welcome</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>웨딩플래너 무료 상담</div>
          <div style={{ fontSize: 12, color: "#888" }}>견적 비교하고 최대 30% 절약하세요</div>
        </div>
        <button style={{
          padding: "8px 12px", borderRadius: 8, border: "1px solid #e8ecff",
          background: "#fff", color: "#667eea", cursor: "pointer",
          fontSize: 12, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap"
        }}>
          상담받기
        </button>
      </div>

      {/* 다시하기 */}
      <button
        onClick={onRetry}
        style={{
          width: "100%", padding: "15px", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          color: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: "inherit",
          boxShadow: "0 4px 20px rgba(255,107,107,0.3)"
        }}
      >
        🔄 다른 사람도 계산하기
      </button>
    </div>
  );
}

function ReportModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ venue: "", address: "", mealCost: "", venueFee: "", email: "", file: null });

const handleSubmit = async () => {
  if (!form.venue || !form.mealCost) {
    alert('예식장 이름과 식대는 필수예요!')
    return
  }
  let fileUrl = null
  if (form.file) {
    fileUrl = await uploadReportFile(form.file)
  }
  const saved = await saveVenueReport({
    venueName: form.venue,
    address: form.address,
    mealCost: form.mealCost,
    venueFee: form.venueFee,
    reporterEmail: form.email,
    fileUrl,
  })
  if (saved) {
    setStep(2)
  } else {
    alert('저장 중 오류가 났어요. 다시 시도해주세요!')
  }
}
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadeIn 0.2s ease"
    }}>
      <div style={{
        background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px",
        width: "100%", maxWidth: 480, animation: "slideUp 0.3s ease"
      }}>
        {step === 1 ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📮</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", fontFamily: "inherit" }}>
                예식장 정보 제보하기
              </h3>
              <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                모두가 풍요로운 축의가 될 수 있도록!<br />매달 추첨으로 선물을 드려요 🎁
              </p>
            </div>

            {[
              { key: "venue", label: "예식장 이름 *", placeholder: "예) 롯데호텔 서울 크리스탈볼룸" },
              { key: "address", label: "주소", placeholder: "예) 서울 중구 을지로 30" },
              { key: "mealCost", label: "1인 식대 (원) *", placeholder: "예) 80000", type: "number" },
              { key: "venueFee", label: "대관비 (원)", placeholder: "예) 3000000", type: "number" },
              { key: "email", label: "이메일 (추첨 연락용)", placeholder: "example@email.com" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>
                  {f.label}
                </label>
                <input
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    border: "1.5px solid #f0f0f0", fontSize: 14, fontFamily: "inherit",
                    outline: "none", boxSizing: "border-box",
                    background: "#fafafa"
                  }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>
                견적서 / 정산서 첨부 (선택)
              </label>
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "14px", borderRadius: 10, border: "1.5px dashed #ddd",
                background: "#fafafa", cursor: "pointer", fontSize: 13, color: "#888"
              }}>
                📎 {form.file ? form.file.name : "파일 첨부하기"}
                <input type="file" style={{ display: "none" }} accept=".pdf,.jpg,.png"
                  onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: "14px", borderRadius: 14, border: "1.5px solid #f0f0f0",
                background: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "inherit", color: "#666", fontWeight: 600
              }}>취소</button>
              <button onClick={handleSubmit} style={{
                flex: 2, padding: "14px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit"
              }}>제보 완료!</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", fontFamily: "inherit" }}>제보 감사해요!</h3>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: "0 0 24px" }}>
              소중한 정보 덕분에 더 많은 사람들이<br />
              합리적인 축의금을 낼 수 있게 됐어요.<br />
              <strong>이번 달 추첨</strong>에 자동으로 참여됩니다 🎁
            </p>
            <button onClick={onClose} style={{
              padding: "14px 40px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
              color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "inherit",
              boxShadow: "0 4px 20px rgba(255,107,107,0.3)"
            }}>확인</button>
          </div>
        )}
      </div>
    </div>
  );
}

function IntroScreen({ onStart }) {
  return (
    <div style={{ textAlign: "center", animation: "fadeSlideIn 0.5s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 72, marginBottom: 12, lineHeight: 1 }}>💒</div>
        <h1 style={{
          fontSize: 28, fontWeight: 900, color: "#111",
          margin: "0 0 8px", fontFamily: "inherit", lineHeight: 1.2
        }}>
          얼마 내야 해?
        </h1>
        <p style={{ fontSize: 16, color: "#888", margin: "0 0 16px" }}>
          AI 축의금 계산기
        </p>

        {/* 핵심 문장 1 - 홍보 멘트 */}
        <div style={{
          background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          borderRadius: 14, padding: "14px 16px", marginBottom: 12, textAlign: "left"
        }}>
          <p style={{
            fontSize: 16, fontWeight: 800, color: "#fff",
            margin: 0, lineHeight: 1.4, letterSpacing: -0.3
          }}>
            💬 축의금, 이걸로 정하면<br />욕 안 먹습니다.
          </p>
        </div>

        {/* 핵심 문장 2 - 철학 */}
        <div style={{
          background: "#F8F8F8", borderLeft: "3px solid #FF6B6B",
          borderRadius: "0 10px 10px 0", padding: "12px 14px", textAlign: "left"
        }}>
          <p style={{
            fontSize: 13, color: "#444", margin: 0, lineHeight: 1.7, fontWeight: 500
          }}>
            축의금은 <strong style={{ color: "#111" }}>"관계의 깊이 + 평소 교류 빈도"</strong>로<br />
            기준을 잡는 게 가장 안전하다.<br />
            <span style={{ color: "#FF6B6B", fontWeight: 700 }}>감정이 아니라 기준이 필요하다.</span>
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        {[
          { emoji: "🎯", text: "친밀도 기반 점수 계산" },
          { emoji: "🏨", text: "예식장 등급 반영" },
          { emoji: "📍", text: "거리·식사 여부까지 고려" },
          { emoji: "🔗", text: "카카오 공유 가능" },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px", background: "#fafafa", borderRadius: 12, marginBottom: 8,
            textAlign: "left"
          }}>
            <span style={{ fontSize: 20 }}>{item.emoji}</span>
            <span style={{ fontSize: 14, color: "#444", fontWeight: 500 }}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* 제휴 상단 배너 */}
      <div style={{
        background: "linear-gradient(135deg, #f0f4ff, #fff)", border: "1px solid #e0e8ff",
        borderRadius: 14, padding: "12px 16px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 10, textAlign: "left"
      }}>
        <span style={{ fontSize: 24 }}>💍</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#aaa" }}>SPONSORED</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>웨딩 준비 중이신가요?</div>
          <div style={{ fontSize: 11, color: "#888" }}>제휴 웨딩플래너 무료 상담 →</div>
        </div>
      </div>

      <button
        onClick={onStart}
        style={{
          width: "100%", padding: "17px", borderRadius: 16, border: "none",
          background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
          color: "#fff", cursor: "pointer", fontSize: 17, fontWeight: 800, fontFamily: "inherit",
          boxShadow: "0 6px 24px rgba(255,107,107,0.35)",
          letterSpacing: -0.3
        }}
      >
        계산 시작하기 →
      </button>
      <p style={{ fontSize: 11, color: "#ccc", marginTop: 12 }}>
        질문 11개 · 약 2분 소요 · 완전 무료
      </p>
    </div>
  );
}

// ─── 메인 앱 ─────────────────────────────────────────────────────────────────

export default function App() {

  useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('share')
  if (token) {
    getCalculationByToken(token).then((data) => {
      if (data) {
        const tier = RESULT_TIERS.find(t => t.amount === data.amount) || RESULT_TIERS[1]
        setResult({ total: data.score, tier, breakdown: [] })
        setAnswers(data.answers || {})
        setScreen('result')
      }
    })
  }
}, [])

  const [screen, setScreen] = useState("intro"); // intro | quiz | result
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const handleAnswer = (id, val) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const handleNext = () => {
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      const r = calcResult(answers);
      setResult(r);
      setScreen("result");
    }
  };

  const handlePrev = () => {
    if (qIndex > 0) setQIndex((i) => i - 1);
    else setScreen("intro");
  };

  const handleRetry = () => {
    setAnswers({});
    setQIndex(0);
    setResult(null);
    setScreen("intro");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: #f7f7f8; font-family: 'Pretendard', -apple-system, sans-serif; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        button { font-family: 'Pretendard', -apple-system, sans-serif; }
        input { font-family: 'Pretendard', -apple-system, sans-serif; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", justifyContent: "center",
        alignItems: "flex-start", background: "#f7f7f8", padding: "0 0 40px"
      }}>
        <div style={{
          width: "100%", maxWidth: 480, background: "#fff",
          minHeight: "100vh", padding: "20px 20px",
          boxShadow: "0 0 40px rgba(0,0,0,0.06)"
        }}>
          {/* 헤더 */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f5f5f5"
          }}>
            <button
              onClick={handleRetry}
              style={{
                fontSize: 18, fontWeight: 900, color: "#FF6B6B", background: "none",
                border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit"
              }}
            >
              얼마 내야 해?
            </button>
            {screen !== "intro" && (
              <button
                onClick={handleRetry}
                style={{
                  fontSize: 12, color: "#aaa", background: "none", border: "none",
                  cursor: "pointer", padding: 0, fontFamily: "inherit"
                }}
              >
                처음으로
              </button>
            )}
          </div>

          {/* 화면 전환 */}
          {screen === "intro" && <IntroScreen onStart={() => setScreen("quiz")} />}

          {screen === "quiz" && (
            <QuestionScreen
              question={QUESTIONS[qIndex]}
              answer={answers[QUESTIONS[qIndex].id]}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onPrev={handlePrev}
              isFirst={qIndex === 0}
              isLast={qIndex === QUESTIONS.length - 1}
              qIndex={qIndex}
              total={QUESTIONS.length}
            />
          )}

          {screen === "result" && result && (
            <ResultScreen
              result={result}
              answers={answers}
              onRetry={handleRetry}
              onReport={() => setShowReport(true)}
            />
          )}
        </div>
      </div>

      {showReport && <ReportModal onClose={() => setShowReport(false)} />}
    </>
  );
}
