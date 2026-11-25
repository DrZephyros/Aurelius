# 08 · QA & Polish — the part that makes it shippable (and Awwwards-able)

The agent's biggest handicap is that it can't *see* its work unless it makes itself look. **Make yourself look.** Every phase ends with screenshots.

## 1 · The screenshot loop (Playwright)
Install once: `npm i -D playwright && npx playwright install chromium`. GPU in headless needs flags:

```js
// scripts/shoot.mjs  —  node scripts/shoot.mjs http://localhost:5173
import { chromium } from "playwright";
const url = process.argv[2] ?? "http://localhost:5173";
const sizes = [{ w: 1440, h: 900, n: "desktop" }, { w: 390, h: 844, n: "mobile" }, { w: 1920, h: 1080, n: "wide" }];
const stops = [0, 0.04, 0.12, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
for (const s of sizes) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
  const logs = []; page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(m.text())); page.on("pageerror", (e) => logs.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);                                   // loader
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const p of stops) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * p));
    await page.waitForTimeout(1600);                                 // let the damped playhead settle
    await page.screenshot({ path: `shots/${s.n}-${String(Math.round(p * 100)).padStart(3, "0")}.png` });
  }
  console.log(s.n, "console issues:", logs.slice(0, 8));
  await page.close();
}
await browser.close();
```
Then **open the images** (use your image-reading tool) and critique them. Software GL (SwiftShader) is slow but accurate for composition; ignore its FPS.

If screenshots are all black: the WebGL context failed (check flags / the poster fallback), or the loader is still up (increase wait), or exposure/fog is wrong.

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
