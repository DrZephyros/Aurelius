# Aurelius devlog

Newest entries first. Repo: `github.com/DrZephyros/Aurelius`, branch `main`.

## 2026-11-27 · Audit: AURA rating, website verdict, library fixes

### Starting point
- Local `Aurelius v15` HEAD = `dc52520` ("Redesign services section, update navbar and library"), same as `origin/main`.
- 23 files were already modified and uncommitted before this session (`src/views/*`, `src/components/*`, `src/index.css`, `src/lib/demo.ts`, and others). This session did not write to them and did not commit them.

### Findings

**AURA skill (`skill-src/aura-3d-web/`), rated 6.5 / 10**
- Ran the starter in a temp copy (`C:/Users/gowsa/AppData/Local/Temp/aura-test`, since deleted). `npm install` gave 0 vulnerabilities.
- `scripts/audit.mjs` scored **80/80** on the automated pillars (Atmosphere 25, Unbroken 20, Rhythm 20, Craft 15). 0 blockers. Authorship (20 pts) is human-judged, so it isn't scored.
- Per-frame metrics on desktop (14 frames): luma 0.048–0.192, no blown highlights (max 0.0011), frame-to-frame change 6.97–18.17.
- Contact-sheet review found:
  - The hero gem is faceted low-poly with flat colour, which reads as placeholder.
  - "Now see all of it" frames are mostly black, with rings and shards.
  - Mobile reuses the desktop rail and composition, so the object is small and the type collides with the rings.
  - Mobile chapter labels are about 8px.
  - "Some places you have to fall into" overlaps the rings.
  - The CTA has weak contrast over the busy scene.
- The audit missed the visible collisions and the tiny text, so the 80/80 overstates quality.
- Mobile (390×844), reduced motion, and no-WebGL were checked only at code and screenshot level. Real devices and real GPU FPS were not tested.
- Not tested: the NOCTA, Umbra, and Mira worlds, and a fresh brief-to-site generation.
- The starter doesn't implement the mobile shot list in `07-performance-and-resilience.md` (particle ×0.35, shards ×0.5, no mirror floor, `100svh`, touch damping).

**Website (v15), verdict: not complete**
- Typecheck (`npx tsc --noEmit`) fails with 5 errors:
  - `skill-studio.tsx`: unused `useState`.
  - `skill-src/aura-3d-web/starter/src/aura/scene.umbra.ts`: unused `quality`.
  - Three `replaceAll` calls (`src/lib/files.ts`, `src/lib/library.ts`, `src/lib/prompts.ts`) need `lib: es2021` or higher.
- Production build succeeds. Main JS bundle is about 2.5 MB (667 kB gzipped).
- The site has no backend. v15 is a static Vite build on Netlify. The frontend calls `/api/orders`, `/api/orders/verify`, `/api/requests`, `/api/agent-link`, `/api/download`, and `/api/waitlist`, which don't exist. `POST /api/orders` returns 404, so the $25 purchase can't complete.
- `/api/subscribe` is a stub (intentional TODO in `src/lib/prompts.ts`).
- History: v13 (`c583c18`) had the real Next.js backend with Stripe and Postgres. v14 (`9bbb5d4`) replaced it with a static build and removed `src/app/api/*`, `drizzle.config.json`, and `next.config.ts`. v14 is on remote branch `v14`.

**Library endpoint (`/library/*`, `/llms.txt`)**
- Live `llms.txt` returns 200 `text/markdown` and matches the local build byte-for-byte (20,716 bytes).
- All 110 linked items return 200 `text/markdown`.
- **Critical:** unknown paths also returned 200 `text/markdown` with an SPA HTML body, because the `/*` → `/index.html` redirect masked every 404. Agents couldn't tell a miss from a hit.
- **Critical:** all 24 templates link `../_shared/base.css`, which isn't shipped anywhere in the library. Without it the pages render unstyled (the hero copy is invisible and the sections collapse). Confirmed in a browser on the Folio template.
- Templates also depend on `../_shared/` and `../_vendor/` relative paths. These don't resolve from a flat download folder, and `three` isn't bundled.
- A cheap model that copies a template would get an unstyled page and spend its budget debugging paths.

### Changes this session (uncommitted)
- `netlify.toml`: added a `/library/*` → `/library/not-found.md` rule with status 404, placed before the SPA catch-all. Real files still take precedence.
- `scripts/build-agent-files.mjs`: writes `dist/library/not-found.md` (the 404 target).
- `src/lib/agent-library.ts`: each template is now a flat five-file project:
  - `index.html`, `style.css`, `main.js`
  - `shared/base.css` and `shared/core.js`, both now included in the markdown
  - `three` loads from `https://cdn.jsdelivr.net/npm/three@0.170.0`, matching the vendored r170 build.
  - The generator rewrites `../_shared/` to `./shared/` and the `_vendor` paths to the CDN.
  - Each template has a "Project layout" section, a "Notes for the agent" section that says to serve over http, and a verify step (zero console errors, a top and a scrolled screenshot).

### Verification
- `npm run build` succeeds and writes 113 library files, including `not-found.md`.
- Extracted all 24 templates from the built markdown into flat folders. Each has exactly `index.html`, `main.js`, `style.css`, `shared/base.css`, `shared/core.js`.
- Loaded all 24 in Chromium (1280×800, SwiftShader WebGL): **0 console errors** on each, and top-of-page screenshots taken. Folio renders with styled copy over the 3D scene.
- Not verified:
  - The Netlify 404 rule. It's only checked by reading the config. After deploy: `curl -i https://project-aurelius.netlify.app/library/nope.md` should return 404, and `/library/templates/folio.md` should still return 200.
  - The jsDelivr load on a real network.
  - The other 113 items (components, pages, elements, prompts).
  - Real GPU performance. Software WebGL is slow (about 30 s per screenshot).

### Open
- Deploy v15 to see the library fix live.
- Fix the 5 typecheck errors.
- Decide what to do with the 26 uncommitted files. Some of them are not from this session.
- Checkout, downloads, requests, orders, and agent-link need a backend. Options: port to Netlify Functions, or restore the v13 backend.
- The waitlist form and the `/api/subscribe` stub need a decision.
- Still to do for the library: a model-based test (same brief, cheap model with and without the library) to check whether it actually helps cheaper models.

## Commit history on `main` (from GitHub)

| Date | Commit | Summary |
|---|---|---|
| 2026-11-27 (this session) | — | Library 404 + flat templates + base.css (uncommitted) |
| 2026-11-26 | `dc52520` | Redesign services section, update navbar and library |
| 2026-11-26 | `78dfca0` | Aurelius v15: aura showcase and pipeline section |
| 2026-11-26 | `32c1fa1` | Stop inlining the whole app into index.html |
| 2026-11-26 | `cebc4ab` | Deploy v14 as a static site and keep the agent link working |
| 2026-11-26 | `9bbb5d4` | Replace site with Aurelius v14 (Vite + React build) |
| 2026-11-26 | `cf74725` | Showcase landing, library filter dock, Yoru/Folio/Aphelion samples, pricing to $80 |
| 2026-11-26 | `82a31da` | Upgrade Next.js 16.4.2 → 16.4.6 for a published security advisory |
| 2026-11-26 | `6222990` | Fail cleanly without a database or payment provider |
| 2026-11-26 | `b93fdc9` | Lift the Skill Studio dock clear of the Netlify badge |
| 2026-11-26 | `d587203` | Ignore the local .netlify folder |
| 2026-11-26 | `c583c18` | Aurelius v13: three tiers, services page and the agent link |
| 2026-11-26 | `fc74816` | Aurelius v12: the skill is the product |
| 2026-11-26 | `aa24a7d` | Aurelius v11: the skill becomes the product |
| 2026-11-25 | `024caa5` | Aurelius v10: Next.js shell and the aura-3d-web skill |
| 2026-11-25 | `ddf32b6` | Aurelius v9: bundles and a registry polish pass |
| 2026-11-25 | `47578c6` | Add ABOUT.md back, rewritten for the v8 single-file build |
| 2026-11-25 | `d2cacfc` | Aurelius v8: back to a single-file Vite build with the full registry |
| 2026-11-25 | `c800cbb` | Aurelius v7: Next.js App Router port with component registry |
| 2026-11-25 | `d57e361` | Aurelius v6: scrub-driven library and expanded demo set |
| 2026-11-25 | `f2ab508` | Aurelius v5: aurora hero scene and library page |
