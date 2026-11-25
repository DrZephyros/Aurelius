# Project Aurelius

Cinematic scroll-driven 3D website templates, app pages, a **modular library of drop-in React components**, **text effects**, prompts and vibe-coding tools — all as plain code. This is the **v8** rewrite: a fully client-side React app that Vite bundles into a **single HTML file** (`vite-plugin-singlefile`), so the whole site — templates included — runs from `file://` or any static host with no server.

## Routes

Routes live after the `#` (tiny hash router in `src/lib/router.tsx`).

| Route | What |
| --- | --- |
| `#/` | Landing page. The three specimens (Apex, Aphelion, Prismatic) are full-bleed: **scrolling the page scrolls the real template** (no slider) |
| `#/library` | Hub for every shelf, search, request form |
| `#/landing-pages`, `#/templates/<slug>` | 24 three.js templates (zip download from the item page) |
| `#/pages`, `#/pages/<slug>` | 12 single-file app pages |
| `#/elements`, `#/elements/<slug>` | 9 single-file interactive elements |
| `#/components`, `#/components/<category>`, `#/components/<category>/<slug>` | **Modular component library** — 50 components in 9 categories |
| `#/text-effects`, `#/text-effects/<slug>` | **Text effects** — 9 effects you import onto any text |
| `#/prompts`, `#/tools` | 12 prompts, 6 toolkit tools (rules file, kickoff, bug→prompt, tokens, palette, ship checklist) |

## Architecture

The site ships as **one html file**, so nothing is fetched at runtime: every asset is bundled as raw text and assembled in the browser.

- **Templates** (`demos-src/<slug>/`): real multi-file projects (vanilla JS + vendored three.js under `demos-src/_vendor/`, shared engine in `demos-src/_shared/core.js`, imported as `@core`). `src/lib/demo.ts` builds each one into a self-contained document — vendored modules become `blob:` URLs wired via an import map (falling back to `data:` URLs under `file://`), CSS and JS inlined. `core.js` understands `?embed=card|bg|scroll`; `card` and `scroll` install a `postMessage` bridge (`{md:"scrub",p}` / `{md:"pointer",x,y}`).
- **Landing specimens** (`components/specimen.tsx`): a tall track + sticky stage. The iframe's own document height sets the track height 1:1; the page scroll position is streamed to the iframe, which eases to it. The iframe is mounted only while near the viewport.
- **App pages / elements** (`kit-src/pages/`, `kit-src/elements/`): single `.html` files, bundled as raw text and rendered in a frame (the scrub bridge is injected for `?embed=card`).
- **Component registry** (`src/registry/<category>/<slug>/`): `<slug>.tsx` (the component) · `README.md` (agent instructions, from a frontmatter spec) · `demo.tsx` (site preview only, not shipped). `src/generated/registry.json` is its manifest; `src/lib/registry-files.ts` imports every source as raw text so the site renders the **real** component source — the preview cannot drift from the download.
- **Downloads**: built in the browser with jszip (`src/lib/registry-files.ts`, `src/lib/files.ts`) for a single item, a category, everything, or a template. The master and category zips include an agent guide README, a license and shared conventions.

## Adding a component

1. Create `src/registry/<category>/<slug>/<slug>.tsx` (`"use client"`, React only, self-contained `<style>` with `au-` classes, honour `prefers-reduced-motion`).
2. Add `demo.tsx` (default export) and a `README.md` starting with frontmatter (`name`, `tagline`, `tags`, `deps`, `order`).
3. Add the item to `src/generated/registry.json` by hand — the v7 `scripts/generate.mjs` helper is no longer in the tree.
4. Rebuild — it appears on the site, in ⌘K and in the zips.

## Naming

Template names are single evocative words, loosely sorted into two families: **Latin / classical architecture** for the human, structured ones (Plinth, Gravitas, Atrium, Domus, Lyceum, Vitalis, Quire, Atelier, Folio) and **astronomy / nature terms** for the cinematic 3D worlds (Aphelion, Meridian, Pelagic, Dunemark, Afterglow, Prismatic, Warpgate). The product itself — *Aurelius* — is Latin for "golden" (and a nod to aurora + aurum), which is why the palette is aurora mint with a gold accent. The theme is a feel, not a strict rule.

## Run

```bash
npm install
npm run dev                    # vite dev server
npm run build                  # → dist/index.html, a single self-contained file
npm run preview
```

There is no database, no API and no server: the app reads nothing but what it bundles.
