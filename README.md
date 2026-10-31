# Allord Archard

Full-stack developer. I build web products end to end: the interface, the API behind it
and the infrastructure it runs on. TypeScript and Python day to day, plus AI features and
the occasional hardware-connected project.

Available for freelance work.

- **WhatsApp**: [+255 795 977 630](https://wa.me/255795977630)
- **Email**: allordarchard99@gmail.com
- **GitHub**: [@kakaAllord](https://github.com/kakaAllord)

---

This is the source for my portfolio site. Plain HTML, CSS and JavaScript. No framework,
no build step, no dependencies. Open `index.html` and it runs.

Live at https://kakaallord.github.io/me-portifolio/, with a page per project under
`projects/<name>/`.

## Editing

- Contact details, the hero typewriter and terminal, the boot screen: `assets/js/config.js`.
- The projects: `tools/projects.mjs`, then run `node tools/build-projects.mjs`. That rewrites
  every `projects/<name>/index.html`, the project cards in `index.html` (between the
  `projects:*` markers) and `sitemap.xml`. Commit the generated files; GitHub Pages serves
  them as they are.
- Screenshots live in `assets/img/projects/<name>/` as WebP.

## Layout

| Path | What it is |
|---|---|
| `assets/css/style.css` | Tokens, base, home page sections |
| `assets/css/projects.css` | Device frames, project cards, the pinned gallery, project pages |
| `assets/css/visuals.css` | The animated scenes used where a project has no screenshot |
| `assets/js/main.js` | Boot, theme, cursor, nav, reveals and the scroll-driven motion |
| `assets/js/visuals.js` | What moves inside those scenes |
| `tools/` | Project data and the page generator |

Every effect respects `prefers-reduced-motion`.
