#!/usr/bin/env node
/* AURA · setup.mjs — one command, no thinking:   npm ci && npm run setup
   Makes the audit runnable on a fresh machine: checks Node, installs Chromium, proves it can launch (software GL), and — if it cannot —
   prints the ONE command that fixes it (system libraries). Safe to re-run. */
import { execSync } from "node:child_process";
const run = (c) => execSync(c, { stdio: "inherit" });
const major = Number(process.versions.node.split(".")[0]);
if (major < 18) { console.error(`✖ Node ${process.versions.node} is too old — AURA needs Node ≥ 18.18 (20+ recommended).`); process.exit(1); }
console.log("→ installing Chromium for the audit (≈130 MB, once)…");
try { run("npx playwright install chromium"); } catch { console.error("✖ playwright install failed — check the network / proxy, then re-run npm run setup"); process.exit(1); }
const { chromium } = await import("playwright");
try {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"], executablePath: process.env.AURA_CHROME || undefined });
  const pg = await b.newPage(); const gl = await pg.evaluate(() => !!document.createElement("canvas").getContext("webgl2"));
  await b.close();
  console.log(gl ? "✔ Chromium launches and WebGL2 works (software GL: real pixels, meaningless FPS). Next: npm run build && npm run audit:fast" : "⚠ Chromium launches but WebGL2 is unavailable — the audit will report no-engine. Try AURA_CHROME=/path/to/chrome or --gpu.");
} catch (e) {
  console.error("✖ Chromium is installed but cannot start:\n  " + String(e.message).split("\n")[0]);
  console.error("\n  Missing system libraries (Linux) → run ONE of:\n    sudo npx playwright install-deps chromium\n    sudo apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2\n  No root? Point at any Chrome:  AURA_CHROME=/usr/bin/google-chrome npm run audit:fast");
  process.exit(1);
}
