# 10 · Frontier techniques — going past the starter

The starter gets you a *very good* film in an afternoon. This file is what you reach for when the brief says "better than anything I've seen". Every technique lists **what it buys**, **the cost**, and **where it breaks**. Use **one hero technique per chapter** (law 8) — never all of them.

> Rule of the frontier: *a technique earns its place only if the audit contact sheet looks better with it than without it.* Screenshot before and after.

---

## 0 · What the starter already gives you (don't rebuild)
| Need | Use |
| --- | --- |
| Sky / sun / **eclipse** / stars / horizon haze | `createSky()` — 1 draw call; animate `uniforms.uEclipse`, `uHaze` with the playhead |
| Volumetric god-rays | `createLightShafts({from,to,color,spread,count})` + `setIntensity(f(p))` |
| Halos, lamps, sun flare | `createGlow(color,size,opacity)` |
| Banded depth in valleys / streets / forest | `createHaze({layers,zStart,zStep})` |
| Ground you can fly over (+ `heightAt` for camera & props) | `createDunes()` — swap the height function for mountains / snow / lava crust / swell |
| Wet-floor reflections | `createMirrorFloor()` (gate on `quality`) |
| Dust, bokeh, embers | `createParticles()` ×2–3 bands, placed **along the path** (the camera travels; fields don't) |
| Foreground parallax plane | a particle band whose `position` *lerps toward the camera* (see `motes` in `scene.umbra.ts`) |
| Giant type that never crops | `data-fit` + `fitType()` |
| Exact frames for QA | `window.__aura.seek(p)`, `info()`; `?p=0.4` |

---

## 1 · Raymarched hero (SDF) — liquid chrome, metaballs, impossible geometry
**Buys:** shapes no mesh can do (smooth-union blobs, fractals, melting forms), perfect reflections of *its own* environment. The single biggest "this isn't a template" signal.
**Cost:** a full-screen fragment shader. Render at 0.5–0.75 resolution, never on mobile at full DPR.
**Pattern:** a camera-facing quad (or the inside of a sphere shell) with a `ShaderMaterial`; pass `uP` (playhead), `uCamPos`, `uCamMat` from `update(f)`; march ≤ 64 steps; shade with the *same* palette as the scene and write fog colour on miss so it composites with real meshes.
```glsl
float sdSphere(vec3 p,float r){return length(p)-r;}
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
float map(vec3 p){
  float d=1e9;
  for(int i=0;i<5;i++){ float fi=float(i);
    vec3 c=vec3(sin(uP*6.28+fi*1.7),cos(uP*4.+fi*2.3),sin(fi+uP*3.))*.9;   // blobs orbit with SCROLL
    d=smin(d,sdSphere(p-c,.55),.6);
  } return d; }
vec3 nrm(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
// shade: fresnel * envColour(reflect(rd,n)) + a coloured rim — do NOT output flat normals.
```
**Breaks:** banding in the gradient (add grain — the post pass already does), and mobile thermals. Provide a lower-step variant when `ctx.mobile`.

## 2 · GPU particle simulation — 100k–1M points that flow, swirl and *form shapes*
**Buys:** particles that assemble into a logo / product silhouette as you scroll, curl-noise rivers, galaxies. **Cost:** `GPUComputationRenderer` (position + velocity float textures); needs `EXT_color_buffer_float` (check; fall back to the CPU `createParticles`).
**Pattern:** target positions baked from a mesh (`MeshSurfaceSampler`) or text (sample a 2D canvas); the sim's attractor strength is `ease.inOutCubic(seg(p,a,b))` — so the *scroll* assembles the shape and un-assembles it on scroll-up. Render as `Points` with additive blending and size attenuation; colour by velocity.
**Breaks:** iOS Safari float-texture limits → cap at 128×128 (16k) on mobile.

## 3 · Generated-image worlds (2.5D) — photoreal in minutes
Use `layers.ts` (`createLayerStack`, `createDepthPlane`) with images from `05-asset-pipeline.md`.
- **Hero plate + depth displacement:** one art-directed image → depth estimate (Depth-Anything) → dense plane displaced in the vertex shader; camera moves ±12° only. Add fog *between* 3 duplicated planes at different z for volumetric feel.
- **Layer stack:** 4–7 cut-outs (sky / far / mid / subject / foreground). Parallax between layers + particles in the gaps = AAA matte-painting. This is how you get *photographic* worlds with no modelling.
- **Always** add real 3D on top (particles, a light shaft, a glow, a floating mesh) — pure 2.5D reads as a parallax slideshow.

## 4 · Type that lives in the world
| Level | How | When |
| --- | --- | --- |
| CSS sandwich | `.aura-giant` between canvas and a transparent cut-out PNG of the subject | fastest "letters behind the building" |
| **3D text** | `troika-three-text` (SDF, any font) as a mesh in the scene at a z between depth planes; `fog:false`, `depthWrite:false`; fade `material.opacity` with `pulse(p,a,b)` | type that parallaxes with the camera, gets occluded by the subject, reflected by the mirror floor |
| Per-letter | split to spans, drive `--i` index, stagger with `calc(var(--local) * N - var(--i))` | kinetic reveals; keep to ONE per film |
| Type as light | an emissive text plane + bloom threshold below its intensity | titles that glow in the dark |
Measure, don't guess: giant DOM type → `data-fit`. 3D text → compute `troikaText.geometry.boundingBox`, scale so projected width ≈ 0.86 of the frustum at that z.

## 5 · Camera craft (cheap, huge)
- **Handheld breath:** add `sin(t*0.7)*0.015` positional noise at ≤ 1% amplitude to *holds only* (scaled by `1-f.velocity*8`) so a hold feels alive, never static.
- **Focus pull:** `BokehPass` is heavy; instead blur the DOM-text layer and fade particle size by distance from the focal plane (`uFocus` uniform) — the eye reads depth of field.
- **Lens language:** wide (50–65°) = speed / scale; 24–30° = intimacy + compression. Never fly the *same* lens through two consecutive shots.
- **Dutch roll** ±2–4° during the "pass" shot. Bigger reads as a gimmick.
- **Anticipation:** pull back 3% of the rail distance *before* a push-in (a real dolly operator does this). One extra shot, enormous feel.

## 6 · Light & matter upgrades
- **Colour contrast over brightness:** warm rim vs cold fill (Umbra: ember rim `#ff8a45` vs `#6f8fc8` key at 0.55). Complementary light separates planes better than any blur.
- **Emissive discipline:** `emissive(color, 2–5)` + bloom threshold **0.88–0.9** → only the intended things glow. If `blown > 2%` in the audit, lower emissive, don't lower bloom strength.
- **Roughness variance:** `roughnessMap` from `noiseTexture()`; wear on edges. Uniform roughness is the #1 "CG" tell.
- **Transmission/refraction** (`glass()`): 1–3 meshes, `quality > 0.6` only.
- **Wet look:** `clearcoat 1`, `clearcoatRoughness 0.08`, plus the mirror floor at `color: 0x2a2f3a` (< 1 so it reads as a surface).
- **Fake caustics / light-through-water:** an additive `MeshBasicMaterial` plane with a scrolling noise texture, projected from a spot light direction.
- **Contact shadows:** one blurred dark radial sprite under each hero object — costs nothing, grounds everything.

## 7 · Scroll as a *director*, not a slider
- **Non-linear scroll → playhead:** apply `ease.inOutSine` to `trackProgress` for ceremony at the ends, or a piecewise map that *slows* the scroll inside holds (fewer vh per `p` there = a longer felt hold).
- **Chapter snap-assist (soft):** within 0.02 of a chapter's centre, nudge the target toward it after 600 ms idle. **Never** scroll-jack — only a gentle settle, cancelled instantly by any input.
- **Velocity as a material:** `f.velocity` already kicks FOV and aberration. Also drive particle streaking, ring spin, bloom strength (`+0.15*velocity`).
- **Scrub video textures:** `video.currentTime = p * duration` on a `VideoTexture` (all-intra H.264/WebM, keyframe every frame) — pre-rendered AAA footage (Blender / Veo / Runway) used *inside* the 3D world on a screen or as a sky.

## 8 · Interaction that feels authored
- **Pointer = light:** move the practical `PointLight` toward the pointer ray (world-space unproject) at 0.12 damping → the world responds to the hand.
- **Magnetic CTA:** translate `.aura-cta` toward the pointer within 90px (damped), scale the ring.
- **Hero hover:** raycast the hero only when the pointer moves; on hit, raise `emissiveIntensity` and ease a +3% scale.
- **Opt-in sound:** a 🔊 toggle (default off), one ambient loop + a low swell on holds; duck on scroll velocity. Never autoplay.
- **Audio-reactive:** `AnalyserNode` → low-band energy → bloom strength / particle size. Only when the user opted into sound.

## 9 · WebGPU / TSL (progressive enhancement)
`three/webgpu` + TSL gives compute shaders for 1M-particle sims, better bloom/DoF, node-based materials. **Only as an enhancement:** feature-detect `navigator.gpu`; keep the WebGL path as the default, identical in composition. Never ship a WebGPU-only film.

## 10 · Gaussian splats / photogrammetry
Real captured places (a restaurant, a house, a sculpture) via `@sparkjsdev/spark` or Luma's web library: load a compressed `.spz`/`.ksplat`, put the camera rail through it, composite with real meshes + particles. Budget ≤ 6 MB compressed, cull by distance, show the poster until the first sort completes.

## 11 · World recipes (starting specs — then make them *yours*)
| World | Sky | Ground / hero | Atmosphere | Light | Type & palette |
| --- | --- | --- | --- | --- | --- |
| **Deep ocean descent** | none; `FogExp2` teal→black, density grows with `p` | seabed `createDunes` (low H, dark), a colossal silhouette (whale / wreck) | caustics plane, marine snow (`createParticles` size 1.2 falling), `createLightShafts` from above that *weaken with depth* | surface light fades; bioluminescent practicals (emissive + glow sprites) | cyan `#52e6d8` on `#02121a`; condensed grotesk |
| **Night city / neon rain** | `createSky` zenith `#05060d`, magenta horizon | wet street `createMirrorFloor` (reflects neon), instanced boxes for blocks with emissive window texture | haze cards in magenta/cyan, rain as stretched additive particles | coloured rims from signs; everything else crushed | magenta/cyan on near-black, mono type |
| **Alpine / glacier dawn** | `createSky` with warm horizon, `uHaze` high | ridged terrain (snow colour, low roughness), a lodge or peak as hero | long banded haze, spindrift particles | low sun key + blue shadow fill | cold white + one warm accent, thin serif display |
| **Interior / architecture** | none (HDRI-ish `env`) | room boxes, glossy floor, instanced furniture | dust in shafts from windows (`createLightShafts` from window → floor) | one hard window key + warm practicals | restrained neutrals, large light serif |
| **Space / station** | stars only (`uStars` 1, dark horizon) | planet = sphere with fresnel atmosphere shell; station = instanced modules | volumetric nebula cards, engine glows | single hard sun + blue earth-bounce | white mono on black, one signal colour |
| **Product studio** | gradient backdrop plane | hero on `chrome()`/`glass()` with turntable *driven by scroll*, exploded view | very light haze, sparse bokeh | 3 strip lights + rim; sweep a specular with `p` | brand colour as a single rim; huge product name |
| **Forest / mist** | pale `createSky`, fog = sky | instanced trunks (1 draw call), terrain with `heightAt` for placement | 5 haze layers, god-rays between trunks, floating spores | one shaft key; green-teal fill | low-saturation greens + one gold |

## 12 · Failure modes seen in the wild (and the fix)
| Symptom in the contact sheet | Cause | Fix |
| --- | --- | --- |
| Opening frame is a glowing white wash | glow sprite / horizon haze additive on a bright sky | cut glow opacity to ≤ 0.1, lower `uHaze`, bloom threshold 0.9 |
| Stars look like square confetti | stars from a per-cell hash without a distance falloff | round & soft: `smoothstep(.2,0.,length(f-off))` (fixed in `createSky`) |
| Sand looks like water | bump map too strong / repeating | `bumpScale ≤ 0.6`, repeat ≤ 40, sheen ≤ 0.6 |
| Hero competes with its own debris | fragments too large | fragment scale ≤ 40% of hero width |
| Last frame is empty space | the final shot flies away from the subject | final shot = composed return to the hero; CTA inside the image |
| Title cropped / overlapping | guessed `vw` sizes | `data-fit`; run the audit (it measures the text) |
| Dead scroll in the middle | shots with near-identical pos AND no copy | either it's a HOLD with copy, or move the next shot closer |
| Mobile looks like a different, worse site | desktop rail reused | halve particles, `maxDpr 1.25`, taller type, shorter rail, drop mirror floor |
