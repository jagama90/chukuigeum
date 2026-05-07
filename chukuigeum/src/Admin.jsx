import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

// ─── 비밀번호 (실제 서비스에서는 Supabase Auth로 교체) ──────────────────────
const ADMIN_PASSWORD = "chukui2024!";

// ─── 유틸 ────────────────────────────────────────────────────────────────────
function formatAmount(n) {
  if (n >= 10000) return `${n / 10000}만원`;
  return `${n?.toLocaleString()}원`;
}
function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ko-KR", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

function StatCard({ emoji, label, value, sub, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "20px",
      border: "1px solid #f0f0f0", flex: 1, minWidth: 140,
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: color || "#111", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Badge({ status }) {
  const map = {
    pending: { label: "검토중", bg: "#FFF8E1", color: "#F59E0B" },
    approved: { label: "승인", bg: "#E8F5E9", color: "#22C55E" },
    rejected: { label: "반려", bg: "#FEE2E2", color: "#EF4444" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color
    }}>{s.label}</span>
  );
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [tab, setTab] = useState("reports"); // reports | calculations | stats
  const [reports, setReports] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // 통계
  const [stats, setStats] = useState({
    totalCalcs: 0, todayCalcs: 0, totalReports: 0, pendingReports: 0,
    avgScore: 0, topAmount: 0
  });

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      loadAll();
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 1500);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    const [{ data: reps }, { data: calcs }] = await Promise.all([
      supabase.from("venue_reports").select("*").order("created_at", { ascending: false }),
      supabase.from("calculations").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setReports(reps || []);
    setCalculations(calcs || []);

    // 통계 계산
    const today = new Date().toDateString();
    const todayCalcs = (calcs || []).filter(c => new Date(c.created_at).toDateString() === today);
    const avgScore = calcs?.length ? Math.round(calcs.reduce((s, c) => s + (c.score || 0), 0) / calcs.length) : 0;
    const amountCounts = {};
    (calcs || []).forEach(c => { amountCounts[c.amount] = (amountCounts[c.amount] || 0) + 1; });
    const topAmount = Object.entries(amountCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    setStats({
      totalCalcs: calcs?.length || 0,
      todayCalcs: todayCalcs.length,
      totalReports: reps?.length || 0,
      pendingReports: (reps || []).filter(r => r.status === "pending").length,
      avgScore,
      topAmount: topAmount ? parseInt(topAmount) : 0,
    });
    setLoading(false);
  };

  const updateReportStatus = async (id, status) => {
    await supabase.from("venue_reports").update({ status }).eq("id", id);
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selectedReport?.id === id) setSelectedReport(prev => ({ ...prev, status }));
  };

  const transferToVenues = async (report) => {
    const { data: existing } = await supabase
      .from("venues").select("id").eq("source_report_id", report.id).single();
    if (existing) { alert("이미 예식장 DB에 등록된 제보예요!"); return; }
    const { error } = await supabase.from("venues").insert([{
      name: report.venue_name,
      address: report.address,
      meal_cost: report.meal_cost,
      venue_fee: report.venue_fee,
      source_report_id: report.id,
    }]);
    if (!error) {
      await updateReportStatus(report.id, "approved");
      alert(`✅ "${report.venue_name}" 예식장 DB에 등록됐어요!`);
    } else {
      alert("이관 실패: " + error.message);
    }
  };

  // ── 로그인 화면 ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f7f7f8", fontFamily: "'Pretendard', -apple-system, sans-serif"
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;600;700;800;900&display=swap');`}</style>
        <div style={{
          background: "#fff", borderRadius: 20, padding: "40px 32px",
          width: "100%", maxWidth: 360, boxShadow: "0 8px 40px rgba(0,0,0,0.08)"
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#111" }}>관리자 로그인</h2>
            <p style={{ fontSize: 13, color: "#aaa", margin: "6px 0 0" }}>얼마 내야 해? 운영 대시보드</p>
          </div>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, fontSize: 15,
              border: pwError ? "2px solid #FF6B6B" : "2px solid #f0f0f0",
              outline: "none", boxSizing: "border-box", fontFamily: "inherit",
              transition: "border 0.2s", marginBottom: 12,
              animation: pwError ? "shake 0.3s" : "none"
            }}
          />
          <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
          {pwError && <p style={{ color: "#FF6B6B", fontSize: 12, margin: "-4px 0 8px", textAlign: "center" }}>비밀번호가 틀렸어요</p>}
          <button onClick={login} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
            color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", boxShadow: "0 4px 16px rgba(255,107,107,0.3)"
          }}>
            입장하기
          </button>
        </div>
      </div>
    );
  }

  // ── 대시보드 ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#f7f7f8",
      fontFamily: "'Pretendard', -apple-system, sans-serif"
    }}>
      {/* 헤더 */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #f0f0f0",
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>💒</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>얼마 내야 해? 관리자</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={loadAll} style={{
            padding: "6px 14px", borderRadius: 8, border: "1px solid #f0f0f0",
            background: "#fff", cursor: "pointer", fontSize: 12, color: "#666",
            fontFamily: "inherit", fontWeight: 600
          }}>🔄 새로고침</button>
          <button onClick={() => setAuthed(false)} style={{
            padding: "6px 14px", borderRadius: 8, border: "none",
            background: "#f5f5f5", cursor: "pointer", fontSize: 12, color: "#888",
            fontFamily: "inherit"
          }}>로그아웃</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* 통계 카드 */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard emoji="🧮" label="총 계산 횟수" value={stats.totalCalcs.toLocaleString()} sub="누적" color="#FF6B6B" />
          <StatCard emoji="📅" label="오늘 계산" value={stats.todayCalcs} sub="today" color="#FF8E53" />
          <StatCard emoji="📮" label="총 제보" value={stats.totalReports} color="#667eea" />
          <StatCard emoji="⏳" label="검토 대기" value={stats.pendingReports} sub="pending" color="#F59E0B" />
          <StatCard emoji="📊" label="평균 점수" value={`${stats.avgScore}점`} color="#22C55E" />
          <StatCard emoji="🏆" label="최다 금액" value={formatAmount(stats.topAmount)} color="#8B5CF6" />
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {[
            { key: "reports", label: "📮 제보 관리" },
            { key: "calculations", label: "🧮 계산 히스토리" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "9px 18px", borderRadius: 10, border: "none",
              background: tab === t.key ? "linear-gradient(135deg, #FF6B6B, #FF8E53)" : "#fff",
              color: tab === t.key ? "#fff" : "#666",
              cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
              boxShadow: tab === t.key ? "0 3px 12px rgba(255,107,107,0.25)" : "0 1px 4px rgba(0,0,0,0.06)"
            }}>
              {t.label}
              {t.key === "reports" && stats.pendingReports > 0 && (
                <span style={{
                  marginLeft: 6, background: "#FF6B6B", color: "#fff",
                  borderRadius: 100, padding: "1px 6px", fontSize: 10
                }}>{stats.pendingReports}</span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>로딩 중...</div>
        )}

        {/* 제보 관리 탭 */}
        {!loading && tab === "reports" && (
          <div style={{ display: "flex", gap: 16 }}>
            {/* 목록 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {reports.length === 0 && (
                <div style={{ textAlign: "center", padding: 60, color: "#bbb", background: "#fff", borderRadius: 16 }}>
                  아직 제보가 없어요 📭
                </div>
              )}
              {reports.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  style={{
                    background: "#fff", borderRadius: 14, padding: "16px",
                    marginBottom: 10, cursor: "pointer",
                    border: selectedReport?.id === r.id ? "2px solid #FF6B6B" : "1px solid #f0f0f0",
                    transition: "all 0.15s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>
                        {r.venue_name}
                      </div>
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
                        {r.address || "주소 없음"} · {r.meal_cost ? `식대 ${r.meal_cost.toLocaleString()}원` : "식대 미입력"}
                      </div>
                      <div style={{ fontSize: 11, color: "#bbb" }}>{formatDate(r.created_at)}</div>
                    </div>
                    <Badge status={r.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* 상세 */}
            {selectedReport && (
              <div style={{
                width: 320, flexShrink: 0, background: "#fff", borderRadius: 16,
                padding: "20px", border: "1px solid #f0f0f0", height: "fit-content",
                position: "sticky", top: 24
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>제보 상세</h3>
                  <button onClick={() => setSelectedReport(null)} style={{
                    background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa"
                  }}>×</button>
                </div>

                {[
                  { label: "예식장", value: selectedReport.venue_name },
                  { label: "주소", value: selectedReport.address || "-" },
                  { label: "1인 식대", value: selectedReport.meal_cost ? `${selectedReport.meal_cost.toLocaleString()}원` : "-" },
                  { label: "대관비", value: selectedReport.venue_fee ? `${selectedReport.venue_fee.toLocaleString()}원` : "-" },
                  { label: "제보자 이메일", value: selectedReport.reporter_email || "-" },
                  { label: "제보 일시", value: formatDate(selectedReport.created_at) },
                ].map(item => (
                  <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13
                  }}>
                    <span style={{ color: "#888" }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: "#111", textAlign: "right", maxWidth: 180 }}>{item.value}</span>
                  </div>
                ))}

                {selectedReport.file_url && (
                  <a href={selectedReport.file_url} target="_blank" rel="noreferrer" style={{
                    display: "block", marginTop: 12, padding: "10px",
                    background: "#f8f8f8", borderRadius: 8, textAlign: "center",
                    fontSize: 13, color: "#667eea", textDecoration: "none", fontWeight: 600
                  }}>
                    📎 첨부파일 보기
                  </a>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, "approved")}
                    style={{
                      flex: 1, padding: "11px", borderRadius: 10, border: "none",
                      background: selectedReport.status === "approved" ? "#22C55E" : "#E8F5E9",
                      color: selectedReport.status === "approved" ? "#fff" : "#22C55E",
                      cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit"
                    }}
                  >✅ 승인</button>
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, "rejected")}
                    style={{
                      flex: 1, padding: "11px", borderRadius: 10, border: "none",
                      background: selectedReport.status === "rejected" ? "#EF4444" : "#FEE2E2",
                      color: selectedReport.status === "rejected" ? "#fff" : "#EF4444",
                      cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit"
                    }}
                  >❌ 반려</button>
                </div>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, "pending")}
                  style={{
                    width: "100%", marginTop: 8, padding: "9px", borderRadius: 10,
                    border: "1px solid #f0f0f0", background: "#fff",
                    cursor: "pointer", fontSize: 12, color: "#aaa", fontFamily: "inherit"
                  }}
                >검토중으로 되돌리기</button>
                <button
                  onClick={() => transferToVenues(selectedReport)}
                  style={{
                    width: "100%", marginTop: 8, padding: "12px", borderRadius: 10,
                    border: "none", background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
                    fontFamily: "inherit"
                  }}
                >
                  🏛️ 예식장 DB에 등록하기
                </button>
              </div>
            )}
          </div>
        )}

        {/* 계산 히스토리 탭 */}
        {!loading && tab === "calculations" && (
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #f0f0f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                  {["일시", "점수", "추천금액", "공유토큰"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: 12, fontWeight: 700, color: "#888"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calculations.map((c, i) => (
                  <tr key={c.id} style={{
                    borderBottom: "1px solid #f5f5f5",
                    background: i % 2 === 0 ? "#fff" : "#fafafa"
                  }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#666" }}>{formatDate(c.created_at)}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#111" }}>{c.score}점</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#FF6B6B" }}>{formatAmount(c.amount)}</td>
                    <td style={{ padding: "12px 16px", fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>
                      {c.share_token || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {calculations.length === 0 && (
              <div style={{ textAlign: "center", padding: 60, color: "#bbb" }}>데이터가 없어요</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}