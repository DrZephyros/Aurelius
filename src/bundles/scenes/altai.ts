import * as THREE from "three";
import type { Builder } from "../engine";
import { clamp, fbm, particleField, rng, skyDome, smooth } from "./util";

/* ALTAI — an expedition at dawn. A valley flight past base-camp lights, then the long climb over the summit. */

const SUMMIT_Z = -360;
export const pathX = (z: number) => Math.sin(z * 0.011) * 22 + Math.sin(z * 0.027) * 7;

export function terrainH(x: number, z: number) {
  const dx = Math.abs(x - pathX(z));
  const valley = smooth(11, 64, dx);
  const ridged = 1 - Math.abs(fbm(x * 0.008 + 3, z * 0.008, 5) * 2 - 1);
  const base = fbm(x * 0.02, z * 0.02, 3) * 9;
  let h = base * 0.45 + valley * (ridged * ridged * 82 + 14);
  const sx = x - pathX(SUMMIT_Z), sz = z - SUMMIT_Z;
  h += 138 * Math.exp(-(sx * sx + sz * sz * 0.7) / (2 * 74 * 74));
  h += smooth(-150, -330, z) * 26 * (1 - valley * 0.5);
  return h;
}
const safeH = (x: number, z: number) => Math.max(terrainH(x, z), terrainH(x + 9, z), terrainH(x - 9, z), terrainH(x, z + 16), terrainH(x, z - 16));

function cloudMaterial(op: number, tint: string) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uOp: { value: op }, uCol: { value: new THREE.Color(tint) } },
    vertexShader: `varying vec2 vW; varying vec2 vL; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xz; vL = position.xz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `varying vec2 vW; varying vec2 vL; uniform float uTime, uOp; uniform vec3 uCol;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * n(p); p = p * 2.02 + 7.3; a *= .5; } return s; }
      void main(){
        vec2 q = vW * .006 + vec2(uTime * .01, uTime * .004);
        float c = smoothstep(.42, .78, fbm(q + fbm(q * 1.7) * .6));
        float edge = 1. - smoothstep(.25, .5, length(vL) / 1500.);
        gl_FragColor = vec4(uCol, c * edge * uOp);
      }`,
  });
}

export const buildAltai: Builder = ({ mobile }) => {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xd99a8a, mobile ? 0.0052 : 0.0042);
  const R = rng(7);

  const sky = skyDome({ top: "#161c4a", mid: "#b56d8e", bottom: "#f3b08c", sun: { dir: [-0.3, 0.1, -1], color: "#ffd9a8", size: 0.045, halo: 0.34 } });
  scene.add(sky);

  scene.add(new THREE.HemisphereLight(0x8a98d6, 0x4a3038, 1.15));
  const sun = new THREE.DirectionalLight(0xffb184, 3.4);
  sun.position.set(-160, 60, -300);
  scene.add(sun);

  /* terrain — vertex-coloured low-poly: valley grass → rock → snow */
  {
    const g = new THREE.PlaneGeometry(560, 940, mobile ? 120 : 190, mobile ? 200 : 320);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3), c = new THREE.Color();
    const grass = new THREE.Color("#5b6e61"), rock = new THREE.Color("#4a5468"), rock2 = new THREE.Color("#6b6070"), snow = new THREE.Color("#fbf6f4");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i) - 330;
      const h = terrainH(x, z);
      p.setY(i, h);
      const sl = Math.abs(terrainH(x + 3, z) - h) + Math.abs(terrainH(x, z + 3) - h);
      const nz = fbm(x * 0.07, z * 0.07, 3);
      c.copy(grass).lerp(rock, smooth(5, 30, h + nz * 12));
      c.lerp(rock2, smooth(0.5, 0.9, nz) * 0.5);
      const snowAmt = smooth(46, 66, h + nz * 22) * (1 - smooth(5.5, 11, sl) * 0.75);
      c.lerp(snow, snowAmt);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
    m.position.z = -330;
    scene.add(m);
  }

  /* base camps — glowing tents, a lantern each */
  const glows: THREE.PointLight[] = [];
  {
    const tentM = new THREE.MeshStandardMaterial({ color: 0xff8a3d, emissive: 0xff6a1a, emissiveIntensity: 0.75, roughness: 0.8, flatShading: true });
    const tentB = new THREE.MeshStandardMaterial({ color: 0x3d82c9, emissive: 0x1c4f92, emissiveIntensity: 0.4, roughness: 0.8, flatShading: true });
    [-70, -178, -282].forEach((cz, ci) => {
      const cx = pathX(cz) + 5;
      for (let i = 0; i < 4; i++) {
        const x = cx + (i % 2) * 5.5 - 2 + R() * 1.5, z = cz + Math.floor(i / 2) * 5 + R() * 1.5;
        const t = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.6, 4), i % 3 === 1 ? tentB : tentM);
        t.rotation.y = R() * 3;
        t.position.set(x, terrainH(x, z) + 1.2, z);
        scene.add(t);
      }
      const l = new THREE.PointLight(0xffa860, 260, 32, 2);
      l.position.set(cx + 2, terrainH(cx + 2, cz) + 3, cz + 2);
      scene.add(l);
      glows.push(l);
      // a thin plume of fire-smoke glow
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.6, 0.6), toneMapped: false }));
      s.position.copy(l.position).setY(l.position.y - 2.2);
      scene.add(s);
      void ci;
    });
  }

  /* summit flag */
  const flagU = { uTime: { value: 0 } };
  {
    const sx = pathX(SUMMIT_Z), sy = terrainH(sx, SUMMIT_Z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 11, 8), new THREE.MeshStandardMaterial({ color: 0xdfe6f0, metalness: 0.7, roughness: 0.3 }));
    pole.position.set(sx, sy + 5, SUMMIT_Z);
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 3.4, 20, 8),
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide, uniforms: flagU,
        vertexShader: `uniform float uTime; varying vec2 vUv; void main(){ vUv = uv; vec3 p = position; float k = uv.x; p.z += sin(p.x * 1.6 - uTime * 4.) * .55 * k + sin(p.x * 3.3 - uTime * 6. + p.y) * .18 * k; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }`,
        fragmentShader: `varying vec2 vUv; void main(){ vec3 c = mix(vec3(1., .2, .15), vec3(1., .55, .2), vUv.y); c *= 1. + step(.46, vUv.y) * step(vUv.y, .54) * .6; gl_FragColor = vec4(c * 1.4, 1.); }`,
      })
    );
    flag.position.set(sx + 3.05, sy + 8.8, SUMMIT_Z);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 2.2, 1), toneMapped: false }));
    beacon.position.set(sx, sy + 11.2, SUMMIT_Z);
    scene.add(pole, flag, beacon);
  }

  /* clouds: a sea below the summit, a ceiling above the valley */
  const cl1 = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), cloudMaterial(0.42, "#ffe2d2"));
  const cl2 = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), cloudMaterial(0.4, "#ffd0c0"));
  const cl3 = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), cloudMaterial(0.3, "#f6c8d0"));
  cl1.position.y = 62; cl2.position.y = 24; cl3.position.y = 118;
  [cl1, cl2, cl3].forEach((m) => { m.renderOrder = 5; m.frustumCulled = false; scene.add(m); });

  const snow = particleField({ count: mobile ? 700 : 1500, box: [80, 50, 120], color: "#ffffff", colorB: "#cfe4ff", size: 2.6, fall: [-2.2, -3.2, 1.2], sway: 1.2, opacity: 0.8, seed: 13 });
  scene.add(snow.object);

  /* rail: along the valley floor, then up and over */
  const keys: [number[], number[]][] = [];
  const add = (z: number, eye: number, L = 46, up = 12) => {
    const x = pathX(z), lz = z - L, lx = pathX(lz);
    keys.push([[x, safeH(x, z) + eye, z], [lx, safeH(lx, lz) + up, lz]]);
  };
  add(72, 22, 70, 20);
  add(24, 14);
  add(-34, 9);
  add(-92, 8, 52, 16);
  add(-150, 6);
  add(-208, 11, 52, 18);
  add(-262, 14, 56, 26);
  add(-310, 24, 60, 40);
  {
    const sx = pathX(SUMMIT_Z), sy = terrainH(sx, SUMMIT_Z);
    keys.push([[sx - 4, sy + 17, SUMMIT_Z + 26], [sx, sy + 8, SUMMIT_Z - 4]]);
    keys.push([[sx + 7, sy + 26, SUMMIT_Z - 4], [sx - 70, sy - 6, SUMMIT_Z - 120]]);
  }

  const tmpC = new THREE.Vector3();
  return {
    scene,
    rail: { pos: keys.map((k) => k[0]), look: keys.map((k) => k[1]) },
    bloom: [0.5, 0.7, 0.72],
    exposure: 1.02,
    fov: 58,
    parallax: 1.5,
    update(t, p, _dt, cam) {
      sky.position.copy(cam.position);
      (sky.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      snow.update(t, cam);
      flagU.uTime.value = t;
      for (const c of [cl1, cl2, cl3]) {
        c.position.x = cam.position.x; c.position.z = cam.position.z;
        (c.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      }
      // clouds thin out where the camera is inside them
      (cl1.material as THREE.ShaderMaterial).uniforms.uOp.value = 0.42 * clamp(Math.abs(cam.position.y - 62) / 14);
      (cl3.material as THREE.ShaderMaterial).uniforms.uOp.value = 0.3 * clamp(Math.abs(cam.position.y - 118) / 14);
      (cl2.material as THREE.ShaderMaterial).uniforms.uOp.value = 0.4 * clamp(Math.abs(cam.position.y - 24) / 10);
      glows.forEach((g, i) => { g.intensity = 230 + Math.sin(t * 6 + i * 2) * 20; });
      sun.intensity = 3.2 + 0.6 * smooth(0.6, 1, p);
      void tmpC;
    },
  };
};
