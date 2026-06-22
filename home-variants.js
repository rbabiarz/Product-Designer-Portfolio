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
    { id: 'interactive', label: 'Interactive', file: 'Homepage Interactive.dc.html', tagline: 'The primary portfolio site' },
    { id: 'dossier',     label: 'Dossier',     file: 'Homepage Dossier.dc.html',     tagline: 'Classified case-file layout' },
    { id: 'retro',       label: 'Retro',       file: 'Homepage Retro.dc.html',       tagline: 'CRT terminal / RB-OS' }
    // → add future homepage designs here
  ];

  window.HOME_VARIANTS = VARIANTS;

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
    if (cur && target && cur.id !== target.id) { location.replace(target.file); }
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
