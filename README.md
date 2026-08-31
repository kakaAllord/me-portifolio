# Allord Archard — Portfolio

Personal portfolio for **Allord Archard**, embedded systems & software developer.

Hand-written HTML, CSS and JavaScript. **No frameworks, no build step, no dependencies** — clone it and open it.

```
me-portifolio/
├── index.html
├── assets/
│   ├── css/style.css
│   ├── js/config.js      ← the only file you need to edit
│   ├── js/main.js
│   └── img/favicon.svg
└── README.md
```

---

## 1. Make it yours (2 minutes)

Everything personal lives in **`assets/js/config.js`**.

### WhatsApp — the main call to action

Already wired up:

```js
whatsappNumber:  "255795977630",   // +255 795 977 630
whatsappMessage: "Hey, Allord! Just saw your portfolio. How are you?",
```

All three WhatsApp buttons (hero, contact section, floating bubble) open
`wa.me/255795977630` **with the message already typed** — the visitor just hits send.

To change the number, use the **full international number, digits only** — no `+`, no spaces,
no leading zero (`+255 795 977 630` → `255795977630`). Leave it as `""` and the buttons show a
small reminder instead of opening a broken chat.

### The rest

```js
email:    "allordarchard99@gmail.com",
github:   "https://github.com/kakaAllord",
linkedin: "",                       // empty → the icon is removed from the page
```

Any link left as `""` is **removed** rather than rendered as a dead `#`. Add a LinkedIn URL
whenever you want that icon back.

You can also edit `typedPhrases` (the hero typewriter), `terminalLines` (the boot log in the
hero terminal) and `bootLines` (the loading screen) in the same file.

### Projects

The five project cards in `index.html` (`<section id="work">`) are written from your stack but
they are **placeholders** — swap the titles, descriptions, tags and the `href="#"` links for
your real repos and demos.

---

## 2. Run it locally

Just double-click `index.html`, or serve it:

```bash
npx serve .
# or
python -m http.server 8000
```

---

## 3. Deploy

**GitHub Pages** — push, then *Settings → Pages → Source: `main` / root*. Done.

**Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect the repo.
No build command, publish directory `.`.

---

## What's in it

- Boot sequence loader with a typing log
- Canvas node-graph background with signal pulses that react to the cursor
- Hero typewriter that types, holds and deletes on a loop
- Terminal panel that types its own boot log
- Custom trailing cursor that grows over interactive elements
- Dark / light theme with system detection and `localStorage` persistence
- Scroll-reveal entrances, animated skill bars, counting stats
- Section headings that decode from scrambled glyphs on first view
- 3D tilt cards with a pointer-tracked shine
- Magnetic buttons
- Sticky nav that hides on scroll-down, with scrollspy and a mobile drawer
- Infinite tech marquee, scroll progress bar, floating WhatsApp button
- Keyboard accessible, and fully respects `prefers-reduced-motion`

### Responsive

Verified in headless Chrome at **320, 360, 390, 430, 768, 1024, 1280, 1440 and 1920 px** —
no horizontal overflow, no clipped text, no JS errors, and every link/button at least a
28 px touch target at any width.

- Single column below 960 px; the hero terminal moves under the copy
- Off-canvas drawer menu below 780 px, with the brand and theme/close buttons layered above it
- Full-width buttons and single-column stats below 460 px
- Grid tracks use `minmax(min(300px, 100%), 1fr)` so cards never out-size a 320 px screen
- The custom cursor and 3D tilt are disabled on touch devices (`hover: none`)

---

Designed & built by Allord Archard.
