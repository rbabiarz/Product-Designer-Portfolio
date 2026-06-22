/* page-transition.js — site-wide page-load + navigation transition.
   The brand mark is an isometric STEPPED BLOCK (a notched-cube silhouette
   derived from the engineering orthographic-rotation figure). That exact
   silhouette is used as a CSS mask on the panel:
   - on load / entrance, the block fills the screen then shrinks to nothing
     at centre (implodes), revealing the page;
   - on internal navigation, the block grows from centre to full-bleed to
     cover, then navigates — so across pages the block reads as one
     continuous shape passing through.
   A teal rim layer trails the mask edge. DC-safe (overlay is a <body>
   child), theme-aware, respects prefers-reduced-motion. */
(function () {
  if (window.__rbPT) return;
  window.__rbPT = true;

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';
  // theme matches the SELECTED homepage view (rb-home-variant) so the
  // transition reads in that design's palette site-wide:
  //   interactive — cream/ink, teal accent (respects dark mode)
  //   dossier     — cream paper, ink mark, classified-red accent
  //   retro       — black CRT, phosphor-green mark + accent
  // Re-read on every build so a mid-session change is reflected immediately.
  var DARK, PANEL, FG, FG_SOFT, TRACK, AC;
  function readTheme() {
    var view = 'interactive';
    try { view = localStorage.getItem('rb-home-variant') || 'interactive'; } catch (e) {}
    DARK = false;
    try { DARK = localStorage.getItem('rba-int-dark') === 'true'; } catch (e) {}
    if (view === 'retro') {
      PANEL = '#040806'; FG = '#6cf0a4'; FG_SOFT = 'rgba(108,240,164,0.45)'; TRACK = 'rgba(108,240,164,0.16)'; AC = '#6cf0a4';
    } else if (view === 'dossier') {
      PANEL = '#f4ead2'; FG = '#0a0a0a'; FG_SOFT = 'rgba(10,8,4,0.42)'; TRACK = 'rgba(10,8,4,0.14)'; AC = '#b23a2e';
    } else {
      PANEL   = DARK ? '#0a0a0a' : '#fffcf5';
      FG      = DARK ? '#f4ead2' : '#0a0a0a';
      FG_SOFT = DARK ? 'rgba(244,234,210,0.42)' : 'rgba(10,10,10,0.4)';
      TRACK   = DARK ? 'rgba(244,234,210,0.12)' : 'rgba(10,10,10,0.1)';
      AC = '#4ca88f';
    }
  }
  readTheme();

  // ── the isometric stepped-block silhouette (viewBox 0 0 120 128) ──
  // a cube with a step notched out of the top-right — the recurring motif
  // in the reference figure. Centre of the solid sits at the viewBox centre
  // so a centred mask scales symmetrically.
  var SIL = 'M60 20 L79 31 L79 53 L98 64 L98 86 L60 108 L22 86 L22 42 Z';
  // internal seams that make the line-art mark read as 3D
  var SEAMS = 'M79 31 L41 53 L22 42 M41 53 L41 75 M41 75 L79 53 M41 75 L60 86 L98 64 M60 86 L60 108';
  var TOPFACE = 'M60 20 L79 31 L41 53 L22 42 Z';

  function maskUri() {
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 128'><path d='" + SIL + "' fill='#000'/></svg>";
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }
  // big enough that, at full scale, the screen samples only the filled core
  function bigSize() {
    return (Math.ceil(Math.max(window.innerWidth, window.innerHeight) * 14)) + 'px';
  }
  var MASK = maskUri();

  // is this the interactive homepage (gets the counter intro once per session)?
  var path = '';
  try { path = decodeURIComponent(location.pathname); } catch (e) { path = location.pathname; }
  var IS_HOME = /Homepage Interactive\.dc\.html$/.test(path);
  var introKey = 'rb_intro_v1';
  var FIRST_VISIT = false;
  try { FIRST_VISIT = IS_HOME && !sessionStorage.getItem(introKey); } catch (e) {}

  function applyMask(el, size) {
    el.style.webkitMaskImage = MASK; el.style.maskImage = MASK;
    el.style.webkitMaskRepeat = 'no-repeat'; el.style.maskRepeat = 'no-repeat';
    el.style.webkitMaskPosition = 'center'; el.style.maskPosition = 'center';
    el.style.webkitMaskSize = size; el.style.maskSize = size;
  }

  // recolor an existing overlay's nodes to the current theme
  function recolor(ov) {
    if (!ov) return;
    if (ov._panel) ov._panel.style.background = PANEL;
    if (ov._acc) ov._acc.style.background = AC;
    var lock = ov.querySelector('#rb-pt-lock');
    if (lock) {
      var sil = lock.querySelectorAll('path');
      // path[0]=top face (accent), [1]=outline, [2]=seams
      if (sil[0]) sil[0].setAttribute('fill', AC);
      if (sil[1]) sil[1].setAttribute('stroke', FG);
      if (sil[2]) sil[2].setAttribute('stroke', FG);
    }
    var count = ov.querySelector('#rb-pt-count');
    if (count) count.style.color = FG;
    var bar = ov.querySelector('#rb-pt-bar');
    if (bar) bar.style.background = TRACK;
  }

  // ---- build overlay ----
  function build() {
    readTheme();
    var existing = document.getElementById('rb-pt');
    if (existing) { recolor(existing); return existing; }
    var BIG = bigSize();

    var ov = document.createElement('div');
    ov.id = 'rb-pt';
    ov.setAttribute('aria-hidden', 'true');
    ov.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999', 'background:transparent',
      'overflow:hidden', "font-family:'Inter',-apple-system,sans-serif"
    ].join(';');

    // teal rim layer (behind the panel; trails the mask edge)
    var acc = document.createElement('div');
    acc.style.cssText = 'position:absolute;inset:0;background:' + AC + ';will-change:mask-size;';
    applyMask(acc, BIG);
    ov.appendChild(acc);
    ov._acc = acc;

    // the masked panel
    var panel = document.createElement('div');
    panel.style.cssText = 'position:absolute;inset:0;background:' + PANEL + ';will-change:mask-size;';
    applyMask(panel, BIG);
    ov.appendChild(panel);
    ov._panel = panel;

    // content layer — NOT masked, sits above the panel
    var content = document.createElement('div');
    content.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;';
    ov.appendChild(content);

    // centered line-art block mark
    var lock = document.createElement('div');
    lock.id = 'rb-pt-lock';
    lock.style.cssText = 'opacity:0;transform:translateY(8px) scale(0.96);';
    lock.innerHTML =
      "<svg width='128' height='136' viewBox='0 0 120 128' fill='none' style='display:block;'>" +
        "<path d='" + TOPFACE + "' fill='" + AC + "' fill-opacity='0.16'/>" +
        "<path d='" + SIL + "' fill='none' stroke='" + FG + "' stroke-width='2.4' stroke-linejoin='round'/>" +
        "<path d='" + SEAMS + "' fill='none' stroke='" + FG + "' stroke-opacity='0.55' stroke-width='1.5' stroke-linejoin='round' stroke-linecap='round'/>" +
      "</svg>";
    content.appendChild(lock);

    // big counter (intro only)
    var count = document.createElement('div');
    count.id = 'rb-pt-count';
    count.style.cssText = 'position:absolute;right:6vw;bottom:5vw;font-family:\'JetBrains Mono\',monospace;font-weight:500;font-size:clamp(48px,11vw,128px);line-height:0.9;color:' + FG + ';letter-spacing:-0.04em;opacity:0;display:none;';
    count.textContent = '0';
    content.appendChild(count);

    // bottom progress bar (intro only)
    var bar = document.createElement('div');
    bar.id = 'rb-pt-bar';
    bar.style.cssText = 'position:absolute;left:0;bottom:0;width:100%;height:2px;background:' + TRACK + ';opacity:0;display:none;';
    var fill = document.createElement('i');
    fill.style.cssText = 'display:block;height:100%;width:0%;background:' + AC + ';transition:none;';
    bar.appendChild(fill);
    content.appendChild(bar);
    ov._fill = fill;

    document.body.appendChild(ov);
    return ov;
  }

  function animMask(el, from, to, dur, delay, done) {
    var a = el.animate(
      [{ webkitMaskSize: from, maskSize: from }, { webkitMaskSize: to, maskSize: to }],
      { duration: dur, delay: delay || 0, easing: EASE, fill: 'forwards' }
    );
    a.onfinish = function () {
      el.style.webkitMaskSize = to; el.style.maskSize = to;
      if (done) done();
    };
    return a;
  }

  // ---- reveal: block implodes from full-bleed to nothing ----
  function lift(ov, done) {
    var BIG = bigSize();
    if (REDUCED) { ov.style.display = 'none'; if (done) done(); return; }
    var lock = document.getElementById('rb-pt-lock');
    if (lock) lock.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease', fill: 'forwards' });
    var settled = false;
    function finish() {
      if (settled) return;
      settled = true;
      ov.style.pointerEvents = 'none';
      ov.style.display = 'none';
      // reset masks to covering for any future use
      ov._panel.style.webkitMaskSize = BIG; ov._panel.style.maskSize = BIG;
      ov._acc.style.webkitMaskSize = BIG; ov._acc.style.maskSize = BIG;
      if (done) done();
    }
    // teal rim trails (stays larger a touch longer)
    animMask(ov._acc, BIG, '0px', 1040, 110);
    animMask(ov._panel, BIG, '0px', 980, 0, finish);
    setTimeout(finish, 1400);
  }

  function showLock(ov) {
    var lock = document.getElementById('rb-pt-lock');
    if (!lock) return;
    if (REDUCED) { lock.style.opacity = '1'; lock.style.transform = 'none'; return; }
    lock.animate(
      [{ opacity: 0, transform: 'translateY(8px) scale(0.96)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }],
      { duration: 460, delay: 80, easing: 'cubic-bezier(0.2,0.8,0.2,1)', fill: 'forwards' }
    );
  }

  function runIntro(ov) {
    var count = document.getElementById('rb-pt-count');
    var bar = document.getElementById('rb-pt-bar');
    var fill = ov._fill;
    count.style.display = 'block';
    bar.style.display = 'block';
    showLock(ov);
    if (REDUCED) {
      try { sessionStorage.setItem(introKey, '1'); } catch (e) {}
      lift(ov);
      return;
    }
    count.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, fill: 'forwards' });
    bar.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, fill: 'forwards' });
    var DUR = 1650, t0 = null, done = false;
    function complete() {
      if (done) return;
      done = true;
      count.textContent = '100'; fill.style.width = '100%';
      try { sessionStorage.setItem(introKey, '1'); } catch (er) {}
      count.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
      bar.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
      setTimeout(function () { lift(ov); }, 220);
    }
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / DUR);
      var e = 1 - Math.pow(1 - p, 1.8);
      count.textContent = Math.round(e * 100);
      fill.style.width = (e * 100) + '%';
      if (p < 1) requestAnimationFrame(frame);
      else complete();
    }
    requestAnimationFrame(frame);
    setTimeout(complete, DUR + 900); // throttle fallback
  }

  // ---- entrance ----
  function entrance() {
    var ov = build();
    ov.style.display = 'block';
    if (FIRST_VISIT) {
      runIntro(ov);
    } else {
      showLock(ov);
      setTimeout(function () { lift(ov); }, REDUCED ? 0 : 300);
    }
  }

  // ---- exit (internal nav): block grows from centre to cover ----
  var navigating = false;
  function coverThenGo(href) {
    if (navigating) return;
    navigating = true;
    var ov = build();
    var BIG = bigSize();
    ov.style.display = 'block';
    ov.style.pointerEvents = 'auto';
    ov._panel.style.webkitMaskSize = '0px'; ov._panel.style.maskSize = '0px';
    ov._acc.style.webkitMaskSize = '0px'; ov._acc.style.maskSize = '0px';
    if (REDUCED) { location.href = href; return; }
    var lock = document.getElementById('rb-pt-lock');
    if (lock) {
      lock.style.opacity = '0';
      lock.animate([{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }],
        { duration: 620, easing: 'ease', fill: 'forwards' });
    }
    // teal rim leads the growth
    animMask(ov._acc, '0px', BIG, 660, 0);
    var went = false;
    function go() { if (!went) { went = true; location.href = href; } }
    animMask(ov._panel, '0px', BIG, 660, 90, go);
    setTimeout(go, 860); // safety
  }

  function isInternalDoc(a) {
    if (!a) return false;
    if (a.target === '_blank') return false;
    var href = a.getAttribute('href') || '';
    if (!href || href[0] === '#') return false;
    if (/^(mailto:|tel:|https?:)/i.test(href)) return false;
    return /\.dc\.html(\?|#|$)/i.test(href);
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a');
    if (!isInternalDoc(a)) return;
    e.preventDefault();
    coverThenGo(a.getAttribute('href'));
  }, true);

  // bfcache restore: clear overlay if user navigates back
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) {
      var ov = document.getElementById('rb-pt');
      if (ov) ov.style.display = 'none';
      navigating = false;
    }
  });

  if (document.body) entrance();
  else document.addEventListener('DOMContentLoaded', entrance);
})();
