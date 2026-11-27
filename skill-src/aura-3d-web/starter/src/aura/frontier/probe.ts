import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   AURA · frontier/probe.ts — a LIVE reflection probe (THREE.CubeCamera).

   Static environments make every chrome / glass / lacquer prop reflect the same fake room. A probe makes them reflect THE WORLD: the hero, the
   particles, the colour of the current chapter. Assign `probe.texture` to `material.envMap` (envMapIntensity ≈ 1).

   · renders 6 faces at `size`² every `every` frames (staggered: 1 face per frame when every ≥ 6 → no spikes)
   · hide the object that uses the probe (`hide`) while capturing, or it reflects its own back face
   · budget: ctx.budget.fx.probe — on "low", skip and use a static env
   ───────────────────────────────────────────────────────────── */

export function createLiveProbe(renderer: THREE.WebGLRenderer, scene: THREE.Scene, o: { size?: number; position?: THREE.Vector3; every?: number; hide?: THREE.Object3D[]; near?: number; far?: number } = {}) {
  const size = o.size ?? 128;
  const rt = new THREE.WebGLCubeRenderTarget(size, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
  const cam = new THREE.CubeCamera(o.near ?? 0.2, o.far ?? 200, rt);
  if (o.position) cam.position.copy(o.position);
  scene.add(cam);
  let n = 0;
  const every = Math.max(1, o.every ?? 3);
  const capture = () => {
    const vis = (o.hide ?? []).map((x) => x.visible);
    (o.hide ?? []).forEach((x) => (x.visible = false));
    const prev = renderer.getRenderTarget(), xr = renderer.xr.enabled; renderer.xr.enabled = false;
    cam.update(renderer, scene);
    renderer.xr.enabled = xr; renderer.setRenderTarget(prev);
    (o.hide ?? []).forEach((x, i) => (x.visible = vis[i]));
  };
  return {
    texture: rt.texture, camera: cam,
    /** call every frame. `force` = capture now (first frame, after seek). */
    update(force = false) { if (force || n++ % every === 0) capture(); },
    dispose() { scene.remove(cam); rt.dispose(); },
  };
}
