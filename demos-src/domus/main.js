import { THREE, boot, createStage, createPointer, createScroll, createRail, createLabels, createEnv, rng, lerp, clamp, smoothstep } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  accent: 0xe2603a,           // the featured home's roof + pin
  day: 0xf0e6d8,              // sky / fog colour in the morning
  dusk: 0xf4c19a,             // …and at golden hour (scroll shifts between them)
  grid: 5,                    // lots per side
  cell: 4.2,                  // street-to-street spacing
  walls: [0xf6efe3, 0xeadcc4, 0xe0e7dc, 0xf1d9ce, 0xd9e0e8],
  roofs: [0xb4543a, 0x8a4b3a, 0x5f6872, 0x9c6b4e],
  // camera keyframes — one per scroll section
  cam: [[24, 21, 24], [-13, 4.6, 12], [5.2, 3.1, 7.2], [-6.5, 2.4, 9], [0, 17, 24]],
  look: [[0, 0, 0], [0, 1, 0], [0, 1.3, 0], [0, 1.4, 0], [0, 0, 0]],
};

boot(() => {
  const stage = createStage({
    background: CONFIG.day, fog: { color: CONFIG.day, density: 0.0055 }, fov: 32, exposure: 0.95,
    bloom: false, grain: 0.03, vignette: 0.16, aberration: 0.008,
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const rail = createRail(CONFIG.cam, CONFIG.look);
  const rand = rng(21);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.environment = createEnv(renderer, [
    { pos: [-8, 10, 8], w: 16, h: 8, intensity: 3.6, color: 0xfff1dc },
    { pos: [10, 3, -8], w: 8, h: 14, intensity: 1.8, color: 0xdfe9ff },
    { pos: [0, 14, -2], w: 20, h: 8, intensity: 2.6, color: 0xffffff },
  ], 0xb0a690);
  scene.environmentIntensity = 0.55;
  const hemi = new THREE.HemisphereLight(0xfff6ea, 0xb9b09f, 1.05);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 3.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 90 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  const town = new THREE.Group();
  scene.add(town);
  const std = (color, rough = 0.85) => new THREE.MeshStandardMaterial({ color, roughness: rough });

  /* ground: dark ring-road slab → pavement lots → houses */
  const size = CONFIG.grid * CONFIG.cell;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), std(0xe6dac6, 1));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.62;
  ground.receiveShadow = true;
  scene.add(ground);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(size + 1.2, 0.6, size + 1.2), std(0xd8ccb8, 1));
  slab.position.y = -0.31;
  slab.receiveShadow = slab.castShadow = true;
  town.add(slab);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(size + 0.6, size + 0.6), std(0xb9b2a6, 1));
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.005;
  road.receiveShadow = true;
  town.add(road);
  /* lane dashes down the middle of each street */
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xf3ede2 });
  for (let i = 1; i < CONFIG.grid; i++) {
    const o = (i - CONFIG.grid / 2) * CONFIG.cell;
    for (let d = 0; d < 22; d++) {
      const u = -size / 2 + 0.5 + d * (size / 22);
      [[o, u, 0.08, 0.5], [u, o, 0.5, 0.08]].forEach(([x, z, w, h]) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), dashMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.012, z);
        town.add(m);
      });
    }
  }

  const windowMat = new THREE.MeshBasicMaterial({ color: 0xbcd3e4 });
  const grass = std(0xcfdbb4), leaf = new THREE.MeshStandardMaterial({ color: 0x86a96a, roughness: 0.9, flatShading: true });
  const leaf2 = new THREE.MeshStandardMaterial({ color: 0x6f9a62, roughness: 0.9, flatShading: true });
  const trunk = std(0x7b5a3e);
  const pick = (a) => a[Math.floor(rand() * a.length)];

  function tree(x, z, s = 1) {
    const g = new THREE.Group();
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.07 * s, 0.4 * s, 6), trunk);
    tr.position.y = 0.2 * s;
    const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38 * s, 1), rand() > 0.5 ? leaf : leaf2);
    cr.position.y = 0.62 * s;
    cr.castShadow = true;
    g.add(tr, cr);
    g.position.set(x, 0, z);
    town.add(g);
  }

  function house(x, z, o = {}) {
    const g = new THREE.Group();
    const w = (o.w ?? 1.3 + rand() * 0.5), d = (o.d ?? 1.1 + rand() * 0.4), h = (o.h ?? 0.9 + rand() * 0.55);
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(o.wall ?? pick(CONFIG.walls), 0.9));
    body.position.y = h / 2;
    body.castShadow = body.receiveShadow = true;
    const rh = o.rh ?? 0.5 + rand() * 0.2;
    const shape = new THREE.Shape();
    shape.moveTo(-(w + 0.18) / 2, 0);
    shape.lineTo((w + 0.18) / 2, 0);
    shape.lineTo(0, rh);
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: d + 0.16, bevelEnabled: false }), std(o.roof ?? pick(CONFIG.roofs), 0.8));
    roof.position.set(0, h, -(d + 0.16) / 2);
    roof.castShadow = true;
    const chim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), std(0x8c6a58));
    chim.position.set(w * 0.25, h + rh * 0.55, -d * 0.1);
    chim.castShadow = true;
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.4, 0.04), std(o.door ?? 0x3d3a44));
    door.position.set(0, 0.2, d / 2 + 0.01);
    g.add(body, roof, chim, door);
    [-1, 1].forEach((s) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.26), windowMat);
      win.position.set(s * w * 0.28, h * 0.62, d / 2 + 0.012);
      g.add(win);
    });
    g.position.set(x, 0.02, z);
    g.rotation.y = o.rot ?? Math.floor(rand() * 4) * (Math.PI / 2);
    g.userData = { w, d, h, rh };
    town.add(g);
    return g;
  }

  const mid = Math.floor(CONFIG.grid / 2);
  let featured = null;
  for (let gx = 0; gx < CONFIG.grid; gx++) {
    for (let gz = 0; gz < CONFIG.grid; gz++) {
      const x = (gx - mid) * CONFIG.cell, z = (gz - mid) * CONFIG.cell;
      const lot = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.06, 2.9), grass);
      lot.position.set(x, 0.03, z);
      lot.receiveShadow = true;
      town.add(lot);
      if (gx === mid && gz === mid) {
        featured = house(x, z, { w: 1.9, d: 1.55, h: 1.35, rh: 0.75, wall: 0xfbf6ec, roof: CONFIG.accent, door: 0x2a1f16, rot: 0 });
        featured.scale.setScalar(1.2);
        continue;
      }
      if (rand() < 0.22) {
        for (let k = 0; k < 3; k++) tree(x + (rand() - 0.5) * 2, z + (rand() - 0.5) * 2, 1 + rand() * 0.6);
      } else {
        house(x, z);
        if (rand() < 0.6) tree(x + (rand() > 0.5 ? 1 : -1) * 1.1, z + (rand() > 0.5 ? 1 : -1) * 1.15, 0.8 + rand() * 0.4);
      }
    }
  }

  /* "for sale" pin that bobs above the featured home */
  const pinMat = new THREE.MeshStandardMaterial({ color: CONFIG.accent, roughness: 0.35, emissive: CONFIG.accent, emissiveIntensity: 0.35 });
  const pin = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 28), pinMat);
  cone.rotation.x = Math.PI;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), pinMat);
  ball.position.y = 0.36;
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  dot.position.set(0, 0.36, 0.2);
  pin.add(cone, ball, dot);
  pin.position.set(0, 3.1, 0);
  pin.traverse((m) => (m.castShadow = m.isMesh));
  town.add(pin);
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), new THREE.MeshBasicMaterial({ color: CONFIG.accent, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  pulse.rotation.x = -Math.PI / 2;
  pulse.position.y = 0.09;
  town.add(pulse);

  /* anchors live inside the town group so the callouts rotate with it */
  const anchor = (x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); town.add(o); return o; };
  const labels = createLabels(camera, [
    { el: document.getElementById('l1'), anchor: anchor(-1.2, 1.5, 0.8), dx: -90, dy: -70 },
    { el: document.getElementById('l2'), anchor: anchor(1.5, 0.3, -1.4), dx: 90, dy: 60 },
    { el: document.getElementById('l3'), anchor: anchor(3.5, 0.5, 4.2), dx: 80, dy: -80 },
  ]);

  const cDay = new THREE.Color(CONFIG.day), cDusk = new THREE.Color(CONFIG.dusk), tmp = new THREE.Color();
  const wDay = new THREE.Color(0xbcd3e4), wNight = new THREE.Color(0xffc874);
  const sunDay = new THREE.Color(0xfff0d8), sunDusk = new THREE.Color(0xff9a54);
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);

    /* golden hour: sky, fog, sun colour + height and window glow all follow the scroll */
    const g = smoothstep(0.52, 0.86, p) * (1 - smoothstep(0.93, 1, p) * 0.85);
    tmp.lerpColors(cDay, cDusk, g);
    scene.background.copy(tmp);
    scene.fog.color.copy(tmp);
    renderer.setClearColor(tmp, 1);
    sun.color.lerpColors(sunDay, sunDusk, g);
    sun.intensity = lerp(3.2, 2.6, g);
    sun.position.set(lerp(18, -20, g), lerp(26, 8, g), lerp(14, 16, g));
    hemi.intensity = lerp(1.05, 0.7, g);
    windowMat.color.lerpColors(wDay, wNight, g);

    town.rotation.y = p * 0.5 + t * 0.012 + pointer.x * 0.05;
    pin.position.y = 3.05 + Math.sin(t * 1.6) * 0.12;
    pin.rotation.y = t * 0.8;
    const k = (t * 0.7) % 1;
    pulse.scale.setScalar(0.6 + k * 1.8);
    pulse.material.opacity = (1 - k) * 0.5;

    const look = rail.apply(camera, p);
    camera.position.x += pointer.x * 0.6;
    camera.position.y += pointer.y * 0.35;
    camera.lookAt(look);
    labels.update(clamp(1 - Math.abs(p - 0.5) / 0.14));
  });
  stage.start();
});
