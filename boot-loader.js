/* boot-loader.js — first-visit boot screen for the homepage variants.

   WHY THIS EXISTS: on a slow first load the homepage's interactive systems
   (3D building, case-study hover previews, metric counters, Light Architect)
   could wire themselves to DOM nodes that a late re-render then replaced —
   everything looked dead until a manual refresh. Each homepage now exposes
   window.__homeBoot { verify(), reinit() }; this overlay holds the page back
   behind a 1–100% progress screen until React has mounted, the template has
   hydrated, fonts are in, and every subsystem passes verification — re-wiring
   any that fail — then reveals the site. The full screen shows on the first
   load of a session; later loads run the same verify + self-heal silently.

   Self-contained by design: it must paint before the page's CSS/React arrive,
   so its colors are bootstrap literals (same precedent as cookie-banner.js),
   themed per homepage variant and matched to the page background. */
(function () {
  'use strict';
  if (window.__rbBoot) return; window.__rbBoot = 1;
  if (window.parent !== window) return; // never inside embeds / iframes

  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var firstVisit = true;
  try { firstVisit = sessionStorage.getItem('rb-booted') !== '1'; } catch (e) {}

  // One-time warm reload. The homepage's interactivity is wired imperatively to
  // DOM nodes that the DC streaming render replaces during load; on a slow or
  // variable first (cold-cache) load that wiring can be left stranded on detached
  // nodes — dead preview hovers, a frozen 3D rig, unresponsive Light Architect —
  // which is why a manual refresh has always fixed it (the warm cache makes the
  // reload fast enough to skip the race). We do that refresh automatically, exactly
  // once per session: the first cold visit loads and caches React, the runtime,
  // fonts and scripts; then reveal() reloads once, and the reloaded page comes up
  // fast from cache and fully interactive. Guarded so it can never loop.
  var WARM_KEY = 'rb-warm-reloaded-v1';
  var warmed = false;
  try { warmed = sessionStorage.getItem(WARM_KEY) === '1'; } catch (e) {}

  var CAP_MS = 12000;      // absolute ceiling: never hold the page longer than this
  var t0 = Date.now();
  function elapsed() { return Date.now() - t0; }

  /* ---- theme (from the filename — no DOM needed this early) ---- */
  var file = '';
  try { file = decodeURIComponent(location.pathname).split('/').pop().toLowerCase(); } catch (e) {}
  var intDark = false;
  try { intDark = localStorage.getItem('rba-int-dark') === 'true'; } catch (e) {}
  var T = file.indexOf('dossier') !== -1
    ? { bg: '#f4ead2', fg: '#0a0a0a', dim: '#6b5d42', ac: '#b23a2e', track: 'rgba(10,8,4,0.18)', kicker: 'CASE FILE — DECLASSIFYING' }
    : file.indexOf('retro') !== -1
    ? { bg: '#040806', fg: '#9af0c2', dim: '#3f9e69', ac: '#6cf0a4', track: 'rgba(108,240,164,0.2)', kicker: 'C:\\> BOOT RB-OS' }
    : intDark
    ? { bg: '#070b12', fg: '#e9eef7', dim: '#7d8ca3', ac: '#7dd3c0', track: 'rgba(255,255,255,0.14)', kicker: 'ROBERT BABIARZ — PORTFOLIO' }
    : { bg: '#fffcf5', fg: '#101418', dim: '#5f6879', ac: '#0f8a6d', track: 'rgba(10,14,20,0.14)', kicker: 'ROBERT BABIARZ — PORTFOLIO' };

  /* ---- real load milestones (progress only advances when these pass) ---- */
  var fontsReady = !(document.fonts && document.fonts.ready);
  if (!fontsReady) {
    try { document.fonts.ready.then(function () { fontsReady = true; }); } catch (e) { fontsReady = true; }
    setTimeout(function () { fontsReady = true; }, 3500); // a slow font must not block the site
  }
  function q(s) { try { return document.querySelector(s); } catch (e) { return null; } }
  var MILESTONES = [
    [14, 'waking the runtime',    function () { return !!(window.React && window.ReactDOM); }],
    [32, 'mounting components',   function () { return !!window.__dcRegistry; }],
    [50, 'rendering content',     function () { return !!q('.proj-row, .dsr-file, .rt-file'); }],
    [64, 'loading typefaces',     function () { return fontsReady; }],
    [76, 'wiring interactives',   function () { return !!window.__homeBoot; }]
  ];

  /* ---- overlay ---- */
  var wrap = null, pctEl = null, fillEl = null, lblEl = null, skipBtn = null;
  var shown = 1, target = 6, mi = 0, finished = false, revealed = false, timer = null;

  function build() {
    if (wrap || revealed || !document.body) return;
    wrap = document.createElement('div');
    wrap.id = 'rb-boot';
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-label', 'Loading portfolio');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:' + T.bg + ';color:' + T.fg + ';' +
      (reduce ? '' : 'transition:opacity .38s ease;');
    wrap.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px;text-align:center;">' +
        '<div style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:10px;font-weight:700;letter-spacing:0.22em;color:' + T.dim + ';">' + T.kicker + '</div>' +
        '<div id="rb-boot-pct" style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:46px;font-weight:500;letter-spacing:-0.02em;line-height:1;">1%</div>' +
        '<div style="width:min(260px,70vw);height:2px;background:' + T.track + ';overflow:hidden;" aria-hidden="true">' +
          '<div id="rb-boot-fill" style="width:1%;height:100%;background:' + T.ac + ';"></div>' +
        '</div>' +
        '<div id="rb-boot-lbl" style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:11px;letter-spacing:0.06em;color:' + T.dim + ';min-height:1.4em;">contacting the runtime</div>' +
      '</div>';
    document.body.appendChild(wrap);
    pctEl = document.getElementById('rb-boot-pct');
    fillEl = document.getElementById('rb-boot-fill');
    lblEl = document.getElementById('rb-boot-lbl');
    document.documentElement.style.overflow = 'hidden';
    // escape hatch: after 5s offer a keyboard-reachable skip
    setTimeout(function () {
      if (finished || !wrap) return;
      skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      skipBtn.textContent = 'Skip loading';
      skipBtn.style.cssText = 'position:absolute;bottom:28px;left:50%;transform:translateX(-50%);padding:8px 16px;font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:11px;letter-spacing:0.06em;cursor:pointer;background:transparent;color:' + T.dim + ';border:1px solid ' + T.track + ';border-radius:999px;';
      skipBtn.addEventListener('click', function () { finish(false, ['skipped by visitor']); });
      wrap.appendChild(skipBtn);
    }, 5000);
  }

  function setLabel(t) { if (lblEl) lblEl.textContent = t; }

  function render() {
    var n = Math.max(1, Math.min(100, Math.floor(shown)));
    if (pctEl) pctEl.textContent = n + '%';
    if (fillEl) fillEl.style.width = n + '%';
  }

  function step() {
    if (revealed) return;
    while (mi < MILESTONES.length) {
      var m = MILESTONES[mi];
      if (!m[2]()) break;
      if (m[0] > target) { target = m[0]; setLabel(m[1]); }
      mi++;
    }
    // ease toward the current milestone target; reduced motion steps directly
    shown += reduce ? Math.max(1, target - shown) : Math.max(0.25, (target - shown) * 0.09);
    if (shown > target) shown = target;
    render();
    if (finished && shown >= target - 0.5) { shown = 100; render(); return reveal(); }
    timer = setTimeout(step, reduce ? 120 : 40);
  }

  /* ---- verification + self-heal ---- */
  var attempts = 0;
  function verifyLoop() {
    if (finished) return;
    if (elapsed() > CAP_MS) return failHard();
    var hb = window.__homeBoot;
    if (!hb) return setTimeout(verifyLoop, 150);
    var v;
    try { v = hb.verify(); } catch (e) { v = { ok: false, failed: ['verifier'] }; }
    if (v.ok) {
      target = 100;
      setLabel('all systems checked');
      finished = true;
      return;
    }
    if (v.failed.length === 1 && v.failed[0] === 'pending') return setTimeout(verifyLoop, 150); // inits still queued
    if (attempts < 3) {
      attempts++;
      target = Math.min(76 + attempts * 7, 97);
      setLabel('re-wiring: ' + v.failed.join(', '));
      try { hb.reinit(); } catch (e) {}
      return setTimeout(verifyLoop, 450);
    }
    // three re-inits didn't converge — show the site anyway, say so honestly
    try { console.warn('[boot] revealing with unverified systems:', v.failed); } catch (e) {}
    target = 100;
    setLabel('almost there — some extras may finish loading in the background');
    finished = true;
  }

  function failHard() {
    // the runtime itself never arrived (network-level failure): reveal whatever
    // exists and say what happened + the next step, never a silent trap
    if (!(window.React && window.ReactDOM)) {
      setLabel('the page runtime could not be loaded — check your connection and refresh');
      setTimeout(function () { finish(false, ['runtime missing']); }, 2200);
      return;
    }
    finish(false, ['timeout']);
  }

  function finish(ok, failed) {
    if (finished && revealed) return;
    finished = true;
    if (!ok) { try { console.warn('[boot] finished without full verification:', failed); } catch (e) {} }
    target = 100;
    shown = 100;
    render();
    reveal();
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    if (timer) clearTimeout(timer);
    try { sessionStorage.setItem('rb-booted', '1'); } catch (e) {}
    // First cold visit finished loading (scripts/React/fonts now cached): reload
    // once so the page comes up from the warm cache, fast enough to be fully
    // interactive. Keep the overlay up across the reload so the pre-reload state is
    // never shown. Only reload if the guard flag actually persisted — otherwise
    // (e.g. sessionStorage blocked) we must NOT reload, to avoid an infinite loop.
    if (firstVisit && !warmed) {
      var flagged = false;
      try { sessionStorage.setItem(WARM_KEY, '1'); flagged = sessionStorage.getItem(WARM_KEY) === '1'; } catch (e) { flagged = false; }
      if (flagged) { try { location.reload(); return; } catch (e) {} }
    }
    document.documentElement.style.overflow = '';
    if (!wrap) return;
    if (reduce) { wrap.remove(); wrap = null; return; }
    wrap.style.opacity = '0';
    setTimeout(function () { if (wrap) { wrap.remove(); wrap = null; } }, 420);
  }

  /* ---- silent path for repeat visits: same verify + heal, no overlay ---- */
  function silentHeal() {
    var tries = 0;
    (function loop() {
      var hb = window.__homeBoot;
      if (!hb) { if (elapsed() < CAP_MS) return setTimeout(loop, 200); return; }
      var v;
      try { v = hb.verify(); } catch (e) { return; }
      if (v.ok) return;
      if (v.failed.length === 1 && v.failed[0] === 'pending') { if (elapsed() < CAP_MS) setTimeout(loop, 200); return; }
      if (tries >= 3) { try { console.warn('[boot] silent heal gave up:', v.failed); } catch (e) {} return; }
      tries++;
      try { hb.reinit(); } catch (e) {}
      setTimeout(loop, 450);
    })();
  }

  if (!firstVisit) { silentHeal(); return; }

  (function arm() {
    if (revealed) return; // failsafe may have fired while this tab was hidden
    if (document.body) {
      build();
      render();
      step();
      verifyLoop();
    } else if (elapsed() < 6000) {
      requestAnimationFrame(arm);
    }
  })();
  // absolute failsafe, independent of every other path
  setTimeout(function () { if (!revealed) finish(false, ['hard timeout']); }, CAP_MS + 1500);
})();
