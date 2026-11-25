import * as THREE from "three";
import type { AuraScene, BuildContext, Frame, Shot } from "./engine";
import { iridescent, obsidian, emissive, lightRig } from "./materials";
import { createParticles } from "./particles";
import { createMirrorFloor } from "./floor";
import { ease, seg } from "./choreo";

/* ─────────────────────────────────────────────────────────────
   AURA · scene.example.ts — "Obsidian Gate". A complete, zero-asset reference scene.
   Read it as a pattern, not a product. Study how it:
     · builds 5+ depth layers (floor reflection · hero · rings · shards · dust · fog)
     · lights with a key / rim / fill / practical rig and a coloured hero glow
     · drives EVERYTHING from the single damped playhead f.p
     · sequences a shot list with deliberate pacing (establish → push → macro → crane → fly-through)
   ───────────────────────────────────────────────────────────── */

export const OBSIDIAN_SHOTS: Shot[] = [
  { at: 0.0, pos: [0, 1.4, 15], look: [0, 1.6, 0], fov: 38 }, //  1 establish — wide, quiet, a lot of air
  { at: 0.2, pos: [3.4, 1.8, 7.5], look: [0, 1.5, 0], fov: 34 }, //  2 push-in — the object grows, parallax wakes
  { at: 0.4, pos: [-2.6, 2.2, 3.4], look: [0, 1.6, 0], fov: 24, ease: "inOut" }, //  3 macro orbit — telephoto compression, detail
  { at: 0.58, pos: [-2.6, 2.2, 3.4], look: [0, 1.6, 0], fov: 24 }, //     …HOLD (same shot twice) so the copy can be read
  { at: 0.78, pos: [0.6, 6.5, -1.5], look: [0, 0.5, -7], fov: 52 }, //  4 crane up and over — reveal the whole stage
  { at: 1.0, pos: [0, 2.2, -16], look: [0, 2.4, -44], fov: 60 }, //  5 fly-through into the void — widen the lens, speed
];

export function obsidianGate({ env, mobile, quality }: BuildContext): AuraScene {
  const scene = new THREE.Scene();
  const BG = 0x03050b;
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, mobile ? 0.04 : 0.032);
  scene.environment = env;
  scene.environmentIntensity = 0.32;

  // ── light: designed, not default
  const rig = lightRig({ key: 0xfff0dd, rim: 0x5ea2ff, practical: 0xff8a4c });
  rig.rim.intensity = 2.6; // a rim light should trace the edge, not flood the face — tune by eye
  scene.add(rig.group);

  // ── hero object: an iridescent crystal with an inner emissive core
  const hero = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 1), iridescent(0x0a0d14));
  Object.assign(shell.material, { flatShading: true, roughness: 0.34, clearcoatRoughness: 0.32, envMapIntensity: 1 });
  // // facets catch the rim light — a smooth orb reads as a toy
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 2), emissive(0x7fd6ff, 3.2));
  hero.add(shell, core);
  hero.position.y = 1.6;
  scene.add(hero);

  // ── rings: thin emissive tori on different axes → scale cue + orbital motion
  const rings: THREE.Mesh[] = [];
  [2.4, 3.3, 4.6].forEach((r, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012 + i * 0.006, 8, 220), emissive(i === 1 ? 0xffb37a : 0x6fb4ff, 1.6));
    m.position.y = 1.6;
    m.rotation.set(Math.PI / 2 + i * 0.35, i * 0.6, 0);
    rings.push(m);
    scene.add(m);
  });

  // ── shards: 1 instanced draw call, 110 floating obsidian fragments
  const N = mobile ? 60 : 110;
  const shards = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(0.22), obsidian(0x080a10), N);
  const seeds = Array.from({ length: N }, () => ({ a: Math.random() * 6.28, r: 3.4 + Math.random() * 6, y: Math.random() * 5, s: 0.4 + Math.random() * 1.6, sp: 0.04 + Math.random() * 0.12, z: (Math.random() - 0.5) * 18 }));
  scene.add(shards);
  const dummy = new THREE.Object3D();

  // ── floor: reflective, fades into fog
  const floor = createMirrorFloor({ color: 0x3a4152, fadeColor: BG, resolution: mobile ? 0.35 : 0.5 });
  floor.setEnabled(quality > 0.5);
  scene.add(floor.group);

  // ── atmosphere: two particle bands (near bokeh + far dust)
  const dustFar = createParticles({ count: mobile ? 900 : 2600, extent: [16, 9, 34], size: 1.6, color: 0xbfe0ff, color2: 0xffd2a0, opacity: 0.7 });
  const dustNear = createParticles({ count: mobile ? 60 : 160, extent: [9, 5, 14], size: 7, color: 0x9fd0ff, color2: 0xffa56a, opacity: 0.35, speed: 1.6 });
  scene.add(dustFar.points, dustNear.points);

  const hue = new THREE.Color();
  return {
    scene,
    shots: OBSIDIAN_SHOTS,
    fov: 38,
    exposure: 0.9,
    bloom: { strength: mobile ? 0.45 : 0.65, radius: 0.7, threshold: 0.88 },
    grade: { vignette: 0.7, grain: 0.05, contrast: 1.08, saturation: 1.08, shadows: [0, 0.015, 0.06], highlights: [0.07, 0.035, 0] },
    update(f: Frame) {
      const { p, time: t } = f;
      // the hero turns with scroll (not time) → scrub, never autoplay
      hero.rotation.y = p * Math.PI * 3.2 + t * 0.05;
      hero.rotation.x = Math.sin(p * Math.PI * 2) * 0.35;
      hero.position.y = 1.6 + Math.sin(t * 0.6) * 0.06;
      // the core "ignites" during the macro shot
      const ign = ease.inOutCubic(seg(p, 0.25, 0.45)) * (1 - seg(p, 0.7, 0.85));
      (core.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2 + ign * 3;
      hue.setHSL(0.55 + p * 0.22, 0.85, 0.62);
      (core.material as THREE.MeshStandardMaterial).emissive.copy(hue);
      rig.practical.intensity = 9 + ign * 22 + Math.sin(t * 7) * 0.6; // a living, slightly unstable light
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
      floor.setEnabled(f.quality > 0.5);
    },
  };
}
