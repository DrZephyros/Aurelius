import { execFileSync } from "node:child_process";
import type { NextConfig } from "next";

/* Regenerates src/generated/* (template metrics + component registry index) on every dev start / build. */
try {
  execFileSync("node", ["scripts/generate.mjs"], { stdio: "inherit" });
} catch (e) {
  console.warn("[generate] failed", e);
}

const nextConfig: NextConfig = {};

export default nextConfig;
