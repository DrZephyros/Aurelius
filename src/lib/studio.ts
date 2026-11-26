import { useSyncExternalStore } from "react";
import { ARCHETYPES } from "@/lib/skill";

/* The Skill Studio: one tiny shared store so the home page, the skill page and the site-wide drawer all edit the SAME brief.
   Anything on the site can call openSkill({ subject: "…" }) to open the drawer pre-filled — "make one like this". */

export type StudioMode = "installed" | "link";
export type StudioState = {
  archetype: string;
  subject: string;
  audience: string;
  emotion: string;
  cta: string;
  palette: string;
  length: "short" | "feature" | "epic";
  mode: StudioMode;
};

export const PALETTES: { id: string; t: string; hex: string[]; note: string }[] = [
  { id: "auto", t: "Art-direct it", hex: ["#5cffc4", "#6fb4ff", "#ffd28a"], note: "Agent chooses one dominant hue + one accent that fits the subject." },
  { id: "ember", t: "Ember & bruise", hex: ["#ff8a45", "#34150a", "#04050c"], note: "Warm corona against deep navy-black. Cinematic, solemn." },
  { id: "aurora", t: "Aurora mint", hex: ["#5cffc4", "#3de7ff", "#03050b"], note: "Cold glow, glassy highlights. Technical, calm." },
  { id: "neon", t: "Neon rain", hex: ["#ff3df0", "#35e6ff", "#05060d"], note: "Magenta/cyan signage on wet black. Urban, electric." },
  { id: "bone", t: "Bone & ink", hex: ["#efe9df", "#14130f", "#b3a58a"], note: "Quiet luxury: ivory, ink and one metal. Editorial." },
  { id: "abyss", t: "Abyssal teal", hex: ["#52e6d8", "#02121a", "#0b4a5a"], note: "Deep water light. Mysterious, immersive." },
  { id: "gold", t: "Gold & black", hex: ["#f2c46d", "#0a0a0c", "#fff4d6"], note: "Heirloom, premium, ceremonial." },
];

export const LENGTHS = { short: { vh: "500–600vh", t: "Short film" }, feature: { vh: "800–1000vh", t: "Feature" }, epic: { vh: "1100–1400vh", t: "Epic" } } as const;

export const DEFAULT_STATE: StudioState = {
  archetype: "product",
  subject: "",
  audience: "",
  emotion: "",
  cta: "",
  palette: "auto",
  length: "feature",
  mode: "installed",
};

/* ── prompt composition ─────────────────────────────────────────────────────────────── */
export function composePrompt(s: StudioState, origin = ""): string {
  const a = ARCHETYPES.find((x) => x.id === s.archetype) ?? ARCHETYPES[0];
  const pal = PALETTES.find((p) => p.id === s.palette) ?? PALETTES[0];
  const L = LENGTHS[s.length];
  const subject = s.subject.trim() || `[describe it — a ${a.t.toLowerCase()}]`;
  const lines: string[] = [];
  if (s.mode === "link") {
    lines.push(
      `Before doing anything, fetch and read ${origin || "https://YOUR-SITE"}/skill.md — it is the complete AURA operating manual for building AAA-grade, scroll-driven 3D websites (doctrine, pipeline, engine source, QA gate). Follow it exactly. If you can download ${origin || "https://YOUR-SITE"}/skill.zip, unzip it and use the starter/ engine and scripts/audit.mjs.`,
      "",
    );
  } else {
    lines.push("Use the aura-3d-web skill. Build a scroll-driven, immersive 3D website.", "");
  }
  lines.push(
    `SUBJECT: ${subject}`,
    `ARCHETYPE: ${a.t} — playbook seed: “${a.world}” Arc to riff on (don't copy): ${a.arc.join(" → ")}. Reserve the hold for: ${a.hold}`,
    `AUDIENCE: ${s.audience.trim() || "[who is this for? if blank, infer the most valuable visitor and say so]"}`,
    `THE ONE FEELING: ${s.emotion.trim() || "[decide: awe / hunger / calm / dread / belonging — pick one and design toward it]"}`,
    `FINAL ACTION (one CTA, set INSIDE the last frame): ${s.cta.trim() || "[decide the single conversion]"}`,
    `PALETTE: ${pal.id === "auto" ? pal.note : `${pal.t} — ${pal.hex.join(" / ")}. ${pal.note}`}`,
    `LENGTH: ${L.t}, ${L.vh} of scroll.`,
    `ASSETS: none supplied — art-direct procedurally first (sky, terrain, atmosphere, hero, particles); generate hero plates only if you have image generation.`,
    "",
    "HOW TO WORK (non-negotiable):",
    "1. Decide, don't interrogate me. State your assumptions in one paragraph and build.",
    "2. Run the phases: AURA_BRIEF.md → STORYBOARD.md (≥1 HOLD, wide/close alternation, composed last frame) → ASSETS.md → scaffold the starter engine → blockout → light → materials → atmosphere → type → grade → interaction → conversion.",
    "3. Use the starter helpers (createSky, createDunes, createLightShafts, createHaze, createParticles, fitType…) and study scene.umbra.ts / scene.example.ts as the quality bar.",
    "4. Verify with the machine AND your eyes: run `node scripts/audit.mjs <url>` until there are 0 blockers, then open contact-desktop.png and contact-mobile.png and critique every frame like a harsh art director. At least 3 loops.",
    "5. Ship only at ≥ 85/100 on the Aura score. Final message: one paragraph, how to run it, the shot-list table, the score table, three next steps. Don't dump code in chat.",
  );
  return lines.join("\n");
}

/* ── shared store ───────────────────────────────────────────────────────────────────── */
const KEY = "aurelius:studio:v1";
let state: StudioState = DEFAULT_STATE;
let hydrated = false;
const subs = new Set<() => void>();
let open = false;
const openSubs = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<StudioState>) };
  } catch {
    /* private mode */
  }
}

function emit() {
  subs.forEach((f) => f());
}

export function patchStudio(p: Partial<StudioState>) {
  hydrate();
  state = { ...state, ...p };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  emit();
}

export function useStudio(): StudioState {
  return useSyncExternalStore(
    (f) => {
      hydrate();
      subs.add(f);
      queueMicrotask(f); // pick up the hydrated value after mount
      return () => void subs.delete(f);
    },
    () => (hydrate(), state),
    () => DEFAULT_STATE,
  );
}

export function setDockOpen(v: boolean) {
  open = v;
  openSubs.forEach((f) => f());
}

export function useDockOpen(): boolean {
  return useSyncExternalStore(
    (f) => (openSubs.add(f), () => void openSubs.delete(f)),
    () => open,
    () => false,
  );
}

/** Open the Skill Studio drawer from anywhere, optionally pre-filled. e.g. openSkill({ subject: "A launch site like Aphelion", archetype: "brand" }) */
export function openSkill(preset?: Partial<StudioState>) {
  if (preset) patchStudio(preset);
  setDockOpen(true);
}
