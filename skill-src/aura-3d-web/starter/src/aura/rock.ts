import * as THREE from "three";
import { noiseTexture } from "./materials";

/* ─────────────────────────────────────────────────────────────
   AURA · rock.ts — asteroid / basalt / lunar ground for product altars.
   A displaced plane with craters, a flat polished SHELF in the middle (so the product sits on something),
   a noise roughness map (uniform roughness = CG tell), plus instanced boulders. No assets.
   ───────────────────────────────────────────────────────────── */

const h2 = (x: number, y: number, s: number) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
function vnoise(x: number, y: number, s: number) {
  const xi = Math.floor(x), yi = Math.floor(y), tx = x - xi, ty = y - yi;
  const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  const a = h2(xi, yi, s), b = h2(xi + 1, yi, s), c = h2(xi, yi + 1, s), d = h2(xi + 1, yi + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
export const fbm2 = (x: number, y: number, s = 1, oct = 5) => { let v = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { v += vnoise(x * f, y * f, s + i) * a; a *= 0.5; f *= 2.03; } return v; };

export interface RockGroundOptions { size?: number; segments?: number; height?: number; shelfRadius?: number; color?: THREE.ColorRepresentation; seed?: number; craters?: number }

export function createRockGround(o: RockGroundOptions = {}) {
  const size = o.size ?? 120, seg = o.segments ?? 220, H = o.height ?? 5, SR = o.shelfRadius ?? 4.2, seed = o.seed ?? 3;
  const craters = Array.from({ length: o.craters ?? 14 }, (_, i) => {
    const a = h2(i, 1, seed) * Math.PI * 2, r = 9 + h2(i, 2, seed) * size * 0.4;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, r: 2.5 + h2(i, 3, seed) * 9, d: 0.5 + h2(i, 4, seed) * 1.6 };
  });
  const g = new THREE.PlaneGeometry(size, size, seg, seg);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const heightAt = (x: number, z: number) => {
    let h = (fbm2(x * 0.045, z * 0.045, seed) - 0.5) * H * 2 + (fbm2(x * 0.22, z * 0.22, seed + 9, 4) - 0.5) * H * 0.35;
    for (const c of craters) { // bowl + raised rim
      const d = Math.hypot(x - c.x, z - c.z) / c.r;
      if (d < 1.35) h += d < 1 ? -c.d * (1 - d * d) : c.d * 0.35 * Math.exp(-(((d - 1) * 6) ** 2));
    }
    const dist = Math.hypot(x, z);
    const shelf = 1 - Math.min(1, Math.max(0, (dist - SR) / (SR * 1.6))); // 1 on the shelf → 0 outside
    const k = shelf * shelf * (3 - 2 * shelf);
    return h * (1 - k) - 0.14 * k; // the shelf sits just BELOW y=0 so the altar's top face (y=0) never z-fights the rock
  };
  for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
  g.computeVertexNormals();
  const rough = noiseTexture(512, 6, seed);
  rough.repeat.set(24, 24);
  const bump = noiseTexture(512, 6, seed + 4);
  bump.repeat.set(40, 40);
  const mat = new THREE.MeshStandardMaterial({ color: o.color ?? 0x3b424b, roughness: 1, roughnessMap: rough, bumpMap: bump, bumpScale: 2.2, metalness: 0.15, envMapIntensity: 0.5 });
  const mesh = new THREE.Mesh(g, mat);
  // polished obsidian disc on the shelf: the product's "altar" — glossy enough to catch the strip lights
  const altar = new THREE.Mesh(new THREE.CylinderGeometry(SR * 0.62, SR * 0.66, 0.18, 96), new THREE.MeshPhysicalMaterial({ color: 0x0b0e13, roughness: 0.22, metalness: 0.5, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4 }));
  altar.position.y = -0.09;
  const group = new THREE.Group();
  group.add(mesh, altar);
  return { group, mesh, altar, heightAt };
}

/** Instanced, noise-displaced boulders scattered outside the shelf. One draw call. */
export function createBoulders(o: { count?: number; ground: { heightAt: (x: number, z: number) => number }; inner?: number; outer?: number; color?: THREE.ColorRepresentation; seed?: number } ) {
  const n = o.count ?? 90, seed = o.seed ?? 5, inner = o.inner ?? 9, outer = o.outer ?? 55;
  const geo = new THREE.IcosahedronGeometry(1, 3);
  const p = geo.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const d = 0.72 + fbm2(v.x * 1.7 + 5, v.y * 1.7 + v.z * 1.3, seed, 3) * 0.7; p.setXYZ(i, v.x * d, v.y * d * 0.8, v.z * d); }
  geo.computeVertexNormals();
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: o.color ?? 0x2d333b, roughness: 0.92, metalness: 0.1, envMapIntensity: 0.4 }), n);
  const d = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    const a = h2(i, 7, seed) * Math.PI * 2, r = inner + Math.pow(h2(i, 8, seed), 0.7) * (outer - inner);
    const x = Math.cos(a) * r, z = Math.sin(a) * r, s = 0.4 + Math.pow(h2(i, 9, seed), 2.4) * 5.5;
    d.position.set(x, o.ground.heightAt(x, z) + s * 0.25, z);
    d.rotation.set(h2(i, 10, seed) * 6, h2(i, 11, seed) * 6, 0);
    d.scale.set(s * (0.8 + h2(i, 12, seed) * 0.6), s * 0.8, s);
    d.updateMatrix();
    mesh.setMatrixAt(i, d.matrix);
  }
  return mesh;
}
