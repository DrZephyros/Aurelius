# 18 · Frontier modules, looks, portability, verification (v18)

Everything here ships as **working, type-checked code** in `starter/src/aura/` — not recipes. `?world=meridian` runs all of it.

## 1 · What ships (and where)

| Technique (from ref 10) | Module | Notes |
| --- | --- | --- |
| Ray-marched SDF hero, metaballs, `RawShaderMaterial` (GLSL3), `gl_FragDepth` | `frontier/sdf.ts` → `createLiquidMetal` | box-bounded, camera-inside safe, alpha-to-coverage edges, tier-budgeted steps. Hero that merges / splits / pours. |
| GPU particles (GPGPU ping-pong, curl noise, attractor + swirl) | `frontier/gpgpu.ts` → `createGpuParticles`, `particleSide` | 4 k → 262 k particles, one draw call, fixed-step sim (same motion at 60/144 Hz), `warm()` for QA-stable starts, frozen under reduced motion. |
| Gaussian splats | `frontier/splat.ts` → `createSplats`, `loadSplat('.splat')`, `generateKnot/Cloud` | float-texture data, projected 2D covariance, counting sort throttled to camera motion. Budget: `ctx.budget.splats`. |
| SSAO / GTAO-class AO | `post.ts` → `createAoPass` (Alchemy obscurance) | host-run: `scene.post.ao`. Deterministic (no time term). |
| Bokeh depth of field | `post.ts` → `createDofPass` | host-run: `scene.post.dof` — foreground bleeds, sharp subject never smears, highlights bloom to discs. Mutate `post.dof.focus/aperture` in `update()` to rack focus. |
| `DepthTexture` | `post.ts` → `DepthPrepass` | half-res, no MSAA (portable, SwiftShader-safe). Per-object `userData.depthMaterial` lets a ray-marched object take part; `userData.noDepth` opts out. |
| `CubeCamera` live reflections | `frontier/probe.ts` → `createLiveProbe` | staggered; hide the reflecting object while capturing. |
| Audio | `frontier/audio.ts` → `createScore` + `score` prop on `<AuraExperience>` | procedural pad / sub / air-noise, chord follows chapter, `level()` for audio-reactive visuals. OFF until the visitor taps Sound; remembered; ducks when hidden. |
| WebGPU / TSL | `frontier/webgpu.ts` → `probeWebGPU`, `createComputeField` | **separate track**, dynamic import, not wired into the WebGL post stack. Type-checked + built in CI; *executed only where an adapter exists* — the audit never claims it ran on SwiftShader. Use as a progressive upgrade for ONE hero system. |
| SSR | not shipped | planar mirror (`floor.ts`) + live probe cover the cases that matter at web budgets; true SSR needs a GBuffer pass the host does not run. Do not fake it. |

Rules: **one frontier hero effect per chapter** (law 8). The budget decides counts (`ctx.budget`), never `mobile`.

## 2 · Looks — stop converging

`looks.ts` ships six looks (bone studio · noir lacquer · deep water · golden-hour dune · acid chrome void · cold paper). A look fixes ground, key/sky/ground colours (what chrome reflects), exposure, bloom discipline, grade and the CSS variables. **Phase 1 rule:** choose the look before the geometry; never reuse the previous project's. The mirror floor is now one option of six. The audit stamps a *look fingerprint*; `--compare other/report.json` flags `look-convergence` when two worlds are too close.

## 3 · Measured device budget

`device.ts` replaces `w < 760 || pointer: coarse`. It (1) classifies the GPU string (software / weak / strong), (2) cross-checks RAM + cores, (3) runs a ~100 ms calibration shader on the real GPU synchronised by `readPixels` (ms per megapixel), and takes the **worse** of benchmark and hints → `tier` + a `Budget` (dpr, msaa, particles ×, splats, SDF steps, which fx are allowed). `mobile` stays a *layout* hint. A narrow desktop window is not a weak device; a 4K iGPU is. The governor then steers live — **down fast (one slow 45-frame window), up slow (4 calm windows + cool-down), never above a level that already flapped**; fx drop in the order ao → dof → bloom.
Real devices: open the site with `?aura-debug=1` (live card) and call `window.__aura.perf()` → `{p50,p95,p99,worst,fps,gpu,bench}`. Run on one low Android, one mid Android, one iPhone; paste the three `perf()` outputs in your delivery note. **Frame rate under SwiftShader is not evidence.** `?tier=low|mid|high` forces a tier.

## 4 · The portable scene contract

`contract.ts` is types only. A host must honour: `shots[].at` timing, `shotsMobile` in portrait, `ctx.reduced` (ambient time frozen: `Frame.time` stays 0), `ctx.budget`, `f.quality`, pointer, `seek(p)`.
* `mountAura` — reference host (post, governor, fallbacks).
* `createMinimalHost(el, build)` — ~80-line host that honours every item above; copy it into R3F, Next, or the Builder bundle host.
* `adaptLegacy(old)` — wraps a pre-v18 `{scene, rail:{pos,look}, update(t,p,dt,cam)}` scene (e.g. the old Tidewell) so **per-shot timing, pointer, quality and reduced-motion are real**, not a shim that hard-codes them.
* `railSampler(shots)` — the Catmull-Rom sampler for hosts that drive their own camera.

## 5 · Fallbacks (verified, not hoped)

No WebGL / Data Saver / lost context / `?static=1` → the **static edition**: every chapter in normal flow as real text, the CTA, a designed poster (`poster` prop, or `.aura-poster-auto` gradient from the look; `audit --poster` writes copy-free `poster-desktop.png` / `poster-mobile.png`). The audit fails `fallback-empty` below 120 visible characters, `fallback-stuck` if the loader stays, `fallback-no-action` without a link/button **on the first screen (1280×800)**, and `fallback-font` when any text run's font stack does not end in a generic family (the v18 "serif body under a sans head" bug). v19 `AuraExperience` builds `.aura-static-head` (title · lede · the first `a[href]`/`button` from your chapters) so the first screen always carries an action; the giant word is hidden in the static edition (the title replaces it).
Reduced motion: ambient time frozen, no parallax / idle sway / FOV kick / grain shimmer, on-demand rendering. The audit fails `rm-moving` if two frames 1.5 s apart differ, `rm-not-frozen` if `info().motion.frozen` is false.

## 6 · The audit v4 — what it is and is not

* Class-agnostic: judges visible text nodes and `a[href]/button/[role=button]`; chapter-rhythm checks run only if chapters exist (`[data-a]`, `[data-aura-chapter]`, or `aura.audit.json` → `{"chapters":".tw-beat","ignore":".cookie","hud":".tw-hud"}`). A site that calls its button `.tw-cta` is not penalised.
* Contrast is measured on **glyph pixels** against a frame where glyphs are transparent but the scrim, overlay gradients and button fills stay. Changing `--aura-scrim-a`, `--aura-plate-a` or an overlay gradient moves the number. Giant display words are judged on their letters, not their line box.
* **Fixes are concrete (v4).** Polarity comes from the glyph colour; the maths runs in sRGB (where CSS composites). Each failing chapter gets ONE of: `set --aura-plate-a: 0.78 on <chapter> (now 0.55)` · `swap <chapter> from .aura-left to .aura-right` (only when the mirrored rect was measured clear) · `move the SUBJECT out of this text band (31–46 % of the frame)` when no scrim ≤ 0.92 can work · `the glyph colour itself is mid-tone` / `scrim colour is the same tone as the text`. v3's "raise the scrim by ≈1133 %" came from guessing polarity from a backdrop percentile; it can no longer happen. The report's worst frame wins when a chapter fails in several.
* Fix loop for a persistent `contrast-fail` on giant type, in order: (1) apply the printed `--aura-giant-plate-a` / `--aura-plate-a` value; (2) move the subject out from behind the word (shot `look.y` lower, hero low in frame 1 — Meridian does this); (3) shrink with `data-fit` ≤ .72 or set the word's `mix-blend-mode`; (4) only then change colour. Never suppress it.
* `--profile strict|standard|lenient`, every threshold is stamped in `report.json` with `auditVersion`; `--compare prev/report.json` separates "the gate changed" from "the scene regressed".
* The score is a **hygiene floor** (per-rule caps, nothing can be zeroed by repetition). It cannot rate taste; history: 80/80 ↔ 6.5/10, 65/80 ↔ 7.5/10. `TASTE.md` (copied beside the report from `templates/TASTE.template.md`, with scoring anchors) is the rubric that decides shipping.
* **Outputs:** `REPORT.md` (starts with *Fix these first* — ordered, deduplicated), `fixes.json` (same list, machine-readable), `TASTE.md`, `contact-*.png`, `fallback-nowebgl.png`, `report.json`.
* **Speed on weak machines:** `--only desktop,landscape --stops 6 --no-resilience` for the inner loop; the full gate once at the end. Software GL costs ~10–60 s per 1440×900 frame on 2 cores — scale with `--scale 0.5` (desktop viewports only; touch viewports stay real size).
* Also checks: asset 404s **and 200-as-HTML SPA fallbacks for asset URLs**, `--tsc`, `--throttle N` (CPU throttle for relative cost), `--serve dist` (built-in static server with honest 404s).

## 7 · Source of truth and versions

`skill-src/aura-3d-web` is the only source. `VERSION` + `skill.json` (file list + sha256) are regenerated by `scripts/gen-skill-raw.mjs`; the site embeds from there. `three` is pinned to an exact version in `starter/package.json` (0.187.0) and the same version is what the library templates import — test fixes against the pinned version. `starter/tsconfig.json` has `noUnusedLocals/Parameters`; `npm run typecheck` must be clean before `npm run audit:full`.
