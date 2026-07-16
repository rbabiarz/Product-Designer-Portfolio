/* la-sims.js — the three Light ARchitect deep-dive interactives.
   A: photometric sandbox (drag/add/remove luminaires, live pass/fail readout)
   B: AI AutoLayout demo (boundary → goals → ranked candidates → refine)
   C: IES filter-before-load demo (the library never renders unfiltered)

   The footcandle engine is the same simplified-falloff model as the homepage
   Light ARchitect scene (inverse-square-style contribution, calibrated once
   against a representative basic parking design at ~2 fc average),
   honestly labeled in-page as a simulation: the shipped product computes from
   real IES photometry. Vanilla JS, no dependencies; each init is isolated so
   one failure can't kill the others. Keyboard paths and reduced-motion are
   first-class (WCAG 2.2 AA): fixtures are real buttons in a roving-tabindex
   group, arrow keys move them cell by cell, metrics announce politely. */
(function () {
  'use strict';
  if (window.__laSims) return; window.__laSims = 1;

  var REDUCE = false;
  try { REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var COLS = 24, ROWS = 16, EDGE = 0.14;

  /* ---------- shared footcandle engine (ported from the homepage scene) ---------- */
  function fieldAt(px, py, fx) {
    var e = 0;
    for (var i = 0; i < fx.length; i++) {
      var dx = px - fx[i].x, dy = (py - fx[i].y) * 0.92;
      e += 1 / (0.03 + (dx * dx + dy * dy) * 8.28);
    }
    return e;
  }
  function calibrate(defaultFx, insideFn) {
    var sum = 0, n = 0;
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var px = (c + 0.5) / COLS, py = (r + 0.5) / ROWS;
      if (!insideFn(px, py)) continue;
      sum += fieldAt(px, py, defaultFx); n++;
    }
    return 2.05 / ((sum / (n || 1)) || 1);
  }
  function metrics(fx, k, insideFn) {
    var min = 1e9, max = -1e9, sum = 0, n = 0, cells = [];
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var px = (c + 0.5) / COLS, py = (r + 0.5) / ROWS;
      var fc = fieldAt(px, py, fx) * k;
      var ins = insideFn(px, py);
      cells.push({ fc: fc, inside: ins });
      if (ins) { if (fc < min) min = fc; if (fc > max) max = fc; sum += fc; n++; }
    }
    var avg = sum / (n || 1);
    return { cells: cells, avg: avg, min: min === 1e9 ? 0 : min, max: max === -1e9 ? 0 : max,
      maxmin: min > 0.01 ? max / min : 0, avgmin: min > 0.01 ? avg / min : 0 };
  }
  function isDark() {
    var top = document.getElementById('top');
    return !!(top && top.classList.contains('dark'));
  }
  function rampColor(v, dark) {
    var stops = dark
      ? [[22,46,128],[31,108,209],[31,163,116],[150,170,40],[214,128,30],[206,58,42]]
      : [[16,26,72],[20,64,128],[18,104,82],[92,100,28],[126,72,18],[122,30,24]];
    v = Math.max(0, Math.min(1, v));
    var s = v * (stops.length - 1), i = Math.floor(s), f = s - i;
    var a = stops[i], b = stops[Math.min(stops.length - 1, i + 1)];
    var rgb = [0,1,2].map(function (kk) { return Math.round(a[kk] + (b[kk] - a[kk]) * f); }).join(',');
    var al = dark ? (0.5 + 0.42 * v) : (0.84 + 0.14 * v);
    return 'rgba(' + rgb + ',' + al.toFixed(2) + ')';
  }
  function toneV(fc) { var v = Math.pow(fc / 6.8, 0.72); return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ---------- grid painter shared by A and B ---------- */
  function buildGrid(heat) {
    var html = '';
    for (var i = 0; i < COLS * ROWS; i++) html += '<div></div>';
    heat.style.display = 'grid';
    heat.style.gridTemplateColumns = 'repeat(' + COLS + ',1fr)';
    heat.style.gridTemplateRows = 'repeat(' + ROWS + ',1fr)';
    heat.innerHTML = html;
  }
  function paintGrid(heat, m) {
    var dark = isDark(), kids = heat.children;
    for (var i = 0; i < kids.length; i++) {
      var cell = m.cells[i];
      if (!cell) continue;
      if (cell.inside === 'out') { kids[i].style.background = 'transparent'; kids[i].textContent = ''; continue; }
      kids[i].style.background = rampColor(toneV(cell.fc), dark);
      kids[i].textContent = cell.fc.toFixed(1);
      kids[i].style.opacity = cell.inside ? '1' : '0.44';
    }
  }
  function fmtStatus(m, uniLimit) {
    var lim = uniLimit || 20;
    var okMin = m.min >= 0.2, okUni = m.maxmin > 0 && m.maxmin <= lim;
    return {
      pass: okMin && okUni,
      text: (okMin && okUni ? 'MEETS BASIC TARGET' : 'BELOW BASIC TARGET') +
        ' · MIN ' + m.min.toFixed(1) + (okMin ? ' FC ≥ 0.2' : ' FC < 0.2') +
        ' · MAX:MIN ' + m.maxmin.toFixed(1) + (okUni ? ':1 ≤ ' + lim + ':1' : ':1 > ' + lim + ':1')
    };
  }
  function setMetrics(rootId, m, uniLimit) {
    var $ = function (s) { return document.querySelector('#' + rootId + ' [data-m="' + s + '"]'); };
    var pairs = { avg: [m.avg, 2], max: [m.max, 2], min: [m.min, 1], avgmin: [m.avgmin, 1], maxmin: [m.maxmin, 1] };
    for (var kk in pairs) { var el = $(kk); if (el) el.textContent = pairs[kk][0].toFixed(pairs[kk][1]); }
    var st = fmtStatus(m, uniLimit), ies = $('ies');
    if (ies) { ies.textContent = st.text; ies.classList.toggle('ok', st.pass); ies.classList.toggle('below', !st.pass); }
    return st;
  }
  var liveT = null;
  function announce(el, msg) { // throttled polite announcements
    if (!el) return;
    clearTimeout(liveT);
    liveT = setTimeout(function () { el.textContent = msg; }, 350);
  }
  function watchTheme(repaint) {
    var top = document.getElementById('top');
    if (!top || !window.MutationObserver) return;
    new MutationObserver(repaint).observe(top, { attributes: true, attributeFilter: ['class'] });
  }
  var clamp01 = function (v) { return Math.min(0.97, Math.max(0.03, v)); };

  /* =====================================================================
     INTERACTIVE A — the photometric sandbox
     ===================================================================== */
  function initSandbox() {
    var root = document.getElementById('las-a');
    if (!root) return;
    var heat = root.querySelector('.las-heat'), layer = root.querySelector('.las-fx'),
        live = root.querySelector('.las-live'), addBtn = root.querySelector('[data-act="add"]'),
        delBtn = root.querySelector('[data-act="del"]'), resetBtn = root.querySelector('[data-act="reset"]'),
        count = root.querySelector('.las-count');
    var inside = function (px, py) { return Math.min(px, 1 - px, py, 1 - py) > EDGE; };
    var cx4 = [0.16, 0.39, 0.61, 0.84], cy4 = [0.17, 0.39, 0.61, 0.83];
    var DEF = []; cx4.forEach(function (x) { cy4.forEach(function (y) { DEF.push({ x: x, y: y }); }); });
    var fx = DEF.map(function (p) { return { x: p.x, y: p.y }; });
    var K = calibrate(DEF, inside);
    var sel = -1, drag = -1, skipA = false;

    buildGrid(heat);

    function render(announceMsg) {
      var m = metrics(fx, K, inside);
      paintGrid(heat, m);
      var st = setMetrics('las-a', m, 20);
      // fixture buttons (roving tabindex: selected or first is tabbable)
      var html = '';
      for (var i = 0; i < fx.length; i++) {
        html += '<button type="button" class="las-pole' + (i === sel ? ' on' : '') + '" data-i="' + i +
          '" style="left:' + (fx[i].x * 100).toFixed(2) + '%;top:' + (fx[i].y * 100).toFixed(2) + '%" ' +
          'tabindex="' + ((sel >= 0 ? i === sel : i === 0) ? '0' : '-1') + '" ' +
          'aria-label="Luminaire ' + (i + 1) + ' of ' + fx.length + '. Arrow keys move it, Delete removes it."></button>';
      }
      layer.innerHTML = html;
      if (count) count.textContent = fx.length + ' × GALN Galleon II';
      if (delBtn) delBtn.disabled = !(sel >= 0 && fx.length > 1);
      if (announceMsg !== false) announce(live, (announceMsg || '') + ' Average ' + m.avg.toFixed(2) + ' foot-candles, max to min ' + m.maxmin.toFixed(1) + ' to 1. ' + (st.pass ? 'Meets' : 'Below') + ' the basic target.');
    }

    function plateXY(ev) {
      var r = heat.getBoundingClientRect();
      return { x: clamp01((ev.clientX - r.left) / r.width), y: clamp01((ev.clientY - r.top) / r.height) };
    }

    layer.addEventListener('pointerdown', function (e) {
      var b = e.target.closest('.las-pole');
      skipA = !!b; // a pole press means the following click is selection, not add
      if (!b) return;
      sel = +b.dataset.i; drag = sel; render(false);
      try { layer.setPointerCapture(e.pointerId); } catch (er) {}
      e.preventDefault();
    });
    layer.addEventListener('pointermove', function (e) {
      if (drag < 0 || !fx[drag]) return;
      var p = plateXY(e); fx[drag].x = p.x; fx[drag].y = p.y; render(false);
    });
    var endDrag = function () { if (drag >= 0) { drag = -1; render('Luminaire moved.'); } };
    layer.addEventListener('pointerup', endDrag);
    layer.addEventListener('pointercancel', endDrag);
    // click empty plate = add there; double-click a pole = remove
    layer.addEventListener('click', function (e) {
      if (e.target.closest('.las-pole')) return;
      if (skipA) { skipA = false; return; }
      if (fx.length >= 24) return;
      var p = plateXY(e); fx.push({ x: p.x, y: p.y }); sel = fx.length - 1;
      render('Luminaire added.');
    });
    layer.addEventListener('dblclick', function (e) {
      var b = e.target.closest('.las-pole'); if (!b || fx.length <= 1) return;
      fx.splice(+b.dataset.i, 1); sel = -1; render('Luminaire removed.');
      e.preventDefault();
    });
    // keyboard: arrows move the focused pole one grid cell; Delete removes
    layer.addEventListener('keydown', function (e) {
      var b = e.target.closest('.las-pole'); if (!b) return;
      var i = +b.dataset.i, sx = 1 / COLS, sy = 1 / ROWS, moved = false;
      if (e.key === 'ArrowLeft') { fx[i].x = clamp01(fx[i].x - sx); moved = true; }
      else if (e.key === 'ArrowRight') { fx[i].x = clamp01(fx[i].x + sx); moved = true; }
      else if (e.key === 'ArrowUp') { fx[i].y = clamp01(fx[i].y - sy); moved = true; }
      else if (e.key === 'ArrowDown') { fx[i].y = clamp01(fx[i].y + sy); moved = true; }
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (fx.length > 1) { fx.splice(i, 1); sel = -1; render('Luminaire removed.'); }
        e.preventDefault(); return;
      } else if (e.key === 'Enter' || e.key === ' ') { sel = i; render(false); e.preventDefault(); return; }
      if (moved) {
        sel = i; render(false);
        var nb = layer.querySelector('.las-pole[data-i="' + i + '"]'); if (nb) nb.focus();
        e.preventDefault();
      }
    });
    if (addBtn) addBtn.addEventListener('click', function () {
      if (fx.length >= 24) return;
      var n = fx.length, a = n * 1.35, rad = 0.1 + (n % 4) * 0.055;
      fx.push({ x: clamp01(0.5 + Math.cos(a) * rad * 1.5), y: clamp01(0.5 + Math.sin(a) * rad) });
      sel = fx.length - 1; render('Luminaire added.');
    });
    if (delBtn) delBtn.addEventListener('click', function () {
      if (sel >= 0 && fx.length > 1) { fx.splice(sel, 1); sel = -1; render('Luminaire removed.'); }
    });
    if (resetBtn) resetBtn.addEventListener('click', function () {
      fx = DEF.map(function (p) { return { x: p.x, y: p.y }; }); sel = -1; drag = -1;
      render('Layout reset to the sixteen-pole default.');
    });
    watchTheme(function () { render(false); });
    render(false);
  }

  /* =====================================================================
     INTERACTIVE B — AI AutoLayout: boundary → goals → candidates → refine
     ===================================================================== */
  function initAutolayout() {
    var root = document.getElementById('las-b');
    if (!root) return;
    var heat = root.querySelector('.las-heat'), layer = root.querySelector('.las-fx'),
        live = root.querySelector('.las-live'), genBtn = root.querySelector('[data-act="generate"]'),
        rerank = root.querySelector('[data-act="rerank"]'), prog = root.querySelector('.las-prog'),
        progFill = root.querySelector('.las-prog i'), progLbl = root.querySelector('.las-stage'),
        cards = root.querySelector('.las-cands'), poleOut = root.querySelector('[data-out="poles"]'),
        poleIn = root.querySelector('[data-in="poles"]'), uniIn = root.querySelector('[data-in="uni"]'),
        pinIn = root.querySelector('[data-in="pin"]'),
        addB = root.querySelector('[data-act="addpole"]'), delB = root.querySelector('[data-act="delpole"]'),
        infoBtn = root.querySelector('[data-act="lasinfo"]'), infoDlg = root.querySelector('#las-b-info'),
        infoClose = root.querySelector('.las-info-close');

    /* boundary presets: inside() over normalized plate space */
    var BOUNDS = {
      rect: { name: 'Rectangular lot', fn: function (px, py) { return Math.min(px, 1 - px, py, 1 - py) > EDGE; } },
      lshape: { name: 'L-shaped lot', fn: function (px, py) {
        if (Math.min(px, 1 - px, py, 1 - py) <= EDGE) return false;
        return !(px > 0.56 && py < 0.48); // notch out the top-right
      } },
      excl: { name: 'Lot + building', fn: function (px, py) {
        if (Math.min(px, 1 - px, py, 1 - py) <= EDGE) return false;
        return !(px > 0.40 && px < 0.62 && py > 0.34 && py < 0.68); // central building pad
      } }
    };
    var bKey = 'rect';
    var K = null, fx = [], sel = -1, drag = -1, chosen = -1, lastCands = null, skipB = false;

    buildGrid(heat);

    function insideFn() { return BOUNDS[bKey].fn; }
    /* grid discipline: every generated pole snaps to a calculation-grid cell
       centre, stays inside the boundary, and never doubles up on a cell —
       layouts read as engineered rows, the way the shipped autolayout places
       poles, not as scatter. Fully deterministic (no randomness). */
    function projectInside(p) {
      var f = insideFn();
      if (f(p.x, p.y)) return p;
      for (var t = 0; t < 40; t++) { p.x += (0.5 - p.x) * 0.08; p.y += (0.5 - p.y) * 0.08; if (f(p.x, p.y)) break; }
      return p;
    }
    function cellOf(p) { return { c: Math.max(0, Math.min(COLS - 1, Math.round(p.x * COLS - 0.5))), r: Math.max(0, Math.min(ROWS - 1, Math.round(p.y * ROWS - 0.5))) }; }
    function centreOf(c, r) { return { x: (c + 0.5) / COLS, y: (r + 0.5) / ROWS }; }
    function snapInto(out, p) {
      var f = insideFn(), start = cellOf(projectInside({ x: p.x, y: p.y }));
      var taken = {}; out.forEach(function (q) { var cc = cellOf(q); taken[cc.c + ':' + cc.r] = 1; });
      // search the nearest free, in-boundary cell in expanding rings (deterministic order)
      for (var rad = 0; rad < Math.max(COLS, ROWS); rad++) {
        for (var dr = -rad; dr <= rad; dr++) for (var dc = -rad; dc <= rad; dc++) {
          if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
          var c = start.c + dc, r = start.r + dr;
          if (c < 0 || c >= COLS || r < 0 || r >= ROWS || taken[c + ':' + r]) continue;
          var q = centreOf(c, r);
          if (f(q.x, q.y)) { if (p.pin) q.pin = true; out.push(q); return; }
        }
      }
    }
    /* three heuristic generators — different characters, all grid-true */
    function genUniform(n, pin) {
      var out = []; if (pin) snapInto(out, { x: 0.2, y: 0.2, pin: true });
      var need = n - out.length;
      var cols = Math.ceil(Math.sqrt(need * 1.5)), rows = Math.ceil(need / cols);
      for (var r = 0; r < rows && out.length < n; r++) for (var c = 0; c < cols && out.length < n; c++) {
        snapInto(out, { x: 0.24 + (cols === 1 ? 0.26 : c * (0.52 / (cols - 1))), y: 0.24 + (rows === 1 ? 0.26 : r * (0.52 / (rows - 1))) });
      }
      return out;
    }
    function genPerimeter(n, pin) {
      var out = []; if (pin) snapInto(out, { x: 0.2, y: 0.2, pin: true });
      var need = n - out.length;
      // evenly walk a rectangular inset ring: top L→R, right T→B, bottom R→L, left B→T
      var x0 = 0.22, x1 = 0.78, y0 = 0.22, y1 = 0.78;
      var W = x1 - x0, H = y1 - y0, P = 2 * (W + H);
      for (var i = 0; i < need; i++) {
        var d = (i / need) * P, p;
        if (d < W) p = { x: x0 + d, y: y0 };
        else if (d < W + H) p = { x: x1, y: y0 + (d - W) };
        else if (d < 2 * W + H) p = { x: x1 - (d - W - H), y: y1 };
        else p = { x: x0, y: y1 - (d - 2 * W - H) };
        snapInto(out, p);
      }
      return out;
    }
    function genHybrid(n, pin) {
      var out = []; if (pin) snapInto(out, { x: 0.2, y: 0.2, pin: true });
      var corners = [{ x: 0.24, y: 0.24 }, { x: 0.76, y: 0.24 }, { x: 0.24, y: 0.76 }, { x: 0.76, y: 0.76 }];
      for (var i = 0; i < corners.length && out.length < n; i++) snapInto(out, corners[i]);
      // remaining poles infill the centre line, evenly spaced — a spine, not scatter
      var left = n - out.length;
      for (var j = 0; j < left; j++) {
        snapInto(out, { x: left === 1 ? 0.5 : 0.3 + j * (0.4 / (left - 1)), y: 0.5 });
      }
      return out;
    }
    function score(layout, uniLimit) {
      if (K == null) K = calibrate(genUniform(16, false), BOUNDS.rect.fn);
      var f = insideFn();
      var m = metrics(layout, K, function (px, py) { return f(px, py); });
      var st = fmtStatus(m, uniLimit);
      return { m: m, pass: st.pass };
    }
    function paint(layout) {
      var f = insideFn();
      var m = metrics(layout, K, function (px, py) { return f(px, py); });
      // cells fully outside the boundary render as void
      var i = 0;
      for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++, i++) {
        var px = (c + 0.5) / COLS, py = (r + 0.5) / ROWS;
        if (!BOUNDS.rect.fn(px, py) || (!f(px, py) && Math.min(px, 1 - px, py, 1 - py) > EDGE)) m.cells[i].inside = f(px, py) ? m.cells[i].inside : (BOUNDS.rect.fn(px, py) ? 'out' : m.cells[i].inside && false);
      }
      paintGrid(heat, m);
      return m;
    }
    function renderPoles(layout, editable) {
      var html = '';
      for (var i = 0; i < layout.length; i++) {
        html += '<button type="button" class="las-pole' + (i === sel ? ' on' : '') + (layout[i].pin ? ' pin' : '') + '" data-i="' + i +
          '" style="left:' + (layout[i].x * 100).toFixed(2) + '%;top:' + (layout[i].y * 100).toFixed(2) + '%" ' +
          'tabindex="' + (editable ? ((sel >= 0 ? i === sel : i === 0) ? '0' : '-1') : '-1') + '" ' +
          (editable ? '' : 'disabled ') +
          'aria-label="Pole ' + (i + 1) + ' of ' + layout.length + (layout[i].pin ? ', pinned' : '') + (editable ? '. Arrow keys move it, Delete removes it.' : '') + '"></button>';
      }
      layer.innerHTML = html;
    }
    function refresh(annMsg) {
      var m = paint(fx);
      var st = setMetrics('las-b', m, +((uniIn && uniIn.value) || 20));
      renderPoles(fx, true);
      if (addB) addB.disabled = !fx.length || fx.length >= 24;
      if (delB) delB.disabled = !(sel >= 0 && fx.length > 1);
      if (annMsg) announce(live, annMsg + ' Average ' + m.avg.toFixed(2) + ' foot-candles, max to min ' + m.maxmin.toFixed(1) + ' to 1. ' + (st.pass ? 'Meets target.' : 'Below target.'));
    }

    /* boundary chip group */
    root.querySelectorAll('[data-bound]').forEach(function (b) {
      b.addEventListener('click', function () {
        bKey = b.dataset.bound;
        root.querySelectorAll('[data-bound]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        K = null; fx = []; sel = -1; chosen = -1; lastCands = null;
        if (cards) { cards.innerHTML = ''; cards.hidden = true; }
        if (rerank) rerank.disabled = true;
        if (addB) addB.disabled = true;
        if (delB) delB.disabled = true;
        var f = insideFn();
        var m = metrics([], 1, function (px, py) { return f(px, py); });
        // paint the empty boundary (all cells 0)
        K = calibrate(genUniform(16, false), BOUNDS.rect.fn);
        paint([]);
        renderPoles([], false);
        announce(live, BOUNDS[bKey].name + ' boundary selected.');
      });
    });
    if (poleIn && poleOut) {
      var syncPole = function () { poleOut.textContent = poleIn.value + ' poles'; };
      poleIn.addEventListener('input', syncPole); syncPole();
    }

    var STAGES = ['generating layouts', 'calculating photometrics', 'solving against targets', 'complete'];
    function generate() {
      var n = +((poleIn && poleIn.value) || 6);
      var uniLimit = +((uniIn && uniIn.value) || 20);
      var pin = !!(pinIn && pinIn.checked);
      var makes = [
        { key: 'A', name: 'Uniform grid', fx: genUniform(n, pin) },
        { key: 'B', name: 'Perimeter ring', fx: genPerimeter(n, pin) },
        { key: 'C', name: 'Corners + spine', fx: genHybrid(n, pin) }
      ];
      makes.forEach(function (cand) { var s = score(cand.fx, uniLimit); cand.m = s.m; cand.pass = s.pass; });
      // rank: pass first, then lowest max:min
      makes.sort(function (a, b) { return (b.pass - a.pass) || (a.m.maxmin - b.m.maxmin); });
      lastCands = makes; chosen = -1;

      var showCards = function () {
        if (!cards) return;
        cards.hidden = false;
        cards.innerHTML = makes.map(function (cand, i) {
          return '<button type="button" role="radio" aria-checked="false" class="las-cand" data-c="' + i + '">' +
            '<span class="las-cand-k">' + (i === 0 ? 'RANK 1 · ' : i === 1 ? 'RANK 2 · ' : 'RANK 3 · ') + cand.name + '</span>' +
            '<span class="las-cand-m">AVG ' + cand.m.avg.toFixed(2) + ' FC · MIN ' + cand.m.min.toFixed(1) + ' · MAX:MIN ' + cand.m.maxmin.toFixed(1) + ':1</span>' +
            '<span class="las-cand-s ' + (cand.pass ? 'ok' : 'below') + '">' + (cand.pass ? '✓ meets target' : '✕ below target') + '</span></button>';
        }).join('');
        cards.querySelectorAll('.las-cand').forEach(function (cb) {
          cb.addEventListener('click', function () { pick(+cb.dataset.c); });
        });
        announce(live, 'Three candidate layouts ranked. Rank one, ' + makes[0].name + ', ' + (makes[0].pass ? 'meets' : 'is below') + ' the target. Choose one to refine.');
        pick(0);
      };

      if (REDUCE || !prog) {
        if (progLbl) progLbl.textContent = STAGES[3];
        showCards();
        return;
      }
      // staged progress with honest labels (~1.8 s, simulated)
      genBtn.disabled = true;
      prog.hidden = false;
      if (cards) { cards.hidden = true; cards.innerHTML = ''; }
      var t = 0, steps = [
        [0, 8], [450, 40], [1000, 74], [1650, 100]
      ];
      steps.forEach(function (st, i) {
        setTimeout(function () {
          if (progFill) progFill.style.width = st[1] + '%';
          if (progLbl) progLbl.textContent = STAGES[i];
          if (prog) prog.setAttribute('aria-valuenow', String(st[1]));
          if (i === steps.length - 1) { genBtn.disabled = false; setTimeout(showCards, 180); }
        }, st[0]);
      });
    }
    function pick(i) {
      if (!lastCands || !lastCands[i]) return;
      chosen = i;
      if (cards) cards.querySelectorAll('.las-cand').forEach(function (cb, j) {
        cb.setAttribute('aria-checked', j === i ? 'true' : 'false');
        cb.classList.toggle('on', j === i);
      });
      fx = lastCands[i].fx.map(function (p) { return { x: p.x, y: p.y, pin: p.pin }; });
      sel = -1;
      if (rerank) rerank.disabled = false;
      refresh('Loaded candidate ' + lastCands[i].name + ' for refinement.');
    }
    if (genBtn) genBtn.addEventListener('click', generate);
    if (rerank) rerank.addEventListener('click', function () {
      if (!lastCands || chosen < 0) return;
      var uniLimit = +((uniIn && uniIn.value) || 20);
      var mine = score(fx, uniLimit);
      var beat = lastCands.filter(function (cand, i) { return i !== chosen && (cand.pass > mine.pass || (cand.pass === mine.pass && cand.m.maxmin < mine.m.maxmin)); }).length;
      var rank = beat + 1;
      announce(live, 'Your edited layout ranks ' + rank + ' of 3 against the generated candidates. Max to min ' + mine.m.maxmin.toFixed(1) + ' to 1, ' + (mine.pass ? 'meets target.' : 'below target.'));
      var out = root.querySelector('.las-rank');
      if (out) out.textContent = 'YOUR EDIT RANKS ' + rank + '/3 · MAX:MIN ' + mine.m.maxmin.toFixed(1) + ':1 · ' + (mine.pass ? 'MEETS TARGET' : 'BELOW TARGET');
    });

    /* manual tweaks after generation: add / delete / info, the homepage map's verbs */
    if (addB) addB.addEventListener('click', function () {
      if (!fx.length || fx.length >= 24) return;
      var before = fx.length;
      snapInto(fx, { x: 0.5, y: 0.5 });
      if (fx.length > before) { sel = fx.length - 1; refresh('Pole added, snapped to the nearest free cell.'); }
    });
    if (delB) delB.addEventListener('click', function () {
      if (!(sel >= 0 && fx.length > 1)) return;
      fx.splice(sel, 1); sel = -1; refresh('Pole removed.');
      var fb = layer.querySelector('.las-pole'); if (fb) fb.focus();
    });
    // click an empty spot on the plate = add there (post-generation only);
    // the listener sits on the layer because .las-fx covers .las-heat
    layer.addEventListener('click', function (e) {
      if (e.target.closest('.las-pole')) return;
      if (skipB) { skipB = false; return; }
      if (!fx.length || fx.length >= 24) return;
      var before = fx.length;
      snapInto(fx, plateXY(e));
      if (fx.length > before) { sel = fx.length - 1; refresh('Pole added at the nearest free cell.'); }
    });
    function infoOpen(open) {
      if (!infoDlg) return;
      infoDlg.hidden = !open;
      if (infoBtn) infoBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && infoClose) infoClose.focus();
      else if (!open && infoBtn) infoBtn.focus();
    }
    if (infoBtn) infoBtn.addEventListener('click', function () { infoOpen(infoDlg && infoDlg.hidden); });
    if (infoClose) infoClose.addEventListener('click', function () { infoOpen(false); });
    if (infoDlg) {
      infoDlg.addEventListener('click', function (e) { if (e.target === infoDlg) infoOpen(false); });
      infoDlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') { infoOpen(false); e.stopPropagation(); } });
    }

    /* refine-stage interactions (drag + keyboard, same grammar as A) */
    function plateXY(ev) {
      var r = heat.getBoundingClientRect();
      return { x: clamp01((ev.clientX - r.left) / r.width), y: clamp01((ev.clientY - r.top) / r.height) };
    }
    layer.addEventListener('pointerdown', function (e) {
      var b = e.target.closest('.las-pole');
      skipB = !!b; // a pole press means the following click is selection, not add
      if (!b || b.disabled) return;
      sel = +b.dataset.i; drag = sel; refresh();
      try { layer.setPointerCapture(e.pointerId); } catch (er) {}
      e.preventDefault();
    });
    layer.addEventListener('pointermove', function (e) {
      if (drag < 0 || !fx[drag]) return;
      var p = projectInside(plateXY(e)); fx[drag].x = p.x; fx[drag].y = p.y;
      var m = paint(fx); setMetrics('las-b', m, +((uniIn && uniIn.value) || 20)); renderPoles(fx, true);
    });
    var endDragB = function () {
      if (drag >= 0) {
        var i = drag; drag = -1;
        if (fx[i]) { var cc = cellOf(fx[i]); var q = centreOf(cc.c, cc.r); var f2 = insideFn();
          if (f2(q.x, q.y)) { fx[i].x = q.x; fx[i].y = q.y; } else { var pj = projectInside(fx[i]); var c2 = cellOf(pj); var q2 = centreOf(c2.c, c2.r); fx[i].x = q2.x; fx[i].y = q2.y; } }
        refresh('Pole moved, snapped to grid.');
      }
    };
    layer.addEventListener('pointerup', endDragB);
    layer.addEventListener('pointercancel', endDragB);
    layer.addEventListener('keydown', function (e) {
      var b = e.target.closest('.las-pole'); if (!b || !fx[+b.dataset.i]) return;
      var i = +b.dataset.i, sx = 1 / COLS, sy = 1 / ROWS, moved = false;
      if (e.key === 'ArrowLeft') { fx[i].x = clamp01(fx[i].x - sx); moved = true; }
      else if (e.key === 'ArrowRight') { fx[i].x = clamp01(fx[i].x + sx); moved = true; }
      else if (e.key === 'ArrowUp') { fx[i].y = clamp01(fx[i].y - sy); moved = true; }
      else if (e.key === 'ArrowDown') { fx[i].y = clamp01(fx[i].y + sy); moved = true; }
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (fx.length > 1) { fx.splice(i, 1); sel = -1; refresh('Pole removed.'); var fb = layer.querySelector('.las-pole'); if (fb) fb.focus(); }
        e.preventDefault(); return;
      } else if (e.key === 'Enter' || e.key === ' ') { sel = i; refresh(); e.preventDefault(); return; }
      if (moved) {
        fx[i] = projectInside(fx[i]); sel = i; refresh();
        var nb = layer.querySelector('.las-pole[data-i="' + i + '"]'); if (nb) nb.focus();
        e.preventDefault();
      }
    });
    watchTheme(function () { if (fx.length) refresh(); });
    // initial paint: empty rect boundary
    K = calibrate(genUniform(16, false), BOUNDS.rect.fn);
    paint([]);
  }

  /* =====================================================================
     INTERACTIVE C — the IES library: filter before load
     ===================================================================== */
  function initIesFilter() {
    var root = document.getElementById('las-c');
    if (!root) return;
    var counter = root.querySelector('.las-ies-count'), out = root.querySelector('.las-ies-cards'),
        note = root.querySelector('.las-ies-note'), live = root.querySelector('.las-live');
    var sels = {
      app: root.querySelector('[data-f="app"]'),
      optic: root.querySelector('[data-f="optic"]'),
      cct: root.querySelector('[data-f="cct"]'),
      lm: root.querySelector('[data-f="lm"]')
    };
    var animT = null;
    function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function famFor(app) {
      return app === 'Sports' ? 'CCS Champion' : app === 'Wall' ? 'GWC Galleon Wall' : app === 'Roadway' ? 'NVN Navion' : 'GALN Galleon II';
    }
    function update() {
      var app = sels.app.value, optic = sels.optic.value;
      if (!app || !optic) {
        if (counter) counter.textContent = '5,000 FILES · 0 LOADED';
        if (out) out.innerHTML = '<div class="las-ies-locked">Pick an application and an optic to load results — the library never renders unfiltered.</div>';
        if (note) note.hidden = true;
        return;
      }
      var cct = sels.cct.value || 'any', lm = sels.lm.value || 'any';
      var h = hash(app + optic + cct + lm);
      var results = 24 + (h % 73); // deterministic, representative double digits
      var shown = Math.min(8, results);
      if (counter) {
        if (REDUCE || !window.requestAnimationFrame) counter.textContent = results + ' RESULTS · SHOWING ' + shown;
        else {
          // quick countdown feel: 5000 -> results
          var start = null, from = 5000;
          cancelAnimationFrame(animT);
          var tick = function (ts) {
            if (!start) start = ts;
            var p = Math.min(1, (ts - start) / 420), eased = 1 - Math.pow(1 - p, 3);
            counter.textContent = Math.round(from + (results - from) * eased) + (p >= 1 ? ' RESULTS · SHOWING ' + shown : ' …');
            if (p < 1) animT = requestAnimationFrame(tick);
          };
          animT = requestAnimationFrame(tick);
        }
      }
      var fam = famFor(app), cards = '';
      for (var i = 0; i < shown; i++) {
        var lmv = lm === 'any' ? (8 + ((h >> (i + 2)) % 14)) : (lm === '4-8k' ? 4 + (i % 4) : lm === '8-16k' ? 8 + (i % 8) : 16 + (i % 6));
        var wv = Math.round(lmv * (7.4 + (i % 3)));
        cards += '<div class="las-ies-card"><span class="las-ies-name">' + fam.split(' ')[0] + '-' + (cct === 'any' ? '740' : '7' + cct.slice(0, 2)) + '-' + optic + '-' + (i + 1) + '</span>' +
          '<span class="las-ies-spec">' + (cct === 'any' ? '4000K' : cct) + ' · ' + lmv + ',000 lm · ' + wv + ' W · ' + optic + '</span>' +
          '<span class="las-ies-fam">' + fam + '</span></div>';
      }
      if (out) out.innerHTML = cards;
      if (note) note.hidden = false;
      announce(live, results + ' of 5,000 files match. Showing ' + shown + ' representative results for ' + app + ' with ' + optic + ' optics.');
    }
    Object.keys(sels).forEach(function (kk) { if (sels[kk]) sels[kk].addEventListener('change', update); });
    update();
  }


  /* =====================================================================
     INTERACTIVE D — the shipped IES library screen, rebuilt as a working
     replica of assets/la/ies-library.jpg: header with live counts + search
     + grid/list toggle, collapsible filter rail (CCT · lumens · power ·
     optics), selectable cards with QS badges, per-card IES download, and
     the GO BACK / USE SELECTED footer. Catalog is deterministic and
     clearly labeled representative.
     ===================================================================== */
  function initIesScreen() {
    var shot = document.getElementById('la-ies-screen');
    if (!shot || shot.dataset.built) return;
    shot.dataset.built = '1';
    var img = shot.querySelector('img');

    /* palette lifted from the shipped screen */
    var UI = { ink: '#1d2433', dim: '#667085', line: '#e4e7ec', canvas: '#f2f4f7',
               red: '#d92d20', qs: '#ff4405', bolt: '#fdb022', blob: '#f5ecd4', blobEdge: '#d9c9a3' };

    if (!document.getElementById('la-ies-css')) {
      var st = document.createElement('style');
      st.id = 'la-ies-css';
      st.textContent =
        '#la-ies-screen{background:#fff;}' +
        '#la-ies-screen .ies-app{display:flex;flex-direction:column;font-family:"Inter",sans-serif;color:' + UI.ink + ';background:#fff;height:700px;text-align:left;}' +
        '#la-ies-screen .ies-app *{box-sizing:border-box;}' +
        '#la-ies-screen button{font:inherit;color:inherit;background:none;border:none;cursor:pointer;padding:0;}' +
        '#la-ies-screen button:focus-visible,#la-ies-screen input:focus-visible{outline:2px solid ' + UI.red + ';outline-offset:2px;}' +
        '#la-ies-screen .ies-head{display:flex;align-items:center;gap:16px;padding:12px 18px;border-bottom:1px solid ' + UI.line + ';flex-wrap:wrap;}' +
        '#la-ies-screen .ies-title{font-weight:700;font-size:15.5px;letter-spacing:-0.01em;white-space:nowrap;}' +
        '#la-ies-screen .ies-count{font-size:14px;white-space:nowrap;}' +
        '#la-ies-screen .ies-count b{font-weight:700;}' +
        '#la-ies-screen .ies-search{margin-left:auto;display:flex;align-items:center;gap:6px;border-bottom:1.5px solid ' + UI.line + ';padding:5px 4px;min-width:180px;}' +
        '#la-ies-screen .ies-search input{border:none;background:none;font-size:13px;color:' + UI.ink + ';width:150px;padding:2px;}' +
        '#la-ies-screen .ies-search .msi{font-size:24px;color:' + UI.ink + ';}' +
        '#la-ies-screen .ies-views{display:flex;border:1px solid ' + UI.ink + ';border-radius:4px;overflow:hidden;}' +
        '#la-ies-screen .ies-view{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;font-family:"JetBrains Mono",monospace;font-size:11px;font-weight:700;letter-spacing:0.06em;min-height:40px;}' +
        '#la-ies-screen .ies-view+.ies-view{border-left:1px solid ' + UI.ink + ';}' +
        '#la-ies-screen .ies-view[aria-pressed="true"]{background:' + UI.ink + ';color:#fff;}' +
        '#la-ies-screen .ies-view .msi{font-size:24px;}' +
        '#la-ies-screen .ies-body{display:flex;align-items:stretch;flex:1;min-height:0;overflow:hidden;}' +
        '#la-ies-screen .ies-rail{width:250px;flex:none;border-right:1px solid ' + UI.line + ';overflow-y:auto;scrollbar-width:thin;}' +
        '#la-ies-screen .ies-rail-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid ' + UI.line + ';}' +
        '#la-ies-screen .ies-rail-head b{font-size:14px;font-weight:700;}' +
        '#la-ies-screen .ies-clear{color:' + UI.red + ';font-weight:700;font-size:13px;}' +
        '#la-ies-screen .ies-group summary,#la-ies-screen .ies-ghead{display:flex;align-items:center;justify-content:space-between;width:100%;padding:13px 16px;font-size:13.5px;font-weight:600;border-bottom:1px solid ' + UI.line + ';}' +
        '#la-ies-screen .ies-ghead .msi{font-size:24px;color:' + UI.ink + ';}' +
        '#la-ies-screen .ies-opt{display:flex;align-items:center;gap:10px;padding:11px 16px;border-bottom:1px solid ' + UI.line + ';font-size:13px;cursor:pointer;min-height:42px;}' +
        '#la-ies-screen .ies-opt input{appearance:none;-webkit-appearance:none;width:17px;height:17px;border:1.6px solid #98a2b3;border-radius:3px;margin:0;flex:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;background:#fff;}' +
        '#la-ies-screen .ies-opt input:checked{background:' + UI.red + ';border-color:' + UI.red + ';}' +
        '#la-ies-screen .ies-opt input:checked::after{content:"";width:9px;height:5px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg) translate(1px,-1px);}' +
        '#la-ies-screen .ies-main{flex:1;min-width:0;background:' + UI.canvas + ';padding:16px;display:flex;flex-direction:column;overflow-y:auto;scrollbar-width:thin;}' +
        '#la-ies-screen .ies-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(196px,1fr));gap:14px;align-content:start;}' +
        '#la-ies-screen .ies-card{background:#fff;border-radius:8px;padding:12px 12px 14px;box-shadow:0 1px 2px rgba(16,24,40,0.06);}' +
        '#la-ies-screen .ies-code-row{display:flex;align-items:center;gap:7px;min-height:22px;}' +
        '#la-ies-screen .ies-check{appearance:none;-webkit-appearance:none;width:17px;height:17px;border:1.6px solid #98a2b3;border-radius:3px;margin:0;flex:none;cursor:pointer;display:none;align-items:center;justify-content:center;background:#fff;}' +
        '#la-ies-screen .ies-card:hover .ies-check,#la-ies-screen .ies-check:checked,#la-ies-screen .ies-check:focus-visible{display:inline-flex;}' +
        '#la-ies-screen .ies-check:checked{background:' + UI.red + ';border-color:' + UI.red + ';}' +
        '#la-ies-screen .ies-check:checked::after{content:"";width:9px;height:5px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg) translate(1px,-1px);}' +
        '#la-ies-screen .ies-code{font-family:"JetBrains Mono",monospace;font-size:9.5px;letter-spacing:0.04em;font-weight:600;color:' + UI.ink + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;}' +
        '#la-ies-screen .ies-qs{flex:none;font-family:"JetBrains Mono",monospace;font-size:8px;font-weight:700;color:#fff;background:' + UI.qs + ';border-radius:4px;padding:2.5px 4px;letter-spacing:0.04em;}' +
        '#la-ies-screen .ies-stats{display:flex;justify-content:space-between;gap:6px;padding:12px 2px 12px;}' +
        '#la-ies-screen .ies-stat{flex:1;text-align:center;}' +
        '#la-ies-screen .ies-ic{height:30px;display:flex;align-items:center;justify-content:center;}' +
        '#la-ies-screen .ies-blob{width:30px;height:17px;background:radial-gradient(60% 100% at 50% 0%,' + UI.blob + ' 62%,transparent 63%);border-radius:50% 50% 46% 46%;background-color:' + UI.blob + ';border:1px solid ' + UI.blobEdge + ';border-top-color:transparent;box-shadow:inset 0 -2px 4px rgba(150,120,60,0.18);}' +
        '#la-ies-screen .ies-ic .msi{font-size:24px;}' +
        '#la-ies-screen .ies-stat-k{font-size:10.5px;font-weight:700;margin-top:4px;}' +
        '#la-ies-screen .ies-stat-v{font-size:11px;font-weight:600;color:' + UI.ink + ';}' +
        '#la-ies-screen .ies-pdf{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border:1.4px solid ' + UI.ink + ';border-radius:5px;padding:8px 6px;font-family:"JetBrains Mono",monospace;font-size:10.5px;font-weight:700;letter-spacing:0.05em;min-height:38px;}' +
        '#la-ies-screen .ies-pdf:hover{background:' + UI.canvas + ';}' +
        '#la-ies-screen .ies-pdf .msi{font-size:24px;}' +
        '#la-ies-screen .ies-rows{display:flex;flex-direction:column;gap:8px;}' +
        '#la-ies-screen .ies-row{display:flex;align-items:center;gap:12px;background:#fff;border-radius:8px;padding:10px 14px;box-shadow:0 1px 2px rgba(16,24,40,0.06);flex-wrap:wrap;}' +
        '#la-ies-screen .ies-row .ies-check{display:inline-flex;}' +
        '#la-ies-screen .ies-row .ies-code{flex:1 1 180px;font-size:10.5px;}' +
        '#la-ies-screen .ies-row-meta{font-family:"JetBrains Mono",monospace;font-size:10px;color:' + UI.dim + ';white-space:nowrap;}' +
        '#la-ies-screen .ies-row .ies-pdf{width:auto;padding:7px 12px;min-height:36px;}' +
        '#la-ies-screen .ies-more{text-align:center;font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:0.06em;color:' + UI.dim + ';padding:14px 0 2px;}' +
        '#la-ies-screen .ies-empty{padding:60px 20px;text-align:center;color:' + UI.dim + ';font-size:13.5px;line-height:1.6;}' +
        '#la-ies-screen .ies-foot{display:flex;align-items:center;gap:12px;padding:12px 18px;border-top:1px solid ' + UI.line + ';}' +
        '#la-ies-screen .ies-note{font-family:"JetBrains Mono",monospace;font-size:9.5px;letter-spacing:0.05em;color:' + UI.dim + ';flex:1;min-width:0;}' +
        '#la-ies-screen .ies-back{border:1px solid ' + UI.line + ';border-radius:6px;padding:10px 18px;font-size:13.5px;font-weight:700;min-height:42px;}' +
        '#la-ies-screen .ies-use{background:' + UI.red + ';color:#fff;border-radius:6px;padding:10px 18px;font-size:13.5px;font-weight:700;min-height:42px;}' +
        '#la-ies-screen .ies-use:hover{filter:brightness(1.08);}' +
        '#la-ies-screen .ies-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);max-width:min(480px,92%);background:' + UI.ink + ';color:#fff;font-size:12.5px;line-height:1.5;border-radius:8px;padding:10px 16px;box-shadow:0 12px 30px rgba(16,24,40,0.35);}' +
        '@media (max-width:880px){#la-ies-screen .ies-body{flex-direction:column;}#la-ies-screen .ies-rail{width:100%;max-height:40%;flex:none;border-right:none;border-bottom:1px solid ' + UI.line + ';}#la-ies-screen .ies-search{min-width:120px;}#la-ies-screen .ies-search input{width:90px;}}' +
        '@media (prefers-reduced-motion:no-preference){#la-ies-screen .ies-card{transition:box-shadow .15s ease;}#la-ies-screen .ies-card:hover{box-shadow:0 4px 10px rgba(16,24,40,0.12);}}';
      document.head.appendChild(st);
    }

    /* deterministic representative catalog (5,000 files) */
    var seed = 0x1e5c7;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    var CCTS = [{ k: '3000K', code: '730' }, { k: '4000K', code: '740' }, { k: '5700K', code: '757' }];
    var OPTICS = ['T3', 'T4', 'T5', '5NQ', '5WQ', 'SLL', 'SLR'];
    var CAT = [];
    for (var i = 0; i < 5000; i++) {
      var cct = CCTS[(rnd() * 3) | 0];
      var lm = 4000 + Math.round(rnd() * 16500);
      var optic = OPTICS[(rnd() * OPTICS.length) | 0];
      var w = Math.round(lm / (138 + rnd() * 24));
      CAT.push({
        id: i, cct: cct.k, lm: lm, w: w, optic: optic, qs: rnd() < 0.2,
        code: 'ARCH-S-PA1-' + (Math.round(lm / 1000)) + '0-' + cct.code + '-U-' + optic
      });
    }
    /* the ten pre-selected, mirroring the shipped screenshot (rows 3–4 of the
       default grid carry the checks + QS badges) */
    var selected = {};
    for (var p = 8; p < 18; p++) { selected[p] = true; CAT[p].qs = true; }

    var S = { view: 'grid', q: '', cct: {}, lm: {}, w: {}, optic: {} };
    var LM_BUCKETS = [['4000 - 8000', 4000, 8000], ['8000 - 12000', 8000, 12000], ['12000 - 16000', 12000, 16000], ['16000 - 20000+', 16000, 99999]];
    var W_BUCKETS = [['50 - 60', 50, 60], ['60 - 70', 60, 70], ['70 - 80', 70, 80], ['80 - 90+', 80, 999]];

    /* scaffold */
    var app = document.createElement('div');
    app.className = 'ies-app';
    app.setAttribute('role', 'group');
    app.setAttribute('aria-label', 'IES library, working replica of the shipped screen');
    app.innerHTML =
      '<div class="ies-head">' +
        '<span class="ies-title">ARCH Archeon Small</span>' +
        '<span class="ies-count" id="ies-count" role="status"></span>' +
        '<label class="ies-search"><input id="ies-q" type="search" placeholder="Search" aria-label="Search the IES library by model code"><span class="msi" aria-hidden="true">search</span></label>' +
        '<div class="ies-views" role="group" aria-label="Results layout">' +
          '<button class="ies-view" id="ies-v-grid" aria-pressed="true">GRID <span class="msi" aria-hidden="true">grid_view</span></button>' +
          '<button class="ies-view" id="ies-v-list" aria-pressed="false">LIST <span class="msi" aria-hidden="true">view_list</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="ies-body">' +
        '<div class="ies-rail" id="ies-rail">' +
          '<div class="ies-rail-head"><b>Filters</b><button class="ies-clear" id="ies-clear">Clear All</button></div>' +
        '</div>' +
        '<div class="ies-main"><div id="ies-out"></div><div class="ies-more" id="ies-more"></div></div>' +
      '</div>' +
      '<div class="ies-foot">' +
        '<span class="ies-note">REPRESENTATIVE CATALOG · FILES ARE SIMULATED, THE PATTERN IS AS SHIPPED</span>' +
        '<button class="ies-back" id="ies-back">GO BACK</button>' +
        '<button class="ies-use" id="ies-use">USE SELECTED</button>' +
      '</div>';
    shot.style.position = 'relative';
    if (img) img.style.display = 'none';
    shot.appendChild(app);

    /* filter rail groups */
    var rail = app.querySelector('#ies-rail');
    function group(title, key, opts) {
      var g = document.createElement('div');
      g.className = 'ies-group';
      var open = true;
      var head = document.createElement('button');
      head.className = 'ies-ghead';
      head.setAttribute('aria-expanded', 'true');
      head.innerHTML = '<span>' + title + '</span><span class="msi" aria-hidden="true">expand_less</span>';
      var body = document.createElement('div');
      opts.forEach(function (o) {
        var lab = document.createElement('label');
        lab.className = 'ies-opt';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.addEventListener('change', function () { S[key][o] = cb.checked; render(); });
        lab.appendChild(cb);
        lab.appendChild(document.createTextNode(o));
        body.appendChild(lab);
      });
      head.addEventListener('click', function () {
        open = !open;
        body.hidden = !open;
        head.setAttribute('aria-expanded', String(open));
        head.querySelector('.msi').textContent = open ? 'expand_less' : 'expand_more';
      });
      g.appendChild(head); g.appendChild(body);
      rail.appendChild(g);
    }
    group('CCT', 'cct', CCTS.map(function (c) { return c.k; }));
    group('Lumens', 'lm', LM_BUCKETS.map(function (b) { return b[0]; }));
    group('Power (Watts)', 'w', W_BUCKETS.map(function (b) { return b[0]; }));
    group('Optics', 'optic', OPTICS);

    function anyOn(m) { for (var k in m) if (m[k]) return true; return false; }
    function inBuckets(map, buckets, v) {
      if (!anyOn(map)) return true;
      for (var i2 = 0; i2 < buckets.length; i2++) {
        if (map[buckets[i2][0]] && v >= buckets[i2][1] && v < buckets[i2][2]) return true;
      }
      return false;
    }
    function matches() {
      var q = S.q.trim().toUpperCase();
      return CAT.filter(function (it) {
        if (q && it.code.indexOf(q) === -1) return false;
        if (anyOn(S.cct) && !S.cct[it.cct]) return false;
        if (!inBuckets(S.lm, LM_BUCKETS, it.lm)) return false;
        if (!inBuckets(S.w, W_BUCKETS, it.w)) return false;
        if (anyOn(S.optic) && !S.optic[it.optic]) return false;
        return true;
      });
    }
    function fmt(n) { return n.toLocaleString('en-US'); }
    function selCount() { var n = 0; for (var k in selected) if (selected[k]) n++; return n; }

    var toastEl = null, toastT = null;
    function toast(msg) {
      if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'ies-toast'; toastEl.setAttribute('role', 'status'); app.appendChild(toastEl); }
      toastEl.textContent = msg;
      toastEl.style.display = 'block';
      clearTimeout(toastT);
      toastT = setTimeout(function () { toastEl.style.display = 'none'; }, 4200);
    }

    function iesFile(it) {
      return 'IESNA:LM-63-2002\n[TEST] REPRESENTATIVE PORTFOLIO DATA, NOT A MEASURED FILE\n[MANUFAC] ARCH (fictional demo)\n[LUMCAT] ' + it.code +
        '\n[LUMINAIRE] Archeon Small, ' + it.cct + ', ' + it.optic + ' optic\n[_ABSOLUTELUMENS] ' + it.lm + '\n[_INPUTWATTS] ' + it.w +
        '\nTILT=NONE\n1 ' + it.lm + ' 1 37 73 1 1 0 0 0\n1.0 1.0 ' + it.w + '\n';
    }
    function download(it) {
      try {
        var blob = new Blob([iesFile(it)], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = it.code + '.ies';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        if (!download.told) { download.told = true; toast('Demo build: a representative .ies file downloads. The shipped button bundles the spec-sheet PDF alongside the photometry.'); }
      } catch (e) {}
    }

    function statHtml(it) {
      return '<div class="ies-stats">' +
        '<div class="ies-stat"><div class="ies-ic"><span class="ies-blob" aria-hidden="true"></span></div><div class="ies-stat-k">CCT</div><div class="ies-stat-v">' + it.cct + '</div></div>' +
        '<div class="ies-stat"><div class="ies-ic"><span class="msi" aria-hidden="true">light_mode</span></div><div class="ies-stat-k">Lumens</div><div class="ies-stat-v">' + fmt(it.lm) + '</div></div>' +
        '<div class="ies-stat"><div class="ies-ic"><span class="msi" aria-hidden="true" style="color:' + UI.bolt + '">bolt</span></div><div class="ies-stat-k">Power</div><div class="ies-stat-v">' + it.w + 'W</div></div>' +
      '</div>';
    }

    var out = app.querySelector('#ies-out'), more = app.querySelector('#ies-more'), count = app.querySelector('#ies-count');
    var PAGE = 24;
    function render() {
      var m = matches();
      count.innerHTML = '<b>' + fmt(m.length) + '</b> IES Files, <b>' + fmt(selCount()) + '</b> Selected';
      out.innerHTML = '';
      if (!m.length) {
        out.innerHTML = '<div class="ies-empty">No files match those filters. Loosen one filter, or clear all to start over, the catalog never renders unfiltered by design.</div>';
        more.textContent = '';
        return;
      }
      var shown = m.slice(0, PAGE);
      var wrap = document.createElement('div');
      wrap.className = S.view === 'grid' ? 'ies-grid' : 'ies-rows';
      shown.forEach(function (it) {
        var cell = document.createElement('div');
        cell.className = S.view === 'grid' ? 'ies-card' : 'ies-row';
        var codeRow = document.createElement(S.view === 'grid' ? 'div' : 'span');
        if (S.view === 'grid') codeRow.className = 'ies-code-row';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'ies-check';
        cb.checked = !!selected[it.id];
        cb.setAttribute('aria-label', 'Select ' + it.code);
        cb.addEventListener('change', function () { selected[it.id] = cb.checked; count.innerHTML = '<b>' + fmt(matches().length) + '</b> IES Files, <b>' + fmt(selCount()) + '</b> Selected'; });
        var code = document.createElement('span');
        code.className = 'ies-code';
        code.textContent = it.code;
        var pdf = document.createElement('button');
        pdf.className = 'ies-pdf';
        pdf.innerHTML = '<span class="msi" aria-hidden="true">picture_as_pdf</span>PDF DOWNLOAD';
        pdf.setAttribute('aria-label', 'Download photometry for ' + it.code);
        pdf.addEventListener('click', function () { download(it); });
        if (S.view === 'grid') {
          codeRow.appendChild(cb); codeRow.appendChild(code);
          if (it.qs) codeRow.insertAdjacentHTML('beforeend', '<span class="ies-qs" title="Quick ship">QS</span>');
          cell.appendChild(codeRow);
          cell.insertAdjacentHTML('beforeend', statHtml(it));
          cell.appendChild(pdf);
        } else {
          cell.appendChild(cb); cell.appendChild(code);
          cell.insertAdjacentHTML('beforeend', '<span class="ies-row-meta">' + it.cct + ' · ' + fmt(it.lm) + ' lm · ' + it.w + ' W · ' + it.optic + (it.qs ? ' · QS' : '') + '</span>');
          cell.appendChild(pdf);
        }
        wrap.appendChild(cell);
      });
      out.appendChild(wrap);
      more.textContent = m.length > PAGE ? 'SHOWING ' + PAGE + ' OF ' + fmt(m.length) + ' · VIRTUALIZED IN THE SHIPPED BUILD' : '';
    }

    /* header wiring */
    app.querySelector('#ies-q').addEventListener('input', function (e) { S.q = e.target.value; render(); });
    function setView(v) {
      S.view = v;
      app.querySelector('#ies-v-grid').setAttribute('aria-pressed', String(v === 'grid'));
      app.querySelector('#ies-v-list').setAttribute('aria-pressed', String(v === 'list'));
      render();
    }
    app.querySelector('#ies-v-grid').addEventListener('click', function () { setView('grid'); });
    app.querySelector('#ies-v-list').addEventListener('click', function () { setView('list'); });
    app.querySelector('#ies-clear').addEventListener('click', function () {
      S.cct = {}; S.lm = {}; S.w = {}; S.optic = {}; S.q = '';
      app.querySelector('#ies-q').value = '';
      rail.querySelectorAll('input[type=checkbox]').forEach(function (c) { c.checked = false; });
      render();
    });
    app.querySelector('#ies-use').addEventListener('click', function () {
      toast(fmt(selCount()) + ' IES files staged. In the shipped product this returns to the design surface with the photometry attached to your fixtures.');
    });
    app.querySelector('#ies-back').addEventListener('click', function () {
      toast('In the shipped product this returns to the design surface without changing the selection.');
    });

    render();
  }

  /* ---------- boot: isolated inits ---------- */
  function boot() {
    [initSandbox, initAutolayout, initIesFilter, initIesScreen].forEach(function (fn) {
      try { fn(); } catch (e) { try { console.error('[la-sims] ' + fn.name + ' failed:', e); } catch (er) {} }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
