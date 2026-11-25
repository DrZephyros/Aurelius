import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

/* ─────────────────────────────────────────────────────────────
   AURA · floor.ts — the reflective floor (wet obsidian, still water, polished showroom).
   Reflection is the single cheapest "this is expensive" signal. It also doubles the draw cost,
   so: gate on quality, keep resolution at 0.5 and fade it into the distance with the overlay.
   ───────────────────────────────────────────────────────────── */

export function createMirrorFloor(o: { size?: number; y?: number; color?: THREE.ColorRepresentation; resolution?: number; fadeColor?: THREE.ColorRepresentation } = {}) {
  const size = o.size ?? 240;
  const res = o.resolution ?? 0.5;
  const g = new THREE.Group();
  const mirror = new Reflector(new THREE.PlaneGeometry(size, size), {
    color: new THREE.Color(o.color ?? 0x2a2f3a), // < 1 darkens the reflection so it reads as a surface, not a second world
    textureWidth: Math.round(innerWidth * res),
    textureHeight: Math.round(innerHeight * res),
    clipBias: 0.003,
  });
  mirror.rotation.x = -Math.PI / 2;
  g.add(mirror);

  // radial fade: the floor dissolves into the fog instead of ending at a hard edge
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const grd = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
  const fc = new THREE.Color(o.fadeColor ?? 0x03050b);
  const rgb = `${Math.round(fc.r * 255)},${Math.round(fc.g * 255)},${Math.round(fc.b * 255)}`;
  grd.addColorStop(0, `rgba(${rgb},0)`);
  grd.addColorStop(0.35, `rgba(${rgb},0.25)`);
  grd.addColorStop(1, `rgba(${rgb},1)`);
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const fade = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  fade.rotation.x = -Math.PI / 2;
  fade.position.y = 0.01;
  g.add(fade);

  g.position.y = o.y ?? 0;
  return { group: g, mirror, setEnabled: (on: boolean) => { mirror.visible = on; } };
}
