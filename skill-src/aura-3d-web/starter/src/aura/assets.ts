import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/* ─────────────────────────────────────────────────────────────
   AURA · assets.ts — load compressed GLB models.
   Compress BEFORE shipping (see references/05-asset-pipeline.md):
     npx gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp
   Budget: hero model ≤ 3 MB, whole experience ≤ 12 MB on first load (stream the rest after the intro).
   ───────────────────────────────────────────────────────────── */

let gltf: GLTFLoader | null = null;
function loader() {
  if (gltf) return gltf;
  const draco = new DRACOLoader().setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
  gltf = new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);
  return gltf;
}

export const loadGLB = (url: string): Promise<GLTF> => loader().loadAsync(url);

/** Centre a model on the origin and scale it so its largest dimension equals `size` world units. */
export function fitModel(obj: THREE.Object3D, size = 2) {
  const box = new THREE.Box3().setFromObject(obj);
  const c = box.getCenter(new THREE.Vector3());
  const s = size / Math.max(...box.getSize(new THREE.Vector3()).toArray());
  obj.position.sub(c);
  const wrap = new THREE.Group();
  wrap.add(obj);
  wrap.scale.setScalar(s);
  return wrap;
}

/** Give every mesh in a loaded model correct env intensity + shadow flags in one call. */
export function prepModel(obj: THREE.Object3D, envIntensity = 1.2) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.castShadow = m.receiveShadow = true;
    const mat = m.material as THREE.MeshStandardMaterial;
    if (mat && "envMapIntensity" in mat) mat.envMapIntensity = envIntensity;
  });
}
