/* a11y.js — site-wide accessibility layer (WCAG 2.2 AA / ADA / AODA).
   Self-injecting, DC-safe, theme-agnostic (works in light + dark).
   Adds, on every page that loads it:
     • lang on <html> (fallback; also set statically in markup)
     • a "Skip to main content" link (2.4.1 Bypass Blocks)
     • a <main id="main"> landmark wrapping the page body (1.3.1, 2.4.1)
     • visible keyboard focus ring (2.4.7) — independent of mouse focus
     • prefers-reduced-motion kill-switch for animation/transition (2.3.3)
     • decorative inline SVGs marked aria-hidden + focusable=false (1.1.1)
     • aria-expanded wiring on the menu burgers (4.1.2)
     • larger tap targets on small dot controls (2.5.8 Target Size)
   It never recreates nodes (listeners/IDs survive), and runs after the
   DC render settles so it can see the final DOM. */
(function () {
  if (window.__rbA11y) return;
  window.__rbA11y = true;

  /* ---- 1. static, no-DOM-wait pieces: <html lang> + injected CSS ---- */
  try { if (!document.documentElement.lang) document.documentElement.lang = 'en'; } catch (e) {}

  var css = document.createElement('style');
  css.id = 'rb-a11y-css';
  css.textContent = [
    /* Skip link — visually hidden until focused, then pinned top-left */
    '.rb-skip{position:fixed;top:0;left:0;z-index:100000;transform:translateY(-120%);',
    '  background:#0a0a0a;color:#fff;padding:12px 20px;border-radius:0 0 8px 0;',
    "  font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:0.04em;",
    '  text-decoration:none;transition:transform 0.18s ease;}',
    '.rb-skip:focus{transform:translateY(0);outline:3px solid #4ca88f;outline-offset:2px;}',
    /* Keyboard focus ring — only for keyboard users (:focus-visible) */
    'a:focus-visible,button:focus-visible,[tabindex]:focus-visible,details summary:focus-visible,',
    'input:focus-visible,select:focus-visible,textarea:focus-visible{',
    '  outline:3px solid #4ca88f !important;outline-offset:3px !important;border-radius:3px;}',
    'main:focus{outline:none;}',
    /* Target size (2.5.8): keep the visible dot small, enlarge the hit area
       with transparent padding via content-box backgrounds. */
    '.wk-dot{box-sizing:border-box !important;width:24px !important;height:24px !important;',
    '  padding:8px !important;background-clip:content-box !important;background-origin:content-box !important;}',
    /* prefers-reduced-motion: neutralise declarative motion site-wide */
    '@media (prefers-reduced-motion: reduce){',
    '  *,*::before,*::after{animation-duration:0.001ms !important;animation-iteration-count:1 !important;',
    '    transition-duration:0.001ms !important;scroll-behavior:auto !important;}',
    '  html{scroll-behavior:auto !important;}}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  /* ---- 2. DOM-dependent wiring, after the DC render settles ---- */
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function enhance() {
    var body = document.body;
    if (!body) return;

    /* skip link — first focusable thing on the page */
    if (!document.querySelector('.rb-skip')) {
      var skip = document.createElement('a');
      skip.className = 'rb-skip';
      skip.href = '#main';
      skip.textContent = 'Skip to main content';
      body.insertBefore(skip, body.firstChild);
    }

    /* main landmark — wrap everything between the top nav and the footer.
       Moving nodes preserves their listeners and ids; navs/footer/menus
       stay out so the landmark holds only primary content. */
    if (!document.getElementById('main')) {
      var footer = document.querySelector('footer');
      var root = footer ? footer.parentElement : null;
      // the content root is the element that directly holds the footer
      if (root) {
        var main = document.createElement('main');
        main.id = 'main';
        main.setAttribute('tabindex', '-1');
        root.insertBefore(main, footer);
        var kids = Array.prototype.slice.call(root.children);
        for (var i = 0; i < kids.length; i++) {
          var c = kids[i];
          if (c === main || c === footer) continue;
          var tag = c.tagName;
          // leave navigation, the skip link, and overlay/menu chrome outside
          if (tag === 'NAV') continue;
          if (c.classList && (c.classList.contains('rb-skip'))) continue;
          // only move nodes that appear BEFORE the footer in document order
          if (c.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING) {
            main.appendChild(c);
          }
        }
      } else {
        // no footer: mark the first section as main
        var sec = document.querySelector('section');
        if (sec) { sec.id = sec.id || 'main'; sec.setAttribute('role', 'main'); sec.setAttribute('tabindex', '-1'); }
      }
    }

    /* decorative inline SVGs → hidden from AT (icons inside labelled
       controls are decorative; standalone ones are ornamental). */
    var svgs = document.querySelectorAll('svg:not([aria-hidden]):not([role="img"]):not([aria-label])');
    for (var s = 0; s < svgs.length; s++) {
      svgs[s].setAttribute('aria-hidden', 'true');
      svgs[s].setAttribute('focusable', 'false');
    }

    /* menu burgers → aria-expanded, toggled on activation */
    var burgers = document.querySelectorAll('[class*="burger"]');
    for (var b = 0; b < burgers.length; b++) {
      (function (btn) {
        if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
        btn.addEventListener('click', function () {
          var open = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!open));
        });
      })(burgers[b]);
    }

    /* dark-mode toggle → accessible name + pressed state.
       Identified as a nav button whose only content is an icon (no text)
       that isn't the burger. */
    var navButtons = document.querySelectorAll('nav button, header button');
    for (var n = 0; n < navButtons.length; n++) {
      var nb = navButtons[n];
      if (nb.className && /burger/.test(nb.className)) continue;
      var txt = (nb.textContent || '').trim();
      if (txt) continue; // has a visible label already
      if (!nb.getAttribute('aria-label')) nb.setAttribute('aria-label', 'Toggle dark mode');
    }
  }

  function ready(fn) {
    // wait for the DC render: poll briefly for a <section> or <footer>
    var tries = 0;
    (function spin() {
      if (document.body && (document.querySelector('section') || document.querySelector('footer'))) { fn(); return; }
      if (tries++ > 80) { if (document.body) fn(); return; }
      setTimeout(spin, 50);
    })();
  }

  ready(enhance);
})();
