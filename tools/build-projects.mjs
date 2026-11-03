#!/usr/bin/env node
/* ==========================================================================
   Builds the site from tools/projects.mjs.

     node tools/build-projects.mjs

   Writes:
     index.html                     the home page
     projects/<slug>/index.html     one page per project
     sitemap.xml                    home + every project page

   No dependencies. The output is plain HTML that is committed, so GitHub
   Pages serves it as is. Copy for the home page lives in this file; copy
   for each project lives in projects.mjs.
   ========================================================================== */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from './projects.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://kakaallord.github.io/me-portifolio/';
const WA = '255795977630';
const EMAIL = 'allordarchard99@gmail.com';
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const pad = (n) => String(n).padStart(2, '0');
const label = (p) => p.short || p.name;
const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
const live = (p) => p.links.find((l) => l.live);

const ICON = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  wa: '<svg class="wa-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2 22l5.34-1.4a9.8 9.8 0 004.7 1.2h.01c5.44 0 9.86-4.42 9.86-9.86 0-2.63-1.03-5.11-2.89-6.97A9.8 9.8 0 0012.04 2zm5.43 12.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z"/></svg>'
};

/* ---------------------------------------------------------------- scenes */

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
      const at = (deg, r) => { const a = deg * Math.PI / 180; return [(50 + r * Math.cos(a)).toFixed(1), (50 + r * Math.sin(a)).toFixed(1)]; };
      const devs = v.devices.map(([name, deg, r], i) => {
        const [x, y] = at(deg, r);
        return `<span class="v-radar__dev" style="left:${x}%;top:${y}%;--dl:${(i * 0.6).toFixed(1)}s"><i></i>${esc(name)}</span>`;
      }).join('');
      const [px, py] = at(v.devices[0][1], v.devices[0][2]);
      return `<div class="v v-radar v-grid" data-v="radar">
        <div class="v-radar__field">
          <span class="v-radar__ring"></span><span class="v-radar__ring"></span><span class="v-radar__ring"></span>
          <div class="v-radar__sweep"></div>
          ${devs}
          <span class="v-radar__packet" style="--x:${px}%;--y:${py}%"></span>
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
  }
  return '';
}

// a screenshot or scene inside its frame; `base` is the path back to the site root
function frame(f, base, { alt = '', eager = false } = {}) {
  const load = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  if (f.phone) return `<figure class="frame frame--phone"><img src="${base}assets/img/projects/${f.phone}" alt="${esc(alt)}" ${load} decoding="async" /></figure>`;
  const bar = `<div class="frame__bar"><i></i><i></i><i></i><span>${esc(f.bar || '')}</span></div>`;
  if (f.v) return `<figure class="frame frame--window">${bar}${scene(f)}</figure>`;
  return `<figure class="frame frame--window">${bar}<img src="${base}assets/img/projects/${f.img}" alt="${esc(alt)}" ${load} decoding="async" /></figure>`;
}

/* ---------------------------------------------------------------- shared chrome */

const FONTS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap';

function head({ title, description, url, image, base, extra = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<!-- Generated by tools/build-projects.mjs. Edit tools/projects.mjs or the build script, then rebuild. -->
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="author" content="Allord Archard" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta name="theme-color" content="#f7f5f0" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Allord Archard" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${image}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${image}" />
<link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml" />
<link rel="manifest" href="${base}site.webmanifest" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${FONTS}" rel="stylesheet" />
<link rel="stylesheet" href="${base}assets/css/site.css" />
<link rel="stylesheet" href="${base}assets/css/visuals.css" />
<link rel="stylesheet" href="${base}assets/css/mobile.css" media="(max-width: 720px)" />
<script>document.documentElement.classList.add('js')</script>
${extra}</head>`;
}

function nav(base, home) {
  const h = home ? '' : base;
  return `<a href="#main" class="skip-link">Skip to content</a>

<header class="nav" id="nav">
  <div class="wrap nav__inner">
    <a href="${base}" class="brand"><span class="brand__mark">AA</span>Allord Archard</a>
    <nav class="nav__links" aria-label="Primary">
      <a href="${h}#work">Work</a>
      <a href="${h}#services">Services</a>
      <a href="${h}#process">How I work</a>
      <a href="${h}#about">About</a>
    </nav>
    <div class="nav__cta">
      <span class="nav__status"><span class="dot"></span>Available for projects</span>
      <a class="btn btn--ink btn--wa" data-whatsapp href="https://wa.me/${WA}">${ICON.wa}Hire me</a>
    </div>
  </div>
</header>`;
}

// the tab bar at the bottom of the screen on phones; hidden on larger screens
function dock(items) {
  return `<nav class="dock" aria-label="Quick links">
  ${items.join('\n  ')}
</nav>
`;
}
const dockHome = () => dock([
  `<a href="#work">${ICON.grid}Work</a>`,
  `<a href="#services">${ICON.layers}Services</a>`,
  `<a href="#about">${ICON.user}About</a>`,
  `<a class="dock__cta" data-whatsapp href="https://wa.me/${WA}">${ICON.wa}Hire me</a>`
]);
const dockProject = (base, l, waText) => dock([
  `<a href="${base}#work">${ICON.grid}All work</a>`,
  ...(l ? [`<a href="${l.href}" target="_blank" rel="noopener">${ICON.out}Live app</a>`] : []),
  `<a class="dock__cta" data-whatsapp data-wa-text="${esc(waText)}" href="https://wa.me/${WA}">${ICON.wa}Build like this</a>`
]);

function footer(base, dockHtml = '') {
  return `<footer class="footer">
  <div class="wrap footer__inner">
    <span>© <span data-year>${new Date().getFullYear()}</span> Allord Archard, full-stack developer</span>
    <nav aria-label="Footer">
      <a href="${base}#work">Work</a>
      <a href="${base}#services">Services</a>
      <a data-github href="https://github.com/kakaAllord" target="_blank" rel="noopener">GitHub</a>
      <a data-email href="mailto:${EMAIL}">Email</a>
    </nav>
  </div>
</footer>

${dockHtml}
<script src="${base}assets/js/config.js"></script>
<script src="${base}assets/js/visuals.js"></script>
<script src="${base}assets/js/site.js"></script>
</body>
</html>
`;
}

function contactBand({ title, text, waText, extra = '' }) {
  return `<section class="section contact" id="contact">
  <div class="wrap">
    <div class="contact__grid">
      <div data-reveal>
        <span class="label" style="color:var(--on-dark-2)"><span class="dot"></span>Taking on new projects</span>
        <h2 style="margin-top:1.4rem">${title}</h2>
        <p>${text}</p>
        <div class="contact__actions">
          <a class="btn btn--light btn--lg btn--wa" data-whatsapp ${waText ? `data-wa-text="${esc(waText)}"` : ''} href="https://wa.me/${WA}">${ICON.wa}Chat on WhatsApp</a>
          <a class="btn btn--ghost-dark btn--lg" data-email href="mailto:${EMAIL}">Send an email</a>
        </div>
      </div>
      <div class="contact__card" data-reveal="120">
        <div class="contact__row"><span class="k">WhatsApp</span><span class="val">+255 795 977 630 <button class="copy" data-copy="+255795977630">Copy</button></span></div>
        <div class="contact__row"><span class="k">Email</span><span class="val">${EMAIL} <button class="copy" data-copy="email">Copy</button></span></div>
        <div class="contact__row"><span class="k">Based in</span><span class="val">Tanzania, working with clients anywhere</span></div>
      </div>
    </div>
    ${extra}
  </div>
</section>`;
}

/* ---------------------------------------------------------------- home page */

function card(p, i) {
  const l = live(p);
  const f = p.thumb || p.hero;
  const media = f.phone
    ? `<a class="card__media card__media--phone" href="projects/${p.slug}/" tabindex="-1" aria-hidden="true">${frame(f, '', {})}</a>`
    : `<a class="card__media" href="projects/${p.slug}/" tabindex="-1" aria-hidden="true">${frame(f, '', {})}</a>`;
  return `      <article class="card${p.wide ? ' card--wide' : ''}" data-kinds="${p.kinds.join(' ')}" style="--p:${p.color}" data-reveal="${(i % 3) * 70}">
        ${media}
        <div class="card__body">
          <div class="card__meta">
            <span class="card__client">${esc(p.client)}</span>
            ${l ? `<a class="card__live" href="${l.href}" target="_blank" rel="noopener"><span class="dot"></span>Live${ICON.out}</a>` : ''}
          </div>
          <h3><a href="projects/${p.slug}/">${esc(p.name)}</a></h3>
          <p>${esc(p.tagline)}</p>
          <div class="card__foot">
            <ul class="tags">${p.platform.split(', ').map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
            <span class="card__go">See the project${ICON.arrow}</span>
          </div>
        </div>
      </article>`;
}

const OFFERS = [
  {
    t: 'Business systems and dashboards',
    d: 'Approvals, payments, members, roles and reports in one place, instead of spreadsheets and WhatsApp groups.',
    get: ['Works on phones and computers', 'Each role sees only its part', 'PDF and Excel reports'],
    proof: ['magari', 'irca']
  },
  {
    t: 'Registration and sign-up sites',
    d: 'Forms that take a minute on a cheap phone, with an admin dashboard to filter people and export them for SMS.',
    get: ['Duplicate checks and clean phone numbers', 'Filters and CSV export', 'Live in days, not months'],
    proof: ['tafes', 'irca']
  },
  {
    t: 'Android apps',
    d: 'Apps for the phones your users already own: offline when needed, in Swahili or English.',
    get: ['Installable .apk or Play Store', 'Works without internet', 'Camera, files and sharing'],
    proof: ['shoprex', 'nyaraka', 'lockin', 'laura']
  },
  {
    t: 'Desktop software',
    d: 'Installable Windows and Linux apps for work that needs a real computer, a second screen or no internet.',
    get: ['Windows installer and Linux package', 'Fast with large data', 'Works fully offline'],
    proof: ['light', 'kakapips', 'ferry']
  },
  {
    t: 'Data and analysis',
    d: 'Collect data properly, clean it, test ideas against it honestly, and turn the results into charts people can read.',
    get: ['Clean, documented datasets', 'Tests that guard against luck', 'Clear reports and charts'],
    proof: ['eleguard']
  }
];

function home() {
  const liveCount = projects.filter(live).length;
  const kinds = [['all', 'All'], ['web', 'Web apps'], ['mobile', 'Mobile'], ['desktop', 'Desktop'], ['data', 'Data']];
  const count = (k) => k === 'all' ? projects.length : projects.filter((p) => p.kinds.includes(k)).length;
  const c = (slug) => bySlug[slug];

  return `${head({
    title: 'Allord Archard, Full-Stack Developer | Web, Mobile & Desktop Apps',
    description: 'Freelance full-stack developer in Tanzania. Business systems, registration sites, Android apps and desktop software, designed, built and shipped end to end. See 11 real projects.',
    url: SITE, image: `${SITE}assets/img/og.jpg`, base: '',
    extra: `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person', '@id': `${SITE}#allord`, name: 'Allord Archard', jobTitle: 'Full-Stack Developer',
      url: SITE, image: `${SITE}assets/img/allord.jpg`, email: `mailto:${EMAIL}`, telephone: '+255795977630',
      address: { '@type': 'PostalAddress', addressCountry: 'TZ' },
      knowsLanguage: ['en', 'sw'],
      sameAs: ['https://github.com/kakaAllord', `https://wa.me/${WA}`],
      knowsAbout: ['Full-stack development', 'TypeScript', 'Next.js', 'NestJS', 'PostgreSQL', 'Flutter', 'Android', 'Electron', 'Rust', 'Python', 'Data analysis']
    },
    {
      '@type': 'ProfessionalService', '@id': `${SITE}#service`, name: 'Allord Archard, Software Development',
      url: SITE, provider: { '@id': `${SITE}#allord` }, areaServed: 'Worldwide',
      hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Services', itemListElement: OFFERS.map((o) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: o.t, description: o.d } })) }
    },
    {
      '@type': 'ItemList', name: 'Projects',
      itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}projects/${p.slug}/`, name: p.name }))
    }
  ]
}, null, 2)}
</script>
`
  })}
<body>
${nav('', true)}

<main id="main">

<!-- ============ HERO: who, what, and the work itself in the first view ============ -->
<section class="hero">
  <div class="wrap hero__grid">
    <div>
      <div class="hero__kicker rise">
        <span class="pill"><span class="dot"></span>Available for new projects</span>
        <span class="label">Full-stack developer · Tanzania</span>
      </div>
      <h1 class="rise" style="--d:80ms">I build the software your business <em>runs on.</em></h1>
      <p class="hero__sub rise" style="--d:160ms">Web apps, Android apps and desktop software, designed, built and shipped by one developer. Below are ${projects.length} I've built, ${liveCount} of them live right now.</p>
      <div class="hero__actions rise" style="--d:240ms">
        <a class="btn btn--ink btn--lg btn--wa" data-whatsapp href="https://wa.me/${WA}">${ICON.wa}Start a project</a>
        <a class="btn btn--line btn--lg" href="#work">See the work${ICON.down}</a>
      </div>
      <ul class="proof rise" style="--d:320ms">
        <li><b data-count="${projects.length}">${projects.length}</b><span>products shipped</span></li>
        <li><b data-count="${liveCount}">${liveCount}</b><span>live web apps</span></li>
        <li><b data-count="4">4</b><span>platforms</span></li>
        <li><b data-count="3">3</b><span>client organisations</span></li>
      </ul>
    </div>

    <div class="collage" aria-label="A few of the projects">
      <a class="collage__item collage__a" href="projects/kakapips/" style="--d:200ms" aria-label="Kakapips">
        <span class="collage__tag"><span class="dot"></span>Kakapips · live</span>
        ${frame({ img: 'kakapips/chart.webp', bar: 'kakapips.vercel.app' }, '', { alt: 'Kakapips charting app', eager: true })}
      </a>
      <a class="collage__item collage__b" href="projects/light/" style="--d:360ms" aria-label="Light">
        <span class="collage__tag">Light · church presentation</span>
        ${frame({ img: 'light/s2.webp', bar: 'Light' }, '', { alt: 'Light worship presentation app' })}
      </a>
      <a class="collage__item collage__c" href="projects/magari/" style="--d:520ms" aria-label="Magari">
        ${frame({ phone: 'magari/mobile.webp' }, '', { alt: 'Magari fleet app on a phone' })}
        <span class="collage__tag"><span class="dot"></span>Magari · live</span>
      </a>
    </div>
  </div>
</section>

<div class="wrap">
  <div class="clients" data-reveal>
    <span class="clients__k">Built for</span>
    <a href="projects/magari/">Zuraja Magari <small>transport</small></a>
    <a href="projects/irca/">IRCA <small>church</small></a>
    <a href="projects/tafes/">TAFES <small>student fellowship</small></a>
    <span class="clients__k">and my own products used on web, Android and desktop</span>
  </div>
</div>

<!-- ============ WORK ============ -->
<section class="section" id="work">
  <div class="wrap">
    <div class="work__head">
      <div data-reveal>
        <span class="label label--accent">Selected work</span>
        <h2 class="h2" style="margin-top:0.8rem">Real projects, not mock-ups.</h2>
        <p class="lede">Client systems and my own products. Every one has its own page; the ones marked Live you can open right now.</p>
      </div>
      <div class="filters" role="group" aria-label="Filter projects" data-reveal="100">
        ${kinds.map(([k, l], i) => `<button type="button" data-kind="${k}" aria-pressed="${i === 0}">${l}<sup>${count(k)}</sup></button>`).join('')}
      </div>
    </div>
    <div class="grid">
${projects.map(card).join('\n')}
    </div>
  </div>
</section>

<!-- ============ SERVICES: what I can do, each backed by projects ============ -->
<section class="section services" id="services">
  <div class="wrap">
    <div class="services__head">
      <div data-reveal>
        <span class="label label--accent">Services</span>
        <h2 class="h2" style="margin-top:0.8rem">What I can build for you</h2>
      </div>
      <p class="lede" data-reveal="100">Find the one closest to what you need. Each comes with projects that show I've built it before.</p>
    </div>
    <div class="offers">
      ${OFFERS.map((o, i) => `<div class="offer" data-reveal="${i * 40}">
        <h3>${esc(o.t)}</h3>
        <div class="offer__do">
          <p>${esc(o.d)}</p>
          <ul class="offer__get">${o.get.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
        </div>
        <div class="offer__proof">
          <span class="label">See it in</span>
          <ul>${o.proof.map((s) => `<li><a href="projects/${s}/" style="--p:${c(s).color}"><i></i>${esc(label(c(s)))}</a></li>`).join('')}</ul>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ============ PROCESS ============ -->
<section class="section" id="process">
  <div class="wrap">
    <div class="process__head">
      <div data-reveal>
        <span class="label label--accent">How I work</span>
        <h2 class="h2" style="margin-top:0.8rem">How a project with me runs</h2>
      </div>
      <p class="lede" data-reveal="100">You always know what is happening, what it costs and when it lands.</p>
    </div>
    <ol class="steps">
      <li class="step" data-reveal="0"><span class="step__n">01</span><h3>Tell me what you need</h3><p>Message me on WhatsApp or email, and we talk it through. You get a straight answer on whether I'm the right person for it.</p></li>
      <li class="step" data-reveal="80"><span class="step__n">02</span><h3>A written plan and price</h3><p>Scope, price and timeline in writing before any work starts, so there are no surprises later.</p></li>
      <li class="step" data-reveal="160"><span class="step__n">03</span><h3>Progress you can click</h3><p>You get a live link early and watch the product grow, with an update every week.</p></li>
      <li class="step" data-reveal="240"><span class="step__n">04</span><h3>Launch and handover</h3><p>Deployed and running, with documentation and everything you need to keep it going.</p></li>
    </ol>
    <ul class="promise">
      <li data-reveal="0"><b>Built for your real users</b><span>Swahili or English, everyday phones, slow networks. The apps above are made for real conditions.</span></li>
      <li data-reveal="80"><b>Everything written down</b><span>Decisions, guides and runbooks come with the work. The IRCA system ships with 57 recorded design decisions.</span></li>
      <li data-reveal="160"><b>One person, the whole product</b><span>Design, front end, back end, database and deployment, with no hand-offs between contractors.</span></li>
    </ul>
  </div>
</section>

<!-- ============ ABOUT ============ -->
<section class="section about" id="about">
  <div class="wrap about__grid">
    <div class="about__photo" data-reveal>
      <picture>
        <source srcset="assets/img/allord.webp" type="image/webp" />
        <img src="assets/img/allord.jpg" width="700" height="700" alt="Allord Archard" loading="lazy" decoding="async" />
      </picture>
      <div class="about__badge"><b><span class="dot"></span>Available now</b>Easiest to reach on WhatsApp</div>
    </div>
    <div class="about__text">
      <span class="label label--accent" data-reveal>About</span>
      <h2 class="h2" style="margin-top:0.8rem" data-reveal>Hi, I'm Allord.</h2>
      <p data-reveal>I'm a full-stack developer. I take a project from the first conversation to something people use every day: <b>the screens, the API underneath, the database and the deploy</b> that puts it live.</p>
      <p data-reveal>Most of my client work is business systems: money that needs approving, members who need managing, people who need registering. I also build my own products, from a church presentation app to a file-transfer engine in Rust, which keeps me sharp across <b>web, Android and desktop</b>.</p>
      <p data-reveal>I started out writing C++ for microcontrollers. That's where I learned to care about performance, edge cases and code someone else can read.</p>
      <ul class="facts" data-reveal>
        <li><span class="k">Based in</span><span class="val">Tanzania, UTC+3</span></li>
        <li><span class="k">Works in</span><span class="val">English and Swahili</span></li>
        <li><span class="k">Builds for</span><span class="val">Web, Android, Windows, Linux</span></li>
        <li><span class="k">Core stack</span><span class="val">TypeScript, Next.js, NestJS, Flutter, Python, PostgreSQL</span></li>
        <li><span class="k">GitHub</span><span class="val"><a data-github href="https://github.com/kakaAllord" target="_blank" rel="noopener">github.com/kakaAllord</a></span></li>
        <li><span class="k">Email</span><span class="val"><a data-email href="mailto:${EMAIL}">${EMAIL}</a></span></li>
      </ul>
    </div>
  </div>
</section>

${contactBand({
  title: 'Have a project in mind? <em>Let&#39;s talk.</em>',
  text: 'Tell me what you&#39;re building. I&#39;ll tell you honestly how I&#39;d do it, how long it would take and what it would cost.'
})}

</main>

${footer('', dockHome())}`;
}

/* ---------------------------------------------------------------- project page */

function page(p, i) {
  const base = '../../';
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const url = `${SITE}projects/${p.slug}/`;
  const ogImg = p.hero.img ? `${SITE}assets/img/projects/${p.hero.img}` : `${SITE}assets/img/og.jpg`;
  const waText = `Hi Allord! I saw ${label(p)} on your portfolio and I'd like something similar built. Are you available?`;
  const l = live(p);

  const story = p.story ? `
<section class="section story-sec" aria-labelledby="story-h">
  <div class="wrap">
    <div class="sec-head" data-reveal><h2 class="h2" id="story-h">A closer look</h2><span class="label">${p.story.length} screens</span></div>
    <div class="story${p.phoneStory ? ' story--phone' : ''}" data-story>
      <div class="story__steps">
        ${p.story.map(([t, d, img], k) => `<article class="story__step" data-step="${k}">
          <span class="story__n">${pad(k + 1)} / ${pad(p.story.length)}</span>
          <h3>${esc(t)}</h3>
          <p>${esc(d)}</p>
          <div class="story__inline">${frame(p.phoneStory ? { phone: img } : { img, bar: p.name }, base, { alt: t })}</div>
        </article>`).join('\n        ')}
      </div>
      <div class="story__stage" aria-hidden="true">
        <div class="story__sticky">
          ${p.phoneStory
            ? `<figure class="frame frame--phone story__frame">${p.story.map(([, , img], k) => `<img class="story__img${k ? '' : ' on'}" src="${base}assets/img/projects/${img}" alt="" loading="lazy" decoding="async" />`).join('')}</figure>`
            : `<figure class="frame frame--window story__frame"><div class="frame__bar"><i></i><i></i><i></i><span>${esc(p.name)}</span></div><div class="story__imgs">${p.story.map(([, , img], k) => `<img class="story__img${k ? '' : ' on'}" src="${base}assets/img/projects/${img}" alt="" loading="lazy" decoding="async" />`).join('')}</div></figure>`}
          <div class="story__dots">${p.story.map((_, k) => `<span class="${k ? '' : 'on'}"></span>`).join('')}</div>
        </div>
      </div>
    </div>
  </div>
</section>` : '';

  const screens = p.screens ? `
<section class="section${p.story ? '' : ' story-sec'}" aria-labelledby="screens-h">
  <div class="wrap">
    <div class="sec-head" data-reveal><h2 class="h2" id="screens-h">On the screen</h2></div>
    <div class="screens">
      ${p.screens.map((s, k) => `<div class="screens__item${s.phone ? ' screens__item--phone' : ''}" data-reveal="${k * 100}">${frame(s, base, { alt: `${p.name} screen` })}</div>`).join('\n      ')}
    </div>
  </div>
</section>` : '';

  return `${head({
    title: `${p.name} | Built by Allord Archard`,
    description: p.tagline, url, image: ogImg, base,
    extra: `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'CreativeWork',
  name: p.name, description: p.tagline, url, image: ogImg, dateCreated: p.year, keywords: p.stack.join(', '),
  creator: { '@type': 'Person', '@id': `${SITE}#allord`, name: 'Allord Archard', url: SITE },
  ...(l ? { sameAs: l.href } : {})
}, null, 2)}
</script>
`
  })}
<body style="--p:${p.color}">
${nav(base, false)}

<main id="main">

<section class="ph">
  <div class="wrap ph__grid">
    <div>
      <nav class="crumbs rise" aria-label="Breadcrumb"><a href="${base}#work">Work</a>${ICON.chev}<span>${esc(p.name)}</span></nav>
      <p class="ph__client rise"><i></i>${esc(p.client)} · ${esc(p.category)}</p>
      <h1 class="rise" style="--d:80ms">${esc(p.name)}</h1>
      <p class="ph__tag rise" style="--d:140ms">${esc(p.tagline)}</p>
      <div class="ph__actions rise" style="--d:200ms">
        ${l ? `<a class="btn btn--ink btn--lg" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}${ICON.out}</a>` : ''}
        <a class="btn ${l ? 'btn--line' : 'btn--ink'} btn--lg btn--wa" data-whatsapp data-wa-text="${esc(waText)}" href="https://wa.me/${WA}">${ICON.wa}Build something like this</a>
      </div>
      <dl class="ph__meta rise" style="--d:260ms">
        <div><dt>Platform</dt><dd>${esc(p.platform)}</dd></div>
        <div><dt>Status</dt><dd>${esc(p.status)}</dd></div>
        <div><dt>Built with</dt><dd>${esc(p.stack.slice(0, 3).join(', '))}</dd></div>
        <div><dt>Year</dt><dd>${esc(p.year)}</dd></div>
      </dl>
    </div>
    <div class="ph__visual rise" style="--d:180ms">${frame(p.hero, base, { alt: `${p.name}: ${p.tagline}`, eager: true })}</div>
  </div>
</section>

<section class="section" aria-labelledby="ov-h">
  <div class="wrap overview">
    <div data-reveal>
      <span class="label label--accent" id="ov-h">Overview</span>
      <p class="big" style="margin-top:1rem">${esc(p.intro)}</p>
    </div>
    <ul class="stats" data-reveal="100">
      ${p.stats.slice(0, 4).map((s) => `<li><b data-count="${s.n}"${s.suffix ? ` data-suffix="${esc(s.suffix)}"` : ''}>${s.n.toLocaleString('en-US')}${s.suffix ? esc(s.suffix) : ''}</b><span>${esc(s.label)}</span></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="section" style="padding-top:0" aria-labelledby="feat-h">
  <div class="wrap">
    <div class="sec-head" data-reveal><h2 class="h2" id="feat-h">What it does</h2></div>
    <div class="features">
      ${p.features.map(([t, d], k) => `<div class="feature" data-reveal="${(k % 3) * 70}"><h3><i>${pad(k + 1)}</i>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>
${story}${screens}
<section class="section" aria-labelledby="tech-h">
  <div class="wrap tech">
    <div data-reveal>
      <span class="label label--accent">For the technical reader</span>
      <h2 class="h2" id="tech-h" style="margin:0.8rem 0 1.6rem">How it's built</h2>
      <ul class="tags">${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    </div>
    <ol class="hood" data-reveal="100">
      ${p.hood.map((h) => `<li>${esc(h)}</li>`).join('\n      ')}
    </ol>
  </div>
</section>

${contactBand({
  title: `Need something like <em>${esc(label(p))}?</em>`,
  text: 'Tell me what you need. I&#39;ll tell you honestly how I&#39;d build it, how long it would take and what it would cost.',
  waText,
  extra: `<nav class="pager" aria-label="More projects" style="margin-top:clamp(3.5rem,6vw,5rem)">
      <a href="${base}projects/${prev.slug}/"><span class="k">← Previous project</span><b>${esc(prev.name)}</b></a>
      <a href="${base}projects/${next.slug}/"><span class="k">Next project →</span><b>${esc(next.name)}</b></a>
    </nav>`
})}

</main>

${footer(base, dockProject(base, l, waText))}`;
}

/* ---------------------------------------------------------------- go */

writeFileSync(join(ROOT, 'index.html'), home());

projects.forEach((p, i) => {
  const dir = join(ROOT, 'projects', p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), page(p, i));
});

writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>
${projects.map((p) => `  <url><loc>${SITE}projects/${p.slug}/</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>
`);

console.log(`built the home page, ${projects.length} project pages and sitemap.xml`);
