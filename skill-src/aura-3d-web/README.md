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
│  └─ 09-prompt-pack.md             ← master prompt + archetype kickoffs + refinement prompts
└─ starter/                         ← the working engine (Vite + React + three), type-checked
   └─ src/aura/ engine · choreo · materials · particles · layers · floor · assets · AuraExperience · aura.css · scene.example
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
cd starter && npm i && npm run dev
```
You'll see **Obsidian Gate** — a zero-asset reference world (5 shots, a hold, a fly-through). Read `scene.example.ts` as the pattern, then replace the scene.
