/* ============================================================
   EDIT THIS FILE — everything personal lives here.
   Nothing else needs touching to make the site yours.
   ============================================================ */

window.SITE_CONFIG = {

  /* --------------------------------------------------------
     WHATSAPP  (the main call to action)
     --------------------------------------------------------
     Full international number, DIGITS ONLY.
     No "+", no spaces, no dashes, no leading zero.
     Currently set to +255 795 977 630.

     Leave it as "" and every WhatsApp button politely says the
     number is missing instead of opening a broken chat.
  -------------------------------------------------------- */
  whatsappNumber: "255795977630",

  /* The message that is already typed for the visitor. */
  whatsappMessage: "Hey, Allord! Just saw your portfolio. How are you?",

  /* --------------------------------------------------------
     LINKS
     Anything left as "" is removed from the page rather than
     rendered as a dead link.
  -------------------------------------------------------- */
  email:    "allordarchard99@gmail.com",
  github:   "https://github.com/kakaAllord",
  linkedin: "",

  /* --------------------------------------------------------
     YOUR PHOTO  (optional, but worth adding)
     --------------------------------------------------------
     Drop a square-ish photo into assets/img/ and point at it:

         photo: "assets/img/allord.jpg",

     Leave it as "" and the About section shows an "AA" monogram
     instead — no broken image, no 404 in the console.
  -------------------------------------------------------- */
  photo: "",

  /* --------------------------------------------------------
     HERO TYPEWRITER
     Each phrase types itself out, holds, then deletes.
  -------------------------------------------------------- */
  typedPhrases: [
    "web apps that ship on time.",
    "APIs that stay up.",
    "dashboards people actually use.",
    "AI features that earn their keep.",
    "the whole thing, front to back."
  ],

  /* --------------------------------------------------------
     HERO TERMINAL
     Lines type out one after another on load.
     type: "cmd" (prompt), "ok" (green), "warn" (amber), "out" (dim)
  -------------------------------------------------------- */
  terminalLines: [
    { type: "cmd",  text: "whoami" },
    { type: "out",  text: "allord_archard // full-stack developer" },
    { type: "cmd",  text: "npm run build" },
    { type: "ok",   text: "built in 4.2s  -  bundle 142 kB" },
    { type: "cmd",  text: "pytest -q" },
    { type: "ok",   text: "48 passed in 3.1s" },
    { type: "cmd",  text: "docker compose up -d" },
    { type: "out",  text: "api ok   worker ok   db ok" },
    { type: "cmd",  text: "git push origin main" },
    { type: "ok",   text: "deployed to production" },
    { type: "warn", text: "status: open for freelance work" },
    { type: "cmd",  text: "" }
  ],

  /* --------------------------------------------------------
     BOOT SCREEN (the loader)

     Deliberately short — the whole sequence runs in about two
     seconds, and a click skips it. Adding steps makes it longer,
     so keep this list to four or five at most.
  -------------------------------------------------------- */
  bootCommand: "./launch --portfolio",

  bootSteps: [
    "starting services",
    "loading assets",
    "warming up ui",
    "allord.archard"
  ]
};
