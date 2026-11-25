import { THREE, boot, createStage, createPointer, createScroll, createRail, createEnv, lightShaft, radialTexture, rng, lerp, smoothstep } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  gold: 0xd9b45a,
  stone: 0xb9b2a6,
  spacing: 7,       // distance between columns
  rows: 14,         // columns per side
  aisle: 5,         // half-width of the hall
  height: 11,       // column height
  shafts: 8,        // light shafts
  dust: 420,
};
const Z0 = 6;
const ZEND = Z0 - CONFIG.rows * CONFIG.spacing; // far wall

/* the colonnade is built twice: once for real, once upside-down under the glossy floor */
function buildHall(stone) {
  const g = new THREE.Group();
  const n = CONFIG.rows * 2;
  const shaft = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.55, 0.62, CONFIG.height, 24), stone, n);
  const base = new THREE.InstancedMesh(new THREE.BoxGeometry(1.7, 0.5, 1.7), stone, n);
  const cap = new THREE.InstancedMesh(new THREE.BoxGeometry(1.9, 0.6, 1.9), stone, n);
  const beams = new THREE.InstancedMesh(new THREE.BoxGeometry(CONFIG.aisle * 2 + 1.9, 0.7, 1.2), stone, CONFIG.rows);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
  let k = 0;
  for (let r = 0; r < CONFIG.rows; r++) {
    const z = Z0 - r * CONFIG.spacing;
    [-1, 1].forEach((side) => {
      const x = side * CONFIG.aisle;
      shaft.setMatrixAt(k, m4.compose(v.set(x, CONFIG.height / 2 + 0.5, z), q, s1));
      base.setMatrixAt(k, m4.compose(v.set(x, 0.25, z), q, s1));
      cap.setMatrixAt(k, m4.compose(v.set(x, CONFIG.height + 0.8, z), q, s1));
      k++;
    });
    beams.setMatrixAt(r, m4.compose(v.set(0, CONFIG.height + 1.45, z), q, s1));
  }
  [shaft, base, cap, beams].forEach((m) => { m.frustumCulled = false; g.add(m); });
  return g;
}

boot(() => {
  const stage = createStage({
    background: 0x050810, fog: { color: 0x070b16, density: 0.026 }, fov: 44, far: 260, exposure: 1.1,
    bloom: { strength: 0.5, radius: 0.8, threshold: 0.7 }, vignette: 0.65,
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(17);

  scene.environment = createEnv(renderer, [
    { pos: [-8, 10, 6], w: 14, h: 8, intensity: 4, color: 0xffe2a8 },
    { pos: [8, 4, -10], w: 8, h: 12, intensity: 2.5, color: 0x9fb8ff },
    { pos: [0, 14, -4], w: 20, h: 6, intensity: 2.5, color: 0xffffff },
  ], 0x0a1020);
  scene.environmentIntensity = 0.8;
  scene.add(new THREE.HemisphereLight(0x6f86c8, 0x0a0d18, 0.7));
  const key = new THREE.DirectionalLight(0xffd9a0, 2.6);
  key.position.set(-9, 16, 8);
  scene.add(key);
  const torch = new THREE.PointLight(CONFIG.gold, 40, 30, 1.6); // travels with the camera
  scene.add(torch);

  const stone = new THREE.MeshStandardMaterial({ color: CONFIG.stone, roughness: 0.42, metalness: 0.05, side: THREE.DoubleSide });
  scene.add(buildHall(stone));
  const mirror = buildHall(stone);
  mirror.scale.y = -1;
  scene.add(mirror);

  /* glossy floor: the mirrored hall shows through a dark translucent plate */
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(CONFIG.aisle * 2 + 14, 240),
    new THREE.MeshStandardMaterial({ color: 0x080c18, roughness: 0.12, metalness: 0.7, transparent: true, opacity: 0.8 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -80;
  scene.add(floor);
  [-1.3, 1.3].forEach((x) => {
    const inlay = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 240), new THREE.MeshBasicMaterial({ color: new THREE.Color(CONFIG.gold).multiplyScalar(1.6) }));
    inlay.rotation.x = -Math.PI / 2;
    inlay.position.set(x, 0.01, -80);
    scene.add(inlay);
  });

  /* far wall glow */
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 40),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(255,214,140,0.55)', 'rgba(255,214,140,0)', 256), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  glow.position.set(0, 6, ZEND - 2);
  scene.add(glow);

  /* light shafts between the columns */
  const shafts = [];
  for (let i = 0; i < CONFIG.shafts; i++) {
    const s = lightShaft({ color: 0xffd596, height: 20, top: 0.4, bottom: 3, intensity: 0.1 });
    s.position.set((i % 2 ? 1 : -1) * 1.5, 20, Z0 - 6 - i * 11);
    s.rotation.z = (i % 2 ? 1 : -1) * 0.32;
    scene.add(s);
    shafts.push(s);
  }

  /* the armillary sphere at the end of the hall */
  const gold = new THREE.MeshStandardMaterial({ color: CONFIG.gold, metalness: 1, roughness: 0.22 });
  const arm = new THREE.Group();
  arm.position.set(0, 4.6, ZEND + 8);
  const rings = [2.2, 1.8, 1.4, 1.0].map((r, i) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035 + i * 0.006, 16, 120), gold);
    t.rotation.set(i * 0.7, i * 0.5, i * 0.3);
    arm.add(t);
    return t;
  });
  arm.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 5.2, 8), gold));
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.5, 2.5, 1.1) }));
  arm.add(core);
  const coreLight = new THREE.PointLight(0xffd08a, 30, 24, 1.5);
  arm.add(coreLight);
  scene.add(arm);

  /* dust motes drifting in the light */
  const pp = new Float32Array(CONFIG.dust * 3);
  for (let i = 0; i < CONFIG.dust; i++) pp.set([(R() - 0.5) * 12, R() * 12, Z0 - R() * (Z0 - ZEND)], i * 3);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, color: 0xffe2b0, map: radialTexture(), transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  const rail = createRail(
    [[0, 2.7, 11], [0, 3.1, -18], [0, 3.5, -46], [0, 3.4, -62], [0, 4.6, ZEND + 22]],
    [[0, 3.6, -30], [0, 3.9, -56], [0, 4.2, -76], [0, 4.5, ZEND + 8], [0, 4.6, ZEND + 8]]
  );
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    rail.apply(camera, p);
    camera.position.x += pointer.x * 0.8;
    camera.position.y += pointer.y * 0.35;
    torch.position.set(camera.position.x, 4.5, camera.position.z - 7);
    rings.forEach((r, i) => { r.rotation.x += dt * (0.18 + i * 0.06); r.rotation.y += dt * (0.12 - i * 0.03); });
    arm.position.y = 4.6 + Math.sin(t * 0.7) * 0.12;
    const s = 1 + smoothstep(0.7, 1, p) * 0.35;
    arm.scale.setScalar(s);
    coreLight.intensity = 30 + Math.sin(t * 2) * 4;
    shafts.forEach((sh, i) => (sh.rotation.z = (i % 2 ? 1 : -1) * (0.32 + Math.sin(t * 0.2 + i) * 0.03)));
    dust.position.y = Math.sin(t * 0.2) * 0.3;
  });
  stage.start();
});
