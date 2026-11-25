import * as THREE from "three";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* smooth 2-D value noise + fbm (deterministic, no deps) */
const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
export function vnoise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash(ix, iy), hash(ix + 1, iy), u), lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), u), v);
}
export function fbm(x: number, y: number, oct = 5) {
  let a = 0.5, s = 0;
  for (let i = 0; i < oct; i++) { s += a * vnoise(x, y); x = x * 2.03 + 11.7; y = y * 2.03 + 3.1; a *= 0.5; }
  return s;
}

/** A gradient sky dome with an optional sun / moon disc and halo. Follows the camera. */
export function skyDome(o: { top: string; mid: string; bottom: string; sun?: { dir: [number, number, number]; color: string; size: number; halo: number; craters?: boolean } }) {
  const sd = o.sun ? new THREE.Vector3(...o.sun.dir).normalize() : new THREE.Vector3(0, 1, 0);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTop: { value: new THREE.Color(o.top) }, uMid: { value: new THREE.Color(o.mid) }, uBot: { value: new THREE.Color(o.bottom) },
      uSun: { value: sd }, uSunCol: { value: new THREE.Color(o.sun?.color ?? "#000") },
      uSize: { value: o.sun?.size ?? 0 }, uHalo: { value: o.sun?.halo ?? 0 }, uCrat: { value: o.sun?.craters ? 1 : 0 }, uTime: { value: 0 },
    },
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `varying vec3 vD; uniform vec3 uTop, uMid, uBot, uSun, uSunCol; uniform float uSize, uHalo, uCrat, uTime;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      void main(){
        float y = vD.y;
        vec3 c = mix(uBot, uMid, smoothstep(-.12, .12, y));
        c = mix(c, uTop, smoothstep(.1, .85, y));
        float d = distance(normalize(vD), uSun);
        float disc = smoothstep(uSize, uSize * .93, d);
        float halo = exp(-d * d / (uHalo * uHalo));
        vec3 sc = uSunCol;
        if (uCrat > .5) { vec2 q = (vD.xz - uSun.xz) * 26. + vD.y * 18.; sc *= .72 + .28 * n(q * 2.) + .12 * n(q * 7.); }
        c += uSunCol * halo * .55 + uSunCol * pow(halo, 3.) * .5;
        c = mix(c, sc * 1.35, disc);
        // sparse stars in the upper sky
        vec2 sp = vD.xz / (abs(vD.y) + .35) * 70.;
        float st = step(.9965, h(floor(sp))) * smoothstep(.25, .7, y) * (.5 + .5 * sin(uTime * 2. + h(floor(sp)) * 40.));
        c += vec3(.9, .95, 1.) * st * (1. - disc) * .8;
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 20), mat);
  m.renderOrder = -10;
  m.frustumCulled = false;
  return m;
}

/** Soft round additive points. They wrap inside a box that follows the camera, so a small count fills the whole view. */
export function particleField(o: { count: number; box: [number, number, number]; color: string; size: number; fall?: [number, number, number]; sway?: number; opacity?: number; seed?: number; additive?: boolean; colorB?: string }) {
  const r = rng(o.seed ?? 5);
  const g = new THREE.BufferGeometry();
  const p = new Float32Array(o.count * 3), s = new Float32Array(o.count * 2);
  for (let i = 0; i < o.count; i++) {
    p[i * 3] = r() * o.box[0]; p[i * 3 + 1] = r() * o.box[1]; p[i * 3 + 2] = r() * o.box[2];
    s[i * 2] = 0.4 + r() * 0.9; s[i * 2 + 1] = r();
  }
  g.setAttribute("position", new THREE.BufferAttribute(p, 3));
  g.setAttribute("aS", new THREE.BufferAttribute(s, 2));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: o.additive === false ? THREE.NormalBlending : THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(...o.box) },
      uFall: { value: new THREE.Vector3(...(o.fall ?? [0, -1, 0])) }, uSway: { value: o.sway ?? 1 }, uSize: { value: o.size },
      uCol: { value: new THREE.Color(o.color) }, uColB: { value: new THREE.Color(o.colorB ?? o.color) }, uOp: { value: o.opacity ?? 0.8 }, uPx: { value: 1 },
    },
    vertexShader: `attribute vec2 aS; uniform float uTime, uSway, uSize, uPx; uniform vec3 uCam, uBox, uFall; varying float vA; varying float vM;
      void main(){
        vec3 q = position + uFall * uTime + vec3(sin(uTime * .6 + aS.y * 40.), sin(uTime * .45 + aS.y * 17.) * .5, cos(uTime * .5 + aS.y * 23.)) * uSway;
        vec3 w = mod(q - uCam + uBox * .5, uBox) - uBox * .5;
        vec3 wp = uCam + w;
        vec4 mv = viewMatrix * vec4(wp, 1.);
        gl_Position = projectionMatrix * mv;
        float edge = 1. - smoothstep(.35, .5, length(w / uBox));
        vA = edge; vM = aS.y;
        gl_PointSize = uSize * aS.x * uPx * (260. / max(1., -mv.z));
      }`,
    fragmentShader: `uniform vec3 uCol, uColB; uniform float uOp; varying float vA; varying float vM;
      void main(){ vec2 c = gl_PointCoord - .5; float d = length(c); float a = smoothstep(.5, .0, d); a *= a; gl_FragColor = vec4(mix(uCol, uColB, vM), a * vA * uOp); }`,
  });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  return {
    object: pts,
    update(t: number, cam: THREE.Camera) { mat.uniforms.uTime.value = t; mat.uniforms.uCam.value.copy(cam.position); mat.uniforms.uPx.value = Math.min(devicePixelRatio || 1, 1.6); },
  };
}
