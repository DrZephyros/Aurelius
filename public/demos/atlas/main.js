import { THREE, boot, createStage, createPointer, createScroll, createLabels, radialTexture, rng, lerp, clamp, smoothstep, GLSL_NOISE } from '@core';

/* ── tweak me: your destinations ───────────────────────────────
   lat/lon in degrees. `view` is where the globe looks at the start and end of the page. */
const CONFIG = {
  radius: 5,
  accent: 0xffbf5e,
  sun: [6, 2.5, 6],
  destinations: [
    { name: 'Lisbon', lat: 38.7, lon: -9.1, label: 'l1' },
    { name: 'Kyoto', lat: 35.0, lon: 135.7, label: 'l2' },
    { name: 'Patagonia', lat: -50.9, lon: 287, label: 'l3' }, // 287 = -73° (kept increasing so the globe always spins forward)
  ],
  heroView: { lat: 14, lon: 8 },
  endView: { lat: 22, lon: 330 },
  stars: 2600,
};
const D2R = Math.PI / 180;
const toVec = (lat, lon, r = 1) => new THREE.Vector3(Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R), Math.cos(lat * D2R) * Math.cos(lon * D2R)).multiplyScalar(r);

boot(() => {
  const stage = createStage({
    background: 0x030812, fov: 36, exposure: 0.95,
    bloom: { strength: 0.5, radius: 0.7, threshold: 0.85 }, vignette: 0.5, maxDpr: 1.5,
  });
  const { scene, camera } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(9);
  const pins = CONFIG.destinations.map((d) => toVec(d.lat, d.lon));

  /* stars */
  const sp = new Float32Array(CONFIG.stars * 3);
  for (let i = 0; i < CONFIG.stars; i++) {
    const v = new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(160 + R() * 40);
    sp.set([v.x, v.y, v.z], i * 3);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.8, sizeAttenuation: false, color: 0xdfe8ff, map: radialTexture(), transparent: true, opacity: 0.85, depthWrite: false })));

  /* the planet: continents, oceans, ice caps and night-side city lights, all in one fragment shader */
  const globe = new THREE.Group();
  scene.add(globe);
  const uni = {
    uSun: { value: new THREE.Vector3(...CONFIG.sun).normalize() },
    uP0: { value: pins[0] }, uP1: { value: pins[1] }, uP2: { value: pins[2] },
  };
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(CONFIG.radius, 128, 96),
    new THREE.ShaderMaterial({
      uniforms: uni,
      vertexShader: `varying vec3 vP; varying vec3 vWN; varying vec3 vV;
        void main(){ vP=position; vWN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vV=cameraPosition-w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `${GLSL_NOISE}
        uniform vec3 uSun,uP0,uP1,uP2; varying vec3 vP; varying vec3 vWN; varying vec3 vV;
        void main(){
          vec3 n=normalize(vP);
          float h=fbm(n*1.7+vec3(3.1))*0.95+0.45*snoise(n*0.8);
          h+=0.42*smoothstep(0.3,0.0,distance(n,uP0))+0.42*smoothstep(0.3,0.0,distance(n,uP1))+0.42*smoothstep(0.3,0.0,distance(n,uP2));
          float land=smoothstep(0.14,0.2,h);
          float lat=abs(n.y);
          float v1=fbm(n*4.+7.)*.5+.5;
          vec3 ocean=mix(vec3(.015,.07,.17),vec3(.03,.22,.4),smoothstep(0.,.8,fbm(n*3.)*.5+.5)*.7+(1.-lat)*.15);
          vec3 lc=mix(vec3(.14,.4,.26),vec3(.78,.62,.38),smoothstep(.25,.6,v1));
          lc=mix(lc,vec3(.42,.38,.34),smoothstep(.5,.85,h));
          lc=mix(lc,vec3(.95,.97,1.),smoothstep(.86,.98,lat+h*.04));
          vec3 col=mix(ocean,lc,land);
          col+=smoothstep(.1,.16,h)*(1.-smoothstep(.16,.25,h))*vec3(.08,.34,.45);
          vec3 N=normalize(vWN), V=normalize(vV), L=normalize(uSun);
          float diff=clamp(dot(N,L),0.,1.);
          float lit=.14+1.0*diff;
          float spec=pow(max(dot(N,normalize(L+V)),0.),70.)*(1.-land)*.45;
          float fres=pow(1.-max(dot(N,V),0.),3.);
          col=col*lit+spec*vec3(1.,.95,.85)+fres*vec3(.18,.45,.9)*.55*(.3+diff);
          float night=1.-smoothstep(0.,.22,diff);
          float city=smoothstep(.72,.9,snoise(n*42.))*land*night;
          col+=city*vec3(1.,.72,.32)*1.6;
          gl_FragColor=vec4(col,1.);
        }`,
    })
  );
  globe.add(planet);

  /* atmosphere rim */
  scene.add(globe);
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(CONFIG.radius * 1.065, 96, 64),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
      uniforms: { uSun: uni.uSun },
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 w=modelMatrix*vec4(position,1.); vN=normalize(mat3(modelMatrix)*normal); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader: 'uniform vec3 uSun; varying vec3 vN; varying vec3 vV; void main(){ float d=max(dot(vN,vV),0.); float f=pow(1.-d,2.6)*smoothstep(0.,.3,d); float s=.35+.65*clamp(dot(vN,normalize(uSun))*.8+.45,0.,1.); gl_FragColor=vec4(vec3(.25,.55,1.)*f*s*1.5,1.); }',
    })
  );
  scene.add(atmo);

  /* destination pins (a glowing dot + two pulsing rings) */
  const up = new THREE.Vector3(0, 0, 1);
  const pinObjs = pins.map((v) => {
    const g = new THREE.Group();
    g.position.copy(v).multiplyScalar(CONFIG.radius * 1.004);
    g.quaternion.setFromUnitVectors(up, v);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(CONFIG.accent).multiplyScalar(3) }));
    const rings = [0, 1].map(() => {
      const r = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.2, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(CONFIG.accent).multiplyScalar(2), transparent: true, depthWrite: false, side: THREE.DoubleSide }));
      g.add(r);
      return r;
    });
    g.add(dot);
    globe.add(g);
    return { g, rings };
  });

  /* flight arcs between the destinations (drawn in the last section) */
  const arcs = [[0, 1], [1, 2], [2, 0]].map(([a, b]) => {
    const pts = [];
    for (let i = 0; i <= 80; i++) {
      const f = i / 80;
      const dir = pins[a].clone().lerp(pins[b], f).normalize();
      pts.push(dir.multiplyScalar(CONFIG.radius * (1.005 + Math.sin(f * Math.PI) * 0.22)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: new THREE.Color(CONFIG.accent).multiplyScalar(1.6), transparent: true, opacity: 0.9 }));
    geo.setDrawRange(0, 0);
    globe.add(line);
    return line;
  });

  /* callouts: one layer per destination, each only visible in its own section */
  const labels = CONFIG.destinations.map((d, i) =>
    createLabels(camera, [{ el: document.getElementById(d.label), anchor: pinObjs[i].g, dx: i === 1 ? 70 : -70, dy: -64 }])
  );

  /* globe orientation keyframes: hero → each destination → finale */
  const keys = [CONFIG.heroView, ...CONFIG.destinations, CONFIG.endView];
  const sides = [5.2, -5.2, 5.2, -5.2, 0];
  const latEl = document.getElementById('lat'), lonEl = document.getElementById('lon');
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    const k = Math.min(3.999, p * 4), i0 = Math.floor(k), f = k - i0, e = f * f * (3 - 2 * f);
    const lat = lerp(keys[i0].lat, keys[i0 + 1].lat, e);
    const lon = lerp(keys[i0].lon, keys[i0 + 1].lon, e) + smoothstep(0.85, 1, p) * t * 2.2;
    globe.rotation.set(lat * D2R + pointer.y * 0.08, -lon * D2R + pointer.x * 0.12, 0);
    atmo.rotation.copy(globe.rotation);
    globe.position.x = lerp(sides[i0], sides[i0 + 1], e);
    atmo.position.x = globe.position.x;
    const fin = smoothstep(0.75, 1, p);
    const z = lerp(27, 23.5, Math.sin(p * Math.PI)) + fin * 5;
    camera.position.set(0, 0, z);
    camera.lookAt(0, 0, 0);

    pinObjs.forEach((o, i) => {
      o.rings.forEach((r, j) => {
        const c = (t * 0.6 + j * 0.5 + i * 0.2) % 1;
        r.scale.setScalar(0.6 + c * 2.2);
        r.material.opacity = (1 - c) * 0.8;
      });
    });
    const draw = smoothstep(0.78, 0.96, p);
    arcs.forEach((a, i) => a.geometry.setDrawRange(0, Math.floor(clamp(draw * 3 - i) * 81)));
    labels.forEach((l, i) => {
      const c = (i + 1) / 4; // section centres at 0.25, 0.5, 0.75
      l.update(smoothstep(c - 0.11, c - 0.05, p) * (1 - smoothstep(c + 0.05, c + 0.11, p)));
    });
    latEl.textContent = lat.toFixed(1).padStart(4, '0') + '°';
    lonEl.textContent = (((lon + 180) % 360 + 360) % 360 - 180).toFixed(1) + '°';
  });
  stage.start();
});
