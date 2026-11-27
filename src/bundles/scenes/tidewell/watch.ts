import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { chrome, noiseTexture } from "./materials";
import { TICKS } from "./depth";

/* ─────────────────────────────────────────────────────────────
   TIDEWELL · watch.ts — the hero. A 300 m dive watch from primitives, facing +Z, centred on the origin.

   · brushed case + polished bevels, 120-tooth knurled bezel, ceramic insert with a lume pip
   · dial printed on a canvas (petrol sunburst, chapter ring, wordmark) — the LUME is separate geometry so it can charge
   · 60 minute markers + 12 hour indices: per-instance colour, driven by setCharge(fill, glow)
   · three hands (hour, minute, ticking seconds), domed crystal, crown with guards, ribbed rubber strap looping behind
   ───────────────────────────────────────────────────────────── */

const LUME = new THREE.Color(0x9dffd9);
const CORAL = 0xff6a3d;

const tex = (c: HTMLCanvasElement, aniso = 8) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  return t;
};
const canvas = (n: number) => { const c = document.createElement("canvas"); c.width = c.height = n; return c; };
const pt = (cx: number, cy: number, r: number, a: number): [number, number] => [cx + Math.sin(a) * r, cy - Math.cos(a) * r];

/* ── dial print ─────────────────────────────────────────────── */
function dialTexture() {
  const N = 1024, c = canvas(N), g = c.getContext("2d")!, cx = N / 2, U = N / 1.6; // px per world unit (dial radius 0.8)
  const bg = g.createRadialGradient(cx, cx, 30, cx, cx, N / 2);
  bg.addColorStop(0, "#0f5260"); bg.addColorStop(0.55, "#093541"); bg.addColorStop(1, "#031a22");
  g.fillStyle = bg; g.fillRect(0, 0, N, N);
  // sunburst brushing
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2, [x, y] = pt(cx, cx, N / 2, a);
    g.strokeStyle = i % 2 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.09)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx, cx); g.lineTo(x, y); g.stroke();
  }
  // chapter ring
  g.strokeStyle = "rgba(220,238,240,0.34)"; g.lineWidth = 2;
  [0.785 * U, 0.665 * U].forEach((r) => { g.beginPath(); g.arc(cx, cx, r, 0, Math.PI * 2); g.stroke(); });
  // hour-index surrounds (polished frames the lume sits inside)
  g.strokeStyle = "#d4dde2"; g.lineWidth = 7; g.lineJoin = "round";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, [x, y] = pt(cx, cx, 0.54 * U, a);
    g.save(); g.translate(x, y); g.rotate(a);
    g.beginPath();
    if (i === 0) { g.moveTo(-0.1 * U, -0.105 * U); g.lineTo(0.1 * U, -0.105 * U); g.lineTo(0, 0.125 * U); g.closePath(); }
    else if (i % 3 === 0) g.roundRect(-0.052 * U, -0.112 * U, 0.104 * U, 0.224 * U, 8);
    else g.arc(0, 0, 0.068 * U, 0, Math.PI * 2);
    g.stroke(); g.restore();
  }
  // type
  g.fillStyle = "rgba(240,250,250,0.95)"; g.textAlign = "center"; g.textBaseline = "middle";
  const fam = "'Space Grotesk Variable','Space Grotesk',system-ui,sans-serif";
  g.font = `600 ${0.066 * U}px ${fam}`; (g as unknown as { letterSpacing: string }).letterSpacing = `${0.012 * U}px`;
  g.fillText("TIDEWELL", cx, cx - 0.255 * U);
  g.font = `500 ${0.034 * U}px 'JetBrains Mono',monospace`; (g as unknown as { letterSpacing: string }).letterSpacing = `${0.008 * U}px`;
  g.fillStyle = "rgba(240,250,250,0.7)";
  g.fillText("AUTOMATIC", cx, cx - 0.17 * U);
  g.fillStyle = "rgba(240,250,250,0.9)";
  g.fillText("DIVER · 300 M", cx, cx + 0.25 * U);
  g.fillStyle = "rgba(240,250,250,0.55)";
  g.fillText("1000 FT", cx, cx + 0.31 * U);
  return tex(c);
}

/* ── bezel insert: ceramic with printed graduations + a separate emissive map for the lume ── */
function bezelTextures() {
  const N = 1024, cx = N / 2, U = N / 2 / 1.07; // px per unit (insert outer radius 1.07)
  const mk = (lumeOnly: boolean) => {
    const c = canvas(N), g = c.getContext("2d")!;
    if (!lumeOnly) {
      const bg = g.createRadialGradient(cx, cx, 0.8 * U, cx, cx, N / 2);
      bg.addColorStop(0, "#050a12"); bg.addColorStop(1, "#0a1220");
      g.fillStyle = bg;
    } else g.fillStyle = "#000";
    g.fillRect(0, 0, N, N);
    const ink = lumeOnly ? "#ffffff" : "rgba(235,244,246,0.92)";
    g.fillStyle = ink; g.strokeStyle = ink; g.textAlign = "center"; g.textBaseline = "middle";
    for (let i = 0; i < 60; i++) {
      if (i === 0) continue;
      const a = (i / 60) * Math.PI * 2, five = i % 5 === 0;
      if (lumeOnly && !five) continue;
      if (five && i % 10 !== 0 && !lumeOnly) { const [x, y] = pt(cx, cx, 1.035 * U, a); g.beginPath(); g.arc(x, y, 0.017 * U, 0, 7); g.fill(); continue; }
      if (five && lumeOnly) { const [x, y] = pt(cx, cx, 1.035 * U, a); g.beginPath(); g.arc(x, y, 0.017 * U, 0, 7); g.fill(); continue; }
      g.lineWidth = 0.008 * U;
      const [x1, y1] = pt(cx, cx, 1.05 * U, a), [x2, y2] = pt(cx, cx, 1.0 * U, a);
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    }
    if (!lumeOnly) {
      g.font = `600 ${0.075 * U}px 'Space Grotesk Variable','Space Grotesk',system-ui,sans-serif`;
      for (const n of [10, 20, 30, 40, 50]) {
        const a = (n / 60) * Math.PI * 2, [x, y] = pt(cx, cx, 0.9 * U, a);
        g.save(); g.translate(x, y); g.rotate(a); g.fillText(String(n), 0, 0); g.restore();
      }
    }
    // the pip at 12: a lume dot inside a triangle (always the brightest thing on the bezel)
    g.beginPath(); g.moveTo(cx - 0.06 * U, cx - 1.05 * U); g.lineTo(cx + 0.06 * U, cx - 1.05 * U); g.lineTo(cx, cx - 0.9 * U); g.closePath();
    g.fillStyle = lumeOnly ? "#fff" : "rgba(235,244,246,0.95)"; g.fill();
    return tex(c);
  };
  return { map: mk(false), emissive: mk(true) };
}

/* ── hands ──────────────────────────────────────────────────── */
function poly(points: [number, number][]) {
  const s = new THREE.Shape(); points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s;
}
function hand(L: number, w: number, lumeMat: THREE.Material, metal: THREE.Material, z: number) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(poly([[0, -0.12], [w, -0.03], [w, L * 0.78], [0, L], [-w, L * 0.78], [-w, -0.03]]), { depth: 0.012, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 1 }), metal);
  const lume = new THREE.Mesh(new THREE.ShapeGeometry(poly([[0, 0.08], [w * 0.52, 0.12], [w * 0.52, L * 0.7], [0, L * 0.84], [-w * 0.52, L * 0.7], [-w * 0.52, 0.12]])), lumeMat);
  lume.position.z = 0.0185;
  g.add(body, lume); g.position.z = z;
  return g;
}

export interface DiveWatch {
  group: THREE.Group;
  /** the ceramic bezel (rotate about z; the lume pip travels with it) */
  bezel: THREE.Group;
  /** fill 0..1 = share of the 60 markers lit · glow 0..1 = how hot the lume burns (it needs the dark) · t = seconds */
  setCharge(fill: number, glow: number, t: number): void;
  setHands(minuteRad: number, secondRad: number): void;
  lumeLight: THREE.PointLight;
  lumeGlow: THREE.Sprite;
}

export function diveWatch(o: { mobile: boolean; glow: THREE.Sprite }): DiveWatch {
  const group = new THREE.Group();
  const flip = new THREE.Group(); flip.rotation.x = Math.PI / 2; // lathe axis Y → +Z (the face)
  group.add(flip);
  const V2 = (a: number[][]) => a.map(([x, y]) => new THREE.Vector2(x, y));

  // brushed steel: roughness varies along the grain (a flat roughness is what makes CG look like CG)
  const grain = noiseTexture(256, 4, 3); grain.repeat.set(6, 1);
  const brushed = new THREE.MeshPhysicalMaterial({ color: 0xaeb8c1, metalness: 1, roughness: 0.34, roughnessMap: grain, envMapIntensity: 1.35, clearcoat: 0.25, clearcoatRoughness: 0.2 });
  const polished = chrome(0xe4eaf0, 0.1);

  // case
  const caseGeo = new THREE.LatheGeometry(V2([[0, -0.32], [0.72, -0.32], [0.88, -0.3], [0.98, -0.22], [1.03, -0.1], [1.035, 0.1], [1.0, 0.15], [0.8, 0.15], [0.8, 0.13], [0, 0.13]]), 128);
  flip.add(new THREE.Mesh(caseGeo, brushed));

  // bezel (outer ring + knurl) — a group so it can click around
  const bezel = new THREE.Group();
  const bz = new THREE.Group(); bz.rotation.x = Math.PI / 2;
  bz.add(new THREE.Mesh(new THREE.LatheGeometry(V2([[0.8, 0.14], [1.07, 0.14], [1.115, 0.17], [1.14, 0.22], [1.14, 0.3], [1.115, 0.34], [1.08, 0.35], [0.86, 0.35], [0.82, 0.345], [0.8, 0.32]]), 128), polished));
  const TEETH = o.mobile ? 90 : 120, d = new THREE.Object3D();
  const knurl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.15, 0.05), chrome(0xb4bec8, 0.3), TEETH);
  for (let i = 0; i < TEETH; i++) { const a = (i / TEETH) * Math.PI * 2; d.position.set(Math.cos(a) * 1.14, 0.25, Math.sin(a) * 1.14); d.rotation.set(0, -a, 0); d.updateMatrix(); knurl.setMatrixAt(i, d.matrix); }
  bz.add(knurl); bezel.add(bz);
  const bt = bezelTextures();
  const insertMat = new THREE.MeshPhysicalMaterial({ map: bt.map, color: 0xffffff, roughness: 0.16, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.1, emissive: LUME.clone(), emissiveMap: bt.emissive, emissiveIntensity: 0.4 });
  const insert = new THREE.Mesh(new THREE.RingGeometry(0.83, 1.07, 128), insertMat); insert.position.z = 0.352;
  bezel.add(insert);
  group.add(bezel);

  // dial
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.8, 128), new THREE.MeshStandardMaterial({ map: dialTexture(), roughness: 0.5, metalness: 0.25, envMapIntensity: 0.8 }));
  dial.position.z = 0.145; group.add(dial);

  // ── lume: 60 minute markers + 12 hour indices, per-instance colour
  const OFF = new THREE.Color(0x103038), tmp = new THREE.Color();
  const tickMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.014, 0.072, 0.012), tickMat, TICKS);
  for (let i = 0; i < TICKS; i++) {
    const a = (i / TICKS) * Math.PI * 2, major = i % 5 === 0;
    d.position.set(Math.sin(a) * 0.725, Math.cos(a) * 0.725, 0.152); d.rotation.set(0, 0, -a); d.scale.set(major ? 1.7 : 1, major ? 1.15 : 1, 1); d.updateMatrix();
    ticks.setMatrixAt(i, d.matrix); ticks.setColorAt(i, OFF);
  }
  d.scale.set(1, 1, 1);
  group.add(ticks);

  const hourMats: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const m = new THREE.MeshBasicMaterial({ color: OFF, toneMapped: false });
    hourMats.push(m);
    let geo: THREE.BufferGeometry;
    if (i === 0) geo = new THREE.ShapeGeometry(poly([[-0.085, 0.095], [0.085, 0.095], [0, -0.115]]));
    else if (i % 3 === 0) geo = new THREE.PlaneGeometry(0.084, 0.2);
    else geo = new THREE.CircleGeometry(0.054, 40);
    const mk = new THREE.Mesh(geo, m);
    mk.position.set(Math.sin(a) * 0.54, Math.cos(a) * 0.54, 0.153); mk.rotation.z = -a;
    group.add(mk);
  }

  // ── hands
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xdfe6ec, metalness: 1, roughness: 0.16, envMapIntensity: 1.5 });
  const handLume = new THREE.MeshBasicMaterial({ color: OFF, toneMapped: false });
  const hourH = hand(0.43, 0.062, handLume, metal, 0.19);
  const minH = hand(0.7, 0.043, handLume, metal, 0.215);
  hourH.rotation.z = -(10.1 / 12) * Math.PI * 2; // 10:10 — the watchmaker's pose
  const secH = new THREE.Group();
  const secMat = new THREE.MeshStandardMaterial({ color: CORAL, emissive: new THREE.Color(CORAL), emissiveIntensity: 0.55, roughness: 0.4, metalness: 0.4 });
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.84, 0.006), secMat); blade.position.y = 0.2;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.2, 0.006), secMat); tail.position.y = -0.14;
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 28), secMat); dot.rotation.x = Math.PI / 2; dot.position.y = 0.5;
  secH.add(blade, tail, dot); secH.position.z = 0.24;
  const hubMat = chrome(0x9aa6b0, 0.34); hubMat.envMapIntensity = 0.5;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.06, 40), hubMat); hub.rotation.x = Math.PI / 2; hub.position.z = 0.25;
  group.add(hourH, minH, secH, hub);

  // ── crystal: a thin, domed, AR-coated sapphire — nearly invisible, but it throws the long reflections
  const dome: [number, number][] = [];
  for (let k = 0; k <= 28; k++) { const r = (k / 28) * 0.83; dome.push([r, 0.345 + 0.16 * (1 - Math.pow(r / 0.83, 2.2))]); }
  dome.reverse();
  const crystal = new THREE.Mesh(new THREE.LatheGeometry(V2(dome), 96), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.07, roughness: 0, metalness: 0, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 1.2, iridescence: 0.8, iridescenceIOR: 1.25, depthWrite: false, side: THREE.DoubleSide }));
  crystal.rotation.x = Math.PI / 2; crystal.renderOrder = 8; group.add(crystal);

  // ── crown + guards (3 o'clock)
  const crown = new THREE.Group(); crown.position.set(0.92, 0, -0.02); crown.rotation.z = -Math.PI / 2;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 28), polished); stem.position.y = 0.02;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.21, 40), brushed); cap.position.y = 0.17;
  const grip = new THREE.InstancedMesh(new THREE.BoxGeometry(0.022, 0.2, 0.036), chrome(0xc4ced6, 0.28), 22);
  for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2; d.position.set(Math.cos(a) * 0.152, 0.17, Math.sin(a) * 0.152); d.rotation.set(0, -a, 0); d.updateMatrix(); grip.setMatrixAt(i, d.matrix); }
  const guardGeo = new RoundedBoxGeometry(0.2, 0.2, 0.17, 3, 0.05);
  [-1, 1].forEach((s) => { const gd = new THREE.Mesh(guardGeo, brushed); gd.position.set(0, -0.03, s * 0.25); crown.add(gd); });
  crown.add(stem, cap, grip); group.add(crown);

  // ── lugs (curve back toward the wrist) + a ribbed rubber strap that loops behind the case
  const lugGeo = new RoundedBoxGeometry(0.24, 0.7, 0.36, 3, 0.1);
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sy]) => {
    const l = new THREE.Mesh(lugGeo, brushed); l.position.set(sx * 0.47, sy * 1.07, -0.03); l.rotation.x = -sy * 0.2; group.add(l);
  });
  const rubber = new THREE.MeshPhysicalMaterial({ color: 0x0b1519, roughness: 0.62, metalness: 0, sheen: 0.8, sheenColor: new THREE.Color(0x4a8794), sheenRoughness: 0.45, clearcoat: 0.15, envMapIntensity: 0.9 });
  const A = 1.9, C = 1.5, th0 = 0.752, zc = -1.29, SEG = o.mobile ? 34 : 46;
  const strap = new THREE.InstancedMesh(new RoundedBoxGeometry(0.8, 0.12, 0.27, 3, 0.04), rubber, SEG);
  const q = new THREE.Quaternion(), axis = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < SEG; i++) {
    const th = th0 + ((i + 0.5) / SEG) * (Math.PI * 2 - th0 * 2);
    const y = A * Math.sin(th), z = zc + C * Math.cos(th), ty = A * Math.cos(th), tz = -C * Math.sin(th);
    q.setFromAxisAngle(axis, Math.atan2(-ty, tz));
    d.position.set(0, y, z); d.quaternion.copy(q); d.scale.set(1, 1, 1); d.updateMatrix(); strap.setMatrixAt(i, d.matrix);
  }
  group.add(strap);

  // ── lume light: what the dial throws onto the crystal, bezel and the water around it
  const lumeLight = new THREE.PointLight(0x7affd0, 0, 5, 2); lumeLight.position.set(0, 0, 0.9); group.add(lumeLight);
  o.glow.position.set(0, 0, 0.45); group.add(o.glow);

  const hot = new THREE.Color(), setCharge = (fill: number, glow: number, t: number) => {
    const head = fill * TICKS, power = 0.75 + glow * 0.95; // peak ≈1.7: lume must read as a LIT RING, never a white orb (60 markers + bloom stack fast)
    for (let i = 0; i < TICKS; i++) {
      const lit = THREE.MathUtils.smoothstep(head - i, 0, 1.6);
      const edge = Math.exp(-Math.pow((head - i - 0.6) / 1.4, 2)) * (0.6 + 0.4 * Math.sin(t * 6)); // the leading tick shimmers: it's still charging
      hot.copy(LUME).multiplyScalar(power * (0.55 + 0.45 * lit) + edge * 1.6);
      tmp.copy(OFF).lerp(hot, lit); ticks.setColorAt(i, tmp);
    }
    if (ticks.instanceColor) ticks.instanceColor.needsUpdate = true;
    const hm = fill * 12;
    hourMats.forEach((m, i) => {
      const lit = Math.max(i === 0 ? 0.3 : 0, THREE.MathUtils.smoothstep(hm - i * 1.0, 0, 0.9));
      m.color.copy(OFF).lerp(hot.copy(LUME).multiplyScalar(power * 1.15), lit);
    });
    handLume.color.copy(OFF).lerp(hot.copy(LUME).multiplyScalar(power * 0.62), 0.2 + 0.8 * Math.min(1, fill * 3));
    insertMat.emissiveIntensity = 0.3 + glow * 0.9 * (0.4 + 0.6 * fill);
    lumeLight.intensity = fill * glow * 1.6;
    o.glow.material.opacity = 0.015 + glow * fill * 0.05;
  };
  const setHands = (m: number, s: number) => { minH.rotation.z = -m; secH.rotation.z = -s; };

  return { group, bezel, setCharge, setHands, lumeLight, lumeGlow: o.glow };
}
