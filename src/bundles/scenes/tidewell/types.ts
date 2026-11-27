// Minimal AURA shot/frame types used by the Tidewell scene (ported from the AURA v17 engine).
import type * as THREE from "three";

export type V3 = [number, number, number];

export type Shot = { at: number; pos: V3; look: V3; fov?: number; roll?: number; ease?: unknown };

export interface Frame {
  time: number;
  dt: number;
  p: number;
  velocity: number;
  pointer: { x: number; y: number };
  camera: THREE.PerspectiveCamera;
  quality: number;
  reduced: boolean;
}

export interface BuildContext {
  renderer: THREE.WebGLRenderer;
  mobile: boolean;
  portrait: boolean;
  coarse: boolean;
  tier: "low" | "mid" | "high";
  reduced: boolean;
  quality: number;
}

export interface AuraScene {
  scene: THREE.Scene;
  shots: Shot[];
  shotsMobile?: Shot[];
  fov?: number;
  exposure?: number;
  bloom?: { strength: number; radius: number; threshold: number };
  parallax?: number;
  portraitFit?: number;
  portraitLift?: number;
  grade?: unknown;
  update(f: Frame): void;
  dispose?(): void;
}
