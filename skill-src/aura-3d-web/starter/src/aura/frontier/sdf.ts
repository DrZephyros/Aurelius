import * as THREE from "three";
import type { Frame } from "../contract";

/* ─────────────────────────────────────────────────────────────
   AURA · frontier/sdf.ts — a RAY-MARCHED hero (RawShaderMaterial, GLSL3) with smooth-union METABALLS.

   Why it exists: a mesh hero (even a good one) is the same polygon look in every world. A signed-distance hero can MERGE, SPLIT, POUR and
   re-form — topology no mesh can do — and it reflects a designed studio analytically, so it is razor-sharp at any zoom.

   · lives inside a bounding box (BackSide) → correct for a camera outside OR inside; start/stop of the ray come from a slab test
   · writes gl_FragDepth → occludes / is occluded by ordinary meshes, and takes part in the AO + DOF depth pre-pass (userData.depthMaterial)
   · analytic edge coverage in alpha + alphaToCoverage → clean silhouettes on MSAA targets (SDF edges are invisible to MSAA otherwise)
   · tier-budgeted: `steps` comes from ctx.budget.sdfSteps
   Drive it from the playhead: write `hero.balls[i].set(x, y, z, r)` in update(). Smooth-union `k` is the "stickiness" — animate it for pour / snap.
   ───────────────────────────────────────────────────────────── */

export interface LiquidMetalOptions {
  balls?: number;
  steps?: number;
  /** half-size of the bounding box in object space — must contain every ball + its radius */
  extent?: number;
  /** base reflectance (chrome ≈ 0.9 neutral; gold ≈ [1, .78, .36]) */
  tint?: THREE.ColorRepresentation;
  /** studio colours the metal reflects — the single biggest lever on the look */
  sky?: THREE.ColorRepresentation;
  ground?: THREE.ColorRepresentation;
  key?: THREE.ColorRepresentation;
  /** thin-film iridescence 0..1 */
  film?: number;
  /** surface ripple amplitude (0 = glass-smooth). Freezes with reduced motion because it is driven by f.time. */
  ripple?: number;
}

const VERT = /* glsl */ `
precision highp float; precision highp int;
in vec3 position;
uniform mat4 modelMatrix, viewMatrix, projectionMatrix;
uniform vec3 cameraPosition;
out vec3 vObj; out vec3 vCam;
void main(){
  vObj = position;
  vCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.)).xyz;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.);
}`;

const FRAG = /* glsl */ `
precision highp float; precision highp int;
uniform mat4 modelMatrix, viewMatrix, projectionMatrix;
uniform vec4 uBalls[NB];
uniform float uK, uTime, uRipple, uFilm, uExtent, uPx;
uniform vec3 uTint, uSky, uGround, uKey;
in vec3 vObj; in vec3 vCam;
layout(location = 0) out highp vec4 fragColor;

float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.) / k; return min(a, b) - h * h * k * .25; }
float map(vec3 p){
  float d = 1e5;
  for (int i = 0; i < NB; i++) d = smin(d, length(p - uBalls[i].xyz) - uBalls[i].w, uK);
  d += uRipple * sin(p.x * 7. + uTime * 1.3) * sin(p.y * 6. - uTime * 1.1) * sin(p.z * 8. + uTime * .9);
  return d;
}
vec3 nrm(vec3 p){
  const vec2 e = vec2(1., -1.) * .0025;
  return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}
float softbox(vec3 d, vec3 c, vec2 s, float soft){
  vec3 r = normalize(cross(abs(c.y) > .95 ? vec3(1., 0., 0.) : vec3(0., 1., 0.), c)), u = cross(c, r);
  float f = dot(d, c); if (f <= 0.) return 0.;
  vec2 q = vec2(dot(d, r), dot(d, u)) / f;
  vec2 m = smoothstep(s + soft, s - soft, abs(q));
  return m.x * m.y;
}
/* the reflected studio: gradient sky over a dark horizon band, a big key softbox, a thin strip, a warm kicker */
vec3 studio(vec3 d){
  float up = d.y * .5 + .5;
  vec3 col = mix(uGround, uSky, smoothstep(.34, .78, up));
  col *= 1. - .55 * exp(-pow((d.y + .02) * 7., 2.));
  col += uKey * (softbox(d, normalize(vec3(-.55, .65, .55)), vec2(.62, .42), .12) * 3.2 + softbox(d, normalize(vec3(.85, .25, .1)), vec2(.07, .75), .05) * 2.2);
  col += uKey * vec3(1., .72, .5) * softbox(d, normalize(vec3(.2, .3, -.9)), vec2(.5, .15), .1) * 1.6;
  return col;
}

void main(){
  vec3 ro = vCam, rd = normalize(vObj - vCam);
  vec3 inv = 1. / rd, t0 = (-vec3(uExtent) - ro) * inv, t1 = (vec3(uExtent) - ro) * inv;
  float tN = max(max(min(t0.x, t1.x), min(t0.y, t1.y)), max(min(t0.z, t1.z), 0.)), tF = min(min(max(t0.x, t1.x), max(t0.y, t1.y)), max(t0.z, t1.z));
  if (tF < tN) discard;
  float t = tN, ratio = 1e5, tBest = tN; bool hit = false;
  for (int i = 0; i < STEPS; i++) {
    float d = map(ro + rd * t);
    float r = d / max(t, 1e-3);
    if (r < ratio) { ratio = r; tBest = t; }
    if (d < .0012 * max(t * .6, 1.)) { hit = true; break; }
    t += d * .86;
    if (t > tF) break;
  }
  float cov = hit ? 1. : 1. - smoothstep(0., 1.4 * uPx, ratio);
  if (cov < .02) discard;
  if (!hit) t = tBest;
  vec3 P = ro + rd * t;
  vec4 clip = projectionMatrix * viewMatrix * modelMatrix * vec4(P, 1.);
  gl_FragDepth = clamp(clip.z / clip.w * .5 + .5, 0., 1.);
#ifdef DEPTH_ONLY
  if (cov < .5) discard;
  fragColor = vec4(0.);
#else
  vec3 N = nrm(P), V = -rd;
  float ndv = clamp(dot(N, V), 0., 1.), fres = pow(1. - ndv, 4.);
  vec3 R = reflect(rd, N);
  vec3 refl = studio(R);
  vec3 film = .5 + .5 * cos(6.2831853 * (ndv * 1.25 + P.y * .15 + vec3(0., .33, .67)));
  vec3 F = mix(uTint, vec3(1.), fres * .85);
  vec3 col = refl * F;
  col = mix(col, col * film * 1.7, uFilm * (.3 + .7 * fres));
  float ao = 1.; for (int i = 1; i <= 4; i++) { float h = .06 * float(i); ao -= (h - map(P + N * h)) * (.45 / float(i)); }
  col *= mix(.45, 1., clamp(ao, 0., 1.));
  col += uKey * pow(max(dot(R, normalize(vec3(-.55, .65, .55))), 0.), 90.) * .6; // the specular point a softbox cannot give
  fragColor = vec4(col, cov);
#endif
}`;

export function createLiquidMetal(o: LiquidMetalOptions = {}) {
  const NB = o.balls ?? 6, extent = o.extent ?? 3.2;
  const balls = Array.from({ length: NB }, () => new THREE.Vector4(0, 0, 0, 0.5));
  const col = (c: THREE.ColorRepresentation) => new THREE.Color(c);
  const uniforms = {
    uBalls: { value: balls }, uK: { value: 0.9 }, uTime: { value: 0 }, uRipple: { value: o.ripple ?? 0.012 }, uFilm: { value: o.film ?? 0.35 }, uExtent: { value: extent }, uPx: { value: 0.002 },
    uTint: { value: col(o.tint ?? 0xe9edf2) }, uSky: { value: col(o.sky ?? 0xffffff) }, uGround: { value: col(o.ground ?? 0x2a2622) }, uKey: { value: col(o.key ?? 0xffffff) },
  };
  const make = (depthOnly: boolean) => new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: VERT, fragmentShader: FRAG, uniforms,
    defines: { NB, STEPS: o.steps ?? 64, ...(depthOnly ? { DEPTH_ONLY: 1 } : {}) },
    side: THREE.BackSide, transparent: false, depthWrite: true, depthTest: true, alphaToCoverage: !depthOnly, colorWrite: !depthOnly,
  });
  const material = make(false);
  const depthMaterial = make(true);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(extent * 2, extent * 2, extent * 2), material);
  mesh.userData.depthMaterial = depthMaterial;
  mesh.frustumCulled = false; // the box is the bound; camera-inside cases must never cull it
  mesh.renderOrder = 1;
  return {
    mesh, balls, uniforms, material,
    /** call every frame — keeps edge coverage correct for the current lens and size */
    update(f: Frame, viewportH: number) {
      uniforms.uTime.value = f.time;
      uniforms.uPx.value = (2 * Math.tan((f.camera.fov * Math.PI) / 360)) / Math.max(1, viewportH);
    },
    dispose() { mesh.geometry.dispose(); material.dispose(); depthMaterial.dispose(); },
  };
}
