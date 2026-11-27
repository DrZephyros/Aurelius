# 17 · The mobile contract — a phone is not a small desktop

More than half of the people who open an immersive site open it on a phone, held in one hand, on a mid-range GPU, with a browser bar that appears and disappears. A site that merely *doesn't crash* there has failed. This file is the contract the starter implements and the audit enforces.

> **Rule zero.** Author the portrait edit *first* for any consumer / local / food / event / brand site, *second* for B2B and portfolio. Never "shrink" the desktop edit.

---

## 1 · What the engine now does for you (do not re-implement)

| Concern | Built-in behaviour | Where |
| --- | --- | --- |
| Device class | `ctx.tier` = `"high"` desktop · `"mid"` modern phone · `"low"` ≤3 GB RAM or ≤4 cores. `ctx.mobile`, `ctx.coarse`, `ctx.portrait` also passed to your builder | `engine.ts` |
| Portrait rail | `scene.shotsMobile` is selected **live** whenever aspect < 0.85 (and re-selected on rotate). Same `at` windows as desktop → DOM chapters need no changes | `engine.ts` |
| Lens fit | In portrait the vertical FOV widens through `tan()` so the subject keeps its *width* (never the old flat +18°). Capped at 78°. `portraitFit` tunes it (default 1 desktop rail · 0.55 on a mobile rail) | `engine.ts` |
| Composition | `portraitLift` (default 0.11) shifts the whole picture up with a camera view-offset, so the subject sits above the copy zone with **zero scene changes** | `engine.ts` |
| Pixel budget | DPR cap 1.75 desktop · 1.25 mid phone · 1.0 low phone; floor 0.75; adaptive governor steps down, never up | `engine.ts` |
| Anti-aliasing | MSAA ×4 desktop · ×2 mid phone · off on low tier (HalfFloat target, so HDR survives to bloom) | `engine.ts` |
| Touch input | `pointermove` from a finger is **ignored** (a thumb drives scroll, not parallax). Coarse pointers get a slow idle sway instead, so the world still breathes | `engine.ts` |
| Scroll range | `trackProgress` measures against the *largest* `innerHeight` seen → no progress jump when the URL bar collapses, and progress reaches exactly 1 | `choreo.ts` |
| Stage height | `100svh` (stable) with `100vh` fallback | `aura.css` |
| Context loss | `webglcontextlost` → `preventDefault`, static edition at once, engine re-mounts on `webglcontextrestored` (iOS Safari does this under memory pressure) | `engine.ts`, `AuraExperience.tsx` |
| Static edition | No WebGL, **Data Saver / 2G**, or a lost context → `.is-static`: same copy, normal flow, designed gradient — a complete page, not a blank | `AuraExperience.tsx`, `aura.css` |
| Legibility | `.aura-stage::before` scrim under the copy zone (0.62 desktop · 0.84 phone) **plus a local plate under every copy block** (`--aura-plate-a`, 0.55 · 0.62 phone), copy text-shadow; phone type is 14 px labels / 17 px body / 2.1–3 rem headings | `aura.css` |
| Landscape phone (≤ 480 px tall) | giant title in the TOP band (centred at 22 %, ≤ 34 vh), side copy anchored to the BOTTOM band — they cannot share a row (v18 collided by 180×16 px) | `aura.css` |
| Phone composition | `shotsMobile[0].look.y` ABOVE the hero's y parks the hero lower in frame, under the title; macro shots keep the subject in the upper half | `scene.example.ts` |
| Touch targets | `.aura-cta` is ≥ 52 px tall, `white-space: nowrap`, `touch-action: manipulation`; hover styles only under `@media (hover: hover)`, with `:active` / `:focus-visible` for touch + keyboard | `aura.css` |
| Safe areas | `viewport-fit=cover`; copy / HUD offset by `env(safe-area-inset-bottom)` | `aura.css`, `index.html` |
| Landscape phone | `max-height: 480px` edit: paragraph dropped, headline + CTA stay on screen | `aura.css` |

---

## 2 · What YOU must author (the engine cannot guess composition)

### 2.1 `shotsMobile` — mandatory
Return it from your scene next to `shots`. Recipe:
1. **Same story, same `at` values.** Chapters are windowed on `at`; do not move them.
2. **Closer.** A phone is ~390 px wide. Pull the camera in ~15–25 % on wide shots; keep macro shots macro.
3. **Subject in the upper 60 %.** The bottom third belongs to copy and the thumb. (`portraitLift` already moves the frame up ~11 %; compose for the rest.)
4. **Less lateral travel.** Reduce x-swing by ~40 %. Portrait + sideways whip = nausea. Prefer dolly / crane / push moves on the z and y axes.
5. **One hold per hero moment, a touch longer** (a thumb flick overshoots — the hold absorbs it).
6. **Last frame is a poster** for a 9:19.5 crop: centred, symmetrical, CTA below.

```ts
return { scene, shots: DESKTOP_SHOTS, shotsMobile: PORTRAIT_SHOTS, portraitLift: 0.11, … };
```

### 2.2 Budgets by `tier`, not by a boolean
```ts
const N = !mobile ? 110 : tier === "low" ? 36 : 56;          // instanced shards
const dust = !mobile ? 2600 : tier === "low" ? 600 : 1000;   // particles
const floorOk = tier !== "low";                              // planar reflection = a 2nd scene render
const detail = mobile ? 12 : 22;                             // procedural geometry subdivisions
```
Reserve `transmission`, `Reflector`, `iridescence` stacks and SSR-style tricks for `tier === "high"` or hero meshes only. A phone has roughly 1/10th of a desktop GPU's fill rate.

### 2.3 Copy for thumbs
- Headline ≤ 8 words on phones (the CSS clamps to `9.4vw`). Hide paragraphs in landscape.
- One CTA, label ≤ 14 characters, inside the bottom 40 % of the screen, ≥ 44×44 px, ≥ 8 px from every other target.
- Never put copy over the *brightest* part of the world. The audit measures it.

### 2.4 Scroll length
Give phones their own distance: `<AuraExperience scrollVh={800} scrollVhMobile={620}>`. A thumb flick covers ~2× a wheel notch; 520–700 vh is the sweet spot for a 6–8 shot film. Never use `scroll-snap`, never `preventDefault` a touch event.

---

## 3 · Hard requirements (the audit fails the build on these)

| Code | Rule |
| --- | --- |
| `tiny-text` | No readable text under 11 px (12 px on touch viewports → `small-text` warning) |
| `contrast` | Body text ≥ 4.5 : 1, large (≥ 24 px) ≥ 3 : 1 — **measured against the frame rendered without the copy**, brightest 8 % (3 % for large type) |
| `tap-target` | Every link / button on a touch viewport ≥ 44×44 px |
| `cta-wrap` | The CTA label never wraps |
| `h-scroll` | `scrollWidth ≤ innerWidth` at every stop |
| `clipped-copy` / `collision` | At 390×844, 360×640 **and** 844×390 |
| `no-mobile-rail` | Portrait must run `shotsMobile` |
| `mobile-draw-calls` / `mobile-triangles` | ≤ 90 draw calls · ≤ 400 k triangles on a touch viewport |
| `scroll-not-driving` | A real `scrollTo(50 %)` must put the playhead near 0.5 and not be locked |
| `touch-emulation` | The viewport must really present as `(pointer: coarse)` |

---

## 4 · Device test matrix (do all, in this order)

1. `node scripts/audit.mjs <url>` — runs desktop 1440×900, wide 1920×1080, **mobile 390×844** and **small 360×640** and **landscape 844×390** with real touch emulation.
2. Open `contact-mobile.png`. For each frame ask: is the subject high? does the copy have air? is the CTA on one line? would a thumb reach it?
3. Real device, if you can: iPhone Safari (URL-bar collapse, context loss, 100svh) and a mid Android Chrome (≤ 4 GB). Scroll the whole film twice, rotate once, background the tab for 30 s and return.
4. `?p=0.5` deep-links work on phones too (`window.__aura.seek` is the QA hook).
5. Throttle: DevTools → 4× CPU slowdown. The governor must settle on a steady frame rate within ~3 s. If it bottoms out (quality 0.2), the scene is too heavy for the tier — cut counts, don't cut the story.

---

## 5 · Anti-patterns (each one has shipped in a real "immersive" site)

- Desktop rail reused in portrait → a tiny hero in a sea of black with the headline fighting the rings.
- A 13 px mono CTA with `letter-spacing: .22em` that wraps to two lines on a 360 px screen.
- Hover-only reveals (nothing happens on a phone, or the hover sticks after a tap).
- `height: 100vh` stage → the whole composition jumps ~80 px when the URL bar collapses.
- Pointer parallax driven by touch events → the camera jitters while the thumb scrolls.
- Full-DPR + MSAA + bloom + planar mirror on a 3 GB phone → 18 fps and a hot device. The governor is a seatbelt, not a design.
- No static edition → in-app browsers (Instagram, TikTok, LinkedIn) that block or kill WebGL show a blank page.
- Copy placed over the brightest ring / glow because it "looked fine on desktop".
