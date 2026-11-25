# Project Aurelius

Cinematic scroll-driven 3D website templates, app pages, a **modular library of drop-in React components**, **text effects**, prompts and vibe-coding tools — all as plain code. This repo is the Next.js (App Router) port of [DrZephyros/Aurelius](https://github.com/DrZephyros/Aurelius). The original ABOUT is kept in `docs/ABOUT-vite-original.md`.

## Routes

| Route | What |
| --- | --- |
| `/` | Landing page. The three specimens (Apex, Aphelion, Prismatic) are full-bleed: **scrolling the page scrolls the real template** (no slider) |
| `/library` | Hub for every shelf, search, request form |
| `/landing-pages`, `/templates/[slug]` | 24 three.js templates (zip download via `/api/download/template/[slug]`) |
| `/pages`, `/pages/[slug]` | 12 single-file app pages |
| `/elements`, `/elements/[slug]` | 9 single-file interactive elements (the useless "type playground" was removed) |
| `/components`, `/components/[category]/[slug]` | **Modular component library** — 50 components in 9 categories |
| `/text-effects`, `/text-effects/[slug]` | **Text effects** — 9 effects you import onto any text |
| `/prompts`, `/tools` | 58 prompts, 6 toolkit tools |
| `/api/registry/download` | zips: all · `?category=` · `?category=&slug=` |

## Architecture

- **Templates**: static projects in `public/demos/<slug>/` (vanilla JS + vendored three.js). Served as-is and iframed. `core.js` understands `?embed=card|bg|scroll`; `card` and `scroll` install a `postMessage` bridge (`{md:"scrub",p}` / `{md:"pointer",x,y}`).
- **Landing specimens** (`components/specimen.tsx`): a tall track + sticky stage. The iframe's own document height sets the track height 1:1; the page scroll position is streamed to the iframe, which eases to it. The iframe is mounted only while near the viewport.
- **App pages / elements**: single `.html` files in `kit-src/`, served by `app/kit/[kind]/[slug]/route.ts` (injects the scrub bridge for `?embed=card`).
- **Component registry** (`src/registry/<category>/<slug>/`): `<slug>.tsx` (the component) · `README.md` (agent instructions, generated from a spec) · `demo.tsx` (site preview only, not shipped). `scripts/generate.mjs` (run automatically from `next.config.ts`) builds `src/generated/registry.json` and `src/registry/demos.ts`. The site renders the **real** component source, so the preview can never drift from the download.
- **Downloads**: `lib/registry-server.ts` zips item / category / everything; the master and category zips include an agent guide README.

## Adding a component

1. Create `src/registry/<category>/<slug>/<slug>.tsx` (`"use client"`, React only, self-contained `<style>` with `au-` classes, honour `prefers-reduced-motion`).
2. Add `demo.tsx` (default export) and a `README.md` starting with frontmatter (`name`, `tagline`, `tags`, `deps`, `order`). `scripts/unbundle.mjs` can generate the README from a JSON spec.
3. Restart / rebuild — it appears on the site, in ⌘K, in the zips.

## Naming

Template names are single evocative words, loosely sorted into two families: **Latin / classical architecture** for the human, structured ones (Plinth, Gravitas, Atrium, Domus, Lyceum, Vitalis, Quire, Atelier, Folio) and **astronomy / nature terms** for the cinematic 3D worlds (Aphelion, Meridian, Pelagic, Dunemark, Afterglow, Prismatic, Warpgate). The product itself — *Aurelius* — is Latin for "golden" (and a nod to aurora + aurum), which is why the palette is aurora mint with a gold accent. The theme is a feel, not a strict rule.

## Run

```bash
npm install
npm run dev      # next dev
npm run build && npm start
```
