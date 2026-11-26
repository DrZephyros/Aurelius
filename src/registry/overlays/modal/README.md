---
name: Modal / drawer / sheet
tagline: One accessible overlay: centred dialog, right-hand drawer or bottom sheet
tags: [dialog, drawer, sheet, accessible]
deps: []
order: 1
---

# Modal / drawer / sheet

One accessible overlay: centred dialog, right-hand drawer or bottom sheet.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `modal.tsx` | the component — exports `Modal` |
| `README.md` | these instructions |

## Install

1. Copy `modal.tsx` into the user's project, e.g. `components/aurelius/modal.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { Modal } from "@/components/aurelius/modal";

const [open, setOpen] = useState(false);
<button onClick={() => setOpen(true)}>Edit</button>
<Modal open={open} onClose={() => setOpen(false)} title="Edit profile" placement="right">
  <ProfileForm />
</Modal>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Controlled visibility |
| `onClose` | `() => void` | — | Called on Esc, backdrop click or the ✕ button |
| `title` | `ReactNode` | — | Heading (also the dialog's accessible name) |
| `placement` | `"center" \| "right" \| "bottom"` | `"center"` | Dialog, drawer or sheet |
| `dismissible` | `boolean` | `true` | Close on backdrop click |
| `width` | `string` | `"480px"` | Panel width |

## Notes for the agent

- Renders into `document.body` through a portal; focus is trapped while open and restored on close.
- The panel has a dark theme by default; change the colours in the `.au-md-p` rule for light UIs.
- Keep modal content short; long content scrolls inside the panel.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
