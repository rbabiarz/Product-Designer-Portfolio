/* case-back.js — case-study "back" links remember where the visitor came from.
   The three homepage variants and work.dc.html each write a small return
   descriptor to sessionStorage on load (work.dc.html keeps it live as its
   mode/focused card change too); case-study pages only read it, here, to
   point every [data-nav="back"] link at that origin.

   Case-study pages never write the descriptor, so it stays correct across
   the quick-tour/deep-dive toggle and the case-study switcher — any number
   of lateral hops between case studies still resolves back to the last hub
   actually visited. No stored origin (a fresh tab, a direct link, a search
   hit) falls back to the interactive homepage, the prior hardcoded default.

   The .dc.html deep dives render their nav/footer through the dc template
   runtime, which injects that markup after this deferred script's own
   DOMContentLoaded fires — a plain one-shot apply can run before the links
   exist. A MutationObserver re-applies on every DOM change instead, so a
   late (or later re-rendered) link still gets corrected. */
(function () {
  'use strict';
  var KEY = 'rb-nav-origin';
  var DEFAULT_HREF = 'homepage-interactive.dc.html';

  function targetHref() {
    var href = DEFAULT_HREF;
    try {
      var v = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (v && typeof v.href === 'string' && v.href) href = v.href;
    } catch (e) {}
    return href;
  }

  function apply() {
    var href = targetHref();
    document.querySelectorAll('[data-nav="back"]').forEach(function (a) {
      if (a.getAttribute('href') !== href) a.setAttribute('href', href);
    });
  }

  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);

  // childList/subtree only — never watches attributes, so this observer
  // can't be retriggered by its own setAttribute calls above.
  if ('MutationObserver' in window) {
    var mo = new MutationObserver(apply);
    var start = function () { mo.observe(document.body, { childList: true, subtree: true }); };
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
  }
})();
