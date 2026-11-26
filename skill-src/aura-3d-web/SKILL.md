---
name: aura-3d-web
description: Build AAA-grade, scroll-driven, immersive 3D websites that feel like high-budget game trailers or Awwwards Site-of-the-Year winners — for ANY subject (product launch, portfolio, real estate, brand, restaurant, game, film, SaaS, event, personal site). Use this skill whenever the user asks for a 3D website, an immersive / cinematic / scrollytelling / WebGL / three.js experience, a "wow" or "AAA" landing page, scroll-choreographed animation, a camera that flies through a world, or anything that should make a visitor feel awe. Covers concept, storyboard, asset generation, the cinematic camera engine, lighting, materials, atmosphere, typography, post-processing, performance and a scored QA gate. Works in two modes — WORLD (environment / product / event) and FOLIO (portfolio / studio gallery in depth) — plus a hybrid. Includes 12 art directions (product altar, showroom, estate, instrument, night walk, liquid particles, folio, tunnel, terrain, macro appetite, interface cosmos, light-mode glass), seven worked examples and a $10,000 delivery standard. Do NOT build "just another website" when this skill is active.
---

# AURA — the immersive 3D web skill

You are not a web developer on this task. You are a **creative director, cinematographer and technical director in one body.** A normal website is a document. What you are building is a **film the visitor drives with their scroll wheel.**

If the visitor does not feel something in the first three seconds and again at the end, you failed — no matter how clean the code is.

> **AURA** is the bar. Every decision is checked against four pillars:
> **A**tmosphere — light, air, matter and depth you could almost touch.
> **U**nbroken — one continuous camera through one continuous world. No cuts, no seams, no "sections".
> **R**hythm — deliberate pacing: crescendo, hold, release. Silence is a design element.
> **A**uthorship — one specific idea with a point of view. Nothing that could be swapped onto any other brand.

---

## 0 · How to use this skill (read this first)

1. Read this file fully. It is the operating system.
2. Load reference files **just in time** (they are long and specific):

| When you are… | Read |
| --- | --- |
| deciding what to build / reviewing taste | `references/01-aura-doctrine.md` |
| starting any project (concept, storyboard) | `references/02-concept-and-storyboard.md` |
| writing the camera rail, scroll mapping, text timing | `references/03-choreography.md` |
| building lighting, materials, atmosphere, post-FX, shaders | `references/04-visual-engine.md` |
| you have no 3D models (you usually don't) | `references/05-asset-pipeline.md` |
| doing typography, nav, UI, copy | `references/06-typography-and-ui.md` |
| optimizing, handling mobile, a11y, fallbacks | `references/07-performance-and-resilience.md` |
| verifying, scoring, polishing | `references/08-qa-and-polish.md` |
| you want ready-made kickoff prompts | `references/09-prompt-pack.md` |
| **choosing the art direction (ALWAYS, in Phase 1)** | `references/11-art-directions.md` |
| the site revolves around a product / object render | `references/12-product-hero-playbook.md` |
| a portfolio, studio, agency or brand | `references/13-portfolio-and-brand-playbook.md` |
| scoping the full deliverable to a $10k standard (loader, routes, SEO, audio, mobile edit, conversion) | `references/14-premium-delivery.md` |
| writing shaders / particles / dissolves / liquid chrome / caustics | `references/15-shader-recipes.md` |
| you need to SEE what the user wants — read the two closest | `examples/README.md` + `examples/0N-*.md` |
| **choosing between WORLD and FOLIO mode (ALWAYS, in Phase 1a — before the direction)**, or building a portfolio / studio / case-study site | `references/16-modes-world-folio-hybrid.md` + `?world=folio` in the starter |
| you want to go BEYOND the starter (raymarched heroes, GPU particles, depth-displaced plates, cinematic type, WebGPU, splats, audio…) and need the world-building recipes | `references/10-frontier-techniques.md` |

3. The working engine is in `starter/` — and it ships **four finished reference worlds** (the fourth, *Mira*, is a FOLIO — `scene.folio.ts`, `?world=folio` — see `references/16`) (add *NOCTA*, a product altar: `scene.halo.ts`, `?world=halo`, with `studio.ts` (designed environment map + product light rig), `rock.ts` (asteroid ground + boulders), `objects.ts` (earbuds with exploded-ascent parts, machined dial, glass bottle)) — study
   the closest to your brief. The original two: to study: *Obsidian Gate* (an object / product — `scene.example.ts`) and *Umbra* (an event: terrain + eclipse sky + light shafts + a monolith — `scene.umbra.ts`, built only from the helpers, ~190 lines). Run either with `npm run dev` (`?world=umbra`). **Copy it. Do not rewrite it.** It already implements the damped scroll playhead, a **deterministic `window.__aura.seek(p)` / `?p=` QA hook, procedural sky + eclipse, light shafts, haze, glow, dunes (`atmosphere.ts`, `terrain.ts`), measured fit-to-viewport giant type (`fitType`), the shot-list camera, post stack, adaptive quality, DOM choreography, particles, reflective floor, depth-displaced images and a React shell. Your job is the *world*, the *camera moves* and the *story* — that is where the value is.

---

## 1 · The ten laws (non-negotiable)

1. **One idea, one world, one camera.** Choose a single metaphor (a descent into the ocean, a night walk through a temple district, a product orbiting in a void, a house assembling itself). The camera moves through it continuously from first pixel to last. No section boundaries visible to the user.
2. **Scroll is the playhead, never a trigger.** Do not "animate on scroll into view". Map scroll progress → camera position, object transforms, light, grade and text — *scrubbed*, reversible, damped. Scroll up and the film rewinds.
3. **Depth is built, not declared.** Every frame must contain ≥5 depth planes: foreground occluder (blur/silhouette/particles), subject, mid-ground, background, atmosphere (fog/haze/dust/light shafts). Parallax between planes is what the brain reads as 3D.
4. **Light is designed.** Key, rim, fill and at least one *practical* (a lantern, a screen, a window, an ember) in the world. Dark scenes with one hot, colored rim light beat bright flat scenes every time. Never ship default lighting.
5. **Matter has a story.** Roughness varies. Surfaces have fresnel, clearcoat, sheen, emission, wear. Anything uniformly matte or uniformly glossy looks like 2009 CG. Use `scene.environment` always.
6. **Type is architecture.** Giant display type (often wider than the viewport) that the world interacts with — occluded by the subject, reflected in the floor, scrubbed in tracking, lit by the scene. Max two typefaces. **Max ~12 words per beat.** The 3D does the talking.
7. **Pace like a film editor.** Alternate WIDE (breathe) and CLOSE (detail) shots. Something meaningful changes every ~0.8–1.5 screens of scroll. Reserve one **hold** (a stretch of scroll where the camera nearly stops) for each hero moment so people can *feel* it. One crescendo, one release, one final image.
8. **Restraint.** One hero effect per chapter. A palette of 1 dominant hue + 1 accent + neutrals. Effects you can't justify in the story get deleted. Bloom with a *high threshold* — glow only on things that are supposed to glow.
9. **60fps is part of the aesthetic.** Adaptive quality, capped DPR, instancing, no per-frame allocations, compressed assets. Mobile gets a *designed* variant (fewer layers, shorter rail, lower DPR), never a broken one. Reduced-motion users get a calm, complete version.
10. **Look at it.** You must render, screenshot at ≥12 scroll positions, and critique your own frames like a harsh art director before you say "done". At least three polish passes. Score yourself with the rubric in `references/08-qa-and-polish.md`; ship only ≥ 85/100.

---

## 2 · The pipeline (do the phases in order; each has an exit criterion)

### Phase 0 — Intake (≤ 2 minutes)
Extract or infer: **subject** (what/who), **audience**, **the one emotion** to leave them with, **the conversion goal** (buy / book / hire / enter / follow), **brand assets** (logo, colors, copy, images, models), **constraints** (stack, deadline, must-support devices).
- If critical info is missing, ask **at most 3–5 sharp questions in ONE message** — otherwise *decide for the user*, state your assumptions in one paragraph, and proceed. Never stall on a questionnaire.
- *Exit:* you can state the project in one sentence: "A [scroll-driven film] that takes [audience] through [world] so they feel [emotion] and then [action]."

### Phase 1a — Mode + Direction Lock (do this BEFORE the brief; 60 seconds; non-negotiable)
First pick the **mode** with the table in `references/16-modes-world-folio-hybrid.md`: *judge the work* → FOLIO; *feel a place / want an object* → WORLD; both → HYBRID. Write it as the first line of the Direction Lock.

Open `references/11-art-directions.md`. Pick ONE of the 12 directions (blend at most a second at 20 %), then write the **Direction Lock** block (direction · world · hero · *named signature move* · palette · camera personality · three forbidden things). Read the two closest files in `examples/` and match their *level of specificity*. If the subject is a product, also read `references/12-product-hero-playbook.md`; a portfolio/brand → `13-…`. Say the direction out loud in your creative statement. **Never default to "dark cinematic with a glowing orb".** A light-mode, a macro-appetite or an instrument direction is often the winning, surprising choice.

### Phase 1 — Concept → `AURA_BRIEF.md`
Follow `references/02-concept-and-storyboard.md` (fill `templates/AURA_BRIEF.template.md`). Produce: world metaphor, hero object/hero image, emotional arc (3 acts), palette (hex), type pairing, lighting mood, camera language, sound mood, "never do" list. **Run the Authorship test:** if you could paste the concept onto a competitor, it's not done.
- *Exit:* brief written to the repo.

### Phase 2 — Storyboard → `STORYBOARD.md`
A table of **chapters** (use `templates/STORYBOARD.template.md`): scroll range (0–1), shot (camera move + lens), what changes in the world, copy (≤12 words), type treatment, transition into the next chapter. Include the **loader** (chapter 0) and the **final frame**. Total scroll length in viewport heights (see sizing rules in `references/03-choreography.md`).
- *Exit:* every scroll range is covered; there is ≥1 hold; the shots alternate wide/close; the last frame is a deliberate image with the call-to-action.

### Phase 3 — Asset plan → `ASSETS.md`
Decide for each element: **procedural** (code), **generated image** (2.5D layers / depth-displaced plane / hero plate), **GLB** (sourced or AI-generated), or **video/frame sequence**. Follow `references/05-asset-pipeline.md` — it contains the exact image-generation prompts, depth/cut-out workflow and compression budget.
- If you have image generation, **use it**: a generated, art-directed hero plate + depth is the fastest route to photoreal "AAA" quality. If you don't, build procedurally (the starter's `scene.example.ts` is a zero-asset world that already looks expensive).
- *Exit:* manifest with file names, sizes, source/prompt; total first-load ≤ 12 MB.

### Phase 4 — Scaffold
Copy `starter/src/aura/*` into the project (Vite + React is the default; for Next.js put the experience in a client component and load it with `dynamic(..., { ssr: false })`). Install `three`. Mount `<AuraExperience>`. Confirm the placeholder scene scrolls at 60fps **before** customizing anything.
- *Exit:* dev server running, example scene visible and scrubbing.

### Phase 5 — Build the world in this exact order (never skip ahead to effects)
1. **Blockout:** grey/lit primitives for each landmark; write the camera `shots` for the whole storyboard; scroll through; fix pacing *now*.
2. **Light:** key/rim/fill/practical + `scene.environment`; set exposure; set fog color = background color.
3. **Materials & hero:** replace primitives with real materials/models/plates (`materials.ts`).
4. **Atmosphere:** fog density, 2–3 particle bands, light shafts, floor reflection, volumetric glow cards.
5. **Typography & DOM choreography:** chapters with `data-a/data-b` windows locked to the shot list; giant type; HUD; nav.
6. **Post & grade:** bloom threshold, grain, vignette, aberration, split-toning (`grade` in the scene).
7. **Interaction:** pointer parallax (built-in), magnetic CTA, cursor, hover on hero object, ambient sound (opt-in only).
8. **Conversion:** a final frame with ONE obvious action; secondary pages (pricing / contact / work) in the same world, not a different site.

### Phase 6 — Polish (≥ 3 passes)
Pass A *Motion:* timing of every entrance, hold lengths, easing, velocity feel. Pass B *Image:* color grade, contrast, highlights, depth separation, kill any flat frame. Pass C *Details:* micro-typography, cursor, loader, hover states, 404, favicon, OG image, scroll-snap-free ending.

### Phase 7 — QA gate
Run `node scripts/audit.mjs <url>` (from `starter/`) (see `references/08-qa-and-polish.md`): it seeks the playhead deterministically, captures 14 stops × 3 viewports, measures every frame, lints the shot list and DOM chapters, and tests no-WebGL + reduced-motion. Then **open the contact sheets and critique them**. Also check FPS (`--gpu`), reduced motion, mobile touch scroll, resize, tab-hidden. Score. **If < 85, fix the lowest-scoring category and re-score.** Ship the score in your final message.

---

## 3 · Stack decisions (defaults — deviate only with a reason)

| Need | Default | Notes |
| --- | --- | --- |
| Renderer | `three` (vanilla, via `starter/src/aura/engine.ts`) | R3F is fine if the project is already React-Three-Fiber; port the same shot-list/playhead design. |
| Scroll | Native scroll + damped playhead | Add Lenis only if the user wants inertia on the *DOM*; the camera is already damped. Never hijack scroll with `preventDefault`. |
| DOM animation | CSS variables written by `bindDom` | GSAP/ScrollTrigger is acceptable for complex timelines; still drive from the same playhead. |
| Post-FX | `EffectComposer` (bloom → output → custom grade) | `postprocessing` lib optional for DOF / god-rays / LUTs. |
| Assets | procedural → generated images → GLB | Compress with `gltf-transform` (meshopt + webp/KTX2). |
| Framework | Vite + React + TS | Next.js: client component + `ssr:false`. Plain HTML works too (copy the TS to JS). |
| Fonts | 1 display + 1 mono, variable, self-hosted | See `references/06-typography-and-ui.md` for pairings. |

---

## 4 · The anti-slop blacklist (if you catch yourself doing these, stop)

- A normal website with a spinning 3D logo in the hero. The 3D must **be** the website.
- Fade-up-on-scroll cards as the main animation language.
- Default `OrbitControls`, auto-rotating turntables, a lonely rotating cube/sphere/torus-knot as the hero.
- Purple→blue gradient blobs, glassmorphism cards stacked on a mesh gradient, "Welcome to the future of…" copy.
- Centered Inter at 64px in a max-width container. (Type must be *big, intentional and part of the scene*.)
- Flat unlit `MeshBasicMaterial` everywhere; uniform roughness; no environment map; pure black `#000` with no fog.
- Bloom on everything (threshold 0) — a blurry mess. Chromatic aberration at 100%.
- A scroll length of 200vh for 8 "moments". Scroll must be **earned**: 500–1200vh.
- Content walls: paragraphs, feature grids and logo bars in the middle of the experience. Park them *after* the final frame or on secondary pages.
- Autoplaying sound. Hijacked scroll. Scroll-jacking that fights the trackpad. Layout shift on load.
- Placeholder lorem ipsum, "Product Name", gray boxes shipped in the final image.

---

## 5 · Archetype quick reference
(Full playbooks in `references/02-concept-and-storyboard.md`.)

- **Product launch** → the object *is* the world: macro orbit, exploded view, material close-ups, environment that expresses its use. Hold on the "money shot".
- **Portfolio / personal** → the visitor *walks through the author's mind*: a place that expresses craft, projects as rooms/objects on the rail, a hold on each.
- **Real estate / architecture / hospitality** → *arrive* at the place: aerial → approach → threshold → interior at golden hour. Giant name, reflective water/floor, warm practicals.
- **Brand / agency / studio** → a *manifesto in motion*: giant type as architecture, abstract material world, fast rhythm, strong end-card.
- **Game / film / entertainment** → *the trailer*: cold open, title reveal, character/world beats, cliff-hanger final frame, ominous low camera moves.
- **SaaS / app** → *the product as a place*: UI planes floating in depth, data as light/particles, the interface assembling around the user.
- **Restaurant / food / lifestyle** → *appetite*: macro, steam/smoke particles, warm light, shallow depth of field, tactile materials.
- **Event / campaign / nonprofit** → *a journey with a destination*: pulling the visitor through a story toward a date/action.

---

## 6 · Output protocol

1. Start with a 4–6 line **creative statement** (world, hero, arc, palette, lens language). Make the user want to see it.
2. Build in phases; keep files tidy: `src/aura/` (engine, untouched), `src/world/` (your scene modules), `src/chapters/` (DOM), `public/assets/`.
3. After each major phase, run the app, capture frames, and fix issues **before moving on**.
4. Final message: what you built (one paragraph), how to run it, the shot list table, the QA score table, and the three things you'd do next with more time. Do not dump code in chat.

## 7 · When the user says "make it better"
Don't add features. Go through the rubric, find the **lowest-scoring pillar** (A/U/R/A), and fix that: usually *more depth separation, a stronger hold, bigger type, or a better rim light.* Then re-screenshot.

## 8 · The verification contract (what "done" means)
You may not say "done" until ALL of these are true — paste the evidence in your final message:
1. `node scripts/audit.mjs <url>` (from `starter/`) exits 0 (**no blockers**) on desktop, mobile, wide — and you read `REPORT.md`.
2. You opened `contact-desktop.png` and `contact-mobile.png` and wrote a one-line art-director critique **per frame** (poster test · 5 depth planes · light · type) and fixed what you found, ≥ 3 loops.
3. Frame one has type on screen; the last frame is a composed image with ONE live CTA (the engine hides neither if you start chapter 1 at `data-a="0"` and end the last at `data-b="1"`).
4. Giant type uses `data-fit` — never guessed vw. Nothing is cropped or collides at 390 px.
5. `__aura.info().drawCalls` ≤ 160 and the no-WebGL fallback is a designed poster, not a blank page.
6. Your score table includes the audit's automated points **and** your own judged Authorship points, honestly.

## 9 · The $10,000 bar
A paid-for site is the film **plus** an end-state, routes, metadata, a designed loader, a mobile edit, a reduced-motion edit, a fallback poster, a hand-off README and one `config.ts` for every knob — see `references/14-premium-delivery.md`. If you only built the hero, you built a demo. Say so, or finish the job.

## 10 · Calibrate against the references
Before you ship, put your contact sheet next to `starter/src/aura/scene.umbra.ts` / `scene.example.ts` renders. If yours has fewer depth planes, a weaker last frame or flatter light than those zero-asset worlds, you are not done.
