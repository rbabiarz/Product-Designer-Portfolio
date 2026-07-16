/* rb-cursor — custom cursor for the homepage variants.
   States: default (accent dot + trailing ring), active (over any interactive
   element, incl. the long-dormant [data-cursor] hooks), plate (over the
   Light Architect photometric map — the cursor turns white), and move (over
   a luminaire — stays white and shows directional arrows).
   Pointer-fine devices only; the trailing lag is dropped under
   prefers-reduced-motion; the native cursor is restored on touch/kbd. */
(function () {
  'use strict';
  if (window.__rbCursor) return; window.__rbCursor = 1;

  var fine = window.matchMedia && matchMedia('(pointer: fine)').matches && !matchMedia('(hover: none)').matches;
  if (!fine) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // accent: page token if present, else the body's phosphor/ink colour
  var accent = (getComputedStyle(document.documentElement).getPropertyValue('--ac') || '').trim();
  function boot() {
    if (!document.body) return setTimeout(boot, 40);
    if (!accent) {
      // case-study pages keep their accent on the .cs wrapper, not :root
      var cs = document.querySelector('.cs');
      if (cs) accent = (getComputedStyle(cs).getPropertyValue('--c-accent') || '').trim();
    }
    if (!accent) {
      // still nothing: take the first non-black text colour down the wrapper chain
      var probe = [document.body, document.body.firstElementChild, document.querySelector('[style*="color:#6cf0a4"], .c-ho > div')];
      for (var pi = 0; pi < probe.length; pi++) {
        if (!probe[pi]) continue;
        var c = getComputedStyle(probe[pi]).color;
        if (c && c !== 'rgb(0, 0, 0)') { accent = c; break; }
      }
      if (!accent) accent = '#4ca88f';
    }

    var css = document.createElement('style');
    css.textContent =
      'html.rb-cursor-on, html.rb-cursor-on *{cursor:none !important}' +
      '#rb-cur-dot{position:fixed;left:0;top:0;width:7px;height:7px;border-radius:50%;background:' + accent + ';z-index:2147483000;pointer-events:none;transform:translate(-50%,-50%);transition:width .15s ease,height .15s ease,opacity .2s ease}' +
      '#rb-cur-ring{position:fixed;left:0;top:0;width:30px;height:30px;border:1.5px solid ' + accent + ';opacity:.55;border-radius:50%;z-index:2147482999;pointer-events:none;transform:translate(-50%,-50%);transition:width .18s ease,height .18s ease,opacity .2s ease,background .18s ease}' +
      '#rb-cur-ring .rb-cur-a{position:absolute;font-family:"JetBrains Mono",monospace;font-size:9px;line-height:1;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.55);opacity:0;transition:opacity .15s ease;user-select:none}' +
      '#rb-cur-ring .rb-a-l{left:3px;top:50%;transform:translateY(-50%)}' +
      '#rb-cur-ring .rb-a-r{right:3px;top:50%;transform:translateY(-50%)}' +
      '#rb-cur-ring .rb-a-t{top:1px;left:50%;transform:translateX(-50%)}' +
      '#rb-cur-ring .rb-a-b{bottom:1px;left:50%;transform:translateX(-50%)}' +
      'html.rb-cur-active #rb-cur-dot{width:4px;height:4px}' +
      'html.rb-cur-active #rb-cur-ring{width:42px;height:42px;opacity:.9;background:color-mix(in srgb,' + accent + ' 12%, transparent)}' +
      'html.rb-cur-plate #rb-cur-dot{background:#fff;box-shadow:0 0 5px rgba(0,0,0,0.45)}' +
      'html.rb-cur-plate #rb-cur-ring{border-color:#fff;opacity:.85;background:transparent;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4))}' +
      'html.rb-cur-move #rb-cur-dot{width:4px;height:4px;background:#fff;box-shadow:0 0 5px rgba(0,0,0,0.45)}' +
      'html.rb-cur-move #rb-cur-ring{width:46px;height:46px;opacity:1;border-color:#fff;background:transparent;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4))}' +
      'html.rb-cur-move #rb-cur-ring .rb-cur-a{opacity:.95}' +
      'html.rb-cur-hidden #rb-cur-dot, html.rb-cur-hidden #rb-cur-ring{opacity:0}';
    document.head.appendChild(css);

    var dot = document.createElement('div'); dot.id = 'rb-cur-dot'; dot.setAttribute('aria-hidden', 'true');
    var ring = document.createElement('div'); ring.id = 'rb-cur-ring'; ring.setAttribute('aria-hidden', 'true');
    ring.innerHTML = '<span class="rb-cur-a rb-a-l">‹</span><span class="rb-cur-a rb-a-r">›</span><span class="rb-cur-a rb-a-t">˄</span><span class="rb-cur-a rb-a-b">˅</span>';
    document.body.appendChild(dot); document.body.appendChild(ring);

    var root = document.documentElement;
    root.classList.add('rb-cursor-on', 'rb-cur-hidden');

    var mx = -100, my = -100, rx = -100, ry = -100, raf = null, shown = false;
    var ACTIVE_SEL = 'a,button,[role="button"],summary,select,input,label,[data-cursor],.la-tb';

    function probe(x, y) {
      // over the photometric plate the cursor turns white; near a luminaire
      // it stays white and gains the directional move arrows
      var plate = document.getElementById('la-plate');
      if (!plate) return { plate: false, move: false };
      var pr = plate.getBoundingClientRect();
      if (x < pr.left || x > pr.right || y < pr.top || y > pr.bottom) return { plate: false, move: false };
      var fx = document.querySelectorAll('.la-fx');
      for (var i = 0; i < fx.length; i++) {
        var r = fx[i].getBoundingClientRect();
        if (x >= r.left - 12 && x <= r.right + 12 && y >= r.top - 12 && y <= r.bottom + 12) return { plate: true, move: true };
      }
      return { plate: true, move: false };
    }

    function setState(t, x, y) {
      var p = probe(x, y);
      var active = !p.move && !p.plate && t && t.closest && !!t.closest(ACTIVE_SEL);
      root.classList.toggle('rb-cur-plate', p.plate && !p.move);
      root.classList.toggle('rb-cur-move', p.move);
      root.classList.toggle('rb-cur-active', active);
    }

    function frame() {
      raf = null;
      rx += (mx - rx) * (reduce ? 1 : 0.22);
      ry += (my - ry) * (reduce ? 1 : 0.22);
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px) translate(-50%,-50%)';
      if (Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) raf = requestAnimationFrame(frame); // idle-stop when converged
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (!shown) { shown = true; rx = mx; ry = my; root.classList.remove('rb-cur-hidden'); }
      setState(e.target, mx, my);
      kick();
    }, { passive: true });
    document.addEventListener('mouseleave', function () { shown = false; root.classList.add('rb-cur-hidden'); });
    // keyboard users keep the invisible-native-cursor from mattering: hide ours on tab
    document.addEventListener('keydown', function (e) { if (e.key === 'Tab') root.classList.add('rb-cur-hidden'); });
  }
  boot();
})();
