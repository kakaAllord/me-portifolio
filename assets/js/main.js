/* ==========================================================================
   Allord Archard — portfolio
   Vanilla JS. No dependencies. Everything below is hand-rolled.

   Modules, in order:
     boot()        loading sequence
     theme()       dark / light with persistence
     cursor()      custom pointer
     network()     canvas node-graph background with signal pulses
     nav()         sticky header, scrollspy, mobile drawer
     progress()    scroll progress bar
     reveal()      IntersectionObserver entrances, bars, counters
     typewriter()  hero type / delete loop
     terminal()    boot log that types itself
     scramble()    section headings decode on first view
     tilt()        3D tilt + pointer-tracked card shine
     magnetic()    buttons that lean toward the cursor
     contact()     WhatsApp links with a pre-written message
     misc()        marquee loop, float button, year
   ========================================================================== */

(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ======================================================================
     BOOT
     ====================================================================== */
  function boot() {
    var el = $('#boot');
    var log = $('#bootLog');
    var bar = $('#bootBar');
    if (!el) return Promise.resolve();

    var lines = CFG.bootLines || [];

    function finish() {
      el.classList.add('done');
      document.body.classList.remove('is-locked');
      setTimeout(function () { el.remove(); }, 800);
    }

    if (REDUCED) { finish(); return Promise.resolve(); }

    document.body.classList.add('is-locked');

    return new Promise(function (resolve) {
      var i = 0;
      (function step() {
        if (i < lines.length) {
          log.textContent += (i ? '\n' : '') + lines[i];
          i++;
          bar.style.width = Math.round((i / lines.length) * 100) + '%';
          setTimeout(step, 190);
        } else {
          setTimeout(function () { finish(); resolve(); }, 320);
        }
      })();
    });
  }

  /* ======================================================================
     THEME
     ====================================================================== */
  function theme() {
    var root = document.documentElement;
    var btn = $('#themeToggle');
    var KEY = 'aa-theme';

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* private mode */ }

    // Dark is the intended first impression, so it stays the default even on a
    // light-preferring system. An explicit choice from the toggle always wins.
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);

    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      document.dispatchEvent(new CustomEvent('themechange'));
    });
  }

  /* ======================================================================
     CURSOR
     ====================================================================== */
  function cursor() {
    if (!FINE_POINTER || REDUCED) return;

    var dot = $('#cursorDot');
    var ring = $('#cursorRing');
    if (!dot || !ring) return;

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('cursor-on');
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-on');
    });

    // ring trails the dot with a light spring
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform  = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(loop);
    })();

    // grow over anything interactive
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('a, button, [data-cursor], .card, input, textarea');
      document.body.classList.toggle('cursor-hover', !!t);
    });
  }

  /* ======================================================================
     NETWORK BACKGROUND
     A drifting node graph. Nodes near each other link up; every so often a
     signal pulse runs down one of those links — the circuit-board feel.
     ====================================================================== */
  function network() {
    var cvs = $('#bgCanvas');
    if (!cvs || REDUCED) { if (cvs) cvs.style.display = 'none'; return; }

    var ctx = cvs.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var nodes = [];
    var pulses = [];
    var mouse = { x: -9999, y: -9999 };
    var LINK = 138;

    var colors = { accent: '34,211,238', node: '148,163,184' };

    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      colors.accent = toRgb(cs.getPropertyValue('--accent').trim()) || '34,211,238';
      colors.node = document.documentElement.getAttribute('data-theme') === 'light'
        ? '71,85,105' : '148,163,184';
    }

    function toRgb(hex) {
      var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!m) return null;
      return parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16);
    }

    function resize() {
      w = cvs.clientWidth; h = cvs.clientHeight;
      cvs.width = Math.floor(w * dpr);
      cvs.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var target = clamp(Math.floor((w * h) / 18000), 34, 110);
      nodes = [];
      for (var i = 0; i < target; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.5 + 0.7,
          hot: Math.random() < 0.16   // a few nodes glow in the accent colour
        });
      }
    }

    function spawnPulse() {
      if (pulses.length > 5 || nodes.length < 2) return;
      var a = nodes[(Math.random() * nodes.length) | 0];
      var candidates = nodes.filter(function (b) {
        if (b === a) return false;
        var dx = a.x - b.x, dy = a.y - b.y;
        return dx * dx + dy * dy < LINK * LINK;
      });
      if (!candidates.length) return;
      pulses.push({ a: a, b: candidates[(Math.random() * candidates.length) | 0], t: 0 });
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      var i, j, n;

      // move
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;

        // gentle push away from the pointer
        var dx = n.x - mouse.x, dy = n.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 16000 && d2 > 0.1) {
          var f = (16000 - d2) / 16000 * 0.9;
          var d = Math.sqrt(d2);
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }
      }

      // links
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var ddx = a.x - b.x, ddy = a.y - b.y;
          var dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist > LINK) continue;
          var alpha = (1 - dist / LINK) * 0.2;
          ctx.strokeStyle = 'rgba(' + colors.node + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // signal pulses
      for (i = pulses.length - 1; i >= 0; i--) {
        var p = pulses[i];
        p.t += 0.016;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        var px = p.a.x + (p.b.x - p.a.x) * p.t;
        var py = p.a.y + (p.b.y - p.a.y) * p.t;
        var fade = Math.sin(p.t * Math.PI);

        ctx.strokeStyle = 'rgba(' + colors.accent + ',' + (fade * 0.5).toFixed(3) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.a.x, p.a.y);
        ctx.lineTo(px, py);
        ctx.stroke();

        ctx.fillStyle = 'rgba(' + colors.accent + ',' + fade.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodes
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.hot
          ? 'rgba(' + colors.accent + ',0.75)'
          : 'rgba(' + colors.node + ',0.35)';
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }

    readColors();
    resize();
    frame();
    setInterval(spawnPulse, 700);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(resize, 180);
    });
    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY;
    }, { passive: true });
    window.addEventListener('mouseout', function () { mouse.x = mouse.y = -9999; });
    document.addEventListener('themechange', readColors);
  }

  /* ======================================================================
     NAV
     ====================================================================== */
  function nav() {
    var header = $('#nav');
    var links = $('#navLinks');
    var burger = $('#burger');
    var anchors = $$('#navLinks a[href^="#"]');
    var sections = anchors
      .map(function (a) { return $(a.getAttribute('href')); })
      .filter(Boolean);

    var lastY = window.scrollY;

    function onScroll() {
      var y = window.scrollY;
      header.classList.toggle('stuck', y > 20);
      // hide on the way down, reveal on the way up — but never near the top
      header.classList.toggle('hide', y > 420 && y > lastY && !links.classList.contains('open'));
      lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // scrollspy
    if (sections.length && 'IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          anchors.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }

    function closeMenu() {
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
    }

    if (burger) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('is-locked', open);
      });
      anchors.forEach(function (a) { a.addEventListener('click', closeMenu); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    }
  }

  /* ======================================================================
     SCROLL PROGRESS
     ====================================================================== */
  function progress() {
    var bar = $('#scrollBar');
    if (!bar) return;
    function tick() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? clamp(window.scrollY / max, 0, 1) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* ======================================================================
     REVEAL + BARS + COUNTERS
     ====================================================================== */
  function reveal() {
    var items = $$('[data-reveal]');
    items.forEach(function (el) {
      el.style.setProperty('--d', (el.getAttribute('data-reveal-delay') || 0) + 'ms');
    });

    if (!('IntersectionObserver' in window) || REDUCED) {
      items.forEach(function (el) { el.classList.add('in'); });
      $$('.bar').forEach(fillBar);
      $$('.count').forEach(function (el) {
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);

        $$('.bar', en.target).forEach(fillBar);
        if (en.target.classList.contains('bar')) fillBar(en.target);
        $$('.count', en.target).forEach(countUp);
        if (en.target.classList.contains('count')) countUp(en.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });

    // bars/counters that are not themselves reveal targets
    $$('.bar').forEach(function (b) { io.observe(b); });
    $$('.count').forEach(function (c) { io.observe(c); });
  }

  function fillBar(bar) {
    var span = bar.firstElementChild;
    if (!span || bar.dataset.filled) return;
    bar.dataset.filled = '1';
    span.style.width = (bar.getAttribute('data-bar') || 0) + '%';
  }

  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1500, t0 = performance.now();

    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);      // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ======================================================================
     TYPEWRITER — types a phrase, holds, deletes, moves on
     ====================================================================== */
  function typewriter() {
    var el = $('#typed');
    if (!el) return;
    var phrases = CFG.typedPhrases || [];
    if (!phrases.length) return;

    if (REDUCED) { el.textContent = phrases[0]; return; }

    var i = 0, char = 0, deleting = false;

    (function tick() {
      var full = phrases[i];
      char += deleting ? -1 : 1;
      el.textContent = full.slice(0, char);

      var wait = deleting ? 34 : 62 + Math.random() * 48;  // human-ish jitter

      if (!deleting && char === full.length) {
        deleting = true;
        wait = 1900;                       // read it before it disappears
      } else if (deleting && char === 0) {
        deleting = false;
        i = (i + 1) % phrases.length;
        wait = 380;
      }
      setTimeout(tick, wait);
    })();
  }

  /* ======================================================================
     TERMINAL — types the boot log line by line
     ====================================================================== */
  function terminal() {
    var el = $('#termBody');
    if (!el) return;
    var lines = CFG.terminalLines || [];
    if (!lines.length) return;

    if (REDUCED) {
      el.innerHTML = lines.map(function (l) {
        return '<span class="t-' + l.type + '">' + esc(l.text) + '</span>';
      }).join('\n');
      return;
    }

    var li = 0;

    function nextLine() {
      if (li >= lines.length) return;
      var line = lines[li];
      var span = document.createElement('span');
      span.className = 't-' + line.type;
      el.appendChild(span);
      el.appendChild(document.createTextNode('\n'));

      // command lines type character by character; output lines just appear
      if (line.type === 'cmd' && line.text) {
        var c = 0;
        (function typeChar() {
          span.textContent = line.text.slice(0, ++c);
          if (c < line.text.length) {
            setTimeout(typeChar, 42);
          } else {
            li++;
            setTimeout(nextLine, 340);
          }
        })();
      } else if (line.type === 'cmd' && !line.text) {
        // trailing prompt: leave a blinking cursor sitting there
        var cur = document.createElement('i');
        cur.className = 't-cur';
        span.appendChild(cur);
        li++;
      } else {
        span.textContent = line.text;
        li++;
        setTimeout(nextLine, 260);
      }
    }

    // start once the hero has settled
    setTimeout(nextLine, 700);
  }

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  /* ======================================================================
     SCRAMBLE — headings decode themselves the first time they scroll in
     ====================================================================== */
  function scramble() {
    var targets = $$('[data-scramble]');
    if (!targets.length || REDUCED || !('IntersectionObserver' in window)) return;

    var GLYPHS = '!<>-_\\/[]{}—=+*^?#01';

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        run(en.target);
      });
    }, { threshold: 0.6 });

    targets.forEach(function (t) { io.observe(t); });

    function run(el) {
      var final = el.textContent;
      var frame = 0;
      var queue = final.split('').map(function (ch, i) {
        return { ch: ch, start: Math.floor(i * 1.6), end: Math.floor(i * 1.6) + 12 };
      });

      (function step() {
        var out = '', done = 0;
        for (var i = 0; i < queue.length; i++) {
          var q = queue[i];
          if (frame >= q.end) { out += q.ch; done++; }
          else if (frame >= q.start) { out += GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
          else { out += ' '; }
        }
        el.textContent = out;
        frame++;
        if (done < queue.length) requestAnimationFrame(step);
        else el.textContent = final;
      })();
    }
  }

  /* ======================================================================
     TILT + CARD SHINE
     ====================================================================== */
  function tilt() {
    // pointer-tracked shine on every card (cheap, CSS does the drawing)
    $$('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    if (!FINE_POINTER || REDUCED) return;

    $$('[data-tilt]').forEach(function (el) {
      var MAX = 7;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          'perspective(900px) rotateX(' + (-py * MAX).toFixed(2) + 'deg) rotateY(' +
          (px * MAX).toFixed(2) + 'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ======================================================================
     MAGNETIC BUTTONS
     ====================================================================== */
  function magnetic() {
    if (!FINE_POINTER || REDUCED) return;

    $$('.magnetic').forEach(function (el) {
      var STRENGTH = 0.28;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (dx * STRENGTH).toFixed(1) + 'px,' +
                                            (dy * STRENGTH).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ======================================================================
     CONTACT — wire up WhatsApp, email and socials from config
     ====================================================================== */
  function contact() {
    var number = String(CFG.whatsappNumber || '').replace(/\D/g, '');
    var message = CFG.whatsappMessage || 'Hi!';
    var href = number
      ? 'https://wa.me/' + number + '?text=' + encodeURIComponent(message)
      : null;

    $$('[data-whatsapp]').forEach(function (a) {
      if (href) {
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      } else {
        // no number configured yet — say so instead of opening a dead chat
        a.href = '#contact';
        a.addEventListener('click', function (e) {
          e.preventDefault();
          toast('WhatsApp number not set yet — add it in assets/js/config.js');
        });
      }
    });

    var preview = $('#msgPreview');
    if (preview) preview.textContent = message;

    // A social link with nothing configured is removed rather than left
    // pointing at "#" — a dead link on a portfolio is worse than no link.
    var socials = {
      email:    CFG.email ? 'mailto:' + CFG.email : '',
      github:   CFG.github || '',
      linkedin: CFG.linkedin || ''
    };

    Object.keys(socials).forEach(function (key) {
      $$('[data-social="' + key + '"]').forEach(function (a) {
        if (socials[key]) a.href = socials[key];
        else a.remove();
      });
    });
  }

  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(function () { toastEl.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 4200);
  }

  /* ======================================================================
     MISC
     ====================================================================== */
  function misc() {
    // duplicate the marquee content so the -50% loop is seamless
    var track = $('#marqueeTrack');
    if (track) track.innerHTML += track.innerHTML;

    // floating whatsapp appears once you are past the hero
    var float = $('.wa-float');
    if (float) {
      var onScroll = function () {
        float.classList.toggle('show', window.scrollY > window.innerHeight * 0.65);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    var year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ======================================================================
     GO
     ====================================================================== */
  theme();

  function start() {
    network();
    nav();
    progress();
    cursor();
    tilt();
    magnetic();
    contact();
    misc();
    scramble();

    boot().then(function () {
      reveal();
      typewriter();
      terminal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
