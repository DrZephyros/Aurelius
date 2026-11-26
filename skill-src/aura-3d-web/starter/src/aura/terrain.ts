import * as THREE from "three";
import { noiseTexture } from "./materials";

/* ─────────────────────────────────────────────────────────────
   AURA · terrain.ts — procedural ground you can fly over. Zero assets.

   createDunes()  wind-sculpted ridged dunes (grazing light makes them read as sand), with a micro-ripple normal map,
                  a CPU heightAt(x, z) so the camera rail / props can sit ON the surface, and an optional winding "road"
                  trench so the camera has somewhere to go.
   Swap the height function (`shape`) for mountains, snow fields, lava crust, ocean swell, moon regolith.
   ───────────────────────────────────────────────────────────── */

const hash = (x: number, y: number, s: number) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
const vnoise = (x: number, y: number, s: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), tx = x - xi, ty = y - yi;
  const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
};
const ridged = (x: number, y: number, s: number) => {
  let v = 0, amp = 0.55, f = 1;
  for (let i = 0; i < 4; i++) { v += (1 - Math.abs(vnoise(x * f, y * f, s + i) * 2 - 1)) * amp; amp *= 0.46; f *= 2.05; }
  return v;
};

export interface DunesOptions {
  size?: number;
  segments?: number;
  height?: number;
  /** horizontal scale of the dune field (bigger = broader dunes) */ scale?: number;
  seed?: number;
  color?: THREE.ColorRepresentation;
  /** carve a gentle winding valley along z so the camera path stays low and cinematic */ valley?: { width: number; sway: number } | false;
  /** tint of the grazing-light sheen (the rim of each dune crest) */ sheen?: THREE.ColorRepresentation;
}

export function createDunes(o: DunesOptions = {}) {
  const size = o.size ?? 420, seg = o.segments ?? 220, H = o.height ?? 9, sc = o.scale ?? 0.011, seed = o.seed ?? 3;
  const valley = o.valley === false ? null : o.valley ?? { width: 14, sway: 12 };
  const valleyX = (z: number) => (valley ? Math.sin(z * 0.035) * valley.sway : 0);

  const heightAt = (x: number, z: number) => {
    // domain-warp so crests meander instead of running in straight lines
    const wx = x + (vnoise(x * sc * 2, z * sc * 2, seed + 9) - 0.5) * 60;
    const wz = z + (vnoise(z * sc * 2, x * sc * 2, seed + 5) - 0.5) * 60;
    let h = ridged(wx * sc, wz * sc * 1.6, seed) * H;
    if (valley) {
      const d = Math.abs(x - valleyX(z)) / valley.width;
      h *= 0.12 + 0.88 * Math.min(1, d * d); // flatten toward the valley floor
    }
    return h - H * 0.35;
  };

  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();

  const ripple = noiseTexture(256, 3, seed);
  ripple.repeat.set(40, 40);
  const mat = new THREE.MeshPhysicalMaterial({
    color: o.color ?? 0x2a1a14,
    roughness: 0.92,
    metalness: 0,
    sheen: 0.6,
    sheenColor: new THREE.Color(o.sheen ?? 0xff8a4a),
    sheenRoughness: 0.35,
    bumpMap: ripple,
    bumpScale: 0.55,
    
    envMapIntensity: 0.4,
  });
  const mesh = new THREE.Mesh(geo, mat);
  return { mesh, material: mat, heightAt, valleyX };
}
