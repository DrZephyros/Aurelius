# 05 · ONEIRIC — a creative-AI studio (Liquid Particles)

## The prompt
> "Site for ONEIRIC, a creative studio that makes AI-powered installations and brand worlds. It should feel like the future. Our nav: Work, Services, Contact."

## Direction lock
```
DIRECTION: 06 Liquid Particles (85%) + 12 glass panels (15%)
WORLD: a dark volume; a figure sculpted from ~200k points of cold light, reacting to the cursor.
HERO: the particle figure; three floating glass panels carry the copy.
SIGNATURE MOVE: The Dissolve — figure → drifting storm → logo glyph → planet, each hand-off driven by scroll, with curl-noise streams.
PALETTE: #04060f · #7f6bff (violet) · #3de7ff (ice) · #ff6b7a (coral counter-light)
FORBIDDEN: random noise cloud · same shape twice · large points.
```
## Storyboard (scrollVh 800)
| p | Shot | Change | Copy |
| --- | --- | --- | --- |
| 0–.15 | Figure centred, tilts toward cursor | points shimmer w/ pointer force field | "DISCOVER YOUR…" (fitted type, glass panel) |
| .15–.35 | Figure dissolves into stream sweeping left→right | camera sidesteps | "We build worlds that answer back." |
| .35–.55 | Points settle into the studio glyph; **hold** | coral rim kicks in | "Installations · Films · Interfaces" |
| .55–.75 | Glyph → planet, camera orbits | glass panels glide past | "Selected work" (3 panels = 3 projects) |
| .75–1 | Planet → a single bright point → CTA | everything calms | **Start a project** |
## Implementation
`15-shader-recipes.md §2`. Sample figure positions from a generated silhouette (canvas → alpha → positions) or `MeshSurfaceSampler` on any bust GLB. Pointer pushes points via a uniform `uPointer` projected into world space.
