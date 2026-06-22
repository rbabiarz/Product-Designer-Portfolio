/* triage.jsx — Alert triage drawer (right-side flyout) */

const { useState: useStateT } = React;

const TRIAGE_STEPS = ['DETECT', 'TRIAGE', 'INVESTIGATE', 'ESCALATE', 'CONTAIN', 'RESOLVE'];

const TriageDrawer = ({ alert, onClose, onAdvance }) => {
  const [step, setStep] = useStateT(1); // start at triage
  const [note, setNote] = useStateT('');

  if (!alert) return null;

  const advance = () => setStep(s => Math.min(TRIAGE_STEPS.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <React.Fragment>
      <div className="drawer-mask" onClick={onClose}></div>
      <aside className="drawer">
        <div className="drawer__head">
          <div>
            <div className="drawer__id">{alert.id} · {alert.src}</div>
            <h2 className="drawer__title">{alert.rule}</h2>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
              <Sev level={alert.sev} />
              <Tag>STAGE {alert.stage}/7</Tag>
              <Tag>CONF {alert.conf}%</Tag>
              <Tag>{alert.status.toUpperCase()}</Tag>
              {alert.campaign && alert.campaign !== '—' && <Tag>{alert.campaign}</Tag>}
            </div>
          </div>
          <Btn variant="ghost" size="xs" onClick={onClose} className="drawer__close">✕ CLOSE</Btn>
        </div>

        <div className="drawer__body">
          {/* Workflow steps */}
          <div className="drawer__section">
            <div className="drawer__section-title">Triage workflow</div>
            <div className="steps">
              {TRIAGE_STEPS.map((s, i) => (
                <div key={s} className={`steps__step ${i < step ? 'done' : ''} ${i === step ? 'curr' : ''}`}>{s}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <Btn size="xs" onClick={back}>◀ BACK</Btn>
              <Btn size="xs" variant="primary" onClick={advance}>ADVANCE ▶ {TRIAGE_STEPS[Math.min(step+1, TRIAGE_STEPS.length-1)]}</Btn>
              <Btn size="xs">ASSIGN</Btn>
              <Btn size="xs" variant="danger">ESCALATE</Btn>
            </div>
          </div>

          {/* Context */}
          <div className="drawer__section">
            <div className="drawer__section-title">Alert context</div>
            <dl className="drawer__meta">
              <dt>Host</dt><dd>{alert.host}</dd>
              <dt>First seen</dt><dd>2026-05-26 {alert.t} UTC</dd>
              <dt>Detector</dt><dd>{alert.src}</dd>
              <dt>Stage</dt><dd>{alert.stage}/7 · {KILL_CHAIN_STAGES[alert.stage-1].name}</dd>
              <dt>Confidence</dt><dd>{alert.conf}% (fusion model v3)</dd>
              <dt>Assigned</dt><dd>{alert.assigned}</dd>
              <dt>Campaign</dt><dd>{alert.campaign}</dd>
              <dt>SLA</dt><dd>{alert.sev === 'critical' ? '15 min' : alert.sev === 'high' ? '30 min' : '2 hr'} (P{alert.sev === 'critical' ? '1' : alert.sev === 'high' ? '2' : '3'})</dd>
            </dl>
          </div>

          {/* Related signals */}
          <div className="drawer__section">
            <div className="drawer__section-title">Related signals (last 30m)</div>
            <table className="tbl" style={{ fontSize: 11 }}>
              <thead>
                <tr><th>Time</th><th>Source</th><th>Signal</th><th className="num">Score</th></tr>
              </thead>
              <tbody>
                <tr><td className="mono">14:42:08</td><td className="mono dim">EDR</td><td>LSASS handle acquired (T1003)</td><td className="num">92</td></tr>
                <tr><td className="mono">14:41:52</td><td className="mono dim">NDR</td><td>DCSync RPC pattern</td><td className="num">89</td></tr>
                <tr><td className="mono">14:39:18</td><td className="mono dim">CASB</td><td>Egress 2.3GB to cdn-msft-update[.]com</td><td className="num">94</td></tr>
                <tr><td className="mono">14:36:12</td><td className="mono dim">EDR</td><td>winword.exe → cmd.exe injection</td><td className="num">78</td></tr>
                <tr><td className="mono">14:24:11</td><td className="mono dim">IDP</td><td>MFA bypass attempt (svc-acct)</td><td className="num">67</td></tr>
              </tbody>
            </table>
          </div>

          {/* Suggested playbooks */}
          <div className="drawer__section">
            <div className="drawer__section-title">Recommended playbooks</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { id: 'PB-CRED-12', name: 'Credential access — isolate + force rotation', conf: 0.91, mins: 3.2 },
                { id: 'PB-EXFIL-04', name: 'Exfiltration — egress block + DLP retro-scan', conf: 0.84, mins: 4.8 },
                { id: 'PB-IDP-22', name: 'Identity — invalidate sessions, enforce step-up', conf: 0.79, mins: 1.4 },
              ].map(p => (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 60px 90px', gap: 8, alignItems: 'center', padding: '5px 8px', border: '1px solid var(--hairline)', borderRadius: 3, background: 'var(--panel-bg-strong)' }}>
                  <span className="mono" style={{ fontSize: 10.5 }}>{p.id}</span>
                  <span style={{ fontSize: 12 }}>{p.name}</span>
                  <span className="mono num" style={{ fontSize: 10.5, color: 'var(--color-muted)' }}>{Math.round(p.conf * 100)}%</span>
                  <Btn size="xs" variant="primary">RUN ▶ {p.mins}m</Btn>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="drawer__section">
            <div className="drawer__section-title">Analyst notes</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add observation, IOC, escalation reason…"
              style={{
                width: '100%',
                minHeight: 56,
                background: 'var(--panel-bg)',
                border: '1px solid var(--hairline-strong)',
                borderRadius: 3,
                padding: 8,
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        <div className="drawer__actions">
          <Btn size="xs">VIEW IN SIEM</Btn>
          <Btn size="xs">DOWNLOAD EVIDENCE</Btn>
          <Btn size="xs">CREATE CASE</Btn>
          <span style={{ flex: 1 }}></span>
          <Btn size="xs">MARK FALSE POSITIVE</Btn>
          <Btn size="xs" variant="primary">SAVE & CLOSE</Btn>
        </div>
      </aside>
    </React.Fragment>
  );
};

Object.assign(window, { TriageDrawer });
