/* aegis-gims-proto.js — native port of the AEGIS GIMS v1.0-RC interactive prototype.

   The original v1 prototype was a React app mounted inside the standalone
   case-study site; the portfolio previously embedded it through an iframe.
   This module re-implements it as a dependency-free widget so the case study
   carries the prototype itself: draw a zone (rect / circle / triangle) and
   reshape it by its handles, or define it by coordinate; toggle
   EVERYTHING ↔ SIGNAL; press play and watch the column enter; click any
   track for its assessment. Data, palette, geometry, and copy are lifted
   from the v1 build so behaviour matches the original.

   Mounts into #gims-proto1-root. No server, no build step, no dependencies. */
(function () {
  'use strict';
  var root = document.getElementById('gims-proto1-root');
  if (!root || root.dataset.built) return;
  root.dataset.built = '1';

  var reduceMotion = false;
  try { reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ── palette + geometry (verbatim from the v1 build) ── */
  var C = {
    frame: '#0b1310', map: '#0c1714', panel: '#101e1a', panel2: '#0d1916',
    line: 'rgba(140,180,160,.16)', line2: 'rgba(140,180,160,.28)',
    text: '#cfe0d6', strong: '#eaf2ec', dim: '#6f8278', faint: '#3f5249',
    aff: { friendly: '#3b82f6', hostile: '#e64d3c', unknown: '#d4a036', sensor: '#8b6fd9' },
    nai: '#ff9d66', accent: '#4ca88f'
  };
  var GEO = { latTop: 55.2, latBot: 54.4, lngL: -67.1, lngR: -65.4 };
  var W = 640, H = 480;
  var MSR = [[20, 140], [120, 178], [230, 218], [345, 262], [430, 305], [515, 342], [632, 378]];

  var TRACKS = [
    { id: 'h7', name: 'BTR COLUMN · TRACK HOSTILE-7', short: 'HOSTILE-7', aff: 'hostile', domain: 'ground', speed: '38 km/h', cls: 'SECRET', threat: 88,
      path: [[20, 140], [120, 178], [230, 218], [345, 262], [430, 305], [515, 342], [605, 372]],
      report: 'Six-vehicle column, EO/SIGINT correlated. Matches enemy BTG forward security element. Heading 071°, closing CP-7.',
      rec: 'Confirm ID via RAVEN-2 EO. NAI entry = SEV-1, report to higher (CJOC) now.' },
    { id: 'civ', name: 'CIVILIAN CONVOY · LM-3', short: 'CIV LM-3', aff: 'unknown', domain: 'ground', speed: '52 km/h', cls: 'PROT-B', threat: 34,
      path: [[80, 170], [190, 205], [300, 245], [410, 290], [500, 335], [590, 365], [632, 380]],
      report: 'Mixed civilian vehicles on Route Crimson. No weapons signature. Pattern-of-life consistent with market-day traffic.',
      rec: 'Hold. Classify NEUTRAL pending dwell check. Suppress from hostile alert feed.' },
    { id: 'tfd', name: 'TF-DELTA PATROL', short: 'TF-DELTA', aff: 'friendly', domain: 'ground', speed: '40 km/h', cls: 'SECRET', threat: 0,
      path: [[60, 360], [180, 378], [300, 388], [430, 394], [560, 390]],
      report: 'Friendly mounted patrol, call-sign DELTA. On planned route, comms green.',
      rec: 'No action. Friendly, excluded from hostile alert rule.' },
    { id: 'ah', name: 'm/v ATLANTIC HERON', short: 'ATL HERON', aff: 'unknown', domain: 'sea', speed: '14 kts', cls: 'SECRET', threat: 60,
      path: [[560, 72], [590, 100], [616, 128]],
      report: 'AIS gap 0412Z–0748Z. Declared route diverging from track.',
      rec: 'Cue maritime patrol if it enters the exclusion zone.' },
    { id: 'marg', name: 'HMCS MARGAREE', short: 'HMCS MARG', aff: 'friendly', domain: 'sea', speed: '18 kts', cls: 'SECRET', threat: 0,
      path: [[520, 60], [548, 84]],
      report: 'Friendly frigate on station, approaches.', rec: 'No action.' },
    { id: 'cp140', name: 'RCAF CP-140 AURORA', short: 'CP-140', aff: 'friendly', domain: 'air', speed: '320 kts', cls: 'SECRET', threat: 0,
      path: [[40, 60], [200, 42], [380, 54], [540, 80]],
      report: 'ISR sortie, wide-area maritime sweep.', rec: 'No action.' },
    { id: 'raven', name: 'ISR DRONE RAVEN-2', short: 'RAVEN-2', aff: 'friendly', domain: 'air', speed: '70 kts', cls: 'SECRET', threat: 0,
      path: [[470, 200], [505, 182], [520, 212], [492, 238], [460, 222], [470, 200]],
      report: 'Overwatch orbit above the NAI. EO/IR available to cue.', rec: 'Available for visual ID tasking.' },
    { id: 'uav', name: 'UAV TRACK 08821', short: 'UAV 08821', aff: 'unknown', domain: 'air', speed: '90 kts', cls: 'SECRET', threat: 55,
      path: [[610, 120], [565, 150], [522, 172]],
      report: 'Unidentified small UAS. No IFF response.', rec: 'Monitor; correlate with hostile ground movement.' },
    { id: 'irbis', name: 'EX-IRBIS-04', short: 'IRBIS-04', aff: 'hostile', domain: 'air', speed: '410 kts', cls: 'SECRET', threat: 70,
      path: [[120, 28], [260, 34], [400, 30]],
      report: 'Hostile fast-air transiting north of the AO.', rec: 'Tracked by air-defence cell, outside this NAI.' },
    { id: 'gbr', name: 'GBR-RADAR-07', short: 'GBR-07', aff: 'sensor', domain: 'sensor', speed: '—', cls: 'SECRET', threat: 0,
      path: [[612, 232]], report: 'Ground-based radar, sector NE.', rec: '—' },
    { id: 'ais', name: 'COASTAL-AIS-12', short: 'AIS-12', aff: 'sensor', domain: 'sensor', speed: '—', cls: 'PROT-B', threat: 0,
      path: [[602, 120]], report: 'Coastal AIS receiver.', rec: '—' }
  ];

  var AMBIENT = [
    { id: 'adz', shape: 'rect', x: 60, y: 16, w: 330, h: 64, name: 'AIR DEFENCE — NORTH', color: '#d63b75', alert: false },
    { id: 'mez', shape: 'rect', x: 452, y: 14, w: 178, h: 96, name: 'MARITIME EXCLUSION', color: '#e64d3c', alert: false },
    { id: 'svz', shape: 'circle', cx: 150, cy: 420, r: 58, name: 'SURVEILLANCE — SECTOR SW', color: '#8b6fd9', alert: false }
  ];

  /* ── state ── */
  var S = {
    t: 0, playing: false, speed: 1,
    tool: 'map',                 // map | rect | circle | tri
    tab: 'assets',               // assets | zones | alerts
    view: 'all',                 // all | signal
    nai: null,                   // operator zone: {shape:'rect',x,y,w,h} | {shape:'circle',cx,cy,r} | {shape:'tri',pts:[[..]x3]}
    selected: null,              // track id
    alerts: [], fired: {},
    coord: { lat: 54.771, lng: -65.958, r: 8 },
    draft: null, drag: null
  };

  /* ── coordinate helpers ── */
  function lngToX(lng) { return (lng - GEO.lngL) / (GEO.lngR - GEO.lngL) * W; }
  function latToY(lat) { return (GEO.latTop - lat) / (GEO.latTop - GEO.latBot) * H; }
  function posAt(tr, t) {
    var p = tr.path;
    if (p.length === 1) return p[0];
    var segs = [], total = 0, i;
    for (i = 0; i < p.length - 1; i++) {
      var d = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]);
      segs.push(d); total += d;
    }
    var dist = t * total, acc = 0;
    for (i = 0; i < segs.length; i++) {
      if (dist <= acc + segs[i]) {
        var f = segs[i] ? (dist - acc) / segs[i] : 0;
        return [p[i][0] + (p[i + 1][0] - p[i][0]) * f, p[i][1] + (p[i + 1][1] - p[i][1]) * f];
      }
      acc += segs[i];
    }
    return p[p.length - 1];
  }
  function inZone(pt, z) {
    if (!z) return false;
    if (z.shape === 'rect') return pt[0] >= z.x && pt[0] <= z.x + z.w && pt[1] >= z.y && pt[1] <= z.y + z.h;
    if (z.shape === 'circle') return Math.hypot(pt[0] - z.cx, pt[1] - z.cy) <= z.r;
    if (z.shape === 'tri') {
      var a = z.pts[0], b = z.pts[1], c = z.pts[2];
      var s1 = (b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]);
      var s2 = (c[0] - b[0]) * (pt[1] - b[1]) - (c[1] - b[1]) * (pt[0] - b[0]);
      var s3 = (a[0] - c[0]) * (pt[1] - c[1]) - (a[1] - c[1]) * (pt[0] - c[0]);
      return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0);
    }
    return false;
  }
  function clock(t) {
    var mins = 8 * 60 + 32 + Math.round(t * 360); // 0832Z → 1432Z
    var hh = Math.floor(mins / 60) % 24, mm = mins % 60;
    return (hh < 10 ? '0' + hh : hh) + '' + (mm < 10 ? '0' + mm : mm) + 'Z';
  }

  /* ── scoped styles ── */
  (function () {
    if (document.getElementById('agp-css')) return;
    var st = document.createElement('style');
    st.id = 'agp-css';
    st.textContent =
      '#gims-proto1-root{font-family:"DM Sans","Inter",sans-serif;color:' + C.text + ';background:' + C.frame + ';user-select:none;-webkit-user-select:none;}' +
      '#gims-proto1-root .agp-mono{font-family:"JetBrains Mono","DM Mono",monospace;}' +
      '#gims-proto1-root button{font:inherit;color:inherit;background:transparent;border:1px solid transparent;border-radius:7px;cursor:pointer;padding:6px 10px;}' +
      '#gims-proto1-root button:focus-visible,#gims-proto1-root input:focus-visible,#gims-proto1-root [tabindex]:focus-visible{outline:2px solid ' + C.accent + ';outline-offset:2px;}' +
      '#gims-proto1-root .agp-tbtn{font-size:11.5px;letter-spacing:.02em;border:1px solid ' + C.line + ';color:' + C.dim + ';}' +
      '#gims-proto1-root .agp-tbtn[aria-pressed="true"]{background:#13332b;border-color:' + C.accent + ';color:' + C.strong + ';}' +
      '#gims-proto1-root .agp-tab{flex:1;font-size:11px;letter-spacing:.06em;padding:9px 4px;border-radius:0;border-bottom:2px solid transparent;color:' + C.dim + ';}' +
      '#gims-proto1-root .agp-tab[aria-selected="true"]{color:' + C.strong + ';border-bottom-color:' + C.accent + ';}' +
      '#gims-proto1-root .agp-asset{display:flex;align-items:center;gap:9px;width:100%;text-align:left;padding:8px 9px;margin-bottom:4px;border-radius:8px;border:1px solid transparent;}' +
      '#gims-proto1-root .agp-asset:hover{background:#13251f;}' +
      '#gims-proto1-root .agp-asset.on{border-color:' + C.line2 + ';background:#13251f;}' +
      '#gims-proto1-root input{background:#0a1512;border:1px solid ' + C.line2 + ';border-radius:7px;color:' + C.strong + ';font-family:"JetBrains Mono",monospace;font-size:11.5px;padding:7px 8px;width:100%;min-width:0;}' +
      '#gims-proto1-root .agp-track{cursor:pointer;}' +
      '#gims-proto1-root .agp-track:hover .agp-lbl{fill:' + C.strong + ';}' +
      '@keyframes agpBlink{0%,100%{opacity:1}50%{opacity:.25}}' +
      '#gims-proto1-root .agp-blink{animation:agpBlink 2s infinite;}' +
      '@media (prefers-reduced-motion:reduce){#gims-proto1-root .agp-blink{animation:none;}}' +
      '#gims-proto1-root .agp-main{display:flex;border-top:1px solid ' + C.line + ';border-bottom:1px solid ' + C.line + ';}' +
      '#gims-proto1-root .agp-left{width:224px;flex:none;background:' + C.panel + ';border-right:1px solid ' + C.line + ';display:flex;flex-direction:column;}' +
      '#gims-proto1-root .agp-right{width:252px;flex:none;background:' + C.panel + ';border-left:1px solid ' + C.line + ';overflow-y:auto;}' +
      '#gims-proto1-root .agp-stage{flex:1;min-width:260px;position:relative;}' +
      '#gims-proto1-root .agp-toast{bottom:12px;}' +
      '#gims-proto1-root .agp-bnav{display:none;position:absolute;left:0;right:0;bottom:0;z-index:7;background:' + C.panel2 + ';border-top:1px solid ' + C.line2 + ';}' +
      '#gims-proto1-root .agp-bbtn{flex:1;background:none;border:none;border-top:2px solid transparent;color:' + C.dim + ';font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.1em;padding:15px 4px 16px;cursor:pointer;}' +
      '#gims-proto1-root .agp-bbtn.on{color:' + C.strong + ';border-top-color:' + C.accent + ';}' +
      '@media (max-width:880px){' +
      '#gims-proto1-root .agp-main{display:block;position:relative;height:clamp(315px,100dvh - 390px,560px);}' +
      '#gims-proto1-root .agp-stage{position:absolute;inset:0;width:100%;min-width:0;}' +
      '#gims-proto1-root .agp-stage svg{width:100%;height:100%;}' +
      '#gims-proto1-root .agp-left,#gims-proto1-root .agp-right{display:none;position:absolute;left:0;right:0;bottom:47px;width:100%;max-height:60%;overflow-y:auto;border:none;border-top:1px solid ' + C.line2 + ';background:' + C.panel + ';z-index:6;}' +
      '#gims-proto1-root .agp-main.agp-show-left .agp-left{display:flex;}' +
      '#gims-proto1-root .agp-main.agp-show-right .agp-right{display:block;}' +
      '#gims-proto1-root .agp-bnav{display:flex;}' +
      '#gims-proto1-root .agp-toast{bottom:59px;}' +
      '}';
    document.head.appendChild(st);
  })();

  /* ── DOM scaffold ── */
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'style') n.style.cssText = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (html != null) n.innerHTML = html;
    return n;
  }
  var mono = 'font-family:\'JetBrains Mono\',monospace;';

  var banner = el('div', { style: 'height:26px;background:#7c1320;color:#ffd9dc;display:flex;align-items:center;justify-content:center;' + mono + 'font-size:11px;letter-spacing:.18em;font-weight:500;', text: 'SECRET // SI // REL FVEY' });

  /* toolbar */
  var toolbar = el('div', { style: 'display:flex;align-items:center;gap:10px;padding:9px 12px;background:' + C.panel2 + ';flex-wrap:wrap;' });
  toolbar.appendChild(el('span', { style: 'display:inline-flex;align-items:center;gap:8px;margin-right:4px;' },
    '<span style="width:26px;height:26px;border-radius:6px;background:#123128;color:#7dd3c0;font-weight:700;font-size:11px;display:inline-flex;align-items:center;justify-content:center;">AE</span>' +
    '<span><span style="font-weight:600;font-size:13.5px;color:' + C.strong + ';">GIMS</span> <span class="agp-mono" style="font-size:9px;color:' + C.faint + ';letter-spacing:.14em;">GEOSPATIAL INTELLIGENCE</span></span>'));
  var drawLbl = el('span', { 'class': 'agp-mono', style: 'font-size:10px;color:' + C.faint + ';letter-spacing:.1em;', text: 'DRAW' });
  toolbar.appendChild(drawLbl);
  var toolBtns = {};
  [['rect', '▭ Rect'], ['circle', '◯ Circle'], ['tri', '△ Triangle']].forEach(function (d) {
    var b = el('button', { 'class': 'agp-tbtn', 'aria-pressed': 'false', text: d[1] });
    b.addEventListener('click', function () { setTool(S.tool === d[0] ? 'map' : d[0]); });
    toolBtns[d[0]] = b; toolbar.appendChild(b);
  });
  var viewWrap = el('div', { style: 'margin-left:auto;display:flex;align-items:center;gap:6px;' });
  viewWrap.appendChild(el('span', { 'class': 'agp-mono', style: 'font-size:10px;color:' + C.faint + ';letter-spacing:.1em;', text: 'VIEW' }));
  var viewBtns = {};
  [['all', 'EVERYTHING'], ['signal', 'SIGNAL']].forEach(function (d) {
    var b = el('button', { 'class': 'agp-tbtn agp-mono', 'aria-pressed': 'false', style: 'font-size:10px;letter-spacing:.08em;', text: d[1] });
    b.addEventListener('click', function () { setView(d[0]); });
    viewBtns[d[0]] = b; viewWrap.appendChild(b);
  });
  toolbar.appendChild(viewWrap);

  /* main row: left panel | map | right panel */
  var main = el('div', { 'class': 'agp-main' });
  var left = el('div', { 'class': 'agp-left' });
  var tabsRow = el('div', { role: 'tablist', 'aria-label': 'Picture panels', style: 'display:flex;border-bottom:1px solid ' + C.line + ';' });
  var tabBtns = {}, tabBodies = {};
  [['assets', 'Assets'], ['zones', 'Zones'], ['alerts', 'Alerts']].forEach(function (d) {
    var b = el('button', { 'class': 'agp-tab agp-mono', role: 'tab', 'aria-selected': 'false', text: d[1] });
    b.addEventListener('click', function () { setTab(d[0]); });
    tabBtns[d[0]] = b; tabsRow.appendChild(b);
  });
  left.appendChild(tabsRow);
  var tabBody = el('div', { style: 'flex:1;overflow-y:auto;padding:9px;min-height:150px;max-height:266px;' });
  left.appendChild(tabBody);

  /* zone-filter block (bottom of left panel) */
  var zf = el('div', { style: 'padding:12px 11px;border-top:1px solid ' + C.line + ';background:' + C.panel2 + ';' });
  zf.appendChild(el('div', { 'class': 'agp-mono', style: 'font-size:10px;letter-spacing:.14em;color:' + C.nai + ';margin-bottom:9px;', text: '◆ CREATE ZONE FILTER' }));
  var drawHint = el('button', { style: 'width:100%;margin-bottom:8px;border:1px dashed ' + C.line2 + ';border-radius:8px;background:transparent;color:' + C.text + ';font-size:12px;padding:9px;text-align:left;', text: '◰  Draw a zone (or pick a shape above)' });
  drawHint.addEventListener('click', function () { setTool('rect'); });
  zf.appendChild(drawHint);
  zf.appendChild(el('div', { 'class': 'agp-mono', style: 'font-size:9.5px;color:' + C.dim + ';margin:2px 0 6px;letter-spacing:.08em;', text: 'OR DEFINE BY COORDINATE' }));
  function coordIn(label, val, aria) {
    var wrap = el('div', { style: 'flex:1;min-width:0;' });
    wrap.appendChild(el('div', { 'class': 'agp-mono', style: 'font-size:8.5px;color:' + C.dim + ';margin-bottom:3px;letter-spacing:.08em;', text: label }));
    var inp = el('input', { type: 'text', inputmode: 'decimal', value: val, 'aria-label': aria });
    wrap.appendChild(inp);
    return { wrap: wrap, inp: inp };
  }
  var latIn = coordIn('LAT', '54.771', 'Zone latitude');
  var lngIn = coordIn('LONG', '-65.958', 'Zone longitude');
  var cRow1 = el('div', { style: 'display:flex;gap:6px;margin-bottom:6px;' });
  cRow1.appendChild(latIn.wrap); cRow1.appendChild(lngIn.wrap);
  zf.appendChild(cRow1);
  var radIn = coordIn('RADIUS km', '8', 'Zone radius in kilometres');
  var applyBtn = el('button', { style: 'flex:none;align-self:flex-end;background:#123128;border:1px solid ' + C.accent + ';color:#9fe8d3;font-size:12px;font-weight:600;padding:8px 14px;', text: 'Apply' });
  var cRow2 = el('div', { style: 'display:flex;gap:6px;align-items:flex-end;' });
  cRow2.appendChild(radIn.wrap); cRow2.appendChild(applyBtn);
  zf.appendChild(cRow2);
  var clearBtn = el('button', { 'class': 'agp-mono', style: 'display:none;width:100%;margin-top:8px;border:1px solid ' + C.line2 + ';color:' + C.dim + ';font-size:10.5px;letter-spacing:.06em;padding:7px;', text: '✕  CLEAR FILTER — NAI CRIMSON' });
  zf.appendChild(clearBtn);
  left.appendChild(zf);
  main.appendChild(left);

  /* map stage */
  var stage = el('div', { 'class': 'agp-stage', style: 'background:' + C.map + ';' });
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', 'Common operating picture map. Tracks are focusable; press Enter on a track for its assessment.');
  svg.style.display = 'block';
  svg.style.touchAction = 'none';
  stage.appendChild(svg);
  main.appendChild(stage);

  /* right panel */
  var right = el('div', { 'class': 'agp-right' });
  main.appendChild(right);

  /* mobile bottom navigation: MAP is the default full-screen view; ASSETS and COP
     open the side panels as bottom sheets over the map (≤700px only — the bar is
     display:none on wider screens) */
  var bnav = el('div', { 'class': 'agp-bnav', role: 'tablist', 'aria-label': 'Prototype panels' });
  function bnavBtn(label, sel) {
    var b = el('button', { 'class': 'agp-bbtn', type: 'button', role: 'tab', 'aria-selected': 'false', text: label });
    b.addEventListener('click', function () {
      main.classList.remove('agp-show-left', 'agp-show-right');
      if (sel) main.classList.add(sel);
      [].forEach.call(bnav.children, function (x) { x.classList.remove('on'); x.setAttribute('aria-selected', 'false'); });
      b.classList.add('on');
      b.setAttribute('aria-selected', 'true');
    });
    bnav.appendChild(b);
    return b;
  }
  bnavBtn('MAP', null).classList.add('on');
  bnav.children[0].setAttribute('aria-selected', 'true');
  bnavBtn('ASSETS', 'agp-show-left');
  bnavBtn('COP', 'agp-show-right');
  main.appendChild(bnav);

  /* timeline + status */
  var tl = el('div', { style: 'display:flex;align-items:center;gap:10px;padding:10px 12px;background:' + C.panel2 + ';flex-wrap:wrap;' });
  var playBtn = el('button', { 'aria-label': 'Play the scenario', style: 'width:34px;height:30px;background:#123128;border:1px solid ' + C.accent + ';color:#9fe8d3;font-size:13px;', text: '▶' });
  var resetBtn = el('button', { 'aria-label': 'Reset the scenario to the start', 'class': 'agp-tbtn', style: 'width:34px;height:30px;font-size:13px;', text: '↺' });
  var runBtn = el('button', { 'class': 'agp-mono', style: 'border:1px solid ' + C.nai + ';color:' + C.nai + ';font-size:10.5px;letter-spacing:.06em;padding:8px 12px;', text: '⚑ Run scenario' });
  tl.appendChild(playBtn); tl.appendChild(resetBtn); tl.appendChild(runBtn);
  var tlTrackWrap = el('div', { style: 'flex:1;min-width:180px;display:flex;flex-direction:column;gap:3px;' });
  var tlLabels = el('div', { 'class': 'agp-mono', style: 'display:flex;justify-content:space-between;font-size:8.5px;color:' + C.faint + ';letter-spacing:.06em;' });
  tlLabels.innerHTML = '<span>T-06:00 · 0832Z</span><span style="color:' + C.dim + '">24 MAY</span><span id="agp-now">NOW · 1432Z</span>';
  var scrub = el('input', { type: 'range', min: '0', max: '1000', value: '0', 'aria-label': 'Scenario timeline', style: 'width:100%;accent-color:' + C.accent + ';background:transparent;border:none;padding:0;height:18px;' });
  tlTrackWrap.appendChild(tlLabels); tlTrackWrap.appendChild(scrub);
  tl.appendChild(tlTrackWrap);
  var speedWrap = el('div', { style: 'display:flex;gap:4px;' });
  var speedBtns = {};
  [1, 2, 5].forEach(function (x) {
    var b = el('button', { 'class': 'agp-tbtn agp-mono', 'aria-pressed': 'false', style: 'font-size:10px;padding:5px 8px;', text: x + '×' });
    b.addEventListener('click', function () { S.speed = x; renderChrome(); });
    speedBtns[x] = b; speedWrap.appendChild(b);
  });
  tl.appendChild(speedWrap);

  var status = el('div', { 'class': 'agp-mono', style: 'display:flex;align-items:center;gap:14px;padding:8px 12px;font-size:9.5px;letter-spacing:.08em;color:' + C.dim + ';border-top:1px solid ' + C.line + ';flex-wrap:wrap;' });
  status.innerHTML =
    '<span style="display:inline-flex;align-items:center;gap:6px;color:' + C.accent + '"><span class="agp-blink" style="width:7px;height:7px;border-radius:50%;background:' + C.accent + ';display:inline-block"></span>LINK ONLINE</span>' +
    '<span>SYNC <b id="agp-sync" style="color:' + C.text + ';font-weight:500">240832Z</b></span>' +
    '<span>OPERATOR <b style="color:' + C.text + ';font-weight:500">M. LÉVESQUE · TS//SI</b></span>' +
    '<span id="agp-counts" style="margin-left:auto;color:' + C.faint + '"></span>';

  /* toast + live region */
  var toast = el('div', { 'class': 'agp-toast', role: 'status', style: 'position:absolute;right:12px;width:min(300px,80%);display:none;background:#1a1110;border:1px solid #e64d3c;border-left:3px solid #e64d3c;border-radius:10px;padding:11px 13px;z-index:5;' });
  stage.appendChild(toast);
  var live = el('div', { 'aria-live': 'polite', style: 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);' });
  root.appendChild(live);

  root.appendChild(banner);
  root.appendChild(toolbar);
  root.appendChild(main);
  root.appendChild(tl);
  root.appendChild(status);

  /* ── SVG static layers ── */
  function sv(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  var gGrid = sv('g', {}), gZones = sv('g', {}), gRoute = sv('g', {}), gNai = sv('g', {}), gTracks = sv('g', {}), gDraft = sv('g', {});
  svg.appendChild(gGrid); svg.appendChild(gZones); svg.appendChild(gRoute); svg.appendChild(gNai); svg.appendChild(gTracks); svg.appendChild(gDraft);

  (function buildGrid() {
    var i;
    for (i = 0; i <= 8; i++) {
      var x = i * W / 8;
      gGrid.appendChild(sv('line', { x1: x, y1: 0, x2: x, y2: H, stroke: 'rgba(140,180,160,.07)', 'stroke-width': 1 }));
      if (i && i < 8) {
        var t = sv('text', { x: x + 3, y: 10, fill: C.faint, 'font-size': 7, 'font-family': 'JetBrains Mono,monospace' });
        t.textContent = (GEO.lngL + (GEO.lngR - GEO.lngL) * i / 8).toFixed(1);
        gGrid.appendChild(t);
      }
    }
    for (i = 0; i <= 6; i++) {
      var y = i * H / 6;
      gGrid.appendChild(sv('line', { x1: 0, y1: y, x2: W, y2: y, stroke: 'rgba(140,180,160,.07)', 'stroke-width': 1 }));
      if (i && i < 6) {
        var t2 = sv('text', { x: 3, y: y - 3, fill: C.faint, 'font-size': 7, 'font-family': 'JetBrains Mono,monospace' });
        t2.textContent = (GEO.latTop - (GEO.latTop - GEO.latBot) * i / 6).toFixed(1);
        gGrid.appendChild(t2);
      }
    }
    var sheet = sv('text', { x: W - 4, y: H - 6, fill: C.faint, 'font-size': 7.5, 'text-anchor': 'end', 'font-family': 'JetBrains Mono,monospace' });
    sheet.textContent = 'WGS84 · UTM 19N · SHEET 1846-IV';
    gGrid.appendChild(sheet);
    /* route */
    var d = 'M' + MSR.map(function (p) { return p[0] + ',' + p[1]; }).join(' L');
    gRoute.appendChild(sv('path', { d: d, fill: 'none', stroke: 'rgba(140,180,160,.35)', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.35 }));
    gRoute.appendChild(sv('path', { d: d, fill: 'none', stroke: 'rgba(180,210,190,.5)', 'stroke-width': 1, 'stroke-dasharray': '6 5' }));
    var rl = sv('text', { x: 235, y: 208, fill: C.dim, 'font-size': 8, 'font-family': 'JetBrains Mono,monospace', transform: 'rotate(19 235 208)' });
    rl.textContent = 'ROUTE CRIMSON · MSR-7';
    gRoute.appendChild(rl);
    /* ambient zones */
    AMBIENT.forEach(function (z) {
      var g = sv('g', { 'data-zone': z.id });
      if (z.shape === 'rect') {
        g.appendChild(sv('rect', { x: z.x, y: z.y, width: z.w, height: z.h, fill: z.color, 'fill-opacity': 0.05, stroke: z.color, 'stroke-opacity': 0.55, 'stroke-width': 1, 'stroke-dasharray': '5 4' }));
        var zt = sv('text', { x: z.x + 5, y: z.y + 11, fill: z.color, 'fill-opacity': 0.8, 'font-size': 7.5, 'font-family': 'JetBrains Mono,monospace' });
        zt.textContent = z.name;
        g.appendChild(zt);
      } else {
        g.appendChild(sv('circle', { cx: z.cx, cy: z.cy, r: z.r, fill: z.color, 'fill-opacity': 0.05, stroke: z.color, 'stroke-opacity': 0.55, 'stroke-width': 1, 'stroke-dasharray': '5 4' }));
        var zt2 = sv('text', { x: z.cx, y: z.cy - z.r - 4, fill: z.color, 'fill-opacity': 0.8, 'font-size': 7.5, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono,monospace' });
        zt2.textContent = z.name;
        g.appendChild(zt2);
      }
      gZones.appendChild(g);
    });
  })();

  /* ── tracks ── */
  var trackEls = {};
  TRACKS.forEach(function (tr) {
    var g = sv('g', { 'class': 'agp-track', role: 'button', tabindex: '0', 'aria-label': tr.name + ', ' + tr.aff + '. Press Enter for assessment.' });
    var col = C.aff[tr.aff];
    var mk;
    if (tr.aff === 'hostile') mk = sv('path', { d: 'M0 -5 L5 0 L0 5 L-5 0 Z', fill: col, stroke: '#1a0906', 'stroke-width': 1 });
    else if (tr.aff === 'unknown') mk = sv('rect', { x: -4, y: -4, width: 8, height: 8, fill: col, stroke: '#171204', 'stroke-width': 1 });
    else if (tr.aff === 'sensor') mk = sv('circle', { r: 4.5, fill: 'none', stroke: col, 'stroke-width': 1.6 });
    else mk = sv('circle', { r: 4.5, fill: col, stroke: '#071120', 'stroke-width': 1 });
    var halo = sv('circle', { r: 9, fill: 'none', stroke: col, 'stroke-width': 1, opacity: 0 });
    var lbl = sv('text', { 'class': 'agp-lbl', x: 8, y: 3, fill: C.dim, 'font-size': 8, 'font-family': 'JetBrains Mono,monospace' });
    lbl.textContent = tr.short;
    g.appendChild(halo); g.appendChild(mk); g.appendChild(lbl);
    g.addEventListener('click', function (e) { e.stopPropagation(); select(tr.id); });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(tr.id); }
    });
    gTracks.appendChild(g);
    trackEls[tr.id] = { g: g, halo: halo, lbl: lbl };
  });

  /* ── map pointer interactions: draw + reshape ── */
  function svgPoint(ev) {
    var r = svg.getBoundingClientRect();
    return [ (ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H ];
  }
  svg.addEventListener('pointerdown', function (ev) {
    var p = svgPoint(ev);
    if (S.tool === 'rect' || S.tool === 'circle' || S.tool === 'tri') {
      S.draft = { shape: S.tool, start: p, cur: p };
      svg.setPointerCapture(ev.pointerId);
      ev.preventDefault();
      renderNai();
    }
  });
  svg.addEventListener('pointermove', function (ev) {
    var p = svgPoint(ev);
    if (S.draft) { S.draft.cur = p; renderNai(); return; }
    if (S.drag) {
      var d = S.drag, z = S.nai, dx = p[0] - d.from[0], dy = p[1] - d.from[1];
      if (d.kind === 'move') {
        if (z.shape === 'rect') { z.x = d.orig.x + dx; z.y = d.orig.y + dy; }
        else if (z.shape === 'circle') { z.cx = d.orig.cx + dx; z.cy = d.orig.cy + dy; }
        else z.pts = d.orig.pts.map(function (q) { return [q[0] + dx, q[1] + dy]; });
      } else if (d.kind === 'rect-corner') {
        var ox = d.orig.x, oy = d.orig.y, ow = d.orig.w, oh = d.orig.h;
        var ax = d.ci % 2 === 0 ? ox + ow : ox;              // anchor x (opposite corner)
        var ay = d.ci < 2 ? oy + oh : oy;                    // anchor y
        z.x = Math.min(ax, p[0]); z.w = Math.max(8, Math.abs(p[0] - ax));
        z.y = Math.min(ay, p[1]); z.h = Math.max(8, Math.abs(p[1] - ay));
      } else if (d.kind === 'circle-r') {
        z.r = Math.max(8, Math.hypot(p[0] - z.cx, p[1] - z.cy));
      } else if (d.kind === 'tri-pt') {
        z.pts[d.ci] = p;
      }
      refreshFilter(); renderNai(); renderFrame();
    }
  });
  function endPointer(ev) {
    if (S.drag) { S.fired = {}; }   // zone moved or reshaped: entries re-arm
    if (S.draft) {
      var d = S.draft; S.draft = null;
      var a = d.start, b = d.cur;
      if (Math.abs(b[0] - a[0]) > 6 || Math.abs(b[1] - a[1]) > 6) {
        if (d.shape === 'rect') setNai({ shape: 'rect', x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(b[0] - a[0]), h: Math.abs(b[1] - a[1]), name: 'NAI CRIMSON' });
        else if (d.shape === 'circle') setNai({ shape: 'circle', cx: a[0], cy: a[1], r: Math.max(10, Math.hypot(b[0] - a[0], b[1] - a[1])), name: 'NAI CRIMSON' });
        else setNai({ shape: 'tri', pts: [[(a[0] + b[0]) / 2, Math.min(a[1], b[1])], [Math.max(a[0], b[0]), Math.max(a[1], b[1])], [Math.min(a[0], b[0]), Math.max(a[1], b[1])]], name: 'NAI CRIMSON' });
        setTool('map');
      }
      renderNai();
    }
    S.drag = null;
    try { svg.releasePointerCapture(ev.pointerId); } catch (e) {}
  }
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);

  /* ── NAI rendering (zone + drag handles) ── */
  function renderNai() {
    while (gNai.firstChild) gNai.removeChild(gNai.firstChild);
    while (gDraft.firstChild) gDraft.removeChild(gDraft.firstChild);
    var z = S.nai;
    if (z) {
      var body;
      if (z.shape === 'rect') body = sv('rect', { x: z.x, y: z.y, width: z.w, height: z.h });
      else if (z.shape === 'circle') body = sv('circle', { cx: z.cx, cy: z.cy, r: z.r });
      else body = sv('polygon', { points: z.pts.map(function (p) { return p.join(','); }).join(' ') });
      body.setAttribute('fill', C.nai); body.setAttribute('fill-opacity', '0.08');
      body.setAttribute('stroke', C.nai); body.setAttribute('stroke-width', '1.6');
      body.setAttribute('stroke-dasharray', '7 5');
      body.style.cursor = 'move';
      body.addEventListener('pointerdown', function (ev) {
        ev.stopPropagation();
        S.drag = { kind: 'move', from: svgPoint(ev), orig: JSON.parse(JSON.stringify(z)) };
        svg.setPointerCapture(ev.pointerId);
      });
      gNai.appendChild(body);
      var lx = z.shape === 'rect' ? z.x + 5 : (z.shape === 'circle' ? z.cx : z.pts[0][0]);
      var ly = z.shape === 'rect' ? z.y - 5 : (z.shape === 'circle' ? z.cy - z.r - 5 : z.pts[0][1] - 8);
      var t = sv('text', { x: lx, y: ly, fill: C.nai, 'font-size': 8, 'font-family': 'JetBrains Mono,monospace', 'text-anchor': z.shape === 'rect' ? 'start' : 'middle' });
      t.textContent = '◆ ' + (z.name || 'NAI CRIMSON') + ' · ALERT ON ENTRY';
      gNai.appendChild(t);
      /* handles */
      var handles = [];
      if (z.shape === 'rect') handles = [[z.x, z.y, 'rect-corner', 0], [z.x + z.w, z.y, 'rect-corner', 1], [z.x, z.y + z.h, 'rect-corner', 2], [z.x + z.w, z.y + z.h, 'rect-corner', 3]];
      else if (z.shape === 'circle') handles = [[z.cx + z.r, z.cy, 'circle-r', 0]];
      else handles = z.pts.map(function (p, i) { return [p[0], p[1], 'tri-pt', i]; });
      handles.forEach(function (hd) {
        var h = sv('rect', { x: hd[0] - 4, y: hd[1] - 4, width: 8, height: 8, fill: '#0b1310', stroke: C.nai, 'stroke-width': 1.4 });
        h.style.cursor = 'grab';
        h.addEventListener('pointerdown', function (ev) {
          ev.stopPropagation();
          S.drag = { kind: hd[2], ci: hd[3], from: svgPoint(ev), orig: JSON.parse(JSON.stringify(z)) };
          svg.setPointerCapture(ev.pointerId);
        });
        gNai.appendChild(h);
      });
    }
    if (S.draft) {
      var d = S.draft, a = d.start, b = d.cur, dr;
      if (d.shape === 'rect') dr = sv('rect', { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), width: Math.abs(b[0] - a[0]), height: Math.abs(b[1] - a[1]) });
      else if (d.shape === 'circle') dr = sv('circle', { cx: a[0], cy: a[1], r: Math.hypot(b[0] - a[0], b[1] - a[1]) });
      else dr = sv('polygon', { points: [[(a[0] + b[0]) / 2, Math.min(a[1], b[1])], [Math.max(a[0], b[0]), Math.max(a[1], b[1])], [Math.min(a[0], b[0]), Math.max(a[1], b[1])]].map(function (p) { return p.join(','); }).join(' ') });
      dr.setAttribute('fill', 'none'); dr.setAttribute('stroke', C.nai); dr.setAttribute('stroke-dasharray', '4 4');
      gDraft.appendChild(dr);
    }
  }

  /* ── state transitions ── */
  function setTool(t) {
    S.tool = t;
    for (var k in toolBtns) toolBtns[k].setAttribute('aria-pressed', String(k === t));
    svg.style.cursor = (t === 'map') ? '' : 'crosshair';
  }
  function setView(v) {
    if (v === 'signal' && !S.nai) ensureNAI();
    S.view = v;
    renderChrome(); renderFrame(); renderRight();
  }
  function setTab(t) {
    S.tab = t;
    renderLeft();
  }
  function setNai(z) {
    S.nai = z;
    S.fired = {};
    refreshFilter();
    renderNai(); renderChrome(); renderFrame(); renderRight(); renderLeft();
  }
  function ensureNAI() {
    // v1 installs this exact rect on Route Crimson when SIGNAL or the scenario
    // needs a zone and the operator hasn't drawn one
    S.nai = { shape: 'rect', x: 362, y: 250, w: 168, h: 128, name: 'NAI CRIMSON' };
    S.fired = {};
    refreshFilter(); renderNai();
  }
  function refreshFilter() {
    clearBtn.style.display = S.nai ? 'block' : 'none';
  }
  function select(id) {
    S.selected = (S.selected === id) ? null : id;
    renderFrame(); renderRight();
  }
  function fireAlert(tr, t) {
    var key = 'nai|' + tr.id;
    if (S.fired[key]) return;
    S.fired[key] = true;
    var a = { id: key, sev: tr.aff === 'hostile' ? 1 : 2, time: clock(t), name: tr.short, zone: 'NAI CRIMSON', aff: tr.aff };
    S.alerts = [a].concat(S.alerts.filter(function (x) { return x.id !== a.id; }));
    S.tab = 'alerts';
    var col = a.sev === 1 ? '#e64d3c' : '#d4a036';
    toast.style.borderColor = col; toast.style.borderLeftColor = col;
    toast.innerHTML =
      '<div class="agp-mono" style="font-size:9.5px;color:' + col + ';letter-spacing:.08em;margin-bottom:4px;">' + (a.sev === 1 ? '▲ SEV-1 · ZONE ENTRY' : '△ SEV-2 · ZONE ENTRY') + ' · ' + a.time + '</div>' +
      '<div style="font-size:12.5px;color:' + C.strong + ';font-weight:600;margin-bottom:3px;">' + a.name + ' → NAI CRIMSON</div>' +
      '<div style="font-size:11px;color:' + C.text + ';line-height:1.5;">' + (a.sev === 1 ? 'Hostile ground track crossed the boundary. One-tap report-up is armed.' : 'Unknown track crossed the boundary. Classify before it dwells.') + '</div>' +
      '<button id="agp-toast-x" class="agp-mono" style="margin-top:7px;border:1px solid ' + C.line2 + ';font-size:9.5px;letter-spacing:.06em;color:' + C.dim + ';padding:5px 9px;">DISMISS</button>';
    toast.style.display = 'block';
    toast.querySelector('#agp-toast-x').addEventListener('click', function () { toast.style.display = 'none'; });
    live.textContent = (a.sev === 1 ? 'Severity one alert: ' : 'Severity two alert: ') + a.name + ' entered NAI CRIMSON at ' + a.time;
    renderLeft(); renderRight();
  }
  function checkEntries() {
    if (!S.nai) return;
    TRACKS.forEach(function (tr) {
      // v1 rule: only hostile / unknown GROUND tracks trip the zone alert
      if (tr.aff !== 'hostile' && tr.aff !== 'unknown') return;
      if (tr.domain !== 'ground') return;
      if (inZone(posAt(tr, S.t), S.nai)) fireAlert(tr, S.t);
    });
  }

  /* ── playback ── */
  var rafId = null, lastTs = 0;
  function loop(ts) {
    if (!S.playing) { rafId = null; return; }   // loop dies when idle; play restarts it
    rafId = requestAnimationFrame(loop);
    var dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0;
    lastTs = ts;
    var t = S.t + dt / 26 * S.speed;
    if (t >= 1) { t = 1; S.playing = false; }
    S.t = t;
    checkEntries();
    renderFrame();
    renderChrome();   // keep the scrubber, clock, and play state honest while running
  }
  function startLoop() { if (rafId == null) { lastTs = 0; rafId = requestAnimationFrame(loop); } }
  function stopLoopIfIdle() { if (!S.playing && rafId != null) { cancelAnimationFrame(rafId); rafId = null; } }
  playBtn.addEventListener('click', function () {
    if (S.t >= 1) { S.t = 0; S.fired = {}; }   // replay re-arms zone-entry alerts
    S.playing = !S.playing;
    if (S.playing) startLoop();
    renderChrome();
  });
  resetBtn.addEventListener('click', function () {
    S.playing = false; S.t = 0; S.fired = {}; S.alerts = []; toast.style.display = 'none';
    renderChrome(); renderFrame(); renderLeft(); renderRight();
    stopLoopIfIdle();
  });
  runBtn.addEventListener('click', function () {
    // v1 semantics: the guided run always resets to the default NAI, a clean
    // alert feed, 2x speed, the assets tab, and no selection
    ensureNAI();
    S.view = 'signal'; S.t = 0; S.fired = {}; S.alerts = []; S.speed = 2;
    S.selected = null; S.tab = 'assets'; S.playing = true;
    toast.style.display = 'none';
    startLoop();
    renderChrome(); renderFrame(); renderRight(); renderLeft();
  });
  scrub.addEventListener('input', function () {
    S.playing = false;
    S.t = +scrub.value / 1000;
    checkEntries();
    renderChrome(); renderFrame();
  });
  applyBtn.addEventListener('click', function () {
    var lat = parseFloat(latIn.inp.value), lng = parseFloat(lngIn.inp.value), r = parseFloat(radIn.inp.value);
    if (!isFinite(lat) || !isFinite(lng) || !isFinite(r) || r <= 0) return;
    S.coord = { lat: lat, lng: lng, r: r };
    // v1's geo zone: centre from the grid reference, radius max(24, 7*km) px
    setNai({ shape: 'circle', cx: lngToX(lat && lng ? lng : S.coord.lng), cy: latToY(lat), r: Math.max(24, 7 * r), name: 'NAI CRIMSON · GEO' });
    renderChrome();
  });
  clearBtn.addEventListener('click', function () {
    S.nai = null; S.fired = {};
    if (S.view === 'signal') S.view = 'all';
    refreshFilter(); renderNai(); renderChrome(); renderFrame(); renderRight();
  });

  /* ── renderers ── */
  function renderChrome() {
    for (var k in viewBtns) viewBtns[k].setAttribute('aria-pressed', String(k === S.view));
    for (var x in speedBtns) speedBtns[x].setAttribute('aria-pressed', String(+x === S.speed));
    playBtn.textContent = S.playing ? '❚❚' : '▶';
    playBtn.setAttribute('aria-label', S.playing ? 'Pause the scenario' : 'Play the scenario');
    scrub.value = String(Math.round(S.t * 1000));
    var sync = document.getElementById('agp-sync');
    if (sync) sync.textContent = '24' + clock(S.t);
    var counts = document.getElementById('agp-counts');
    if (counts) counts.textContent = TRACKS.filter(function (t) { return t.domain !== 'sensor'; }).length + ' TRACKS · ' + (3 + (S.nai ? 1 : 0)) + ' ZONES · v1.0-RC';
  }
  function renderFrame() {
    var signal = S.view === 'signal' && S.nai;
    TRACKS.forEach(function (tr) {
      var p = posAt(tr, S.t), e = trackEls[tr.id];
      e.g.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')');
      var inside = S.nai ? inZone(p, S.nai) : false;
      var dim = signal && !inside && tr.aff !== 'sensor' ? 0.14 : 1;
      e.g.setAttribute('opacity', String(dim));
      e.halo.setAttribute('opacity', S.selected === tr.id ? '0.9' : (inside && S.nai ? '0.45' : '0'));
      e.lbl.setAttribute('fill', S.selected === tr.id ? C.strong : C.dim);
    });
    gZones.setAttribute('opacity', signal ? '0.25' : '1');
    gRoute.setAttribute('opacity', signal ? '0.4' : '1');
  }
  function renderLeft() {
    for (var k in tabBtns) tabBtns[k].setAttribute('aria-selected', String(k === S.tab));
    tabBody.innerHTML = '';
    if (S.tab === 'assets') {
      TRACKS.forEach(function (tr) {
        var b = el('button', { 'class': 'agp-asset' + (S.selected === tr.id ? ' on' : '') });
        b.innerHTML =
          '<span style="width:8px;height:8px;flex:none;border-radius:' + (tr.aff === 'hostile' ? '1px' : '50%') + ';background:' + (tr.aff === 'sensor' ? 'transparent' : C.aff[tr.aff]) + ';border:1.5px solid ' + C.aff[tr.aff] + ';' + (tr.aff === 'hostile' ? 'transform:rotate(45deg);' : '') + '"></span>' +
          '<span style="flex:1;min-width:0;"><span class="agp-mono" style="display:block;font-size:10px;color:' + C.strong + ';letter-spacing:.04em;">' + tr.short + '</span>' +
          '<span style="display:block;font-size:9.5px;color:' + C.dim + ';text-transform:capitalize;">' + tr.aff + ' · ' + tr.domain + '</span></span>' +
          (tr.threat ? '<span class="agp-mono" style="font-size:9.5px;color:' + (tr.threat >= 70 ? C.aff.hostile : C.aff.unknown) + ';">' + tr.threat + '</span>' : '');
        b.addEventListener('click', function () { select(tr.id); renderLeft(); });
        tabBody.appendChild(b);
      });
    } else if (S.tab === 'zones') {
      var zs = AMBIENT.map(function (z) { return { name: z.name, color: z.color, kind: 'Standing' }; });
      if (S.nai) zs.unshift({ name: 'NAI CRIMSON', color: C.nai, kind: 'Operator-defined · alert on entry' });
      zs.forEach(function (z) {
        var d = el('div', { style: 'padding:8px 9px;margin-bottom:4px;border:1px solid ' + C.line + ';border-radius:8px;' });
        d.innerHTML = '<span class="agp-mono" style="display:block;font-size:10px;color:' + z.color + ';letter-spacing:.05em;">' + z.name + '</span>' +
          '<span style="font-size:9.5px;color:' + C.dim + ';">' + z.kind + '</span>';
        tabBody.appendChild(d);
      });
    } else {
      if (!S.alerts.length) {
        tabBody.appendChild(el('div', { style: 'padding:22px 8px;text-align:center;color:' + C.dim + ';font-size:11.5px;line-height:1.55;', text: 'No alerts. Draw an alert zone, then press play ▶ or scrub the timeline to watch a track enter.' }));
      } else {
        S.alerts.forEach(function (a) {
          var col = a.sev === 1 ? '#e64d3c' : '#d4a036';
          var d = el('div', { style: 'padding:8px 9px;margin-bottom:4px;border:1px solid ' + col + '55;border-left:3px solid ' + col + ';border-radius:8px;' });
          d.innerHTML = '<span class="agp-mono" style="display:block;font-size:9px;color:' + col + ';letter-spacing:.07em;margin-bottom:2px;">' + (a.sev === 1 ? '▲ SEV-1' : '△ SEV-2') + ' · ' + a.time + '</span>' +
            '<span style="font-size:11px;color:' + C.strong + ';font-weight:500;">' + a.name + ' → ' + a.zone + '</span>';
          tabBody.appendChild(d);
        });
      }
    }
  }
  function renderRight() {
    right.innerHTML = '';
    var pad = el('div', { style: 'padding:14px 13px;' });
    var tr = S.selected ? TRACKS.filter(function (t) { return t.id === S.selected; })[0] : null;
    if (tr) {
      var col = C.aff[tr.aff];
      pad.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
          '<span class="agp-mono" style="font-size:9.5px;letter-spacing:.1em;color:' + col + ';">● ' + tr.aff.toUpperCase() + ' · ' + tr.domain.toUpperCase() + '</span>' +
          '<button id="agp-close" aria-label="Close assessment" style="color:' + C.dim + ';font-size:14px;padding:2px 8px;">✕</button>' +
        '</div>' +
        '<div style="font-size:14.5px;font-weight:600;color:' + C.strong + ';margin-bottom:12px;">' + tr.name + '</div>' +
        '<div class="agp-mono" style="font-size:9px;letter-spacing:.12em;color:' + C.dim + ';margin-bottom:7px;">TRACK PARAMETERS</div>' +
        [['Affiliation', '<span style="color:' + col + ';text-transform:capitalize;">' + tr.aff + '</span>'],
         ['Domain', tr.domain], ['Speed', tr.speed], ['Classification', tr.cls]].map(function (r2) {
          return '<div style="display:flex;justify-content:space-between;font-size:11.5px;padding:4px 0;border-bottom:1px solid ' + C.line + ';"><span style="color:' + C.dim + '">' + r2[0] + '</span><span style="color:' + C.text + '">' + r2[1] + '</span></div>';
        }).join('') +
        '<div class="agp-mono" style="font-size:9px;letter-spacing:.12em;color:' + C.dim + ';margin:13px 0 6px;">REPORTING</div>' +
        '<div style="font-size:11.5px;line-height:1.6;color:' + C.text + ';">' + tr.report + '</div>' +
        (tr.threat ?
          '<div style="margin-top:13px;padding:11px 12px;border:1px solid ' + (tr.threat >= 70 ? 'rgba(230,77,60,.5)' : 'rgba(212,160,54,.4)') + ';border-radius:10px;background:rgba(230,77,60,.05);">' +
            '<div class="agp-mono" style="font-size:9px;letter-spacing:.12em;color:#b9a0e8;margin-bottom:6px;">AI THREAT ASSESSMENT</div>' +
            '<div style="display:flex;align-items:baseline;justify-content:space-between;"><span style="font-size:12px;color:' + C.text + ';">Threat score</span><span style="font-size:20px;font-weight:700;color:' + (tr.threat >= 70 ? C.aff.hostile : C.aff.unknown) + ';">' + tr.threat + '</span></div>' +
            '<div style="height:3px;background:' + C.line + ';border-radius:2px;margin:6px 0 10px;"><span style="display:block;height:100%;width:' + tr.threat + '%;background:' + (tr.threat >= 70 ? C.aff.hostile : C.aff.unknown) + ';border-radius:2px;"></span></div>' +
            '<div style="font-size:11px;color:' + C.strong + ';font-weight:600;margin-bottom:3px;">Recommended action</div>' +
            '<div style="font-size:11px;line-height:1.55;color:' + C.text + ';">' + tr.rec + '</div>' +
            '<div class="agp-mono" style="font-size:8.5px;color:' + C.faint + ';margin-top:8px;letter-spacing:.06em;">MODEL ASSISTS · THE CALL STAYS WITH YOU</div>' +
          '</div>'
          : '<div class="agp-mono" style="margin-top:13px;font-size:9px;color:' + C.faint + ';letter-spacing:.08em;">' + (tr.rec === '—' ? 'STATIC INFRASTRUCTURE' : 'NO THREAT MODEL — FRIENDLY') + '</div>');
      right.appendChild(pad);
      pad.querySelector('#agp-close').addEventListener('click', function () { select(null); });
      return;
    }
    var active = !!S.nai;
    pad.innerHTML =
      '<div class="agp-mono" style="font-size:9.5px;letter-spacing:.14em;color:' + C.dim + ';margin-bottom:12px;">COMMON OPERATING PICTURE</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:14px;">' +
        [['tracks held', String(TRACKS.filter(function (t2) { return t2.domain !== 'sensor'; }).length), C.strong],
         ['alert zones', String(S.nai ? 1 : 0), C.nai],
         ['alerts', String(S.alerts.length), S.alerts.length ? '#e64d3c' : C.strong]].map(function (d) {
          return '<div style="flex:1;"><div style="font-size:19px;font-weight:700;color:' + d[2] + ';" class="agp-mono">' + d[1] + '</div><div style="font-size:9px;color:' + C.dim + ';">' + d[0] + '</div></div>';
        }).join('') +
      '</div>' +
      '<div style="padding:12px;border-radius:11px;background:' + (active ? 'rgba(255,157,102,.07)' : '#0e1b17') + ';border:1px solid ' + (active ? 'rgba(255,157,102,.3)' : C.line) + ';">' +
        '<div class="agp-mono" style="font-size:9px;color:' + (active ? C.nai : C.dim) + ';margin-bottom:7px;letter-spacing:.08em;">' + (active ? '◆ ACTIVE FILTER' : 'NO FILTER ACTIVE') + '</div>' +
        (active
          ? '<div style="font-size:13.5px;font-weight:600;color:' + C.strong + ';margin-bottom:3px;">NAI CRIMSON</div><div style="font-size:11.5px;color:' + C.text + ';line-height:1.5;">Showing only what is inside this zone. Hostile or unknown ground tracks crossing the boundary raise an alert with a one-tap report-up.</div>'
          : '<div style="font-size:11.5px;color:' + C.text + ';line-height:1.55;">Draw a zone or enter a coordinate on the left to filter the picture down to the ground you own, then press <span style="color:' + C.accent + ';">play ▶</span> to watch the column move.</div>') +
      '</div>' +
      '<div style="margin-top:13px;font-size:11px;color:' + C.dim + ';line-height:1.6;">Tip: toggle <span class="agp-mono" style="font-size:9.5px;color:' + C.text + ';">EVERYTHING ↔ SIGNAL</span> in the toolbar to feel the difference between the literal brief and the actual job.</div>';
    right.appendChild(pad);
  }

  /* ── boot ── */
  setTool('map');
  renderChrome(); renderFrame(); renderLeft(); renderRight(); renderNai();
  /* run the movement loop only while playing; static otherwise */
  if (!reduceMotion) { /* ambient blink handled by CSS; nothing else runs idle */ }
})();
