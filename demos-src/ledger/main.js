import { THREE, boot, createStage, createPointer, createScroll, createRail, radialTexture, rng, lerp, clamp, smoothstep, damp } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  accent: 0x3dffb0,           // confirmed blocks, links, pulses
  idle: 0x1b4a3a,             // unconfirmed blocks further down the chain
  blocks: 22,
  spacing: 4.4,
  size: 1.55,
  // camera offset from the chain, per scroll section: [x, y, z]
  offsets: [[2.6, 1.4, 6.2], [-4.2, 1.0, 5.2], [0, 3.4, 4.6], [4.6, 0.4, 5.4], [0, 1.8, 10]],
  // how far along the chain each section sits (0..1)
  stops: [0.0, 0.26, 0.5, 0.76, 1.0],
};

boot(() => {
  const stage = createStage({
    background: 0x030a08, fog: { color: 0x030a08, density: 0.03 }, fov: 40, exposure: 1.05,
    bloom: { strength: 0.7, radius: 0.55, threshold: 0.35 }, vignette: 0.7, grain: 0.05, aberration: 0.035,
  });
  const { scene, camera } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const rand = rng(77);

  /* the chain's spine: a gently winding path into the screen */
  const pts = Array.from({ length: CONFIG.blocks }, (_, i) => new THREE.Vector3(Math.sin(i * 0.55) * 2.3, Math.cos(i * 0.4) * 1.3, -i * CONFIG.spacing));
  const curve = new THREE.CatmullRomCurve3(pts);
  const at = (u) => curve.getPoint(clamp(u));
  const rail = createRail(
    CONFIG.stops.map((u, i) => { const p = at(u), o = CONFIG.offsets[i]; return [p.x + o[0], p.y + o[1], p.z + o[2]]; }),
    CONFIG.stops.map((u) => { const p = at(clamp(u + 0.05)); return [p.x, p.y, p.z]; })
  );

  /* a block face: dark glass with a glowing hash */
  const hex = (n) => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(rand() * 16)]).join('');
  function face(i) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#04120d';
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(61,255,176,0.55)';
    g.lineWidth = 3;
    g.strokeRect(10, 10, 236, 236);
    g.fillStyle = '#3dffb0';
    g.font = '600 22px monospace';
    g.fillText('BLOCK #' + String(48200 + i), 24, 52);
    g.globalAlpha = 0.55;
    g.font = '15px monospace';
    for (let r = 0; r < 6; r++) g.fillText(hex(8) + ' ' + hex(8), 24, 96 + r * 22);
    g.globalAlpha = 1;
    g.fillStyle = '#3dffb0';
    g.fillRect(24, 226, 24 + (i % 5) * 28, 4);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const boxGeo = new THREE.BoxGeometry(CONFIG.size, CONFIG.size, CONFIG.size);
  const edgeGeo = new THREE.EdgesGeometry(boxGeo);
  const cOn = new THREE.Color(CONFIG.accent), cOff = new THREE.Color(CONFIG.idle), tmp = new THREE.Color();
  const blocks = pts.map((p, i) => {
    const mat = new THREE.MeshBasicMaterial({ map: face(i), transparent: true, opacity: 0.9, color: 0xffffff });
    const mesh = new THREE.Mesh(boxGeo, mat);
    const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: CONFIG.idle, transparent: true }));
    mesh.add(edges);
    mesh.position.copy(p);
    mesh.rotation.set(rand() * 0.6, rand() * 3, rand() * 0.6);
    scene.add(mesh);
    return { mesh, mat, edges, spin: (rand() - 0.5) * 0.4 };
  });

  /* links + data pulses travelling along them */
  const linkMat = new THREE.LineBasicMaterial({ color: CONFIG.accent, transparent: true, opacity: 0.45 });
  const pulses = [];
  const pulseGeo = new THREE.SphereGeometry(0.07, 12, 12);
  const pulseMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(CONFIG.accent).multiplyScalar(2.2), toneMapped: false });
  for (let i = 0; i < CONFIG.blocks - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), linkMat));
    const m = new THREE.Mesh(pulseGeo, pulseMat);
    scene.add(m);
    pulses.push({ m, a, b, o: rand() });
  }

  /* data dust + floor grid */
  const N = 1100, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) pos.set([(rand() - 0.5) * 36, (rand() - 0.5) * 18, 10 - rand() * (CONFIG.blocks * CONFIG.spacing + 14)], i * 3);
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.07, color: CONFIG.accent, map: radialTexture(), transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dust);
  const grid = new THREE.GridHelper(260, 130, CONFIG.accent, 0x0e3a2c);
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
  grid.position.set(0, -5, -50);
  scene.add(grid);

  let conf = 0;
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    conf = damp(conf, p * (CONFIG.blocks - 2) + 3.2, 4, dt);
    blocks.forEach((b, i) => {
      const f = smoothstep(i - 1, i, conf);                      // 0 → unconfirmed, 1 → confirmed
      const pop = Math.exp(-Math.abs(conf - i - 0.4) * 2.2) * 0.18;
      b.mesh.scale.setScalar(lerp(0.78, 1, f) + pop);
      b.mat.opacity = lerp(0.16, 0.92, f);
      b.mat.color.setScalar(lerp(0.35, 1, f));
      tmp.lerpColors(cOff, cOn, f);
      b.edges.material.color.copy(tmp).multiplyScalar(0.6 + f * 1.1);
      b.edges.material.opacity = lerp(0.5, 1, f);
      b.mesh.rotation.y += dt * b.spin * (0.4 + f);
    });
    pulses.forEach((u, i) => {
      const k = (t * 0.35 + u.o) % 1;
      u.m.position.lerpVectors(u.a, u.b, k);
      u.m.visible = i < conf;
    });
    dust.position.z = Math.sin(t * 0.1) * 0.6;
    const look = rail.apply(camera, p);
    camera.position.x += pointer.x * 0.7;
    camera.position.y += pointer.y * 0.4;
    camera.lookAt(look);
  });
  stage.start();
});
