import { THREE, boot, createStage, createPointer, createScroll, createRail, radialTexture, rng, lerp, clamp } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  accent: 0xff3d9a,   // hot end of the bar gradient
  second: 0x7c5cff,   // cool end of the bar gradient
  bpm: 124,           // the whole scene pulses to this tempo
  outerBars: 96,
  innerBars: 48,
  outerRadius: 6.2,
  innerRadius: 3.1,
  // camera keyframes — one per scroll section
  cam: [[0, 3.4, 15.5], [11.5, 3.6, 9], [-1, 2.2, 15], [0, 17, 3.5], [0, 4.8, 13.5]],
  look: [[0, 1.2, 0], [0, 1, 0], [-5.5, 1.6, 0], [0, 0, 0], [0, 1.6, 0]],
};

boot(() => {
  const stage = createStage({
    background: 0x07040f, fog: { color: 0x07040f, density: 0.03 }, fov: 42, exposure: 1.05,
    bloom: { strength: 0.55, radius: 0.6, threshold: 0.62 }, vignette: 0.7, grain: 0.05, aberration: 0.04,
  });
  const { scene, camera } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const rail = createRail(CONFIG.cam, CONFIG.look);
  const rand = rng(11);

  /* spectrum ring: instanced bars standing on a circle */
  const dummy = new THREE.Object3D();
  const cA = new THREE.Color(CONFIG.accent), cB = new THREE.Color(CONFIG.second), tmp = new THREE.Color();
  function ring(count, radius, width) {
    const geo = new THREE.BoxGeometry(width, 1, width);
    geo.translate(0, 0.5, 0);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ toneMapped: false }), count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < count; i++) mesh.setColorAt(i, cB);
    scene.add(mesh);
    return { mesh, count, radius };
  }
  const outer = ring(CONFIG.outerBars, CONFIG.outerRadius, 0.17);
  const inner = ring(CONFIG.innerBars, CONFIG.innerRadius, 0.15);

  /* a fake-but-convincing spectrum: bass-heavy, mirrored, kicked by the beat */
  function level(i, n, t, beat, energy) {
    const idx = i < n / 2 ? i : n - 1 - i;
    const x = idx / (n / 2);
    const low = Math.exp(-x * 2.6);
    const wob = 0.5 + 0.5 * Math.sin(t * 2.1 + idx * 0.37) * Math.sin(t * 1.3 + idx * 0.11);
    const hat = Math.pow(Math.sin(t * 7 + idx * 0.9) * 0.5 + 0.5, 3) * x * 0.7;
    return (0.22 + low * 1.5 * wob + beat * (1 - x * 0.6) * 1.15 + hat) * energy;
  }
  function drive(r, t, beat, energy, spin, scale) {
    for (let i = 0; i < r.count; i++) {
      const a = (i / r.count) * Math.PI * 2 + spin;
      const h = level(i, r.count, t, beat, energy) * scale;
      dummy.position.set(Math.cos(a) * r.radius, 0, Math.sin(a) * r.radius);
      dummy.rotation.set(0, -a, 0);
      dummy.scale.set(1, Math.max(h, 0.05), 1);
      dummy.updateMatrix();
      r.mesh.setMatrixAt(i, dummy.matrix);
      tmp.lerpColors(cB, cA, clamp(h / 2.6)).multiplyScalar(0.42 + clamp(h / 3) * 0.55);
      r.mesh.setColorAt(i, tmp);
    }
    r.mesh.instanceMatrix.needsUpdate = true;
    r.mesh.instanceColor.needsUpdate = true;
  }

  /* heart of the room */
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 3), new THREE.MeshBasicMaterial({ color: 0xff6fb4, toneMapped: false }));
  core.position.y = 1.6;
  scene.add(core);
  const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), new THREE.MeshBasicMaterial({ color: CONFIG.second, wireframe: true, transparent: true, opacity: 0.55, toneMapped: false }));
  cage.position.y = 1.6;
  scene.add(cage);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.018, 8, 160), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
  halo.position.y = 1.6;
  halo.rotation.x = Math.PI / 2;
  scene.add(halo);

  /* floor glow + dark disc */
  const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshBasicMaterial({ color: 0x0b0618 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  scene.add(floor);
  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 26),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(255,61,154,0.9)', 'rgba(255,61,154,0)', 256), transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.01;
  scene.add(pool);
  [CONFIG.outerRadius, CONFIG.innerRadius].forEach((r) => {
    const l = new THREE.Mesh(new THREE.RingGeometry(r - 0.5, r - 0.49, 128), new THREE.MeshBasicMaterial({ color: CONFIG.second, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    l.rotation.x = -Math.PI / 2;
    l.position.y = 0.02;
    scene.add(l);
  });

  /* confetti of light */
  const N = 700, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = rand() * Math.PI * 2, r = 3 + rand() * 22;
    pos.set([Math.cos(a) * r, rand() * 16, Math.sin(a) * r], i * 3);
    tmp.lerpColors(cB, cA, rand());
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const motes = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
  scene.add(motes);

  let energy = 1, spin = 0;
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    const beat = Math.exp(-((t * CONFIG.bpm) / 60 % 1) * 5);
    energy = lerp(energy, 1 + Math.min(Math.abs(scroll.velocity) * 5, 1.2), 0.08);
    spin += dt * 0.05;
    drive(outer, t, beat, energy, spin, 2.4);
    drive(inner, t, beat, energy, -spin * 1.6, 1.7);
    const s = 1 + beat * 0.22;
    core.scale.setScalar(s);
    core.rotation.set(t * 0.3, t * 0.4, 0);
    cage.rotation.set(-t * 0.2, t * 0.25, 0);
    cage.scale.setScalar(1 + beat * 0.08);
    halo.scale.setScalar(1 + beat * 0.25);
    pool.material.opacity = 0.14 + beat * 0.12;
    motes.rotation.y = t * 0.03;
    motes.position.y = Math.sin(t * 0.4) * 0.4;
    const look = rail.apply(camera, p);
    camera.position.x += pointer.x * 0.7;
    camera.position.y += pointer.y * 0.4;
    camera.lookAt(look);
  });
  stage.start();
});
