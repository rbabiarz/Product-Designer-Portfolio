// AEGIS DI — Watch Floor Coverage (S3) — live coverage, drag rebalance, duplication detection.

const { useState: useStateCov } = React;

function PIRColumn({ pir, analysts, onDrop, draggingId, setDragging, allowDrop }) {
  const col = analysts.filter(a => a.pir === pir.id);
  const totalLoad = col.reduce((s, a) => s + a.load, 0);
  const cap = col.length * 6;
  const depth = pir.depth;
  const queue = pir.queue;

  return (
    <div className={`pir-col pir-${depth}`}
      onDragOver={e => { if (allowDrop) e.preventDefault(); }}
      onDrop={e => { e.preventDefault(); onDrop(pir.id); }}>
      <div className="pir-col-h">
        <div className="pir-id">
          <span className="mono" style={{ color: "var(--chrome-muted)", fontSize: 10 }}>{pir.id}</span>
          <span className={`pir-depth depth-${depth}`}>
            {depth === "over" ? "UNDER-COVERED" : depth === "under" ? "QUIET" : "FIT"}
          </span>
        </div>
        <div className="pir-title">{pir.title}</div>
        <div className="pir-meta">
          <span><strong>Q</strong> {queue}</span>
          <span><strong>Load</strong> {totalLoad}/{cap}</span>
          <span><strong>Cap</strong> {col.length}</span>
        </div>
        <div className="pir-load-bar">
          <div className="pir-load-fill" style={{
            width: `${Math.min(100, (totalLoad/Math.max(1,cap))*100)}%`,
            background: depth === "over" ? "var(--accent-red)" : depth === "fit" ? "var(--accent-emerald)" : "var(--accent-amber)"
          }}/>
        </div>
      </div>
      <div className="pir-col-body">
        {col.map(an => (
          <div key={an.id}
            className={`an-card ${draggingId === an.id ? "dragging" : ""} ${an.status === "out" ? "an-out" : ""} ${an.duplicateWith ? "an-dup" : ""}`}
            draggable={an.status === "active"}
            onDragStart={() => setDragging(an.id)}
            onDragEnd={() => setDragging(null)}>
            <div className="an-card-h">
              <div className="an-avatar">{an.initials}</div>
              <div className="an-id">
                <div className="an-name">{an.name}</div>
                <div className="an-meta mono">{an.clearance} · since {an.since}</div>
              </div>
              {an.status === "out" && <span className="chip" style={{ background: "var(--chrome-hairline)", color: "var(--chrome-muted)", fontSize: 9 }}>OUT</span>}
            </div>
            <div className="an-load">
              <span className="mono" style={{ fontSize: 10, color: "var(--chrome-muted)" }}>LOAD</span>
              <div className="an-load-pips">
                {Array.from({length: 6}, (_, i) => (
                  <span key={i} className={`pip ${i < an.load ? "on" : ""} ${an.load >= 5 ? "hot" : ""}`}/>
                ))}
              </div>
              <span className="mono" style={{ fontSize: 10, color: "var(--chrome-ink)", fontWeight: 600 }}>{an.load}</span>
            </div>
            {an.note && <div className="an-note">{an.note}</div>}
            {an.duplicateWith && (
              <div className="an-dup-flag">
                <Icon d={ICONS.warn} size={11}/>
                <span>Possible duplication w/ {analysts.find(x => x.id === an.duplicateWith)?.initials}</span>
              </div>
            )}
          </div>
        ))}
        {col.length === 0 && (
          <div className="pir-empty">
            Drag analyst here to assign
          </div>
        )}
      </div>
    </div>
  );
}

function ScreenCoverage({ data, tweaks, onNav }) {
  const [analysts, setAnalysts] = useStateCov(data.analysts);
  const [draggingId, setDragging] = useStateCov(null);
  const [surge, setSurge] = useStateCov(false);
  const [log, setLog] = useStateCov([
    { ts: "14:28Z", who: "AEGIS", what: "Duplication detected — AN-02 (KO) and AN-03 (JT) on overlapping indicators IND-2026-0810 / IND-2026-0812" },
    { ts: "14:22Z", who: "AEGIS", what: "PIR-7 queue depth exceeded SLA (>18) — surfaced to supervisor" },
    { ts: "14:11Z", who: "Devon McKay", what: "Shift opened · 12 analysts roll call · 1 out (PS-medical)" }
  ]);

  const reassign = (pirId) => {
    if (!draggingId) return;
    const an = analysts.find(a => a.id === draggingId);
    if (!an || an.pir === pirId) return;
    setAnalysts(arr => arr.map(a => a.id === draggingId ? { ...a, pir: pirId, duplicateWith: null } : a));
    setLog(l => [
      { ts: "14:32Z", who: tweaks.role.name, what: `Reassigned ${an.name} (${an.id}) from ${an.pir} → ${pirId}. Rationale recorded.` },
      ...l
    ]);
    setDragging(null);
  };

  const dupePair = analysts.filter(a => a.duplicateWith);
  const mergeDupe = () => {
    setAnalysts(arr => arr.map(a => ({ ...a, duplicateWith: null })));
    setLog(l => [
      { ts: "14:32Z", who: tweaks.role.name, what: `Merged duplicate streams (${dupePair.map(x=>x.initials).join(" + ")}); AN-02 anchored.` },
      ...l
    ]);
  };

  return (
    <div className="screen-coverage">
      <Toolbar
        crumbs={["Supervisor", "Watch Floor"]}
        title="Watch Floor Coverage"
        sub="Shift 0800Z–2000Z · 12 analysts on roll · 1 out · 6 PIRs"
        level={tweaks.classification}
        actions={
          <>
            <button className={`btn btn-sm ${surge ? "danger" : ""}`} onClick={() => {
              setSurge(!surge);
              setLog(l => [{ ts: "14:32Z", who: tweaks.role.name, what: surge ? "Surge mode disengaged." : "SURGE MODE engaged — priority elevated, telemetry granular." }, ...l]);
            }}>
              {surge ? "Exit surge" : "Enter surge"}
            </button>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.doc} size={13}/> Shift handover</button>
            <button className="btn btn-primary btn-sm">Brief Director</button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="cov-kpis">
        <div className="kpi">
          <div className="kpi-l">Active</div>
          <div className="kpi-v">{analysts.filter(a => a.status === "active").length}<span className="kpi-su">/12</span></div>
          <div className="kpi-d">1 out (medical)</div>
        </div>
        <div className="kpi">
          <div className="kpi-l">Queue depth</div>
          <div className="kpi-v">67</div>
          <div className="kpi-d" style={{ color: "var(--accent-red)" }}>↑ 14 vs 15 min ago</div>
        </div>
        <div className="kpi">
          <div className="kpi-l">PIR coverage</div>
          <div className="kpi-v">4<span className="kpi-su">/6 fit</span></div>
          <div className="kpi-d" style={{ color: "var(--accent-amber)" }}>PIR-7, PIR-12 under-covered</div>
        </div>
        <div className="kpi">
          <div className="kpi-l">Duplication</div>
          <div className="kpi-v" style={{ color: dupePair.length ? "var(--accent-red)" : "var(--accent-emerald)" }}>
            {dupePair.length ? "1" : "0"}
          </div>
          <div className="kpi-d">
            {dupePair.length
              ? <button className="link-btn" onClick={mergeDupe}>Merge streams →</button>
              : "All streams unique"}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-l">Mean triage time</div>
          <div className="kpi-v">11m<span className="kpi-su">42s</span></div>
          <div className="kpi-d" style={{ color: "var(--accent-emerald)" }}>↓ 4m vs shift avg</div>
        </div>
        <div className="kpi">
          <div className="kpi-l">AI accept rate</div>
          <div className="kpi-v">68<span className="kpi-su">%</span></div>
          <div className="kpi-d">team · target 65%</div>
        </div>
      </div>

      <div className="cov-grid">
        <div className="cov-board scroll">
          <div className="cov-board-h muted mono">DRAG ANALYSTS BETWEEN PIRS · DROP TO REASSIGN · RATIONALE LOGGED</div>
          <div className="pir-cols">
            {data.pirs.map(pir => (
              <PIRColumn key={pir.id} pir={pir} analysts={analysts}
                onDrop={reassign} draggingId={draggingId} setDragging={setDragging}
                allowDrop={!!draggingId}/>
            ))}
          </div>
        </div>

        <div className="cov-log">
          <div className="cov-log-h">
            <Icon d={ICONS.clock} size={12}/>
            <span>SUPERVISOR LOG · LIVE</span>
            <span className="spacer"/>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.download} size={11}/></button>
          </div>
          <div className="cov-log-body scroll">
            {log.map((entry, i) => (
              <div key={i} className="log-entry">
                <div className="log-ts mono">{entry.ts}</div>
                <div className="log-who">{entry.who}</div>
                <div className="log-what">{entry.what}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenCoverage });
