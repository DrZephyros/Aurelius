import { THREE, boot, createStage, createPointer, createScroll, createRail, radialTexture, rng, lerp } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  fog: 0x12051e,
  magenta: [1.0, 0.12, 0.8],
  cyan: [0.1, 0.9, 1.0],
  amber: [1.0, 0.7, 0.25],
  rain: 2600,
  cars: 46,
  signs: ['NOODLES', 'HOTEL', 'ARCADE', 'BAR 24', 'CYBER', 'OPEN', 'CLUB', 'RAMEN'],
};

boot(() => {
  const stage = createStage({
    background: 0x07030f, fog: { color: CONFIG.fog, density: 0.0125 }, fov: 58, far: 600,
    bloom: { strength: 0.5, radius: 0.6, threshold: 0.95 }, aberration: 0.05,
  });
  const { scene, camera } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(42);
  const FOGC = new THREE.Color(CONFIG.fog);

  /* building material: procedural lit windows, fog baked in */
  const mkMat = (bright) => new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uFog: { value: FOGC }, uDens: { value: 0.0125 }, uBright: { value: bright } },
    vertexShader: /* glsl */ `
      attribute float aSeed; varying vec3 vW; varying vec3 vN; varying float vSeed; varying float vDist;
      void main(){ vec4 wp=modelMatrix*instanceMatrix*vec4(position,1.); vW=wp.xyz; vN=normal; vSeed=aSeed;
        vec4 mv=viewMatrix*wp; vDist=length(mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uFog; uniform float uDens,uTime,uBright; varying vec3 vW; varying vec3 vN; varying float vSeed; varying float vDist;
      float h(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      void main(){
        float side=abs(vN.y)>.5?0.:1.;
        float u=abs(vN.x)>.5?vW.z:vW.x;
        vec2 g=vec2(u*.55,vW.y*.38); vec2 cell=floor(g); vec2 f=fract(g);
        float r=h(cell+vSeed*37.);
        float win=step(.12,f.x)*step(f.x,.82)*step(.2,f.y)*step(f.y,.8);
        float lit=step(.74,r)*win*side;
        float flick=.85+.15*sin(uTime*3.+r*40.);
        vec3 pal=r>.94?vec3(1.,.15,.8):r>.88?vec3(.1,.9,1.):r>.8?vec3(1.,.7,.25):vec3(.95,.82,.7)*.8;
        vec3 base=vec3(.02,.014,.04)+vec3(.05,.0,.07)*smoothstep(0.,70.,abs(vW.y))*side;
        vec3 col=base+pal*lit*1.5*flick;
        col*=uBright;
        float fog=1.-exp(-uDens*uDens*vDist*vDist);
        gl_FragColor=vec4(mix(col,uFog*.9,fog),1.);
      }`,
  });
  const matReal = mkMat(1), matMirror = mkMat(0.55);

  /* buildings: two rows each side of the street */
  const list = [];
  for (const side of [-1, 1]) {
    for (let row = 0; row < 2; row++) {
      let z = 50;
      while (z > -260) {
        const w = 5 + R() * 5, d = 6 + R() * 9;
        const far = Math.min(1, (50 - z) / 220);
        const h = 12 + R() * (24 + far * 50) + row * 16;
        list.push({ x: side * (7.6 + w / 2 + row * 11), z: z - d / 2, w, d, h, side, row });
        z -= d + 0.6 + R() * 1.4;
      }
    }
  }
  const box = new THREE.BoxGeometry(1, 1, 1);
  const seeds = new Float32Array(list.length).map(() => R());
  box.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  const real = new THREE.InstancedMesh(box, matReal, list.length);
  const mirror = new THREE.InstancedMesh(box, matMirror, list.length);
  mirror.scale.y = -1;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  list.forEach((b, i) => {
    m4.compose(new THREE.Vector3(b.x, b.h / 2, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
    real.setMatrixAt(i, m4);
    mirror.setMatrixAt(i, m4);
  });
  real.frustumCulled = mirror.frustumCulled = false;
  scene.add(real, mirror);

  /* wet ground: dark glass over the mirrored city */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 700),
    new THREE.MeshBasicMaterial({ color: 0x050208, transparent: true, opacity: 0.86, depthWrite: false })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -150;
  scene.add(ground);

  /* neon edge strips */
  const bars = list.filter((b) => b.row === 0 && R() < 0.8);
  const barMesh = new THREE.InstancedMesh(box, new THREE.MeshBasicMaterial({ color: 0xffffff }), bars.length);
  const pal = [CONFIG.magenta, CONFIG.cyan, CONFIG.amber, CONFIG.magenta, CONFIG.cyan];
  bars.forEach((b, i) => {
    const hh = 2 + R() * 11;
    m4.compose(new THREE.Vector3(b.side * 7.45, 2.5 + R() * b.h * 0.8, b.z + (R() - 0.5) * b.d * 0.8), q, new THREE.Vector3(0.14, hh, 0.14));
    barMesh.setMatrixAt(i, m4);
    const c = pal[Math.floor(R() * pal.length)];
    barMesh.setColorAt(i, new THREE.Color(c[0] * 3, c[1] * 3, c[2] * 3));
  });
  barMesh.frustumCulled = false;
  scene.add(barMesh);

  /* hanging signs */
  CONFIG.signs.forEach((txt, i) => {
    const cv = document.createElement('canvas');
    cv.width = 512; cv.height = 160;
    const g = cv.getContext('2d');
    const c = pal[i % pal.length];
    const css = `rgb(${c.map((v) => Math.round(Math.min(1, v) * 255)).join(',')})`;
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, 512, 160);
    g.strokeStyle = css; g.lineWidth = 6; g.strokeRect(10, 10, 492, 140);
    g.font = '700 84px "Chakra Petch", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = css; g.shadowBlur = 28; g.fillStyle = '#fff'; g.fillText(txt, 256, 86);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const side = i % 2 ? 1 : -1;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.62), new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: new THREE.Color(1.7, 1.7, 1.7) }));
    sign.position.set(side * 6.6, 5 + (i % 3) * 2.2, 18 - i * 32 - R() * 8);
    sign.rotation.y = -side * Math.PI * 0.5;
    scene.add(sign);
  });

  /* lane dashes */
  const dashes = new THREE.InstancedMesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.0, 0.3) }), 60);
  for (let i = 0; i < 60; i++) { m4.compose(new THREE.Vector3(0, 0.03, 40 - i * 5), q, new THREE.Vector3(0.18, 0.02, 2.4)); dashes.setMatrixAt(i, m4); }
  dashes.frustumCulled = false;
  scene.add(dashes);

  /* traffic light-streaks */
  const carGeo = new THREE.BoxGeometry(0.14, 0.14, 1.9);
  const carMesh = new THREE.InstancedMesh(carGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), CONFIG.cars * 2);
  const cars = Array.from({ length: CONFIG.cars }, () => {
    const lane = [-4.6, -2.2, 2.2, 4.6][Math.floor(R() * 4)];
    return { lane, z: 45 - R() * 300, v: (lane < 0 ? -1 : 1) * (14 + R() * 18) };
  });
  cars.forEach((c, i) => {
    const col = c.lane < 0 ? new THREE.Color(3, 0.15, 0.25) : new THREE.Color(3, 2.8, 2.3);
    carMesh.setColorAt(i * 2, col); carMesh.setColorAt(i * 2 + 1, col);
  });
  carMesh.frustumCulled = false;
  scene.add(carMesh);

  /* rooftop beacons */
  const bp = [];
  list.filter((b) => b.h > 45).forEach((b) => bp.push(b.x, b.h + 0.5, b.z));
  const bg = new THREE.BufferGeometry();
  bg.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3));
  const beacons = new THREE.Points(bg, new THREE.PointsMaterial({ size: 1.6, map: radialTexture('rgba(255,60,60,1)', 'rgba(255,0,0,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(beacons);

  /* retro sun at the end of the street */
  const sun = new THREE.Mesh(new THREE.CircleGeometry(55, 96), new THREE.ShaderMaterial({
    transparent: true, fog: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec2 vUv; void main(){
      float y=vUv.y; vec3 c=mix(vec3(1.,.1,.6),vec3(1.,.82,.25),y);
      float bands=step(.5+.5*sin(y*120.),1.-y*1.7); float cut=y<.52?bands:1.;
      if(cut<.5) discard; gl_FragColor=vec4(c*1.6,1.); }`,
  }));
  sun.position.set(0, 30, -262);
  scene.add(sun);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(255,40,190,.9)', 'rgba(255,40,190,0)', 256), blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  halo.scale.set(220, 220, 1); halo.position.set(0, 30, -265);
  scene.add(halo);

  /* rain */
  const rp = [], re = [];
  for (let i = 0; i < CONFIG.rain; i++) {
    const x = (R() - 0.5) * 60, y = R() * 40, z = (R() - 0.7) * 60;
    rp.push(x, y, z, x, y, z); re.push(0, 1);
  }
  const rg = new THREE.BufferGeometry();
  rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
  rg.setAttribute('aEnd', new THREE.Float32BufferAttribute(re, 1));
  const rainMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `attribute float aEnd; uniform float uTime; varying float vA;
      void main(){ vec3 p=position; p.y=mod(p.y-uTime*30.,40.)+aEnd*1.4; vA=.1+.2*aEnd; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
    fragmentShader: 'varying float vA; void main(){ gl_FragColor=vec4(vec3(.55,.75,1.)*vA*1.6,1.); }',
  });
  const rain = new THREE.LineSegments(rg, rainMat);
  rain.frustumCulled = false;
  scene.add(rain);

  /* camera rail: flies down the avenue, then lifts over the skyline */
  const rail = createRail(
    [[0, 3.1, 38], [-2.5, 4, 2], [2.6, 2.6, -48], [0, 7, -100], [0, 46, -122]],
    [[0, 6, -10], [0, 5.5, -45], [0, 6, -88], [0, 8, -150], [0, 4, -230]]
  );

  const spd = document.getElementById('spd'), dst = document.getElementById('dst');
  let n = 0;
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    rail.apply(camera, p);
    camera.position.x += pointer.x * 1.2;
    camera.position.y += pointer.y * 0.5;
    camera.lookAt(camera.position.x * 0.3 - pointer.x * 3, 6 - p * 2 + pointer.y * 2, camera.position.z - 40);
    camera.rotateZ(-pointer.x * 0.04);
    matReal.uniforms.uTime.value = matMirror.uniforms.uTime.value = t;
    rainMat.uniforms.uTime.value = t;
    rain.position.set(camera.position.x, 0, camera.position.z - 14);
    cars.forEach((c, i) => {
      c.z += c.v * dt;
      if (c.z > 50) c.z = -260; else if (c.z < -260) c.z = 50;
      for (let k = 0; k < 2; k++) {
        m4.compose(new THREE.Vector3(c.lane + (k ? 0.6 : -0.6), 0.45, c.z), q, new THREE.Vector3(1, 1, 1));
        carMesh.setMatrixAt(i * 2 + k, m4);
      }
    });
    carMesh.instanceMatrix.needsUpdate = true;
    beacons.material.opacity = 0.5 + 0.5 * Math.sin(t * 3);
    if (spd && ++n % 6 === 0) {
      spd.textContent = String(Math.round(60 + Math.abs(scroll.velocity) * 2600)).padStart(3, '0');
      dst.textContent = String(Math.round(p * 2400)).padStart(4, '0');
    }
  });
  stage.start();
});
