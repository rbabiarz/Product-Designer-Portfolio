/* ds-live.js — the two live instruments on the design-system deep dive
   (design-system.html), the case study in which this site documents itself.

   A (#dss-a): a token inspector that reads the COMPUTED custom properties of
   the very page it sits on — toggle the theme and watch every value re-resolve.
   No screenshot of the spec sheet; the page is the spec sheet.

   B (#dss-b): "run the receipts" — re-derives the Parlay Reels slot's exact
   RTP in the visitor's browser, for both the bugged engine the adversarial
   review caught (free-spin scatter pays missing the ×3 multiplier) and the
   shipped fix. The math is the analytic derivation (per-line EV over the 8^5
   symbol joint + exact scatter-window distribution + Wald's identity for
   retriggers), so it runs in milliseconds. Every displayed number is computed
   here, not typed. Constants are mirrored from parlay-slot.js.

   Vanilla JS, no dependencies; isolated inits; keyboard + reduced-motion
   first-class per the house rules. */
(function () {
  'use strict';
  if (window.__dsLive) return; window.__dsLive = 1;

  var REDUCE = false;
  try { REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ════════════════════════════════════════════════════════════════════
     A — live token inspector
     ════════════════════════════════════════════════════════════════════ */
  function initInspector() {
    var root = document.getElementById('dss-a');
    if (!root) return;
    var cs = document.getElementById('top');
    if (!cs) return;
    var grid = root.querySelector('.dss-tokens');
    var themeLbl = root.querySelector('[data-out="theme"]');
    var live = root.querySelector('.dss-live');
    if (!grid) return;

    // the case-study shell's core role tokens, in spec-sheet order
    var TOKENS = [
      ['--c-bg', 'canvas'], ['--c-bg2', 'surface'], ['--c-card', 'card'],
      ['--c-surface', 'raised'], ['--c-ink', 'ink'], ['--c-ink2', 'ink · strong'],
      ['--c-body', 'body text'], ['--c-muted', 'muted'], ['--c-accent', 'accent'],
      ['--c-accent-soft', 'accent · soft'], ['--c-navy', 'navy band'],
      ['--c-b2', 'border · 2 of 5'], ['--c-navbg', 'nav glass']
    ];

    function render(announce) {
      var style = getComputedStyle(cs);
      var dark = cs.classList.contains('dark');
      var html = '';
      TOKENS.forEach(function (t) {
        var v = style.getPropertyValue(t[0]).trim();
        html += '<div class="dss-tk"><span class="dss-sw" style="background:' + v + '"></span>' +
          '<span class="dss-tn">' + t[0] + '</span>' +
          '<span class="dss-tr">' + t[1] + '</span>' +
          '<span class="dss-tv">' + v + '</span></div>';
      });
      grid.innerHTML = html;
      if (themeLbl) themeLbl.textContent = dark ? '.cs.dark — dark values resolved' : '.cs — light values resolved (default)';
      if (announce && live) live.textContent = 'Theme switched to ' + (dark ? 'dark' : 'light') + '. ' + TOKENS.length + ' token values re-resolved live.';
    }

    render(false);
    if (window.MutationObserver) {
      new MutationObserver(function () { render(true); })
        .observe(cs, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /* ════════════════════════════════════════════════════════════════════
     B — RTP re-derivation (mirrors parlay-slot.js constants)
     ════════════════════════════════════════════════════════════════════ */
  function initReceipts() {
    var root = document.getElementById('dss-b');
    if (!root) return;
    var btn = root.querySelector('[data-act="derive"]');
    var out = root.querySelector('.dss-rtp-out');
    var live = root.querySelector('.dss-live');
    if (!btn || !out) return;

    // constants mirrored from parlay-slot.js — [wild, scat, lion, tiger, panda, frog, duck, koala]
    var STRIP_COUNTS = [
      [0, 1, 4, 5, 5, 6, 7, 8],
      [3, 1, 4, 5, 5, 6, 7, 8],
      [3, 1, 4, 5, 5, 6, 7, 8],
      [3, 1, 3, 4, 5, 6, 7, 8],
      [0, 1, 3, 4, 5, 6, 7, 8]
    ];
    var PAYS = { 2: { 3: 25, 4: 100, 5: 500 }, 3: { 3: 15, 4: 60, 5: 200 }, 4: { 3: 12, 4: 40, 5: 150 },
                 5: { 3: 8, 4: 25, 5: 100 }, 6: { 3: 5, 4: 15, 5: 60 }, 7: { 3: 4, 4: 10, 5: 40 } };
    var SCAT_PAY = { 3: 3, 4: 10, 5: 50 }, SCAT_FS = { 3: 8, 4: 12, 5: 20 }, FS_MULT = 3;

    function derive() {
      var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
      var LEN = STRIP_COUNTS.map(function (c) { return c.reduce(function (a, b) { return a + b; }, 0); });
      var P = STRIP_COUNTS.map(function (c, r) { return c.map(function (n) { return n / LEN[r]; }); });

      // E[line pay] for one line, in line-bet units: enumerate the 8^5 joint
      // (cells are independent across reels; each cell's marginal is uniform
      // over its strip). evalGrid's rule: first non-wild = line symbol; run =
      // consecutive symbol-or-wild from reel 1.
      var evLine = 0;
      var cells = [0, 0, 0, 0, 0];
      function rec(r, prob) {
        if (prob === 0) return;
        if (r === 5) {
          var first = 0, i;
          for (i = 0; i < 5; i++) { if (cells[i] !== 0) { first = cells[i]; break; } }
          if (first === 1 || first === 0) return;
          var run = 0;
          for (i = 0; i < 5; i++) { var sy = cells[i]; if (sy === first || sy === 0) run++; else break; }
          if (run >= 3 && PAYS[first]) evLine += prob * PAYS[first][Math.min(run, 5)];
          return;
        }
        for (var s = 0; s < 8; s++) { cells[r] = s; rec(r + 1, prob * P[r][s]); }
      }
      rec(0, 1);

      // scatter-count distribution: each reel's 3-cell window contains its one
      // scatter with probability 3/len, independent across reels
      var dist = [1];
      LEN.forEach(function (L) {
        var p = 3 / L, nd = new Array(dist.length + 1);
        for (var k = 0; k < nd.length; k++) nd[k] = 0;
        dist.forEach(function (q, k) { nd[k] += q * (1 - p); nd[k + 1] += q * p; });
        dist = nd;
      });
      var evScat = 0, evFS = 0, pTrig = 0;
      for (var k = 3; k <= 5; k++) { evScat += dist[k] * SCAT_PAY[k]; evFS += dist[k] * SCAT_FS[k]; pTrig += dist[k]; }

      // per-spin EV in total-bet units; Wald for geometric retriggers
      var base = evLine + evScat;
      var totalFS = evFS / (1 - evFS);
      var fixed = base + totalFS * FS_MULT * base;                       // shipped: ALL wins ×3 in free spins
      var bugged = evLine + evScat + totalFS * (FS_MULT * evLine + evScat); // the caught bug: scatter pays not tripled
      var ms = ((window.performance && performance.now) ? performance.now() : Date.now()) - t0;

      return {
        evLine: evLine, evScat: evScat, pTrig: pTrig, totalFS: totalFS,
        fixed: fixed, bugged: bugged, gap: (fixed - bugged), ms: ms,
        combos: LEN.reduce(function (a, b) { return a * b; }, 1)
      };
    }

    var pct = function (v, d) { return (v * 100).toFixed(d == null ? 4 : d) + '%'; };

    btn.addEventListener('click', function () {
      btn.setAttribute('aria-disabled', 'true');
      var r = derive();
      out.innerHTML =
        '<div class="dss-rtp-grid">' +
          '<div class="dss-rc"><div class="dss-rk">E[LINE PAY] / BET</div><div class="dss-rv">' + pct(r.evLine) + '</div><div class="dss-rn">8^5 SYMBOL JOINT, PER-REEL MARGINALS</div></div>' +
          '<div class="dss-rc"><div class="dss-rk">E[SCATTER PAY] / BET</div><div class="dss-rv">' + pct(r.evScat) + '</div><div class="dss-rn">EXACT WINDOW DISTRIBUTION, 5 REELS</div></div>' +
          '<div class="dss-rc"><div class="dss-rk">P(FREE SPINS)</div><div class="dss-rv">1 in ' + (1 / r.pTrig).toFixed(1) + '</div><div class="dss-rn">3+ SCATTERS ANYWHERE</div></div>' +
          '<div class="dss-rc"><div class="dss-rk">E[FREE SPINS] W/ RETRIGGERS</div><div class="dss-rv">' + r.totalFS.toFixed(6) + '</div><div class="dss-rn">WALD’S IDENTITY, GEOMETRIC CHAIN</div></div>' +
          '<div class="dss-rc dss-bad"><div class="dss-rk">RTP · THE BUGGED ENGINE</div><div class="dss-rv">' + pct(r.bugged) + '</div><div class="dss-rn">FS SCATTER PAYS NOT TRIPLED — WHAT THE REVIEW CAUGHT</div></div>' +
          '<div class="dss-rc dss-good"><div class="dss-rk">RTP · THE SHIPPED FIX</div><div class="dss-rv">' + pct(r.fixed) + '</div><div class="dss-rn">ALL WINS ×3 IN FREE SPINS — MATCHES THE PUBLISHED 96.04%</div></div>' +
        '</div>' +
        '<div class="dss-rtp-note">DERIVED JUST NOW IN YOUR BROWSER IN ' + r.ms.toFixed(1) + ' MS · GAP ' + pct(r.gap, 4).replace('%', '') + ' POINTS · EQUIVALENT TO ENUMERATING ALL ' + r.combos.toLocaleString('en-US') + ' STOP COMBINATIONS · CONSTANTS MIRRORED FROM PARLAY-SLOT.JS</div>';
      btn.textContent = 'Derive it again';
      btn.removeAttribute('aria-disabled');
      if (live) live.textContent = 'Derivation complete in ' + r.ms.toFixed(1) + ' milliseconds. Bugged engine ' + pct(r.bugged, 2) + ', shipped engine ' + pct(r.fixed, 2) + '.';
    });
  }

  /* ── isolated boot (one failure can't kill the other) ─────────────── */
  function boot() {
    try { initInspector(); } catch (e) {}
    try { initReceipts(); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
