import { THREE, boot, createStage, createPointer, createScroll, createRail, createNoise, radialTexture, rng, smoothstep, GLSL_NOISE } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  horizon: [0.72, 0.34, 0.17], // linear RGB: fog + horizon share this colour
  sunDir: [-0.32, 0.1, -1],
  windAngle: 0.35,
  stones: 34,
  sand: 1400,
};

boot(() => {
  const stage = createStage({
    background: 0x140905, fog: { color: 0xffffff, density: 0.0062 }, fov: 50, far: 1500,
    bloom: { strength: 0.45, radius: 0.8, threshold: 0.7 }, exposure: 1.0, vignette: 0.65,
  });
  const { scene, camera } = stage;
  scene.fog.color.setRGB(...CONFIG.horizon);
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(21);
  const sunDir = new THREE.Vector3(...CONFIG.sunDir).normalize();

  /* sky dome with a hot low sun */
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uSun: { value: sunDir }, uHor: { value: new THREE.Vector3(...CONFIG.horizon) } },
    vertexShader: 'varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform vec3 uSun,uHor; varying vec3 vD; void main(){
      float h=vD.y; vec3 top=vec3(.012,.02,.09), mid=vec3(.2,.07,.12);
      vec3 c=mix(uHor,mid,smoothstep(0.,.22,h)); c=mix(c,top,smoothstep(.12,.75,h));
      float s=max(dot(vD,uSun),0.);
      c+=vec3(1.,.55,.25)*pow(s,6.)*.38+vec3(1.,.8,.55)*pow(s,90.)*.8+vec3(1.,.95,.85)*pow(s,1800.)*14.;
      gl_FragColor=vec4(c,1.); }`,
  }));
  scene.add(sky);

  /* dunes: asymmetric wind ridges + low-frequency swells, with a calm channel for the camera */
  const noise = createNoise(3);
  const geo = new THREE.PlaneGeometry(520, 520, 340, 340);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -110);
  const pos = geo.attributes.position;
  const ca = Math.cos(CONFIG.windAngle), sa = Math.sin(CONFIG.windAngle);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const d = x * ca + z * sa;
    const warp = noise.fbm(x * 0.012, z * 0.012, 3) * 2 - 1;
    const ph = (((d * 0.026 + warp * 1.3) % 1) + 1) % 1;
    const ridge = Math.pow(smoothstep(0, 0.78, ph) * (1 - smoothstep(0.78, 1, ph)), 1.1);
    const big = noise.fbm(x * 0.009 + 5, z * 0.009, 4);
    let h = ridge * (3 + big * 8) + big * 7;
    h += Math.sin(d * 2.4 + warp * 9) * 0.045 + (noise.n2(x * 0.6, z * 0.6) - 0.5) * 0.1;
    h *= 0.38 + 0.62 * smoothstep(6, 55, Math.abs(x));
    pos.setY(i, h - 3.2);
  }
  geo.computeVertexNormals();
  scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xc27a45, roughness: 1, metalness: 0 })));

  scene.add(new THREE.HemisphereLight(0xff9a5a, 0x2a1208, 0.5));
  const sunLight = new THREE.DirectionalLight(0xffa968, 3.4);
  sunLight.position.copy(sunDir).multiplyScalar(100);
  scene.add(sunLight);

  /* the gate */
  const gate = new THREE.Group();
  gate.position.set(0, 11, -92);
  scene.add(gate);
  const stone = new THREE.MeshStandardMaterial({ color: 0x1a1412, roughness: 0.75, metalness: 0.35, flatShading: true });
  const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(9, 1.2, 14, 7), stone); // 7-sided = carved monument
  ringMesh.rotation.z = 0.2;
  gate.add(ringMesh);
  const inner = new THREE.Mesh(new THREE.TorusGeometry(7.5, 0.06, 8, 160), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.1, 0.35) }));
  gate.add(inner);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(7.5, 96), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `${GLSL_NOISE} uniform float uTime; varying vec2 vUv; void main(){
      vec2 p=vUv-.5; float r=length(p)*2.; float a=atan(p.y,p.x)+uTime*.25+r*2.;
      float n=fbm(vec3(cos(a)*r*1.6,sin(a)*r*1.6,uTime*.25+r*2.))*.5+.5;
      float e=smoothstep(1.,.15,r); float al=e*(.3+.7*n);
      vec3 c=mix(vec3(1.,.2,.04),vec3(1.,.8,.4),n); gl_FragColor=vec4(c*al*1.7,al); }`,
  }));
  gate.add(disc);
  const runes = new THREE.Group();
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9 + (i % 3) * 0.4, 0.28), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 0.9, 0.3) }));
    m.position.set(Math.cos(a) * 12.2, Math.sin(a) * 12.2, 0);
    m.rotation.z = a;
    runes.add(m);
  }
  gate.add(runes);

  /* floating stones */
  const stones = [];
  for (let i = 0; i < CONFIG.stones; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4 + R() * 1.4, 0), stone);
    const a = R() * 6.283, r = 13 + R() * 26;
    m.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.7, (R() - 0.5) * 16);
    m.rotation.set(R() * 3, R() * 3, R() * 3);
    gate.add(m);
    stones.push({ m, s: 0.2 + R() * 0.5, o: R() * 6 });
  }
  const gateLight = new THREE.PointLight(0xff8a3d, 1800, 60, 2);
  gateLight.position.set(0, 0, 4);
  gate.add(gateLight);

  /* wind-blown sand */
  const sp = new Float32Array(CONFIG.sand * 3);
  for (let i = 0; i < CONFIG.sand; i++) sp.set([(R() - 0.5) * 90, R() * 26 - 4, (R() - 0.5) * 90], i * 3);
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const sandMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 } },
    vertexShader: `uniform float uTime; void main(){ vec3 p=position; p.x=mod(p.x+uTime*9.+45.,90.)-45.; p.y+=sin(uTime*.8+p.z)*.6;
      vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=min(26./-mv.z*3.,5.); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: 'void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(vec3(1.,.7,.4)*smoothstep(.5,.1,d)*.55,1.); }',
  });
  const sand = new THREE.Points(sg, sandMat);
  sand.frustumCulled = false;
  scene.add(sand);

  const rail = createRail(
    [[-12, 7, 46], [-8, 6, 10], [10, 9, -35], [0, 10, -72], [0, 10, -125]],
    [[0, 10, -90], [0, 10, -90], [0, 10.5, -90], [0, 11, -100], [0, 11, -190]]
  );

  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    rail.apply(camera, p);
    camera.position.x += pointer.x * 0.8;
    camera.position.y += pointer.y * 0.4;
    camera.rotateZ(-pointer.x * 0.02);
    sky.position.copy(camera.position);
    sand.position.set(camera.position.x, camera.position.y - 6, camera.position.z - 20);
    sandMat.uniforms.uTime.value = t;
    disc.material.uniforms.uTime.value = t;
    runes.rotation.z = t * 0.06;
    inner.material.color.setRGB(3, 1.1, 0.35).multiplyScalar(0.85 + Math.sin(t * 1.5) * 0.15);
    stones.forEach((s) => { s.m.rotation.x += dt * s.s; s.m.rotation.y += dt * s.s * 0.7; s.m.position.y += Math.sin(t * s.s + s.o) * dt * 0.6; });
  });
  stage.start();
});
