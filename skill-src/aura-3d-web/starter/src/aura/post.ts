import * as THREE from "three";
import { Pass } from "three/examples/jsm/postprocessing/Pass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

/* ─────────────────────────────────────────────────────────────
   AURA · post.ts — depth-aware post: DepthPrepass → AO (Alchemy/GTAO-class) → bokeh DOF.

   · DepthPrepass renders the OPAQUE scene at half-res into a THREE.DepthTexture (no MSAA → portable, SwiftShader-safe).
     Points / lines / sprites / transparent meshes / `userData.noDepth` objects are hidden for the pass.
     An object may supply `userData.depthMaterial` (e.g. a ray-marched hero) to take part with its own depth.
   · Both shaders are deterministic (no time term) so `seek(p)` still gives identical frames.
   ───────────────────────────────────────────────────────────── */

type Entry = { o: THREE.Object3D; kind: "swap" | "hide"; mat?: THREE.Material | THREE.Material[]; swap?: THREE.Material | THREE.Material[] };

export class DepthPrepass extends Pass {
  readonly rt: THREE.WebGLRenderTarget;
  private base = new THREE.MeshBasicMaterial({ colorWrite: false });
  private list: Entry[] = [];
  private tick = 0;
  constructor(private scene: THREE.Scene, private camera: THREE.Camera, private scale = 0.5) {
    super();
    this.needsSwap = false;
    const depthTexture = new THREE.DepthTexture(4, 4);
    depthTexture.type = THREE.UnsignedIntType;
    this.rt = new THREE.WebGLRenderTarget(4, 4, { depthTexture, depthBuffer: true, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  }
  get texture() { return this.rt.depthTexture!; }
  setSize(w: number, h: number) { this.rt.setSize(Math.max(2, Math.round(w * this.scale)), Math.max(2, Math.round(h * this.scale))); }
  private rebuild() {
    this.list = [];
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (!mat) return;
      const mats = Array.isArray(mat) ? mat : [mat];
      const isMesh = (m as THREE.Mesh).isMesh;
      const custom = o.userData.depthMaterial as THREE.Material | undefined;
      if (custom) return void this.list.push({ o, kind: "swap", mat, swap: custom });
      if (!isMesh || o.userData.noDepth || mats.some((x) => x.transparent || !x.visible || x.depthWrite === false)) return void this.list.push({ o, kind: "hide" });
      this.list.push({ o, kind: "swap", mat, swap: Array.isArray(mat) ? mat.map(() => this.base) : this.base });
    });
  }
  render(renderer: THREE.WebGLRenderer) {
    if (this.tick++ % 90 === 0) this.rebuild();
    const was = this.list.map((e) => e.o.visible); // objects can toggle visibility between rebuilds (chapters) → remember the live state
    this.list.forEach((e) => { if (e.kind === "hide") e.o.visible = false; else (e.o as THREE.Mesh).material = e.swap!; });
    const bg = this.scene.background, fog = this.scene.fog, env = this.scene.environment;
    this.scene.background = null; this.scene.fog = null; this.scene.environment = null;
    const prev = renderer.getRenderTarget(), ac = renderer.autoClear, cc = renderer.getClearColor(new THREE.Color()), ca = renderer.getClearAlpha();
    renderer.setRenderTarget(this.rt); renderer.autoClear = true; renderer.setClearColor(0x000000, 0);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(prev); renderer.autoClear = ac; renderer.setClearColor(cc, ca);
    this.scene.background = bg; this.scene.fog = fog; this.scene.environment = env;
    this.list.forEach((e, i) => { if (e.kind === "hide") e.o.visible = was[i]; else (e.o as THREE.Mesh).material = e.mat!; });
  }
  dispose() { this.rt.dispose(); this.rt.depthTexture?.dispose(); this.base.dispose(); }
}

const VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;

/** Alchemy-style ambient obscurance, 12/8 taps, interleaved-gradient rotation. Contact darkening that makes matte props sit in their world. */
export function createAoPass(depth: THREE.Texture, taps = 12) {
  const pass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null }, tDepth: { value: depth }, uInvProj: { value: new THREE.Matrix4() }, uProjY: { value: 1.7 },
      uRadius: { value: 0.9 }, uIntensity: { value: 0.9 }, uAspect: { value: 1 }, uTexel: { value: new THREE.Vector2(1 / 512, 1 / 512) },
    },
    vertexShader: VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; uniform sampler2D tDiffuse, tDepth; uniform mat4 uInvProj; uniform float uProjY, uRadius, uIntensity, uAspect; uniform vec2 uTexel;
      #define TAPS ${taps}
      vec3 viewPos(vec2 uv){ float d = texture2D(tDepth, uv).x; vec4 c = uInvProj * vec4(uv * 2. - 1., d * 2. - 1., 1.); return c.xyz / c.w; }
      float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(.06711056, .00583715)))); }
      void main(){
        vec4 col = texture2D(tDiffuse, vUv);
        float d0 = texture2D(tDepth, vUv).x;
        if (d0 >= .99999) { gl_FragColor = col; return; }
        vec3 P = viewPos(vUv);
        vec3 Pr = viewPos(vUv + vec2(uTexel.x, 0.)), Pl = viewPos(vUv - vec2(uTexel.x, 0.)), Pu = viewPos(vUv + vec2(0., uTexel.y)), Pd = viewPos(vUv - vec2(0., uTexel.y));
        vec3 dx = abs(Pr.z - P.z) < abs(P.z - Pl.z) ? Pr - P : P - Pl;
        vec3 dy = abs(Pu.z - P.z) < abs(P.z - Pd.z) ? Pu - P : P - Pd;
        vec3 N = normalize(cross(dx, dy)); if (dot(N, -P) < 0.) N = -N;
        float rUv = min(.14, uRadius * uProjY / max(-P.z, .1) * .5);
        float rot = ign(gl_FragCoord.xy) * 6.2831853, occ = 0.;
        for (int i = 0; i < TAPS; i++) {
          float t = (float(i) + .5) / float(TAPS), a = rot + float(i) * 2.399963;
          vec2 uv = vUv + vec2(cos(a) / uAspect, sin(a)) * rUv * sqrt(t);
          vec3 v = viewPos(uv) - P; float vv = dot(v, v), l = sqrt(vv);
          float o = max(0., dot(v, N) - .03 * uRadius) / (vv + .01 * uRadius * uRadius) * uRadius;
          occ += min(o, 2.) * (1. - smoothstep(uRadius * .9, uRadius * 1.8, l));
        }
        float ao = clamp(1. - occ / float(TAPS) * uIntensity * 1.6, 0., 1.);
        float lum = dot(col.rgb, vec3(.2126, .7152, .0722));
        col.rgb *= mix(ao, 1., smoothstep(2., 6., lum)); // emissive things do not get occluded
        gl_FragColor = col;
      }`,
  });
  pass.uniforms.tDepth.value = depth; // ShaderPass CLONES uniforms, and a cloned DepthTexture is an empty one — re-bind the real texture
  return pass;
}

/** Bokeh depth of field: scatter-as-gather over a Vogel disc, foreground bleeds over a sharp background, sharp subjects never smear into it,
 *  bright highlights are weighted up so they bloom into discs. Rack focus by setting `post.dof.focus` in update(). */
export function createDofPass(depth: THREE.Texture, taps = 28) {
  const pass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null }, tDepth: { value: depth }, uNear: { value: 0.1 }, uFar: { value: 2000 }, uFocus: { value: 8 }, uAperture: { value: 1.6 },
      uMaxBlur: { value: 0.022 }, uAspect: { value: 1 }, uPx: { value: 0.0011 },
    },
    vertexShader: VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; uniform sampler2D tDiffuse, tDepth; uniform float uNear, uFar, uFocus, uAperture, uMaxBlur, uAspect, uPx;
      #define TAPS ${taps}
      float linZ(float d){ float z = d * 2. - 1.; return 2. * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
      float coc(float z){ return clamp(uAperture * .02 * abs(z - uFocus) / max(z, .01), 0., uMaxBlur); }
      float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(.06711056, .00583715)))); }
      void main(){
        vec4 c0 = texture2D(tDiffuse, vUv);
        float zc = linZ(texture2D(tDepth, vUv).x), cc = coc(zc);
        vec3 acc = c0.rgb; float wsum = 1.;
        float rot = ign(gl_FragCoord.xy) * 6.2831853;
        for (int i = 0; i < TAPS; i++) {
          float t = (float(i) + .5) / float(TAPS), a = rot + float(i) * 2.399963, rr = sqrt(t) * uMaxBlur;
          vec2 uv = vUv + vec2(cos(a) / uAspect, sin(a)) * rr;
          float zs = linZ(texture2D(tDepth, uv).x), cs = coc(zs);
          float reach = zs < zc ? cs : min(cs, cc);
          float w = clamp((reach - rr) / uPx + .5, 0., 1.);
          vec3 s = texture2D(tDiffuse, uv).rgb;
          float l = min(dot(s, vec3(.2126, .7152, .0722)), 6.);
          w *= 1. + l * l * .12;
          acc += s * w; wsum += w;
        }
        gl_FragColor = vec4(acc / wsum, c0.a);
      }`,
  });
  pass.uniforms.tDepth.value = depth; // see createAoPass: ShaderPass clones uniforms
  return pass;
}
