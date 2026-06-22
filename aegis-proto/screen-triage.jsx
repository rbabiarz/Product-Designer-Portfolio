// AEGIS DI — Indications & Warning Triage (S1)
// Fused indicator card, AI entity resolution accept/modify/reject with reasoning trace.

const { useState: useStateTri } = React;

function IndicatorList({ indicators, selected, onSelect }) {
  return (
    <div className="tri-list scroll">
      <div className="tri-list-h">
        <span>QUEUE · 6</span>
        <span className="muted mono" style={{ fontSize: 10 }}>oldest 2h ago</span>
      </div>
      {indicators.map(ind => {
        const isSel = selected === ind.id;
        const mins = Math.round((window.AEGIS_DATA.NOW.getTime() - ind.ts.getTime()) / 60000);
        const ago = mins < 60 ? `${mins}m` : `${(mins/60).toFixed(1)}h`;
        return (
          <button key={ind.id} className={`tri-list-item ${isSel ? "on" : ""}`} onClick={() => onSelect(ind.id)}>
            <div className="tri-list-row">
              <span className={`sev ${ind.severity}`}>S{ind.severity.slice(1)}</span>
              <span className="mono" style={{ color: "var(--chrome-muted)", fontSize: 11 }}>{ind.id}</span>
              <span className="mono" style={{ color: "var(--chrome-muted-soft)", fontSize: 11, marginLeft: "auto" }}>{ago}</span>
            </div>
            <div className="tri-list-title">{ind.title}</div>
            <div className="tri-list-meta">
              {ind.sources.slice(0,3).map(s => <SourceChip key={s.ref} kind={s.kind}/>)}
              <span className="muted mono" style={{ fontSize: 10, marginLeft: "auto" }}>{ind.region}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FusedSourceCard({ source, data }) {
  const mins = Math.round((window.AEGIS_DATA.NOW.getTime() - source.time.getTime()) / 60000);
  return (
    <div className="src-card">
      <div className="src-card-h">
        <SourceChip kind={source.kind}/>
        <span className="mono" style={{ fontSize: 11, color: "var(--chrome-ink)" }}>{source.ref}</span>
        {source.caveat && <span className="chip outline" style={{ fontSize: 9 }}>{source.caveat}</span>}
        <span className="spacer"/>
        <span className="mono" style={{ fontSize: 10, color: "var(--chrome-muted)" }}>{mins}m ago · {data.fmtZulu(source.time)}</span>
      </div>
      <div className="src-card-b">
        {source.kind === "sigint" && (
          <>
            <div className="src-snippet mono">
              <span className="muted">/* voice fragment, ƒ-bin 04-A, dur 7.2s, lang RU-1 */</span><br/>
              <strong>SUBJECT-A:</strong> «…на территории, в пределах пятидесяти километров…»<br/>
              <strong>SUBJECT-B:</strong> «понял, продолжайте по плану»<br/>
              <span className="muted">[ trace truncated · 0.4s padding · noise floor -42dB ]</span>
            </div>
            <div className="src-kv">
              <span>Voice-print match</span><Confidence value={0.78}/>
              <span>Origin region</span><span className="mono">AO-NORTH · ±18km</span>
              <span>Collection auth.</span><span className="mono">CSE Mandate §16(1)(a)</span>
            </div>
          </>
        )}
        {source.kind === "osint" && (
          <>
            <div className="src-snippet">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #475467, #1d2939)", flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--chrome-muted)" }}>
                    @arctic_obs_91 · 2h ago · 14 likes · 3 reposts
                  </div>
                  <div style={{ font: "500 13px/1.45 var(--font-display)", color: "var(--chrome-ink)", marginTop: 2 }}>
                    Saw odd-looking survey vehicle near the ridge today. No company markings. Three guys, didn't talk much. Heading north. 📸
                  </div>
                </div>
              </div>
            </div>
            <div className="src-kv">
              <span>Account age</span><span className="mono">14 months · 47 posts</span>
              <span>Geo metadata</span><span className="mono">82.5°N 62.4°W · ±2km</span>
              <span>Bot score</span><span className="mono" style={{ color: "var(--accent-emerald)" }}>0.04 (low)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReasoningTrace({ indicator, decision, confOverride, setConfOverride }) {
  return (
    <div className="reasoning">
      <div className="reasoning-h">
        <Icon d={ICONS.brain} size={13}/>
        <span>Reasoning trace · {indicator.ai.modelVersion}</span>
        <span className="spacer"/>
        <span className="mono" style={{ fontSize: 10, color: "var(--data-muted)" }}>
          retrieved 14 candidates · top-3 ranked
        </span>
      </div>

      <div className="reasoning-body scroll dark">

        <div className="reason-step">
          <div className="reason-step-h">
            <span className="reason-num">01</span>
            <span>Retrieval</span>
            <span className="spacer"/>
            <span className="mono" style={{ fontSize: 10, color: "var(--data-muted)" }}>k=14, t=420ms</span>
          </div>
          <div className="reason-step-b">
            Cross-source retrieval matched two artefacts within a 90-minute window referencing entities in <span className="mono">AO-NORTH</span>:
            voice-print fragment from <span className="mono" style={{color:"var(--accent-cyan)"}}>SIG/R/0826-114</span> and
            geo-tagged image from <span className="mono" style={{color:"var(--accent-violet)"}}>OSI/TWX/9912-A</span>.
          </div>
        </div>

        <div className="reason-step">
          <div className="reason-step-h">
            <span className="reason-num">02</span>
            <span>Candidate resolution</span>
            <span className="spacer"/>
            <span className="mono" style={{ fontSize: 10, color: "var(--data-muted)" }}>3 candidates ranked</span>
          </div>
          <div className="reason-step-b">
            <div className="cand-row">
              <span className="cand-id" style={{ color: "var(--accent-emerald)" }}>EX-IRBIS-04</span>
              <Confidence value={0.78}/>
              <span className="cand-meta mono">prior AO-NORTH activity 2025-Q4 · 47 reports</span>
            </div>
            <div className="cand-row">
              <span className="cand-id" style={{ color: "var(--data-body)" }}>EX-VYHRA-12</span>
              <Confidence value={0.34}/>
              <span className="cand-meta mono">voice profile overlap, geography mismatch</span>
            </div>
            <div className="cand-row">
              <span className="cand-id" style={{ color: "var(--data-body)" }}>(novel entity)</span>
              <Confidence value={0.18}/>
              <span className="cand-meta mono">propose new — no prior match</span>
            </div>
          </div>
        </div>

        <div className="reason-step">
          <div className="reason-step-h">
            <span className="reason-num">03</span>
            <span>Supporting evidence</span>
          </div>
          <div className="reason-step-b">
            <ul className="reason-ul good">
              <li>Voice-print match against EX-IRBIS-04 reference sample (78% match, threshold 70%)</li>
              <li>Geographic proximity within AO-NORTH activity envelope (≤ 50km of resupply corridor)</li>
              <li>Temporal proximity (Δt 7 min between sources, within historical comms window)</li>
            </ul>
          </div>
        </div>

        <div className="reason-step">
          <div className="reason-step-h">
            <span className="reason-num">04</span>
            <span>Contradicting evidence</span>
            <span className="chip" style={{ background:"rgba(212,160,54,0.18)", color:"var(--accent-amber)", marginLeft: 8 }}>FLAG</span>
          </div>
          <div className="reason-step-b">
            <ul className="reason-ul bad">
              <li>{indicator.ai.contradicting || "—"}</li>
            </ul>
          </div>
        </div>

        <div className="reason-step">
          <div className="reason-step-h">
            <span className="reason-num">05</span>
            <span>Final proposal</span>
          </div>
          <div className="reason-step-b">
            <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 16px", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--data-muted)" }}>ENTITY</span>
              <span className="mono" style={{ color: "var(--accent-cyan)" }}>{indicator.ai.proposedEntity}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--data-muted)" }}>CONFIDENCE</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Confidence value={confOverride ?? indicator.ai.confidence}/>
                <span className="mono" style={{ fontSize: 10, color: "var(--data-muted)" }}>
                  {confOverride != null ? `override · was ${Math.round(indicator.ai.confidence*100)}%` : "model output"}
                </span>
              </div>
              <span className="mono" style={{ fontSize: 11, color: "var(--data-muted)" }}>ACTION</span>
              <span>Add link <span className="mono" style={{color:"var(--accent-cyan)"}}>IND-2026-0814 → {indicator.ai.proposedEntity}</span> with caveats inherited from sources.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ScreenTriage({ data, tweaks, focusId, onOpenEntity, onNav }) {
  const [selected, setSelected] = useStateTri(focusId || "IND-2026-0814");
  const [decision, setDecision] = useStateTri(null); // 'accept' | 'modify' | 'reject'
  const [confOverride, setConfOverride] = useStateTri(null);
  const [showLog, setShowLog] = useStateTri(true);
  const [log, setLog] = useStateTri([
    { ts: "14:31:48Z", who: "AEGIS · aegis-er-2.3.1", what: "Proposed entity resolution IND-2026-0814 → EX-IRBIS-04 @ 78%" },
    { ts: "14:31:48Z", who: "AEGIS · audit", what: "Reasoning trace persisted · 5 steps · 14 retrievals" }
  ]);

  const ind = data.indicators.find(i => i.id === selected);

  const decide = (kind, extra = "") => {
    setDecision(kind);
    setLog(l => [
      ...l,
      { ts: "14:32:" + String(Math.floor(Math.random()*60)).padStart(2,'0') + "Z",
        who: tweaks.role.name, what: `${kind.toUpperCase()} entity proposal — ${extra}` }
    ]);
  };

  return (
    <div className="screen-triage">
      <Toolbar
        crumbs={["Mission", "Indications & Warning", ind.id]}
        title={ind.title}
        sub={`${ind.id} · ${ind.region} · ${data.fmtZulu(ind.ts)}`}
        level={tweaks.classification}
        caveats={tweaks.classification === "secret" ? ["REL FVEY", "ORCON"] : []}
        actions={
          <>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.clock} size={13}/> Snooze</button>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.user} size={13}/> Reassign</button>
            <button className="btn btn-primary btn-sm" onClick={() => onNav("assessment")}>
              <Icon d={ICONS.draft} size={13}/> Promote to assessment
            </button>
          </>
        }
      />

      <div className="tri-grid">
        <IndicatorList indicators={data.indicators} selected={selected} onSelect={setSelected}/>

        <div className="tri-center scroll">
          {/* Indicator header */}
          <div className="panel">
            <div className="panel-h">
              <span className={`sev ${ind.severity}`}>SEV {ind.severity.slice(1)}</span>
              <span style={{ color: "var(--chrome-ink)", textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>
                Fused indicator card
              </span>
              <span className="spacer"/>
              <span className="panel-meta">{ind.sources.length} sources fused · {Math.round((window.AEGIS_DATA.NOW.getTime()-ind.ts.getTime())/60000)} min since first report</span>
            </div>
            <div className="panel-body">
              <div className="kv-grid" style={{ marginBottom: 14 }}>
                <dt>Indicator</dt><dd className="mono">{ind.id}</dd>
                <dt>Region</dt><dd>{ind.region} <span className="muted mono" style={{ marginLeft: 8 }}>{ind.coords}</span></dd>
                <dt>Reported</dt><dd>{data.fmtZulu(ind.ts)}</dd>
                <dt>Originator</dt><dd className="muted">CSE OPS / OSINT cell · auto-fused</dd>
              </div>
              <div className="src-stack">
                {ind.sources.map(s => <FusedSourceCard key={s.ref} source={s} data={data}/>)}
              </div>
            </div>
          </div>

          {/* AI proposal block */}
          <div className="panel ai-panel">
            <div className="panel-h" style={{ background: "linear-gradient(90deg, rgba(139,111,217,0.10), transparent)" }}>
              <Icon d={ICONS.brain} size={13} style={{ color: "var(--accent-violet)" }}/>
              <span style={{ color: "var(--accent-violet)" }}>AI entity resolution proposal</span>
              <span className="spacer"/>
              <span className="panel-meta">aegis-er-2.3.1 · explainable · audit ID 88-441-A</span>
            </div>
            <div className="panel-body" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>

              <div>
                <div className="ai-proposal-head">
                  <div>
                    <div className="ai-proposal-label">Propose link</div>
                    <div className="ai-proposal-id">
                      <span className="mono" style={{ color: "var(--chrome-ink)" }}>{ind.id}</span>
                      <Icon d={ICONS.arrowR} size={14} style={{ color: "var(--accent-violet)" }}/>
                      <span className="mono" style={{ color: "var(--accent-violet)" }}>{ind.ai.proposedEntity}</span>
                    </div>
                  </div>
                  <Confidence value={confOverride ?? ind.ai.confidence}/>
                </div>

                {decision == null && (
                  <div className="ai-actions">
                    <button className="btn btn-accept" onClick={() => decide("accept", "as proposed")}>
                      <Icon d={ICONS.check} size={13}/> Accept (A)
                    </button>
                    <button className="btn" onClick={() => decide("modify", `confidence override → ${Math.round((confOverride ?? 0.70)*100)}%`)}>
                      <Icon d={ICONS.cog} size={13}/> Modify (M)
                    </button>
                    <button className="btn btn-reject" onClick={() => decide("reject", "see rationale")}>
                      <Icon d={ICONS.x} size={13}/> Reject (R)
                    </button>
                  </div>
                )}

                {decision === "modify" && (
                  <div className="modify-form">
                    <div className="modify-label">Override confidence</div>
                    <input type="range" min="0" max="100" defaultValue={Math.round((ind.ai.confidence)*100)}
                      onChange={e => setConfOverride(+e.target.value/100)}/>
                    <div className="mono" style={{ fontSize: 11, color: "var(--chrome-muted)" }}>
                      → {Math.round((confOverride ?? ind.ai.confidence)*100)}% &nbsp;·&nbsp;
                      analyst-overridden (was {Math.round(ind.ai.confidence*100)}%)
                    </div>
                    <div className="modify-label" style={{ marginTop: 10 }}>Override rationale (mandatory)</div>
                    <textarea defaultValue="Voice fragment quality below threshold for high-confidence assertion; downgrading pending second corroboration."/>
                    <div className="ai-actions" style={{ marginTop: 8 }}>
                      <button className="btn btn-accept" onClick={() => decide("modify-confirmed", `confidence override → ${Math.round((confOverride ?? 0.70)*100)}%`)}>
                        Confirm modification
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setDecision(null); setConfOverride(null); }}>Cancel</button>
                    </div>
                  </div>
                )}

                {decision === "reject" && (
                  <div className="modify-form">
                    <div className="modify-label">Rejection rationale (mandatory — structured)</div>
                    <select defaultValue="evidence-insufficient">
                      <option value="evidence-insufficient">Evidence insufficient for any candidate</option>
                      <option value="contradicting">Contradicting evidence outweighs proposal</option>
                      <option value="ood">Out-of-distribution — model unreliable in this domain</option>
                      <option value="other">Other (free-text)</option>
                    </select>
                    <textarea defaultValue="Geographic offset (11.3km) places source outside historical EX-IRBIS-04 corridor. Will treat as novel entity pending HUMINT corroboration."/>
                    <div className="ai-actions" style={{ marginTop: 8 }}>
                      <button className="btn btn-reject" onClick={() => decide("reject-confirmed", "evidence insufficient")}>Confirm rejection</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDecision(null)}>Cancel</button>
                    </div>
                  </div>
                )}

                {(decision === "accept" || decision === "modify-confirmed" || decision === "reject-confirmed") && (
                  <div className={`decision-confirm decision-${decision.split("-")[0]}`}>
                    <Icon d={decision.startsWith("reject") ? ICONS.x : ICONS.check} size={14}/>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--chrome-ink)" }}>
                        {decision.startsWith("accept") && `Accepted — link added to entity ${ind.ai.proposedEntity}`}
                        {decision.startsWith("modify") && `Modified — confidence ${Math.round((confOverride ?? ind.ai.confidence)*100)}% recorded`}
                        {decision.startsWith("reject") && `Rejected — flagged for HUMINT corroboration`}
                      </div>
                      <div className="muted mono" style={{ fontSize: 10, marginTop: 3 }}>
                        Audit ID 88-441-A · attestation by {tweaks.role.name} ({tweaks.role.clearance})
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}
                      onClick={() => { setDecision(null); setConfOverride(null); }}>Re-open</button>
                  </div>
                )}
              </div>

              {tweaks.aiOn ? (
                <ReasoningTrace
                  indicator={ind}
                  decision={decision}
                  confOverride={confOverride}
                  setConfOverride={setConfOverride}
                />
              ) : (
                <div className="ai-off">
                  <Icon d={ICONS.warn} size={16}/>
                  <div>
                    <div style={{ fontWeight: 600 }}>AI assist disabled</div>
                    <div className="muted mono" style={{ fontSize: 11 }}>
                      Per operator preference. Re-enable in Tweaks to see reasoning trace and candidate ranking.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related entities */}
          <div className="panel">
            <div className="panel-h">
              <Icon d={ICONS.graph} size={13}/>
              <span style={{ color: "var(--chrome-ink)", textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>
                Adjacent entities
              </span>
              <span className="spacer"/>
              <button className="btn btn-ghost btn-sm" onClick={() => onOpenEntity(ind.ai.proposedEntity)}>
                Open in entity graph <Icon d={ICONS.arrowR} size={12}/>
              </button>
            </div>
            <div className="panel-body">
              <div className="adj-grid">
                {[
                  { id: "ORG-ARC-VERA",  k: "Org",   l: "Vera Geological Surveys Ltd.", d: "shell employer · 23 reports" },
                  { id: "PER-MIKHAILOV", k: "Person",l: "Mikhailov A.S.",              d: "associate · last 18 mo · 11 reports" },
                  { id: "LOC-CFS-ALERT", k: "Place", l: "CFS Alert resupply corridor", d: "AOI · monitored 24/7" },
                  { id: "EQ-VEH-WHITE",  k: "Equip", l: "Type-A field vehicle, white", d: "5 sightings AO-NORTH · 90d" }
                ].map(e => (
                  <button key={e.id} className="adj-card" onClick={() => onOpenEntity(e.id)}>
                    <div className="adj-card-h">
                      <span className="chip outline" style={{ fontSize: 9 }}>{e.k.toUpperCase()}</span>
                      <span className="mono" style={{ fontSize: 10, color: "var(--chrome-muted)" }}>{e.id}</span>
                    </div>
                    <div className="adj-card-l">{e.l}</div>
                    <div className="adj-card-d">{e.d}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Audit log rail */}
        <div className="tri-log">
          <div className="tri-log-h">
            <Icon d={ICONS.shield} size={12}/>
            <span>AUDIT TRAIL</span>
            <span className="spacer"/>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowLog(!showLog)}>
              <Icon d={showLog ? ICONS.x : ICONS.chevR} size={12}/>
            </button>
          </div>
          {showLog && (
            <div className="tri-log-body scroll">
              {log.map((entry, i) => (
                <div key={i} className="log-entry">
                  <div className="log-ts mono">{entry.ts}</div>
                  <div className="log-who">{entry.who}</div>
                  <div className="log-what">{entry.what}</div>
                </div>
              )).reverse()}
              <div className="tri-log-foot mono">
                Tamper-evident · hash chain ✓ · 7-year retention · exportable to TBS-compliant store
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenTriage });
