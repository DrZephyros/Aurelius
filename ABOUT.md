# Project Aurelius

**v12 — the skill is the product.** Aurelius sells *AURA*, an agent skill that makes Claude / Codex / Cursor design and build $10,000-grade, scroll-driven 3D websites for any subject. Templates are now proof (a library to study), not the product.

## What's here
| Route | What |
| --- | --- |
| `/` | Skill-first home: live NOCTA world, the 12 directions, examples, two CTAs (get the skill / request a site) |
| `/skill` | The skill landing page: capabilities, vs. "just asking", 12 art directions, 7 worked examples, pipeline, file index (🔒 = paid), free samples, free brief composer, **$10 pricing**, install, FAQ |
| `/skill/checkout` → `/skill/download` | Email → `POST /api/orders` → Stripe Checkout (if `STRIPE_SECRET_KEY` is set) **or** instant "test mode" order → token-gated downloads |
| `/request` | "Request a website from me" form → `POST /api/requests` (Postgres `site_requests`) |
| `/bundles`, `/landing-pages`, `/templates/<slug>`, `/pages`, `/elements`, `/components`, `/text-effects`, `/prompts` | Showcase + library (study & steal) |

Navigation uses **real URLs** (History API router in `src/lib/router.tsx`, one Next catch-all route `src/app/[[...slug]]/page.tsx`); old `#/…` links are upgraded automatically.

## Payments & delivery
- `POST /api/orders {email}`: with `STRIPE_SECRET_KEY` → creates a Stripe Checkout Session over REST (no SDK) and stores it; `GET /api/orders/verify?session_id=` confirms payment and returns the download token. Without the key the order is recorded as `preview` and unlocks immediately (clearly labelled in the UI).
- `GET /api/download?token=&kind=skill|starter|single` streams the zip / single-file markdown. The full skill text lives only in `src/generated/raw-skill.ts`, imported **only** by `src/lib/skill-server.ts` (`server-only`). The browser bundle gets `raw-skill-public.ts`: a file index + the free sample files.
- Tables (`src/db/schema.ts`): `skill_orders`, `site_requests`.

## The skill (`skill-src/aura-3d-web`)
v2 adds: Direction Lock (Phase 1a) + `references/11-art-directions.md` (12 directions), `12-product-hero-playbook`, `13-portfolio-and-brand-playbook`, `14-premium-delivery` (the $10k standard), `15-shader-recipes`, `examples/` (7 worked briefs), new prompt-pack entries, and starter modules `studio.ts` (designed env map + product rig + contact shadow), `rock.ts` (asteroid ground), `objects.ts` (earbuds with exploded parts, dial, bottle), `scene.halo.ts` + `HaloExperience.tsx` (world #3, `?world=halo`), `snap()`/`spring()` in `choreo.ts`. Engine fix: `window.__aura` is no longer deleted by a StrictMode double-mount.
Tested by running the starter under Vite in headless Chromium (software GL), seeking `__aura.seek(p)` and reading contact sheets — which caught a blue-tinted product, blown-out bloom and z-fighting, all fixed.

## Previews
Template cards show a rendered poster (`public/posters/<slug>.jpg`) instantly; the live WebGL scene boots only for the hovered/focused card, with a 16 s timeout back to the poster.

## Run
```bash
npm install
npm run dev     # or: npm run build && npm start
```
Env: `DATABASE_URL` (Postgres), optional `STRIPE_SECRET_KEY`.

---
(Older notes about the v8 single-file build follow; the component registry, templates and bundles work as described there, except routing is now path-based and there is a database.)

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
