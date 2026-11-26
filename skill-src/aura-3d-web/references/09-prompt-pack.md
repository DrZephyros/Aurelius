# 09 · Prompt Pack — kickoff prompts for any agent

The skill works best when the human gives it a *subject* and a *feeling*. These prompts are ready to paste. Replace `[BRACKETS]`.
If your agent supports skills (Claude Code, Claude.ai Skills, Cursor Rules, Codex AGENTS.md), install the `aura-3d-web` folder first and use the short prompt. If it doesn't, paste the **Master prompt** — it is a compressed form of the whole skill.

---

## ⚡ Short prompt (skill installed)
```
Use the aura-3d-web skill. Build a scroll-driven immersive 3D website for [SUBJECT].
Audience: [WHO]. They should feel [ONE EMOTION]. Final action: [CTA].
Brand assets: [logo/colors/copy/images or "none — art-direct it yourself"].
Don't ask me questions unless something is truly blocking — make decisions, state your assumptions, build it, run `node scripts/audit.mjs <url>` until there are 0 blockers, open the contact sheets and critique them frame by frame (≥3 loops), score it honestly, polish it.
```

## 🧠 Master prompt (no skill support — paste this)
```
You are a creative director, cinematographer and technical director. Build [SUBJECT] as a scroll-driven, immersive 3D website that feels like a high-budget game trailer / Awwwards Site of the Year — not a normal website. I (the visitor) drive a single continuous camera with my scroll wheel.

NON-NEGOTIABLES
1. ONE idea / ONE world / ONE continuous camera. No visible sections. Transitions are spatial (fly through, occluder wipe, fog pass, dive, scale-jump).
2. Scroll is the PLAYHEAD, not a trigger: scroll progress (0..1, critically damped) drives camera position/look-at/FOV/roll via a keyframed shot list (Catmull-Rom), plus light, fog, particles, hero transforms, and text. Fully scrubbed & reversible. Never hijack scroll.
3. Depth: ≥5 planes every frame (fg occluder, subject, mid, bg, atmosphere). Parallax + fog + 3 particle bands (far dust, mid motes, near bokeh).
4. Designed light: key + coloured rim + fill + a practical light in-world. Dark-field, high bloom threshold (≥0.8), ACES tone-mapping, split-toned grade, film grain, vignette, subtle chromatic aberration. scene.environment always set. Background colour == fog colour.
5. Materials with variation: roughness maps, clearcoat/sheen/iridescence/emissive. Nothing default.
6. Typography as architecture: GIANT display type (18–30vw) that the scene interacts with (behind the subject, reflected, scrubbed tracking), tiny mono HUD labels, two fonts max, ≤12 words per beat.
7. Rhythm: alternate wide/close shots, vary lenses (24°/38°/52°/60°), at least one HOLD, a crescendo, a composed final frame with ONE CTA. Scroll length 600–1000vh.
8. Performance: three.js + EffectComposer, DPR cap, instancing, adaptive-quality governor, mobile variant, reduced-motion + no-WebGL fallbacks, 60fps.
9. Deliver a stunning preloader (giant counter + title wipe).

PROCESS (do in order, write files): AURA_BRIEF.md (world metaphor, hero, emotional arc, palette hex, type, lens language, light, atmosphere, never-list) → STORYBOARD.md (table: chapter | scroll range | shot+lens | world change | copy ≤12 words | type treatment | transition) → ASSETS.md (procedural vs generated image layers vs GLB; ≤12MB) → scaffold (Vite+React+TS+three) → blockout shots first → light → materials/hero → atmosphere → typography+DOM choreography with data-a/data-b windows bound to the same playhead → post/grade → interaction → conversion → 3 polish passes.
VERIFY: expose window.__aura.seek(p) from the engine so every frame is reproducible; use Playwright to screenshot 14 scroll positions on desktop+mobile (measure luminance/contrast/clipping, detect text collisions, require copy + a CTA in the first and last frame), inspect them like a harsh art director, fix, repeat. Score yourself out of 100 (Atmosphere 25, Unbroken 20, Rhythm 20, Authorship 20, Production 15). Ship only ≥85.

BAN LIST: spinning-logo hero with a normal site below, fade-up cards, OrbitControls turntable, purple-blue blob gradients, glass cards on mesh gradient, centered Inter 64px, flat MeshBasic, bloom on everything, 200vh scroll for 8 moments, autoplay sound, lorem ipsum.

SUBJECT: [DESCRIBE]. AUDIENCE: [WHO]. FEELING: [ONE EMOTION]. CTA: [ACTION]. ASSETS: [LIST OR "art-direct yourself"].
Make decisions yourself; state assumptions; don't ask me anything unless blocked.
```

---

## 🎯 Archetype kickoff prompts

### Product launch
```
Use the aura-3d-web skill. Product: [NAME — what it is, material, colour]. Build a launch site where the product is the world: silhouette in darkness with a coloured rim light → material macro → exploded anatomy with mono labels → in-world use (the environment that proves its benefit) → scrubbed spec numbers → slow 90° hero orbit with a specular sweep and the CTA "[Pre-order / Buy]". Emotion: [desire/awe]. Palette: black + [one rich hue]. If I provide a GLB use it (optimise it); otherwise build it procedurally with premium materials or generate hero plates and depth-displace them.
```

### Portfolio
```
Use the aura-3d-web skill. I'm [NAME], a [ROLE]. Make my portfolio an immersive place that expresses my craft: [WORLD IDEA or "choose one that fits me"]. Name as giant type. Each of my [N] projects is a stop on the camera rail (plate floats in depth, tilts on hover, camera holds). About = entering a door/hatch. Contact = the exit of the world. Projects: [LIST with image paths]. Emotion: [intimacy/wonder].
```

### Real estate / hospitality / architecture
```
Use the aura-3d-web skill. Property: [NAME, location, type, key features]. Create an arrival film: dusk aerial → descent to the water/garden → approach with the giant name [NAME] reflected in still water behind/under the buildings → windows igniting sequentially (stagger) → threshold → interior glide with warm practicals → terrace view → reserve CTA. Colour script: warm amber windows vs cool cobalt sky. Generate a hero plate and layer/depth it (text sandwich: name behind the building).
```

### Brand / studio
```
Use the aura-3d-web skill. Studio: [NAME], we do [SERVICES]. Build a manifesto in motion: the camera tunnels through an abstract material world ([e.g. liquid chrome / paper / glass / smoke]); each manifesto line is giant type that the world interacts with; case studies drift past as depth-displaced plates; end card with a bold contact line. Tempo: fast with one long hold. Palette: [..]. Authorship test: this must be unmistakably OURS.
```

### Game / film / entertainment
```
Use the aura-3d-web skill. Title: [NAME]. Genre: [..]. Build the trailer as a website: cold open (black, ember particles) → title slam with light → world vista → [N] faction/character beats each in a distinct colour world → rapid montage (FOV kick, whip pans) → final shot + release date + wishlist CTA. Low camera angles, Dutch roll on tension beats, hard backlight and fog.
```

### SaaS / AI product
```
Use the aura-3d-web skill. Product: [NAME] — [one-line]. Place my real product screenshots ([paths]) as floating planes in depth; data as light trails/particles; each feature = the camera glides to a plane that "activates" (glow, scale 1.04, copy appears); final plane is flown through into the CTA. Dark, precise, calm; [accent colour] as the only colour. No fake dashboards-in-dashboards.
```

### Restaurant / food / lifestyle
```
Use the aura-3d-web skill. Venue: [NAME, cuisine, city]. Appetite film: steam and embers in darkness → macro on [ingredient] with shallow DOF → heat shimmer → slow-motion [pour/slice/flame] as a scrubbed frame sequence (I'll provide/generate clips: [paths]) → the table at golden hour → reserve a table CTA. Warm amber light, tactile materials, grain.
```

### Event / campaign / non-profit
```
Use the aura-3d-web skill. Event/cause: [NAME, date, place]. The date as giant type; a glowing path (line) the camera follows through a stylised map/landscape; one human moment as a single depth-displaced photo with a hold; impact numbers as scrubbed counters; RSVP/donate CTA as the final frame. Emotion: [hope/urgency/belonging].
```

---

## 🔁 Refinement prompts (after the first build)
- **"Make it feel more expensive"** → `Run the Aura Score; fix the lowest category. Prioritise lighting (rim light colour/intensity), depth separation, type scale, and grade (split-toning, contrast, bloom threshold). Re-screenshot all 12 stops.`
- **"More cinematic"** → `Add a hold, vary lenses, add one Dutch roll beat, add a spatial transition between chapters 3 and 4, add foreground silhouettes and a near-bokeh particle band.`
- **"Too busy"** → `Delete until every chapter has exactly one hero effect and ≤12 words. Give one chapter zero copy.`
- **"It lags"** → `Profile with renderer.info. Lower DPR cap, gate mirror/transmission on f.quality, instance repeated meshes, compress textures to webp/KTX2, reduce particle counts on mobile. Report before/after FPS.`
- **"Mobile is broken"** → `Add a mobile shot list, widen FOV, move copy to the bottom third, reduce counts ×0.4, drop the mirror floor, test at 390×844 and 360×640 with screenshots.`
- **"Make the type interact"** → `Implement the text sandwich: hero word behind the subject cut-out, tracking scrubbed with --local, reflected on the floor.`
- **"Add a new chapter"** → `Insert it in STORYBOARD.md first; re-space the shot list (at values) and DOM windows; keep one hold; re-score pacing.`

## 🖼 Asset generation prompts
- **Hero plate:** see `05-asset-pipeline.md §B1` (anatomy + examples).
- **Depth layers:** `"[SCENE]. Only the [far mountains and sky] layer, everything else removed, transparent background, same lighting and colour grade, 16:9"` (repeat per layer: mid-ground, subject, foreground).
- **Foreground silhouettes:** `"Dark silhouette of [pine branches / tall grass / rocks] hanging from the top of frame, pure black shapes with soft rim light, transparent background"`.
- **Texture:** `"Seamless tileable [wet black basalt] texture, top-down, even lighting, PBR albedo, 2048"`.
- **Sky:** `"Equirectangular 360° [blue hour alpine sky with mist], high dynamic range look"`.
- **Product plate:** `"[PRODUCT] on [surface], studio shot, single hard key from top-left, coloured rim light behind, deep black background, macro 100mm, razor-sharp, reflective floor"`.
