# 15 · Shader & effect recipes (copy-paste, then art-direct)

All GLSL targets WebGL2 / three r170+. Every recipe lists *where it belongs* — effects without a story get deleted.

## 1 · Fresnel rim (cheap, universal)
```glsl
// fragment
float fres = pow(1.0 - saturate(dot(normalize(vNormalW), normalize(vViewDir))), 3.0);
vec3 col = base + rimColor * fres * uRim;
```
Use on: silhouettes in dark scenes, ghostly forms, holographic panels.

## 2 · Particle morph (the "Liquid Particles" signature)
Pack N target positions into `DataTexture`s (or attributes `aA`, `aB`). Blend in the vertex shader with a curl-noise detour so the particles *stream* instead of linearly lerp:
```glsl
uniform float uMix;            // 0..1 scroll-driven, eased
uniform float uTime;
attribute vec3 aTarget;        // shape B (position = shape A)
attribute float aSeed;
vec3 curl(vec3 p){ /* 3 offset snoise samples, cross() */ }
void main(){
  float t = smoothstep(0.0, 1.0, clamp(uMix * 1.4 - aSeed * 0.4, 0.0, 1.0));   // staggered start per particle
  vec3 detour = curl(position * 0.6 + uTime * 0.1) * sin(t * 3.14159) * 1.8;   // arc away mid-flight
  vec3 pos = mix(position, aTarget, t) + detour;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * (1.0 / -mv.z) * mix(1.0, 1.8, sin(t * 3.14159));
  gl_Position = projectionMatrix * mv;
}
```
Sample target shapes from: a mesh surface (`MeshSurfaceSampler`), text (`canvas → pixels → positions`), SDF functions, or a GLB. 120–300k points at 60 fps with `gl.POINTS` + additive; cut to 40k on mobile.

## 3 · Dissolve (objects burn/erode away)
```glsl
float n = fbm(vWorldPos * 2.0);
float edge = smoothstep(uProg - 0.04, uProg, n);
if (n < uProg - 0.04) discard;
col += emberColor * (1.0 - edge) * 4.0;      // glowing edge → bloom picks it up
```
Use on: transitions between hero forms, a chapter swap, "ignition".

## 4 · Raymarched hero (SDF) — one full-screen quad
Use when the hero is an organic/impossible form (blobs, metaballs, fractal cores, liquid chrome). 64–96 steps, 2–3 smooth-union spheres + domain-warped noise, env reflection by sampling the `scene.environment` cube (pass as uniform) with the normal. Render at 0.5–0.75 resolution and upsample behind type. See `10-frontier-techniques.md §1`.

## 5 · Liquid chrome surface
`MeshPhysicalMaterial({ metalness:1, roughness:0.04 })` on a high-res icosphere/plane whose vertex shader (via `onBeforeCompile`) adds `fbm(position*1.2 + t)` along the normal, and recomputes the normal by finite differences. The *environment map is the entire look* — use `createStudioEnv` with colourful strips (magenta/cyan) for oil-slick chrome.

## 6 · Heat-haze / refraction distortion (post)
Add a `ShaderPass` before output: offset UV by `normalTex(uv*3 + t*0.05).xy * strength * mask`, where `mask` is a low-res render of "hot" objects (or just the lower 30 % of the frame for horizon shimmer). Strength ≤ 0.004 — more reads as underwater.

## 7 · Caustics on floors (light-mode glass worlds)
Project a scrolling, twice-sampled voronoi `abs(sin)` pattern onto the floor material's `emissiveMap` with additive 0.15 intensity. 1 draw call, huge perceived realism.

## 8 · Volumetric light cheat (when `createLightShafts` isn't enough)
Stack 3 additive, camera-facing, noise-modulated cone meshes (`depthWrite:false`), intensity tied to the angle between camera and light direction (`pow(dot(view, lightDir), 6)`). Fog colour = shaft colour × 0.3.

## 9 · Holographic panel
Fresnel rim + horizontal scanline `sin(vUv.y * 600. + t*5.)*0.04` + chromatic offset on edges + `uFlicker` rare spike. Always carry *real* content (UI, numbers) — the effect is garnish.

## 10 · Depth-of-field *feel* (without a DOF pass)
Near sprites: large soft discs (`createGlow`) at z closer than camera+1.5, alpha .12–.3, slowly drifting opposite to the camera; far practicals: bokeh discs (hexagonal sprite texture) sized by distance. Looks like a real lens at 1 % of the cost.

## 11 · Grade (LUT-lite)
Use the engine's `grade` (contrast, saturation, shadows/highlights tint). Tint shadows toward the *complement* of the accent (teal shadows / amber highlights; indigo / coral; violet / lime). That one choice is 30 % of "cinematic".

## 12 · Anti-banding
Add noise ≥ 0.035 in the final pass and render dark gradients with 10-bit `HalfFloatType` targets (the engine already does for the composer). Visible banding in a dark sky = instant "cheap".
