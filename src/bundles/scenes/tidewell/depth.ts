import { clamp, smoothstep } from "./choreo";

/* One source of truth for the descent, shared by the 3D scene and the DOM readouts.
   The playhead p ∈ [0,1] IS the depth: 0 m at the surface, 300 m (the watch's rating) on the final frame.
   Each of the dial's 60 minute markers is worth 5 m — so the lit ring is literally a depth gauge. */

export const MAX_DEPTH = 300;
export const TICKS = 60;

export const depthAt = (p: number) => clamp(p) * MAX_DEPTH;

/** surface light that is still reaching the camera: 1 at the surface → 0 by ~80% of the descent.
 *  The exponent keeps a long, quiet tail instead of a linear dimmer switch. */
export const lightAt = (p: number) => {
  const t = smoothstep(0.02, 0.8, p);
  return Math.pow(1 - t, 1.6);
};

/** 0 → 1: how far the lume has charged = the share of the 60 markers that are lit. */
export const fillAt = (p: number) => clamp(p);
