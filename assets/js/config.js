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

  /* The message that is already typed for the visitor. Its job is to open a
     working conversation, not just say hello — so it names a project and
     asks for the next step. */
  whatsappMessage: "Hey Allord! Just saw your portfolio. I've got a project I'd like us to work on — are you available?",

  /* --------------------------------------------------------
     LINKS
     Anything left as "" is removed from the page rather than
     rendered as a dead link.
  -------------------------------------------------------- */
  email:    "allordarchard99@gmail.com",
  github:   "https://github.com/kakaAllord",
  linkedin: "",

  /* --------------------------------------------------------
     YOUR PHOTO
     --------------------------------------------------------
     photo      the fallback every browser understands (jpg/png)
     photoWebp  optional smaller version modern browsers prefer

     Both are a square headshot crop of "Allord Archard Image.png",
     sized for the round frame in About. Set photo to "" to go back
     to the "AA" monogram — nothing is requested when it is empty.
  -------------------------------------------------------- */
  photo:     "assets/img/allord.jpg",
  photoWebp: "assets/img/allord.webp",

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

     The sequence runs to about four seconds, and a click or any
     key skips it. Each extra step adds roughly half a second —
     the pacing itself lives in the T block at the top of main.js.
  -------------------------------------------------------- */
  bootCommand: "./launch --portfolio",

  bootSteps: [
    "starting services",
    "loading assets",
    "warming up ui",
    "allord.archard"
  ]
};
