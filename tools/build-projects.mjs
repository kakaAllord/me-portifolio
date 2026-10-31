#!/usr/bin/env node
/* ==========================================================================
   Builds the project pages from tools/projects.mjs.

     node tools/build-projects.mjs

   Writes:
     projects/<slug>/index.html     one page per project
     index.html                     the cards between the projects:* markers
     sitemap.xml                    home + every project page

   No dependencies. The output is plain HTML that is committed, so GitHub
   Pages serves it as is.
   ========================================================================== */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, featuredCount } from './projects.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://kakaallord.github.io/me-portifolio/';
const WA = '255795977630';
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const pad = (n) => String(n).padStart(2, '0');
const label = (p) => p.short || p.name;

const ICON = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
  out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2 22l5.34-1.4a9.8 9.8 0 004.7 1.2h.01c5.44 0 9.86-4.42 9.86-9.86 0-2.63-1.03-5.11-2.89-6.97A9.8 9.8 0 0012.04 2zm5.43 12.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z"/></svg>'
};

/* ---------------------------------------------------------------- visuals */

function scene(v) {
  switch (v.v) {
    case 'flip':
      return `<div class="v v-flip" data-v="flip">
        <div class="v-flip__label"><i></i><b>Focus</b> session 2 of 4</div>
        <div class="v-flip__row"><div class="fc"></div><div class="fc"></div><span class="v-flip__colon"></span><div class="fc"></div><div class="fc"></div></div>
        <div class="v-flip__bar"><span></span></div>
        <div class="v-flip__chips"><span>Countdown</span><span class="on">Pomodoro</span><span>Stopwatch</span></div>
      </div>`;

    case 'radar': {
      const devs = v.devices.map(([name, deg, r], i) => {
        const a = deg * Math.PI / 180;
        const x = (50 + r * Math.cos(a)).toFixed(1), y = (50 + r * Math.sin(a)).toFixed(1);
        return `<span class="v-radar__dev" style="left:${x}%;top:${y}%;--dl:${(i * 0.6).toFixed(1)}s"><i></i>${esc(name)}</span>`;
      }).join('');
      const [, deg, r] = v.devices[0];
      const a = deg * Math.PI / 180;
      return `<div class="v v-radar v-grid" data-v="radar">
        <div class="v-radar__field">
          <span class="v-radar__ring"></span><span class="v-radar__ring"></span><span class="v-radar__ring"></span>
          <div class="v-radar__sweep"></div>
          ${devs}
          <span class="v-radar__packet" style="--x:${(50 + r * Math.cos(a)).toFixed(1)}%;--y:${(50 + r * Math.sin(a)).toFixed(1)}%"></span>
          <span class="v-radar__me">YOU</span>
        </div>
        <span class="v-radar__badge">TLS 1.3 · paired</span>
        <div class="v-radar__card">
          <div class="v-radar__file">holiday-video.mp4 <span>1.2 GB</span></div>
          <div class="v-radar__prog"><span></span></div>
          <div class="v-radar__ok">✓ BLAKE3 verified, saved</div>
        </div>
      </div>`;
    }

    case 'docs': {
      const docs = [['DOCX', '#2b6cd9', -14, -9], ['XLSX', '#16a34a', -6, -4], ['PPTX', '#ea580c', 2, 1], ['MD', '#475569', 9, 6], ['PDF', '#dc2626', 16, 11]];
      return `<div class="v v-docs v-grid" data-v="docs">
        <div class="v-docs__fan">${docs.map(([t, c, r, tx], i) =>
          `<div class="v-doc" style="--tag:${c};--r:${r}deg;--tx:${tx}cqw;--dl:${(i * 1.5).toFixed(1)}s"><b>${t}</b></div>`).join('')}</div>
        <div class="v-docs__panel">
          <div class="v-docs__row"><b style="background:#2b6cd9">DOCX</b><em>→</em><b style="background:#dc2626">PDF</b></div>
          <div class="v-docs__prog"><span></span></div>
          <div class="v-docs__done">✓ Saved to your library</div>
          <div class="v-docs__scripts"><span lang="ar">العربية</span><span lang="zh" style="--dl:-1s">中文</span><span lang="hi" style="--dl:-2s">हिन्दी</span><span lang="am" style="--dl:-3s">አማርኛ</span><span lang="he" style="--dl:-4s">עברית</span></div>
        </div>
      </div>`;
    }

    case 'pos':
      return `<div class="v v-pos v-grid" data-v="pos">
        <div class="v-pos__float v-pos__float--a">Mauzo ya leo<b>TSh 1,284,500</b></div>
        <div class="v-pos__float v-pos__float--b">Stoo inaisha<b>Sukari 1kg · 6 zimebaki</b></div>
        <div class="v-phone"><div class="v-phone__screen">
          <div class="v-pos__head">Duka la Mama Neema<b>Mauzo mapya</b></div>
          <div class="v-pos__scan"></div>
          <div class="v-pos__rows">${v.rows.map(([n, p]) =>
            `<div class="v-pos__row" data-price="${p}"><span>${esc(n)}</span><span>${p.toLocaleString('en-US')}</span></div>`).join('')}</div>
          <div class="v-pos__total">Jumla <b data-total>TSh 0</b></div>
          <div class="v-pos__btn" data-done="Imeuzwa ✓">Uza</div>
        </div></div>
      </div>`;

    case 'flow':
      return `<div class="v v-flow" data-v="flow">
        <div class="v-flow__track">
          <div class="v-flow__line"><span></span></div>
          ${v.nodes.map(([t, s], i) => `<div class="v-flow__node"><span class="v-flow__dot">${i + 1}</span><b>${esc(t)}</b><small>${esc(s)}</small></div>`).join('')}
        </div>
        <div class="v-flow__card"><i>${v.card[0]}</i><div><b>${esc(v.card[1])}</b><span>${esc(v.card[2])}</span></div>
          <span class="v-flow__status" data-steps="${esc(v.steps)}">${esc(v.steps.split('|')[0])}</span></div>
      </div>`;

    case 'seis':
      return `<div class="v v-seis" data-v="seis">
        <div class="v-seis__alert"><b>Elephants near S-02</b>Alert sent to the village and the ranger post. Drone on its way.</div>
      </div>`;

    case 'eq':
      return `<div class="v v-eq" data-v="eq">
        <div class="v-eq__note">best of 170 rules<br><b>+0.354 R</b> a trade on the holdout<br>only 71 trades, lost on validation<br><s>✕ rejected</s></div>
      </div>`;
  }
  return '';
}

// a screenshot or scene inside its frame; `base` is the path back to the site root
function frame(f, base, { alt = '', eager = false } = {}) {
  const load = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  if (f.phone) {
    return `<figure class="frame frame--phone"><img src="${base}assets/img/projects/${f.phone}" alt="${esc(alt)}" ${load} decoding="async" /></figure>`;
  }
  const bar = `<div class="frame__bar"><i></i><i></i><i></i><span>${esc(f.bar || '')}</span></div>`;
  if (f.v) return `<figure class="frame frame--window">${f.bar ? bar : bar.replace('<span></span>', '')}${scene(f)}</figure>`;
  return `<figure class="frame frame--window">${bar}<img src="${base}assets/img/projects/${f.img}" alt="${esc(alt)}" ${load} decoding="async" /></figure>`;
}

/* ---------------------------------------------------------------- page */

function page(p, i) {
  const base = '../../';
  const next = projects[(i + 1) % projects.length];
  const url = `${SITE}projects/${p.slug}/`;
  const ogImg = p.hero.img ? `${SITE}assets/img/projects/${p.hero.img}` : `${SITE}assets/img/og.jpg`;
  const waText = `Hi Allord! I just saw ${label(p)} on your portfolio. I'd like something like it built. Are you available?`;
  const title = `${p.name}, built by Allord Archard`;

  const links = p.links.map((l) => l.live
    ? `<a class="btn btn--p magnetic" href="${l.href}" target="_blank" rel="noopener" data-cursor="link">${ICON.out}<span>${esc(l.label)}</span></a>`
    : `<a class="btn btn--ghost magnetic" href="${l.href}" target="_blank" rel="noopener" data-cursor="link">${ICON.code}<span>${esc(l.label)}</span></a>`).join('\n        ');

  const story = p.story ? `
<section class="section pp-story" aria-labelledby="story-h">
  <div class="container">
    <h2 class="section-title" id="story-h" data-reveal><i>03</i> A closer look</h2>
    <div class="story${p.phoneStory ? ' story--phone' : ''}" data-story>
      <div class="story__steps">
        ${p.story.map(([t, d, img], k) => `<article class="story__step" data-step="${k}">
          <span class="story__n">${pad(k + 1)}</span>
          <h3>${esc(t)}</h3>
          <p>${esc(d)}</p>
          <div class="story__inline">${frame(p.phoneStory ? { phone: img } : { img, bar: '' }, base, { alt: t })}</div>
        </article>`).join('\n        ')}
      </div>
      <div class="story__stage" aria-hidden="true">
        <div class="story__sticky">
          ${p.phoneStory
            ? `<figure class="frame frame--phone story__frame">${p.story.map(([t, , img], k) => `<img class="story__img${k ? '' : ' on'}" src="${base}assets/img/projects/${img}" alt="" loading="lazy" decoding="async" />`).join('')}</figure>`
            : `<figure class="frame frame--window story__frame"><div class="frame__bar"><i></i><i></i><i></i><span>${esc(p.name)}</span></div><div class="story__imgs">${p.story.map(([t, , img], k) => `<img class="story__img${k ? '' : ' on'}" src="${base}assets/img/projects/${img}" alt="" loading="lazy" decoding="async" />`).join('')}</div></figure>`}
          <div class="story__dots">${p.story.map((_, k) => `<span class="${k ? '' : 'on'}"></span>`).join('')}</div>
        </div>
      </div>
    </div>
  </div>
</section>` : '';

  const screens = p.screens ? `
<section class="section pp-screens" aria-labelledby="screens-h">
  <div class="container">
    <h2 class="section-title" id="screens-h" data-reveal><i>${p.story ? '04' : '03'}</i> On the screen</h2>
    <div class="screens">
      ${p.screens.map((s, k) => `<div class="screens__item${s.phone ? ' screens__item--phone' : ''}" data-reveal data-reveal-delay="${k * 100}" data-parallax="${k % 2 ? 0.06 : -0.04}">${frame(s, base, { alt: `${p.name} screen` })}</div>`).join('\n      ')}
    </div>
  </div>
</section>` : '';

  const hoodNum = pad(3 + (p.story ? 1 : 0) + (p.screens ? 1 : 0));

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<!-- Generated by tools/build-projects.mjs from tools/projects.mjs. Edit there. -->
<title>${esc(title)}</title>
<meta name="description" content="${esc(p.tagline)}" />
<meta name="author" content="Allord Archard" />
<meta name="theme-color" content="#05070c" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Allord Archard" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(p.tagline)}" />
<meta property="og:image" content="${ogImg}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(p.tagline)}" />
<meta name="twitter:image" content="${ogImg}" />
<link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&amp;family=Sora:wght@300;400;600;700;800&amp;display=swap" rel="stylesheet" />
<link rel="stylesheet" href="${base}assets/css/style.css" />
<link rel="stylesheet" href="${base}assets/css/visuals.css" />
<link rel="stylesheet" href="${base}assets/css/projects.css" />
<script>try{var t=localStorage.getItem('aa-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: p.name,
  description: p.tagline,
  url,
  image: ogImg,
  dateCreated: p.year,
  keywords: p.stack.join(', '),
  creator: { '@type': 'Person', '@id': `${SITE}#allord`, name: 'Allord Archard', url: SITE },
  ...(p.links.find((l) => l.live) ? { sameAs: p.links.find((l) => l.live).href } : {})
}, null, 2)}
</script>
</head>
<body class="pp" style="--p:${p.color}">

<div class="cursor-ring" id="cursorRing" aria-hidden="true"></div>
<div class="cursor-dot" id="cursorDot" aria-hidden="true"></div>
<canvas id="bgCanvas" aria-hidden="true"></canvas>
<div class="glow" aria-hidden="true"></div>
<div class="scroll-progress" aria-hidden="true"><span id="scrollBar"></span></div>
<a href="#main" class="skip-link">Skip to content</a>

<header class="nav" id="nav">
  <div class="container nav__inner">
    <a href="${base}" class="brand" data-cursor="link">
      <span class="brand__mark">&lt;/&gt;</span>
      <span class="brand__name">allord<span class="accent">.archard</span></span>
    </a>
    <nav class="nav__links" id="navLinks" aria-label="Primary">
      <a href="${base}#work" data-cursor="link">All projects</a>
      <a href="${base}projects/${next.slug}/" data-cursor="link">Next: ${esc(label(next))}</a>
      <a href="#contact" class="nav__cta" data-cursor="link">Let&#39;s talk</a>
    </nav>
    <div class="nav__tools">
      <button class="icon-btn" id="themeToggle" aria-label="Toggle colour theme" data-cursor="link">
        <svg class="i-sun"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19"/></svg>
        <svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.2 8.2 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/></svg>
      </button>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </div>
</header>

<main id="main">

<section class="pp-hero">
  <div class="container">
    <a class="pp-back" href="${base}#work" data-cursor="link">${ICON.back}<span>All projects</span></a>
    <p class="eyebrow pp-eyebrow" data-reveal><span class="pp-count">${pad(i + 1)} / ${pad(projects.length)}</span>${esc(p.category)}</p>
    <h1 class="pp-title" data-split>${esc(p.name)}</h1>
    <p class="pp-tagline" data-reveal data-reveal-delay="200">${esc(p.tagline)}</p>
    <div class="pp-actions" data-reveal data-reveal-delay="280">
        ${links}
        <a class="btn btn--wa magnetic" data-whatsapp data-wa-text="${esc(waText)}" href="https://wa.me/${WA}" data-cursor="link">${ICON.wa}<span>Build something like this</span></a>
    </div>
    <dl class="pp-meta" data-reveal data-reveal-delay="340">
      <div><dt>Platform</dt><dd>${esc(p.platform)}</dd></div>
      <div><dt>Status</dt><dd>${esc(p.status)}</dd></div>
      <div><dt>Year</dt><dd>${esc(p.year)}</dd></div>
      <div><dt>Built by</dt><dd>Allord Archard${p.category.includes('team') ? ' and team' : ''}</dd></div>
    </dl>
  </div>
  <div class="container pp-show" data-showcase>
    <div class="pp-show__inner">${frame(p.hero, base, { alt: `${p.name}: ${p.tagline}`, eager: true })}</div>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee__track">${[0, 1].map(() => `<span>${p.stack.map((s) => `${esc(s)}<i></i>`).join('')}${p.stack.map((s) => `${esc(s)}<i></i>`).join('')}</span>`).join('')}</div></div>

<section class="section pp-intro" aria-labelledby="intro-h">
  <div class="container">
    <h2 class="section-title" id="intro-h" data-reveal><i>01</i> The idea</h2>
    <p class="scrub" data-scrub>${esc(p.intro)}</p>
    <ul class="pp-stats">
      ${p.stats.map((s, k) => `<li data-reveal data-reveal-delay="${k * 80}"><b data-count="${s.n}"${s.suffix ? ` data-suffix="${esc(s.suffix)}"` : ''}>${s.n.toLocaleString('en-US')}${s.suffix ? esc(s.suffix) : ''}</b><span>${esc(s.label)}</span></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="feat-h">
  <div class="container">
    <h2 class="section-title" id="feat-h" data-reveal><i>02</i> What it does</h2>
    <div class="pp-features">
      ${p.features.map(([t, d], k) => `<article class="card pp-feature spot" data-reveal data-reveal-delay="${(k % 3) * 90}">
        <span class="pp-feature__n">${pad(k + 1)}</span>
        <h3>${esc(t)}</h3>
        <p>${esc(d)}</p>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>
${story}${screens}
<section class="section pp-hood" aria-labelledby="hood-h">
  <div class="container pp-hood__grid">
    <div>
      <h2 class="section-title" id="hood-h" data-reveal><i>${hoodNum}</i> Under the hood</h2>
      <p class="section-lede" data-reveal>For the technical reader: how it is put together.</p>
      <ul class="pp-stack" data-reveal>${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    </div>
    <ol class="pp-hood__list">
      ${p.hood.map((h, k) => `<li data-reveal data-reveal-delay="${k * 70}">${esc(h)}</li>`).join('\n      ')}
    </ol>
  </div>
</section>

<section class="section section--contact pp-cta" id="contact">
  <div class="container contact">
    <p class="eyebrow" data-reveal><span class="dot"></span> Taking on new projects</p>
    <h2 class="contact__title" data-reveal data-reveal-delay="60">Want something <span class="grad">like ${esc(label(p))}</span>?</h2>
    <p class="contact__lede" data-reveal data-reveal-delay="120">Tell me what you need. I&#39;ll tell you honestly how I&#39;d build it, how long it takes and what it costs.</p>
    <div class="contact__actions" data-reveal data-reveal-delay="180">
      <a class="btn btn--wa btn--xl magnetic" data-whatsapp data-wa-text="${esc(waText)}" href="https://wa.me/${WA}" data-cursor="link">${ICON.wa}<span>Chat on WhatsApp</span></a>
      <a class="btn btn--ghost btn--xl" href="#" data-social="email" data-cursor="link"><span>Or send an email</span></a>
    </div>
  </div>
</section>

<a class="pp-next" href="${base}projects/${next.slug}/" style="--p:${next.color}" data-cursor="link">
  <div class="container pp-next__inner">
    <span class="pp-next__k">Next project</span>
    <span class="pp-next__name">${esc(next.name)}</span>
    <span class="pp-next__tag">${esc(next.tagline)}</span>
    <span class="pp-next__go">${ICON.arrow}</span>
  </div>
</a>

</main>

<footer class="footer">
  <div class="container footer__inner">
    <p><b>Allord Archard</b>, full-stack developer</p>
    <div class="footer__links">
      <a href="${base}" data-cursor="link">Portfolio</a>
      <a href="#" data-social="github" target="_blank" rel="noopener" data-cursor="link">GitHub</a>
      <a href="#" data-social="email" data-cursor="link">Email</a>
      <a href="#" data-whatsapp data-wa-text="${esc(waText)}" data-cursor="link">WhatsApp</a>
    </div>
    <p class="footer__meta"><span id="year"></span></p>
  </div>
</footer>

<script src="${base}assets/js/config.js"></script>
<script src="${base}assets/js/visuals.js"></script>
<script src="${base}assets/js/main.js"></script>
</body>
</html>
`;
}

/* ---------------------------------------------------------------- cards on the home page */

function thumb(p) {
  const f = p.thumb || p.hero;
  if (f.phone) return `<div class="thumb thumb--phone">${frame(f, '', { alt: '' })}</div>`;
  return `<div class="thumb">${frame(f, '', { alt: '' })}</div>`;
}

function featuredCard(p, i) {
  const live = p.links.find((l) => l.live);
  return `<a class="fcard" href="projects/${p.slug}/" style="--p:${p.color}" data-cursor="link">
          <div class="fcard__visual">${thumb(p)}</div>
          <div class="fcard__body">
            <span class="fcard__num">${pad(i + 1)}</span>
            <span class="fcard__cat">${esc(p.category)}${live ? '<em>Live</em>' : ''}</span>
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.tagline)}</p>
            <ul class="pills">${p.stack.slice(0, 4).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
            <span class="fcard__go">Open the project ${ICON.arrow}</span>
          </div>
        </a>`;
}

function card(p, i) {
  const live = p.links.find((l) => l.live);
  return `<a class="pcard spot" href="projects/${p.slug}/" style="--p:${p.color}" data-reveal data-reveal-delay="${(i % 3) * 80}" data-cursor="link">
        <div class="pcard__visual">${thumb(p)}</div>
        <div class="pcard__body">
          <span class="fcard__cat">${esc(p.category)}${live ? '<em>Live</em>' : ''}</span>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.tagline)}</p>
          <span class="fcard__go">Open the project ${ICON.arrow}</span>
        </div>
      </a>`;
}

function inject(html, key, content) {
  const re = new RegExp(`(<!-- projects:${key}:start -->)[\\s\\S]*?(<!-- projects:${key}:end -->)`);
  if (!re.test(html)) throw new Error(`index.html is missing the projects:${key} markers`);
  return html.replace(re, `$1\n${content}\n        $2`);
}

/* ---------------------------------------------------------------- go */

projects.forEach((p, i) => {
  const dir = join(ROOT, 'projects', p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), page(p, i));
});

let index = readFileSync(join(ROOT, 'index.html'), 'utf8');
index = inject(index, 'featured', projects.slice(0, featuredCount).map((p, i) => '        ' + featuredCard(p, i)).join('\n'));
index = inject(index, 'more', projects.slice(featuredCount).map((p, i) => '      ' + card(p, i)).join('\n'));
index = index.replace(/(<!-- projects:count -->)\d+/, `$1${projects.length}`);
writeFileSync(join(ROOT, 'index.html'), index);

writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>
${projects.map((p) => `  <url><loc>${SITE}projects/${p.slug}/</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>
`);

console.log(`built ${projects.length} project pages, the home page cards and sitemap.xml`);
