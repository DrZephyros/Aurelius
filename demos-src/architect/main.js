import { THREE, boot, createStage, createPointer, createScroll, createRail, createLabels, createEnv, rng, lerp, clamp, smoothstep } from '@core';

/* ── tweak me: the building is just a list of boxes ───────────
   x/z = centre on the plan, w/d = footprint, h = height, y = elevation of the base, mat = 0 concrete · 1 pale · 2 glass */
const CONFIG = {
  accent: 0xff5a1f,
  volumes: [
    { x: 2, z: 0, w: 15, d: 10, h: 3, y: 0, mat: 1 },       // podium
    { x: -4, z: -1, w: 5, d: 6, h: 12, y: 0, mat: 0 },      // core
    { x: 5, z: 0.4, w: 17, d: 5.6, h: 3.2, y: 6, mat: 2 },  // cantilevered glass box
    { x: 5, z: 0.4, w: 17.6, d: 6.2, h: 0.4, y: 9.2, mat: 0 }, // roof plate
    { x: -13, z: 5, w: 7, d: 5, h: 2.6, y: 0, mat: 1 },     // garden pavilion
    { x: -13, z: 5, w: 9.4, d: 7.4, h: 0.35, y: 2.6, mat: 0 }, // pavilion roof
    { x: 11.5, z: -7, w: 2.2, d: 2.2, h: 15, y: 0, mat: 2 }, // tower blade
    { x: 1, z: 8.6, w: 11, d: 4, h: 0.5, y: 0, mat: 1 },     // terrace
  ],
  labels: [ [11, 8, 3], [-4, 11.5, 3.2], [3, 4.5, 5.2] ],      // 3D anchor points for the callouts
  phases: ['Survey', 'Sketch', 'Structure', 'Envelope', 'Complete'],
};

boot(() => {
  const stage = createStage({
    background: 0xe8e4dc, fog: { color: 0xe8e4dc, density: 0.011 }, fov: 34, exposure: 0.95,
    bloom: false, grain: 0.03, vignette: 0.14, aberration: 0.01,
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.environment = createEnv(renderer, [
    { pos: [-8, 10, 8], w: 16, h: 8, intensity: 4, color: 0xfff4e4 },
    { pos: [10, 3, -8], w: 8, h: 14, intensity: 2, color: 0xdfe9ff },
    { pos: [0, 14, -2], w: 20, h: 8, intensity: 3, color: 0xffffff },
  ], 0xa9a294);
  scene.environmentIntensity = 0.7;
  scene.add(new THREE.HemisphereLight(0xfff6ea, 0xb9b09f, 1.0));
  const sun = new THREE.DirectionalLight(0xffecd2, 3.4);
  sun.position.set(22, 26, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  /* ground + blueprint grid */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0xd2ccbe, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(120, 120, CONFIG.accent, 0xbab3a4);
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  grid.position.y = 0.01;
  scene.add(grid);
  const plot = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(44, 0.01, 26)),
    new THREE.LineBasicMaterial({ color: CONFIG.accent })
  );
  plot.position.set(-1, 0.03, 2);
  scene.add(plot);

  /* materials */
  const mats = [
    new THREE.MeshStandardMaterial({ color: 0x9b9486, roughness: 0.92 }),
    new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.8 }),
    new THREE.MeshPhysicalMaterial({ color: 0x24323b, roughness: 0.08, metalness: 0.55, clearcoat: 1, envMapIntensity: 1.6 }),
  ];

  /* each volume = solid box that grows from its base + a blueprint ghost of the finished size */
  const unit = new THREE.BoxGeometry(1, 1, 1);
  unit.translate(0, 0.5, 0);
  const unitEdges = new THREE.EdgesGeometry(unit);
  const vols = CONFIG.volumes.map((v) => {
    const mesh = new THREE.Mesh(unit, mats[v.mat]);
    mesh.position.set(v.x, v.y, v.z);
    mesh.scale.set(v.w, 0.001, v.d);
    mesh.castShadow = mesh.receiveShadow = true;
    const edge = new THREE.LineSegments(unitEdges, new THREE.LineBasicMaterial({ color: CONFIG.accent, transparent: true }));
    mesh.add(edge);
    const ghost = new THREE.LineSegments(unitEdges, new THREE.LineBasicMaterial({ color: CONFIG.accent, transparent: true, opacity: 0.55 }));
    ghost.position.set(v.x, v.y, v.z);
    ghost.scale.set(v.w, v.h, v.d);
    scene.add(mesh, ghost);
    return { v, mesh, edge, ghost };
  });

  /* warm interior glow strips inside the glass boxes (fade in at the end) */
  const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.9, 0.9), transparent: true, opacity: 0 });
  const strips = [];
  [CONFIG.volumes[2], CONFIG.volumes[6]].forEach((v, k) => {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(v.w * (k ? 0.7 : 0.86), 0.12), glowMat);
    s.position.set(v.x, v.y + v.h * (k ? 0.3 : 0.4), v.z + v.d / 2 + 0.02);
    scene.add(s);
    strips.push(s);
  });
  const lamp = new THREE.PointLight(0xffb36b, 0, 30, 1.6);
  lamp.position.set(5, 7.4, 3);
  scene.add(lamp);

  /* a few abstract trees for scale */
  const R = rng(3);
  const trunk = new THREE.CylinderGeometry(0.1, 0.14, 1.4, 6);
  const crown = new THREE.IcosahedronGeometry(1, 1);
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x8c9a6a, roughness: 1, flatShading: true });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b4a3a, roughness: 1 });
  for (let i = 0; i < 20; i++) {
    const a = R() * 6.28, r = 24 + R() * 22;
    const x = Math.cos(a) * r * 1.3, z = Math.sin(a) * r * 0.9;
    const s = 0.8 + R() * 1.2;
    const g = new THREE.Group();
    const tr = new THREE.Mesh(trunk, trunkMat); tr.position.y = 0.7;
    const cr = new THREE.Mesh(crown, treeMat); cr.position.y = 2.1; cr.scale.set(1.3, 1.5, 1.3);
    cr.castShadow = true; tr.castShadow = true;
    g.add(tr, cr);
    g.scale.setScalar(s);
    g.position.set(x, 0, z);
    scene.add(g);
  }

  const labels = createLabels(camera, [
    { el: document.getElementById('l1'), anchor: new THREE.Vector3(...CONFIG.labels[0]), dx: 90, dy: -70 },
    { el: document.getElementById('l2'), anchor: new THREE.Vector3(...CONFIG.labels[1]), dx: -90, dy: -60 },
    { el: document.getElementById('l3'), anchor: new THREE.Vector3(...CONFIG.labels[2]), dx: 90, dy: 80 },
  ]);

  const rail = createRail(
    [[-36, 22, 40], [-26, 15, 38], [8, 10, 40], [38, 14, 14], [30, 34, 26]],
    [[0, 2, 0], [0, 4, 0], [2, 6, 0], [0, 6, 0], [0, 3, 0]]
  );
  const sides = [-5.5, 5.5, -5.5, 5.5, 0];
  const phaseEl = document.getElementById('phase'), barEl = document.getElementById('phase-bar');
  let phase = -1;
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    rail.apply(camera, p);
    camera.position.x += pointer.x * 1.6;
    camera.position.y += pointer.y * 0.8;
    camera.lookAt(0, 4, 0);
    const k = Math.min(3.999, p * 4), i0 = Math.floor(k), f = k - i0;
    camera.translateX(lerp(sides[i0], sides[i0 + 1], f * f * (3 - 2 * f)));

    const b = clamp((p - 0.04) / 0.66);
    vols.forEach((o, i) => {
      const local = clamp((b - i * 0.085) / 0.3);
      const e = ease(local);
      o.mesh.scale.y = Math.max(0.001, o.v.h * e);
      o.mesh.visible = local > 0.001;
      o.edge.material.opacity = lerp(1, 0.22, smoothstep(0.9, 1, local));
      o.ghost.material.opacity = 0.55 * (1 - smoothstep(0.7, 1, local));
    });
    const fin = smoothstep(0.62, 0.8, p);
    glowMat.opacity = fin;
    lamp.intensity = fin * 160;
    labels.update(smoothstep(0.42, 0.52, p) * (1 - smoothstep(0.62, 0.7, p)));
    grid.material.opacity = 0.35 * (1 - smoothstep(0.5, 0.9, p) * 0.7);

    const ph = Math.min(CONFIG.phases.length - 1, Math.floor(clamp(p / 0.85) * (CONFIG.phases.length - 0.001)));
    if (ph !== phase) { phase = ph; phaseEl.textContent = CONFIG.phases[ph]; }
    phaseEl.parentElement.style.opacity = 1 - smoothstep(0.9, 0.97, p);
    barEl.style.transform = `scaleX(${clamp(p / 0.85)})`;
  });
  stage.start();
});
