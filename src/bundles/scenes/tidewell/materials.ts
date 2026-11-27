import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   AURA · materials.ts — physically-based recipes that read as EXPENSIVE.
   Rule: nothing in a hero shot is a default MeshStandardMaterial.
   Every surface needs roughness VARIATION (a map, noise or a gradient) — uniform roughness is what makes CG look like CG.
   All of these rely on scene.environment (ctx.env) for reflections: no env = no realism.
   ───────────────────────────────────────────────────────────── */

type Col = THREE.ColorRepresentation;

/** Mirror-polished metal. Dark base + env reflections = chrome. */
export const chrome = (color: Col = 0xdfe6ee, roughness = 0.08) =>
  new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness, envMapIntensity: 1.4, clearcoat: 0.3, clearcoatRoughness: 0.1 });

/** Piano-black lacquer with a razor clearcoat — the "luxury product" black. */
export const obsidian = (color: Col = 0x05060a) =>
  new THREE.MeshPhysicalMaterial({ color, metalness: 0.2, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.2, sheen: 0.4, sheenColor: new THREE.Color(0x6a7cff), sheenRoughness: 0.4 });

/** Thin-film iridescence (soap bubble / anodised titanium / oil slick). Great for hero objects. */
export const iridescent = (color: Col = 0x10131a) =>
  new THREE.MeshPhysicalMaterial({ color, metalness: 0.6, roughness: 0.18, iridescence: 1, iridescenceIOR: 1.6, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.5 });

/** Real refraction glass. transmission re-renders the scene behind it → EXPENSIVE: use on 1–3 hero meshes, gate on quality. */
export const glass = (tint: Col = 0xffffff, thickness = 1.2) =>
  new THREE.MeshPhysicalMaterial({ color: tint, metalness: 0, roughness: 0.04, transmission: 1, thickness, ior: 1.45, attenuationColor: new THREE.Color(tint), attenuationDistance: 3, envMapIntensity: 1.2, specularIntensity: 1, clearcoat: 1 });

/** A glowing surface. Intensity > 1 pushes it past the bloom threshold so it blooms. */
export const emissive = (color: Col, intensity = 2.5) => {
  const m = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: new THREE.Color(color), emissiveIntensity: intensity, roughness: 1 });
  m.toneMapped = true;
  return m;
};

/** Vertical (or horizontal) colour ramp as a texture — for skies, rim gradients, gradient maps. stops: [offset 0..1, css colour][] */
export function gradientTexture(stops: [number, string][], size = 256, vertical = true) {
  const c = document.createElement("canvas");
  c.width = vertical ? 2 : size; c.height = vertical ? size : 2;
  const ctx = c.getContext("2d")!;
  const g = vertical ? ctx.createLinearGradient(0, 0, 0, size) : ctx.createLinearGradient(0, 0, size, 0);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Tileable-ish value noise as a greyscale texture (roughness / bump / displacement for rock, skin, brushed metal). */
export function noiseTexture(size = 512, octaves = 5, seed = 1) {
  const data = new Uint8Array(size * size * 4);
  const rnd = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7 + seed * 17.3) * 43758.5453; return s - Math.floor(s); };
  const vnoise = (x: number, y: number, f: number) => {
    const xf = x * f, yf = y * f, xi = Math.floor(xf), yi = Math.floor(yf);
    const tx = xf - xi, ty = yf - yi, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const m = (a: number, b: number) => rnd(((a % f) + f) % f, ((b % f) + f) % f);
    const a = m(xi, yi), b = m(xi + 1, yi), c = m(xi, yi + 1), d = m(xi + 1, yi + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let v = 0, amp = 0.5, f = 4;
    for (let o = 0; o < octaves; o++) { v += vnoise(x / size, y / size, f) * amp; amp *= 0.5; f *= 2; }
    const i = (y * size + x) * 4;
    data[i] = data[i + 1] = data[i + 2] = Math.min(255, v * 255 * 1.15); data[i + 3] = 255;
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

/** The classic 3-point-plus-practical light rig, tuned for dark cinematic scenes. Returns the group so you can animate it. */
export function lightRig(o: { key?: Col; rim?: Col; fill?: Col; practical?: Col } = {}) {
  const g = new THREE.Group();
  const key = new THREE.DirectionalLight(o.key ?? 0xfff1e0, 2.4); key.position.set(4, 6, 5);
  const rim = new THREE.DirectionalLight(o.rim ?? 0x6fa8ff, 4); rim.position.set(-6, 3, -5); // the rim light is what makes shapes pop out of the dark
  const fill = new THREE.HemisphereLight(o.fill ?? 0x1a2440, 0x05060a, 0.8);
  const practical = new THREE.PointLight(o.practical ?? 0xff9a5c, 12, 14, 2); practical.position.set(1.5, 0.6, 2.5); // a warm "in-world" light source
  g.add(key, rim, fill, practical);
  return { group: g, key, rim, fill, practical };
}
