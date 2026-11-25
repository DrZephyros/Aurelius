import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { REG_CATS, REG_ITEMS, itemsOf, type RegItem } from "./registry";
import { SITE } from "./site";

/* Server-only helpers for the component library (reads src/registry from disk, builds zips). */
const ROOT = path.join(process.cwd(), "src", "registry");

const strip = (md: string) => md.replace(/^---\n[\s\S]*?\n---\n/, "").trim();

export function readItem(category: string, slug: string) {
  const dir = path.join(ROOT, category, slug);
  const file = `${slug}.tsx`;
  const code = fs.readFileSync(path.join(dir, file), "utf8");
  const readme = fs.readFileSync(path.join(dir, "README.md"), "utf8");
  return { file, code, readme, body: strip(readme) };
}

const LICENSE = `${SITE.name} Component License

Use these components in unlimited personal and commercial projects, including client work.
You may not resell or redistribute the files themselves (alone or in a bundle) as a component library, template or kit.
Provided "as is" without warranty of any kind.
`;

const CONVENTIONS = `## Conventions shared by every component

- **React + TypeScript, zero npm dependencies** unless an item's README says otherwise.
- **One file per component.** Copy the \`.tsx\` into the project (e.g. \`components/aurelius/\`). Files start with \`"use client"\`, so they work from Next.js App Router server components.
- **Self-contained styling.** Each component injects a small \`<style>\` block with \`au-\`-prefixed classes. No Tailwind config, global CSS or provider is needed.
- **Theming via CSS variables** on any ancestor: \`--au-accent\`, \`--au-accent-2\`, \`--au-bg\`, \`--au-border\`.
- **Accessible + motion-safe.** Roles / ARIA are built in and \`prefers-reduced-motion\` is respected.
- **Props over edits.** Configure with props; if you must edit a copied file, keep the public props backwards compatible.
`;

function itemLine(i: RegItem, prefix = "") {
  return `- **${i.name}** — ${i.tagline}. \`${prefix}${i.slug}/${i.file}\``;
}

function masterReadme(): string {
  const cats = REG_CATS.map((c) => `### ${c.name}\n${c.blurb}\n\n${itemsOf(c.slug).map((i) => itemLine(i, `${c.slug}/`)).join("\n")}`).join("\n\n");
  return `# ${SITE.name} — modular component library

${REG_ITEMS.length} drop-in components in ${REG_CATS.length} categories, built for AI coding agents (Claude Code, Cursor, Codex, Copilot, Lovable…).

## How an agent should use this folder

1. Do **not** copy everything. Pick only what the user asked for.
2. Open the item's folder and read its \`README.md\` first — it has the exact install steps, props table and gotchas.
3. Copy the single \`<slug>.tsx\` into the user's project (e.g. \`components/aurelius/<slug>.tsx\`) and import it.
4. Configure through props and CSS variables. Run the type-check afterwards.

${CONVENTIONS}
## Contents

${cats}

${SITE.domain}
`;
}

function categoryReadme(slug: string): string {
  const c = REG_CATS.find((x) => x.slug === slug)!;
  return `# ${SITE.name} — ${c.name}

${c.blurb}

Each sub-folder is independent: read its \`README.md\`, copy its \`.tsx\`, import it.

${itemsOf(slug).map((i) => itemLine(i)).join("\n")}

${CONVENTIONS}`;
}

function addItem(zip: JSZip, i: RegItem) {
  const { file, code, readme } = readItem(i.category, i.slug);
  zip.file(file, code);
  zip.file("README.md", readme);
}

const out = (z: JSZip) => z.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 9 } });

export async function zipItem(category: string, slug: string) {
  const item = REG_ITEMS.find((i) => i.category === category && i.slug === slug);
  if (!item) return null;
  const zip = new JSZip();
  const root = zip.folder(item.slug)!;
  addItem(root as unknown as JSZip, item);
  root.file("LICENSE.txt", LICENSE);
  return out(zip);
}

export async function zipCategory(category: string) {
  if (!REG_CATS.some((c) => c.slug === category)) return null;
  const zip = new JSZip();
  const root = zip.folder(`aurelius-${category}`)!;
  root.file("README.md", categoryReadme(category));
  root.file("LICENSE.txt", LICENSE);
  for (const i of itemsOf(category)) addItem(root.folder(i.slug) as unknown as JSZip, i);
  return out(zip);
}

export async function zipAll() {
  const zip = new JSZip();
  const root = zip.folder("aurelius-components")!;
  root.file("README.md", masterReadme());
  root.file("LICENSE.txt", LICENSE);
  for (const c of REG_CATS) {
    const dir = root.folder(c.slug)!;
    dir.file("README.md", categoryReadme(c.slug));
    for (const i of itemsOf(c.slug)) addItem(dir.folder(i.slug) as unknown as JSZip, i);
  }
  return out(zip);
}
