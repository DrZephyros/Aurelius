/* Builds the agent-readable library as STATIC FILES, so the agent link keeps working on a
   static host (v14 is a Vite SPA — there are no route handlers to serve markdown).

   It bundles src/lib/agent-library.ts with esbuild (the same source of truth the site renders),
   then writes plain markdown into dist/:

     dist/llms.txt                         the index
     dist/library/index.md                 the same index
     dist/library/templates/<slug>.md      one template, full source
     dist/library/components/<cat>/<slug>.md
     dist/library/pages/<slug>.md
     dist/library/elements/<slug>.md
     dist/library/prompts.md
     dist/library/skill/<which>.md         free skill samples

   Run after `vite build` (see the build script in package.json). */

import { build } from "esbuild";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SITE = (process.env.AGENT_BASE_URL || "https://project-aurelius.netlify.app").replace(/\/$/, "");
const BASE = `${SITE}/library`;
const OUT = resolve("dist");
const TMP = resolve(".tmp");

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

// esbuild has no TypeScript type-checking need here: we only need the functions and lists.
const entry = resolve(TMP, "entry.ts");
writeFileSync(
  entry,
  `export { indexMarkdown, templateMarkdown, componentMarkdown, kitMarkdown, promptsMarkdown, skillSampleMarkdown } from "@/lib/agent-library";
export { TEMPLATES } from "@/lib/templates";
export { REG_ITEMS } from "@/lib/registry";
export { default as RAW_KIT } from "@/generated/raw-kit";
`,
);

const stub = resolve(TMP, "empty.mjs");
writeFileSync(stub, "export {};\n");

const bundle = resolve(TMP, "agent-library.mjs");
await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundle,
  alias: { "@": resolve("src"), "server-only": stub },
  logLevel: "silent",
});

const lib = await import(pathToFileURL(bundle).href);

const write = (rel, body) => {
  const file = resolve(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body.endsWith("\n") ? body : `${body}\n`, "utf8");
};

/* The builders emit extensionless links (they were written for route handlers).
   On a static host each item is a real .md file, so point the links at it. */
const withExtensions = (md) =>
  md.replace(/\]\(([^)\s]+)\)/g, (match, url) => {
    if (!url.startsWith(`${BASE}/`) || url.endsWith(".md")) return match;
    return `](${url}.md)`;
  });

let files = 0;

const index = withExtensions(lib.indexMarkdown(BASE));
write("llms.txt", index);
write("library/index.md", index);
files += 2;

for (const t of lib.TEMPLATES) {
  const md = lib.templateMarkdown(t.slug);
  if (md) {
    write(`library/templates/${t.slug}.md`, md);
    files++;
  }
}

for (const item of lib.REG_ITEMS) {
  const md = lib.componentMarkdown(item.category, item.slug);
  if (md) {
    write(`library/components/${item.category}/${item.slug}.md`, md);
    files++;
  }
}

const kitSlugs = (dir) =>
  Object.keys(lib.RAW_KIT)
    .filter((k) => k.includes(`/kit-src/${dir}/`) && k.endsWith(".html"))
    .map((k) => k.split("/").pop().replace(/\.html$/, ""))
    .sort();

for (const dir of ["pages", "elements"]) {
  for (const slug of kitSlugs(dir)) {
    const md = lib.kitMarkdown(dir, slug);
    if (md) {
      write(`library/${dir}/${slug}.md`, md);
      files++;
    }
  }
}

write("library/prompts.md", lib.promptsMarkdown());
files++;

for (const which of ["doctrine", "prompt-pack", "example"]) {
  const md = lib.skillSampleMarkdown(which);
  if (md) {
    write(`library/skill/${which}.md`, md);
    files++;
  }
}

console.log(`agent library: wrote ${files} files into dist/ (base ${BASE})`);
