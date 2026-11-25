import JSZip from "jszip";
import { REG_CATS, REG_ITEMS, itemsOf, zipName, type RegItem } from "./registry";
import { SITE } from "./site";

/* The component sources + READMEs are bundled as raw text (the app ships as ONE html file), and zips are built in the browser. */
const CODE = import.meta.glob(["/src/registry/*/*/*.tsx", "!/src/registry/*/*/demo.tsx"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const DOCS = import.meta.glob("/src/registry/*/*/README.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const strip = (md: string) => md.replace(/^---\n[\s\S]*?\n---\n/, "").trim();

export function readItem(category: string, slug: string) {
  const file = `${slug}.tsx`;
  const base = `/src/registry/${category}/${slug}/`;
  const code = CODE[base + file] ?? "";
  const readme = DOCS[base + "README.md"] ?? "";
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

const itemLine = (i: RegItem, prefix = "") => `- **${i.name}** — ${i.tagline}. \`${prefix}${i.slug}/${i.file}\``;

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

async function build(category?: string, slug?: string): Promise<Blob | null> {
  const zip = new JSZip();
  if (category && slug) {
    const item = REG_ITEMS.find((i) => i.category === category && i.slug === slug);
    if (!item) return null;
    const root = zip.folder(item.slug)!;
    addItem(root, item);
    root.file("LICENSE.txt", LICENSE);
  } else if (category) {
    if (!REG_CATS.some((c) => c.slug === category)) return null;
    const root = zip.folder(`aurelius-${category}`)!;
    root.file("README.md", categoryReadme(category));
    root.file("LICENSE.txt", LICENSE);
    for (const i of itemsOf(category)) addItem(root.folder(i.slug)!, i);
  } else {
    const root = zip.folder("aurelius-components")!;
    root.file("README.md", masterReadme());
    root.file("LICENSE.txt", LICENSE);
    for (const c of REG_CATS) {
      const dir = root.folder(c.slug)!;
      dir.file("README.md", categoryReadme(c.slug));
      for (const i of itemsOf(c.slug)) addItem(dir.folder(i.slug)!, i);
    }
  }
  return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } });
}

/** Build the zip in the browser and hand it to the user. */
export async function downloadRegistry(category?: string, slug?: string): Promise<void> {
  const blob = await build(category, slug);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName(category, slug);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
