# 01 · NOCTA — earbuds on an asteroid (Product Altar)

## The prompt
> "Build a 3D website for NOCTA, premium wireless earbuds with active noise cancelling. Dark, cinematic, product is the hero. Ship it like a $10k site."

## Direction lock
```
DIRECTION: 01 Product Altar (90%) + 09 Terrain Epic sky (10%)
WORLD: a cratered asteroid in cold starlight with a black planet limb behind — silence made physical.
HERO: earbuds + charging case (graphite lacquer, mint LED), resting on a flat basalt shelf.
SIGNATURE MOVE: The Exploded Ascent — the case opens, buds and 6 internal parts levitate on one axis with leader-line labels.
PALETTE: #05070b (dominant) · #7dffd9 (accent / LED) · #9fb4c8 (cold rock highlight) · #e9f1f6 (type)
CAMERA PERSONALITY: patient, macro-first, 85–135 mm feel; one pull-back reveal.
FORBIDDEN: studio void · rotating turntable · feature grid mid-scroll.
```

## Creative statement
We find NOCTA in the dark: a single mint LED on a rock older than weather. The camera is a macro lens crawling over lacquer, then the case opens and its anatomy rises like a held breath. We pull back to reveal the asteroid, the planet, the silence — and land on the buds, perfectly lit, with one button: *Pre-order*.

## Storyboard (scrollVh 1000)
| p | Shot | World change | Copy |
| --- | --- | --- | --- |
| 0–.12 | Low macro of case lid edge, rim only | LED blinks once; stars drift | **NOCTA** (giant, behind) · "Silence, engineered." |
| .12–.28 | Slide across lacquer to the hinge (fov 16) | highlight line travels the lid | "Lacquer polished 14 times." |
| .28–.40 | Crane up 40 cm, case opens | LED ramps, practical lights rock | — |
| .40–.62 | **Exploded Ascent** — camera slightly high, parts rise in order | labels draw in with leader lines | "48 dB" · "11 mm driver" · "5.4 g" |
| .62–.74 | Parts re-seat; pull back wide | planet limb enters; rim goes cold | "Made for the quiet hours." |
| .74–.90 | **Hold** — 3/4 low hero, buds in the foreground | motes lag the lens; bloom gentle | "30 hours. One charge." |
| .90–1 | Slow dolly in 10 % | LED steady; CTA fades up | **Pre-order — ships March** |

## Implementation notes
- Reference: `starter/src/aura/scene.halo.ts` (+ `HaloExperience.tsx`) — restyle, don't rewrite.
- Environment: `createStudioEnv` with two strip lights + one mint accent strip; `scene.environmentIntensity` 0.9 on product layer, 0.15 on rock (use `layers` or per-material `envMapIntensity`).
- The rock is *displaced + noise-roughness*; the shelf under the product is a flatter, slightly polished disc so the product doesn't float.
- Labels: project 3D anchors to 2D each frame, set `transform` on pre-created DOM nodes (no layout thrash).

## The lazy version
A centred GLB on a gradient with a rotation animation and a features grid. It passes "works", fails the poster test, the competitor test and the price test.
