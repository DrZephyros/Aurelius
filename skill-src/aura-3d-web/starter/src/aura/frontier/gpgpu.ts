import * as THREE from "three";
import type { Frame } from "../contract";

/* ─────────────────────────────────────────────────────────────
   AURA · frontier/gpgpu.ts — GPU PARTICLES. Positions live in a float texture and are integrated by a fragment shader (ping-pong),
   so 16 k → 262 k particles cost one draw call and ~zero CPU. The field is a divergence-free CURL flow (smooth, never clumps) plus an optional
   attractor + swirl you can aim at the hero. The Points shader reads the texture in the vertex stage (vertex texture fetch).

   · `size` is the texture side: count = size². Pick it from the budget: size = 2^round(log2(sqrt(base * budget.particles)))
   · stateful by nature → call warm() once after build so a given seed always starts in the same place (QA-stable screenshots)
   · reduced motion: step() is skipped when f.reduced → the cloud holds still
   ───────────────────────────────────────────────────────────── */

export interface GpuParticlesOptions {
  renderer: THREE.WebGLRenderer;
  /** texture side (count = size²). 64 → 4 k · 128 → 16 k · 256 → 65 k · 512 → 262 k */
  size?: number;
  /** radius of the spawn shell */
  radius?: number;
  center?: THREE.Vector3;
  color?: THREE.ColorRepresentation;
  /** second colour — mixed by age/speed */
  color2?: THREE.ColorRepresentation;
  /** point size in world units (perspective-attenuated) */
  pointSize?: number;
  blending?: "add" | "normal";
  /** curl strength / speed / life in seconds */
  curl?: number;
  speed?: number;
  life?: number;
  seed?: number;
}

const SIM_VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }";
const SIM_FRAG = /* glsl */ `
  precision highp float; varying vec2 vUv;
  uniform sampler2D tPos; uniform float uDt, uTime, uSpeed, uCurl, uFirst, uLife, uRadius, uSeed, uSwirl;
  uniform vec3 uCenter; uniform vec4 uAttract;
  float h11(float n){ return fract(sin(n * 127.1 + uSeed) * 43758.5453); }
  vec3 h31(float n){ return vec3(h11(n), h11(n + 17.3), h11(n + 41.7)); }
  vec3 pot(vec3 p){
    p += vec3(0., uTime * .13, uTime * .09);
    return vec3(sin(p.y * 1.2 + 1.3) + sin(p.z * 2.3 + .7) * .5 + sin(p.y * 3.7 + p.z * 2.9) * .25,
                sin(p.z * 1.1 + 2.1) + sin(p.x * 2.1 + 1.7) * .5 + sin(p.z * 3.3 + p.x * 2.5) * .25,
                sin(p.x * 1.4 + .3) + sin(p.y * 2.2 + 2.9) * .5 + sin(p.x * 3.1 + p.y * 2.7) * .25);
  }
  vec3 curl(vec3 p){
    const float e = .02; vec3 dx = vec3(e, 0., 0.), dy = vec3(0., e, 0.), dz = vec3(0., 0., e);
    return vec3((pot(p + dy).z - pot(p - dy).z) - (pot(p + dz).y - pot(p - dz).y),
                (pot(p + dz).x - pot(p - dz).x) - (pot(p + dx).z - pot(p - dx).z),
                (pot(p + dx).y - pot(p - dx).y) - (pot(p + dy).x - pot(p - dy).x)) / (2. * e);
  }
  void main(){
    vec4 s = texture2D(tPos, vUv);
    float id = vUv.x * 311. + vUv.y * 1733.;
    if (uFirst > .5 || s.w <= 0.) {
      vec3 r = h31(id + floor(uTime * 7.)) * 2. - 1.;
      vec3 d = normalize(r + 1e-4) * (.55 + .45 * pow(h11(id + 3.1), .5));
      s = vec4(uCenter + d * uRadius, uLife * (.35 + .65 * h11(id + 9.7)) * (uFirst > .5 ? h11(id + 2.2) : 1.));
    } else {
      vec3 p = s.xyz, toA = uAttract.xyz - p;
      vec3 v = curl(p * .45) * uCurl;
      v += normalize(toA + 1e-4) * uAttract.w / (1. + dot(toA, toA) * .08);
      v += cross(vec3(0., 1., 0.), toA) * uSwirl / (1. + dot(toA, toA) * .15) * -1.;
      s.xyz += v * uSpeed * uDt; s.w -= uDt;
    }
    gl_FragColor = s;
  }`;

const PT_VERT = /* glsl */ `
  uniform sampler2D tPos; uniform float uSize, uScale, uLife;
  attribute vec2 aRef; varying float vA; varying float vMix;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main(){
    vec4 s = texture2D(tPos, aRef);
    vec4 mv = modelViewMatrix * vec4(s.xyz, 1.);
    gl_Position = projectionMatrix * mv;
    float age = clamp(s.w / uLife, 0., 1.);
    vA = smoothstep(0., .12, age) * smoothstep(1.02, .7, age) * step(.0001, s.w);
    vMix = h(aRef);
    gl_PointSize = clamp(uSize * uScale / max(-mv.z, .1) * (.45 + vMix), 1.5, 64.);
  }`;
const PT_FRAG = /* glsl */ `
  uniform vec3 uC1, uC2; uniform float uAlpha; varying float vA; varying float vMix;
  void main(){
    vec2 q = gl_PointCoord - .5; float r = dot(q, q) * 4.;
    float a = smoothstep(1., .15, r) * vA * uAlpha; if (a < .004) discard;
    gl_FragColor = vec4(mix(uC1, uC2, vMix), a);
  }`;

export function createGpuParticles(o: GpuParticlesOptions) {
  const { renderer } = o;
  const N = o.size ?? 128;
  const type = renderer.extensions.has("EXT_color_buffer_float") ? THREE.FloatType : THREE.HalfFloatType;
  const mk = () => new THREE.WebGLRenderTarget(N, N, { type, format: THREE.RGBAFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false, stencilBuffer: false });
  let read = mk(), write = mk();
  const life = o.life ?? 9;
  const sim = new THREE.ShaderMaterial({
    vertexShader: SIM_VERT, fragmentShader: SIM_FRAG, depthTest: false, depthWrite: false,
    uniforms: { tPos: { value: null }, uDt: { value: 1 / 60 }, uTime: { value: 0 }, uSpeed: { value: o.speed ?? 1 }, uCurl: { value: o.curl ?? 1 }, uFirst: { value: 1 }, uLife: { value: life }, uRadius: { value: o.radius ?? 5 }, uSeed: { value: o.seed ?? 1 }, uSwirl: { value: 0 }, uCenter: { value: o.center?.clone() ?? new THREE.Vector3() }, uAttract: { value: new THREE.Vector4(0, 0, 0, 0) } },
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), sim);
  const simScene = new THREE.Scene(); simScene.add(quad);
  const simCam = new THREE.Camera();

  const geo = new THREE.BufferGeometry();
  const ref = new Float32Array(N * N * 2);
  for (let i = 0; i < N * N; i++) { ref[i * 2] = ((i % N) + 0.5) / N; ref[i * 2 + 1] = (Math.floor(i / N) + 0.5) / N; }
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * N * 3), 3));
  geo.setAttribute("aRef", new THREE.BufferAttribute(ref, 2));
  const mat = new THREE.ShaderMaterial({
    vertexShader: PT_VERT, fragmentShader: PT_FRAG, transparent: true, depthWrite: false,
    blending: o.blending === "normal" ? THREE.NormalBlending : THREE.AdditiveBlending,
    uniforms: { tPos: { value: read.texture }, uSize: { value: o.pointSize ?? 0.05 }, uScale: { value: 900 }, uLife: { value: life }, uC1: { value: new THREE.Color(o.color ?? 0xffffff) }, uC2: { value: new THREE.Color(o.color2 ?? o.color ?? 0xffffff) }, uAlpha: { value: 1 } },
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.userData.noDepth = true;

  let first = true, clock = 0, acc = 0;
  const step = (dt: number) => {
    const prev = renderer.getRenderTarget();
    sim.uniforms.tPos.value = read.texture; sim.uniforms.uDt.value = dt; sim.uniforms.uTime.value = clock; sim.uniforms.uFirst.value = first ? 1 : 0;
    renderer.setRenderTarget(write); renderer.render(simScene, simCam); renderer.setRenderTarget(prev);
    [read, write] = [write, read]; mat.uniforms.tPos.value = read.texture; first = false; clock += dt;
  };
  return {
    points, count: N * N, uniforms: sim.uniforms, material: mat,
    /** aim the field: xyz = attractor, strength 0 = free flow. swirl spins the cloud around the attractor (Y axis). */
    setAttractor(p: THREE.Vector3, strength: number, swirl = 0) { sim.uniforms.uAttract.value.set(p.x, p.y, p.z, strength); sim.uniforms.uSwirl.value = swirl; },
    /** run n fixed steps so the starting state is deterministic (QA-stable) */
    warm(n = 90) { for (let i = 0; i < n; i++) step(1 / 60); },
    update(f: Frame, viewportH: number) {
      mat.uniforms.uScale.value = viewportH * 0.9;
      if (f.reduced) return;
      acc += Math.min(f.dt, 0.05);
      let n = 0; while (acc >= 1 / 60 && n++ < 3) { step(1 / 60); acc -= 1 / 60; } // fixed step → identical motion at 60 and 144 Hz
    },
    dispose() { read.dispose(); write.dispose(); geo.dispose(); mat.dispose(); sim.dispose(); quad.geometry.dispose(); },
  };
}

/** texture side for a budget: base count × budget.particles, rounded to a power of two between 32 and 512 */
export function particleSide(baseCount: number, scale: number) {
  return THREE.MathUtils.clamp(2 ** Math.round(Math.log2(Math.sqrt(Math.max(1, baseCount * scale)))), 32, 512);
}
