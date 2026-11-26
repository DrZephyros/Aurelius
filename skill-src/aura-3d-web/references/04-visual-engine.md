# 04 · Visual Engine — light, matter, atmosphere, post, shaders

This is the cookbook for the 70% of "AAA" that lives in the render. All snippets target three.js r160+ (`starter/src/aura/*`).

## 0 · The non-negotiable renderer setup
```ts
renderer.toneMapping = THREE.ACESFilmicToneMapping;  // filmic roll-off — highlights bloom naturally instead of clipping
renderer.toneMappingExposure = 0.9–1.2;               // dark scenes: lower; the grade pass lifts contrast
// output colour space is sRGB (default); textures with colour data: texture.colorSpace = THREE.SRGBColorSpace
// MSAA off when using EffectComposer (antialias:false) → rely on DPR ≥ 1.25 + (optionally) SMAAPass
scene.environment = ctx.env;            // PMREM studio env → PBR reflections. ALWAYS.
scene.environmentIntensity = 0.4–0.8;   // keep low in dark scenes; the key/rim carry the drama
scene.background = fog.color = SAME_HEX // seamless horizon, DOM background must match
```

## 1 · Lighting recipes
Use `lightRig()` as the base, then tune per mood.

| Mood | Key | Rim | Fill | Practical | Fog |
| --- | --- | --- | --- | --- | --- |
| Cold luxe product | 0xffffff 2.5 top-left | 0x4fa3ff 6 behind | hemi 0x0a1020 | none | `FogExp2` 0.03 |
| Dusk estate | 0xffb27a 3 low sun | 0x5a8bff 4 | hemi 0x1a2a4a | warm window PointLights 0xffc27a | 0.018 |
| Sci-fi / void | 0x9fd0ff 1.5 | 0xff4fd8 6 | none | emissive rings | 0.04 |
| Temple night | moon 0x8aa4ff 1.2 | 0xff3b3b 3 (red moon) | hemi 0x120a14 | lanterns 0xff9a4a (flicker) | 0.025 |
| Food / warm | 0xffe0b8 4 | 0xffa060 3 | hemi 0x2a1810 | candle 0xff8a3c | 0.02 |

- **Rim light = the secret.** Place a strong DirectionalLight *behind and above* the subject, coloured differently from the key. It paints a bright edge that separates the subject from the dark.
- **Practicals:** every scene gets a *source in the world*. Add a small emissive mesh + a PointLight at the same position. Flicker: `intensity = base * (1 + .06*sin(t*7 + seed) + .04*sin(t*13.3))`.
- **Shadows:** costly. Use ONE shadow-casting light (key), `shadow.mapSize 1024–2048`, tight `shadow.camera` bounds, `shadow.bias = -0.0004`, `normalBias 0.02`. For floating objects use a fake blob shadow (radial-gradient plane) — cheaper, softer.
- **Light linking to scroll:** lerp the colours/intensities across the storyboard (see choreography §7).

## 2 · Materials (see `materials.ts`)
- **Rule of three:** every material needs **base colour variation**, **roughness variation**, and **one special response** (clearcoat / sheen / iridescence / emission / transmission).
- **Roughness variation** is what makes surfaces read as real: feed `roughnessMap` with `noiseTexture()` and set `roughness: 1` as a multiplier; for brushed metal stretch the noise in one axis (`texture.repeat.set(8, 1)`).
- **Normal/bump detail:** `bumpMap` + `bumpScale 0.5–2` from noise adds micro surface for free.
- **Transmission (glass)** is expensive (re-renders the scene). Limit to 1–3 hero meshes, `transmissionResolutionScale` 0.5, disable below quality 0.5 → swap to a cheap `MeshPhysicalMaterial({ transparent, opacity:.25, roughness:0, envMapIntensity })`.
- **Emission + bloom:** give emissive materials `emissiveIntensity` 2–6 with bloom threshold ~0.8; everything else stays below 0.8 so only the things that glow, glow.
- **Fresnel rim in a shader** (cheap holographic/energy look):
```glsl
float f = pow(1. - max(dot(normalize(vNormal), normalize(vViewDir)), 0.), 3.);
col += uRim * f;
```
- **Gradient maps / toon-lit stylization** via `gradientTexture()` + `MeshToonMaterial.gradientMap` if the brief is illustrative.

## 3 · Atmosphere stack (every scene gets all four)
1. **Fog:** `FogExp2(bg, 0.015–0.05)`. Distant geometry should lose contrast. Animate density with scroll.
2. **Particles (3 bands):** far dust (1–2px, thousands), mid motes (3–5px, hundreds), **near bokeh** (10–30px, <60, low alpha — this is the cheap DOF). Use `createParticles` three times with different `extent/size/speed`.
3. **Light shafts / god-rays (cheap):** a few large additive planes with a vertical gradient texture, rotated to the light direction, `blending: AdditiveBlending, depthWrite:false, opacity .06–.15`, slow `uv` scroll via `texture.offset.y`. Fake but convincing; add noise to break uniformity.
4. **Glow cards / halos:** additive sprites around practicals (radial gradient from `gradientTexture` or canvas), scale pulses with the flicker.
Optional: **heat shimmer** (screen-space distortion in the grade pass using `sin(uv.y*40 + t)`), **volumetric fog layers** (stacked alpha-noise planes), **bird/lantern boids** (InstancedMesh) for scale and life.

## 4 · Reflective floors & water
- `createMirrorFloor({ color, fadeColor })`: Reflector + radial fade. Use for polished showrooms, wet streets, lake. Costs a second scene render → `quality > 0.5` only, texture size 0.5×.
- **Water without a Reflector:** a large plane with `MeshPhysicalMaterial({ color: dark, roughness: .05, metalness: .9, envMapIntensity: 2 })` + animated normal map (two scrolling noise normals) gives believable lake reflections of the *environment* but not the scene — pair with a mirrored duplicate of key landmarks (scale.y = −1, alpha .35, blurred via lower-res sprite) for the "estate reflected in lake" look.
- Always **fade reflections with distance** and darken them (< 0.4 intensity). Perfect mirrors look fake.

## 5 · Post stack (engine order)
`RenderPass → UnrealBloomPass → OutputPass (tone-map + sRGB) → Grade (custom ShaderPass)`
- **Bloom:** `strength 0.5–0.9`, `radius 0.6–0.85`, `threshold 0.78–0.9`. If the whole image glows, raise the threshold.
- **Grade pass (`scene.grade`):** `contrast 1.05–1.12`, `saturation 1.0–1.12`, `shadows` tint (cool: `[0,.015,.06]`), `highlights` tint (warm: `[.07,.035,0]`) → split-toning is how you get "cinema colour". `vignette .6–.8`, `grain .04–.06`, `aberration .03–.06` (edges only).
- **Velocity effects:** the engine kicks aberration and FOV with scroll speed; keep subtle.
- **Optional extras** (add as passes before OutputPass): `BokehPass` (true DOF, focus = distance to hero, aperture small), `SMAAPass`, 3D LUT (`LUTPass`) for a brand-specific grade, `GlitchPass` only for cyber briefs & only during one transition.
- **God-rays via post:** the `postprocessing` library's `GodRaysEffect` with the sun mesh — only if the brief hinges on sun shafts.

## 6 · Shader cookbook (copy/paste fragments)
```glsl
// value noise / fbm
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=n(p)*a; p*=2.02; a*=.5; } return v; }

// dissolve edge (reveal an object with a glowing burn line, drive uProg with scroll)
float d = fbm(vUv*4.); float edge = smoothstep(uProg-.03, uProg, d) - smoothstep(uProg, uProg+.03, d);
if (d < uProg) discard; col += uEdgeColor * edge * 4.;

// iridescent thin film (cheap): hue shift by view angle
vec3 irid(float c){ return .5 + .5*cos(6.28318*(c + vec3(0., .33, .67))); }
col *= mix(vec3(1.), irid(fresnel*1.5 + uTime*.05), .6);

// animated displacement for water/silk (vertex)
p.z += (fbm(uv*3. + uTime*.05) - .5) * uAmp;

// scan-line / holo
col *= .85 + .15*sin(gl_FragCoord.y*1.5 + uTime*8.);
```
- **GPU particles for text/models:** sample points on a mesh surface (`MeshSurfaceSampler`) → morph between two sampled point clouds (logo ↔ sphere ↔ product) driven by `seg(p, a, b)` in the vertex shader: `mix(posA, posB, ease(uMorph))` + noise-curl in the middle of the morph. This is *the* "dissolving into particles" moment.
- **Instancing:** anything repeated (shards, windows, lanterns, trees, stars) → `InstancedMesh`; update matrices in `update()` only when needed.
- **No allocation in `update`**: reuse `Vector3`, `Color`, `Object3D` dummies.

## 7 · Image-based worlds (when you have generated art)
- **Layer stack:** `createLayerStack` for cut-out PNGs with distinct z; scale each so it fills the frustum at its depth: `w = baseW * (camDist + |z|) / camDist`.
- **Depth-displaced plate:** `createDepthPlane` with a depth map from the generated image: a single photo becomes a navigable diorama for ±12° of camera travel. Combine with fog and particles passing *between* camera and plate for a perfect "real 3D" feel.
- **Sky domes:** equirect image on an inside-out sphere + `scene.environment` from the same image (`PMREMGenerator.fromEquirectangular`) → reflections match the sky = photoreal integration.
- **Grade to unify:** generated images from different prompts differ in colour. Fix in post via the grade pass, or pre-process with the same LUT.

## 8 · Quality tiers (what to turn off, in order)
| Quality | Disable |
| --- | --- |
| 1.0 | — |
| ≤ 0.8 | DPR 0.92×, near-bokeh band halves |
| ≤ 0.6 | mirror floor off (use dark rough plane), transmission → opaque-ish |
| ≤ 0.45 | bloom off |
| ≤ 0.3 | far particles halved, shadows off |
The engine's governor lowers `quality` automatically; make your `update(f)` read `f.quality` and gate these.

## 9 · Frequent failure modes
- **Everything looks plastic** → no env map or exposure too high → set `scene.environment`, lower exposure, add roughness variation.
- **Banding in dark gradients/fog** → add grain (engine does) and keep fog colour identical to background.
- **Bloom on UI text** → text is DOM (not in the render); fine. If you render text in WebGL, `toneMapped:false` + keep its colour below threshold.
- **Flicker on instanced shards** → `frustumCulled=false` for big instanced sets and moving InstancedMesh.
- **Transparent sorting glitches** → set `renderOrder`, `depthWrite:false` on additive/transparent things, avoid overlapping big transparents.
- **Memory growth** → dispose geometries/materials/textures on unmount (engine's `dispose()` does for the scene graph; dispose your own render targets).
