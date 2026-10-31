/* ==========================================================================
   Allord Archard portfolio
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
     motion()      split titles, scrub text, counters, spotlight,
                   magnetic buttons, pinned gallery, showcase tilt,
                   story, parallax, marquee (all driven from one
                   scroll loop; see the MOTION block)
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
     end; a loader nobody can escape is just a wall.

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
     A slow node graph. Deliberately sparse; it should read as texture,
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
    if (!header) return;

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
    var items = $$('[data-reveal], [data-split]');
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
    // there is no 404 in the console; the monogram behind it shows instead
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
      // a project page can pre-write its own message, naming the project
      var own = a.getAttribute('data-wa-text');
      if (href) {
        a.href = own ? 'https://wa.me/' + number + '?text=' + encodeURIComponent(own) : href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      } else {
        a.href = '#contact';
        a.addEventListener('click', function (e) {
          e.preventDefault();
          toast('WhatsApp number not set yet; add it in assets/js/config.js');
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

  /* ====================== MOTION ======================
     Everything that moves with the page. One passive scroll listener
     schedules one frame; each effect registers an update(y) that reads
     layout it measured on resize, so nothing forces a reflow per frame.
     Under reduced motion only the static parts (letters, words, numbers)
     are set up, already in their final state.
     ====================================================== */
  var updaters = [];
  var measures = [];
  var lastScroll = -1;

  function onFrame() {
    var y = scrollY;
    if (y !== lastScroll) {
      for (var i = 0; i < updaters.length; i++) updaters[i](y);
      lastScroll = y;
    }
  }
  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; onFrame(); });
  }
  function remeasure() {
    measures.forEach(function (m) { m(); });
    lastScroll = -1;
    onFrame();
  }

  // page offset of an element, independent of current transforms
  function pageTop(el) {
    var y = 0;
    while (el) { y += el.offsetTop; el = el.offsetParent; }
    return y;
  }

  /* letters: wrap each character so the title can rise in, word by word */
  function split() {
    $$('[data-split]').forEach(function (el) {
      var text = el.textContent.trim();
      var i = 0;
      el.setAttribute('aria-label', text);
      el.innerHTML = text.split(' ').map(function (word) {
        return '<span class="w" aria-hidden="true">' + word.split('').map(function (c) {
          return '<span class="ch" style="--i:' + (i++) + '">' + esc(c) + '</span>';
        }).join('') + '</span>';
      }).join(' ');
      if (REDUCED) el.classList.add('in');
    });
  }

  /* words: a paragraph that lights up word by word as it scrolls through */
  function scrub() {
    $$('[data-scrub]').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      // numbers carry the accent, plus any words listed in data-scrub-hot
      var extra = (el.getAttribute('data-scrub-hot') || '').toLowerCase().split(',');
      el.innerHTML = words.map(function (w) {
        var hot = /\d/.test(w) || extra.indexOf(w.toLowerCase().replace(/[.,:;"]/g, '')) > -1;
        return '<span class="wd' + (hot ? ' hot' : '') + '">' + esc(w) + '</span>';
      }).join(' ');
      var spans = $$('.wd', el);
      if (REDUCED) { spans.forEach(function (s) { s.classList.add('on'); }); return; }

      var top = 0, h = 0;
      measures.push(function () { top = pageTop(el); h = el.offsetHeight; });
      updaters.push(function (y) {
        // starts when the paragraph's top reaches 85% of the screen, done at 35%
        var start = top - innerHeight * 0.85;
        var end = top + h - innerHeight * 0.35;
        var p = clamp((y - start) / (end - start), 0, 1);
        var lit = Math.round(p * spans.length);
        for (var i = 0; i < spans.length; i++) spans[i].classList.toggle('on', i < lit);
      });
    });
  }

  /* numbers: count up once, the first time they are seen */
  function counters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    function fmt(n, el) { return Math.round(n).toLocaleString('en-US') + (el.getAttribute('data-suffix') || ''); }
    if (REDUCED || !('IntersectionObserver' in window)) return;   // the HTML already holds the final value
    els.forEach(function (el) { el.textContent = fmt(0, el); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = +el.getAttribute('data-count'), t0 = performance.now(), dur = 1400;
        (function tick(now) {
          var p = clamp((now - t0) / dur, 0, 1);
          el.textContent = fmt(to * (1 - Math.pow(1 - p, 4)), el);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* pointer effects: a spotlight inside cards, buttons that lean toward the cursor */
  function pointer() {
    if (!FINE_POINTER || REDUCED) return;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.spot');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.32;
        b.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });

    // the hero terminal leans gently toward the pointer
    var panel = $('.hero__panel .terminal');
    if (panel) {
      panel.style.transition = 'transform 0.6s var(--ease), border-color 0.4s var(--ease)';
      document.addEventListener('pointermove', function (e) {
        if (scrollY > innerHeight) return;
        var x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
        panel.style.transform = 'perspective(1200px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 6) + 'deg)';
      }, { passive: true });
    }
  }

  /* the pinned gallery: vertical scroll drives the cards sideways */
  function hscroll() {
    var wrap = $('[data-hscroll]');
    if (!wrap) return;
    var track = $('.hscroll__track', wrap);
    var bar = $('.hscroll__bar span', wrap);
    var count = $('.hscroll__count', wrap);
    var cards = $$('.fcard', track);
    var top = 0, dist = 0, pinned = false;

    measures.push(function () {
      pinned = !REDUCED && innerWidth > 780 && innerHeight > 560;
      wrap.classList.toggle('is-static', !pinned);
      if (!pinned) { wrap.style.height = ''; track.style.transform = ''; return; }
      dist = Math.max(0, track.scrollWidth - innerWidth);
      wrap.style.height = (innerHeight + dist) + 'px';
      top = pageTop(wrap);
    });

    updaters.push(function (y) {
      if (!pinned) return;
      var p = dist ? clamp((y - top) / dist, 0, 1) : 0;
      track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      if (count) {
        var n = Math.min(cards.length, Math.round(p * (cards.length - 1)) + 1);
        count.textContent = (n < 10 ? '0' : '') + n + ' / ' + (cards.length < 10 ? '0' : '') + cards.length;
      }
      // each card's visual drifts a little against the movement
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i], v = c.firstElementChild;
        var mid = c.offsetLeft - p * dist + c.offsetWidth / 2 - innerWidth / 2;
        v.style.setProperty('--dx', (mid * -0.05).toFixed(1) + 'px');
      }
    });
  }

  /* project hero: the device starts tipped back and settles flat */
  function showcase() {
    var el = $('[data-showcase] .pp-show__inner');
    if (!el || REDUCED) return;
    var top = 0;
    measures.push(function () { top = pageTop(el); });
    updaters.push(function (y) {
      var p = clamp((y - (top - innerHeight * 0.95)) / (innerHeight * 0.75), 0, 1);
      el.style.setProperty('--t', (1 - p).toFixed(3));
    });
  }

  /* project story: whichever step sits in the middle of the screen picks the image */
  function story() {
    var root = $('[data-story]');
    if (!root || !('IntersectionObserver' in window)) return;
    var steps = $$('.story__step', root);
    var imgs = $$('.story__stage .story__img', root);
    var dots = $$('.story__dots span', root);
    function show(i) {
      steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      imgs.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      dots.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    }
    show(0);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) show(+en.target.getAttribute('data-step'));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* gentle parallax: the glow drifts, screens float at their own pace */
  function parallax() {
    if (REDUCED) return;
    var glow = $('.glow');
    var items = $$('[data-parallax]').map(function (el) {
      return { el: el, f: +el.getAttribute('data-parallax'), top: 0, h: 0 };
    });
    measures.push(function () {
      items.forEach(function (it) { it.top = pageTop(it.el); it.h = it.el.offsetHeight; });
    });
    updaters.push(function (y) {
      if (glow) glow.style.transform = 'translate3d(0,' + (y * -0.12).toFixed(1) + 'px,0)';
      items.forEach(function (it) {
        var d = (y + innerHeight / 2) - (it.top + it.h / 2);
        it.el.style.setProperty('--py', (d * it.f).toFixed(1) + 'px');
      });
    });
  }

  /* marquee: drifts on its own, runs faster and leans while the page scrolls */
  function marquee() {
    var tracks = $$('.marquee__track');
    if (!tracks.length || REDUCED) return;
    var x = 0, vel = 0, prevY = scrollY;
    (function loop() {
      var dy = scrollY - prevY; prevY = scrollY;
      vel += (dy - vel) * 0.1;
      x -= 0.45 + Math.abs(vel) * 0.35;
      tracks.forEach(function (t) {
        var half = t.scrollWidth / 2;
        if (half && -x >= half) x += half;
        t.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
        t.style.setProperty('--skew', clamp(-vel * 0.4, -10, 10).toFixed(2) + 'deg');
      });
      requestAnimationFrame(loop);
    })();
  }

  function motion() {
    split();
    scrub();
    counters();
    pointer();
    hscroll();
    showcase();
    story();
    parallax();
    marquee();

    remeasure();
    addEventListener('scroll', schedule, { passive: true });
    var rt;
    addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(remeasure, 120); });
    // images and fonts change heights after load
    addEventListener('load', remeasure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
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
    motion();

    boot().then(function () {
      reveal();
      typewriter();
      terminal();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

})();
