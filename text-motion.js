/* text-motion.js — site-wide animated-text parallax engine.
   React/DC-safe: only drives transform + opacity on existing elements every
   frame (never injects children), so DC re-renders cannot wipe the effect.
   Effects: scroll-reveal rise, position drift parallax, scroll-velocity skew,
   opposite-direction marquee reaction. Honors prefers-reduced-motion.

   Perf: the rAF loop is NOT free-running. It idles (stops re-arming) once scroll
   velocity and every heading have settled, and is re-armed by a passive scroll/
   resize listener or when new headings register. It also pauses while the tab is
   hidden. Reads (getBoundingClientRect) are batched before writes (transform/
   opacity) to avoid per-frame layout thrash. */
(function () {
  if (window.__TM_ON) return;
  window.__TM_ON = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // leave everything static (a11y.js also neutralises CSS motion)

  var heads = [];      // { el, prog, target, revealed }
  var marquees = [];   // parent elements of [style*=marquee] tracks
  var seen = new WeakSet();

  var lastY = window.pageYOffset || 0;
  var vel = 0;
  var running = false;
  var rafId = 0;

  function eligible(h) {
    if (seen.has(h)) return false;
    // skip the hero headline (authored line-mask) and any explicitly-animated nodes
    if (h.querySelector && h.querySelector('.line-mask')) return false;
    if (h.closest && h.closest('.line-mask')) return false;
    if (h.hasAttribute('data-hero-anim') || h.hasAttribute('data-tm-skip')) return false;
    var d = '';
    try { d = getComputedStyle(h).display; } catch (e) {}
    if (d === 'flex' || d === 'grid' || d === 'none' || d === 'contents') return false;
    return true;
  }

  function register() {
    var added = 0;
    var list = document.querySelectorAll('h1, h2, h3, [data-tm]');
    for (var i = 0; i < list.length; i++) {
      var h = list[i];
      if (!eligible(h)) { continue; }
      seen.add(h);
      var vh = window.innerHeight || 800;
      var top = h.getBoundingClientRect().top;
      var startRevealed = top < vh * 0.85; // already in view -> no entrance, just drift
      heads.push({ el: h, prog: startRevealed ? 1 : 0, target: startRevealed ? 1 : 0, revealed: startRevealed });
      h.style.willChange = 'transform, opacity';
      h.style.backfaceVisibility = 'hidden';
      added++;
    }
    var mq = document.querySelectorAll('[style*="marquee"]');
    for (var j = 0; j < mq.length; j++) {
      var p = mq[j].parentElement;
      if (p && !seen.has(p)) { seen.add(p); p.style.willChange = 'transform'; p.style.transition = 'transform 0.5s cubic-bezier(.2,.8,.2,1)'; marquees.push(p); added++; }
    }
    if (added) kick();
  }

  // true when nothing is moving: velocity decayed and every heading at its target
  function settled() {
    if (Math.abs(vel) > 0.02) return false;
    for (var i = 0; i < heads.length; i++) {
      if (Math.abs(heads[i].target - heads[i].prog) > 0.001) return false;
    }
    return true;
  }

  function loop() {
    // ---- READ PASS (batch all layout reads before any writes) ----
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var dv = y - lastY; lastY = y;
    vel += (dv - vel) * 0.16;
    var sk = Math.max(-2.4, Math.min(2.4, vel * 0.05));   // velocity skew
    var vh = window.innerHeight || 800;
    var rects = [];
    for (var i = 0; i < heads.length; i++) {
      try { rects[i] = heads[i].el.getBoundingClientRect(); } catch (e) { rects[i] = null; }
    }

    // ---- WRITE PASS ----
    for (var k = 0; k < heads.length; k++) {
      var r = heads[k];
      var rect = rects[k];
      if (!rect) continue;
      var onScreen = rect.bottom > -120 && rect.top < vh + 120;
      if (!r.revealed && rect.top < vh * 0.86) r.revealed = true;
      r.target = r.revealed ? 1 : 0;
      r.prog += (r.target - r.prog) * 0.12;
      if (!onScreen && r.prog > 0.999) {
        // off-screen & fully revealed: skip transform churn but keep it placed
        r.el.style.opacity = '1';
        continue;
      }
      var c = rect.top + rect.height / 2;
      var p = (c - vh / 2) / vh;                 // -0.5 (top) .. +0.5 (bottom)
      var drift = Math.max(-22, Math.min(22, p * 22));
      var rise = (1 - r.prog) * 38;
      r.el.style.transform = 'translateY(' + (rise + drift).toFixed(1) + 'px) skewY(' + sk.toFixed(2) + 'deg)';
      r.el.style.opacity = (r.prog).toFixed(3);
    }

    var mx = Math.max(-48, Math.min(48, -vel * 1.5));
    for (var m = 0; m < marquees.length; m++) {
      marquees[m].style.transform = 'translateX(' + mx.toFixed(1) + 'px)';
    }

    // ---- idle-stop: don't re-arm if the tab is hidden or nothing is moving ----
    if (document.hidden || settled()) { running = false; rafId = 0; return; }
    rafId = requestAnimationFrame(loop);
  }

  function kick() {
    if (running || document.hidden) return;
    running = true;
    lastY = window.pageYOffset || document.documentElement.scrollTop || 0; // resync to avoid vel spike
    rafId = requestAnimationFrame(loop);
  }

  function boot() {
    register();
    kick();
    // fail-safe: never let a heading near/inside the viewport stay hidden
    setTimeout(function () {
      var vh = window.innerHeight || 800;
      for (var i = 0; i < heads.length; i++) {
        try { if (heads[i].el.getBoundingClientRect().top < vh * 1.25) heads[i].revealed = true; } catch (e) {}
      }
      kick();
    }, 2600);
  }

  // re-arm the (idle-stopping) loop on the events that change layout/scroll
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick, { passive: true });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });

  // Initial passes (fonts + late DC render) and a debounced observer for new nodes.
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { setTimeout(boot, 40); }); }
  window.addEventListener('load', function () { setTimeout(boot, 80); });
  document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 360); });
  setTimeout(boot, 700);
  var mo = new MutationObserver(function () {
    clearTimeout(window.__TM_T);
    window.__TM_T = setTimeout(function () { register(); }, 240);
  });
  // scope to <body> (not documentElement) so <head> style/script injections don't trigger re-scans
  try { mo.observe(document.body || document.documentElement, { childList: true, subtree: true }); } catch (e) {}
})();
