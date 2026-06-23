/* home-variants.js — SINGLE SOURCE OF TRUTH for the homepage design variants.
   The homepage will have several interchangeable designs; every other page
   (case studies, about) stays fixed. To add a new homepage design later:
     1. create the new `Homepage <Name>.dc.html`
     2. add ONE entry to the VARIANTS array below
   It will then appear automatically in the "VIEW" switcher on every homepage.

   Each homepage reads window.HOME_VARIANTS in its renderVals() and renders the
   switcher from it, so no per-page list maintenance is needed. */
(function () {
  var VARIANTS = [
    { id: 'interactive', label: 'Interactive', file: 'homepage-interactive.dc.html', tagline: 'The primary portfolio site' },
    { id: 'dossier',     label: 'Dossier',     file: 'homepage-dossier.dc.html',     tagline: 'Classified case-file layout' },
    { id: 'retro',       label: 'Retro',       file: 'homepage-retro.dc.html',       tagline: 'CRT terminal / RB-OS' }
    // → add future homepage designs here
  ];

  window.HOME_VARIANTS = VARIANTS;

  // shared contact anchor — every homepage variant uses id="contact"
  window.homeContactHref = function () {
    var id = window.homeVariantCurrent ? window.homeVariantCurrent() : VARIANTS[0].id;
    var v = VARIANTS[0];
    for (var i = 0; i < VARIANTS.length; i++) { if (VARIANTS[i].id === id) { v = VARIANTS[i]; break; } }
    return v.file + '#contact';
  };

  function homeScrollToHash() {
    var id = (location.hash || '').replace(/^#/, '');
    if (!id) return;
    var tries = 0;
    function attempt() {
      var el = document.getElementById(id);
      if (!el) {
        if (++tries < 48) return setTimeout(attempt, 50);
        return;
      }
      var nav = document.querySelector('.rt-bar, #int-nav, #dsr-nav, nav[id]');
      var offset = (nav ? nav.getBoundingClientRect().height : 72) + 12;
      var y = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    attempt();
  }
  window.homeScrollToHash = homeScrollToHash;

  // best-effort current-variant detection from the URL (pages also hardcode
  // their own id, which is the reliable source for active-state styling)
  window.homeVariantCurrent = function () {
    var f = '';
    try { f = decodeURIComponent(location.pathname).split('/').pop(); }
    catch (e) { f = (location.pathname || '').split('/').pop(); }
    for (var i = 0; i < VARIANTS.length; i++) { if (VARIANTS[i].file === f) return VARIANTS[i].id; }
    return VARIANTS[0].id;
  };

  // remember the chosen view: if we land on a KNOWN homepage file that isn't
  // the one the user last selected, route to the saved variant. Strict
  // filename match means non-homepage / preview URLs never trigger a redirect
  // (fail-safe, no loops). location.replace keeps history clean.
  (function () {
    var pref; try { pref = localStorage.getItem('rb-home-variant'); } catch (e) { return; }
    if (!pref) return;
    var f = '';
    try { f = decodeURIComponent(location.pathname).split('/').pop(); } catch (e) { f = (location.pathname || '').split('/').pop(); }
    f = (f || '').split('?')[0].split('#')[0];
    var cur = null, target = null;
    for (var i = 0; i < VARIANTS.length; i++) {
      if (VARIANTS[i].file === f) cur = VARIANTS[i];
      if (VARIANTS[i].id === pref) target = VARIANTS[i];
    }
    if (cur && target && cur.id !== target.id) {
      location.replace(target.file + (location.hash || ''));
      return;
    }
    // already on the saved homepage — honor #contact (etc.) after DC renders
    if (cur && location.hash) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(homeScrollToHash, 120); });
      } else {
        setTimeout(homeScrollToHash, 120);
      }
    }
  })();

  // persist the chosen design before navigation (capture phase so it runs
  // regardless of the page-transition click handler)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[data-home-variant]') : null;
    if (!a) return;
    try { localStorage.setItem('rb-home-variant', a.getAttribute('data-home-variant')); } catch (_) {}
  }, true);

  // let any already-mounted homepage know the registry is ready
  try { window.dispatchEvent(new Event('home-variants-ready')); } catch (e) {}
})();
