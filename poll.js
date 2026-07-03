/* rb-poll — a reader poll at the bottom of each homepage:
   "Which homepage did you like best?"  ·  Interactive · Dossier · Retro.

   Global running total shared across ALL visitors via Firebase Firestore
   (config supplied in firebase-config.js as window.RB_FIREBASE_CONFIG). When no
   valid config is present it falls back to a per-browser local tally so the UI
   still works for preview — the banner in render() makes the mode explicit.

   Themed per homepage variant (interactive teal · dossier paper · retro phosphor),
   mirroring cursor.js / cookie-banner.js theme detection. The visitor's own pick
   is remembered under an 'rba-' key, so it is covered by the Preferences consent
   category (and purged if Preferences are declined). One vote per browser; picking
   another option moves the vote (−1 old, +1 new). Accessible: radiogroup semantics,
   arrow-key navigation, visible focus, and an aria-live result announcement. */
(function () {
  'use strict';
  if (window.__rbPoll) return; window.__rbPoll = 1;

  var FB_VER = '10.13.2';
  var OPTS = [
    { id: 'interactive', label: 'Interactive', sub: 'Live systems & playable prototypes' },
    { id: 'dossier',     label: 'Dossier',     sub: 'Editorial, print-inspired' },
    { id: 'retro',       label: 'Retro',       sub: 'Green-CRT terminal' }
  ];
  var Q = 'Which homepage did you like best?';
  var VKEY = 'rba-home-poll-vote';    // your pick (preference-gated by cookie-banner)
  var LKEY = 'rba-home-poll-local';   // local-fallback tallies when no Firebase
  var SEED = { interactive: 0, dossier: 0, retro: 0 };

  // ---- theme (mirrors cookie-banner.js) ----
  function themeOf() {
    if (document.querySelector('.dsr')) return 'dossier';
    var bg = ''; try { bg = getComputedStyle(document.body).backgroundColor; } catch (e) {}
    if (bg === 'rgb(4, 8, 6)') return 'retro';
    return 'default';
  }
  var TH = {
    'default': { vars: '--rbp-ac:#4ca88f;--rbp-ac2:#7dd3c0;--rbp-acink:#06201d;--rbp-line:rgba(255,255,255,0.13);--rbp-line2:rgba(255,255,255,0.42);--rbp-mut:rgba(233,238,247,0.6);--rbp-track:rgba(255,255,255,0.07);--rbp-hov:rgba(255,255,255,0.05);--rbp-fill:rgba(76,168,143,0.22);--rbp-r:13px;--rbp-kick:#7dd3c0;--rbp-font:"DM Sans","Inter",-apple-system,sans-serif;--rbp-mono:"JetBrains Mono",monospace;',
      card: 'background:linear-gradient(180deg,rgba(14,22,34,0.94),rgba(9,14,22,0.97));border:1px solid rgba(255,255,255,0.12);border-radius:18px;color:#e9eef7;box-shadow:0 34px 80px -34px rgba(0,0,0,0.75);' },
    dossier: { vars: '--rbp-ac:#b23a2e;--rbp-ac2:#b23a2e;--rbp-acink:#fbf5e6;--rbp-line:rgba(10,10,10,0.2);--rbp-line2:#0a0a0a;--rbp-mut:rgba(10,10,10,0.6);--rbp-track:rgba(10,10,10,0.07);--rbp-hov:rgba(10,10,10,0.04);--rbp-fill:rgba(178,58,46,0.14);--rbp-r:0px;--rbp-kick:#b23a2e;--rbp-font:"DM Sans","Inter",-apple-system,sans-serif;--rbp-mono:"JetBrains Mono",monospace;',
      card: 'background:#fbf5e6;border:1.5px solid #0a0a0a;box-shadow:9px 9px 0 rgba(10,8,4,0.14);color:#0a0a0a;' },
    retro: { vars: '--rbp-ac:#6cf0a4;--rbp-ac2:#6cf0a4;--rbp-acink:#04130b;--rbp-line:rgba(108,240,164,0.28);--rbp-line2:rgba(108,240,164,0.55);--rbp-mut:rgba(154,240,194,0.64);--rbp-track:rgba(108,240,164,0.12);--rbp-hov:rgba(108,240,164,0.07);--rbp-fill:rgba(108,240,164,0.16);--rbp-r:0px;--rbp-kick:#ffb454;--rbp-font:"JetBrains Mono",monospace;--rbp-mono:"JetBrains Mono",monospace;',
      card: 'background:#04120a;border:1px solid rgba(108,240,164,0.4);box-shadow:0 0 34px rgba(108,240,164,0.12);color:#9af0c2;' }
  };

  // ---- one-time interactive-state stylesheet ----
  function injectCss() {
    if (document.getElementById('rb-poll-css')) return;
    var s = document.createElement('style'); s.id = 'rb-poll-css';
    s.textContent = [
      '#rb-poll{padding:60px 20px 24px;position:relative;z-index:1;}',
      '#rb-poll .rbp-card{max-width:600px;margin:0 auto;padding:26px 26px 22px;font-family:var(--rbp-font);}',
      '#rb-poll .rbp-kick{font-family:var(--rbp-mono);font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:var(--rbp-kick);margin:0 0 12px;}',
      '#rb-poll .rbp-q{font-size:22px;font-weight:700;letter-spacing:-0.01em;line-height:1.2;margin:0 0 4px;color:inherit;opacity:1;font-family:var(--rbp-font);}',
      '#rb-poll .rbp-meta{font-family:var(--rbp-mono);font-size:11px;letter-spacing:0.04em;color:var(--rbp-mut);margin-bottom:18px;}',
      '#rb-poll .rbp-opts{display:flex;flex-direction:column;gap:9px;}',
      '#rb-poll .rbp-opt{position:relative;display:flex;align-items:center;gap:12px;width:100%;text-align:left;overflow:hidden;cursor:pointer;margin:0;padding:13px 15px;border:1px solid var(--rbp-line);border-radius:var(--rbp-r);background:transparent;color:inherit;font:inherit;transition:border-color .15s ease,background .15s ease;-webkit-tap-highlight-color:transparent;}',
      '#rb-poll .rbp-opt:hover{border-color:var(--rbp-line2);background:var(--rbp-hov);}',
      '#rb-poll .rbp-opt:focus-visible{outline:2px solid var(--rbp-ac);outline-offset:2px;}',
      '#rb-poll .rbp-opt[aria-checked="true"]{border-color:var(--rbp-ac);}',
      '#rb-poll .rbp-fill{position:absolute;left:0;top:0;bottom:0;width:0;background:var(--rbp-fill);border-right:2px solid var(--rbp-ac);transition:width .6s cubic-bezier(.2,.8,.2,1);z-index:0;}',
      '#rb-poll .rbp-main{position:relative;z-index:1;flex:1;min-width:0;}',
      '#rb-poll .rbp-label{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;line-height:1.2;color:inherit;}',
      '#rb-poll .rbp-sub{font-size:12px;color:var(--rbp-mut);margin-top:2px;}',
      '#rb-poll .rbp-tick{width:16px;height:16px;flex:none;border-radius:50%;background:var(--rbp-ac);color:var(--rbp-acink);display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;}',
      '#rb-poll .rbp-num{position:relative;z-index:1;flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:3px;font-family:var(--rbp-mono);}',
      '#rb-poll .rbp-pct{font-size:15px;font-weight:700;line-height:1;color:inherit;}',
      '#rb-poll .rbp-cnt{font-size:10px;line-height:1;color:var(--rbp-mut);}',
      '#rb-poll .rbp-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;font-family:var(--rbp-mono);font-size:11px;letter-spacing:0.04em;color:var(--rbp-mut);}',
      '#rb-poll .rbp-live{display:inline-flex;align-items:center;gap:6px;}',
      '#rb-poll .rbp-dot{width:7px;height:7px;border-radius:50%;background:var(--rbp-ac);box-shadow:0 0 8px var(--rbp-ac);}',
      '#rb-poll .rbp-change{background:none;border:0;color:var(--rbp-ac2);font:inherit;font-family:var(--rbp-mono);font-size:11px;letter-spacing:0.04em;cursor:pointer;padding:4px 2px;text-decoration:underline;text-underline-offset:3px;}',
      '#rb-poll .rbp-change:focus-visible{outline:2px solid var(--rbp-ac);outline-offset:2px;}',
      '#rb-poll .rbp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}',
      '@media (max-width:520px){#rb-poll .rbp-card{padding:22px 18px 18px;}#rb-poll .rbp-q{font-size:19px;}#rb-poll{padding:44px 14px 16px;}}',
      '@media (prefers-reduced-motion: reduce){#rb-poll .rbp-fill{transition:none;}#rb-poll .rbp-opt{transition:none;}}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  // ---- local storage of your pick (respects consent via the 'rba-' prefix) ----
  function getVote() { try { return localStorage.getItem(VKEY); } catch (e) { return null; } }
  function setVote(v) { try { localStorage.setItem(VKEY, v); } catch (e) {} }

  // ---- backends ----
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.crossOrigin = 'anonymous';
      s.onload = res; s.onerror = function () { rej(new Error('load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function initFirebase(cfg) {
    return loadScript('https://www.gstatic.com/firebasejs/' + FB_VER + '/firebase-app-compat.js')
      .then(function () { return loadScript('https://www.gstatic.com/firebasejs/' + FB_VER + '/firebase-firestore-compat.js'); })
      .then(function () {
        var app = window.firebase.apps && window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(cfg);
        var ref = window.firebase.firestore(app).collection('polls').doc('homepage');
        var inc = window.firebase.firestore.FieldValue.increment;
        return {
          mode: 'live',
          subscribe: function (cb) { ref.onSnapshot(function (snap) { cb(snap.exists ? snap.data() : SEED); }, function () { cb(null); }); },
          vote: function (id, prev) { var u = {}; u[id] = inc(1); if (prev && prev !== id) u[prev] = inc(-1); return ref.set(u, { merge: true }); }
        };
      });
  }
  function localBackend() {
    function read() { try { return Object.assign({}, SEED, JSON.parse(localStorage.getItem(LKEY) || 'null')); } catch (e) { return Object.assign({}, SEED); } }
    function write(d) { try { localStorage.setItem(LKEY, JSON.stringify(d)); } catch (e) {} }
    var subs = [];
    return {
      mode: 'local',
      subscribe: function (cb) { subs.push(cb); cb(read()); },
      vote: function (id, prev) { var d = read(); d[id] = (d[id] || 0) + 1; if (prev && prev !== id) d[prev] = Math.max(0, (d[prev] || 0) - 1); write(d); subs.forEach(function (f) { f(read()); }); return Promise.resolve(); }
    };
  }

  // ---- state + render ----
  var mount, card, live, counts = Object.assign({}, SEED), myVote = getVote(), backend = null, mode = 'local';

  function total() { return OPTS.reduce(function (a, o) { return a + (counts[o.id] || 0); }, 0); }
  function pct(id, t) { return t > 0 ? Math.round((counts[id] || 0) / t * 100) : 0; }
  function num(n) { return (n || 0).toLocaleString('en-US'); }

  function render() {
    if (!card) return;
    var t = total(), voted = !!myVote;
    var rows = OPTS.map(function (o) {
      var p = pct(o.id, t), mine = myVote === o.id;
      return '<button class="rbp-opt" type="button" role="radio" aria-checked="' + (mine ? 'true' : 'false') +
        '" data-id="' + o.id + '" tabindex="' + (mine || (!voted && o.id === OPTS[0].id) ? '0' : '-1') + '">' +
        '<span class="rbp-fill" style="width:' + (voted ? p : 0) + '%"></span>' +
        '<span class="rbp-main"><span class="rbp-label">' + o.label + (mine ? '<span class="rbp-tick" aria-hidden="true">✓</span>' : '') +
        '</span><span class="rbp-sub">' + o.sub + '</span></span>' +
        (voted ? '<span class="rbp-num"><span class="rbp-pct">' + p + '%</span><span class="rbp-cnt">' + num(counts[o.id] || 0) + '</span></span>' : '') +
        '</button>';
    }).join('');
    var meta = voted ? (num(t) + (t === 1 ? ' vote' : ' votes') + ' · you picked ' + labelOf(myVote))
                     : (t > 0 ? num(t) + (t === 1 ? ' vote so far — add yours' : ' votes so far — add yours') : 'Be the first to vote');
    card.innerHTML =
      '<div class="rbp-kick">// Reader poll</div>' +
      '<div class="rbp-q" role="heading" aria-level="2">' + Q + '</div>' +
      '<div class="rbp-meta">' + meta + '</div>' +
      '<div class="rbp-opts" role="radiogroup" aria-label="' + Q + '">' + rows + '</div>' +
      '<div class="rbp-foot"><span class="rbp-live">' + (mode === 'live' ? '<span class="rbp-dot"></span>Live · updates as visitors vote' : 'Local preview · add Firebase config to go live') + '</span>' +
      (voted ? '<button class="rbp-change" type="button">Change my vote</button>' : '<span>&nbsp;</span>') + '</div>';
    // wire options
    var btns = card.querySelectorAll('.rbp-opt');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () { onVote(this.getAttribute('data-id')); });
      btns[i].addEventListener('keydown', onKey);
    }
    var ch = card.querySelector('.rbp-change');
    if (ch) ch.addEventListener('click', function () { myVote = null; render(); var f = card.querySelector('.rbp-opt'); if (f) f.focus(); });
  }
  function labelOf(id) { for (var i = 0; i < OPTS.length; i++) if (OPTS[i].id === id) return OPTS[i].label; return id; }

  function onKey(e) {
    var k = e.key;
    if (k === 'Enter' || k === ' ') { e.preventDefault(); onVote(this.getAttribute('data-id')); return; }
    if (k !== 'ArrowRight' && k !== 'ArrowDown' && k !== 'ArrowLeft' && k !== 'ArrowUp') return;
    e.preventDefault();
    var btns = Array.prototype.slice.call(card.querySelectorAll('.rbp-opt'));
    var i = btns.indexOf(this), d = (k === 'ArrowRight' || k === 'ArrowDown') ? 1 : -1;
    var n = btns[(i + d + btns.length) % btns.length];
    if (n) { this.tabIndex = -1; n.tabIndex = 0; n.focus(); }
  }

  function onVote(id) {
    var prev = myVote;
    if (prev === id) return;
    counts[id] = (counts[id] || 0) + 1;
    if (prev && prev !== id) counts[prev] = Math.max(0, (counts[prev] || 0) - 1);
    myVote = id; setVote(id); render();
    if (live) live.textContent = 'Thanks — you voted ' + labelOf(id) + '. ' +
      OPTS.map(function (o) { return o.label + ' ' + pct(o.id, total()) + '%'; }).join(', ') + '.';
    if (backend) backend.vote(id, prev).catch(function () {});
  }

  // ---- boot (waits for the DC-rendered mount, then wires a backend) ----
  var tries = 0;
  // Return the #rb-poll that lives in the *rendered* DC tree — i.e. NOT the inert
  // copy still sitting inside the <x-dc> template — so we don't mount into a node
  // React is about to throw away. Retries until React has rendered the page.
  function findMount() {
    var all = document.querySelectorAll('#rb-poll');
    for (var i = 0; i < all.length; i++) { if (!all[i].closest('x-dc')) return all[i]; }
    return null;
  }
  function boot() {
    if (!document.body) return setTimeout(boot, 60);
    mount = findMount();
    if (!mount) { if (tries++ < 90) return setTimeout(boot, 100); return; }
    if (mount.__rbReady) return; mount.__rbReady = 1;

    injectCss();
    var th = TH[themeOf()] || TH['default'];
    card = document.createElement('div'); card.className = 'rbp-card';
    card.setAttribute('style', th.vars + th.card);
    live = document.createElement('div'); live.className = 'rbp-sr'; live.setAttribute('aria-live', 'polite');
    mount.appendChild(card); mount.appendChild(live);
    render();

    var cfg = window.RB_FIREBASE_CONFIG;
    var useFb = cfg && cfg.apiKey && String(cfg.apiKey).indexOf('YOUR_') !== 0 && cfg.projectId;
    (useFb ? initFirebase(cfg).catch(function () { return null; }) : Promise.resolve(null))
      .then(function (bk) {
        backend = bk || localBackend(); mode = backend.mode;
        backend.subscribe(function (d) { if (d) { counts = Object.assign({}, SEED, d); render(); } });
      });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
