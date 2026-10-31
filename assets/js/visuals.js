/* ==========================================================================
   Project visuals: the moving parts.
   The markup comes from tools/build-projects.mjs; styles live in
   assets/css/visuals.css. Every scene runs only while it is on screen
   (.is-live) and holds a single still frame under reduced motion.

     flip   Laura's split-flap clock counting a Pomodoro down
     pos    Shoprex ringing up a sale, row by row
     flow   a request walking through its approvals (Magari, IRCA)
     seis   EleGuard: herd, seismograph, alert, drone
     eq     Gold Lab: noise runs vs the best candidate
   ========================================================================== */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVG = 'http://www.w3.org/2000/svg';
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function el(tag, attrs, parent) {
    var n = document.createElementNS(SVG, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // small seeded RNG so the "random" charts look the same on every visit
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function gauss(r) { return (r() + r() + r() + r() - 2) * 1.2; }

  var money = function (n) { return 'TSh ' + n.toLocaleString('en-US'); };

  /* ====================== FLIP ====================== */
  function flip(root) {
    var cards = $$('.fc', root);
    var bar = root.querySelector('.v-flip__bar span');
    var TOTAL = 25 * 60;
    var left = TOTAL - 37;
    var timer = null;

    cards.forEach(function (c) {
      c.innerHTML =
        '<div class="fc__h fc__h--t"><span></span></div>' +
        '<div class="fc__h fc__h--b"><span></span></div>' +
        '<div class="fc__h fc__h--t fc__f"><span></span></div>' +
        '<div class="fc__h fc__h--b fc__f"><span></span></div>';
    });

    function spans(c) { return c.querySelectorAll('span'); }

    function set(c, d, animate) {
      if (c.dataset.d === d) return;
      var s = spans(c), prev = c.dataset.d || d;
      c.dataset.d = d;
      if (!animate) { for (var i = 0; i < 4; i++) s[i].textContent = d; return; }
      s[0].textContent = d;      // static top: the new digit, revealed as the flap falls
      s[1].textContent = prev;   // static bottom: the old one, until the flap lands
      s[2].textContent = prev;   // falling flap
      s[3].textContent = d;      // landing flap
      c.classList.remove('go'); void c.offsetWidth; c.classList.add('go');
      setTimeout(function () {
        s[1].textContent = d; s[2].textContent = d;
        c.classList.remove('go');
      }, 600);
    }

    function render(animate) {
      var m = Math.floor(left / 60), s = left % 60;
      var str = (m < 10 ? '0' : '') + m + (s < 10 ? '0' : '') + s;
      cards.forEach(function (c, i) { set(c, str[i], animate); });
      if (bar) bar.style.width = ((TOTAL - left) / TOTAL * 100).toFixed(2) + '%';
    }

    render(false);
    return {
      start: function () {
        if (timer || REDUCED) return;
        timer = setInterval(function () { left = left > 0 ? left - 1 : TOTAL; render(true); }, 1000);
      },
      stop: function () { clearInterval(timer); timer = null; }
    };
  }

  /* ====================== POS ====================== */
  function pos(root) {
    var rows = $$('.v-pos__row', root);
    var total = root.querySelector('[data-total]');
    var btn = root.querySelector('.v-pos__btn');
    var label = btn ? btn.textContent : '';
    var i = 0, sum = 0, t = null;

    function reset() {
      rows.forEach(function (r) { r.classList.remove('on'); });
      root.classList.remove('sold');
      if (btn) btn.textContent = label;
      i = 0; sum = 0; total.textContent = money(0);
    }

    function step() {
      if (i < rows.length) {
        rows[i].classList.add('on');
        sum += +rows[i].getAttribute('data-price');
        total.textContent = money(sum);
        i++;
        t = setTimeout(step, 1000);
      } else if (!root.classList.contains('sold')) {
        root.classList.add('sold');
        if (btn) btn.textContent = btn.getAttribute('data-done') || label;
        t = setTimeout(step, 2400);
      } else {
        reset();
        t = setTimeout(step, 600);
      }
    }

    if (REDUCED) { rows.forEach(function (r) { r.classList.add('on'); sum += +r.getAttribute('data-price'); }); total.textContent = money(sum); }
    return {
      start: function () { if (!t && !REDUCED) step(); },
      stop: function () { clearTimeout(t); t = null; }
    };
  }

  /* ====================== FLOW ====================== */
  function flow(root) {
    var nodes = $$('.v-flow__node', root);
    var line = root.querySelector('.v-flow__line');
    var status = root.querySelector('.v-flow__status');
    var labels = (status && status.getAttribute('data-steps') || '').split('|');
    var i = -1, t = null;

    function show(n) {
      nodes.forEach(function (node, k) {
        node.classList.toggle('on', k <= n);
        node.classList.toggle('now', k === n);
      });
      line.style.setProperty('--done', (Math.max(n, 0) / (nodes.length - 1) * 100) + '%');
      if (status && labels[n]) {
        status.style.opacity = 0;
        setTimeout(function () { status.textContent = labels[n]; status.style.opacity = 1; }, 220);
      }
    }

    function tick() {
      i = i + 1 > nodes.length ? 0 : i + 1;
      if (i === nodes.length) { t = setTimeout(tick, 1800); return; }   // hold the finished state
      show(i);
      t = setTimeout(tick, i === 0 ? 1400 : 1500);
    }

    if (REDUCED) show(nodes.length - 1);
    return {
      start: function () { if (!t && !REDUCED) tick(); },
      stop: function () { clearTimeout(t); t = null; }
    };
  }

  /* ====================== SEISMIC ====================== */
  function seis(root) {
    var svg = el('svg', { viewBox: '0 0 600 375', 'aria-hidden': 'true' });
    root.insertBefore(svg, root.firstChild);

    el('rect', { class: 'panel', x: 20, y: 18, width: 560, height: 112, rx: 10 }, svg);
    var t1 = el('text', { class: 'lbl', x: 34, y: 37 }, svg); t1.textContent = 'SEISMIC NODE S-02 · LIVE';
    var trace = el('polyline', { class: 'trace' }, svg);

    var corr = el('path', { class: 'corr', d: 'M -10 330 C 120 310, 190 215, 300 228 S 470 320, 610 200' }, svg);
    var route = el('path', { class: 'route', d: 'M 78 172 C 140 140, 220 150, 262 206' }, svg);
    var sensors = [[110, 306], [262, 222], [405, 262], [530, 238]];
    var ripples = [];
    sensors.forEach(function (p, k) {
      if (k === 1) {
        ripples.push(el('circle', { class: 'ripple', cx: p[0], cy: p[1], r: 6 }, svg));
        ripples.push(el('circle', { class: 'ripple', cx: p[0], cy: p[1], r: 6 }, svg));
      }
      el('circle', { class: 'sensor', cx: p[0], cy: p[1], r: 5 }, svg);
    });

    // the village and the ranger post
    [[318, 318], [334, 326], [350, 316], [326, 340], [344, 344]].forEach(function (h) {
      el('rect', { class: 'house', x: h[0], y: h[1], width: 9, height: 8, rx: 1.5 }, svg);
    });
    var v = el('text', { x: 312, y: 366 }, svg); v.textContent = 'village';
    el('rect', { class: 'house', x: 70, y: 166, width: 16, height: 11, rx: 2, fill: '#fbbf24' }, svg);
    var rp = el('text', { x: 46, y: 160 }, svg); rp.textContent = 'ranger post';

    var herd = [0, 1, 2].map(function () { return el('circle', { r: 4.5, fill: '#d6d3d1' }, svg); });
    var drone = el('g', { class: 'drone' }, svg);
    el('rect', { x: -6, y: -2, width: 12, height: 4, rx: 2 }, drone);
    el('rect', { x: -9, y: -4, width: 5, height: 1.5 }, drone);
    el('rect', { x: 4, y: -4, width: 5, height: 1.5 }, drone);

    var cLen = corr.getTotalLength(), rLen = route.getTotalLength();
    var target = sensors[1];
    var pts = [], N = 140, raf = null, t0 = 0, seed = rng(7);
    for (var i = 0; i < N; i++) pts.push(0);

    var LOOP = 11000;
    function frame(now) {
      if (!t0) t0 = now;
      var t = (now - t0) % LOOP;

      // herd: walk in, stop near the sensor, turn back once the drone arrives
      var f;
      if (t < 4200)      f = 0.06 + (t / 4200) * 0.34;
      else if (t < 6800) f = 0.40;
      else if (t < 10000) f = 0.40 - ((t - 6800) / 3200) * 0.34;
      else               f = 0.06;
      var p0 = corr.getPointAtLength(f * cLen);
      herd.forEach(function (h, k) {
        var p = corr.getPointAtLength(Math.max(0, f * cLen - k * 9));
        h.setAttribute('cx', p.x); h.setAttribute('cy', p.y + (k === 1 ? -6 : 0));
        h.setAttribute('opacity', t > 10000 ? 0.3 : 1);
      });

      var d = Math.hypot(p0.x - target[0], p0.y - target[1]);
      var amp = Math.max(0, 1 - d / 140);
      var step = Math.max(0, Math.sin(now / 95)) ** 6;     // footfalls: sharp, rhythmic
      pts.shift();
      pts.push(gauss(seed) * 2.2 + (seed() - 0.5) * amp * 18 + step * amp * 34 * (seed() > 0.5 ? 1 : -1));
      trace.setAttribute('points', pts.map(function (y, k) {
        return (30 + k * (540 / (N - 1))).toFixed(1) + ',' + (84 + y).toFixed(1);
      }).join(' '));

      var alert = t > 3600 && t < 9800;
      root.classList.toggle('alert', alert);
      if (t > 4200 && t < 9800) {
        var q = route.getPointAtLength(Math.min(1, (t - 4200) / 2200) * rLen);
        drone.setAttribute('transform', 'translate(' + q.x + ' ' + (q.y - 8) + ')');
      } else {
        drone.setAttribute('transform', 'translate(78 164)');
      }

      raf = requestAnimationFrame(frame);
    }

    if (REDUCED) {
      root.classList.add('alert');
      trace.setAttribute('points', pts.map(function (y, k) { return (30 + k * (540 / (N - 1))) + ',84'; }).join(' '));
    }
    return {
      start: function () { if (!raf && !REDUCED) raf = requestAnimationFrame(frame); },
      stop: function () { cancelAnimationFrame(raf); raf = null; }
    };
  }

  /* ====================== EQUITY ====================== */
  function eq(root) {
    var svg = el('svg', { viewBox: '0 0 600 375', 'aria-hidden': 'true', preserveAspectRatio: 'none' });
    root.insertBefore(svg, root.firstChild);
    var X0 = 30, X1 = 580, Y0 = 70, Y1 = 345, ZERO = 230, N = 150;
    var xAt = function (i) { return X0 + (X1 - X0) * i / (N - 1); };
    var VAL = 0.55, HOLD = 0.78;

    el('rect', { class: 'hold', x: X0 + (X1 - X0) * HOLD, y: Y0 - 30, width: (X1 - X0) * (1 - HOLD), height: Y1 - Y0 + 30 }, svg);
    [VAL, HOLD].forEach(function (s) {
      var x = X0 + (X1 - X0) * s;
      el('line', { class: 'split', x1: x, x2: x, y1: Y0 - 30, y2: Y1 }, svg);
    });
    el('line', { class: 'zero', x1: X0, x2: X1, y1: ZERO, y2: ZERO }, svg);
    [['development', X0 + 4], ['validation', X0 + (X1 - X0) * VAL + 6], ['sealed holdout', X0 + (X1 - X0) * HOLD + 6]].forEach(function (l, k) {
      var tx = el('text', { x: l[1], y: Y1 + 0, class: k === 2 ? 'tag' : '' }, svg);
      tx.setAttribute('y', 362);
      tx.textContent = l[0];
    });
    var z = el('text', { x: X0 + 2, y: ZERO - 6 }, svg); z.textContent = '0 R';

    function path(ys) {
      return ys.map(function (y, i) { return (i ? 'L' : 'M') + xAt(i).toFixed(1) + ' ' + y.toFixed(1); }).join(' ');
    }

    var r = rng(42);
    for (var k = 0; k < 24; k++) {
      var y = ZERO, ys = [];
      for (var i = 0; i < N; i++) { ys.push(Math.max(Y0, Math.min(Y1, y))); y += gauss(r) * 3.4; }
      el('path', { class: 'noise', d: path(ys) }, svg);
    }

    // the best candidate: good in development, loses in validation, fine on the holdout
    var r2 = rng(5), yb = ZERO, best = [];
    for (var j = 0; j < N; j++) {
      var p = j / (N - 1);
      var drift = p < VAL ? -0.85 : p < HOLD ? 0.6 : -0.75;
      best.push(Math.max(Y0 - 20, Math.min(Y1, yb)));
      yb += drift + gauss(r2) * 2.2;
    }
    var b = el('path', { class: 'best', d: path(best) }, svg);
    var len = b.getTotalLength();
    b.style.strokeDasharray = len;
    b.style.strokeDashoffset = REDUCED ? 0 : len;

    var lt = el('text', { class: 'tag', x: X0 + 4, y: 34 }, svg);
    lt.textContent = 'gold line: best of 170 rules · grey: the same search on pure noise';

    return {
      start: function () { root.classList.add('draw'); },
      stop: function () {}
    };
  }

  /* ====================== WIRING ====================== */
  var SCENES = { flip: flip, pos: pos, flow: flow, seis: seis, eq: eq };

  function init() {
    var items = $$('.v');
    if (!items.length) return;

    var ctrl = new Map();
    items.forEach(function (root) {
      var make = SCENES[root.getAttribute('data-v')];
      ctrl.set(root, make ? make(root) : { start: function () {}, stop: function () {} });
    });

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (root) { root.classList.add('is-live'); ctrl.get(root).start(); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var c = ctrl.get(en.target);
        en.target.classList.toggle('is-live', en.isIntersecting);
        if (en.isIntersecting) c.start(); else c.stop();
      });
    }, { threshold: 0.2 });
    items.forEach(function (root) { io.observe(root); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
