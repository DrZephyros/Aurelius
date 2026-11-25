import { THREE, boot, createStage, createPointer, createScroll, radialTexture, rng, lerp, damp, clamp } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  streaks: 2400,
  length: 500, // depth of the tunnel
  tints: [0x5b8cff, 0xb25bff, 0x2de2ff, 0xff7a4d, 0x5b8cff], // one per section
  baseSpeed: 16,
};

boot(() => {
  const stage = createStage({
    background: 0x01030a, fov: 66, far: 700,
    bloom: { strength: 0.55, radius: 0.5, threshold: 0.45 }, aberration: 0.06, vignette: 0.75, exposure: 0.9,
  });
  const { scene, camera } = stage;
  camera.rotation.order = 'YXZ';
  scene.add(camera);
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(31);
  const L = CONFIG.length;
  const tint = new THREE.Color(CONFIG.tints[0]);

  /* streaks: every line is a star racing past the camera */
  const pos = [], end = [], spd = [], col = [];
  const pal = [[1, 1, 1], [0.7, 0.85, 1], [0.4, 0.6, 1], [1, 0.9, 0.8]];
  for (let i = 0; i < CONFIG.streaks; i++) {
    const a = R() * 6.283, r = 2.4 + Math.pow(R(), 0.55) * 48, z = -R() * L;
    const c = pal[Math.floor(R() * pal.length)], s = 0.6 + R() * 1.5;
    for (let k = 0; k < 2; k++) { pos.push(Math.cos(a) * r, Math.sin(a) * r, z); end.push(k); spd.push(s); col.push(...c); }
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  sg.setAttribute('aEnd', new THREE.Float32BufferAttribute(end, 1));
  sg.setAttribute('aSpd', new THREE.Float32BufferAttribute(spd, 1));
  sg.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
  const U = { uTravel: { value: 0 }, uLen: { value: 0.3 }, uTint: { value: tint } };
  const streaks = new THREE.LineSegments(sg, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aEnd; attribute float aSpd; attribute vec3 aCol; uniform float uTravel,uLen; varying vec3 vC; varying float vA;
      void main(){ vec3 p=position; float L=${L.toFixed(1)}; float z=mod(p.z+uTravel*aSpd,L)-L; z-=aEnd*uLen*aSpd*8.;
        p.z=z; float d=-z/L; vA=smoothstep(1.,.7,d)*smoothstep(0.,.04,d)*(1.-aEnd*.7); vC=aCol;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
    fragmentShader: 'uniform vec3 uTint; varying vec3 vC; varying float vA; void main(){ gl_FragColor=vec4(mix(vC,uTint,.55)*vA*.75,1.); }',
  }));
  streaks.frustumCulled = false;
  scene.add(streaks);

  /* gates */
  const gateMat = new THREE.MeshBasicMaterial({ color: tint.clone().multiplyScalar(2.2) });
  const gates = [];
  for (let i = 0; i < 16; i++) {
    const big = i % 4 === 0;
    const m = new THREE.Mesh(new THREE.TorusGeometry(big ? 11 : 7, big ? 0.14 : 0.05, 8, 128), gateMat);
    gates.push({ m, base: (i * L) / 16 });
    scene.add(m);
  }

  /* tumbling rocks */
  const rockGeo = new THREE.IcosahedronGeometry(1, 1);
  const rocks = new THREE.InstancedMesh(rockGeo, new THREE.MeshStandardMaterial({ color: 0x1a2236, roughness: 0.7, metalness: 0.4, flatShading: true }), 70);
  const rd = Array.from({ length: 70 }, () => ({
    a: R() * 6.283, r: 9 + R() * 26, base: R() * L, s: 0.4 + R() * 2.2, rx: R() * 3, ry: R() * 3, v: R() - 0.5,
  }));
  rocks.frustumCulled = false;
  scene.add(rocks);
  const key = new THREE.DirectionalLight(0x7aa8ff, 2.4);
  key.position.set(-4, 5, 3);
  scene.add(key, new THREE.AmbientLight(0x1a2850, 0.8));
  const cam = new THREE.PointLight(0xaad0ff, 400, 40, 2);
  camera.add(cam);

  /* vanishing point glow */
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture(), color: tint, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.35 }));
  glow.scale.set(170, 170, 1);
  glow.position.z = -L + 40;
  scene.add(glow);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s3 = new THREE.Vector3();
  const speedEl = document.getElementById('speed');
  const toTint = new THREE.Color();
  let travel = 0, speed = CONFIG.baseSpeed, n = 0;

  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    const target = CONFIG.baseSpeed + p * 26 + clamp(Math.abs(scroll.velocity) * 200, 0, 45);
    speed = damp(speed, target, 2.2, dt);
    travel += speed * dt;
    U.uTravel.value = travel;
    U.uLen.value = 0.04 + speed * 0.011;

    const k = Math.min(3.999, p * 4), i0 = Math.floor(k), f = k - i0;
    tint.set(CONFIG.tints[i0]).lerp(toTint.set(CONFIG.tints[i0 + 1]), f * f * (3 - 2 * f));
    gateMat.color.copy(tint).multiplyScalar(2.2);

    gates.forEach((g) => {
      g.m.position.z = ((g.base + travel) % L) - L;
      g.m.rotation.z = g.base + t * 0.1;
    });
    rd.forEach((r, i) => {
      const z = ((r.base + travel * r.s * 0.6) % L) - L;
      e.set(r.rx + t * r.v, r.ry + t * r.v * 0.7, 0);
      q.setFromEuler(e);
      v.set(Math.cos(r.a) * r.r, Math.sin(r.a) * r.r, z);
      s3.setScalar(0.5 + (r.s % 1) * 1.6);
      m4.compose(v, q, s3);
      rocks.setMatrixAt(i, m4);
    });
    rocks.instanceMatrix.needsUpdate = true;

    camera.fov = Math.min(105, 62 + speed * 0.45);
    camera.updateProjectionMatrix();
    camera.rotation.set(pointer.y * 0.07, -pointer.x * 0.09, t * 0.04 - pointer.x * 0.12);
    if (speedEl && ++n % 4 === 0) speedEl.textContent = String(Math.round(speed * 14)).padStart(4, '0');
  });
  stage.start();
});
