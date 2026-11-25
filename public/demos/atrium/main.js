import { THREE, boot, createStage, createPointer, clamp, damp, smoothstep, IS_EMBED } from '@core';

/* ── tweak me: swap `img` for your own images (e.g. 'images/one.jpg') ── */
const ITEMS = [
  { title: 'Aurora Study', tag: 'Identity · 2026' },
  { title: 'Slow Orbit', tag: 'Motion · 2025' },
  { title: 'Verdant', tag: 'Packaging · 2025' },
  { title: 'Golden Hour', tag: 'Campaign · 2026' },
  { title: 'Night Garden', tag: 'Website · 2025' },
  { title: 'Rosé Theory', tag: 'Editorial · 2024' },
  { title: 'Monolith Press', tag: 'Print · 2025' },
  { title: 'Ember & Co.', tag: 'Brand · 2026' },
];
const RADIUS = 10; // ring radius
const PAL = [
  ['#ff4d2e', '#ffd9c2', '#1a1410'], ['#2e5bff', '#d9e4ff', '#0d1230'], ['#0f9d78', '#d2f5e8', '#06241c'], ['#f2b705', '#fff1c2', '#2a2000'],
  ['#7b2ff7', '#eadcff', '#1c0a38'], ['#ff2e88', '#ffd6e8', '#33001a'], ['#141414', '#f1efe9', '#141414'], ['#e8590c', '#ffe8cc', '#2b1100'],
];

/* generative "artworks" so the template has zero asset dependencies */
function art(i) {
  const W = 640, H = 800, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d'), [a, b, d] = PAL[i % PAL.length];
  g.fillStyle = b; g.fillRect(0, 0, W, H);
  g.fillStyle = a; g.strokeStyle = d; g.lineWidth = 3;
  switch (i % 8) {
    case 0: for (let k = 8; k > 0; k--) { g.beginPath(); g.arc(W / 2, H * 0.46, k * 36, 0, 7); g.fillStyle = k % 2 ? a : b; g.fill(); } break;
    case 1: for (let k = 0; k < 26; k++) { g.fillStyle = k % 3 ? a : d; g.fillRect(0, k * 32, W * (0.35 + 0.65 * Math.abs(Math.sin(k * 0.6))), 18); } break;
    case 2: for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(W / 2 + Math.sin(k) * 80, 200 + k * 90, 220 - k * 18, 60, 0.3 * k, 0, 7); g.fillStyle = k % 2 ? a : d; g.globalAlpha = 0.85; g.fill(); } g.globalAlpha = 1; break;
    case 3: g.beginPath(); g.arc(W / 2, 460, 170, 0, 7); g.fill(); g.fillStyle = d; g.fillRect(0, 460, W, 340); g.fillStyle = b; for (let k = 0; k < 7; k++) g.fillRect(0, 480 + k * 40, W, 6 + k * 2); break;
    case 4: g.fillStyle = d; g.fillRect(0, 0, W, H); for (let k = 0; k < 160; k++) { g.fillStyle = k % 5 ? a : b; g.beginPath(); g.arc(((k * 97) % 600) + 20, ((k * 53) % 760) + 20, 3 + (k % 7), 0, 7); g.fill(); } break;
    case 5: g.fillStyle = a; g.beginPath(); g.moveTo(80, 720); g.lineTo(80, 330); g.arc(320, 330, 240, Math.PI, 0); g.lineTo(560, 720); g.closePath(); g.fill(); g.fillStyle = b; g.beginPath(); g.arc(320, 330, 120, Math.PI, 0); g.lineTo(440, 720); g.lineTo(200, 720); g.closePath(); g.fill(); break;
    case 6: g.fillStyle = a; g.fillRect(0, 0, W, H); for (let r = 0; r < 24; r++) for (let q = 0; q < 19; q++) { const s = 7 * (0.5 + 0.5 * Math.sin(r * 0.5) * Math.cos(q * 0.45)); g.fillStyle = b; g.beginPath(); g.arc(q * 34 + 20, r * 34 + 20, Math.max(0.5, s), 0, 7); g.fill(); } break;
    default: [[120, 140, 340], [200, 260, 300], [160, 400, 340]].forEach(([x, y, s], k) => { g.globalAlpha = 0.9; g.fillStyle = [a, d, '#fff'][k]; g.fillRect(x, y, s, s * 1.1); }); g.globalAlpha = 1;
  }
  g.fillStyle = d; g.font = '500 17px "JetBrains Mono", monospace';
  g.fillText(`N°${String(i + 1).padStart(2, '0')}`, 34, H - 40);
  g.textAlign = 'right'; g.fillText(ITEMS[i].tag.split(' · ')[0].toUpperCase(), W - 34, H - 40);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

boot(() => {
  const stage = createStage({ background: 0xece8e1, fov: 38, bloom: false, vignette: 0.22, grain: 0.05, aberration: 0.01 });
  const { scene, camera, renderer } = stage;
  renderer.toneMapping = THREE.NoToneMapping;
  const pointer = createPointer();

  // soft paper-gradient backdrop
  const bgc = document.createElement('canvas'); bgc.width = 4; bgc.height = 256;
  const bg = bgc.getContext('2d'), gr = bg.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#f6f3ed'); gr.addColorStop(1, '#ddd6ca');
  bg.fillStyle = gr; bg.fillRect(0, 0, 4, 256);
  const bgt = new THREE.CanvasTexture(bgc); bgt.colorSpace = THREE.SRGBColorSpace;
  scene.background = bgt;

  const N = ITEMS.length, step = (Math.PI * 2) / N;
  const loader = new THREE.TextureLoader();
  const cards = ITEMS.map((item, i) => {
    const tex = item.img ? loader.load(item.img, (t) => (t.colorSpace = THREE.SRGBColorSpace)) : art(i);
    const mat = new THREE.ShaderMaterial({
      transparent: true, side: THREE.DoubleSide,
      uniforms: { uTex: { value: tex }, uVel: { value: 0 }, uOpacity: { value: 1 }, uFocus: { value: 0 } },
      vertexShader: `uniform float uVel; varying vec2 vUv; void main(){ vUv=uv; vec3 p=position;
        p.y+=sin(uv.x*3.14159)*uVel*.35; p.z+=(uv.x-.5)*uVel*.25; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
      fragmentShader: `uniform sampler2D uTex; uniform float uVel,uOpacity,uFocus; varying vec2 vUv;
        float sdR(vec2 p,vec2 b,float r){ vec2 q=abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }
        void main(){ float sh=uVel*.004; vec3 c=vec3(texture2D(uTex,vUv+vec2(sh,0.)).r,texture2D(uTex,vUv).g,texture2D(uTex,vUv-vec2(sh,0.)).b);
          float g=dot(c,vec3(.299,.587,.114)); c=mix(vec3(g)*.9+.05,c,.4+.6*uFocus);
          if(sdR(vUv-.5,vec2(.5),.025)>0.) discard; gl_FragColor=vec4(c*(.82+.18*uFocus),uOpacity); }`,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.75, 24, 1), mat);
    scene.add(mesh);
    return { mesh, mat };
  });

  /* input: wheel, drag, keys, arrows — all just move `target` */
  let pos = 0, target = 0, vel = 0, last = 0, drag = false, active = -1;
  const now = () => performance.now();
  addEventListener('wheel', (e) => { target += (e.deltaY + e.deltaX) * 0.0022; last = now(); }, { passive: true });
  addEventListener('pointerdown', () => { drag = true; });
  addEventListener('pointerup', () => { drag = false; last = now(); });
  addEventListener('pointermove', (e) => { if (drag) { target -= e.movementX * 0.006; last = now(); } });
  addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') target = Math.round(target) + 1; if (e.key === 'ArrowLeft') target = Math.round(target) - 1; });
  document.getElementById('next').onclick = () => (target = Math.round(target) + 1);
  document.getElementById('prev').onclick = () => (target = Math.round(target) - 1);

  const cap = document.querySelector('.caption'), title = document.getElementById('title'), tag = document.getElementById('tag'), count = document.getElementById('count');
  document.getElementById('total').textContent = String(N).padStart(2, '0');
  function setActive(i) {
    active = i;
    cap.classList.add('swap');
    setTimeout(() => {
      title.textContent = ITEMS[i].title; tag.textContent = ITEMS[i].tag; count.textContent = String(i + 1).padStart(2, '0');
      cap.classList.remove('swap');
    }, 60);
  }

  camera.position.set(0, 0, 8.2);
  let prev = 0;
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    if (IS_EMBED) target += dt * 0.32;
    else if (!drag && now() - last > 900) target += (Math.round(target) - target) * Math.min(1, dt * 2.5);
    pos = damp(pos, target, 5, dt);
    vel = damp(vel, (pos - prev) / Math.max(dt, 1e-3), 8, dt);
    prev = pos;
    const idx = ((Math.round(pos) % N) + N) % N;
    if (idx !== active) setActive(idx);

    cards.forEach((c, i) => {
      let d = (((i - pos) % N) + N + N / 2) % N - N / 2; // wrapped distance in cards
      const a = d * step, front = Math.cos(a);
      c.mesh.position.set(Math.sin(a) * RADIUS, 0.6 + Math.sin(t * 0.6 + i) * 0.06, Math.cos(a) * RADIUS - RADIUS);
      c.mesh.rotation.y = a;
      c.mesh.visible = front > -0.1;
      c.mat.uniforms.uOpacity.value = smoothstep(-0.05, 0.5, front);
      c.mat.uniforms.uFocus.value = 1 - smoothstep(0, 0.7, Math.abs(d));
      c.mat.uniforms.uVel.value = clamp(vel, -5, 5);
    });
    camera.position.x = pointer.x * 0.5;
    camera.position.y = pointer.y * 0.25;
    camera.lookAt(0, 0.3, -1.5);
  });
  stage.start();
});
