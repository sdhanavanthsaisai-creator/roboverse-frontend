# Team Roboto® / Roboverse — RB/25 Showcase

Official site for **Team Roboto**: RAT, an autonomous ESP32-powered differential-drive maze rover.
Live at **https://webdev-team-3.vercel.app** (auto-deploys on every push to `master`).

## What's on the site

| Section | What it does |
|---|---|
| **Hero** | 3D rover drives in; intro chips, scroll cue |
| **01 Hardware** | Scroll-driven **exploded view** of the rover assembly with hoverable spec pins (ESP32, Cytron MDDS30, 6S LiPo, PG36 motors, …) · drag to rotate mid-teardown |
| **02 Math** | Problem statement + 5 KaTeX-rendered equations (top speed, grip check, cell odometry, path shortening, power budget) |
| **03 Simulator** | Interactive **13×13 maze game** — click to raise walls mid-run and watch the rover fall back and recompute live (cost / moves / replans / time / best counters) · speedrun timer with local record |
| **04 Firmware** | Tabbed C++ firmware viewer (main / kinematics / planner) with syntax highlighting + copy button |
| **05 Media** | **Photo & video gallery** of the project — tiles auto-load from `public/media/manifest.json`; empty slots show themed DROP-FILE placeholders; click opens a lightbox (←/→ navigate, Esc close; videos play with sound) |
| **06 Crew** | 3D island where the **eight members' ID badges** (7 real + 1 placeholder) stand on a lit display deck — click a badge to flip it and see contact details |
| **Crew roster** | Large themed **flip ID cards** (front: photo + name + DOB + role; back: tappable IG / LinkedIn link rows that open the profile) |
| **07 Enquiry** | Working form → FormSubmit email, with the **3D letter-pop animation** on submit (see below) |

## The submit-button 3D letter animation

Modeled after the Framer "motion submit button" reference:

1. Click **SEND MESSAGE** → the button goes into `data-state="load"`.
2. A **mailbox scene pops up above the button** (scale + fade in).
3. An **envelope flies in** and drops into the mail slot; the **orange flag rises**.
4. The network result is awaited (min 1.6 s so the sequence always completes), then the button shows **SENT** or **FAILED — RETRY**.
5. After ~3.4 s the state returns to `idle` and the **whole scene disappears automatically**.

State flow: `idle → load → ok|err → idle`, driven entirely by `data-state` on `#enqBtn` (pure CSS keyframes + a tiny JS state machine in `index.html`).

## Crew data — single source of truth

The eight members are defined **once**, in the inline `CREW` array in `index.html` (badges read `photo`, `dob`, `insta`, `linkedin`, `accent` from it). Card 08 is still a placeholder (`photo:''`, no links) until its details arrive.

> ⚠️ If the crew changes, update **only that array**. Photos: real portraits live in `public/photos/member1.jpg … member6.jpg`.

## Sharp edges

A single global override forces squared corners everywhere:

```css
*,*::before,*::after{border-radius:0!important}
```

New elements are automatically sharp — no per-rule maintenance.

## Architecture

- **`index.html`** — the whole site: styles, DOM sections, inline Three.js engine (exploded rover, maze sim, crew island), firmware viewer, hamburger menu.
- **`src/components/RippleDistortion.*`** — the landing water island (React + ogl), loaded via dynamic import; the only code under `src/` that ships.
- **Three.js** loads at runtime from 3 CDN fallbacks (jsDelivr → unpkg → esm.sh); KaTeX + highlight.js from CDN. If WebGL or the CDN fails, a diagnostic fallback card with a RETRY button appears instead of a black screen.
- **`public/photos/`** — member portraits (member1–8.jpg); **`public/models/rover.glb`** — the real SolidWorks assembly the teardown explodes.
- **`dist/`** — Vite build output (git-ignored).

## Enquiry form (FormSubmit)

Posts to `https://formsubmit.co/ajax/dhanavanthsai.s@gmail.com` with `_subject`, `_template: table`, plus a `_honey` honeypot field (bots are silently dropped).

> **One-time activation:** FormSubmit emailed an "Activate Form" link to dhanavanthsai.s@gmail.com — click it once, or submissions will return "This form needs Activation".

## Development

```bash
npm install
npm run dev        # local dev server
npm run build      # tsc --noEmit && vite build → dist/
```

## Deployment

Git-linked Vercel project — **every push to `master` auto-deploys** to https://webdev-team-3.vercel.app. No manual deploy needed (`vercel --prod` from CLI fails with a team mismatch — ignore it).

## Change log

| Date | Change |
|---|---|
| 2025-10 (early) | Initial ROBOTO single-file front-end + legacy React seed |
| — | Placeholder crew replaced with the **5 real Team Roboto members** (site, seed, schema) |
| — | Hanging lanyard passes + enquiry form with animated button |
| — | ID cards enlarged (112 px), letter-animation stage repositioned |
| **2025-10 (today)** | **Full redesign**: integrated the 3D showcase (exploded rover, A* sim, firmware viewer) as the main site · hanging lanyards **removed** · big themed **flip ID cards** with real photos for the 5-member crew · 3D badges on the 3D team island flip to contact details · **3D letter pop-up** submit animation (pops in, plays, auto-disappears) · **sharp edges site-wide** · FormSubmit wiring kept |
| — | **Sound design** (Web Audio, zero files): boot chime, servo sweep tracking explode progress, wall ticks, replan blips, arrival arpeggio, scroll-velocity ambient hum · header **SOUND ON/OFF** toggle persisted in `localStorage` |
| — | **LiDAR fog-of-war maze**: the sim starts unseen — cells/walls materialize only where the ray sweep has passed and persist as a dim point-cloud "memory" (SLAM, experienced) |
| — | **Speedrun timer + local leaderboard**: TIME/BEST stats, efficiency % (optimal ÷ actual moves), `localStorage` best run, NEW RECORD toast + fanfare |
| — | **Media gallery** (`#gallery` section): photo & video tiles driven by `public/media/manifest.json`, terminal-styled lightbox (keyboard: ←/→/Esc), themed DROP-FILE placeholders with expected filenames while slots are empty — see `public/media/README.md` |
