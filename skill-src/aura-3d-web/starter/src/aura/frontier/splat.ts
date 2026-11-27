import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   AURA · frontier/splat.ts — 3D GAUSSIAN SPLATS, in ~150 lines, no dependency.

   · `loadSplat(url)` reads the de-facto `.splat` format (32 bytes / splat: pos f32×3, scale f32×3, rgba u8×4, quat u8×4) — export one from any
     3DGS capture (Luma, Polycam, Postshot, nerfstudio → .splat). `generateKnot()` / `generateCloud()` make zero-asset captures for demos.
   · data live in a float texture (4 texels / splat). The only per-frame upload is the sorted INDEX buffer (4 bytes / splat).
   · each splat is an instanced quad; the vertex shader projects the 3D covariance to a 2D ellipse (Σ' = J W Σ Wᵀ Jᵀ), the fragment shader
     evaluates exp(-r²). Drawn back-to-front with premultiplied alpha. Counting sort on 16-bit depth keys, throttled to camera movement.
   · budget: ctx.budget.splats (180 k / 70 k / 20 k). `trim()` keeps an evenly-spread subset.
   ───────────────────────────────────────────────────────────── */

export interface SplatData { count: number; pos: Float32Array; scale: Float32Array; quat: Float32Array; rgba: Uint8Array }

export async function loadSplat(url: string, max = Infinity): Promise<SplatData> {
  const buf = await (await fetch(url)).arrayBuffer();
  const n = Math.min(Math.floor(buf.byteLength / 32), max), f = new Float32Array(buf), u = new Uint8Array(buf);
  const d: SplatData = { count: n, pos: new Float32Array(n * 3), scale: new Float32Array(n * 3), quat: new Float32Array(n * 4), rgba: new Uint8Array(n * 4) };
  const stride = Math.floor(buf.byteLength / 32) / n; // evenly spread subset when over budget
  for (let i = 0; i < n; i++) {
    const s = Math.floor(i * stride);
    d.pos.set(f.subarray(s * 8, s * 8 + 3), i * 3); d.scale.set(f.subarray(s * 8 + 3, s * 8 + 6), i * 3);
    d.rgba.set(u.subarray(s * 32 + 24, s * 32 + 28), i * 4);
    for (let k = 0; k < 4; k++) d.quat[i * 4 + k] = (u[s * 32 + 28 + k] - 128) / 128; // w, x, y, z
  }
  return d;
}

export function trim(d: SplatData, max: number): SplatData {
  if (d.count <= max) return d;
  const o: SplatData = { count: max, pos: new Float32Array(max * 3), scale: new Float32Array(max * 3), quat: new Float32Array(max * 4), rgba: new Uint8Array(max * 4) };
  for (let i = 0; i < max; i++) { const s = Math.floor((i * d.count) / max); o.pos.set(d.pos.subarray(s * 3, s * 3 + 3), i * 3); o.scale.set(d.scale.subarray(s * 3, s * 3 + 3), i * 3); o.quat.set(d.quat.subarray(s * 4, s * 4 + 4), i * 4); o.rgba.set(d.rgba.subarray(s * 4, s * 4 + 4), i * 4); }
  return o;
}

function rng(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(Math.max(1e-9, r()))) * Math.cos(6.2831853 * r()); }
const hex = (c: THREE.ColorRepresentation) => new THREE.Color(c);

/** a (p,q) torus-knot "capture": flat, tangent-aligned splats along a tube — reads as a scanned sculpture */
export function generateKnot(n: number, o: { p?: number; q?: number; radius?: number; tube?: number; colors?: THREE.ColorRepresentation[]; seed?: number } = {}): SplatData {
  const r = rng(o.seed ?? 7), P = o.p ?? 2, Q = o.q ?? 3, R = o.radius ?? 1.6, tube = o.tube ?? 0.34;
  const cols = (o.colors ?? [0x1a1d2e, 0xff6a3d, 0xffd9a8]).map(hex);
  const d: SplatData = { count: n, pos: new Float32Array(n * 3), scale: new Float32Array(n * 3), quat: new Float32Array(n * 4), rgba: new Uint8Array(n * 4) };
  const C = (t: number, out: THREE.Vector3) => { const k = 0.5 * (2 + Math.sin(Q * t)); return out.set(k * Math.cos(P * t) * R, k * Math.cos(Q * t) * R, k * Math.sin(P * t) * R); };
  const a = new THREE.Vector3(), b = new THREE.Vector3(), T = new THREE.Vector3(), Nn = new THREE.Vector3(), Bn = new THREE.Vector3(), m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const t = r() * Math.PI * 2;
    C(t, a); C(t + 0.01, b); T.copy(b).sub(a).normalize();
    Nn.set(0, 1, 0).cross(T).normalize(); if (Nn.lengthSq() < 0.5) Nn.set(1, 0, 0); Bn.copy(T).cross(Nn).normalize(); Nn.copy(Bn).cross(T).normalize();
    const ang = r() * 6.2831853, rad = tube * Math.sqrt(r()) * (0.75 + 0.25 * gauss(r));
    const px = a.x + (Nn.x * Math.cos(ang) + Bn.x * Math.sin(ang)) * rad, py = a.y + (Nn.y * Math.cos(ang) + Bn.y * Math.sin(ang)) * rad, pz = a.z + (Nn.z * Math.cos(ang) + Bn.z * Math.sin(ang)) * rad;
    d.pos.set([px, py, pz], i * 3);
    d.scale.set([0.05 + r() * 0.05, 0.012 + r() * 0.012, 0.012 + r() * 0.012], i * 3); // long along the tangent (x), thin across
    m.makeBasis(T, Nn, Bn); q.setFromRotationMatrix(m); d.quat.set([q.w, q.x, q.y, q.z], i * 4);
    const u = (Math.sin(t * 3 + rad * 3) * 0.5 + 0.5) * (cols.length - 1), k = Math.min(cols.length - 2, Math.floor(u));
    c.copy(cols[k]).lerp(cols[k + 1], u - k).offsetHSL(0, 0, (r() - 0.5) * 0.08);
    d.rgba.set([c.r * 255, c.g * 255, c.b * 255, 150 + r() * 100], i * 4);
  }
  return d;
}

/** a soft isotropic dust cloud (fog / nebula / bokeh field) */
export function generateCloud(n: number, o: { radius?: number; colors?: THREE.ColorRepresentation[]; seed?: number; size?: number } = {}): SplatData {
  const r = rng(o.seed ?? 3), R = o.radius ?? 3, cols = (o.colors ?? [0xffffff]).map(hex), s = o.size ?? 0.05;
  const d: SplatData = { count: n, pos: new Float32Array(n * 3), scale: new Float32Array(n * 3), quat: new Float32Array(n * 4), rgba: new Uint8Array(n * 4) };
  for (let i = 0; i < n; i++) {
    d.pos.set([gauss(r) * R * 0.45, gauss(r) * R * 0.3, gauss(r) * R * 0.45], i * 3);
    const k = s * (0.5 + r()); d.scale.set([k, k, k], i * 3); d.quat.set([1, 0, 0, 0], i * 4);
    const c = cols[Math.floor(r() * cols.length)]; d.rgba.set([c.r * 255, c.g * 255, c.b * 255, 60 + r() * 120], i * 4);
  }
  return d;
}

const VERT = /* glsl */ `
  uniform sampler2D tData; uniform vec2 uViewport; attribute float aIdx;
  varying vec4 vColor; varying vec2 vPos;
  vec4 fetch(int i){ return texelFetch(tData, ivec2(i & 2047, i >> 11), 0); }
  void main(){
    int b = int(aIdx) * 4;
    vec4 t0 = fetch(b), t1 = fetch(b + 1), t2 = fetch(b + 2), t3 = fetch(b + 3);
    vec4 mv = modelViewMatrix * vec4(t0.xyz, 1.);
    vec4 clip = projectionMatrix * mv;
    float lim = 1.3 * clip.w;
    if (clip.z < -clip.w || abs(clip.x) > lim || abs(clip.y) > lim) { gl_Position = vec4(0., 0., 2., 1.); return; }
    mat3 V = mat3(t1.x, t1.y, t1.z,  t1.y, t1.w, t2.x,  t1.z, t2.x, t2.y);
    float z = -mv.z, fx = projectionMatrix[0][0] * .5 * uViewport.x, fy = projectionMatrix[1][1] * .5 * uViewport.y;
    vec3 r0 = vec3(fx / z, 0., fx * mv.x / (z * z)), r1 = vec3(0., fy / z, fy * mv.y / (z * z));
    mat3 W = mat3(modelViewMatrix);
    vec3 a = r0 * W, c = r1 * W;
    float s00 = dot(a, V * a) + .3, s01 = dot(a, V * c), s11 = dot(c, V * c) + .3;
    float mid = .5 * (s00 + s11), rad = length(vec2(.5 * (s00 - s11), s01));
    float l1 = mid + rad, l2 = max(mid - rad, .1);
    vec2 e = abs(s01) < 1e-6 ? (s00 >= s11 ? vec2(1., 0.) : vec2(0., 1.)) : normalize(vec2(s01, l1 - s00));
    vec2 ax1 = min(sqrt(2. * l1), 1024.) * e, ax2 = min(sqrt(2. * l2), 1024.) * vec2(e.y, -e.x);
    vColor = t3; vPos = position.xy;
    gl_Position = clip; gl_Position.xy += (position.x * ax1 + position.y * ax2) / uViewport * 2. * clip.w;
  }`;
const FRAG = /* glsl */ `
  varying vec4 vColor; varying vec2 vPos; uniform float uOpacity;
  void main(){ float A = -dot(vPos, vPos); if (A < -4.) discard; float B = exp(A) * vColor.a * uOpacity; gl_FragColor = vec4(vColor.rgb * B, B); }`;

export function createSplats(data: SplatData) {
  const n = data.count, W = 2048, H = Math.max(1, Math.ceil((n * 4) / W));
  const tex = new Float32Array(W * H * 4);
  const M = new THREE.Matrix3(), q = new THREE.Quaternion(), mat4 = new THREE.Matrix4(), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const o = i * 16;
    tex[o] = data.pos[i * 3]; tex[o + 1] = data.pos[i * 3 + 1]; tex[o + 2] = data.pos[i * 3 + 2];
    q.set(data.quat[i * 4 + 1], data.quat[i * 4 + 2], data.quat[i * 4 + 3], data.quat[i * 4]).normalize();
    mat4.makeRotationFromQuaternion(q); M.setFromMatrix4(mat4);
    const e = M.elements, sx = data.scale[i * 3], sy = data.scale[i * 3 + 1], sz = data.scale[i * 3 + 2];
    // M = R·S (column-major elements); Σ = M·Mᵀ
    const m = [e[0] * sx, e[1] * sx, e[2] * sx, e[3] * sy, e[4] * sy, e[5] * sy, e[6] * sz, e[7] * sz, e[8] * sz];
    // m is col-major: element (row r, col k) = m[k*3 + r]; Σ_rr' = Σ_k m[k*3+r]·m[k*3+r']
    const S = (r: number, r2: number) => m[r] * m[r2] + m[3 + r] * m[3 + r2] + m[6 + r] * m[6 + r2];
    tex[o + 4] = S(0, 0); tex[o + 5] = S(0, 1); tex[o + 6] = S(0, 2); tex[o + 7] = S(1, 1);
    tex[o + 8] = S(1, 2); tex[o + 9] = S(2, 2);
    c.setRGB(data.rgba[i * 4] / 255, data.rgba[i * 4 + 1] / 255, data.rgba[i * 4 + 2] / 255, THREE.SRGBColorSpace); // sRGB → linear for the HDR pipeline
    tex[o + 12] = c.r; tex[o + 13] = c.g; tex[o + 14] = c.b; tex[o + 15] = data.rgba[i * 4 + 3] / 255;
  }
  const dataTex = new THREE.DataTexture(tex, W, H, THREE.RGBAFormat, THREE.FloatType);
  dataTex.minFilter = dataTex.magFilter = THREE.NearestFilter; dataTex.needsUpdate = true;

  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-2, -2, 0, 2, -2, 0, 2, 2, 0, -2, 2, 0]), 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const idx = new Float32Array(n); for (let i = 0; i < n; i++) idx[i] = i;
  const idxAttr = new THREE.InstancedBufferAttribute(idx, 1); idxAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("aIdx", idxAttr); geo.instanceCount = n;
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: true,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    uniforms: { tData: { value: dataTex }, uViewport: { value: new THREE.Vector2(1280, 720) }, uOpacity: { value: 1 } },
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false; mesh.userData.noDepth = true;

  const counts = new Uint32Array(65536), keys = new Uint16Array(n), dd = new Float32Array(n), mv = new THREE.Matrix4(), lastDir = new THREE.Vector4(1e9, 0, 0, 0);
  let frame = 0;
  const sort = (camera: THREE.Camera) => {
    mesh.updateWorldMatrix(true, false); mv.multiplyMatrices(camera.matrixWorldInverse, mesh.matrixWorld);
    const e = mv.elements; let mn = Infinity, mx = -Infinity;
    for (let i = 0; i < n; i++) { const d = e[2] * data.pos[i * 3] + e[6] * data.pos[i * 3 + 1] + e[10] * data.pos[i * 3 + 2] + e[14]; dd[i] = d; if (d < mn) mn = d; if (d > mx) mx = d; }
    const k = 65535 / Math.max(1e-6, mx - mn); counts.fill(0);
    for (let i = 0; i < n; i++) { const kk = ((dd[i] - mn) * k) | 0; keys[i] = kk; counts[kk]++; }
    for (let i = 1; i < 65536; i++) counts[i] += counts[i - 1];
    for (let i = n - 1; i >= 0; i--) idx[--counts[keys[i]]] = i; // ascending view-z = farthest first = back-to-front
    idxAttr.needsUpdate = true;
  };
  return {
    mesh, count: n, material,
    /** call every frame: keeps the ellipse projection in sync and re-sorts when the view moved. */
    update(camera: THREE.Camera, viewport: THREE.Vector2, opacity = 1) {
      material.uniforms.uViewport.value.copy(viewport); material.uniforms.uOpacity.value = opacity;
      const e = camera.matrixWorldInverse.elements, dot = Math.abs(e[2] - lastDir.x) + Math.abs(e[6] - lastDir.y) + Math.abs(e[10] - lastDir.z) + Math.abs(e[14] - lastDir.w) * 0.02;
      if ((frame++ % 3 === 0 && dot > 0.0008) || lastDir.x === 1e9) { sort(camera); lastDir.set(e[2], e[6], e[10], e[14]); }
    },
    dispose() { geo.dispose(); material.dispose(); dataTex.dispose(); },
  };
}
