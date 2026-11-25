# 07 · Performance & resilience — the experience must survive the real world

A gorgeous site at 22fps is a failure. A gorgeous site that is blank on a 2019 Android is a failure. Design for both.

## 1 · Budgets
| Metric | Desktop target | Mobile target |
| --- | --- | --- |
| Frame rate | 60fps (≥ 55 p95) | ≥ 40fps |
| Blocking first load | ≤ 4 MB | ≤ 3 MB |
| Total first-load assets | ≤ 12 MB | ≤ 8 MB |
| Draw calls | < 150 | < 80 |
| Triangles on screen | < 1.5M | < 400k |
| JS (gzip) | < 350 KB + three | same |
| DPR | ≤ 1.75 | ≤ 1.25 |
| GPU memory | < 400 MB | < 200 MB |
| LCP | < 2.5s (loader/poster counts) | < 3.5s |

## 2 · The adaptive quality governor (built into the engine)
`mountAura` measures average frame time after a 90-frame warm-up. If it is slower than ~26ms for 45 frames, `quality` steps down by 0.2 (min 0.2), reducing pixel ratio and disabling bloom below 0.45. **It never steps back up** (prevents flapping). Your scene should read `f.quality` and gate:
```ts
floor.setEnabled(f.quality > 0.5);
glassMesh.material = f.quality > 0.6 ? glassPhysical : glassCheap;
dustNear.points.visible = f.quality > 0.3;
```
Also decide the *initial* quality: mobile starts at 0.75; consider starting low if `navigator.hardwareConcurrency <= 4` or `navigator.deviceMemory <= 4`.

## 3 · CPU-side rules
- **No allocations in `update`** — reuse vectors/colors/dummies. GC pauses = micro-stutter in scroll.
- Use `InstancedMesh` for repeats; `BufferGeometry` merged for static clutter (`mergeGeometries`).
- Update only what changed: don't set `matrixWorldNeedsUpdate` for static meshes; set `matrixAutoUpdate = false` on static objects after placing them (`obj.updateMatrix()` once).
- Animate in shaders (uniforms) rather than per-vertex in JS.
- Throttle DOM writes: `bindDom` writes CSS variables only — never `getBoundingClientRect` inside the frame loop except the single `trackProgress` read.
- Keep the rAF loop paused when the tab is hidden or the canvas is off-screen (the engine does both).

## 4 · GPU-side rules
- Fill-rate is the usual killer: large transparent overlapping layers, full-screen post, high DPR, transmission, reflectors. Reduce **pixels** first (DPR), geometry second.
- One shadow-casting light, small maps. Prefer baked/fake shadows.
- Textures: ≤ 2048², compressed (KTX2/Basis ideal, WebP acceptable), mipmaps on, `anisotropy` ≤ 8. Power-of-two helps mobile.
- Avoid `MeshPhysicalMaterial` with *all* features on every mesh; reserve clearcoat/transmission/iridescence for 1–5 hero meshes.
- Bloom is expensive at full-res: the engine's bloom runs at half-res internally; disable at low quality.
- Reflector: texture ≈ 0.35–0.5 of screen; skip below quality 0.5.
- Overdraw in particles: keep point sizes clamped (shader clamps to 64px) and counts moderate.

## 5 · Loading strategy
1. Paint the **loader** instantly (it's DOM/CSS; included in the starter).
2. Load only *chapter 1–2* assets as blocking. Everything else after `onReady` via `requestIdleCallback`.
3. Use `THREE.DefaultLoadingManager` so the counter reflects real progress.
4. `<link rel="preload" as="image" href="/assets/poster.webp">` for the poster; `fetchpriority="high"`.
5. Compile shaders before reveal: render one frame during the loader (`renderer.compile(scene, camera)` — the engine renders the first frame before the loader wipes).
6. Serve assets with `Cache-Control: immutable`, gzip/brotli; host heavy files on a CDN.

## 6 · Responsive design
- **Portrait phones:** the engine widens FOV (+18°) when aspect < 0.8. Re-check framing: the subject must fit horizontally; move text to the bottom third; hide secondary HUD.
- Provide a **mobile shot list** if the desktop rail relies on horizontal composition: `const shots = isMobile ? mobileShots : desktopShots`.
- Reduce counts: particles ×0.35, shards ×0.5, no mirror floor, smaller textures (`ctx.mobile`).
- Touch scroll is momentum-heavy: if the playhead overshoots, raise damping λ on `(pointer: coarse)`.
- Test 360×640, 390×844, 768×1024, 1440×900, 1920×1080, 2560×1080 (ultrawide: clamp the FOV so nothing important is cropped).
- `100svh` not `100vh` for the sticky stage (the starter uses both with fallback) to avoid mobile URL-bar jumps.

## 7 · Fallbacks (non-negotiable)
| Condition | Behaviour |
| --- | --- |
| No WebGL / context creation fails | `AuraExperience` shows the `poster` image and the chapters as static stacked sections (render the chapters list in a plain `<main>` as well). |
| `prefers-reduced-motion` | Playhead is near-instant, no velocity FOV/aberration, no pointer parallax, no blur transitions, reduced grain; scene still scrubs. |
| Context lost (`webglcontextlost`) | `preventDefault()`, show poster, attempt re-mount on `webglcontextrestored`. |
| Very low-end (quality hits 0.2 within 3s) | Swap to a **lite** mode: static camera + CSS parallax over the poster layers. |
| JS disabled | `<noscript>` with the poster + text content + CTA. |
| Save-Data / slow network | Skip video/frame sequences; load 1k textures; no HDRI. |

## 8 · Memory & lifecycle
- `dispose()` on unmount (engine disposes geometry, material, textures, composer, renderer; forces context loss). In React StrictMode dev the effect double-runs: the starter handles it via the `dead` flag.
- Dispose your own `WebGLRenderTarget`s, `Reflector`s (`mirror.getRenderTarget().dispose()`), and loaders' caches (`THREE.Cache.clear()`).
- Don't create new materials per frame or per particle.

## 9 · SEO & sharing
- The immersive page needs real content for crawlers: `<title>`, meta description, one `<h1>` (the hero word as visually-hidden text or the real element), OG image (a 1200×630 screenshot of the poster frame), structured data if relevant.
- Put the factual content (address, pricing, specs, contact) in real HTML after the experience.
- Provide `/` (experience) and, if useful, `/lite` (simplified, no WebGL) for sharing in contexts that block WebGL (some in-app browsers).

## 10 · Measuring
```js
// quick FPS probe in the console / Playwright
let n=0,t0=performance.now(); const f=()=>{n++; performance.now()-t0<5000?requestAnimationFrame(f):console.log('fps',n/5)}; f();
// then scroll programmatically:  window.scrollTo({top: document.body.scrollHeight, behavior:'smooth'})
```
Use Chrome DevTools → Performance (check long frames, GC), Rendering → FPS meter, `renderer.info.render.calls / triangles` and `renderer.info.memory` printed from a debug overlay (`?debug`).
