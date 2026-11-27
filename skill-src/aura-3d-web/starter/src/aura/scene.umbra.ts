import * as THREE from "three";
import type { AuraScene, BuildContext, Frame, Shot } from "./engine";
import { obsidian, emissive, lightRig } from "./materials";
import { createParticles } from "./particles";
import { createSky, createLightShafts, createGlow, createHaze } from "./atmosphere";
import { createDunes } from "./terrain";
import { ease, seg } from "./choreo";

/* ─────────────────────────────────────────────────────────────
   AURA · scene.umbra.ts — "Umbra". World #2, built ONLY from the starter's helpers (no assets, ~190 lines).
   Archetype: EVENT / CAMPAIGN — a journey with a destination.
   Concept:   a desert valley at the moment of totality; a lone obsidian monolith; the camera walks toward the dark.
   Palette:   ember orange (accent) · bruise navy (dominant) · bone white (type)
   Lighting:  the ONLY warm light is the eclipse corona, BEHIND the subject → everything is rim-lit silhouette.
              A cold, dim fill from the camera side keeps the dunes legible. Warm vs cold = depth.
   The last frame is composed on purpose: monolith centred, corona ringing its top, CTA below.
   ───────────────────────────────────────────────────────────── */

export function umbra({ env, mobile }: BuildContext): AuraScene {
  const scene = new THREE.Scene();
  const HORIZON = 0x34150a, ZENITH = 0x04050c;
  scene.background = new THREE.Color(ZENITH);
  scene.fog = new THREE.FogExp2(0x20100b, mobile ? 0.0105 : 0.0085); // fog ≈ the sky's horizon colour so dunes melt into the glow
  scene.environment = env;
  scene.environmentIntensity = 0.18;

  // ── ground + geometry anchors
  const dunes = createDunes({ size: 460, segments: mobile ? 150 : 230, height: 11, color: 0x1d130f, sheen: 0xff7a3a, valley: { width: 24, sway: 12 } });
  scene.add(dunes.mesh);
  const gy = (z: number) => dunes.heightAt(dunes.valleyX(z), z);
  const vx = dunes.valleyX;
  const MZ = -72, MX = vx(MZ), MH = 13, BASE = gy(MZ);

  // ── sky: the eclipse. direction chosen so that from the FINAL camera the disc sits right behind the monolith's top
  const sky = createSky({ top: ZENITH, horizon: HORIZON, ground: 0x1a0b08, sunDir: [0, 0.205, -1], sunColor: 0xff9455, sunSize: 0.072, eclipse: 0.5, stars: 0.9 });
  scene.add(sky.mesh);
  const sunWorld = sky.sunPosition(380);
  const corona = createGlow(0xff8a4a, 110, 0.0);
  corona.position.copy(sunWorld);
  scene.add(corona);

  // ── light: warm rim from behind the subject, cold dim fill from the camera side
  const rig = lightRig({ key: 0x6f8fc8, rim: 0xff8a45, fill: 0x1a2038, practical: 0xff7a35 });
  rig.key.intensity = 0.55; rig.key.position.set(MX + 30, 40, 60);
  rig.rim.intensity = 5; rig.rim.position.set(MX, 18, -140);
  rig.fill.intensity = 0.5;
  rig.practical.position.set(MX, BASE + 7, MZ + 4); rig.practical.distance = 40; rig.practical.intensity = 0;
  scene.add(rig.group);

  // ── hero: the monolith (obsidian slab) with a hairline emissive seam that "ignites" at totality
  const mono = new THREE.Group();
  const slab = new THREE.Mesh(new THREE.BoxGeometry(2.6, MH, 0.8, 1, 1, 1), obsidian(0x06070c));
  Object.assign(slab.material, { roughness: 0.16, metalness: 0.5, envMapIntensity: 1.6 });
  slab.position.y = MH / 2;
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.035, MH * 0.92, 0.02), emissive(0xffb070, 2));
  seam.position.set(0, MH / 2, 0.41);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 0.25, 64), obsidian(0x090a10));
  plinth.position.y = 0.05;
  mono.add(slab, seam, plinth);
  mono.position.set(MX, BASE - 0.15, MZ);
  scene.add(mono);

  // ── an orbit of slate fragments circling the monolith (1 draw call) — turns with scroll, never with time
  const N = mobile ? 28 : 56;
  const frags = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.07, 0.38), obsidian(0x0a0b11), N);
  const fs = Array.from({ length: N }, (_, i) => ({ a: (i / N) * Math.PI * 2 * 3.1, r: 4.2 + (i % 7) * 0.55, y: 1.5 + ((i * 37) % 100) / 100 * (MH + 2), s: 0.35 + ((i * 53) % 100) / 100 * 0.8 }));
  scene.add(frags);
  const d = new THREE.Object3D();

  // ── atmosphere (planes 4+5): haze bands, crepuscular shafts leaking around the monolith, 3 dust fields
  const haze = createHaze({ color: 0xff6a30, layers: 5, width: 300, height: 26, zStart: 10, zStep: -30, y: 6, opacity: 0.28 });
  scene.add(haze.group);
  const shafts = createLightShafts({ from: [MX, BASE + MH + 2, MZ - 40], to: [MX + 2, BASE + 3, MZ + 70], color: 0xff9a5a, spread: 11, count: 3, intensity: 0 });
  scene.add(shafts.group);
  const dustA = createParticles({ count: mobile ? 500 : 1500, extent: [34, 7, 60], size: 1.5, color: 0xffb27a, color2: 0xffe2c4, opacity: 0.4 });
  dustA.points.position.set(vx(0), gy(0) + 6, 0);
  const dustB = createParticles({ count: mobile ? 500 : 1500, extent: [34, 8, 50], size: 1.5, color: 0xffa36a, color2: 0xffd9b0, opacity: 0.4 });
  dustB.points.position.set(MX, BASE + 7, MZ + 10);
  const motes = createParticles({ count: mobile ? 40 : 110, extent: [9, 5, 12], size: 6, color: 0xff9a60, color2: 0xffd0a0, opacity: 0.3, speed: 1.4 });
  scene.add(dustA.points, dustB.points, motes.points);

  // ── THE RAIL. 7 shots, one hold, wide/close alternation, a composed last frame (centred monolith + corona crown)
  const shots: Shot[] = [
    { at: 0.0, pos: [vx(34) + 5, gy(34) + 1.5, 34], look: [MX, 9, MZ], fov: 40 }, //  1 establish — low, wide, the dark sun already half-risen
    { at: 0.2, pos: [vx(-6) - 3.5, gy(-6) + 1.9, -6], look: [MX, 7, MZ], fov: 34 }, //  2 the walk — dunes slide past on both sides
    { at: 0.4, pos: [MX + 8, BASE + 0.5, MZ + 21], look: [MX, BASE + 9.5, MZ], fov: 25, ease: "inOut" }, //  3 hero — telephoto, worm's-eye
    { at: 0.56, pos: [MX + 7.4, BASE + 0.7, MZ + 20], look: [MX, BASE + 9.5, MZ], fov: 24.5 }, //     …HOLD (copy is read here; the seam ignites)
    { at: 0.76, pos: [MX + 17, BASE + 2.6, MZ - 3], look: [MX - 2, BASE + 8, MZ - 14], fov: 38, roll: 3 }, //  4 the pass — the corona slides behind the slab's edge
    { at: 0.9, pos: [MX + 6, BASE + 30, MZ + 46], look: [MX, BASE + 3, MZ - 20], fov: 50, ease: "inOut" }, //  5 crane — see the whole valley, the monolith small
    { at: 1.0, pos: [MX, BASE + 2.8, MZ + 36], look: [MX, BASE + 7.6, MZ], fov: 31 }, //  6 FINAL — centred, symmetrical, corona crowns the monolith
  ];

  return {
    scene,
    shots,
    fov: 40,
    exposure: 0.85,
    parallax: 0.6,
    bloom: { strength: mobile ? 0.55 : 0.85, radius: 0.8, threshold: 0.9 },
    grade: { vignette: 0.8, grain: 0.055, contrast: 1.1, saturation: 1.1, shadows: [0.0, 0.018, 0.05], highlights: [0.09, 0.035, 0.0] },
    update(f: Frame) {
      const { p, time: t } = f;
      // totality builds through the walk, peaks at the hold, never fully relaxes
      const total = 0.5 + 0.5 * ease.inOutCubic(seg(p, 0.0, 0.42));
      sky.uniforms.uEclipse.value = Math.min(1, total);
      sky.uniforms.uHaze.value = 1 - total * 0.5;
      sky.update(t);
      (corona.material as THREE.SpriteMaterial).opacity = 0.04 + total * 0.1;
      // the seam ignites in the hold, flares as the corona passes behind, calms for the final frame
      const ign = ease.inOutCubic(seg(p, 0.32, 0.5)) * (1 - 0.35 * seg(p, 0.85, 1));
      (seam.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + ign * 4.5 + Math.sin(t * 5) * 0.12 * ign;
      rig.practical.intensity = ign * 26;
      // shafts: invisible in the establishing shot, strongest when the monolith occludes the corona
      shafts.setIntensity(0.25 + 1.5 * (ease.inOutSine(seg(p, 0.6, 0.78)) * (1 - seg(p, 0.9, 1)) + 0.35 * seg(p, 0.9, 1)));
      shafts.update(t);
      haze.update(t);
      // the fragments orbit with SCROLL (scrub), plus a whisper of time
      const orb = p * Math.PI * 2.4 + t * 0.03;
      for (let i = 0; i < N; i++) {
        const s = fs[i], a = s.a + orb * (0.6 + (i % 5) * 0.12);
        d.position.set(MX + Math.cos(a) * s.r, BASE + s.y + Math.sin(t * 0.4 + i) * 0.15, MZ + Math.sin(a) * s.r * 0.7);
        d.rotation.set(a * 0.7, a, i);
        d.scale.setScalar(s.s);
        d.updateMatrix();
        frags.setMatrixAt(i, d.matrix);
      }
      frags.instanceMatrix.needsUpdate = true;
      dustA.update(t, f.velocity);
      dustB.update(t, f.velocity);
      motes.points.position.lerp(f.camera.position, 0.08); // lag behind the lens → a real foreground parallax plane
      motes.update(t, f.velocity);
    },
  };
}

export const UMBRA_QUALITY_NOTE = "Mirror floor intentionally absent: sand is rough. Reflection budget goes to the monolith's clearcoat instead.";
