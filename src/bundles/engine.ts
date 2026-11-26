import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

/* ───────────────────────────────────────────────────────────────
   BUNDLE ENGINE
   A tiny cinematic-camera runtime shared by every bundle world.
   · the camera rides two Catmull-Rom splines (position + look-at); scroll progress is the playhead
   · the playhead is critically damped, so the camera glides and overshoots like a real dolly
   · speed kicks the field of view, lateral motion banks the horizon, the pointer adds parallax
   · bloom + chromatic fringe + grain + vignette give it the filmic finish
   A scene is just a function that returns { scene, rail, update } — see ./scenes/*
   ─────────────────────────────────────────────────────────────── */

export type Rail = { pos: number[][]; look: number[][] };

export type Built = {
  scene: THREE.Scene;
  rail: Rail;
  /** bloom: [strength, radius, threshold] */
  bloom: [number, number, number];
  exposure: number;
  fov: number;
  /** pointer parallax strength, world units */
  parallax?: number;
  /** called every frame with the (damped) playhead p ∈ [0,1] */
  update(t: number, p: number, dt: number, cam: THREE.PerspectiveCamera): void;
  dispose?(): void;
};

export type Builder = (ctx: { renderer: THREE.WebGLRenderer; mobile: boolean }) => Built;

export type World = {
  set(o: { target?: number; dim?: number }): void;
  /** the damped playhead, 0..1 */
  progress(): number;
  /** Park rendering while an embedded experience is off-screen. */
  pause(on: boolean): void;
  dispose(): void;
};

const FX = {
  uniforms: { tDiffuse: { value: null as THREE.Texture | null }, uTime: { value: 0 }, uFade: { value: 0 }, uDim: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uTime, uFade, uDim;
    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    void main(){
      vec2 c = vUv - .5; float d = dot(c, c);
      vec2 off = c * d * .045;
      vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      col *= 1. - smoothstep(.06, .52, d) * (.62 + uDim * .25);
      col += (hash(vUv * vec2(1920., 1080.) + fract(uTime) * 91.) - .5) * .05;
      gl_FragColor = vec4(col * uFade * (1. - uDim * .52), 1.);
    }`,
};

const damp = (a: number, b: number, l: number, dt: number) => a + (b - a) * (1 - Math.exp(-l * dt));

export function mountWorld(host: HTMLElement, build: Builder): World {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
  const mobile = w < 760;

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
  const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.6);
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  host.appendChild(renderer.domElement);

  const built = build({ renderer, mobile });
  renderer.toneMappingExposure = built.exposure;
  const camera = new THREE.PerspectiveCamera(built.fov, w / h, 0.1, 2000);
  const baseFov = () => (w / h < 0.8 ? built.fov + 22 : built.fov);

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dpr);
  composer.setSize(w, h);
  composer.addPass(new RenderPass(built.scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), built.bloom[0], built.bloom[1], built.bloom[2]);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const fx = new ShaderPass(FX);
  composer.addPass(fx);

  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const posC = new THREE.CatmullRomCurve3(built.rail.pos.map(V), false, "catmullrom", 0.5);
  const lookC = new THREE.CatmullRomCurve3(built.rail.look.map(V), false, "catmullrom", 0.5);
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), prev = new THREE.Vector3();

  const S = { target: 0, prog: 0, dim: 0, dimT: 0, fade: 0, bank: 0, speed: 0, ptrX: 0, ptrY: 0, tx: 0, ty: 0 };
  const onMove = (e: PointerEvent) => { S.tx = (e.clientX / innerWidth) * 2 - 1; S.ty = (e.clientY / innerHeight) * 2 - 1; };
  addEventListener("pointermove", onMove, { passive: true });

  const onResize = () => {
    w = host.clientWidth || innerWidth; h = host.clientHeight || innerHeight;
    renderer.setSize(w, h);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = baseFov();
    camera.updateProjectionMatrix();
  };
  onResize();
  addEventListener("resize", onResize);

  const clock = new THREE.Clock();
  let raf = 0, first = true, running = true, paused = false;
  const frame = () => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden || paused) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    const before = S.prog;
    S.prog = first ? S.target : damp(S.prog, S.target, reduce ? 20 : 3.1, dt);
    S.dim = damp(S.dim, S.dimT, 2.4, dt);
    S.fade = Math.min(1, S.fade + dt * 0.8);
    S.ptrX = damp(S.ptrX, S.tx, 2.4, dt);
    S.ptrY = damp(S.ptrY, S.ty, 2.4, dt);
    const vel = dt > 0 ? (S.prog - before) / dt : 0;
    S.speed = damp(S.speed, Math.abs(vel), 4, dt);

    const p = Math.min(0.9999, Math.max(0, S.prog));
    prev.copy(pos);
    posC.getPointAt(p, pos);
    lookC.getPointAt(p, look);
    const par = (built.parallax ?? 1.4) * (1 - S.dim * 0.6);
    pos.x += S.ptrX * par;
    pos.y -= S.ptrY * par * 0.55;
    look.x += S.ptrX * par * 1.6;
    look.y -= S.ptrY * par * 0.9;
    camera.position.copy(pos);
    camera.lookAt(look);
    // bank into lateral motion, breathe the lens with speed
    const lat = dt > 0 && !first ? (pos.x - prev.x) / dt : 0;
    S.bank = damp(S.bank, Math.max(-0.07, Math.min(0.07, -lat * 0.006)), 3, dt);
    camera.rotation.z += S.bank - S.ptrX * 0.012;
    const f = baseFov() + Math.min(9, S.speed * 70);
    if (Math.abs(camera.fov - f) > 0.01) { camera.fov = f; camera.updateProjectionMatrix(); }

    built.update(reduce ? 12 : t, p, dt, camera);
    bloom.strength = built.bloom[0] * (1 - S.dim * 0.35);
    fx.uniforms.uTime.value = t;
    fx.uniforms.uFade.value = S.fade;
    fx.uniforms.uDim.value = S.dim;
    first = false;
    composer.render(dt);
  };
  frame();

  return {
    set(o) {
      if (o.target !== undefined) S.target = Math.min(1, Math.max(0, o.target));
      if (o.dim !== undefined) S.dimT = o.dim;
    },
    progress: () => S.prog,
    pause(on) { paused = on; },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", onResize);
      built.dispose?.();
      built.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
