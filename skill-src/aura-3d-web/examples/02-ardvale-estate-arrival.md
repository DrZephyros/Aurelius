# 02 · ARDVALE — alpine estate development (Dusk Arrival)

## The prompt
> "Luxury lakeside residences in the Alps, four villas. High-end buyers. They should feel like they've already arrived."

## Direction lock
```
DIRECTION: 03 Dusk Arrival
WORLD: blue-hour lake under a ridgeline; four stone-and-timber villas stepped along the shore; the lake mirrors everything.
HERO: the villas with windows igniting one by one; the name ARDVALE giant behind them, mirrored in the water.
SIGNATURE MOVE: Windows Ignite + Name in Water.
PALETTE: #07131f (sky/water) · #ffb45e (windows, CTA) · #cbd5de (stone) · #f3f5f7 (type)
CAMERA PERSONALITY: aerial → skim → threshold; unhurried, architectural, level horizon.
FORBIDDEN: daylight · floor-plan carousel in the film · drone-spin.
```
## Storyboard (scrollVh 900)
| p | Shot | Change | Copy |
| --- | --- | --- | --- |
| 0–.15 | High aerial, ridge in silhouette | stars faint; first window lights | **ARDVALE** · "Four houses. One shoreline." |
| .15–.38 | Descend to water level, skim toward the villas | windows ignite left→right; reflections ripple | — |
| .38–.55 | **Hold** — symmetrical low shot, name behind & reflected | mist crawls on water; ember motes | "Arrive before you arrive." |
| .55–.72 | Slide to villa 02, close on stone + glass | warm interior bleeds through glazing | "Stone from the valley. Glass from Zurich." |
| .72–.86 | Threshold — camera passes the door light | exposure rises, grade warms | "Step inside." |
| .86–1 | Pull out to final exterior frame | all four villas lit | **Request the residences** |
## Implementation
Generated dusk plate + depth plane for the villas (`05-asset-pipeline.md`), procedural water (mirror floor + ripple normal), `createHaze`, instanced window quads whose emissive intensity = `seg(p, a_i, a_i+0.03)`. Park floor plans, specs and the map *below* the final frame.
## The lazy version
A drone video background and a grid of "Features". No reflection, no ignition, no arrival.
