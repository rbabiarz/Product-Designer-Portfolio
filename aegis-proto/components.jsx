// AEGIS DI — shared components (icons, chips, banner, sidebar)
// Globals expected: React

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- Icons (24×24 outline, currentColor) ----------
const Icon = ({ d, size = 16, sw = 1.6, fill = "none", className = "", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const ICONS = {
  globe: "M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18M3 12a9 9 0 1118 0 9 9 0 01-18 0z",
  triage: "M4 6h6l2-2h8v4M4 6v12h16V8M4 6v0M9 13l2 2 4-4",
  graph: <g><circle cx="6" cy="7" r="2.2"/><circle cx="18" cy="7" r="2.2"/><circle cx="12" cy="17" r="2.2"/><path d="M7.5 8.5L10.5 15.5M16.5 8.5L13.5 15.5M8 7h8"/></g>,
  draft: "M4 4h11l5 5v11H4zM15 4v5h5M8 12h8M8 16h6",
  shield: "M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z",
  watch: "M3 5h18v10H3zM7 19h10M9 15v4M15 15v4M7 9h3M13 9h4M7 12h4",
  ddil: <g><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><path d="M5 5l14 14"/></g>,
  release: "M9 4h6l5 5v11H9zM15 4v5h5M5 8H2v12h10v-3",
  search: <g><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></g>,
  filter: "M3 5h18l-7 9v6l-4-2v-4z",
  chevR: "M9 6l6 6-6 6",
  chevD: "M6 9l6 6 6-6",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5",
  download: "M12 4v12M6 10l6 6 6-6M4 20h16",
  upload: "M12 20V8M6 14l6-6 6 6M4 4h16",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6L6 18",
  check: "M5 12l4 4 10-10",
  warn: "M12 3l10 18H2zM12 10v5M12 18v.5",
  info: <g><circle cx="12" cy="12" r="9"/><path d="M12 8v0M12 11v6"/></g>,
  user: <g><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></g>,
  link: "M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66L11 7M14 10a4 4 0 00-5.66 0l-3 3A4 4 0 0011 18.66L13 17",
  clock: <g><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g>,
  brain: "M9 3a3 3 0 00-3 3v0a3 3 0 00-2 5v0a3 3 0 002 5v0a3 3 0 003 3h0a3 3 0 003-3V6a3 3 0 00-3-3zM15 3a3 3 0 013 3v0a3 3 0 012 5v0a3 3 0 01-2 5v0a3 3 0 01-3 3h0a3 3 0 01-3-3V6a3 3 0 013-3z",
  bolt: "M13 3L4 14h7l-1 7 9-11h-7z",
  pin: <g><path d="M12 21s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></g>,
  doc: "M6 3h9l4 4v14H6zM15 3v5h4M9 13h7M9 17h6M9 9h3",
  cog: <g><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.4.8a7 7 0 00-2-1.2L14 3h-4l-.5 2.5a7 7 0 00-2 1.2l-2.4-.8-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-.8a7 7 0 002 1.2L10 21h4l.5-2.5a7 7 0 002-1.2l2.4.8 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></g>,
  arrowR: "M5 12h14M13 5l7 7-7 7",
  scrub: "M3 8h18M3 16h18M7 4v4M11 12v4M16 6v4M19 14v4",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4z"
};

// ---------- Classification chip / banner ----------
const CLS_LABEL = {
  unclass: "UNCLASSIFIED",
  protb:   "PROTECTED B",
  secret:  "SECRET // SI // REL FVEY",
  ts:      "TOP SECRET // SI // NOFORN"
};
const CLS_SHORT = { unclass: "UNCLASS", protb: "PROT-B", secret: "SECRET", ts: "TOP SECRET" };

function ClassificationBanner({ level }) {
  return (
    <div className={`cls-banner cls-${level}`}>
      {CLS_LABEL[level]}
    </div>
  );
}

function ClassificationChip({ level, caveats = [] }) {
  return (
    <span className={`chip cls-${level}`}>
      {CLS_SHORT[level]}{caveats.length ? " // " + caveats.join(" // ") : ""}
    </span>
  );
}

function SourceChip({ kind }) {
  const map = {
    sigint: ["SIGINT", "source-sigint"],
    osint:  ["OSINT", "source-osint"],
    geoint: ["GEOINT", "source-geoint"],
    humint: ["HUMINT", "source-humint"],
    fininl: ["FININTEL", "source-fininl"],
    partner: ["PARTNER", "source-partner"],
    internal: ["INTERNAL", "source-partner"]
  };
  const [label, cls] = map[kind] || [kind.toUpperCase(), "outline"];
  return <span className={`chip ${cls}`}>{label}</span>;
}

function Confidence({ value, label }) {
  const pct = Math.round(value * 100);
  const tier = value >= 0.75 ? "high" : value >= 0.5 ? "med" : "low";
  return (
    <span className="conf" title={`${label || "Confidence"} ${pct}%`}>
      <span className={`conf-bar ${tier}`}><i style={{ width: pct + "%" }}/></span>
      <span style={{ color: "var(--chrome-muted)" }}>{pct}%</span>
    </span>
  );
}

// ---------- Sidebar ----------
const NAV = [
  { id: "geo",        label: "Common Operating Picture", icon: "globe",  group: "MISSION" },
  { id: "triage",     label: "Indications & Warning",    icon: "triage", group: "MISSION", badge: "6" },
  { id: "entity",     label: "Entity Graph",             icon: "graph",  group: "MISSION" },
  { id: "assessment", label: "Assessments",              icon: "draft",  group: "ANALYST", badge: "3" },
  { id: "executive",  label: "Briefing Room",            icon: "shield", group: "ANALYST" },
  { id: "coverage",   label: "Watch Floor",              icon: "watch",  group: "SUPERVISOR", badgeAlert: "!" },
  { id: "ddil",       label: "Forward / DDIL",           icon: "ddil",   group: "SUPERVISOR" },
  { id: "release",    label: "Releasability",            icon: "release",group: "SUPERVISOR" }
];

function Sidebar({ active, onNav, role }) {
  const groups = [...new Set(NAV.map(n => n.group))];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">A</div>
        <div className="brand-text">
          <span className="brand-name">AEGIS DI</span>
          <span className="brand-sub">Polaris&nbsp;·&nbsp;v1.0-rc2</span>
        </div>
      </div>

      <div className="role-card" title={`${role.name} — ${role.clearance}`}>
        <div className="role-avatar">{role.initials}</div>
        <div className="role-info">
          <div className="role-name">{role.name}</div>
          <div className="role-title">{role.title}</div>
        </div>
      </div>

      <div className="scroll" style={{ flex: 1 }}>
        {groups.map(g => (
          <div key={g}>
            <div className="nav-section">{g}</div>
            <div className="nav-list">
              {NAV.filter(n => n.group === g).map(n => (
                <button
                  key={n.id}
                  className={`nav-item ${active === n.id ? "active" : ""}`}
                  onClick={() => onNav(n.id)}>
                  <span className="nav-icon"><Icon d={ICONS[n.icon]} /></span>
                  <span>{n.label}</span>
                  {n.badge && <span className="nav-badge">{n.badge}</span>}
                  {n.badgeAlert && <span className="nav-badge alert">{n.badgeAlert}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sb-footer">
        <span>ATO: Q3-2026</span>
        <span>SR-101</span>
      </div>
    </aside>
  );
}

// ---------- Status bar ----------
function StatusBar({ ddilState, classification, online, lastSync }) {
  const ddilLabel = ddilState === "online" ? "LINK NOMINAL"
    : ddilState === "degraded" ? "LINK DEGRADED"
    : "DISCONNECTED";
  return (
    <div className={`status-bar ${ddilState}`}>
      <span className="pulse-dot"/>
      <span style={{ color: "var(--chrome-ink)", fontWeight: 600 }}>{ddilLabel}</span>
      <span className="sep"/>
      <span>NODE&nbsp;·&nbsp;OTT-CORE-A2</span>
      <span className="sep"/>
      <span>TENANT&nbsp;·&nbsp;CFINTCOM</span>
      <span className="sep"/>
      <span>CLS&nbsp;·&nbsp;{CLS_SHORT[classification]}</span>
      <span className="sep"/>
      <span>SYNC&nbsp;·&nbsp;{lastSync}</span>
      <span style={{ marginLeft: "auto" }}>26 MAY 2026 · 14:32Z · {online ? "OPS" : "DEG"}</span>
    </div>
  );
}

// Toolbar (per-screen header)
function Toolbar({ crumbs, title, sub, actions, level, caveats = [] }) {
  return (
    <div className="toolbar">
      <div>
        <div className="crumbs">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="crumb-sep">/</span>}
              <span className={i === crumbs.length - 1 ? "crumb-now" : ""}>{c}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="title-block">
          <h1>{title}</h1>
          {sub && <div className="sub">{sub}</div>}
        </div>
      </div>
      <div className="spacer"/>
      {level && <ClassificationChip level={level} caveats={caveats} />}
      <div className="actions">{actions}</div>
    </div>
  );
}

// ---------- "Ask AEGIS" command popover ----------
function AskAegis({ open, onClose }) {
  const [q, setQ] = useState("");
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  const SUGGESTIONS = [
    "Who is EX-IRBIS-04 and what is recent on them?",
    "Summarise PETREL-3 activity in the last 72 hours.",
    "Show entities linked to LANDFALL CONSULTING LTD.",
    "What is the basis for KJ-2 in assessment 0044?",
    "Where is m/v Atlantic Heron now and when did AIS resume?"
  ];

  const FAKE_ANSWERS = {
    default: {
      text: "Based on retrieved sources, PETREL-3 re-templated its primary narrative to emphasise sovereignty grievance over the 48 hours ending 1200Z 25 MAY 26. Synchronised posting across 14 anchor accounts (Δ < 6 min) is consistent with prior PETREL-3 surges.",
      cites: ["OSI/MED/1102-B", "PART/UK-CFI/22", "AEG/PAT/3382"],
      note: "Retrieved 3 of 47 candidate sources at confidence ≥ 0.70. No content generated beyond what is grounded above."
    }
  };

  const ask = () => {
    if (!q.trim()) return;
    setHistory(h => [...h, { q, a: FAKE_ANSWERS.default, ts: new Date() }]);
    setQ("");
  };

  if (!open) return null;
  return (
    <div className="ask-overlay" onClick={onClose}>
      <div className="ask-modal" onClick={e => e.stopPropagation()}>
        <div className="ask-head">
          <Icon d={ICONS.brain} size={14} />
          <span>Ask AEGIS</span>
          <span className="ask-sub">Grounded in your retrievable corpus · clearance-gated</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon d={ICONS.x} size={14}/></button>
        </div>
        <div className="ask-body scroll">
          {history.length === 0 && (
            <div className="ask-suggest">
              <div className="ask-suggest-label">Try:</div>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="ask-suggest-item" onClick={() => { setQ(s); }}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {history.map((h, i) => (
            <div key={i} className="ask-entry">
              <div className="ask-q">› {h.q}</div>
              <div className="ai-block ask-a">
                <div className="ai-label">Retrieved · Aegis QA · v2.3.1</div>
                <div className="ask-a-text">{h.a.text}</div>
                <div className="ask-a-cites">
                  {h.a.cites.map(c => <span key={c} className="chip outline-dark">{c}</span>)}
                </div>
                <div className="ask-a-note">{h.a.note}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="ask-input">
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") ask(); if (e.key === "Escape") onClose(); }}
            placeholder="Ask a question grounded in your retrievable corpus…"
          />
          <button className="btn btn-primary btn-sm" onClick={ask}>
            <Icon d={ICONS.send} size={12}/> Send
          </button>
        </div>
        <div className="ask-foot">
          Generated content is bounded to retrieved evidence. Citations are mandatory. No model output without source.
        </div>
      </div>
    </div>
  );
}

// expose
Object.assign(window, { Icon, ICONS, ClassificationBanner, ClassificationChip, SourceChip, Confidence, Sidebar, StatusBar, Toolbar, AskAegis, CLS_LABEL, CLS_SHORT, NAV });
