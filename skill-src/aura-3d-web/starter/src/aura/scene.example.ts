import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { AuraScene, BuildContext, Frame, Shot } from "./engine";
import { iridescent, obsidian, emissive, lightRig } from "./materials";
import { createParticles } from "./particles";
import { createMirrorFloor } from "./floor";
import { createGlow } from "./atmosphere";
import { createStudioEnv } from "./studio";
import { ease, seg } from "./choreo";

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
  { at: 0.0, pos: [0, 1.5, 13.2], look: [0, 1.5, 0], fov: 36 },
  { at: 0.2, pos: [2.2, 1.9, 7.2], look: [0, 1.5, 0], fov: 34 },
  { at: 0.4, pos: [-2.2, 2.2, 5.4], look: [0, 1.6, 0], fov: 26, ease: "inOut" },
  { at: 0.58, pos: [-2.2, 2.2, 5.4], look: [0, 1.6, 0], fov: 26 },
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
    v.multiplyScalar(radius * (1 + n * 0.17));
    pos.setXYZ(i, v.x, v.y * 1.06, v.z);
  }
  g.computeVertexNormals();
  return g;
}

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

  // ── hero object: polished obsidian with thin-film iridescence (zero assets)
  const hero = new THREE.Group();
  const shellMat = iridescent(0x0d1220);
  Object.assign(shellMat, { metalness: 0.78, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.7, iridescenceIOR: 1.9, iridescenceThicknessRange: [220, 780], sheen: 0.6, sheenColor: new THREE.Color(0x6a9bff), sheenRoughness: 0.35 });
  const shell = new THREE.Mesh(pebble(1.35, mobile ? 12 : 22), shellMat);
  hero.add(shell);
  hero.position.y = 1.6;
  scene.add(hero);

  // ── back glow: a soft additive bloom behind the hero separates it from the void (depth plane #6, and the "poster" light)
  const backGlow = createGlow(0x4f86ff, 11, 0.38);
  backGlow.position.set(0, 1.7, -3.2);
  scene.add(backGlow);

  // ── rings: thin emissive tori on different axes → scale cue + orbital motion
  const rings: THREE.Mesh[] = [];
  [2.4, 3.3, 4.6].forEach((r, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012 + i * 0.006, 8, mobile ? 140 : 220), emissive(i === 1 ? 0xffb37a : 0x6fb4ff, mobile ? 1.15 : 1.6));
    m.position.y = 1.6;
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

  // ── shards: 1 instanced draw call of floating obsidian fragments (fewer on weak phones)
  const N = !mobile ? 110 : tier === "low" ? 36 : 56;
  const shards = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(0.22), obsidian(0x080a10), N);
  const seeds = Array.from({ length: N }, () => ({ a: Math.random() * 6.28, r: 3.4 + Math.random() * 6, y: Math.random() * 5, s: 0.4 + Math.random() * 1.6, sp: 0.04 + Math.random() * 0.12, z: (Math.random() - 0.5) * 18 }));
  scene.add(shards);
  const dummy = new THREE.Object3D();

  // ── floor: reflective, fades into fog. A planar reflection is a second scene render → off on weak phones.
  const floor = createMirrorFloor({ color: 0x3a4152, fadeColor: BG, resolution: mobile ? 0.3 : 0.5 });
  const floorOk = tier !== "low";
  floor.setEnabled(floorOk && quality > 0.5);
  scene.add(floor.group);

  // ── atmosphere: two particle bands (near bokeh + far dust)
  const dustFar = createParticles({ count: !mobile ? 2600 : tier === "low" ? 600 : 1000, extent: [16, 9, 34], size: 1.6, color: 0xbfe0ff, color2: 0xffd2a0, opacity: 0.7 });
  const dustNear = createParticles({ count: mobile ? 50 : 160, extent: [9, 5, 14], size: 7, color: 0x9fd0ff, color2: 0xffa56a, opacity: 0.35, speed: 1.6 });
  scene.add(dustFar.points, dustNear.points);

  const wp = new THREE.Vector3();
  return {
    scene,
    shots: OBSIDIAN_SHOTS,
    shotsMobile: OBSIDIAN_SHOTS_MOBILE,
    fov: 38,
    exposure: 0.95,
    bloom: { strength: mobile ? 0.42 : 0.6, radius: 0.7, threshold: 0.9 },
    grade: { vignette: 0.7, grain: 0.05, contrast: 1.08, saturation: 1.08, shadows: [0, 0.015, 0.06], highlights: [0.07, 0.035, 0] },
    update(f: Frame) {
      const { p, time: t } = f;
      // the hero turns with scroll (not time) → scrub, never autoplay
      hero.rotation.y = p * Math.PI * 2.4 + t * 0.04;
      hero.rotation.x = Math.sin(p * Math.PI * 2) * 0.25;
      hero.position.y = 1.6 + Math.sin(t * 0.6) * 0.06;
      // the spark "ignites" during the macro shot
      const ign = ease.inOutCubic(seg(p, 0.25, 0.45)) * (1 - seg(p, 0.7, 0.85));
      (spark.material as THREE.MeshStandardMaterial).emissiveIntensity = 4 + ign * 5;
      sparkGlow.scale.setScalar(1.5 + ign * 1.4);
      backGlow.material.opacity = 0.32 + ign * 0.22 + p * 0.1;
      // the practical follows the spark → highlights slide across the hero as it orbits
      spark.getWorldPosition(wp);
      rig.practical.position.copy(wp);
      rig.practical.intensity = 8 + ign * 26 + Math.sin(t * 7) * 0.6; // a living, slightly unstable light
      rings.forEach((r, i) => { r.rotation.z += f.dt * (0.15 + i * 0.1) * (1 + f.velocity * 6); r.scale.setScalar(1 + ign * 0.08 * (i + 1)); });
      for (let i = 0; i < N; i++) {
        const s = seeds[i], a = s.a + t * s.sp;
        dummy.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * 0.3 + i) * 0.2, Math.sin(a) * s.r * 0.6 + s.z * 0.4);
        dummy.rotation.set(t * s.sp * 3 + i, t * s.sp * 2, i);
        dummy.scale.setScalar(s.s);
        dummy.updateMatrix();
        shards.setMatrixAt(i, dummy.matrix);
      }
      shards.instanceMatrix.needsUpdate = true;
      dustFar.update(t, f.velocity);
      dustNear.update(t, f.velocity);
      floor.setEnabled(floorOk && f.quality > 0.5);
    },
    dispose() { env.dispose(); },
  };
}
