/* rb-consent — cookie/storage consent: banner + preference-center dialog.
   Layer 1: a themed banner with "Cookie settings" and "Accept all cookies".
   Layer 2: a settings dialog (OneTrust-style preference center) with a toggle
   per storage category, expandable per-category info, "Allow all" and
   "Confirm choices". Themed per homepage variant (interactive teal · dossier
   paper · retro phosphor); region-aware copy from the visitor's timezone
   (EU → GDPR · Canada → PIPEDA · US → CCPA · elsewhere → generic).

   Stored choice (localStorage 'rb-consent'):
     { v: 'accepted'|'essential'|'custom', c: { preferences, analytics }, region, t }
   analytics.js reads c.analytics before loading GA4. When preferences are
   declined this module deletes the saved preference keys and blocks future
   writes to them, so the toggle does what it says.
   window.rbCookieSettings() reopens the dialog any time (e.g. a footer link). */
(function () {
  'use strict';
  if (window.__rbConsent) return; window.__rbConsent = 1;
  var KEY = 'rb-consent';
  // dev/test helper: append ?consent=reset (or ?show / ?clear) to any page URL to
  // clear the stored choice so the banner shows again, then strip the param.
  try {
    if (/[?&]consent=(reset|show|clear)(&|$)/.test(location.search)) {
      try { localStorage.removeItem(KEY); } catch (e) {}
      if (window.history && history.replaceState) history.replaceState(null, '', location.pathname + location.hash);
    }
  } catch (e) {}
  // every device-local preference the site saves, by key prefix
  var PREF_PREFIXES = ['rba-', 'rb-home-variant', 'ctoc-cs-shots'];

  function readConsent() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function isPrefKey(k) {
    for (var i = 0; i < PREF_PREFIXES.length; i++) { if (String(k).indexOf(PREF_PREFIXES[i]) === 0) return true; }
    return false;
  }

  // ---- preference opt-out enforcement: purge saved keys, drop future writes ----
  var guarded = false;
  function guardPrefs() {
    if (guarded) return; guarded = true;
    try {
      var doomed = [], i, k;
      for (i = 0; i < localStorage.length; i++) { k = localStorage.key(i); if (k && isPrefKey(k)) doomed.push(k); }
      for (i = 0; i < doomed.length; i++) localStorage.removeItem(doomed[i]);
    } catch (e) {}
    try {
      var native = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k) {
        if (this === window.localStorage && isPrefKey(k)) return;
        return native.apply(this, arguments);
      };
    } catch (e) {}
  }
  function enforce(c) { if (c && c.c && c.c.preferences === false) guardPrefs(); }

  // ---- region from timezone ----
  var tz = '';
  try { tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch (e) {}
  var CA_TZ = /America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Whitehorse|Yellowknife|Iqaluit)/;
  var region = /^Europe\//.test(tz) ? 'eu' : CA_TZ.test(tz) ? 'ca' : /^America\//.test(tz) ? 'us' : 'other';
  var REGION_LINE = {
    eu: 'Under the GDPR you can decline everything that isn’t essential, declining changes nothing you can see.',
    ca: 'Consistent with PIPEDA, only what the site needs to work is stored unless you agree to more.',
    us: 'You can decline non-essential storage, nothing here is sold or shared (CCPA).',
    other: 'You can decline non-essential storage, the site works the same either way.'
  };

  // ---- theme detection (mirrors cursor.js heuristics) ----
  function themeOf() {
    if (document.querySelector('.dsr')) return 'dossier';
    var bg = '';
    try { bg = getComputedStyle(document.body).backgroundColor; } catch (e) {}
    if (bg === 'rgb(4, 8, 6)') return 'retro';
    return 'default';
  }

  var THEMES = {
    'default': {
      bar: 'background:rgba(10,16,22,0.96);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.16);border-radius:14px;box-shadow:0 18px 44px -16px rgba(0,0,0,0.6);color:#e9eef7;font-family:"DM Sans","Inter",-apple-system,sans-serif;',
      accept: 'background:#4ca88f;color:#06201d;border:0;border-radius:999px;',
      decline: 'background:transparent;color:#e9eef7;border:1px solid rgba(255,255,255,0.3);border-radius:999px;',
      kicker: 'color:#7dd3c0;',
      vars: '--rbc-ac:#4ca88f;--rbc-acink:#06201d;--rbc-line:rgba(255,255,255,0.16);--rbc-line2:rgba(255,255,255,0.4);--rbc-mut:rgba(233,238,247,0.68);--rbc-hov:rgba(255,255,255,0.05);--rbc-r:999px;',
      overlay: 'background:rgba(4,8,12,0.6);'
    },
    dossier: {
      bar: 'background:#fbf5e6;border:1.5px solid #0a0a0a;box-shadow:8px 8px 0 rgba(10,8,4,0.12);color:#0a0a0a;font-family:"DM Sans","Inter",-apple-system,sans-serif;',
      accept: 'background:#0a0a0a;color:#f4ead2;border:1.5px solid #0a0a0a;border-radius:0;',
      decline: 'background:transparent;color:#0a0a0a;border:1.5px solid #0a0a0a;border-radius:0;',
      kicker: 'color:#b23a2e;',
      vars: '--rbc-ac:#0a0a0a;--rbc-acink:#f4ead2;--rbc-line:rgba(10,10,10,0.22);--rbc-line2:#0a0a0a;--rbc-mut:rgba(10,10,10,0.66);--rbc-hov:rgba(10,10,10,0.05);--rbc-r:0px;',
      overlay: 'background:rgba(30,22,8,0.45);'
    },
    retro: {
      bar: 'background:#04120a;border:1px solid rgba(108,240,164,0.4);box-shadow:0 0 24px rgba(108,240,164,0.15);color:#9af0c2;font-family:"JetBrains Mono",monospace;',
      accept: 'background:#6cf0a4;color:#04130b;border:1px solid #6cf0a4;border-radius:0;',
      decline: 'background:transparent;color:#6cf0a4;border:1px solid rgba(108,240,164,0.5);border-radius:0;',
      kicker: 'color:#ffb454;',
      vars: '--rbc-ac:#6cf0a4;--rbc-acink:#04130b;--rbc-line:rgba(108,240,164,0.28);--rbc-line2:rgba(108,240,164,0.55);--rbc-mut:rgba(154,240,194,0.72);--rbc-hov:rgba(108,240,164,0.08);--rbc-r:0px;',
      overlay: 'background:rgba(1,6,3,0.66);'
    }
  };

  // ---- storage categories (real inventory — nothing here is invented) ----
  var CATS = [
    {
      id: 'necessary', label: 'Strictly necessary', always: true,
      info: 'Stores exactly one item: your consent choice, so this window doesn’t reappear on every visit. It holds no identifiers and never leaves your browser.'
    },
    {
      id: 'preferences', label: 'Preferences', on: true,
      info: 'Remembers device-local settings: dark or light theme, your chosen homepage layout, AEGIS drill modes and best scores, Light Architect fixtures, and whether you’ve voted in the work-page poll. Stored only on this device, never transmitted. Turning this off clears the saved settings and stops new ones from being saved.'
    },
    {
      id: 'analytics', label: 'Analytics', on: false,
      info: 'Loads Google Analytics 4 with anonymized IPs, used only to see which work gets read. No ad trackers, and Do Not Track is honored even after you accept. Off means Google Analytics never loads and sets nothing.'
    }
  ];

  function boot() {
    if (!document.body) return setTimeout(boot, 60);
    var theme = themeOf();
    var t = THEMES[theme];
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var stored = readConsent();
    enforce(stored);

    // interactive-state styles (focus, hover, switch) — layout stays inline
    if (!document.getElementById('rb-consent-css')) {
      var css = document.createElement('style');
      css.id = 'rb-consent-css';
      css.textContent =
        '#rb-consent button:focus-visible,#rbc-modal button:focus-visible,#rbc-card:focus-visible{outline:2px solid var(--rbc-ac,#4ca88f);outline-offset:2px}' +
        '#rbc-modal .rbc-exp:hover{background:var(--rbc-hov)}' +
        '#rbc-modal .rbc-knob{background:var(--rbc-mut);transition:transform .18s ease,background .18s ease}' +
        '#rbc-modal .rbc-track{transition:background .18s ease,border-color .18s ease}' +
        '#rbc-modal .rbc-sw[aria-checked="true"] .rbc-knob{transform:translateX(18px);background:var(--rbc-acink)}' +
        '#rbc-modal .rbc-sw[aria-checked="true"] .rbc-track{background:var(--rbc-ac);border-color:var(--rbc-ac)}' +
        '@media (prefers-reduced-motion:reduce){#rbc-modal .rbc-knob,#rbc-modal .rbc-track{transition:none}}';
      document.head.appendChild(css);
    }

    var kicker = theme === 'retro' ? 'C:\\> STORAGE_CONSENT' : 'Cookies & storage';
    var bar = null;

    // ---- layer 1: banner (only when no choice is stored) ----
    if (!stored) {
      bar = document.createElement('div');
      bar.id = 'rb-consent';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'Cookie and storage consent');
      bar.style.cssText = 'position:fixed;left:50%;bottom:16px;margin-left:max(-265.5px,calc(-50vw + 16px));z-index:99998;width:min(531px,calc(100vw - 32px));padding:16px 18px;display:flex;flex-direction:column;gap:12px;font-size:12.5px;line-height:1.55;' +
        t.vars + t.bar + (reduce ? '' : 'transform:translateY(calc(100% + 20px));transition:transform .45s cubic-bezier(.2,.8,.2,1);');
      bar.innerHTML =
        '<div>' +
          '<div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;' + t.kicker + '">' + kicker + '</div>' +
          'This site keeps your preferences (theme, layouts, game scores) in your browser. Accepting all also turns on Google Analytics, with anonymized IPs, used only to see which work gets read. No ad trackers. ' + REGION_LINE[region] +
        '</div>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">' +
          '<button id="rb-consent-settings" type="button" style="padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;letter-spacing:0.02em;' + t.decline + '">Cookie settings</button>' +
          '<button id="rb-consent-yes" type="button" style="padding:8px 18px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:0.02em;' + t.accept + '">Accept all cookies</button>' +
        '</div>';
      document.body.appendChild(bar);
      if (!reduce) requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.transform = 'translateY(0)'; }); });
    }

    function dismissBar() {
      if (!bar) return;
      bar.style.transform = 'translateY(calc(100% + 20px))';
      var b = bar; bar = null;
      setTimeout(function () { b.remove(); }, reduce ? 0 : 500);
    }

    function save(prefsOn, anOn) {
      var v = prefsOn && anOn ? 'accepted' : prefsOn ? 'essential' : 'custom';
      var rec = { v: v, c: { preferences: !!prefsOn, analytics: !!anOn }, region: region, t: new Date().toISOString() };
      try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('rb-consent', { detail: rec })); } catch (e) {}
      enforce(rec);
      dismissBar();
    }

    // ---- layer 2: settings dialog (built on first open) ----
    var modal = null, card = null, opener = null, prevOverflow = '';

    function rows() {
      var h = '';
      for (var i = 0; i < CATS.length; i++) {
        var c = CATS[i];
        h += '<div style="border-top:1px solid var(--rbc-line);">' +
          '<div style="display:flex;align-items:center;gap:4px;">' +
            '<button type="button" class="rbc-exp" data-cat="' + c.id + '" aria-expanded="false" aria-controls="rbc-info-' + c.id + '" style="flex:1;display:flex;align-items:center;gap:10px;text-align:left;background:none;border:0;color:inherit;font-family:inherit;padding:11px 6px;min-height:44px;cursor:pointer;">' +
              '<span class="rbc-glyph" aria-hidden="true" style="font-family:\'JetBrains Mono\',monospace;font-size:14px;width:14px;flex:none;">+</span>' +
              '<span style="font-size:13px;font-weight:700;letter-spacing:0.01em;">' + c.label + '</span>' +
            '</button>' +
            (c.always
              ? '<span style="font-family:\'JetBrains Mono\',monospace;font-size:9.5px;font-weight:700;letter-spacing:0.1em;padding:0 6px;white-space:nowrap;color:var(--rbc-mut);">ALWAYS ON</span>'
              : '<button type="button" class="rbc-sw" role="switch" aria-checked="false" data-cat="' + c.id + '" aria-label="' + c.label + '" style="display:inline-flex;align-items:center;gap:8px;background:none;border:0;padding:10px 6px;min-height:44px;cursor:pointer;color:inherit;font-family:inherit;">' +
                  '<span class="rbc-state" style="font-family:\'JetBrains Mono\',monospace;font-size:9.5px;font-weight:700;letter-spacing:0.1em;color:var(--rbc-mut);">OFF</span>' +
                  '<span class="rbc-track" aria-hidden="true" style="position:relative;flex:none;width:40px;height:22px;border:1px solid var(--rbc-line2);border-radius:var(--rbc-r);display:block;">' +
                    '<span class="rbc-knob" style="position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:var(--rbc-r);display:block;"></span>' +
                  '</span>' +
                '</button>') +
          '</div>' +
          '<div id="rbc-info-' + c.id + '" hidden style="padding:2px 6px 14px 30px;font-size:12px;line-height:1.6;color:var(--rbc-mut);">' + c.info + '</div>' +
        '</div>';
      }
      return h;
    }

    function setSwitch(sw, on) {
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
      var st = sw.querySelector('.rbc-state');
      st.textContent = on ? 'ON' : 'OFF';
      st.style.color = on ? 'inherit' : 'var(--rbc-mut)';
    }
    function switchOf(id) { return card.querySelector('.rbc-sw[data-cat="' + id + '"]'); }

    function buildModal() {
      modal = document.createElement('div');
      modal.id = 'rbc-modal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;' + t.vars + t.overlay;
      card = document.createElement('div');
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-modal', 'true');
      card.setAttribute('aria-labelledby', 'rbc-title');
      card.setAttribute('tabindex', '-1');
      card.id = 'rbc-card';
      card.style.cssText = 'width:min(560px,100%);max-height:min(84vh,660px);display:flex;flex-direction:column;font-size:12.5px;line-height:1.55;' + t.vars + t.bar;
      card.innerHTML =
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 18px 0;">' +
          '<div>' +
            '<div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;' + t.kicker + '">' + kicker + '</div>' +
            '<h2 id="rbc-title" style="margin:0;font-size:17px;font-weight:700;letter-spacing:0.01em;font-family:inherit;">Cookie settings</h2>' +
          '</div>' +
          '<button type="button" id="rbc-close" aria-label="Close cookie settings" style="flex:none;width:34px;height:34px;margin:-4px -6px 0 0;display:flex;align-items:center;justify-content:center;background:none;border:0;color:inherit;font-family:inherit;font-size:20px;line-height:1;cursor:pointer;">&#215;</button>' +
        '</div>' +
        '<div style="overflow-y:auto;padding:10px 18px 4px;">' +
          '<p style="margin:0 0 14px;color:var(--rbc-mut);">Choose what this site may store in your browser. Strictly necessary storage is always on; everything else stays off unless you turn it on. ' + REGION_LINE[region] + '</p>' +
          rows() +
        '</div>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;padding:14px 18px 16px;border-top:1px solid var(--rbc-line);">' +
          '<button type="button" id="rbc-allow" style="padding:9px 14px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;letter-spacing:0.02em;' + t.decline + '">Allow all</button>' +
          '<button type="button" id="rbc-confirm" style="padding:9px 18px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:0.02em;' + t.accept + '">Confirm choices</button>' +
        '</div>';
      modal.appendChild(card);
      document.body.appendChild(modal);

      // expand / collapse per-category info
      var exps = card.querySelectorAll('.rbc-exp');
      for (var i = 0; i < exps.length; i++) {
        exps[i].addEventListener('click', function () {
          var open = this.getAttribute('aria-expanded') === 'true';
          this.setAttribute('aria-expanded', open ? 'false' : 'true');
          this.querySelector('.rbc-glyph').textContent = open ? '+' : '−';
          var panel = document.getElementById(this.getAttribute('aria-controls'));
          if (panel) panel.hidden = open;
        });
      }
      // toggles
      var sws = card.querySelectorAll('.rbc-sw');
      for (i = 0; i < sws.length; i++) {
        sws[i].addEventListener('click', function () {
          setSwitch(this, this.getAttribute('aria-checked') !== 'true');
        });
      }
      document.getElementById('rbc-close').addEventListener('click', closeModal);
      modal.addEventListener('mousedown', function (e) { if (e.target === modal) closeModal(); });
      document.getElementById('rbc-allow').addEventListener('click', function () { save(true, true); closeModal(); });
      document.getElementById('rbc-confirm').addEventListener('click', function () {
        save(switchOf('preferences').getAttribute('aria-checked') === 'true',
             switchOf('analytics').getAttribute('aria-checked') === 'true');
        closeModal();
      });
    }

    function onKeydown(e) {
      if (e.key === 'Escape') { e.stopPropagation(); return closeModal(); }
      if (e.key !== 'Tab') return;
      var f = card.querySelectorAll('button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === card)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function openModal() {
      if (!modal) buildModal();
      opener = document.activeElement;
      // toggles reflect the stored choice, else defaults (preferences on, analytics off)
      var cur = readConsent();
      for (var i = 0; i < CATS.length; i++) {
        if (CATS[i].always) continue;
        var on = cur && cur.c ? cur.c[CATS[i].id] === true : CATS[i].on;
        setSwitch(switchOf(CATS[i].id), on);
      }
      modal.style.display = 'flex';
      prevOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.addEventListener('keydown', onKeydown, true);
      card.focus();
    }
    function closeModal() {
      if (!modal) return;
      modal.style.display = 'none';
      document.documentElement.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeydown, true);
      if (opener && opener.focus && document.contains(opener)) opener.focus();
      opener = null;
    }

    window.rbCookieSettings = openModal;

    if (bar) {
      document.getElementById('rb-consent-yes').addEventListener('click', function () { save(true, true); });
      document.getElementById('rb-consent-settings').addEventListener('click', openModal);
    }
  }
  boot();
})();
