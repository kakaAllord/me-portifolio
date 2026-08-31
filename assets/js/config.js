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

       Tanzania  +255 712 345 678  ->  "255712345678"
       Kenya     +254 712 345 678  ->  "254712345678"
       UK        +44 7700 900123   ->  "447700900123"
       US        +1 (415) 555-0123 ->  "14155550123"

     Leave it as "" and every WhatsApp button politely tells
     you it still needs a number instead of opening a broken chat.

     Currently set to +255 795 977 630.
  -------------------------------------------------------- */
  whatsappNumber: "255795977630",

  /* The message that is already typed for the visitor. */
  whatsappMessage: "Hey, Allord! Just saw your portfolio. How are you?",

  /* --------------------------------------------------------
     LINKS
     Any link left as "" is hidden from the page rather than
     rendered as a dead "#" — so add LinkedIn when you want it.
  -------------------------------------------------------- */
  email:    "allordarchard99@gmail.com",
  github:   "https://github.com/kakaAllord",
  linkedin: "",

  /* --------------------------------------------------------
     HERO TYPEWRITER
     Each phrase types itself out, holds, then deletes.
  -------------------------------------------------------- */
  typedPhrases: [
    "firmware that runs for months on one battery.",
    "computer vision that keeps up with the conveyor.",
    "agentic AI that actually calls the right tool.",
    "C++ close to the metal.",
    "TypeScript interfaces that feel alive.",
    "systems that sense, decide and act."
  ],

  /* --------------------------------------------------------
     HERO TERMINAL
     Lines type out one after another on load.
     type: "cmd" (prompt), "ok" (green), "warn" (amber), "out" (dim)
  -------------------------------------------------------- */
  terminalLines: [
    { type: "cmd",  text: "whoami" },
    { type: "out",  text: "allord_archard // embedded systems + software" },
    { type: "cmd",  text: "make flash TARGET=stm32f4" },
    { type: "ok",   text: "build ok  -  flash 128.4 kB  -  ram 24.1 kB" },
    { type: "ok",   text: "device programmed, resetting..." },
    { type: "cmd",  text: "python deploy_model.py --edge" },
    { type: "out",  text: "quantising yolov8n -> int8 ......... done" },
    { type: "ok",   text: "inference 28 ms/frame  -  mAP 0.91" },
    { type: "cmd",  text: "npm run dev" },
    { type: "out",  text: "dashboard live on :5173  -  ws connected" },
    { type: "warn", text: "status: open to interesting problems" },
    { type: "cmd",  text: "" }
  ],

  /* --------------------------------------------------------
     BOOT SCREEN (the loader)
  -------------------------------------------------------- */
  bootLines: [
    "init system clock ......... ok",
    "mount /dev/portfolio ...... ok",
    "load allord.archard ....... ok",
    "start render loop ......... ok"
  ]
};
