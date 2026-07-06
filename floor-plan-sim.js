/* floor-plan-sim.js — interactive Rose Ballroom floor plan for the Partitioning
   showcase. Tap walls to open/close them; sub-areas merge into lighting zones.

   Usage: give any element `data-floor-sim`; the module builds the UI inside it.
   Used by partitioning-showcase.html (moved from partitioning.dc.html). */
(function () {
  'use strict';

  var WALL_JOINS = { P1: ['A', 'B'], P2: ['B', 'C'], P3: ['A', 'B', 'C', 'D'], P4: ['D', 'E'], P5: ['E', 'F', 'G', 'H'], P6: ['F', 'G'], P7: ['G', 'H'] };
  var CELL_GEO = {
    A: { left: '1.5%', top: '2%', w: '21%', h: '30%' }, B: { left: '1.5%', top: '35%', w: '21%', h: '30%' }, C: { left: '1.5%', top: '68%', w: '21%', h: '30%' },
    D: { left: '26.5%', top: '2%', w: '21%', h: '96%' }, E: { left: '51.5%', top: '2%', w: '21%', h: '96%' },
    F: { left: '76.5%', top: '2%', w: '22%', h: '30%' }, G: { left: '76.5%', top: '35%', w: '22%', h: '30%' }, H: { left: '76.5%', top: '68%', w: '22%', h: '30%' }
  };
  var WALL_GEO = {
    P1: { left: '12%', top: '33.5%', w: '21%', h: '24px', vertical: false }, P2: { left: '12%', top: '66.5%', w: '21%', h: '24px', vertical: false },
    P3: { left: '24.5%', top: '50%', w: '24px', h: '92%', vertical: true }, P4: { left: '49.5%', top: '50%', w: '24px', h: '92%', vertical: true }, P5: { left: '74.5%', top: '50%', w: '24px', h: '92%', vertical: true },
    P6: { left: '87.5%', top: '33.5%', w: '22%', h: '24px', vertical: false }, P7: { left: '87.5%', top: '66.5%', w: '22%', h: '24px', vertical: false }
  };
  var PALETTE = [
    { s: '#5fc2a8', t: 'rgba(95,196,168,0.18)', b: 'rgba(95,196,168,0.55)' },
    { s: '#e08bb0', t: 'rgba(224,139,176,0.16)', b: 'rgba(224,139,176,0.55)' },
    { s: '#9fe9d8', t: 'rgba(159,233,216,0.16)', b: 'rgba(159,233,216,0.55)' },
    { s: '#e8c069', t: 'rgba(232,192,105,0.16)', b: 'rgba(232,192,105,0.55)' },
    { s: '#c5b0f4', t: 'rgba(197,176,244,0.16)', b: 'rgba(197,176,244,0.55)' },
    { s: '#7dd3c0', t: 'rgba(125,211,192,0.16)', b: 'rgba(125,211,192,0.55)' },
    { s: '#e0907e', t: 'rgba(224,144,126,0.16)', b: 'rgba(224,144,126,0.55)' },
    { s: '#6fb4d8', t: 'rgba(111,180,216,0.16)', b: 'rgba(111,180,216,0.55)' }
  ];
  var IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  var DEFAULT_WALLS = { P1: false, P2: false, P3: false, P4: false, P5: false, P6: false, P7: false };

  var CSS =
    '[data-floor-sim]{width:100%}' +
    '.fpsim{font-family:"DM Sans","Inter",-apple-system,sans-serif;color:#e8edf5;-webkit-user-select:none;user-select:none}' +
    '.fpsim *{box-sizing:border-box}' +
    '.fpsim button{font-family:inherit;cursor:pointer}' +
    '.fpsim :focus-visible{outline:2px solid #9fe9d8;outline-offset:2px}' +
    '.fpsim-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px}' +
    '.fpsim-lbl{font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(191,231,223,0.72)}' +
    '.fpsim-preset{padding:8px 15px;border-radius:999px;border:1px solid rgba(255,255,255,0.14);background:rgba(8,16,28,0.55);color:#e8edf5;font-size:12.5px;font-weight:600;transition:border-color .2s,background .2s}' +
    '.fpsim-preset:hover{border-color:rgba(159,233,216,0.45);background:rgba(8,16,28,0.75)}' +
    '.fpsim-badge{display:flex;align-items:center;gap:9px;padding:8px 15px;background:rgba(95,196,168,0.14);border:1px solid rgba(95,196,168,0.32);border-radius:999px;margin-left:auto}' +
    '.fpsim-badge b{font-family:"JetBrains Mono",monospace;font-size:22px;font-weight:500;color:#9fe9d8;line-height:1}' +
    '.fpsim-badge span{font-size:12px;color:#bfe7df;line-height:1.2}' +
    '.fpsim-grid{display:grid;grid-template-columns:1.55fr 1fr;gap:16px;align-items:stretch}' +
    '.fpsim-card{background:rgba(8,16,28,0.72);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px}' +
    '.fpsim-map{position:relative;width:100%;height:min(480px,58vw);min-height:300px}' +
    '.fpsim-cell{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border-radius:8px;border:1.5px solid;transition:background .35s cubic-bezier(.22,.61,.36,1),border-color .35s cubic-bezier(.22,.61,.36,1)}' +
    '.fpsim-cell-id{font-family:"Inter",sans-serif;font-size:clamp(22px,4vw,30px);font-weight:600;line-height:1}' +
    '.fpsim-cell-zone{font-family:"JetBrains Mono",monospace;font-size:8.5px;opacity:0.85;letter-spacing:0.04em}' +
    '.fpsim-dots{display:flex;gap:3px;margin-top:1px}' +
    '.fpsim-dots i{width:5px;height:5px;border-radius:50%;opacity:0.55}' +
    '.fpsim-dots i.sq{border-radius:1px;opacity:0.4}' +
    '.fpsim-wall{position:absolute;transform:translate(-50%,-50%);border:none;cursor:pointer;padding:0;background:transparent;z-index:5;display:flex;align-items:center;justify-content:center}' +
    '.fpsim-wall-bar{border-radius:100px;display:flex;align-items:center;justify-content:center;transition:all .25s}' +
    '.fpsim-wall-lbl{font-family:"JetBrains Mono",monospace;font-size:8.5px;font-weight:500;white-space:nowrap}' +
    '.fpsim-legend{display:flex;align-items:center;justify-content:space-between;margin-top:14px;flex-wrap:wrap;gap:10px}' +
    '.fpsim-keyrow{display:flex;gap:14px;flex-wrap:wrap}' +
    '.fpsim-key{display:flex;align-items:center;gap:6px;font-family:"JetBrains Mono",monospace;font-size:10px;color:rgba(191,231,223,0.72)}' +
    '.fpsim-key i{display:block;width:18px;height:7px;border-radius:100px;background:#46566b}' +
    '.fpsim-key i.open{background:transparent;border:1.5px dashed #9fe9d8}' +
    '.fpsim-zones{display:flex;flex-direction:column;gap:9px;min-height:200px}' +
    '.fpsim-zone{display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(4,9,14,0.72);border:1px solid rgba(255,255,255,0.06);border-left:3px solid;border-radius:9px}' +
    '.fpsim-zone-lbl{font-family:"JetBrains Mono",monospace;font-size:14px;font-weight:600;letter-spacing:0.04em;flex:1}' +
    '.fpsim-zone-dev{font-family:"JetBrains Mono",monospace;font-size:11px;color:rgba(191,231,223,0.62)}' +
    '.fpsim-note{margin-top:auto;padding-top:20px;font-size:13px;color:rgba(191,231,223,0.62);line-height:1.55}' +
    '.fpsim-kicker{font-family:"JetBrains Mono",monospace;font-size:10px;color:rgba(191,231,223,0.62);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:16px}' +
    '@media (max-width:880px){.fpsim-grid{grid-template-columns:1fr}.fpsim-badge{margin-left:0}}' +
    '@media (prefers-reduced-motion:reduce){.fpsim-cell,.fpsim-wall-bar{transition:none}}';

  function computeGroups(walls) {
    var parent = {};
    IDS.forEach(function (i) { parent[i] = i; });
    function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    function uni(a, b) { var ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }
    Object.keys(WALL_JOINS).forEach(function (w) {
      if (walls[w]) { var g = WALL_JOINS[w]; for (var i = 1; i < g.length; i++) uni(g[0], g[i]); }
    });
    var colorByRoot = {}, next = 0;
    IDS.forEach(function (i) { var r = find(i); if (!(r in colorByRoot)) colorByRoot[r] = next++; });
    var members = {};
    IDS.forEach(function (i) { var r = find(i); (members[r] = members[r] || []).push(i); });
    return { colorByRoot: colorByRoot, members: members, find: find };
  }

  function build(root) {
    if (root.getAttribute('data-fpsim-ready')) return;
    root.setAttribute('data-fpsim-ready', '1');

    if (!document.getElementById('fpsim-css')) {
      var st = document.createElement('style');
      st.id = 'fpsim-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    root.innerHTML =
      '<div class="fpsim">' +
        '<div class="fpsim-toolbar">' +
          '<span class="fpsim-lbl">Presets</span>' +
          '<button type="button" class="fpsim-preset" data-preset="split">8 Separate Rooms</button>' +
          '<button type="button" class="fpsim-preset" data-preset="six">6 Ballrooms</button>' +
          '<button type="button" class="fpsim-preset" data-preset="four">4 Ballrooms</button>' +
          '<button type="button" class="fpsim-preset" data-preset="two">2 Events</button>' +
          '<button type="button" class="fpsim-preset" data-preset="grand">1 Grand Ballroom</button>' +
          '<div class="fpsim-badge"><b data-zone-count>8</b><span>active<br>lighting zones</span></div>' +
        '</div>' +
        '<div class="fpsim-grid">' +
          '<div class="fpsim-card">' +
            '<div class="fpsim-map" data-map role="application" aria-label="Rose Ballroom floor plan. Tap any wall to open or close it and watch sub-areas merge into lighting zones."></div>' +
            '<div class="fpsim-legend">' +
              '<div class="fpsim-keyrow">' +
                '<div class="fpsim-key"><i></i>Wall closed · rooms split</div>' +
                '<div class="fpsim-key"><i class="open"></i>Wall open · rooms merged</div>' +
              '</div>' +
              '<span class="fpsim-lbl">Rose Ballroom · 48 devices</span>' +
            '</div>' +
          '</div>' +
          '<div class="fpsim-card" style="display:flex;flex-direction:column">' +
            '<div class="fpsim-kicker">Live Lighting Zones</div>' +
            '<div class="fpsim-zones" data-zones></div>' +
            '<p class="fpsim-note">Each sub-area carries 2 chandeliers, inner &amp; outer cove, a wall station and a CCI. When walls open, their devices fall under one zone\'s control, scenes, occupancy and daylight all follow.</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    var map = root.querySelector('[data-map]');
    var zonesEl = root.querySelector('[data-zones]');
    var countEl = root.querySelector('[data-zone-count]');
    var walls = Object.assign({}, DEFAULT_WALLS);
    var cellEls = {}, wallEls = {};

    IDS.forEach(function (id) {
      var geo = CELL_GEO[id];
      var el = document.createElement('div');
      el.className = 'fpsim-cell';
      el.style.left = geo.left;
      el.style.top = geo.top;
      el.style.width = geo.w;
      el.style.height = geo.h;
      el.innerHTML = '<div class="fpsim-cell-id">' + id + '</div><div class="fpsim-cell-zone"></div><div class="fpsim-dots"><i></i><i></i><i class="sq"></i><i class="sq"></i></div>';
      map.appendChild(el);
      cellEls[id] = el;
    });

    Object.keys(WALL_GEO).forEach(function (id) {
      var g = WALL_GEO[id];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fpsim-wall';
      btn.style.left = g.left;
      btn.style.top = g.top;
      btn.style.width = g.w;
      btn.style.height = g.h;
      btn.innerHTML = '<div class="fpsim-wall-bar"><span class="fpsim-wall-lbl">' + id + '</span></div>';
      btn.addEventListener('click', function () { walls[id] = !walls[id]; render(); });
      map.appendChild(btn);
      wallEls[id] = btn;
    });

    function render() {
      var G = computeGroups(walls);
      IDS.forEach(function (id) {
        var rootId = G.find(id);
        var ci = G.colorByRoot[rootId] % PALETTE.length;
        var p = PALETTE[ci];
        var grp = G.members[rootId].slice().sort();
        var zone = grp.length > 1 ? grp.join('+') : 'Independent';
        var el = cellEls[id];
        el.style.background = p.t;
        el.style.borderColor = p.b;
        el.querySelector('.fpsim-cell-id').style.color = p.s;
        el.querySelector('.fpsim-cell-zone').textContent = zone;
        el.querySelector('.fpsim-cell-zone').style.color = p.s;
        el.querySelectorAll('.fpsim-dots i').forEach(function (d) { d.style.background = p.s; });
      });

      Object.keys(WALL_GEO).forEach(function (id) {
        var g = WALL_GEO[id];
        var open = walls[id];
        var bar = wallEls[id].querySelector('.fpsim-wall-bar');
        var lbl = wallEls[id].querySelector('.fpsim-wall-lbl');
        bar.style.width = g.vertical ? '8px' : '100%';
        bar.style.height = g.vertical ? '100%' : '8px';
        bar.style.background = open ? 'transparent' : '#46566b';
        bar.style.border = open ? '1.5px dashed #9fe9d8' : '1.5px solid #5b6c82';
        bar.style.boxShadow = open ? 'none' : '0 0 0 1px rgba(0,0,0,0.2)';
        lbl.style.color = open ? '#9fe9d8' : '#cdd6e4';
        lbl.style.transform = g.vertical ? 'rotate(-90deg)' : 'none';
        wallEls[id].title = id + (open ? ', open (rooms merged)' : ', closed (rooms split)');
      });

      var zonesArr = Object.keys(G.members).map(function (r) {
        var grp = G.members[r].slice().sort();
        var ci = G.colorByRoot[r] % PALETTE.length;
        return { label: grp.join(' + '), color: PALETTE[ci].s, devices: grp.length * 6, first: grp[0] };
      }).sort(function (a, b) { return a.first < b.first ? -1 : 1; });

      countEl.textContent = zonesArr.length;
      zonesEl.innerHTML = zonesArr.map(function (z) {
        return '<div class="fpsim-zone" style="border-left-color:' + z.color + '"><div class="fpsim-zone-lbl" style="color:' + z.color + '">' + z.label + '</div><div class="fpsim-zone-dev">' + z.devices + ' dev</div></div>';
      }).join('');
    }

    root.querySelector('[data-preset="split"]').addEventListener('click', function () { walls = Object.assign({}, DEFAULT_WALLS); render(); });
    root.querySelector('[data-preset="six"]').addEventListener('click', function () {
      // A+B and F+G merge: 6 zones
      walls = Object.assign({}, DEFAULT_WALLS, { P1: true, P6: true });
      render();
    });
    root.querySelector('[data-preset="four"]').addEventListener('click', function () {
      // A+B+C, D+E, F+G, H: 4 zones
      walls = Object.assign({}, DEFAULT_WALLS, { P1: true, P2: true, P4: true, P6: true });
      render();
    });
    root.querySelector('[data-preset="two"]').addEventListener('click', function () {
      walls = Object.assign({}, DEFAULT_WALLS, { P1: true, P2: true, P3: true, P5: true, P6: true, P7: true });
      render();
    });
    root.querySelector('[data-preset="grand"]').addEventListener('click', function () {
      walls = Object.assign({}, DEFAULT_WALLS, { P1: true, P2: true, P3: true, P4: true, P5: true, P6: true, P7: true });
      render();
    });

    render();
  }

  function scan() {
    document.querySelectorAll('[data-floor-sim]').forEach(function (el) {
      try { build(el); } catch (e) {}
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);
  else scan();
})();
