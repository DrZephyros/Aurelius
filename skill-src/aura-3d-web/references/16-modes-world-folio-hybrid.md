# 16 · Modes — World, Folio, Hybrid (and which to pick)

AURA builds two fundamentally different kinds of site. Choosing the wrong one is the most common reason a result feels generic.

| | **WORLD** (environment) | **FOLIO** (editorial gallery in depth) |
| --- | --- | --- |
| The subject is… | a place, an object, an event, a feeling | a body of work, a roster, a sequence of proofs |
| Camera | one continuous journey *through* a place | a climb / orbit / dolly *between* plates |
| Hero | the environment + one hero object | the work itself (screens, photos, cases) |
| Light | designed sky, key/rim, practicals | the plates are the light; one travelling accent |
| Type | giant world-occluded title | giant name + one-line chapter per project |
| Starter reference | `?world=halo` · `umbra` · default (Obsidian Gate) | `?world=folio` (Mira) |
| Best for | products, estates, events, games, brands | portfolios, studios, agencies, case-study sites, menus, lookbooks |
| Failure mode | pretty void with nothing to read | a carousel with no depth or rhythm |

**Rule:** if the visitor's job is to *judge the work*, use FOLIO. If it is to *feel a place or want an object*, use WORLD. A product with a feature tour is WORLD. A studio with six case studies is FOLIO. **HYBRID** = a WORLD for the first 60 % (the promise) that resolves into a FOLIO helix for the proof (the last 40 %) — e.g. a hotel: arrive through the estate, then six rooms as plates.

## The FOLIO recipe (see `starter/src/aura/scene.folio.ts`, ~150 lines, no assets)

1. **N plates on a helix** around a spine of light. `plateAt(i)`, `ang(i)`, `RISE` define the spiral; `folioAt(i)` is the playhead position where plate *i* is centred. Six is the sweet spot (four to eight).
2. **Two shots per plate: arrive + HOLD.** The hold is a second shot with the *same look-at and a ~2 % position drift* — the camera all but stops while the work is read. Hold duration ≈ 0.07 of the playhead. This is what makes it feel authored, not scrolled.
3. **Distance by frame height, not by feel.** At vertical FOV 30° a plate of height *h* fills ≈ 70 % of the frame at distance ≈ 3 *h*. (A first draft at distance 1.8 *h* cropped every plate — the audit contact sheet caught it.)
4. **Only the active plate is lit.** `focus = 1 − |p − folioAt(i)| / 0.11` drives plate brightness, edge opacity, ring opacity and scale. A single point light travels to the active plate and takes its hue. Sleeping plates stay at ~28 % so the spiral is still legible.
5. **Chapters = the holds.** The DOM chapter for project *i* is `data-a = folioAt(i) − 0.045`, `data-b = folioAt(i) + 0.045`, alternating left/right. Never let two chapters overlap (the audit's collision check will fail).
6. **Finish with a pull-back and a held final frame**: the whole spiral in one image, CTA live on top. Never end on a plate.
7. **Real work replaces `plateTexture()`** with `loadTexture("/work/x.jpg")` (or a looping `<video>` texture). The fake UI is a stand-in — shipping it is a failure.
8. Depth planes: foreground dust that lags the lens, far motes, tethers + rings (mid), the mirror-ish floor (back), fog (atmosphere). Five planes, as ever.

## Tooling notes (learned by running the starter headlessly)

- `node scripts/audit.mjs <url>` now lives in `starter/scripts/` (it used to sit outside the starter, so `npm run audit` could not find it).
- Software GL is slow: use `--scale 0.5 --stops 8 --only desktop` for a fast first pass, `--timeout 180000` on slow boxes, and run the full three-viewport pass last.
- No root / missing system libs? Point `AURA_CHROME=/path/to/chromium` at any Chromium build (e.g. `@sparticuz/chromium`, with its bundled libs on `LD_LIBRARY_PATH`).
- Small viewports (`--scale 0.5`) over-report text collisions. Re-check any BLOCKER at full size before restructuring a chapter.
- The audit only measures; it cannot see that a plate is cropped or that a frame is empty-but-bright. **Always open `contact-desktop.png`.**
