# 14 · The $10,000 delivery standard

A client paying $10k is not buying a hero animation. They are buying **a finished, trustworthy, fast, findable, convertible website with a hero animation that ends careers of competitors.** Check every item before you say done.

## A · Scope of a complete deliverable
1. **The Film** — the scroll-driven 3D experience (the part everyone remembers).
2. **The Landing end-state** — after the final frame, the page continues as a normal, fast, well-designed site: proof, details, FAQ, footer (see below). Same type, same grade, same light — no style break.
3. **Secondary routes** — at minimum: `/contact` (or booking/reserve/checkout), one detail page template (project / product spec / unit), and `404`. Each is HTML-first, pretty, and shares the film's tokens.
4. **A fallback** — designed poster for no-WebGL, a calm reduced-motion variant, and a mobile shot list.
5. **Metadata** — title/description/OG image (render a frame of the film at p≈.9 as the OG image), favicon, theme-color, JSON-LD for the business/product.
6. **Performance report** — first-load KB, LCP, FPS on a throttled CPU, drawCalls. Put in the hand-off notes.
7. **Hand-off README** — how to edit copy, swap images, change colours, add a chapter; every knob lives in ONE `config.ts`.

## B · Loader = chapter zero
- The loader is **designed**: a 1.8–3 s sequence that uses the brand (wordmark drawing, counter 000→100, a light sweep) and ends by *becoming* the first frame (no white flash, no layout jump).
- Preload only what chapter 1–2 need; stream the rest while the user reads.
- Never show a blank page: SSR the title + poster behind the canvas.

## C · Micro-detail checklist (what makes it feel "AAA")
- [ ] Film grain ≥ 0.04 and a vignette ≥ 0.6 — they glue 3D to type.
- [ ] Depth-of-field *feel*: blurred foreground sprites, bokeh points on practicals.
- [ ] Lens: gentle breathing (±0.4° fov), tiny handheld drift (0.002 u) — not zero.
- [ ] Easing everywhere: no linear. Scroll damping 0.08–0.12 per frame at 60 fps.
- [ ] Hover states that cost light, not colour change.
- [ ] Focus rings that match the brand (a11y is part of luxury).
- [ ] Text never overlaps a bright specular highlight (add a 10 % scrim or move the beat).
- [ ] Number formatting, ligatures, tabular figures on readouts.
- [ ] A 404 that is on-brand and has a way home.
- [ ] Tab title changes per chapter ("— Chapter 3 · The ring").
- [ ] The URL hash updates per chapter (`#/chapter-3`) and deep-links seek the playhead.

## D · Audio (optional, off by default)
- 90–150 s ambient bed + 3 UI one-shots (hover tick, chapter swell, CTA hit), 128 kbps, preloaded after interaction.
- Toggle top-right, remembered in `localStorage`. **Never autoplay.** Crossfade the bed's low-pass with scroll velocity for free drama.

## E · Mobile is a different edit
- Re-cut the shot list: 60 % of the length, taller compositions, giant type stacked in 2–3 lines (`data-fit`).
- DPR cap 1.5, particles ÷ 3, no transmission materials, no mirror floor (fake with a gradient), bloom half-res.
- Touch: native scroll only; pointer parallax replaced by *gyroscope-free* idle drift.
- Test at 390×844 and 360×740. Nothing cropped, nothing colliding.

## F · SEO & accessibility without killing the film
- All story copy exists in the DOM as real headings/paragraphs (visually positioned, `aria-live` off) — crawlers and screen readers get the text.
- A visible "Skip the film" link jumping to the end-state.
- `prefers-reduced-motion`: render 5 still compositions as a vertical story with simple fades.
- Meaningful `alt` on any plate. Contrast ≥ 4.5:1 on all copy against its *actual* backdrop at that scroll position (audit at 3 positions).

## G · Conversion
- ONE primary action; it appears in the last frame AND as a quiet persistent pill after chapter 3.
- The end-state includes social proof placed *after* desire is built: 1 testimonial, 3 numbers, 4 logos.
- Forms: 3 fields max; success state is part of the world (a light pulse), not an alert().
- Add tracking hooks as `data-evt` attributes (`chapter_enter`, `cta_click`, `scroll_depth`) — leave analytics wiring documented.

## H · The review you give yourself (be brutal)
1. Poster test: pause on any frame — is it Instagram-worthy?
2. Squint test: is there a clear value hierarchy (subject ≫ type ≫ rest)?
3. Silence test: mute your brain — does the *motion alone* tell the story?
4. Competitor test: would this look weird on a competitor's domain? (It should.)
5. Grandma test: can someone scroll it with a trackpad and never feel lost?
6. Price test: if this were an invoice for $10,000, would you feel guilty? If yes → another pass.
