import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   AURA · atmosphere.ts — the air between the camera and the world.
   Depth planes 4 and 5 of the doctrine (background + atmosphere) live here:

     createSky()          gradient dome · sun / ECLIPSE disc with corona · stars · horizon haze  (1 draw call, fog-immune)
     createLightShafts()  volumetric god-rays — soft additive cones that breathe and fade at the edges
     createGlow()         a billboarded radial glow (lens bloom stand-in, practical-light halo, sun flare)
     createHaze()         layered fog cards: the cheap way to get *banded* depth in a valley / street / forest

   Everything is additive or fog-immune and depthWrite:false, so it never fights the subject and costs almost nothing.
   Drive uniforms from AuraScene.update(f) using the playhead — a sky that never changes across 800vh is a still image.
   ───────────────────────────────────────────────────────────── */

type Col = THREE.ColorRepresentation;

const NOISE = /* glsl */ `
  float luma(vec3 c){ return dot(c, vec3(.2126, .7152, .0722)); }
  float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float v = 0., a = .5; for(int i=0;i<4;i++){ v += vn(p)*a; p *= 2.02; a *= .5; } return v; }
`;

export interface SkyOptions {
  /** zenith colour */ top?: Col;
  /** colour at the horizon line (the hottest band of the sky) */ horizon?: Col;
  /** colour BELOW the horizon (what the terrain fades into) */ ground?: Col;
  /** direction TO the sun/moon (normalised for you) */ sunDir?: [number, number, number];
  sunColor?: Col;
  /** angular radius of the disc in radians. 0.03 = sun, 0.09 = huge, 0 = none */ sunSize?: number;
  /** 0 = open sun · 1 = totally eclipsed: a black disc ringed by a corona */ eclipse?: number;
  stars?: number;
  radius?: number;
}

export function createSky(o: SkyOptions = {}) {
  const sun = new THREE.Vector3(...(o.sunDir ?? [0.2, 0.18, -1])).normalize();
  const uniforms = {
    uTop: { value: new THREE.Color(o.top ?? 0x05060d) },
    uHorizon: { value: new THREE.Color(o.horizon ?? 0xff7a3d) },
    uGround: { value: new THREE.Color(o.ground ?? 0x05060d) },
    uSunDir: { value: sun },
    uSunCol: { value: new THREE.Color(o.sunColor ?? 0xffc48a) },
    uSunSize: { value: o.sunSize ?? 0.05 },
    uEclipse: { value: o.eclipse ?? 0 },
    uStars: { value: o.stars ?? 0.6 },
    uTime: { value: 0 },
    uHaze: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * mat4(mat3(modelViewMatrix)) * vec4(position, 1.); gl_Position = p.xyww; }`,
    fragmentShader: /* glsl */ `
      varying vec3 vDir;
      uniform vec3 uTop, uHorizon, uGround, uSunDir, uSunCol; uniform float uSunSize, uEclipse, uStars, uTime, uHaze;
      ${NOISE}
      void main(){
        vec3 d = normalize(vDir);
        float y = d.y;
        // gradient: a tight hot band at the horizon with a long falloff to the zenith
        float up = smoothstep(-0.02, 0.8, y);
        vec3 col = mix(uHorizon, uTop, pow(up, 0.5));
        col = mix(col, uGround, smoothstep(0.0, -0.2, y));
        // horizon haze, thicker toward the sun
        float sd = max(dot(d, uSunDir), 0.);
        col += uSunCol * pow(sd, 5.) * 0.2 * uHaze * (1. - up);
        col += uSunCol * pow(sd, 40.) * 0.28 * (1. - uEclipse * .6);
        // disc + corona
        float ang = acos(clamp(dot(d, uSunDir), -1., 1.));
        float disc = 1. - smoothstep(uSunSize * .97, uSunSize, ang);
        float rr = max(ang - uSunSize, 0.) / uSunSize;
        float corona = exp(-rr * 2.4) * .9 + exp(-rr * .7) * .22;
        // streamers: the corona is not a perfect ring
        vec2 q = d.xy - uSunDir.xy;
        float streak = .65 + .35 * vn(vec2(atan(q.y, q.x) * 4., uTime * .12));
        vec3 open = uSunCol * (disc * 8. + corona * 0.9);
        vec3 eclipsed = uSunCol * corona * (1.0 + 0.8 * streak) * step(uSunSize, ang);
        col += mix(open, eclipsed, uEclipse);
        col = mix(col, vec3(0.), disc * uEclipse);
        // stars: ROUND, soft, only where the sky is dark, twinkling, never below the horizon (square cells read as confetti)
        vec2 sp = d.xz / (abs(d.y) + .35) * 70.;
        vec2 cell = floor(sp), f = fract(sp) - .5;
        float st = h21(cell);
        vec2 off = (vec2(h21(cell + 7.1), h21(cell + 3.3)) - .5) * .6;
        float star = smoothstep(.2, 0., length(f - off)) * step(.93, st) * smoothstep(0.0, .2, y) * (.55 + .45 * sin(uTime * 2. + st * 60.));
        col += vec3(.85, .92, 1.) * star * uStars * (1. - smoothstep(.1, .4, luma(col)));
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(o.radius ?? 900, 48, 24), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return {
    mesh,
    uniforms,
    /** world-space position of the sun/eclipse centre at the given distance — place glows / lights here */
    sunPosition: (dist = 400) => sun.clone().multiplyScalar(dist),
    update(time: number) { uniforms.uTime.value = time; },
  };
}

/* ── volumetric light shafts ─────────────────────────────────── */
export interface ShaftOptions {
  /** where the beam starts (a window, a lamp, the sun) */ from: [number, number, number];
  /** where it points */ to: [number, number, number];
  color?: Col;
  /** radius at the far end */ spread?: number;
  /** number of overlapping cones (2–4 gives a layered, non-geometric look) */ count?: number;
  intensity?: number;
}

export function createLightShafts(o: ShaftOptions) {
  const group = new THREE.Group();
  const from = new THREE.Vector3(...o.from), to = new THREE.Vector3(...o.to);
  const len = from.distanceTo(to);
  const shared = { uTime: { value: 0 }, uIntensity: { value: o.intensity ?? 1 }, uColor: { value: new THREE.Color(o.color ?? 0xffd9a8) } };
  const n = o.count ?? 3;
  for (let i = 0; i < n; i++) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...shared, uSeed: { value: i * 17.3 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
      vertexShader: /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
        void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV; uniform float uTime, uIntensity, uSeed; uniform vec3 uColor;
        ${NOISE}
        void main(){
          // fresnel: brightest down the axis, melting at the silhouette → reads as a volume, not a mesh
          float f = pow(abs(dot(normalize(vN), normalize(vV))), 1.4);
          float along = vUv.y;                       // cylinder uv.y: 0 = bottom (far end) · 1 = top (source)
          float fade = smoothstep(0., .35, 1. - along) * smoothstep(0., .06, along);
          float streak = fbm(vec2(vUv.x * 12. + uSeed, along * 2.5 - uTime * .05));
          float a = f * fade * (.3 + streak * 1.1) * uIntensity * .3;
          gl_FragColor = vec4(uColor * a, a);
        }`,
    });
    const r = (o.spread ?? 3) * (0.7 + i * 0.28);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, r, len, 40, 1, true), mat); // top = source (tiny), bottom = far end (wide)
    m.frustumCulled = false;
    m.renderOrder = 5;
    m.rotation.y = i * 1.3;
    group.add(m);
  }
  // the cylinder's +Y end (small) must sit at `from`
  group.position.copy(from.clone().add(to).multiplyScalar(0.5));
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), from.clone().sub(to).normalize());
  return {
    group,
    uniforms: shared,
    update(time: number) { shared.uTime.value = time; },
    setIntensity(v: number) { shared.uIntensity.value = v; },
  };
}

/* ── glow billboard ──────────────────────────────────────────── */
let glowTex: THREE.CanvasTexture | null = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.12, "rgba(255,255,255,.55)");
  g.addColorStop(0.4, "rgba(255,255,255,.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

/** Additive halo. Use for lamps, windows, embers, the sun. `size` in world units. */
export function createGlow(color: Col, size = 6, opacity = 0.8) {
  const mat = new THREE.SpriteMaterial({ map: glowTexture(), color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity, fog: false });
  const s = new THREE.Sprite(mat);
  s.scale.setScalar(size);
  return s;
}

/* ── haze layers ─────────────────────────────────────────────── */
/** Stacked soft fog sheets. Put 3–5 between camera and background at increasing distance; the parallax between them is depth. */
export function createHaze(o: { color?: Col; layers?: number; width?: number; height?: number; zStart?: number; zStep?: number; y?: number; opacity?: number } = {}) {
  const group = new THREE.Group();
  const n = o.layers ?? 4;
  const mats: THREE.ShaderMaterial[] = [];
  for (let i = 0; i < n; i++) {
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false,
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(o.color ?? 0xff9a60) }, uOp: { value: (o.opacity ?? 0.22) * (1 - i * 0.12) }, uSeed: { value: i * 9.1 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: /* glsl */ `varying vec2 vUv; uniform float uTime, uOp, uSeed; uniform vec3 uColor;
        ${NOISE}
        void main(){
          float band = smoothstep(0., .45, vUv.y) * (1. - smoothstep(.5, 1., vUv.y));   // dense in the middle, melts top and bottom
          float n = fbm(vec2(vUv.x * 3. + uTime * .01 + uSeed, vUv.y * 2.));
          float edge = smoothstep(0., .2, vUv.x) * (1. - smoothstep(.8, 1., vUv.x));
          gl_FragColor = vec4(uColor, band * edge * n * uOp * 1.8);
        }`,
    });
    mats.push(mat);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(o.width ?? 160, o.height ?? 22), mat);
    m.position.set(0, (o.y ?? 5) + i * 0.6, (o.zStart ?? -20) - i * (o.zStep ?? 24));
    m.renderOrder = 2;
    group.add(m);
  }
  return { group, update(time: number) { mats.forEach((m) => (m.uniforms.uTime.value = time)); } };
}
