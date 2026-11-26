# 11 · Art directions — pick a lane BEFORE you pick a feature

Most "3D websites" fail because the agent never chose an **art direction**; it chose *technology*. A $10,000 site has a lane, a palette, a camera personality and one signature move you could describe in a sentence. This file is the catalogue. **Phase 1 of the skill makes you pick one (or blend two, with one clearly dominant) and write it into `AURA_BRIEF.md` as the _Direction Lock_.**

## How to choose (60 seconds)

| The client sells… | The visitor must feel… | Default direction |
| --- | --- | --- |
| a physical product (audio, wearable, device, bottle, shoe, cosmetics) | desire, precision, "I need that" | **01 Product Altar** — or **12 Glass Atrium** for light/soft goods |
| a car, watch, jewellery, a hero luxury object | status, polish, control | **02 Showroom Sweep** |
| a place (estate, hotel, resort, development, venue) | arrival, belonging, calm envy | **03 Dusk Arrival** |
| a tool with a dial: navigation, audio, finance, aviation, fitness, automation | competence, mastery | **04 The Instrument** |
| culture, hospitality, game, film, heritage, a restaurant with a soul | reverence, mystery, story | **05 Night Walk** |
| AI, an agency, a studio, entertainment, a bold brand | "this team is from the future" | **06 Liquid Particles** |
| a person (designer, dev, photographer, director) | taste, range, memorability | **07 Observatory Folio** |
| a manifesto, a label, a festival, a launch with attitude | adrenaline, belonging | **08 Void Tunnel** |
| a journey, event, outdoor brand, expedition, campaign | scale, awe, destination | **09 Terrain Epic** |
| food, drink, fragrance, a ritual | appetite, warmth, touch | **10 Macro Appetite** |
| software, fintech, data, infrastructure | clarity, power, trust | **11 Interface Cosmos** |
| fashion, wellness, skincare, a clinic, architecture studio, anything that should NOT be dark | serenity, luxury, air | **12 Glass Atrium** (LIGHT mode) |

If the brief doesn't fit: take the closest, then change **world**, **palette** and **signature move** until it's yours (Authorship test). Never ship a direction's reference world untouched.

> Every direction below lists a **Build recipe** referencing starter helpers. Everything is achievable zero-asset; where a generated plate or GLB makes it 3× better, it says so.

---

## 01 · Product Altar
*Feels like: a flagship earbuds / headphone / device launch where the object floats over a hostile, beautiful landscape.*
- **World:** the product placed in a **non-studio, story-bearing environment** — cratered asteroid, wet black basalt, frozen lake, desert dune at blue hour, brushed-steel machine hall. The environment says *how it feels to own it* (silence → asteroid; resilience → basalt; clarity → ice).
- **Hero:** ONE product with believable materials. Hold the money shot for ≥ 12 % of scroll.
- **Palette:** near-black dominant, desaturated cold environment, ONE accent taken from the product's glowing detail (LED, seam, lens).
- **Type:** tiny technical nav (mono, 10 px caps), a micro-spec rail on the side, one *huge* wordmark that the product overlaps (type behind object, object occludes). Feature names as small captions pinned to the object with leader lines.
- **Light:** hard cool key from a low angle that rakes the environment's relief, razor rim on the product edge, a tiny warm practical (the LED).
- **Camera:** macro orbit → pull back to reveal environment → exploded-anatomy (parts separate along an axis) → hero hold → end on a slow dolly toward a reserved CTA.
- **Signature move:** **the Exploded Ascent** — on a scroll window the product separates into 5–8 labelled parts that levitate on one axis with micro-rotations, then re-assemble as the camera pulls out.
- **Skeleton:** `0–.14` silhouette emerges from dark · `.14–.34` material macros (two) · `.34–.58` exploded anatomy · `.58–.72` environment reveal · `.72–.9` in-use / spec numerals counting · `.9–1` hero frame + CTA.
- **Build recipe:** `studio.ts → createStudioEnv + productRig`, `objects.ts → earbuds()`, `rock.ts → createRockGround` + `createBoulders`, `scene.halo.ts` is the finished reference.
- **Failure modes:** product too small in frame · glossy black on black (no rim) · env map missing (looks like plastic) · specs as a feature grid mid-scroll.

## 02 · Showroom Sweep
*Feels like: a hypercar reveal, a watch film, a jewellery campaign.*
- **World:** an infinite dark cyclorama with a mirror floor, and **light as the actor** — long softboxes sweep across the object's surfaces as the camera crawls.
- **Palette:** black, graphite, one metal tone (champagne / titanium / copper). Colour appears only inside highlights.
- **Light:** animated strip lights (`RectAreaLight` or emissive planes reflected in the clearcoat) moving along the body with scroll — the *reflection* tells the form.
- **Camera:** very slow 85–135 mm-equivalent (fov 14–24°) pushes with tiny lateral drift. Wide shots rare and deliberate.
- **Signature move:** **the Light Pass** — a single hard highlight line travels the full silhouette during one hold. People will scroll back to watch it again.
- **Build recipe:** `createMirrorFloor` with low roughness, `chrome()/obsidian()` + animated emissive strips, bloom threshold ≥ 0.92, `grade.contrast` 1.15.
- **Failure modes:** flat studio light · turntable rotation instead of camera moves · dust particles (dirty); keep the air *clean* here.

## 03 · Dusk Arrival
*Feels like: a $5k real-estate/hospitality reel — giant name, warm windows, still water.*
- **World:** a place at blue-hour with **water in the foreground**. The giant name sits BEHIND the building and is mirrored in the water.
- **Palette:** deep teal-navy sky, amber window glow, stone neutrals; the amber is the accent and the CTA colour.
- **Hero:** the building as 3 massed volumes with emissive windows that ignite sequentially with scroll (one per ~2 %).
- **Camera:** aerial descent → low skim over water → threshold (door/gate light) → interior golden-hour peek → final exterior frame.
- **Signature move:** **Windows Ignite** — each window lights on a stagger tied to scroll; reflections ignite below with 70 % opacity and ripple distortion.
- **Plate upgrade:** generate a photoreal dusk plate + depth (see `05-asset-pipeline.md`) and put procedural water, mist and ember particles in front. This is the single biggest quality jump of any direction.
- **Build recipe:** `createMirrorFloor` (water, with ripple normal), `createSky`, `createHaze`, instanced window quads (`emissive`), `createDepthPlane` for the plate.
- **Failure modes:** flat daylight · no foreground plane · a floor-plan carousel in the middle of the film (park it after the end frame).

## 04 · The Instrument
*Feels like: a nav compass / mixing-desk knob / watch complication — a precision dial as a hero, with HUD furniture.*
- **World:** a dark cockpit/bench with a single beautifully machined dial; ambient bokeh of the room behind (generated plate or blurred emissive sprites).
- **Hero:** a **dial with real knurling, bezel chamfers, engraved ticks** (see `objects.ts → dial()`), and a live numeric readout (HTML overlay) driven by scroll (heading 000→360°).
- **Palette:** teal-black body, amber/orange needle + tick glow, bone-white type.
- **Type:** mono readouts, tiny tracked labels, big "Find your HEADING." display line at left with the object at right.
- **Camera:** front-on hero, then oblique macro of the knurl, rotate the *dial* (not the camera) with scroll so numbers and ring spin in sync.
- **Signature move:** **Calibration** — scroll rotates the dial; a ring of ticks lights progressively; at hold points the dial "detents" (spring ease) and a section title swaps. The UI feels *mechanical*.
- **Build recipe:** `objects.ts → dial()`, `ring of instanced ticks`, `data-attributes → HUD`, snap using `choreo.snap()`.
- **Failure modes:** a flat 2D SVG dial (must be lit 3D) · readout out of sync with rotation · too many HUD elements (max 6 on screen).

## 05 · Night Walk
*Feels like: a Kyoto shrine at night, a game's opening, a ramen bar with a soul.*
- **World:** a **2.5D diorama** of 6–9 depth-separated layers (sky + moon, far mountains, shrine, mid gates, foreground grass, lantern bokeh) with real parallax from the camera dolly. Use generated layers (see `layers.ts`) when you have image generation; otherwise silhouettes with gradient + noise.
- **Palette:** bruise indigo, charcoal, ONE blood-red (moon, gates, particles), warm lantern amber as the only warm light.
- **Type:** giant serif or wide grotesk letters sliding *between* depth layers — letters pass behind the foreground grass and in front of the shrine.
- **Camera:** a slow forward walk with gentle vertical bob, FOV breath, roll ≤ 1°.
- **Signature move:** **Type Between Layers** — the title is sandwiched in z between foreground and background plates; scroll splits the letters apart as the camera passes through them.
- **Atmosphere:** embers/petals (two speeds), ground mist, a pulsing moon glow. Chapters are named places ("Temples / Gardens / Rituals / Afterglow").
- **Failure modes:** one flat illustration with CSS parallax (needs ≥ 6 planes) · red everywhere.

## 06 · Liquid Particles
*Feels like: an AI/agency site where a sculpture of light dissolves, reforms and reacts to the cursor.*
- **World:** a void with a **hero form made of ~120–400k GPU points** (statue silhouette, face, mask, planet, logo) that morphs between 3–4 target shapes with scroll, with floating glass panels carrying copy.
- **Palette:** blue-black, violet/ice cyan accent, a hot coral counter-light. Additive blending only on points.
- **Type:** wide, light-weight display; copy on glass cards with `backdrop-filter` + thin 1 px borders; micro labels.
- **Camera:** gentle parallax orbit driven by pointer, pushes in on scroll; form tilts to follow the cursor.
- **Signature move:** **The Dissolve** — at a chapter boundary the points curl-noise away, stream across screen, and settle into the next shape (see `15-shader-recipes.md → particle morph`).
- **Build recipe:** `createParticles` for dust; custom `Points` + `ShaderMaterial` morph (recipe), `layers.ts` for glass panels (canvas-textured quads or DOM overlay), bloom threshold 0.6.
- **Failure modes:** random noisy cloud with no readable form · every chapter the same shape · points too big (looks like confetti).

## 07 · Observatory Folio
*Feels like: a top designer's portfolio — a place that is the author's mind, with projects as objects on a rail.*
- **World:** an abstract architecture (observatory, gallery, atelier, library of light). Each project is an **object or framed plane in 3D space** the rail flies to; the cursor carries a soft light that reveals surface detail.
- **Palette:** 1 hue + neutrals. The *author's* taste in colour is the product — commit hard.
- **Type:** name as giant fitted type in frame one; project titles as small-cap labels; an index list (01—07) as the nav.
- **Camera:** looks at each project from a *different shot size* (wide, close, high, low), with a hold on each; transitions are whip-pan-style fast eases.
- **Signature move:** **Project Rooms** — entering a project dims the world, lights the plane with a practical, and swaps copy/arrows in the HUD; scrolling out reverses it.
- **Always include:** an "About" beat with a face/silhouette and a *Contact* end-card with an email as the CTA.
- **Failure modes:** a grid of thumbnails in a 3D room · all projects at the same distance/angle · no contact.

## 08 · Void Tunnel
*Feels like: a label drop, a music festival, a bold brand manifesto — velocity.*
- **World:** an infinite corridor of rings/slabs/typographic panels, lit by coloured strips, camera speed tied to scroll velocity.
- **Palette:** one saturated hue (acid green, signal red, ultramarine) on near-black; white type.
- **Camera:** fast, long, FOV kicks with velocity (`f.velocity → fov +`), chromatic aberration only at speed.
- **Signature move:** **Velocity Type** — words fly past as 3D slabs and stretch (scaleZ) with scroll velocity; stop scrolling and they settle into a legible stack.
- **Build recipe:** `InstancedMesh` of rings along z, emissive bars, `grade.aberration` driven by velocity (see 10-frontier).
- **Failure modes:** nausea (cap FOV kick ≤ +14°, roll ≤ 2°) · unreadable copy (give every beat a *rest*).

## 09 · Terrain Epic
*Feels like: an expedition film, game cinematic or festival eclipse — scale.*
- **World:** terrain with a character sky (eclipse, aurora, storm front, twin suns) and one human-scale landmark. `scene.umbra.ts` is the finished reference.
- **Camera:** crane / walk / worm's-eye telephoto hero / pass-through / final symmetrical frame.
- **Signature move:** **Totality** — sky uniforms (eclipse, haze) animate with scroll so the *whole world's mood* changes across the film.
- **Build recipe:** `createDunes`, `createSky`, `createLightShafts`, `createGlow`, 3 particle bands.

## 10 · Macro Appetite
*Feels like: a premium sauce / whisky / perfume / cafe — warm, tactile, slow.*
- **World:** extreme macro of the ingredient with heat/steam; background pure dark with one warm key from the side.
- **Palette:** burnt amber, cream, deep brown; accent the colour of the food.
- **Camera:** macro (fov 12–20°) with shallow-DOF *feel* (blurred foreground sprites, bokeh points); slow push.
- **Signature move:** **The Pour** — a frame-sequence (generated video → 120 webp frames) scrubbed by scroll on a canvas plane; steam particles rise with velocity.
- **Failure modes:** stock-photo grids · cool lighting · fast cuts. Appetite needs *slowness*.

## 11 · Interface Cosmos
*Feels like: the product as a place — real UI floating in depth, data as light.*
- **World:** a dark volumetric space with **real product UI screenshots** (or live HTML rendered to texture / CSS3D) as planes at different depths; data points as light trails between them.
- **Palette:** deep navy, one electric accent, white at 8 % for UI chrome.
- **Camera:** glides plane to plane; each feature = one plane scaling forward with a glow; the last plane IS the sign-up form.
- **Signature move:** **Plane Activation** — the next UI plane's border draws, its content un-blurs, a light trail connects it to the previous.
- **Build recipe:** `createLayerStack`, CSS3DRenderer (optional), `createParticles` as trails, bloom 0.7.
- **Failure modes:** pricing tables inside the 3D · screenshots with no depth separation.

## 12 · Glass Atrium (LIGHT MODE)
*Feels like: a high-end skincare / fashion / clinic / architecture studio — bright, calm, expensive.*
- **World:** a luminous, bright space: frosted glass slabs, soft caustics, floating spheres/arches of translucent material, pale sky gradient. **Proves the skill is not only dark scenes.**
- **Palette:** warm white / bone, one muted pigment (sage, clay, powder blue), black type.
- **Light:** huge soft key + subtle bounce; contact shadows (blurred planar) *must* exist or objects float.
- **Materials:** `glass()` (transmission), frosted roughness 0.35, subtle iridescence, paper-like matte for balance.
- **Camera:** slow, symmetrical, architectural; dolly + gentle rise.
- **Signature move:** **Refraction Reveal** — a glass slab passes over type; the text beneath refracts/shifts as it slides by.
- **Failure modes:** looks like Apple-clone (add one weird, authored object) · overexposed whites with no contrast · bloom on bright surfaces (use threshold 1.0).

---

## Blending rules
- Max **two** directions; one is 80 %.
- Never mix a dark direction with a light one inside one film unless the *transition itself* is the story (e.g. descent from daylight into a cave).
- Direction ≠ genre. A law firm can be *Instrument*; a bank can be *Dusk Arrival*. The surprise is the point — as long as it still sells.

## The Direction Lock (paste into AURA_BRIEF.md)
```
DIRECTION: 01 Product Altar (80%) + 05 Night Walk atmosphere (20%)
WORLD: …one sentence, concrete nouns…
HERO: …the single object/image…
SIGNATURE MOVE: …named, one sentence…
PALETTE: #… (dominant) #… (accent) #… (neutral)
CAMERA PERSONALITY: …
FORBIDDEN: …three things this site will never do…
```
