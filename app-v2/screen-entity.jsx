// AEGIS DI — Entity profile + link analysis graph

const { useState: useStateEnt, useMemo: useMemoEnt } = React;

// Graph nodes positioned on a force-ish layout (hand-tuned)
const GRAPH_NODES = [
  { id: "EX-IRBIS-04", x: 500, y: 280, kind: "person", label: "EX-IRBIS-04", primary: true, conf: 0.78 },
  { id: "ORG-ARC-VERA", x: 290, y: 200, kind: "org", label: "Vera Geological Surveys" },
  { id: "PER-MIKHAILOV", x: 700, y: 180, kind: "person", label: "Mikhailov A.S." },
  { id: "LOC-CFS-ALERT", x: 720, y: 380, kind: "place", label: "CFS Alert" },
  { id: "EQ-VEH-WHITE", x: 290, y: 380, kind: "equip", label: "Field veh. (white)" },
  { id: "ORG-LANDFALL-CONS", x: 130, y: 290, kind: "org", label: "LANDFALL CONS." },
  { id: "PER-NK-NOM", x: 130, y: 130, kind: "person", label: "K. Novak (nominee)" },
  { id: "EVT-2025-Q4", x: 510, y: 80, kind: "event", label: "2025-Q4 transit", historical: true },
  { id: "DOC-SIG-0826", x: 870, y: 280, kind: "source", label: "SIG/R/0826-114" },
  { id: "DOC-OSI-9912", x: 870, y: 380, kind: "source", label: "OSI/TWX/9912-A" }
];

const GRAPH_EDGES = [
  { a: "EX-IRBIS-04", b: "ORG-ARC-VERA", kind: "employed", conf: 0.84 },
  { a: "EX-IRBIS-04", b: "PER-MIKHAILOV", kind: "associate", conf: 0.71 },
  { a: "EX-IRBIS-04", b: "LOC-CFS-ALERT", kind: "operates near", conf: 0.78, dashed: true, ai: true },
  { a: "EX-IRBIS-04", b: "EQ-VEH-WHITE", kind: "uses", conf: 0.62 },
  { a: "EX-IRBIS-04", b: "EVT-2025-Q4", kind: "participated", conf: 0.91 },
  { a: "ORG-ARC-VERA", b: "ORG-LANDFALL-CONS", kind: "common UBO", conf: 0.66, dashed: true, ai: true },
  { a: "ORG-LANDFALL-CONS", b: "PER-NK-NOM", kind: "director", conf: 0.98 },
  { a: "EX-IRBIS-04", b: "DOC-SIG-0826", kind: "cited by", conf: 0.78 },
  { a: "EX-IRBIS-04", b: "DOC-OSI-9912", kind: "cited by", conf: 0.62 }
];

const NODE_COLOR = {
  person: "#6fcbb0",
  org: "#d4a036",
  place: "#16a34a",
  equip: "#8b6fd9",
  event: "#e64d3c",
  source: "#98a2b3"
};

function EntityGraph({ focusId, onSelect, selectedId }) {
  return (
    <div className="ent-graph">
      <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern id="eg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22332f" strokeWidth="0.4"/>
          </pattern>
          <marker id="eg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6fcbb0" opacity="0.6"/>
          </marker>
        </defs>
        <rect width="1000" height="500" fill="#16211f"/>
        <rect width="1000" height="500" fill="url(#eg-grid)"/>

        {/* Edges */}
        {GRAPH_EDGES.map((e, i) => {
          const a = GRAPH_NODES.find(n => n.id === e.a);
          const b = GRAPH_NODES.find(n => n.id === e.b);
          const color = e.ai ? "#8b6fd9" : "#46625c";
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={color} strokeWidth={e.ai ? 1.3 : 1}
                strokeDasharray={e.dashed ? "5 4" : "0"} opacity={0.6}
                markerEnd={e.kind === "cited by" ? "url(#eg-arrow)" : null}/>
              <text x={(a.x+b.x)/2} y={(a.y+b.y)/2 - 4}
                fill={e.ai ? "#8b6fd9" : "#667085"} fontSize="9"
                fontFamily="JetBrains Mono, monospace" textAnchor="middle">
                {e.kind}{e.ai ? " ⟡ AI" : ""}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {GRAPH_NODES.map(n => {
          const color = NODE_COLOR[n.kind];
          const isSel = selectedId === n.id;
          const isPrim = n.primary;
          const r = isPrim ? 22 : 16;
          return (
            <g key={n.id} style={{ cursor: "pointer" }} onClick={() => onSelect(n.id)}>
              {isPrim && (
                <circle cx={n.x} cy={n.y} r={r+10} fill="none" stroke={color} strokeOpacity="0.25">
                  <animate attributeName="r" values={`${r+6};${r+14};${r+6}`} dur="3s" repeatCount="indefinite"/>
                </circle>
              )}
              <circle cx={n.x} cy={n.y} r={r}
                fill={n.historical ? "transparent" : color}
                fillOpacity={n.historical ? 0 : 0.18}
                stroke={isSel ? "white" : color}
                strokeWidth={isSel ? 2.5 : 1.5}
                strokeDasharray={n.historical ? "3 3" : "0"}/>
              <text x={n.x} y={n.y+4} fill={color}
                fontSize="11" fontFamily="JetBrains Mono, monospace"
                fontWeight="700" textAnchor="middle">
                {n.kind === "person" ? "P" : n.kind === "org" ? "O" : n.kind === "place" ? "L" : n.kind === "equip" ? "E" : n.kind === "event" ? "T" : "S"}
              </text>
              <text x={n.x} y={n.y+r+14} fill={isSel ? "white" : "#d0d5dd"}
                fontSize="10" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
                {n.label}
              </text>
            </g>
          );
        })}

        <text x="16" y="20" fill="#667085" fontSize="10" fontFamily="JetBrains Mono, monospace">
          ENTITY GRAPH · 10 nodes · 9 edges · 2 AI-suggested (dashed) · last refresh 14:31:48Z
        </text>
      </svg>

      {/* Legend */}
      <div className="ent-legend">
        {Object.entries(NODE_COLOR).map(([k, c]) => (
          <span key={k} className="ent-legend-item">
            <i style={{ background: c }}/>
            {k}
          </span>
        ))}
        <span className="ent-legend-item">
          <i style={{ background: "transparent", border: "1.5px dashed #8b6fd9" }}/>
          AI-suggested edge
        </span>
      </div>

      {/* Tools */}
      <div className="ent-tools">
        <button className="btn btn-sm">Focus +</button>
        <button className="btn btn-sm">Expand 1°</button>
        <button className="btn btn-sm">Layout: force</button>
        <button className="btn btn-sm">Time slice</button>
      </div>
    </div>
  );
}

function ScreenEntity({ data, tweaks, focusId, onNav }) {
  const ent = data.entities.find(e => e.id === focusId) || data.entities[0];
  const [sel, setSel] = useStateEnt(ent.id);

  return (
    <div className="screen-entity">
      <Toolbar
        crumbs={["Mission", "Entity Graph", ent.id]}
        title={ent.label}
        sub={ent.subtitle}
        level={tweaks.classification}
        caveats={tweaks.classification === "secret" ? ["REL FVEY"] : []}
        actions={
          <>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.pin} size={13}/> Add to watchlist</button>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.draft} size={13}/> Open assessments ({ent.reports})</button>
            <button className="btn btn-primary btn-sm" onClick={() => onNav("assessment")}>
              <Icon d={ICONS.plus} size={13}/> New assessment
            </button>
          </>
        }
      />

      <div className="ent-grid">
        <div className="ent-left scroll">
          <div className="panel">
            <div className="panel-h">Entity profile</div>
            <div className="panel-body">
              <div className="ent-id-block">
                <div className="ent-id-mark" style={{ background: NODE_COLOR[ent.kind] + "22", color: NODE_COLOR[ent.kind] }}>
                  {ent.kind === "person" ? "P" : ent.kind === "org" ? "O" : ent.kind === "campaign" ? "C" : "?"}
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--chrome-muted)" }}>{ent.id}</div>
                  <div style={{ font: "600 16px var(--font-display)", color: "var(--chrome-ink)" }}>{ent.label}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--chrome-muted)", marginTop: 3 }}>
                    {ent.subtitle}
                  </div>
                </div>
              </div>
              <p style={{ font: "500 12.5px/1.55 var(--font-display)", color: "var(--chrome-body)", margin: "12px 0" }}>
                {ent.summary}
              </p>
              <dl className="kv-grid">
                {Object.entries(ent.attrs).map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt>{k}</dt><dd>{v}</dd>
                  </React.Fragment>
                ))}
                <dt>Reports</dt><dd className="mono">{ent.reports}</dd>
                <dt>Links</dt><dd className="mono">{ent.links}</dd>
                <dt>Resolution</dt><dd><Confidence value={ent.conf}/></dd>
              </dl>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <div className="panel-h">Activity timeline · 30d</div>
            <div className="panel-body">
              <div className="mini-tl">
                {[2, 0, 1, 0, 0, 3, 1, 0, 2, 4, 1, 0, 0, 1, 2, 0, 1, 3, 5, 2, 1, 0, 0, 4, 2, 1, 0, 3, 6, 2].map((v, i) => (
                  <div key={i} className="mini-tl-day" style={{ height: `${Math.max(2, v*8)}px`, opacity: v ? 0.8 : 0.25 }}/>
                ))}
              </div>
              <div className="muted mono" style={{ fontSize: 10, display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span>26 APR</span><span>26 MAY</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ent-center">
          <EntityGraph selectedId={sel} onSelect={setSel}/>
        </div>

        <div className="ent-right scroll">
          <div className="panel">
            <div className="panel-h">
              Reports · 47
              <span className="spacer"/>
              <button className="btn btn-ghost btn-sm"><Icon d={ICONS.filter} size={12}/></button>
            </div>
            <div className="ent-reports">
              {[
                { ref: "SIG/R/0826-114", k: "sigint", t: "21 MAY · voice fragment", c: "secret" },
                { ref: "OSI/TWX/9912-A", k: "osint",  t: "21 MAY · social post", c: "protb" },
                { ref: "HUM/LIA/0188",   k: "humint", t: "18 MAY · liaison brief", c: "secret" },
                { ref: "GEO/CHIP/4421",  k: "geoint", t: "12 MAY · sat chip 0.5m", c: "secret" },
                { ref: "SIG/E/0815-022", k: "sigint", t: "08 MAY · pattern hit", c: "secret" },
                { ref: "OSI/MED/1080-A", k: "osint",  t: "04 MAY · forum mention", c: "unclass" }
              ].map(r => (
                <div key={r.ref} className="ent-report">
                  <div className="ent-report-h">
                    <SourceChip kind={r.k}/>
                    <span className="mono" style={{ fontSize: 11, color: "var(--chrome-ink)" }}>{r.ref}</span>
                    <span className="spacer"/>
                    <ClassificationChip level={r.c}/>
                  </div>
                  <div className="ent-report-t">{r.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenEntity });
