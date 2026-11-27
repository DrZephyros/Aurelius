import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { AuraScene, BuildContext, Frame, Shot } from "./engine";
import { iridescent, emissive, lightRig } from "./materials";
import { createParticles } from "./particles";
import { createMirrorFloor } from "./floor";
import { createGlow } from "./atmosphere";
import { createStudioEnv } from "./studio";
import { ease, seg, smoothstep } from "./choreo";
import { createMood } from "./mood";

/* ─────────────────────────────────────────────────────────────
   AURA · scene.example.ts — "Obsidian Gate". A complete, zero-asset reference scene.
   Read it as a pattern, not a product. Study how it:
     · builds 6 depth layers (floor reflection · hero · rings · shards · dust · fog · back glow)
     · gets a PREMIUM hero with zero assets: a smooth, noise-displaced high-poly pebble (merged vertices → smooth normals),
       clearcoat + thin-film iridescence, reflecting a DESIGNED softbox environment (createStudioEnv) — never RoomEnvironment on a hero
     · lights with key / rim / fill + a MOVING practical: the spark that orbits on a ring is the light source
     · drives EVERYTHING from the single damped playhead f.p
     · authors TWO rails — desktop `shots` and portrait `shotsMobile` — same story, re-framed for a thumb-held screen
     · budgets by device `tier` (counts, mirror floor, geometry detail), not just a `mobile` boolean
   ───────────────────────────────────────────────────────────── */

export const OBSIDIAN_SHOTS: Shot[] = [
  { at: 0.0, pos: [0, 1.4, 15], look: [0, 1.6, 0], fov: 38 }, //  1 establish — wide, quiet, a lot of air
  { at: 0.2, pos: [3.4, 1.8, 7.5], look: [0, 1.5, 0], fov: 34 }, //  2 push-in — the object grows, parallax wakes
  { at: 0.4, pos: [-2.6, 2.2, 3.4], look: [0, 1.6, 0], fov: 24, ease: "inOut" }, //  3 macro orbit — telephoto compression, detail
  { at: 0.58, pos: [-2.6, 2.2, 3.4], look: [0, 1.6, 0], fov: 24 }, //     …HOLD (same shot twice) so the copy can be read
  { at: 0.78, pos: [0.6, 6.5, -1.5], look: [0, 0.5, -7], fov: 52 }, //  4 crane up and over — reveal the whole stage
  { at: 1.0, pos: [0, 2.7, 11.5], look: [0, 1.7, 0], fov: 30 }, //  5 FINAL IMAGE — swing back to a composed, symmetrical hero frame (the last frame is a poster, never empty space)
];

/** PORTRAIT RAIL. The story is identical (same `at` windows, so the DOM chapters need no changes) but every shot is re-composed:
 *  closer on the hero (a phone's width is tiny), subject kept in the upper 60% (copy lives in the bottom third), less lateral swing
 *  (thumbs hate whiplash), and a macro shot that stays macro. */
export const OBSIDIAN_SHOTS_MOBILE: Shot[] = [
  { at: 0.0, pos: [0, 1.9, 13.2], look: [0, 2.7, 0], fov: 36 }, // look.y > hero.y → the hero sits LOWER in frame, clear of the giant title
  { at: 0.2, pos: [2.2, 1.9, 7.2], look: [0, 2.3, 0], fov: 34 },
  { at: 0.4, pos: [-2.2, 2.4, 5.6], look: [0, 2.35, 0], fov: 26, ease: "inOut" }, // macro: hero in the UPPER half, copy owns the lower third
  { at: 0.58, pos: [-2.2, 2.4, 5.6], look: [0, 2.35, 0], fov: 26 },
  { at: 0.78, pos: [0.8, 7.2, 3.6], look: [0, 1.2, -4], fov: 48 },
  { at: 1.0, pos: [0, 2.9, 12.8], look: [0, 1.9, 0], fov: 32 },
];

/** A smooth, organic hero from nothing: icosphere → merge vertices (so normals can smooth) → low-frequency noise lobes → recompute normals.
 *  The result catches long, soft highlight lines the way a pebble of polished obsidian does. `detail` 22 desktop · 12 phone. */
function pebble(radius: number, detail: number) {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(radius, detail);
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g, 1e-4);
  const pos = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const n = Math.sin(v.x * 2.1 + 1.3) * Math.sin(v.y * 2.7 + 0.4) * Math.sin(v.z * 1.9 + 2.2) * 0.55 + Math.sin(v.x * 4.6 + v.z * 3.8) * 0.07;
    // a carved fold: one sharp crease wrapping the body catches a hard highlight line — the thing that stops it reading as a ball
    const crease = Math.pow(1 - Math.abs(Math.sin(v.x * 2.4 + v.y * 3.1 + v.z * 1.2)), 8);
    v.multiplyScalar(radius * (1 + n * 0.26 - crease * 0.07));
    pos.setXYZ(i, v.x, v.y * 1.2, v.z * 0.92);
  }
  g.computeVertexNormals();
  return g;
}

/** One entry per chapter: ONE dominant hue + one accent, then the track glides between them (mood.ts). Only LIGHT moves — never the hero's albedo. */
const MOOD = createMood([
  { at: 0.0, glow: 0x4f86ff, rim: 0x5ea2ff, ring: 0x6fb4ff, ring2: 0xffb37a, practical: 0xff8a4c, dust: 0xbfe0ff, dust2: 0xffd2a0, shade: 0x1a2a66, hi: 0xffe2c0 }, // 01 arrival  · cold ink + a warm spark
  { at: 0.2, glow: 0x2fb4d8, rim: 0x4fd0e8, ring: 0x6fe0f0, ring2: 0xffc890, practical: 0xffa060, dust: 0xaff0ff, dust2: 0xffe0b0, shade: 0x0e4a5a, hi: 0xfff0d0 }, // 02 approach · glacier teal
  { at: 0.5, glow: 0xff6a2a, rim: 0xff9a5c, ring: 0xffa060, ring2: 0xffe0a0, practical: 0xff7a30, dust: 0xffc890, dust2: 0xffe8c0, shade: 0x5a1a08, hi: 0xffd6a0 }, // 03 detail   · ember
  { at: 0.78, glow: 0x8a5cff, rim: 0xb68cff, ring: 0xa98cff, ring2: 0xff8ad0, practical: 0xff6ab0, dust: 0xcfb8ff, dust2: 0xffc0e8, shade: 0x2a1470, hi: 0xffd0f0 }, // 04 scale    · violet
  { at: 1.0, glow: 0x2fe0c0, rim: 0x8ff2e0, ring: 0xffd08a, ring2: 0x6fe8d0, practical: 0xffc070, dust: 0xd0fff0, dust2: 0xffe0a0, shade: 0x0a4a40, hi: 0xffe8b8 }, // 05 final    · dawn teal + gold
]);

export function obsidianGate({ renderer, mobile, tier, quality }: BuildContext): AuraScene {
  const scene = new THREE.Scene();
  const BG = 0x03050b;
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, mobile ? 0.04 : 0.032);

  // ── a DESIGNED environment: long cool + warm softboxes → the highlight lines that make glossy black read as luxury
  const env = createStudioEnv(renderer, {
    base: 0x070a12, baseIntensity: 1.4,
    strips: [
      { color: 0x8fc4ff, intensity: 4.2, pos: [-9, 4, 4], size: [3.4, 14] },   // cool key softbox, camera-left
      { color: 0xffc9a0, intensity: 3.4, pos: [9, 5, -1], size: [3.0, 12] },   // warm kicker, right
      { color: 0xffffff, intensity: 2.6, pos: [0, 11, 1], size: [16, 3.2] },   // top bar → the long horizon highlight
      { color: 0x7a5cff, intensity: 2.4, pos: [-4, -6, 8], size: [10, 2.4] },  // violet under-bounce → colour in the shadow side
      { color: 0x3dd9c4, intensity: 1.8, pos: [5, 1, 10], size: [2.4, 9] },    // teal fill → iridescent edge read
    ],
  });
  scene.environment = env;
  scene.environmentIntensity = 1.15;

  // ── light: designed, not default
  const rig = lightRig({ key: 0xfff0dd, rim: 0x5ea2ff, practical: 0xff8a4c });
  rig.rim.intensity = 2.6; // a rim light should trace the edge, not flood the face — tune by eye
  rig.key.intensity = 1.5;
  scene.add(rig.group);

  // ── hero object: a sculpted, creased obsidian monolith-pebble with thin-film iridescence (zero assets)
  const hero = new THREE.Group();
  const shellMat = iridescent(0x0d1220);
  Object.assign(shellMat, { metalness: 0.78, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.7, iridescenceIOR: 1.9, iridescenceThicknessRange: [220, 780], sheen: 0.6, sheenColor: new THREE.Color(0x6a9bff), sheenRoughness: 0.35 });
  const shell = new THREE.Mesh(pebble(1.2, mobile ? 12 : 22), shellMat);
  hero.add(shell);
  hero.position.y = 1.7;
  scene.add(hero);

  // ── back glow: a soft additive bloom behind the hero separates it from the void (depth plane #6, and the "poster" light)
  const backGlow = createGlow(0x4f86ff, 11, 0.38);
  backGlow.position.set(0, 1.8, -3.2);
  scene.add(backGlow);

  // ── THE GATE: leaning obsidian slabs on an arc behind and beside the hero. Foreground occluders when the camera crosses the arc, a
  //    skyline when it stands outside it. The arc is OPEN toward the camera's approach (50°–140°) so no slab ever crosses the lens.
  const slabCount = mobile ? 8 : 11;
  const slabs = new THREE.InstancedMesh(new RoundedBoxGeometry(0.46, 3.4, 0.18, 3, 0.06), Object.assign(iridescent(0x0a0e18), { metalness: 0.9, roughness: 0.24, envMapIntensity: 1.9 }), slabCount);
  const d = new THREE.Object3D();
  for (let i = 0; i < slabCount; i++) {
    const ang = THREE.MathUtils.degToRad(145 + (i / (slabCount - 1)) * 260);
    const hgt = 0.75 + ((i * 7) % 5) * 0.19; // deterministic skyline — a gate, not noise
    d.position.set(Math.cos(ang) * 5.6, 1.7 * hgt, Math.sin(ang) * 5.6);
    d.rotation.set(0.07 + ((i * 3) % 4) * 0.03, -ang + Math.PI / 2, ((i % 2) - 0.5) * 0.06);
    d.scale.set(1.2 + (i % 3) * 0.25, hgt, 1);
    d.updateMatrix();
    slabs.setMatrixAt(i, d.matrix);
  }
  scene.add(slabs);

  // ── rings: thin emissive tori on different axes → scale cue + orbital motion
  const rings: THREE.Mesh[] = [];
  [2.4, 3.3, 4.6].forEach((r, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012 + i * 0.006, 8, mobile ? 140 : 220), emissive(i === 1 ? 0xffb37a : 0x6fb4ff, mobile ? 1.15 : 1.6));
    m.position.y = 1.7;
    m.rotation.set(Math.PI / 2 + i * 0.35, i * 0.6, 0);
    rings.push(m);
    scene.add(m);
  });

  // ── the spark: a small emissive bead riding the middle ring. It IS the practical light — the hero is lit by something that moves.
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), emissive(0xffd2a0, 5));
  spark.position.set(3.3, 0, 0); // ring local space: rotating the ring on z orbits the bead
  rings[1].add(spark);
  const sparkGlow = createGlow(0xffa66a, 1.5, 0.9);
  spark.add(sparkGlow);

  // ── chips: 1 instanced draw call of thin iridescent plates (NOT flat tetrahedra — those read as default primitives and as black triangles
  //    when one drifts past the lens). Each chip dissolves (scales to 0) inside 5 world units of the camera, so none can fill the frame.
  const N = !mobile ? 90 : tier === "low" ? 30 : 48;
  const chips = new THREE.InstancedMesh(new RoundedBoxGeometry(0.34, 0.06, 0.5, 2, 0.025), Object.assign(iridescent(0x0b0f18), { metalness: 0.85, roughness: 0.22 }), N);
  const seeds = Array.from({ length: N }, () => ({ a: Math.random() * 6.28, r: 3.6 + Math.random() * 3.2, y: 0.4 + Math.random() * 4.6, s: 0.45 + Math.random() * 0.8, sp: 0.04 + Math.random() * 0.1, z: (Math.random() - 0.5) * 8 }));
  scene.add(chips);
  const dummy = new THREE.Object3D();

  // ── floor: reflective, fades into fog. A planar reflection is a second scene render → off on weak phones.
  const floor = createMirrorFloor({ color: 0x3a4152, fadeColor: BG, resolution: mobile ? 0.3 : 0.5 });
  const floorOk = tier !== "low";
  floor.setEnabled(floorOk && quality > 0.5);
  scene.add(floor.group);

  // ── atmosphere: two particle bands (near bokeh + far dust). The near band is kept faint: bright bokeh behind copy was the v18 contrast blocker.
  const dustFar = createParticles({ count: !mobile ? 2600 : tier === "low" ? 600 : 1000, extent: [16, 9, 34], size: 1.6, color: 0xbfe0ff, color2: 0xffd2a0, opacity: 0.7 });
  const dustNear = createParticles({ count: mobile ? 36 : 120, extent: [9, 5, 14], size: 6, color: 0x9fd0ff, color2: 0xffa56a, opacity: 0.2, speed: 1.6 });
  scene.add(dustFar.points, dustNear.points);

  const grade = { vignette: 0.7, grain: 0.05, contrast: 1.08, saturation: 1.1, shadows: [0, 0.015, 0.06] as [number, number, number], highlights: [0.07, 0.035, 0] as [number, number, number] };
  const dustU = (pts: typeof dustFar) => (pts.points.material as THREE.ShaderMaterial).uniforms;
  const wp = new THREE.Vector3(), warm = new THREE.Color(1, 0.85, 0.65);
  return {
    scene,
    shots: OBSIDIAN_SHOTS,
    shotsMobile: OBSIDIAN_SHOTS_MOBILE,
    fov: 38,
    exposure: 0.95,
    bloom: { strength: mobile ? 0.42 : 0.6, radius: 0.7, threshold: 0.9 },
    grade,
    update(f: Frame) {
      const { p, time: t } = f;
      const m = MOOD(p); // this chapter's colours (mood.ts) — ONLY light and atmosphere move
      // the hero turns with scroll (not time) → scrub, never autoplay
      hero.rotation.y = p * Math.PI * 2.4 + t * 0.04;
      hero.rotation.x = Math.sin(p * Math.PI * 2) * 0.25;
      hero.position.y = 1.7 + Math.sin(t * 0.6) * 0.06;
      // the spark "ignites" during the macro shot
      const ign = ease.inOutCubic(seg(p, 0.25, 0.45)) * (1 - seg(p, 0.7, 0.85));
      (spark.material as THREE.MeshStandardMaterial).emissiveIntensity = 4 + ign * 5;
      (spark.material as THREE.MeshStandardMaterial).emissive.copy(m.practical).lerp(warm, 0.35);
      sparkGlow.scale.setScalar(1.5 + ign * 1.4);
      sparkGlow.material.color.copy(m.practical);
      backGlow.material.opacity = 0.32 + ign * 0.22 + p * 0.1;
      backGlow.material.color.copy(m.glow);
      shellMat.emissive.copy(m.glow).multiplyScalar(0.05 + ign * 0.12);
      rig.rim.color.copy(m.rim);
      rig.practical.color.copy(m.practical);
      // the practical follows the spark → highlights slide across the hero as it orbits
      spark.getWorldPosition(wp);
      rig.practical.position.copy(wp);
      rig.practical.intensity = 8 + ign * 26 + Math.sin(t * 7) * 0.6; // a living, slightly unstable light
      rings.forEach((r, i) => {
        r.rotation.z += f.dt * (0.15 + i * 0.1) * (1 + f.velocity * 6);
        r.scale.setScalar(1 + ign * 0.08 * (i + 1));
        (r.material as THREE.MeshStandardMaterial).emissive.copy(i === 1 ? m.ring2 : m.ring);
      });
      // chips drift on ellipses; each one shrinks to nothing as it nears the lens
      const cam = f.camera.position;
      for (let i = 0; i < N; i++) {
        const s = seeds[i], a = s.a + t * s.sp;
        dummy.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * 0.3 + i) * 0.2, Math.sin(a) * s.r * 0.6 + s.z * 0.25);
        dummy.rotation.set(t * s.sp * 3 + i, t * s.sp * 2, i);
        dummy.scale.setScalar(s.s * smoothstep(2.2, 5.2, dummy.position.distanceTo(cam)));
        dummy.updateMatrix();
        chips.setMatrixAt(i, dummy.matrix);
      }
      chips.instanceMatrix.needsUpdate = true;
      const uf = dustU(dustFar), un = dustU(dustNear);
      uf.uC1.value.copy(m.dust); uf.uC2.value.copy(m.dust2); un.uC1.value.copy(m.dust); un.uC2.value.copy(m.dust2);
      // split-toning follows the mood: shadows take the chapter's hue, highlights its warm counterpart
      grade.shadows = [m.shade.r * 0.6, m.shade.g * 0.6, m.shade.b * 0.6];
      grade.highlights = [m.hi.r * 0.09, m.hi.g * 0.09, m.hi.b * 0.09];
      dustFar.update(t, f.velocity);
      dustNear.update(t, f.velocity);
      floor.setEnabled(floorOk && f.quality > 0.5);
    },
    dispose() { env.dispose(); },
  };
}
