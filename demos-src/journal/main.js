import { THREE, boot, createStage, createPointer, createScroll, rng, lerp, clamp, smoothstep } from '@core';

/* ── tweak me ─────────────────────────────────────────────── */
const CONFIG = {
  pages: 52,          // floating sheets
  length: 128,        // how far the story runs (z units)
  paper: 0xfffbf2,
  inks: ['#e5412d', '#1f3a8a', '#0f7a5c', '#c98a0b', '#7b3fa0', '#d4447c', '#1a1712', '#2a7f9e'],
  headlines: ['The case for finishing small things', 'Why every grid wants to be broken', 'Notes on boring technology', 'Type that disappears', 'A slow year in review', 'What the editor cut', 'Field notes, spring', 'Ten small rules'],
};
const pathX = (z) => Math.sin(z * 0.05) * 3.2;
const pathY = (z) => Math.cos(z * 0.037) * 1.4;

/* generative magazine pages — replace with your own article cards (canvas → image textures) */
function page(i) {
  const W = 512, H = 704, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d'), ink = CONFIG.inks[i % CONFIG.inks.length];
  g.fillStyle = '#fcf9f2'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(0,0,0,0.035)'; for (let k = 0; k < 200; k++) g.fillRect((k * 97) % W, (k * 53) % H, 2, 1);
  const lines = (x, y, w, n, h = 8, gap = 18) => { g.fillStyle = 'rgba(26,23,18,0.5)'; for (let k = 0; k < n; k++) g.fillRect(x, y + k * gap, w * (k === n - 1 ? 0.6 : 1 - ((k * 7) % 5) * 0.02), h); };
  const head = (x, y, w, n) => {
    g.fillStyle = '#1a1712'; g.font = '500 44px Georgia, serif';
    const words = CONFIG.headlines[i % CONFIG.headlines.length].split(' ');
    let line = '', row = 0;
    for (const word of words) {
      const t = line + word + ' ';
      if (g.measureText(t).width > w && line) { g.fillText(line, x, y + row * 48); line = word + ' '; row++; if (row >= n) break; } else line = t;
    }
    if (row < n) g.fillText(line, x, y + row * 48);
  };
  g.fillStyle = ink; g.font = '500 15px monospace'; g.fillText(['DESIGN', 'SOFTWARE', 'ESSAY', 'INTERVIEW'][i % 4] + ' · ' + (4 + (i * 3) % 12) + ' MIN', 44, 64);
  g.fillRect(44, 80, 52, 3);
  switch (i % 4) {
    case 0: head(44, 150, 420, 4); g.fillStyle = ink; g.fillRect(44, 372, 80, 5); lines(44, 410, 420, 12); break;
    case 1: g.fillStyle = ink; g.font = '700 96px Georgia, serif'; g.fillText('A', 44, 190); head(150, 130, 320, 2); lines(44, 240, 200, 18, 7, 20); lines(268, 240, 200, 18, 7, 20); break;
    case 2: { const gr = g.createLinearGradient(0, 0, W, 340); gr.addColorStop(0, ink); gr.addColorStop(1, '#f4d9b0'); g.fillStyle = gr; g.fillRect(44, 110, W - 88, 280); g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(W * 0.66, 220, 70, 0, 7); g.fill(); head(44, 450, 420, 2); lines(44, 560, 420, 5); break; }
    default: g.fillStyle = ink; g.font = 'italic 220px Georgia, serif'; g.fillText('“', 36, 290); g.fillStyle = '#1a1712'; g.font = 'italic 38px Georgia, serif';
      ['Constraints are a', 'gift, until they', "aren't. Know which", 'one you are in.'].forEach((t, k) => g.fillText(t, 54, 350 + k * 48)); g.fillStyle = ink; g.font = '500 15px monospace'; g.fillText('— MAYA OKAFOR', 54, 600);
  }
  g.fillStyle = 'rgba(26,23,18,0.45)'; g.font = '500 13px monospace'; g.fillText(String(i + 1).padStart(2, '0'), W - 64, H - 36);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

boot(() => {
  const stage = createStage({
    background: 0xf3efe6, fog: { color: 0xf3efe6, density: 0.03 }, fov: 48, far: 200, exposure: 1.0,
    bloom: false, grain: 0.03, vignette: 0.12, aberration: 0.01,
  });
  const { scene, camera } = stage;
  const pointer = createPointer();
  const scroll = createScroll();
  const R = rng(14);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9cdb8, 1.5));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.2);
  sun.position.set(-6, 10, 8);
  scene.add(sun);

  /* the sheets: gently bent planes drifting in a spiral around the path */
  const geo = new THREE.PlaneGeometry(1.1, 1.5, 8, 10);
  const gp = geo.attributes.position;
  for (let i = 0; i < gp.count; i++) gp.setZ(i, Math.sin(gp.getX(i) * 2.2) * 0.07 + gp.getY(i) * gp.getY(i) * 0.06);
  geo.computeVertexNormals();
  const texCount = 8, texs = Array.from({ length: texCount }, (_, i) => page(i));
  const mats = texs.map((map) => new THREE.MeshStandardMaterial({ map, side: THREE.DoubleSide, roughness: 0.95, color: CONFIG.paper }));
  const sheets = [];
  for (let i = 0; i < CONFIG.pages; i++) {
    const z = 4 - (i / CONFIG.pages) * CONFIG.length - R() * 2;
    const a = i * 2.4 + R(), r = 2.4 + R() * 3.4;
    const m = new THREE.Mesh(geo, mats[i % texCount]);
    const s = 1.15 + R() * 0.8;
    m.scale.setScalar(s);
    sheets.push({ m, z, a, r, s, ph: R() * 6.28, sp: 0.25 + R() * 0.4, rx: (R() - 0.5) * 0.8, rz: (R() - 0.5) * 0.7 });
    scene.add(m);
  }

  /* the paper plane that leads the way */
  const V = { N: [0, 0, -1.3], L: [-0.62, 0.13, 0.6], Rr: [0.62, 0.13, 0.6], K: [0, -0.26, 0.6], T: [0, 0.05, 0.6] };
  const tri = [['N', 'K', 'L'], ['N', 'L', 'T'], ['N', 'Rr', 'K'], ['N', 'T', 'Rr']];
  const pv = [];
  tri.forEach((t) => t.forEach((k) => pv.push(...V[k])));
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.Float32BufferAttribute(pv, 3));
  pg.computeVertexNormals();
  const plane = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, flatShading: true, roughness: 0.8 }));
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(pg), new THREE.LineBasicMaterial({ color: 0xe5412d }));
  plane.add(edge);
  plane.scale.setScalar(0.9);
  scene.add(plane);

  const look = new THREE.Vector3(), ahead = new THREE.Vector3(), prev = new THREE.Vector3();
  stage.onFrame((dt, t) => {
    pointer.update(dt, t);
    const p = scroll.update(dt, t);
    const z = lerp(12, 4 - CONFIG.length - 4, p);
    camera.position.set(pathX(z) + pointer.x * 0.6, pathY(z) + 0.5 + pointer.y * 0.35, z);
    const pz = z - 8.5 - smoothstep(0.9, 1, p) * 6;
    ahead.set(pathX(pz) + 1.1 * (1 - smoothstep(0.1, 0.3, p)), pathY(pz) - 0.55 + Math.sin(t * 1.1) * 0.12, pz);
    plane.position.lerp(ahead, 1 - Math.exp(-6 * dt));
    look.set(pathX(z - 14), pathY(z - 14), z - 14);
    camera.lookAt(look);
    // bank into the turn
    prev.copy(ahead).sub(plane.position);
    plane.rotation.set(Math.sin(t * 1.3) * 0.05 + 0.04, -prev.x * 0.5 + Math.PI * 0, -prev.x * 1.2 - (pathX(pz) - pathX(pz + 3)) * 0.2);

    sheets.forEach((s) => {
      const bob = Math.sin(t * s.sp + s.ph);
      s.m.position.set(pathX(s.z) + Math.cos(s.a + t * 0.04) * s.r, pathY(s.z) + Math.sin(s.a + t * 0.04) * s.r * 0.7 + bob * 0.25, s.z);
      s.m.rotation.set(s.rx + bob * 0.12, s.a * 0.35 + Math.sin(t * s.sp * 0.7 + s.ph) * 0.18 + 0.5, s.rz + Math.cos(t * s.sp + s.ph) * 0.1);
    });
  });
  stage.start();
});
