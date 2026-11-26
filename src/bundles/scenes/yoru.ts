import * as THREE from "three";
import type { Builder } from "../engine";
import { clamp, fbm, particleField, rng, skyDome, smooth } from "./util";

/* YORU — a night shrine. A long stone stair climbs through five torii gates under a blood moon;
   petals fall through lantern light and the camera finally rises over the temple roofs. */

const STEP_RUN = 0.82, STEP_RISE = 0.22, STEPS = 112;
const TOP = STEPS * STEP_RISE; // 24.64
const stairY = (z: number) => (z > 0 ? 0 : Math.min(TOP, -z * (STEP_RISE / STEP_RUN)));

function groundY(x: number, z: number) {
  const base = stairY(z) - 0.9;
  const side = smooth(5, 15, Math.abs(x));
  const hills = (fbm(x * 0.045, z * 0.045, 4) - 0.38) * 20 * side + side * 2.5;
  return base + hills;
}

const glowTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,200,130,1)");
  r.addColorStop(0.25, "rgba(255,150,70,.45)");
  r.addColorStop(1, "rgba(255,120,40,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const buildYoru: Builder = ({ mobile }) => {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1e0b1c, mobile ? 0.0075 : 0.006);
  const R = rng(11);
  const dummy = new THREE.Object3D();

  /* sky: moon over a bruised horizon */
  const sky = skyDome({ top: "#05030c", mid: "#2a0c22", bottom: "#5a1624", sun: { dir: [0.12, 0.4, -1], color: "#ff5e48", size: 0.07, halo: 0.34, craters: true } });
  scene.add(sky);

  /* light */
  scene.add(new THREE.HemisphereLight(0x7a5aa8, 0x2a1220, 1.7));
  const moonLight = new THREE.DirectionalLight(0xff7a62, 1.6);
  moonLight.position.set(14, 70, -180);
  scene.add(moonLight);
  const lantern = new THREE.PointLight(0xffa968, 55, 40, 1.8);
  scene.add(lantern);

  /* far ridges — unlit, pre-hazed so they hold their shape in the fog */
  [[-260, "#3a1536", 26, 0.9], [-340, "#2b1032", 34, 1.3], [-430, "#1d0c2a", 42, 0.7]].forEach(([z, col, hgt, f]) => {
    const g = new THREE.PlaneGeometry(1500, 1, 150, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setY(i, p.getY(i) < 0 ? -2 : -2 + (0.25 + fbm(x * 0.006 * (f as number) + (z as number), 3, 5)) * (hgt as number) * 1.2);
    }
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col as string, fog: false }));
    m.position.set(0, -4, z as number);
    scene.add(m);
  });

  /* hillside */
  {
    const g = new THREE.PlaneGeometry(260, 380, mobile ? 70 : 100, mobile ? 100 : 140);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i) - 80;
      const y = groundY(x, z);
      p.setY(i, y);
      const k = 0.5 + fbm(x * 0.2, z * 0.2, 2) * 0.8;
      col[i * 3] = 0.06 * k + 0.02; col[i * 3 + 1] = 0.035 * k; col[i * 3 + 2] = 0.07 * k + 0.01;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
    m.position.z = -80;
    scene.add(m);
  }

  /* the stair */
  {
    const stone = new THREE.MeshStandardMaterial({ color: 0x3a3340, roughness: 0.92 });
    const steps = new THREE.InstancedMesh(new THREE.BoxGeometry(7.6, 2, STEP_RUN + 0.02), stone, STEPS);
    for (let i = 0; i < STEPS; i++) {
      dummy.position.set(0, (i + 1) * STEP_RISE - 1, -i * STEP_RUN);
      dummy.updateMatrix();
      steps.setMatrixAt(i, dummy.matrix);
    }
    scene.add(steps);
    // low stone cheeks on both sides
    for (const s of [-1, 1]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, STEPS * STEP_RUN), new THREE.MeshStandardMaterial({ color: 0x2b2531, roughness: 0.95 }));
      wall.rotation.x = Math.atan2(STEP_RISE, STEP_RUN);
      wall.position.set(s * 3.95, TOP / 2 + 0.2, -(STEPS * STEP_RUN) / 2);
      wall.scale.z = 1 / Math.cos(Math.atan2(STEP_RISE, STEP_RUN));
      scene.add(wall);
    }
  }

  /* stone lanterns with glowing hearts */
  const halo = glowTexture();
  const halos: THREE.Sprite[] = [];
  {
    const ids: number[] = [];
    for (let i = 6; i < STEPS - 4; i += 5) ids.push(i);
    const n = ids.length * 2;
    const post = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 1.5, 0.42), new THREE.MeshStandardMaterial({ color: 0x2f2833, roughness: 0.9 }), n);
    const cap = new THREE.InstancedMesh(new THREE.BoxGeometry(0.95, 0.22, 0.95), new THREE.MeshStandardMaterial({ color: 0x2f2833, roughness: 0.9 }), n);
    const heart = new THREE.InstancedMesh(new THREE.BoxGeometry(0.46, 0.52, 0.46), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.8, 0.7) }), n);
    let k = 0;
    for (const i of ids) for (const s of [-1, 1]) {
      const x = s * 4.5, z = -i * STEP_RUN, y = (i + 1) * STEP_RISE;
      dummy.position.set(x, y + 0.75, z); dummy.updateMatrix(); post.setMatrixAt(k, dummy.matrix);
      dummy.position.set(x, y + 1.88, z); dummy.updateMatrix(); cap.setMatrixAt(k, dummy.matrix);
      dummy.position.set(x, y + 1.52, z); dummy.updateMatrix(); heart.setMatrixAt(k, dummy.matrix);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 }));
      sp.position.set(x, y + 1.52, z);
      sp.scale.setScalar(3.2);
      scene.add(sp);
      halos.push(sp);
      k++;
    }
    scene.add(post, cap, heart);
  }

  /* torii */
  {
    const red = new THREE.MeshStandardMaterial({ color: 0xc3171f, emissive: 0x4d0508, roughness: 0.5 });
    const black = new THREE.MeshStandardMaterial({ color: 0x120a0c, roughness: 0.6 });
    const pillar = new THREE.CylinderGeometry(0.3, 0.36, 6.8, 14);
    const gate = (scale: number) => {
      const g = new THREE.Group();
      for (const s of [-1, 1]) { const p = new THREE.Mesh(pillar, red); p.position.set(s * 2.75, 3.4, 0); g.add(p); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.5, 14), black); b.position.set(s * 2.75, 0.25, 0); g.add(b); }
      const nuki = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.3, 0.42), red); nuki.position.y = 5.15; g.add(nuki);
      const shimaki = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.26, 0.62), black); shimaki.position.y = 6.78; g.add(shimaki);
      const kasagi = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.44, 0.9), red); kasagi.position.y = 7.1; g.add(kasagi);
      for (const s of [-1, 1]) { const tip = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.44, 0.9), red); tip.position.set(s * 4.9, 7.3, 0); tip.rotation.z = s * -0.25; g.add(tip); }
      const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.05, 0.2), black); plaque.position.y = 5.95; g.add(plaque);
      g.scale.setScalar(scale);
      return g;
    };
    [12, 32, 52, 72, 92].forEach((i, n) => {
      const g = gate(1 + n * 0.06);
      g.position.set(0, (i + 1) * STEP_RISE, -i * STEP_RUN);
      scene.add(g);
    });
  }

  /* pines + blossoms */
  {
    const pines = new THREE.InstancedMesh(new THREE.ConeGeometry(2.1, 1, 7), new THREE.MeshStandardMaterial({ color: 0x0b0a14, roughness: 1 }), 320);
    for (let i = 0; i < 320; i++) {
      const s = R() < 0.5 ? -1 : 1, x = s * (9.5 + R() * 40), z = 40 - R() * 200, h = 7 + R() * 9;
      dummy.position.set(x, groundY(x, z) + h / 2 - 0.4, z);
      dummy.scale.set(0.8 + R() * 0.9, h, 0.8 + R() * 0.9);
      dummy.rotation.set(0, R() * 6, 0);
      dummy.updateMatrix();
      pines.setMatrixAt(i, dummy.matrix);
    }
    scene.add(pines);
    dummy.rotation.set(0, 0, 0);

    const NT = 40;
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.24, 3.4, 6), new THREE.MeshStandardMaterial({ color: 0x24101a, roughness: 1 }), NT);
    const bloom = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xff9ab8, emissive: 0xff3f7e, emissiveIntensity: 0.42, roughness: 0.9 }), NT * 3);
    for (let i = 0; i < NT; i++) {
      const s = i % 2 ? -1 : 1, x = s * (6.8 + R() * 5), z = -4 - (i / NT) * 98 - R() * 3, gy = (-z * 0.268 > TOP ? TOP : -z * 0.268) - 0.7;
      dummy.scale.set(1, 1, 1); dummy.position.set(x, gy + 1.7, z); dummy.updateMatrix(); trunk.setMatrixAt(i, dummy.matrix);
      for (let j = 0; j < 3; j++) {
        dummy.position.set(x + (R() - 0.5) * 2.2, gy + 3.6 + R() * 1.4, z + (R() - 0.5) * 2.2);
        dummy.scale.setScalar(1.5 + R() * 1.2);
        dummy.updateMatrix();
        bloom.setMatrixAt(i * 3 + j, dummy.matrix);
      }
    }
    scene.add(trunk, bloom);
  }

  /* the temple on the summit */
  {
    const wood = new THREE.MeshStandardMaterial({ color: 0x1c1114, roughness: 0.8 });
    const roofM = new THREE.MeshStandardMaterial({ color: 0x0f0a10, roughness: 0.55, emissive: 0x2a0509, emissiveIntensity: 0.6 });
    const warm = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.7, 0.7) });
    const gold = new THREE.MeshStandardMaterial({ color: 0xffc46b, emissive: 0xffa13a, emissiveIntensity: 0.8, metalness: 0.8, roughness: 0.3 });
    const base = TOP + 0.2;
    const plat = new THREE.Mesh(new THREE.BoxGeometry(42, 1.6, 22), new THREE.MeshStandardMaterial({ color: 0x2c2530, roughness: 0.95 }));
    plat.position.set(0, base - 0.8, -102);
    scene.add(plat);
    const hall = (x: number, z: number, w: number, d: number, h: number, tiers: number) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wood); body.position.y = h / 2; g.add(body);
      for (let c = 0; c < Math.floor(w / 2.6); c++) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.7, 0.1), warm);
        win.position.set(-w / 2 + 1.7 + c * 2.6, h * 0.55, d / 2 + 0.06); g.add(win);
      }
      let y = h, rw = w, rd = d;
      for (let t = 0; t < tiers; t++) {
        const r = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4), roofM);
        r.rotation.y = Math.PI / 4;
        r.scale.set(rw * 0.88, 2.5 - t * 0.3, rd * 0.88);
        r.position.y = y + (2.5 - t * 0.3) / 2 - 0.2; g.add(r);
        y += 2.2 - t * 0.2;
        rw *= 0.62; rd *= 0.62;
        if (t < tiers - 1) { const up = new THREE.Mesh(new THREE.BoxGeometry(rw, 2.4, rd), wood); up.position.y = y + 0.9; g.add(up); y += 1.8; }
      }
      const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 2.4, 8), gold); fin.position.y = y + 1.2; g.add(fin);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), gold); orb.position.y = y + 2.5; g.add(orb);
      g.position.set(x, base, z);
      return g;
    };
    scene.add(hall(0, -104, 15, 8.4, 5.2, 2), hall(-17, -99, 8, 6, 3.8, 1), hall(17, -99, 8, 6, 3.8, 1));
    // glowing doorway
    const door = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.8), warm);
    door.position.set(0, base + 2, -104 + 4.25);
    scene.add(door);
    const dh = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 }));
    dh.position.set(0, base + 2.2, -99); dh.scale.setScalar(16);
    scene.add(dh);
  }

  const petals = particleField({ count: mobile ? 500 : 950, box: [60, 40, 90], color: "#ff9ab8", colorB: "#ffd5e0", size: 3.6, fall: [0.35, -0.95, 0.25], sway: 1.3, opacity: 0.95, seed: 3 });
  const embers = particleField({ count: mobile ? 140 : 280, box: [50, 34, 80], color: "#ffa24d", colorB: "#ff6a3a", size: 2.4, fall: [0, 0.7, 0], sway: 1.6, opacity: 0.9, seed: 9 });
  scene.add(petals.object, embers.object);

  /* camera rail — it walks the stair gate by gate */
  const ahead = (x: number, z: number, eye: number, L = 42): [number[], number[]] => [
    [x, Math.max(1.7, stairY(z)) + eye, z],
    [x * 0.3, stairY(z - L) + 5, z - L],
  ];
  const keys: [number[], number[]][] = [
    ahead(0, 34, 1.7, 70),
    ahead(0, 12, 1.9, 60),
    ahead(0.4, -10.5, 2.2),
    ahead(-0.8, -27, 2.4),
    ahead(0.6, -44, 2.2),
    ahead(0, -61, 2.4),
    ahead(0, -76, 2.2, 36),
    [[0, TOP + 2.6, -86], [0, TOP + 3.4, -110]],
    [[-9, TOP + 7.5, -86], [3, TOP + 14, -150]],
  ];
  keys[0][1][1] = 20;

  const tmp = new THREE.Vector3();
  return {
    scene,
    rail: { pos: keys.map((k) => k[0]), look: keys.map((k) => k[1]) },
    bloom: [0.5, 0.6, 0.45],
    exposure: 1.45,
    fov: 56,
    parallax: 1.2,
    update(t, p, _dt, cam) {
      sky.position.copy(cam.position);
      (sky.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      petals.update(t, cam);
      embers.update(t, cam);
      cam.getWorldDirection(tmp);
      lantern.position.copy(cam.position).addScaledVector(tmp, 3).add(new THREE.Vector3(0, 1.2, 0));
      lantern.intensity = 50 + Math.sin(t * 7) * 4 + Math.sin(t * 13.3) * 3;
      halos.forEach((h, i) => { const d = h.position.distanceTo(cam.position); (h.material as THREE.SpriteMaterial).opacity = (0.5 + Math.sin(t * 3 + i * 1.7) * 0.1) * smooth(3, 16, d); });
      moonLight.intensity = 1.2 + 0.8 * clamp(p * 1.4);
    },
  };
};
