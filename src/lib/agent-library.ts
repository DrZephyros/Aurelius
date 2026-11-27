import "server-only";
import RAW_DEMOS from "@/generated/raw-demos";
import RAW_KIT from "@/generated/raw-kit";
import RAW_REG from "@/generated/raw-registry";
import RAW_PUBLIC from "@/generated/raw-skill-public";
import { TEMPLATES } from "@/lib/templates";
import { REG_CATS, REG_ITEMS } from "@/lib/registry";
import { ALL_PROMPTS } from "@/lib/library";

/* The agent-readable face of the free library. Everything here is plain markdown / text so ANY agent that can fetch a URL
   (Claude, ChatGPT, Cursor, Codex, Gemini, Windsurf, Lovable, Bolt…) can browse it, then pull exactly the pieces it needs. */

const fence = (lang: string, code: string) => "```" + lang + "\n" + code.replace(/\s+$/, "") + "\n```";
const strip = (md: string) => md.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
const kitList = (dir: "pages" | "elements") =>
  Object.keys(RAW_KIT)
    .filter((k) => k.startsWith(`/kit-src/${dir}/`))
    .map((k) => k.split("/").pop()!.replace(/\.html$/, ""));
const kitTitle = (dir: string, slug: string) => (RAW_KIT[`/kit-src/${dir}/${slug}.html`]?.match(/<title>([^<]*)<\/title>/)?.[1] ?? slug).trim();

export const PREAMBLE = `You have been given read access to the **Aurelius library** — a free, curated set of production-grade building blocks for scroll-driven, immersive websites.
Browse the index, then fetch only the items you need (each link below returns plain text with the full source and usage notes). Adapt them to the project you are building; do not paste them blindly.`;

export function indexMarkdown(base: string): string {
  const L: string[] = [];
  L.push("# Aurelius library — agent index", "", PREAMBLE, "");
  L.push("## How to use this library", "",
    "1. Read the user's brief. Decide which shelf fits (a cinematic landing page → *Landing pages*; a React UI piece → *Components*; a full screen like sign-in → *App pages*).",
    "2. Fetch the item URL(s) you need. Study the structure, motion and craft; reuse code where it fits.",
    "3. Keep the user's brand, copy and palette. The library supplies craft, not content.",
    "4. For anything **scroll-driven & 3D**, prefer one continuous camera, scroll as the playhead, designed lighting, and giant fitted type (see the free doctrine below).", "");

  L.push(`## Landing pages — ${TEMPLATES.length} cinematic 3D sites (three.js, vanilla JS)`, "");
  for (const t of TEMPLATES) L.push(`- [${t.name}](${base}/templates/${t.slug}) — ${t.tagline}. ${t.theme}, GPU ${t.gpu}. Best for: ${t.bestFor.slice(0, 3).join(", ")}.`);

  L.push("", `## Components — ${REG_ITEMS.length} drop-in React pieces`, "");
  for (const c of REG_CATS) {
    L.push(`### ${c.name} — ${c.blurb}`);
    for (const i of REG_ITEMS.filter((x) => x.category === c.slug)) L.push(`- [${i.name}](${base}/components/${i.category}/${i.slug}) — ${i.tagline}`);
    L.push("");
  }

  L.push(`## App pages — ${kitList("pages").length} finished single-file screens`, "");
  for (const s of kitList("pages")) L.push(`- [${kitTitle("pages", s)}](${base}/pages/${s})`);
  L.push("", `## Interactive elements — ${kitList("elements").length} single-file pieces`, "");
  for (const s of kitList("elements")) L.push(`- [${kitTitle("elements", s)}](${base}/elements/${s})`);

  L.push("", `## Prompts — ${ALL_PROMPTS.length} battle-tested prompts`, "", `- [All prompts](${base}/prompts) (kickoff, UI, debugging, performance, SEO, security, agent setup…)`);
  L.push("", "## Free craft notes from the AURA skill", "",
    `- [AURA doctrine](${base}/skill/doctrine) — the four pillars and ten laws of immersive 3D web design`,
    `- [AURA prompt pack](${base}/skill/prompt-pack) — kickoff prompts for 3D sites`,
    `- [Worked example: NOCTA product altar](${base}/skill/example) — prompt → direction lock → storyboard → implementation`, "",
    "> The full AURA skill (12+ art directions, 16 references, 7 worked examples, a cinematic engine starter, a QA gate) is the paid upgrade — it is what turns these pieces into a $10,000-grade, fully choreographed 3D website.");
  return L.join("\n") + "\n";
}

/* A template is a flat project: index.html, style.css, main.js and shared/. three.js loads from a pinned CDN build,
   so nothing needs vendoring or npm install. Only index.html has relative paths, so rewrite them here. */
const THREE_CDN = "https://cdn.jsdelivr.net/npm/three@0.170.0";
const flatten = (html: string) =>
  html
    .replace(/\.\.\/_shared\//g, "./shared/")
    .replace(/\.\.\/_vendor\/three\.module\.min\.js/g, `${THREE_CDN}/build/three.module.min.js`)
    .replace(/\.\.\/_vendor\/addons\//g, `${THREE_CDN}/examples/jsm/`);

export function templateMarkdown(slug: string): string | null {
  const t = TEMPLATES.find((x) => x.slug === slug);
  if (!t) return null;
  const f = (n: string) => RAW_DEMOS[`/demos-src/${slug}/${n}`] ?? "";
  const core = RAW_DEMOS["/demos-src/_shared/core.js"] ?? "";
  const base = RAW_DEMOS["/demos-src/_shared/base.css"] ?? "";
  return [
    `# ${t.name} — ${t.tagline}`, "", t.blurb, "",
    `- Theme: ${t.theme} · GPU: ${t.gpu} · Sections: ${t.sections}`,
    `- Best for: ${t.bestFor.join(", ")}`,
    `- Techniques: ${t.techniques.join(" · ")}`,
    `- Interactions: ${t.interactions.join(" · ")}`, "",
    "## Project layout", "",
    "Create these five files in one folder. No build step and no npm install are needed:", "",
    "```", "index.html", "style.css", "main.js", "shared/base.css", "shared/core.js", "```", "",
    "## Notes for the agent", "",
    "- Vanilla JS + three.js. `main.js` imports the shared engine as `@core` (`shared/core.js`: THREE re-export, scroll playhead, loaders, helpers). The import map in `index.html` already maps `@core`, `three` and `three/addons/` to `./shared/core.js` and a pinned three.js r170 on jsDelivr. Keep those lines.",
    "- Serve the folder over http, not file://. ES modules and WebGL need it: `npx serve .` or `python -m http.server 8000`.",
    "- Verify before you finish: load the page in a headless browser, check for zero console errors (a missing file shows as a 404), and screenshot the top and a scrolled position. The hero should show visible copy over the 3D scene.",
    "- Re-use the structure, camera rail and choreography; swap copy, assets and palette.", "",
    "## index.html", fence("html", flatten(f("index.html"))), "",
    "## style.css", fence("css", f("style.css")), "",
    "## main.js", fence("js", f("main.js")), "",
    "## shared/base.css (layout and type system)", fence("css", base), "",
    "## shared/core.js (the `@core` engine)", fence("js", core),
  ].join("\n");
}

export function componentMarkdown(category: string, slug: string): string | null {
  const item = REG_ITEMS.find((i) => i.category === category && i.slug === slug);
  if (!item) return null;
  const base = `/src/registry/${category}/${slug}/`;
  return [
    `# ${item.name} — ${item.tagline}`, "",
    `Install: copy \`${item.file}\` into the project (e.g. \`components/aurelius/${item.file}\`). Dependencies: ${item.deps.length ? item.deps.join(", ") : "none"}.`, "",
    "## README", strip(RAW_REG[base + "README.md"] ?? ""), "",
    `## ${item.file}`, fence("tsx", RAW_REG[base + item.file] ?? ""),
  ].join("\n");
}

export function kitMarkdown(dir: "pages" | "elements", slug: string): string | null {
  const src = RAW_KIT[`/kit-src/${dir}/${slug}.html`];
  if (!src) return null;
  return [`# ${kitTitle(dir, slug)}`, "", "A single self-contained HTML file (inline CSS + JS, no dependencies). Port it into the project's framework or use it as is.", "", fence("html", src)].join("\n");
}

export function promptsMarkdown(): string {
  const out = ["# Aurelius prompt library", "", "Anything in [SQUARE BRACKETS] is a placeholder to fill in.", ""];
  let cat = "";
  for (const p of ALL_PROMPTS) {
    if (p.category !== cat) { cat = p.category; out.push(`## ${cat}`, ""); }
    out.push(`### ${p.title}`, p.summary, "", p.body, "");
  }
  return out.join("\n");
}

export function skillSampleMarkdown(which: string): string | null {
  const key = which === "doctrine" ? "/references/01-aura-doctrine.md" : which === "prompt-pack" ? "/references/09-prompt-pack.md" : which === "example" ? "/examples/01-" : "";
  if (!key) return null;
  const hit = Object.entries(RAW_PUBLIC).find(([k]) => k.includes(key));
  return hit ? hit[1] : null;
}
