import { THREE, boot, createStage, createPointer, createScroll, createNoise, lightShaft, radialTexture, rng, lerp, smoothstep, GLSL_NOISE } from '@core';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  trees: 950,
  fireflies: 560,
  moon: [-44, 52, -300],
  cabinZ: -118,
};
const pathX = (z) => Math.sin(z * 0.035) * 5 + Math.sin(z * 0.011) * 8; // the trail

boot(() => {
  const stage = createStage({
    background: 0x070e16, fog: { color: 0x0b1b26, density: 0.034 }, fov: 55, far: 600,
    bloom: { strength: 0.85, radius: 0.9, threshold: 0.28 }, exposure: 1.15, vignette: 0.7,
  });
  const { scene, camera } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(8);
  const noise = createNoise(4);

  /* ground with a pale trail */
  const gg = new THREE.PlaneGeometry(320, 320, 140, 140);
  gg.rotateX(-Math.PI / 2);
  gg.translate(0, 0, -100);
  const gp = gg.attributes.position;
  const gc = new Float32Array(gp.count * 3);
  const moss = new THREE.Color(0x14281f), dirt = new THREE.Color(0x4a3d30), tmp = new THREE.Color();
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i), d = Math.abs(x - pathX(z));
    const trail = 1 - smoothstep(1.1, 2.8, d);
    gp.setY(i, (noise.fbm(x * 0.06, z * 0.06, 4) - 0.5) * 2.4 * smoothstep(1, 6, d));
    tmp.copy(moss).lerp(dirt, trail).multiplyScalar(0.8 + noise.n2(x * 0.8, z * 0.8) * 0.5);
    gc.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  gg.setAttribute('color', new THREE.BufferAttribute(gc, 3));
  gg.computeVertexNormals();
  scene.add(new THREE.Mesh(gg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })));

  /* pines (one merged geometry, instanced) */
  const part = (geo, y, color) => {
    geo.translate(0, y, 0);
    const c = new THREE.Color(color), n = geo.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(a, 3));
    return geo;
  };
  const treeGeo = mergeGeometries([
    part(new THREE.CylinderGeometry(0.14, 0.24, 2.2, 6), 1.1, 0x2a1d14),
    part(new THREE.ConeGeometry(1.5, 3.2, 7), 2.8, 0x1a4a40),
    part(new THREE.ConeGeometry(1.2, 2.8, 7), 4.3, 0x1d5a4b),
    part(new THREE.ConeGeometry(0.85, 2.4, 7), 5.7, 0x24705c),
  ]);
  const trees = new THREE.InstancedMesh(treeGeo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 }), CONFIG.trees);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < CONFIG.trees; i++) {
    const z = 34 - R() * 240;
    const x = pathX(z) + (R() < 0.5 ? -1 : 1) * (3.4 + Math.pow(R(), 1.6) * 70);
    const s = 0.8 + R() * 1.7;
    q.setFromAxisAngle(up, R() * 6.28);
    m4.compose(v.set(x, 0, z), q, sc.set(s * (0.85 + R() * 0.3), s, s * (0.85 + R() * 0.3)));
    trees.setMatrixAt(i, m4);
    trees.setColorAt(i, new THREE.Color().setScalar(0.7 + R() * 0.6));
  }
  trees.frustumCulled = false;
  scene.add(trees);

  /* moon + stars */
  const moonV = new THREE.Vector3(...CONFIG.moon);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(8, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.3, 2.6), fog: false }));
  moon.position.copy(moonV);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture(), color: 0x8fb4ff, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55, fog: false }));
  halo.scale.set(110, 110, 1);
  halo.position.copy(moonV).add(new THREE.Vector3(0, 0, 1));
  scene.add(moon, halo);
  const st = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) {
    const d = new THREE.Vector3(R() - 0.5, R() * 0.6 + 0.05, R() - 0.5).normalize().multiplyScalar(480);
    st.set([d.x, d.y, d.z - 40], i * 3);
  }
  const stg = new THREE.BufferGeometry();
  stg.setAttribute('position', new THREE.BufferAttribute(st, 3));
  scene.add(new THREE.Points(stg, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, color: 0xcfe0ff, fog: false, transparent: true, opacity: 0.8, map: radialTexture(), depthWrite: false })));

  /* lights */
  scene.add(new THREE.HemisphereLight(0x3d7090, 0x0a1414, 2.2));
  const moonLight = new THREE.DirectionalLight(0x9fc0ff, 3.2);
  moonLight.position.copy(moonV);
  scene.add(moonLight);

  /* god rays between the trunks */
  const shafts = [];
  for (let i = 0; i < 7; i++) {
    const s = lightShaft({ color: 0x7fa6ff, height: 40, top: 0.3, bottom: 2.5 + R() * 2, intensity: 0.01 });
    const z = 10 - i * 26;
    s.position.set(pathX(z) + (R() - 0.5) * 16, 38, z);
    s.rotation.set(0, 0, -0.35);
    scene.add(s);
    shafts.push(s);
  }

  /* ground mist */
  const mistMats = [0.5, 1.6].map((y, i) => {
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uY: { value: i } },
      vertexShader: 'varying vec2 vXZ; void main(){ vec4 w=modelMatrix*vec4(position,1.); vXZ=w.xz; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader: `${GLSL_NOISE} uniform float uTime,uY; varying vec2 vXZ;
        void main(){ float n=fbm(vec3(vXZ*.045+vec2(uTime*.02,0.),uY*3.+uTime*.01))*.5+.5; float d=length(vXZ-cameraPosition.xz);
          float a=n*smoothstep(1.5,10.,d)*smoothstep(95.,30.,d)*.16; gl_FragColor=vec4(vec3(.36,.52,.62)*a*1.2,a); }`,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(260, 260).rotateX(-Math.PI / 2), m);
    mesh.position.y = y;
    mesh.frustumCulled = false;
    scene.add(mesh);
    return m;
  });

  /* fireflies */
  const N = CONFIG.fireflies, fp = new Float32Array(N * 3), fph = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const z = 28 - R() * 190;
    fp.set([pathX(z) + (R() - 0.5) * 34, 0.4 + R() * 5.5, z], i * 3);
    fph.set([R(), R(), R()], i * 3);
  }
  const fg = new THREE.BufferGeometry();
  fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  fg.setAttribute('aPh', new THREE.BufferAttribute(fph, 3));
  const fu = { uTime: { value: 0 }, uPix: { value: stage.dpr } };
  scene.add(new THREE.Points(fg, new THREE.ShaderMaterial({
    uniforms: fu, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec3 aPh; uniform float uTime,uPix; varying float vB;
      void main(){ vec3 p=position+vec3(sin(uTime*.5+aPh.x*6.)*1.3,sin(uTime*.7+aPh.y*6.)*.6,cos(uTime*.4+aPh.z*6.)*1.3);
        vB=pow(.5+.5*sin(uTime*1.4+aPh.x*40.),3.); vec4 mv=modelViewMatrix*vec4(p,1.);
        gl_PointSize=(10.+vB*16.)*uPix*(18./-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: 'varying float vB; void main(){ float d=length(gl_PointCoord-.5); float a=pow(smoothstep(.5,0.,d),2.); gl_FragColor=vec4(vec3(.8,1.,.3)*a*(.25+vB*2.),a); }',
  })));

  /* cabin with a warm window */
  const cabin = new THREE.Group();
  cabin.position.set(pathX(CONFIG.cabinZ) + 7.5, 0, CONFIG.cabinZ);
  cabin.rotation.y = -0.9;
  const wood = new THREE.MeshStandardMaterial({ color: 0x2b1d14, roughness: 0.95 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 3.6), wood); body.position.y = 1.2;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.7, 4), new THREE.MeshStandardMaterial({ color: 0x0f1a18, roughness: 1 }));
  roof.position.y = 3.2; roof.rotation.y = Math.PI / 4; roof.scale.z = 0.9;
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.9), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.7, 0.6) }));
  win.position.set(0.6, 1.5, 1.81);
  const lamp = new THREE.PointLight(0xffa24d, 90, 22, 1.8);
  lamp.position.set(0.6, 1.5, 3);
  cabin.add(body, roof, win, lamp);
  scene.add(cabin);

  const lookV = new THREE.Vector3();
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    const z = lerp(28, -150, p), ahead = z - 14, lift = smoothstep(0.8, 1, p);
    camera.position.set(pathX(z) + pointer.x * 0.5, 1.75 + Math.sin(p * 160) * 0.035 + lift * 9, z);
    lookV.set(pathX(ahead) + pointer.x * 2, 2.3 + pointer.y * 1 + lift * 22, ahead - lift * 30);
    camera.lookAt(lookV);
    fu.uTime.value = t;
    mistMats.forEach((m) => (m.uniforms.uTime.value = t));
    lamp.intensity = 90 + Math.sin(t * 7) * 6 + Math.sin(t * 13) * 4;
    shafts.forEach((s, i) => (s.rotation.z = -0.35 + Math.sin(t * 0.2 + i) * 0.04));
  });
  stage.start();
});
