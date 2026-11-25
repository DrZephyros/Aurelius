// Authoring tool: splits a bundle file into registry files and generates each item's README.md from its spec.
//   node scripts/unbundle.mjs path/to/bundle.txt
// Bundle format:   @@ <category>/<slug>/<file>   followed by the file content.
//                  The special file name "spec.json" is turned into README.md (agent instructions).
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "src", "registry");
const pascal = (s) => s.split("-").map((x) => x[0].toUpperCase() + x.slice(1)).join("");

function readme(cat, slug, spec, file) {
  const comp = spec.export || pascal(slug);
  const deps = spec.deps?.length ? spec.deps.map((d) => `\`${d}\``).join(", ") : "none";
  const esc = (v) => String(v).replace(/\|/g, "\\|");
  const props = (spec.props || []).map(([n, t, d, x]) => `| \`${esc(n)}\` | \`${esc(t)}\` | ${d === "—" ? "—" : "`" + esc(d) + "`"} | ${esc(x)} |`).join("\n");
  const notes = (spec.notes || []).map((n) => `- ${n}`).join("\n");
  return `---
name: ${spec.name}
tagline: ${spec.tagline}
tags: [${(spec.tags || []).join(", ")}]
deps: [${(spec.deps || []).join(", ")}]
order: ${spec.order ?? 50}
---

# ${spec.name}

${spec.tagline}.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| \`${file}\` | the component — exports \`${comp}\` |
| \`README.md\` | these instructions |

## Install

1. Copy \`${file}\` into the user's project, e.g. \`components/aurelius/${file}\` (any folder works; adjust the import path below).
2. npm dependencies: ${deps}. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with \`"use client"\`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to \`.jsx\` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped \`<style>\` block (classes prefixed \`au-\`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

\`\`\`tsx
import { ${comp} } from "@/components/aurelius/${slug}";

${spec.usage}
\`\`\`

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
${props}

## Notes for the agent

${notes}
- Motion respects \`prefers-reduced-motion\`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: \`--au-accent\`, \`--au-accent-2\`, \`--au-fg\`, \`--au-bg\`, \`--au-border\` (each component only reads the ones it needs).
- SSR-safe: nothing touches \`window\`/\`document\` during render, so no \`dynamic(..., { ssr: false })\` wrapper is needed.
${spec.extra ? "\n## Extras\n\n" + spec.extra + "\n" : ""}`;
}

for (const f of process.argv.slice(2)) {
  const text = fs.readFileSync(f, "utf8");
  const parts = text.split(/^@@ (.+)$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const rel = parts[i].trim();
    const body = parts[i + 1].replace(/^\n/, "").replace(/\s+$/, "") + "\n";
    const [cat, slug, file] = rel.split("/");
    const dir = path.join(root, cat, slug);
    fs.mkdirSync(dir, { recursive: true });
    if (file === "spec.json") {
      const spec = JSON.parse(body);
      fs.writeFileSync(path.join(dir, "README.md"), readme(cat, slug, spec, `${slug}.tsx`));
    } else fs.writeFileSync(path.join(dir, file), body);
  }
}
console.log("unbundled", process.argv.slice(2).join(", "));
