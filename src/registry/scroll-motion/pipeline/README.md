---
name: Pipeline
tagline: A pinned, scroll-driven walk through the phases of a build, with a rail, a visual per phase, and gate checks
tags: [scroll, pinned, timeline, process, steps, storytelling]
deps: []
order: 7
---

# Pipeline

A full-height section that pins while the visitor scrolls. Each phase fills in a visual, and a side rail tracks the current step.

## Usage

```tsx
import { Pipeline } from "@/components/pipeline";

export default function Page() {
  return <Pipeline />;
}
```

`heading={false}` hides the built-in heading when the surrounding page already has one.

## Notes

- Phases are defined in the `PHASES` array at the top of the file. Edit that array to change the steps.
- The file is self-contained. It includes its own CSS in a `<style>` element. The easing and fonts come from the Aurelius theme tokens; without them the animation falls back to browser defaults.
- Reduced-motion users get the static phase list without pinning.
