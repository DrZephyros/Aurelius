# 07 · LUMEN — skincare brand (Glass Atrium, LIGHT mode)

## The prompt
> "Landing page for LUMEN, a clinical-luxury serum brand. Light, airy, expensive. Absolutely not dark and techy."

## Direction lock
```
DIRECTION: 12 Glass Atrium
WORLD: a bright atrium of frosted glass slabs and a floating arch, soft caustics on pale stone, sage and clay accents.
HERO: a frosted-glass bottle with a visible serum column, resting on a polished stone plinth with a real contact shadow.
SIGNATURE MOVE: Refraction Reveal — a glass slab slides over the headline; the type beneath bends and shifts.
PALETTE: #f4efe7 (bone) · #9fb39a (sage) · #c58f73 (clay) · #1b1b1b (type)
FORBIDDEN: dark mode · neon · overexposed whites without contrast.
```
## Storyboard (scrollVh 800)
| p | Shot | Copy |
| --- | --- | --- |
| 0–.15 | Wide atrium, bottle small on plinth | **LUMEN** · "Skin, clarified." |
| .15–.35 | Glass slab sweeps over type (refraction) | "Ninety-one clinical trials." |
| .35–.55 | Macro: serum column & dropper (hold) | "One molecule. Nothing else." |
| .55–.75 | Arch and slabs drift; caustics ripple on floor | "Made in small batches." |
| .75–1 | Hero bottle, CTA | **Begin your ritual** |
## Implementation
`glass()` for the bottle, `MeshPhysicalMaterial` frosted for slabs, planar contact shadow, exposure 1.05, bloom threshold 1.0, grade tint: shadows toward cool sage, highlights warm clay.
