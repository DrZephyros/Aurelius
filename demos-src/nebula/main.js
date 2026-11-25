import { THREE, boot, createStage, createPointer, createScroll, createRail, radialTexture, rng, GLSL_NOISE } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  stars: 70000,
  radius: 32,
  arms: 3,
  inner: 0xffa56b,
  outer: 0x6a5cff,
  planet: [60, 3, -70],
  sun: [-140, 34, 90],
};

boot(() => {
  const stage = createStage({
    background: 0x02020a, fov: 50, far: 1500,
    bloom: { strength: 0.45, radius: 0.7, threshold: 0.55 }, exposure: 0.95, aberration: 0.04,
  });
  const { scene, camera } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(9);

  /* spiral galaxy (GPU points, differential rotation in the shader) */
  const N = CONFIG.stars;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N);
  const ci = new THREE.Color(CONFIG.inner), co = new THREE.Color(CONFIG.outer), c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const r = Math.pow(R(), 1.7) * CONFIG.radius;
    const a = ((i % CONFIG.arms) / CONFIG.arms) * Math.PI * 2 + r * 0.32;
    const rnd = () => Math.pow(R(), 3) * (R() < 0.5 ? 1 : -1) * 0.32 * (r + 1.5);
    pos.set([Math.cos(a) * r + rnd(), rnd() * 0.3, Math.sin(a) * r + rnd()], i * 3);
    c.copy(ci).lerp(co, Math.min(1, r / CONFIG.radius)).offsetHSL((R() - 0.5) * 0.05, 0, (R() - 0.5) * 0.15);
    col.set([c.r, c.g, c.b], i * 3);
    size[i] = 0.5 + R() * 1.8 + (r < 3 ? 1 : 0);
  }
  const gg = new THREE.BufferGeometry();
  gg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  gg.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  gg.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const gu = { uTime: { value: 0 }, uPix: { value: stage.dpr } };
  const galaxy = new THREE.Points(gg, new THREE.ShaderMaterial({
    uniforms: gu, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aSize; attribute vec3 aColor; uniform float uTime,uPix; varying vec3 vC;
      void main(){ vec3 p=position; float r=length(p.xz); float a=atan(p.z,p.x)+uTime*.07/(1.+r*.12);
        p.x=cos(a)*r; p.z=sin(a)*r; vec4 mv=modelViewMatrix*vec4(p,1.);
        gl_PointSize=aSize*uPix*(150./-mv.z); gl_Position=projectionMatrix*mv; vC=aColor; }`,
    fragmentShader: `varying vec3 vC; void main(){ float d=length(gl_PointCoord-.5); float a=pow(smoothstep(.5,0.,d),2.2); gl_FragColor=vec4(vC*a*.42,a); }`,
  }));
  galaxy.rotation.set(0.25, 0, 0.12);
  scene.add(galaxy);

  /* galactic core glow */
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(255,190,130,1)', 'rgba(255,120,60,0)', 256), blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.22 }));
  core.scale.set(20, 20, 1);
  scene.add(core);

  /* nebula clouds (fbm planes) */
  const cloudMats = [];
  [[0xff6aa8, 0, 0.9, 80, 0], [0x6a5cff, 2, 1.1, 90, 4], [0xffa56b, -2, 0.7, 70, 8]].forEach(([color, y, inten, s, seed]) => {
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uI: { value: inten }, uSeed: { value: seed } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `${GLSL_NOISE} uniform float uTime,uI,uSeed; uniform vec3 uColor; varying vec2 vUv;
        void main(){ float n=fbm(vec3(vUv*3.2+uSeed,uTime*.03)); n=smoothstep(-.05,.75,n);
          float m=smoothstep(.5,.05,length(vUv-.5)); gl_FragColor=vec4(uColor*n*m*uI*.16,1.); }`,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(s, s), m);
    mesh.rotation.x = -Math.PI / 2 + 0.25; mesh.position.y = y;
    scene.add(mesh);
    cloudMats.push(m);
  });

  /* far starfield */
  const sp = new Float32Array(5000 * 3);
  for (let i = 0; i < 5000; i++) {
    const v = new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(500 + R() * 400);
    sp.set([v.x, v.y, v.z], i * 3);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, color: 0xbfc8ff, transparent: true, opacity: 0.8, map: radialTexture(), depthWrite: false })));

  /* sun flare */
  const sunV = new THREE.Vector3(...CONFIG.sun);
  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(255,235,210,1)', 'rgba(255,170,100,0)', 256), blending: THREE.AdditiveBlending, depthWrite: false }));
  flare.scale.set(60, 60, 1); flare.position.copy(sunV);
  scene.add(flare);

  /* planet (procedural), atmosphere, rings */
  const planetPos = new THREE.Vector3(...CONFIG.planet);
  const sunDir = sunV.clone().sub(planetPos).normalize();
  const planet = new THREE.Group();
  planet.position.copy(planetPos);
  planet.rotation.z = 0.35;
  scene.add(planet);
  const surfaceMat = new THREE.ShaderMaterial({
    uniforms: { uSun: { value: sunDir } },
    vertexShader: `varying vec3 vP; varying vec3 vN; varying vec3 vW;
      void main(){ vP=position; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `${GLSL_NOISE} uniform vec3 uSun; varying vec3 vP; varying vec3 vN; varying vec3 vW;
      void main(){
        vec3 d=normalize(vP);
        float n=fbm(d*2.4+3.), n2=fbm(d*7.), bands=sin(d.y*10.+n*3.)*.5+.5;
        vec3 land=mix(vec3(.08,.07,.16),vec3(.95,.55,.32),smoothstep(-.2,.4,n));
        land=mix(land,vec3(.98,.82,.62),bands*.35*smoothstep(-.1,.5,n));
        land*=.75+.5*n2;
        land=mix(land,vec3(.9,.95,1.),smoothstep(.72,.95,abs(d.y)+n*.25));
        vec3 V=normalize(cameraPosition-vW); float ndl=dot(normalize(vN),uSun);
        float lit=smoothstep(-.08,.45,ndl);
        vec3 col=land*(lit*.8+.012);
        col+=vec3(1.,.5,.3)*pow(1.-max(dot(normalize(vN),V),0.),3.)*smoothstep(-.3,.6,ndl)*.5;
        gl_FragColor=vec4(col,1.);
      }`,
  });
  planet.add(new THREE.Mesh(new THREE.SphereGeometry(8, 128, 128), surfaceMat));
  planet.add(new THREE.Mesh(new THREE.SphereGeometry(8.5, 96, 96), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uSun: { value: sunDir } },
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 uSun; varying vec3 vN; varying vec3 vW; void main(){ vec3 V=normalize(cameraPosition-vW); float f=pow(1.-abs(dot(normalize(vN),V)),3.2); float l=smoothstep(-.4,.5,dot(normalize(vN),uSun)); gl_FragColor=vec4(vec3(1.,.55,.35)*f*l*2.2,1.); }`,
  })));
  const ringGeo = new THREE.RingGeometry(11, 17, 192, 1);
  ringGeo.rotateX(-Math.PI / 2);
  const rings = new THREE.Mesh(ringGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: 'varying float vR; void main(){ vR=length(position.xz); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying float vR; void main(){
      float b=.5+.5*sin(vR*7.+sin(vR*13.)*1.2); float e=smoothstep(11.,11.8,vR)*smoothstep(17.,16.,vR);
      float gap=smoothstep(.0,.08,abs(vR-14.2)-.15);
      gl_FragColor=vec4(vec3(.9,.72,.55)*(.5+.6*b),e*gap*(.2+.6*b)); }`,
  }));
  rings.rotation.x = 0.28;
  planet.add(rings);
  scene.add(new THREE.PointLight(0xffd9b0, 0.0)); // placeholder for custom lights

  /* camera rail — one keyframe per section */
  const rail = createRail(
    [[0, 42, 52], [16, 7, 22], [24, 2, -14], [47, 4, -50], [67, 11, -54]],
    [[0, 0, 0], [0, 0, -6], [45, 2, -50], [60, 3, -70], [60, 3, -70]]
  );

  const cx = document.getElementById('cx'), cy = document.getElementById('cy'), cz = document.getElementById('cz');
  let n = 0;
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    gu.uTime.value = t;
    cloudMats.forEach((m) => (m.uniforms.uTime.value = t));
    rail.apply(camera, p);
    camera.position.x += pointer.x * 0.8;
    camera.position.y += pointer.y * 0.5;
    camera.rotateZ(-pointer.x * 0.03);
    planet.rotation.y = t * 0.05;
    core.material.opacity = 0.2 + 0.06 * Math.sin(t * 0.7);
    if (cx && ++n % 5 === 0) {
      cx.textContent = camera.position.x.toFixed(1).padStart(6, '0');
      cy.textContent = camera.position.y.toFixed(1).padStart(6, '0');
      cz.textContent = camera.position.z.toFixed(1).padStart(6, '0');
    }
  });
  stage.start();
});
