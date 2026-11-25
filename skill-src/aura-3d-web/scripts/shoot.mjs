// AURA · screenshot loop.  npm i -D playwright && npx playwright install chromium
// usage: node scripts/shoot.mjs http://localhost:5173
// Captures 12 scroll positions × 3 viewports into ./shots and prints console errors. THEN OPEN THE IMAGES AND CRITIQUE THEM.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:5173";
const sizes = [
  { w: 1440, h: 900, n: "desktop" },
  { w: 390, h: 844, n: "mobile" },
  { w: 1920, h: 1080, n: "wide" },
];
const stops = [0, 0.04, 0.12, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
mkdirSync("shots", { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"],
});
for (const s of sizes) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
  const logs = [];
  page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(m.text()));
  page.on("pageerror", (e) => logs.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000); // loader + first compile
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const p of stops) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * p));
    await page.waitForTimeout(1800); // let the damped playhead settle
    await page.screenshot({ path: `shots/${s.n}-${String(Math.round(p * 100)).padStart(3, "0")}.png` });
  }
  console.log(s.n, "console issues:", logs.slice(0, 8));
  await page.close();
}
await browser.close();
console.log("done → ./shots  (now look at them like a harsh art director)");
