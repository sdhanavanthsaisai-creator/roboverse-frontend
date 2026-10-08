# Team Roboto® / Roboverse — RB/25 Showcase

Official site for **Team Roboto**: an autonomous ESP32-powered holonomic maze rover.
Live at **https://webdev-team-3.vercel.app** (auto-deploys on every push to `master`).

## What's on the site

| Section | What it does |
|---|---|
| **Hero** | 3D rover drives in; intro chips, scroll cue |
| **01 Hardware** | Scroll-driven **exploded view** of all 11 rover components with hoverable spec pins (ESP32, Cytron MD20A, 6S LiPo, LiDAR array, …) |
| **02 Math** | Problem statement + 5 KaTeX-rendered equations (holonomic kinematics, inverse IK, A*, log-odds SLAM, PID) |
| **03 Simulator** | Interactive **13×13 A\* maze game** — click to raise walls mid-run and watch the rover replan live (cost / moves / replans / time / best counters) · **LiDAR fog-of-war** (map builds only where swept) · speedrun timer with local record |
| **04 Firmware** | Tabbed C++ firmware viewer (main / kinematics / planner) with syntax highlighting + copy button |
| **05 Crew** | 3D island where the five **real members' ID badges** stand on a lit display deck — click a badge to flip it and see contact details |
| **Crew roster** | Large themed **flip ID cards** (real photos from `public/photos/`, IG / LinkedIn / GitHub / email links on the back) |
| **06 Enquiry** | Working form → FormSubmit email, with the **3D letter-pop animation** on submit (see below) |

## The submit-button 3D letter animation

Modeled after the Framer "motion submit button" reference:

1. Click **SEND MESSAGE** → the button goes into `data-state="load"`.
2. A **mailbox scene pops up above the button** (scale + fade in).
3. An **envelope flies in** and drops into the mail slot; the **orange flag rises**.
4. The network result is awaited (min 1.6 s so the sequence always completes), then the button shows **SENT** or **FAILED — RETRY**.
5. After ~3.4 s the state returns to `idle` and the **whole scene disappears automatically**.

State flow: `idle → load → ok|err → idle`, driven entirely by `data-state` on `#enqBtn` (pure CSS keyframes + a tiny JS state machine in `index.html`).

## Crew data — single source of truth

The five real members are defined **once**, in `public/crew.js` (`window.ROBO_CREW`):

- `index.html` consumes it as `const CREW_DATA = window.ROBO_CREW` (DOM flip ID cards)
- `public/showcase.js` maps it to the 3D badge array (crew island)

> ⚠️ If the crew changes, update **only `public/crew.js`**. Never fabricate emails — an empty `em:` simply hides the row.
> Photos: drop real portraits into `public/photos/member1.jpg … member5.jpg` (currently template placeholders; the layout falls back to an initial letter if a file is missing).

## Sharp edges

A single global override forces squared corners everywhere:

```css
*,*::before,*::after{border-radius:0!important}
```

New elements are automatically sharp — no per-rule maintenance.

## Architecture

- **`index.html`** — the whole site shell: styles, DOM sections, crew builder, enquiry state machine, boot watchdog.
- **`public/showcase.js`** — the Three.js r160 3D engine (exploded rover, maze sim, 3D badges). Loaded as a plain deferred `<script>` so Vite copies it to the build **untouched** (no module bundling issues with the CDN `import()`).
- **Three.js** loads at runtime from 3 CDN fallbacks (jsDelivr → unpkg → esm.sh); KaTeX + highlight.js from CDN. If WebGL or the CDN fails, a diagnostic fallback card with a RETRY button appears instead of a black screen.
- **`public/photos/`** — member portraits (member1–8.jpg).
- **`src/`, `supabase/`** — legacy React/Roboverse version, still type-checked by the build (`tsc --noEmit && vite build`); not part of the deployed page.
- **`dist/`** — Vite build output (committed for reference).

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
