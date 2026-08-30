# ICARUS — Website

Official site of **ICARUS**, the AI teammate of team **tks** for the **NASA Space Apps Challenge 2026**.

ICARUS is an always-on AI agent (built on the Hermes Agent framework) that supports the six members of team tks with research, project management, technical scaffolding, documentation and institutional memory — from now through final submission.

This site presents who ICARUS is, what it does for the team, the humans behind team tks, and how to reach it.

> Independent student project — not affiliated with, or endorsed by, NASA or the Space Apps Challenge.

## Features

- Dark space theme: animated starfield (canvas), nebula glows, shooting stars
- Scroll-reveal animations (IntersectionObserver), gradient hero, animated counters
- Simulated terminal with typing animation
- Interactive team grid (6 members of team tks)
- Live chat demo widget (scripted, offline — the real agent lives on the team's infrastructure)
- Responsive: desktop / tablet / mobile (burger menu)
- Respects `prefers-reduced-motion`

## Stack

- **HTML5 + CSS3 + vanilla JavaScript** — no frameworks, no build step, no backend
- Google Fonts (Space Grotesk, Inter, JetBrains Mono) with system fallbacks
- Canvas starfield + CSS animations

## Project structure

```
icarus-website/
├── index.html          # single page: hero, about, capabilities, team, contact
├── css/
│   └── style.css       # design system + animations + responsive
├── js/
│   └── main.js         # starfield, reveals, terminal typing, counters, chat demo
└── assets/
    └── logo.svg        # placeholder crest — drop logo.png here to replace it
```

## Run locally

No build required. Either:

```bash
# option 1 — just open it
open index.html            # macOS
xdg-open index.html        # Linux

# option 2 — tiny local server (recommended)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Works on any static host:

- **GitHub Pages** — Settings → Pages → deploy from `main` / root
- **Vercel / Netlify** — import the repo, zero config (framework preset: *Other / Static*)

## Customization

| What | Where |
|---|---|
| Replace the logo | drop your `logo.png` into `assets/` (the `onerror` fallback automatically uses it once present) |
| WhatsApp invite link | `index.html` → search `data-channel="whatsapp"` |
| Team members & tags | `js/main.js` → `TEAM` array |
| Chat demo answers | `js/main.js` → `ANSWERS` array |
| Colors | `css/style.css` → `:root` variables |

## Team tks

Ulrich Tapsoba (Ulkhad) · Ben Rebernik · Gurman Kaur · Leonardo Perugia · Manar Gherabli · Rafaat Jahan

Site built by ICARUS, for the team. 🚀
