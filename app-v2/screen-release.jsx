// AEGIS DI — Coalition Releasability (S6) — redaction workflow with drag-and-drop approval.

const { useState: useStateRel } = React;

const ASSESS_TEXT_PARTS = (red) => {
  // Returns the assessment text broken into renderable spans, with redactions slotted in.
  // red is map of id → action (accepted | overridden | null)
  return [
    { t: "PETREL-3 campaign re-templated its primary narrative on 24-25 MAY 26 to emphasise sovereignty grievance over economic grievance; coordination signatures match prior PETREL-3 surges with " },
    { t: "high confidence", em: "h" },
    { t: ". Operational impact remains " },
    { t: "moderate", em: "m" },
    { t: ". Reach is estimated at " },
    { red: "R-3", t: "≈ 0.6M unique impressions in Canadian-relevant audiences" },
    { t: " within 24h of the shift.\n\nSynchronised posting across 14 anchor accounts (Δ < 6 min) detected by internal pattern " },
    { red: "R-4", t: "AEG/PAT/3382" },
    { t: " is consistent with central direction. Template-phrase reuse matches PETREL-3 sample 2025-11-14 observed in " },
    { red: "R-1", t: "OSI/MED/1102-B" },
    { t: ".\n\nPeer reviewer " },
    { red: "R-2", t: "K. Osei" },
    { t: " recorded dissent on KJ-2: two anchor accounts show prior independent activity inconsistent with central direction.\n\nThis assessment is provided to " },
    { red: "R-5", t: "ADM(POL) / PCO IS" },
    { t: " in support of foreign-interference indications and warning for the federal election cycle." }
  ];
};

function RedactionItem({ r, action, onApprove, onOverride, dragging, onDragStart, onDragEnd }) {
  return (
    <div className={`red-item ${action ? `red-${action}` : ""} ${dragging ? "dragging" : ""}`}
      draggable={!action}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}>
      <div className="red-item-h">
        <span className={`red-action-tag red-${r.action}`}>
          {r.action === "redact" ? "REDACT" : r.action === "substitute" ? "SUBSTITUTE" : "KEEP"}
        </span>
        <span className="mono muted" style={{ fontSize: 10 }}>{r.id} · auto</span>
      </div>
      <div className="red-item-q">«{r.text}»</div>
      <div className="red-item-r">{r.reason}</div>
      {!action ? (
        <div className="red-item-actions">
          <button className="btn btn-accept btn-sm" onClick={() => onApprove("accept")}>Approve</button>
          <button className="btn btn-sm" onClick={() => onOverride()}>Override</button>
        </div>
      ) : (
        <div className="red-item-status">
          {action === "accept" && <><Icon d={ICONS.check} size={11}/> Approved · co-sign required</>}
          {action === "override" && <><Icon d={ICONS.warn} size={11}/> Overridden · rationale captured</>}
        </div>
      )}
    </div>
  );
}

function ScreenRelease({ data, tweaks }) {
  const r = data.release;
  const [actions, setActions] = useStateRel({});
  const [dragging, setDragging] = useStateRel(null);
  const [overridden, setOverridden] = useStateRel({});
  const [coSigned, setCoSigned] = useStateRel(false);

  const setAction = (id, kind) => setActions(prev => ({ ...prev, [id]: kind }));

  const approveAll = () => {
    const next = {};
    r.redactions.forEach(rd => { next[rd.id] = "accept"; });
    setActions(next);
  };

  const allDecided = r.redactions.every(rd => actions[rd.id]);
  const accepted = Object.values(actions).filter(v => v === "accept").length;
  const overrides = Object.values(actions).filter(v => v === "override").length;

  // drag-drop: drop on document to "approve in place" (alt UX for tactile feel)
  const onDocDrop = (id) => {
    if (id) setAction(id, "accept");
    setDragging(null);
  };

  return (
    <div className="screen-release">
      <Toolbar
        crumbs={["Supervisor", "Releasability", r.source]}
        title="Generate releasable product"
        sub={`Source ${r.source} · target ${r.target}`}
        level="secret"
        caveats={["REL FVEY"]}
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={approveAll}>Approve all proposals</button>
            <button className="btn btn-primary btn-sm" disabled={!allDecided || !coSigned}>
              <Icon d={ICONS.upload} size={13}/> Generate & release
            </button>
          </>
        }
      />

      <div className="rel-grid">
        {/* Source document with redaction zones */}
        <div className="rel-doc-wrap scroll"
          onDragOver={e => { if (dragging) e.preventDefault(); }}
          onDrop={e => { e.preventDefault(); onDocDrop(dragging); }}>

          <div className="rel-doc-band src">
            <span>SOURCE</span>
            <ClassificationChip level="secret" caveats={["ORCON", "CAN ONLY"]}/>
            <span className="muted mono" style={{ marginLeft: "auto" }}>ASSESS-2026-0044 · v3</span>
          </div>

          <div className="rel-doc">
            <h3 className="rel-doc-title">PETREL-3 narrative shift, May 2026</h3>
            <p className="rel-doc-body">
              {ASSESS_TEXT_PARTS().map((part, i) => {
                if (part.red) {
                  const rd = r.redactions.find(x => x.id === part.red);
                  const a = actions[part.red];
                  const className = `red-mark red-mark-${rd.action} ${a ? "decided" : ""} ${dragging === part.red ? "dragging" : ""}`;
                  return (
                    <span key={i} className={className}
                      data-id={part.red}
                      title={`${rd.action.toUpperCase()} — ${rd.reason}`}
                      onClick={() => !a && setAction(part.red, "accept")}>
                      {a === "accept" && rd.action === "redact" && <span className="redact-bar">{"█".repeat(Math.max(4, Math.floor(part.t.length/2)))}</span>}
                      {a === "accept" && rd.action === "substitute" && <span className="redact-sub">[redacted method — multiple open-source feeds]</span>}
                      {a === "accept" && rd.action === "keep" && <span>{part.t}</span>}
                      {(!a || a === "override") && <span>{part.t}</span>}
                      {!a && <span className="red-num">{rd.id}</span>}
                    </span>
                  );
                }
                if (part.em) {
                  return <em key={i} className={`claim-pill conf-${part.em}`} style={{ display: "inline-block", padding: "1px 8px", borderRadius: 3 }}>{part.t}</em>;
                }
                return part.t.split("\n").map((line, j, arr) => (
                  <React.Fragment key={`${i}-${j}`}>
                    {line}
                    {j < arr.length - 1 && <><br/><br/></>}
                  </React.Fragment>
                ));
              })}
            </p>
          </div>

          {dragging && (
            <div className="rel-drop-hint">
              <Icon d={ICONS.check} size={14}/>
              Drop here to apply redaction to source
            </div>
          )}
        </div>

        {/* Redaction proposals — drag from here */}
        <div className="rel-proposals scroll">
          <div className="rel-prop-h">
            <Icon d={ICONS.brain} size={13} style={{ color: "var(--accent-violet)" }}/>
            <span>AI-PROPOSED REDACTIONS · {r.redactions.length}</span>
            <span className="spacer"/>
            <span className="mono muted" style={{ fontSize: 10 }}>{accepted}/{r.redactions.length} approved</span>
          </div>
          <div className="rel-prop-instr muted mono">
            Drag onto the document, or click Approve / Override. Co-signature required to release.
          </div>

          {r.redactions.map(rd => (
            <RedactionItem key={rd.id} r={rd}
              action={actions[rd.id]}
              onApprove={kind => setAction(rd.id, "accept")}
              onOverride={() => setAction(rd.id, "override")}
              dragging={dragging === rd.id}
              onDragStart={() => setDragging(rd.id)}
              onDragEnd={() => setDragging(null)}/>
          ))}

          <div className="rel-irreducible">
            <div className="rel-irreducible-h">
              <Icon d={ICONS.warn} size={12}/>
              <span>IRREDUCIBLE DISCLOSURES</span>
            </div>
            {r.irreducible.map((x, i) => (
              <div key={i} className="rel-irreducible-t">{x}</div>
            ))}
          </div>

          {/* Co-signature */}
          <div className="rel-cosign">
            <div className="rel-cosign-h">CO-SIGNATURE REQUIRED</div>
            <div className="rel-cosign-row">
              <div className="role-avatar">ML</div>
              <div>
                <div style={{ font: "600 12px var(--font-display)", color: "var(--chrome-ink)" }}>{r.operator}</div>
                <div className="muted mono" style={{ fontSize: 10 }}>Author · signed 14:31Z</div>
              </div>
              <span className="chip" style={{ background: "rgba(22,163,74,0.12)", color: "var(--accent-emerald)", marginLeft: "auto" }}>✓ signed</span>
            </div>
            <div className="rel-cosign-row">
              <div className="role-avatar" style={{ background: "linear-gradient(135deg, #92400e, #d97706)" }}>DM</div>
              <div>
                <div style={{ font: "600 12px var(--font-display)", color: "var(--chrome-ink)" }}>{r.coSign}</div>
                <div className="muted mono" style={{ fontSize: 10 }}>Watch Supervisor · pending</div>
              </div>
              {coSigned
                ? <span className="chip" style={{ background: "rgba(22,163,74,0.12)", color: "var(--accent-emerald)", marginLeft: "auto" }}>✓ signed</span>
                : <button className="btn btn-accept btn-sm" style={{ marginLeft: "auto" }}
                    disabled={!allDecided}
                    onClick={() => setCoSigned(true)}>Co-sign</button>}
            </div>
            {!allDecided && <div className="rel-cosign-note">All {r.redactions.length} proposals must be decided before co-signature.</div>}
          </div>

          <div className="rel-target">
            <div className="rel-target-l">RELEASE TO</div>
            <div className="rel-target-v">
              <span className="chip cls-fvey">FVEY</span>
              <span className="mono muted" style={{ fontSize: 11 }}>{r.target}</span>
            </div>
            <div className="rel-target-fmt mono muted">
              Format: STANAG 4774 + 4778 with embedded provenance · co-sealed · audit ID 88-447-R
            </div>
          </div>

          <div className="rel-summary mono muted">
            {accepted} accepted · {overrides} overrides · {r.irreducible.length} irreducible · target FVEY-4
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenRelease });
