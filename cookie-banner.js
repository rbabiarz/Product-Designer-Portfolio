/* rb-consent — a standard cookie/storage consent banner.
   Themed per homepage variant (interactive teal · dossier paper · retro phosphor),
   with region-aware copy resolved from the visitor's timezone
   (EU → GDPR · Canada → PIPEDA · US → CCPA · elsewhere → generic).
   The choice persists in localStorage; analytics.js checks it before loading. */
(function () {
  'use strict';
  if (window.__rbConsent) return; window.__rbConsent = 1;
  var KEY = 'rb-consent';
  try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }

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
      bar: 'background:rgba(10,16,22,0.94);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid rgba(255,255,255,0.14);color:#e9eef7;font-family:"DM Sans","Inter",-apple-system,sans-serif;',
      accept: 'background:#4ca88f;color:#06201d;border:0;border-radius:999px;',
      decline: 'background:transparent;color:#e9eef7;border:1px solid rgba(255,255,255,0.3);border-radius:999px;',
      kicker: 'color:#7dd3c0;'
    },
    dossier: {
      bar: 'background:#fbf5e6;border-top:1.5px solid #0a0a0a;color:#0a0a0a;font-family:"DM Sans","Inter",-apple-system,sans-serif;box-shadow:0 -4px 0 rgba(10,8,4,0.06);',
      accept: 'background:#0a0a0a;color:#f4ead2;border:1.5px solid #0a0a0a;border-radius:0;',
      decline: 'background:transparent;color:#0a0a0a;border:1.5px solid #0a0a0a;border-radius:0;',
      kicker: 'color:#b23a2e;'
    },
    retro: {
      bar: 'background:#04120a;border-top:1px solid rgba(108,240,164,0.4);color:#9af0c2;font-family:"JetBrains Mono",monospace;',
      accept: 'background:#6cf0a4;color:#04130b;border:1px solid #6cf0a4;border-radius:0;',
      decline: 'background:transparent;color:#6cf0a4;border:1px solid rgba(108,240,164,0.5);border-radius:0;',
      kicker: 'color:#ffb454;'
    }
  };

  function boot() {
    if (!document.body) return setTimeout(boot, 60);
    var t = THEMES[themeOf()];
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    var bar = document.createElement('div');
    bar.id = 'rb-consent';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie and storage consent');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99998;padding:14px 22px;display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;font-size:13px;line-height:1.5;' +
      t.bar + (reduce ? '' : 'transform:translateY(100%);transition:transform .45s cubic-bezier(.2,.8,.2,1);');

    var kicker = themeOf() === 'retro' ? 'C:\\> STORAGE_CONSENT' : 'Cookies & storage';
    bar.innerHTML =
      '<div style="max-width:640px;min-width:240px;flex:1 1 340px;">' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;' + t.kicker + '">' + kicker + '</div>' +
        'This site stores your preferences in your browser, theme, layouts, and game scores. No ad trackers. ' + REGION_LINE[region] +
      '</div>' +
      '<div style="display:flex;gap:10px;flex:none;">' +
        '<button id="rb-consent-no" type="button" style="padding:10px 18px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;letter-spacing:0.02em;' + t.decline + '">Essential only</button>' +
        '<button id="rb-consent-yes" type="button" style="padding:10px 22px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:0.02em;' + t.accept + '">Accept</button>' +
      '</div>';
    document.body.appendChild(bar);
    if (!reduce) requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.transform = 'translateY(0)'; }); });

    function choose(v) {
      try { localStorage.setItem(KEY, JSON.stringify({ v: v, region: region, t: new Date().toISOString() })); } catch (e) {}
      bar.style.transform = 'translateY(100%)';
      setTimeout(function () { bar.remove(); }, reduce ? 0 : 500);
    }
    document.getElementById('rb-consent-yes').addEventListener('click', function () { choose('accepted'); });
    document.getElementById('rb-consent-no').addEventListener('click', function () { choose('essential'); });
  }
  boot();
})();
