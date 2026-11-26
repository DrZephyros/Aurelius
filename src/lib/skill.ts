import RAW, { SKILL_INDEX } from "@/generated/raw-skill-public";

/* CLIENT-SAFE edition. The full skill (every reference, the starter engine, the examples) lives in
   /skill-src/aura-3d-web and is only ever assembled on the server (lib/skill-server.ts) for paying customers.
   The browser gets an index of the files plus a handful of free sample files. */

export const SKILL_SLUG = "aura-3d-web";
const PREFIX = `/skill-src/${SKILL_SLUG}/`;

export type SkillFile = { path: string; name: string; group: string; code: string; lines: number; bytes: number; locked: boolean };

const ORDER = ["SKILL.md", "README.md", "references/", "examples/", "templates/", "scripts/", "starter/"];
const rank = (p: string) => {
  const i = ORDER.findIndex((o) => (o.endsWith("/") ? p.startsWith(o) : p === o));
  return i < 0 ? 99 : i;
};

export const SKILL_FILES: SkillFile[] = SKILL_INDEX.map((f) => {
  const parts = f.path.split("/");
  const code = RAW[PREFIX + f.path] ?? "";
  return { path: f.path, name: parts[parts.length - 1], group: parts.length === 1 ? "root" : parts[0], code, lines: f.lines, bytes: f.bytes, locked: !code };
}).sort((a, b) => rank(a.path) - rank(b.path) || a.path.localeCompare(b.path));

export const skillFile = (path: string) => SKILL_FILES.find((f) => f.path === path);

export const SKILL_STATS = {
  files: SKILL_FILES.length,
  docs: SKILL_FILES.filter((f) => f.group === "references").length,
  examples: SKILL_FILES.filter((f) => f.group === "examples" && f.name !== "README.md").length,
  docLines: SKILL_FILES.filter((f) => f.path.endsWith(".md")).reduce((a, f) => a + f.lines, 0),
  engineLines: SKILL_FILES.filter((f) => f.path.startsWith("starter/src/aura/")).reduce((a, f) => a + f.lines, 0),
  kb: Math.round(SKILL_FILES.reduce((a, f) => a + f.bytes, 0) / 1024),
};

/* ── prompts parsed straight out of references/09-prompt-pack.md ── */
export type KickoffPrompt = { id: string; title: string; text: string };

function firstFence(block: string): string {
  const m = block.match(/```[a-z]*\n([\s\S]*?)```/);
  return m ? m[1].trim() : "";
}

function section(md: string, heading: RegExp): string {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => /^## /.test(l) && heading.test(l));
  if (start < 0) return "";
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) if (/^## /.test(lines[i])) { end = i; break; }
  return lines.slice(start + 1, end).join("\n");
}

const pack = skillFile("references/09-prompt-pack.md")?.code ?? "";
export const SHORT_PROMPT = firstFence(section(pack, /Short prompt/));
export const MASTER_PROMPT = firstFence(section(pack, /Master prompt/));
export const KICKOFFS: KickoffPrompt[] = section(pack, /Archetype kickoff/)
  .split(/^### /m)
  .slice(1)
  .map((b) => {
    const title = b.split("\n")[0].trim();
    return { id: title.toLowerCase().replace(/[^a-z]+/g, "-"), title, text: firstFence(b) };
  })
  .filter((k) => k.text);

/* ── editorial content for the page (the files are the source of truth for the skill itself) ── */
export const LAWS: [string, string][] = [
  ["One idea, one world, one camera", "A single authored metaphor. The camera never cuts — it flies."],
  ["Scroll is the playhead", "Scrubbed, damped, reversible. Never “animate on scroll into view”."],
  ["Depth is built", "Five planes every frame: occluder, subject, mid, background, atmosphere."],
  ["Light is designed", "Key, coloured rim, fill and a practical in the world. Never default light."],
  ["Matter has a story", "Varied roughness, clearcoat, iridescence, emission — always an environment map."],
  ["Type is architecture", "Giant words the world touches: behind, reflected, scrubbed. ≤12 words a beat."],
  ["Pace like an editor", "Wide / close alternation, a hold, a crescendo, a composed last frame."],
  ["Restraint", "One hero effect per chapter. Bloom only where it should glow."],
  ["60fps is aesthetic", "Adaptive quality, capped DPR, instancing, a designed mobile variant."],
  ["Look at it", "12 screenshots × 3 viewports, three polish passes, a 100-point score."],
];

export const PHASES: { n: string; t: string; d: string; out: string }[] = [
  { n: "00", t: "Intake", d: "Subject, audience, the one emotion, the single conversion. Ask at most five questions — then decide.", out: "one-sentence project" },
  { n: "01", t: "Concept", d: "Find the world metaphor. Run the authorship test: could a competitor paste this on their site?", out: "AURA_BRIEF.md" },
  { n: "02", t: "Storyboard", d: "5–9 chapters with scroll ranges, shots, lenses, copy, type treatments and transitions. At least one hold.", out: "STORYBOARD.md" },
  { n: "03", t: "Assets", d: "Procedural, generated-image 2.5D, GLB or frame-sequence — with the prompts and a 12 MB budget.", out: "ASSETS.md" },
  { n: "04", t: "Scaffold", d: "Drop in the starter engine. Confirm the reference scene scrubs at 60fps before touching anything.", out: "running dev server" },
  { n: "05", t: "Build the world", d: "Blockout → light → materials → atmosphere → type → grade → interaction → conversion. In that order.", out: "the film" },
  { n: "06", t: "Polish ×3", d: "Motion pass, image pass, detail pass. Kill every flat frame.", out: "3 passes logged" },
  { n: "07", t: "QA gate", d: "Playwright screenshots, FPS, fallbacks, reduced motion, mobile. Ship only at ≥ 85 / 100.", out: "Aura Score" },
];

export const PILLARS: { k: string; t: string; d: string; pts: number }[] = [
  { k: "A", t: "Atmosphere", d: "Light, air, matter and depth you could almost touch.", pts: 25 },
  { k: "U", t: "Unbroken", d: "One continuous camera through one continuous world.", pts: 20 },
  { k: "R", t: "Rhythm", d: "Crescendo, hold, release. Silence is a design element.", pts: 20 },
  { k: "A", t: "Authorship", d: "A point of view nothing else could wear.", pts: 20 },
];

export const ARCHETYPES: { id: string; t: string; world: string; arc: string[]; hold: string }[] = [
  { id: "product", t: "Product launch", world: "Earbuds resting on a cratered asteroid in cold starlight — silence made physical.", arc: ["Silhouette in dark", "Material macro", "Exploded anatomy", "In-world use", "Spec counters", "Hero orbit + CTA"], hold: "The slow 90° orbit with a specular sweep." },
  { id: "portfolio", t: "Portfolio", world: "An observatory — each project is a constellation the telescope turns toward.", arc: ["Name as giant type", "Enter the door", "One room per project", "Skills as light", "Contact = the exit"], hold: "Each project plate, floating in depth." },
  { id: "estate", t: "Real estate", world: "Dusk arrival: the estate’s name reflected in still alpine water as windows ignite one by one.", arc: ["Aerial at dusk", "Descend to water", "Name behind the house", "Threshold", "Interior glide", "Reserve"], hold: "The lit-windows tableau with reflection." },
  { id: "brand", t: "Brand / studio", world: "A manifesto in motion — the camera tunnels through liquid chrome; every line is giant type.", arc: ["Cold open", "Manifesto beats", "Case studies drift by", "Bold end-card"], hold: "One long silent beat mid-tunnel." },
  { id: "game", t: "Game / film", world: "The trailer as a website: cold open, title slam, faction worlds, whip-pan montage, release date.", arc: ["Black + embers", "Title slam", "World vista", "Faction beats", "Montage", "Final shot"], hold: "The title reveal." },
  { id: "saas", t: "SaaS / AI", world: "The product as a place — real UI planes floating in depth, data as light trails.", arc: ["UI planes in depth", "Feature = glide", "Plane activates", "Fly through → CTA"], hold: "Each activated plane." },
  { id: "food", t: "Restaurant", world: "Appetite: steam in darkness, macro, a scrubbed slow-motion pour, the table at golden hour.", arc: ["Steam + embers", "Macro ingredient", "Heat shimmer", "Pour (frame sequence)", "The table", "Reserve"], hold: "The pour, frozen mid-air." },
  { id: "event", t: "Event / cause", world: "The date as giant type; a glowing path the camera follows toward the day.", arc: ["Date as giant type", "Path through the map", "One human moment", "Impact numbers", "RSVP"], hold: "The single human photograph." },
];

export const INSTALLS: { id: string; t: string; steps: { label: string; code: string }[] }[] = [
  {
    id: "claude-code",
    t: "Claude Code",
    steps: [
      { label: "1 · Unzip into your skills folder (all projects) — or .claude/skills in one repo", code: "mkdir -p ~/.claude/skills\nunzip aura-3d-web.zip -d ~/.claude/skills/" },
      { label: "2 · Start your session and say", code: "Use the aura-3d-web skill. Build a scroll-driven immersive 3D website for [SUBJECT]." },
    ],
  },
  {
    id: "claude-ai",
    t: "Claude.ai",
    steps: [
      { label: "1 · Upload", code: "Settings → Capabilities → Skills → Upload skill → choose aura-3d-web.zip" },
      { label: "2 · Ask", code: "Use the aura-3d-web skill to build [SUBJECT]. I want them to feel [EMOTION]." },
    ],
  },
  {
    id: "cursor",
    t: "Cursor",
    steps: [
      { label: "1 · Put the folder in your repo", code: "unzip aura-3d-web.zip -d skills/" },
      { label: "2 · Add .cursor/rules/aura.mdc", code: "---\ndescription: Immersive scroll-driven 3D websites (three.js, cinematic camera, WebGL)\nalwaysApply: false\n---\nFor any 3D / immersive / cinematic / scroll-driven website request, read skills/aura-3d-web/SKILL.md first and follow its pipeline exactly." },
    ],
  },
  {
    id: "codex",
    t: "Codex · Gemini · Copilot · Windsurf",
    steps: [
      { label: "1 · Add the folder, then reference it in AGENTS.md (or your tool’s instruction file)", code: "unzip aura-3d-web.zip -d skills/\n\n# AGENTS.md\nFor any 3D / immersive / cinematic / scroll-driven website, read skills/aura-3d-web/SKILL.md first and follow it. Load references/ files just-in-time. Copy starter/src/aura into the project instead of rewriting the engine." },
    ],
  },
  {
    id: "none",
    t: "ChatGPT / any chat",
    steps: [
      { label: "No skills support? Paste the one-file edition (or the compact master prompt) as your first message, then your subject", code: "[paste aura-3d-web.single-file.md]\n\nSUBJECT: …  AUDIENCE: …  FEELING: …  CTA: …" },
    ],
  },
];

export const FAQ: [string, string][] = [
  ["Is this a template?", "No. Templates are one answer to one brief. The skill is a method plus a camera engine — it lets an agent author a new world for every brief: a product, a portfolio, a house, a game, a cause."],
  ["Which agents does it work with?", "Anything that can read files and write code. It is packaged in the open SKILL.md format (Claude Code, Claude.ai), and every other tool gets an AGENTS.md / rules snippet or the one-file edition."],
  ["Do I need 3D models?", "No. The pipeline covers procedural worlds (zero assets), generated hero images turned into 2.5D depth worlds, GLB models and scrubbed video frames — with the exact prompts and compression budgets."],
  ["Will it run on phones?", "Yes — an adaptive-quality governor, pixel-ratio caps, a mobile shot list, reduced-motion and no-WebGL fallbacks are part of the contract, not an afterthought."],
  ["How do I know the output is good?", "The skill makes the agent look at its own work: Playwright captures 12 scroll positions on three viewports, then it critiques them and scores itself on a 100-point rubric. It must reach 85 before it ships."],
  ["Is the engine real?", "Yes. The starter kit is type-checked source — engine, choreography, materials, particles, depth layers, mirror floor and a React shell — about " + SKILL_STATS.engineLines + " lines that come with the download."],
];

/* ── the 12 art directions (mirrors references/11-art-directions.md) ── */
export type Direction = { n: string; name: string; feels: string; best: string; move: string; pal: [string, string, string] };
export const DIRECTIONS: Direction[] = [
  { n: "01", name: "Product Altar", feels: "A flagship launch where the object floats in a hostile, beautiful landscape.", best: "Audio, wearables, devices, bottles", move: "The Exploded Ascent", pal: ["#05070b", "#7dffd9", "#9fb4c8"] },
  { n: "02", name: "Showroom Sweep", feels: "A hypercar reveal. Light is the actor; one highlight travels the body.", best: "Cars, watches, jewellery", move: "The Light Pass", pal: ["#07080a", "#d9b98a", "#8d96a0"] },
  { n: "03", name: "Dusk Arrival", feels: "Giant name, ignited windows, still water. You've already arrived.", best: "Estates, hotels, developments", move: "Windows Ignite", pal: ["#07131f", "#ffb45e", "#cbd5de"] },
  { n: "04", name: "The Instrument", feels: "A machined dial you want to touch; scroll calibrates it.", best: "Nav, audio, fintech, fitness", move: "Calibration", pal: ["#06141b", "#ffa94d", "#2a4350"] },
  { n: "05", name: "Night Walk", feels: "A lantern-lit alley under a blood moon — type between depth layers.", best: "Hospitality, games, culture", move: "Type Between Layers", pal: ["#0b0a14", "#c4202a", "#ffb25e"] },
  { n: "06", name: "Liquid Particles", feels: "A sculpture of light that dissolves, streams and re-forms.", best: "AI, agencies, entertainment", move: "The Dissolve", pal: ["#04060f", "#7f6bff", "#3de7ff"] },
  { n: "07", name: "Observatory Folio", feels: "A portfolio as a place. Every project is a lit room on the rail.", best: "Designers, devs, directors", move: "Project Rooms", pal: ["#0a0c14", "#e0b86a", "#6b88ff"] },
  { n: "08", name: "Void Tunnel", feels: "Velocity. Words fly past as slabs and settle when you stop.", best: "Labels, festivals, manifestos", move: "Velocity Type", pal: ["#050505", "#b6ff3c", "#f2f2f2"] },
  { n: "09", name: "Terrain Epic", feels: "Scale, a character sky, one human landmark.", best: "Expeditions, events, games", move: "Totality", pal: ["#04050c", "#ff7a3a", "#34150a"] },
  { n: "10", name: "Macro Appetite", feels: "Steam, amber light, a scrubbed slow-motion pour.", best: "Food, whisky, fragrance", move: "The Pour", pal: ["#120a05", "#ff9f43", "#f3e3c8"] },
  { n: "11", name: "Interface Cosmos", feels: "The product as a place — real UI floating in depth, data as light.", best: "SaaS, fintech, infrastructure", move: "Plane Activation", pal: ["#050a18", "#4d7cff", "#e8eefc"] },
  { n: "12", name: "Glass Atrium", feels: "LIGHT mode. Frosted glass, caustics, bone white, calm luxury.", best: "Skincare, fashion, clinics, studios", move: "Refraction Reveal", pal: ["#f4efe7", "#9fb39a", "#c58f73"] },
];

export const EXAMPLES: { n: string; name: string; dir: string; prompt: string; move: string }[] = [
  { n: "01", name: "NOCTA", dir: "Product Altar", prompt: "Premium earbuds, dark and cinematic, product is the hero.", move: "Exploded Ascent on an asteroid altar" },
  { n: "02", name: "ARDVALE", dir: "Dusk Arrival", prompt: "Four lakeside Alpine villas. Buyers should feel they've arrived.", move: "Windows ignite; the name mirrored in water" },
  { n: "03", name: "BEARING", dir: "The Instrument", prompt: "An offline compass for sailors. Precise. Trustworthy.", move: "Scroll calibrates a machined dial" },
  { n: "04", name: "TSUKI", dir: "Night Walk", prompt: "A 12-seat ramen and sake house. Make people feel they're walking in.", move: "Letters split between depth layers" },
  { n: "05", name: "ONEIRIC", dir: "Liquid Particles", prompt: "A creative-AI studio. It should feel like the future.", move: "200k points dissolve and re-form" },
  { n: "06", name: "MIRA OKONKWO", dir: "Observatory Folio", prompt: "Product designer, six case studies, memorable in a week.", move: "Each project is a lit room" },
  { n: "07", name: "LUMEN", dir: "Glass Atrium", prompt: "Clinical-luxury serum. Light, airy — absolutely not dark.", move: "Glass slab refracts the headline" },
];
