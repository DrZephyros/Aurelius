import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Builder } from "../engine";
import { particleField, skyDome } from "./util";

/* HELM — a precision navigation instrument, built big enough to fly through.
   The dial's heading is a pure function of scroll progress (exported below) so the HTML HUD can mirror it. */

export const helmHeading = (p: number) => (67 + p * 640) % 360;
const BEARINGS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
export const bearingName = (h: number) => BEARINGS[Math.round(h / 22.5) % 16];

const AMBER = new THREE.Color(1, 0.62, 0.22);

function dialTexture() {
  const S = 2048, c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.translate(S / 2, S / 2);
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (let d = 0; d < 360; d += 30) {
    const card = d % 90 === 0;
    g.save();
    g.rotate((d * Math.PI) / 180);
    g.translate(0, -S * 0.355);
    g.fillStyle = d === 0 ? "#ffb35c" : "#efe6d2";
    g.font = `600 ${card ? 190 : 84}px "Space Grotesk Variable","Inter Variable",sans-serif`;
    g.fillText(card ? "NESW"[d / 90] : String(d), 0, 0);
    g.restore();
  }
  g.strokeStyle = "rgba(239,230,210,.16)";
  g.lineWidth = 3;
  for (const r of [0.2, 0.28, 0.455]) { g.beginPath(); g.arc(0, 0, S * r, 0, Math.PI * 2); g.stroke(); }
  for (let d = 0; d < 360; d += 90) { g.save(); g.rotate((d * Math.PI) / 180); g.beginPath(); g.moveTo(0, -S * 0.2); g.lineTo(0, -S * 0.28); g.stroke(); g.restore(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function glowTexture(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, `rgba(${rgb},.55)`);
  r.addColorStop(0.5, `rgba(${rgb},.12)`);
  r.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const buildHelm: Builder = ({ renderer, mobile }) => {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x041019, 0.006);
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.75;
  pm.dispose();

  const sky = skyDome({ top: "#010409", mid: "#06182a", bottom: "#0d3043" });
  scene.add(sky);

  scene.add(new THREE.AmbientLight(0x6f8fb0, 0.8));
  const key = new THREE.DirectionalLight(0xffb070, 2.8); key.position.set(-22, 16, 24); scene.add(key);
  const rim = new THREE.DirectionalLight(0x3de7ff, 2.4); rim.position.set(24, -8, 8); scene.add(rim);
  const top = new THREE.PointLight(0xffd6a0, 260, 70, 2); top.position.set(0, 18, 14); scene.add(top);

  const dial = new THREE.Group();
  scene.add(dial);

  /* rotating compass card */
  const plate = new THREE.Group();
  dial.add(plate);
  const faceMat = new THREE.MeshStandardMaterial({ color: 0x10293a, metalness: 0.5, roughness: 0.42 });
  const face = new THREE.Mesh(new THREE.CylinderGeometry(9.2, 9.2, 0.5, 120).rotateX(Math.PI / 2), faceMat);
  plate.add(face);
  const marks = new THREE.Mesh(new THREE.PlaneGeometry(18.4, 18.4), new THREE.MeshBasicMaterial({ map: dialTexture(), transparent: true, toneMapped: false }));
  marks.position.z = 0.27;
  plate.add(marks);

  // 360 ticks, lit amber behind the heading like a sweeping gauge
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 1, 0.14), new THREE.MeshBasicMaterial({ toneMapped: false }), 360);
  const dm = new THREE.Object3D(), tc = new THREE.Color();
  for (let i = 0; i < 360; i++) {
    const a = (i * Math.PI) / 180, len = i % 30 === 0 ? 1.5 : i % 10 === 0 ? 1.05 : i % 5 === 0 ? 0.75 : 0.45;
    dm.position.set(Math.sin(a) * 8.45, Math.cos(a) * 8.45, 0.3);
    dm.rotation.set(0, 0, -a);
    dm.scale.set(1, len, 1);
    dm.updateMatrix();
    ticks.setMatrixAt(i, dm.matrix);
    ticks.setColorAt(i, tc.set(0x24313c));
  }
  plate.add(ticks);
  let lastHead = -1;
  const paintTicks = (h: number) => {
    for (let i = 0; i < 360; i++) {
      const diff = (h - i + 360) % 360, k = diff < 110 ? Math.pow(1 - diff / 110, 1.6) : 0;
      tc.setRGB(0.14 + AMBER.r * k * 2.4, 0.19 + AMBER.g * k * 2.4, 0.24 + AMBER.b * k * 2.4);
      if (diff < 1.2) tc.setRGB(3.4, 2.7, 1.8);
      ticks.setColorAt(i, tc);
    }
    ticks.instanceColor!.needsUpdate = true;
  };

  /* fixed bezel, glass, sweep arc, lubber marker */
  const metal = new THREE.MeshStandardMaterial({ color: 0x9aa1ab, metalness: 1, roughness: 0.22 });
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(9.9, 0.46, 36, 180), metal);
  dial.add(bezel);
  const inner = new THREE.Mesh(new THREE.TorusGeometry(9.3, 0.12, 20, 160), new THREE.MeshStandardMaterial({ color: 0x1a2229, metalness: 1, roughness: 0.35 }));
  inner.position.z = 0.15;
  dial.add(inner);
  const grip = new THREE.Mesh(new THREE.TorusGeometry(10.5, 0.2, 14, 220), new THREE.MeshStandardMaterial({ color: 0x20262d, metalness: 0.9, roughness: 0.55 }));
  dial.add(grip);

  const arcMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uHead: { value: 0 }, uTime: { value: 0 } },
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `varying vec2 vP; uniform float uHead, uTime;
      void main(){
        float a = atan(vP.x, vP.y); if (a < 0.) a += 6.28318;
        float diff = mod(uHead - a, 6.28318);
        float g = exp(-diff * 1.9) * step(diff, 5.2);
        float head = exp(-diff * diff * 900.);
        vec3 col = mix(vec3(1., .5, .16), vec3(1., .9, .7), head);
        float base = .07 + .03 * sin(a * 90.);
        gl_FragColor = vec4(col * (g * 2.6 + head * 4.) + vec3(.12, .5, .6) * base, max(g, base) + head);
      }`,
  });
  const arc = new THREE.Mesh(new THREE.RingGeometry(10.75, 11.2, 220, 1), arcMat);
  arc.position.z = 0.1;
  dial.add(arc);
  const outer = new THREE.Mesh(new THREE.TorusGeometry(12.6, 0.025, 6, 260), new THREE.MeshBasicMaterial({ color: 0x3de7ff, transparent: true, opacity: 0.35, toneMapped: false }));
  dial.add(outer);

  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(9.3, 80),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.07, roughness: 0.02, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, depthWrite: false })
  );
  glass.position.z = 1.1;
  dial.add(glass);

  const lub = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.95, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.5, 0.5), toneMapped: false }));
  lub.rotation.z = Math.PI;
  lub.position.set(0, 9.45, 0.6);
  dial.add(lub);

  /* centre boss with a live readout */
  const boss = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.7, 1.2, 80).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x151b22, metalness: 1, roughness: 0.18 }));
  boss.position.z = 0.75;
  dial.add(boss);
  const rc = document.createElement("canvas");
  rc.width = rc.height = 512;
  const rg = rc.getContext("2d")!;
  const rt = new THREE.CanvasTexture(rc);
  rt.colorSpace = THREE.SRGBColorSpace;
  const readout = new THREE.Mesh(new THREE.CircleGeometry(3.15, 64), new THREE.MeshBasicMaterial({ map: rt, toneMapped: false }));
  readout.position.z = 1.4;
  dial.add(readout);
  let lastInt = -1;
  const paintReadout = (h: number) => {
    const n = Math.round(h) % 360;
    if (n === lastInt) return;
    lastInt = n;
    rg.clearRect(0, 0, 512, 512);
    const bg = rg.createRadialGradient(256, 256, 20, 256, 256, 256);
    bg.addColorStop(0, "#14232f"); bg.addColorStop(1, "#070d13");
    rg.fillStyle = bg; rg.fillRect(0, 0, 512, 512);
    rg.textAlign = "center"; rg.textBaseline = "middle";
    rg.fillStyle = "#7f93a4"; rg.font = '500 30px "JetBrains Mono",monospace';
    rg.fillText("H E A D I N G", 256, 150);
    rg.fillStyle = "#fff4e2"; rg.font = '600 150px "Space Grotesk Variable","Inter Variable",sans-serif';
    rg.fillText(String(n).padStart(3, "0") + "°", 256, 262);
    rg.fillStyle = "#ffb35c"; rg.font = '500 38px "JetBrains Mono",monospace';
    rg.fillText(bearingName(n), 256, 360);
    rt.needsUpdate = true;
  };

  /* atmosphere: soft glows, bokeh, dust */
  const g1 = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshBasicMaterial({ map: glowTexture("61,231,255"), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.3, fog: false }));
  g1.position.set(10, -4, -14);
  const g2 = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({ map: glowTexture("255,150,60"), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.22, fog: false }));
  g2.position.set(-18, 8, -10);
  scene.add(g1, g2);
  const bokeh = particleField({ count: mobile ? 70 : 140, box: [110, 70, 110], color: "#ffb060", colorB: "#3de7ff", size: 16, fall: [0, 0.12, 0], sway: 2.4, opacity: 0.32, seed: 21 });
  const dust = particleField({ count: mobile ? 260 : 520, box: [50, 36, 60], color: "#d8ecff", size: 2.2, fall: [0.05, 0.1, 0], sway: 0.8, opacity: 0.55, seed: 4 });
  scene.add(bokeh.object, dust.object);

  /* rail: hero → orbit → macro on the ticks → pull-back → dive under → reveal */
  const keys: [number[], number[]][] = [
    [[0, 0.5, 31], [0, 0, 0]],
    [[-14, 3, 27], [0, 0, 0]],
    [[-6.5, 7.5, 13.5], [1.5, 2.5, 0]],
    [[11, -2, 18], [0, 0, 0]],
    [[15, 5.5, 10.5], [-1.5, 0, 0]],
    [[2, -12, 22], [0, 1.5, 0]],
    [[0, -0.5, 42], [0, 0, 0]],
  ];

  return {
    scene,
    rail: { pos: keys.map((k) => k[0]), look: keys.map((k) => k[1]) },
    bloom: [0.55, 0.6, 0.85],
    exposure: 1.0,
    fov: 44,
    parallax: 1.6,
    update(t, p, _dt, cam) {
      const h = helmHeading(p);
      plate.rotation.z = (h * Math.PI) / 180;
      if (Math.abs(h - lastHead) > 0.15) { paintTicks(h); lastHead = h; }
      paintReadout(h);
      arcMat.uniforms.uHead.value = 0; // the arc is fixed to the lubber line; the card turns beneath it
      arcMat.uniforms.uTime.value = t;
      dial.rotation.y = Math.sin(p * Math.PI * 2) * 0.22 + Math.sin(t * 0.3) * 0.02;
      dial.rotation.x = Math.cos(p * Math.PI * 1.5) * 0.08;
      sky.position.copy(cam.position);
      bokeh.update(t, cam);
      dust.update(t, cam);
    },
    dispose() { env.dispose(); },
  };
};
