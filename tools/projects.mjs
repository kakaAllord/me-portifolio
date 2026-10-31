/* ==========================================================================
   Every project on the site, in the order they appear.
   Edit here, then run:  node tools/build-projects.mjs
   That rewrites projects/<slug>/index.html, the project cards in index.html
   and sitemap.xml. The generated files are committed, so the site itself
   still has no build step.

   hero / thumb, one of:
     { img: 'kakapips/chart.webp', bar: 'kakapips.vercel.app' }   window frame
     { phone: 'lockin/home.webp' }                                phone frame
     { v: 'flip' }                                                animated scene
   story: steps that swap the sticky screenshot as the reader scrolls.
   Copy style: plain words, no em dashes.
   ========================================================================== */

export const featuredCount = 6;

export const projects = [
  {
    slug: 'kakapips',
    name: 'Kakapips',
    color: '#f5b83d',
    category: 'Trading software',
    platform: 'Web, Linux, Windows',
    status: 'Live on the web, desktop builds released',
    year: '2026',
    tagline: 'A charting workstation for gold traders. In the browser, on the desktop, and fully offline.',
    intro: 'Kakapips is a fast XAUUSD charting app. Split the screen into as many charts as you need, draw on them, then replay the market bar by bar to practise decisions without hindsight. It started as a web app and grew into a family: an offline desktop edition that carries 23 years of minute data in its own file format, and a training edition that draws research strategies straight onto the chart.',
    links: [{ label: 'Open the live app', href: 'https://kakapips.vercel.app', live: true }],
    stack: ['Next.js', 'TypeScript', 'Canvas 2D', 'Electron', 'Node.js', 'Python', 'Binary formats'],
    stats: [
      { n: 23, label: 'years of 1-minute gold prices' },
      { n: 91, suffix: '%', label: 'smaller than the CSV, losslessly' },
      { n: 3, label: 'editions: web, offline, training' },
      { n: 2, label: 'desktop installers, .deb and .exe' }
    ],
    hero: { img: 'kakapips/chart.webp', bar: 'kakapips.vercel.app' },
    features: [
      ['Multi-chart layouts', 'Split, dock and swap panes, or pick a preset grid. Each pane keeps its own timeframe, scroll and zoom.'],
      ['Bar replay', 'Cut the chart at any moment and step forward one bar at a time, so practice happens without seeing the future.'],
      ['Drawing tools with undo', 'Trend lines, levels and shapes that persist between sessions, with a quick-access toolbar.'],
      ['Works with no internet', 'The desktop edition keeps its data in private storage and loads it on every start. Nothing is fetched.'],
      ['Its own data format', '.kpd packs are compressed and encrypted month by month, and checked bar for bar before they are written.'],
      ['Research on the chart', 'The training edition shows each strategy\'s signals, stops, targets and every trade it took.']
    ],
    story: [
      ['Every timeframe, side by side', 'Four charts, four timeframes, one screen. The crosshair and drawings stay in step without slowing the canvas down.', 'kakapips/layout.webp'],
      ['Replay the market', 'Pick a date, hide everything after it, and play the bars forward. The quickest way to practise reading price.', 'kakapips/replay.webp'],
      ['Offline, from a data pack', 'On first start the desktop app asks for a .kpd file, keeps a private copy and is ready from then on.', 'kakapips/offline-welcome.webp'],
      ['Strategies drawn on real bars', 'The training edition overlays a study\'s signals and trades, so a backtest result can be checked by eye.', 'kakapips/training-trade.webp'],
      ['Any date range, one download', 'A small local page cuts any range of history into a single pack, ready to copy to another PC.', 'kakapips/kpd-page.webp']
    ],
    hood: [
      'Charts draw directly on canvas. Hover and crosshair never touch React state, so panning stays smooth.',
      'A layout tree with pure split, dock and swap operations, saved to local storage.',
      '.kpd: an encrypted header plus one encrypted, compressed block per calendar month. Packs merge month by month.',
      'Electron serves the static export from a private app:// origin, so settings and data survive updates.',
      'The Windows installer is built on Linux through Wine, and every build is smoke-tested in a headless browser.'
    ]
  },

  {
    slug: 'magari',
    name: 'Magari',
    color: '#14b8a6',
    category: 'Business web app',
    platform: 'Web, installable on phones',
    status: 'Live',
    year: '2026',
    tagline: 'A transport company\'s money, cars and fuel in one place, in Swahili.',
    intro: 'Magari runs the finances of a truck fleet. Drivers ask for fuel money from their phone, the vehicle manager approves it, the factory manager authorises it, and the accountant pays it out and attaches the receipt. Along the way the app measures fuel economy per car and per driver, keeps every car\'s profit or loss, and turns it all into reports the director can download.',
    links: [
      { label: 'Open the live app', href: 'https://magari-manager.vercel.app', live: true },
      { label: 'Source code', href: 'https://github.com/kakaAllord/magari-manager' }
    ],
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Pusher', 'React PDF', 'ExcelJS'],
    stats: [
      { n: 5, label: 'roles, each with its own workspace' },
      { n: 4, label: 'steps from request to receipt' },
      { n: 2, label: 'report formats: PDF and Excel' },
      { n: 25, label: 'entries per page on long histories' }
    ],
    hero: {
      v: 'flow',
      nodes: [['Dereva', 'Driver asks for fuel'], ['Meneja', 'Manager approves'], ['Kiwanda', 'Factory authorises'], ['Mhasibu', 'Accountant pays']],
      card: ['⛽', 'Mafuta · T 482 DKL', '120 L × TSh 3,150 = TSh 378,000'],
      steps: 'Imeombwa|Imekubaliwa|Imeidhinishwa|Imelipwa ✓'
    },
    features: [
      ['Fuel requests that do the maths', 'The driver enters the odometer, the gauge, the station\'s price and the litres. The amount is worked out for them.'],
      ['A clear approval chain', 'The manager approves, the factory manager authorises, and the accountant pays with an M-Pesa reference, then adds a photo of the receipt.'],
      ['Profit or loss per car', 'Income per trip, cargo priced by the tonne or by the kilo, set against every shilling spent on that car.'],
      ['Fuel economy, measured', 'Kilometres, litres, km per litre and TSh per km, by car and by driver, worked out from real readings.'],
      ['Reports worth sending', 'Per car, month or week, as a PDF or an Excel workbook with live formulas, tables and native charts.'],
      ['Invoices (ankara)', 'Trips priced per tonne or per kilo, with payment details, ready to hand to the customer.']
    ],
    screens: [
      { img: 'magari/desktop.webp', bar: 'magari-manager.vercel.app' },
      { phone: 'magari/mobile.webp' }
    ],
    hood: [
      'Next.js App Router, with server-only data access to PostgreSQL.',
      'Live updates through Pusher: an approval appears on the next person\'s screen straight away.',
      'Excel workbooks with native charts from ExcelJS. PDFs from React PDF.',
      'Drivers sign in with their plate number, staff with email. Passwords hashed with bcrypt.',
      'Installable as an app on Android and desktop.'
    ]
  },

  {
    slug: 'irca',
    name: 'IRCA Church System',
    short: 'IRCA',
    color: '#f08c4a',
    category: 'Organisation platform',
    platform: 'Web',
    status: 'Live',
    year: '2026',
    tagline: 'Membership, departments and finance for a growing church, in three apps that share one API.',
    intro: 'A church outgrows spreadsheets fast. This system gives IRCA a public registration form for new members, a staff portal where pastors, department leaders and the finance team each see exactly their part, and an outreach app the team uses on campus to record who they met. Every rule about who can see what lives in the API, not in the screens.',
    links: [{ label: 'Open the staff portal', href: 'https://irca-portal.vercel.app', live: true }],
    stack: ['NestJS', 'Next.js 16', 'PostgreSQL 18', 'Prisma', 'Neon', 'Vercel', 'Playwright'],
    stats: [
      { n: 3, label: 'apps, each deployed on its own' },
      { n: 57, label: 'design decisions written down' },
      { n: 12, label: 'months of seeded history for testing' },
      { n: 1, label: 'API that owns every permission' }
    ],
    hero: {
      v: 'flow',
      nodes: [['Form', 'New member registers'], ['API', 'Checks every permission'], ['Portal', 'Pastors and departments'], ['Finance', 'Records and statements']],
      card: ['⛪', 'New member · Grace Mollel', 'Registration form → Membership'],
      steps: 'Submitted|Verified|Welcomed|Recorded ✓'
    },
    features: [
      ['Role-based by design', 'Pastors see membership and prayer requests, finance sees money, department leads see their department. Nobody sees more than their role allows.'],
      ['Public registration form', 'New members register themselves. The form is its own small app with its own restricted database login.'],
      ['Finance that adds up', 'Contributions and spending recorded by the finance team, with printable PDF statements.'],
      ['Outreach on the go', 'An installable phone form for the campus team: pick a college once, then add names and numbers quickly.'],
      ['A support console with view-as', 'Support can see the portal as any role, without being given that role\'s powers.'],
      ['Built to be handed over', 'Every decision written down, every runbook and deploy step documented.']
    ],
    screens: [
      { img: 'irca/desktop.webp', bar: 'irca-portal.vercel.app' },
      { phone: 'irca/mobile.webp' }
    ],
    hood: [
      'NestJS API on a Linode server under pm2. Portal and form on Vercel.',
      'PostgreSQL 18 on Neon, with a separate database role per app. Prisma migrations.',
      'The portal proxies /api through its own origin, so the session cookie never crosses sites.',
      'Argon2 password hashing, Helmet headers, rate limiting and structured logs with pino.',
      'Unit tests with Vitest, end-to-end tests with Playwright.'
    ]
  },

  {
    slug: 'tafes',
    name: 'TAFES Registration',
    short: 'TAFES',
    color: '#e11d48',
    category: 'Web app',
    platform: 'Web',
    status: 'Live',
    year: '2026',
    tagline: 'Student sign-ups for a campus fellowship, with SMS-ready contacts and an admin dashboard.',
    intro: 'TAFES needed to register new students at the start of the year and then actually reach them. The public form takes a minute on a phone. The admin dashboard filters people by level, course, hostel, talent and date, and exports the list for SMS campaigns.',
    links: [{ label: 'Open the live form', href: 'https://tafes.vercel.app', live: true }],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Prisma', 'PostgreSQL', 'Vercel'],
    stats: [
      { n: 1, label: 'minute to register on a phone' },
      { n: 7, label: 'filters that combine' },
      { n: 9, label: 'digits typed, saved as +255' },
      { n: 10, label: 'talents per person' }
    ],
    hero: { img: 'tafes/desktop.webp', bar: 'tafes.vercel.app' },
    features: [
      ['A form that respects the phone', 'Only the nine digits after +255 are asked for. Numbers pasted with 0 or +255 are trimmed automatically.'],
      ['Duplicate check that leaks nothing', 'Once the number is typed, the form checks whether it is already registered and answers only yes or no.'],
      ['Talents and where people stay', 'Pick talents or type new ones, and give a hostel room or a place outside campus.'],
      ['Filters that combine', 'Search, level, course, hostel, status, date range and talents, all at once.'],
      ['CSV export for SMS', 'Export the list with status and how many messages each person has received.'],
      ['Courses from the source', 'The course list comes from Arusha Technical College\'s own programmes API.']
    ],
    screens: [{ phone: 'tafes/mobile.webp' }],
    hood: [
      'Next.js App Router on Vercel, with migrations applied on every build.',
      'Prisma with PostgreSQL on Neon. Numbers stored in the format Beem Africa SMS expects.',
      'Admin sessions in an HMAC-signed cookie, with no third-party auth.',
      'Zod validation shared by the form and the API.'
    ]
  },

  {
    slug: 'light',
    name: 'Light',
    color: '#60a5fa',
    category: 'Desktop app',
    platform: 'Linux, Windows',
    status: 'Linux and Windows builds released',
    year: '2026',
    tagline: 'Worship presentation for churches: lyrics, scripture, slides and video on the projector.',
    intro: 'On a Sunday the person at the laptop has one job: put the right words on the screen at the right moment. Light is built around that person. Build the order of service, then click through songs, Bible passages, PowerPoint decks and videos while the congregation sees a clean, full-screen output on the second display.',
    links: [],
    stack: ['Flutter', 'Dart', 'C++', 'FFmpeg', 'GitHub Actions'],
    stats: [
      { n: 8, label: 'Bible formats it imports' },
      { n: 5, label: 'presentation formats' },
      { n: 2, label: 'operating systems, one codebase' },
      { n: 0, label: 'codecs to install for video' }
    ],
    hero: { img: 'light/s2.webp', bar: 'Light · Sunday service' },
    features: [
      ['Built for the operator', 'Order of service on the left, preview in the middle, live output on the right. Nothing hidden behind menus.'],
      ['A real second window', 'The output opens full screen on the projector and follows it when it is unplugged and plugged back in.'],
      ['Any Bible you have', 'Zefania, OSIS, USFM, USFX, MyBible, MySword, e-Sword and SWORD. The King James Version is included.'],
      ['PowerPoint without PowerPoint', '.pptx and .ppsx become slides inside the app. Older formats go through LibreOffice.'],
      ['Video that just plays', 'MP4, MKV, MOV, WebM and more, with FFmpeg bundled. Nothing extra to install.'],
      ['Drag and drop', 'Drop files from the file manager straight into the service.']
    ],
    story: [
      ['Lyrics, verse by verse', 'Pick a song and step through its verses. The congregation sees only the words, large and clean.', 'light/o_song.webp'],
      ['Scripture in a click', 'Type a reference and the passage is ready. Every verse is one click away from the screen.', 'light/p_bible_type.webp'],
      ['Bring your PowerPoint', 'Decks are converted into slides with their images, so they show on the same output as everything else.', 'light/o_ppt.webp'],
      ['Video without the fuss', 'Announcements and clips play full screen on the projector, with the operator still in control.', 'light/o_video.webp'],
      ['Backgrounds and themes', 'Set the look once: background, colours and logo, previewed before anyone sees them.', 'light/s8.webp']
    ],
    hood: [
      'Flutter desktop with a second native window that shares one engine, written in C++ for Linux and Windows.',
      'fvp bundles libmdk and FFmpeg, so video needs no system libraries.',
      'PowerPoint XML parsed into a slide model with its images.',
      'The .deb is built on Linux. The Windows installer is built by GitHub Actions.'
    ]
  },

  {
    slug: 'ferry',
    name: 'Ferry',
    color: '#2dd4bf',
    category: 'Networking software',
    platform: 'Windows, Linux, Android',
    status: 'Version 0.4, in development',
    year: '2026',
    tagline: 'Send files and folders between your devices over the local network. Fast, verified and encrypted.',
    intro: 'Ferry moves files between laptops and phones on the same network, with no internet in between. Devices find each other by name, a phone can make its own hotspot for others to join from a QR code, and every chunk of every file is checked before it is saved. Between paired devices the connection is encrypted and cannot be impersonated.',
    links: [{ label: 'Source code', href: 'https://github.com/kakaAllord/Ferry' }],
    stack: ['Rust', 'Tauri', 'Flutter', 'TLS 1.3', 'BLAKE3'],
    stats: [
      { n: 16, suffix: ' MiB', label: 'chunks, each verified on its own' },
      { n: 12, label: 'Rust crates in the engine' },
      { n: 3, label: 'platforms on one engine' },
      { n: 6, label: 'digits to pair two devices' }
    ],
    hero: {
      v: 'radar',
      devices: [["Neema's phone", 300, 38], ['Office PC', 35, 40], ['Laptop', 200, 42], ['Tablet', 125, 22]]
    },
    features: [
      ['Finds devices by itself', 'Nearby Ferry devices show up by name. The receiver approves before anything arrives.'],
      ['Pair once, trust after', 'Scan a code or compare six digits. Paired devices send without prompts and cannot be impersonated.'],
      ['Verified, not hoped for', 'Every 16 MiB chunk and every whole file is checked with BLAKE3 before it is saved.'],
      ['Hotspot from the phone', 'No router? A phone makes its own hotspot and others join by scanning a QR code.'],
      ['Folders, not just files', 'Whole folders stream across, with safe paths and atomic replacement on Windows.'],
      ['Messages too', 'Conversations with files and messages, and sharing from any other app on Android.']
    ],
    screens: [{ img: 'ferry/poster.webp', bar: 'Ferry' }],
    hood: [
      'A Rust engine split into twelve crates: protocol, session, pipeline, integrity and platform hosts.',
      'A fixed, bounds-checked 32-byte protocol envelope with per-connection sequence checks.',
      'TLS 1.3 between paired devices, trusted by key.',
      'Tauri desktop shell, and a Flutter Android app on the same engine.',
      'Each transfer writes to its own .ferrypart file, so a failed transfer never leaves a broken file behind.'
    ]
  },

  {
    slug: 'shoprex',
    name: 'Shoprex',
    color: '#8b5cf6',
    category: 'Retail platform',
    platform: 'Android, Web',
    status: 'In development',
    year: '2026',
    tagline: 'Turns an Android phone into a fast till and stock book for Tanzanian shops.',
    intro: 'Most small shops run on a notebook. Shoprex puts selling and stock on the phone the shopkeeper already owns: scan a barcode, sell, and the stock and the day\'s takings update themselves. Owners get a web console to see every branch, worker and device. Swahili first, English ready, prices in TSh.',
    links: [{ label: 'Source code', href: 'https://github.com/kakaAllord/shoprex' }],
    stack: ['NestJS', 'Prisma', 'PostgreSQL', 'Next.js', 'React Native', 'Expo'],
    stats: [
      { n: 3, label: 'apps: API, owner console, Android' },
      { n: 1, label: 'backend that owns every rule' },
      { n: 2, label: 'languages, Swahili and English' },
      { n: 0, label: 'database access from the apps' }
    ],
    hero: {
      v: 'pos',
      rows: [['Sukari 1kg × 2', 6000], ['Unga 2kg', 4200], ['Mafuta 1L', 7500], ['Sabuni', 2800]]
    },
    features: [
      ['Sell in seconds', 'Scan with the phone camera, adjust the quantity, take payment. Built for a queue at the counter.'],
      ['Stock that keeps itself', 'Every sale moves stock. Deliveries and corrections are recorded with who made them.'],
      ['Owners, managers, workers', 'Each role sees and does only what it should, on registered devices.'],
      ['Many shops, one owner', 'Branches, products and reports across the whole business in a web console.'],
      ['An audit trail', 'Every change to a price, stock or sale is kept, so mistakes can be traced and fixed.'],
      ['Swahili first', 'The whole interface reads naturally in Swahili, with English one tap away.']
    ],
    hood: [
      'The NestJS API is the only service that touches the database. Web and mobile call it.',
      'Prisma and PostgreSQL. JWT auth with device registration and QR pairing.',
      'React Native with Expo: the camera for barcodes, secure storage for tokens.',
      'A Next.js owner console built on Radix UI.',
      'Built in phases, each closed by an acceptance check run end to end over HTTP.'
    ]
  },

  {
    slug: 'lockin',
    name: 'Lockin',
    color: '#e5e7eb',
    category: 'Android app',
    platform: 'Android',
    status: 'Working build',
    year: '2026',
    tagline: 'A minimalist Android launcher with limits you cannot talk yourself out of.',
    intro: 'Lockin replaces the home screen with a quiet, text-only one. You set your limits while you are thinking clearly, and they apply on their own when you are tempted. Loosening a limit takes seven days. Extra time comes only when a person you trust approves it, from a link in any browser.',
    links: [],
    stack: ['Flutter', 'Kotlin', 'Android Accessibility', 'Node.js'],
    stats: [
      { n: 7, label: 'days before a limit can loosen' },
      { n: 3, label: 'daily priorities on the home screen' },
      { n: 1, label: 'APK: Flutter UI, Kotlin core' },
      { n: 0, label: 'apps the trusted person installs' }
    ],
    hero: { phone: 'lockin/home.webp' },
    features: [
      ['A text-only home screen', 'Only the essentials, a search that respects your limits, and up to three priorities for the day.'],
      ['Daily limits and windows', 'Minutes per app per day, or access only at set times.'],
      ['Committed for seven days', 'Tighten any time. Loosening waits a week, so a weak moment cannot undo a clear decision.'],
      ['A trusted person approves extra time', 'They get a link and answer in any browser. No app, no account.'],
      ['Honest about what it can do', 'Its limits and the ways around them are written down plainly, not hidden.'],
      ['Respects privacy', 'It only sees the name of the app in front. Requests carry only the app and the minutes.']
    ],
    story: [
      ['Decide now, enforce later', 'Setup asks you to choose your limits while you are calm and clear-headed.', 'lockin/onboarding-welcome.webp'],
      ['Limits that only tighten', 'Each restriction is committed. It can be made stricter at once, but not looser until the week is up.', 'lockin/restrictions.webp'],
      ['Focus sessions', 'Start a focus session and everything that is not essential waits until it ends.', 'lockin/focus-active.webp'],
      ['Done for today', 'When an app\'s time is used up, it says so plainly and sends you back home.', 'lockin/limit-exhausted.webp'],
      ['Scheduled windows', 'Some apps open only at set hours. Outside them, Lockin tells you when they are back.', 'lockin/outside-window.webp']
    ],
    phoneStory: true,
    hood: [
      'Flutter UI over a pure Kotlin core that enforces limits through Android\'s Accessibility service.',
      'An allowance ledger: bonus minutes from approvals, consumed by actual use.',
      'A small Node approval server. Tests on the Kotlin core, the Flutter UI and the backend.'
    ]
  },

  {
    slug: 'laura',
    name: 'Laura',
    color: '#fb7185',
    category: 'Productivity app',
    platform: 'Android, Linux, Windows',
    status: 'Version 1.1 released',
    year: '2026',
    tagline: 'A calm study timer with a mechanical flip clock. Offline, no accounts.',
    intro: 'Laura opens on a setup screen and never starts by itself. Pick countdown, Pomodoro or stopwatch, press Start, and a full-screen split-flap clock takes over, with soft piano, rain or brown noise behind it if you want. No sign-up, no cloud and no network access at all.',
    links: [],
    stack: ['Flutter', 'Dart', 'SoLoud audio'],
    stats: [
      { n: 17, label: 'background sounds in four groups' },
      { n: 3, label: 'modes: countdown, Pomodoro, stopwatch' },
      { n: 3, label: 'platforms from one codebase' },
      { n: 0, label: 'network requests, ever' }
    ],
    hero: { v: 'flip' },
    features: [
      ['A real split-flap clock', 'Built by hand: hinge line, shading and a mechanical flip on every digit. No clock package.'],
      ['Three ways to focus', 'Countdown with presets, Pomodoro with short and long breaks, or a stopwatch.'],
      ['Music that behaves', 'Piano, ambient, nature and noise. It pauses with the timer and can keep playing through breaks.'],
      ['A gentle finish', 'Six completion sounds, from a soft bell to a harp, each with a preview.'],
      ['History', 'Every session with its mode, planned and actual time, and how it ended.'],
      ['Private by default', 'No accounts, no tracking and no internet permission.']
    ],
    hood: [
      'flutter_soloud for gapless, low-latency audio.',
      'Six real Bach piano recordings from the public-domain Open Goldberg Variations.',
      'The flip clock is drawn by hand, digit by digit.',
      'Released as an Android .apk and a Linux .deb.'
    ]
  },

  {
    slug: 'nyaraka',
    name: 'Nyaraka',
    color: '#3b82f6',
    category: 'Android app',
    platform: 'Android, Linux',
    status: 'Working build',
    year: '2026',
    tagline: 'Open any document on your phone, keep it in one library, and convert it to what you need.',
    intro: 'Nyaraka means "documents" in Swahili. It opens Word, Excel, PowerPoint, OpenDocument, PDF, Markdown, HTML, CSV, JSON, RTF and plain text files, keeps a private copy of each in its own library, and converts between formats. Files arrive through Android\'s Open with and Share, and it reads Arabic, Hebrew, Chinese, Hindi and Amharic as well as it reads English.',
    links: [],
    stack: ['Flutter', 'Dart', 'PDF', 'OOXML', 'Unicode'],
    stats: [
      { n: 11, label: 'kinds of file it opens' },
      { n: 9, label: 'writing systems, right to left included' },
      { n: 1, label: 'private library for everything' },
      { n: 0, label: 'uploads: it all stays on the phone' }
    ],
    hero: { v: 'docs' },
    features: [
      ['Opens almost anything', 'Word, Excel, PowerPoint, OpenDocument, PDF, Markdown, HTML, CSV, JSON, RTF and text.'],
      ['Converts between formats', 'Turn a document into a PDF, a sheet into CSV, and more, without leaving the phone.'],
      ['Your own library', 'Every file you open is kept as a private copy, so it is there even after the original moves.'],
      ['Every script', 'Arabic and Hebrew read right to left, and Chinese, Thai or Amharic PDFs show every character.'],
      ['Open with and Share', 'Files come in from any app through Android\'s own menus.'],
      ['Offline', 'No account, no upload. Everything happens on the device.']
    ],
    hood: [
      'Office files parsed straight from their XML inside the zip.',
      'PDF viewing with pdfrx, and PDF writing with fonts embedded for every script.',
      'Right-to-left layout handled at the paragraph level.',
      'Test documents in Arabic, Hindi and mixed scripts, checked on a real phone.'
    ]
  },

  {
    slug: 'gold-lab',
    name: 'Gold Research Lab',
    short: 'Gold Lab',
    color: '#e3b341',
    category: 'Data and quant research',
    platform: 'Python',
    status: 'Study complete',
    year: '2026',
    tagline: 'Twenty-three years of gold prices, collected, cleaned and tested by a study built to say no.',
    intro: 'Does gold have a pattern you can trade after costs? Instead of tuning until something looks good, this study fixed its rules first, sealed the last four years of data behind a hash, and opened it once. The answer was no. The evidence for that no is the product: a clean 1-minute dataset back to 2003, a measured cost model, and a pipeline that also runs on pure noise to show what luck looks like.',
    links: [],
    stack: ['Python', 'pandas', 'NumPy', 'scikit-learn', 'LightGBM', 'Numba', 'MQL5'],
    stats: [
      { n: 23, label: 'years of 1-minute data' },
      { n: 46550, label: 'rule combinations tested' },
      { n: 32, label: 'walk-forward ML models' },
      { n: 9, label: 'noise series used as controls' }
    ],
    hero: { v: 'eq' },
    features: [
      ['Data you can trust', 'Dukascopy and broker history merged session by session, in UTC, with a report of every gap.'],
      ['Rules fixed before results', 'Splits, budgets, the cost model and the pass mark were written down before any model was trained.'],
      ['A sealed holdout', 'The final years were hashed and opened once, for four frozen candidates.'],
      ['Tested against noise', 'The whole pipeline ran again on nine synthetic series with no signal, to show what luck produces.'],
      ['Honest reporting', 'The best candidate made +0.35 R per trade on the holdout, but on 71 trades and after losing on validation. It was rejected.'],
      ['Feeds the charts', 'The same data powers Kakapips, and its training edition draws these strategies on real bars.']
    ],
    hood: [
      'A resumable, throttled downloader that caches every day as its own file.',
      'Resampling from 5 minutes to monthly, with trading days cut at 17:00 New York.',
      'Deflated Sharpe Ratio and Wilson intervals, so lucky results are called lucky.',
      'LightGBM walk-forward models and a Numba-accelerated trade simulator.'
    ]
  },

  {
    slug: 'eleguard',
    name: 'EleGuard',
    color: '#84cc16',
    category: 'IoT platform, team project',
    platform: 'Web and sensor nodes',
    status: 'Final-year project',
    year: '2026',
    tagline: 'Seismic sensors that hear elephants coming, warn the village and send a drone.',
    intro: 'Elephants crossing into farmland cost lives, crops and homes. EleGuard places seismic sensor nodes along wildlife corridors. When the ground shakes the way a large animal makes it shake, the system alerts the villagers and rangers in that zone and plans a drone route to turn the animals back before they reach the houses. Built as a team final-year project.',
    links: [],
    stack: ['NestJS', 'PostgreSQL', 'MQTT', 'Socket.io', 'BullMQ', 'Redis', 'React 19', 'Vite'],
    stats: [
      { n: 4, label: 'steps: detect, alert, respond, track' },
      { n: 3, label: 'kinds of node: seismic, village, drone' },
      { n: 1, label: 'live map for every incident' }
    ],
    hero: { v: 'seis' },
    features: [
      ['Detect', 'Seismic nodes along the corridor pick up the vibration pattern of large animals moving.'],
      ['Alert the right people', 'Only the villagers and rangers in that sensor\'s zone are notified, by SMS, email or push.'],
      ['Plan the response', 'A drone flight plan is generated to reach the animals and turn them back.'],
      ['Live incident map', 'Active alerts, sensor health and drone missions on one screen.'],
      ['Sensor registry', 'Every node registered with its GPS position and linked to the villages it faces.'],
      ['History and patterns', 'Every event, alert and mission logged, to map where conflict happens.']
    ],
    hood: [
      'Nodes publish over MQTT 5 to a HiveMQ broker. The NestJS backend turns events into alerts.',
      'Socket.io pushes detections to the dashboard the moment they arrive.',
      'BullMQ and Redis queue notifications and drone missions.',
      'React 19, Vite and Tailwind on the dashboard. Simulators stand in for real nodes during development.'
    ]
  }
];
