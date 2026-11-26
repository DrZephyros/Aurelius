# 01 · The Aura Doctrine — what separates "AAA" from "3D website"

Study the sites that make people stop mid-scroll and screen-record them: a luxury estate whose name is a 300px wordmark reflected in a lake while lit windows glow behind it; a shrine-district night walk where the title letters sit *between* the temple and the foreground grass; a pair of earbuds floating in a cratered void, lit like a Kubrick still; a holographic card dissolving into particles. They share the same DNA. This file is that DNA, decoded.

## The six invisible systems

### 1 · A single continuous camera
The visitor never sees a "section". The camera flies; the world changes around it. Transitions are *spatial* (fly through a door, ascend through cloud, pass behind a pillar, dive under the water line, whip-pan past a foreground object), never a cut or a fade-to-white.

**Transition toolbox** (pick one per chapter boundary):
- **Occluder wipe** — a foreground object (pillar, branch, wall, hand) passes across the lens and hides the swap.
- **Fog/cloud pass** — fog density spikes to 1 for 200ms of scroll while the set swaps.
- **Dive/ascend** — the camera crosses a water surface / ceiling / membrane; grade and fog flip.
- **Scale jump** — camera dollies into a small detail that *becomes* the next world (macro → vista).
- **Light flash** — practical light blooms to white then settles on the new scene.
- **Whip** — fast yaw (FOV kick + aberration) between two vistas.

### 2 · Light as a character
- **Dark-field lighting:** exposure low, bloom threshold high, one saturated rim light that traces the subject's silhouette, one warm practical. This alone makes a mediocre model look cinematic.
- **Colour contrast, not brightness contrast:** warm vs cool (amber window vs teal dusk; magenta rim vs cyan fill). Pick a split from the brief and stay on it.
- **Light moves:** practicals flicker slightly, rim lights sweep with scroll, a god-ray angle changes between shots. A static rig reads as a render; a moving rig reads as a *place*.
- **Time of day is a story tool:** dusk → night across the scroll gives a free emotional arc and a free colour grade.

### 3 · Depth you can feel
The brain reads depth from: **parallax, occlusion, atmospheric perspective, scale cues, depth-of-field, motion.** Use all six deliberately:
- **Parallax:** 5+ layers at distinct z. Far layers move < 20% of near layers. Pointer parallax on top.
- **Occlusion:** the subject passes *behind* something. Type passes behind the subject.
- **Atmospheric perspective:** far = lower contrast, bluer/hazier, lighter; near = saturated, sharp. Exponential fog does this for free; also tint far layers.
- **Scale cues:** tiny humans, lanterns, birds, windows lit in the distance. A hero with no scale cue looks like a toy.
- **DOF:** fake it (blur DOM foreground, soft particles, bokeh sprites) or use `BokehPass`. Even a *hint* of foreground blur is huge.
- **Motion:** drifting dust, steam, birds, floating shards. The air should never be still.

### 4 · Type that belongs to the world
- **Scale:** the hero word is 18–30vw. It's cropped by the viewport on purpose.
- **Interaction:** occluded by the subject (text sandwich), reflected on the floor, masked by clouds, lit by a sweeping specular, split by scroll, tracking changes from tight to wide as you push in.
- **Quiet supporting type:** tiny mono labels (coordinates, chapter numbers, specs, timestamps) in the corners. The extreme scale contrast is what looks "designed".
- **Copy discipline:** headline ≤ 6 words, support ≤ 14 words, one CTA. Verbs and nouns. No adjectives like "innovative".

### 5 · Rhythm
Think in **beats** of ~100vh of scroll:
`ESTABLISH (wide, quiet) → PUSH (move + reveal) → DETAIL (close, hold) → TWIST (scale/colour/space change) → CRESCENDO (fast, wide lens, particles surge) → RESOLVE (slow, final image + CTA)`.
Never make every beat the same speed. The hold after a fast move is where awe lives.

### 6 · Finish
The last 10% separates budgets: film grain, vignette, subtle chromatic aberration at the edges, ACES tone-mapping, split-toned grade, bloom restraint, aliasing-free edges (post FXAA/SMAA if MSAA is off), motion-blur-feel via FOV kick, consistent colour across DOM and canvas (the page background is *exactly* the fog colour).

---

## The Aura Test (apply at every phase)

| Question | Fail looks like |
| --- | --- |
| Can I describe the world in one sentence a stranger would repeat? | "It's a dark site with 3D stuff." |
| If I pause on a random scroll position, is the frame a poster? | Mid-transition mush, flat lighting, centered clutter. |
| Is there something in the foreground *and* something in the far distance? | Subject floating in empty void with no scale or atmosphere. |
| Where is the light coming from, and is it coloured? | White light from nowhere. |
| Does the type touch the world? | Text sits on top like a PowerPoint. |
| Is there a hold? | Constant-speed conveyor belt. |
| Would this look wrong on a competitor's brand? | Generic. |
| What would I delete? | Anything you can't justify. Delete it. |

## Where the "price" lives (rough weights of perceived value)
Light & grade 25% · Camera choreography 20% · Typography & art direction 20% · Atmosphere/depth 15% · Material/model quality 10% · Interaction polish 5% · Performance feel 5%.
**Notice modelling is only 10%.** A procedural scene with perfect lighting, a great shot list and giant type beats a photoscanned model in a flat setup. Spend your effort in the right places.

## Common "feels cheap" diagnoses → fixes
| Symptom | Cause | Fix |
| --- | --- | --- |
| "Looks like a tech demo" | Default lights, no env, uniform roughness | Rig + env + roughness map; coloured rim; lower exposure |
| "Flat" | One depth plane in focus | Add fg occluder, fog, mid-ground silhouettes, particles in 3 bands |
| "Boring" | Constant camera speed, centered subject | Add holds, off-center framing (rule of thirds), Dutch roll ±2°, lens change |
| "Messy" | Too many effects | Delete until each chapter has exactly one hero effect |
| "Template-y" | Fade-ups, cards, gradients | Replace with spatial transitions + giant type interaction |
| "Laggy" | DPR 2–3, huge textures, transmission everywhere | Cap DPR, compress, gate on quality governor |
| "Washed out" | Tone-mapping off, bloom threshold low, lifted blacks | ACES, threshold ≥ 0.8, crush blacks via grade |
