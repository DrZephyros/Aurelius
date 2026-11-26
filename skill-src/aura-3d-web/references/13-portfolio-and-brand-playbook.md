# 13 · Portfolio, studio & brand playbook

People hire a designer/studio for **taste and range**. The site is the audition. These rules are what separate "cool Three.js demo" from "I'd pay $10k for this."

## The structure of a portfolio film (7–9 min of scroll at normal pace → 700–1000 vh)
| Range | Beat | Camera |
| --- | --- | --- |
| 0–.10 | **Name** — fitted giant type, one line of positioning, cursor light | slow push, pointer parallax |
| .10–.22 | **Door** — the world opens (a slit of light, a lid lifts, the room assembles) | pull-through |
| .22–.74 | **Project rooms ×4–6** — each with a different shot size & angle, a HOLD, a title, role, year, one-line result | rail through the space |
| .74–.84 | **Craft** — 3 skills as *objects of light*, not progress bars | orbit |
| .84–.92 | **About** — face or silhouette, 2 sentences, a human detail | close |
| .92–1 | **Contact** — email as giant type + "Available from March" + one button | static, composed |

## Project rooms (the core pattern)
- A project is a **plane or object with its own pool of light**. Entering: world dims 20 %, practical light rises, HUD swaps (title, index 03/07, arrows).
- Use the **real project imagery** (ask for it; if none, generate polished placeholder plates and label them clearly as placeholders in the hand-off notes).
- Each room differs in **three of**: distance, angle, light colour, plate aspect ratio, camera speed.
- Hover (desktop) tilts the plane toward the cursor ≤ 6°, the light follows; click opens a full-screen case-study overlay (HTML) with the camera continuing to drift behind it.

## Cursor & pointer
- A custom cursor is *light*, not an arrow: an 80 px soft glow that blends `screen`, scales on interactive targets, and carries one-word labels ("View", "Play", "Drag").
- Pointer parallax on the camera ≤ 0.6° and on near-plane objects ≤ 12 px. It's what makes it feel *alive* when the user isn't scrolling.

## Studio / agency / brand variant
- **Manifesto in motion:** 6–8 lines of ≤ 6 words each, set in giant type, each line *entering the world differently* (rising from floor, passing as slab, assembling from points, mirrored in water).
- **Case studies** drift past as framed planes on a loop ribbon; the hovered one comes to the front and plays 3 s of muted video.
- **Clients** are not a logo bar. A *wall of light* where logos are engraved/emissive on a surface the camera passes once.
- **Team** is one beat: a row of silhouettes; hover reveals names. Never a 12-photo grid.

## Navigation that doesn't break the illusion
- Persistent 3-item pill nav: Work · About · Contact (mono, 11 px caps) — clicking *scrolls the playhead* to that chapter with an eased `scrollTo` that takes 1.6–2.4 s (the camera flies there).
- A **chapter index** on the left or bottom (01 — 07) with the active one lit; hover shows the chapter name.
- A sound toggle only if you actually ship audio (§ audio in 10-frontier).

## Copy
- Verbs & specifics. "Rebranded a 40-year-old Swiss watchmaker for TikTok" > "Brand identity & strategy".
- One number per project. Years in mono.
- The contact line is a *human sentence*: "Tell me what you're making." not "Get in touch".

## Variants of the world (pick one, own it)
- **Observatory** (instrument-lit, brass + indigo) · **Atelier** (paper, wood, a sunlit table, objects on it) · **Gallery of light** (white cube, glass, soft caustics) · **Server cathedral** (dark nave of racks, cool LEDs) · **Greenhouse** (botanical, humid air, god-rays) · **Dune studio** (warm minimal, long shadows). Each defines palette + materials + atmosphere for free.
