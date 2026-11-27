# AURA · aura-3d-web — the immersive 3D website skill

A skill for AI coding agents (Claude Code, Claude.ai Skills, Cursor, Codex, Windsurf, Gemini CLI, Copilot agent, Aider…) that turns "build me a 3D website" into **a scroll-driven cinematic experience**: one continuous camera through one authored world, designed light, depth you can feel, giant interactive type — at 60fps.

It is not a template. It is a **creative director + a camera engine** you hand to the agent.

## What's inside
```
aura-3d-web/
├─ SKILL.md                         ← the operating system (10 laws, 8-phase pipeline, ban list, scoring)
├─ references/
│  ├─ 01-aura-doctrine.md           ← what separates AAA from "3D website"
│  ├─ 02-concept-and-storyboard.md  ← world metaphors, brief + storyboard templates, 8 archetype playbooks
│  ├─ 03-choreography.md            ← playhead, shot lists, camera vocabulary, DOM windows, text sandwich
│  ├─ 04-visual-engine.md           ← lighting rigs, materials, atmosphere, post-FX, shader cookbook
│  ├─ 05-asset-pipeline.md          ← procedural / generated-image 2.5D / GLB / video / AI-3D, with prompts
│  ├─ 06-typography-and-ui.md       ← type system, nav, cursor, loader, copywriting, a11y
│  ├─ 07-performance-and-resilience.md ← budgets, governor, mobile, fallbacks, SEO
│  ├─ 08-qa-and-polish.md           ← Playwright screenshot loop, the 100-pt Aura Score, polish passes
│  ├─ 09-prompt-pack.md             ← master prompt + archetype kickoffs + refinement prompts
│  └─ 10-frontier-techniques.md     ← raymarched heroes, GPU particles, 2.5D plates, cinematic type, WebGPU, splats, audio…
├─ starter/scripts/audit.mjs        ← the QA gate: deterministic seek, per-frame metrics, chapter/shot lint, fallback tests
└─ starter/                         ← the working engine (Vite + React + three), type-checked
   └─ src/aura/ engine · choreo · materials · particles · layers · floor · atmosphere · terrain · assets · AuraExperience · aura.css · scene.example (Obsidian) · scene.umbra (Umbra)
```

## Install
**Claude Code** — copy this folder to `~/.claude/skills/aura-3d-web/` (all projects) or `<project>/.claude/skills/aura-3d-web/`.
**Claude.ai** — zip the folder (so `SKILL.md` is inside `aura-3d-web/`) → Settings → Capabilities → Skills → Upload.
**Cursor** — copy to `.cursor/rules/aura-3d-web/` and add a rule file: `Use aura-3d-web/SKILL.md whenever the user asks for a 3D/immersive/cinematic website.`
**Codex / Gemini CLI / Copilot / Windsurf / Aider** — copy the folder into the repo and add to `AGENTS.md` (or the tool's instructions file): *"For any 3D / immersive / cinematic / scroll-driven website, read `aura-3d-web/SKILL.md` first and follow it."*
**No skills support?** Use the single-file *Master prompt* from `references/09-prompt-pack.md` (or the one-file export from the Aurelius site).

## Use
```
Use the aura-3d-web skill. Build a scroll-driven immersive 3D website for [SUBJECT].
Audience: [WHO]. They should feel [EMOTION]. Final action: [CTA].
```
Then let it work: brief → storyboard → assets → build → screenshots → score → polish.

## Run the starter
```bash
cd starter && npm ci && npm run setup && npm run dev    # lockfile committed — builds are pinned; `setup` proves Chromium + WebGL for the audit
```
You'll see **Obsidian Gate** (a product world); open `/?world=umbra` for **Umbra** (an event world: dunes, eclipse sky, light shafts). Both are zero-asset. Read them as patterns, then replace the scene.

## Verify
```bash
npm i -D playwright pngjs && npx playwright install chromium
(cd starter && node scripts/audit.mjs http://localhost:5173)      # deterministic frames + metrics + contact sheets
```


---

## v2 — mobile contract & honest audit

- **Portrait is a first-class edit.** `scene.shotsMobile`, live rail swap, tan-based lens fit, view-offset lift, tiered budgets (`ctx.tier`), MSAA by tier, touch-safe parallax, svh-stable scroll range, context-loss recovery, static edition (no WebGL / Data Saver). See `references/17-mobile-contract.md`.
- **A better hero with zero assets.** `scene.example.ts` now builds a smooth iridescent obsidian pebble in a designed softbox environment, lit by an orbiting spark — the flat low-poly gem is gone.
- **An audit that can see.** Five viewports (390×844 and 360×640 / 844×390 with real touch emulation), min font size, WCAG contrast measured against the copy-free frame, 44 px targets, CTA wrap, horizontal overflow, phone budgets, portrait-rail check, real scroll test. Automated score is now atmosphere 20 · unbroken 15 · rhythm 15 · craft 15 · mobile & legibility 15 = 80, plus 20 human-judged Authorship.


## v18 — frontier edition
- New: `references/18-frontier-modules-and-portability.md`; `starter/src/aura/{contract,device,post,looks,portable,scene.meridian}.ts`, `frontier/{sdf,gpgpu,splat,probe,audio,webgpu}.ts`, `?world=meridian`.
- Engine: measured device budget + bidirectional governor, real reduced-motion (frozen ambient time, on-demand render), AO + bokeh DOF from a depth pre-pass, `__aura.perf()`, `?aura-debug=1`, `?tier=`.
- Audit v3: class-agnostic, glyph-pixel contrast that sees the scrim, mode-aware, verified fallbacks, asset-404 / SPA-fallback detection, `--tsc`, `--compare`, look fingerprint, `TASTE.md`.
- Hygiene: `three` pinned (0.187.0), strict `tsconfig`, `VERSION` + `skill.json`.
- Honest limits: WebGPU track not executed in CI (no adapter); real-device FPS is yours to measure (`?aura-debug=1`); SSR is intentionally not faked.

---

## v19 — measured fixes, a designed fallback, a better reference
- **Audit v4 says what to DO**: stated `--aura-plate-a` values, measured left↔right swaps, "move the subject" with the band in %. No more impossible percentages. `REPORT.md` opens with *Fix these first*; `fixes.json` for loops.
- **Local scrim ("plate")** under every copy block + faint plate under giant words; the global bottom scrim is no longer the only protection.
- **The no-WebGL edition has an action** (`.aura-static-head`: title · lede · first CTA, above the fold) and a font stack that ends in a generic family. Both are audited.
- **Landscape collision fixed** (title top band / copy bottom band), phone type enlarged, ghosted CTA fixed (chapters stay hidden until the first frame binds).
- **`mood.ts`**: per-chapter palette keyed to the playhead; the engine re-reads `scene.grade` every frame. **Obsidian Gate** was rebuilt around it: creased hero, a gate of slabs, chips that dissolve before the lens, five moods.
- **Reproducible**: `starter/package-lock.json` + `npm ci`; `npm run setup`; `templates/TASTE.template.md` (also copied into every audit's output).
