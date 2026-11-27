#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────────
   AURA · audit.mjs — the QA gate an agent can actually run.

   npm i -D playwright pngjs && npx playwright install chromium
   node scripts/audit.mjs http://localhost:5173 [--out shots] [--stops 14] [--gpu] [--only desktop,mobile] [--quick] [--scale 0.5] [--timeout 120000]

   What it does (deterministically — it uses window.__aura.seek(p), not scroll timing):
     1. loads the page at 5 viewports: desktop 1440×900 · wide 1920×1080 · MOBILE 390×844 (real touch emulation: coarse pointer, isMobile) · small phone 360×640 · landscape phone 844×390
     2. seeks the playhead to N stops, screenshots each, and MEASURES every frame
        (luminance, contrast, blown highlights, crushed blacks, edge energy, frame-to-frame change)
     3. MEASURES LEGIBILITY AND TOUCH: min font size, WCAG contrast of every text run against the frame rendered WITHOUT the copy, 44px tap targets, CTA wrapping, horizontal overflow, mobile draw-call/triangle budget, portrait rail present, and that a real scroll drives the playhead
     3b. reads the DOM chapters at every stop → copy that collides, copy that leaves the viewport,
        an empty opening frame, an empty / CTA-less closing frame
     4. lints the shot list (covers 0→1, has a HOLD, wide/close alternation, no teleports)
     5. reloads with WebGL disabled and with prefers-reduced-motion → proves the fallbacks
     6. writes  <out>/REPORT.md  <out>/report.json  <out>/contact-<viewport>.png  and exits 1 if it finds BLOCKERS.

   It cannot judge taste. After it passes, OPEN contact-desktop.png and critique it like an art director (references/08).
   NOTE: software GL (no --gpu) gives real pixels but meaningless FPS — only trust fps with --gpu on a real machine.
   ───────────────────────────────────────────────────────────────────────────── */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { mkdirSync, writeFileSync } from "node:fs";

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i < 0 ? d : argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true; };
const url = argv.find((a) => /^https?:/.test(a)) ?? "http://localhost:5173";
const out = flag("out", "shots");
const N = Number(flag("stops", 14));
const gpu = !!flag("gpu", false);
const only = flag("only", null);
// --scale 0.5 halves every viewport (4× faster on software GL); --timeout raises the per-action limit for slow machines
const SCALE = Number(flag("scale", 1));
const TIMEOUT = Number(flag("timeout", 120000));
const quick = !!flag("quick", false);
const ALL_VP = [
  { n: "desktop", w: 1440, h: 900, touch: false, N }, { n: "mobile", w: 390, h: 844, touch: true, N }, { n: "wide", w: 1920, h: 1080, touch: false, N },
  { n: "small", w: 360, h: 640, touch: true, N: Math.min(N, 7) }, { n: "landscape", w: 844, h: 390, touch: true, N: Math.min(N, 7) },
];
const onlySet = typeof only === "string" ? only.split(",") : null; // --only desktop,mobile
// --scale shrinks desktop-type viewports only (software GL is slow); touch viewports ALWAYS run at true phone size — their pixels are the thing under test
const VIEWPORTS = ALL_VP.filter((v) => (onlySet ? onlySet.includes(v.n) : !quick || !["small", "landscape"].includes(v.n))).map((v) => (v.touch ? v : { ...v, w: Math.round(v.w * SCALE), h: Math.round(v.h * SCALE) }));
const mkStops = (n) => Array.from({ length: n }, (_, i) => +(i / (n - 1)).toFixed(4)).map((p) => (p >= 1 ? 1 : p));
mkdirSync(out, { recursive: true });

const issues = []; // { level: "BLOCKER" | "WARN", vp, p, code, msg }
const add = (level, vp, p, code, msg) => issues.push({ level, vp, p, code, msg });

/* ── image metrics (on a 1/4 downsample) ── */
function metrics(png) {
  const { width: W, height: H, data } = png;
  const step = 4, lum = [];
  let hi = 0, lo = 0, edge = 0, n = 0, sat = 0;
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    const i = (y * W + x) * 4, r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum.push(l); n++;
    if (l > 0.97) hi++;
    if (l < 0.02) lo++;
    sat += Math.max(r, g, b) - Math.min(r, g, b);
    if (x + step < W) { const j = (y * W + x + step) * 4; edge += Math.abs(l - (0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2]) / 255); }
  }
  const mean = lum.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(lum.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  return { mean, sd, blown: hi / n, crushed: lo / n, edge: edge / n, sat: sat / n, small: { lum, W: Math.ceil(W / step), H: Math.ceil(H / step) } };
}
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const relLum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
/** linear-luminance percentiles of a pixel rect (the BRIGHTEST part behind a text run decides legibility) */
function rectLum(png, x0, y0, x1, y1) {
  const { width: W, height: H, data } = png;
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(W, Math.ceil(x1)); y1 = Math.min(H, Math.ceil(y1));
  const v = [];
  for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const i = (y * W + x) * 4; v.push(relLum(data[i], data[i + 1], data[i + 2])); }
  if (!v.length) return null;
  v.sort((a, b) => a - b);
  return { p50: v[Math.floor(v.length * 0.5)], v };
}
const parseRgba = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c || ""); if (!m) return [255, 255, 255, 1]; const a = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [a[0], a[1], a[2], a[3] === undefined || Number.isNaN(a[3]) ? 1 : a[3]]; };
const delta = (a, b) => { let s = 0; const L = Math.min(a.length, b.length); for (let i = 0; i < L; i++) s += Math.abs(a[i] - b[i]); return (s / L) * 100; };

function sheet(pngs, cols, tw, file) {
  const th = Math.round((tw * pngs[0].height) / pngs[0].width), rows = Math.ceil(pngs.length / cols);
  const o = new PNG({ width: cols * tw, height: rows * th });
  pngs.forEach((im, k) => {
    const ox = (k % cols) * tw, oy = Math.floor(k / cols) * th;
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
      const si = (Math.floor((y * im.height) / th) * im.width + Math.floor((x * im.width) / tw)) * 4, di = ((oy + y) * o.width + ox + x) * 4;
      o.data[di] = im.data[si]; o.data[di + 1] = im.data[si + 1]; o.data[di + 2] = im.data[si + 2]; o.data[di + 3] = 255;
    }
  });
  writeFileSync(file, PNG.sync.write(o));
}

const ARGS = gpu ? ["--ignore-gpu-blocklist", "--enable-webgl"] : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"];
// AURA_CHROME=/path/to/chromium lets locked-down sandboxes (no root, missing system libs) use any Chromium build
const launch = async () => {
  try { return await chromium.launch({ args: ARGS, executablePath: process.env.AURA_CHROME || undefined }); }
  catch (e) {
    console.error("\n✖ Could not start Chromium.\n  · not installed:        npx playwright install chromium\n  · missing system libs:  sudo npx playwright install-deps chromium   (Linux)\n  · no root / locked box: AURA_CHROME=/path/to/chrome node scripts/audit.mjs <url>\n\n" + String(e.message).split("\n")[0]);
    process.exit(2);
  }
}; // a fresh browser per viewport: software GL leaks memory across big canvases
let browser;
const frames = {}, meta = {};

/* ── 1–4 · the main pass ── */
for (const vp of VIEWPORTS) {
  browser = await launch();
  const bctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, isMobile: vp.touch, hasTouch: vp.touch }); // touch viewports are REAL mobile emulation → (pointer: coarse), so the engine takes its phone path
  const page = await bctx.newPage();
  page.setDefaultTimeout(TIMEOUT);
  const logs = [];
  page.on("console", (m) => (m.type() === "error" || (m.type() === "warning" && /\[aura\]/.test(m.text()))) && logs.push(m.text()));
  page.on("pageerror", (e) => logs.push("pageerror: " + e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  try { await page.waitForFunction(() => window.__aura, null, { timeout: 25000 }); }
  catch { add("BLOCKER", vp.n, null, "no-engine", "window.__aura never appeared — WebGL failed to start or the experience did not mount. Check console output."); await browser.close(); continue; }
  await page.waitForTimeout(1800); // loader wipe

  const info = await page.evaluate(() => window.__aura.info());
  meta[vp.n] = { shots: info.shots, size: info.size };
  const chapters = await page.evaluate(() => [...document.querySelectorAll("[data-a]")].map((e) => ({ a: +e.dataset.a, b: +e.dataset.b, fade: +(e.dataset.fade ?? 0.05), text: (e.textContent || "").trim().replace(/\s+/g, " "), words: ((e.querySelector("h1,h2,h3")?.textContent || e.textContent || "").trim().split(/\s+/).filter(Boolean).length), giant: e.classList.contains("aura-giant") })));
  meta[vp.n].chapters = chapters;

  const rows = [];
  const stops = mkStops(vp.N);
  for (const p of stops) {
    await page.evaluate((q) => window.__aura.seek(q), p);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(gpu ? 120 : 380);
    const dom = await page.evaluate(() => {
      const vw = innerWidth, vh = innerHeight;
      const vis = [...document.querySelectorAll("[data-a]")].filter((e) => getComputedStyle(e).visibility !== "hidden" && +getComputedStyle(e).opacity > 0.35)
        .map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); const r = rg.getBoundingClientRect(); /* measure the TEXT, not the (often full-width) element box */ return { t: (e.textContent || "").trim().slice(0, 28), x: r.left, y: r.top, r: r.right, b: r.bottom, giant: e.classList.contains("aura-giant"), cta: !!e.querySelector("a,button") }; });
      const links = [...document.querySelectorAll(".aura-overlay a, .aura-overlay button")].filter((e) => { const s = getComputedStyle(e); const w = e.closest("[data-a]"); return s.visibility !== "hidden" && (!w || +getComputedStyle(w).opacity > 0.5); }).length;
      /* every visible text run: size, colour, box — for min-font + contrast checks */
      const runs = [];
      const add = (el, hud) => {
        const owner = el.closest("[data-a]");
        const op = owner ? +getComputedStyle(owner).opacity : 1;
        if (owner && (getComputedStyle(owner).visibility === "hidden" || op < 0.9)) return;
        const tn = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
        if (!tn.length) return;
        const rg = document.createRange(); rg.setStartBefore(tn[0]); rg.setEndAfter(tn[tn.length - 1]);
        const rs = [...rg.getClientRects()]; if (!rs.length) return;
        const r = rg.getBoundingClientRect(); const cs = getComputedStyle(el);
        runs.push({ t: tn.map((n) => n.textContent.trim()).join(" ").slice(0, 24), px: parseFloat(cs.fontSize), color: cs.color, x: r.left, y: r.top, r: r.right, b: r.bottom, lines: new Set(rs.map((q) => Math.round(q.top / 4))).size, hud, giant: !!el.closest(".aura-giant"), cta: !!el.closest("a,button") });
      };
      document.querySelectorAll(".aura-overlay *").forEach((el) => add(el, false));
      document.querySelectorAll(".aura-hud *").forEach((el) => add(el, true));
      const taps = [...document.querySelectorAll(".aura-overlay a, .aura-overlay button")].filter((e) => { const w = e.closest("[data-a]"); return getComputedStyle(e).visibility !== "hidden" && (!w || +getComputedStyle(w).opacity > 0.9); }).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.textContent || "").trim().slice(0, 20), w: r.width, h: r.height }; });
      return { vw, vh, vis, links, runs, taps, sw: document.documentElement.scrollWidth };
    });
    const buf = await page.screenshot({ path: `${out}/${vp.n}-${String(Math.round(p * 100)).padStart(3, "0")}.png` });
    const png = PNG.sync.read(buf);
    const m = metrics(png);
    /* the same frame WITHOUT copy → what the text actually sits on (the scrim is part of the stage, so it is included) */
    const textRuns = dom.runs.filter((r) => !r.hud);
    let back = null;
    if (textRuns.length) {
      await page.evaluate(() => document.querySelectorAll(".aura-overlay").forEach((e) => (e.style.visibility = "hidden")));
      back = PNG.sync.read(await page.screenshot());
      await page.evaluate(() => document.querySelectorAll(".aura-overlay").forEach((e) => (e.style.visibility = "")));
    }
    dom.contrast = textRuns.map((r) => {
      const L = back && rectLum(back, r.x - 4, r.y - 2, r.r + 4, r.b + 2); if (!L) return null;
      const [R, G, B, A] = parseRgba(r.color);
      const eff = A * relLum(R, G, B) + (1 - A) * L.p50; // translucent text blends with what is behind it
      /* share of the pixels behind this text run that FAIL a contrast ratio (WCAG per-pixel, against the copy-free frame). Display type may cross a few bright lines; it may not sit on a bright field. */
      const frac = (th) => L.v.filter((l) => (Math.max(eff, l) + 0.05) / (Math.min(eff, l) + 0.05) < th).length / L.v.length;
      return { t: r.t, px: r.px, large: r.px >= 24 || r.giant, f45: frac(4.5), f3: frac(3), f2: frac(2), cta: r.cta };
    }).filter(Boolean);
    rows.push({ p, ...m, dom, png });
    frames[vp.n] = frames[vp.n] ?? [];
    frames[vp.n].push(png);
  }

  /* per-frame checks */
  rows.forEach((r, i) => {
    const tag = `p=${r.p}`;
    if (r.mean < 0.035) add(i === 0 ? "BLOCKER" : "WARN", vp.n, r.p, "dark", `frame is nearly black (mean luma ${r.mean.toFixed(3)}) — expose, add a rim/practical, or this is a loader leak`);
    if (r.mean > 0.62) add("WARN", vp.n, r.p, "bright", `frame is very bright (${r.mean.toFixed(2)}) — the genre wants light with intent; lower exposure, raise bloom threshold`);
    if (r.sd < 0.045 && r.mean > 0.02) add("WARN", vp.n, r.p, "flat", `flat frame (contrast σ ${r.sd.toFixed(3)}) — add a rim light, depth separation or atmosphere`);
    if (r.blown > 0.025) add("WARN", vp.n, r.p, "blown", `${(r.blown * 100).toFixed(1)}% of pixels clipped to white — bloom threshold too low or emissive too hot`);
    if (r.edge < 0.004 && r.mean > 0.02) add("WARN", vp.n, r.p, "empty", `almost no detail (edge energy ${r.edge.toFixed(4)}) — the frame is empty; where is the subject?`);
    const { vis, vw, vh, links } = r.dom;
    for (const e of vis) {
      if (e.x < -2 || e.r > vw + 2 + (e.giant ? 0 : 0) || e.y < -2 || e.b > vh + 2) add(e.giant ? "BLOCKER" : "WARN", vp.n, r.p, "clipped-copy", `“${e.t}” leaves the viewport (${Math.round(e.x)},${Math.round(e.y)} → ${Math.round(e.r)},${Math.round(e.b)} of ${vw}×${vh}) — use data-fit for giant type, check mobile layout`);
    }
    for (let a = 0; a < vis.length; a++) for (let b = a + 1; b < vis.length; b++) {
      const A = vis[a], B = vis[b];
      const ox = Math.min(A.r, B.r) - Math.max(A.x, B.x), oy = Math.min(A.b, B.b) - Math.max(A.y, B.y);
      if (ox > 6 && oy > 6) add("BLOCKER", vp.n, r.p, "collision", `“${A.t}” overlaps “${B.t}” by ${Math.round(ox)}×${Math.round(oy)}px — re-position or re-window the chapters`);
    }
    /* ── legibility + touch (measured, not hoped) ── */
    r.dom.runs.forEach((q) => {
      if (q.px < 11) add(q.hud ? "WARN" : "BLOCKER", vp.n, r.p, "tiny-text", `“${q.t}” is ${q.px.toFixed(1)}px — nothing a person must read may be under 11px (12px on phones)`);
      else if (vp.touch && q.px < 12 && !q.hud) add("WARN", vp.n, r.p, "small-text", `“${q.t}” is ${q.px.toFixed(1)}px on a touch viewport — use ≥12px`);
      if (q.cta && q.lines > 1) add("BLOCKER", vp.n, r.p, "cta-wrap", `CTA “${q.t}” wraps onto ${q.lines} lines — white-space:nowrap + a shorter label`);
    });
    r.dom.contrast.forEach((c) => {
      // body text: WARN if >10% of the backdrop is under 4.5:1, BLOCKER if >15% is under 3:1 · large/display type: WARN >12% under 3:1, BLOCKER >15% under 2:1
      if (c.large ? c.f2 > 0.15 : c.f3 > 0.15) add("BLOCKER", vp.n, r.p, "contrast-fail", `“${c.t}” sits on a field that fails WCAG (${Math.round((c.large ? c.f2 : c.f3) * 100)}% of the pixels behind it are under ${c.large ? 2 : 3}:1) — deepen the scrim (--aura-scrim-a) or move the subject`);
      else if (c.large ? c.f3 > 0.12 : c.f45 > 0.1) add("WARN", vp.n, r.p, "contrast", `“${c.t}” is borderline (${Math.round((c.large ? c.f3 : c.f45) * 100)}% of the pixels behind it are under ${c.large ? 3 : 4.5}:1) — raise --aura-scrim-a or re-frame`);
    });
    if (vp.touch) r.dom.taps.forEach((t) => Math.min(t.w, t.h) < 44 && add("BLOCKER", vp.n, r.p, "tap-target", `“${t.t}” is ${Math.round(t.w)}×${Math.round(t.h)}px — touch targets must be ≥44×44`));
    if (r.dom.sw > r.dom.vw + 1) add("BLOCKER", vp.n, r.p, "h-scroll", `page is ${r.dom.sw}px wide in a ${r.dom.vw}px viewport — horizontal scroll on a phone`);
    if (i === 0 && vis.length === 0) add("BLOCKER", vp.n, r.p, "empty-open", "opening frame has no type on screen — chapter 1 must start at data-a=0 (it is visible in frame one)");
    if (i === rows.length - 1) {
      if (vis.length === 0) add("BLOCKER", vp.n, r.p, "empty-close", "closing frame has no copy — the last chapter must end at data-b=1 and STAY");
      else if (links === 0) add("BLOCKER", vp.n, r.p, "no-cta", "closing frame has no visible link/button — the final image needs ONE obvious action (.aura-cta inside .aura-hit)");
    }
    void tag;
  });
  /* motion between stops */
  for (let i = 1; i < rows.length; i++) {
    const d = delta(rows[i - 1].small.lum, rows[i].small.lum);
    rows[i].delta = d;
    if (d < 0.35) add("WARN", vp.n, rows[i].p, "dead-zone", `frame barely changes from p=${rows[i - 1].p} (Δ${d.toFixed(2)}) — fine if this is a deliberate HOLD, otherwise the scroll is dead here`);
    if (d > 26) add("WARN", vp.n, rows[i].p, "jump-cut", `frame changes violently from p=${rows[i - 1].p} (Δ${d.toFixed(1)}) — a cut, not a glide. Check shot spacing / teleporting position`);
  }
  /* ── mobile edit: budget + portrait rail + real scroll drives the playhead ── */
  {
    const inf = await page.evaluate(() => window.__aura.info());
    if (vp.touch) {
      if (inf.drawCalls > 90) add("WARN", vp.n, null, "mobile-draw-calls", `${inf.drawCalls} draw calls on a phone (budget 90) — instance, merge, drop the mirror floor`);
      if (inf.triangles > 400000) add("WARN", vp.n, null, "mobile-triangles", `${(inf.triangles / 1e3).toFixed(0)}k triangles on a phone (budget 400k) — lower geometry detail on ctx.tier`);
      if (vp.w / vp.h < 0.85 && inf.rail !== "mobile") add("WARN", vp.n, null, "no-mobile-rail", "portrait is reusing the desktop rail — author scene.shotsMobile (closer, subject high, less lateral swing)");
      if (!inf.coarse) add("WARN", vp.n, null, "touch-emulation", "viewport was not detected as coarse-pointer — the phone path may not be exercised");
    }
    if (vp.n === "desktop" || vp.n === "mobile") {
      await page.evaluate(() => window.__aura.release());
      await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(500);
      await page.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.5));
      await page.waitForTimeout(gpu ? 1500 : 3500);
      const after = await page.evaluate(() => { const i = window.__aura.info(); return { p: i.p, locked: i.locked }; });
      if (Math.abs(after.p - 0.5) > 0.12 || after.locked) add("BLOCKER", vp.n, null, "scroll-not-driving", `scrolling to 50% put the playhead at ${after.p.toFixed(2)} (locked=${after.locked}) — scroll must drive the camera (trackProgress / sticky stage)`);
    }
  }
  /* shot-list lint (once) */
  if (vp.n === VIEWPORTS[0].n) {
    const s = info.shots, dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    if (s.length < 5) add("WARN", vp.n, null, "few-shots", `only ${s.length} shots — a 7–10 shot rail reads as a film; 3–4 reads as a tour`);
    if (s[0].at !== 0 || s[s.length - 1].at !== 1) add("BLOCKER", vp.n, null, "rail-range", "shots must start at at:0 and end at at:1");
    for (let i = 1; i < s.length; i++) if (s[i].at <= s[i - 1].at) add("BLOCKER", vp.n, null, "rail-order", `shot ${i} (at ${s[i].at}) is not after shot ${i - 1}`);
    let hold = false; for (let i = 1; i < s.length; i++) if (dist(s[i].pos, s[i - 1].pos) < 1.2 && dist(s[i].look, s[i - 1].look) < 1.2 && s[i].at - s[i - 1].at > 0.05) hold = true;
    if (!hold) add("WARN", vp.n, null, "no-hold", "no HOLD found (two consecutive shots with ~identical pos+look). Every hero moment needs a stretch where the camera nearly stops");
    const fovs = s.map((x) => x.fov ?? 40); let swings = 0; for (let i = 1; i < fovs.length; i++) if (Math.abs(fovs[i] - fovs[i - 1]) >= 8) swings++;
    if (swings < 2) add("WARN", vp.n, null, "no-alternation", "lens never changes character (fov swings < 2) — alternate wide (45+) and telephoto (≤30) shots");
    for (let i = 1; i < s.length; i++) if (dist(s[i].pos, s[i - 1].pos) > 70) add("WARN", vp.n, null, "teleport", `shots ${i - 1}→${i} move ${dist(s[i].pos, s[i - 1].pos).toFixed(0)} units — over a short scroll range that will whip. Space them out or add an intermediate shot`);
    const ch = chapters.filter((c) => !c.giant).sort((a, b) => a.a - b.a);
    if (!ch.length) add("WARN", vp.n, null, "no-chapters", "no [data-a] chapters found");
    else {
      if (ch[0].a > 0.001) add("WARN", vp.n, null, "late-open", `first chapter starts at ${ch[0].a}, not 0`);
      if (ch[ch.length - 1].b < 0.999) add("WARN", vp.n, null, "early-close", `last chapter ends at ${ch[ch.length - 1].b}, not 1`);
      let reach = 0; for (const c of ch) { if (c.a - reach > 0.2) add("WARN", vp.n, null, "silence", `no copy between p=${reach.toFixed(2)} and ${c.a.toFixed(2)} (${((c.a - reach) * 100).toFixed(0)}% of the film) — intentional silence is good up to ~15%`); reach = Math.max(reach, c.b); }
      ch.forEach((c) => c.words > 14 && add("WARN", vp.n, null, "wordy", `chapter “${c.text.slice(0, 30)}…” headline has ${c.words} words — max ~12 per beat; the 3D does the talking`));
    }
    if (info.drawCalls > 160) add("WARN", vp.n, null, "draw-calls", `${info.drawCalls} draw calls — instance repeated meshes, merge statics`);
    if (info.triangles > 1.8e6) add("WARN", vp.n, null, "triangles", `${(info.triangles / 1e6).toFixed(1)}M triangles — decimate / LOD`);
  }
  meta[vp.n].rows = rows.map(({ p, mean, sd, blown, crushed, edge, sat, delta: d }) => ({ p, mean: +mean.toFixed(3), sd: +sd.toFixed(3), blown: +blown.toFixed(4), crushed: +crushed.toFixed(3), edge: +edge.toFixed(4), sat: +sat.toFixed(3), delta: d === undefined ? null : +d.toFixed(2) }));
  meta[vp.n].fps = (await page.evaluate(() => window.__aura.info().fps));
  logs.forEach((l) => add(/pageerror|Error/i.test(l) ? "BLOCKER" : "WARN", vp.n, null, "console", l.slice(0, 220)));
  const portrait = vp.w / vp.h < 0.85;
  sheet(frames[vp.n], portrait ? 7 : 4, portrait ? 190 : 420, `${out}/contact-${vp.n}.png`);
  await browser.close();
}

/* ── 5 · resilience: no WebGL, reduced motion ── */
{
  browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/i.test(t) ? null : g.call(this, t, ...a); }; });
  const pg = await ctx.newPage(); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(url, { waitUntil: "networkidle" }); await pg.waitForTimeout(1500);
  const body = await pg.evaluate(() => ({ text: document.body.innerText.trim().length, loaderUp: !!document.querySelector(".aura-loader:not(.is-done)"), poster: !!document.querySelector(".aura-poster") }));
  if (errs.length) add("BLOCKER", "no-webgl", null, "fallback-crash", "page throws without WebGL: " + errs[0].slice(0, 160));
  else if (body.loaderUp) add("BLOCKER", "no-webgl", null, "fallback-stuck", "without WebGL the loader never clears — the visitor sees a permanent loading screen");
  else if (body.text < 20 && !body.poster) add("WARN", "no-webgl", null, "fallback-empty", "without WebGL the page is empty — pass a poster image and keep copy in the DOM");
  await ctx.close();
  const rm = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const pr = await rm.newPage(); const e2 = []; pr.on("pageerror", (e) => e2.push(e.message));
  await pr.goto(url, { waitUntil: "networkidle" }); await pr.waitForTimeout(2500);
  if (e2.length) add("BLOCKER", "reduced-motion", null, "rm-crash", e2[0].slice(0, 160));
  await rm.close();
}
await browser.close();

/* ── score (the half a machine can judge) ── */
const vpm = VIEWPORTS[0].n, rowsD = meta[vpm]?.rows ?? [];
const cnt = (code, vp) => issues.filter((i) => i.code === code && (!vp || i.vp === vp)).length;
const blockers = issues.filter((i) => i.level === "BLOCKER").length;
const frac = (bad) => Math.max(0, 1 - bad / Math.max(1, rowsD.length));
const atmosphere = Math.round(20 * (frac(cnt("flat", vpm) + cnt("empty", vpm)) * 0.4 + frac(cnt("blown", vpm) + cnt("bright", vpm)) * 0.2 + frac(cnt("dark", vpm)) * 0.4));
const unbroken = Math.max(0, Math.round(15 - cnt("jump-cut") * 3 - cnt("console") * 4 - cnt("rail-range") * 10 - cnt("rail-order") * 5 - cnt("teleport") * 3 - cnt("no-engine") * 20));
const rhythm = Math.max(0, Math.round(15 - cnt("no-hold") * 6 - cnt("no-alternation") * 4 - cnt("few-shots") * 3 - cnt("silence") * 2 - cnt("dead-zone", vpm) * 1.2 - cnt("wordy") * 1.5 - cnt("empty-open") * 6 - cnt("empty-close") * 6 - cnt("no-cta") * 4 - cnt("late-open") * 2 - cnt("early-close") * 2));
const craft = Math.max(0, Math.round(15 - cnt("collision") * 3 - cnt("clipped-copy") * 2 - cnt("fallback-crash") * 8 - cnt("fallback-stuck") * 8 - cnt("fallback-empty") * 3 - cnt("draw-calls") * 3 - cnt("triangles") * 3));
/* MOBILE & LEGIBILITY — 15 pts. Every phone-breaking defect costs; contrast/tiny-text/tap/overflow are the usual killers. */
const mobilePts = Math.max(0, Math.round(15 - cnt("tiny-text") * 1.5 - cnt("small-text") * 0.4 - cnt("cta-wrap") * 4 - cnt("tap-target") * 4 - cnt("h-scroll") * 6 - cnt("contrast") * 0.5 - cnt("contrast-fail") * 1.5 - cnt("mobile-draw-calls") * 2 - cnt("mobile-triangles") * 2 - cnt("no-mobile-rail") * 3 - cnt("scroll-not-driving") * 8 - cnt("touch-emulation") * 2));
const auto = atmosphere + unbroken + rhythm + craft + mobilePts;

const grouped = {};
issues.forEach((i) => { const k = `${i.level}|${i.code}|${i.vp}`; (grouped[k] = grouped[k] ?? { ...i, ps: [] }).ps.push(i.p); });
const lines = Object.values(grouped).sort((a, b) => (a.level === b.level ? 0 : a.level === "BLOCKER" ? -1 : 1)).map((g) => `- **${g.level}** \`${g.code}\` · ${g.vp}${g.ps.some((p) => p !== null) ? ` · p=${g.ps.filter((p) => p !== null).join(", ")}` : ""} — ${g.msg}`);
const md = `# AURA audit — ${url}\n\n**Automated score: ${auto}/80** (atmosphere ${atmosphere}/20 · unbroken ${unbroken}/15 · rhythm ${rhythm}/15 · craft ${craft}/15 · mobile & legibility ${mobilePts}/15) · blockers: ${blockers}\n\n` +
  `The remaining **20 points (Authorship)** and the real judgement of every other pillar are YOURS: open \`${out}/contact-desktop.png\` and \`${out}/contact-mobile.png\`, then critique like a harsh art director (references/08-qa-and-polish.md). Ship only when the human-judged total is ≥ 85.\n\n` +
  `## Issues\n${lines.join("\n") || "_none_"}\n\n## Per-frame (${vpm})\n| p | luma | σ | blown | edge | Δ prev |\n|---|---|---|---|---|---|\n${rowsD.map((r) => `| ${r.p} | ${r.mean} | ${r.sd} | ${r.blown} | ${r.edge} | ${r.delta ?? "—"} |`).join("\n")}\n\n` +
  `Shots: ${(meta[vpm]?.shots ?? []).length} · draw-call/triangle/fps numbers are in report.json (fps only meaningful with --gpu).\n`;
writeFileSync(`${out}/REPORT.md`, md);
writeFileSync(`${out}/report.json`, JSON.stringify({ url, auto: { total: auto, atmosphere, unbroken, rhythm, craft, mobile: mobilePts }, blockers, issues, meta: Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, { ...v, shots: undefined, rows: v.rows }])) }, null, 2));
console.log(md);
console.log(`\n→ ${out}/REPORT.md · ${out}/contact-*.png   (now LOOK at the contact sheets)`);
process.exit(blockers ? 1 : 0);
