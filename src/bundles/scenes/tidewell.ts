// Tidewell bundle scene: adapts the AURA v17 Tidewell scene to the bundle Builder contract.
import type * as THREE from "three";
import type { Builder } from "../engine";
import { tidewell } from "./tidewell/scene";
import type { Shot } from "./tidewell/types";

const toRail = (shots: Shot[]) => ({ pos: shots.map((s) => s.pos), look: shots.map((s) => s.look) });

export const buildTidewell: Builder = ({ renderer, mobile }) => {
  const ctx = { renderer, mobile, portrait: false, coarse: mobile, tier: mobile ? "mid" : "high", reduced: false, quality: 1 } as const;
  const s = tidewell(ctx as Parameters<typeof tidewell>[0]);
  const shots = mobile && s.shotsMobile ? s.shotsMobile : s.shots;
  const bloom = s.bloom ?? { strength: 0.4, radius: 0.6, threshold: 0.92 };
  return {
    scene: s.scene,
    rail: toRail(shots),
    bloom: [bloom.strength, bloom.radius, bloom.threshold],
    exposure: s.exposure ?? 1,
    fov: s.fov ?? 34,
    parallax: s.parallax,
    update(t: number, p: number, dt: number, cam: THREE.PerspectiveCamera) {
      s.update({ time: t, dt, p, velocity: 0, pointer: { x: 0, y: 0 }, camera: cam, quality: 1, reduced: false });
    },
    dispose: s.dispose,
  };
};
