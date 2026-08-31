/* ==========================================================================
   Allord Archard — portfolio
   Vanilla JS. No dependencies.

     boot()        loading sequence
     theme()       dark / light with persistence
     cursor()      custom pointer
     network()     quiet canvas node-graph background
     nav()         sticky header, scrollspy, mobile drawer
     progress()    scroll progress bar
     reveal()      IntersectionObserver entrances
     typewriter()  hero type / delete loop
     terminal()    boot log that types itself
     avatar()      falls back to a monogram when no photo is present
     contact()     WhatsApp links with a pre-written message
     misc()        floating button, year
   ========================================================================== */

(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ====================== BOOT ======================
     A small terminal that boots the site: the command types itself,
     each step reports back with a dot-leader and a green "ok", and a
     meter counts up alongside. A click or any key skips straight to the
     end — a loader nobody can escape is just a wall.

     T below is the whole budget. With the default 20-character command
     and four steps it runs to about four seconds:

       typing   20 x 55ms   = 1100
       pause                =  350
       steps     4 x 510ms  = 2040
       ready hold           =  500
                              -----
                              ~3990ms   then a 0.55s fade

     Change CHAR or STEP to speed it up or slow it down; adding a step in
     config.js adds STEP_OK + STEP_GAP to the total.
     ====================================================== */
  var T = {
    CHAR:      55,   // ms per character of the typed command
    AFTER_CMD: 350,  // beat between the command and the first step
    STEP_OK:   310,  // how long a step sits pending before it reports "ok"
    STEP_GAP:  200,  // beat between one step reporting and the next appearing
    READY:     500   // how long "ready." holds before the screen clears
  };

  function boot() {
    var el = $('#boot');
    if (!el) return Promise.resolve();

    var log = $('#bootLog'), bar = $('#bootBar'), pct = $('#bootPct');
    var cmd = CFG.bootCommand || './launch';
    var steps = CFG.bootSteps || [];
    var done = false;

    function finish() {
      if (done) return;
      done = true;
      el.classList.add('done');
      document.body.classList.remove('is-locked');
      removeEventListener('keydown', skip);
      el.removeEventListener('click', skip);
      setTimeout(function () { el.remove(); }, 650);
    }

    var resolveOnce;
    function skip() { finish(); if (resolveOnce) resolveOnce(); }

    if (REDUCED) { finish(); return Promise.resolve(); }

    document.body.classList.add('is-locked');
    addEventListener('keydown', skip);
    el.addEventListener('click', skip);

    function meter(p) {
      bar.style.width = p + '%';
      pct.textContent = p + '%';
    }

    // one "label ......... ok" row, with the status landing a beat later
    function addStep(label, onDone) {
      var row = document.createElement('div');
      row.className = 'boot__row';
      row.innerHTML =
        '<span class="boot__k"></span><span class="boot__lead"></span><span class="boot__s">ok</span>';
      row.firstChild.textContent = label;
      log.appendChild(row);
      requestAnimationFrame(function () { row.classList.add('in'); });
      setTimeout(function () { row.classList.add("ok"); onDone(); }, T.STEP_OK);
    }

    return new Promise(function (resolve) {
      resolveOnce = resolve;

      var line = document.createElement('div');
      line.className = 'boot__cmd';
      log.appendChild(line);

      var c = 0;
      (function typeCmd() {
        if (done) return;
        line.textContent = cmd.slice(0, ++c);
        if (c < cmd.length) return setTimeout(typeCmd, T.CHAR);
        setTimeout(runSteps, T.AFTER_CMD);
      })();

      var i = 0;
      function runSteps() {
        if (done) return;
        if (i >= steps.length) {
          meter(100);
          var ready = document.createElement('div');
          ready.className = 'boot__ready';
          ready.textContent = 'ready.';
          log.appendChild(ready);
          return setTimeout(function () { finish(); resolve(); }, T.READY);
        }
        addStep(steps[i], function () {
          i++;
          meter(Math.round((i / steps.length) * 100));
          setTimeout(runSteps, T.STEP_GAP);
        });
      }
    });
  }

  /* ====================== THEME ====================== */
  function theme() {
    var root = document.documentElement;
    var btn = $('#themeToggle');
    var KEY = 'aa-theme';

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* private mode */ }

    // dark is the intended default; only an explicit choice overrides it
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);

    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      document.dispatchEvent(new CustomEvent('themechange'));
    });
  }

  /* ====================== CURSOR ====================== */
  function cursor() {
    if (!FINE_POINTER || REDUCED) return;

    var dot = $('#cursorDot'), ring = $('#cursorRing');
    if (!dot || !ring) return;

    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('cursor-on');
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-on');
    });

    (function loop() {
      rx += (mx - rx) * 0.17;
      ry += (my - ry) * 0.17;
      dot.style.transform  = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseover', function (e) {
      document.body.classList.toggle('cursor-hover',
        !!e.target.closest('a, button, [data-cursor], .card'));
    });
  }

  /* ====================== BACKGROUND ======================
     A slow node graph. Deliberately sparse — it should read as texture,
     not as something competing with the content.
     ====================================================== */
  function network() {
    var cvs = $('#bgCanvas');
    if (!cvs || REDUCED) { if (cvs) cvs.style.display = 'none'; return; }

    var ctx = cvs.getContext('2d');
    var dpr = Math.min(devicePixelRatio || 1, 2);
    var w = 0, h = 0, nodes = [];
    var LINK = 150;
    var colors = { accent: '34,211,238', node: '148,163,184' };

    function toRgb(hex) {
      var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return m ? parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) : null;
    }

    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      colors.accent = toRgb(cs.getPropertyValue('--accent').trim()) || '34,211,238';
      colors.node = document.documentElement.getAttribute('data-theme') === 'light'
        ? '71,85,105' : '148,163,184';
    }

    function resize() {
      w = cvs.clientWidth; h = cvs.clientHeight;
      cvs.width = Math.floor(w * dpr);
      cvs.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = clamp(Math.floor((w * h) / 34000), 20, 55);
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
          r: Math.random() * 1.2 + 0.6
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      var i, j, n;

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }

      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d > LINK) continue;
          ctx.strokeStyle = 'rgba(' + colors.node + ',' + ((1 - d / LINK) * 0.14).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + colors.node + ',0.3)';
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }

    readColors();
    resize();
    frame();

    var rt;
    addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 180); });
    document.addEventListener('themechange', readColors);
  }

  /* ====================== NAV ====================== */
  function nav() {
    var header = $('#nav'), links = $('#navLinks'), burger = $('#burger');
    var anchors = $$('#navLinks a[href^="#"]');
    var sections = anchors.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
    var lastY = scrollY;

    function onScroll() {
      var y = scrollY;
      header.classList.toggle('stuck', y > 20);
      header.classList.toggle('hide', y > 420 && y > lastY && !links.classList.contains('open'));
      lastY = y;
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

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
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    }
  }

  /* ====================== PROGRESS ====================== */
  function progress() {
    var bar = $('#scrollBar');
    if (!bar) return;
    function tick() {
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? clamp(scrollY / max, 0, 1) * 100 : 0) + '%';
    }
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
    tick();
  }

  /* ====================== REVEAL ====================== */
  function reveal() {
    var items = $$('[data-reveal]');
    items.forEach(function (el) {
      el.style.setProperty('--d', (el.getAttribute('data-reveal-delay') || 0) + 'ms');
    });

    if (!('IntersectionObserver' in window) || REDUCED) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ====================== TYPEWRITER ====================== */
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

      var wait = deleting ? 34 : 62 + Math.random() * 48;   // human-ish jitter

      if (!deleting && char === full.length) {
        deleting = true;
        wait = 2000;                       // long enough to actually read it
      } else if (deleting && char === 0) {
        deleting = false;
        i = (i + 1) % phrases.length;
        wait = 380;
      }
      setTimeout(tick, wait);
    })();
  }

  /* ====================== TERMINAL ====================== */
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

    (function nextLine() {
      if (li >= lines.length) return;
      var line = lines[li];
      var span = document.createElement('span');
      span.className = 't-' + line.type;
      el.appendChild(span);
      el.appendChild(document.createTextNode('\n'));

      if (line.type === 'cmd' && line.text) {
        // commands type character by character
        var c = 0;
        (function typeChar() {
          span.textContent = line.text.slice(0, ++c);
          if (c < line.text.length) setTimeout(typeChar, 42);
          else { li++; setTimeout(nextLine, 340); }
        })();
      } else if (line.type === 'cmd') {
        // trailing prompt: leave a blinking cursor sitting there
        var cur = document.createElement('i');
        cur.className = 't-cur';
        span.appendChild(cur);
        li++;
      } else {
        // output just appears, the way it does in a real terminal
        span.textContent = line.text;
        li++;
        setTimeout(nextLine, 260);
      }
    })();
  }

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  /* ====================== AVATAR ======================
     Drop a photo at assets/img/allord.jpg and it shows. Until then the
     monogram behind it does, so the layout never breaks.
     ====================================================== */
  function avatar() {
    var img = $('#avatarImg');
    var webp = $('#avatarWebp');
    if (!img) return;

    // no photo configured: drop the <picture> before it requests anything, so
    // there is no 404 in the console — the monogram behind it shows instead
    if (!CFG.photo) {
      var pic = img.parentNode;
      (pic && pic.tagName === 'PICTURE' ? pic : img).remove();
      return;
    }

    // if the file is missing or fails to decode, fall back to the monogram
    img.addEventListener('error', function () {
      var pic = img.parentNode;
      (pic && pic.tagName === 'PICTURE' ? pic : img).remove();
    });

    if (webp && CFG.photoWebp) webp.srcset = CFG.photoWebp;
    else if (webp) webp.remove();

    img.src = CFG.photo;
  }

  /* ====================== CONTACT ====================== */
  function contact() {
    var number = String(CFG.whatsappNumber || '').replace(/\D/g, '');
    var message = CFG.whatsappMessage || 'Hi!';
    var href = number ? 'https://wa.me/' + number + '?text=' + encodeURIComponent(message) : null;

    $$('[data-whatsapp]').forEach(function (a) {
      if (href) {
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      } else {
        a.href = '#contact';
        a.addEventListener('click', function (e) {
          e.preventDefault();
          toast('WhatsApp number not set yet — add it in assets/js/config.js');
        });
      }
    });

    var preview = $('#msgPreview');
    if (preview) preview.textContent = message;

    // a link with nothing configured is removed, not left pointing at "#"
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

  /* ====================== MISC ====================== */
  function misc() {
    var float = $('.wa-float');
    if (float) {
      var onScroll = function () {
        float.classList.toggle('show', scrollY > innerHeight * 0.7);
      };
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    var year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ====================== GO ====================== */
  theme();

  function start() {
    network();
    nav();
    progress();
    cursor();
    avatar();
    contact();
    misc();

    boot().then(function () {
      reveal();
      typewriter();
      terminal();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

})();
