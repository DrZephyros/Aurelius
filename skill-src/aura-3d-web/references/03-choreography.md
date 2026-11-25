# 03 · Choreography — camera, scroll, text, time

The engine (`starter/src/aura/engine.ts`) gives you the physics. This file teaches you to *direct* with it.

## 1 · The playhead

```
native scroll ─▶ trackProgress(section) = raw target 0..1
                       │  critically damped (λ≈3.2)
                       ▼
                 f.p  (the playhead)  ─▶ camera rail, scene.update, DOM windows, HUD
```
- **One source of truth.** Never read `window.scrollY` anywhere else. Camera, copy, particles, light all read `f.p`.
- **Damping is the dolly.** λ = 3.2 feels like a heavy cinema dolly. 2 = dreamy/floaty (serenity), 5 = snappy (speed/sport), 8+ = nearly 1:1 (UI-heavy). Change in `damp(S.prog, S.target, λ, dt)`. Reduced-motion uses 20.
- **Velocity is free drama.** `f.velocity` (|Δp|/s, smoothed) drives FOV kick, chromatic fringe, particle stretch, ring spin. Use it for *every* "this feels fast" moment instead of scripted speed-ups.
- **Never hijack scroll** (`preventDefault`, wheel capture). It breaks trackpads, a11y and mobile. Use the damped playhead instead — it feels hijacked without being hijacked.

## 2 · Writing a shot list

```ts
const shots: Shot[] = [
  { at: 0.00, pos: [0, 1.4, 15], look: [0, 1.6, 0],  fov: 38 },               // establish
  { at: 0.20, pos: [3.4, 1.8, 7.5], look: [0, 1.5, 0], fov: 34 },            // push-in
  { at: 0.40, pos: [-2.6, 2.2, 3.4], look: [0, 1.6, 0], fov: 24, ease: "inOut" }, // macro (ease INTO the hold)
  { at: 0.58, pos: [-2.6, 2.2, 3.4], look: [0, 1.6, 0], fov: 24 },           // HOLD = same pos twice
  { at: 0.78, pos: [0.6, 6.5, -1.5], look: [0, 0.5, -7], fov: 52 },          // crane
  { at: 1.00, pos: [0, 2.2, -16], look: [0, 2.4, -44], fov: 60 },            // fly-through
];
```
- `at` is **time in scroll space**. Distance between `at` values = how long the move lasts. Wide gap = slow glide. Narrow gap = whip.
- **Hold:** repeat pos/look/fov at two `at` values. The camera barely moves (pointer parallax + damping keep it alive) while copy is read. Hold ≈ 8–15% of the total range.
- **Easing:** default `linear` keeps velocity continuous (feels like a camera operator). Use `inOut` *only* when settling into a hold; `out` for decelerating arrivals. Don't ease every segment — that causes stop-start "conveyor" feel.
- Look-at is as important as position. **Lead the subject**: look slightly *ahead* of where you're going. Keep the subject on a third-line (look-at offset ±0.5–1.5 on x), not dead centre.
- Keep ≥4 shots with a **different lens** each (24° tele / 38° natural / 52° wide / 60+° speed). Lens change is the cheapest "production value".
- Add `roll: ±1.5–4` on one shot (Dutch angle) for tension; zero it out for calm shots.
- Path-length awareness: Catmull-Rom overshoots on tight turns. If the camera clips geometry, add an intermediate shot, don't fight the curve.

### Camera move vocabulary
| Move | How | Feels like |
| --- | --- | --- |
| **Push-in / dolly in** | pos.z decreases toward subject, fov slightly narrows | intimacy, importance |
| **Pull-back reveal** | start tight, pos moves away, fov widens | "oh — it's huge" |
| **Orbit / arc** | pos travels a circle, look fixed on subject | product worship |
| **Crane up/over** | pos.y rises with look-at pulling down/forward | scale, god's-eye reveal |
| **Truck/pan (parallax slide)** | pos.x moves, look.x moves 40% as far | layered 2.5D depth |
| **Fly-through** | pos passes through an opening (door, ring, canyon) | transition between worlds |
| **Dutch whip** | narrow `at` gap, fov +20, roll ±6, then settle | action beat |
| **Tele-compression** | far camera + fov 20–26 | luxury, flattening, bokeh feel |
| **Vertigo (dolly-zoom)** | move toward while widening fov | unease / reveal |

## 3 · Driving the world from `f.p`

Pattern: describe each element's life as **windows** on the playhead using `seg`, `pulse`, `ease`:

```ts
update(f) {
  const ignite   = ease.inOutCubic(seg(f.p, 0.25, 0.45));   // 0→1 during chapter 2–3
  const calmDown = 1 - seg(f.p, 0.70, 0.85);
  core.emissiveIntensity = 1.4 + ignite * calmDown * 5;
  hero.rotation.y = f.p * Math.PI * 3.2;                     // scrub, never time-based spin
  fog.density = lerp(0.045, 0.012, seg(f.p, 0.6, 0.8));      // fog clears as we ascend
  rimLight.position.x = lerp(-6, 6, f.p);                    // rim sweeps across the subject
}
```
**Never** use `setInterval`/`time`-only animation for narrative elements — they must scrub. Time-based motion (drift, flicker, breathing) is for *ambience* only and must be low-amplitude.

### Things to scrub with scroll (checklist)
Hero rotation / assembly · light colour & intensity · fog density & colour · exposure · bloom strength · particle speed/size/colour · floor reflectivity · sky colour (time-of-day) · emissive windows igniting in sequence (`seg(p, a + i*step, a + i*step + w)`) · text tracking · counters · UI plane opacity & z.

### Staggers (the "sequential ignition" trick)
```ts
windows.forEach((w, i) => { const k = seg(f.p, 0.12 + i*0.012, 0.12 + i*0.012 + 0.05); w.intensity = ease.outExpo(k) * 3; });
```
Sequential lighting up of N things over a short window is one of the most satisfying scroll moments ever. Use it.

## 4 · DOM choreography

`bindDom(overlay)` writes `--in`, `--out`, `--vis`, `--local` on every `[data-a][data-b]` element every frame (from the damped `f.p`, so DOM and camera are perfectly in sync).

```html
<div class="aura-copy aura-left" data-a="0.22" data-b="0.40" data-fade="0.05">…</div>
```
- Align DOM windows to the shot list: copy for the push-in lives in `[0.22–0.40]`.
- **Don't fill every range.** At least one chapter has *no* text.
- Use `--local` to scrub *inside* a chapter: counters (`calc(var(--local) * 100)`), giant type tracking/scale, progress bars, clip-path reveals (`clip-path: inset(0 calc((1 - var(--in)) * 100%) 0 0)`).
- Split headlines per word/char only when you have budget — put per-char delay as `transition-delay` replaced with an index offset on `--in`: `opacity: clamp(0, calc(var(--in) * 6 - var(--i)), 1)` with `style={{ "--i": index }}`.
- Interactive elements (CTA, nav) need `className="aura-hit"` since the overlay is `pointer-events: none`.
- Visibility hidden outside window is handled; don't also toggle display.

## 5 · The text sandwich (signature technique)

Goal: giant title sits **behind** the foreground subject but **in front of** the background — instant depth.

**CSS-only (image plates):** three stacked layers in `.aura-overlay`, back→front:
1. background plate (sky/water/mountains) — or the WebGL canvas
2. `.aura-giant` (title, `data-a/data-b`)
3. `<img class="aura-cutout">` — transparent PNG of the subject (house, character, product) sized identically to the plate.
Generate the cut-out by background-removing the hero render (see asset pipeline §3) — or render it from three with a depth/ID mask.

**Pure WebGL:** render the title as a plane (canvas texture or `troika-three-text`) at a z *between* two layers of `createLayerStack`. Move the plane with scroll for the parallax slip.

**Reflection:** `.aura-reflect` (data-text) for DOM; in WebGL reflect with `createMirrorFloor` and let the real text mesh be reflected for free.

## 6 · Transitions between worlds
(See doctrine §1 for the toolbox.) Implementation recipes:
- **Fog pass:** `fog.density = base + pulse(p, a, b, .03, .03) * 0.25` and swap visibility of two groups at the pulse peak.
- **Occluder wipe:** a large dark mesh (pillar/leaf cluster) crosses the camera: animate its x from −8→8 across 0.05 of the playhead; swap sets mid-cross.
- **Dive:** at the water line, flip `scene.background`, `fog.color`, grade shadows tint, and spawn bubbles (particle band with upward velocity).
- **Flash:** increase `bloom.strength` 0.8 → 3 → 0.8 over 0.03 range and cross-fade ambient colour at peak.

## 7 · Time-of-day / colour scripting
Lerp these together along `f.p` for a free emotional arc: `scene.background`, `fog.color` (always equal), `rig.key.color`, `rig.rim.color`, `renderer.toneMappingExposure`, `grade.shadows/highlights`, and the CSS `--aura-bg`/`--aura-accent` (so the DOM palette follows the world). Use `THREE.Color.lerpColors` with 3–4 palette stops: *dusk blue → violet → ember orange → night teal*.

## 8 · Pointer & touch
- Pointer parallax is built in (`parallax` in world units; 0.4–1.2). Reduce for macro shots.
- Hover on the hero: raycast → set a `hoverK` damped value → drive emission, scale 1→1.04, cursor `data-cursor="view"`.
- Mobile: no pointer. Use **device tilt** (opt-in, iOS requires permission) or a slow idle drift (`sin(t*.2)`) so frames never feel frozen.
- Touch scrolling is faster: shorten `scrollVh` by ~20% on `(pointer: coarse)` or lower damping λ.

## 9 · Sound (optional, opt-in)
Autoplay is forbidden. Provide a tiny "Sound on" toggle in the HUD. Use 3 stems (ambient bed, tonal swell tied to `velocity`, one-shot accents at chapter hits) with WebAudio gain nodes driven by `f.p`. Fade, never cut.

## 10 · Choreography QA
- Scrub slowly and quickly, forwards and backwards: nothing pops, nothing is left in a half state.
- Pause at 10 random `p` values: every frame is composed (subject on a third, foreground present, no text collisions).
- Count changes per 100vh: ≥ 3 distinct things move/change, but **only one** is the hero.
- Check the end: reaching `p = 1` must feel *final* (a held, composed image), not a cliff.
