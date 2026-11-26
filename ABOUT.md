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
| `#/prompts` | Prompt library |
| `#/bundles`, `#/bundles/<slug>`, `#/bundles/<slug>/<pricing\|signin\|reserve\|account>` | **Bundles** — Yoru, Helm, Altai: a full-screen scroll-driven WebGL landing (spline camera rail, bloom, FOV kick, banking) plus four working pages in the same theme. Source in `src/bundles/` (engine, scenes, data, pages) |

## The skill is part of the product (v11)

The product is no longer only templates — it is **the skill that makes them**. It is reachable from everywhere:

- **Skill Studio drawer** — a floating *Make your own* pill on every page (and ⌘J / Ctrl+J, and ⌘K → "Open the Skill Studio"). Brief an archetype, subject, audience, feeling, CTA, palette and length → a tailored agent prompt is composed live (`src/lib/studio.ts`), with copy / 1-line / download actions. One shared store, so the drawer, the home page and `#/make-your-own` edit the same brief.
- **"✦ Make one like this"** on every template page opens the Studio pre-filled from that template.
- **Home** shows the skill's real output live (`components/live-world.tsx` — the starter's *Umbra* and *Obsidian Gate* running in-page) and the inline Studio.
- **Agent-fetchable URLs:** `GET /skill.md` (single-file edition) and `GET /skill.zip` (installable folder) — `curl -L <site>/skill.zip -o aura.zip && unzip aura.zip -d ~/.claude/skills/`.

### What changed in the skill (`skill-src/aura-3d-web`)
- Engine: deterministic QA hook `window.__aura.seek(p)` / `info()` / `?p=`; first chapter visible in frame one and last chapter stays (the starter used to end on an empty frame); `fitType()` measured giant type; calmer aberration; render stats.
- New helpers: `atmosphere.ts` (sky with eclipse + stars, light shafts, glow, haze), `terrain.ts` (dunes + `heightAt`).
- New reference world **Umbra** (`scene.umbra.ts`, `UmbraExperience.tsx`; run with `?world=umbra`) next to Obsidian Gate.
- `scripts/audit.mjs` replaces the old screenshot script: per-frame metrics, chapter collision / empty-first-or-last-frame / missing-CTA checks, shot-list lint, no-WebGL + reduced-motion tests, contact sheets, automated score (80 pts; the other 20 are art-direction).
- `references/10-frontier-techniques.md` (raymarched heroes, GPU particles, 2.5D, cinematic type, camera craft, WebGPU, splats, world recipes, failure-mode table) and a *verification contract* in `SKILL.md`.

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

## Bundles

`src/bundles/engine.ts` is the cinematic runtime (damped scroll playhead → Catmull-Rom camera rail). Each scene in `src/bundles/scenes/` returns `{ scene, rail, update }`. All copy, prices and theme tokens live in `src/bundles/data.ts`. The Tools page was removed.
