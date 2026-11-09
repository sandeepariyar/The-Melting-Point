# The Melting Point

Interactive climate memorial kiosk web app about the Nepal August 2026 flood.

**Live demo:** https://sandeepariyar.github.io/The-Melting-Point/

## What it is

A multi-act, museum-style experience that combines:

- Real-time 3D WebGL Himalayan terrain (Three.js)
- Story overlays for the flood event, causes and global context
- Climate visualizations (warming stripes, climate spiral, Earth energy budget, sea-level and global dashboards)
- Multilingual UI (English, Finnish, Swedish)
- Touch/ripple interaction and spatial audio cues

Built as a client-side React application. No Gemini or other AI API keys are required.

## Tech stack

- React 19 + TypeScript
- Vite
- Three.js
- Tailwind CSS
- Motion (animations)
- Lucide icons

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default port 3000).

```bash
npm run build   # production bundle to dist/
npm run lint    # TypeScript check
```

## Project layout

- `src/App.tsx` — act flow, language and overlays
- `src/components/` — 3D scene, act overlays, dashboards and modals
- `src/data/` — i18n and climate datasets
- `src/services/` — audio, planetary telemetry and disaster helpers
- `public/` — static assets

Created by Sandeep Pariyar.
