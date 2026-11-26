import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   AURA · layers.ts — "2.5D": real parallax from IMAGES.
   This is how a solo agent gets a photoreal, AAA-looking world with no modelling:
     1. generate / source a hero image (see references/05-asset-pipeline.md)
     2. EITHER cut it into 4–7 transparent depth layers (createLayerStack)
        OR estimate a depth map from it and displace a dense plane (createDepthPlane)
     3. fly the camera rail through them — parallax + fog + particles in between = a 3D world.
   ───────────────────────────────────────────────────────────── */

const loader = new THREE.TextureLoader();

export function loadTexture(url: string, srgb = true): Promise<THREE.Texture> {
  return new Promise((res, rej) =>
    loader.load(
      url,
      (t) => {
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = 8;
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        res(t);
      },
      undefined,
      rej,
    ),
  );
}

export interface DepthPlaneOptions {
  colorUrl: string;
  /** greyscale depth map, white = near. (Depth Anything / MiDaS / Marigold output works as-is) */
  depthUrl: string;
  width: number;
  height: number;
  /** how far (world units) the nearest pixel pops toward the camera. 0.6–2.5 */
  depthScale?: number;
  segments?: number;
  /** multiplicative colour grade, e.g. [0.9,1,1.15] for a cold push */
  tint?: [number, number, number];
}

/** A dense plane whose vertices are pushed by a depth map. Orbit the camera ±15° and a flat picture becomes a diorama. */
export async function createDepthPlane(o: DepthPlaneOptions) {
  const [color, depth] = await Promise.all([loadTexture(o.colorUrl), loadTexture(o.depthUrl, false)]);
  const seg = o.segments ?? 200;
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color },
      uDepth: { value: depth },
      uScale: { value: o.depthScale ?? 1.4 },
      uTint: { value: new THREE.Vector3(...(o.tint ?? [1, 1, 1])) },
      uBreath: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform sampler2D uDepth; uniform float uScale, uBreath; varying vec2 vUv;
      void main(){
        vUv = uv;
        float d = texture2D(uDepth, uv).r;
        vec3 p = position; p.z += (d - .5) * uScale * (1. + uBreath * .15);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uColor; uniform vec3 uTint; varying vec2 vUv;
      void main(){ gl_FragColor = vec4(texture2D(uColor, vUv).rgb * uTint, 1.); }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(o.width, o.height, seg, Math.round(seg * (o.height / o.width))), mat);
  return { mesh, material: mat };
}

export interface LayerSpec {
  url: string;
  /** world-space z (camera looks down -z, so more negative = further away) */
  z: number;
  width: number;
  height: number;
  y?: number;
  x?: number;
  opacity?: number;
  /** let scene fog tint this layer (distant layers should be hazier) */
  fog?: boolean;
}

/** Stack of transparent PNG layers at different depths — mountains, mid-ground, subject, foreground fronds… */
export async function createLayerStack(specs: LayerSpec[]) {
  const group = new THREE.Group();
  const meshes = await Promise.all(
    specs.map(async (s) => {
      const map = await loadTexture(s.url);
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(s.width, s.height),
        new THREE.MeshBasicMaterial({ map, transparent: true, opacity: s.opacity ?? 1, depthWrite: false, fog: s.fog ?? true }),
      );
      m.position.set(s.x ?? 0, s.y ?? 0, s.z);
      m.renderOrder = Math.round(-s.z); // far → near
      group.add(m);
      return m;
    }),
  );
  return { group, meshes };
}
