import { THREE, boot, createStage, createPointer, createScroll, createRail, createNoise, lightShaft, radialTexture, rng, GLSL_NOISE } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  accent: 0x3df5d0,
  jellies: [0x3df5d0, 0x7a8cff, 0xff6ad5, 0x3df5d0, 0x66d9ff, 0xb08cff, 0x3df5d0],
  snow: 4500,
  seabed: -70,
};

boot(() => {
  const stage = createStage({
    background: 0x001018, fog: { color: 0x011820, density: 0.034 }, fov: 55, far: 400,
    bloom: { strength: 0.5, radius: 0.8, threshold: 0.5 }, exposure: 1.0,
  });
  const { scene, camera } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(77);
  const shared = { uTime: { value: 0 } };

  /* water surface seen from below: animated caustics */
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(500, 500).rotateX(Math.PI / 2), new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: 'varying vec2 vXZ; void main(){ vec4 w=modelMatrix*vec4(position,1.); vXZ=w.xz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader: `${GLSL_NOISE} uniform float uTime; varying vec2 vXZ;
      float caustic(vec2 p){ float n=snoise(vec3(p*.14,uTime*.16)); float m=snoise(vec3(p*.31+7.,uTime*.22)); return pow(1.-abs(n+m*.5),7.); }
      void main(){ float c=caustic(vXZ); float d=length(vXZ-cameraPosition.xz)/160.;
        vec3 col=mix(vec3(.01,.12,.18),vec3(.5,.95,.9),c*.8); col=mix(col,vec3(.01,.12,.17),smoothstep(.15,1.,d)); gl_FragColor=vec4(col*1.3,1.); }`,
  }));
  surface.position.y = 12;
  scene.add(surface);

  /* god rays */
  const shafts = [];
  for (let i = 0; i < 8; i++) {
    const s = lightShaft({ color: 0x57ffe0, height: 80, top: 0.6, bottom: 6 + R() * 5, intensity: 0.07 });
    s.position.set((R() - 0.5) * 50, 12, -4 - R() * 40);
    s.rotation.z = 0.1 + R() * 0.12;
    scene.add(s);
    shafts.push({ s, o: R() * 6 });
  }

  /* seabed */
  const noise = createNoise(5);
  const sg = new THREE.PlaneGeometry(260, 200, 170, 140);
  sg.rotateX(-Math.PI / 2);
  const sp = sg.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i), z = sp.getZ(i);
    sp.setY(i, CONFIG.seabed + noise.fbm(x * 0.05, z * 0.05, 5) * 9 + Math.abs(Math.sin(x * 0.2 + noise.n2(x * 0.1, z * 0.1) * 5)) * 0.25);
  }
  sg.computeVertexNormals();
  sg.translate(0, 0, -40);
  scene.add(new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0x0c3540, roughness: 0.95 })));
  for (let i = 0; i < 34; i++) {
    const h = 3 + R() * 14;
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.8 + R() * 2.2, h, 6 + Math.floor(R() * 3)), new THREE.MeshStandardMaterial({ color: 0x0a2a33, roughness: 0.9, flatShading: true }));
    const x = (R() < 0.5 ? -1 : 1) * (7 + R() * 30);
    m.position.set(x, CONFIG.seabed + h / 2 + noise.fbm(x * 0.05, 0, 5) * 9 - 1, -R() * 60);
    m.rotation.set((R() - 0.5) * 0.3, R() * 3, (R() - 0.5) * 0.3);
    scene.add(m);
  }
  scene.add(new THREE.HemisphereLight(0x3fb8c8, 0x021016, 1.1));
  const deepLight = new THREE.PointLight(CONFIG.accent, 1400, 70, 2);
  deepLight.position.set(0, CONFIG.seabed + 14, -8);
  scene.add(deepLight);

  /* marine snow + plankton glow */
  const mkPoints = (n, spread, size, color, op) => {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) a.set([(R() - 0.5) * spread[0], CONFIG.seabed + R() * spread[1], -R() * spread[2] + 15], i * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ size, map: radialTexture(), color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
  };
  const snow = mkPoints(CONFIG.snow, [70, 90, 70], 0.1, 0xbfeeff, 0.5);
  const plankton = mkPoints(220, [60, 85, 60], 0.45, new THREE.Color(0.3, 2.2, 1.8), 0.9);
  scene.add(snow, plankton);

  /* jellyfish: pulsing shader bell + swaying tentacles */
  const bellGeo = new THREE.SphereGeometry(1, 56, 28, 0, Math.PI * 2, 0, Math.PI * 0.56);
  const L = 18, T = 30;
  const tp = [], tt = [], tk = [];
  for (let k = 0; k < T; k++) {
    const a = R() * 6.283, r = Math.sqrt(R()) * 0.7;
    for (let j = 0; j < L - 1; j++) {
      for (const jj of [j, j + 1]) { tp.push(Math.cos(a) * r, -jj * 0.17, Math.sin(a) * r); tt.push(jj / (L - 1)); tk.push(k); }
    }
  }
  const tentGeo = new THREE.BufferGeometry();
  tentGeo.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3));
  tentGeo.setAttribute('aT', new THREE.Float32BufferAttribute(tt, 1));
  tentGeo.setAttribute('aK', new THREE.Float32BufferAttribute(tk, 1));
  const jellies = CONFIG.jellies.map((color, i) => {
    const U = { uTime: shared.uTime, uPhase: { value: R() * 6.28 }, uColor: { value: new THREE.Color(color) } };
    const common = { uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
    const bell = new THREE.Mesh(bellGeo, new THREE.ShaderMaterial({
      ...common, side: THREE.DoubleSide,
      vertexShader: `uniform float uTime,uPhase; varying vec3 vN; varying vec3 vV; varying float vH;
        void main(){ vec3 p=position; float pu=sin(uTime*1.7+uPhase); p.xz*=1.+.16*pu*(1.-p.y); p.y*=1.-.09*pu; vH=p.y;
          vec4 mv=modelViewMatrix*vec4(p,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uColor; varying vec3 vN; varying vec3 vV; varying float vH;
        void main(){ float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.2); gl_FragColor=vec4(uColor*(f*2.+.12+.25*vH),1.); }`,
    }));
    const tents = new THREE.LineSegments(tentGeo, new THREE.ShaderMaterial({
      ...common,
      vertexShader: `uniform float uTime,uPhase; attribute float aT; attribute float aK; varying float vA;
        void main(){ vec3 p=position; float w=aT*aT; p.x+=sin(uTime*1.4+aT*5.+aK)*w*.35; p.z+=cos(uTime*1.2+aT*4.+aK*1.3)*w*.35;
          p.y+=sin(uTime*1.7+uPhase)*.14*aT; vA=1.-aT*.85; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
      fragmentShader: 'uniform vec3 uColor; varying float vA; void main(){ gl_FragColor=vec4(uColor*vA*.9,1.); }',
    }));
    const g = new THREE.Group();
    g.add(bell, tents);
    const s = 1.2 + R() * 1.6;
    g.scale.setScalar(s);
    const y = -6 - i * 8.5;
    g.position.set((i % 2 ? 1 : -1) * (3.5 + R() * 6), y, -6 - R() * 22);
    g.rotation.set((R() - 0.5) * 0.4, R() * 6, (R() - 0.5) * 0.3);
    scene.add(g);
    return { g, y, o: R() * 6 };
  });

  const rail = createRail(
    [[0, 8, 14], [3, -8, 11], [-3, -26, 9], [2, -44, 10], [0, -57, 12]],
    [[0, 5, -10], [0, -10, -12], [-2, -28, -12], [0, -46, -12], [0, -63, -22]]
  );
  const depth = document.getElementById('depth'), pres = document.getElementById('pres');
  let n = 0;
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    shared.uTime.value = t;
    rail.apply(camera, p);
    camera.position.x += pointer.x * 1.0 + Math.sin(t * 0.3) * 0.3;
    camera.position.y += pointer.y * 0.5 + Math.sin(t * 0.4) * 0.15;
    camera.rotateZ(-pointer.x * 0.03);
    jellies.forEach((j, i) => {
      j.g.position.y = j.y + Math.sin(t * 0.45 + j.o) * 1.1;
      j.g.rotation.y += dt * 0.08;
    });
    shafts.forEach((s) => (s.s.rotation.z = 0.14 + Math.sin(t * 0.15 + s.o) * 0.05));
    snow.position.y = Math.sin(t * 0.12) * 0.8;
    plankton.rotation.y = t * 0.01;
    if (depth && ++n % 5 === 0) {
      const d = Math.max(0, Math.round((12 - camera.position.y) * 60));
      depth.textContent = String(d).padStart(4, '0');
      pres.textContent = (1 + d / 10).toFixed(1);
    }
  });
  stage.start();
});
