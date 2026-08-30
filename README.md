# DEDALUS — Website

Official site of **Dedalus**, the AI agent of team **ICARUS** for the **NASA Space Apps Challenge 2026**.

Dedalus is an always-on AI agent (built on the Hermes Agent framework) supporting the six members of team ICARUS with research, project management, technical scaffolding, documentation and institutional memory — from now through final submission. In the myth, Daedalus built the wings; this one hands the team everything it needs to fly.

> Independent student project — not affiliated with, or endorsed by, NASA or the Space Apps Challenge.

## Design direction

Mission-control editorial: the palette is pulled directly from the team crest (deep navy, cyan, warm cream, sun orange), set in **Clash Display** + **Satoshi** (Fontshare) with **IBM Plex Mono** for telemetry-style labels. Grain texture, hairline grid, numbered sections, crew manifest table — no generic template look.

## Dependencies & resources

All optional and loaded from CDN — the site degrades gracefully offline:

| Resource | Role |
|---|---|
| [GSAP + ScrollTrigger](https://gsap.com) | scroll reveals & micro-animations |
| [Lenis](https://lenis.darkroom.engineering) | smooth scrolling |
| [Lucide](https://lucide.dev) | icons |
| [Fontshare — Clash Display, Satoshi](https://www.fontshare.com) | display & body typography |
| [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) | telemetry labels & console |

## Features

- Animated hero with the team crest, mission-file metadata and live status
- Simulated mission-log console with typing animation
- Numbered capability index with hover interactions
- Crew manifest table (live from the team's roles)
- Scripted demo chat (the real agent runs on the team's VPS + Telegram)
- Smooth scrolling, scroll progress, grain & grid atmosphere
- Responsive + `prefers-reduced-motion` support

## Project structure

```
website/
├── index.html          # hero, the agent, capabilities, crew, access
├── css/style.css       # design system, atmosphere, responsive
├── js/main.js          # reveals, console typing, crew, chat demo
└── assets/
    ├── logo.png        # official team crest
    └── logo.svg        # fallback crest
```

## Run locally

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

(Any static server works; no build step.)

## Deployment

Static site — works anywhere: GitHub Pages, Vercel, Netlify (zero config).

## Customization

| What | Where |
|---|---|
| Crew members & roles | `js/main.js` → `CREW` |
| Demo chat answers | `js/main.js` → `ANSWERS` |
| Mission-log lines | `js/main.js` → `LOG_LINES` |
| Palette | `css/style.css` → `:root` |
| Telegram access steps | `index.html` → `#access` |

## Team ICARUS

Ulrich Tapsoba (Ulkhad) · Ben Rebernik · Gurman Kaur · Leonardo Perugia · Manar Gherabli · Rafaat Jahan

Site built by Dedalus, for the crew. 🪽
