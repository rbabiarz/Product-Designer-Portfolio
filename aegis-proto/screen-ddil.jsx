// AEGIS DI — DDIL (S4) — forward deployed sync state.

const { useState: useStateDD } = React;

function ScreenDDIL({ data, tweaks }) {
  const d = data.ddil;
  const [queue, setQueue] = useStateDD(d.queue);
  const [syncing, setSyncing] = useStateDD(false);
  const [progress, setProgress] = useStateDD(0);
  const [resolved, setResolved] = useStateDD({});

  const startSync = () => {
    setSyncing(true); setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); setSyncing(false); return 100; }
        return p + 3;
      });
    }, 80);
  };

  const conflict = queue.find(q => q.conflict);
  const resolve = (id, choice) => {
    setResolved(r => ({ ...r, [id]: choice }));
    setQueue(arr => arr.map(q => q.id === id ? { ...q, conflict: false } : q));
  };

  return (
    <div className="screen-ddil">
      <Toolbar
        crumbs={["Supervisor", "Forward / DDIL", d.site]}
        title="Forward node — sync state"
        sub={`${d.site} · ${d.operator} · disconnected ${d.disconnectedFor}`}
        level={tweaks.classification}
        actions={
          <>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.download} size={13}/> Export sync log</button>
            <button className="btn btn-primary btn-sm" onClick={startSync} disabled={syncing}>
              {syncing ? `Syncing… ${progress}%` : <><Icon d={ICONS.bolt} size={13}/> Begin reconcile</>}
            </button>
          </>
        }
      />

      <div className="ddil-grid scroll">

        {/* Status banner */}
        <div className="ddil-status panel dark">
          <div className="ddil-status-l">
            <div className="ddil-state-light"/>
            <div>
              <div className="ddil-state-l">LINK STATE</div>
              <div className="ddil-state-v">
                {tweaks.ddil === "online" ? "NOMINAL" : tweaks.ddil === "degraded" ? "DEGRADED" : "DISCONNECTED"}
              </div>
              <div className="muted mono" style={{ fontSize: 11 }}>{d.bandwidth}</div>
            </div>
          </div>
          <div className="ddil-status-r">
            <div className="kv-grid">
              <dt>Site</dt><dd>{d.site}</dd>
              <dt>Operator</dt><dd>{d.operator}</dd>
              <dt>Disconnected</dt><dd>{d.disconnectedFor}</dd>
              <dt>Last sync</dt><dd>{d.lastSync}</dd>
              <dt>Local cache</dt><dd>4.7 GB / 16 GB · 47 PIRs sliced</dd>
              <dt>Local AI</dt><dd>Entity resolution on-device · drafting offline</dd>
            </div>
          </div>
        </div>

        {/* Sync map / progress */}
        <div className="panel dark">
          <div className="panel-h">Reconcile pipeline</div>
          <div className="panel-body">
            <div className="ddil-pipe">
              <div className="pipe-node">
                <div className="pipe-node-l">FORWARD</div>
                <div className="pipe-node-v">{queue.filter(q => q.direction === "push").length}</div>
                <div className="pipe-node-d">objects to push</div>
              </div>
              <div className={`pipe-line ${syncing ? "active" : ""}`}>
                <div className="pipe-line-bar" style={{ width: progress + "%" }}/>
                <div className="pipe-line-l mono">
                  {syncing
                    ? `~${Math.max(0, Math.round((100-progress)/100*45))}s remaining · 256 kbps`
                    : "READY · est. 38s"}
                </div>
              </div>
              <div className="pipe-node central">
                <Icon d={ICONS.shield} size={18}/>
                <div className="pipe-node-l">CRYPTO</div>
                <div className="pipe-node-d">SHA-3-512 hash chain · Ed25519 sig</div>
              </div>
              <div className={`pipe-line ${syncing ? "active reverse" : ""}`}>
                <div className="pipe-line-bar" style={{ width: progress + "%" }}/>
              </div>
              <div className="pipe-node">
                <div className="pipe-node-l">HOME</div>
                <div className="pipe-node-v">{queue.filter(q => q.direction === "pull").length}</div>
                <div className="pipe-node-d">objects to pull</div>
              </div>
            </div>
          </div>
        </div>

        {/* Conflict resolution */}
        {conflict && !resolved[conflict.id] && (
          <div className="panel ddil-conflict">
            <div className="panel-h" style={{ color: "var(--accent-amber-dim)" }}>
              <Icon d={ICONS.warn} size={13} style={{ color: "var(--accent-amber)" }}/>
              <span style={{ color: "var(--chrome-ink)", textTransform: "none", letterSpacing: 0 }}>
                Conflict requires human decision · {conflict.id}
              </span>
              <span className="spacer"/>
              <ClassificationChip level={conflict.cls}/>
            </div>
            <div className="panel-body">
              <div className="mono muted" style={{ fontSize: 11, marginBottom: 10 }}>{conflict.conflictNote}</div>
              <div className="conflict-pair">
                <div className="conflict-card">
                  <div className="conflict-card-h">
                    <span className="mono">FORWARD · {d.site}</span>
                    <span className="mono" style={{ color: "var(--chrome-muted)" }}>24 MAY 1102Z</span>
                  </div>
                  <div className="conflict-card-b">
                    <div className="cf-field">last sighting</div>
                    <div className="cf-old">21 MAY · 50km N CFS Alert</div>
                    <div className="cf-new">24 MAY · 22km W CFS Alert (HUMINT report HUM/FWD/0211)</div>
                  </div>
                  <button className="btn btn-accept btn-sm" onClick={() => resolve(conflict.id, "forward")}>
                    Keep forward version
                  </button>
                </div>
                <div className="conflict-vs">VS</div>
                <div className="conflict-card">
                  <div className="conflict-card-h">
                    <span className="mono">HOME · OTT-CORE-A2</span>
                    <span className="mono" style={{ color: "var(--chrome-muted)" }}>24 MAY 1418Z</span>
                  </div>
                  <div className="conflict-card-b">
                    <div className="cf-field">last sighting</div>
                    <div className="cf-old">21 MAY · 50km N CFS Alert</div>
                    <div className="cf-new">24 MAY · 38km NNE CFS Alert (GEOINT chip GEO/CHIP/4421)</div>
                  </div>
                  <button className="btn btn-accept btn-sm" onClick={() => resolve(conflict.id, "home")}>
                    Keep home version
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                <button className="btn btn-sm" onClick={() => resolve(conflict.id, "both")}>
                  Keep both as separate observations
                </button>
                <span className="muted mono" style={{ fontSize: 10 }}>
                  Auto-merge declined — object carries classification implications.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Queue */}
        <div className="panel">
          <div className="panel-h">
            Sync queue · {queue.length} objects
            <span className="spacer"/>
            <span className="muted mono" style={{ textTransform: "none", letterSpacing: 0 }}>{queue.filter(q => q.conflict).length} conflicts · {queue.filter(q => !q.conflict).length} clean</span>
          </div>
          <table className="sync-table">
            <thead>
              <tr>
                <th>Dir</th><th>ID</th><th>Kind</th><th>Classification</th><th>Title</th><th>Size</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {queue.map(q => (
                <tr key={q.id} className={q.conflict ? "row-conflict" : ""}>
                  <td>
                    {q.direction === "push"
                      ? <span className="chip outline" style={{ color: "var(--accent-emerald)", borderColor: "var(--accent-emerald)" }}>→ HOME</span>
                      : <span className="chip outline" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>← HOME</span>}
                  </td>
                  <td className="mono">{q.id}</td>
                  <td className="mono muted">{q.kind}</td>
                  <td><ClassificationChip level={q.cls}/></td>
                  <td>{q.title}</td>
                  <td className="mono muted">{q.size}</td>
                  <td>
                    {q.conflict
                      ? <span style={{ color: "var(--accent-amber)", fontWeight: 600 }}>CONFLICT — awaits decision</span>
                      : resolved[q.id]
                        ? <span style={{ color: "var(--accent-emerald)" }}>resolved · {resolved[q.id]}</span>
                        : progress === 100
                          ? <span style={{ color: "var(--accent-emerald)" }}>✓ synced</span>
                          : syncing
                            ? <span style={{ color: "var(--accent-cyan)" }}>⟳ syncing</span>
                            : <span className="muted">queued</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenDDIL });
