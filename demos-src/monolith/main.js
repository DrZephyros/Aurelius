import {
  THREE, boot, createStage, createPointer, createScroll, createRail, createLabels,
  createNoise, createEnv, lightShaft, roundedRectShape, radialTexture, rng, smoothstep, lerp,
} from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  accent: 0x7fe3ff,
  rock: [0x0a1116, 0x3d5866], // valley → ridge colour
  dust: 700,
};

boot(() => {
  const stage = createStage({
    background: 0x04070a, fog: { color: 0x05090d, density: 0.022 }, fov: 36, exposure: 1.1,
    bloom: { strength: 0.32, radius: 0.5, threshold: 0.8 },
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();

  scene.environment = createEnv(renderer, [
    { pos: [-8, 10, 8], w: 14, h: 6, intensity: 7, color: 0xcfeeff },
    { pos: [10, 3, -8], w: 6, h: 14, intensity: 5, color: CONFIG.accent },
    { pos: [0, 14, -4], w: 18, h: 6, intensity: 3, color: 0xffffff },
    { pos: [6, -2, 10], w: 8, h: 3, intensity: 2, color: 0xffffff },
  ]);
  scene.environmentIntensity = 1;

  /* terrain */
  const noise = createNoise(11);
  const geo = new THREE.PlaneGeometry(150, 150, 280, 280);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  const c0 = new THREE.Color(CONFIG.rock[0]), c1 = new THREE.Color(CONFIG.rock[1]), tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), d = Math.hypot(x, z);
    const base = noise.fbm(x * 0.045, z * 0.045, 5);
    const ridge = 1 - Math.abs(noise.fbm(x * 0.03 + 9, z * 0.03 + 4, 4) * 2 - 1);
    let h = (base * 0.55 + ridge * ridge * 1.0) * 9;
    const flat = smoothstep(5, 16, d);
    h = h * flat + (noise.n2(x * 1.4, z * 1.4) - 0.5) * 0.45 * flat - 0.4;
    pos.setY(i, h);
    tmp.copy(c0).lerp(c1, Math.min(1, Math.max(0, h / 8) + noise.n2(x * 3, z * 3) * 0.12));
    cols.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.05 })));

  const pod = new THREE.Group();
  scene.add(pod);

  /* dais */
  const dais = new THREE.Mesh(
    new THREE.CylinderGeometry(3.6, 3.9, 0.5, 96),
    new THREE.MeshPhysicalMaterial({ color: 0x0b1015, metalness: 0.9, roughness: 0.28, clearcoat: 1 })
  );
  dais.position.y = -0.1;
  pod.add(dais);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.45, 0.025, 12, 160), new THREE.MeshBasicMaterial({ color: new THREE.Color(CONFIG.accent).multiplyScalar(1.3) }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.17;
  pod.add(ring);

  /* hero slab */
  const hero = new THREE.Group();
  hero.position.y = 2.4;
  hero.scale.setScalar(1.25);
  pod.add(hero);
  const slabGeo = new THREE.ExtrudeGeometry(roundedRectShape(1.5, 3.2, 0.55), {
    depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 12, curveSegments: 40,
  });
  slabGeo.center();
  const slab = new THREE.Mesh(slabGeo, new THREE.MeshPhysicalMaterial({
    color: 0x0a0d11, metalness: 1, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.5,
  }));
  hero.add(slab);

  // glass face with a tiny "UI"
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 1024;
  const g = cv.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, 1024);
  bg.addColorStop(0, '#0d2530'); bg.addColorStop(1, '#02070a');
  g.fillStyle = bg; g.fillRect(0, 0, 512, 1024);
  g.strokeStyle = '#7fe3ff'; g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.arc(256, 430, 150, Math.PI * 0.75, Math.PI * 2.1); g.stroke();
  g.strokeStyle = 'rgba(127,227,255,.25)'; g.lineWidth = 3;
  [560, 640, 720].forEach((y, i) => { g.beginPath(); g.moveTo(80, y); g.lineTo(80 + 352 * [0.9, 0.55, 0.75][i], y); g.stroke(); });
  g.fillStyle = '#e8fbff'; g.font = '600 96px Space Grotesk, sans-serif'; g.textAlign = 'center'; g.fillText('72', 256, 462);
  const faceTex = new THREE.CanvasTexture(cv);
  faceTex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRectShape(1.32, 2.96, 0.44), 32),
    new THREE.MeshBasicMaterial({ map: faceTex, color: new THREE.Color(1.5, 1.5, 1.5) })
  );
  // fix UV for shape geometry
  const fp = face.geometry.attributes.position, fu = face.geometry.attributes.uv;
  for (let i = 0; i < fp.count; i++) fu.setXY(i, fp.getX(i) / 1.32 + 0.5, fp.getY(i) / 2.96 + 0.5);
  face.position.z = 0.152 + 0.1;
  hero.add(face);

  // orbiting rings + satellites
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(CONFIG.accent).multiplyScalar(1.1) });
  const rings = [];
  [2.6, 3.3].forEach((r, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 8, 220), ringMat);
    m.rotation.set(Math.PI / 2 + (i ? 0.5 : -0.35), 0, i ? 0.3 : 0);
    hero.add(m);
    const sat = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(4) }));
    m.add(sat);
    rings.push({ m, sat, r, s: 0.4 + i * 0.25 });
  });

  /* labels (3D anchor → svg line → pill) */
  const anchors = [[0.55, 1.1, 0.3], [-0.5, 0.1, 0.3], [0.45, -1.2, 0.3]].map((p) => {
    const o = new THREE.Object3D(); o.position.set(...p); slab.add(o); return o;
  });
  const labels = createLabels(camera, [
    { el: document.getElementById('l1'), anchor: anchors[0], dx: 150, dy: -70 },
    { el: document.getElementById('l2'), anchor: anchors[1], dx: -170, dy: 10 },
    { el: document.getElementById('l3'), anchor: anchors[2], dx: 160, dy: 70 },
  ]);

  /* lights */
  scene.add(new THREE.HemisphereLight(0x5a8aa0, 0x05080a, 0.35));
  const key = new THREE.SpotLight(0xdff6ff, 420, 40, 0.4, 0.8, 1.6);
  key.position.set(3, 12, 6); key.target = hero; scene.add(key);
  const rim = new THREE.DirectionalLight(CONFIG.accent, 2.2);
  rim.position.set(-10, 6, -10); scene.add(rim);
  const under = new THREE.PointLight(CONFIG.accent, 10, 10, 2);
  under.position.set(0, 0.8, 0); pod.add(under);
  const shaft = lightShaft({ color: 0x8fdcff, height: 16, top: 0.4, bottom: 4.2, intensity: 0.12 });
  shaft.position.set(1, 14, 3); shaft.lookAt(0, 0, 0); shaft.rotateX(Math.PI / 2 * 0); scene.add(shaft);

  /* dust */
  const r = rng(5);
  const dp = new Float32Array(CONFIG.dust * 3);
  for (let i = 0; i < CONFIG.dust; i++) {
    const a = r() * 6.283, d = 2 + r() * 26;
    dp.set([Math.cos(a) * d, r() * 14, Math.sin(a) * d], i * 3);
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({
    size: 0.09, map: radialTexture(), transparent: true, opacity: 0.55, depthWrite: false,
    blending: THREE.AdditiveBlending, color: 0xaee8ff,
  }));
  scene.add(dust);

  /* camera rail — one keyframe per section */
  const rail = createRail(
    [[0, 2.8, 15.5], [5, 3, 9], [-2.4, 2.3, 5.4], [-9, 5.5, 9], [0, 13, 15]],
    [[0, 2.6, 0], [0, 2.4, 0], [0, 2.3, 0], [0, 1.6, 0], [0, 0.5, 0]]
  );

  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    rail.apply(camera, p);
    camera.position.x += pointer.x * 0.7;
    camera.position.y += pointer.y * 0.35;
    camera.lookAt(0, 2.2 + lerp(0.4, -1.2, p), 0);

    const xs = [2.4, -2.5, 2.1, -2.3, 0], k = Math.min(3.999, p * 4), i0 = Math.floor(k), f = k - i0;
    pod.position.x = lerp(xs[i0], xs[i0 + 1], f * f * (3 - 2 * f));
    hero.position.y = 2.4 + Math.sin(t * 0.8) * 0.12;
    hero.rotation.y = Math.sin(t * 0.35) * 0.3 + p * 1.4;
    hero.rotation.x = Math.sin(t * 0.5) * 0.04;
    rings.forEach((o, i) => {
      const a = t * o.s + i * 2;
      o.sat.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r, 0);
    });
    ring.material.color.setRGB(0.4, 1.1, 1.6).multiplyScalar(1.0 + Math.sin(t * 2) * 0.25);
    dust.rotation.y = t * 0.012;
    dust.position.y = Math.sin(t * 0.2) * 0.4;
    labels.update(smoothstep(0.14, 0.24, p) * (1 - smoothstep(0.36, 0.46, p)));
  });
  stage.start();
});
