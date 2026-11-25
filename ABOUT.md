# Aurelius — Meshdrop

A marketplace of **pre-built, scroll-driven 3D website templates** that you download as plain code. The product is branded **Meshdrop** (`meshdrop.dev`); the repository/project codename is **Aurelius**. This is the **v2** rewrite — a fully client-side, single-file React app (v1 was a Next.js + PostgreSQL app).

> Tagline: *"Pre-built 3D websites for vibecoders."*
> Pitch: skip the 40-prompt AI marathon. The shaders, camera rails and layouts are already written, tested and debugged — download a zip, edit a `CONFIG` object and the copy, ship.

---

## 1. What it is

Meshdrop sells/gives away cinematic Three.js website templates aimed at real use cases — portfolios, clinics, architecture studios, law/finance firms, travel, blogs, restaurants, wellness, product launches, SaaS, agencies, games and storytelling.

Key principles:

- **No AI at runtime.** Every template is hand-written, deterministic code. There is no model behind the site.
- **No build step for the buyer.** A downloaded template is static HTML + CSS + JS with Three.js vendored locally — it runs offline from any static server.
- **Live previews, not screenshots.** Every gallery card and detail page runs the *real* template in an iframe.
- **AI-friendly, not AI-dependent.** Each zip ships ready-made prompts and an `AI_CONTEXT.md` so an AI coding tool can understand the project in a few hundred tokens instead of exploring the whole codebase.
- **Token savings as the selling point.** The site counts lines/characters of each template and markets "≈ Nk tokens your AI no longer has to generate."

---

## 2. Two distinct codebases in one repo

It is important to separate the **storefront app** from the **templates it distributes**:

| | Storefront (this app) | Templates (the product) |
|---|---|---|
| Location | `src/`, `index.html`, `vite.config.ts` | `public/demos/<slug>/` |
| Stack | React 19 + Vite 7 + Tailwind 4 + TypeScript | Vanilla HTML/CSS/JS + Three.js (ES modules) |
| Build | `vite build` → **one self-contained HTML file** | None — served as-is, no bundler |
| Purpose | Browse, preview, read source, download zips | The actual websites buyers run |

The storefront bundles the template source **as raw text** into its single HTML output, then reassembles each demo on the fly for previews and zips (see §5).

---

## 3. Tech stack

**Storefront**
- [Vite 7](https://vite.dev) + [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react)
- React 19 / React DOM 19
- Tailwind CSS 4 via `@tailwindcss/vite`
- TypeScript 5.9
- [`vite-plugin-singlefile`](https://github.com/richardtallent/vite-plugin-singlefile) — inlines all JS/CSS so the build is a single `index.html`
- [`jszip`](https://stuk.github.io/jszip/) — builds download zips in the browser
- `clsx` + `tailwind-merge` (via `src/utils/cn.ts`)
- Self-hosted fonts via Fontsource: Inter (variable), Space Grotesk (variable), JetBrains Mono
- Path alias `@` → `src/`

**Templates**
- Three.js `^0.170` (vendored under `public/demos/_vendor/`, MIT) + post-processing add-ons (EffectComposer, RenderPass, UnrealBloomPass, OutputPass, ShaderPass, etc.)
- A shared engine `public/demos/_shared/core.js` and design system `_shared/base.css`
- Loaded through an **import map** (`three`, `three/addons/`, `@core`) — no npm, no bundler

**Backend:** none. v2 has **no server and no database**. Download/prompt counters and template requests are stored in `localStorage` (best-effort). See §7.

---

## 4. Directory structure

```
Aurelius v2/
├─ index.html                 app entry (mounts /src/main.tsx)
├─ vite.config.ts             react + tailwind + singlefile plugins, @ alias
├─ tsconfig.json
├─ package.json
├─ public/
│  └─ demos/
│     ├─ _shared/
│     │  ├─ core.js           reusable 3D engine (imported by every template)
│     │  └─ base.css          shared design system (typography, layout, HUD, reveals)
│     ├─ _vendor/             vendored three.js + addons (works offline)
│     │  ├─ three.module.min.js
│     │  └─ addons/{postprocessing,shaders,utils}/…
│     └─ <slug>/              one folder per template
│        ├─ index.html        markup: nav, scroll sections, loader, labels
│        ├─ style.css         per-template theme (colours + fonts)
│        └─ main.js           the 3D scene — starts with a CONFIG object
└─ src/
   ├─ main.tsx                React root
   ├─ App.tsx                 Router + nav + routes + footer
   ├─ index.css               Tailwind theme tokens + global styles
   ├─ pages/
   │  ├─ Home.tsx             hero, marquee, "find your template", how-it-works, gallery, token maths, prompts teaser, FAQ, request form
   │  ├─ TemplatePage.tsx     live preview, specs, prompts, source viewer, quickstart, prev/next pager
   │  └─ PromptsPage.tsx      full general prompt library, grouped by category
   ├─ components/
   │  ├─ chrome.tsx           SiteNav + SiteFooter
   │  ├─ gallery.tsx          filterable grid of live template cards
   │  ├─ live-preview.tsx     HeroBackdrop (home hero) + preview helpers
   │  ├─ preview-frame.tsx    full interactive demo iframe on detail pages
   │  ├─ code-viewer.tsx      tabbed source viewer (main.js / index.html / style.css)
   │  ├─ copy-button.tsx      copy-to-clipboard, bumps prompt counter
   │  └─ request-form.tsx     "missing a world?" idea capture
   ├─ lib/
   │  ├─ site.ts              SITE name/domain/tagline — single place to rebrand
   │  ├─ templates.ts         Template type + TEMPLATES catalogue + FILTERS
   │  ├─ files.ts             raw bundling, metrics, zip builder, README/PROMPTS/AI_CONTEXT/LICENSE generation
   │  ├─ demo.ts              runtime assembly of a demo into a self-contained iframe document
   │  ├─ router.tsx           tiny hash router (Router, Link, navigate, usePath)
   │  ├─ prompts.ts           general prompt library + {name} fill helper
   │  └─ stats.ts             localStorage counters + request storage
   └─ utils/cn.ts             clsx + tailwind-merge class helper
```

---

## 5. How the single-file build + live previews work

This is the cleverest part of the architecture.

1. **Raw bundling** — `src/lib/files.ts` uses
   `import.meta.glob("/public/demos/**/*.{html,css,js}", { query: "?raw", eager: true })`
   to inline *every* demo file as a string at build time. Combined with `vite-plugin-singlefile`, the whole app (storefront + all template source + vendored Three.js) ships as **one `index.html`**.

2. **Runtime demo assembly** — `src/lib/demo.ts` reconstructs a runnable demo document from those strings:
   - Vendored modules become `blob:` URLs wired together through a generated **import map**; relative imports between add-ons are rewritten to bare specifiers (blob URLs can't resolve relatives).
   - `base.css`, the template's `style.css` and `main.js` are inlined; `</script>` sequences are escaped.
   - `core.js` reads `location.search` for `?embed=…`/`?period=…`; since a blob page has no query string, the relevant query is **baked into** the source.
   - Results are cached (`vendorMap`, `coreCache`, `docCache`, `htmlCache`).

3. **`file://` fallback** — opened straight from disk, the page has an opaque origin and `blob:` URLs are blocked. `demo.ts` detects `location.protocol === "file:"` and switches to `data:` URLs + iframe `srcdoc`, so previews still work when the HTML is double-clicked.

4. **Embed modes** — `core.js` supports `?embed=card` (auto-playing gallery thumbnail) and `?embed=bg` (ambient hero backdrop, e.g. the Warpgate template behind the home hero).

---

## 6. The template catalogue (18)

Each entry in `src/lib/templates.ts` carries: `slug`, `name`, `tagline`, `blurb`, `tags`, `gpu` (Light/Medium/Heavy), `theme` (Dark/Light), `accent`, `bg`, `sections`, `bestFor`, `techniques`, `interactions`, and three template-specific `tweaks` (label + prompt).

| Slug | Name | Best for | GPU | Theme |
|---|---|---|---|---|
| `folio` | Folio | Portfolio / freelance | Medium | Dark |
| `clinic` | Vitalis | Clinics, dentists, medical | Medium | Light |
| `architect` | Plinth | Architecture & interiors | Medium | Light |
| `atlas` | Meridian | Travel, tours, destinations | Medium | Dark |
| `journal` | Quire | Blogs, magazines, newsletters | Light | Light |
| `saffron` | Saffron | Restaurants, cafés, bars | Heavy | Dark |
| `colonnade` | Gravitas | Law, finance, consulting | Medium | Dark |
| `stillwater` | Stillwater | Yoga, spas, wellness | Medium | Dark |
| `monolith` | Monolith | Cinematic product showcase | Medium | Dark |
| `neon` | Afterglow | Cyberpunk city / agency / SaaS | Medium | Dark |
| `nebula` | Aphelion | Galaxy-to-planet space journey | Heavy | Dark |
| `mercury` | Mercury | Liquid chrome blob hero | Medium | Dark |
| `dune` | Dunemark | Desert golden-hour monument | Medium | Dark |
| `abyss` | Pelagic | Deep-ocean descent | Medium | Dark |
| `prism` | Prismatic | Refracting glass crystals | Heavy | Dark |
| `warp` | Warpgate | Hyperspace tunnel + HUD | Light | Dark |
| `hollow` | Hollow | Moonlit forest / retreats | Medium | Dark |
| `atrium` | Atrium | Curved 3D gallery carousel | Light | Light |

Gallery filters (`FILTERS`): All, Portfolio, Medical, Architecture, Professional, Travel, Blog, Food & Drink, Wellness, Product, SaaS, Agency, Gaming, Space, Nature.

### Shared engine — `_shared/core.js`

Every template imports this stable engine (buyers are told **not** to rewrite it). Exports:

- `THREE` — re-export of three.
- `boot(fn)` — runs the loader, calls `fn`, shows a styled fallback if WebGL fails.
- `createStage({background, fog, fov, bloom, exposure, grain, vignette, aberration, maxDpr})` → `{scene, camera, renderer, composer, onFrame, start, dpr}` (renderer + bloom + film post-FX).
- `createScroll()` → smoothed `progress` 0..1 + `velocity`; `createPointer()` → normalized `x,y`.
- `createRail(positions, targets)` → `.apply(camera, progress)` moves the camera along a Catmull-Rom path (one keyframe per scroll section).
- `createLabels(camera, [{el, anchor, dx, dy}])` → 3D-anchored DOM labels with SVG leader lines.
- `createEnv(renderer, panels)` procedural studio reflections; `lightShaft()`; `createNoise(seed)`; `rng(seed)`; `radialTexture()`; `GLSL_NOISE` (simplex `snoise` + `fbm`).
- Math helpers: `clamp`, `lerp`, `damp`, `smoothstep`.

**HTML contract:** `data-split` headings reveal word-by-word; `data-reveal` fades/blurs in; inline `--d` sets delay; `.sec` blocks are full-height scroll sections; `#loader` is the loading screen; `.dots` is the section nav.

---

## 7. Downloads, prompts and stats

### Zip generation (`src/lib/files.ts`)
`buildZip(t)` assembles `<slug>-3d-template.zip` entirely in the browser with JSZip:
- `index.html` (paths rewritten `../_vendor/`→`./vendor/`, `../_shared/`→`./shared/`), `style.css`, `main.js`
- `shared/core.js`, `shared/base.css`
- `vendor/` — all vendored Three.js + add-ons
- Generated docs: `README.md`, `PROMPTS.md`, `AI_CONTEXT.md`, `LICENSE.txt`
- A minimal `package.json` whose `dev`/`start` script is `npx --yes serve -l 3000 .`

`downloadTemplate(t)` builds the blob, triggers a download, revokes the object URL, and bumps the download counter.

### Prompt system (`src/lib/prompts.ts` + per-template `tweaks`)
- **12 general prompts** grouped by category (Content, Style, 3D, Port, Performance): rebrand/copy, colour palette, typography, drop in a `.glb`, add a scroll section, port to Next.js, port to React+Vite, mobile performance, ambient audio, wire a real form, accessibility/fallbacks, deploy to Vercel/Netlify. `{name}` is replaced with the template name in each zip's `PROMPTS.md`.
- **3 template-specific prompts** per template (the `tweaks` array).
- Every zip includes `AI_CONTEXT.md` — a condensed brief (stack, rules of engagement, `core.js` exports, HTML contract, this template's techniques) so an AI tool skips a full codebase exploration pass.

### Stats (`src/lib/stats.ts`) — no server
- Key `meshdrop:stats:v1` in `localStorage`: per-slug `{downloads, promptCopies}`.
- Key `meshdrop:requests:v1`: array of `{idea, email, at}` from the request form.
- All writes are best-effort (wrapped in try/catch). Counters are per-browser, not global.

---

## 8. Routing & pages

A tiny **hash router** (`src/lib/router.tsx`) — required because the whole site is one static HTML file. Routes live after `#`:

- `#/` → `Home`
- `#/templates/<slug>` → `TemplatePage`
- `#/prompts` → `PromptsPage`

Links may carry an in-page anchor (e.g. `/#gallery`, `/templates/atrium#prompts`); `navigate()` smooth-scrolls to the anchor after the route renders. `Link` intercepts plain left-clicks but respects modifier keys / `defaultPrevented`.

---

## 9. Running & building

```bash
npm install

npm run dev        # Vite dev server (storefront with live previews)
npm run build      # → dist/index.html  (ONE self-contained file)
npm run preview    # serve the production build locally
```

Requirements: Node 18+ (Vite 7). No environment variables, no database, no API keys.

**Deploy:** the build is a single static `index.html` — drop it on any static host (Vercel, Netlify, GitHub Pages, S3, or just open the file). Because of the `file://` fallback in `demo.ts`, previews even work when opened directly from disk.

**Running a downloaded template:** unzip, then `npx serve .` (or any static server) and open the printed URL. ES modules require HTTP — double-clicking a template's `index.html` will not work (the storefront itself is the exception, thanks to the fallback).

---

## 10. Customizing the storefront

- **Rebrand:** edit `SITE` in `src/lib/site.ts` (name, domain, tagline, description). The zip README/LICENSE and UI pull from here.
- **Add a template:**
  1. Create `public/demos/<slug>/{index.html,style.css,main.js}` (import `@core`, follow the HTML contract).
  2. Add an entry to `TEMPLATES` in `src/lib/templates.ts` (include 3 `tweaks`).
  3. It is automatically bundled, previewable, downloadable and counted — no other wiring needed.
- **Theme tokens:** Tailwind theme + global styles live in `src/index.css` (`bg`, `fg`, `dim`, `line`, `surface`, `lime`, etc.).
- **Prompts:** edit `src/lib/prompts.ts` (general) or a template's `tweaks` (specific).

---

## 11. License

Templates are released under the **Meshdrop Template License** (generated into each zip as `LICENSE.txt`):
- Unlimited personal and commercial use, including client work.
- You may **not** resell/redistribute the template files themselves as a template, theme or kit.
- Bundled third-party code: Three.js (MIT, © three.js authors).
- Provided "as is", no warranty.

The storefront source itself has no separate license file in this repo — add one if you intend to open-source the app code.

---

## 12. Notable design decisions & gotchas

- **Single-file output** is deliberate: the entire marketplace (all 18 templates + vendored Three.js) is portable as one HTML file. This drives the raw-glob + runtime-assembly design.
- **Blob vs data URLs:** previews use `blob:` over HTTP and `data:`/`srcdoc` over `file://`. Don't "simplify" this — it's what makes double-click-to-open work.
- **Import-map rewriting:** relative imports between vendored add-ons are converted to bare specifiers because blob URLs can't resolve relative paths.
- **No backend by design (v2):** counters/requests are local-only. If you need real analytics or a mailing list, you must add a server/API — v1 used PostgreSQL + Drizzle.
- **`core.js` is a stable contract:** templates and the generated `AI_CONTEXT.md` depend on its exports; changing its API breaks every template and the buyer docs.
- **GPU ratings** (Light/Medium/Heavy) are surfaced on every card and detail page; Heavy templates (Saffron, Aphelion, Prismatic) use transmission/bloom/large particle counts and target desktop/recent phones.
---

## Additions in this fork

- **Interactive preview cards** (`components/gallery.tsx`, `live-preview.tsx`, `lib/demo.ts`): every gallery card is a browser frame around the live template. Hovering shows an "Open interactive preview" affordance and moving the cursor across the card scrubs through the site (the card iframe receives `postMessage({ md: "scrub", p })`, handled by a tiny bridge injected into `embed=card` documents). Search + category filters sit above the grid.
- **6 new templates** for new categories: `resonance` (Music), `atelier` (Fashion), `domus` (Real Estate), `lyceum` (Education), `apex` (Automotive), `ledger` (Crypto / Fintech). Same engine, same HTML contract, same CONFIG-at-the-top structure.
- **Prompt library** (`lib/library.ts`, `pages/PromptsPage.tsx`): 58 prompts in 11 categories with search, `[field]` fill-in inputs (remembered), favourites and "copy all favourites".
- **Vibe toolkit** (`pages/ToolsPage.tsx`): rules-file generator (AGENTS.md / CLAUDE.md / .cursorrules), kickoff prompt builder, bug → prompt, token counter, palette → tokens with contrast checks, ship checklist. All client-side, persisted in localStorage.
- **⌘K / Ctrl+K command palette** (`components/command-palette.tsx`) to jump to any template, prompt or tool.
- Simpler home page: gallery directly after the hero, one toolkit section instead of the prompts teaser.

---

## Additions in the design-pass fork

- **Information architecture:** Home (landing page) · `#/landing-pages` (24 templates) · `#/pages` + `#/pages/<slug>` (9 functional app pages) · `#/elements` + `#/elements/<slug>` (10 interactive elements) · prompts · tools. ⌘K indexes all of it.
- **Apex rebuilt:** the car is now a lofted, superellipse-section body with a tumbled-in glass cabin, proper wheels, LED light signature and a camera path that keeps it clear of the copy.
- **Landing kit (`core.js → landingKit()` + `base.css`):** every scroll template gets a conversion footer (link columns, validated newsletter capture, legal row), a nav CTA that fills with the accent past the hero, and a sticky mobile CTA. Scroll progress now ends at the last scene, so the footer never moves the camera. Atrium (no scroll scenes) opts out and gets a hero headline + CTAs instead.
- **App pages / elements:** single self-contained `.html` files in `src/demos/pages|elements/`, bundled with `import.meta.glob(?raw)`, previewed via iframe `srcdoc`, downloadable as-is. Metadata lives in `src/lib/collections.ts`.


---

## Aurora redesign (this build)

- **Rebrand:** product is now **Project Aurelius** (`src/lib/site.ts`). Palette moved from lime-on-black to an aurora night sky: mint `#5cffc4`, teal `#3de7ff`, violet `#a58bff`, rose `#ff7ad9` and a gold `#ffd28a` ("aurum") accent. Tokens live in `src/index.css`.
- **Landing page (`pages/Home.tsx` + `components/aurora-scene.tsx`):** a real Three.js world behind the page — shader-driven aurora curtains snaking over a mirror lake and mountain horizon, stars, drifting dust and bloom. The camera rides a Catmull-Rom rail driven by scroll (hero → manifesto → live specimens → anatomy → portal). Scroll-lit manifesto, pointer-tilting live template cards.
- **Library (`pages/LibraryPage.tsx`, route `#/library`):** the navigation hub — search/⌘K, intent-based "where to start", a bento of the five shelves, browse-by-use-case chips and the request form. A `LibraryTabs` bar keeps every shelf one click away.
- **Same scene, two modes:** `journey` on Home, `ambient` drift on the Library (the canvas persists across the route change). Other pages use a cheap CSS aurora so shelves with many live iframes stay fast.
- **Purged:** marquee, find-your-template quiz, token-maths block, FAQ and the old lime hero backdrop.
- **Apex → Apex Kestrel:** the car is rebuilt as an original wedge hypercar (chamfered lofted sections, falcon-brow light blades, turbine wheels, active rear wing that tilts with scroll speed) in lagoon-pearl paint with mint light signature.
