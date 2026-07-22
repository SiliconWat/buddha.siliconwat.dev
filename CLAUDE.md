# CLAUDE.md — `buddha.siliconwat.dev`

"buddha" subdomain on siliconwat.dev (Dharma TLD — Khmer Tipiṭaka transcription + alignment work). Lit + Vite + Tailwind v4 + Firebase. SEO stack: build-time per-route prerender (`scripts/prerender-meta.mjs`), `src/seo.ts`, static robots/sitemap/IndexNow key, 3 SEO workflows (indexnow / google-sitemap / snapshot).

Project-wide context (Three-Jewels architecture, Tipiṭaka alignment, stack conventions, hard constraints) lives in the **root** `HeartBank®/CLAUDE.md` and project-wide memory (`project_silicon_wat.md`, `project_tipitaka_alignment.md`). No codebase memory dir yet.

## Commands

- `npm start` / `npm run dev` — Vite dev server (port 60160)
- `npm run build` — `vite build` + per-route SEO prerender to `dist/`
- `npm run preview` — preview the production build (port 60160)
- `npm run emulators` — build + Firebase emulators (UI on :4003)
- `npm run deploy` — build + deploy to Firebase Hosting
- `npm run ports` — kill emulator ports

Functions: `cd functions && npm run build` / `npm run deploy`.

## Firebase

- Project: `siliconwat-98373`, region: `asia-southeast1`
- Emulator ports: Auth :9093, Firestore :8083, Storage :9193, Functions :5004, Hosting :5003
- Auth: passwordless email link
- Hosting rewrites: `/3/**` → `linkPreview` function (OG tags), `**` → `/index.html` (SPA)

## Analytics

`static/analytics.js` (served at `/analytics.js`, loaded from `src/index.html`) runs two beacons,
both no-op'd on localhost: **Cloudflare Web Analytics** (this zone's own token) **+** a HeartBank
first-party beacon POSTing `page_view`/`link_click` to `https://thonly.org/api/track`. SPA-aware —
`page_view` fires on first load **and** on every client-side route change (patches the History API
`pushState`/`replaceState` + `popstate`, de-duped on path). Replaced the prior inline Cloudflare
beacon (2026-07-21).
