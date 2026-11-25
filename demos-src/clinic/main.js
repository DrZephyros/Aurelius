import { THREE, boot, createStage, createPointer, createScroll, createEnv, rng, lerp, clamp, smoothstep } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  pairs: 84,        // base-pair rungs in the helix
  radius: 1.7,
  pitch: 0.66,      // vertical gap between pairs
  twist: 0.36,      // radians between pairs
  cells: 70,        // floating cells
  colorA: 0x16b5a0, // strand A
  colorB: 0xffffff, // strand B
  rung: 0xa9d9d2,
  cross: 0x12a594,
};
const Y0 = -4;
const TOP = Y0 + CONFIG.pairs * CONFIG.pitch;

boot(() => {
  const stage = createStage({
    background: 0xe9f3f1, fog: { color: 0xe9f3f1, density: 0.018 }, fov: 38, exposure: 1.18,
    bloom: false, grain: 0.02, vignette: 0.12, aberration: 0.01,
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(21);

  scene.environment = createEnv(renderer, [
    { pos: [-8, 10, 8], w: 16, h: 8, intensity: 5, color: 0xffffff },
    { pos: [10, 4, -6], w: 8, h: 14, intensity: 3, color: 0xcffff4 },
    { pos: [0, 14, -2], w: 20, h: 8, intensity: 3.5, color: 0xffffff },
    { pos: [0, -8, 6], w: 20, h: 4, intensity: 1.2, color: 0xbfe8e1 },
  ], 0x8fb3ae);
  scene.environmentIntensity = 1.0;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbcd9d4, 1.2));
  const sun = new THREE.DirectionalLight(0xfff4e6, 2);
  sun.position.set(6, 12, 8);
  scene.add(sun);

  /* the double helix: two instanced strands + rungs */
  const n = CONFIG.pairs;
  const ball = new THREE.SphereGeometry(0.32, 32, 24);
  const matA = new THREE.MeshPhysicalMaterial({ color: CONFIG.colorA, roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 });
  const matB = new THREE.MeshPhysicalMaterial({ color: CONFIG.colorB, roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1 });
  const strandA = new THREE.InstancedMesh(ball, matA, n);
  const strandB = new THREE.InstancedMesh(ball, matB, n);
  const rungGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 10);
  const rungs = new THREE.InstancedMesh(rungGeo, new THREE.MeshPhysicalMaterial({ color: CONFIG.rung, roughness: 0.3, clearcoat: 0.6 }), n);
  const helix = new THREE.Group();
  helix.add(strandA, strandB, rungs);
  scene.add(helix);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), mid = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < n; i++) {
    const th = i * CONFIG.twist, y = Y0 + i * CONFIG.pitch;
    a.set(Math.cos(th) * CONFIG.radius, y, Math.sin(th) * CONFIG.radius);
    b.set(-a.x, y, -a.z);
    const s = 0.8 + 0.35 * Math.sin(i * 0.5);
    strandA.setMatrixAt(i, m4.compose(a, q.identity(), new THREE.Vector3(s, s, s)));
    strandB.setMatrixAt(i, m4.compose(b, q.identity(), new THREE.Vector3(s, s, s)));
    mid.copy(a).add(b).multiplyScalar(0.5);
    q.setFromUnitVectors(up, b.clone().sub(a).normalize());
    rungs.setMatrixAt(i, m4.compose(mid, q, new THREE.Vector3(1, a.distanceTo(b), 1)));
  }

  /* floating translucent cells */
  const cellMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.12, clearcoat: 1, transparent: true, opacity: 0.55 });
  const cells = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 28, 20), cellMat, CONFIG.cells);
  const tints = [0xffffff, 0xcdf3ec, 0x9fe3d6, 0xe6f7f4];
  const cd = [];
  for (let i = 0; i < CONFIG.cells; i++) {
    const ang = R() * 6.28, r = 3.2 + Math.pow(R(), 1.4) * 12;
    cd.push({ x: Math.cos(ang) * r, y: Y0 + R() * (TOP - Y0 + 6), z: Math.sin(ang) * r - 2, s: 0.18 + Math.pow(R(), 2) * 1.1, ph: R() * 6.28, sp: 0.2 + R() * 0.4 });
    cells.setColorAt(i, new THREE.Color(tints[i % tints.length]));
  }
  cells.frustumCulled = false;
  scene.add(cells);

  /* the plus sign that closes the story */
  const plus = new THREE.Shape(), t = 0.62, L = 1.7;
  plus.moveTo(-t, -L); plus.lineTo(t, -L); plus.lineTo(t, -t); plus.lineTo(L, -t); plus.lineTo(L, t); plus.lineTo(t, t);
  plus.lineTo(t, L); plus.lineTo(-t, L); plus.lineTo(-t, t); plus.lineTo(-L, t); plus.lineTo(-L, -t); plus.lineTo(-t, -t); plus.closePath();
  const cg = new THREE.ExtrudeGeometry(plus, { depth: 0.7, bevelEnabled: true, bevelSize: 0.24, bevelThickness: 0.24, bevelSegments: 8, curveSegments: 6 });
  cg.center();
  const cross = new THREE.Mesh(cg, new THREE.MeshPhysicalMaterial({ color: CONFIG.cross, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 }));
  cross.position.set(0, TOP + 3, 0);
  cross.scale.setScalar(0.001);
  scene.add(cross);

  const look = new THREE.Vector3(), right = new THREE.Vector3(), cp = new THREE.Vector3();
  const sides = [-3.0, 3.0, 0, 3.0, 0];
  stage.onFrame((dt, tm) => {
    pointer.update(dt, tm);
    const p = scroll.update(dt, tm);
    const yy = lerp(Y0 + 5, TOP + 2.5, p);
    const ang = 0.5 + p * 2.6 + pointer.x * 0.25;
    const dist = lerp(11, 9, Math.sin(p * Math.PI)) + smoothstep(0.82, 1, p) * 3;
    camera.position.set(Math.sin(ang) * dist, yy + pointer.y * 0.6, Math.cos(ang) * dist);
    const k = Math.min(3.999, p * 4), i0 = Math.floor(k), f = k - i0;
    const side = lerp(sides[i0], sides[i0 + 1], f * f * (3 - 2 * f));
    right.set(Math.cos(ang), 0, -Math.sin(ang));
    const fin = smoothstep(0.84, 0.99, p);
    look.set(0, yy + 0.5 + fin * 1.2, 0).addScaledVector(right, side * (1 - fin));
    camera.lookAt(look);

    helix.rotation.y = tm * 0.12;
    cd.forEach((c, i) => {
      const bob = Math.sin(tm * c.sp + c.ph);
      cp.set(c.x, c.y + bob * 0.8, c.z + Math.cos(tm * c.sp * 0.7 + c.ph) * 0.6);
      cells.setMatrixAt(i, m4.compose(cp, q.identity(), new THREE.Vector3(c.s, c.s, c.s)));
    });
    cells.instanceMatrix.needsUpdate = true;
    const g = smoothstep(0.7, 0.95, p);
    cross.scale.setScalar(Math.max(0.001, g * 1.15));
    cross.position.y = TOP + 3 + Math.sin(tm * 0.9) * 0.15;
    cross.rotation.y = tm * 0.5;
    cross.rotation.x = Math.sin(tm * 0.6) * 0.1;
  });
  stage.start();
});
