# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HeartBank® Treasury — a Lit web components SPA with Firebase backend, bundled by Parcel, styled with Tailwind CSS v4.

## Commands

- `npm start` — dev server (port 57880)
- `npm run build` — production build to `dist/`
- `npm run emulators` — build + Firebase emulators (UI on :4003)
- `npm run deploy` — build + deploy to Firebase Hosting
- `npm run ports` — kill emulator ports

Functions (`functions/` directory):

- `npm run build` — compile TypeScript to `lib/`
- `npm run deploy` — build + deploy functions only

## Architecture

**Lit Web Components** with Shadow DOM. Entry: `src/index.html` → `src/app.ts` (`<hb-app>`).

**Routing**: `@lit-labs/router` in `app.ts`. Components dispatch `CustomEvent("navigate", { detail: path, bubbles: true, composed: true })` to trigger `router.goto()`. The `@navigate` listener must be on the parent element containing the dispatching component (header, main, footer each need their own listener in `app.ts`).

**Component pattern**: Every component imports Tailwind as `bundle-text:../styles.css`, applies it via `unsafeCSS(tailwind)` in static styles, and registers/unregisters dark mode in lifecycle callbacks.

**Dark mode**: Centralized registry in `dark-mode.ts`. Components call `registerDarkMode(this)` / `unregisterDarkMode(this)`. Reads `localStorage("color-scheme")` → falls back to system preference. Custom Tailwind variant: `@custom-variant dark (:host(.dark) &)` enables `dark:` utilities inside Shadow DOM.

**Asset imports**: Use `url:` prefix for asset URLs (images, GLB models), `bundle-text:` for inline strings (CSS). Declared in `declarations.d.ts`.

## Firebase

- Project: `siliconwat-98373`, region: `asia-southeast1`
- Emulator ports: Auth :9093, Firestore :8083, Storage :9193, Functions :5004, Hosting :5003
- `src/firebase.ts` auto-connects to emulators on localhost
- Hosting rewrites: `/3/**` → `linkPreview` function (crawler OG tags), `**` → `/index.html` (SPA)
- Auth: passwordless email link sign-in

## Key Conventions

- Component prefixes: `hb-*` for layout/UI, `page-*` for routes
- TypeScript strict mode with `experimentalDecorators` for Lit decorators (`@customElement`, `@state`, `@property`)
- Tailwind v4 with `@theme`, `@utility`, and `@keyframes` blocks in `src/styles.css`
- Avoid `lang` as a property name in LitElement subclasses (conflicts with `HTMLElement.lang`)
- Use `firstUpdated()` (not `connectedCallback`) to query shadow DOM elements after first render
- Z-index layering: overlays z-40, menu panel z-50, footer z-40, footer tab z-30
