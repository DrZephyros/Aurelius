import { THREE, boot, createStage, createPointer, createScroll, createEnv, radialTexture, roundedRectShape, rng, lerp, clamp, smoothstep } from '@core';

/* ── tweak me: your projects live here ─────────────────────── */
const CONFIG = {
  radius: 7.5,   // spiral radius
  rise: 3.0,     // vertical gap between screens
  turn: 0.95,    // radians between screens
  accent: 0xff5c35,
  particles: 520,
  projects: [
    { title: 'Northwind', tag: 'Fintech app · 2026', color: '#ff5c35' },
    { title: 'Pulse', tag: 'Health tracker · 2025', color: '#35c4ff' },
    { title: 'Verde', tag: 'Brand & web · 2025', color: '#22d3a6' },
    { title: 'Atlas', tag: 'Travel platform · 2025', color: '#ffcf3f' },
    { title: 'Orbit', tag: 'Design system · 2024', color: '#9b6bff' },
    { title: 'Lumen', tag: 'Smart-home UI · 2024', color: '#ff4fa3' },
  ],
};
const N = CONFIG.projects.length;
const SW = 6.4, SH = 4; // screen size in world units

/* generative UI "screenshots" so the template has zero asset dependencies — swap for your own images */
function ui(i) {
  const p = CONFIG.projects[i], W = 1280, H = 800, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d'), col = p.color;
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#12131a'); bg.addColorStop(1, '#07070a');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = col; g.globalAlpha = 0.16; g.beginPath(); g.arc(W * (0.2 + 0.6 * ((i * 37) % 10) / 10), H * 0.3, 360, 0, 7); g.fill(); g.globalAlpha = 1;
  // window chrome
  g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, 0, W, 64);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((k, n) => { g.fillStyle = k; g.beginPath(); g.arc(40 + n * 30, 32, 9, 0, 7); g.fill(); });
  g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.roundRect(W / 2 - 220, 16, 440, 32, 16); g.fill();
  // sidebar
  g.fillStyle = 'rgba(255,255,255,0.04)'; g.fillRect(0, 64, 220, H - 64);
  for (let k = 0; k < 6; k++) { g.fillStyle = k === i % 6 ? col : 'rgba(255,255,255,0.14)'; g.beginPath(); g.roundRect(34, 110 + k * 62, k === i % 6 ? 150 : 110 + (k % 3) * 20, 18, 9); g.fill(); }
  // content
  g.fillStyle = '#fff'; g.font = '700 74px system-ui, sans-serif'; g.fillText(p.title, 280, 196);
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.font = '500 24px system-ui, sans-serif'; g.fillText(p.tag, 284, 244);
  const layout = i % 3;
  for (let k = 0; k < 3; k++) {
    const x = 280 + k * 322, y = 300;
    g.fillStyle = 'rgba(255,255,255,0.06)'; g.beginPath(); g.roundRect(x, y, 300, 190, 22); g.fill();
    g.fillStyle = col; g.globalAlpha = 0.9 - k * 0.2;
    if (layout === 0) { for (let b = 0; b < 8; b++) g.fillRect(x + 24 + b * 33, y + 160 - (30 + ((b * 53 + k * 29) % 100)), 20, 30 + ((b * 53 + k * 29) % 100)); }
    else if (layout === 1) { g.lineWidth = 6; g.strokeStyle = col; g.beginPath(); for (let b = 0; b <= 10; b++) { const yy = y + 110 - Math.sin(b * 0.7 + k * 1.3) * 50; b ? g.lineTo(x + 24 + b * 25, yy) : g.moveTo(x + 24, yy); } g.stroke(); }
    else { g.beginPath(); g.arc(x + 150, y + 95, 62 - k * 8, 0, Math.PI * (1.2 + k * 0.4)); g.lineWidth = 18; g.strokeStyle = col; g.stroke(); }
    g.globalAlpha = 1;
  }
  g.fillStyle = 'rgba(255,255,255,0.06)'; g.beginPath(); g.roundRect(280, 520, 944, 220, 22); g.fill();
  for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.roundRect(312, 556 + k * 44, 420 - (k % 2) * 90, 14, 7); g.fill(); g.fillStyle = col; g.globalAlpha = 0.8; g.beginPath(); g.roundRect(1060, 552 + k * 44, 130, 22, 11); g.fill(); g.globalAlpha = 1; }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

boot(() => {
  const stage = createStage({
    background: 0x08080b, fog: { color: 0x08080b, density: 0.012 }, fov: 40, exposure: 1.05,
    bloom: { strength: 0.55, radius: 0.7, threshold: 0.6 }, vignette: 0.55,
  });
  const { scene, camera, renderer } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(5);

  scene.environment = createEnv(renderer, [
    { pos: [-8, 10, 8], w: 14, h: 6, intensity: 3, color: 0xffffff },
    { pos: [10, 3, -8], w: 6, h: 14, intensity: 3, color: CONFIG.accent },
  ]);
  scene.environmentIntensity = 0.6;

  /* central light spine + level rings */
  const top = (N - 1) * CONFIG.rise;
  const spine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, top + 14, 12),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(CONFIG.accent).multiplyScalar(2.4) })
  );
  spine.position.y = top / 2 + 1;
  scene.add(spine);
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(CONFIG.accent).multiplyScalar(0.9), transparent: true, opacity: 0.5 });
  const rings = [];
  for (let i = 0; i <= N; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(CONFIG.radius - 1.4, 0.012, 8, 120), ringMat);
    r.rotation.x = Math.PI / 2;
    r.position.y = i * CONFIG.rise - CONFIG.rise * 0.5;
    scene.add(r);
    rings.push(r);
  }

  /* floor glow disc */
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(255,92,53,0.28)', 'rgba(255,92,53,0)', 256), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -1.8;
  scene.add(glow);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(40, 96),
    new THREE.MeshStandardMaterial({ color: 0x0c0c12, metalness: 0.8, roughness: 0.35 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.9;
  scene.add(floor);

  /* the project screens on a rising spiral */
  const screens = [];
  const shape = roundedRectShape(SW, SH, 0.22);
  const geo = new THREE.ShapeGeometry(shape, 8);
  const gp = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < gp.count; i++) uv.setXY(i, gp.getX(i) / SW + 0.5, gp.getY(i) / SH + 0.5);
  const frameGeo = new THREE.ShapeGeometry(roundedRectShape(SW + 0.16, SH + 0.16, 0.28), 8);
  for (let i = 0; i < N; i++) {
    const th = i * CONFIG.turn;
    const grp = new THREE.Group();
    grp.position.set(Math.sin(th) * CONFIG.radius, i * CONFIG.rise, Math.cos(th) * CONFIG.radius);
    grp.rotation.y = th;
    const col = new THREE.Color(CONFIG.projects[i].color);
    const frame = new THREE.Mesh(frameGeo, new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(1.4) }));
    frame.position.z = -0.03;
    const face = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: ui(i), toneMapped: false }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture(), color: col, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.set(SW * 1.7, SH * 1.9, 1);
    halo.position.z = -0.4;
    grp.add(halo, frame, face);
    scene.add(grp);
    screens.push({ grp, th, y: grp.position.y, base: i * CONFIG.rise });
  }

  /* drifting particles */
  const pn = CONFIG.particles, pp = new Float32Array(pn * 3);
  for (let i = 0; i < pn; i++) {
    const a = R() * 6.28, r = 2 + R() * 16;
    pp.set([Math.sin(a) * r, -1 + R() * (top + 8), Math.cos(a) * r], i * 3);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, color: 0xffd9cc, transparent: true, opacity: 0.55, map: radialTexture(), depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  const nowN = document.getElementById('now-n'), nowT = document.getElementById('now-t');
  let shown = -1;
  const look = new THREE.Vector3(), tan = new THREE.Vector3(), sp = new THREE.Vector3();
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    // which screen are we on? 0..N-1 (fractional)
    const u = clamp((p - 0.06) / 0.86) * (N - 1);
    const i0 = Math.min(N - 2, Math.floor(u)), f = u - i0, e = f * f * (3 - 2 * f);
    const th = lerp(screens[i0].th, screens[i0 + 1].th, e);
    const y = lerp(screens[i0].y, screens[i0 + 1].y, e);
    const far = 1 - smoothstep(0, 0.2, p);
    const fin = smoothstep(0.86, 1, p);
    const dist = CONFIG.radius + lerp(13.5, 24, far) + fin * 6;
    // text is on the right for the first sections, then flips to the left for "about"
    const side = 4.6 * (1 - 2 * smoothstep(0.55, 0.65, p)) * (1 - smoothstep(0.84, 0.94, p));
    camera.position.set(Math.sin(th) * dist, y + 0.6 + far * 3 + pointer.y * 0.5 + fin * 2, Math.cos(th) * dist);
    sp.set(Math.sin(th) * CONFIG.radius, y, Math.cos(th) * CONFIG.radius);
    tan.set(Math.cos(th), 0, -Math.sin(th));
    look.copy(sp).addScaledVector(tan, side * (1 - far) + pointer.x * 0.9);
    look.lerp(sp.set(0, y + 2, 0), far * 0.7 + fin * 0.6);
    camera.lookAt(look);

    screens.forEach((s, i) => {
      const near = 1 - clamp(Math.abs(u - i) / 1.4);
      s.grp.position.y = s.y + Math.sin(t * 0.8 + i * 1.7) * 0.1;
      s.grp.scale.setScalar(1 + near * 0.06);
      s.grp.rotation.x = -pointer.y * 0.05 * near;
    });
    rings.forEach((r, i) => (r.rotation.z = t * 0.05 * (i % 2 ? 1 : -1)));
    dust.rotation.y = t * 0.015;
    const idx = Math.round(u);
    if (idx !== shown) {
      shown = idx;
      nowN.textContent = String(idx + 1).padStart(2, '0');
      nowT.textContent = CONFIG.projects[idx].title;
    }
    document.documentElement.classList.toggle('show-now', p > 0.12 && p < 0.84);
  });
  stage.start();
});
