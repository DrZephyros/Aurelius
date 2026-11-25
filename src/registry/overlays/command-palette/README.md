---
name: Command palette
tagline: A ⌘K palette with search, groups and full keyboard control
tags: [search, power-user, navigation, saas]
deps: []
order: 5
---

# Command palette

A ⌘K palette with search, groups and full keyboard control.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `command-palette.tsx` | the component — exports `CommandPalette` |
| `README.md` | these instructions |

## Install

1. Copy `command-palette.tsx` into the user's project, e.g. `components/aurelius/command-palette.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { CommandPalette } from "@/components/aurelius/command-palette";

<CommandPalette commands={[
  { id: "home", label: "Go home", group: "Navigate", onSelect: () => router.push("/") },
]} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `commands` | `{ id: string; label: string; group?: string; hint?: string; keywords?: string; onSelect: () => void }[]` | — | Entries |
| `hotkey` | `string` | `"k"` | Letter for ⌘/Ctrl+letter |
| `placeholder` | `string` | — | Input placeholder |
| `open / onOpenChange` | `boolean / (open) => void` | `uncontrolled` | Control it from your own button |

## Notes for the agent

- Mount once near the root. It listens for ⌘K / Ctrl+K globally.
- Search matches every typed word against label, group and `keywords`.
- Use `router.push` from `next/navigation` inside `onSelect` for page navigation.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
