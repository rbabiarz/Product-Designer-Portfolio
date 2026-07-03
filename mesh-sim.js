/* mesh-sim.js — interactive recreation of the P1 "Create Device Mesh" screen
   from the Smart Lighting case study (the drag-to-repeater node map that was
   prototyped and dropped in favor of Auto Select).

   Usage: give any element `data-mesh-sim`; this module builds the screen
   inside it. Used by smart-lighting.dc.html and smart-lighting-showcase.html
   in place of the static mesh-nodemap.jpg.

   The sim: devices connect to the gateway (or the nearest repeater). Signal
   falls off with distance; devices below the reliability floor flag coral
   with a "!" badge. Drag a bulb onto the gateway box to promote it to a
   repeater — nearby devices strengthen, far areas stay weak. TEST sweeps the
   mesh, reveals marginal devices the quick view missed, and says where to
   work next. AUTO SELECT does what the shipped P4 does: picks repeaters
   itself. Keyboard path: focus the map, arrows choose a device, Enter
   promotes, T tests, R resets.

   When a sibling `.sl-swap.sl-on` image covers the sim (the P2–P4 screens),
   the sim disables its pointer/keyboard surface. */
(function () {
  'use strict';

  // device positions in map units (x 0–100, y 0–135) + real fixture names
  var NODES = [
    [18, 10, 'Porch lantern'], [33, 6, 'Entry pendant'], [50, 8, 'Hall ceiling'], [68, 6, 'Hall sconce'], [85, 11, 'Garage strip'],
    [10, 27, 'Living floor lamp'], [26, 23, 'Living ceiling 1'], [42, 21, 'Living ceiling 2'], [58, 22, 'Dining pendant'], [74, 22, 'Dining sconce'], [91, 26, 'Patio string'],
    [7, 47, 'Reading lamp'], [22, 43, 'TV accent'], [36, 38, 'Sofa lamp'], [64, 39, 'Island pendant 1'], [79, 43, 'Island pendant 2'], [93, 48, 'Pantry strip'],
    [8, 68, 'Desk lamp'], [21, 80, 'Stair tread'], [79, 66, 'Counter strip'], [92, 70, 'Cooker hood'],
    [12, 90, 'Bed lamp left'], [28, 87, 'Bed lamp right'], [44, 91, 'Bedroom ceiling'], [60, 88, 'Closet strip'], [76, 87, 'Bath vanity'], [90, 90, 'Shower light'],
    [22, 110, 'Guest lamp'], [38, 107, 'Guest ceiling'], [54, 110, 'Laundry strip'], [70, 107, 'Utility light'], [85, 110, 'Backdoor sconce'],
    [48, 128, 'Basement stair']
  ];
  var GW = [50, 62];            // gateway position, map units
  var R_GW = 68, R_REP = 52;    // signal radii
  var WEAK = 0.42, CRIT = 0.30; // reliability floors
  var REPS0 = [13, 24];         // factory repeaters: Sofa lamp, Closet strip
  var MAP_H = 135;              // map units of height (width is 100)
  var Y_PAD = 5;                // breathing room above/below the node field, map units
  var Y_SPAN = MAP_H + Y_PAD * 2;
  function topPct(y) { return (y + Y_PAD) / Y_SPAN * 100; }
  // .dc pages re-render their DOM on state changes, which wipes the built sim;
  // MEM carries the sim state across rebuilds so progress survives re-renders
  var MEM = {};
  var coverObs = null;

  var CSS =
    // z-index:0 forces a stacking context so the sim's layered internals (nodes,
    // badges, toast) can never paint above the P2–P4 screenshots stacked after it
    '[data-mesh-sim]{position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;container-type:inline-size;font-size:14px;line-height:1.35;text-align:left}' +
    // --m-paper sampled from the app screenshots' background (#e2e1df)
    '.msim{--m-navy:#23263b;--m-berry:#b52f63;--m-ink:#16161a;--m-paper:#e2e1df;--m-line:#c9c5bd;--m-mut:#6e6a60;--m-coral:#d9534a;--m-ok:#2e7d4f;' +
      'position:absolute;inset:0;display:flex;flex-direction:column;background:var(--m-paper);font-family:"DM Sans","Inter",-apple-system,sans-serif;color:var(--m-ink);-webkit-user-select:none;user-select:none}' +
    // covered by a swap screenshot: inert AND invisible (belt & braces for browsers
    // where the container doesn't isolate stacking); hide only after the swap fade
    '.msim-covered{pointer-events:none;visibility:hidden;transition:visibility 0s linear .28s}' +
    '.msim *{box-sizing:border-box}' +
    '.msim button{font-family:inherit;cursor:pointer}' +
    '.msim :focus-visible{outline:2px solid var(--m-berry);outline-offset:-2px}' +
    /* chrome */
    '.msim-top{flex:none;display:flex;align-items:center;justify-content:space-between;background:var(--m-navy);color:#fff;font-weight:700;letter-spacing:.06em;padding:4.2cqi 4.6cqi;font-size:clamp(9px,4.6cqi,14px)}' +
    '.msim-x{color:#fff;opacity:.9;font-weight:400;font-size:clamp(12px,6cqi,19px);line-height:.6}' +
    '.msim-room{flex:none;display:flex;align-items:center;gap:3cqi;background:var(--m-berry);color:#fff;padding:2.6cqi 4.6cqi;font-size:clamp(10px,5cqi,15px);font-weight:700}' +
    '.msim-roomname{flex:1}' +
    '.msim-test{position:relative;background:#fff;color:var(--m-ink);border:none;border-radius:1.6cqi;font-weight:800;letter-spacing:.08em;font-size:clamp(9px,4.4cqi,13px);padding:2.2cqi 4.4cqi;min-height:24px}' +
    '.msim-bang{position:absolute;top:-1.4cqi;right:-1.8cqi;width:4.8cqi;height:4.8cqi;min-width:12px;min-height:12px;border-radius:50%;background:var(--m-coral);color:#fff;border:1.5px solid #fff;font-size:clamp(8px,3.4cqi,10px);font-weight:800;display:flex;align-items:center;justify-content:center;line-height:1}' +
    /* legend */
    '.msim-legend{flex:none;position:relative;padding:2.6cqi 4.6cqi 2.2cqi;border-bottom:1px solid var(--m-line);display:flex;flex-direction:column;gap:1.4cqi;font-size:clamp(9px,4.1cqi,12.5px);color:var(--m-ink)}' +
    '.msim-legend>div{display:flex;align-items:center;gap:2.4cqi}' +
    '.msim-key{flex:none;width:4.6cqi;height:4.6cqi;min-width:11px;min-height:11px;border-radius:50%;border:2.6px solid var(--m-ink);background:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:clamp(7px,3cqi,9px);font-weight:800}' +
    '.msim-key--r{background:var(--m-ink)}' +
    '.msim-key--l{background:var(--m-coral);border-color:var(--m-coral);color:#fff}' +
    '.msim-lowrow.is-warn{color:var(--m-coral);font-weight:700}' +
    '.msim-info{position:absolute;right:4cqi;top:2.6cqi;width:6.4cqi;height:6.4cqi;min-width:18px;min-height:18px;border-radius:50%;border:1.5px solid var(--m-ink);background:none;color:var(--m-ink);font-weight:700;font-size:clamp(9px,3.6cqi,12px);display:flex;align-items:center;justify-content:center;font-style:italic;font-family:Georgia,serif}' +
    /* map */
    '.msim-map{flex:1;position:relative;min-height:0;touch-action:none;cursor:default;overflow:hidden}' +
    '.msim-links{position:absolute;inset:0;width:100%;height:100%}' +
    '.msim-links line{stroke:var(--m-line);stroke-width:2.5}' +
    '.msim-links line.is-low{stroke:var(--m-coral);stroke-dasharray:3 3}' +
    '.msim-node{position:absolute;width:8.6cqi;height:8.6cqi;min-width:20px;min-height:20px;border-radius:50%;background:#fff;border:3px solid var(--m-ink);display:flex;align-items:center;justify-content:center;color:var(--m-ink);transform:translate(-50%,-50%);cursor:grab;z-index:2}' +
    '.msim-node.is-rep{background:var(--m-ink);color:#fff;cursor:default}' +
    '.msim-node.is-low{background:var(--m-coral);border-color:var(--m-coral);color:#fff}' +
    '.msim-node .msim-bang{top:-2cqi;right:-2.2cqi}' +
    '.msim-node.is-sel{box-shadow:0 0 0 2.5px var(--m-berry)}' +
    '.msim-node.is-drag{cursor:grabbing;z-index:6;box-shadow:0 6px 16px rgba(20,20,30,.35);scale:1.15}' +
    '.msim-bulb{position:relative;width:38%;height:38%;border-radius:50%;background:currentColor}' +
    '.msim-bulb::after{content:"";position:absolute;left:50%;transform:translateX(-50%);bottom:-30%;width:55%;height:22%;border-radius:1px;background:currentColor}' +
    '.msim-ghost{position:absolute;width:8.6cqi;height:8.6cqi;min-width:20px;min-height:20px;border-radius:50%;border:1.6px dashed var(--m-mut);transform:translate(-50%,-50%);z-index:1}' +
    '.msim-gw{position:absolute;left:50%;top:46.2%;transform:translate(-50%,-50%);width:32cqi;min-width:78px;background:#fff;border:2px solid var(--m-ink);border-radius:1.4cqi;padding:2.2cqi 2cqi;text-align:center;z-index:3;font-weight:800;letter-spacing:.05em;font-size:clamp(9px,4cqi,12px)}' +
    '.msim-gw small{display:block;font-weight:500;color:var(--m-mut);font-size:clamp(8px,3.4cqi,10.5px);line-height:1.35;margin-top:.8cqi;letter-spacing:0}' +
    '.msim-gw.is-target{border-color:var(--m-berry);color:var(--m-berry);box-shadow:0 0 0 3px rgba(181,47,99,.22)}' +
    '.msim-gw.is-target small{color:var(--m-berry)}' +
    '.msim-pulse{position:absolute;left:50%;top:46.2%;width:10px;height:10px;border-radius:50%;border:2px solid var(--m-berry);transform:translate(-50%,-50%) scale(0);opacity:0;pointer-events:none;z-index:4}' +
    '@keyframes msim-sweep{0%{transform:translate(-50%,-50%) scale(0);opacity:.9}100%{transform:translate(-50%,-50%) scale(40);opacity:0}}' +
    '.msim-pulse.is-on{animation:msim-sweep .7s ease-out both}' +
    /* toast + bottom bar */
    // in-flow strip between map and bottom bar — FIXED height (3 lines) so a
    // longer message never resizes the map and shifts the nodes mid-interaction
    '.msim-toast{flex:none;display:flex;align-items:center;height:max(50px,22cqi);overflow:hidden;margin:2cqi 3.4cqi 2.4cqi;background:rgba(35,38,59,.94);color:#fff;border-radius:2cqi;padding:2.4cqi 3.4cqi;font-size:clamp(9px,3.9cqi,12px);line-height:1.45}' +
    '.msim-toast.is-ok{background:rgba(46,125,79,.95)}' +
    '.msim-bottom{flex:none;display:flex;gap:3cqi;justify-content:space-between;background:var(--m-navy);padding:3cqi 4.6cqi 3.4cqi}' +
    '.msim-btn{flex:1;background:#fff;color:var(--m-ink);border:none;border-radius:1.6cqi;font-weight:800;letter-spacing:.07em;font-size:clamp(9px,4.2cqi,12.5px);padding:2.8cqi 2cqi;min-height:28px}' +
    /* help overlay */
    '.msim-help{position:absolute;inset:0;z-index:7;background:rgba(255,255,255,.96);padding:6cqi 6cqi;font-size:clamp(10px,4.3cqi,13px);line-height:1.6;color:var(--m-ink)}' +
    '.msim-help-close{position:absolute;top:4cqi;right:4cqi;width:7cqi;height:7cqi;min-width:22px;min-height:22px;border-radius:50%;border:1.5px solid var(--m-ink);background:none;color:var(--m-ink);font-size:clamp(14px,5cqi,18px);font-weight:400;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}' +
    '.msim-help b{display:block;margin-bottom:2cqi;font-size:clamp(11px,4.8cqi,15px)}' +
    '.msim-help ul{margin:0 0 3cqi;padding-left:5cqi}' +
    '.msim-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '@media (prefers-reduced-motion:no-preference){.msim-node{transition:left .35s ease,top .35s ease,background .2s,border-color .2s}.msim-node.is-drag{transition:none}}';

  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }

  function build(root) {
    if (root.getAttribute('data-msim-ready')) return;
    root.setAttribute('data-msim-ready', '1');

    if (!document.getElementById('msim-css')) {
      var st = document.createElement('style');
      st.id = 'msim-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.innerHTML =
      '<div class="msim">' +
        '<div class="msim-top"><span>CREATE DEVICE MESH</span><span class="msim-x" aria-hidden="true">&#215;</span></div>' +
        '<div class="msim-room"><span class="msim-roomname">Kitchen</span>' +
          '<button type="button" class="msim-test">TEST<span class="msim-bang">!</span></button></div>' +
        '<div class="msim-legend">' +
          '<div><span class="msim-key" aria-hidden="true"></span><span><b class="msim-n-total"></b> Total Devices</span></div>' +
          '<div><span class="msim-key msim-key--r" aria-hidden="true"></span><span><b class="msim-n-rep"></b> Repeater Devices</span></div>' +
          '<div class="msim-lowrow"><span class="msim-key msim-key--l" aria-hidden="true">!</span><span><b class="msim-n-low"></b> <span class="msim-low-text">Devices have LOW Reliability</span></span></div>' +
          '<button type="button" class="msim-info" aria-expanded="false" aria-label="How to use this simulation">i</button>' +
        '</div>' +
        '<div class="msim-map" tabindex="0" role="application" aria-label="Mesh map simulation. Press the arrow keys to choose a device, Enter to promote it to a repeater, T to run a signal test, R to reset.">' +
          '<svg class="msim-links" aria-hidden="true"></svg>' +
          '<div class="msim-gw">GATEWAY<small>Drag here to make Repeater</small></div>' +
          '<div class="msim-pulse" aria-hidden="true"></div>' +
        '</div>' +
        '<div class="msim-toast" role="status"></div>' +
        '<div class="msim-bottom">' +
          '<button type="button" class="msim-btn" data-act="auto">AUTO SELECT</button>' +
          '<button type="button" class="msim-btn" data-act="reset">RESET</button>' +
        '</div>' +
        '<div class="msim-help" hidden><button type="button" class="msim-help-close" aria-label="Close help"><span aria-hidden="true">&#215;</span></button><b>Strengthen the mesh</b><ul>' +
          '<li>Coral bulbs with a "!" have LOW reliability.</li>' +
          '<li>Drag any bulb onto the GATEWAY box to make it a repeater — devices near it get stronger.</li>' +
          '<li>Press TEST to sweep the mesh and reveal weak devices the quick view missed.</li>' +
          '<li>Keyboard: arrows choose a device, Enter promotes, T tests, R resets.</li>' +
        '</ul><b>AUTO SELECT is what shipped: the system places repeaters itself.</b></div>' +
        '<div class="msim-sr" aria-live="polite"></div>' +
      '</div>';

    var q = function (s) { return root.querySelector(s); };
    var map = q('.msim-map'), svg = q('.msim-links'), gwEl = q('.msim-gw'), pulse = q('.msim-pulse');
    var toast = q('.msim-toast'), sr = q('.msim-sr'), testBtn = q('.msim-test'), bang = q('.msim-bang');
    var lowRow = q('.msim-lowrow'), help = q('.msim-help'), helpClose = q('.msim-help-close'), infoBtn = q('.msim-info');

    // ---- state ----
    var reps, flagged, tested, dirty, sel;
    var epoch = 0; // bumped by reset so a pending TEST reveal can't apply stale results
    var nodeEls = [], lines = []; // lines: {a,b,el} node indexes, -1 = gateway
    function saveState() { MEM.reps = reps.slice(); MEM.flagged = flagged.slice(); MEM.tested = tested; MEM.dirty = dirty; }

    function pos(i) { return i === -1 ? GW : NODES[i]; }
    function sig(i) {
      var s = Math.max(0, 1 - dist(NODES[i], GW) / R_GW);
      reps.forEach(function (r) { if (r !== i) s = Math.max(s, Math.max(0, 1 - dist(NODES[i], NODES[r]) / R_REP)); });
      return s;
    }
    function isRep(i) { return reps.indexOf(i) !== -1; }
    function weakList() { return NODES.map(function (_, i) { return i; }).filter(function (i) { return !isRep(i) && sig(i) < WEAK; }); }

    // ---- static topology: each node links to its 2 nearest neighbours, gateway to its 6 ----
    (function buildLinks() {
      var pairs = {};
      function add(a, b) { var k = Math.min(a, b) + ':' + Math.max(a, b); if (!pairs[k]) pairs[k] = [a, b]; }
      NODES.forEach(function (n, i) {
        NODES.map(function (m, j) { return [dist(n, m), j]; })
          .filter(function (p) { return p[1] !== i; })
          .sort(function (a, b) { return a[0] - b[0]; })
          .slice(0, 2).forEach(function (p) { add(i, p[1]); });
      });
      NODES.map(function (n, i) { return [dist(n, GW), i]; })
        .sort(function (a, b) { return a[0] - b[0]; })
        .slice(0, 6).forEach(function (p) { add(-1, p[1]); });
      Object.keys(pairs).forEach(function (k) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        var a = pos(pairs[k][0]), b = pos(pairs[k][1]);
        el.setAttribute('x1', a[0]); el.setAttribute('y1', a[1]);
        el.setAttribute('x2', b[0]); el.setAttribute('y2', b[1]);
        el.setAttribute('vector-effect', 'non-scaling-stroke');
        svg.appendChild(el);
        lines.push({ a: pairs[k][0], b: pairs[k][1], el: el });
      });
      svg.setAttribute('viewBox', '0 -' + Y_PAD + ' 100 ' + Y_SPAN);
      svg.setAttribute('preserveAspectRatio', 'none');
    })();

    NODES.forEach(function (n, i) {
      var el = document.createElement('div');
      el.className = 'msim-node';
      el.setAttribute('data-i', i);
      el.title = n[2];
      el.innerHTML = '<span class="msim-bulb" aria-hidden="true"></span>';
      placeAtHome(el, i);
      map.appendChild(el);
      nodeEls.push(el);
    });
    function placeAtHome(el, i) { el.style.left = NODES[i][0] + '%'; el.style.top = topPct(NODES[i][1]) + '%'; }

    // ---- rendering ----
    function say(msg) { sr.textContent = msg; }
    function note(msg, ok) { toast.textContent = msg; toast.classList.toggle('is-ok', !!ok); MEM.toast = msg; MEM.ok = !!ok; }
    function render() {
      nodeEls.forEach(function (el, i) {
        var low = flagged.indexOf(i) !== -1;
        el.classList.toggle('is-rep', isRep(i));
        el.classList.toggle('is-low', low);
        el.classList.toggle('is-sel', sel === i);
        var b = el.querySelector('.msim-bang');
        if (low && !b) { b = document.createElement('span'); b.className = 'msim-bang'; b.textContent = '!'; el.appendChild(b); }
        if (!low && b) b.remove();
        el.title = NODES[i][2] + (isRep(i) ? ' — repeater' : ', signal ' + Math.round(sig(i) * 100) + '%' + (low ? ', LOW reliability' : ''));
      });
      lines.forEach(function (l) {
        l.el.classList.toggle('is-low', flagged.indexOf(l.a) !== -1 || flagged.indexOf(l.b) !== -1);
      });
      q('.msim-n-total').textContent = NODES.length;
      q('.msim-n-rep').textContent = reps.length;
      q('.msim-n-low').textContent = flagged.length;
      q('.msim-low-text').textContent = flagged.length === 1 ? 'Device has LOW Reliability' : 'Devices have LOW Reliability';
      lowRow.classList.toggle('is-warn', flagged.length > 0);
      bang.hidden = tested && !dirty;
      saveState();
    }

    // ---- guidance: where are the weak devices? ----
    function whereText(list) {
      if (!list.length) return '';
      var zones = {};
      list.forEach(function (i) {
        var dx = NODES[i][0] - GW[0], dy = NODES[i][1] - GW[1];
        var z = (dy < -18 ? 'top' : dy > 18 ? 'bottom' : 'mid') + (dx < -14 ? ' left' : dx > 14 ? ' right' : '');
        zones[z] = (zones[z] || 0) + 1;
      });
      var best = Object.keys(zones).sort(function (a, b) { return zones[b] - zones[a]; })[0];
      return best === 'mid' ? 'near the gateway' : 'toward the ' + best.replace('mid', 'far');
    }

    // ---- actions ----
    function promote(i, silent) {
      if (isRep(i)) { say(NODES[i][2] + ' is already a repeater.'); return; }
      var before = flagged.length;
      var wasFlagged = flagged.indexOf(i) !== -1;
      reps.push(i);
      flagged = flagged.filter(function (f) { return f !== i && sig(f) < WEAK; });
      dirty = true;
      var healed = before - flagged.length - (wasFlagged ? 1 : 0);
      render();
      if (!silent) {
        var msg = NODES[i][2] + ' is now a repeater.' +
          (healed > 0 ? ' ' + healed + ' nearby strengthened.' : '') +
          (flagged.length ? ' ' + flagged.length + ' still weak.' : ' Press TEST to confirm the mesh.');
        note(msg); say(msg);
      }
    }

    function runTest(silent) {
      var myEpoch = epoch;
      var reveal = function () {
        if (myEpoch !== epoch) return; // reset happened while the sweep ran
        var weak = weakList();
        var fresh = weak.filter(function (i) { return flagged.indexOf(i) === -1; });
        flagged = weak;
        tested = true; dirty = false;
        render();
        var msg;
        if (!weak.length) {
          msg = 'Mesh healthy — all ' + NODES.length + ' devices strong with ' + reps.length + ' repeaters. Auto Select ships this exact result in one tap.';
          note(msg, true);
        } else {
          msg = 'Test complete: ' + weak.length + ' weak ' + (weak.length === 1 ? 'device' : 'devices') +
            (fresh.length ? ' (' + fresh.length + ' newly found)' : '') + ', mostly ' + whereText(weak) +
            '. Drag a bulb near them onto the gateway.';
          note(msg);
        }
        if (!silent) say(msg);
      };
      if (reduce) { reveal(); }
      else {
        pulse.classList.remove('is-on'); void pulse.offsetWidth; pulse.classList.add('is-on');
        setTimeout(reveal, 620);
      }
    }

    function autoSelect() {
      var guard = 0;
      while (weakList().length && guard++ < 8) {
        var weak = weakList();
        var best = -1, bestGain = -1;
        NODES.forEach(function (_, c) {
          if (isRep(c)) return;
          var gain = weak.filter(function (w) { return w !== c && dist(NODES[w], NODES[c]) <= R_REP * (1 - WEAK); }).length;
          if (gain > bestGain) { bestGain = gain; best = c; }
        });
        if (best === -1) break;
        promote(best, true);
      }
      runTest(true);
      var msg = 'Auto Select placed ' + reps.length + ' repeaters — zero decisions asked of you. This is the model that shipped as P4.';
      note(msg, weakList().length === 0); say(msg);
    }

    function reset() {
      epoch++;
      reps = REPS0.slice();
      tested = false; dirty = false; sel = null;
      flagged = NODES.map(function (_, i) { return i; }).filter(function (i) { return !isRep(i) && sig(i) < CRIT; });
      render();
      var msg = flagged.length + ' devices report LOW reliability. Drag one onto the gateway box to make it a repeater.';
      note(msg); say('Simulation reset. ' + msg);
    }

    // ---- pointer drag ----
    var drag = null; // {i, el, ghost}
    function mapPoint(e) {
      var r = map.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * Y_SPAN - Y_PAD];
    }
    function overGateway(e) {
      var r = gwEl.getBoundingClientRect();
      return e.clientX >= r.left - 8 && e.clientX <= r.right + 8 && e.clientY >= r.top - 8 && e.clientY <= r.bottom + 8;
    }
    map.addEventListener('pointerdown', function (e) {
      if (drag) return;
      var p = mapPoint(e), best = -1, bd = 1e9;
      var r = map.getBoundingClientRect();
      NODES.forEach(function (n, i) {
        if (isRep(i)) return;
        var dpx = Math.hypot((n[0] - p[0]) / 100 * r.width, (n[1] - p[1]) / MAP_H * r.height);
        if (dpx < bd) { bd = dpx; best = i; }
      });
      if (best === -1 || bd > 26) return;
      e.preventDefault();
      try { map.setPointerCapture(e.pointerId); } catch (err) {}
      var el = nodeEls[best];
      var ghost = document.createElement('div');
      ghost.className = 'msim-ghost';
      ghost.style.left = el.style.left; ghost.style.top = el.style.top;
      map.appendChild(ghost);
      drag = { i: best, el: el, ghost: ghost };
      el.classList.add('is-drag');
      say('Dragging ' + NODES[best][2] + '. Drop on the gateway to promote it.');
    });
    map.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var p = mapPoint(e);
      drag.el.style.left = Math.max(2, Math.min(98, p[0])) + '%';
      drag.el.style.top = Math.max(1.5, Math.min(98.5, topPct(p[1]))) + '%';
      gwEl.classList.toggle('is-target', overGateway(e));
    });
    function endDrag(e) {
      if (!drag) return;
      var d = drag; drag = null;
      d.el.classList.remove('is-drag');
      d.ghost.remove();
      gwEl.classList.remove('is-target');
      placeAtHome(d.el, d.i);
      if (e && overGateway(e)) promote(d.i);
    }
    map.addEventListener('pointerup', endDrag);
    map.addEventListener('pointercancel', function () { endDrag(null); });

    // ---- keyboard path ----
    map.addEventListener('keydown', function (e) {
      var order = NODES.map(function (_, i) { return i; }).filter(function (i) { return !isRep(i); });
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        var step = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
        var at = order.indexOf(sel);
        sel = order[(at + step + order.length) % order.length];
        render();
        var low = flagged.indexOf(sel) !== -1;
        say(NODES[sel][2] + ', signal ' + Math.round(sig(sel) * 100) + '%' + (low ? ', LOW reliability' : '') + '. Press Enter to promote to repeater.');
      } else if ((e.key === 'Enter' || e.key === ' ') && sel != null) {
        e.preventDefault(); promote(sel); sel = null; render();
      } else if (e.key === 't' || e.key === 'T') { e.preventDefault(); runTest(); }
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); reset(); }
      else if (e.key === 'Escape' && sel != null) { sel = null; render(); }
    });

    // ---- buttons ----
    testBtn.addEventListener('click', function () { runTest(); });
    root.querySelector('[data-act="auto"]').addEventListener('click', autoSelect);
    root.querySelector('[data-act="reset"]').addEventListener('click', reset);
    function closeHelp() { help.hidden = true; infoBtn.setAttribute('aria-expanded', 'false'); }
    help.setAttribute('tabindex', '-1');
    infoBtn.addEventListener('click', function () {
      var show = help.hidden;
      help.hidden = !show;
      infoBtn.setAttribute('aria-expanded', show ? 'true' : 'false');
      if (show) helpClose.focus();
    });
    helpClose.addEventListener('click', function (e) { e.stopPropagation(); closeHelp(); infoBtn.focus(); });
    help.addEventListener('click', function (e) { if (e.target === help) closeHelp(); });
    help.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeHelp(); infoBtn.focus(); }
    });

    // ---- disable while a P2–P4 swap image covers the sim ----
    var host = root.parentElement;
    function syncCovered() {
      var covered = !!(host && host.querySelector('.sl-swap.sl-on'));
      q('.msim').classList.toggle('msim-covered', covered);
      root.setAttribute('aria-hidden', covered ? 'true' : 'false');
      map.tabIndex = covered ? -1 : 0;
      root.querySelectorAll('button').forEach(function (b) { b.tabIndex = covered ? -1 : 0; });
    }
    if (host && window.MutationObserver) {
      if (coverObs) coverObs.disconnect();
      coverObs = new MutationObserver(syncCovered);
      coverObs.observe(host, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
    syncCovered();

    if (MEM.reps) { // rebuilt after a page re-render: restore where the visitor left off
      reps = MEM.reps.slice(); flagged = MEM.flagged.slice(); tested = MEM.tested; dirty = MEM.dirty;
      render();
      note(MEM.toast || '', MEM.ok);
    } else {
      reset();
    }
  }

  // .dc pages render after load and re-render on state changes (which wipes
  // the sim's DOM) — keep watching and rebuild whenever a bare container shows up
  function scanNow() {
    document.querySelectorAll('[data-mesh-sim]').forEach(function (el) {
      if (el.getAttribute('data-msim-ready') && el.childElementCount > 0) return;
      el.removeAttribute('data-msim-ready');
      try { build(el); } catch (e) {}
    });
  }
  var pending = null;
  function scheduleScan() {
    if (pending) return;
    pending = setTimeout(function () { pending = null; scanNow(); }, 60);
  }
  function start() {
    scanNow();
    if (window.MutationObserver) {
      new MutationObserver(scheduleScan).observe(document.body || document.documentElement, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
