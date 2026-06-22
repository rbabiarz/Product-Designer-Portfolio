// AEGIS DI — Executive Briefing Room (S5) — drill from claim → source.

const { useState: useStateEx } = React;

function ScreenExecutive({ data, tweaks, onNav, onAsk }) {
  const a = data.assessment;
  const [drilled, setDrilled] = useStateEx(null);  // source ref drilled to
  const [askedHistory, setAskedHistory] = useStateEx([]);
  const [q, setQ] = useStateEx("");

  const drillTo = (ref) => setDrilled(a.sources.find(s => s.ref === ref));

  const askInline = () => {
    if (!q.trim()) return;
    setAskedHistory(h => [...h, {
      q,
      a: "Based on retrieved sources: PETREL-3 narrative shifted on 24-25 MAY. KJ-2's 'high confidence' rests on the synchronised posting pattern detected by AEG/PAT/3382 (cluster Δ < 6 min, template-phrase match 0.94) and the FBI CI adjunct hosting overlap. Two anchor accounts showed inconsistent prior activity — captured as KJ-2 dissent by K. Osei.",
      cites: ["AEG/PAT/3382", "OSI/MED/1102-B", "PART/US-FBI-CI/09"]
    }]);
    setQ("");
  };

  return (
    <div className="screen-executive">
      <Toolbar
        crumbs={["Analyst", "Briefing Room", a.id]}
        title={a.title}
        sub={`Published 25 MAY 1948Z · ${a.author} · briefing ready · 1 dissent recorded`}
        level={a.classification}
        caveats={a.caveats}
        actions={
          <>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.clock} size={13}/> Version history (3)</button>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.shield} size={13}/> Brief mode</button>
            <button className="btn btn-primary btn-sm" onClick={onAsk}>
              <Icon d={ICONS.brain} size={13}/> Ask AEGIS
            </button>
          </>
        }
      />

      <div className="exec-grid">
        <div className="exec-doc scroll">
          {/* Header card */}
          <div className="exec-card-head">
            <div>
              <div className="mono muted" style={{ fontSize: 11 }}>{a.id} · for {a.customer}</div>
              <h2 className="exec-title">{a.title}</h2>
            </div>
            <div className="exec-author">
              <div className="role-avatar" style={{ background: "linear-gradient(135deg, #4ca88f, #0d5350)" }}>ML</div>
              <div>
                <div style={{ font: "600 13px var(--font-display)", color: "var(--chrome-ink)" }}>{a.author}</div>
                <div className="mono muted" style={{ fontSize: 11 }}>Strategic Analyst · TS//SI</div>
                <div className="mono muted" style={{ fontSize: 11 }}>peer-reviewed by K. Osei (with dissent)</div>
              </div>
            </div>
          </div>

          {/* BLUF interactive */}
          <div className="exec-bluf">
            <div className="exec-bluf-l">BOTTOM LINE</div>
            <p>
              PETREL-3 campaign re-templated its primary narrative on 24-25 MAY 26 to emphasise sovereignty grievance over economic grievance; coordination signatures match prior PETREL-3 surges with <button className="claim-pill conf-h">high confidence</button>. Operational impact remains <button className="claim-pill conf-m">moderate</button>; reach is concentrated and recovery of prior narrative is plausible within 14 days.
            </p>
          </div>

          {/* Key judgements as drillable claims */}
          <div className="exec-section">
            <div className="exec-section-h">
              <span>KEY JUDGEMENTS · click a citation to drill to source</span>
              <span className="muted mono" style={{ fontSize: 10 }}>4 judgements · 1 dissent · 5 sources</span>
            </div>

            {a.keyJudgements.map(kj => (
              <div key={kj.id} className="exec-kj">
                <div className="exec-kj-h">
                  <span className="kj-id">{kj.id}</span>
                  <span className="kj-conf" style={{ color: ICD203[kj.confidence].color, borderColor: ICD203[kj.confidence].color }}>
                    {ICD203[kj.confidence].label}
                  </span>
                  {kj.dissent && (
                    <span className="kj-dissent-flag" style={{ marginLeft: "auto" }}>
                      <Icon d={ICONS.warn} size={10}/> DISSENT VISIBLE
                    </span>
                  )}
                </div>
                <p className="exec-kj-t">{kj.text}</p>
                <div className="exec-kj-cites">
                  <span className="muted mono" style={{ fontSize: 10 }}>SOURCES</span>
                  {kj.citations.map(ref => (
                    <button key={ref}
                      className={`cite-chip ${drilled?.ref === ref ? "on" : ""}`}
                      onClick={() => drillTo(ref)}>
                      <Icon d={ICONS.link} size={10}/>
                      <span>{ref}</span>
                    </button>
                  ))}
                </div>
                {kj.dissent && (
                  <div className="exec-dissent">
                    <div className="exec-dissent-h">
                      <div className="role-avatar role-sm">KO</div>
                      <span>K. Osei — Strategic Analyst (peer reviewer)</span>
                      <span className="muted mono" style={{ marginLeft: "auto", fontSize: 10 }}>recorded 25 MAY 1822Z</span>
                    </div>
                    <p className="exec-dissent-t">{kj.dissent.text}</p>
                    <div className="muted mono" style={{ fontSize: 10 }}>
                      Margaux Lévesque (author) acknowledged dissent · retained KJ-2 confidence at "high" · rationale logged.
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Inline Q&A */}
          <div className="exec-section">
            <div className="exec-section-h">
              <Icon d={ICONS.brain} size={13} style={{ color: "var(--accent-violet)" }}/>
              <span>FOLLOW-UP — grounded in this assessment</span>
              <span className="muted mono" style={{ fontSize: 10 }}>citations mandatory · no model output without source</span>
            </div>
            <div className="exec-qa">
              {askedHistory.map((h, i) => (
                <div key={i} className="exec-qa-entry">
                  <div className="exec-qa-q">› {h.q}</div>
                  <div className="ai-block exec-qa-a">
                    <div className="ai-label">Retrieved · Aegis QA · grounded in assessment ASSESS-2026-0044</div>
                    <p>{h.a}</p>
                    <div className="ask-a-cites" style={{ marginTop: 4 }}>
                      {h.cites.map(c => (
                        <button key={c} className="cite-chip" onClick={() => drillTo(c)}>
                          <Icon d={ICONS.link} size={10}/><span>{c}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div className="exec-qa-input">
                <input
                  value={q} onChange={e => setQ(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") askInline(); }}
                  placeholder="Ask a follow-up grounded in this assessment…"
                />
                <button className="btn btn-primary btn-sm" onClick={askInline}>
                  <Icon d={ICONS.send} size={11}/> Send
                </button>
              </div>
              <div className="exec-qa-suggest">
                {[
                  "What sources weaken KJ-2?",
                  "Has PETREL-3 done this before?",
                  "What would change my mind?"
                ].map((s, i) => (
                  <button key={i} className="exec-qa-pill" onClick={() => setQ(s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right drill rail */}
        <div className="exec-rail">
          {drilled ? (
            <>
              <div className="src-card">
                <div className="src-card-h">
                  <SourceChip kind={drilled.kind}/>
                  <span className="mono" style={{ fontSize: 11, color: "var(--chrome-ink)" }}>{drilled.ref}</span>
                  <ClassificationChip level={drilled.classification}/>
                  <span className="spacer"/>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDrilled(null)}>
                    <Icon d={ICONS.x} size={12}/>
                  </button>
                </div>
                <div className="src-card-b" style={{ display: "block" }}>
                  <div style={{ font: "600 13px var(--font-display)", color: "var(--chrome-ink)", marginBottom: 6 }}>{drilled.title}</div>
                  <div className="kv-grid" style={{ marginBottom: 10 }}>
                    <dt>Date</dt><dd>{drilled.date}</dd>
                    <dt>Caveats</dt><dd>{drilled.caveat || "—"}</dd>
                  </div>
                  <div className="src-excerpt">{drilled.excerpt}</div>
                  <div className="muted mono" style={{ marginTop: 10, fontSize: 10 }}>
                    Drilled by {tweaks.role.name} · access logged.
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="exec-rail-empty">
              <Icon d={ICONS.doc} size={28}/>
              <div style={{ font: "600 13px var(--font-display)", color: "var(--chrome-ink)", marginTop: 8 }}>
                Click any citation chip
              </div>
              <p className="muted" style={{ font: "500 12px var(--font-display)", maxWidth: 240, textAlign: "center" }}>
                Sources open here with full excerpt, classification, caveats, and access log entry. Three clicks max from any claim to its underlying artefact.
              </p>
            </div>
          )}

          {/* Linked entities mini-card */}
          <div className="panel">
            <div className="panel-h">Linked entities</div>
            <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { id: "CAMPAIGN-PETREL-3", l: "PETREL-3", k: "Campaign", c: 31 },
                { id: "ORG-LANDFALL-CONS", l: "LANDFALL CONS.", k: "Org", c: 8 }
              ].map(e => (
                <button key={e.id} className="link-entity-row" onClick={() => onNav("entity")}>
                  <div>
                    <div style={{ font: "600 12.5px var(--font-display)", color: "var(--chrome-ink)" }}>{e.l}</div>
                    <div className="mono muted" style={{ fontSize: 10 }}>{e.id} · {e.c} reports</div>
                  </div>
                  <Icon d={ICONS.arrowR} size={12} style={{ marginLeft: "auto", color: "var(--chrome-muted)" }}/>
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-h">Audit · this view</div>
            <div className="panel-body" style={{ font: "500 11px var(--font-mono)", color: "var(--chrome-muted)", lineHeight: 1.6 }}>
              <div>14:32:14Z · {tweaks.role.name} opened assessment</div>
              {drilled && <div>14:32:18Z · drilled to {drilled.ref}</div>}
              {askedHistory.map((h, i) => (
                <div key={i}>14:32:{20+i*5}Z · asked grounded follow-up</div>
              ))}
              <div style={{ marginTop: 6, color: "var(--chrome-muted-soft)" }}>tamper-evident · 7-year retention</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenExecutive });
