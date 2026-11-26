import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   AURA · studio.ts — product-render lighting.
   The #1 reason web 3D looks cheap is the environment map. This builds a *designed* one: a dark room with
   long softbox strips whose reflections draw the luxury highlight lines down curved surfaces.
   ───────────────────────────────────────────────────────────── */

type Col = THREE.ColorRepresentation;
export interface StripSpec { color: Col; intensity: number; pos: [number, number, number]; size: [number, number] }

const DEFAULT_STRIPS: StripSpec[] = [
  { color: 0xdbe8ff, intensity: 3.2, pos: [-9, 5, 3], size: [1.2, 12] },   // tall cool strip, camera-left → vertical highlight line
  { color: 0xfff1e0, intensity: 2.2, pos: [9, 6, -2], size: [1.6, 10] },   // warm strip, right
  { color: 0xffffff, intensity: 1.8, pos: [0, 11, 0], size: [12, 2.2] },   // top bar → horizon highlight on flat tops
  { color: 0xffffff, intensity: 1.0, pos: [0, 2, -11], size: [14, 3] },  // back wall glow for rim
];

/** A PMREM environment from a procedural softbox room. Assign to scene.environment (and tune scene.environmentIntensity). */
export function createStudioEnv(renderer: THREE.WebGLRenderer, o: { base?: Col; baseIntensity?: number; strips?: StripSpec[]; accent?: StripSpec } = {}) {
  const room = new THREE.Scene();
  const base = new THREE.Color(o.base ?? 0x05070b).multiplyScalar(o.baseIntensity ?? 1);
  room.add(new THREE.Mesh(new THREE.BoxGeometry(30, 24, 30), new THREE.MeshBasicMaterial({ color: base, side: THREE.BackSide })));
  const mats: THREE.Material[] = [];
  [...(o.strips ?? DEFAULT_STRIPS), ...(o.accent ? [o.accent] : [])].forEach((s) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color).multiplyScalar(s.intensity), side: THREE.DoubleSide });
    mats.push(m);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(s.size[0], s.size[1]), m);
    p.position.set(...s.pos);
    p.lookAt(0, 0, 0);
    room.add(p);
  });
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(room, 0.02).texture;
  pm.dispose();
  room.traverse((c) => { if (c instanceof THREE.Mesh) c.geometry.dispose(); });
  mats.forEach((m) => m.dispose());
  return tex;
}

/** Key / rim / kicker / fill for a hero product. Position is relative to the product at the origin. */
export function productRig(o: { key?: Col; rim?: Col; kicker?: Col; accent?: Col } = {}) {
  const group = new THREE.Group();
  const key = new THREE.SpotLight(o.key ?? 0xe4ecf8, 70, 40, 0.3, 1, 1.6);
  key.position.set(-9, 3.5, 7);
  const rim = new THREE.DirectionalLight(o.rim ?? 0xcfe6ff, 5.5);
  rim.position.set(7, 6, -9);
  const kicker = new THREE.DirectionalLight(o.kicker ?? 0xffffff, 1.4);
  kicker.position.set(2, 1.2, 9);
  const fill = new THREE.HemisphereLight(0x1a2438, 0x05070b, 0.35);
  const accent = new THREE.PointLight(o.accent ?? 0x7dffd9, 0, 7, 2);
  group.add(key, key.target, rim, kicker, fill, accent);
  return { group, key, rim, kicker, fill, accent };
}

/** Soft blurred disc under an object — without it, things float. */
export function createContactShadow(radius = 2.4, opacity = 0.75) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0, `rgba(0,0,0,${opacity})`);
  rg.addColorStop(0.55, `rgba(0,0,0,${opacity * 0.45})`);
  rg.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.012;
  return m;
}
