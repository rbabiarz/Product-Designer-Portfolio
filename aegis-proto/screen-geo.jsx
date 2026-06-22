// AEGIS DI — Common Operating Picture (geospatial landing)
// Dark map panel with pins, time-slider, contextual rail.

const { useState: useStateGeo, useEffect: useEffectGeo, useMemo: useMemoGeo } = React;

function MapCanvas({ pins, onPin, selected, density }) {
  // SVG-rendered "Canada-ish" mass — abstract but evocative
  return (
    <div className="map-stage">
      <svg className="map-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="mg-glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1f2f2b" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#16211f" stopOpacity="1"/>
          </radialGradient>
          <pattern id="mg-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#22332f" strokeWidth="0.5"/>
          </pattern>
          <filter id="mg-blur"><feGaussianBlur stdDeviation="1.5"/></filter>
        </defs>
        <rect width="1000" height="600" fill="url(#mg-glow)"/>
        <rect width="1000" height="600" fill="url(#mg-grid)"/>

        {/* Lat/long graticule */}
        {[120, 240, 360, 480].map(y => (
          <line key={y} x1="0" x2="1000" y1={y} y2={y} stroke="#2a3d38" strokeWidth="0.6" strokeDasharray="2 6"/>
        ))}
        {[200, 400, 600, 800].map(x => (
          <line key={x} y1="0" y2="600" x1={x} x2={x} stroke="#2a3d38" strokeWidth="0.6" strokeDasharray="2 6"/>
        ))}

        {/* Abstract landmass — Canada-ish silhouette */}
        <path
          d="M120,520 L80,460 L70,400 L100,350 L60,300 L50,240 L80,180 L130,140 L180,120 L240,100 L320,80 L420,60 L540,60 L640,80 L760,90 L840,120 L900,150 L920,200 L890,260 L900,320 L880,360 L920,400 L900,450 L840,470 L780,490 L700,500 L620,510 L540,500 L460,510 L380,520 L300,510 L220,520 Z"
          fill="#22332f" stroke="#3a524d" strokeWidth="1"
        />
        <path
          d="M120,520 L80,460 L70,400 L100,350 L60,300 L50,240 L80,180 L130,140 L180,120 L240,100 L320,80 L420,60 L540,60 L640,80 L760,90 L840,120 L900,150"
          fill="none" stroke="#6fcbb0" strokeWidth="0.8" opacity="0.35"
        />

        {/* AO outlines */}
        <g stroke="#6fcbb0" strokeWidth="0.8" strokeDasharray="3 4" fill="rgba(111,203,176,0.04)">
          <path d="M 200,80 L 700,70 L 700,160 L 200,170 Z"/>
          <text x="220" y="100" fill="#6fcbb0" fontSize="10" fontFamily="JetBrains Mono, monospace" opacity="0.7" stroke="none">AO-NORTH</text>
          <path d="M 480,180 L 880,180 L 870,440 L 480,440 Z"/>
          <text x="520" y="200" fill="#6fcbb0" fontSize="10" fontFamily="JetBrains Mono, monospace" opacity="0.7" stroke="none">AO-EAST</text>
          <path d="M 60,360 L 320,360 L 320,560 L 80,560 Z"/>
          <text x="100" y="380" fill="#6fcbb0" fontSize="10" fontFamily="JetBrains Mono, monospace" opacity="0.7" stroke="none">AO-WEST</text>
        </g>

        {/* Connection lines between linked indicators */}
        {pins.map((p, i) => pins.slice(i+1).map((q, j) => {
          // Just draw a couple of subtle correlation arcs
          if (Math.abs(p.x - q.x) + Math.abs(p.y - q.y) > 0.4) return null;
          return (
            <line key={`${i}-${j}`}
              x1={p.x*1000} y1={p.y*600}
              x2={q.x*1000} y2={q.y*600}
              stroke="#6fcbb0" strokeWidth="0.6" strokeDasharray="2 3" opacity="0.35"/>
          );
        }))}

        {/* Pins */}
        {pins.map(p => {
          const cx = p.x * 1000;
          const cy = p.y * 600;
          const color = p.sev === "s1" ? "#e64d3c" : p.sev === "s2" ? "#d4a036" : "#16a34a";
          const isSel = selected === p.id;
          return (
            <g key={p.id} style={{ cursor: "pointer" }} onClick={() => onPin(p.id)}>
              {/* pulse ring for s1 */}
              {p.sev === "s1" && (
                <circle cx={cx} cy={cy} r="20" fill={color} opacity="0.18">
                  <animate attributeName="r" values="14;26;14" dur="2.6s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.35;0.02;0.35" dur="2.6s" repeatCount="indefinite"/>
                </circle>
              )}
              <circle cx={cx} cy={cy} r={isSel ? 9 : 6} fill={color} fillOpacity="0.85" stroke={isSel ? "white" : "#16211f"} strokeWidth={isSel ? 2 : 1.5}/>
              <text x={cx + 11} y={cy + 3} fill={isSel ? "white" : "#d0d5dd"}
                    fontSize="10" fontFamily="JetBrains Mono, monospace" stroke="none">
                {p.label}
              </text>
            </g>
          );
        })}

        {/* compass / scale */}
        <g transform="translate(932,524)" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#667085" stroke="none">
          <circle cx="0" cy="0" r="22" fill="none" stroke="#354b46" strokeWidth="0.8"/>
          <path d="M 0,-18 L 3,0 L 0,3 L -3,0 Z" fill="#6fcbb0" stroke="none"/>
          <text x="-3" y="-24">N</text>
        </g>
        <g transform="translate(30,560)" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#667085" stroke="none">
          <line x1="0" y1="0" x2="120" y2="0" stroke="#667085" strokeWidth="1"/>
          <line x1="0" y1="-4" x2="0" y2="4" stroke="#667085"/>
          <line x1="120" y1="-4" x2="120" y2="4" stroke="#667085"/>
          <text x="0" y="16">0</text>
          <text x="100" y="16">500 km</text>
        </g>

        {/* projection label */}
        <text x="16" y="20" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#667085" stroke="none">
          PROJ · EPSG:3979 · NAD83/Statistics Canada Lambert
        </text>
        <text x="16" y="36" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5c6b67" stroke="none">
          ZOOM 4.2 · GRID 50 km · UPDATE 14:32:11Z
        </text>
      </svg>

      {/* Layer toggles overlay */}
      <div className="map-layers">
        <div className="map-layers-h">LAYERS</div>
        {[
          { id: "geo", l: "GEOINT pins", on: true, c: "amber" },
          { id: "sig", l: "SIGINT events", on: true, c: "cyan" },
          { id: "osi", l: "OSINT mentions", on: true, c: "violet" },
          { id: "fvey", l: "FVEY shared", on: false, c: "blue" },
          { id: "ais", l: "AIS tracks", on: true, c: "emerald" },
          { id: "wx", l: "Weather", on: false, c: "muted" }
        ].map(l => (
          <label key={l.id} className="map-layer">
            <input type="checkbox" defaultChecked={l.on}/>
            <span className={`map-layer-swatch sw-${l.c}`}/>
            <span>{l.l}</span>
          </label>
        ))}
      </div>

      {/* Sev legend */}
      <div className="map-legend">
        <span className="sev s1">Sev 1 — immediate</span>
        <span className="sev s2">Sev 2 — high</span>
        <span className="sev s3">Sev 3 — routine</span>
      </div>
    </div>
  );
}

function TimeSlider({ value, onChange }) {
  return (
    <div className="time-slider">
      <div className="ts-label">
        <span>T-72h</span>
        <span>NOW · 26 MAY 14:32Z</span>
      </div>
      <div className="ts-track">
        {/* tick marks with indicator density */}
        {[6, 12, 4, 9, 11, 14, 18, 22, 16, 8, 5, 12, 14, 19, 24, 16, 21, 18, 13, 11, 9, 14, 17, 12].map((h, i) => (
          <div key={i} className="ts-bar" style={{ height: `${h*2.4}px` }}/>
        ))}
        <input
          type="range" min="0" max="100" value={value}
          onChange={e => onChange(+e.target.value)}
          className="ts-input"
        />
        <div className="ts-handle" style={{ left: `${value}%` }}>
          <div className="ts-handle-bar"/>
          <div className="ts-handle-label">{value === 100 ? "LIVE" : `T-${((100-value)/100*72).toFixed(0)}h`}</div>
        </div>
      </div>
      <div className="ts-controls">
        <button className="btn btn-ghost btn-sm">⟨⟨ -6h</button>
        <button className="btn btn-ghost btn-sm">⟨ -1h</button>
        <button className="btn btn-primary btn-sm">▶ Play 8×</button>
        <button className="btn btn-ghost btn-sm">+1h ⟩</button>
        <button className="btn btn-ghost btn-sm">+6h ⟩⟩</button>
        <span style={{ marginLeft: "auto", color: "var(--data-muted)", font: "500 11px var(--font-mono)" }}>
          24h window · 6 indicators
        </span>
      </div>
    </div>
  );
}

function CopRail({ pins, indicators, selected, onSelect }) {
  return (
    <div className="cop-rail">
      <div className="cop-rail-h">
        <span>LIVE FEED</span>
        <span className="muted mono" style={{ fontSize: 10 }}>last 72h · 6</span>
      </div>
      <div className="cop-rail-body scroll">
        {indicators.map(ind => {
          const isSel = selected === ind.id;
          const mins = Math.round((window.AEGIS_DATA.NOW.getTime() - ind.ts.getTime()) / 60000);
          const ago = mins < 60 ? `${mins}m` : `${(mins/60).toFixed(1)}h`;
          return (
            <button key={ind.id} className={`cop-feed-item ${isSel ? "on" : ""}`} onClick={() => onSelect(ind.id)}>
              <div className="cop-feed-h">
                <span className={`sev ${ind.severity}`}>SEV {ind.severity.slice(1)}</span>
                <span className="mono" style={{ color: "var(--data-muted)", fontSize: 10 }}>{ind.id} · {ago} ago</span>
              </div>
              <div className="cop-feed-title">{ind.title}</div>
              <div className="cop-feed-sources">
                {ind.sources.map(s => <SourceChip key={s.ref} kind={s.kind}/>)}
                <span className="mono" style={{ color: "var(--data-muted-soft)", fontSize: 10, marginLeft: "auto" }}>{ind.region}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScreenGeo({ data, onOpenTriage, tweaks }) {
  const [selected, setSelected] = useStateGeo("IND-2026-0814");
  const [t, setT] = useStateGeo(100);
  const ind = data.indicators.find(i => i.id === selected);

  return (
    <div className="screen-geo">
      <Toolbar
        crumbs={["Mission", "Common Operating Picture"]}
        title="Common Operating Picture"
        sub="6 active indicators · 3 AOs · time window 24h"
        level={tweaks.classification}
        caveats={tweaks.classification === "secret" ? ["REL FVEY"] : []}
        actions={
          <>
            <div className="seg">
              <button className="on">Map</button>
              <button>Tracks</button>
              <button>Heatmap</button>
            </div>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.layers} size={13}/> Layers</button>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.filter} size={13}/> Filter</button>
          </>
        }
      />

      <div className="geo-grid">
        <div className="geo-main">
          <MapCanvas
            pins={data.geoPins}
            onPin={setSelected}
            selected={selected}
            density={tweaks.density}
          />
          <TimeSlider value={t} onChange={setT}/>
        </div>
        <CopRail pins={data.geoPins} indicators={data.indicators} selected={selected} onSelect={setSelected}/>
      </div>

      {/* Quick-look panel under map */}
      {ind && (
        <div className="quick-look panel">
          <div className="panel-h">
            <span className={`sev ${ind.severity}`}>SEV {ind.severity.slice(1)}</span>
            <span style={{ color: "var(--chrome-ink)", textTransform: "none", letterSpacing: 0 }}>{ind.id} — {ind.title}</span>
            <span className="spacer"/>
            <span className="panel-meta">{ind.coords}</span>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenTriage(ind.id)}>
              Open in Triage <Icon d={ICONS.arrowR} size={12}/>
            </button>
          </div>
          <div className="panel-body" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 18 }}>
            <div>
              <div className="kv-grid">
                <dt>Region</dt><dd>{ind.region}</dd>
                <dt>Coords</dt><dd>{ind.coords}</dd>
                <dt>Reported</dt><dd>{data.fmtZulu(ind.ts)}</dd>
                <dt>Sources</dt>
                <dd style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {ind.sources.map(s => <SourceChip key={s.ref} kind={s.kind}/>)}
                </dd>
              </div>
            </div>
            <div>
              <div className="kv-grid">
                <dt>AI proposal</dt>
                <dd style={{ color: "var(--accent-violet)" }}>{ind.ai.proposedEntity}</dd>
                <dt>Confidence</dt>
                <dd><Confidence value={ind.ai.confidence}/></dd>
                <dt>Model</dt>
                <dd className="muted">{ind.ai.modelVersion}</dd>
              </div>
            </div>
            <div className="ai-block" style={{ borderLeftColor: "var(--accent-violet)" }}>
              <div className="ai-label">Reasoning trace · summarised</div>
              <div style={{ font: "500 12px/1.5 var(--font-display)", color: "var(--chrome-ink)" }}>
                {ind.ai.rationale}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ScreenGeo });
