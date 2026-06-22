/* screens-2.jsx — DLP, Threat Intel, Vulns, Insider, Exec Travel, Executive */

const { useState: useS2 } = React;

/* ===== DLP ===== */
const DLPScreen = () => (
  <div className="screen" data-screen-label="DLP">
    <div className="screen__header">
      <div><h1 className="screen__title">Data Loss Prevention</h1><div className="screen__subtitle">Sensitive data movement · policy violations · exfiltration alerts</div></div>
      <div className="screen__toolbar"><Btn size="xs">POLICIES</Btn><Btn size="xs">CLASSIFIERS</Btn><Btn size="xs" variant="primary">QUARANTINE BATCH</Btn></div>
    </div>
    <div className="kpis" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 10 }}>
      <KPI label="Violations (24h)" value="412" delta="+18" deltaDir="up" />
      <KPI label="Quarantined" value="342" delta="+42" deltaDir="up" />
      <KPI label="PII records held" value="14,820" footer="412 SSN · 8K PAN · 6K PII" />
      <KPI label="Critical channels" value="3" accent="crit" footer="email, GenAI, USB" />
      <KPI label="Repeat offenders" value="14" footer="watchlist enrolled" />
      <KPI label="Avg dwell-to-block" value="4.2s" delta="−0.6s" deltaDir="down" />
    </div>

    <div className="row" style={{ gridTemplateColumns: '1.6fr 1fr', marginBottom: 10 }}>
      <Panel title="Recent violations" sub="critical channels first" flush>
        <table className="tbl">
          <thead><tr><th style={{width:74}}>Time</th><th style={{width:60}}>Sev</th><th>User · channel</th><th>Content classification</th><th style={{width:70}} className="num">Records</th><th style={{width:80}}>Channel</th><th style={{width:90}}>Action</th></tr></thead>
          <tbody>
            <tr><td className="mono dim">14:28:55</td><td><Sev level="critical" /></td><td>j.merrick@cti.corp · personal Gmail</td><td>SSN · batch upload</td><td className="num">412</td><td className="mono">EMAIL</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● BLOCKED</td></tr>
            <tr><td className="mono dim">14:24:12</td><td><Sev level="high" /></td><td>k.santos@cti.corp · ChatGPT</td><td>Customer PII + acct numbers</td><td className="num">86</td><td className="mono">GENAI</td><td className="mono" style={{color:'var(--sev-medium)'}}>● HELD</td></tr>
            <tr><td className="mono dim">14:18:48</td><td><Sev level="high" /></td><td>r.duval@cti.corp · USB device</td><td>Source code · payment-svc</td><td className="num">—</td><td className="mono">USB</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● BLOCKED</td></tr>
            <tr><td className="mono dim">14:11:24</td><td><Sev level="medium" /></td><td>a.peng@cti.corp · OneDrive ext</td><td>Internal docs · M&A draft</td><td className="num">14</td><td className="mono">CLOUD</td><td className="mono" style={{color:'var(--sev-medium)'}}>● HELD</td></tr>
            <tr><td className="mono dim">14:08:02</td><td><Sev level="medium" /></td><td>m.cox@cti.corp · print job</td><td>Compliance audit packet</td><td className="num">38</td><td className="mono">PRINT</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● BLOCKED</td></tr>
            <tr><td className="mono dim">13:58:11</td><td><Sev level="critical" /></td><td>(svc-acct) · S3 → external</td><td>PCI · cardholder data</td><td className="num">2,818</td><td className="mono">CLOUD</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● BLOCKED</td></tr>
            <tr><td className="mono dim">13:44:38</td><td><Sev level="low" /></td><td>n.aoki@cti.corp · Slack DM</td><td>Internal-only label</td><td className="num">1</td><td className="mono">CHAT</td><td className="mono dim">● WARNED</td></tr>
          </tbody>
        </table>
      </Panel>

      <Panel title="Top exposed classifiers" sub="violation count · 7d">
        <BarRow label="SSN / TIN" value={184} max={300} severity="crit" />
        <BarRow label="PAN (card)" value={142} max={300} severity="crit" />
        <BarRow label="PII (combined)" value={88} max={300} severity="high" />
        <BarRow label="Source code" value={62} max={300} severity="high" />
        <BarRow label="M&A / financials" value={31} max={300} severity="med" />
        <BarRow label="Internal-only" value={188} max={300} severity="low" />
        <div className="dim mono uppr" style={{marginTop:10, fontSize:9.5}}>Channels at risk</div>
        <dl className="kv">
          <dt>GENAI (LLM)</dt><dd>+148% MoM · 6 LLMs in scope</dd>
          <dt>EMAIL → ext.</dt><dd>steady · 4 repeat senders</dd>
          <dt>USB</dt><dd>policy violation rate 3.2%</dd>
        </dl>
      </Panel>
    </div>

    <div className="row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 0 }}>
      <Panel title="GenAI usage exposure" sub="prompts inspected · last 24h">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
          {[['ChatGPT','12,841',24],['Claude','8,422',8],['Copilot','21,304',2],['Gemini','3,128',6],['Internal LLM','42,818',0],['Other','1,022',14]].map(([n,v,r],i) => (
            <div key={i} style={{ padding:'8px 10px', background:'var(--panel-bg-strong)', border:'1px solid var(--hairline)' }}>
              <div className="mono uppr dim" style={{fontSize:9.5}}>{n}</div>
              <div className="num ink" style={{fontSize:18, fontWeight:600, marginTop:2}}>{v}</div>
              <div className="mono" style={{fontSize:10, color: r > 10 ? 'var(--sev-critical)' : r > 5 ? 'var(--sev-medium)' : 'var(--color-muted)'}}>{r} flagged</div>
            </div>
          ))}
        </div>
        <BarRow label="Customer data leak" value={42} max={100} severity="crit" />
        <BarRow label="Code leak" value={28} max={100} severity="high" />
        <BarRow label="Strategy / IP" value={18} max={100} severity="med" />
      </Panel>
      <Panel title="Repeat offenders" sub="14-day window">
        <table className="tbl">
          <thead><tr><th>User</th><th>Dept</th><th className="num" style={{width:64}}>Events</th><th>Last channel</th><th className="num" style={{width:60}}>Risk</th></tr></thead>
          <tbody>
            <tr><td>j.merrick</td><td className="dim">Treasury</td><td className="num">14</td><td className="mono">EMAIL</td><td className="num" style={{color:'var(--sev-critical)',fontWeight:600}}>92</td></tr>
            <tr><td>k.santos</td><td className="dim">Customer Ops</td><td className="num">11</td><td className="mono">GENAI</td><td className="num" style={{color:'var(--sev-high)',fontWeight:600}}>84</td></tr>
            <tr><td>r.duval</td><td className="dim">Engineering</td><td className="num">9</td><td className="mono">USB</td><td className="num" style={{color:'var(--sev-high)',fontWeight:600}}>78</td></tr>
            <tr><td>a.peng</td><td className="dim">M&A</td><td className="num">7</td><td className="mono">CLOUD</td><td className="num">68</td></tr>
            <tr><td>m.cox</td><td className="dim">Compliance</td><td className="num">5</td><td className="mono">PRINT</td><td className="num">52</td></tr>
            <tr><td>n.aoki</td><td className="dim">Marketing</td><td className="num">4</td><td className="mono">CHAT</td><td className="num">41</td></tr>
          </tbody>
        </table>
      </Panel>
    </div>
  </div>
);

/* ===== Threat Intelligence ===== */
const IntelScreen = () => (
  <div className="screen" data-screen-label="Threat Intelligence">
    <div className="screen__header">
      <div><h1 className="screen__title">Threat Intelligence</h1><div className="screen__subtitle">IOC feeds · actor tracking · campaign correlation · geographic mapping</div></div>
      <div className="screen__toolbar"><Btn size="xs">FEEDS</Btn><Btn size="xs">STIX EXPORT</Btn><Btn size="xs" variant="primary">+ INDICATOR</Btn></div>
    </div>
    <div className="kpis" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 10 }}>
      <KPI label="IOCs ingested (24h)" value="184,212" delta="+12K" deltaDir="up" />
      <KPI label="Live indicators" value="42,108" footer="78% IP · 14% domain · 8% hash" />
      <KPI label="Tracked actors" value="142" footer="38 active in past 30d" />
      <KPI label="Active campaigns" value="22" delta="+4" deltaDir="up" />
      <KPI label="Feeds healthy" value="38/41" delta="−2" deltaDir="up" accent="crit" />
      <KPI label="Avg feed age" value="6m" footer="target ≤ 15m" />
    </div>

    <div className="row" style={{ gridTemplateColumns: '1.4fr 1fr', marginBottom: 10 }}>
      <Panel title="World threat map" sub="indicator origin · last 4h" flush>
        <div style={{ height: 240, position: 'relative', background: 'var(--panel-bg-strong)', padding: 12 }}>
          {/* simplified continents (placeholder svg blob) */}
          <svg viewBox="0 0 800 240" width="100%" height="100%" preserveAspectRatio="none">
            {/* continent blobs */}
            {[
              [120,80,80,40],[240,110,90,50],[360,80,120,60],[510,90,80,90],[660,150,80,40],[200,180,100,40]
            ].map(([x,y,w,h],i) => (
              <ellipse key={i} cx={x+w/2} cy={y+h/2} rx={w/2} ry={h/2} fill="var(--color-surface-strong)" />
            ))}
            {/* threat origin pins */}
            {[
              [380,90,'crit','RU-cluster','384 ind.'],
              [560,110,'crit','CN-cluster','241 ind.'],
              [620,140,'high','KP','94 ind.'],
              [380,120,'high','IR','142 ind.'],
              [240,150,'med','BR','62 ind.'],
              [180,90,'med','US-eCrime','48 ind.'],
              [400,160,'low','NG','28 ind.'],
              [650,180,'low','ID','14 ind.'],
            ].map(([x,y,sev,label,ct],i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="14" fill={`var(--sev-${sev})`} opacity="0.18" />
                <circle cx={x} cy={y} r="5" fill={`var(--sev-${sev})`} />
                <text x={x+10} y={y+3} fontSize="10" fontFamily="var(--mono)" fill="var(--color-ink)">{label}</text>
                <text x={x+10} y={y+15} fontSize="9" fontFamily="var(--mono)" fill="var(--color-muted-soft)">{ct}</text>
              </g>
            ))}
          </svg>
        </div>
      </Panel>

      <Panel title="Tracked actors" sub="recently active" flush>
        <table className="tbl">
          <thead><tr><th>Actor</th><th>Type</th><th>Motivation</th><th className="num" style={{width:60}}>Active</th></tr></thead>
          <tbody>
            <tr><td><span className="ink">APT-441</span> <span className="dim mono">Nostromo</span></td><td className="mono dim">Nation</td><td>Espionage / banking</td><td className="num" style={{color:'var(--sev-critical)'}}>HOT</td></tr>
            <tr><td><span className="ink">FIN-209</span> <span className="dim mono">Khepri</span></td><td className="mono dim">eCrime</td><td>Financial</td><td className="num" style={{color:'var(--sev-critical)'}}>HOT</td></tr>
            <tr><td><span className="ink">APT-209</span> <span className="dim mono">Vanta</span></td><td className="mono dim">Nation</td><td>Recon / IP theft</td><td className="num" style={{color:'var(--sev-high)'}}>++</td></tr>
            <tr><td><span className="ink">FIN-318</span></td><td className="mono dim">eCrime</td><td>Credential resale</td><td className="num">+</td></tr>
            <tr><td><span className="ink">RANSOM-71</span></td><td className="mono dim">RaaS</td><td>Extortion</td><td className="num" style={{color:'var(--sev-high)'}}>++</td></tr>
            <tr><td><span className="ink">HACKTIV-12</span></td><td className="mono dim">Activist</td><td>Defacement</td><td className="num dim">low</td></tr>
            <tr><td><span className="ink">INSIDER-tier</span></td><td className="mono dim">Internal</td><td>Mixed</td><td className="num">+</td></tr>
          </tbody>
        </table>
      </Panel>
    </div>

    <div className="row" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 0 }}>
      <Panel title="Feed health">
        <table className="tbl" style={{ fontSize: 11 }}>
          <thead><tr><th>Feed</th><th className="num">Age</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>MISP-core</td><td className="num">2m</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● OK</td></tr>
            <tr><td>CrowdStrike</td><td className="num">3m</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● OK</td></tr>
            <tr><td>Mandiant</td><td className="num">6m</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● OK</td></tr>
            <tr><td>FS-ISAC</td><td className="num">11m</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● OK</td></tr>
            <tr><td>Internal honey</td><td className="num">1m</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● OK</td></tr>
            <tr><td>OTX AlienVault</td><td className="num">28m</td><td className="mono" style={{color:'var(--sev-medium)'}}>● STALE</td></tr>
            <tr><td>Recorded Future</td><td className="num">42m</td><td className="mono" style={{color:'var(--sev-critical)'}}>● BROKEN</td></tr>
          </tbody>
        </table>
      </Panel>
      <Panel title="Emerging IOCs" sub="last 60m · prioritized">
        <dl className="kv">
          <dt>IP</dt><dd>185.244.31.14</dd>
          <dt>IP</dt><dd>91.218.114.0/22</dd>
          <dt>DOMAIN</dt><dd>cdn-msft-update[.]com</dd>
          <dt>DOMAIN</dt><dd>ledger-portal[.]ru</dd>
          <dt>SHA256</dt><dd>a1c4..f7e9 (loader.dll)</dd>
          <dt>SHA256</dt><dd>be32..118a (backdoor)</dd>
          <dt>CERT</dt><dd>SHA1 3c91..0b22 (revoked)</dd>
          <dt>TTP</dt><dd>T1059.001 PowerShell + AMSI bypass</dd>
        </dl>
      </Panel>
      <Panel title="Coverage vs APT-441" sub="based on observed TTPs">
        <BarRow label="Detection" value={88} max={100} severity="low" suffix="%" />
        <BarRow label="Prevention" value={62} max={100} severity="med" suffix="%" />
        <BarRow label="Hunting queries" value={74} max={100} severity="low" suffix="%" />
        <BarRow label="Telemetry depth" value={92} max={100} severity="low" suffix="%" />
        <BarRow label="Response playbooks" value={58} max={100} severity="med" suffix="%" />
        <div style={{marginTop:10}} className="dim mono uppr">Gap analysis</div>
        <div style={{fontSize:11.5, marginTop:4}}>3 TTPs lacking prevention controls — recommend EDR tuning rule R-CB-0188.</div>
      </Panel>
    </div>
  </div>
);

/* ===== Vulnerability ===== */
const VulnScreen = () => (
  <div className="screen" data-screen-label="Vulnerabilities">
    <div className="screen__header">
      <div><h1 className="screen__title">Vulnerability &amp; Patch</h1><div className="screen__subtitle">Asset exposure · patch compliance · CVE prioritization</div></div>
      <div className="screen__toolbar"><Btn size="xs">SCAN HISTORY</Btn><Btn size="xs">EXCEPTIONS</Btn><Btn size="xs" variant="primary">PUSH PATCH WAVE</Btn></div>
    </div>
    <div className="kpis" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 10 }}>
      <KPI label="Open CVEs" value="14,212" delta="−842" deltaDir="down" />
      <KPI label="KEV catalog hits" value="38" delta="+2" deltaDir="up" accent="crit" />
      <KPI label="Critical (CVSS 9+)" value="142" delta="−11" deltaDir="down" />
      <KPI label="Patch compliance" value="91.4%" delta="+0.6" deltaDir="up" footer="target ≥ 95%" />
      <KPI label="Exposed assets" value="218" footer="internet-facing" />
      <KPI label="Mean time to patch" value="6.2d" delta="−0.4d" deltaDir="down" footer="critical SLA: 3d" />
    </div>

    <div className="row" style={{ gridTemplateColumns: '1.6fr 1fr', marginBottom: 10 }}>
      <Panel title="KEV-catalog · open exposures" sub="known-exploited vulns active in env" flush>
        <table className="tbl">
          <thead><tr><th style={{width:120}}>CVE</th><th>Product · component</th><th style={{width:60}} className="num">CVSS</th><th style={{width:70}}>EPSS</th><th style={{width:80}} className="num">Assets</th><th>SLA</th><th style={{width:80}}>State</th></tr></thead>
          <tbody>
            <tr><td className="mono">CVE-2026-28114</td><td>Edge LB · auth bypass</td><td className="num" style={{color:'var(--sev-critical)',fontWeight:600}}>9.8</td><td className="mono">0.94</td><td className="num">14</td><td className="mono" style={{color:'var(--sev-critical)'}}>06:14 left</td><td className="mono" style={{color:'var(--sev-medium)'}}>● PATCHING</td></tr>
            <tr><td className="mono">CVE-2026-21044</td><td>Apache HTTP · RCE</td><td className="num" style={{color:'var(--sev-critical)',fontWeight:600}}>9.4</td><td className="mono">0.88</td><td className="num">42</td><td className="mono" style={{color:'var(--sev-medium)'}}>1d 18h</td><td className="mono" style={{color:'var(--sev-medium)'}}>● PATCHING</td></tr>
            <tr><td className="mono">CVE-2025-44218</td><td>OpenSSL · sig forgery</td><td className="num" style={{color:'var(--sev-critical)',fontWeight:600}}>9.1</td><td className="mono">0.79</td><td className="num">218</td><td className="mono">2d 04h</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● SCHEDULED</td></tr>
            <tr><td className="mono">CVE-2025-39811</td><td>Windows Server · LPE</td><td className="num" style={{color:'var(--sev-high)',fontWeight:600}}>8.8</td><td className="mono">0.71</td><td className="num">412</td><td className="mono">4d 12h</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● SCHEDULED</td></tr>
            <tr><td className="mono">CVE-2025-37721</td><td>Citrix NetScaler</td><td className="num" style={{color:'var(--sev-high)',fontWeight:600}}>8.5</td><td className="mono">0.84</td><td className="num">8</td><td className="mono">6d 22h</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● MITIGATED</td></tr>
            <tr><td className="mono">CVE-2025-31920</td><td>VMware ESXi</td><td className="num" style={{color:'var(--sev-high)',fontWeight:600}}>8.3</td><td className="mono">0.62</td><td className="num">28</td><td className="mono">12d</td><td className="mono dim">● EXCEPTION</td></tr>
          </tbody>
        </table>
      </Panel>

      <Panel title="Risk heatmap" sub="business unit × severity">
        <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(4, 1fr)', gap: 1, fontSize: 11 }}>
          <div></div>
          {['CRIT','HIGH','MED','LOW'].map(l => <div key={l} className="dim mono uppr" style={{textAlign:'center', padding:'4px 0'}}>{l}</div>)}
          {[
            ['Wholesale Bk', 14,42,88,184],
            ['Retail Bk', 28,62,142,312],
            ['Treasury', 4,12,38,42],
            ['Corp IT', 18,82,288,840],
            ['Cloud platforms', 8,38,118,402],
            ['Branches', 22,108,418,1208],
            ['ATM network', 12,48,118,288],
          ].map((row, i) => (
            <React.Fragment key={i}>
              <div className="mono" style={{ padding: '6px 8px', background: 'var(--panel-bg-strong)' }}>{row[0]}</div>
              {row.slice(1).map((v, j) => {
                const max = j === 0 ? 30 : j === 1 ? 120 : j === 2 ? 450 : 1300;
                const intensity = v / max;
                const sev = ['crit','high','med','low'][j];
                return (
                  <div key={j} style={{ background: `var(--sev-${sev})`, opacity: 0.15 + intensity * 0.75, color: intensity > 0.6 ? 'white' : 'var(--color-ink)', padding: '6px 8px', textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 600, cursor: 'pointer' }}>
                    {v}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </Panel>
    </div>

    <div className="row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 0 }}>
      <Panel title="Patch compliance · 30 days" sub="weekly rollup">
        <Spark data={[84.2, 85.1, 86.4, 87.2, 88.1, 88.8, 89.6, 90.1, 90.4, 90.9, 91.4]} width={400} height={68} fill="var(--color-ink)" />
        <div className="dim mono uppr" style={{ marginTop: 8, fontSize: 9.5 }}>Target: 95% · current 91.4% · trajectory +0.5/wk → ETA 7 weeks</div>
      </Panel>
      <Panel title="Top exposed assets">
        <BarRow label="EDGE-LB-A" value={14} max={30} severity="crit" />
        <BarRow label="WEB-PROD-12" value={11} max={30} severity="high" />
        <BarRow label="MAIL-RELAY-02" value={9} max={30} severity="high" />
        <BarRow label="VPN-GW-EAST" value={8} max={30} severity="med" />
        <BarRow label="DC-01" value={7} max={30} severity="high" />
        <BarRow label="APP-77" value={6} max={30} severity="med" />
      </Panel>
    </div>
  </div>
);

/* ===== Insider Threat ===== */
const InsiderScreen = () => (
  <div className="screen" data-screen-label="Insider Threat">
    <div className="screen__header">
      <div><h1 className="screen__title">Insider Threat</h1><div className="screen__subtitle">Behavioral anomalies · privileged access · policy violations</div></div>
      <div className="screen__toolbar"><Btn size="xs">UEBA RULES</Btn><Btn size="xs">HR / LEGAL</Btn><Btn size="xs" variant="primary">OPEN CASE</Btn></div>
    </div>
    <div className="kpis" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 10 }}>
      <KPI label="Users monitored" value="38,124" footer="ethically-scoped" />
      <KPI label="Anomalies (24h)" value="142" delta="+22" deltaDir="up" />
      <KPI label="On watchlist" value="22" delta="+3" deltaDir="up" />
      <KPI label="Privileged anomalies" value="9" accent="crit" footer="HR + Legal notified" />
      <KPI label="Active investigations" value="4" />
      <KPI label="Mean dwell-to-detect" value="2d 04h" delta="−6h" deltaDir="down" />
    </div>

    <div className="row" style={{ gridTemplateColumns: '1.4fr 1fr', marginBottom: 10 }}>
      <Panel title="High-risk users · UEBA" sub="behavioral z-score ≥ 3.5" flush>
        <table className="tbl">
          <thead><tr><th style={{width:90}}>User</th><th>Anomalies</th><th>Dept</th><th className="num" style={{width:64}}>Score</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>j.merrick</td><td>Off-hours bulk access · 14× normal · printed M&A docs · personal email</td><td className="dim">Treasury</td><td className="num" style={{color:'var(--sev-critical)',fontWeight:600}}>94</td><td className="mono" style={{color:'var(--sev-critical)'}}>● INVESTIGATING</td></tr>
            <tr><td>(svc-treasury-3)</td><td>Wire ledger reads outside role; impossible-travel session reuse</td><td className="dim">Service</td><td className="num" style={{color:'var(--sev-critical)',fontWeight:600}}>91</td><td className="mono" style={{color:'var(--sev-critical)'}}>● HOLD</td></tr>
            <tr><td>r.duval</td><td>USB events 12× peer · 4 source-code repos · resignation flag (HR)</td><td className="dim">Engineering</td><td className="num" style={{color:'var(--sev-high)',fontWeight:600}}>88</td><td className="mono" style={{color:'var(--sev-high)'}}>● WATCH</td></tr>
            <tr><td>a.peng</td><td>External cloud share spike · M&A keyword cluster</td><td className="dim">Corp Dev</td><td className="num" style={{color:'var(--sev-high)',fontWeight:600}}>82</td><td className="mono" style={{color:'var(--sev-high)'}}>● WATCH</td></tr>
            <tr><td>k.santos</td><td>Customer record lookups outside normal portfolio</td><td className="dim">Cust. Ops</td><td className="num" style={{color:'var(--sev-medium)',fontWeight:600}}>74</td><td className="mono dim">● BASELINE</td></tr>
            <tr><td>m.cox</td><td>Off-hours compliance audit pulls</td><td className="dim">Compliance</td><td className="num">68</td><td className="mono dim">● BASELINE</td></tr>
          </tbody>
        </table>
      </Panel>

      <Panel title="Anomaly types" sub="distribution · 14d">
        <BarRow label="Data access volume" value={88} max={100} severity="high" />
        <BarRow label="Off-hours activity" value={72} max={100} severity="med" />
        <BarRow label="Privilege escalation" value={31} max={100} severity="crit" />
        <BarRow label="Geolocation drift" value={28} max={100} severity="med" />
        <BarRow label="Removable media" value={42} max={100} severity="high" />
        <BarRow label="Departing-employee" value={18} max={100} severity="crit" />
        <BarRow label="Print volume" value={22} max={100} severity="med" />
        <BarRow label="Failed auth burst" value={11} max={100} severity="low" />
      </Panel>
    </div>

    <Panel title="Privileged session timeline" sub="Tier-0 admin activity · 24h" flush>
      <div style={{ padding: 12 }}>
        <svg viewBox="0 0 800 120" width="100%" height="120">
          <line x1="0" y1="60" x2="800" y2="60" stroke="var(--hairline-strong)" />
          {Array.from({length: 25}).map((_, h) => (
            <text key={h} x={h * 32} y="115" fontSize="9" fontFamily="var(--mono)" fill="var(--color-muted-soft)">{h.toString().padStart(2,'0')}</text>
          ))}
          {/* sessions */}
          {[
            [40, 80, 'med', 'svc-backup'],
            [100, 60, '', 'svc-monitor'],
            [180, 90, '', 'admin.k.lee'],
            [260, 40, '', 'admin.r.diaz'],
            [340, 110, 'crit', '(svc-treasury-3)'],
            [510, 70, 'high', 'admin.j.merrick'],
            [600, 50, '', 'admin.k.lee'],
            [680, 80, 'med', 'svc-deploy'],
          ].map(([x,w,sev,label],i) => (
            <g key={i}>
              <rect x={x} y={40 - i * 4 + 30} width={w} height="6" fill={sev ? `var(--sev-${sev})` : 'var(--color-ink)'} opacity={sev ? 1 : 0.5} />
              <text x={x} y={36 - i * 4 + 26} fontSize="9" fontFamily="var(--mono)" fill="var(--color-ink)">{label}</text>
            </g>
          ))}
        </svg>
      </div>
    </Panel>
  </div>
);

/* ===== Executive Travel ===== */
const TravelScreen = () => (
  <div className="screen" data-screen-label="Executive Travel">
    <div className="screen__header">
      <div><h1 className="screen__title">Executive Travel Risk</h1><div className="screen__subtitle">VIP travel monitoring · geopolitical exposure · device & identity</div></div>
      <div className="screen__toolbar"><Btn size="xs">POLICY</Btn><Btn size="xs">GEOPOL FEED</Btn><Btn size="xs" variant="primary">ISSUE LOANER</Btn></div>
    </div>
    <div className="kpis" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 10 }}>
      <KPI label="Execs in transit" value="22" delta="+4" deltaDir="up" />
      <KPI label="Tier-1 destinations" value="3" footer="2× elevated risk" />
      <KPI label="High-risk regions" value="2" accent="crit" footer="ongoing geopolitical" />
      <KPI label="Open incidents" value="1" footer="EXEC-DV-318 · device" />
      <KPI label="Loaner devices issued" value="14" />
      <KPI label="Identity step-ups (24h)" value="48" delta="+8" deltaDir="up" />
    </div>

    <div className="row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 10 }}>
      <Panel title="Active travel · VIPs in motion" sub={'last 24h'} flush>
        <table className="tbl">
          <thead><tr><th>Exec</th><th>Itinerary</th><th>Risk</th><th>Device</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td><span className="ink">CEO · A. Hellman</span></td><td>JFK → LHR → DXB</td><td><Sev level="medium" /></td><td className="mono dim">LOANER #A114</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● CLEAN</td></tr>
            <tr><td><span className="ink">CFO · M. Patel</span></td><td>JFK → HKG</td><td><Sev level="high" /></td><td className="mono dim">LOANER #A118</td><td className="mono" style={{color:'var(--sev-medium)'}}>● MONITORING</td></tr>
            <tr><td><span className="ink">CIO · D. Vance</span></td><td>JFK → BER</td><td><Sev level="low" /></td><td className="mono dim">PRIMARY (hardened)</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● CLEAN</td></tr>
            <tr><td><span className="ink">EVP IB · S. Khoury</span></td><td>JFK → IST</td><td><Sev level="high" /></td><td className="mono dim">LOANER #A124</td><td className="mono" style={{color:'var(--sev-medium)'}}>● MONITORING</td></tr>
            <tr><td><span className="ink">GC · R. Imai</span></td><td>NRT → SFO</td><td><Sev level="low" /></td><td className="mono dim">PRIMARY</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● CLEAN</td></tr>
            <tr><td><span className="ink">EVP Treas · V. Lund</span></td><td>SFO → SIN</td><td><Sev level="medium" /></td><td className="mono dim">LOANER #A129</td><td className="mono" style={{color:'var(--sev-resolved)'}}>● CLEAN</td></tr>
            <tr><td><span className="ink">CISO · J. Brennan</span></td><td>JFK → TLV</td><td><Sev level="critical" /></td><td className="mono dim">LOANER #A131</td><td className="mono" style={{color:'var(--sev-critical)'}}>● ALERT</td></tr>
          </tbody>
        </table>
      </Panel>

      <Panel title="Geographic risk overlay" sub="current destinations" flush>
        <div style={{ height: 260, position: 'relative', background: 'var(--panel-bg-strong)' }}>
          <svg viewBox="0 0 800 260" width="100%" height="100%" preserveAspectRatio="none">
            {[[140,90,80,40],[260,110,90,50],[380,80,120,60],[520,90,80,90],[660,150,80,40],[200,180,100,40]].map(([x,y,w,h],i) => (
              <ellipse key={i} cx={x+w/2} cy={y+h/2} rx={w/2} ry={h/2} fill="var(--color-surface-strong)" />
            ))}
            {[
              [180,100,'NYC','low'],[200,120,'SFO','low'],[400,110,'LHR','low'],[420,130,'BER','low'],
              [520,160,'DXB','high'],[490,140,'IST','high'],[510,150,'TLV','crit'],[640,140,'HKG','high'],
              [660,160,'SIN','med'],[710,130,'NRT','low']
            ].map(([x,y,label,sev],i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="12" fill={`var(--sev-${sev})`} opacity="0.18" />
                <circle cx={x} cy={y} r="4" fill={`var(--sev-${sev})`} />
                <text x={x+8} y={y+4} fontSize="10" fontFamily="var(--mono)" fill="var(--color-ink)">{label}</text>
              </g>
            ))}
            {/* travel paths */}
            <path d="M 180,100 Q 320,40 400,110" stroke="var(--color-ink)" strokeWidth="1" strokeDasharray="3 2" fill="none" />
            <path d="M 400,110 Q 460,90 520,160" stroke="var(--sev-medium)" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
            <path d="M 180,100 Q 380,30 640,140" stroke="var(--sev-high)" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
            <path d="M 180,100 Q 350,40 510,150" stroke="var(--sev-critical)" strokeWidth="1.4" strokeDasharray="3 2" fill="none" />
          </svg>
        </div>
      </Panel>
    </div>

    <Panel title="EXEC-DV-318 · Active incident" sub="J. Brennan (CISO) · TLV · device" >
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 12 }}>
        <dl className="kv">
          <dt>SUBJECT</dt><dd>J. Brennan, CISO</dd>
          <dt>LOCATION</dt><dd>Tel Aviv (TLV)</dd>
          <dt>RISK TIER</dt><dd>Tier-1 (geopolitical)</dd>
          <dt>DEVICE</dt><dd>LOANER #A131 (eFuse-locked)</dd>
        </dl>
        <dl className="kv">
          <dt>DETECTION</dt><dd>14:08:11 · Unusual cellular hand-off + cert pinning failure</dd>
          <dt>SUSPECTED</dt><dd>SSL interception · hostile-network MITM</dd>
          <dt>MITIGATION</dt><dd>Auto-revoked sessions, MFA forced, traffic locked to VPN</dd>
          <dt>STATUS</dt><dd style={{color:'var(--sev-critical)'}}>● Monitoring</dd>
        </dl>
        <div>
          <div className="dim mono uppr" style={{marginBottom:6,fontSize:9.5}}>Response actions</div>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            <Btn size="xs">REVOKE SESSIONS</Btn>
            <Btn size="xs">ISSUE STEP-UP MFA</Btn>
            <Btn size="xs">LOCK DEVICE REMOTELY</Btn>
            <Btn size="xs" variant="danger">RECALL EXEC</Btn>
          </div>
        </div>
      </div>
    </Panel>
  </div>
);

/* ===== Executive Overview ===== */
const ExecScreen = () => (
  <div className="screen" data-screen-label="Executive Overview">
    <div className="screen__header">
      <div><h1 className="screen__title">Executive Risk Overview</h1><div className="screen__subtitle">Enterprise cyber posture · trends · business-impact framing</div></div>
      <div className="screen__toolbar"><Btn size="xs">EXPORT BRIEF</Btn><Btn size="xs">SCHEDULE</Btn><Btn size="xs" variant="primary">PRESENT MODE</Btn></div>
    </div>

    <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 10 }}>
      <KPI label="Enterprise risk posture" value="ELEVATED" footer="3 P1 incidents · 1 active campaign" accent="crit" />
      <KPI label="Operational readiness" value="92%" delta="+1" deltaDir="up" footer="green band · 89-100" />
      <KPI label="Regulatory exposure" value="LOW" footer="0 open findings · audit in 14d" />
      <KPI label="Quarterly loss avoided" value="$84M" delta="+12%" deltaDir="up" footer="vs $4.2M actual loss" />
    </div>

    <div className="row" style={{ gridTemplateColumns: '1.2fr 1fr', marginBottom: 10 }}>
      <Panel title="Risk posture · 90 days" sub="composite score · daily">
        <svg viewBox="0 0 800 180" width="100%" height="180">
          {[40,80,120].map(y => <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="var(--hairline)" />)}
          <path d="M 0 100 L 80 92 L 160 88 L 240 96 L 320 110 L 400 124 L 480 118 L 560 102 L 640 88 L 720 76 L 800 68" stroke="var(--color-ink)" strokeWidth="1.6" fill="none" />
          <path d="M 0 110 L 80 108 L 160 100 L 240 96 L 320 104 L 400 118 L 480 134 L 560 142 L 640 138 L 720 128 L 800 112" stroke="var(--sev-critical)" strokeWidth="1.4" fill="none" strokeDasharray="4 2" />
          {/* incident markers */}
          {[[320, 'CMP-2829'], [480, 'CMP-2832'], [640, 'CMP-2841']].map(([x,label],i) => (
            <g key={i}>
              <line x1={x} y1="0" x2={x} y2="160" stroke="var(--sev-critical)" strokeDasharray="2 3" opacity="0.5" />
              <text x={Number(x)+4} y="14" fontSize="9" fontFamily="var(--mono)" fill="var(--sev-critical)">{label}</text>
            </g>
          ))}
        </svg>
        <div style={{ display:'flex', gap:16, marginTop:8, fontFamily:'var(--mono)', fontSize:10, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>
          <span><span style={{width:14,height:2,background:'var(--color-ink)',display:'inline-block',marginRight:6,verticalAlign:'middle'}}></span>Composite score</span>
          <span><span style={{width:14,height:1.5,background:'var(--sev-critical)',display:'inline-block',marginRight:6,verticalAlign:'middle'}}></span>Threat pressure index</span>
        </div>
      </Panel>

      <Panel title="Business impact · 90 days" sub="$USD">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div><div className="dim mono uppr" style={{fontSize:9.5}}>Loss avoided</div><div style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:600,color:'var(--sev-resolved)'}}>$84.2M</div></div>
          <div><div className="dim mono uppr" style={{fontSize:9.5}}>Actual loss</div><div style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:600,color:'var(--sev-critical)'}}>$4.2M</div></div>
        </div>
        <BarRow label="Fraud prevention" value={62} max={100} severity="low" suffix="M" />
        <BarRow label="Compromise prev." value={14} max={100} severity="low" suffix="M" />
        <BarRow label="DLP block value" value={8} max={100} severity="low" suffix="M" />
        <BarRow label="Operational dwn." value={2} max={100} severity="crit" suffix="M" />
        <div className="dim mono uppr" style={{marginTop:10,fontSize:9.5}}>Auditor confidence index</div>
        <BarRow label="Coverage" value={94} max={100} severity="low" suffix="%" />
        <BarRow label="Evidence quality" value={88} max={100} severity="low" suffix="%" />
      </Panel>
    </div>

    <div className="row" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 0 }}>
      <Panel title="Top risks · ranked">
        <table className="tbl" style={{fontSize:11.5}}>
          <thead><tr><th>Risk</th><th>Trend</th><th className="num" style={{width:48}}>Score</th></tr></thead>
          <tbody>
            <tr><td><span className="ink">Targeted intrusion · APT-441</span></td><td><Spark data={[2,3,4,3,5,6,8]} width={60} height={16} /></td><td className="num" style={{color:'var(--sev-critical)',fontWeight:600}}>94</td></tr>
            <tr><td><span className="ink">Insider exfiltration · Treasury</span></td><td><Spark data={[3,3,4,5,5,7,8]} width={60} height={16} /></td><td className="num" style={{color:'var(--sev-critical)',fontWeight:600}}>91</td></tr>
            <tr><td><span className="ink">Wire fraud · EMEA corridor</span></td><td><Spark data={[5,6,5,7,6,8,9]} width={60} height={16} /></td><td className="num" style={{color:'var(--sev-high)',fontWeight:600}}>86</td></tr>
            <tr><td><span className="ink">KEV vulns · public-facing</span></td><td><Spark data={[8,7,6,7,6,5,5]} width={60} height={16} /></td><td className="num" style={{color:'var(--sev-high)',fontWeight:600}}>78</td></tr>
            <tr><td><span className="ink">GenAI data exposure</span></td><td><Spark data={[1,2,3,5,6,7,9]} width={60} height={16} /></td><td className="num" style={{color:'var(--sev-medium)',fontWeight:600}}>71</td></tr>
            <tr><td><span className="ink">3rd-party supply chain</span></td><td><Spark data={[4,4,5,4,4,5,5]} width={60} height={16} /></td><td className="num">62</td></tr>
          </tbody>
        </table>
      </Panel>

      <Panel title="Regulatory & framework readiness">
        <BarRow label="NIST CSF 2.0" value={92} max={100} severity="low" suffix="%" />
        <BarRow label="ISO 27001" value={96} max={100} severity="low" suffix="%" />
        <BarRow label="PCI-DSS 4.0" value={88} max={100} severity="low" suffix="%" />
        <BarRow label="DORA (EU)" value={84} max={100} severity="low" suffix="%" />
        <BarRow label="NYDFS Part 500" value={94} max={100} severity="low" suffix="%" />
        <BarRow label="SOX ITGC" value={91} max={100} severity="low" suffix="%" />
        <BarRow label="CMMC L3" value={72} max={100} severity="med" suffix="%" />
      </Panel>

      <Panel title="Board headline · ready-to-brief">
        <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:500, lineHeight:1.35, color:'var(--color-ink)', marginBottom:10, letterSpacing:'-0.01em' }}>
          One active targeted campaign contained within 11 minutes. Quarter-to-date loss prevention up <span style={{color:'var(--sev-resolved)'}}>+12%</span>; actual loss tracking <span style={{color:'var(--sev-resolved)'}}>−18%</span> against plan.
        </div>
        <div className="dim mono uppr" style={{fontSize:9.5, marginBottom:6}}>Key callouts</div>
        <ul style={{ paddingLeft:14, margin:0, fontSize:12, lineHeight:1.5 }}>
          <li>APT-441 (Nostromo) targeted intrusion contained · 7 prod assets · zero customer data confirmed lost</li>
          <li>Insider matter under joint review with Legal · case INC-9978</li>
          <li>CMMC L3 readiness gap: 6 controls outstanding · ETA 4 wks</li>
          <li>Talent: 2 T1 analysts running &gt;90% utilization · headcount request pending</li>
        </ul>
      </Panel>
    </div>
  </div>
);

Object.assign(window, { DLPScreen, IntelScreen, VulnScreen, InsiderScreen, TravelScreen, ExecScreen });
