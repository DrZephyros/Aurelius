import * as THREE from "three";
import { clamp, smoothstep } from "./choreo";

/* ─────────────────────────────────────────────────────────────
   AURA · mood.ts — CHAPTERS CHANGE MOOD, NOT JUST FRAMING.   (v19)

   v18's audit of its own example: "palette stays on one blue; chapters change framing more than mood."
   A mood track is a list of colour stops keyed by the SAME playhead as the camera. Each stop is a chapter's dominant hue + its accent;
   the track dwells on a stop (so the chapter reads as ONE colour) and glides to the next between chapters.

       const mood = createMood([
         { at: 0.0,  bg: 0x03050b, glow: 0x4f86ff, rim: 0x5ea2ff, ring: 0x6fb4ff },   // arrival — cold ink
         { at: 0.5,  bg: 0x0a0503, glow: 0xff7a3d, rim: 0xff9a5c, ring: 0xffb37a },   // detail  — ember
         { at: 1.0,  bg: 0x021412, glow: 0x2fe0c0, rim: 0x7ff2dc, ring: 0xffd08a },   // final   — dawn
       ]);
       // in update(f):
       const m = mood(f.p);               // THREE.Color per key — reused objects, zero allocation
       backGlow.material.color.copy(m.glow);
       (scene.background as THREE.Color).copy(m.bg); (scene.fog as THREE.FogExp2).color.copy(m.bg);

   RULES (they keep it art-directed instead of rainbow):
     · ONE dominant hue per chapter. The accent is its neighbour or its complement, never a third colour.
     · Move the things that are LIGHT (glow, rim, ring emissive, practical, grade split-tone), never the surface albedo of the hero.
     · Keep `bg` within ~8% luminance of the previous stop — a mood change must never read as a flash (the audit's jump-cut rule sees it).
     · `dwell` (0..0.45) = how much of each interval is spent holding the stop. 0.25 means: hold the first 25 %, glide for 50 %, hold the last 25 %.
   ───────────────────────────────────────────────────────────── */

type Hex = number | string;
export type MoodStop<K extends string> = { at: number } & Record<K, Hex>;

export function createMood<K extends string>(stops: MoodStop<K>[], dwell = 0.25) {
  const sorted = stops.slice().sort((a, b) => a.at - b.at);
  const keys = Object.keys(sorted[0]).filter((k) => k !== "at") as K[];
  const cols = sorted.map((s) => ({ at: s.at, c: Object.fromEntries(keys.map((k) => [k, new THREE.Color(s[k] as THREE.ColorRepresentation)])) as Record<K, THREE.Color> }));
  const out = Object.fromEntries(keys.map((k) => [k, new THREE.Color()])) as Record<K, THREE.Color>;
  return (p: number): Record<K, THREE.Color> => {
    const q = clamp(p);
    let i = 0;
    while (i < cols.length - 2 && q > cols[i + 1].at) i++;
    const a = cols[i], b = cols[Math.min(cols.length - 1, i + 1)];
    const span = Math.max(1e-6, b.at - a.at), t = smoothstep(dwell, 1 - dwell, clamp((q - a.at) / span));
    for (const k of keys) out[k].copy(a.c[k]).lerp(b.c[k], t);
    return out;
  };
}

/** The same dwell curve for scalars (bloom, fog density, exposure, grade) that should move with the mood. */
export function moodScalar(stops: { at: number; v: number }[], dwell = 0.25) {
  const s = stops.slice().sort((a, b) => a.at - b.at);
  return (p: number) => {
    const q = clamp(p);
    let i = 0;
    while (i < s.length - 2 && q > s[i + 1].at) i++;
    const a = s[i], b = s[Math.min(s.length - 1, i + 1)];
    return a.v + (b.v - a.v) * smoothstep(dwell, 1 - dwell, clamp((q - a.at) / Math.max(1e-6, b.at - a.at)));
  };
}
