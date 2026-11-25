import { THREE, boot, createStage, createPointer, createScroll, createEnv, radialTexture, GLSL_NOISE, lerp, damp } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  accent: 0xc6ff3d,
  amplitude: 0.17, // how wobbly the metal is
  speed: 0.25,
  // keyframes per section: blob x, scale, wobble
  x: [0, 2.3, -2.3, 2.1, 0],
  scale: [1.55, 1.3, 1.4, 1.25, 1.7],
  amp: [0.17, 0.26, 0.15, 0.3, 0.19],
};

boot(() => {
  const stage = createStage({
    background: 0x050506, fov: 35, exposure: 1.1, vignette: 0.75, grain: 0.05,
    bloom: { strength: 0.22, radius: 0.6, threshold: 0.85 },
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();

  scene.environment = createEnv(renderer, [
    { pos: [-6, 6, 6], w: 10, h: 6, intensity: 9, color: 0xffffff },
    { pos: [8, 2, 4], w: 5, h: 12, intensity: 7, color: CONFIG.accent },
    { pos: [-9, -2, 2], w: 5, h: 12, intensity: 6, color: 0xff4fd8 },
    { pos: [0, -8, 5], w: 14, h: 5, intensity: 4, color: 0x39d6ff },
    { pos: [0, 9, -8], w: 20, h: 6, intensity: 4, color: 0xffffff },
  ]);
  scene.environmentIntensity = 1.2;

  const U = { uTime: { value: 0 }, uAmp: { value: CONFIG.amplitude }, uSpeed: { value: CONFIG.speed } };

  /* liquid metal: PBR material + noise displacement injected into the vertex shader */
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 1, roughness: 0.06, iridescence: 1, iridescenceIOR: 1.35,
    iridescenceThicknessRange: [120, 520], clearcoat: 1, clearcoatRoughness: 0.05,
  });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime,uAmp,uSpeed; ${GLSL_NOISE}
        float disp(vec3 p){ return snoise(p*0.95+vec3(0.,uTime*uSpeed,0.))*uAmp + snoise(p*2.4-vec3(uTime*uSpeed*.8))*uAmp*.12; }
        vec3 displace(vec3 p){ return p*(1.+disp(p)); }`)
      .replace('#include <beginnormal_vertex>', `
        vec3 nrm=normalize(position);
        vec3 tng=normalize(cross(nrm,vec3(0.,1.,.0001))); vec3 btg=normalize(cross(nrm,tng));
        float eps=.012;
        vec3 d0=displace(nrm), d1=displace(normalize(nrm+tng*eps)), d2=displace(normalize(nrm+btg*eps));
        vec3 objectNormal=normalize(cross(d1-d0,d2-d0));
        if(dot(objectNormal,nrm)<0.) objectNormal=-objectNormal;
        #ifdef USE_TANGENT
          vec3 objectTangent=vec3(tangent.xyz);
        #endif`)
      .replace('#include <begin_vertex>', 'vec3 transformed=displace(position);');
  };
  mat.customProgramCacheKey = () => 'mercury-blob';
  const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), mat);
  scene.add(blob);

  /* orbiting chrome beads */
  const bead = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.04, clearcoat: 1 });
  const beads = [0.16, 0.11, 0.2].map((r, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 48), bead);
    scene.add(m);
    return { m, r: 2 + i * 0.55, s: 0.35 + i * 0.12, o: i * 2.1, tilt: 0.4 + i * 0.5 };
  });

  /* soft glow behind the blob */
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture(), color: CONFIG.accent, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  glow.scale.set(14, 14, 1);
  glow.position.z = -3;
  scene.add(glow);

  camera.position.set(0, 0, 7.5);
  let bx = 0, bs = 0.001, ba = CONFIG.amplitude, pv = 0, lx = 0, ly = 0;
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    const k = Math.min(3.999, p * 4), i0 = Math.floor(k), f = k - i0, e = f * f * (3 - 2 * f);
    const small = innerWidth < 800 ? 0.6 : 1;
    const tx = lerp(CONFIG.x[i0], CONFIG.x[i0 + 1], e) * small;
    const ts = lerp(CONFIG.scale[i0], CONFIG.scale[i0 + 1], e) * (innerWidth < 800 ? 0.75 : 1);
    pv = damp(pv, Math.hypot(pointer.x - lx, pointer.y - ly) * 20, 6, dt);
    lx = pointer.x; ly = pointer.y;
    const ta = lerp(CONFIG.amp[i0], CONFIG.amp[i0 + 1], e) + Math.min(pv, 1) * 0.07;
    bx = damp(bx, tx, 4, dt); bs = damp(bs, ts, 2.2, dt); ba = damp(ba, ta, 4, dt);
    blob.position.set(bx, Math.sin(t * 0.6) * 0.08, 0);
    blob.scale.setScalar(bs);
    blob.rotation.set(-pointer.y * 0.4, t * 0.12 + p * 3 + pointer.x * 0.5, 0);
    U.uTime.value = t; U.uAmp.value = ba;
    glow.position.x = bx;
    beads.forEach((b) => {
      const a = t * b.s + b.o;
      b.m.position.set(bx + Math.cos(a) * b.r * bs * 0.8, Math.sin(a) * b.r * bs * 0.8 * Math.sin(b.tilt), Math.sin(a) * b.r * 0.9);
    });
    camera.position.x = pointer.x * 0.4;
    camera.position.y = pointer.y * 0.25;
    camera.lookAt(0, 0, 0);
  });
  stage.start();
});
