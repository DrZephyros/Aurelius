# 03 · BEARING — a navigation instrument (The Instrument)

## The prompt
> "Landing page for BEARING, an offline navigation compass for sailors and hikers. Precise. Trustworthy. Make people want to hold it."

## Direction lock
```
DIRECTION: 04 The Instrument
WORLD: a ship's chart table at night; one lamp; the compass in focus, a blurred bridge window behind.
HERO: a machined dial: knurled bezel, engraved ticks, glass dome, amber needle.
SIGNATURE MOVE: Calibration — scroll rotates the dial 0→360°; ticks light progressively; detents at 90° boundaries swap the headline.
PALETTE: #06141b (teal-black) · #ffb45a (needle, ticks) · #e8eef2 (type) · #2a4350 (steel)
FORBIDDEN: flat 2D dial · more than 6 HUD items on screen · glassmorphism cards.
```
## Storyboard (scrollVh 800)
| p | Shot | Change | Copy / readout |
| --- | --- | --- | --- |
| 0–.15 | Front-on hero, HUD furniture appears | needle swings 0→67° (spring) | "Find your HEADING." · `067° NE` |
| .15–.38 | Oblique macro on knurl & engraving | highlight rakes the bezel | "Cut from one block of titanium." |
| .38–.60 | Dial rotates, ticks ignite; detent at 180° | readout counts; headline swaps | "No signal. No problem." · `180° S` |
| .60–.80 | Pull back — dial inside the chart table scene | lamp warms | "Battery: 400 days." |
| .80–1 | Frontal hold, needle locks N | all ticks lit | **Pre-order BEARING** |
## Implementation
`objects.ts → dial()` (lathe + instanced ticks + dome), HUD readouts as DOM bound to `data-heading`, detent via `snap()`/spring ease, bokeh sprites for the blurred bridge. Keep the HUD tiny and mono.
## The lazy version
An SVG dial that rotates. Nobody wants to touch it.
