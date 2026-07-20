/* parlay-slot.js — "Parlay Reels", the honest five-reel demo slot on the
   Parlay Games deep dive (#slot). 5×3, 5 fixed paylines, wild + scatter +
   free spins. The math is real: uniform reel strips (composition published
   in the paytable), CSPRNG stops, RTP 96.04% — exact, derived analytically
   over the 68,883,048 stop combinations and cross-checked with a 10,000,000
   spin Monte Carlo (hit ≈ 1 in 4.1, free spins ≈ 1 in 211, max observed 508×).
   Deliberately missing, and annotated in DESIGN NOTES: LDW celebrations,
   engineered near-misses, weighted reels, autoplay, a stop button, and
   win-jingles on net losses (Dixon et al.; Kassinove & Schare; Harrigan;
   Ladouceur & Sévigny). Vanilla JS, no dependencies; keyboard-first;
   reduced-motion renders results instantly. */
(function () {
  'use strict';
  if (window.__pslot) return;

  var REDUCE = false;
  try {
    var mq = matchMedia('(prefers-reduced-motion: reduce)');
    REDUCE = mq.matches;
    // live: flipping the OS setting mid-session must not strand spins waiting
    // for transitionend events that CSS has disabled
    if (mq.addEventListener) mq.addEventListener('change', function (e) { REDUCE = e.matches; });
  } catch (e) {}

  /* ── math (exact figures in the paytable derive from these constants) ── */
  var SYM = [
    { key: 'wild',  name: 'Wild (Cardinal)',   x: 66.667, y: 0 },
    { key: 'scat',  name: 'Scatter (Owl)',     x: 33.333, y: 100 },
    { key: 'lion',  name: 'Lion',              x: 83.333, y: 33.333 },
    { key: 'tiger', name: 'Tiger',             x: 0,      y: 0 },
    { key: 'panda', name: 'Panda',             x: 83.333, y: 0 },
    { key: 'frog',  name: 'Frog',              x: 33.333, y: 33.333 },
    { key: 'duck',  name: 'Duck',              x: 0,      y: 33.333 },
    { key: 'koala', name: 'Koala',             x: 100,    y: 33.333 }
  ];
  var PAYS = { 2: { 3: 25, 4: 100, 5: 500 }, 3: { 3: 15, 4: 60, 5: 200 }, 4: { 3: 12, 4: 40, 5: 150 },
               5: { 3: 8, 4: 25, 5: 100 }, 6: { 3: 5, 4: 15, 5: 60 }, 7: { 3: 4, 4: 10, 5: 40 } };
  var SCAT_PAY = { 3: 3, 4: 10, 5: 50 };   // × total bet
  var SCAT_FS = { 3: 8, 4: 12, 5: 20 };    // free spins
  var FS_MULT = 3;                          // wins tripled in free spins
  var STRIP_COUNTS = [                      // [wild, scat, lion, tiger, panda, frog, duck, koala]
    [0, 1, 4, 5, 5, 6, 7, 8],
    [3, 1, 4, 5, 5, 6, 7, 8],
    [3, 1, 4, 5, 5, 6, 7, 8],
    [3, 1, 3, 4, 5, 6, 7, 8],
    [0, 1, 3, 4, 5, 6, 7, 8]
  ];
  var LINES = [
    { name: 'Middle', rows: [1, 1, 1, 1, 1] },
    { name: 'Top',    rows: [0, 0, 0, 0, 0] },
    { name: 'Bottom', rows: [2, 2, 2, 2, 2] },
    { name: 'V',      rows: [0, 1, 2, 1, 0] },
    { name: 'Peak',   rows: [2, 1, 0, 1, 2] }
  ];
  var BET_STEPS = [0.10, 0.20, 0.50, 1.00, 2.00, 5.00]; // per line; total = ×5
  var START_BAL = 1000, REALITY_EVERY = 50;

  var STRIPS = STRIP_COUNTS.map(function (counts) {
    // deterministic interleave so equal symbols are spaced, never clustered
    var pools = counts.map(function (n, sym) { return { sym: sym, left: n, weight: n }; });
    var total = counts.reduce(function (a, b) { return a + b; }, 0), strip = [];
    for (var i = 0; i < total; i++) {
      var best = null;
      pools.forEach(function (p) { p.acc = (p.acc || 0) + p.weight; if (p.left > 0 && (!best || p.acc > best.acc)) best = p; });
      best.acc -= total; best.left--;
      strip.push(best.sym);
    }
    return strip;
  });

  function rand(n) { // CSPRNG, uniform in [0, n)
    try {
      var lim = Math.floor(4294967296 / n) * n, u = new Uint32Array(1);
      do { crypto.getRandomValues(u); } while (u[0] >= lim);
      return u[0] % n;
    } catch (e) { return Math.floor(Math.random() * n); }
  }

  function spinGrid() { // grid[reel][row]
    return STRIPS.map(function (s) {
      var stop = rand(s.length);
      return [s[stop], s[(stop + 1) % s.length], s[(stop + 2) % s.length]];
    });
  }

  function evalGrid(grid) {
    var hits = [], lineWin = 0;
    LINES.forEach(function (L, li) {
      var first = 0;
      for (var r = 0; r < 5; r++) { var s = grid[r][L.rows[r]]; if (s !== 0) { first = s; break; } }
      if (first === 1 || first === 0) return;                 // scatter never pays on lines
      var run = 0;
      for (var r2 = 0; r2 < 5; r2++) {
        var s2 = grid[r2][L.rows[r2]];
        if (s2 === first || s2 === 0) run++; else break;
      }
      if (run >= 3 && PAYS[first]) { var pay = PAYS[first][Math.min(run, 5)]; hits.push({ line: li, sym: first, len: run, mult: pay }); lineWin += pay; }
    });
    var scats = 0;
    grid.forEach(function (reel) { reel.forEach(function (s) { if (s === 1) scats++; }); });
    return { hits: hits, lineMult: lineWin, scats: scats };
  }

  /* ── state ─────────────────────────────────────────────────────────── */
  var S = {
    bal: START_BAL, betIx: 2, spinning: false, fsLeft: 0, fsTotalWin: 0,
    spins: 0, wagered: 0, won: 0, refills: 0, t0: null, sinceCheck: 0,
    grid: null, cycleT: null, settleSeq: 0,
    turbo: false, sound: false, notes: false
  };
  try {
    S.turbo = localStorage.getItem('psl-turbo') === '1';
    S.sound = localStorage.getItem('psl-sound') === '1';
    S.notes = localStorage.getItem('psl-notes') === '1';
  } catch (e) {}
  var betLine = function () { return BET_STEPS[S.betIx]; };
  var betTotal = function () { return +(BET_STEPS[S.betIx] * LINES.length).toFixed(2); };
  var fmt = function (v) { return v.toFixed(2); };

  /* ── tiny synth (opt-in; silence on net losses by design) ─────────── */
  var AC = null;
  function beep(freq, dur, gain, when, type) {
    if (!S.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      var t = AC.currentTime + (when || 0);
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain || 0.06, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.1));
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + (dur || 0.1) + 0.02);
    } catch (e) {}
  }
  function thock(i) { beep(190 - i * 12, 0.07, 0.05, 0, 'square'); }
  function winArp(netMult) { // length proportional to the real net win — never on a net loss
    var steps = Math.min(10, 2 + Math.floor(netMult * 2));
    for (var i = 0; i < steps; i++) beep(392 * Math.pow(1.122, i), 0.12, 0.05, i * 0.07);
  }
  function fsChime() { [523, 659, 784, 1047].forEach(function (f, i) { beep(f, 0.16, 0.06, i * 0.09); }); }

  /* ── DOM ───────────────────────────────────────────────────────────── */
  var root, live, spinBtn, reelEls, stripEls, winOut, balOut, betOut, badge, banner, overlay, ledger, noteEls = {};

  function symCell(sym, extra) {
    return '<div class="psl-sym' + (extra || '') + '" data-s="' + sym + '"><span class="psl-face" style="background-position:' + SYM[sym].x + '% ' + SYM[sym].y + '%"></span>' +
      (sym === 0 ? '<span class="psl-tag">WILD</span>' : sym === 1 ? '<span class="psl-tag psl-tag-s">SCATTER</span>' : '') + '</div>';
  }

  function lineMiniGrid(L) {
    var out = '<div class="psl-mini" role="img" aria-label="Payline ' + L.name + '">';
    for (var row = 0; row < 3; row++) for (var r = 0; r < 5; r++) out += '<i' + (L.rows[r] === row ? ' class="on"' : '') + '></i>';
    return out + '</div>';
  }

  function build() {
    root = document.getElementById('psl');
    if (!root) return false;
    var fall = root.querySelector('.psl-fallback'); if (fall) fall.remove();

    var payRows = [2, 3, 4, 5, 6, 7].map(function (s) {
      return '<tr><td>' + symCell(s) + '<span class="psl-payname">' + SYM[s].name + '</span></td><td>' + PAYS[s][3] + '×</td><td>' + PAYS[s][4] + '×</td><td>' + PAYS[s][5] + '×</td></tr>';
    }).join('');
    var stripRows = SYM.map(function (sym, si) {
      return '<tr><td>' + sym.name + '</td>' + STRIP_COUNTS.map(function (c) { return '<td>' + c[si] + '</td>'; }).join('') + '</tr>';
    }).join('');

    root.insertAdjacentHTML('beforeend',
      '<div class="psl-cab">' +
        '<div class="psl-head">' +
          '<div class="psl-logo">SLOT <em>REELS</em><span class="psl-demo">DEMO · NO REAL MONEY</span></div>' +
          '<div class="psl-chips mono"><span>RTP 96.04%</span><span>MED VOLATILITY</span><span>5 LINES</span></div>' +
          '<div class="psl-tools">' +
            '<button type="button" class="psl-tool" data-act="paytable" aria-haspopup="dialog">Paytable</button>' +
            '<button type="button" class="psl-tool" data-act="notes" aria-pressed="' + S.notes + '">Design notes</button>' +
            '<button type="button" class="psl-tool psl-ico" data-act="sound" aria-pressed="' + S.sound + '" aria-label="Sound"><span class="msi" aria-hidden="true">volume_off</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="psl-stagepos">' +
          '<div class="psl-banner mono" hidden></div>' +
          '<div class="psl-window" aria-hidden="true">' +
            [0, 1, 2, 3, 4].map(function (r) { return '<div class="psl-reel" data-r="' + r + '"><div class="psl-strip"></div></div>'; }).join('') +
          '</div>' +
          '<div class="psl-badge mono" role="presentation" hidden></div>' +
          '<div class="psl-overlay" hidden></div>' +
        '</div>' +
        '<div class="psl-bar">' +
          '<div class="psl-read"><span class="psl-k mono">BALANCE</span><span class="psl-v mono" data-out="bal"></span></div>' +
          '<div class="psl-bet">' +
            '<span class="psl-k mono" id="psl-betlbl">BET / LINE</span>' +
            '<div class="psl-step" role="group" aria-labelledby="psl-betlbl">' +
              '<button type="button" class="psl-stepbtn" data-act="bet-" aria-label="Decrease bet">−</button>' +
              '<span class="psl-v mono" data-out="bet"></span>' +
              '<button type="button" class="psl-stepbtn" data-act="bet+" aria-label="Increase bet">+</button>' +
            '</div>' +
            '<span class="psl-total mono" data-out="total"></span>' +
          '</div>' +
          '<div class="psl-read"><span class="psl-k mono">WIN</span><span class="psl-v mono" data-out="win">0.00</span><span class="psl-net mono" data-out="net"></span></div>' +
          '<div class="psl-go">' +
            '<button type="button" class="psl-tool" data-act="turbo" aria-pressed="' + S.turbo + '">Turbo</button>' +
            '<button type="button" class="psl-spin" data-act="spin" aria-label="Spin. Space bar also spins."><span class="msi" aria-hidden="true">autorenew</span><span class="psl-spinlbl">SPIN</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="psl-ledger mono" data-out="ledger" aria-label="Session ledger"></div>' +
        '<div class="psl-live sr-only" role="status" aria-live="polite" aria-atomic="true"></div>' +
      '</div>' +

      '<div class="psl-notes"' + (S.notes ? '' : ' hidden') + '>' +
        '<div class="psl-notes-h mono">DESIGN NOTES · WHAT A COMMERCIAL SLOT WOULD DO HERE — AND WHY THIS ONE DOESN\'T</div>' +
        '<div class="psl-notegrid">' +
          '<div class="psl-note" data-note="ldw"><strong>No celebrated "wins" that lose money.</strong> When a spin returns less than the stake, commercial slots fire the full win fanfare. Players\' arousal to these losses-disguised-as-wins matches real wins, and they misremember them as wins (Dixon et al. 2010, <em>Addiction</em>). Here a below-stake return reads NET −, in grey, silently.</div>' +
          '<div class="psl-note" data-note="nearmiss"><strong>No engineered near-misses.</strong> A ~30% near-miss rate maximizes persistence (Kassinove &amp; Schare 2001), and near-misses recruit win circuitry (Clark et al. 2009, <em>Neuron</em>). These reels are uniform strips — the composition is published in the paytable — so "almost" happens only as often as honest probability says.</div>' +
          '<div class="psl-note" data-note="anticip"><strong>Anticipation, only when it\'s true.</strong> Reels slow for a scatter chase only when two scatters have genuinely landed — the suspense reflects live odds, it doesn\'t manufacture them.</div>' +
          '<div class="psl-note" data-note="autoplay"><strong>No autoplay, no stop button.</strong> Autoplay removes the decision point between wagers (the UK banned it in 2021); a stop button creates an illusion of skill that increases persistence (Ladouceur &amp; Sévigny 2005). One spin per explicit press, outcome fixed at spin time.</div>' +
          '<div class="psl-note" data-note="sound"><strong>Sound tells the truth.</strong> Win jingles on net losses cause players to overestimate how often they won; negative or absent sound "unmasks" them (Dixon et al. 2014 / 2020, <em>J. Gambling Studies</em>). Here the jingle length is proportional to the real net win, and net losses get silence.</div>' +
          '<div class="psl-note" data-note="ledger"><strong>The ledger never hides.</strong> Spins, total wagered, net position, and session time stay on screen, and every 50 spins a reality check interrupts play — the pattern UK regulation (RTS 13) requires and most lobbies bury.</div>' +
        '</div>' +
      '</div>' +

      '<dialog class="psl-dlg" aria-label="Paytable and game rules">' +
        '<div class="psl-dlg-h"><span>Paytable &amp; the honest math</span><button type="button" class="psl-tool" data-act="close" aria-label="Close paytable">Close</button></div>' +
        '<div class="psl-dlg-b" tabindex="0" role="region" aria-label="Paytable content, scrollable">' +
          '<h4>Line pays <span class="mono psl-dim">× BET PER LINE · LEFT TO RIGHT · WILD SUBSTITUTES</span></h4>' +
          '<table class="psl-tbl"><thead><tr><th>Symbol</th><th>×3</th><th>×4</th><th>×5</th></tr></thead><tbody>' + payRows + '</tbody></table>' +
          '<h4>Specials</h4>' +
          '<div class="psl-spec">' + symCell(0) + '<p><strong>Wild</strong> substitutes for every pay symbol. It appears on reels 2–4 only — and that fact is printed here, not hidden.</p></div>' +
          '<div class="psl-spec">' + symCell(1) + '<p><strong>Scatter</strong> pays anywhere: 3 / 4 / 5 award 3× / 10× / 50× total bet and 8 / 12 / 20 free spins with all wins ×3. Free spins can retrigger.</p></div>' +
          '<h4>The 5 paylines</h4>' +
          '<div class="psl-minis">' + LINES.map(lineMiniGrid).join('') + '</div>' +
          '<h4>Reel composition <span class="mono psl-dim">EVERY REEL IS ONE UNIFORM STRIP — NO VIRTUAL-REEL WEIGHTING</span></h4>' +
          '<table class="psl-tbl"><thead><tr><th>Symbol</th><th>R1</th><th>R2</th><th>R3</th><th>R4</th><th>R5</th></tr></thead><tbody>' + stripRows +
          '<tr><td class="mono">STRIP LENGTH</td>' + STRIPS.map(function (s) { return '<td class="mono">' + s.length + '</td>'; }).join('') + '</tr></tbody></table>' +
          '<h4>Verified math</h4>' +
          '<p class="psl-math mono">RTP 96.04% — EXACT, COMPUTED OVER ALL 68,883,048 STOP COMBINATIONS OF THESE STRIPS · HIT RATE 24.1% (≈1 IN 4.1) · FREE SPINS ≈1 IN 211 · MAX OBSERVED 508× BET ACROSS A 10,000,000-SPIN CROSS-CHECK · STOPS USE CRYPTO.GETRANDOMVALUES.</p>' +
        '</div>' +
      '</dialog>');

    live = root.querySelector('.psl-live');
    spinBtn = root.querySelector('[data-act="spin"]');
    winOut = root.querySelector('[data-out="win"]');
    balOut = root.querySelector('[data-out="bal"]');
    betOut = root.querySelector('[data-out="bet"]');
    badge = root.querySelector('.psl-badge');
    banner = root.querySelector('.psl-banner');
    overlay = root.querySelector('.psl-overlay');
    ledger = root.querySelector('[data-out="ledger"]');
    reelEls = [].slice.call(root.querySelectorAll('.psl-reel'));
    stripEls = reelEls.map(function (r) { return r.querySelector('.psl-strip'); });
    root.querySelectorAll('.psl-note').forEach(function (n) { noteEls[n.getAttribute('data-note')] = n; });

    // initial (non-winning, hand-picked) grid
    S.grid = [[3, 6, 7], [5, 2, 6], [7, 4, 3], [6, 5, 2], [4, 7, 5]];
    stripEls.forEach(function (st, r) { st.innerHTML = S.grid[r].map(function (s) { return symCell(s); }).join(''); st.style.transform = 'none'; });

    root.addEventListener('click', onAct);
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('keydown', overlayKeys);
    // the native <dialog> can also close via Escape — keep the modal-cursor
    // state in sync however it closes, and let a backdrop click dismiss it
    var d = dlg();
    if (d) {
      d.addEventListener('close', function () { document.documentElement.classList.remove('psl-modal-open'); });
      d.addEventListener('click', function (e) { if (e.target === d) d.close(); }); // click outside the panel (on the backdrop)
    }
    refresh();
    return true;
  }
  function openPaytable() {
    var d = dlg(); if (!d) return;
    // the dialog renders in the browser top layer, above the custom cursor's
    // own layer — hand the pointer back to the native cursor while it's open
    document.documentElement.classList.add('psl-modal-open');
    d.showModal();
  }
  function closePaytable() { var d = dlg(); if (d) d.close(); } // 'close' event clears the modal class

  /* ── UI helpers ────────────────────────────────────────────────────── */
  function refresh() {
    balOut.textContent = fmt(S.bal);
    betOut.textContent = fmt(betLine());
    root.querySelector('[data-out="total"]').textContent = 'TOTAL ' + fmt(betTotal());
    var mins = S.t0 ? Math.floor((Date.now() - S.t0) / 60000) : 0, secs = S.t0 ? Math.floor((Date.now() - S.t0) / 1000) % 60 : 0;
    ledger.textContent = 'SESSION · ' + S.spins + ' SPINS · WAGERED ' + fmt(S.wagered) + ' · NET ' + (S.won - S.wagered >= 0 ? '+' : '−') + fmt(Math.abs(S.won - S.wagered)) +
      (S.refills ? ' · REFILLS ' + S.refills : '') + (S.t0 ? ' · ' + mins + ':' + String(secs).padStart(2, '0') : '');
  }
  function announce(msg) { live.textContent = msg; }
  function pulseNote(key) {
    var n = noteEls[key];
    if (!n || !S.notes) return;
    n.classList.remove('hit'); void n.offsetWidth; n.classList.add('hit');
  }
  function setWinReadout(win, ldw) {
    winOut.textContent = fmt(win);
    var net = root.querySelector('[data-out="net"]');
    winOut.classList.toggle('on', win > 0 && !ldw);
    winOut.classList.toggle('ldw', !!ldw);
    net.textContent = ldw ? 'NET −' + fmt(betTotal() - win) : '';
  }

  /* ── the spin ──────────────────────────────────────────────────────── */
  function canSpin() { return !S.spinning && !overlayOpen() && !dlg().open; }
  function dlg() { return root.querySelector('.psl-dlg'); }
  function overlayOpen() { return !overlay.hidden; }

  function spin() {
    if (!canSpin()) return;
    if (S.sinceCheck >= REALITY_EVERY) { realityCheck(); return; }
    var bet = betTotal();
    if (S.bal < bet) { refillOffer(); return; }
    if (!S.t0) S.t0 = Date.now();

    S.spinning = true; S.settleSeq++;
    clearInterval(S.cycleT); badge.hidden = true;
    spinBtn.setAttribute('aria-disabled', 'true'); spinBtn.classList.add('busy');
    S.bal = +(S.bal - bet).toFixed(2); S.wagered = +(S.wagered + bet).toFixed(2);
    S.spins++; S.sinceCheck++;
    setWinReadout(0, false); refresh();
    root.querySelectorAll('.psl-sym').forEach(function (el) { el.classList.remove('hit', 'dim'); });

    var grid = spinGrid();
    S.grid = grid;
    runReels(grid, function () { settle(grid, bet, false); });
  }

  function runReels(grid, done) {
    if (REDUCE) { // instant, calm: swap with a short fade, then settle
      stripEls.forEach(function (st, r) {
        st.style.transition = 'none'; st.style.transform = 'none';
        st.style.opacity = '0.25';
        st.innerHTML = grid[r].map(function (s) { return symCell(s); }).join('');
        requestAnimationFrame(function () { st.style.transition = 'opacity .18s'; st.style.opacity = '1'; });
      });
      setTimeout(done, 240);
      return;
    }
    var base = S.turbo ? 260 : 640, gap = S.turbo ? 90 : 210, fill = S.turbo ? 8 : 16;
    var cell = reelEls[0].getBoundingClientRect().height / 3;
    var pending = 5;
    // honest anticipation, decided by what will really land: reels 4-5 slow
    // down only when two scatters genuinely sit on reels 1-3
    var landed = 0;
    for (var k = 0; k <= 2; k++) grid[k].forEach(function (s) { if (s === 1) landed++; });
    var anticip = landed >= 2;
    if (anticip) pulseNote('anticip');

    // watchdog: transitionend can be swallowed in a hidden tab — never hang
    var maxDur = base + 4 * gap + (anticip ? 700 + 450 : 0);
    var guard = setTimeout(function () {
      if (pending > 0) {
        pending = 0;
        stripEls.forEach(function (st) { st.style.transition = 'none'; st.style.transform = 'translateY(0)'; });
        reelEls.forEach(function (re) { re.classList.remove('chase'); });
        done();
      }
    }, maxDur + 1200);

    stripEls.forEach(function (st, r) {
      if (st.__fin) { st.removeEventListener('transitionend', st.__fin); st.__fin = null; } // stale watchdog leftovers
      var cur = [].slice.call(st.children).slice(0, 3).map(function (el) { return +el.getAttribute('data-s'); });
      var mid = []; for (var i = 0; i < fill; i++) mid.push(STRIPS[r][rand(STRIPS[r].length)]);
      var seq = grid[r].concat(mid, cur);
      st.style.transition = 'none';
      st.innerHTML = seq.map(function (s) { return symCell(s); }).join('');
      st.style.transform = 'translateY(' + (-(seq.length - 3) * cell) + 'px)';
      void st.offsetHeight;
      var dur = base + r * gap + (anticip && r >= 3 ? 700 + (r - 3) * 450 : 0);
      st.style.transition = 'transform ' + dur + 'ms cubic-bezier(.18,.75,.28,1.04)';
      st.style.transform = 'translateY(0)';
      var fin = function () {
        st.removeEventListener('transitionend', fin); st.__fin = null;
        reelEls[r].classList.remove('chase');
        thock(r);
        if (anticip && r === 2) [3, 4].forEach(function (rr) { reelEls[rr].classList.add('chase'); });
        if (--pending === 0) { clearTimeout(guard); setTimeout(done, 60); }
      };
      st.__fin = fin;
      st.addEventListener('transitionend', fin);
    });
  }

  function settle(grid, bet, isFree) {
    var seq = S.settleSeq;
    var res = evalGrid(grid);
    var mult = isFree ? FS_MULT : 1;
    var lineWin = +(res.lineMult * betLine() * mult).toFixed(2);
    var scatWin = res.scats >= 3 ? +(SCAT_PAY[Math.min(res.scats, 5)] * betTotal() * mult).toFixed(2) : 0;
    var win = +(lineWin + scatWin).toFixed(2);
    var fsAward = res.scats >= 3 ? SCAT_FS[Math.min(res.scats, 5)] : 0;

    S.bal = +(S.bal + win).toFixed(2); S.won = +(S.won + win).toFixed(2);
    if (isFree) S.fsTotalWin = +(S.fsTotalWin + win).toFixed(2);
    var ldw = !isFree && win > 0 && win < bet;
    if (ldw) pulseNote('ldw');

    // highlight winners, dim the rest
    if (res.hits.length || res.scats >= 3) {
      var winners = {};
      res.hits.forEach(function (h) { for (var r = 0; r < h.len; r++) winners[r + ':' + LINES[h.line].rows[r]] = 1; });
      if (res.scats >= 3) grid.forEach(function (reel, r) { reel.forEach(function (s, row) { if (s === 1) winners[r + ':' + row] = 1; }); });
      stripEls.forEach(function (st, r) {
        [].slice.call(st.children).slice(0, 3).forEach(function (el, row) {
          el.classList.add(winners[r + ':' + row] ? 'hit' : 'dim');
        });
      });
    }

    setWinReadout(win, ldw); refresh();

    // sound: proportional to NET result only — silence on LDWs and losses
    var netMult = (win - (isFree ? 0 : bet)) / bet;
    if (win > 0 && netMult > 0) winArp(netMult);

    // line-cycle badge: all lines first, then one at a time
    if (res.hits.length) {
      var msgs = res.hits.map(function (h) {
        return 'LINE ' + (h.line + 1) + ' · ' + SYM[h.sym].name.toUpperCase() + ' ×' + h.len + ' · ' + fmt(h.mult * betLine() * mult);
      });
      var ix = -1, shown = 0;
      var summary = res.hits.length + (res.hits.length > 1 ? ' LINES' : ' LINE') + ' · ' + fmt(lineWin);
      badge.hidden = false;
      badge.textContent = summary;
      if (!REDUCE && msgs.length) {
        // finite cycle (WCAG 2.2.2): each line twice, then rest on the summary
        S.cycleT = setInterval(function () {
          if (shown >= msgs.length * 2) {
            clearInterval(S.cycleT); badge.textContent = summary;
            var winners = {};
            res.hits.forEach(function (h2) { for (var r3 = 0; r3 < h2.len; r3++) winners[r3 + ':' + LINES[h2.line].rows[r3]] = 1; });
            stripEls.forEach(function (st, r) {
              [].slice.call(st.children).slice(0, 3).forEach(function (el, row) {
                el.classList.toggle('hit', !!winners[r + ':' + row] || (res.scats >= 3 && +el.getAttribute('data-s') === 1));
              });
            });
            return;
          }
          shown++;
          ix = (ix + 1) % msgs.length; badge.textContent = msgs[ix];
          var h = res.hits[ix], members = {};
          for (var r = 0; r < h.len; r++) members[r + ':' + LINES[h.line].rows[r]] = 1;
          stripEls.forEach(function (st, r) {
            [].slice.call(st.children).slice(0, 3).forEach(function (el, row) {
              el.classList.toggle('hit', !!members[r + ':' + row] || (res.scats >= 3 && +el.getAttribute('data-s') === 1));
            });
          });
        }, 1500);
      } else if (msgs.length) {
        badge.textContent = msgs.join('  ·  ');
      }
    }

    // screen-reader truth: one composed message per spin
    var say;
    if (win === 0) say = 'Spin complete. No win. Balance ' + fmt(S.bal) + ' credits.';
    else if (ldw) say = 'Spin complete. Returned ' + fmt(win) + ' of ' + fmt(bet) + ' bet, a net loss of ' + fmt(bet - win) + '. Balance ' + fmt(S.bal) + '.';
    else say = 'Spin complete. Win ' + fmt(win) + (res.hits.length ? ' on ' + res.hits.length + (res.hits.length > 1 ? ' lines' : ' line') : '') + '. Balance ' + fmt(S.bal) + '.';
    if (fsAward) say += ' ' + res.scats + ' scatters award ' + fsAward + ' free spins at triple wins.';
    announce(say);

    var netWinMult = win / bet;
    var finish = function () {
      if (fsAward) { S.fsLeft += fsAward; if (!isFree) S.fsTotalWin = 0; fsChime(); fsIntro(fsAward, function () { nextFree(seq); }); return; }
      if (isFree) { nextFree(seq); return; }
      endSpin();
    };
    if (!ldw && netWinMult >= 15) bigWin(win, netWinMult >= 50 ? 'MEGA WIN' : 'BIG WIN', finish);
    else finish();
  }

  function endSpin() {
    S.spinning = false;
    spinBtn.removeAttribute('aria-disabled'); spinBtn.classList.remove('busy');
    refresh();
  }

  /* free spins auto-run: pre-paid, so no wager decision is being automated */
  function nextFree(seq) {
    if (seq !== S.settleSeq) return;
    if (S.fsLeft <= 0) {
      banner.hidden = true;
      announce('Free spins complete. Total free-spin win ' + fmt(S.fsTotalWin) + '. Balance ' + fmt(S.bal) + '.');
      endSpin(); return;
    }
    S.fsLeft--;
    banner.hidden = false;
    banner.textContent = 'FREE SPINS · ' + (S.fsLeft + 1) + ' LEFT · ALL WINS ×3';
    setTimeout(function () {
      if (seq !== S.settleSeq) return;
      root.querySelectorAll('.psl-sym').forEach(function (el) { el.classList.remove('hit', 'dim'); });
      clearInterval(S.cycleT); badge.hidden = true;
      var grid = spinGrid(); S.grid = grid;
      runReels(grid, function () { settle(grid, betTotal(), true); });
    }, REDUCE ? 350 : 900);
  }

  /* ── overlays (anchored to the stage, never viewport-fixed) ────────── */
  function showOverlay(html, focusSel, label) {
    overlay.innerHTML = html; overlay.hidden = false;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', label || 'Game message');
    var f = focusSel && overlay.querySelector(focusSel);
    if (f) f.focus();
  }
  function hideOverlay() { overlay.hidden = true; overlay.innerHTML = ''; overlay.removeAttribute('role'); overlay.removeAttribute('aria-modal'); spinBtn.focus(); }
  function overlayKeys(e) {
    if (overlay.hidden) return;
    var btns = [].slice.call(overlay.querySelectorAll('button'));
    if (!btns.length) return;
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      var safe = overlay.querySelector('[data-act="ov-dismiss"], [data-act="ov-continue"], [data-act="ov-ack"]');
      if (safe) safe.click();
    } else if (e.key === 'Tab') {
      // keep focus inside the modal overlay
      var i = btns.indexOf(document.activeElement);
      var next = e.shiftKey ? (i <= 0 ? btns.length - 1 : i - 1) : (i === btns.length - 1 ? 0 : i + 1);
      if (i === -1) next = 0;
      e.preventDefault();
      btns[next].focus();
    }
  }

  function bigWin(win, label, then) {
    showOverlay('<div class="psl-big"><div class="psl-big-t">' + label + '</div><div class="psl-big-n mono" data-n>0.00</div><button type="button" class="psl-tool" data-act="ov-ack">Continue</button></div>', '[data-act="ov-ack"]', label);
    var n = overlay.querySelector('[data-n]'), t0 = Date.now(), dur = REDUCE ? 1 : 900, done = false;
    var tick = function () {
      if (done) return;
      var p = Math.min(1, (Date.now() - t0) / dur);
      n.textContent = fmt(win * p);
      if (p < 1) requestAnimationFrame(tick);
    };
    tick();
    overlay.onclick = function () { done = true; n.textContent = fmt(win); hideOverlay(); overlay.onclick = null; then(); };
  }
  function fsIntro(count, then) {
    showOverlay('<div class="psl-big"><div class="psl-big-t">' + count + ' FREE SPINS</div><div class="psl-big-s">All wins ×3 · scatters can retrigger</div><button type="button" class="psl-tool" data-act="ov-ack">Play them</button></div>', '[data-act="ov-ack"]', count + ' free spins awarded');
    overlay.onclick = function () { hideOverlay(); overlay.onclick = null; then(); };
  }
  function realityCheck() {
    var mins = Math.max(1, Math.round((Date.now() - S.t0) / 60000));
    var net = S.won - S.wagered;
    pulseNote('ledger');
    showOverlay('<div class="psl-big"><div class="psl-big-t psl-rc">REALITY CHECK</div>' +
      '<div class="psl-big-s">' + S.spins + ' spins over ' + mins + ' minute' + (mins > 1 ? 's' : '') + '. Net position ' + (net >= 0 ? '+' : '−') + fmt(Math.abs(net)) + ' credits.<br>In a real product this is where you pause, set a limit, or stop.</div>' +
      '<div class="psl-big-row"><button type="button" class="psl-tool" data-act="ov-continue">Continue</button><button type="button" class="psl-tool" data-act="ov-reset">Reset session</button></div></div>', '[data-act="ov-continue"]', 'Reality check');
    announce('Reality check. ' + S.spins + ' spins, net ' + (net >= 0 ? 'plus ' : 'minus ') + fmt(Math.abs(net)) + ' credits.');
  }
  function refillOffer() {
    showOverlay('<div class="psl-big"><div class="psl-big-t">OUT OF DEMO CREDITS</div>' +
      '<div class="psl-big-s">A real slot would route you to a cashier here. This one just refills — and counts the refill in the ledger. Lowering the bet is also an option.</div>' +
      '<div class="psl-big-row"><button type="button" class="psl-tool" data-act="ov-refill">Refill 1,000 demo credits</button><button type="button" class="psl-tool" data-act="ov-dismiss">Not now</button></div></div>', '[data-act="ov-refill"]', 'Out of demo credits');
  }

  /* ── events ────────────────────────────────────────────────────────── */
  function onAct(e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'spin') { spin(); }
    else if (act === 'bet+' || act === 'bet-') {
      if (S.spinning) return;
      var want = S.betIx + (act === 'bet+' ? 1 : -1);
      if (want < 0) { announce('Bet is at the minimum, ' + fmt(betLine()) + ' per line.'); return; }
      if (want >= BET_STEPS.length) { announce('Bet is at the maximum, ' + fmt(betLine()) + ' per line.'); return; }
      S.betIx = want;
      refresh();
      announce('Bet ' + fmt(betLine()) + ' per line, total ' + fmt(betTotal()) + '.');
    }
    else if (act === 'turbo') { S.turbo = !S.turbo; b.setAttribute('aria-pressed', S.turbo); try { localStorage.setItem('psl-turbo', S.turbo ? '1' : '0'); } catch (er) {} }
    else if (act === 'sound') {
      S.sound = !S.sound; b.setAttribute('aria-pressed', S.sound);
      b.querySelector('.msi').textContent = S.sound ? 'volume_up' : 'volume_off';
      try { localStorage.setItem('psl-sound', S.sound ? '1' : '0'); } catch (er) {}
      if (S.sound) beep(523, 0.1, 0.05);
    }
    else if (act === 'notes') {
      S.notes = !S.notes; b.setAttribute('aria-pressed', S.notes);
      root.querySelector('.psl-notes').hidden = !S.notes;
      try { localStorage.setItem('psl-notes', S.notes ? '1' : '0'); } catch (er) {}
    }
    else if (act === 'paytable') { openPaytable(); }
    else if (act === 'close') { closePaytable(); }
    else if (act === 'ov-continue') { S.sinceCheck = 0; hideOverlay(); } // reality check ack
    /* 'ov-ack' (big win / free-spins intro) is handled by overlay.onclick */
    else if (act === 'ov-reset') {
      S.bal = START_BAL; S.spins = 0; S.wagered = 0; S.won = 0; S.refills = 0; S.t0 = null; S.sinceCheck = 0;
      clearInterval(S.cycleT); badge.hidden = true;
      root.querySelectorAll('.psl-sym').forEach(function (el) { el.classList.remove('hit', 'dim'); });
      hideOverlay(); setWinReadout(0, false); refresh();
      announce('Session reset. Balance ' + fmt(START_BAL) + ' demo credits.');
    }
    else if (act === 'ov-dismiss') { hideOverlay(); }
    else if (act === 'ov-refill') {
      S.bal = +(S.bal + 1000).toFixed(2); S.refills++;
      hideOverlay(); refresh();
      announce('Refilled 1,000 demo credits. Balance ' + fmt(S.bal) + '. Refills this session: ' + S.refills + '.');
    }
  }

  function onKey(e) {
    if (e.code !== 'Space' || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t.closest && t.closest('button, a, input, textarea, select, summary, [role="button"], dialog')) return;
    var r = root.getBoundingClientRect();
    if (r.bottom < 200 || r.top > innerHeight - 200) return; // only while the game is substantially on screen
    e.preventDefault();
    if (overlayOpen()) { // focus the primary action; a second, deliberate press activates it
      var c = overlay.querySelector('button'); if (c) c.focus(); return;
    }
    spin();
  }

  /* ── init (isolated: a failure here can't hurt the page) ───────────── */
  function init() {
    try {
      if (!build()) return;
      window.__pslot = {
        spin: spin,
        force: function (grid) { // test hook: play the next spin with a fixed grid
          var _sg = spinGrid; spinGrid = function () { spinGrid = _sg; return grid; }; // eslint-disable-line no-func-assign
        },
        state: function () { return JSON.parse(JSON.stringify({ bal: S.bal, spins: S.spins, fsLeft: S.fsLeft, spinning: S.spinning })); }
      };
    } catch (e) { /* leave the static fallback copy in place */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
