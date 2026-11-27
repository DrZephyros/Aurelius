# 08 · QA & Polish — the part that makes it shippable (and Awwwards-able)

The agent's biggest handicap is that it can't *see* its work unless it makes itself look. **Make yourself look.** Every phase ends with screenshots.

## 1 · The audit loop (`scripts/audit.mjs`) — run it, then LOOK

The agent's biggest handicap is that it can't *see* its work unless it makes itself look. **Make yourself look — and let a machine catch the mechanical failures first.**

```bash
npm i -D playwright pngjs && npx playwright install chromium
npm run dev &                                     # or serve a build
node scripts/audit.mjs http://localhost:5173 --out shots      # add --gpu on a real machine for true FPS
```

It is **deterministic**: the engine exposes `window.__aura.seek(p)` (and `?p=0.37` in the URL) which locks the playhead and settles instantly — identical input, identical frame. No scroll timing, no waiting for damping. In your own debugging use `__aura.info()` to read the live camera position, look target, fov, draw calls and triangles while you tune shots.

What it measures at 14 stops × 3 viewports (a fresh browser per viewport):
| Check | Catches |
| --- | --- |
| luma / contrast σ / clipped % / edge energy | black frames, washed-out frames, flat frames, blown bloom, empty frames |
| frame-to-frame Δ | **dead zones** (scroll that does nothing) and **jump cuts** (a cut where there should be a glide) |
| DOM chapters at every stop | copy colliding with copy, copy leaving the viewport (measured on the *text*, not the box), **empty first frame**, **empty last frame**, **no CTA in the last frame** |
| shot-list lint | not covering 0→1, no HOLD, no wide/close alternation, teleporting cuts, too few shots |
| chapters | late opening, early closing, long silences, headlines > 14 words |
| budgets | > 160 draw calls, > 1.8 M triangles |
| resilience | page with WebGL disabled (must not crash or hang on the loader), reduced-motion load |

It writes `shots/REPORT.md`, `report.json`, `shots/contact-desktop.png|mobile|wide` and exits non-zero on any **BLOCKER**. It also prints an *automated* score out of 80 (atmosphere 20 · unbroken 15 · rhythm 15 · craft 15 · **mobile & legibility 15**). The mobile pillar is where the audit used to be blind: it measures font sizes, WCAG contrast behind the copy, 44 px tap targets, CTA wrapping, horizontal overflow, the phone draw-call / triangle budget, the presence of a portrait rail and that a real scroll drives the playhead — at 390×844, 360×640 and 844×390 with real touch emulation. **The remaining 20 points — Authorship — and the real taste judgement are yours.**

> **Gate:** 0 blockers → open `contact-desktop.png` and `contact-mobile.png` with your image tool → critique (§2) → fix → re-run. Do this **at least three times** (blockout, light/material, polish).
>
> v1 of this audit scored an unmodified starter 80/80 while the mobile frames had a wrapped CTA, 8 px labels, headline-on-rings collisions and a placeholder-looking hero — the rubric could not see them. v2 scores that same build 65/80 with 14 blockers. **Add a check whenever your eyes find something the numbers missed.**

> A green audit proves the film is *mechanically sound*, never that it is *beautiful*. Both reference worlds scored 80/80 only after a real critique pass fixed things the numbers could not see (square stars, water-looking dunes, a hot corona).

Software GL (SwiftShader) is slow but pixel-accurate for composition; ignore its FPS.
If every screenshot is black: the WebGL context failed (flags / poster fallback), the loader is still up, or exposure/fog is wrong — the audit reports `dark` at p=0 as a BLOCKER for this reason.

## 2 · Critique protocol (be a harsh art director)
For each screenshot, answer in one line each:
1. **Poster test:** would this frame make a good wallpaper? If not → why (flat light? clutter? empty?).
2. **Depth:** can I name 5 distinct depth planes?
3. **Light:** where is the key/rim? Is there a colour contrast? Is anything blown out or crushed *unintentionally*?
4. **Type:** is it placed on a third, legible, interacting with the world? Any collision with the subject's focal point?
5. **Composition:** subject on a third line? negative space for copy? horizon not at dead centre?
6. **Continuity:** does it connect to the previous/next frame?
Write issues as a numbered list with the *specific fix* ("rim light too weak → DirectionalLight 3 → 6, colour 0x5ea2ff"), apply, re-shoot, repeat.

## 3 · Technical test matrix
| Test | Pass criterion |
| --- | --- |
| Scrub fwd/back/fast/slow | no pops, no stuck states, copy never overlaps |
| Jump (click nav → far chapter) | smooth dolly, no teleport, no blank frames |
| Resize (drag window, rotate device) | no stretch, camera aspect correct, HUD ok |
| Hidden tab 30s → return | no time-jump glitches (dt clamped), no memory spike |
| Reduced motion on | works, calm, complete |
| WebGL off (`--disable-gpu` or block context) | poster + readable content + CTA |
| Slow CPU (DevTools 6× throttle) | quality governor drops DPR; still interactive |
| Mobile touch | momentum scroll OK; text legible; CTA tappable (44px) |
| Console | zero errors, zero warnings from your code |
| Lighthouse (desktop) | Performance ≥ 70 (WebGL sites rarely hit 90), A11y ≥ 95, SEO ≥ 95 |
| Memory | `renderer.info.memory.geometries/textures` stable after 3 full scrolls |

## 4 · The Aura Score (100 points) — ship at ≥ 85
Score honestly; a 90 is rare.

| # | Category | Pts | 0 = | Full marks = |
|---|----------|-----|-----|--------------|
| **A** | **Atmosphere** | **25** | | |
| A1 | Lighting design (key/rim/practical, colour contrast) | 8 | default light | designed, moving, coloured |
| A2 | Depth layers & parallax (≥5 planes) | 6 | flat | strong occlusion + fg/bg |
| A3 | Materials (variation, env, special response) | 5 | plastic | tactile, believable |
| A4 | Air (fog, particles bands, shafts) | 6 | void | alive atmosphere |
| **U** | **Unbroken** | **20** | | |
| U1 | Single continuous camera, spatial transitions | 8 | sections | seamless |
| U2 | Scroll mapping (scrub, reversible, damped, no hijack) | 6 | triggers | pure playhead |
| U3 | World coherence (one idea, no style drift) | 6 | collage | authored |
| **R** | **Rhythm** | **20** | | |
| R1 | Pacing (wide/close alternation, hold, crescendo) | 8 | conveyor belt | edited like film |
| R2 | Scroll length & beats (earned, 500–1200vh) | 4 | too short/long | right |
| R3 | Final frame & CTA | 4 | cliff | poster + single CTA |
| R4 | Loader / entrance | 4 | spinner | deliberate chapter 0 |
| **A** | **Authorship** | **20** | | |
| A5 | Concept specificity (fails competitor-swap test?) | 8 | generic | unmistakable |
| A6 | Typography as architecture | 8 | PowerPoint | interacts with scene |
| A7 | Copy quality | 4 | filler | sensory & minimal |
| **P** | **Production** | **15** | | |
| P1 | Perf (fps, DPR governor, budgets) | 6 | stutters | 60fps |
| P2 | Responsive & mobile design | 4 | broken | designed variant |
| P3 | Resilience & a11y (fallbacks, reduced motion, SEO) | 5 | none | complete |

Output the filled table in your final message. For any category < 70% of its points, write the fix you applied.

## 5 · Polish passes (do all three)

### Pass A — Motion
- Are entrances **eased** (outExpo/outCubic), exits faster than entrances?
- Do holds last long enough to read the copy at 3 words/sec + 0.5s?
- Add ± ambient motion everywhere (breathing hero 0.05u, drifting dust, flicker) so frozen frames feel alive.
- Velocity effects: FOV kick 3–7°, aberration kick small. If it makes you queasy, halve it.
- Check ease-in/out seams between shots — if you feel a "bump", add an intermediate shot or change the `ease`.

### Pass B — Image
- Crush blacks slightly, protect highlights (ACES + grade contrast 1.06–1.1).
- Split-tone: cool shadows / warm highlights (or the brief's pair).
- Add a **hero highlight**: a specular sweep, glow, or rim brightest where the eye should land.
- Unify colour: generated images + procedural geometry must share a palette → adjust grade, fog colour, tint far layers.
- Kill any frame with: blown whites, banding gradients, texture stretching, z-fighting, visible plane edges.
- Vignette to focus; grain to unify.

### Pass C — Details
- Favicon, OG image (screenshot of the best frame), `<title>`, theme-color = background.
- Cursor, magnetic CTA, hover states, focus rings, selection colour = accent.
- Scroll cue that disappears; chapter counter; a quiet "Sound" toggle if audio exists.
- 404 page in-world. Footer that matches.
- Console clean. No layout shift (the stage is `100svh`, fonts preloaded with `font-display: swap` + `size-adjust`).
- Delete dead code, unused assets, debug overlays (`?debug` can stay).

## 6 · Fix-it table (symptom → first thing to try)
| Symptom | First fix |
| --- | --- |
| Frame is boring | move subject off-centre; add fg silhouette; narrow the lens; add rim light |
| Subject doesn't pop | raise rim light intensity ×2 + colour contrast; lower env intensity; darker bg |
| Scene feels empty | add scale cues & far dust band; lower fog density slightly; add distant lit windows/lanterns |
| Copy hard to read | scrim gradient behind; reduce simultaneous elements; increase size, not weight |
| Scroll feels "mushy" | raise damping λ 3.2 → 4.5; shorten `scrollVh` |
| Scroll feels "jerky/snappy" | lower λ → 2.6; add `ease:"inOut"` into holds only |
| Camera clips through geometry | add an intermediate shot; increase distance; set `camera.near` 0.3 |
| Banding in fog/sky | add grain, ensure bg == fog colour, dither gradient textures |
| Mobile too heavy | `ctx.mobile` branch: counts ×0.4, no reflector, DPR ≤ 1.1 |
| It "looks AI" | stop centring; add a cropped giant word, an imperfection (asymmetry, light leak, grain), and a specific real-world detail |

## 7 · Definition of Done
- [ ] `AURA_BRIEF.md`, `STORYBOARD.md`, `ASSETS.md` in the repo.
- [ ] 12 screenshots × 3 viewports reviewed; all issues closed.
- [ ] Aura Score ≥ 85 posted.
- [ ] `npm run build` passes; production build tested (not just dev).
- [ ] FPS ≥ 55 desktop on a mid GPU; governor verified.
- [ ] Fallbacks verified (no WebGL, reduced motion, mobile).
- [ ] README explains: run, build, swap assets, edit shots, change copy.
