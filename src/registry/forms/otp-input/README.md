---
name: OTP input
tagline: One-time-code boxes with auto-advance, paste and SMS autofill
tags: [auth, 2fa, verification, accessible]
deps: []
order: 2
---

# OTP input

One-time-code boxes with auto-advance, paste and SMS autofill.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `otp-input.tsx` | the component — exports `OtpInput` |
| `README.md` | these instructions |

## Install

1. Copy `otp-input.tsx` into the user's project, e.g. `components/aurelius/otp-input.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { OtpInput } from "@/components/aurelius/otp-input";

<OtpInput onComplete={async (code) => { const ok = await verify(code); setError(!ok); }} error={error} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `length` | `number` | `6` | Number of digits |
| `onChange` | `(code: string) => void` | — | Called on every edit |
| `onComplete` | `(code: string) => void` | — | Called when all digits are entered |
| `error` | `boolean` | `false` | Shake + red state |
| `autoFocus` | `boolean` | `false` | Focus the first box |

## Notes for the agent

- Numeric only. Pasting a full code fills every box.
- First box has `autocomplete="one-time-code"` so mobile keyboards offer the SMS code.
- To reset after an error, change the component `key`.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
