import * as THREE from "three";
import type { AuraScene, BuildContext, Frame, Shot } from "./types";
import { createGlow, createLightShafts } from "./atmosphere";
import { createStudioEnv } from "./studio";
import { clamp, seg, smoothstep } from "./choreo";
import { diveWatch } from "./watch";
import { fillAt, lightAt } from "./depth";

/* ─────────────────────────────────────────────────────────────
   TIDEWELL · scene.tidewell.ts — a descent.

   The watch never leaves the origin. The WORLD rises past it: the surface (sun window, ripples, shafts) slides up and away,
   marine snow streams upward, the water darkens. That keeps the hero composition stable and the camera free to be a camera.
   Everything reads ONE number — the damped playhead p — through depth.ts:
     lightAt(p)  → surface light still reaching us (water colour, shafts, sun, key light, snow)
     fillAt(p)   → how many of the dial's 60 markers have charged (5 m each)
   ───────────────────────────────────────────────────────────── */

/* Camera rail. The look-at is offset sideways in the chapters that carry copy, so the watch sits opposite the text
   (copy-left → watch-right) instead of fighting it. Same `at` windows as the DOM chapters in Tidewell.tsx. */
export const SHOTS: Shot[] = [
  { at: 0.0, pos: [0.3, -0.4, 8.4], look: [-1.5, 0.7, 0], fov: 34 },      // 1 SURFACE — watch right of centre, clear of the headline; the light above it
  { at: 0.15, pos: [2.5, 0.3, 7.8], look: [1.5, 0.2, 0], fov: 30 },       // 2 DESCENT — approach from the right, watch to the left
  { at: 0.33, pos: [2.2, 0.2, 7.0], look: [1.45, 0.15, 0], fov: 29 },     //   …a slow push while the chapter is read (side never changes under the copy)
  { at: 0.39, pos: [-2.6, 0.6, 6.4], look: [-1.3, 0.15, 0], fov: 27, ease: "inOut" }, // 3 LUME — macro, watch to the right
  { at: 0.55, pos: [-2.3, 0.35, 6.1], look: [-1.3, 0.1, 0], fov: 27 },    //   …hold
  { at: 0.61, pos: [2.7, -0.4, 6.4], look: [1.35, 0, 0.1], fov: 28, ease: "inOut" }, // 4 DARK — low angle across the bezel and crown
  { at: 0.79, pos: [2.4, -0.3, 6.1], look: [1.35, 0, 0.1], fov: 28 },     //   …hold
  { at: 0.88, pos: [0.4, 0.2, 8.2], look: [0, -0.2, 0], fov: 32 },        // pull back: one lit watch in the black
  { at: 1.0, pos: [0, 0.15, 9.0], look: [0, -0.8, 0], fov: 31 },         // 5 FINAL IMAGE — symmetrical, watch high, CTA below
];

export const SHOTS_MOBILE: Shot[] = [
  { at: 0.0, pos: [0.2, -0.3, 8.8], look: [0, 0.35, 0], fov: 50 },
  { at: 0.17, pos: [1.2, 0.2, 7.2], look: [0.3, -0.2, 0], fov: 48 },
  { at: 0.36, pos: [-1.2, 0.5, 5.8], look: [-0.2, -0.3, 0], fov: 46, ease: "inOut" },
  { at: 0.54, pos: [-1.0, 0.3, 5.6], look: [-0.15, -0.3, 0], fov: 46 },
  { at: 0.64, pos: [1.5, -0.4, 5.8], look: [0.3, -0.3, 0.1], fov: 46, ease: "inOut" },
  { at: 0.78, pos: [1.3, -0.3, 5.6], look: [0.3, -0.3, 0.1], fov: 46 },
  { at: 0.88, pos: [0.3, 0.1, 8.2], look: [0, -0.4, 0], fov: 50 },
  { at: 1.0, pos: [0, 0.1, 8.9], look: [0, -0.6, 0], fov: 50 },
];

const NOISE = /* glsl */ `
  float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), f.x), f.y); }
  float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++){ v += vn(p) * a; p = p * 2.03 + 11.7; a *= .5; } return v; }
`;

/** the water itself: a camera-centred dome. Surface colour only exists while there is surface light to carry it. */
function waterDome(c: { abyss: THREE.Color; mid: THREE.Color; top: THREE.Color }) {
  const uniforms = { uAbyss: { value: c.abyss }, uMid: { value: c.mid }, uTop: { value: c.top }, uLight: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `varying vec3 vW; uniform vec3 uAbyss, uMid, uTop; uniform float uLight;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void main(){
        float h = normalize(vW - cameraPosition).y;
        vec3 col = mix(uAbyss, uMid * uLight + uAbyss, smoothstep(-0.75, 0.25, h));       // the body of the water
        col = mix(col, uTop * uLight + uAbyss, smoothstep(0.0, 0.95, h));                  // brighter toward the surface
        col += uTop * uLight * smoothstep(0.6, 1.0, h) * 0.22;                             // Snell's window straight up
        col += uAbyss * (1. - abs(h)) * 0.8;                                               // keep the dark from going flat at the horizon
        col += (h21(gl_FragCoord.xy) - .5) * .004;                                         // dither: no banding in the long gradient
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 20), mat);
  m.frustumCulled = false; m.renderOrder = -10;
  return { mesh: m, uniforms };
}

/** the underside of the surface: slow caustic-like ripples, brightest toward the horizon line */
function surfacePlane() {
  const uniforms = { uTime: { value: 0 }, uLight: { value: 1 }, uColor: { value: new THREE.Color(0x7fd6dc) } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `varying vec3 vW; uniform float uTime, uLight; uniform vec3 uColor;
      ${NOISE}
      void main(){
        vec2 uv = vW.xz;
        float dist = length(vW - cameraPosition);
        float a1 = fbm(uv * .06 + vec2(uTime * .03, 0.)), a2 = fbm(uv * .15 - vec2(0., uTime * .05));
        float rip = pow(smoothstep(.3, .85, a1 * .55 + a2 * .65), 2.2);
        float haze = 1. - smoothstep(90., 520., dist);
        float a = (.07 + rip * .55) * haze * uLight;
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), mat);
  m.rotation.x = -Math.PI / 2; m.renderOrder = -5; m.frustumCulled = false;
  return { mesh: m, uniforms };
}

/** marine snow (lit by the surface, so it dies with it) + plankton that make their own light (so they wake up in the dark) */
function marineSnow(count: number, px: number) {
  const ext = new THREE.Vector3(15, 9, 17);
  const pos = new Float32Array(count * 3), seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    pos.set([(Math.random() * 2 - 1) * ext.x, (Math.random() * 2 - 1) * ext.y, -22 + Math.random() * 34], i * 3);
    seed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
  const uniforms = { uTime: { value: 0 }, uRise: { value: 0 }, uLight: { value: 1 }, uGlow: { value: 0 }, uPx: { value: px }, uExt: { value: ext } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `attribute vec4 aSeed; uniform float uTime, uRise, uLight, uGlow, uPx; uniform vec3 uExt; varying float vA; varying vec3 vC;
      void main(){
        vec3 p = position;
        p.x += sin(uTime * .2 + aSeed.x * 40.) * .35;
        p.z += cos(uTime * .17 + aSeed.z * 40.) * .35;
        p.y = mod(p.y + uRise + uTime * .1 * (aSeed.w * .8 + .2) + uExt.y, uExt.y * 2.) - uExt.y;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        float dist = -mv.z;
        float bio = step(.88, aSeed.y);
        float size = (.45 + aSeed.z * 1.3) * (1. + bio * .9);
        gl_PointSize = clamp(size * uPx * 52. / max(dist, .5), 1., 40.);
        gl_Position = projectionMatrix * mv;
        float lit = mix(uLight * .5 + .06, uGlow, bio);
        vA = smoothstep(.8, 3.5, dist) * (1. - smoothstep(16., 30., dist)) * lit * (.35 + aSeed.x * .65);
        vC = mix(vec3(.7, .93, .96), vec3(.45, 1., .8) * 1.5, bio);
      }`,
    fragmentShader: /* glsl */ `varying float vA; varying vec3 vC;
      void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d); a *= a; if (a < .004) discard; gl_FragColor = vec4(vC, a * vA); }`,
  });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  return { points: pts, uniforms };
}

export function tidewell({ renderer, mobile, tier }: BuildContext): AuraScene {
  const scene = new THREE.Scene();
  const ABYSS = new THREE.Color(0x01060b), MID = new THREE.Color(0x0a4a5c), TOP = new THREE.Color(0x2b94a6);
  scene.background = ABYSS.clone();
  scene.fog = new THREE.FogExp2(ABYSS.clone(), 0.018);

  // ── a designed environment: cool surface light from above, a faint warm kicker, a teal fill → long highlights down the steel
  const env = createStudioEnv(renderer, {
    base: 0x04080e, baseIntensity: 1.2,
    strips: [
      { color: 0xa8eeff, intensity: 3.4, pos: [-9, 5, 4], size: [3.2, 14] },
      { color: 0xdffaff, intensity: 2.6, pos: [0, 11, 1], size: [16, 3.4] },
      { color: 0xffd7b0, intensity: 1.5, pos: [9, 4, -1], size: [2.6, 11] },
      { color: 0x3fd9c4, intensity: 1.7, pos: [5, 0, 10], size: [2.4, 9] },
      { color: 0x24507a, intensity: 1.6, pos: [-4, -7, 8], size: [10, 2.4] },
    ],
  });
  scene.environment = env;

  // ── water + surface
  const dome = waterDome({ abyss: ABYSS, mid: MID, top: TOP });
  scene.add(dome.mesh);

  const surfaceGroup = new THREE.Group();
  const surf = surfacePlane();
  surfaceGroup.add(surf.mesh);
  const sun = createGlow(0xbff4ff, 90, 0.34); sun.position.set(14, 8, -70); surfaceGroup.add(sun);
  // god-rays: kept deliberately gentle — they are a hint of the sun, not the sun (intensity is also driven by lightAt)
  const SHAFT_BASE = 0.5;
  const shafts = [
    createLightShafts({ from: [8, 0, -10], to: [3, -46, -4], color: 0x9fe8f2, spread: 3.2, count: 3, intensity: SHAFT_BASE }),
    createLightShafts({ from: [-9, 0, -16], to: [-2, -46, -6], color: 0x8fdce8, spread: 3.8, count: 3, intensity: SHAFT_BASE * 0.85 }),
    ...(mobile ? [] : [createLightShafts({ from: [1, 0, -26], to: [0, -52, -10], color: 0xb4f0f6, spread: 5, count: 2, intensity: SHAFT_BASE * 0.7 })]),
  ];
  shafts.forEach((s) => surfaceGroup.add(s.group));
  scene.add(surfaceGroup);

  const snow = marineSnow(!mobile ? 1500 : tier === "low" ? 420 : 760, Math.min(devicePixelRatio || 1, 2));
  scene.add(snow.points);

  // ── lights: the sun dies with depth; a cool rim stays so the silhouette never vanishes
  const key = new THREE.DirectionalLight(0xc4f6ff, 2.4); key.position.set(3, 9, 5);
  const rim = new THREE.DirectionalLight(0x4cc3d8, 1.8); rim.position.set(-6, 2, -6);
  const fill = new THREE.HemisphereLight(0x16475a, 0x02070c, 0.45);
  scene.add(key, rim, fill);

  // ── the hero
  const dialGlow = createGlow(0x7affd0, 3.4, 0.03);
  const watch = diveWatch({ mobile, glow: dialGlow });
  scene.add(watch.group);

  const dim = new THREE.Color(), fogC = new THREE.Color();

  return {
    scene,
    shots: SHOTS,
    shotsMobile: SHOTS_MOBILE,
    portraitFit: 0, // the mobile rail is hand-lensed; no automatic widening
    portraitLift: 0.08,
    fov: 34,
    exposure: 0.95,
    bloom: { strength: mobile ? 0.34 : 0.4, radius: 0.6, threshold: 0.92 },
    grade: { vignette: 0.62, grain: 0.05, contrast: 1.07, saturation: 1.05, aberration: 0.012, shadows: [0, 0.018, 0.03], highlights: [0.02, 0.03, 0.02] },
    parallax: 0.55,
    update(f: Frame) {
      const { p, time: t } = f;
      const L = lightAt(p), fill01 = fillAt(p), dark = 1 - L;

      // water: colour only exists where light does
      dome.mesh.position.copy(f.camera.position);
      dome.uniforms.uLight.value = L;
      fogC.copy(ABYSS).lerp(MID, L * 0.75);
      (scene.fog as THREE.FogExp2).color.copy(fogC);
      (scene.background as THREE.Color).copy(dim.copy(ABYSS));

      // the world rises past the watch
      surfaceGroup.position.y = 9 + p * 80;
      surf.uniforms.uTime.value = t; surf.uniforms.uLight.value = L * 0.85;
      (sun.material as THREE.SpriteMaterial).opacity = 0.34 * L;
      shafts.forEach((s, i) => { s.update(t); s.setIntensity(SHAFT_BASE * (1 - i * 0.12) * L); });
      snow.uniforms.uTime.value = t; snow.uniforms.uRise.value = p * 120; snow.uniforms.uLight.value = L; snow.uniforms.uGlow.value = 0.1 + dark * dark * 0.75;

      // light: dappled sun that fades, a rim that stays
      const dapple = 0.9 + Math.sin(t * 1.3) * 0.05 + Math.sin(t * 2.9 + 1.7) * 0.04;
      key.intensity = 2.4 * L * dapple;
      rim.intensity = 0.9 + 1.0 * L;
      fill.intensity = 0.14 + 0.34 * L;
      scene.environmentIntensity = 0.42 + 0.78 * L;

      // the watch: turns a little, breathes, and its bezel clicks round like a real ratchet
      const g = watch.group;
      g.position.y = Math.sin(t * 0.6) * 0.035;
      g.rotation.y = -0.32 * (1 - seg(p, 0, 0.14)) + Math.sin(seg(p, 0.14, 0.88) * Math.PI * 2) * 0.12 + Math.sin(t * 0.45) * 0.03;
      g.rotation.x = -0.12 * (1 - seg(p, 0, 0.2)) + Math.cos(t * 0.37) * 0.02;
      g.rotation.z = (1 - smoothstep(0, 0.5, p)) * 0.1;
      const clicks = p * 30, fr = clicks - Math.floor(clicks);
      watch.bezel.rotation.z = -(Math.floor(clicks) + smoothstep(0.78, 1, fr)) * ((Math.PI * 2) / 60);

      // the dial charges: 5 m per marker; the lume only really burns once the sun is gone
      watch.setCharge(fill01, clamp(0.12 + dark * 0.95), t);
      watch.setHands(p * Math.PI * 2 * 0.95, Math.floor(t * 8) / 8 * 0.62);
    },
    dispose() { env.dispose(); },
  };
}
