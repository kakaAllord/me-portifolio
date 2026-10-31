/* ==========================================================================
   Allord Archard portfolio
   Vanilla JS, no dependencies. Contact details come from config.js.

     nav()       hairline once scrolled, current section highlighted
                 (in the top links and the phone tab bar)
     reveal()    sections rise in as they arrive
     filters()   Work grid: All / Web / Mobile / Desktop / Data
     counters()  numbers count up the first time they are seen
     process()   the line across the four steps draws as you scroll
     story()     project pages: the screen follows the step in view
     collage()   hero screens drift apart a little as the page scrolls
     contact()   WhatsApp and email links, copy buttons, year
   ========================================================================== */

(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IO = 'IntersectionObserver' in window;
  var PHONE = window.matchMedia('(max-width: 720px)');   // mobile.css applies
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  function onScroll(fn) {
    var queued = false;
    addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn(scrollY); });
    }, { passive: true });
    fn(scrollY);
  }

  /* ====================== NAV ====================== */
  function nav() {
    var bar = $('#nav');
    if (!bar) return;
    onScroll(function (y) { bar.classList.toggle('stuck', y > 8); });

    var links = $$('.nav__links a[href^="#"], .dock a[href^="#"]');
    var targets = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean)
      .filter(function (t, i, all) { return all.indexOf(t) === i; });
    if (!targets.length || !IO) return;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ====================== REVEAL ====================== */
  function reveal() {
    var items = $$('[data-reveal]');
    items.forEach(function (el) { el.style.setProperty('--d', (el.getAttribute('data-reveal') || 0) + 'ms'); });
    if (!IO || REDUCED) { items.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ====================== FILTERS ====================== */
  function filters() {
    var bar = $('.filters');
    var grid = $('.grid');
    if (!bar || !grid) return;
    var buttons = $$('button', bar);
    var cards = $$('.card', grid);

    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var kind = b.getAttribute('data-kind');
      buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      grid.classList.toggle('filtered', kind !== 'all');
      cards.forEach(function (c, i) {
        var show = kind === 'all' || c.getAttribute('data-kinds').split(' ').indexOf(kind) > -1;
        c.hidden = !show;
        c.classList.remove('enter');
        if (show && !REDUCED) {
          c.style.animationDelay = (i % 6) * 45 + 'ms';
          void c.offsetWidth;
          c.classList.add('enter');
        }
      });
    });
  }

  /* ====================== COUNTERS ====================== */
  function counters() {
    var els = $$('[data-count]');
    if (!els.length || REDUCED || !IO) return;   // the HTML already holds the final value
    var fmt = function (n, el) { return Math.round(n).toLocaleString('en-US') + (el.getAttribute('data-suffix') || ''); };
    els.forEach(function (el) { el.textContent = fmt(0, el); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = +el.getAttribute('data-count'), t0 = performance.now();
        (function tick(now) {
          var p = clamp((now - t0) / 1300, 0, 1);
          el.textContent = fmt(to * (1 - Math.pow(1 - p, 4)), el);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ====================== PROCESS ====================== */
  function process() {
    var row = $('.steps');
    if (!row) return;
    var steps = $$('.step', row);
    if (REDUCED) { row.style.setProperty('--line-p', '100%'); steps.forEach(function (s) { s.classList.add('on'); }); return; }
    onScroll(function () {
      var r = row.getBoundingClientRect();
      // 0 when the row enters at the bottom third, 1 when it reaches the upper third;
      // on phones the steps stack, so the line follows the middle of the screen down them
      var p = PHONE.matches
        ? clamp((innerHeight * 0.6 - r.top) / r.height, 0, 1)
        : clamp((innerHeight * 0.85 - r.top) / (innerHeight * 0.5), 0, 1);
      row.style.setProperty('--line-p', (p * 100).toFixed(1) + '%');
      steps.forEach(function (s, i) { s.classList.toggle('on', p >= i / steps.length + 0.02); });
    });
  }

  /* ====================== STORY ====================== */
  function story() {
    var root = $('[data-story]');
    if (!root || !IO) return;
    var steps = $$('.story__step', root);
    var imgs = $$('.story__stage .story__img', root);
    var dots = $$('.story__dots span', root);
    function show(i) {
      [steps, imgs, dots].forEach(function (list) {
        list.forEach(function (el, k) { el.classList.toggle('on', k === i); });
      });
    }
    show(0);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) show(+en.target.getAttribute('data-step')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ====================== COLLAGE ====================== */
  function collage() {
    var items = $$('.collage__item');
    if (!items.length || REDUCED) return;
    var speed = [-0.05, 0.09, 0.16];
    onScroll(function (y) {
      if (PHONE.matches) { items.forEach(function (el) { el.style.transform = ''; }); return; }   // a sideways reel there
      if (y > innerHeight * 1.2) return;
      items.forEach(function (el, i) { el.style.transform = 'translate3d(0,' + (y * speed[i % 3]).toFixed(1) + 'px,0)'; });
    });
  }

  /* ====================== CONTACT ====================== */
  function contact() {
    var number = String(CFG.whatsappNumber || '').replace(/\D/g, '');
    var base = CFG.whatsappMessage || 'Hi Allord!';
    $$('[data-whatsapp]').forEach(function (a) {
      var text = a.getAttribute('data-wa-text') || base;
      a.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(text);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
    $$('[data-email]').forEach(function (a) {
      a.href = 'mailto:' + CFG.email;
      if (!a.textContent.trim()) a.textContent = CFG.email;
    });
    $$('[data-github]').forEach(function (a) { a.href = CFG.github; });

    $$('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var value = b.getAttribute('data-copy') === 'email' ? CFG.email : b.getAttribute('data-copy');
        var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); };
        if (navigator.clipboard) navigator.clipboard.writeText(value).then(done, function () {});
      });
    });

    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  nav();
  reveal();
  filters();
  counters();
  process();
  story();
  collage();
  contact();
})();
