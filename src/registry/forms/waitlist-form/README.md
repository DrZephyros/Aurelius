---
name: Waitlist form
tagline: Email capture with validation, honeypot and loading/success/error states
tags: [email, launch, cta, form]
deps: []
order: 4
---

# Waitlist form

Email capture with validation, honeypot and loading/success/error states.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `waitlist-form.tsx` | the component — exports `WaitlistForm` |
| `README.md` | these instructions |

## Install

1. Copy `waitlist-form.tsx` into the user's project, e.g. `components/aurelius/waitlist-form.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { WaitlistForm } from "@/components/aurelius/waitlist-form";

<WaitlistForm endpoint="/api/waitlist" extra={{ source: "hero" }} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `endpoint` | `string` | `"/api/waitlist"` | URL receiving POST `{ email }` JSON; 2xx = success |
| `buttonLabel` | `string` | `"Join the waitlist"` | Submit label |
| `placeholder` | `string` | `"you@company.com"` | Input placeholder |
| `successMessage` | `string` | `friendly default` | Shown after success |
| `extra` | `Record<string, unknown>` | — | Extra JSON fields (e.g. `{ source: "hero" }`) |
| `onSuccess` | `(email: string) => void` | — | Called after success (analytics, confetti…) |

## Notes for the agent

- You must provide the endpoint — see the ready-made Next.js route in Extras below.
- A hidden `website` field is a honeypot; bots that fill it are silently ignored.
- On a non-2xx response the JSON `error` string (if any) is shown to the user.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.

## Extras

### Next.js App Router API route (`app/api/waitlist/route.ts`)

```ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  // TODO: persist it — e.g. with Drizzle:  await db.insert(waitlist).values({ email }).onConflictDoNothing();
  console.log("waitlist signup", email);
  return NextResponse.json({ ok: true });
}
```

If the project has a database, create a `waitlist` table (`id`, `email` unique, `created_at`) and insert there instead of logging.
