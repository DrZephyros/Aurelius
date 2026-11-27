import type { Grade } from "./contract";

/* ─────────────────────────────────────────────────────────────
   AURA · looks.ts — a LOOK is the part of a world that makes it not look like the other worlds.

   v16 output converged on one look (black room, mirror floor, bloom, dust) because those were the only knobs. A look fixes the things that
   decide that first impression BEFORE geometry: ground treatment, key/sky/ground colours (what chrome and glass reflect), exposure, bloom
   discipline, grade, and the CSS variables for type. Pick one deliberately in Phase 1 (references/18) — and never pick the one the last
   project used. `fingerprint` in the audit report will tell you if you did anyway.
   ───────────────────────────────────────────────────────────── */

export interface Look {
  id: string;
  name: string;
  mode: "dark" | "light";
  /** what the scene sits on. "mirror" is the old default — now ONE option of six, not the only one. */
  ground: "mirror" | "cyclorama" | "water" | "sand" | "void" | "terrain";
  bg: number; fog: [number, number, number];
  sky: number; groundTone: number; key: number; accent: number; ink: number;
  exposure: number;
  bloom: { strength: number; radius: number; threshold: number };
  grade: Grade;
  /** CSS custom properties for aura.css */
  css: Record<string, string>;
}

export const LOOKS: Record<string, Look> = {
  bone: { id: "bone", name: "Bone studio", mode: "light", ground: "cyclorama", bg: 0xe8e2d6, fog: [0xe8e2d6, 34, 110], sky: 0xfff6ea, groundTone: 0x2a211b, key: 0xffffff, accent: 0xa63d17, ink: 0x1c1814, exposure: 1, bloom: { strength: 0.3, radius: 0.6, threshold: 1.7 }, grade: { vignette: 0.32, grain: 0.03, aberration: 0.004, contrast: 1.04, saturation: 1.02, shadows: [0.02, 0.012, 0] },
    css: { "--aura-bg": "#e8e2d6", "--aura-fg": "#1c1814", "--aura-dim": "rgb(28 24 20 / 0.78)", "--aura-accent": "#a63d17", "--aura-scrim": "232 226 214", "--aura-cta-bg": "#1c1814", "--aura-cta-fg": "#f4efe6", "--aura-cta-border": "#1c1814" } },
  noir: { id: "noir", name: "Noir lacquer", mode: "dark", ground: "mirror", bg: 0x03050b, fog: [0x03050b, 14, 60], sky: 0x1a2438, groundTone: 0x020308, key: 0xdbe8ff, accent: 0x7fd6ff, ink: 0xeef3f7, exposure: 1, bloom: { strength: 0.7, radius: 0.7, threshold: 0.85 }, grade: { vignette: 0.65, grain: 0.045, aberration: 0.018, shadows: [0, 0.02, 0.06], highlights: [0.06, 0.03, 0] }, css: {} },
  tide: { id: "tide", name: "Deep water", mode: "dark", ground: "water", bg: 0x041a22, fog: [0x041a22, 6, 40], sky: 0x0e5a66, groundTone: 0x01090c, key: 0x9ff3e0, accent: 0x5ff0c8, ink: 0xe6fff8, exposure: 1.05, bloom: { strength: 0.9, radius: 0.9, threshold: 0.7 }, grade: { vignette: 0.55, grain: 0.05, saturation: 1.1, shadows: [0, 0.03, 0.04] }, css: { "--aura-bg": "#041a22", "--aura-accent": "#5ff0c8", "--aura-scrim": "4 26 34" } },
  dune: { id: "dune", name: "Golden hour dune", mode: "light", ground: "sand", bg: 0xf0d9b5, fog: [0xf0d9b5, 20, 90], sky: 0xffe9c4, groundTone: 0x6b4423, key: 0xfff0d0, accent: 0xc2410c, ink: 0x2a1a0e, exposure: 1.1, bloom: { strength: 0.35, radius: 0.8, threshold: 1.4 }, grade: { vignette: 0.4, grain: 0.04, contrast: 1.06, highlights: [0.05, 0.02, 0] },
    css: { "--aura-bg": "#f0d9b5", "--aura-fg": "#2a1a0e", "--aura-dim": "rgb(42 26 14 / 0.8)", "--aura-accent": "#9a3412", "--aura-scrim": "240 217 181", "--aura-cta-bg": "#2a1a0e", "--aura-cta-fg": "#fbeed6", "--aura-cta-border": "#2a1a0e" } },
  acid: { id: "acid", name: "Acid chrome void", mode: "dark", ground: "void", bg: 0x07070a, fog: [0x07070a, 30, 120], sky: 0x2b0a5e, groundTone: 0x000000, key: 0xc6ff3d, accent: 0xc6ff3d, ink: 0xf6ffe0, exposure: 0.95, bloom: { strength: 0.55, radius: 0.5, threshold: 1.1 }, grade: { vignette: 0.5, grain: 0.06, aberration: 0.03, saturation: 1.2, contrast: 1.1 }, css: { "--aura-bg": "#07070a", "--aura-accent": "#c6ff3d", "--aura-scrim": "7 7 10" } },
  paper: { id: "paper", name: "Cold paper", mode: "light", ground: "void", bg: 0xf3f4f6, fog: [0xf3f4f6, 40, 140], sky: 0xffffff, groundTone: 0x8a93a3, key: 0xffffff, accent: 0x1d4ed8, ink: 0x0b1020, exposure: 1, bloom: { strength: 0.15, radius: 0.5, threshold: 2 }, grade: { vignette: 0.18, grain: 0.02, saturation: 0.95 },
    css: { "--aura-bg": "#f3f4f6", "--aura-fg": "#0b1020", "--aura-dim": "rgb(11 16 32 / 0.78)", "--aura-accent": "#1d4ed8", "--aura-scrim": "243 244 246", "--aura-cta-bg": "#0b1020", "--aura-cta-fg": "#f3f4f6", "--aura-cta-border": "#0b1020" } },
};

/** apply a look's CSS variables to the experience root (call once in an effect) */
export function applyLookCss(el: HTMLElement, look: Look) { for (const [k, v] of Object.entries(look.css)) el.style.setProperty(k, v); }
