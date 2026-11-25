import { THREE, boot, createStage, createPointer, createScroll, createRail, createEnv, radialTexture, rng, damp } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  paint: 0x055e5c,             // body colour (deep lagoon pearl)
  accent: 0x5cffc4,            // light blades, streaks, UI
  speed: 26,                   // how fast the world streams past (units / s)
  streaks: 70,
  // camera keyframes — one per scroll section (car is ~4.7 long, nose at +x)
  cam: [[7.0, 1.2, 6.6], [0.8, 0.8, 9.0], [-7.4, 1.6, 4.4], [2.0, 8.2, 2.4], [9.4, 1.9, -6.6]],
  // where the camera looks — offset sideways so the car never sits on top of the copy
  look: [[-1.5, 0.5, 1.5], [3.0, 0.55, 0], [-1.1, 0.6, -2.2], [1.8, 0.2, -1.25], [0, 0.35, 0]],
};

/* smooth 1-D curve through (x, y) knots (cubic Hermite, finite-difference tangents) */
function curve(pts) {
  const n = pts.length;
  const m = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    return (b[1] - a[1]) / Math.max(1e-6, b[0] - a[0]);
  });
  return (x) => {
    if (x <= pts[0][0]) return pts[0][1];
    if (x >= pts[n - 1][0]) return pts[n - 1][1];
    let i = 0;
    while (x > pts[i + 1][0]) i++;
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], h = x1 - x0, t = (x - x0) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * m[i + 1];
  };
}

/* ── body: a wedge lofted from chamfered cross-sections ─────────
   Each station is a polyline (bottom-centre → up the right flank → crown), mirrored to the left.
   Doubled corner points give crisp, light-catching edges instead of a soft blob. */
function sectionPts(x, F) {
  const b = F.bot(x), t = F.top(x), W = F.half(x), f = t + F.fh(x), m = b + (f - b) * 0.46;
  return [
    [b, 0], [b, 0.7 * W], [b + 0.05, 0.92 * W], [m, W], [f - 0.12, 0.95 * W],
    [f - 0.025, 0.82 * W], [f, 0.7 * W], [t + 0.2 * F.fh(x), 0.34 * W], [t, 0],
  ];
}
function loftBody(F, color, { x0, x1, stations = 140 }) {
  const pos = [], col = [], idx = [];
  const R = sectionPts(x0, F).length;
  const ring = R * 2 - 2;
  const addRing = (x, scale = 1) => {
    const pts = sectionPts(x, F);
    const out = [];
    for (let k = 0; k < R; k++) out.push([pts[k], k, 1]);
    for (let k = R - 2; k >= 1; k--) out.push([pts[k], k, -1]);
    const cy = (F.bot(x) + F.top(x)) / 2;
    for (const [[y, z], k, s] of out) {
      pos.push(x, cy + (y - cy) * scale, z * s * scale);
      col.push(...color(k, x));
    }
  };
  for (let i = 0; i <= stations; i++) {
    const u = i / stations;
    const x = x0 + (x1 - x0) * u;
    addRing(x);
  }
  for (let i = 0; i < stations; i++) for (let k = 0; k < ring; k++) {
    const a = i * ring + k, b = i * ring + ((k + 1) % ring), c = (i + 1) * ring + k, d = (i + 1) * ring + ((k + 1) % ring);
    idx.push(a, c, b, b, c, d);
  }
  /* end caps (own vertices so the nose and tail keep a hard edge) */
  for (const [i, flip] of [[0, true], [stations, false]]) {
    const base = pos.length / 3;
    const x = x0 + (x1 - x0) * (i / stations);
    const cy = (F.bot(x) + F.top(x)) / 2;
    for (let k = 0; k < ring; k++) {
      const v = (i * ring + k) * 3;
      pos.push(pos[v], pos[v + 1], pos[v + 2]);
      col.push(0.02, 0.02, 0.025);
    }
    pos.push(x, cy, 0); col.push(0.02, 0.02, 0.025);
    for (let k = 0; k < ring; k++) {
      const a = base + k, b = base + ((k + 1) % ring), c = base + ring;
      flip ? idx.push(a, b, c) : idx.push(b, a, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  /* make sure the winding faces outward (crown normal must point up) */
  const mid = ((stations >> 1) * ring + (R - 1)) * 3;
  if (g.attributes.normal.array[mid + 1] < 0) {
    const ix = g.index.array;
    for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
    g.computeVertexNormals();
  }
  return g;
}

/* loft a closed superellipse cross-section along x → the glasshouse */
function loft({ x0, x1, top, bottom, half, exp = 2.6, taper = [10, 3], stations = 90, ring = 56, color }) {
  const pos = [], col = [], idx = [];
  for (let i = 0; i <= stations; i++) {
    const x = x0 + ((x1 - x0) * i) / stations;
    const u = (x - x0) / (x1 - x0);
    const tp = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * u - 1), taper[0])), 1 / taper[1]);
    const t = top(x), b = bottom(x), cy = (t + b) / 2, hh = ((t - b) / 2) * tp, hw = half(x) * tp;
    for (let k = 0; k < ring; k++) {
      const a = (k / ring) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const px = Math.sign(c) * Math.pow(Math.abs(c), 2 / exp), py = Math.sign(s) * Math.pow(Math.abs(s), 2 / exp);
      pos.push(x, cy + hh * py, hw * px);
      col.push(...(color ? color(py, px, x) : [1, 1, 1]));
    }
  }
  for (let i = 0; i < stations; i++) for (let k = 0; k < ring; k++) {
    const a = i * ring + k, b = i * ring + ((k + 1) % ring), c = (i + 1) * ring + k, d = (i + 1) * ring + ((k + 1) % ring);
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

boot(() => {
  const stage = createStage({
    background: 0x05070a, fog: { color: 0x05070a, density: 0.03 }, fov: 32, exposure: 0.92,
    bloom: { strength: 0.42, radius: 0.5, threshold: 0.85 }, vignette: 0.7, grain: 0.05, aberration: 0.02,
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const rail = createRail(CONFIG.cam, CONFIG.look);
  const rand = rng(33);

  scene.environment = createEnv(renderer, [
    { pos: [0, 9, 0], w: 18, h: 3, intensity: 9, color: 0xffffff },
    { pos: [-8, 4, 6], w: 14, h: 2, intensity: 8, color: 0xffffff },
    { pos: [9, 3, -5], w: 3, h: 10, intensity: 5, color: CONFIG.accent },
    { pos: [-9, 2, -4], w: 3, h: 10, intensity: 4, color: 0x7a5cff },
    { pos: [0, 2, 12], w: 18, h: 4, intensity: 4, color: 0xffffff },
  ], 0x040508);
  scene.environmentIntensity = 0.62;
  const key = new THREE.SpotLight(0xffffff, 110, 40, 0.5, 0.7, 1.4);
  key.position.set(-4, 9, 5);
  key.target.position.set(0, 0.5, 0);
  scene.add(key, key.target);
  const rim = new THREE.SpotLight(CONFIG.accent, 22, 30, 0.6, 0.8, 1.4);
  rim.position.set(6, 4, -6);
  rim.target.position.set(0, 0.5, 0);
  scene.add(rim, rim.target);

  /* ── the car: KESTREL — wedge body, glasshouse, aero ───────── */
  const car = new THREE.Group();
  scene.add(car);
  const paintC = new THREE.Color(CONFIG.paint);
  const carbon = [0.015, 0.017, 0.022];

  const F = {
    bot: curve([[-2.35, 0.3], [-2.1, 0.2], [-1.6, 0.15], [1.6, 0.15], [2.1, 0.17], [2.35, 0.2]]),
    top: curve([[-2.35, 0.76], [-2.0, 0.86], [-1.5, 0.9], [-0.9, 0.8], [-0.2, 0.66], [0.6, 0.62], [1.2, 0.6], [1.8, 0.48], [2.1, 0.34], [2.35, 0.27]]),
    fh: curve([[-2.35, 0], [-2.1, 0.1], [-1.5, 0.17], [-0.9, 0.12], [-0.3, 0.04], [0.4, 0.04], [1.0, 0.14], [1.45, 0.22], [1.9, 0.1], [2.2, 0.03], [2.35, 0]]),
    half: curve([[-2.35, 0.55], [-2.1, 0.82], [-1.6, 0.98], [-1.0, 0.96], [-0.3, 0.86], [0.3, 0.84], [1.0, 0.93], [1.5, 1.0], [2.0, 0.9], [2.35, 0.5]]),
  };
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, metalness: 0.55, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.03, side: THREE.DoubleSide });
  const bodyGeo = loftBody(F, (k, x) => {
    if (k <= 2) return carbon;                 // floor + sill rock-guard
    if (x > 2.12) return carbon;               // front fascia blade
    return [paintC.r, paintC.g, paintC.b];
  }, { x0: -2.35, x1: 2.35 });
  car.add(new THREE.Mesh(bodyGeo, paint));

  /* glasshouse: forward cabin, fastback roof, dark glass */
  const cabTop = curve([[-1.5, 0.88], [-1.15, 1.0], [-0.55, 1.1], [0.05, 1.12], [0.45, 1.03], [0.8, 0.86], [1.05, 0.7]]);
  const cabBot = (x) => F.top(x) - 0.12;
  const cabHalf = curve([[-1.5, 0.42], [-1.1, 0.64], [-0.4, 0.74], [0.3, 0.74], [0.8, 0.66], [1.05, 0.52]]);
  const roofC = [0.02, 0.025, 0.03];
  const cabGeo = loft({ x0: -1.5, x1: 1.05, top: cabTop, bottom: cabBot, half: cabHalf, exp: 2.8, taper: [6, 2.2], color: (py, px) => (py > 0.7 && Math.abs(px) < 0.6 ? roofC : [0.01, 0.018, 0.026]) });
  car.add(new THREE.Mesh(cabGeo, new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, metalness: 0.9, roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.02 })));

  const dark = new THREE.MeshStandardMaterial({ color: 0x040506, roughness: 0.85 });
  const cf = new THREE.MeshPhysicalMaterial({ color: 0x0b0c10, metalness: 0.7, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.15 });
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xaeb2bc, metalness: 1, roughness: 0.3 });
  const graphite = new THREE.MeshPhysicalMaterial({ color: 0x1b1d22, metalness: 1, roughness: 0.34 });
  const glow = (c, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false });
  const paintFlat = new THREE.MeshPhysicalMaterial({ color: paintC, metalness: 0.55, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.03 });
  const add = (mesh, x, y, z, rx = 0, ry = 0, rz = 0) => { mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz); car.add(mesh); return mesh; };
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  /* front: carbon splitter, endplates, centre air-blade */
  add(box(0.5, 0.025, 1.78, cf), 2.28, 0.085, 0, 0, 0, 0.03);
  for (const s of [-1, 1]) {
    add(box(0.46, 0.1, 0.02, cf), 2.28, 0.13, s * 0.88);
    add(box(0.26, 0.05, 0.3, dark), 2.14, 0.24, s * 0.5, 0, s * -0.25, 0);   // brake ducts
  }
  add(box(0.04, 0.045, 0.72, glow(CONFIG.accent, 1.5)), 2.355, 0.235, 0);      // lit air blade

  /* headlights: two stacked blades per side, swept back like a falcon's brow */
  const eyes = [];
  for (const s of [-1, 1]) {
    const a = add(box(0.62, 0.028, 0.055, glow(0xe8f6ff, 2.1)), 1.92, 0.5, s * 0.6, 0, s * -0.62, -0.2);
    const b = add(box(0.4, 0.02, 0.04, glow(CONFIG.accent, 2)), 1.98, 0.43, s * 0.52, 0, s * -0.62, -0.2);
    eyes.push(a, b);
  }

  /* side: glowing sill blade, intake scoops, mirrors */
  const sillPath = new THREE.CatmullRomCurve3(Array.from({ length: 14 }, (_, i) => { const x = -1.05 + i * 0.2; return new THREE.Vector3(x, 0.235, F.half(x) * 0.985 + 0.005); }));
  for (const s of [-1, 1]) {
    const tube = new THREE.Mesh(new THREE.TubeGeometry(sillPath, 60, 0.011, 6, false), glow(CONFIG.accent, 1.6));
    tube.scale.z = s;
    car.add(tube);
    const scoop = box(0.78, 0.2, 0.1, dark);
    add(scoop, -0.75, 0.52, s * (F.half(-0.75) - 0.01), 0, s * -0.12, 0);
    add(box(0.8, 0.02, 0.11, glow(CONFIG.accent, 0.9)), -0.75, 0.63, s * (F.half(-0.75) - 0.005), 0, s * -0.12, 0);
    add(box(0.14, 0.07, 0.03, dark), 0.74, 0.8, s * 0.86);
    add(box(0.05, 0.05, 0.2, paintFlat), 0.74, 0.75, s * 0.77, 0, 0, 0);
    const mir = box(0.17, 0.1, 0.07, paintFlat);
    add(mir, 0.72, 0.8, s * 0.92, 0, s * -0.3, 0);
  }

  /* rear deck: glowing louvres, flying buttress fins */
  for (let i = 0; i < 6; i++) {
    const x = -1.5 - i * 0.12;
    add(box(0.07, 0.012, 0.8 - i * 0.03, glow(CONFIG.accent, 0.55 + i * 0.1)), x, F.top(x) + 0.03, 0);
    add(box(0.05, 0.02, 0.84 - i * 0.03, dark), x - 0.055, F.top(x) + 0.032, 0);
  }

  /* rear wing on swan-neck pylons — tilts with speed */
  const wing = new THREE.Group();
  wing.add(box(0.5, 0.035, 1.98, cf));
  wing.children[0].position.set(0, 0, 0);
  const flap = box(0.2, 0.025, 1.9, paintFlat); flap.position.set(-0.12, 0.05, 0); flap.rotation.z = 0.28; wing.add(flap);
  for (const s of [-1, 1]) {
    const plate = box(0.62, 0.17, 0.02, cf); plate.position.set(-0.04, 0.02, s * 1.0); wing.add(plate);
    const lit = box(0.5, 0.01, 0.022, glow(CONFIG.accent, 1.7)); lit.position.set(-0.04, 0.105, s * 1.0); wing.add(lit);
  }
  wing.position.set(-2.3, 1.12, 0);
  car.add(wing);
  for (const s of [-1, 1]) add(box(0.16, 0.36, 0.035, cf), -2.28, 0.95, s * 0.5, 0, 0, 0.12);

  /* tail: lit blade, centre brake stripe, diffuser fins */
  const tailMat = glow(CONFIG.accent, 1.9);
  const tails = [];
  for (const s of [-1, 1]) {
    const t1 = add(box(0.05, 0.05, 0.82, tailMat), -2.33, 0.66, s * 0.47, 0, s * 0.22, 0.12);
    const t2 = add(box(0.05, 0.14, 0.05, tailMat), -2.32, 0.55, s * 0.9, 0, s * 0.22, 0.12);
    tails.push(t1, t2);
  }
  add(box(0.05, 0.035, 0.34, glow(0xff3b4a, 1.8)), -2.355, 0.68, 0);
  add(box(0.03, 0.22, 1.5, dark), -2.36, 0.4, 0);
  for (let i = -4; i <= 4; i++) add(box(0.44, 0.17, 0.014, cf), -2.1, 0.22, i * 0.15, 0, 0, 0.0);
  add(box(0.5, 0.02, 1.4, cf), -2.1, 0.12, 0, 0, 0, -0.12);

  /* wheels: wide dished turbine rims, ceramic discs, glowing calipers */
  const wheels = [];
  const lathe = (R) => new THREE.LatheGeometry([[R - 0.2, -0.17], [R - 0.05, -0.17], [R - 0.01, -0.12], [R, -0.06], [R, 0.06], [R - 0.01, 0.12], [R - 0.05, 0.17], [R - 0.2, 0.17]].map(([r, y]) => new THREE.Vector2(r, y)), 64);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.88 });
  const blade = new THREE.BoxGeometry(0.018, 0.2, 0.05);
  const caliperMat = new THREE.MeshStandardMaterial({ color: CONFIG.accent, emissive: CONFIG.accent, emissiveIntensity: 0.5, roughness: 0.4 });
  [[1.42, 1, 0.36], [1.42, -1, 0.36], [-1.42, 1, 0.39], [-1.42, -1, 0.39]].forEach(([x, s, R]) => {
    const hw = F.half(x);
    const arch = new THREE.Mesh(new THREE.CircleGeometry(R + 0.07, 48), dark);
    arch.position.set(x, R, s * (hw + 0.004));
    arch.rotation.y = s > 0 ? 0 : Math.PI;
    car.add(arch);
    const trim = new THREE.Mesh(new THREE.TorusGeometry(R + 0.07, 0.016, 8, 64), cf);
    trim.position.set(x, R, s * (hw + 0.006));
    car.add(trim);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(lathe(R), tireMat));
    const face = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.08, R - 0.08, 0.05, 48), graphite); face.position.y = 0.1; g.add(face);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(R - 0.075, 0.016, 8, 56), metal); lip.rotation.x = Math.PI / 2; lip.position.y = 0.13; g.add(lip);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.14, R - 0.14, 0.03, 40), new THREE.MeshPhysicalMaterial({ color: 0x444750, metalness: 1, roughness: 0.4 })); disc.position.y = 0.02; g.add(disc);
    const N = 14;
    for (let i = 0; i < N; i++) {
      const sp = new THREE.Mesh(blade, metal);
      const a = (i / N) * Math.PI * 2, rr = (R - 0.1) * 0.5;
      sp.scale.y = (R - 0.12) / 0.2;
      sp.position.set(Math.sin(a) * rr, 0.13, Math.cos(a) * rr);
      sp.rotation.set(0, a, 0.0);
      sp.rotateY(0.5);
      g.add(sp);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 20), metal); hub.position.y = 0.14; g.add(hub);
    const cal = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.1), caliperMat); cal.position.set(R - 0.2, 0.02, 0); g.add(cal);
    g.rotation.x = Math.PI / 2;
    g.position.set(x, R, s * (hw - 0.12));
    if (s < 0) g.rotation.x = -Math.PI / 2;
    car.add(g);
    wheels.push({ g, s });
  });

  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 5),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(210,240,255,0.9)', 'rgba(210,240,255,0)', 256), transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(6.2, 0.02, 0);
  car.add(pool);

  /* road: glossy, reflective asphalt, lane dashes + speed streaks that stream past */
  const road = new THREE.Mesh(new THREE.PlaneGeometry(240, 60), new THREE.MeshStandardMaterial({ color: 0x0b0e12, roughness: 0.5, metalness: 0.3 }));
  road.rotation.x = -Math.PI / 2;
  scene.add(road);
  const underglow = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(92,255,196,0.9)', 'rgba(92,255,196,0)', 256), transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  underglow.rotation.x = -Math.PI / 2;
  underglow.position.y = 0.02;
  scene.add(underglow);

  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(3, 0.01, 0.1), new THREE.MeshBasicMaterial({ color: 0x8a8d96 }), 40);
  const streaks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.025, 0.025), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }), CONFIG.streaks);
  const sk = Array.from({ length: CONFIG.streaks }, () => ({
    x: (rand() - 0.5) * 120, y: 0.15 + rand() * 2.6, z: (rand() > 0.5 ? 1 : -1) * (2.8 + rand() * 12), len: 4 + rand() * 12, v: 0.7 + rand() * 0.6, hue: rand(),
  }));
  scene.add(dashes, streaks);
  const o = new THREE.Object3D();
  const cA = new THREE.Color(CONFIG.accent).multiplyScalar(1.6), cB = new THREE.Color(0xa58bff).multiplyScalar(1.3), cWhite = new THREE.Color(0xdfe9ff).multiplyScalar(1.2);
  sk.forEach((s, i) => streaks.setColorAt(i, s.hue > 0.6 ? cA : s.hue > 0.3 ? cB : cWhite));

  let boost = 1, tx = 0, roll = 0, wingA = 0;
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    boost = damp(boost, 1 + Math.min(Math.abs(scroll.velocity) * 12, 2.2), 3, dt);
    const v = CONFIG.speed * boost;
    for (let i = 0; i < 40; i++) {
      const x = ((((i * 6 - t * v * 0.35) % 240) + 240) % 240) - 120;
      o.position.set(x, 0.01, i % 2 ? 6 : -6);
      o.updateMatrix();
      dashes.setMatrixAt(i, o.matrix);
    }
    dashes.instanceMatrix.needsUpdate = true;
    sk.forEach((s, i) => {
      s.x -= dt * v * s.v;
      if (s.x < -60 - s.len) s.x = 60 + rand() * 40;
      o.position.set(s.x, s.y, s.z);
      o.scale.set(s.len * Math.min(boost, 2), 1, 1);
      o.updateMatrix();
      streaks.setMatrixAt(i, o.matrix);
    });
    streaks.instanceMatrix.needsUpdate = true;
    streaks.instanceColor.needsUpdate = true;

    wheels.forEach(({ g, s }) => (g.rotation.y -= dt * v * 0.5 * (s > 0 ? 1 : -1)));
    tx = damp(tx, pointer.x, 3, dt);
    roll = damp(roll, -pointer.x * 0.02, 3, dt);
    car.rotation.set(roll, tx * 0.05, 0);
    car.position.y = Math.sin(t * 1.3) * 0.006;
    wingA = damp(wingA, Math.min(0.06 + (boost - 1) * 0.18, 0.4), 3, dt);   // active aero: wing bites harder as you scroll
    wing.rotation.z = -wingA;
    tailMat.color.set(CONFIG.accent).multiplyScalar(1.8 + Math.sin(t * 2) * 0.25);
    const look = rail.apply(camera, p);
    camera.position.x += pointer.x * 0.5;
    camera.position.y += pointer.y * 0.3;
    camera.lookAt(look);
  });
  stage.start();
});
