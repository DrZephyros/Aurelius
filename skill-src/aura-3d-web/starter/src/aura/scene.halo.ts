import * as THREE from "three";
import type { AuraScene, BuildContext, Frame, Shot } from "./engine";
import { createStudioEnv, productRig, createContactShadow } from "./studio";
import { createRockGround, createBoulders } from "./rock";
import { earbuds } from "./objects";
import { createParticles } from "./particles";
import { createSky, createGlow } from "./atmosphere";
import { ease, seg, pulse } from "./choreo";

/* ─────────────────────────────────────────────────────────────
   AURA · scene.halo.ts — "NOCTA". World #3, a PRODUCT ALTAR (direction 01 in references/11-art-directions.md).
   Concept:   premium earbuds resting on a polished obsidian altar on a cratered asteroid, a black planet limb behind.
              "Silence, engineered." The environment IS the benefit.
   Hero:      earbuds() — case, lid, two buds and three internal parts that rise in the Exploded Ascent.
   Palette:   #05070b void · #7dffd9 LED accent · #9fb4c8 cold rock rim · #e9f1f6 type
   Signature: THE EXPLODED ASCENT (p .38 → .62) — parts rise along ONE axis, staggered, with projected leader-line labels.
   Light:     designed studio environment (strip softboxes) + cold raking key + hard rim + mint practical from the LED.
   ───────────────────────────────────────────────────────────── */

/** Live 3D anchors the DOM shell projects to screen each frame (leader-line labels). `k` = visibility 0..1. */
export const haloAnchors = { battery: new THREE.Vector3(), pcb: new THREE.Vector3(), driver: new THREE.Vector3(), k: 0 };

export function halo({ renderer, mobile }: BuildContext): AuraScene {
  const scene = new THREE.Scene();
  const VOID = 0x04060a;
  scene.background = new THREE.Color(VOID);
  scene.fog = new THREE.FogExp2(0x070b12, mobile ? 0.016 : 0.011);
  scene.environment = createStudioEnv(renderer, { accent: { color: 0x7dffd9, intensity: 3, pos: [6, 0.5, 8], size: [0.5, 5] } });
  scene.environmentIntensity = 0.7;

  // ── ground: asteroid + polished altar + boulders
  const ground = createRockGround({ size: 150, segments: mobile ? 120 : 220, height: 5.5, shelfRadius: 4.4, color: 0x2b323b });
  scene.add(ground.group);
  scene.add(createBoulders({ count: mobile ? 50 : 100, ground, inner: 10, outer: 62 }));
  scene.add(createContactShadow(3.4, 0.8));

  // ── sky + planet limb (cold rim light on a black sphere)
  const sky = createSky({ top: 0x010207, horizon: 0x0b1522, ground: 0x04060a, sunDir: [-0.5, 0.28, -1], sunColor: 0xcfe4ff, sunSize: 0.009, stars: 1.0 });
  scene.add(sky.mesh);
  const planet = new THREE.Mesh(new THREE.SphereGeometry(150, 96, 64), new THREE.MeshStandardMaterial({ color: 0x06080c, roughness: 1, fog: false }));
  planet.position.set(-70, 62, -330);
  const atmos = new THREE.Mesh(
    new THREE.SphereGeometry(153, 96, 64),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      uniforms: { uColor: { value: new THREE.Color(0x6fb4ff) }, uK: { value: 1 } },
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uColor; uniform float uK; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.-clamp(dot(vN,vV),0.,1.), 4.5); gl_FragColor = vec4(uColor*f*1.6*uK, f*uK); }`,
    }),
  );
  atmos.position.copy(planet.position);
  scene.add(planet, atmos);

  // ── hero
  const pod = earbuds({ accent: 0x7dffd9 });
  scene.add(pod.group);
  const rig = productRig({ accent: 0x7dffd9 });
  scene.add(rig.group);
  rig.accent.position.set(0, 0.7, 1.4);
  const ledGlow = createGlow(0x7dffd9, 0.9, 0.0);
  ledGlow.position.set(0, 0.42, 0.95);
  scene.add(ledGlow);

  // ── atmosphere: cold dust band around the altar + near motes that lag the lens (the foreground depth plane)
  const dust = createParticles({ count: mobile ? 500 : 1400, extent: [16, 6, 22], size: 0.7, color: 0x9fc4ff, color2: 0xcfe0f5, opacity: 0.16, speed: 0.5 });
  dust.points.position.set(0, 3, 0);
  const motes = createParticles({ count: mobile ? 30 : 90, extent: [6, 3.5, 8], size: 2.8, color: 0x7dffd9, color2: 0xb8f5e4, opacity: 0.10, speed: 1.2 });
  scene.add(dust.points, motes.points);

  // ── THE RAIL — 8 shots. wide/close alternation, one hold (.74–.9), one composed last frame.
  const shots: Shot[] = [
    { at: 0.0, pos: [-4.6, 0.8, 6.0], look: [0.5, 0.95, 0], fov: 26 }, //                 1 reveal — low, raking the lid edge
    { at: 0.12, pos: [2.2, 2.0, 3.4], look: [-0.1, 1.1, -0.4], fov: 20 }, //              2 macro — across the lacquer to the hinge
    { at: 0.28, pos: [3.8, 2.6, 6.2], look: [0, 1.3, 0], fov: 28, ease: "inOut" }, //       3 crane — the case opens
    { at: 0.42, pos: [5.6, 3.9, 9.8], look: [0, 3.1, 0], fov: 30 }, //                       4 anatomy — slightly high
    { at: 0.6, pos: [4.2, 2.6, 11.5], look: [0, 2.2, 0], fov: 30 }, //                       5 anatomy settles
    { at: 0.7, pos: [10.5, 3.4, 30], look: [-2, 6.5, -40], fov: 36, ease: "inOut" }, //     6 context — pull back, the planet limb enters
    { at: 0.82, pos: [-4.8, 1.1, 9.2], look: [0, 1.2, 0], fov: 25, ease: "inOut" }, //       7 HERO — 3/4 low
    { at: 1.0, pos: [-3.5, 1.2, 7.4], look: [0, 1.2, 0], fov: 23 }, //                       8 final — slow dolly in, centred
  ];

  const tmp = new THREE.Vector3();
  const names = ["battery", "pcb"] as const;
  return {
    scene, shots, fov: 28, exposure: 0.9, parallax: 0.5,
    bloom: { strength: mobile ? 0.4 : 0.55, radius: 0.6, threshold: 1.15 },
    grade: { vignette: 0.75, grain: 0.05, contrast: 1.12, saturation: 0.95, shadows: [0.0, 0.012, 0.03], highlights: [0.0, 0.03, 0.03] },
    update(f: Frame) {
      const { p, time: t } = f;
      // the case opens (.26–.40) and stays open
      pod.setOpen(ease.inOutCubic(seg(p, 0.26, 0.4)));
      // exploded ascent: each part rises on its own staggered window, then re-seats
      pod.parts.forEach((part, i) => {
        const rise = ease.inOutCubic(seg(p, 0.38 + i * 0.012, 0.5 + i * 0.012));
        const fall = ease.inOutCubic(seg(p, 0.6 + (pod.parts.length - i) * 0.008, 0.7));
        const e = rise * (1 - fall);
        part.obj.position.set(part.rest.x + (part.spreadX ?? 0) * e, part.rest.y + part.lift * e, part.rest.z);
        if (part.name.startsWith("bud")) part.obj.rotation.y = e * (part.name === "budL" ? 0.6 : -0.6) + Math.sin(t * 0.6 + i) * 0.04 * e;
      });
      // labels: project from live part positions
      const byName = (n: string) => pod.parts.find((q) => q.name === n)!.obj;
      names.forEach((n) => byName(n).getWorldPosition(haloAnchors[n]));
      byName("budR").getWorldPosition(haloAnchors.driver);
      haloAnchors.k = pulse(p, 0.46, 0.62, 0.05, 0.05);
      // LED breathes, ramps as the case opens, steadies for the hero
      const ign = ease.inOutCubic(seg(p, 0.26, 0.42));
      const led = 0.9 + ign * 2.6 + Math.sin(t * 1.6) * 0.35 * (1 - seg(p, 0.8, 1));
      pod.setLed(led);
      rig.accent.intensity = led * 0.9;
      (ledGlow.material as THREE.SpriteMaterial).opacity = 0.06 + ign * 0.18;
      // the planet limb arrives with the pull-back
      (atmos.material as THREE.ShaderMaterial).uniforms.uK.value = 0.35 + 0.65 * seg(p, 0.56, 0.74);
      sky.update(t);
      // rim light warms to the accent in the hero hold
      rig.rim.intensity = 2.4 + 0.8 * seg(p, 0.76, 0.9);
      motes.points.position.lerp(f.camera.position, 0.07);
      dust.update(t, f.velocity);
      motes.update(t, f.velocity);
      void tmp;
    },
  };
}
