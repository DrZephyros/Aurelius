import { THREE, boot, createStage, createPointer, createScroll, createRail, createEnv, GLSL_NOISE, rng, lerp, damp } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  background: 0xefe6dc,
  cloth: 0xe8cdbd,     // fabric colour
  sheen: 0xffe9da,     // the soft edge-light you see on silk
  gold: 0xc9a25a,      // pearls + rings
  flow: 0.9,           // how fast the fabric moves
  fold: 2.2,           // how deep the folds are
  // camera keyframes — one per scroll section
  cam: [[0, 0.2, 11.5], [-5.5, 2.4, 8], [5, -1.6, 7.2], [0, 4.2, 9.5], [0, 0, 12.5]],
  look: [[0, 0, 0], [1.5, 0, 0], [-1.5, 0, 0], [0, 0, 0], [0, 0, 0]],
};

boot(() => {
  const stage = createStage({
    background: CONFIG.background, fog: { color: CONFIG.background, density: 0.014 }, fov: 36, exposure: 1.0,
    bloom: false, grain: 0.035, vignette: 0.16, aberration: 0.008,
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const rail = createRail(CONFIG.cam, CONFIG.look);
  const rand = rng(5);

  scene.environment = createEnv(renderer, [
    { pos: [-8, 8, 8], w: 14, h: 9, intensity: 5, color: 0xfff0e2 },
    { pos: [9, 1, 6], w: 6, h: 14, intensity: 3, color: 0xffd9c4 },
    { pos: [0, -7, 6], w: 18, h: 5, intensity: 2.2, color: 0xe9d8ff },
    { pos: [0, 10, -6], w: 22, h: 8, intensity: 2.6, color: 0xffffff },
  ], 0xb8a597);
  scene.environmentIntensity = 0.9;
  scene.add(new THREE.HemisphereLight(0xfff4ea, 0xc9b6a6, 0.9));
  const key = new THREE.DirectionalLight(0xfff0e0, 2.4);
  key.position.set(-6, 8, 10);
  scene.add(key);

  /* silk: a dense plane displaced in the vertex shader; normals are rebuilt by finite differences */
  const U = { uTime: { value: 0 }, uP: { value: 0 }, uFold: { value: CONFIG.fold } };
  const silk = new THREE.MeshPhysicalMaterial({
    color: CONFIG.cloth, roughness: 0.42, metalness: 0, side: THREE.DoubleSide,
    sheen: 1, sheenColor: new THREE.Color(CONFIG.sheen), sheenRoughness: 0.35, clearcoat: 0.25, clearcoatRoughness: 0.35,
  });
  silk.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime,uP,uFold; ${GLSL_NOISE}
        float cloth(vec2 p){
          float t=uTime;
          float big=snoise(vec3(p.x*.14,p.y*.2,t*.12))*uFold;
          float fold=snoise(vec3(p.x*.42+big*.25,p.y*.12,t*.2))*.7;
          float rip=sin(p.x*.7+p.y*.2+t*.7+big)*.12;
          return (big+fold+rip)*(.75+uP*.55);
        }`)
      .replace('#include <beginnormal_vertex>', `
        float e=.06; float h0=cloth(position.xy);
        float hx=cloth(position.xy+vec2(e,0.)), hy=cloth(position.xy+vec2(0.,e));
        vec3 objectNormal=normalize(vec3(-(hx-h0)/e,-(hy-h0)/e,1.));
        #ifdef USE_TANGENT
          vec3 objectTangent=vec3(tangent.xyz);
        #endif`)
      .replace('#include <begin_vertex>', 'vec3 transformed=vec3(position.xy,cloth(position.xy));');
  };
  silk.customProgramCacheKey = () => 'atelier-silk';
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(30, 18, 240, 150), silk);
  cloth.rotation.x = -0.18;
  scene.add(cloth);

  /* gold: pearls + hairline rings floating just above the fabric */
  const goldMat = new THREE.MeshPhysicalMaterial({ color: CONFIG.gold, metalness: 1, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 });
  const pearlMat = new THREE.MeshPhysicalMaterial({ color: 0xfff6ec, roughness: 0.18, metalness: 0.1, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color(0xffd9e6) });
  const pearls = Array.from({ length: 9 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.14 + rand() * 0.2, 48, 48), i % 3 === 0 ? goldMat : pearlMat);
    const o = { m, x: (rand() - 0.5) * 14, y: (rand() - 0.5) * 7, z: 2.2 + rand() * 3, s: 0.3 + rand() * 0.4, ph: rand() * 6 };
    scene.add(m);
    return o;
  });
  const rings = new THREE.Group();
  [1.5, 1.2, 0.9].forEach((r, i) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022 + i * 0.006, 24, 180), goldMat);
    t.rotation.set(0.9 + i * 0.5, i * 0.6, i * 0.9);
    rings.add(t);
  });
  rings.position.set(4.2, 0.4, 3.6);
  scene.add(rings);

  let cx = 0;
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    U.uTime.value = t * CONFIG.flow;
    U.uP.value = p;
    cloth.rotation.z = lerp(-0.12, 0.3, p) + pointer.x * 0.04;
    cloth.rotation.x = -0.18 + pointer.y * 0.04;
    pearls.forEach((o) => {
      o.m.position.set(o.x + Math.sin(t * o.s + o.ph) * 0.5, o.y + Math.cos(t * o.s * 1.2 + o.ph) * 0.5, o.z);
    });
    rings.rotation.set(t * 0.18, t * 0.12 + p * 3, 0);
    rings.children.forEach((r, i) => (r.rotation.z += dt * (0.2 + i * 0.12)));
    cx = damp(cx, pointer.x * 0.5, 3, dt);
    const look = rail.apply(camera, p);
    camera.position.x += cx;
    camera.position.y += pointer.y * 0.3;
    camera.lookAt(look);
  });
  stage.start();
});
