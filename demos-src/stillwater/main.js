import { THREE, boot, createStage, createPointer, createScroll, createRail, createNoise, radialTexture, rng, lerp, smoothstep, GLSL_NOISE } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  stones: [1.5, 1.15, 0.85, 0.6, 0.38],   // radii of the floating cairn, bottom → top
  stone: [0xa79d92, 0x8f8780, 0xb9aea1, 0x9a9189, 0xc4b8aa],
  sky: { top: 0x061018, mid: 0x1b3d4a, horizon: 0xffa27a },
  sun: [0, 5.5, -150],
  orbs: 26,
  accent: 0xffb38a,
};

boot(() => {
  const stage = createStage({
    background: 0x061018, fog: { color: 0x1d3b45, density: 0.0085 }, fov: 42, far: 700, exposure: 1.05,
    bloom: { strength: 0.5, radius: 0.9, threshold: 0.78 }, vignette: 0.55,
  });
  const { scene, camera } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(12);
  const noise = createNoise(6);

  /* sky dome: gradient + a low sun */
  const sunDir = new THREE.Vector3(...CONFIG.sun).normalize();
  const skyU = { uTop: { value: new THREE.Color(CONFIG.sky.top) }, uMid: { value: new THREE.Color(CONFIG.sky.mid) }, uHor: { value: new THREE.Color(CONFIG.sky.horizon) }, uSun: { value: sunDir } };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 48, 32),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
      vertexShader: 'varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `uniform vec3 uTop,uMid,uHor,uSun; varying vec3 vD;
        void main(){ float h=max(vD.y,0.); vec3 c=mix(uHor,uMid,smoothstep(0.,.18,h)); c=mix(c,uTop,smoothstep(.12,.7,h));
          float s=max(dot(vD,uSun),0.); c+=vec3(1.,.62,.38)*pow(s,40.)*.9+vec3(1.,.9,.7)*pow(s,900.)*4.; c+=uHor*pow(1.-h,6.)*.25;
          gl_FragColor=vec4(c,1.); }`,
    })
  );
  scene.add(sky);

  /* water: concentric ripples around the cairn + a sun glitter path, all in one shader */
  const wu = { uTime: { value: 0 }, uSun: { value: sunDir }, uHor: skyU.uHor, uMid: skyU.uMid, uPulse: { value: 0 } };
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(900, 900, 1, 1),
    new THREE.ShaderMaterial({
      uniforms: wu, fog: false,
      vertexShader: 'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader: `${GLSL_NOISE} uniform float uTime,uPulse; uniform vec3 uSun,uHor,uMid; varying vec3 vW;
        float H(vec2 p){ float d=length(p); float r=sin(d*2.4-uTime*1.1)*exp(-d*.11)*.5+sin(d*5.-uTime*1.7)*exp(-d*.2)*.18;
          return r*(.7+uPulse*.6)+snoise(vec3(p*.35,uTime*.12))*.12+snoise(vec3(p*1.1,uTime*.25))*.04; }
        void main(){
          vec2 p=vW.xz; float e=.06; float h=H(p);
          vec3 N=normalize(vec3(-(H(p+vec2(e,0.))-h)/e*.06,1.,-(H(p+vec2(0.,e))-h)/e*.06));
          vec3 V=normalize(cameraPosition-vW); vec3 Rf=reflect(-V,N);
          float f=pow(1.-max(dot(V,N),0.),3.);
          float hh=max(Rf.y,0.);
          vec3 sky=mix(uHor,uMid,smoothstep(0.,.25,hh)); sky=mix(sky,vec3(.02,.06,.09),smoothstep(.2,.8,hh));
          vec3 deep=vec3(.015,.07,.09);
          vec3 col=mix(deep,sky,.18+f*.82);
          float g=pow(max(dot(Rf,normalize(uSun)),0.),160.);
          col+=vec3(1.,.72,.5)*g*3.+vec3(1.,.5,.3)*pow(max(dot(Rf,normalize(uSun)),0.),18.)*.35;
          float fade=smoothstep(380.,60.,length(vW.xz-cameraPosition.xz)); col=mix(uHor*.55,col,fade*.6+.4);
          gl_FragColor=vec4(col,1.);
        }`,
    })
  );
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  scene.add(new THREE.HemisphereLight(0xffc7a0, 0x0d2a33, 1.0));
  const key = new THREE.DirectionalLight(0xffb98a, 2.6);
  key.position.set(0, 6, -40);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x6fa8c0, 0.8);
  fill.position.set(8, 10, 12);
  scene.add(fill);

  /* the floating cairn: noise-displaced river stones with gaps between them */
  const cairn = new THREE.Group();
  scene.add(cairn);
  const stones = [];
  let y = 0.55;
  CONFIG.stones.forEach((r, i) => {
    const geo = new THREE.IcosahedronGeometry(r, 5);
    const pos = geo.attributes.position, v = new THREE.Vector3();
    for (let k = 0; k < pos.count; k++) {
      v.fromBufferAttribute(pos, k);
      const d = 1 + (noise.fbm(v.x * 0.9 + i * 7, v.z * 0.9 + v.y * 0.6, 3) - 0.5) * 0.28;
      v.multiplyScalar(d);
      pos.setXYZ(k, v.x, v.y * 0.52, v.z);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: CONFIG.stone[i % CONFIG.stone.length], roughness: 0.85, metalness: 0.02 }));
    y += r * 0.52 + 0.1;
    m.position.set((R() - 0.5) * 0.12, y, (R() - 0.5) * 0.12);
    m.rotation.y = R() * 6;
    y += r * 0.52 + 0.1;
    cairn.add(m);
    stones.push({ m, y: m.position.y, ph: R() * 6.28, i });
  });
  const topY = y;

  /* expanding light rings at the water line */
  const ringMat = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(CONFIG.accent).multiplyScalar(1.6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const rings = [0, 1, 2].map((i) => {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.98, 1, 128), ringMat());
    r.rotation.x = -Math.PI / 2;
    r.position.y = 0.04;
    scene.add(r);
    return { r, off: i / 3 };
  });
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(255,170,120,0.9)', 'rgba(255,120,60,0)', 256), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.4, fog: false }));
  sunGlow.scale.set(260, 160, 1);
  sunGlow.position.copy(sunDir).multiplyScalar(420);
  scene.add(sunGlow);

  /* lantern orbs hovering over the water */
  const orbTex = radialTexture('rgba(255,225,190,1)', 'rgba(255,150,90,0)', 128);
  const orbs = [];
  for (let i = 0; i < CONFIG.orbs; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 + R() * 0.4 }));
    const a = R() * 6.28, rad = 5 + R() * 30;
    s.position.set(Math.cos(a) * rad, 0.5 + R() * 6, Math.sin(a) * rad - 4);
    s.scale.setScalar(0.5 + R() * 1.1);
    scene.add(s);
    orbs.push({ s, a, rad, y: s.position.y, sp: 0.03 + R() * 0.05, ph: R() * 6.28 });
  }

  const rail = createRail(
    [[0, 8, 22], [8, 3.6, 13], [-8, 2.4, 11], [0, 1.1, 14], [0, 11, 3.5]],
    [[0, 2.6, 0], [0, 2.8, 0], [0, 3.0, 0], [0, 3.6, 0], [0, 0.6, 0]]
  );
  const sides = [-3.2, 3.2, 0, 3.2, 0];
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    rail.apply(camera, p);
    camera.position.x += pointer.x * 1.2;
    camera.position.y += pointer.y * 0.5;
    const k = Math.min(3.999, p * 4), i0 = Math.floor(k), f = k - i0;
    camera.lookAt(0, lerp(2.6, 3.6, smoothstep(0.5, 0.8, p)) * (1 - smoothstep(0.85, 1, p)) + 0.4 * smoothstep(0.85, 1, p), 0);
    camera.translateX(lerp(sides[i0], sides[i0 + 1], f * f * (3 - 2 * f)));

    wu.uTime.value = t;
    wu.uPulse.value = smoothstep(0.7, 1, p);
    stones.forEach((s) => {
      const sway = Math.sin(t * 0.6 + s.ph);
      s.m.position.y = s.y + 0.08 + sway * 0.06 * (1 + s.i * 0.25);
      s.m.rotation.y += dt * 0.05 * (s.i % 2 ? 1 : -1);
    });
    cairn.position.y = Math.sin(t * 0.5) * 0.05;
    rings.forEach(({ r, off }) => {
      const c = (t * 0.16 + off) % 1;
      r.scale.setScalar(1 + c * 26);
      r.material.opacity = (1 - c) * (1 - c) * 0.55;
    });
    orbs.forEach((o) => {
      const a = o.a + t * o.sp;
      o.s.position.set(Math.cos(a) * o.rad, o.y + Math.sin(t * 0.6 + o.ph) * 0.4, Math.sin(a) * o.rad - 4);
    });
    void topY;
  });
  stage.start();
});
