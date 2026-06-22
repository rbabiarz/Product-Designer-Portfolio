/* shared.jsx — atoms, mock data, helpers shared across screens */

const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3, resolved: 4, info: 5 };

const Sev = ({ level, children }) => (
  <span className={`sev sev--${level}`}><span className="sq"></span>{children || level.toUpperCase()}</span>
);

const Tag = ({ children, onClick }) => (
  <span className="tag" onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>{children}</span>
);

const Btn = ({ children, variant, size, active, onClick, ...rest }) => {
  const cls = ['btn'];
  if (variant) cls.push(`btn--${variant}`);
  if (size) cls.push(`btn--${size}`);
  if (active) cls.push('btn--active');
  return <button className={cls.join(' ')} onClick={onClick} {...rest}>{children}</button>;
};

const Panel = ({ title, sub, toolbar, children, flush, style, className }) => (
  <div className={`panel ${className || ''}`} style={style}>
    {title && (
      <div className="panel__head">
        <span className="panel__title">{title}</span>
        {sub && <span className="panel__sub">{sub}</span>}
        {toolbar && <span className="panel__toolbar">{toolbar}</span>}
      </div>
    )}
    <div className={`panel__body ${flush ? 'panel__body--flush' : ''}`}>{children}</div>
  </div>
);

const KPI = ({ label, value, delta, deltaDir, footer, accent }) => (
  <div className={`kpi ${accent ? `kpi--${accent}` : ''}`}>
    <div className="kpi__label">{label}</div>
    <div className="kpi__value">
      {value}
      {delta && <span className={`kpi__delta ${deltaDir || 'flat'}`}>{deltaDir === 'up' ? '▲' : deltaDir === 'down' ? '▼' : '—'} {delta}</span>}
    </div>
    {footer && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--color-muted-soft)' }}>{footer}</div>}
  </div>
);

/* Sparkline svg */
const Spark = ({ data, width = 80, height = 22, color, fill }) => {
  if (!data || !data.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const points = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 2) - 1]);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const dFill = `${d} L${width},${height} L0,${height} Z`;
  const stroke = color || 'var(--color-ink)';
  return (
    <svg className="spark" width={width} height={height}>
      {fill && <path d={dFill} fill={fill} opacity="0.18" />}
      <path d={d} stroke={stroke} strokeWidth="1.2" fill="none" />
    </svg>
  );
};

/* Bar row */
const BarRow = ({ label, value, max, severity, suffix }) => {
  const pct = Math.min(100, Math.max(2, (value / max) * 100));
  return (
    <div className="bar-row">
      <div className="bar-row__label" title={label}>{label}</div>
      <div className="bar-row__track">
        <div className={`bar-row__fill ${severity || ''}`} style={{ width: `${pct}%` }}></div>
      </div>
      <div className="bar-row__num">{value}{suffix || ''}</div>
    </div>
  );
};

/* ========================================
   MOCK DATA
   ======================================== */

const ASSETS = [
  { id: 'CTI-PRD-DB-01', kind: 'database', sev: 'critical', x: 26, y: 38, label: 'PROD-DB-01' },
  { id: 'CTI-PRD-DB-02', kind: 'database', sev: 'high', x: 26, y: 64, label: 'PROD-DB-02' },
  { id: 'CTI-APP-77', kind: 'host', sev: 'critical', x: 50, y: 30, label: 'APP-77' },
  { id: 'CTI-WS-441', kind: 'workstation', sev: 'high', x: 50, y: 56, label: 'WS-441' },
  { id: 'CTI-EDGE-LB', kind: 'edge', sev: 'medium', x: 75, y: 24, label: 'EDGE-LB-A' },
  { id: 'CTI-DC-01', kind: 'controller', sev: 'critical', x: 75, y: 72, label: 'DC-01' },
  { id: 'CTI-OBJ-S3', kind: 'storage', sev: 'high', x: 90, y: 46, label: 'OBJ-STORE' },
  { id: 'CTI-VPN-GW', kind: 'gateway', sev: 'resolved', x: 12, y: 18, label: 'VPN-GW' },
  { id: 'CTI-IDP', kind: 'identity', sev: 'resolved', x: 12, y: 84, label: 'IDP-RING' },
];

const EDGES = [
  { from: 'CTI-VPN-GW', to: 'CTI-WS-441', kind: 'high' },
  { from: 'CTI-WS-441', to: 'CTI-APP-77', kind: 'crit' },
  { from: 'CTI-APP-77', to: 'CTI-PRD-DB-01', kind: 'crit' },
  { from: 'CTI-APP-77', to: 'CTI-PRD-DB-02', kind: 'high' },
  { from: 'CTI-APP-77', to: 'CTI-DC-01', kind: 'lateral' },
  { from: 'CTI-DC-01', to: 'CTI-OBJ-S3', kind: 'crit' },
  { from: 'CTI-EDGE-LB', to: 'CTI-APP-77', kind: 'med' },
  { from: 'CTI-IDP', to: 'CTI-DC-01', kind: 'lateral' },
];

const KILL_CHAIN_STAGES = [
  { idx: 1, name: 'Reconnaissance', short: 'RECON', count: 142, hot: 0, sig: 8, conf: 0.42 },
  { idx: 2, name: 'Weaponization', short: 'WEAPON', count: 23, hot: 0, sig: 2, conf: 0.61 },
  { idx: 3, name: 'Delivery', short: 'DELIVER', count: 87, hot: 1, sig: 12, conf: 0.74 },
  { idx: 4, name: 'Exploitation', short: 'EXPLOIT', count: 14, hot: 2, sig: 4, conf: 0.88 },
  { idx: 5, name: 'Installation', short: 'INSTALL', count: 6, hot: 2, sig: 3, conf: 0.91 },
  { idx: 6, name: 'C2', short: 'C2', count: 3, hot: 1, sig: 2, conf: 0.93 },
  { idx: 7, name: 'Actions on Objectives', short: 'ACTIONS', count: 2, hot: 1, sig: 1, conf: 0.96 },
];

const MITRE_TACTICS = [
  { col: 'Initial Access', cells: [
    { id: 'T1566', name: 'Phishing', count: 14, hit: true, crit: true },
    { id: 'T1190', name: 'Public-Facing App', count: 6, hit: true },
    { id: 'T1078', name: 'Valid Accounts', count: 3, hit: true },
    { id: 'T1133', name: 'External Remote', count: 0 },
    { id: 'T1200', name: 'Hardware Add.', count: 0 },
  ]},
  { col: 'Execution', cells: [
    { id: 'T1059', name: 'Cmd & Script', count: 22, hit: true, crit: true },
    { id: 'T1204', name: 'User Execution', count: 8, hit: true },
    { id: 'T1053', name: 'Scheduled Task', count: 2, hit: true },
    { id: 'T1129', name: 'Shared Modules', count: 0 },
  ]},
  { col: 'Persistence', cells: [
    { id: 'T1547', name: 'Boot/Logon Auto', count: 4, hit: true },
    { id: 'T1098', name: 'Account Manip.', count: 2, hit: true },
    { id: 'T1136', name: 'Create Account', count: 1, hit: true },
    { id: 'T1505', name: 'Server Component', count: 0 },
  ]},
  { col: 'Priv. Escalation', cells: [
    { id: 'T1548', name: 'Abuse Elevation', count: 3, hit: true, crit: true },
    { id: 'T1068', name: 'Exploit Priv. Esc', count: 1, hit: true, crit: true },
    { id: 'T1055', name: 'Process Injection', count: 0 },
  ]},
  { col: 'Defense Evasion', cells: [
    { id: 'T1027', name: 'Obfuscated Files', count: 11, hit: true },
    { id: 'T1070', name: 'Indicator Removal', count: 4, hit: true },
    { id: 'T1036', name: 'Masquerading', count: 2, hit: true },
    { id: 'T1140', name: 'Deobfuscate', count: 0 },
  ]},
  { col: 'Lateral Mvmt.', cells: [
    { id: 'T1021', name: 'Remote Services', count: 7, hit: true, crit: true },
    { id: 'T1550', name: 'Alt. Auth.', count: 2, hit: true },
    { id: 'T1534', name: 'Internal Spear', count: 0 },
  ]},
  { col: 'Exfiltration', cells: [
    { id: 'T1041', name: 'C2 Channel Exfil', count: 2, hit: true, crit: true },
    { id: 'T1567', name: 'Web Service Exfil', count: 1, hit: true },
    { id: 'T1029', name: 'Scheduled Xfer', count: 0 },
  ]},
];

const CAMPAIGNS = [
  { id: 'CMP-2841', name: 'Operation TIDEWAVE', actor: 'APT-441 (Nostromo)', stage: 6, sev: 'critical', confidence: 0.93, assets: 7, mttd: '00:04:12', started: '2026-05-25T18:42Z', tactic: 'TA0011', desc: 'Credential harvesting → DC lateral → S3 staging' },
  { id: 'CMP-2839', name: 'Operation RUSTFALL', actor: 'FIN-209 (Khepri)', stage: 5, sev: 'high', confidence: 0.81, assets: 3, mttd: '00:11:55', started: '2026-05-26T03:21Z', tactic: 'TA0010', desc: 'Office macro chain targeting Treasury workstations' },
  { id: 'CMP-2836', name: 'Operation PALEHORSE', actor: 'Unattributed', stage: 4, sev: 'high', confidence: 0.68, assets: 2, mttd: '00:24:08', started: '2026-05-26T06:14Z', tactic: 'TA0008', desc: 'Anomalous RDP from Tier-0 admin account' },
  { id: 'CMP-2832', name: 'Operation IRONBLOOM', actor: 'eCrime cluster', stage: 3, sev: 'medium', confidence: 0.55, assets: 12, mttd: '01:02:44', started: '2026-05-25T22:08Z', tactic: 'TA0001', desc: 'Phishing wave targeting Wholesale Banking ops' },
  { id: 'CMP-2829', name: 'Operation HEARTSTONE', actor: 'APT-209 (Vanta)', stage: 2, sev: 'medium', confidence: 0.47, assets: 0, mttd: '02:14:01', started: '2026-05-25T12:34Z', tactic: 'TA0042', desc: 'External recon: subdomain enumeration + cert mining' },
  { id: 'CMP-2825', name: 'Operation CLEARWATER', actor: 'Insider (suspected)', stage: 5, sev: 'critical', confidence: 0.74, assets: 1, mttd: '04:08:20', started: '2026-05-24T15:11Z', tactic: 'TA0010', desc: 'Privileged user — atypical data access patterns' },
  { id: 'CMP-2822', name: 'Operation SILVERMOTH', actor: 'FIN-318', stage: 3, sev: 'low', confidence: 0.33, assets: 0, mttd: '—', started: '2026-05-23T19:00Z', tactic: 'TA0001', desc: 'Failed credential stuffing — IPs blocked at edge' },
];

const ALERTS = [
  { id: 'ALT-78441', t: '14:42:08', src: 'EDR/Carbon Black', host: 'APP-77.cti.prod', rule: 'Suspicious LSASS access — credential dump pattern', sev: 'critical', stage: 5, conf: 92, status: 'open', assigned: 'M. Okafor', campaign: 'CMP-2841' },
  { id: 'ALT-78440', t: '14:41:52', src: 'NDR/Vectra', host: 'DC-01.cti.prod', rule: 'DCSync detected from non-DC origin', sev: 'critical', stage: 6, conf: 89, status: 'triage', assigned: 'M. Okafor', campaign: 'CMP-2841' },
  { id: 'ALT-78438', t: '14:39:18', src: 'CASB/Netskope', host: 'OBJ-STORE.cti', rule: 'Anomalous egress — 2.3GB to unsanctioned domain', sev: 'critical', stage: 7, conf: 94, status: 'open', assigned: '—', campaign: 'CMP-2841' },
  { id: 'ALT-78436', t: '14:38:04', src: 'IDP/Okta', host: 'idp.cti.corp', rule: 'Impossible travel — Lagos → Bucharest in 4m', sev: 'high', stage: 1, conf: 87, status: 'triage', assigned: 'S. Lin', campaign: 'CMP-2839' },
  { id: 'ALT-78433', t: '14:36:12', src: 'EDR/Carbon Black', host: 'WS-441.cti.corp', rule: 'Process injection (T1055) — winword.exe → cmd.exe', sev: 'high', stage: 2, conf: 78, status: 'triage', assigned: 'S. Lin', campaign: 'CMP-2839' },
  { id: 'ALT-78431', t: '14:35:47', src: 'Email/Proofpoint', host: '—', rule: 'Phishing kit signature — Office 365 lookalike', sev: 'high', stage: 3, conf: 81, status: 'auto-contained', assigned: 'AUTO', campaign: 'CMP-2836' },
  { id: 'ALT-78428', t: '14:34:30', src: 'NDR/Vectra', host: 'WS-441.cti.corp', rule: 'C2 beacon — 60s heartbeat, encrypted', sev: 'high', stage: 6, conf: 84, status: 'triage', assigned: 'S. Lin', campaign: 'CMP-2839' },
  { id: 'ALT-78424', t: '14:32:11', src: 'EDR/Carbon Black', host: 'PROD-DB-01.cti', rule: 'Unusual sqlcmd usage outside maintenance window', sev: 'medium', stage: 7, conf: 64, status: 'open', assigned: '—', campaign: '—' },
  { id: 'ALT-78422', t: '14:30:08', src: 'SIEM/Splunk', host: 'EDGE-LB-A', rule: 'High volume 4xx — possible enumeration', sev: 'medium', stage: 1, conf: 58, status: 'triage', assigned: 'R. Patel', campaign: 'CMP-2829' },
  { id: 'ALT-78420', t: '14:28:55', src: 'DLP/Forcepoint', host: 'WS-118.cti.corp', rule: 'PII batch (412 SSN) to personal Gmail', sev: 'high', stage: 7, conf: 91, status: 'triage', assigned: 'D. Vance', campaign: 'CMP-2825' },
  { id: 'ALT-78418', t: '14:27:31', src: 'CASB/Netskope', host: 'WS-118.cti.corp', rule: 'OAuth grant to unverified app', sev: 'medium', stage: 4, conf: 71, status: 'open', assigned: '—', campaign: '—' },
  { id: 'ALT-78414', t: '14:24:09', src: 'Fraud/Acme', host: 'pay-svc.fin', rule: 'Wire — $4.2M velocity anomaly, EMEA corridor', sev: 'high', stage: 7, conf: 76, status: 'triage', assigned: 'L. Mendez', campaign: '—' },
  { id: 'ALT-78410', t: '14:21:44', src: 'Vuln/Tenable', host: 'EDGE-LB-A', rule: 'CVE-2026-28114 — KEV, exploit POC public', sev: 'critical', stage: 2, conf: 99, status: 'open', assigned: '—', campaign: '—' },
];

const PERSONS = ['M. Okafor (T2)', 'S. Lin (T2)', 'R. Patel (T1)', 'D. Vance (T3)', 'L. Mendez (Fraud)', 'A. Wu (T1)', 'K. Brennan (IR)', 'J. Reyes (T1)'];
const QUEUE = [
  { who: 'M. Okafor (T2)', open: 9, crit: 3, sla: 92, util: 88 },
  { who: 'S. Lin (T2)',    open: 7, crit: 2, sla: 96, util: 71 },
  { who: 'R. Patel (T1)',  open: 14, crit: 0, sla: 78, util: 94 },
  { who: 'D. Vance (T3)',  open: 4, crit: 1, sla: 100, util: 58 },
  { who: 'L. Mendez (Fraud)', open: 6, crit: 1, sla: 89, util: 76 },
  { who: 'A. Wu (T1)',     open: 11, crit: 0, sla: 84, util: 82 },
  { who: 'K. Brennan (IR)', open: 3, crit: 2, sla: 100, util: 64 },
  { who: 'J. Reyes (T1)',  open: 8, crit: 0, sla: 81, util: 79 },
];

const TIMELINE = [
  { t: '14:42:08', sev: 'crit', title: 'LSASS credential access on APP-77',          sub: 'EDR rule R-CB-0144 · MITRE T1003 · auto-contained at 14:42:24' },
  { t: '14:41:52', sev: 'crit', title: 'DCSync from non-DC origin (DC-01)',          sub: 'NDR/Vectra · attributed to CMP-2841 · K. Brennan paged' },
  { t: '14:39:18', sev: 'crit', title: '2.3GB anomalous egress · OBJ-STORE',         sub: 'CASB blocked at 14:39:42 — 312MB acknowledged loss' },
  { t: '14:38:04', sev: 'high', title: 'Impossible travel · 12 identities flagged', sub: 'Step-up MFA enforced via Okta policy ALT-CTOC-IM-08' },
  { t: '14:36:12', sev: 'high', title: 'Process injection on WS-441',                sub: 'winword.exe → cmd.exe → rundll32.exe chain' },
  { t: '14:35:47', sev: 'med',  title: 'Phishing wave — 142 messages held',          sub: 'Proofpoint signature match · auto-quarantine engaged' },
  { t: '14:32:11', sev: 'med',  title: 'sqlcmd outside maintenance · PROD-DB-01',    sub: 'Awaiting analyst review' },
  { t: '14:24:09', sev: 'high', title: 'Wire velocity anomaly · EMEA corridor',      sub: '$4.2M aggregate · 11 transactions held by fraud ops' },
  { t: '14:21:44', sev: 'crit', title: 'CVE-2026-28114 added to KEV',                sub: 'Edge appliance — exposure window 6h 14m' },
  { t: '14:18:02', sev: 'ok',   title: 'Playbook PB-INC-44 completed',               sub: 'CMP-2836 contained — 8 actions, 0 manual interventions' },
];

const INCIDENTS = [
  { id: 'INC-9981', title: 'Suspected APT-441 intrusion · TIDEWAVE', sev: 'critical', stage: 6, lead: 'K. Brennan (IR)', sla: '01:18 remain', status: 'Containing', opened: '18:42Z', assets: 7 },
  { id: 'INC-9978', title: 'Insider data exfil · Treasury · CLEARWATER', sev: 'critical', stage: 7, lead: 'D. Vance (T3)', sla: '04:02 remain', status: 'Investigating', opened: 'D-2', assets: 1 },
  { id: 'INC-9976', title: 'Phishing → macro chain · RUSTFALL', sev: 'high', stage: 5, lead: 'S. Lin (T2)', sla: '02:14 remain', status: 'Investigating', opened: '03:21Z', assets: 3 },
  { id: 'INC-9973', title: 'CVE-2026-28114 emergency patch', sev: 'high', stage: 2, lead: 'Vuln ops', sla: '05:48 remain', status: 'Remediating', opened: '11:09Z', assets: 14 },
  { id: 'INC-9970', title: 'Wire anomaly · EMEA · ledger-7811', sev: 'high', stage: 7, lead: 'L. Mendez (Fraud)', sla: 'BREACHED 00:24', status: 'Investigating', opened: 'D-1', assets: 0 },
  { id: 'INC-9968', title: 'Unsanctioned OAuth grant · marketing', sev: 'medium', stage: 4, lead: 'R. Patel (T1)', sla: '06:11 remain', status: 'Triaging', opened: 'D-1', assets: 1 },
];

const FEED_SOURCES = ['EDR/Carbon Black', 'NDR/Vectra', 'IDP/Okta', 'CASB/Netskope', 'SIEM/Splunk', 'Email/Proofpoint', 'DLP/Forcepoint', 'Fraud/Acme', 'Vuln/Tenable'];

/* expose */
Object.assign(window, {
  Sev, Tag, Btn, Panel, KPI, Spark, BarRow,
  ASSETS, EDGES, KILL_CHAIN_STAGES, MITRE_TACTICS,
  CAMPAIGNS, ALERTS, PERSONS, QUEUE, TIMELINE, INCIDENTS, FEED_SOURCES,
});
