import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/* ───────────────────────────────────────────────────────────────
   AURELIUS · the aurora world
   One persistent WebGL scene behind the whole site:
   curtains of light snaking over a mirror lake, a mountain horizon,
   stars and drifting aurora dust. The camera rides a rail driven by
   page scroll ("journey") or settles into a calm drift ("ambient").
   ─────────────────────────────────────────────────────────────── */

export type SceneMode = "journey" | "ambient";

const NOISE = /* glsl */ `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 4; i++) { s += a*vnoise(p); p *= 2.03; a *= .5; } return s; }
`;

const RIBBON_VERT = /* glsl */ `
uniform float uTime, uLen, uAmp, uFreq, uPhase, uHeight, uBase, uZ, uX, uSpeed;
varying vec2 vUv;
${NOISE}
void main(){
  vUv = uv;
  float u = uv.x, v = uv.y;
  float t = uTime * uSpeed;
  float snake = sin(u*uFreq + uPhase + t*.5) * uAmp + sin(u*uFreq*2.31 + uPhase*1.7 - t*.4) * uAmp*.32;
  float fold = sin(u*uFreq*5.0 + t*1.3 + v*2.2 + uPhase) * .9 * v * v;
  float hgt = uHeight * (0.62 + 0.38 * vnoise(vec2(u*4.0 + uPhase, t*.35)));
  float x = (u - .5) * uLen + uX + sin(t*.2 + uPhase) * 3.0;
  float y = uBase + v*hgt + sin(u*uFreq*1.2 + uPhase + t*.3) * 2.6;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, uZ + snake + fold, 1.0);
}`;

const RIBBON_FRAG = /* glsl */ `
uniform vec3 uC0, uC1, uC2;
uniform float uTime, uAlpha, uPhase, uSpeed;
varying vec2 vUv;
${NOISE}
void main(){
  float u = vUv.x, v = vUv.y, t = uTime * uSpeed;
  float rays = smoothstep(.28, .92, fbm(vec2(u*120.0 + uPhase*9.0, t*.9)));
  float body = fbm(vec2(u*7.0 + uPhase, v*1.6 - t*.25));
  float fadeTop = pow(1.0 - v, 1.5);
  float fadeBot = smoothstep(0.0, .06, v);
  float edge = smoothstep(0.0, .1, u) * smoothstep(1.0, .9, u);
  vec3 col = mix(uC0, uC1, smoothstep(.0, .5, v));
  col = mix(col, uC2, smoothstep(.4, 1.0, v));
  float a = (.06 + 1.0*rays) * (.16 + .9*body) * fadeTop * fadeBot * edge;
  a += smoothstep(.14, 0.0, v) * .2 * fadeBot * edge * (.3 + body);
  a *= uAlpha * .5;
  gl_FragColor = vec4(col * 1.1, a);
}`;

const noise1 = (x: number) => {
  const i = Math.floor(x), f = x - i, h = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
  const u = f * f * (3 - 2 * f);
  return h(i) * (1 - u) + h(i + 1) * u;
};
const ridged = (x: number) => 1 - Math.abs(2 * noise1(x) - 1);

function glowTexture(inner: string, outer = "rgba(0,0,0,0)") {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, inner);
  gr.addColorStop(0.35, inner.replace(/[\d.]+\)$/, "0.25)"));
  gr.addColorStop(1, outer);
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/* camera rail — one key per act of the story */
const RAIL_POS = [
  [0, 2.4, 40], [-9, 5.5, 24], [7, 15, -4], [15, 25, -30], [-3, 9, 4], [0, 2.0, 18],
];
const RAIL_LOOK = [
  [0, 17, -40], [7, 21, -40], [-8, 24, -50], [-12, 14, -62], [2, 20, -50], [0, 19, -60],
];

export function AuroraScene({ mode }: { mode: SceneMode }) {
  const host = useRef<HTMLDivElement>(null);
  const modeRef = useRef<SceneMode>(mode);
  modeRef.current = mode;

  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", alpha: false });
    } catch {
      return; // no WebGL → the CSS aurora underneath carries the page
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = innerWidth < 760;
    const dpr = Math.min(devicePixelRatio || 1, small ? 1.25 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(innerWidth, innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x03050b, 1);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03050b);
    const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 900);

    /* ── sky gradient dome ── */
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(500, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false,
        vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }",
        fragmentShader: `varying vec3 vP; void main(){
          float h = normalize(vP).y;
          vec3 hor = vec3(.05,.13,.17), mid = vec3(.015,.03,.07), top = vec3(.008,.012,.03);
          vec3 c = mix(hor, mid, smoothstep(0.,.28,h)); c = mix(c, top, smoothstep(.2,.85,h));
          gl_FragColor = vec4(c, 1.);
        }`,
      })
    );
    scene.add(sky);

    /* ── stars ── */
    const SN = small ? 900 : 1900;
    const sp = new Float32Array(SN * 3), ss = new Float32Array(SN), sc = new Float32Array(SN * 3);
    for (let i = 0; i < SN; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.acos(0.04 + Math.random() * 0.96);
      const r = 420;
      sp.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
      ss[i] = 0.5 + Math.pow(Math.random(), 4) * 2.2;
      const k = Math.random();
      (k > 0.85 ? [1, 0.88, 0.62] : k > 0.6 ? [0.7, 0.85, 1] : [1, 1, 1]).forEach((v, j) => (sc[i * 3 + j] = v));
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    sg.setAttribute("aSize", new THREE.BufferAttribute(ss, 1));
    sg.setAttribute("aCol", new THREE.BufferAttribute(sc, 3));
    const starMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPx: { value: dpr } },
      vertexShader: `attribute float aSize; attribute vec3 aCol; uniform float uTime, uPx; varying vec3 vC; varying float vA;
        void main(){ vC = aCol; vA = .55 + .45*sin(uTime*(.6+aSize*.5) + position.x*.37 + position.z*.11);
          gl_PointSize = aSize * uPx * 1.6; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord-.5); float a = smoothstep(.5,.0,d); gl_FragColor = vec4(vC*1.4, a*vA); }`,
    });
    scene.add(new THREE.Points(sg, starMat));

    /* ── mountains (+ mirrored copies for the lake reflection) ── */
    const world = new THREE.Group();   // everything above the water
    const mirror = new THREE.Group();  // its reflection
    mirror.scale.y = -1;
    scene.add(world, mirror);

    const ridge = (z: number, amp: number, seed: number, tint: THREE.Color, haze: number) => {
      const N = 260, W = 520;
      const pos: number[] = [], col: number[] = [], idx: number[] = [];
      for (let i = 0; i <= N; i++) {
        const x = (i / N - 0.5) * W;
        const h = amp * (0.55 * ridged(x * 0.012 + seed) + 0.28 * ridged(x * 0.034 + seed * 3.1) + 0.12 * noise1(x * 0.12 + seed)) + 2;
        pos.push(x, -4, z, x, h, z);
        const c = tint.clone().lerp(new THREE.Color(0x0e2a33), haze);
        col.push(c.r * 0.55, c.g * 0.55, c.b * 0.55, c.r, c.g, c.b);
        if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      g.setIndex(idx);
      return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    };
    const layers: [number, number, number, number, number][] = [[-170, 34, 1.3, 0x0b1a24, 0.65], [-130, 30, 7.7, 0x07111a, 0.4], [-96, 26, 4.2, 0x040a11, 0.2], [-66, 14, 11.1, 0x02060b, 0.05]];
    layers.forEach(([z, a, s, c, h]) => {
      world.add(ridge(z, a, s, new THREE.Color(c), h));
      mirror.add(ridge(z, a, s, new THREE.Color(c), h));
    });

    /* ── aurora ribbons ── */
    const C = (hex: number) => new THREE.Color(hex);
    type R = { len: number; amp: number; freq: number; phase: number; h: number; base: number; z: number; x: number; speed: number; c: [number, number, number]; alpha: number };
    const green: [number, number, number] = [0x38ffb0, 0x22d6d0, 0x7a5cff] as never;
    const cyan: [number, number, number] = [0x3de7ff, 0x4d8dff, 0xc16bff] as never;
    const violet: [number, number, number] = [0x7a8bff, 0xa55cff, 0xff63c8] as never;
    const gold: [number, number, number] = [0xffc86b, 0xff9a7a, 0xff5fb0] as never;
    const defs: R[] = [
      { len: 300, amp: 16, freq: 4.2, phase: 0.0, h: 42, base: 12, z: -34, x: 0, speed: 1, c: green, alpha: 1 },
      { len: 280, amp: 20, freq: 5.1, phase: 2.1, h: 36, base: 15, z: -58, x: -20, speed: 0.8, c: cyan, alpha: 0.85 },
      { len: 320, amp: 14, freq: 3.6, phase: 4.4, h: 46, base: 11, z: -18, x: 25, speed: 1.2, c: green, alpha: 0.7 },
      { len: 300, amp: 24, freq: 4.6, phase: 1.3, h: 40, base: 19, z: -84, x: 10, speed: 0.7, c: violet, alpha: 0.8 },
      { len: 260, amp: 11, freq: 5.8, phase: 5.2, h: 26, base: 10, z: -8, x: -30, speed: 1.1, c: gold, alpha: 0.55 },
    ];
    const ribMats: THREE.ShaderMaterial[] = [];
    const makeRibbon = (d: R, reflect: boolean) => {
      const geo = new THREE.PlaneGeometry(1, 1, 360, 28);
      const m = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
        vertexShader: RIBBON_VERT, fragmentShader: RIBBON_FRAG,
        uniforms: {
          uTime: { value: 0 }, uLen: { value: d.len }, uAmp: { value: d.amp }, uFreq: { value: d.freq }, uPhase: { value: d.phase },
          uHeight: { value: d.h }, uBase: { value: d.base }, uZ: { value: d.z }, uX: { value: d.x }, uSpeed: { value: d.speed },
          uC0: { value: C(d.c[0]) }, uC1: { value: C(d.c[1]) }, uC2: { value: C(d.c[2]) }, uAlpha: { value: d.alpha * (reflect ? 0.32 : 1) },
        },
      });
      ribMats.push(m);
      const mesh = new THREE.Mesh(geo, m);
      mesh.frustumCulled = false;
      mesh.renderOrder = reflect ? 0 : 3;
      return mesh;
    };
    defs.forEach((d) => { world.add(makeRibbon(d, false)); mirror.add(makeRibbon(d, true)); });

    /* ── the lake ── */
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 500, 1, 1),
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",
        fragmentShader: `uniform float uTime; varying vec3 vW; ${NOISE}
          void main(){
            float rip = vnoise(vec2(vW.x*.9, vW.z*.12 + uTime*.12)) * vnoise(vec2(vW.x*.25 + uTime*.05, vW.z*.4));
            float d = length(vW.xz - cameraPosition.xz);
            float far = smoothstep(260., 40., d);
            vec3 c = vec3(.006,.02,.035) + vec3(.02,.07,.08) * rip * far;
            float a = .74 + .1*rip - .12*(1.-far);
            gl_FragColor = vec4(c, clamp(a, .55, .92));
          }`,
      })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0, -140);
    water.renderOrder = 1;
    scene.add(water);

    /* gold horizon glow (the "aurum" in Aurelius) */
    const goldGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 80),
      new THREE.MeshBasicMaterial({ map: glowTexture("rgba(255,205,120,0.9)"), transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    goldGlow.position.set(0, 6, -150);
    goldGlow.renderOrder = 2;
    scene.add(goldGlow);

    /* ── aurora dust: slow motes that sell the parallax ── */
    const DN = small ? 160 : 420;
    const dp = new Float32Array(DN * 3), dseed = new Float32Array(DN), dcol = new Float32Array(DN * 3);
    for (let i = 0; i < DN; i++) {
      dp.set([(Math.random() - 0.5) * 120, Math.random() * 40, 50 - Math.random() * 110], i * 3);
      dseed[i] = Math.random() * 100;
      (Math.random() > 0.8 ? [1, 0.82, 0.5] : [0.4, 1, 0.8]).forEach((v, j) => (dcol[i * 3 + j] = v));
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    dg.setAttribute("aSeed", new THREE.BufferAttribute(dseed, 1));
    dg.setAttribute("aCol", new THREE.BufferAttribute(dcol, 3));
    const dustMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPx: { value: dpr } },
      vertexShader: `attribute float aSeed; attribute vec3 aCol; uniform float uTime, uPx; varying vec3 vC; varying float vA;
        void main(){
          vec3 p = position; p.y += mod(uTime*.9 + aSeed*3., 40.) - 8.; p.y = mod(p.y, 40.);
          p.x += sin(uTime*.2 + aSeed)*3.; p.z += cos(uTime*.17 + aSeed*1.3)*3.;
          vec4 mv = modelViewMatrix*vec4(p,1.);
          vC = aCol; vA = smoothstep(0., 6., p.y) * smoothstep(40., 30., p.y) * (.5 + .5*sin(uTime*1.3 + aSeed));
          gl_PointSize = clamp(220. / -mv.z, 1., 7.) * uPx; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord-.5); gl_FragColor = vec4(vC*1.5, smoothstep(.5,0.,d)*vA*.8); }`,
    });
    scene.add(new THREE.Points(dg, dustMat));

    /* ── post: bloom makes the light bleed ── */
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(dpr);
    composer.setSize(innerWidth, innerHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.38, 0.7, 0.5);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* ── rail ── */
    const rp = new THREE.CatmullRomCurve3(RAIL_POS.map((v) => new THREE.Vector3(...v)), false, "catmullrom", 0.5);
    const rl = new THREE.CatmullRomCurve3(RAIL_LOOK.map((v) => new THREE.Vector3(...v)), false, "catmullrom", 0.5);
    const pos = new THREE.Vector3(), look = new THREE.Vector3(), cur = new THREE.Vector3();

    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => { ptr.tx = (e.clientX / innerWidth) * 2 - 1; ptr.ty = (e.clientY / innerHeight) * 2 - 1; };
    addEventListener("pointermove", onMove, { passive: true });

    const onResize = () => {
      renderer.setSize(innerWidth, innerHeight);
      composer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.fov = innerWidth < 760 ? 70 : 52;
      camera.updateProjectionMatrix();
    };
    onResize();
    addEventListener("resize", onResize);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const clock = new THREE.Clock();
    let raf = 0, prog = 0, amb = modeRef.current === "ambient" ? 1 : 0, fadeIn = 0;
    const damp = (a: number, b: number, l: number, dt: number) => a + (b - a) * (1 - Math.exp(-l * dt));
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) { clock.getDelta(); return; }
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = reduce ? 20 : clock.elapsedTime + 20;
      const foot = document.querySelector("footer")?.offsetHeight ?? 0;
      const maxS = Math.max(1, document.documentElement.scrollHeight - innerHeight - foot);
      const target = modeRef.current === "journey" ? Math.min(1, Math.max(0, scrollY / maxS)) : 0.04;
      prog = damp(prog, target, 3.2, dt);
      amb = damp(amb, modeRef.current === "ambient" ? 1 : 0, 2.2, dt);
      ptr.x = damp(ptr.x, ptr.tx, 2.5, dt);
      ptr.y = damp(ptr.y, ptr.ty, 2.5, dt);

      const p = Math.min(0.999, prog);
      rp.getPoint(p, pos);
      rl.getPoint(p, look);
      // ambient: a slow, wide breathing drift
      const sway = amb * 6;
      pos.x += Math.sin(t * 0.07) * sway + ptr.x * 2.2;
      pos.y += Math.sin(t * 0.09) * amb * 1.4 - ptr.y * 1.1;
      look.x += Math.sin(t * 0.05) * sway * 0.6 + ptr.x * 3;
      look.y += -ptr.y * 2;
      cur.copy(pos);
      camera.position.copy(cur);
      camera.lookAt(look);
      camera.rotation.z += ptr.x * -0.012;

      for (const m of ribMats) m.uniforms.uTime.value = t;
      starMat.uniforms.uTime.value = t;
      dustMat.uniforms.uTime.value = t;
      (water.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      // gold glow swells in the final act
      (goldGlow.material as THREE.MeshBasicMaterial).opacity = 0.16 + 0.55 * Math.pow(Math.max(0, (p - 0.72) / 0.28), 1.4);
      bloom.strength = 0.36 + 0.08 * Math.sin(t * 0.4);

      fadeIn = Math.min(1, fadeIn + dt * 0.7);
      renderer.toneMappingExposure = (0.95 - amb * 0.1) * (0.2 + 0.8 * fadeIn);
      composer.render(dt);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", onResize);
      io.disconnect();
      composer.dispose();
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={host} className="absolute inset-0" aria-hidden />;
}
