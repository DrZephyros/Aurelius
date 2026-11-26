# 05 · Asset Pipeline — getting AAA-looking content when you can't model

An agent usually has **no 3D artist**. That is fine. There are five reliable sources, ordered by how often you should reach for them.

## Decision tree
```
Need a hero object/world?
 ├─ Abstract / sci-fi / architectural primitives / particles?   → A. PROCEDURAL (code)         [zero assets, fastest, always looks consistent]
 ├─ Photoreal place / landscape / building / interior?          → B. GENERATED IMAGE → 2.5D     [highest realism per minute]
 ├─ A specific product with a real model (GLB/CAD/photoscan)?   → C. GLB                         [exact product, brand-safe]
 ├─ Organic: food, liquid, fabric, smoke, people?               → D. VIDEO / FRAME SEQUENCE     [real footage scrubbed by scroll]
 └─ Need a quick 3D prop and have nothing?                      → E. AI-GENERATED 3D → clean up
```

## A · Procedural (default)
Build with primitives + great materials + great light (see `04-visual-engine.md` and `scene.example.ts`).
Strong procedural ingredients: `IcosahedronGeometry(detail)`, `TorusGeometry` rings, `LatheGeometry` (vases, bottles, columns, chess pieces), `ExtrudeGeometry` from an SVG path (logos → 3D), `TubeGeometry` along a curve (light trails, cables), `InstancedMesh` for crowds/forests/cities, `ShaderMaterial` terrains (fbm height + fog), `MeshSurfaceSampler` particles. A city = instanced boxes with emissive windows + fog + a rim light. A mountain range = 4 fbm-displaced planes at different z with fog between.

## B · Generated image → 2.5D world (the "Ardmere / Kage" look)
This is the highest-leverage technique available to an agent with image generation.

### B1 · Generate the hero plate
Prompt anatomy (fill every slot, it is what makes results look *shot*, not "AI"):
```
[SUBJECT, specific], [PLACE + TIME OF DAY + WEATHER], [CAMERA: lens mm, height, angle],
[LIGHT: key/rim/practicals with colours], [ATMOSPHERE: mist, dust, god-rays],
[MATERIALS: wet stone, brushed bronze…], [COLOR SCRIPT: teal-orange / amber vs cobalt],
cinematic still, anamorphic, shallow depth of field in the foreground, 35mm film grain, 16:9, ultra-detailed, no text, no people unless specified
```
Example (estate): *"Four modern alpine timber-and-stone lodges with glowing amber windows beside a still glacial lake at blue hour, wide 24mm shot from lake level, mirror-calm water reflecting the lit windows, pine forest and mountains fading into mist behind, soft cobalt sky, warm interior light spilling onto terraces, cinematic still, ultra-detailed, no text"*.
Example (temple): *"Torii gate path leading up stone steps to a multi-tiered Japanese temple at night, huge blood-red moon behind the roof, drifting petals, paper lanterns glowing orange, volumetric mist, low camera at the base of the stairs, foreground grass silhouettes, cinematic, 35mm, no text"*.

Generate **2–3 variants** and pick by: strong light direction, clear foreground/mid/background separation, a calm area for type, no baked text.

### B2 · Make it 3D — pick one

**Option 1 — Layer cut-outs (best control, most "dimensional")**
1. Ask the image model to generate the *same scene split by depth* ("sky and distant mountains only", "mid-ground lake and far trees only, transparent", "foreground grass and rocks only, transparent background") **or** cut the single plate with a segmentation/BG-removal model (e.g. rembg / SAM / Photoshop Select Subject) into 4–7 PNGs: `sky.png, far.png, mid.png, subject.png, near.png, fx.png`.
2. Fill the holes behind cut-outs with generative fill/inpainting so parallax doesn't reveal gaps (only needed if camera travel is large; for ±8° it rarely matters).
3. Load with `createLayerStack([{url, z, width, height, fog}])`. Scale layers for their depth. Far layers get `fog:true`, near layers don't.

**Option 2 — Depth-displaced plane (fastest, single image)**
1. Run a monocular depth model (Depth Anything V2, MiDaS, Marigold; or any "depth map" tool) → greyscale PNG, white = near.
2. `await createDepthPlane({ colorUrl, depthUrl, width, height, depthScale: 1.6 })`.
3. Keep camera travel within ~±12° yaw / ±1.5 units; beyond that stretching appears. Hide edges with fog + vignette + particles.
4. Combine with Option 1: displace the *mid* plane, keep sky/near as flat layers.

**Option 3 — Hybrid (best):** real 3D foreground (instanced grass/rocks/branches or procedural silhouettes) + displaced plate mid + layered sky. Foreground in true 3D is what makes the parallax feel real.

### B3 · Make the type "sandwich"
Cut the hero subject (house/character) as a transparent PNG; place the giant title **behind** it (see choreography §5). One BG-remove call + one CSS layer = the signature look.

### B4 · Light the plate
Even flat images benefit from: animated glow sprites on windows (additive, flicker), mist planes drifting across, particles between camera and plate, a slow luminance sweep (a gradient plane with `mix-blend-mode: soft-light`), and the grade pass. This makes a still *breathe*.

## C · GLB models
**Sources (check licences; credit if CC-BY):** Sketchfab (filter *Downloadable, CC0/CC-BY, PBR*), Poly Haven (CC0 HDRIs/models/textures), Quaternius (CC0 low-poly), Kenney (CC0), Smithsonian 3D, manufacturer CAD/GLB, Blender Market (paid). For product work, ask the user for the real GLB/CAD (STEP → GLB via Blender/FreeCAD/Fusion).

**Optimise before shipping (mandatory):**
```bash
npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 2048
# or for max compression with KTX2/Basis:  --texture-compress ktx2  (needs toktx)
```
Targets: hero ≤ 3 MB, props ≤ 500 KB each, textures ≤ 2048², ≤ 150k tris hero / ≤ 20k props. Load via `loadGLB` + `fitModel` + `prepModel` (assets.ts). Always re-material the hero with the recipes in `materials.ts` if the stock look is flat; keep the original maps.

**Make it look expensive:** set `envMapIntensity`, add a rim light behind, add a contact shadow/floor reflection, add micro-motion (slow hover bob, parts that float apart in the exploded chapter).

**Exploded view:** traverse the model, group meshes by name/part, store `origin` & `exploded = origin + dir * dist`; per frame `mesh.position.lerpVectors(origin, exploded, ease(seg(p,a,b)))`; label each with a DOM mono tag tracked via `vector.project(camera)`.

## D · Video / frame sequences (organic stuff)
For liquids, fire, smoke, fabric, people, food, cars: real or AI-generated *video* beats CG.
1. Generate/film a 3–8s clip (AI video model, stock footage, product shoot). Keep camera locked, subject centred, background simple.
2. Convert to frames: `ffmpeg -i clip.mp4 -vf "fps=30,scale=1600:-2" -q:v 3 f_%04d.webp` (or `-c:v libwebp -quality 75`). 120–240 frames is plenty; ~50–150 KB each → lazy-load in chunks.
3. Scrub: draw frame `index = floor(seg(p,a,b) * (N-1))` onto a `<canvas>` or a `THREE.CanvasTexture`/`VideoTexture` plane (preload next 20 frames). Or `<video>` with `currentTime = duration * k` (needs `preload="auto"`, keyframe-heavy encode: `-g 1`) — canvas frames are more reliable.
4. Composite in 3D: put the frame plane in the scene with fog/particles in front. Alpha-matte (WebM VP9 alpha or per-frame WebP with alpha) lets it sit *in* the world.

## E · AI-generated 3D
Image-to-3D services (Meshy, Tripo, Rodin/Hyper3D, Hunyuan3D, Luma Genie…) → GLB. Good for props, creatures, statues, stylised hero objects. Always: retopology check (tri count), flip normals if inverted, re-material, optimise with gltf-transform, set a rim light. Don't use for mechanical products where accuracy matters.

## F · Textures, HDRIs, sky
- **HDRI:** Poly Haven (CC0). Use *only for `scene.environment`* (and optionally the sky). Keep ≤ 2k, `.hdr` → `RGBELoader` → `PMREMGenerator.fromEquirectangular`. A **night/dusk HDRI** gives immediate photoreal reflections.
- **PBR textures:** Poly Haven / ambientCG (CC0). Albedo sRGB, others linear. Tile + roughness variation.
- **Generated textures:** ask the image model for "seamless tileable [material] texture, top-down, even lighting" then make a normal map via a normal-map generator.

## G · Fonts & icons
Self-host variable fonts (`@fontsource-variable/*`). Display: Space Grotesk, Unbounded, Syne, Instrument Serif, Bricolage Grotesque, Fraunces, Anton (condensed giant), Clash/Cabinet (Fontshare, free). Mono: JetBrains Mono, IBM Plex Mono, Geist Mono. Icons: avoid; use typography and thin lines.

## H · Manifest (write `ASSETS.md`)
```md
| id | type | source / prompt | file | size | role | loads |
|----|------|-----------------|------|------|------|-------|
| plate | image | gen prompt #1 | /assets/plate.webp | 420 KB | hero background (depth-displaced) | blocking |
| depth | image | depth-anything(plate) | /assets/plate-depth.webp | 160 KB | displacement | blocking |
| cut | image | bg-removed subject | /assets/subject.png | 380 KB | text sandwich | blocking |
| hdri | hdr | polyhaven dusk 1k | /assets/env.hdr | 1.4 MB | environment | after intro |
```
- **First-load budget ≤ 12 MB**, ≤ 4 MB for *blocking* assets (the loader covers them). Stream everything else after the first chapter is visible.
- WebP/AVIF for images, meshopt GLB, no PNG over 1 MB (convert to WebP with alpha), no video over 6 MB.

## I · Licensing & honesty
Credit CC-BY assets in the footer/readme. Never ship watermarked/stock-licence images without clearance. State in the final message which assets are generated and which prompts produced them so the user can regenerate.
