import * as THREE from "three";
import type { V3 } from "./engine";

/* ─────────────────────────────────────────────────────────────
   AURA · particles.ts — GPU particle field (dust, embers, snow, stardust, fireflies, spores).
   All motion is in the vertex shader: 1 draw call, 10k+ points, free on the CPU.
   Particles are the cheapest way to make air visible, and visible air is what sells DEPTH.
   Use 3 sizes/depth bands (foreground bokeh · mid dust · far stars) — never one uniform cloud.
   ───────────────────────────────────────────────────────────── */

export interface ParticleOptions {
  count?: number;
  /** half-extents of the box the particles live in */
  extent?: V3;
  /** base point size in px at distance 10 */
  size?: number;
  color?: THREE.ColorRepresentation;
  color2?: THREE.ColorRepresentation;
  /** drift speed multiplier */
  speed?: number;
  /** 0..1 how much the field streaks/expands with scroll velocity */
  reactivity?: number;
  opacity?: number;
}

export function createParticles(o: ParticleOptions = {}) {
  const count = o.count ?? 2400;
  const ext = o.extent ?? [14, 8, 30];
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() * 2 - 1) * ext[0];
    pos[i * 3 + 1] = (Math.random() * 2 - 1) * ext[1];
    pos[i * 3 + 2] = (Math.random() * 2 - 1) * ext[2];
    seed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uVel: { value: 0 },
      uSize: { value: o.size ?? 2.2 },
      uSpeed: { value: o.speed ?? 1 },
      uReact: { value: o.reactivity ?? 0.6 },
      uOpacity: { value: o.opacity ?? 0.8 },
      uExt: { value: new THREE.Vector3(...ext) },
      uC1: { value: new THREE.Color(o.color ?? 0xbfe8ff) },
      uC2: { value: new THREE.Color(o.color2 ?? 0xffc98a) },
      uPx: { value: Math.min(devicePixelRatio || 1, 2) },
    },
    vertexShader: /* glsl */ `
      attribute vec4 aSeed; uniform float uTime, uVel, uSize, uSpeed, uReact, uPx; uniform vec3 uExt;
      varying float vA; varying float vMix;
      void main(){
        vec3 p = position;
        float t = uTime * uSpeed;
        // lazy turbulence, each particle on its own phase
        p.x += sin(t * .21 + aSeed.x * 40.) * .6 + sin(t * .07 + aSeed.w * 20.) * 1.2;
        p.y += cos(t * .17 + aSeed.y * 40.) * .5 + t * .06 * (aSeed.z - .3);
        p.z += sin(t * .13 + aSeed.z * 40.) * .6;
        // wrap vertically so rising dust never runs out
        p.y = mod(p.y + uExt.y, uExt.y * 2.) - uExt.y;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        float dist = -mv.z;
        float size = uSize * (.4 + aSeed.z * 1.6) * (1. + uVel * uReact * 2.);
        gl_PointSize = clamp(size * uPx * 10. / max(dist, .1) * 8., 1., 64.);
        gl_Position = projectionMatrix * mv;
        // fade very near (avoid pops) and very far
        vA = smoothstep(.6, 3., dist) * (1. - smoothstep(26., 52., dist)) * (.35 + aSeed.x * .65);
        // twinkle
        vA *= .65 + .35 * sin(t * (.8 + aSeed.y * 2.) + aSeed.w * 30.);
        vMix = aSeed.y;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uC1, uC2; uniform float uOpacity; varying float vA; varying float vMix;
      void main(){
        float d = length(gl_PointCoord - .5);
        float a = smoothstep(.5, 0., d); a *= a;
        if (a < .003) discard;
        gl_FragColor = vec4(mix(uC1, uC2, vMix), a * vA * uOpacity);
      }`,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return {
    points,
    uniforms: mat.uniforms,
    /** call from AuraScene.update(f) */
    update(time: number, velocity: number) {
      mat.uniforms.uTime.value = time;
      mat.uniforms.uVel.value = Math.min(velocity, 1.5);
    },
  };
}
