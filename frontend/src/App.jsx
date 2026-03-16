import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = "";

// ─── Ikone (inline SVG) ────────────────────────────────────────────────────

const Icons = {
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Database: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  Cpu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Book: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
  Zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Code: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  Thermometer: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/>
    </svg>
  ),
  Activity: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
};

// ─── Stilovi ────────────────────────────────────────────────────────────────

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

:root {
  --bg-primary: #0a0e17;
  --bg-secondary: #111827;
  --bg-tertiary: #1a2234;
  --bg-card: rgba(17, 24, 39, 0.7);
  --border: rgba(99, 179, 237, 0.12);
  --border-active: rgba(99, 179, 237, 0.3);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent: #60a5fa;
  --success: #34d399;
  --warning: #fbbf24;
  --error: #f87171;
  --student-color: #60a5fa;
  --profesor-color: #a78bfa;
  --admin-color: #f59e0b;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Outfit', sans-serif; background: var(--bg-primary); color: var(--text-primary); overflow: hidden; height: 100vh; }
#root { height: 100vh; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(99, 179, 237, 0.2); border-radius: 3px; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes progressPulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
`;

// ─── GPU Dashboard ──────────────────────────────────────────────────────────

function GpuDashboard({ gpuData }) {
  if (!gpuData) return null;
  const stats = [
    { label: "Iskorišćenost", value: `${gpuData.utilization}%`, pct: gpuData.utilization, icon: <Icons.Activity />, color: gpuData.utilization > 80 ? "var(--error)" : gpuData.utilization > 50 ? "var(--warning)" : "var(--success)" },
    { label: "VRAM", value: `${(gpuData.vram_used / 1024).toFixed(1)} / ${(gpuData.vram_total / 1024).toFixed(0)} GB`, pct: (gpuData.vram_used / gpuData.vram_total) * 100, icon: <Icons.Cpu />, color: "var(--accent)" },
    { label: "Temperatura", value: `${gpuData.temperature}°C`, pct: gpuData.temperature, icon: <Icons.Thermometer />, color: gpuData.temperature > 80 ? "var(--error)" : gpuData.temperature > 65 ? "var(--warning)" : "var(--success)" },
    { label: "Potrošnja", value: `${gpuData.power_draw}W / ${gpuData.power_limit}W`, pct: (gpuData.power_draw / gpuData.power_limit) * 100, icon: <Icons.Zap />, color: "var(--warning)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: "12px 16px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(12px)" }}>
      <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <Icons.Cpu />
        <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", color: "var(--text-secondary)" }}>{gpuData.gpu_name}</span>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: gpuData.available ? "var(--success)" : "var(--warning)", boxShadow: `0 0 6px ${gpuData.available ? "var(--success)" : "var(--warning)"}` }} />
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{gpuData.available ? "Aktivan" : "Demo režim"}</span>
      </div>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <span style={{ color: s.color, display: "flex" }}>{s.icon}</span>
            <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: s.color, marginBottom: "6px" }}>{s.value}</div>
          <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(s.pct, 100)}%`, background: s.color, borderRadius: "2px", transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Inference Pipeline ─────────────────────────────────────────────────────

function InferencePipeline({ steps, isLoading }) {
  const pipelineSteps = [
    { key: "Primam upit...", label: "Prijem" },
    { key: "Generišem SQL...", label: "SQL" },
    { key: "Validacija upita...", label: "Validacija" },
    { key: "Izvršavam upit...", label: "Izvršavanje" },
    { key: "Formiram odgovor...", label: "Odgovor" },
    { key: "Gotovo", label: "Gotovo" },
  ];
  const getStatus = (key) => steps?.find(s => s.name === key)?.status || "pending";
  if (!isLoading && (!steps || steps.length === 0)) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "10px 16px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
      <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", marginRight: "8px", whiteSpace: "nowrap" }}>PIPELINE</span>
      {pipelineSteps.map((step, i) => {
        const status = getStatus(step.key);
        const active = status === "active", done = status === "completed", err = status === "error";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "6px",
              fontSize: "11px", fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
              transition: "all 0.3s ease",
              background: active ? "rgba(96,165,250,0.15)" : done ? "rgba(52,211,153,0.1)" : err ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.03)",
              color: active ? "var(--accent)" : done ? "var(--success)" : err ? "var(--error)" : "var(--text-muted)",
              border: `1px solid ${active ? "rgba(96,165,250,0.3)" : done ? "rgba(52,211,153,0.2)" : err ? "rgba(248,113,113,0.2)" : "var(--border)"}`,
              ...(active ? { animation: "progressPulse 1.2s ease-in-out infinite" } : {}),
            }}>
              {done && <Icons.Check />}{err && <Icons.AlertTriangle />}
              {active && <div style={{ width: 10, height: 10, border: "2px solid var(--accent)", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
              {step.label}
            </div>
            {i < pipelineSteps.length - 1 && <div style={{ width: "16px", height: "1px", background: done ? "var(--success)" : "var(--border)", transition: "background 0.3s ease" }} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Chat Message ───────────────────────────────────────────────────────────

function ChatMessage({ message, onExport }) {
  const [sqlExpanded, setSqlExpanded] = useState(false);
  const [exportingFmt, setExportingFmt] = useState(null);
  const isUser = message.type === "user";

  const handleExport = async (fmt) => {
    setExportingFmt(fmt);
    await onExport(message.columns, message.rows, fmt);
    setExportingFmt(null);
  };

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", padding: "6px 20px", animation: "fadeIn 0.3s ease" }}>
      <div style={{ maxWidth: isUser ? "65%" : "90%", width: isUser ? "auto" : undefined }}>
        <div style={{
          padding: isUser ? "10px 16px" : "14px 18px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser ? "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(96,165,250,0.1))" : "var(--bg-tertiary)",
          border: `1px solid ${isUser ? "rgba(96,165,250,0.25)" : "var(--border)"}`,
          fontSize: "14px", lineHeight: "1.6",
        }}>
          {isUser ? (
            <span>{message.text}</span>
          ) : message.error ? (
            <div style={{ color: "var(--error)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Icons.AlertTriangle /><span>{message.error}</span>
            </div>
          ) : message.text_response ? (
            <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.7" }}>
              {message.text_response}
            </div>
          ) : (
            <div>
              {message.row_count !== undefined && (
                <div style={{ marginBottom: "8px", color: "var(--text-secondary)", fontSize: "13px" }}>
                  Pronađeno <strong style={{ color: "var(--accent)" }}>{message.row_count}</strong> zapisa za <strong style={{ color: "var(--accent)" }}>{message.response_time}s</strong>
                </div>
              )}

              {/* SQL toggle */}
              {message.sql && (
                <div style={{ marginBottom: "10px" }}>
                  <button onClick={() => setSqlExpanded(!sqlExpanded)} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                    borderRadius: "8px", padding: "6px 12px", cursor: "pointer",
                    color: "var(--text-muted)", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                    transition: "all 0.2s",
                  }}
                    onMouseOver={e => e.currentTarget.style.borderColor = "var(--border-active)"}
                    onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <Icons.Code /> Prikaži SQL
                    <span style={{ transform: sqlExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", display: "flex" }}><Icons.ChevronDown /></span>
                  </button>
                  {sqlExpanded && (
                    <div style={{
                      marginTop: "8px", padding: "12px 14px", background: "rgba(0,0,0,0.3)",
                      borderRadius: "8px", border: "1px solid var(--border)",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", lineHeight: "1.7",
                      color: "var(--accent)", overflowX: "auto", animation: "fadeIn 0.2s ease",
                    }}>
                      {message.sql}
                    </div>
                  )}
                </div>
              )}

              {/* Results table (single) */}
              {message.columns && message.rows && message.rows.length > 0 && !message.multi_results && (
                <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)", marginBottom: "10px" }}>
                  <div style={{ overflowX: "auto", maxHeight: "320px", overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}>
                      <thead>
                        <tr>
                          {message.columns.map((col, i) => (
                            <th key={i} style={{
                              padding: "10px 14px", background: "#131d2f", textAlign: "left",
                              fontWeight: 600, fontSize: "11px", letterSpacing: "0.04em", color: "var(--accent)",
                              borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 2,
                            }}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {message.rows.slice(0, 50).map((row, ri) => (
                          <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                            {row.map((cell, ci) => (
                              <td key={ci} style={{ padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                                {cell !== null && cell !== undefined ? String(cell) : "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {message.rows.length > 50 && (
                    <div style={{ padding: "6px 14px", fontSize: "11px", color: "var(--text-muted)", textAlign: "center", borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                      Приказано 50 од {message.rows.length} записа
                    </div>
                  )}
                </div>
              )}

              {/* Results tables (multi) */}
              {message.multi_results && message.multi_results.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "10px" }}>
                  {message.multi_results.map((result, ti) => (
                    <div key={ti} style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)" }}>
                      <div style={{
                        padding: "8px 14px", background: "#131d2f", borderBottom: "1px solid var(--border)",
                        fontSize: "12px", fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em",
                      }}>
                        {result.label} ({result.row_count})
                      </div>
                      <div style={{ overflowX: "auto", maxHeight: "280px", overflowY: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}>
                          <thead>
                            <tr>
                              {result.columns.map((col, i) => (
                                <th key={i} style={{
                                  padding: "10px 14px", background: "#0f1923", textAlign: "left",
                                  fontWeight: 600, fontSize: "11px", letterSpacing: "0.04em", color: "var(--accent)",
                                  borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 2,
                                }}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {result.rows.slice(0, 50).map((row, ri) => (
                              <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                                {row.map((cell, ci) => (
                                  <td key={ci} style={{ padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                                    {cell !== null && cell !== undefined ? String(cell) : "—"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Export */}
              {message.export_formats && message.export_formats.length > 0 && (message.rows?.length > 0 || message.multi_results?.length > 0) && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {message.export_formats.map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => handleExport(fmt.id)}
                      disabled={exportingFmt === fmt.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "6px 14px",
                        background: `${fmt.color}15`,
                        border: `1px solid ${fmt.color}30`,
                        borderRadius: "8px", color: fmt.color, cursor: exportingFmt === fmt.id ? "wait" : "pointer",
                        fontSize: "12px", fontWeight: 500, fontFamily: "'Outfit', sans-serif",
                        transition: "all 0.2s", opacity: exportingFmt === fmt.id ? 0.6 : 1,
                      }}
                      onMouseOver={e => { if (!exportingFmt) { e.currentTarget.style.background = `${fmt.color}25`; e.currentTarget.style.borderColor = `${fmt.color}50`; }}}
                      onMouseOut={e => { e.currentTarget.style.background = `${fmt.color}15`; e.currentTarget.style.borderColor = `${fmt.color}30`; }}
                    >
                      {exportingFmt === fmt.id ? (
                        <div style={{ width: 14, height: 14, border: `2px solid ${fmt.color}`, borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      ) : (
                        <Icons.Download />
                      )}
                      {exportingFmt === fmt.id ? "Izvoz..." : fmt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── System Message ─────────────────────────────────────────────────────────

function SystemMessage({ message }) {
  const roleColor = message.role === "student" ? "var(--student-color)" : message.role === "profesor" ? "var(--profesor-color)" : "var(--admin-color)";
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "8px 20px", animation: "fadeIn 0.3s ease" }}>
      <div style={{
        padding: "10px 20px", borderRadius: "12px",
        background: `${roleColor}10`, border: `1px solid ${roleColor}25`,
        fontSize: "13px", color: roleColor, fontWeight: 500, textAlign: "center", maxWidth: "600px",
      }}>
        {message.text}
      </div>
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar({ role, onRoleChange, metrics, onSuggestionClick, userId, onUserChange, users }) {
  const roles = [
    { id: "student", label: "Student", icon: <Icons.Book />, color: "var(--student-color)", desc: "Pristup ličnim ocenama i upisima" },
    { id: "profesor", label: "Profesor", icon: <Icons.User />, color: "var(--profesor-color)", desc: "Pristup predmetima i ocenama studenata" },
    { id: "admin", label: "Admin", icon: <Icons.Shield />, color: "var(--admin-color)", desc: "Potpun pristup svim podacima" },
  ];

  const suggestions = {
    student: ["Prikaži moje ocene", "Koji je moj prosek?", "Na koje predmete sam upisan/a?", "Koji predmeti su na 3. semestru?"],
    profesor: ["Prikaži moje predmete", "Prosečna ocena na mojim predmetima", "Koji studenti su na mom predmetu?"],
    admin: ["Prikaži sve studente", "Ukupan broj studenata po smeru", "Prosečna ocena po predmetu", "Prikaži sve profesore"],
  };

  const activeRole = roles.find(r => r.id === role);
  const userList = role === "student" ? (users.students || []) : role === "profesor" ? (users.professors || []) : [];
  const selectedUser = userList.find(u => u.id === userId);

  return (
    <div style={{ width: "280px", minWidth: "280px", background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(167,139,250,0.2))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(96,165,250,0.2)" }}>
            <Icons.Database />
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.01em" }}>UniChat AI</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.04em" }}>UNIVERZITETSKI ASISTENT</div>
          </div>
        </div>
      </div>

      {/* Role selector */}
      <div style={{ padding: "16px 18px 8px" }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "10px" }}>AKTIVNA ULOGA</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {roles.map(r => (
            <button key={r.id} onClick={() => onRoleChange(r.id)} style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px",
              border: role === r.id ? `1px solid ${r.color}40` : "1px solid transparent",
              background: role === r.id ? `${r.color}10` : "transparent",
              cursor: "pointer", transition: "all 0.25s ease",
              color: role === r.id ? r.color : "var(--text-secondary)", textAlign: "left", fontFamily: "'Outfit', sans-serif",
            }}
              onMouseOver={e => { if (role !== r.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseOut={e => { if (role !== r.id) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: role === r.id ? `${r.color}20` : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s ease" }}>
                {r.icon}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }}>{r.desc}</div>
              </div>
              {role === r.id && <div style={{ marginLeft: "auto", width: "8px", height: "8px", borderRadius: "50%", background: r.color, boxShadow: `0 0 8px ${r.color}60` }} />}
            </button>
          ))}
        </div>
      </div>

      {/* User selector */}
      {role !== "admin" && (
        <div style={{ padding: "8px 18px 16px" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "8px" }}>
            {role === "student" ? "PRIJAVLJENI STUDENT" : "PRIJAVLJENI PROFESOR"}
          </div>
          <select
            value={userId || ""}
            onChange={e => onUserChange(e.target.value ? Number(e.target.value) : null)}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: "10px",
              border: `1px solid ${activeRole.color}30`,
              background: "var(--bg-primary)", color: "var(--text-primary)",
              fontSize: "12px", fontFamily: "'Outfit', sans-serif",
              outline: "none", cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "32px",
            }}
          >
            <option value="" style={{ background: "var(--bg-primary)" }}>
              — Izaberite {role === "student" ? "studenta" : "profesora"} —
            </option>
            {userList.map(u => (
              <option key={u.id} value={u.id} style={{ background: "var(--bg-primary)" }}>
                {u.label}
              </option>
            ))}
          </select>
          {!userId && (
            <div style={{ fontSize: "10px", color: "var(--warning)", marginTop: "6px", lineHeight: "1.4" }}>
              ⚠ Izaberite identitet da bi upiti bili filtrirani na vaše podatke
            </div>
          )}
        </div>
      )}

      {/* Current identity badge */}
      <div style={{ margin: "0 18px", padding: "12px 14px", borderRadius: "10px", background: `${activeRole.color}08`, border: `1px solid ${activeRole.color}20` }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: activeRole.color, letterSpacing: "0.06em", marginBottom: "4px" }}>PRIJAVLJEN KAO</div>
        <div style={{ fontSize: "15px", fontWeight: 700, color: activeRole.color }}>
          {role === "admin" ? "Administrator" : selectedUser ? selectedUser.label : `${activeRole.label} (neizabran)`}
        </div>
      </div>

      {/* Suggestions */}
      <div style={{ padding: "16px 18px", flex: 1, overflow: "auto" }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "10px" }}>PREDLOZI UPITA</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {(suggestions[role] || []).map((s, i) => (
            <div key={i} onClick={() => onSuggestionClick(s)} style={{
              padding: "8px 12px", borderRadius: "8px", fontSize: "12px",
              color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s", border: "1px solid transparent",
            }}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "var(--border)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
            >
              → {s}
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "10px" }}>STATISTIKA SESIJE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { label: "Ukupno upita", value: metrics.total_queries },
            { label: "Prosečno vreme", value: `${metrics.avg_response_time}s` },
            { label: "Uspešnost", value: `${metrics.success_rate}%` },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.label}</span>
              <span style={{ fontSize: "12px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [role, setRole] = useState("admin");
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState({ students: [], professors: [] });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSteps, setCurrentSteps] = useState([]);
  const [gpuData, setGpuData] = useState(null);
  const [metrics, setMetrics] = useState({ total_queries: 0, avg_response_time: 0, success_rate: 100 });
  const chatEndRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_URL}/api/users`);
        if (r.ok) setUsers(await r.json());
      } catch {}
    })();
  }, []);

  const handleRoleChange = useCallback((newRole) => {
    if (newRole === role) return;
    setRole(newRole);
    setUserId(null);
    setCurrentSteps([]);
    const labels = { student: "Student", profesor: "Profesor", admin: "Admin" };
    const descs = {
      student: "Izaberite studenta iz liste da bi upiti bili filtrirani na njegove podatke.",
      profesor: "Izaberite profesora iz liste da bi upiti bili filtrirani na njegove predmete.",
      admin: "Imate potpun pristup svim tabelama i podacima (samo čitanje).",
    };
    setMessages([{ type: "system", text: `Uloga promenjena na: ${labels[newRole]}. ${descs[newRole]}`, role: newRole }]);
  }, [role]);

  const handleUserChange = useCallback((newUserId) => {
    setUserId(newUserId);
    if (newUserId) {
      const list = role === "student" ? users.students : users.professors;
      const user = list.find(u => u.id === newUserId);
      if (user) {
        setMessages(prev => [...prev, {
          type: "system",
          text: `Prijavljeni kao: ${user.label}. Svi upiti će biti filtrirani na ${role === "student" ? "vaše" : "vaše"} podatke.`,
          role,
        }]);
      }
    }
  }, [role, users]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  useEffect(() => {
    const f = async () => { try { const r = await fetch(`${API_URL}/api/gpu`); if (r.ok) setGpuData(await r.json()); } catch {} };
    f(); const iv = setInterval(f, 3000); return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const f = async () => { try { const r = await fetch(`${API_URL}/api/metrics`); if (r.ok) setMetrics(await r.json()); } catch {} };
    const iv = setInterval(f, 5000); return () => clearInterval(iv);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { type: "user", text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setCurrentSteps([{ name: "Primam upit...", status: "completed" }, { name: "Generišem SQL...", status: "active" }]);

    try {
      const stepTimers = [
        setTimeout(() => setCurrentSteps(prev => [...prev.map(s => ({ ...s, status: "completed" })), { name: "Validacija upita...", status: "active" }]), 1500),
        setTimeout(() => setCurrentSteps(prev => [...prev.map(s => ({ ...s, status: "completed" })), { name: "Izvršavam upit...", status: "active" }]), 2500),
      ];

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text, role, user_id: userId }),
      });

      stepTimers.forEach(clearTimeout);
      const data = await res.json();
      setCurrentSteps(data.steps || []);

      if (data.success) {
        setMessages(prev => [...prev, {
          type: "bot", sql: data.sql, columns: data.columns, rows: data.rows,
          row_count: data.row_count, response_time: data.response_time,
          export_formats: data.export_formats || [],
          text_response: data.text_response || null,
          multi_results: data.multi_results || null,
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: "bot", error: data.error || "Nepoznata greška",
          sql: data.sql, response_time: data.response_time, export_formats: [],
        }]);
      }

      try { const mRes = await fetch(`${API_URL}/api/metrics`); if (mRes.ok) setMetrics(await mRes.json()); } catch {}
    } catch {
      setMessages(prev => [...prev, { type: "bot", error: "Greška pri komunikaciji sa serverom. Proverite da li je backend pokrenut.", export_formats: [] }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setCurrentSteps([]), 2000);
    }
  }, [input, role, isLoading]);

  const handleExport = async (columns, rows, format) => {
    try {
      const res = await fetch(`${API_URL}/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns, rows, format }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rezultati.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("Export greška:", err.detail || res.statusText);
      }
    } catch (err) {
      console.error("Export greška:", err);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const activeRoleColor = role === "student" ? "var(--student-color)" : role === "profesor" ? "var(--profesor-color)" : "var(--admin-color)";

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar role={role} onRoleChange={handleRoleChange} metrics={metrics} userId={userId} onUserChange={handleUserChange} users={users} onSuggestionClick={(s) => { setInput(s); setTimeout(() => document.getElementById("chat-input")?.focus(), 50); }} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <GpuDashboard gpuData={gpuData} />
          <InferencePipeline steps={currentSteps} isLoading={isLoading} />

          {/* Chat area */}
          <div style={{
            flex: 1, overflow: "auto", padding: "16px 0",
            background: `radial-gradient(ellipse at 20% 50%, rgba(96,165,250,0.03), transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.02), transparent 50%), var(--bg-primary)`,
          }}>
            {messages.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", padding: "40px", animation: "fadeIn 0.6s ease" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(96,165,250,0.15), rgba(167,139,250,0.15))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(96,165,250,0.15)" }}>
                  <Icons.Database />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Univerzitetski AI Asistent</div>
                  <div style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "480px", lineHeight: "1.7" }}>
                    Postavite pitanje o univerzitetskim podacima na srpskom jeziku. AI će generisati SQL upit, izvršiti ga i prikazati rezultate.
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                  {["Prikaži sve studente", "Prosečna ocena po predmetu", "Koji profesori predaju?"].map((s, i) => (
                    <button key={i} onClick={() => { setInput(s); setTimeout(() => document.getElementById("chat-input")?.focus(), 50); }}
                      style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px", fontFamily: "'Outfit', sans-serif", transition: "all 0.2s" }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = "var(--border-active)"; e.currentTarget.style.color = "var(--accent)"; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) =>
              msg.type === "system"
                ? <SystemMessage key={i} message={msg} />
                : <ChatMessage key={i} message={msg} onExport={handleExport} />
            )}

            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start", padding: "6px 20px", animation: "fadeIn 0.3s ease" }}>
                <div style={{ padding: "14px 18px", borderRadius: "16px 16px 16px 4px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[0, 1, 2].map(i => (<div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", animation: `progressPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />))}
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Obrađujem upit...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 20px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <textarea
                id="chat-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Postavite pitanje o univerzitetskim podacima..." rows={1}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: "14px", border: "1px solid var(--border)",
                  background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: "14px",
                  fontFamily: "'Outfit', sans-serif", outline: "none", resize: "none", lineHeight: "1.5",
                  transition: "border-color 0.2s, box-shadow 0.2s", minHeight: "44px", maxHeight: "120px",
                }}
                onFocus={e => { e.target.style.borderColor = `${activeRoleColor}50`; e.target.style.boxShadow = `0 0 0 3px ${activeRoleColor}10`; }}
                onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
              <button onClick={handleSend} disabled={isLoading || !input.trim()} style={{
                width: "44px", height: "44px", borderRadius: "12px", border: "none",
                background: isLoading || !input.trim() ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${activeRoleColor}, ${activeRoleColor}cc)`,
                color: isLoading || !input.trim() ? "var(--text-muted)" : "#fff",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0,
              }}>
                {isLoading ? <div style={{ width: 18, height: 18, border: "2px solid currentColor", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Icons.Send />}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", padding: "0 4px" }}>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Enter za slanje · Shift+Enter za novi red</span>
              <span style={{ fontSize: "10px", fontWeight: 600, color: activeRoleColor, letterSpacing: "0.04em" }}>{role.toUpperCase()} REŽIM · SAMO ČITANJE</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
