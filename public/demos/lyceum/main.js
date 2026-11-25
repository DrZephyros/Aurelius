import { THREE, boot, createStage, createPointer, createScroll, createRail, createEnv, radialTexture, rng, lerp, damp } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  background: 0xf1ead9,
  brass: 0xb98a3e,                       // the armillary rings
  ink: 0x2a3f9d,                         // the core + accent
  books: [0x2a3f9d, 0xb5483a, 0x2f6b55, 0xc9923a, 0x1c2a52, 0x7a3b69],
  bookCount: 16,
  // camera keyframes — one per scroll section
  cam: [[2.4, 1.2, 10.5], [-4.8, 0.6, 6.4], [0, 4.2, 4.6], [4.6, -0.4, 6.8], [0, 0.4, 13]],
  look: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0.2, 0], [0, 0, 0]],
};

boot(() => {
  const stage = createStage({
    background: CONFIG.background, fog: { color: CONFIG.background, density: 0.012 }, fov: 36, exposure: 1.0,
    bloom: false, grain: 0.04, vignette: 0.2, aberration: 0.008,
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const rail = createRail(CONFIG.cam, CONFIG.look);
  const rand = rng(9);

  scene.environment = createEnv(renderer, [
    { pos: [-8, 8, 8], w: 14, h: 9, intensity: 5, color: 0xfff1d8 },
    { pos: [9, 1, 5], w: 6, h: 14, intensity: 3, color: 0xdfe6ff },
    { pos: [0, -6, 7], w: 18, h: 5, intensity: 2, color: 0xffe2b8 },
    { pos: [0, 10, -6], w: 20, h: 8, intensity: 2.6, color: 0xffffff },
  ], 0x9b8f78);
  scene.environmentIntensity = 1.0;
  scene.add(new THREE.HemisphereLight(0xfff6e6, 0xb8aa90, 0.8));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.2);
  key.position.set(-5, 8, 9);
  scene.add(key);

  const brass = new THREE.MeshStandardMaterial({ color: CONFIG.brass, metalness: 1, roughness: 0.26 });
  const arm = new THREE.Group();
  scene.add(arm);

  /* the armillary: tilted brass rings with graduations, each carrying a bead */
  const rings = [];
  const defs = [
    { r: 2.9, tube: 0.045, rx: Math.PI / 2, ry: 0, rz: 0, bead: 0xb5483a, ticks: 72 },
    { r: 2.55, tube: 0.035, rx: 0.41, ry: 0, rz: 0, bead: 0x2f6b55, ticks: 0 },
    { r: 2.2, tube: 0.04, rx: 0, ry: 0, rz: 0, bead: CONFIG.ink, ticks: 48 },
    { r: 1.85, tube: 0.03, rx: 0, ry: Math.PI / 2, rz: 0, bead: 0xc9923a, ticks: 0 },
    { r: 1.5, tube: 0.03, rx: Math.PI / 2, ry: 0.5, rz: 0, bead: 0x7a3b69, ticks: 36 },
  ];
  defs.forEach((d, i) => {
    const holder = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(d.r, d.tube, 20, 200), brass);
    holder.add(ring);
    if (d.ticks) {
      const tg = new THREE.BoxGeometry(0.025, 0.14, 0.05);
      const im = new THREE.InstancedMesh(tg, brass, d.ticks);
      const o = new THREE.Object3D();
      for (let k = 0; k < d.ticks; k++) {
        const a = (k / d.ticks) * Math.PI * 2;
        o.position.set(Math.cos(a) * (d.r + 0.09), Math.sin(a) * (d.r + 0.09), 0);
        o.rotation.z = a;
        o.scale.y = k % 6 === 0 ? 1.6 : 1;
        o.updateMatrix();
        im.setMatrixAt(k, o.matrix);
      }
      holder.add(im);
    }
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 32), new THREE.MeshPhysicalMaterial({ color: d.bead, roughness: 0.22, clearcoat: 1 }));
    holder.add(bead);
    holder.rotation.set(d.rx, d.ry, d.rz);
    arm.add(holder);
    rings.push({ holder, bead, d, a: rand() * 6, s: 0.25 + i * 0.07 });
  });

  /* axis + the world at the centre */
  const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 6.6, 12), brass);
  axis.rotation.z = 0.41;
  arm.add(axis);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.62, 64, 64), new THREE.MeshPhysicalMaterial({ color: CONFIG.ink, roughness: 0.3, clearcoat: 1, emissive: 0x0d1a55, emissiveIntensity: 0.6 }));
  arm.add(core);
  const grid = new THREE.Mesh(new THREE.SphereGeometry(0.78, 24, 16), new THREE.MeshBasicMaterial({ color: CONFIG.brass, wireframe: true, transparent: true, opacity: 0.55 }));
  arm.add(grid);

  /* drifting books — spines in the palette of the site */
  const books = Array.from({ length: CONFIG.bookCount }, (_, i) => {
    const g = new THREE.Group();
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.09, 0.86), new THREE.MeshStandardMaterial({ color: CONFIG.books[i % CONFIG.books.length], roughness: 0.6 }));
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.07, 0.8), new THREE.MeshStandardMaterial({ color: 0xfaf4e4, roughness: 0.9 }));
    g.add(cover, pages);
    const a = rand() * Math.PI * 2, r = 5.4 + rand() * 4.5;
    const o = { g, a, r, y: (rand() - 0.5) * 5, s: 0.03 + rand() * 0.05, ph: rand() * 6, tilt: [rand() * 3, rand() * 3, rand() * 3] };
    scene.add(g);
    return o;
  });

  /* warm dust */
  const N = 500, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) pos.set([(rand() - 0.5) * 30, (rand() - 0.5) * 16, (rand() - 0.5) * 24], i * 3);
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.06, color: 0xb98a3e, map: radialTexture(), transparent: true, opacity: 0.7, depthWrite: false })));

  let cx = 0;
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    rings.forEach((r, i) => {
      r.a += dt * r.s;
      r.bead.position.set(Math.cos(r.a) * r.d.r, Math.sin(r.a) * r.d.r, 0);
      r.holder.rotation.x = r.d.rx + Math.sin(t * 0.15 + i) * 0.12 + p * (i % 2 ? 1.6 : -1.1);
      r.holder.rotation.y = r.d.ry + t * 0.05 * (i % 2 ? 1 : -1) + p * 0.9;
    });
    grid.rotation.y = t * 0.2;
    core.scale.setScalar(1 + Math.sin(t * 1.4) * 0.03);
    arm.rotation.y = p * 1.2 + pointer.x * 0.15;
    arm.rotation.x = pointer.y * 0.1;
    books.forEach((b) => {
      const a = b.a + t * b.s + p * 0.6;
      b.g.position.set(Math.cos(a) * b.r, b.y + Math.sin(t * 0.5 + b.ph) * 0.3, Math.sin(a) * b.r);
      b.g.rotation.set(b.tilt[0] + t * 0.1, b.tilt[1] + t * 0.13, b.tilt[2]);
    });
    cx = damp(cx, pointer.x * 0.5, 3, dt);
    const look = rail.apply(camera, p);
    camera.position.x += cx;
    camera.position.y += pointer.y * 0.3;
    camera.lookAt(look);
  });
  stage.start();
});
