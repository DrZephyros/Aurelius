import JSZip from "jszip";
import { SITE } from "./site";
import { bump } from "./stats";
import { PROMPTS, fill } from "./prompts";
import type { Template } from "./templates";

/* Everything under public/demos is bundled as raw text so the whole app ships as ONE html file. */
const RAW = import.meta.glob("/public/demos/**/*.{html,css,js}", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const PREFIX = "/public/demos/";
const at = (rel: string): string => {
  const v = RAW[PREFIX + rel];
  if (v === undefined) throw new Error("Missing demo file: " + rel);
  return v;
};

const SOURCE_FILES = ["index.html", "style.css", "main.js"] as const;
export type SourceFile = (typeof SOURCE_FILES)[number];

export function readSource(slug: string, file: SourceFile): string {
  return at(slug + "/" + file);
}

export function readShared(file: "core.js" | "base.css"): string {
  return at("_shared/" + file);
}

/** Every vendored file (three.js + add-ons), keyed by path relative to _vendor/. */
export const VENDOR: Record<string, string> = Object.fromEntries(
  Object.entries(RAW)
    .filter(([k]) => k.startsWith(PREFIX + "_vendor/"))
    .map(([k, v]) => [k.slice((PREFIX + "_vendor/").length), v])
);

export type Metrics = { lines: number; chars: number; tokens: number; kb: number };

/** Size of what the author wrote (template files + shared engine). Tokens ≈ chars / 4. */
export function metricsFor(slug: string): Metrics {
  const parts = SOURCE_FILES.map((f) => readSource(slug, f)).concat(readShared("core.js"), readShared("base.css"));
  const text = parts.join("\n");
  return {
    lines: text.split("\n").length,
    chars: text.length,
    tokens: Math.round(text.length / 4),
    kb: Math.round(new Blob([text]).size / 1024),
  };
}

const rewritePaths = (html: string) => html.replaceAll("../_vendor/", "./vendor/").replaceAll("../_shared/", "./shared/");

function readme(t: Template): string {
  return `# ${t.name} — ${t.tagline}

A ${SITE.name} template. Plain HTML + CSS + JavaScript + Three.js. **No build step, no framework, no API keys.**

${t.blurb}

## Run it

This project uses ES modules, so it must be served over HTTP (double-clicking index.html will not work).

\`\`\`bash
npx serve .            # or: npm run dev
# or
python3 -m http.server 3000
# or use the "Live Server" extension in VS Code
\`\`\`

Open http://localhost:3000 (the port is printed in your terminal).

## What's inside

\`\`\`
index.html     page markup: nav, sections, loader, labels
style.css      theme overrides (colours + fonts) for this template
main.js        the 3D scene — start at the CONFIG object at the top
shared/core.js the reusable engine (renderer, bloom, scroll rail, loader, labels)
shared/base.css shared design system (typography, layout, HUD, reveal animations)
vendor/        three.js (vendored, works offline) + post-processing add-ons
AI_CONTEXT.md  paste this into your AI tool so it understands the project in seconds
PROMPTS.md     ready-made prompts to customise this template
\`\`\`

## Customise in 5 minutes

1. **Copy** – edit headlines, paragraphs and buttons in \`index.html\`.
2. **Brand colours** – change \`--accent\` and \`--bg\` at the top of \`style.css\`.
3. **Scene tweaks** – every important number lives in the \`CONFIG\` object at the top of \`main.js\`.
4. **Camera path** – the \`createRail([...positions], [...targets])\` call defines one camera keyframe per section.
5. **Fonts** – swap the Google Fonts <link> in \`index.html\` and the font variables in \`style.css\`.

## Good to know

- Best for: ${t.bestFor.join(", ")}.
- GPU load: **${t.gpu}**. On weak devices lower the pixel ratio (\`maxDpr\` in createStage) or reduce counts in CONFIG.
- If WebGL is unavailable the page falls back to a styled gradient background automatically.
- Add \`?embed=card\` to the URL to see the auto-playing thumbnail mode.

## Using it inside React / Next.js

See PROMPTS.md — there is a ready-made "Port to Next.js" prompt that handles setup + cleanup correctly.

---
Made with ${SITE.name} · ${SITE.domain}
`;
}

function promptsMd(t: Template): string {
  const specific = t.tweaks.map((x, i) => `### ${i + 1}. ${x.label}\n\n\`\`\`\n${x.prompt}\n\`\`\``).join("\n\n");
  const general = PROMPTS.map((p) => `### ${p.title}\n_${p.summary}_\n\n\`\`\`\n${fill(p.body, t.name)}\n\`\`\``).join("\n\n");
  return `# Prompts for ${t.name}

Paste these into Claude Code, Cursor, Copilot, Windsurf — any AI coding tool. Fill in the [brackets].
Tip: tell the AI to read **AI_CONTEXT.md** first, so it doesn't waste tokens re-reading the engine.

## Template-specific

${specific}

## General

${general}
`;
}

function aiContext(t: Template): string {
  return `# AI_CONTEXT — ${t.name}

Read this before editing. It replaces reading the whole codebase.

## Stack
- Static site. No bundler, no framework, no package install needed to run.
- Three.js (vendored in vendor/) loaded through an **importmap** in index.html:
  - \`three\` → vendor/three.module.min.js
  - \`three/addons/\` → vendor/addons/
  - \`@core\` → shared/core.js
- Entry: index.html → main.js (ES module).

## Rules of engagement
1. **Do NOT rewrite shared/core.js.** It is a stable engine. Import from it instead.
2. Tune the look via the \`CONFIG\` object at the top of main.js and CSS variables in style.css.
3. Keep the importmap intact. To use another three.js add-on, copy it from three/examples/jsm into vendor/addons/ keeping its folder structure.
4. Any new section needs: markup with \`data-sec\`, a dot in \`.dots\`, and one more camera keyframe in \`createRail\`.
5. Always dispose geometries/materials/textures you create dynamically.

## core.js exports (all you need)
- \`THREE\` – re-export of three.
- \`boot(fn)\` – runs the loader, calls fn, shows a fallback if WebGL fails.
- \`createStage({background, fog:{color,density}, fov, bloom:{strength,radius,threshold}, exposure, grain, vignette, aberration, maxDpr})\` → \`{scene, camera, renderer, composer, onFrame(fn), start(), dpr}\`.
- \`createScroll()\` → \`{progress 0..1 (smoothed), velocity, update(dt,t)}\`; \`createPointer()\` → \`{x,y -1..1}\`.
- \`createRail(positions, targets)\` → \`.apply(camera, progress)\` moves the camera along a Catmull-Rom path.
- \`createLabels(camera, [{el, anchor, dx, dy}])\` → 3D-anchored DOM labels with SVG leader lines.
- \`createEnv(renderer, panels)\` procedural studio reflections; \`lightShaft()\`; \`createNoise(seed)\`; \`rng(seed)\`; \`radialTexture()\`; \`GLSL_NOISE\` (snoise/fbm).
- Helpers: \`clamp, lerp, damp, smoothstep\`.

## HTML contract
- \`data-split\` on headings → word-by-word reveal; \`data-reveal\` on anything → fade/blur-in; \`--d\` inline var = delay.
- \`.sec\` blocks are full-height scroll sections; \`#loader\` is the loading screen.

## This template
- Name: ${t.name} (${t.tagline}). Theme: ${t.theme}. GPU: ${t.gpu}.
- Techniques: ${t.techniques.join("; ")}.
- Interactions: ${t.interactions.join("; ")}.
`;
}

const LICENSE = `${SITE.name} Template License

You may use this template in unlimited personal and commercial projects, including client work.
You may not resell or redistribute the template files themselves (alone or in a bundle) as a template, theme or kit.
Included third-party code: three.js (MIT License, © three.js authors).

Provided "as is" without warranty of any kind.
`;

export async function buildZip(t: Template): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder(`${t.slug}-3d-template`)!;
  root.file("index.html", rewritePaths(readSource(t.slug, "index.html")));
  root.file("style.css", readSource(t.slug, "style.css"));
  root.file("main.js", readSource(t.slug, "main.js"));
  const shared = root.folder("shared")!;
  shared.file("core.js", readShared("core.js"));
  shared.file("base.css", readShared("base.css"));
  const vendor = root.folder("vendor")!;
  for (const [rel, code] of Object.entries(VENDOR)) vendor.file(rel, code);
  root.file("README.md", readme(t));
  root.file("PROMPTS.md", promptsMd(t));
  root.file("AI_CONTEXT.md", aiContext(t));
  root.file("LICENSE.txt", LICENSE);
  root.file(
    "package.json",
    JSON.stringify(
      { name: `${t.slug}-3d-template`, version: "1.0.0", private: true, description: `${t.name} — ${t.tagline}`, scripts: { dev: "npx --yes serve -l 3000 .", start: "npx --yes serve -l 3000 ." } },
      null,
      2
    ) + "\n"
  );
  return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } });
}

export const ZIP_FILE_TREE = [
  "index.html",
  "style.css",
  "main.js",
  "shared/core.js",
  "shared/base.css",
  "vendor/three.module.min.js",
  "vendor/addons/…",
  "README.md",
  "PROMPTS.md",
  "AI_CONTEXT.md",
  "LICENSE.txt",
  "package.json",
];

/** Build the zip in the browser and hand it to the user. */
export async function downloadTemplate(t: Template): Promise<void> {
  const blob = await buildZip(t);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${t.slug}-3d-template.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  bump(t.slug, "download");
}
