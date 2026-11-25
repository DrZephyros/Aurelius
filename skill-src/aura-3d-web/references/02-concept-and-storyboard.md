# 02 · Concept & Storyboard — authoring the film before touching code

Most agents jump straight to `npm create vite`. That is why most AI websites look the same. **The concept is 50% of the result.** Spend real effort here, and write it down.

## Step 1 — Find the world

### The World Metaphor method
Ask: *"If this brand/person/product were a PLACE you could fly through, what is it?"* Generate **five** candidates, then choose the one that is (a) specific, (b) physically filmable, (c) emotionally consistent with the goal.

| Subject | Weak (generic) | Strong (authored) |
| --- | --- | --- |
| Wireless earbuds | Floating earbuds on gradient | Earbuds resting on a cratered asteroid in cold starlight, sound visualised as ripples in dust — *silence made physical* |
| Mountain real-estate | Hero photo + gallery | Dusk arrival: the estate's name as giant letters reflected in an alpine lake, windows igniting one by one as you scroll |
| Japanese craft studio | Minimal beige site | Night walk through a torii path to a temple under a red moon; each craft is a lantern you pass |
| Dev portfolio | Grid of projects | An observatory: each project is a constellation you rotate the telescope toward |
| Coffee roaster | Product cards | A descent into a roasting drum: beans, heat shimmer, steam, a slow-motion pour |
| Fintech app | Dashboard screenshot | A vault door of light opening onto a city of flowing data |
| Law firm / bank | Stock handshake | An impossibly quiet marble hall at dawn, one beam of light crossing the floor — *weight and permanence* |
| Fitness brand | Athletes in grid | A single athlete silhouette in particle form, assembling mid-motion on a dark track |

### The "one emotion" rule
Choose ONE: *awe · reverence · menace · serenity · speed · wonder · intimacy · power · nostalgia · desire.* It controls palette, lens, tempo and sound:

| Emotion | Palette | Lens | Tempo | Light |
| --- | --- | --- | --- | --- |
| Awe | deep blue/black + gold | wide→tele, big scale jumps | slow, long holds | god-rays, rim |
| Reverence | warm stone, candle amber | symmetrical, slow dolly | very slow | single beam |
| Menace | desaturated + blood red | low angle, Dutch roll | creeping, sudden whip | hard backlight, fog |
| Serenity | teal/pearl/sand | long lens, drifting | slow, floating | soft haze, golden hour |
| Speed | black + neon accent | wide 60–75°, high FOV kick | fast, hold only at end | streaks, rim |
| Wonder | indigo + aurora mint | wide, upward tilts | medium, surprising | bioluminescent |
| Desire | black + one rich hue | macro, shallow DOF | slow, sensual | specular sweeps |

### Authorship test
Paste your concept sentence onto three competitors. If it still works, rewrite it with a specific noun, place, time-of-day and material.

## Step 2 — Write `AURA_BRIEF.md`

Use this template exactly:

```md
# AURA BRIEF — [Project]
**One sentence:** A scroll-driven film that takes [audience] through [world] so they feel [emotion], then [conversion action].
**World:** [place, time of day, weather, material palette]
**Hero:** [the one object / image / building / word that owns the poster frame]
**Emotional arc:** Act I [quiet curiosity] → Act II [mounting wonder/tension] → Act III [release + invitation]
**Palette:** bg #______ · fog #______ (== bg) · key #______ · rim #______ · accent #______ · text #______
**Type:** Display [font] (usage: giant) · Mono/Text [font] (usage: HUD/labels)
**Lens language:** [e.g. tele 24° on details, 60° on speed, one Dutch roll at the twist]
**Light:** key [dir/colour] · rim [colour] · practical [what/where] · time-of-day arc [dusk→night]
**Atmosphere:** [fog density, particle bands, floor, sky]
**Sound (optional, opt-in):** [mood, 3 stems]
**Never:** [3–5 things this world must not contain]
**Conversion:** [single CTA, where it lives, what it does]
```

## Step 3 — Storyboard

Write `STORYBOARD.md` as a table. **Every row is one chapter.** Keep the whole experience to **5–9 chapters**; fewer, better.

```md
| # | Scroll | Shot (move + lens) | World change | Copy (≤12 words) | Type treatment | Transition out |
|---|--------|--------------------|--------------|------------------|----------------|----------------|
| 0 | loader | — | black → title wipe | project name | counter 000→100 | wipe up |
| 1 | 0–.12  | Establish, wide 38°, slow drift | dusk lake, lights off | "Some places you fall into." | GIANT wordmark, reflected | dolly forward |
| 2 | .12–.30| Push-in, 34°, +parallax | windows ignite sequentially | — | wordmark slides behind house | pass behind pine foreground |
| … |
| N | .90–1  | Hold, locked-off, 45° | final tableau, practical glow | "Reserve a residence." | CTA, magnetic | — |
```

### Sizing rules for scroll length
- Count your **beats** (1 beat ≈ 100vh at an engaging pace; a *hold* is 30–60vh extra).
- `scrollVh = 100 × beats + holds`. A 6-beat story with 2 holds ≈ **700vh**. Hero-grade experiences run **800–1200vh**.
- On mobile multiply by ~0.8 (thumb scroll is faster) or keep the same; test.
- Never go under 400vh — it will feel like a normal page with extra steps.

### Chapter design checklist
- [ ] Each chapter has **one** verb (arrive, ignite, descend, reveal, assemble, ascend…).
- [ ] The shot types alternate: WIDE / CLOSE / WIDE / MACRO / VISTA.
- [ ] There is one chapter whose job is *silence* (no copy, only world).
- [ ] The final frame is a **poster**: composed, lit, CTA placed on a rule-of-thirds line.
- [ ] A visitor who scrolls *backwards* sees a coherent film too.

## Archetype playbooks (each includes a battle-tested chapter skeleton)

### Product launch (hardware, beauty, drinks, cars, fashion)
`0 Loader (logo + counter) → 1 Silhouette in darkness, rim-lit → 2 Material macro (surface, texture) → 3 Exploded/anatomy (parts float apart, labelled in mono type) → 4 In-world use (the environment that proves the benefit) → 5 Spec montage (big numbers, scrubbed counters) → 6 Hero orbit + CTA.`
Money shot: the slow 90° orbit with a specular sweep. Hold it.

### Portfolio / personal brand
`0 Loader → 1 Name as giant type, world establishing → 2 "About" as a place you enter (door, window, hatch) → 3–N One project per "room/stop" (camera pauses, project plate floats in depth, hover = tilt) → N+1 Skills as light/particles → Final: contact as the exit of the world.`
Tip: projects are images → map to depth planes (`createDepthPlane`) so each is a diorama.

### Real estate / hospitality / architecture
`0 Loader (coordinates) → 1 Aerial establishing at dusk → 2 Descend to the water/garden → 3 Approach with giant name behind/reflecting → 4 Threshold (door/lantern) → 5 Interior glide, warm practicals → 6 View from the terrace → 7 Floorplan as light lines → 8 Reserve CTA.`
Look: golden hour, still water reflection, warm windows vs cool sky (the Ardmere formula).

### Brand / agency / studio
`Manifesto beats (one sentence each, giant) as the camera tunnels through abstract material space; recurring motif; case studies as cards drifting past; end with a bold contact line.`

### Game / film / entertainment
`Cold open (black, sound) → Title slam-in with light → World vista → Character/faction beats (each a distinct colour world) → Rapid montage (FOV kick, whip) → Final shot + release date.`

### SaaS / AI product
`UI planes (real product screenshots) arranged in depth → data as light-trails/particles → each feature = camera moves to a plane that "activates" → zoom through the final plane into the CTA.`
Never fake data walls; use few, big, legible panels.

### Restaurant / food
`Steam in darkness → macro on ingredient → heat/shimmer → pour/slice slow-motion (scrubbed frame sequence) → the table scene → reserve.`
Use video-frame sequences (see asset pipeline) for liquid/food — real footage scrubbed beats CG.

### Event / campaign / non-profit
`Countdown/date as giant type → journey (map or path as a glowing line the camera follows) → human moment (a single image in depth) → impact numbers → RSVP/donate.`

## Anti-patterns in concepting
- "Futuristic" as a concept. (That's a genre, not a world.)
- Designing 12 chapters because the client has 12 features. Group them into 5–6 *moments*.
- Using the camera path only to display content. The path is an **emotion curve**.
- Planning copy first. Plan *images and moves* first; copy fills the silence.
