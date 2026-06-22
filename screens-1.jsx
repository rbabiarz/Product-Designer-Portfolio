/* screens.jsx — secondary dashboards at medium fidelity */

const { useState: useS, useMemo: useM } = React;

/* ===== Threat Detection ===== */
const ThreatDetectionScreen = ({ onOpenAlert }) => {
  const [sev, setSev] = useS('all');
  const [src, setSrc] = useS('all');
  const filtered = ALERTS.filter(a => (sev === 'all' || a.sev === sev) && (src === 'all' || a.src.includes(src)));

  return (
    <div className="screen" data-screen-label="Threat Detection">
      <div className="screen__header">
        <div><h1 className="screen__title">Threat Detection</h1><div className="screen__subtitle">Real-time alert stream · fusion across {FEED_SOURCES.length} detection sources</div></div>
        <div className="screen__toolbar"><Btn size="xs">SAVED VIEWS</Btn><Btn size="xs">TUNE RULES</Btn><Btn size="xs" variant="primary">CREATE DETECTION</Btn></div>
      </div>

      <div className="kpis" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 10 }}>
        <KPI label="Alerts/hour" value="1,442" delta="+8%" deltaDir="up" footer="14-day avg 1,330" />
        <KPI label="Open queue" value="218" delta="−14" deltaDir="down" footer="P1: 11 · P2: 47" />
        <KPI label="Median triage" value="3m 42s" delta="−28s" deltaDir="down" footer="P1 target 5m" />
        <KPI label="False positive %" value="11.4%" delta="−1.8" deltaDir="down" footer="rolling 7-day" />
        <KPI label="Suppression rate" value="62%" delta="+3" deltaDir="up" footer="2,310 noise alerts/hr" />
        <KPI label="Auto-closed" value="889" delta="+22" deltaDir="up" footer="last hour" />
      </div>

      {/* Filter strip */}
      <div className="panel" style={{ marginBottom: 10 }}>
        <div className="panel__head">
          <span className="panel__title">Filters</span>
          <span className="panel__sub">{filtered.length} of {ALERTS.length} alerts</span>
          <span className="panel__toolbar" style={{ gap: 12 }}>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span className="dim mono uppr" style={{ marginRight: 6 }}>SEV</span>
              {['all', 'critical', 'high', 'medium', 'low'].map(s => (
                <Btn key={s} size="xs" active={sev === s} onClick={() => setSev(s)}>{s.toUpperCase()}</Btn>
              ))}
            </span>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span className="dim mono uppr" style={{ marginRight: 6 }}>SRC</span>
              {['all', 'EDR', 'NDR', 'IDP', 'CASB', 'DLP', 'Fraud'].map(s => (
                <Btn key={s} size="xs" active={src === s} onClick={() => setSrc(s)}>{s.toUpperCase()}</Btn>
              ))}
            </span>
          </span>
        </div>
      </div>

      <div className="row" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: 10 }}>
        <Panel title="Alert queue" sub="newest first · click to triage" flush>
          <table className="tbl">
            <thead><tr>
              <th style={{width: 70}}>Time</th>
              <th style={{width: 76}}>Sev</th>
              <th style={{width: 90}}>ID</th>
              <th>Detection</th>
              <th style={{width: 130}}>Host / asset</th>
              <th style={{width: 100}}>Source</th>
              <th style={{width: 50}} className="num">Conf</th>
              <th style={{width: 80}}>Status</th>
              <th style={{width: 100}}>Owner</th>
            </tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} onClick={() => onOpenAlert(a)}>
                  <td className="mono dim">{a.t}</td>
                  <td><Sev level={a.sev} /></td>
                  <td className="mono">{a.id}</td>
                  <td><span className="ink">{a.rule}</span></td>
                  <td className="mono">{a.host}</td>
                  <td className="mono dim">{a.src}</td>
                  <td className="num">{a.conf}</td>
                  <td className="mono">{a.status === 'open' ? <span style={{color: 'var(--sev-critical)'}}>● OPEN</span> : a.status === 'triage' ? <span style={{color: 'var(--sev-medium)'}}>● TRIAGE</span> : <span style={{color: 'var(--sev-resolved)'}}>● {a.status.toUpperCase()}</span>}</td>
                  <td className="mono dim">{a.assigned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Panel title="Detection volume" sub="last 24h · 30m buckets">
            <Spark data={[12, 18, 14, 22, 19, 31, 28, 24, 38, 42, 36, 51, 48, 44, 52, 61, 58, 49, 67, 74, 81, 88, 79, 92]} width={300} height={56} fill="var(--color-ink)" />
            <div className="dim mono uppr" style={{ marginTop: 4, fontSize: 9.5 }}>30 MIN BUCKETS · NORMALIZED</div>
          </Panel>
          <Panel title="By tactic" sub="MITRE coverage">
            <BarRow label="Initial Access" value={48} max={100} severity="crit" />
            <BarRow label="Execution" value={62} max={100} severity="high" />
            <BarRow label="Persistence" value={31} max={100} severity="med" />
            <BarRow label="Priv. Escalation" value={22} max={100} severity="med" />
            <BarRow label="Defense Evasion" value={71} max={100} severity="high" />
            <BarRow label="Credential Access" value={41} max={100} severity="crit" />
            <BarRow label="Lateral Mvmt." value={28} max={100} severity="high" />
            <BarRow label="Exfiltration" value={18} max={100} severity="crit" />
          </Panel>
          <Panel title="Top noisy rules" sub="candidates for suppression">
            <BarRow label="R-EDR-0091 PwSh exec" value={428} max={500} severity="" />
            <BarRow label="R-NDR-0042 DNS exfil" value={312} max={500} />
            <BarRow label="R-IDP-0018 Geo-impr." value={244} max={500} />
            <BarRow label="R-SIEM-0099 4xx burst" value={188} max={500} />
          </Panel>
        </div>
      </div>
    </div>
  );
};

/* ===== Incident & Case Management ===== */
const IncidentsScreen = ({ onOpenAlert }) => {
  const [selected, setSelected] = useS(INCIDENTS[0].id);
  const inc = INCIDENTS.find(i => i.id === selected);
  return (
    <div className="screen" data-screen-label="Incidents & Cases">
      <div className="screen__header">
        <div><h1 className="screen__title">Incidents &amp; Cases</h1><div className="screen__subtitle">Active investigations · SLA tracking · response coordination</div></div>
        <div className="screen__toolbar"><Btn size="xs">FILTER</Btn><Btn size="xs">SLA REPORT</Btn><Btn size="xs" variant="primary">+ NEW INCIDENT</Btn></div>
      </div>

      <div className="kpis" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 10 }}>
        <KPI label="Open incidents" value="14" delta="+2" deltaDir="up" footer="3 P1 · 6 P2 · 5 P3" />
        <KPI label="P1 critical" value="3" accent="crit" footer="1 in containment" />
        <KPI label="SLA at risk" value="2" delta="+1" deltaDir="up" footer="INC-9970 breached" />
        <KPI label="Mean response" value="11m" delta="−02m" deltaDir="down" footer="P1 SLA: 15m" />
        <KPI label="Mean resolution" value="3h 42m" delta="−18m" deltaDir="down" footer="P1 SLA: 4h" />
        <KPI label="This-week closed" value="62" delta="+9" deltaDir="up" footer="84% within SLA" />
      </div>

      <div className="row" style={{ gridTemplateColumns: '1.4fr 1fr', marginBottom: 10 }}>
        <Panel title="Open incidents" sub={`${INCIDENTS.length} active · click for detail`} flush>
          <table className="tbl">
            <thead><tr>
              <th style={{width: 78}}>ID</th>
              <th>Title</th>
              <th style={{width: 80}}>Sev</th>
              <th style={{width: 56}} className="num">Stage</th>
              <th style={{width: 56}} className="num">Assets</th>
              <th style={{width: 100}}>Lead</th>
              <th style={{width: 100}}>Status</th>
              <th style={{width: 110}}>SLA</th>
            </tr></thead>
            <tbody>
              {INCIDENTS.map(i => (
                <tr key={i.id} className={selected === i.id ? 'is-active' : ''} onClick={() => setSelected(i.id)}>
                  <td className="mono">{i.id}</td>
                  <td><span className="ink">{i.title}</span></td>
                  <td><Sev level={i.sev} /></td>
                  <td className="num">{i.stage}/7</td>
                  <td className="num">{i.assets}</td>
                  <td className="mono dim">{i.lead}</td>
                  <td className="mono">{i.status.toUpperCase()}</td>
                  <td className="mono" style={{ color: i.sla.includes('BREACH') ? 'var(--sev-critical)' : 'var(--color-body)' }}>{i.sla}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title={`${inc.id} · detail`} sub={inc.status}>
          <dl className="kv" style={{ marginBottom: 10 }}>
            <dt>TITLE</dt><dd style={{ whiteSpace: 'normal' }}>{inc.title}</dd>
            <dt>SEVERITY</dt><dd><Sev level={inc.sev} /></dd>
            <dt>KILL CHAIN</dt><dd>Stage {inc.stage} of 7</dd>
            <dt>LEAD</dt><dd>{inc.lead}</dd>
            <dt>ASSETS</dt><dd>{inc.assets} impacted</dd>
            <dt>OPENED</dt><dd>{inc.opened}</dd>
            <dt>SLA</dt><dd>{inc.sla}</dd>
          </dl>

          <div className="dim mono uppr" style={{ marginBottom: 6 }}>Response progress</div>
          <div className="steps" style={{ marginBottom: 12 }}>
            {['DETECT','TRIAGE','INVEST','ESCAL','CONTAIN','RESOLVE'].map((s, i) => (
              <div key={s} className={`steps__step ${i < 4 ? 'done' : ''} ${i === 4 ? 'curr' : ''}`}>{s}</div>
            ))}
          </div>

          <div className="dim mono uppr" style={{ marginBottom: 6 }}>Recent activity</div>
          <Timeline events={TIMELINE.slice(0, 5)} onSelect={() => onOpenAlert(ALERTS[0])} />
        </Panel>
      </div>

      <div className="row" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 0 }}>
        <Panel title="Incidents by severity" sub="last 30 days">
          <BarRow label="Critical" value={14} max={120} severity="crit" />
          <BarRow label="High" value={42} max={120} severity="high" />
          <BarRow label="Medium" value={88} max={120} severity="med" />
          <BarRow label="Low" value={119} max={120} severity="low" />
        </Panel>
        <Panel title="Resolution trend" sub="median hours to close · 14d">
          <Spark data={[5.2,4.8,5.1,4.4,4.6,4.1,4.0,3.9,4.2,3.8,3.6,3.7,3.4,3.2]} width={280} height={56} fill="var(--color-ink)" />
          <div className="dim mono uppr" style={{ marginTop: 6, fontSize: 9.5 }}>HOURS · DOWN 38% MoM</div>
        </Panel>
        <Panel title="Playbook usage" sub="top 5 invoked">
          <BarRow label="PB-CRED-12" value={84} max={100} />
          <BarRow label="PB-EXFIL-04" value={62} max={100} />
          <BarRow label="PB-IDP-22" value={51} max={100} />
          <BarRow label="PB-EDR-08" value={47} max={100} />
          <BarRow label="PB-FRAUD-31" value={29} max={100} />
        </Panel>
      </div>
    </div>
  );
};

/* ===== Analyst Workload ===== */
const WorkloadScreen = () => (
  <div className="screen" data-screen-label="Analyst Workload">
    <div className="screen__header">
      <div><h1 className="screen__title">Analyst Workload</h1><div className="screen__subtitle">Queue distribution · capacity · SLA adherence per analyst</div></div>
      <div className="screen__toolbar"><Btn size="xs">REBALANCE</Btn><Btn size="xs">SHIFT REPORT</Btn><Btn size="xs" variant="primary">PAGE T3</Btn></div>
    </div>

    <div className="kpis" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 10 }}>
      <KPI label="On-shift analysts" value="8" footer="T1: 4 · T2: 2 · T3: 1 · Fraud: 1" />
      <KPI label="Open per analyst" value="7.8" delta="+0.6" deltaDir="up" footer="target ≤ 6" />
      <KPI label="Capacity utilization" value="79%" delta="+4" deltaDir="up" footer="2 analysts over 85%" />
      <KPI label="P1 backlog" value="9" delta="+1" deltaDir="up" accent="crit" />
      <KPI label="SLA adherence" value="89%" delta="−2" deltaDir="up" footer="target ≥ 92%" />
      <KPI label="Avg case duration" value="46m" delta="−4m" deltaDir="down" footer="P1: 28m" />
    </div>

    <div className="row" style={{ gridTemplateColumns: '1.5fr 1fr', marginBottom: 10 }}>
      <Panel title="Analyst queues" sub="open cases · capacity · SLA" flush>
        <table className="tbl">
          <thead><tr>
            <th>Analyst</th>
            <th style={{width: 76}} className="num">Open</th>
            <th style={{width: 64}} className="num">P1</th>
            <th>Capacity</th>
            <th style={{width: 70}} className="num">SLA %</th>
            <th style={{width: 80}}>Status</th>
          </tr></thead>
          <tbody>
            {QUEUE.map(q => (
              <tr key={q.who}>
                <td><span className="ink">{q.who}</span></td>
                <td className="num">{q.open}</td>
                <td className="num" style={{ color: q.crit > 1 ? 'var(--sev-critical)' : 'var(--color-body)', fontWeight: q.crit > 1 ? 600 : 400 }}>{q.crit}</td>
                <td><div className="bar-row__track" style={{ width: 200 }}><div className={`bar-row__fill ${q.util > 90 ? 'crit' : q.util > 80 ? 'high' : ''}`} style={{ width: `${q.util}%` }}></div></div></td>
                <td className="num">{q.sla}%</td>
                <td className="mono" style={{ color: q.util > 90 ? 'var(--sev-critical)' : q.sla < 85 ? 'var(--sev-medium)' : 'var(--sev-resolved)' }}>
                  {q.util > 90 ? '● OVERLOAD' : q.sla < 85 ? '● AT RISK' : '● OK'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Shift heatmap" sub="case opens · 24h × analyst">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUEUE.slice(0, 8).map((q, i) => (
            <div key={q.who} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 6, alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--color-muted)' }}>{q.who.split(' ').slice(0,2).join(' ')}</span>
              <div className="heat">
                {Array.from({length: 24}).map((_, h) => {
                  const intensity = Math.max(0, Math.sin((h - 4 + i) / 24 * Math.PI) * (0.7 + Math.random() * 0.5));
                  const bg = intensity > 0.7 ? 'var(--sev-critical)' : intensity > 0.5 ? 'var(--sev-high)' : intensity > 0.3 ? 'var(--sev-medium)' : intensity > 0.1 ? 'var(--color-surface-strong)' : 'var(--color-surface-card)';
                  return <div key={h} className="heat__cell" style={{ background: bg, opacity: 0.4 + intensity * 0.6 }} title={`${h}:00 — ${Math.round(intensity*20)} alerts`}></div>;
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="dim mono uppr" style={{ marginTop: 6, fontSize: 9.5 }}>00:00 ─────────── 12:00 ─────────── 23:00 UTC</div>
      </Panel>
    </div>

    <div className="row" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 0 }}>
      <Panel title="Cases by tier" sub="rolling 7d">
        <BarRow label="T1 triage" value={342} max={400} severity="" />
        <BarRow label="T2 invest." value={188} max={400} severity="med" />
        <BarRow label="T3 / IR" value={47} max={400} severity="high" />
        <BarRow label="Fraud ops" value={92} max={400} severity="med" />
        <BarRow label="Auto-closed" value={1840} max={2000} severity="low" />
      </Panel>
      <Panel title="Top alert types · per shift">
        <BarRow label="Phishing" value={84} max={100} />
        <BarRow label="EDR malware" value={71} max={100} severity="high" />
        <BarRow label="Identity / MFA" value={62} max={100} />
        <BarRow label="DLP exfiltration" value={48} max={100} severity="crit" />
        <BarRow label="C2 beacon" value={31} max={100} severity="high" />
      </Panel>
      <Panel title="Burnout signals" sub="watchlist">
        <dl className="kv">
          <dt>R. PATEL</dt><dd>14 open · 94% util · 11h on-shift</dd>
          <dt>A. WU</dt><dd>11 open · 82% util · OT requested</dd>
          <dt>S. LIN</dt><dd>SLA dip noted (96→89%)</dd>
        </dl>
        <div style={{ marginTop: 10 }}>
          <Btn size="xs" variant="primary">CALL T1 REINFORCEMENT</Btn>
        </div>
      </Panel>
    </div>
  </div>
);

/* ===== Automation & Remediation ===== */
const AutomationScreen = () => (
  <div className="screen" data-screen-label="Automation">
    <div className="screen__header">
      <div><h1 className="screen__title">Automation &amp; Remediation</h1><div className="screen__subtitle">Playbook execution · containment · SOAR orchestration</div></div>
      <div className="screen__toolbar"><Btn size="xs">PLAYBOOK LIB</Btn><Btn size="xs">RUN HISTORY</Btn><Btn size="xs" variant="primary">+ NEW PLAYBOOK</Btn></div>
    </div>

    <div className="kpis" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 10 }}>
      <KPI label="Playbooks active" value="142" footer="29 critical-tier" />
      <KPI label="Runs (24h)" value="3,884" delta="+12%" deltaDir="up" />
      <KPI label="Success rate" value="96.4%" delta="+0.8" deltaDir="up" />
      <KPI label="Auto-contained" value="83%" delta="+4" deltaDir="up" />
      <KPI label="Failed runs" value="14" delta="+3" deltaDir="up" accent="crit" footer="2 require analyst" />
      <KPI label="Mean exec time" value="42s" delta="−6s" deltaDir="down" />
    </div>

    <div className="row" style={{ gridTemplateColumns: '1.6fr 1fr', marginBottom: 10 }}>
      <Panel title="Playbook execution log" sub="last 20 runs · click for trace" flush>
        <table className="tbl">
          <thead><tr><th style={{width:74}}>Time</th><th style={{width:100}}>Playbook</th><th>Trigger</th><th style={{width:90}}>Target</th><th style={{width:60}} className="num">Actions</th><th style={{width:64}} className="num">Time</th><th style={{width:80}}>Status</th></tr></thead>
          <tbody>
            {[
              ['14:42:24','PB-CRED-12','ALT-78441 LSASS access','APP-77',7,'18s','SUCCESS'],
              ['14:39:42','PB-EXFIL-04','ALT-78438 Egress anomaly','OBJ-STORE',4,'24s','SUCCESS'],
              ['14:38:24','PB-IDP-22','12 impossible travel events','idp.cti',9,'11s','SUCCESS'],
              ['14:36:34','PB-EDR-08','ALT-78433 process injection','WS-441',5,'8s','SUCCESS'],
              ['14:35:53','PB-EMAIL-19','142 phishing msgs held','o365',2,'4s','SUCCESS'],
              ['14:24:11','PB-FRAUD-31','Wire velocity anomaly','pay-svc.fin',6,'52s','PARTIAL'],
              ['14:21:50','PB-VULN-07','CVE-2026-28114 quarantine','EDGE-LB-A',3,'1m 12s','FAILED'],
              ['14:18:02','PB-INC-44','CMP-2836 containment','multi',12,'2m 04s','SUCCESS'],
            ].map((r, i) => (
              <tr key={i}>
                <td className="mono dim">{r[0]}</td>
                <td className="mono">{r[1]}</td>
                <td>{r[2]}</td>
                <td className="mono">{r[3]}</td>
                <td className="num">{r[4]}</td>
                <td className="num">{r[5]}</td>
                <td className="mono" style={{ color: r[6] === 'SUCCESS' ? 'var(--sev-resolved)' : r[6] === 'PARTIAL' ? 'var(--sev-medium)' : 'var(--sev-critical)' }}>● {r[6]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Failure analysis" sub="last 24h failed runs">
        <dl className="kv">
          <dt>PB-VULN-07</dt><dd>EDGE-LB-A reboot blocked by change window</dd>
          <dt>PB-FRAUD-31</dt><dd>Step 4 ledger lock timeout (partial OK)</dd>
        </dl>
        <div style={{ marginTop: 10 }} className="dim mono uppr">Containment confidence</div>
        <BarRow label="Identity actions" value={98} max={100} severity="low" suffix="%" />
        <BarRow label="Endpoint isolation" value={94} max={100} severity="low" suffix="%" />
        <BarRow label="Network block" value={91} max={100} severity="low" suffix="%" />
        <BarRow label="Cloud quarantine" value={82} max={100} severity="med" suffix="%" />
        <BarRow label="Code rollback" value={64} max={100} severity="high" suffix="%" />
      </Panel>
    </div>

    <Panel title="Playbook health · top 12" flush>
      <table className="tbl">
        <thead><tr><th style={{width:110}}>Playbook</th><th>Use case</th><th style={{width:80}} className="num">Runs/24h</th><th style={{width:90}} className="num">Success %</th><th style={{width:90}} className="num">Mean time</th><th>Trend</th><th style={{width:80}}>State</th></tr></thead>
        <tbody>
          {[
            ['PB-CRED-12','Credential containment',184,99.2,'18s', [3,4,5,4,6,7,8,7], 'OK'],
            ['PB-EXFIL-04','Egress block + DLP retro',62,97.8,'24s', [4,3,5,4,5,4,6,5], 'OK'],
            ['PB-IDP-22','Identity invalidate / step-up',311,99.7,'11s', [8,9,8,10,11,12,13,14], 'OK'],
            ['PB-EDR-08','Endpoint isolate',128,98.4,'8s', [5,5,6,6,7,7,8,8], 'OK'],
            ['PB-EMAIL-19','Phishing quarantine',412,99.9,'4s', [10,11,12,13,14,15,16,18], 'OK'],
            ['PB-FRAUD-31','Wire hold + review',46,84.2,'52s', [3,4,4,3,2,3,2,2], 'DEGRADED'],
            ['PB-VULN-07','Patch & reboot',18,72.1,'1m 12s', [2,3,1,2,1,2,1,1], 'FAILING'],
            ['PB-INC-44','Major incident cascade',8,100,'2m 04s', [1,0,1,1,2,1,2,1], 'OK'],
          ].map((r, i) => (
            <tr key={i}>
              <td className="mono">{r[0]}</td>
              <td>{r[1]}</td>
              <td className="num">{r[2]}</td>
              <td className="num">{r[3]}%</td>
              <td className="num">{r[4]}</td>
              <td><Spark data={r[5]} width={100} height={20} /></td>
              <td className="mono" style={{ color: r[6] === 'OK' ? 'var(--sev-resolved)' : r[6] === 'DEGRADED' ? 'var(--sev-medium)' : 'var(--sev-critical)' }}>● {r[6]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  </div>
);

/* ===== Money Movement ===== */
const MoneyScreen = () => (
  <div className="screen" data-screen-label="Money Movement">
    <div className="screen__header">
      <div><h1 className="screen__title">Money Movement Monitoring</h1><div className="screen__subtitle">Transaction anomalies · velocity · corridor risk · cross-account linkage</div></div>
      <div className="screen__toolbar"><Btn size="xs">CORRIDORS</Btn><Btn size="xs">ML MODEL</Btn><Btn size="xs" variant="primary">HOLD TXN</Btn></div>
    </div>
    <div className="kpis" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 10 }}>
      <KPI label="Txns / min" value="38,412" delta="+2%" deltaDir="up" footer="rolling 5m" />
      <KPI label="Flagged" value="142" delta="+18" deltaDir="up" footer="0.36% of volume" />
      <KPI label="Held by ops" value="11" accent="crit" footer="$4.2M aggregate" />
      <KPI label="High-risk corridors" value="4" footer="EMEA, LATAM-MX, SEA-PH, RU" />
      <KPI label="Fraud score ≥ 80" value="22" delta="+6" deltaDir="up" />
      <KPI label="Recovery rate" value="91.4%" delta="+1.2" deltaDir="up" />
    </div>

    <div className="row" style={{ gridTemplateColumns: '1.6fr 1fr', marginBottom: 10 }}>
      <Panel title="Held transactions" sub="awaiting Fraud Ops review" flush>
        <table className="tbl">
          <thead><tr><th style={{width:96}}>Ledger</th><th style={{width:90}} className="num">Amount</th><th>Corridor</th><th style={{width:120}}>Counterparty</th><th style={{width:64}} className="num">Score</th><th style={{width:90}}>Flag</th><th>Held by</th></tr></thead>
          <tbody>
            {[
              ['L-7811','$2,400,000','US→GB→AE','Coastline Holdings','94','VELOCITY','L. Mendez'],
              ['L-7807','$890,000','US→CY','Avermount Trade','88','SANCTIONS','L. Mendez'],
              ['L-7802','$412,000','MX→US','Servicios Norte','81','STRUCTURING','AUTO'],
              ['L-7798','$310,000','PH→US','BrightPath Ent.','77','VELOCITY','L. Mendez'],
              ['L-7791','$184,000','RU→TR','Privatelink LLC','92','SANCTIONS','AUTO'],
              ['L-7783','$96,000','US→VG','Helix Capital','68','SHELL-CO','L. Mendez'],
              ['L-7779','$58,000','US→US','*intra-acct hop*','71','MULE-PATTERN','AUTO'],
            ].map((r,i) => (
              <tr key={i}>
                <td className="mono">{r[0]}</td>
                <td className="num">{r[1]}</td>
                <td className="mono">{r[2]}</td>
                <td>{r[3]}</td>
                <td className="num" style={{ color: parseInt(r[4]) > 85 ? 'var(--sev-critical)' : parseInt(r[4]) > 70 ? 'var(--sev-medium)' : 'var(--color-body)', fontWeight: 600 }}>{r[4]}</td>
                <td className="mono">{r[5]}</td>
                <td className="mono dim">{r[6]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Corridor risk · USD-denominated">
        <BarRow label="US ↔ EMEA" value={86} max={100} severity="crit" />
        <BarRow label="US ↔ LATAM" value={71} max={100} severity="high" />
        <BarRow label="US ↔ SEA" value={62} max={100} severity="high" />
        <BarRow label="EU ↔ MENA" value={54} max={100} severity="med" />
        <BarRow label="Cross-RU" value={92} max={100} severity="crit" />
        <BarRow label="Intra-domestic" value={18} max={100} severity="low" />

        <div className="dim mono uppr" style={{ marginTop: 12, fontSize: 9.5 }}>VELOCITY ANOMALY (60M)</div>
        <Spark data={[12,14,11,18,22,28,38,42,48,62,71,68,52,44,38,28]} width={280} height={56} color="var(--sev-critical)" fill="var(--sev-critical)" />
      </Panel>
    </div>

    <Panel title="Anomaly clusters · ML fusion" flush>
      <table className="tbl">
        <thead><tr><th style={{width:90}}>Cluster</th><th>Pattern</th><th style={{width:80}} className="num">Members</th><th style={{width:90}} className="num">Avg amount</th><th style={{width:64}} className="num">Conf</th><th style={{width:110}}>Detector</th><th style={{width:80}}>Action</th></tr></thead>
        <tbody>
          <tr><td className="mono">CL-1442</td><td>Coordinated wires · 11 ledgers · EMEA corridor · 14m window</td><td className="num">11</td><td className="num">$382K</td><td className="num">94%</td><td className="mono dim">graph-iso v2</td><td><Btn size="xs" variant="danger">HOLD</Btn></td></tr>
          <tr><td className="mono">CL-1440</td><td>Structured deposits under reporting threshold · 28 accounts</td><td className="num">28</td><td className="num">$9.1K</td><td className="num">88%</td><td className="mono dim">density-DBS</td><td><Btn size="xs">REVIEW</Btn></td></tr>
          <tr><td className="mono">CL-1438</td><td>Mule-flow signature · 3-hop pattern · checking → savings → wire</td><td className="num">17</td><td className="num">$24K</td><td className="num">76%</td><td className="mono dim">graph-iso v2</td><td><Btn size="xs">REVIEW</Btn></td></tr>
          <tr><td className="mono">CL-1431</td><td>Card-not-present spike · ATO indicators · 4 BIN ranges</td><td className="num">182</td><td className="num">$840</td><td className="num">71%</td><td className="mono dim">xgb-fraud v6</td><td><Btn size="xs">REVIEW</Btn></td></tr>
        </tbody>
      </table>
    </Panel>
  </div>
);

/* ===== Fraud Monitoring ===== */
const FraudScreen = () => (
  <div className="screen" data-screen-label="Fraud">
    <div className="screen__header">
      <div><h1 className="screen__title">Fraud Monitoring</h1><div className="screen__subtitle">Customer fraud events · risk scoring · escalation queues</div></div>
      <div className="screen__toolbar"><Btn size="xs">RULES</Btn><Btn size="xs">CHARGEBACKS</Btn><Btn size="xs" variant="primary">DECLARE WAVE</Btn></div>
    </div>
    <div className="kpis" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 10 }}>
      <KPI label="Events / 5m" value="2,184" delta="+8%" deltaDir="up" />
      <KPI label="Open cases" value="312" delta="+24" deltaDir="up" />
      <KPI label="Loss exposure" value="$1.4M" delta="+$320K" deltaDir="up" accent="crit" />
      <KPI label="Customers affected" value="184" />
      <KPI label="Block rate" value="94.2%" delta="+0.6" deltaDir="up" />
      <KPI label="False-positive rate" value="4.1%" delta="−0.2" deltaDir="down" />
    </div>

    <div className="row" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 10 }}>
      <Panel title="Fraud typology · last 24h">
        <BarRow label="Account takeover" value={142} max={200} severity="crit" />
        <BarRow label="Card-not-present" value={128} max={200} severity="high" />
        <BarRow label="Synthetic identity" value={62} max={200} severity="high" />
        <BarRow label="Wire fraud" value={28} max={200} severity="crit" />
        <BarRow label="Check kiting" value={18} max={200} severity="med" />
        <BarRow label="Mule activity" value={44} max={200} severity="med" />
        <BarRow label="ATM skim" value={9} max={200} severity="low" />
      </Panel>
      <Panel title="Channel attack mix">
        <BarRow label="Mobile app" value={48} max={100} severity="crit" suffix="%" />
        <BarRow label="Web banking" value={31} max={100} severity="high" suffix="%" />
        <BarRow label="Voice / call ctr" value={11} max={100} severity="med" suffix="%" />
        <BarRow label="Branch" value={4} max={100} suffix="%" />
        <BarRow label="Partner APIs" value={6} max={100} severity="med" suffix="%" />
        <div className="dim mono uppr" style={{ marginTop: 10, fontSize: 9.5 }}>EVENTS/HOUR · 24h</div>
        <Spark data={[42,38,44,52,68,84,96,128,162,142,184,168,128,142,162,142,138,118,108,92,84,76,68,62]} width={280} height={48} fill="var(--color-ink)" />
      </Panel>
      <Panel title="High-risk customer queue" sub="auto-prioritized">
        <table className="tbl">
          <thead><tr><th style={{width:80}}>Cust ID</th><th>Last event</th><th className="num" style={{width:48}}>Score</th></tr></thead>
          <tbody>
            <tr><td className="mono">C-4421984</td><td>3 wire attempts, MFA bypass</td><td className="num" style={{color:'var(--sev-critical)',fontWeight:600}}>96</td></tr>
            <tr><td className="mono">C-4421912</td><td>Card spend velocity anomaly</td><td className="num" style={{color:'var(--sev-critical)',fontWeight:600}}>92</td></tr>
            <tr><td className="mono">C-4421860</td><td>New device + new payee</td><td className="num" style={{color:'var(--sev-high)',fontWeight:600}}>88</td></tr>
            <tr><td className="mono">C-4421802</td><td>SIM swap signal</td><td className="num" style={{color:'var(--sev-high)',fontWeight:600}}>84</td></tr>
            <tr><td className="mono">C-4421798</td><td>Synthetic ID match</td><td className="num">78</td></tr>
            <tr><td className="mono">C-4421774</td><td>Mule path detected</td><td className="num">74</td></tr>
            <tr><td className="mono">C-4421702</td><td>Geo + device mismatch</td><td className="num">71</td></tr>
          </tbody>
        </table>
      </Panel>
    </div>

    <Panel title="Fraud loss trend · rolling 30 days" sub="actual vs prevented · $USD" flush>
      <div style={{ padding: 16 }}>
        <svg viewBox="0 0 800 160" width="100%" height="160" preserveAspectRatio="none">
          {Array.from({length: 30}).map((_, i) => {
            const x = i * (800/30) + 6;
            const actual = 30 + Math.sin(i/3) * 14 + Math.random()*10;
            const prevented = 60 + Math.sin(i/4) * 22 + Math.random()*16;
            return (
              <g key={i}>
                <rect x={x} y={160 - prevented - actual} width={(800/30) - 4} height={prevented} fill="var(--sev-resolved)" opacity="0.7" />
                <rect x={x} y={160 - actual} width={(800/30) - 4} height={actual} fill="var(--sev-critical)" />
              </g>
            );
          })}
          <line x1="0" y1="80" x2="800" y2="80" stroke="var(--hairline-strong)" strokeDasharray="2 3" />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--color-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <span><span style={{ width: 8, height: 8, background: 'var(--sev-critical)', display: 'inline-block', marginRight: 4 }}></span>Actual loss ($142K avg/day)</span>
          <span><span style={{ width: 8, height: 8, background: 'var(--sev-resolved)', display: 'inline-block', marginRight: 4, opacity: 0.7 }}></span>Prevented ($2.1M avg/day)</span>
          <span>Prevention rate: 93.7%</span>
        </div>
      </div>
    </Panel>
  </div>
);

Object.assign(window, { ThreatDetectionScreen, IncidentsScreen, WorkloadScreen, AutomationScreen, MoneyScreen, FraudScreen });
