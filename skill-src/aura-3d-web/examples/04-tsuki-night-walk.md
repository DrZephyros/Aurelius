# 04 · TSUKI — ramen & sake house (Night Walk)

## The prompt
> "Website for TSUKI, a 12-seat ramen and sake house in Kyoto-style alley. I want people to feel like they're walking in."

## Direction lock
```
DIRECTION: 05 Night Walk
WORLD: a lantern-lit alley under a blood moon; torii, stone steps, a low wooden facade with steam from the door.
HERO: the doorway curtain (noren) at the end of the walk.
SIGNATURE MOVE: Type Between Layers — "TSUKI" sits between foreground grass and the shrine; letters split as the camera passes through.
PALETTE: #0b0a14 (indigo-black) · #c4202a (moon, gates) · #ffb25e (lanterns) · #efe6d6 (type)
FORBIDDEN: stock food photos · flat parallax · red everywhere.
```
## Storyboard (scrollVh 900) — ≥ 7 planes: moon, ridge, far roofs, mid gates, shopfront, foreground grass/lanterns, particle layers
| p | Shot | Change | Copy |
| --- | --- | --- | --- |
| 0–.14 | Wide over the street, moon huge | embers drift | **TSUKI** · "Twelve seats. One broth." |
| .14–.36 | Walk forward under torii, letters split | lanterns flicker in sequence | — |
| .36–.52 | **Hold** — the doorway, steam, noren sway | warm light spills on wet stone | "Open at dusk. Closed when it's gone." |
| .52–.72 | Push through the noren — macro on a bowl (generated plate + steam particles) | grade warms 12 % | "Fourteen hours of bone." |
| .72–.88 | Back out to the counter — 12 seats lit | lanterns bloom | "Twelve seats." |
| .88–1 | Final frame at the door | moon halo | **Reserve a seat** |
## Implementation
`createLayerStack` with 7 generated plates (alpha cut-outs), moon as `createGlow` + a depth-sorted disc, steam = particles with soft sprites, noren = a cloth vertex-sway shader.
