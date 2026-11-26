import * as THREE from "three";
import type { AuraScene, BuildContext, Frame, Shot, V3 } from "./engine";
import { createParticles } from "./particles";
import { ease, seg } from "./choreo";

/* ─────────────────────────────────────────────────────────────
   AURA · scene.folio.ts — "Mira". World #4 — a FOLIO (portfolio / studio / personal brand).
   Archetype: EDITORIAL GALLERY IN DEPTH. Where the other worlds are *places*, a folio is a *sequence of proofs*:
   each project gets a plate, a hold, a name — and the camera climbs a helix from one to the next.
   Concept:   six projects as luminous plates on a spiral around a spine of light; the active plate ignites, the rest sleep.
   Palette:   ink (dominant) · one electric accent per project, picked from the work · bone type
   Lighting:  the plates ARE the light (emissive faces + one travelling accent point light) over an ink floor that mirrors them.
   Rhythm:    wide → arrive → HOLD (read the work) → climb → … → pull back to see the whole spiral → final frame + CTA.
   Replace PROJECTS (title / hue / kind) — and, for real work, swap plateTexture() for loadTexture("/work/x.jpg"). Never ship the fake UI.
   ───────────────────────────────────────────────────────────── */

export const PROJECTS = [
  { title: "Halcyon", kind: "Brand system", hue: 168 },
  { title: "Ferro", kind: "E-commerce", hue: 28 },
  { title: "Lumen", kind: "Mobile app", hue: 212 },
  { title: "Oriel", kind: "Editorial", hue: 330 },
  { title: "Vanta", kind: "Campaign", hue: 268 },
  { title: "Nine", kind: "Data product", hue: 48 },
] as const;

const N = PROJECTS.length, R = 7.2, RISE = 3.1, TURN = 1.02;
const ang = (i: number) => i * TURN;
const plateAt = (i: number): V3 => [Math.cos(ang(i)) * R, 1.6 + i * RISE, Math.sin(ang(i)) * R];
/** playhead position where project i is centred (and held) */
export const folioAt = (i: number) => 0.1 + (i / (N - 1)) * 0.68;

/** A believable fake UI screen, drawn to a canvas. (Stand-in only — your real work goes here.) */
function plateTexture(i: number): THREE.CanvasTexture {
  const W = 1280, H = 800, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!, hue = PROJECTS[i].hue;
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, `hsl(${hue} 55% 9%)`); bg.addColorStop(1, `hsl(${hue + 30} 60% 17%)`);
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W * 0.78, H * 0.3, 0, W * 0.78, H * 0.3, W * 0.5);
  glow.addColorStop(0, `hsla(${hue} 100% 62% / .55)`); glow.addColorStop(1, "transparent");
  g.fillStyle = glow; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(0, 0, W, 64);
  [0, 1, 2].forEach((k) => { g.fillStyle = `rgba(255,255,255,${0.35 - k * 0.1})`; g.beginPath(); g.arc(34 + k * 26, 32, 7, 0, 7); g.fill(); });
  g.fillStyle = "#f4f1ea"; g.font = "700 150px 'Space Grotesk Variable','Space Grotesk',system-ui,sans-serif";
  g.fillText(PROJECTS[i].title, 70, 330);
  g.fillStyle = `hsl(${hue} 100% 70%)`; g.font = "500 30px 'JetBrains Mono',monospace";
  g.fillText(`${String(i + 1).padStart(2, "0")} — ${PROJECTS[i].kind.toUpperCase()}`, 74, 400);
  for (let k = 0; k < 3; k++) {
    const x = 70 + k * 392; g.fillStyle = "rgba(255,255,255,.07)"; g.beginPath(); g.roundRect(x, 470, 360, 250, 22); g.fill();
    g.fillStyle = `hsla(${hue + k * 18} 100% 66% / .85)`; for (let b = 0; b < 7; b++) g.fillRect(x + 30 + b * 44, 690 - ((b * 37 + k * 53 + i * 19) % 150) - 30, 26, ((b * 37 + k * 53 + i * 19) % 150) + 30);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function folio({ env, mobile }: BuildContext): AuraScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060a);
  scene.fog = new THREE.FogExp2(0x05060a, mobile ? 0.026 : 0.02);
  scene.environment = env;
  scene.environmentIntensity = 0.3;

  // ── floor: ink that mirrors the plates (cheap: a glossy env-lit disc, no second render)
  const floor = new THREE.Mesh(new THREE.CircleGeometry(90, 64), new THREE.MeshStandardMaterial({ color: 0x07080d, roughness: 0.22, metalness: 0.85 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.2; scene.add(floor);

  // ── spine of light + rings at every plate height
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, N * RISE + 8, 12), new THREE.MeshBasicMaterial({ color: 0xbfe9ff }));
  spine.position.y = (N * RISE) / 2; scene.add(spine);
  const rings: THREE.Mesh[] = [];
  const plates: { grp: THREE.Group; face: THREE.Mesh; mat: THREE.MeshBasicMaterial; edge: THREE.LineSegments }[] = [];
  PROJECTS.forEach((pr, i) => {
    const [x, y, z] = plateAt(i);
    const col = new THREE.Color().setHSL(pr.hue / 360, 1, 0.62);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.012, 6, 120), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = y; scene.add(ring); rings.push(ring);

    const grp = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ map: plateTexture(i), toneMapped: false });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), mat);
    const body = new THREE.Mesh(new THREE.BoxGeometry(6.6, 4.2, 0.16), new THREE.MeshStandardMaterial({ color: 0x0a0c12, roughness: 0.3, metalness: 0.9 }));
    body.position.z = -0.1;
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(6.6, 4.2, 0.16)), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.5 }));
    edge.position.z = -0.1;
    grp.add(body, face, edge);
    grp.position.set(x, y, z); grp.rotation.y = Math.PI / 2 - ang(i);
    scene.add(grp);
    plates.push({ grp, face, mat, edge });
    // a tether from the spine, so the plates read as hung in space, not floating props
    const tether = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, R, 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.4 }));
    tether.position.set(x / 2, y, z / 2); tether.rotation.z = Math.PI / 2; tether.rotation.y = -ang(i); scene.add(tether);
  });

  // ── light: one accent point light travels with the active project
  scene.add(new THREE.HemisphereLight(0x8aa0ff, 0x05060a, 0.25));
  const accent = new THREE.PointLight(0xffffff, 0, 40, 1.6);
  scene.add(accent);

  // ── depth planes: dust close to the lens (foreground) + far motes (atmosphere)
  const dust = createParticles({ count: mobile ? 500 : 1100, size: 0.05, color: 0xcfe6ff, extent: [34, 40, 34], opacity: 0.6 });
  dust.points.position.y = 14; scene.add(dust.points);
  const motes = createParticles({ count: mobile ? 60 : 140, size: 0.12, color: 0xffffff, extent: [10, 6, 10], opacity: 0.8 });
  scene.add(motes.points);

  // ── the shot list: wide → [arrive, HOLD] × 6 → pull back → final
  const shots: Shot[] = [{ at: 0, pos: [R * 2.6, 3.5, R * 1.1], look: [0, 6, 0], fov: 42 }];
  PROJECTS.forEach((_, i) => {
    const [x, y, z] = plateAt(i), a = ang(i), ox = Math.cos(a), oz = Math.sin(a), tx = -Math.sin(a), tz = Math.cos(a);
    const d = mobile ? 16 : 12.4, at = folioAt(i);   // distance tuned so the plate fills ~70% of frame height at fov 30
    shots.push({ at: at - 0.035, pos: [x + ox * d + tx * 2.2, y + 0.5, z + oz * d + tz * 2.2], look: [x, y, z], fov: 30, ease: "inOut" });
    shots.push({ at: at + 0.035, pos: [x + ox * d + tx * 2.08, y + 0.5, z + oz * d + tz * 2.08], look: [x, y, z], fov: 30, ease: "inOut" }); // HOLD — the camera all but stops while the work is read
  });
  // pull back to see the whole spiral, then HOLD the final image (the CTA lives on it)
  const cy = (N * RISE) / 2 + 1.6, far: V3 = mobile ? [-22, cy + 2, 20] : [-16, cy + 1, 14.5];
  shots.push({ at: 0.93, pos: far, look: [0, cy, 0], fov: mobile ? 56 : 50, ease: "inOut" });
  shots.push({ at: 1, pos: [far[0] - 0.4, far[1], far[2] + 0.3], look: [0, cy, 0], fov: mobile ? 56 : 50 });

  const tmp = new THREE.Color();
  return {
    scene, shots, exposure: 1.0, parallax: 0.6,
    bloom: { strength: 0.42, radius: 0.7, threshold: 0.82 },
    grade: { vignette: 0.7, grain: 0.05, contrast: 1.08, saturation: 1.08, shadows: [0.0, 0.01, 0.04] },
    update(f: Frame) {
      const { p, time: t } = f;
      let nearest = 0, best = 9;
      plates.forEach((pl, i) => {
        const dp = Math.abs(p - folioAt(i)), focus = 1 - Math.min(1, dp / 0.11), e = ease.inOutCubic(focus);
        if (dp < best) { best = dp; nearest = i; }
        pl.mat.color.setScalar(0.28 + 0.72 * e);                 // sleeping plates dim, the active one ignites
        (pl.edge.material as THREE.LineBasicMaterial).opacity = 0.2 + 0.7 * e;
        (rings[i].material as THREE.MeshBasicMaterial).opacity = 0.12 + 0.5 * e;
        pl.grp.scale.setScalar(0.94 + 0.06 * e + Math.sin(t * 0.6 + i) * 0.004);
        pl.grp.position.y = plateAt(i)[1] + Math.sin(t * 0.5 + i * 1.7) * 0.06;
      });
      // the travelling accent light sits just in front of the active plate
      const [x, y, z] = plateAt(nearest), a = ang(nearest);
      tmp.setHSL(PROJECTS[nearest].hue / 360, 1, 0.6);
      accent.color.lerp(tmp, 0.08);
      accent.position.lerp(new THREE.Vector3(x + Math.cos(a) * 3.2, y + 0.4, z + Math.sin(a) * 3.2), 0.1);
      accent.intensity = 28 + 10 * Math.sin(t * 1.3);
      (spine.material as THREE.MeshBasicMaterial).color.lerp(tmp, 0.04);
      spine.scale.x = spine.scale.z = 1 + 1.4 * ease.inOutSine(seg(p, 0.82, 0.95));
      dust.update(t, f.velocity);
      motes.points.position.lerp(f.camera.position, 0.08);       // lags the lens → foreground parallax plane
      motes.update(t, f.velocity);
    },
  };
}
