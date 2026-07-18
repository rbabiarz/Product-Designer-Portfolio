/* arctic-landscape-fix.js — Arctic Shield's menu/interstitial/end overlays only
   get top-align + scroll on narrow-WIDTH phones (a max-width media query in the
   bundled template). On phone LANDSCAPE the width is usually well over that
   breakpoint while the height is short, so the overlay's bottom controls
   (including Retry and Menu) render below the fold with nothing to scroll them
   into view. Adding the same fix as a height-based query directly inside the
   template's own <style> block corrupts the bundler's runtime templating (a
   pre-existing fragility unrelated to this fix), so it ships as this separate,
   brace-light external file instead, referenced by a plain <script src>. */
(function () {
  'use strict';
  var css = '@media (max-height:520px){' +
    '.as-menu-wrap,.as-inter-wrap,.as-end-wrap{align-items:flex-start !important;' +
    'overflow-y:auto;-webkit-overflow-scrolling:touch;padding:10px 14px;box-sizing:border-box}' +
    '.as-menu,.as-inter,.as-end{margin:auto 0}' +
    '}';
  var s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
})();
