import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { chrome, emissive, noiseTexture, obsidian } from "./materials";

/* ─────────────────────────────────────────────────────────────
   AURA · objects.ts — procedural HERO OBJECTS. Hard-surface products built from primitives, with bevels (highlights live
   on bevels), varied roughness and an emissive detail. Restyle the colours / proportions and you have a different product.
     earbuds()  — charging case + two buds + internals, with an explode/ascent part list
     dial()     — machined instrument dial: knurled bezel, engraved face, glass dome, lit ticks, spring needle
     bottle()   — glass serum / fragrance bottle with a liquid column and a metal cap
   Everything faces +Z and sits on y = 0 so you can drop it on a plinth.
   ───────────────────────────────────────────────────────────── */

type Col = THREE.ColorRepresentation;

export interface ExplodePart { name: string; obj: THREE.Object3D; rest: THREE.Vector3; /** how far it rises in the explode chapter */ lift: number; /** extra sideways travel */ spreadX?: number }

export function earbuds(o: { body?: Col; accent?: Col } = {}) {
  const accent = new THREE.Color(o.accent ?? 0x7dffd9);
  const lacquer = obsidian(o.body ?? 0x0d1015);
  Object.assign(lacquer, { roughness: 0.2, metalness: 0.35, envMapIntensity: 1.1, sheen: 0 }); // sheen off: obsidian()'s blue sheen would tint graphite blue
  const rough = noiseTexture(256, 4, 2); rough.repeat.set(3, 3);
  const satin = new THREE.MeshPhysicalMaterial({ color: 0x1a1e25, metalness: 0.85, roughness: 0.38, roughnessMap: rough, envMapIntensity: 1.3, clearcoat: 0.3 });
  const rubber = new THREE.MeshPhysicalMaterial({ color: 0x14171c, roughness: 0.72, sheen: 0.7, sheenColor: new THREE.Color(0x8ea0b8), sheenRoughness: 0.5 });
  const ledMat = emissive(accent, 2.5);

  const group = new THREE.Group();
  const parts: ExplodePart[] = [];
  const add = (name: string, obj: THREE.Object3D, lift: number, spreadX = 0) => { group.add(obj); parts.push({ name, obj, rest: obj.position.clone(), lift, spreadX }); return obj; };

  // base shell
  const base = new THREE.Mesh(new RoundedBoxGeometry(2.9, 0.82, 1.7, 8, 0.3), lacquer); base.position.y = 0.41;
  const wells = new THREE.Group();
  [-0.72, 0.72].forEach((x) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.46, 0.04, 48), new THREE.MeshStandardMaterial({ color: 0x020305, roughness: 0.9 })); w.position.set(x, 0.835, 0); wells.add(w); });
  base.add(wells); wells.position.y = -0.41;
  const led = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.34, 6, 12), ledMat); led.rotation.z = Math.PI / 2; led.position.set(0, 0.42, 0.855);
  base.add(led); led.position.y = 0.01;
  add("base", base, 0);

  // internals (revealed in the explode chapter)
  const battery = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.2, 1.05, 4, 0.07), satin); battery.position.y = 0.45;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.005, 0.12), emissive(accent, 1.6)); stripe.position.y = 0.105; battery.add(stripe);
  add("battery", battery, 1.15);
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 1.3), new THREE.MeshStandardMaterial({ color: 0x07110f, roughness: 0.5, metalness: 0.4 })); pcb.position.y = 0.62;
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.14 + (i % 3) * 0.08, 0.04, 0.1 + (i % 2) * 0.08), chrome(0xd7b46a, 0.3)); c.position.set(-0.9 + i * 0.22, 0.045, ((i * 37) % 7) / 7 * 0.7 - 0.35); pcb.add(c); }
  const chip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: 0x050607, roughness: 0.3 })); chip.position.set(0.3, 0.05, 0); pcb.add(chip);
  add("pcb", pcb, 2.1);

  // the buds
  const bud = (side: number) => {
    const g = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 32), lacquer); head.scale.set(1, 0.9, 1.1);
    const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.62, 10, 20), lacquer); stem.position.set(0, -0.36, 0.1); stem.rotation.x = -0.18;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 24), rubber); tip.position.set(side * 0.2, 0.14, -0.3); tip.scale.set(1, 0.9, 1.1);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 12, 48), chrome(0xc9d3dd, 0.18)); ring.position.set(0, 0.05, 0.28); ring.rotation.x = Math.PI / 2 - 0.4;
    const mic = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), ledMat); mic.position.set(0, -0.62, 0.22); mic.rotation.y = Math.PI;
    g.add(head, stem, tip, ring, mic);
    g.position.set(side * 0.72, 1.02, 0); g.rotation.z = -side * 0.08;
    return g;
  };
  add("budL", bud(-1), 3.0, -0.5);
  add("budR", bud(1), 3.0, 0.5);

  // lid on a hinge at the back edge
  const hinge = new THREE.Group(); hinge.position.set(0, 0.8, -0.85);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(2.9, 0.56, 1.7, 8, 0.27), lacquer); lid.position.set(0, 0.26, 0.85);
  const logo = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 8, 40), chrome(0xe6edf3, 0.15)); logo.position.set(0, 0.545, 0.85); logo.rotation.x = Math.PI / 2; lid.add(logo);
  hinge.add(lid);
  add("lid", hinge, 4.4);

  const setOpen = (t: number) => { hinge.rotation.x = -t * 1.95; };
  const setLed = (i: number) => { ledMat.emissiveIntensity = i; };
  return { group, parts, led, ledMat, setOpen, setLed, lid: hinge, bounds: { w: 2.9, h: 1.36, d: 1.7 } };
}

export function dial(o: { bezel?: Col; needle?: Col; ticks?: number; faceColor?: string } = {}) {
  const N = o.ticks ?? 120;
  const amber = new THREE.Color(o.needle ?? 0xffa94d);
  const group = new THREE.Group();
  const face = new THREE.Group(); // everything that spins with the ring lives here
  const flip = new THREE.Group(); flip.rotation.x = Math.PI / 2; // lathe axis (Y) → +Z

  const profile = [[0.0, 0], [1.02, 0], [1.1, 0.025], [1.14, 0.1], [1.12, 0.17], [1.04, 0.2], [0.95, 0.19], [0.93, 0.1], [0.0, 0.1]].map(([x, y]) => new THREE.Vector2(x, y));
  const bezel = new THREE.Mesh(new THREE.LatheGeometry(profile, 128), chrome(o.bezel ?? 0x8a949f, 0.24));
  flip.add(bezel);
  const knurl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.028, 0.12, 0.05), chrome(0x9aa4af, 0.35), 160);
  const d = new THREE.Object3D();
  for (let i = 0; i < 160; i++) { const a = (i / 160) * Math.PI * 2; d.position.set(Math.cos(a) * 1.135, 0.1, Math.sin(a) * 1.135); d.rotation.set(0, -a, 0); d.updateMatrix(); knurl.setMatrixAt(i, d.matrix); }
  flip.add(knurl);
  group.add(flip);

  // engraved face texture
  const c = document.createElement("canvas"); c.width = c.height = 1024;
  const g = c.getContext("2d")!;
  g.fillStyle = o.faceColor ?? "#071a22"; g.fillRect(0, 0, 1024, 1024);
  const gr = g.createRadialGradient(512, 512, 40, 512, 512, 520); gr.addColorStop(0, "rgba(255,255,255,0.07)"); gr.addColorStop(1, "rgba(0,0,0,0.5)"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  g.translate(512, 512); g.strokeStyle = "rgba(232,238,242,0.8)"; g.fillStyle = "rgba(232,238,242,0.85)"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "500 34px 'JetBrains Mono', monospace";
  for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2, major = i % 6 === 0; g.lineWidth = major ? 4 : 2; g.beginPath(); g.moveTo(Math.sin(a) * (major ? 360 : 380), -Math.cos(a) * (major ? 360 : 380)); g.lineTo(Math.sin(a) * 405, -Math.cos(a) * 405); g.stroke(); }
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, lab = i === 0 ? "N" : i === 3 ? "E" : i === 6 ? "S" : i === 9 ? "W" : String(i * 30); g.fillText(lab, Math.sin(a) * 320, -Math.cos(a) * 320); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const plate = new THREE.Mesh(new THREE.CircleGeometry(0.93, 96), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.2 }));
  plate.position.z = 0.1;
  group.add(plate);

  // lit tick ring (instanced; per-instance colour = lit/unlit)
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.012, 0.075, 0.012), new THREE.MeshBasicMaterial({ color: 0xffffff }), N);
  for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2; d.position.set(Math.sin(a) * 0.86, Math.cos(a) * 0.86, 0.112); d.rotation.set(0, 0, -a); d.updateMatrix(); ticks.setMatrixAt(i, d.matrix); ticks.setColorAt(i, new THREE.Color(0x12303a)); }
  face.add(ticks); group.add(face);

  // needle (rotates with heading)
  const needle = new THREE.Group();
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: amber, emissiveIntensity: 1.8, roughness: 0.4 });
  const blade = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.7, 4), bladeMat); blade.position.y = 0.35; blade.scale.z = 0.25;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.42, 4), chrome(0xcfd6dd, 0.2)); tail.position.y = -0.21; tail.rotation.z = Math.PI; tail.scale.z = 0.25;
  needle.add(blade, tail); needle.position.z = 0.15; group.add(needle);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.07, 32), chrome(0xe2e8ee, 0.14)); hub.rotation.x = Math.PI / 2; hub.position.z = 0.17; group.add(hub);

  // glass dome (cheap: thin clearcoat, no transmission)
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.95, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, roughness: 0.02, metalness: 0, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2.2, depthWrite: false }));
  dome.rotation.x = Math.PI / 2; dome.scale.set(1, 0.2, 1); dome.position.z = 0.19; group.add(dome);

  const lit = new THREE.Color(), off = new THREE.Color(0x12303a), hot = amber.clone().multiplyScalar(3);
  /** 0..1 → how much of the tick ring is lit */
  const setLit = (t: number) => { for (let i = 0; i < N; i++) { lit.copy(i / N < t ? hot : off); ticks.setColorAt(i, lit); } if (ticks.instanceColor) ticks.instanceColor.needsUpdate = true; };
  const setHeading = (deg: number) => { needle.rotation.z = -THREE.MathUtils.degToRad(deg); };
  return { group, needle, setLit, setHeading };
}

export function bottle(o: { glass?: Col; liquid?: Col; cap?: Col } = {}) {
  const group = new THREE.Group();
  const pts = [[0, 0], [0.5, 0], [0.62, 0.05], [0.66, 0.2], [0.66, 1.6], [0.6, 1.85], [0.34, 2.05], [0.3, 2.2], [0.3, 2.4]].map(([x, y]) => new THREE.Vector2(x, y));
  const glassM = new THREE.MeshPhysicalMaterial({ color: o.glass ?? 0xe8f0ee, roughness: 0.35, metalness: 0, transmission: 0.85, thickness: 1.4, ior: 1.5, envMapIntensity: 1.2, attenuationColor: new THREE.Color(o.glass ?? 0xdfeae4), attenuationDistance: 2.5 });
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), glassM);
  const inner = [[0, 0.12], [0.5, 0.12], [0.55, 0.2], [0.55, 1.15], [0.5, 1.2], [0, 1.2]].map(([x, y]) => new THREE.Vector2(x, y));
  const liquid = new THREE.Mesh(new THREE.LatheGeometry(inner, 64), new THREE.MeshPhysicalMaterial({ color: o.liquid ?? 0xc58f73, roughness: 0.15, transmission: 0.4, thickness: 1, ior: 1.38, emissive: new THREE.Color(o.liquid ?? 0xc58f73), emissiveIntensity: 0.08 }));
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.55, 64), chrome(o.cap ?? 0xcfd2d6, 0.2)); cap.position.y = 2.6;
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.08, 64), chrome(0xe8e8ea, 0.1)); collar.position.y = 2.33;
  group.add(body, liquid, cap, collar);
  return { group, liquid };
}
