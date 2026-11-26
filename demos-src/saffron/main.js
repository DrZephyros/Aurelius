import { THREE, boot, createStage, createPointer, createScroll, createRail, createEnv, radialTexture, rng, lerp, smoothstep } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  length: 60,          // table length (z units)
  lamps: 7,            // pendant lamps over the table
  seats: 19,           // place settings per side
  warm: 0xffa24d,      // lamp / candle colour
  bokeh: 70,
};
const END = 6 - CONFIG.length; // z of the far end of the table

boot(() => {
  const stage = createStage({
    background: 0x0a0605, fog: { color: 0x120a06, density: 0.04 }, fov: 42, far: 200, exposure: 1.0,
    bloom: { strength: 0.42, radius: 0.7, threshold: 0.85 }, vignette: 0.7,
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(31);

  scene.environment = createEnv(renderer, [
    { pos: [0, 8, 0], w: 12, h: 12, intensity: 1.6, color: CONFIG.warm },
    { pos: [-8, 3, -6], w: 6, h: 6, intensity: 0.8, color: 0xffd9a8 },
  ], 0x1a0d07);
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight(0x5a3a22, 0x120a06, 0.8));

  /* floor, table and back wall */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 200), new THREE.MeshStandardMaterial({ color: 0x1c110b, roughness: 0.35, metalness: 0.2 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -50;
  scene.add(floor);
  const wood = new THREE.MeshStandardMaterial({ color: 0x3a2314, roughness: 0.5, metalness: 0.05 });
  const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, CONFIG.length), wood);
  table.position.set(0, 0.9, END + CONFIG.length / 2);
  scene.add(table);
  for (let i = 0; i < 6; i++) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 0.18), wood);
    leg.position.set(i % 2 ? 1.4 : -1.4, 0.45, END + 1 + Math.floor(i / 2) * (CONFIG.length / 2 - 1));
    scene.add(leg);
  }
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshStandardMaterial({ color: 0x1a0f09, roughness: 1 }));
  wall.position.set(0, 8, END - 8);
  scene.add(wall);

  /* pendant lamps with real point lights */
  const bulbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 2.3, 0.9) });
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.4, metalness: 0.7, side: THREE.DoubleSide });
  const shadeGeo = new THREE.SphereGeometry(0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  for (let i = 0; i < CONFIG.lamps; i++) {
    const z = 3 - i * ((CONFIG.length - 8) / (CONFIG.lamps - 1));
    const g = new THREE.Group();
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), bulbMat);
    bulb.position.y = 0.12;
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 6, 6), shadeMat);
    cord.position.y = 3;
    g.add(shade, bulb, cord);
    if (i % 2 === 0) { // every other lamp carries a real light (cheap + looks the same)
      const light = new THREE.PointLight(CONFIG.warm, 16, 24, 1.6);
      light.position.y = -0.05;
      g.add(light);
    }
    g.position.set(0, 3.1, z);
    scene.add(g);
  }

  /* place settings: plates, glasses, candles */
  const plateGeo = new THREE.CylinderGeometry(0.42, 0.34, 0.04, 40);
  const plates = new THREE.InstancedMesh(plateGeo, new THREE.MeshPhysicalMaterial({ color: 0xb9b0a0, roughness: 0.3, clearcoat: 1 }), CONFIG.seats * 2);
  const glassGeo = new THREE.LatheGeometry([[0, 0], [0.11, 0], [0.11, 0.015], [0.015, 0.04], [0.015, 0.32], [0.15, 0.42], [0.19, 0.62], [0.15, 0.78], [0.14, 0.78], [0.18, 0.62], [0.14, 0.44], [0, 0.36]].map(([x, y]) => new THREE.Vector2(x, y)), 28);
  const glasses = new THREE.InstancedMesh(glassGeo, new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.28, clearcoat: 1, side: THREE.DoubleSide, envMapIntensity: 2 }), CONFIG.seats * 2);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1);
  for (let k = 0; k < CONFIG.seats; k++) {
    const z = 2.4 - k * ((CONFIG.length - 6) / (CONFIG.seats - 1));
    [-1, 1].forEach((s, j) => {
      plates.setMatrixAt(k * 2 + j, m4.compose(v.set(s * 0.95, 0.98, z), q.identity(), sc));
      glasses.setMatrixAt(k * 2 + j, m4.compose(v.set(s * 1.3, 0.96, z - 0.45), q.identity(), sc));
    });
  }
  scene.add(plates, glasses);

  const flameTex = radialTexture('rgba(255,210,120,1)', 'rgba(255,120,20,0)', 128);
  const flames = [];
  for (let i = 0; i < 10; i++) {
    const z = 0.8 - i * ((CONFIG.length - 4) / 9);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.34, 12), new THREE.MeshStandardMaterial({ color: 0xf3e6c8, roughness: 0.7 }));
    c.position.set(0, 1.12, z);
    const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: 0xffb35c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    f.position.set(0, 1.4, z);
    scene.add(c, f);
    flames.push(f);
  }

  /* the hero dish at the end of the table */
  const dish = new THREE.Group();
  dish.position.set(0, 0.96, END + 2.4);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.9, 0.08, 56), new THREE.MeshPhysicalMaterial({ color: 0xf4eee3, roughness: 0.2, clearcoat: 1 }));
  const sauce = new THREE.Mesh(new THREE.CircleGeometry(0.72, 48), new THREE.MeshStandardMaterial({ color: 0xd9901f, roughness: 0.25, metalness: 0.1 }));
  sauce.rotation.x = -Math.PI / 2; sauce.position.y = 0.045;
  const fish = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 20), new THREE.MeshStandardMaterial({ color: 0xb8683a, roughness: 0.6 }));
  fish.scale.set(1.15, 0.45, 0.62); fish.position.set(0, 0.25, 0.05); fish.rotation.y = 0.5;
  dish.add(plate, sauce, fish);
  for (let i = 0; i < 16; i++) {
    const a = R() * 6.28, r = 0.15 + R() * 0.8;
    const bit = new THREE.Mesh(new THREE.SphereGeometry(0.05 + R() * 0.06, 12, 10), new THREE.MeshStandardMaterial({ color: [0x6a9a35, 0xc0301c, 0xf1d27a][i % 3], roughness: 0.5 }));
    bit.position.set(Math.cos(a) * r, 0.1 + (r < 0.5 ? 0.3 : 0), Math.sin(a) * r);
    dish.add(bit);
  }
  scene.add(dish);
  const dishLight = new THREE.PointLight(CONFIG.warm, 40, 14, 1.6);
  dishLight.position.set(0, 3.2, END + 3.2);
  scene.add(dishLight);

  /* steam */
  const SN = 70, sp = new Float32Array(SN * 3), sph = new Float32Array(SN);
  for (let i = 0; i < SN; i++) { sp.set([(R() - 0.5) * 0.6, 0.4, (R() - 0.5) * 0.6], i * 3); sph[i] = R(); }
  const stg = new THREE.BufferGeometry();
  stg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  stg.setAttribute('aPh', new THREE.BufferAttribute(sph, 1));
  const su = { uTime: { value: 0 }, uPix: { value: stage.dpr } };
  const steam = new THREE.Points(stg, new THREE.ShaderMaterial({
    uniforms: su, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aPh; uniform float uTime,uPix; varying float vT;
      void main(){ float t=fract(uTime*.12+aPh); vT=t; vec3 p=position+vec3(sin(aPh*40.+uTime*.8)*.25*t,t*1.8,cos(aPh*30.+uTime*.7)*.25*t);
        vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=(30.+t*110.)*uPix*(8./-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: 'varying float vT; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d)*(1.-vT)*smoothstep(0.,.15,vT)*.2; gl_FragColor=vec4(vec3(1.,.9,.75)*a,a); }',
  }));
  steam.position.copy(dish.position);
  steam.frustumCulled = false;
  scene.add(steam);

  /* bokeh in the background */
  const bokTex = radialTexture('rgba(255,200,120,1)', 'rgba(255,140,40,0)', 128);
  for (let i = 0; i < CONFIG.bokeh; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bokTex, color: R() < 0.7 ? 0xffa24d : 0xff6a3a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.06 + R() * 0.16, fog: false }));
    const z = END - 6 - R() * 10;
    s.position.set((R() - 0.5) * 36, 0.5 + R() * 10, z);
    s.scale.setScalar(0.8 + R() * 3);
    scene.add(s);
  }

  const rail = createRail(
    [[0, 2.9, 10], [0.4, 2.6, -9], [-0.4, 2.5, -27], [0, 2.6, -42], [0.2, 4.0, END + 6.4]],
    [[0, 1.0, -12], [0, 0.9, -26], [0, 0.9, -40], [0, 1.0, END + 2.4], [0, 0.98, END + 2.4]]
  );
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    rail.apply(camera, p);
    camera.position.x += pointer.x * 0.35;
    camera.position.y += pointer.y * 0.18;
    flames.forEach((f, i) => {
      const k = 0.9 + Math.sin(t * 9 + i * 3) * 0.08 + Math.sin(t * 17 + i) * 0.05;
      f.scale.set(0.2 * k, 0.3 * k, 1);
    });
    su.uTime.value = t;
    dish.rotation.y = t * 0.25;
    dishLight.intensity = 22 + smoothstep(0.7, 1, p) * 16 + Math.sin(t * 6) * 2;
  });
  stage.start();
});
