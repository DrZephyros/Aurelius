import { THREE, boot, createStage, createPointer, createScroll, createEnv, radialTexture, rng, lerp, damp } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  crystals: 11,
  bars: 96,
  palette: [0xff5fd2, 0x6ad8ff, 0xffd36a, 0x8a6cff, 0x5fffc0],
  spread: [0, 0.6, 0.15, 1, 0], // how far apart the crystals float, per section
  dispersion: 0.9,
};

boot(() => {
  const stage = createStage({
    background: 0x06051a, fov: 32, exposure: 0.9, aberration: 0.02,
    bloom: { strength: 0.32, radius: 0.55, threshold: 0.92 },
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(13);

  scene.environment = createEnv(renderer, [
    { pos: [-6, 6, 6], w: 10, h: 8, intensity: 6, color: 0xff7ad9 },
    { pos: [7, 4, 5], w: 8, h: 8, intensity: 6, color: 0x6ad8ff },
    { pos: [0, -7, 4], w: 16, h: 5, intensity: 3, color: 0xffd36a },
    { pos: [0, 9, -6], w: 20, h: 8, intensity: 5, color: 0xffffff },
    { pos: [0, 0, -9], w: 20, h: 14, intensity: 2, color: 0x8a6cff },
  ]);
  scene.environmentIntensity = 0.9;

  /* light curtain behind the glass — what the crystals refract */
  const barGeo = new THREE.BoxGeometry(1, 1, 1);
  const bars = new THREE.InstancedMesh(barGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), CONFIG.bars * 2);
  const barData = [];
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < CONFIG.bars; i++) {
      const a = lerp(-1.15, 1.15, i / (CONFIG.bars - 1));
      const rad = 15 + row * 7;
      const c = new THREE.Color(CONFIG.palette[Math.floor(R() * CONFIG.palette.length)]);
      bars.setColorAt(row * CONFIG.bars + i, c.multiplyScalar(0.62 - row * 0.28));
      barData.push({ x: Math.sin(a) * rad * 1.15, z: -Math.cos(a) * rad - 3, a, o: R() * 6, w: 0.34 + R() * 0.2 });
    }
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  bars.frustumCulled = false;
  scene.add(bars);

  /* crystals */
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transmission: 1, thickness: 1.4, roughness: 0.03, ior: 1.55, dispersion: CONFIG.dispersion,
    iridescence: 0.5, iridescenceIOR: 1.3, attenuationColor: new THREE.Color(0xb8b0ff), attenuationDistance: 4,
    specularIntensity: 1, envMapIntensity: 1.3, flatShading: true,
  });
  const group = new THREE.Group();
  scene.add(group);
  const crystals = [];
  for (let i = 0; i < CONFIG.crystals; i++) {
    const big = i === 0;
    const geo = new THREE.OctahedronGeometry(1, 0);
    const m = new THREE.Mesh(geo, glass);
    const sx = big ? 1.0 : 0.3 + R() * 0.35, sy = big ? 2.4 : 0.9 + R() * 1.1;
    m.scale.set(sx, sy, sx);
    const dir = new THREE.Vector3(R() - 0.5, R() - 0.5, (R() - 0.5) * 0.8).normalize();
    const cluster = big ? new THREE.Vector3() : dir.clone().multiplyScalar(1.4 + R() * 1.2);
    const spread = big ? new THREE.Vector3(0, 0, 1) : dir.clone().multiplyScalar(5 + R() * 5);
    m.rotation.set(R() * 3, R() * 3, R() * 3);
    group.add(m);
    crystals.push({ m, cluster, spread, s: (R() - 0.5) * 0.6, o: R() * 6 });
  }

  /* sparkles */
  const sp = new Float32Array(260 * 3);
  for (let i = 0; i < 260; i++) sp.set([(R() - 0.5) * 24, (R() - 0.5) * 14, (R() - 0.5) * 14], i * 3);
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const sparkles = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.08, map: radialTexture(), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(sparkles);

  camera.position.set(0, 0, 13);
  let gx = 0, spreadV = 0, camZ = 13, ry = 0;
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    const k = Math.min(3.999, p * 4), i0 = Math.floor(k), f = k - i0, e = f * f * (3 - 2 * f);
    const target = lerp(CONFIG.spread[i0], CONFIG.spread[i0 + 1], e);
    spreadV = damp(spreadV, target, 3, dt);
    const small = innerWidth < 800;
    const gxT = small ? 0 : [0, 3.4, -3.4, 3.2, 0][i0] * (1 - e) + [0, 3.4, -3.4, 3.2, 0][i0 + 1] * e;
    gx = damp(gx, gxT, 3, dt);
    camZ = damp(camZ, (small ? 18 : 13) + spreadV * 3, 3, dt);
    group.position.x = gx;
    ry += dt * 0.15;
    group.rotation.y = ry + pointer.x * 0.6 + p * 2;
    group.rotation.x = -pointer.y * 0.3;
    crystals.forEach((c) => {
      c.m.position.lerpVectors(c.cluster, c.spread, spreadV);
      c.m.position.y += Math.sin(t * 0.7 + c.o) * 0.12;
      c.m.rotation.y += dt * c.s;
      c.m.rotation.x += dt * c.s * 0.5;
    });
    barData.forEach((b, i) => {
      const h = 3 + 7 * (0.5 + 0.5 * Math.sin(t * 0.7 + b.o + b.a * 3)) ;
      v.set(b.x, h / 2 - 7, b.z);
      q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, -b.a);
      sc.set(b.w, h, b.w);
      m4.compose(v, q, sc);
      bars.setMatrixAt(i, m4);
    });
    bars.instanceMatrix.needsUpdate = true;
    sparkles.rotation.y = t * 0.02;
    camera.position.set(pointer.x * 0.8, pointer.y * 0.5, camZ);
    camera.lookAt(0, 0, 0);
  });
  stage.start();
});
