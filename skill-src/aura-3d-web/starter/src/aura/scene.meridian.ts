import * as THREE from "three";
import type { AuraScene, BuildContext, Frame, Shot } from "./contract";
import { createContactShadow } from "./studio";
import { seg, smoothstep } from "./choreo";
import { LOOKS } from "./looks";
import { createLiquidMetal } from "./frontier/sdf";
import { createGpuParticles, particleSide } from "./frontier/gpgpu";
import { createSplats, generateKnot, generateCloud } from "./frontier/splat";
import { createLiveProbe } from "./frontier/probe";

/* ─────────────────────────────────────────────────────────────
   AURA · scene.meridian.ts — "MERIDIAN". World #5, and the first world built on the FRONTIER modules.
   It is deliberately the opposite of the older worlds: LIGHT, matte, a curved cyclorama (no mirror floor), no bloom soup.

   Chapter 1  LIQUID    a ray-marched metaball hero (SDF): fuses, splits into droplets, re-forms as a ring — topology a mesh cannot do
   Chapter 2  SCATTER   16 k–65 k GPU curl-noise particles, aimed at the hero by the playhead
   Chapter 3  CAPTURED  a Gaussian-splat sculpture (60–90 k splats) the camera flies across the stage to
   Final      the hero returns, rack-focus bokeh, a live-probe chrome ring reflecting the world

   Every effect is budgeted by ctx.budget (measured), so the same file runs on a 2019 phone and a desktop GPU.
   ───────────────────────────────────────────────────────────── */

const L = LOOKS.bone;
const HERO = new THREE.Vector3(0, 1.9, 0);
const KNOT = new THREE.Vector3(18, 2.3, -2);

export const MERIDIAN_SHOTS: Shot[] = [
  { at: 0.0, pos: [0.0, 2.0, 13.5], look: [0, 3.5, 0], fov: 34 }, //  1 establish — hero sits LOW so the giant title owns the top band
  { at: 0.14, pos: [3.2, 2.4, 7.6], look: [0, 1.9, 0], fov: 28 }, //  2 push in as the blob starts to split
  { at: 0.28, pos: [-3.6, 2.6, 6.2], look: [0, 1.9, 0], fov: 24, ease: "inOut" }, //  3 telephoto orbit through the droplets
  { at: 0.42, pos: [-1.5, 3.6, 9.5], look: [0.5, 2.0, 0], fov: 44 }, //  4 wide: the swarm
  { at: 0.54, pos: [9, 3, 8], look: [14, 2.3, -2], fov: 40 }, //  5 travel — the stage reveals the knot
  { at: 0.66, pos: [16.6, 2.7, 6.2], look: [18, 2.4, -2], fov: 28 }, //  6 arrive at the capture
  { at: 0.8, pos: [16.6, 2.7, 6.2], look: [18, 2.4, -2], fov: 28 }, //     …HOLD
  { at: 0.9, pos: [6, 3.4, 10.5], look: [1, 2.2, 0], fov: 46 }, //  7 swing back
  { at: 1.0, pos: [0, 2.5, 11.5], look: [0, 2.6, 0], fov: 30 }, //  8 FINAL IMAGE — composed, symmetrical
];
export const MERIDIAN_SHOTS_MOBILE: Shot[] = [
  { at: 0.0, pos: [0, 2.2, 11.8], look: [0, 3.2, 0], fov: 36 },
  { at: 0.14, pos: [2.0, 2.4, 7.2], look: [0, 1.9, 0], fov: 30 },
  { at: 0.28, pos: [-2.4, 2.5, 5.8], look: [0, 1.9, 0], fov: 26, ease: "inOut" },
  { at: 0.42, pos: [-1.0, 3.4, 8.4], look: [0.4, 2.0, 0], fov: 46 },
  { at: 0.54, pos: [8, 3, 7.5], look: [13.5, 2.3, -2], fov: 42 },
  { at: 0.66, pos: [16.8, 2.7, 5.6], look: [18, 2.4, -2], fov: 32 },
  { at: 0.8, pos: [16.8, 2.7, 5.6], look: [18, 2.4, -2], fov: 32 },
  { at: 0.9, pos: [5, 3.4, 9.6], look: [1, 2.2, 0], fov: 48 },
  { at: 1.0, pos: [0, 2.6, 10.8], look: [0, 2.8, 0], fov: 34 },
];

/** floor → quarter-circle → wall, one seamless surface. The horizon line is what makes studio light read as studio. */
function cyclorama(width: number, mat: THREE.Material) {
  const g = new THREE.PlaneGeometry(1, 1, 1, 120), pos = g.attributes.position as THREE.BufferAttribute;
  const front = 60, back = -9, R = 7, wall = 36, arc = (Math.PI / 2) * R, total = front - back + arc + wall;
  for (let i = 0; i < pos.count; i++) {
    const x = (pos.getX(i) > 0 ? 1 : -1) * width * 0.5, s = (pos.getY(i) + 0.5) * total;
    let y = 0, z = 0;
    if (s < front - back) { z = front - s; }
    else if (s < front - back + arc) { const a = (s - (front - back)) / R; z = back - Math.sin(a) * R; y = R - Math.cos(a) * R; }
    else { z = back - R; y = R + (s - (front - back) - arc); }
    pos.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true;
  return m;
}

export async function meridian(ctx: BuildContext): Promise<AuraScene> {
  const { renderer, budget: B, tier } = ctx;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(L.bg);
  scene.fog = new THREE.Fog(...L.fog);
  scene.environment = ctx.env; scene.environmentIntensity = 0.55;

  // ── light: a warm key, a bone hemisphere, nothing else. Grounding comes from AO + contact shadows, not from more lights.
  scene.add(new THREE.HemisphereLight(0xfff6ea, 0xd2c6b4, 1.05));
  const key = new THREE.DirectionalLight(0xfff1de, 2.4); key.position.set(-6, 11, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe9ff, 0.8); rim.position.set(8, 5, -8); scene.add(rim);

  // ── set
  const clay = (c: number, r = 0.88) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0, envMapIntensity: 0.5 });
  scene.add(cyclorama(160, new THREE.MeshStandardMaterial({ color: 0xe6dfd2, roughness: 0.96, side: THREE.DoubleSide, envMapIntensity: 0.35 })));
  const props = new THREE.Group(); scene.add(props);
  const fg = new THREE.Mesh(new THREE.SphereGeometry(1.5, 48, 32), clay(0xc4623a, 0.8)); fg.position.set(-6.2, 1.5, 6.5); props.add(fg); // blurred foreground occluder (DOF)
  const fg2 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 40, 28), clay(0xe9e3d8, 0.7)); fg2.position.set(5.6, 0.9, 4.5); props.add(fg2);
  const plinth = (x: number, z: number, h: number, r: number, c: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.04, h, 56), clay(c, 0.9)); m.position.set(x, h / 2, z); props.add(m); const s = createContactShadow(r * 2.1, 0.32); s.position.set(x, 0.015, z); props.add(s); return m; };
  plinth(-7.5, -4, 1.1, 1.0, 0xdcd1bf); plinth(7.8, -5.5, 1.9, 0.95, 0xc4623a); plinth(-11.5, -8, 2.6, 1.1, 0xe9e3d8);
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.55, 8 + (i % 3), 0.55), clay(i % 2 ? 0xc4623a : 0xd8cebd, 0.92)); m.position.set(-12 + i * 5.2 + (i > 2 ? 6 : 0), 4.2, -9.2); props.add(m); }
  const heroShadow = createContactShadow(4.2, 0.4); heroShadow.position.set(HERO.x, 0.016, HERO.z); scene.add(heroShadow);

  // ── hero: ray-marched liquid metal
  const hero = createLiquidMetal({ balls: 6, steps: B.sdfSteps, extent: 3.3, tint: 0xeef0f4, sky: new THREE.Color(1.15, 1.08, 1.0), ground: 0x2a211b, key: 0xffffff, film: 0.38, ripple: 0.011 });
  hero.mesh.position.copy(HERO); scene.add(hero.mesh);

  // ── chrome ring: reflects the WORLD through a live probe (static env on low tier)
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.06, envMapIntensity: 1.1 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.07, 24, 160), ringMat); ring.position.copy(HERO); ring.rotation.x = Math.PI / 2.2; scene.add(ring);
  const probe = B.fx.probe ? createLiveProbe(renderer, scene, { size: tier === "high" ? 128 : 64, position: HERO, every: 4, hide: [ring] }) : null;
  ringMat.envMap = probe ? probe.texture : ctx.env;

  // ── swarm: GPU curl-noise particles, dark speck + terracotta on a light ground (normal blending, not additive)
  const side = particleSide(32768, B.particles);
  const swarm = createGpuParticles({ renderer, size: side, radius: 3.4, center: HERO, color: 0x2b2420, color2: 0xb4491f, pointSize: 0.055, blending: "normal", curl: 1.15, speed: 1.2, life: 10 });
  swarm.points.renderOrder = 3; scene.add(swarm.points); swarm.warm(120);

  // ── capture: Gaussian splats
  const nKnot = Math.min(B.splats, 90_000);
  const knot = createSplats(generateKnot(nKnot, { radius: 1.9, tube: 0.36, colors: [0x15161c, 0x3b2a2a, 0xc4501f, 0xf0c9a0] }));
  const dust = createSplats(generateCloud(Math.min(9000, Math.round(B.splats * 0.12)), { radius: 7, size: 0.035, colors: [0x2b2420, 0xb4491f, 0x8a7d6b], seed: 11 }));
  for (const s of [knot, dust]) { s.mesh.position.copy(KNOT); s.mesh.scale.setScalar(1.35); s.mesh.renderOrder = 2; scene.add(s.mesh); }
  const knotShadow = createContactShadow(5, 0.3); knotShadow.position.set(KNOT.x, 0.014, KNOT.z); scene.add(knotShadow);
  const vp = new THREE.Vector2();

  const post = { ao: { radius: 0.95, intensity: 1.0 }, dof: { focus: "auto" as number | "auto", aperture: tier === "high" ? 2.4 : 1.8, maxBlur: 0.02 } };
  const cfg = {
    fuse: { k: 1.05, r: [0.95, 0.7, 0.66, 0.6, 0.56, 0.5] },
    scatter: { k: 0.32, r: [0.5, 0.42, 0.38, 0.34, 0.3, 0.26] },
    ring: { k: 0.9, r: [0.46, 0.46, 0.46, 0.46, 0.46, 0.46] },
    final: { k: 1.2, r: [1.05, 0.8, 0.72, 0.62, 0.56, 0.48] },
  };
  const tmp = new THREE.Vector3(), a = new THREE.Vector3();
  let probed = false;

  const layout = (p: number, t: number) => {
    const sFuse1 = 1 - smoothstep(0.12, 0.3, p), sScatter = smoothstep(0.12, 0.3, p) - smoothstep(0.46, 0.58, p), sRing = smoothstep(0.46, 0.58, p) - smoothstep(0.82, 0.94, p), sFinal = smoothstep(0.82, 0.94, p);
    let k = 0;
    for (let i = 0; i < 6; i++) {
      const ph = (i / 6) * Math.PI * 2;
      // fused: a tight, slowly churning cluster
      const fuse = tmp.set(Math.cos(t * 0.5 + i * 1.05) * 0.4, Math.sin(t * 0.43 + i * 1.4) * 0.34, Math.sin(t * 0.37 + i * 2.1) * 0.4).multiplyScalar(i === 0 ? 0.2 : 1);
      a.copy(fuse).multiplyScalar(sFuse1);
      // scatter: a spiral of droplets that breathes
      a.add(tmp.set(Math.cos(ph + t * 0.35) * (1.7 + 0.35 * Math.sin(t * 0.6 + i)), Math.sin(ph * 2 + t * 0.3) * 0.9, Math.sin(ph + t * 0.35) * (1.7 + 0.35 * Math.sin(t * 0.6 + i))).multiplyScalar(i === 0 ? 0 : sScatter));
      // ring: a vertical loop that fuses into one band
      a.add(tmp.set(Math.cos(ph - t * 0.25) * 1.55, Math.sin(ph - t * 0.25) * 1.55, 0).multiplyScalar(sRing));
      // final: calm, close, fused again
      a.add(tmp.set(Math.cos(t * 0.3 + i * 1.2) * 0.34, Math.sin(t * 0.26 + i * 1.7) * 0.3, Math.sin(t * 0.22 + i * 2.3) * 0.3).multiplyScalar(i === 0 ? 0.15 : sFinal));
      const r = cfg.fuse.r[i] * sFuse1 + cfg.scatter.r[i] * sScatter + cfg.ring.r[i] * sRing + cfg.final.r[i] * sFinal;
      hero.balls[i].set(a.x, a.y, a.z, r);
    }
    k = cfg.fuse.k * sFuse1 + cfg.scatter.k * sScatter + cfg.ring.k * sRing + cfg.final.k * sFinal;
    hero.uniforms.uK.value = k;
  };

  return {
    scene, shots: MERIDIAN_SHOTS, shotsMobile: MERIDIAN_SHOTS_MOBILE, fov: 34, exposure: L.exposure, bloom: L.bloom, grade: L.grade, post, mode: "light", parallax: 0.55,
    update(f: Frame) {
      const { p, time: t } = f;
      const vh = renderer.domElement.height, vw = renderer.domElement.width;
      layout(p, t);
      hero.update(f, vh);
      heroShadow.scale.setScalar(1 + (hero.balls[1].length() > 1 ? 0.2 : 0));
      ring.rotation.z = p * 5 + t * 0.15; ring.scale.setScalar(1 + 0.05 * Math.sin(t * 0.7));
      ring.visible = p < 0.2 || p > 0.74; ring.position.y = HERO.y;
      // swarm: only alive in chapters 1–2; aimed at the hero by the playhead
      const sw = smoothstep(0.1, 0.2, p) * (1 - smoothstep(0.46, 0.58, p));
      swarm.points.visible = sw > 0.01; swarm.material.uniforms.uAlpha.value = sw * 0.9;
      swarm.setAttractor(HERO, 0.55 * seg(p, 0.18, 0.34), 0.65 * seg(p, 0.2, 0.4));
      if (swarm.points.visible) swarm.update(f, vh);
      // capture: draw only while the camera can see it
      const kv = smoothstep(0.38, 0.5, p) * (1 - smoothstep(0.86, 0.94, p));
      knot.mesh.visible = dust.mesh.visible = kv > 0.01;
      if (knot.mesh.visible) {
        vp.set(vw, vh);
        knot.mesh.rotation.y = t * 0.12 + p * 1.4; dust.mesh.rotation.y = -t * 0.04;
        knot.update(f.camera, vp, kv); dust.update(f.camera, vp, kv * 0.8);
      }
      // aperture opens through the swarm (soft, painterly) and closes for the capture + final image; focus follows the camera's look target
      post.dof.aperture = (tier === "high" ? 2.4 : 1.8) * (1 + 0.5 * Math.sin(Math.min(1, p / 0.42) * Math.PI));
      post.ao.intensity = 0.9 + 0.25 * (1 - sw);
      if (probe) { probe.update(!probed); probed = true; }
    },
    dispose() { hero.dispose(); swarm.dispose(); knot.dispose(); dust.dispose(); probe?.dispose(); },
  };
}
