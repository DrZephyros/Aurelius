# 06 · Typography & UI — the layer people actually read

In an immersive site the DOM is a thin, precise, *expensive-looking* skin over the 3D. Its job: orient, tease, convert — then get out of the way.

## 1 · Type system (two fonts, six roles)
| Role | Spec | Example |
| --- | --- | --- |
| **GIANT** (hero word) | 18–30vw, weight 600–800, line-height .8, tracking −.03 → +.02em (scrubbed) | `ARDMERE`, `KAGE`, `OBSIDIAN` |
| **Headline** | clamp(2rem, 5vw, 4.4rem), 600, tracking −.045em, lh .96 | chapter titles (≤ 6 words) |
| **Body** | 14–17px, lh 1.6, 55–60% opacity | ≤ 14 words |
| **Label (mono)** | 10–11px, tracking .22–.3em, uppercase | `CHAPTER 03 · DETAIL`, coordinates, specs |
| **Numerals** | tabular, mono or display | counters, prices, dates |
| **CTA** | 13–14px, 600, pill or underline | one per screen at most |

Pairings that work: *Space Grotesk + JetBrains Mono* (tech/product), *Instrument Serif (italic accents) + Geist Mono* (luxury/architecture), *Anton or Bebas + Inter* (sport, games, speed), *Fraunces + IBM Plex Mono* (craft, hospitality), *Unbounded + DM Mono* (web3, futuristic), *Syne + Space Mono* (art/portfolio).
**Scale contrast is the secret**: a 300px word beside a 10px label. Never use mid-sized (24–48px) type as your hero.

## 2 · Giant type behaviours
- **Tracking scrub:** `letter-spacing: calc(.02em - var(--local) * .06em)` as you push in.
- **Scale scrub:** `scale: calc(1 + var(--local) * .18)`.
- **Masked reveal:** `clip-path: inset(0 0 calc((1 - var(--in)) * 100%) 0)` (text rises from a baseline).
- **Per-letter stagger:** span per char with `--i`; `opacity: clamp(0, calc(var(--in) * 8 - var(--i)), 1); translate: 0 calc((1 - clamp(0, calc(var(--in)*8 - var(--i)), 1)) * 40%)`.
- **Behind-subject sandwich** (see choreography §5), **reflection** (`.aura-reflect`), **outline→fill** on scroll (`-webkit-text-stroke` to `color`), **lit by sweep** (a moving `linear-gradient` background-clip text driven by `--local`).
- **Crop on purpose:** hero word wider than the viewport, letters entering from the sides as you scroll.
- **Never** drop-shadow giant type; use blend modes / lighting from the scene instead.

## 3 · Layout rules
- Safe margins `--aura-pad` (clamp 20→64px). Align everything to a 12-col invisible grid; put copy on thirds, not centre — except the final CTA & statements.
- **One block of copy on screen at a time**, max. Copy never covers the hero; leave negative space on the *opposite* side from the subject.
- **Contrast over imagery:** add a soft radial or linear dark scrim behind copy (`radial-gradient(60% 50% at 20% 80%, rgb(0 0 0 / .55), transparent)`), never a box.
- Corners are real estate: top-left logo, top-right nav, bottom-left chapter label, bottom-right scroll/sound, bottom-centre progress.

## 4 · Navigation
- A **minimal glass pill** (4–5 items max) or just logo + "Menu" + one CTA. Items jump the playhead to a chapter: `window.scrollTo({ top: trackTop + chapterP * (trackHeight - innerHeight), behavior: "smooth" })` — the engine then dollies there like a drone (and the velocity FOV-kick makes it look incredible).
- A **chapter index** (`01 02 03 04`) on the side, current one lit; clicking jumps.
- Always keep a real `<nav>` + `<a>` semantics. Provide a **skip-intro** link.
- Hide nav on scroll-down fast, show on scroll-up if you must, but don't thrash.

## 5 · Cursor & micro-interactions
- Custom cursor: 8px dot + 40px ring with `lerp` follow, ring grows on `[data-cursor]` (view / drag / play). Disable on touch and for reduced motion.
- **Magnetic CTA:** translate toward the pointer within 80px radius (strength .25), spring back with `cubic-bezier(.16,1,.3,1)`.
- Hover sound-less feedback: underline wipe, letter shuffle (scramble) — use sparingly, only on nav/CTA.
- Scroll cue: a 1px line with a travelling dot, vanishes after first movement.

## 6 · Preloader (chapter 0)
It's the first frame people see; make it deliberate: giant counter `000→100` tied to real asset progress (`THREE.DefaultLoadingManager`), project name in mono, then a **wipe up** (the starter does this). Min display 900ms. Never a spinner. If assets are heavy, show a subtle poster behind.

## 7 · Final frame & conversion
- The last 10% of scroll is a poster with **one** CTA (large, pill or underlined giant text link) + a tiny secondary row (email, socials, legal).
- Provide the "real site" *below the experience*: after the track ends, a normal footer / contact / pricing area styled in the same world (same bg colour, same type), reachable by continuing to scroll. Search engines & users who want facts get them there.
- Secondary pages (pricing, work, contact, login) reuse the world: a **frozen**, lower-cost version of the scene as the background (static camera, slow drift) — don't use a different visual language.

## 8 · Copywriting for cinematic sites
- Voice: confident, sensory, specific. Present tense. Fragments are fine.
- Formula for a chapter: **[eyebrow label] + [3–6 word statement] + [≤14 word proof]**.
- Replace adjectives with nouns: not "stunning luxury residences" → "Four homes. One lake. No neighbours but the mountain."
- Numbers are poetry: "2,740 m", "−18 dB", "1 of 12", "43 minutes from Zürich".
- Never: "Welcome to", "Innovative solutions", "Seamless experience", "Cutting-edge", "Unlock".
- One CTA verb that matches the emotion: *Enter, Reserve, Begin, Descend, Claim, Step inside.*

## 9 · Colour system
- 1 dominant hue (60–70% of pixels, usually the dark), 1 accent (≤ 5%), warm/cool contrast pair for light, neutrals for type.
- DOM backgrounds = fog colour exactly. Text `#eef3f7` (not pure white) + `rgb(…/.58)` for secondary.
- Accent appears in: labels, HUD fill, CTA, emissive things in the world — repeating it ties DOM and 3D together.
- Keep a `:root` variable set that the scene can *animate* (set `document.documentElement.style.setProperty("--aura-accent", …)` from `update`) so the UI follows the time-of-day arc.

## 10 · Accessibility without killing the vibe
- Real headings in DOM order (the overlay's DOM order = reading order). One `<h1>`.
- Overlay chapters hidden by `visibility:hidden` are out of the a11y tree unless active — also provide an `sr-only` full text transcript of all chapters.
- Contrast ≥ 4.5:1 for body text on scrims. Focus rings visible on CTAs (`outline: 1px solid var(--aura-accent); outline-offset: 6px`).
- Respect `prefers-reduced-motion`: no velocity effects, no parallax, instant playhead (engine does), no blur transitions (CSS does).
- All interactive elements keyboard reachable. Scroll must work with keyboard (Space/PgDn/arrows — native scroll gives this for free; another reason not to hijack).
