// AEGIS DI — Assessment Authoring (S2) — drafting, citations, AI assist sidebar.

const { useState: useStateAs } = React;

const ICD203 = {
  high: { label: "high confidence", color: "var(--accent-emerald)" },
  moderate: { label: "moderate confidence", color: "var(--accent-amber)" },
  low: { label: "low confidence", color: "var(--accent-red)" }
};

function CitationChip({ cite, onClick }) {
  return (
    <button className="cite-chip" onClick={onClick}>
      <Icon d={ICONS.link} size={10}/>
      <span>{cite}</span>
    </button>
  );
}

function KeyJudgement({ kj, onCite, isFocused, onFocus }) {
  const icd = ICD203[kj.confidence];
  return (
    <div className={`kj ${isFocused ? "kj-focus" : ""}`} onClick={onFocus}>
      <div className="kj-h">
        <span className="kj-id">{kj.id}</span>
        <span className="kj-conf" style={{ color: icd.color, borderColor: icd.color }}>
          {icd.label}
        </span>
        {kj.dissent && <span className="kj-dissent-flag">DISSENT NOTED</span>}
      </div>
      <p className="kj-text">{kj.text}</p>
      <div className="kj-cites">
        {kj.citations.map(c => <CitationChip key={c} cite={c} onClick={() => onCite(c)}/>)}
      </div>
      {kj.dissent && (
        <div className="kj-dissent">
          <div className="kj-dissent-h">Dissenting view · {kj.dissent.author}</div>
          <div className="kj-dissent-t">{kj.dissent.text}</div>
        </div>
      )}
    </div>
  );
}

function SourceDetail({ src, onClose }) {
  return (
    <div className="src-detail panel">
      <div className="panel-h">
        <Icon d={ICONS.doc} size={13}/>
        <span style={{ color: "var(--chrome-ink)", textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>{src.ref}</span>
        <SourceChip kind={src.kind}/>
        <ClassificationChip level={src.classification}/>
        <span className="spacer"/>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon d={ICONS.x} size={12}/></button>
      </div>
      <div className="panel-body">
        <div style={{ font: "600 13px var(--font-display)", color: "var(--chrome-ink)", marginBottom: 6 }}>{src.title}</div>
        <dl className="kv-grid" style={{ marginBottom: 10 }}>
          <dt>Date</dt><dd>{src.date}</dd>
          <dt>Caveats</dt><dd>{src.caveat || "—"}</dd>
          <dt>Originator</dt><dd className="muted">Partner agency / OSINT cell</dd>
        </dl>
        <div className="src-excerpt">
          {src.excerpt}
        </div>
      </div>
    </div>
  );
}

function AiAssistRail({ suggestions, sources, onCite, focusedKJ, onAccept }) {
  const [tab, setTab] = useStateAs("ai");
  return (
    <div className="ai-rail">
      <div className="ai-rail-tabs">
        <button className={tab === "ai" ? "on" : ""} onClick={() => setTab("ai")}>
          <Icon d={ICONS.brain} size={12}/> AI assists ({suggestions.length})
        </button>
        <button className={tab === "src" ? "on" : ""} onClick={() => setTab("src")}>
          <Icon d={ICONS.doc} size={12}/> Sources ({sources.length})
        </button>
        <button className={tab === "review" ? "on" : ""} onClick={() => setTab("review")}>
          <Icon d={ICONS.shield} size={12}/> Tradecraft
        </button>
      </div>

      <div className="ai-rail-body scroll">
        {tab === "ai" && (
          <>
            <div className="ai-rail-context">
              <span className="muted mono" style={{ fontSize: 10 }}>FOCUSED ON</span>
              <span className="mono" style={{ color: "var(--chrome-ink)", fontWeight: 600 }}>{focusedKJ || "—"}</span>
            </div>
            {suggestions.map(s => (
              <div key={s.id} className="ai-suggest">
                <div className="ai-suggest-h">
                  <span className="ai-suggest-kind">
                    {s.kind === "evidence" ? "EVIDENCE" : "TRADECRAFT"}
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--chrome-muted)" }}>{s.id}</span>
                </div>
                <p className="ai-suggest-t">{s.text}</p>
                <div className="ai-suggest-actions">
                  {s.source && <button className="btn btn-ghost btn-sm" onClick={() => onCite(s.source)}>View source</button>}
                  <button className="btn btn-accept btn-sm" onClick={() => onAccept(s.id)}>Accept</button>
                  <button className="btn btn-ghost btn-sm">Dismiss</button>
                </div>
              </div>
            ))}
            <div className="ai-rail-foot mono">
              Model aegis-draft-3.1 · grounded · retrieval-only · acceptance to date 71% (you) · 64% (team)
            </div>
          </>
        )}

        {tab === "src" && (
          <>
            {sources.map(s => (
              <button key={s.ref} className="src-list-row" onClick={() => onCite(s.ref)}>
                <div className="src-list-row-h">
                  <SourceChip kind={s.kind}/>
                  <span className="mono" style={{ fontSize: 11, color: "var(--chrome-ink)", fontWeight: 600 }}>{s.ref}</span>
                  <span className="spacer"/>
                  <ClassificationChip level={s.classification}/>
                </div>
                <div className="src-list-row-t">{s.title}</div>
                <div className="muted mono" style={{ fontSize: 10 }}>{s.date} · {s.caveat || "—"}</div>
              </button>
            ))}
          </>
        )}

        {tab === "review" && (
          <div className="tradecraft-review">
            <div className="tc-section">
              <div className="tc-h">ICD 203 — Confidence Language</div>
              <div className="tc-row good"><Icon d={ICONS.check} size={12}/> KJ-1, KJ-3, KJ-4 use consistent ICD 203 expressions.</div>
              <div className="tc-row warn"><Icon d={ICONS.warn} size={12}/> KJ-2 "high confidence" advisory — consider "moderate to high" given recorded dissent.</div>
            </div>
            <div className="tc-section">
              <div className="tc-h">Source Diversity</div>
              <div className="tc-row good"><Icon d={ICONS.check} size={12}/> 5 sources across 3 INTs (OSINT, PARTNER, INTERNAL) — meets diversity floor.</div>
              <div className="tc-row warn"><Icon d={ICONS.warn} size={12}/> No SIGINT or HUMINT corroboration — consider tasking.</div>
            </div>
            <div className="tc-section">
              <div className="tc-h">Provenance</div>
              <div className="tc-row good"><Icon d={ICONS.check} size={12}/> All citations resolve to retrievable artefacts. No orphan claims detected.</div>
            </div>
            <div className="tc-section">
              <div className="tc-h">Releasability Pre-check</div>
              <div className="tc-row good"><Icon d={ICONS.check} size={12}/> 5/5 sources have valid releasability metadata.</div>
              <div className="tc-row warn"><Icon d={ICONS.warn} size={12}/> Customer ID (ADM(POL)/PCO IS) is CAN ONLY — will require redaction for FVEY release.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScreenAssessment({ data, tweaks, onNav }) {
  const a = data.assessment;
  const [focused, setFocused] = useStateAs("KJ-2");
  const [openSrc, setOpenSrc] = useStateAs(null);
  const [accepted, setAccepted] = useStateAs([]);
  const [suggestions, setSuggestions] = useStateAs(a.aiSuggestions);

  const cite = (ref) => setOpenSrc(a.sources.find(s => s.ref === ref));
  const acceptSuggest = (id) => {
    setAccepted(arr => [...arr, id]);
    setSuggestions(arr => arr.filter(s => s.id !== id));
  };

  return (
    <div className="screen-assessment">
      <Toolbar
        crumbs={["Analyst", "Assessments", a.id]}
        title={a.title}
        sub={`Draft v3 · ${a.author} · due ${a.due} · customer ${a.customer}`}
        level={a.classification}
        caveats={a.caveats}
        actions={
          <>
            <span className="mono muted" style={{ fontSize: 11 }}>auto-saved 14:31:48Z</span>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.user} size={13}/> Co-author</button>
            <button className="btn btn-ghost btn-sm"><Icon d={ICONS.shield} size={13}/> Peer review</button>
            <button className="btn btn-primary btn-sm" onClick={() => onNav("release")}>
              <Icon d={ICONS.upload} size={13}/> Generate releasable
            </button>
          </>
        }
      />

      <div className="ass-grid">
        <div className="ass-doc scroll">
          {/* Document header */}
          <div className="doc-head">
            <div className="doc-meta">
              <ClassificationChip level={a.classification} caveats={a.caveats}/>
              <span className="mono muted">{a.id}</span>
              <span className="mono muted">·</span>
              <span className="mono muted">Draft v3 of 3</span>
            </div>
            <h2 className="doc-title">{a.title}</h2>
            <div className="doc-byline">
              <span><strong>Author</strong>&nbsp;{a.author}</span>
              <span className="sep"/>
              <span><strong>Due</strong>&nbsp;{a.due}</span>
              <span className="sep"/>
              <span><strong>Customer</strong>&nbsp;{a.customer}</span>
            </div>
          </div>

          {/* BLUF */}
          <section className="doc-section">
            <h3 className="doc-h">Bottom Line Up Front</h3>
            <p className="doc-bluf">
              PETREL-3 campaign re-templated its primary narrative on 24-25 MAY 26 to emphasise sovereignty grievance over economic grievance; coordination signatures match prior PETREL-3 surges with <em style={{ color: "var(--accent-emerald)", fontStyle: "normal", fontWeight: 600 }}>high confidence</em>. Operational impact remains <em style={{ color: "var(--accent-amber)", fontStyle: "normal", fontWeight: 600 }}>moderate</em>; reach is concentrated and recovery of prior narrative is plausible within 14 days.
            </p>
          </section>

          {/* Key Judgements */}
          <section className="doc-section">
            <h3 className="doc-h">Key Judgements</h3>
            <div className="kj-stack">
              {a.keyJudgements.map(kj => (
                <KeyJudgement
                  key={kj.id} kj={kj} onCite={cite}
                  isFocused={focused === kj.id}
                  onFocus={() => setFocused(kj.id)}
                />
              ))}
            </div>
          </section>

          {/* AI-drafted scaffolding (visually distinct) */}
          <section className="doc-section">
            <h3 className="doc-h">Discussion</h3>
            <p className="doc-para">
              The narrative shift was first detected by AEGIS pattern <CitationChip cite="AEG/PAT/3382" onClick={() => cite("AEG/PAT/3382")}/> on 24 MAY 26 at 1148Z. Synchronised posting across 14 anchor accounts within a 5-min 47-sec window, with template-phrase reuse from PETREL-3 sample 2025-11-14, supports the assessment of central direction <CitationChip cite="OSI/MED/1102-B" onClick={() => cite("OSI/MED/1102-B")}/>.
            </p>
            <div className="ai-block doc-ai-block">
              <div className="ai-label">AI-drafted scaffolding · awaiting analyst attestation</div>
              <p>
                Coordinated influence campaigns of this character typically resolve toward prior baseline within 10–14 days when not amplified by exogenous events. Historical PETREL-3 cadence shows a return-to-baseline probability of 55–70% within this window <CitationChip cite="AEG/PAT/3382" onClick={() => cite("AEG/PAT/3382")}/>.
              </p>
              <div className="ai-block-actions">
                <button className="btn btn-accept btn-sm">Attest & adopt</button>
                <button className="btn btn-sm">Modify</button>
                <button className="btn btn-reject btn-sm">Reject</button>
                <span className="muted mono" style={{ fontSize: 10, marginLeft: 8 }}>aegis-draft-3.1 · grounded · 2 citations</span>
              </div>
            </div>
          </section>

          {/* Sources block */}
          <section className="doc-section">
            <h3 className="doc-h">Sources Considered</h3>
            <table className="src-table">
              <thead>
                <tr>
                  <th>Reference</th><th>Type</th><th>Date</th><th>Caveat</th><th>Excerpt</th>
                </tr>
              </thead>
              <tbody>
                {a.sources.map(s => (
                  <tr key={s.ref} onClick={() => cite(s.ref)}>
                    <td className="mono">{s.ref}</td>
                    <td><SourceChip kind={s.kind}/></td>
                    <td className="mono">{s.date}</td>
                    <td className="mono">{s.caveat || "—"}</td>
                    <td>{s.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="ass-rail">
          {openSrc ? (
            <SourceDetail src={openSrc} onClose={() => setOpenSrc(null)}/>
          ) : (
            <AiAssistRail
              suggestions={suggestions} sources={a.sources}
              onCite={cite} focusedKJ={focused} onAccept={acceptSuggest}
            />
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenAssessment });
