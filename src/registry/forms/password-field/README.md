---
name: Password field
tagline: Password input with show/hide, strength meter and live requirements
tags: [auth, signup, validation]
deps: []
order: 3
---

# Password field

Password input with show/hide, strength meter and live requirements.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `password-field.tsx` | the component — exports `PasswordField` |
| `README.md` | these instructions |

## Install

1. Copy `password-field.tsx` into the user's project, e.g. `components/aurelius/password-field.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { PasswordField } from "@/components/aurelius/password-field";

const [pw, setPw] = useState("");
<PasswordField value={pw} onChange={(v, score) => { setPw(v); setOk(score >= 3); }} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Controlled value |
| `onChange` | `(value: string, score: number) => void` | — | Called with the new value and a 0–4 score |
| `label` | `string` | `"Password"` | Label text |
| `checklist` | `boolean` | `true` | Show requirement list |
| `autoComplete` | `"new-password" \| "current-password"` | `"new-password"` | Browser password-manager hint |
| `name` | `string` | — | Form field name |

## Notes for the agent

- Also exports `scorePassword(p)` (0–4). This is a UX hint only — always enforce real rules on the server.
- Use `autoComplete="current-password"` and `checklist={false}` for a login form.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
