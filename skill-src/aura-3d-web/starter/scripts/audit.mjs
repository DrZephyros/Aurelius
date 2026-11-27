#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────────
   AURA · audit.mjs v4 — the QA gate an agent can actually run. HYGIENE, not taste. Every finding now says what to DO.

   npm i -D playwright pngjs && npx playwright install chromium
   node scripts/audit.mjs <url | --serve dist> [--out shots] [--stops 14] [--only desktop,mobile] [--quick] [--scale 0.5]
        [--profile strict|standard|lenient] [--tsc] [--poster] [--throttle 4] [--gpu] [--compare prev/report.json]
        [--config aura.audit.json] [--tier-desktop high] [--tier-touch mid]

   WHAT CHANGED IN v3 (each item answers a failure reported against v2):
   · CLASS-AGNOSTIC. Text, CTAs, tap targets and collisions are found from the rendered DOM (visible text nodes, a[href]/button/[role=button]),
     not from .aura-cta / .aura-hit / .aura-* hooks. A site that names things .tw-cta is judged on what it shows. Chapter-level rhythm checks run
     only when chapters exist ([data-a], [data-aura-chapter], or `chapters` in aura.audit.json) — and are skipped, never failed, when they do not.
   · THE SCRIM COUNTS. Contrast is measured per GLYPH PIXEL: one frame with every glyph made transparent (stage, scrim, overlay gradients, button
     fills all stay), one frame with only the glyphs on a transparent page (alpha = exact glyph coverage). Deepening --aura-scrim-a, an overlay
     gradient or a stage scrim now changes the number. Every contrast finding prints the measured scrim alpha that would fix it.
   · FAIR TO GIANT TYPE. Because only glyph pixels are sampled (not the line box), a display word crossing a bright ring is judged on the letters.
   · MODE-AWARE. scene.mode === "light" inverts the brightness expectations (a bone-white world is not "too bright").
   · FALLBACKS ARE VERIFIED: no-WebGL must show readable copy + an action + no stuck loader; reduced motion must really STOP (two frames a second
     apart must be identical, no infinite CSS animation running, window.__aura.info().motion.frozen).
   · MISSING ASSETS: any 4xx/5xx, and any asset URL that answers 200 with text/html (an SPA fallback hiding a 404), is a blocker.
   · TYPES: --tsc runs the project's own typecheck.
   · COMPARABLE: report.json stamps AUDIT_VERSION, profile and every threshold. --compare prev/report.json prints new/fixed findings and the look
     fingerprint distance, so "the gate got stricter" and "the scene regressed" can be told apart — and "this looks like the last world" is a finding.
   · FLOORS, NOT CEILINGS: the score is capped per rule so one repeated defect cannot zero a pillar; it measures that nothing is BROKEN. It
     cannot say a scene is good. TASTE.md is written next to the report with a rubric — fill it in from the contact sheets.
   Software GL (no --gpu) gives real pixels but meaningless FPS. Real-device numbers: open the site with ?aura-debug=1 and read window.__aura.perf().
   ───────────────────────────────────────────────────────────────────────────── */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const HERE = fileURLToPath(new URL(".", import.meta.url));

export const AUDIT_VERSION = "4.0";
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i < 0 ? d : argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true; };
const out = flag("out", "shots");
const N = Number(flag("stops", 14));
const gpu = !!flag("gpu", false), quick = !!flag("quick", false), SCALE = Number(flag("scale", 1)), TIMEOUT = Number(flag("timeout", 150000));
const PROFILE = String(flag("profile", "standard")), K = { strict: 0.7, standard: 1, lenient: 1.4 }[PROFILE] ?? 1; // K scales every tolerance
const onlySet = typeof flag("only", null) === "string" ? flag("only").split(",") : null;
const cfgPath = flag("config", existsSync("aura.audit.json") ? "aura.audit.json" : null);
const CFG = { chapters: "[data-a],[data-aura-chapter]", ignore: "", hud: ".aura-hud,[data-aura-hud]", ...(cfgPath && existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, "utf8")) : {}) };
const T = { // every threshold, stamped into report.json
  tinyPx: 11, smallTouchPx: 12, ctaTouchPx: 15, tap: 44, bodyFail3: 0.1 * K, bodyWarn45: 0.15 * K, largeFail2: 0.2 * K, largeWarn3: 0.25 * K,
  dark: 0.035, bright: 0.62, flat: 0.045, blown: 0.025, dead: 0.35, jump: 26, phoneCalls: 90, phoneTris: 400000, rmDelta: 0.05,
};
mkdirSync(out, { recursive: true });

/* ── static server (for --serve dist): real 404s for missing files, SPA fallback ONLY for extension-less routes ── */
let server = null, url = argv.find((a) => /^https?:/.test(a));
if (flag("serve", false)) {
  const root = String(flag("serve")), MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".woff2": "font/woff2", ".splat": "application/octet-stream" };
  server = createServer((req, res) => {
    const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
    let f = join(root, p); if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
    if (!existsSync(f)) { if (extname(p)) { res.writeHead(404); return res.end("not found"); } f = join(root, "index.html"); }
    res.writeHead(200, { "content-type": MIME[extname(f)] ?? "application/octet-stream" }); res.end(readFileSync(f));
  }).listen(0);
  url = `http://localhost:${server.address().port}/`;
}
url = url ?? "http://localhost:4173";
const withQ = (u, q) => u + (u.includes("?") ? "&" : "?") + q;

const ALL_VP = [
  { n: "desktop", w: 1440, h: 900, touch: false, N }, { n: "mobile", w: 390, h: 844, touch: true, N }, { n: "wide", w: 1920, h: 1080, touch: false, N },
  { n: "small", w: 360, h: 640, touch: true, N: Math.min(N, 7) }, { n: "landscape", w: 844, h: 390, touch: true, N: Math.min(N, 7) },
];
const VIEWPORTS = ALL_VP.filter((v) => (onlySet ? onlySet.includes(v.n) : !quick || !["small", "landscape", "wide"].includes(v.n))).map((v) => (v.touch ? v : { ...v, w: Math.round(v.w * SCALE), h: Math.round(v.h * SCALE) }));
const mkStops = (n) => Array.from({ length: n }, (_, i) => +(i / (n - 1)).toFixed(4));

const issues = [];
const add = (level, vp, p, code, msg, extra = {}) => issues.push({ level, vp, p, code, msg, ...extra });

/* ── pixel maths ── */
function metrics(png) {
  const { width: W, height: H, data } = png, step = 4, lum = [], hist = new Map();
  let hi = 0, lo = 0, edge = 0, n = 0, sat = 0;
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    const i = (y * W + x) * 4, r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255, l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum.push(l); n++; if (l > 0.97) hi++; if (l < 0.02) lo++; sat += Math.max(r, g, b) - Math.min(r, g, b);
    const key = ((data[i] >> 6) << 4) | ((data[i + 1] >> 6) << 2) | (data[i + 2] >> 6); hist.set(key, (hist.get(key) ?? 0) + 1);
    if (x + step < W) { const j = (y * W + x + step) * 4; edge += Math.abs(l - (0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2]) / 255); }
  }
  const mean = lum.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(lum.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  return { mean, sd, blown: hi / n, crushed: lo / n, edge: edge / n, sat: sat / n, hist, n, small: { lum } };
}
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const relLum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const parseRgba = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c || ""); if (!m) return [0, 0, 0, 1]; const a = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [a[0], a[1], a[2], a[3] === undefined || Number.isNaN(a[3]) ? 1 : a[3]]; };
const delta = (a, b) => { let s = 0; const L = Math.min(a.length, b.length); for (let i = 0; i < L; i++) s += Math.abs(a[i] - b[i]); return (s / L) * 100; };
function sheet(pngs, cols, tw, file) {
  const th = Math.round((tw * pngs[0].height) / pngs[0].width), rows = Math.ceil(pngs.length / cols), o = new PNG({ width: cols * tw, height: rows * th });
  pngs.forEach((im, k) => { const ox = (k % cols) * tw, oy = Math.floor(k / cols) * th; for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) { const si = (Math.floor((y * im.height) / th) * im.width + Math.floor((x * im.width) / tw)) * 4, di = ((oy + y) * o.width + ox + x) * 4; o.data[di] = im.data[si]; o.data[di + 1] = im.data[si + 1]; o.data[di + 2] = im.data[si + 2]; o.data[di + 3] = 255; } });
  writeFileSync(file, PNG.sync.write(o));
}

/** Glyph-pixel contrast. back = frame with glyphs transparent (scrim, overlays, button fills KEPT). mask = glyphs alone on a transparent page. */
function glyphContrast(back, mask, r) {
  const [cr, cg, cb] = parseRgba(r.color), Lg = relLum(cr, cg, cb);
  const { width: W, height: H } = back, x0 = Math.max(0, Math.floor(r.x - 2)), y0 = Math.max(0, Math.floor(r.y - 2)), x1 = Math.min(W, Math.ceil(r.r + 2)), y1 = Math.min(H, Math.ceil(r.b + 2));
  let amax = 0; for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) amax = Math.max(amax, mask.data[(y * W + x) * 4 + 3]);
  if (amax < 40) return null; // nothing drawn (fully faded) — not a legibility problem
  const cut = amax * 0.55, ratios = [], lb = [], lt = [];
  for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
    const i = (y * W + x) * 4, a = mask.data[i + 3];
    if (a < cut) continue;
    const al = a / 255, B = [back.data[i], back.data[i + 1], back.data[i + 2]], Tt = [mask.data[i], mask.data[i + 1], mask.data[i + 2]];
    const Lb = relLum(...B), Lt = relLum(...Tt.map((c, k) => c * al + B[k] * (1 - al))); // what the eye gets: glyph colour at its own alpha over the real backdrop
    ratios.push(ratio(Lt, Lb)); lb.push(Lb); lt.push(Lt);
  }
  if (ratios.length < 6) return null;
  const f = (th) => ratios.filter((q) => q < th).length / ratios.length;
  const med = (v) => v.slice().sort((a, b) => a - b)[Math.floor(v.length / 2)];
  const Lt = med(lt), Lb90 = lb.slice().sort((a, b) => a - b)[Math.floor(lb.length * 0.9)], Lb10 = lb.slice().sort((a, b) => a - b)[Math.floor(lb.length * 0.1)];
  return { f45: f(4.5), f3: f(3), f2: f(2), worst: ratios.slice().sort((a, b) => a - b)[Math.floor(ratios.length * 0.1)], Lt, Lg, Lb90, Lb10, n: ratios.length };
}
const toS = (L) => (L <= 0.0031308 ? 12.92 * L : 1.055 * Math.pow(Math.max(L, 0), 1 / 2.4) - 0.055); // linear luminance → sRGB value (CSS composites in sRGB)
/** backdrop luminance percentiles inside a rect of the copy-free frame (every 2nd pixel) */
function backdrop(back, x0, y0, x1, y1) {
  const { width: W, height: H } = back, v = [];
  for (let y = Math.max(0, Math.floor(y0)); y < Math.min(H, Math.ceil(y1)); y += 2) for (let x = Math.max(0, Math.floor(x0)); x < Math.min(W, Math.ceil(x1)); x += 2) { const i = (y * W + x) * 4; v.push(relLum(back.data[i], back.data[i + 1], back.data[i + 2])); }
  v.sort((a, b) => a - b); return v.length ? { Lb10: v[Math.floor(v.length * 0.1)], Lb90: v[Math.floor(v.length * 0.9)] } : { Lb10: 0, Lb90: 0 };
}
/** EXTRA scrim alpha (0 … ∞) of colour luminance `Ls` that lifts the worst backdrop pixels to th:1 for glyph luminance Lg.
 *  Light text → darken the BRIGHT pixels (Lb90); dark text → lighten the DARK pixels (Lb10). Infinity = no scrim can do it. */
function extraAlpha(Lg, Lb90, Lb10, Ls, th) {
  if (Lg >= 0.4) { const need = (Lg + 0.05) / th - 0.05; if (Lb90 <= need) return 0; if (need <= Ls) return Infinity; return (toS(Lb90) - toS(need)) / Math.max(1e-3, toS(Lb90) - toS(Ls)); }
  const need = th * (Lg + 0.05) - 0.05; if (Lb10 >= need) return 0; if (need >= Ls || need > 1) return Infinity; return (toS(need) - toS(Lb10)) / Math.max(1e-3, toS(Ls) - toS(Lb10));
}
const scrimLum = (s) => { const n = String(s || "3 5 11").trim().split(/[ ,]+/).map(Number); return n.length >= 3 && n.every((q) => !Number.isNaN(q)) ? relLum(n[0], n[1], n[2]) : 0.002; };
/** ONE concrete move for a failing run: {kind:"plate"|"mirror"|"subject"|"text", do:string, plate?:number}. `th` = the contrast to reach. */
function advise(c, r, back, th) {
  const Ls = scrimLum(r.chap?.scrim), cur = Number.isFinite(r.chap?.plate) ? r.chap.plate : 0.55, sel = r.chap?.sel ?? "the chapter", giant = !!r.chap?.giant;
  const x = extraAlpha(c.Lg, c.Lb90, c.Lb10, Ls, th);
  const band = `${Math.round((r.y / back.height) * 100)}–${Math.round((r.b / back.height) * 100)}%`;
  if (x === Infinity && (c.Lg >= 0.4) === (Ls >= 0.4)) return { kind: "scrim-colour", do: `the scrim colour (--aura-scrim: ${r.chap?.scrim || "3 5 11"}) is the SAME tone as the text, so it cannot help — set --aura-scrim to the page background colour as "r g b" (the opposite tone of the type)` };
  // (2) the other side of the frame, measured with the same rect mirrored
  if (!giant && (r.chap?.anchor === "aura-left" || r.chap?.anchor === "aura-right") && back.width > 0) {
    const m = backdrop(back, back.width - r.r, r.y, back.width - r.x, r.b), xm = extraAlpha(c.Lg, m.Lb90, m.Lb10, Ls, th);
    if (xm <= 0.06 && x > 0.12) return { kind: "mirror", do: `swap ${sel} from .${r.chap.anchor} to .${r.chap.anchor === "aura-left" ? "aura-right" : "aura-left"} — measured: the mirrored side is already dark/light enough (0 extra scrim needed)` };
  }
  const total = 1 - (1 - cur) * (1 - Math.min(x, 1));
  const plate = Math.min(0.92, Math.round(Math.min(total * 1.12 + 0.02, 1) * 100) / 100);
  if (x === Infinity || x > 0.8 || total > 0.9) return { kind: "subject", do: giant ? `no title plate fixes this without erasing the hero: move the SUBJECT out of the title band (${band} of the frame at this size) — shift shots[].look so the hero sits lower / off-axis for p≈this frame, or on phones use shotsMobile (look.y above the hero.y puts it lower in frame)` : `no scrim ≤ 0.92 fixes ${sel} without erasing the picture: move the SUBJECT out of this text band (${band} of the frame) — shift shots[].look / shotsMobile — or window the chapter into a darker stretch of the rail` };
  return { kind: "plate", plate, do: giant ? `set --aura-giant-plate-a: ${Math.min(0.85, plate).toFixed(2)} on ${sel} (now ${Number.isFinite(r.chap?.giantPlate) ? r.chap.giantPlate : 0.34}) — or move the hero out of the title band` : `set --aura-plate-a: ${plate.toFixed(2)} on ${sel} (now ${cur.toFixed(2)}) — style={{ "--aura-plate-a": ${plate.toFixed(2)} }}; or swap its anchor / move the subject` };
}

const ARGS = gpu ? ["--ignore-gpu-blocklist", "--enable-webgl"] : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"];
const launch = async () => {
  try { return await chromium.launch({ args: ARGS, executablePath: process.env.AURA_CHROME || undefined }); }
  catch (e) { console.error("\n✖ Could not start Chromium.\n  · not installed:        npx playwright install chromium\n  · missing system libs:  sudo npx playwright install-deps chromium\n  · no root:              AURA_CHROME=/path/to/chrome node scripts/audit.mjs <url>\n\n" + String(e.message).split("\n")[0]); process.exit(2); }
};
const TEXT_OFF = "*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important;caret-color:transparent!important}*::placeholder{color:transparent!important}";
const GLYPHS_ONLY = "html,body,*,*::before,*::after{background:transparent!important;background-image:none!important;box-shadow:none!important;border-color:transparent!important;backdrop-filter:none!important;outline-color:transparent!important}canvas,video,img,svg,picture{visibility:hidden!important}*{text-shadow:none!important}";

/** runs the DOM collector inside the page. Class-agnostic: every visible text node + every interactive element. */
const COLLECT = ({ chapters, ignore, hud }) => {
  const vw = innerWidth, vh = innerHeight, runs = [], taps = [];
  const chainOpacity = (el) => { let o = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === "hidden" || cs.display === "none") return 0; o *= +cs.opacity; } return o; };
  const owners = new Map(); const ownerId = (el) => { const c = el.closest(chapters) || el.closest("a,button,[role=button],h1,h2,h3,h4,p,li,label,span,div") || el; if (!owners.has(c)) owners.set(c, owners.size); return owners.get(c); };
  const desc = (e) => e.tagName.toLowerCase() + [...e.classList].slice(0, 2).map((c) => "." + c).join("");
  const chapInfo = (el) => {
    const c = el.closest(chapters) || el.closest(".aura-copy,.aura-giant"); if (!c) return null;
    const cs = getComputedStyle(c), giant = c.classList.contains("aura-giant"), num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
    return { sel: desc(c) + (c.dataset.a !== undefined ? `[data-a=${c.dataset.a}…${c.dataset.b ?? 1}]` : ""), a: num(c.dataset.a), b: num(c.dataset.b), giant, anchor: ["aura-left", "aura-right", "aura-center", "aura-final"].find((k) => c.classList.contains(k)) ?? (giant ? "aura-giant" : null), plate: num(cs.getPropertyValue("--aura-plate-a")), giantPlate: num(cs.getPropertyValue("--aura-giant-plate-a")), scrim: cs.getPropertyValue("--aura-scrim").trim() };
  };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    const t = n.textContent.trim(); if (!t) continue;
    const el = n.parentElement; if (!el || el.closest("script,style,noscript,canvas,[aria-hidden=true] .aura-sr") || (ignore && el.closest(ignore))) continue;
    const op = chainOpacity(el); if (op < 0.35) continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const rs = [...rg.getClientRects()].filter((q) => q.width > 1 && q.height > 1); if (!rs.length) continue;
    const r = rg.getBoundingClientRect(); if (r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh) continue;
    const cs = getComputedStyle(el), px = parseFloat(cs.fontSize), cta = el.closest("a[href],button,[role=button]");
    runs.push({ t: t.slice(0, 28), px, color: cs.color, x: r.left, y: r.top, r: r.right, b: r.bottom, lines: new Set(rs.map((q) => Math.round(q.top / 4))).size, hud: !!el.closest(hud), giant: px >= 64 || !!el.closest("[data-fit],.aura-giant"), cta: !!cta, owner: ownerId(el), op, chap: chapInfo(el), ff: cs.fontFamily });
  }
  for (const e of document.querySelectorAll("a[href],button,[role=button],input,select,textarea,summary")) {
    if (ignore && e.closest(ignore)) continue;
    const op = chainOpacity(e); if (op < 0.9) continue;
    const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh) continue;
    taps.push({ t: (e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 20), w: r.width, h: r.height, inline: getComputedStyle(e).display === "inline" && !!e.closest("p,li"), px: parseFloat(getComputedStyle(e).fontSize), hud: !!e.closest(hud) });
  }
  return { vw, vh, runs, taps, sw: document.documentElement.scrollWidth, text: document.body.innerText.trim().length };
};

let browser;
const frames = {}, meta = {}, fp = { hist: new Map(), luma: [], edge: [], sat: [] }, assets = [];

/* ── 1–4 · the main pass ── */
for (const vp of VIEWPORTS) {
  browser = await launch();
  const bctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, isMobile: vp.touch, hasTouch: vp.touch });
  const page = await bctx.newPage(); page.setDefaultTimeout(TIMEOUT);
  const logs = [];
  page.on("console", (m) => (m.type() === "error" || (m.type() === "warning" && /\[aura\]/.test(m.text()))) && logs.push(m.text()));
  page.on("pageerror", (e) => logs.push("pageerror: " + e.message));
  page.on("response", (r) => { const u = r.url(); if (!u.startsWith("http")) return; const ct = r.headers()["content-type"] || ""; if (r.status() >= 400) assets.push(`${r.status()} ${u}`); else if (/\.(js|css|png|jpe?g|webp|svg|glb|gltf|splat|woff2?|json|mp3|ogg)(\?|$)/i.test(u) && /text\/html/.test(ct)) assets.push(`200-as-HTML ${u}`); });
  if (flag("throttle", false)) { const c = await bctx.newCDPSession(page); await c.send("Emulation.setCPUThrottlingRate", { rate: Number(flag("throttle")) }); }
  const tier = vp.touch ? flag("tier-touch", "mid") : flag("tier-desktop", "high"); // visual fidelity of the tier the viewport stands for (software GL would otherwise force "low")
  await page.goto(withQ(url, `tier=${tier}`), { waitUntil: "networkidle" });
  try { await page.waitForFunction(() => window.__aura, null, { timeout: 60000 }); }
  catch { add("BLOCKER", vp.n, null, "no-engine", "window.__aura never appeared — WebGL failed to start or the experience did not mount. Check console output."); await browser.close(); continue; }
  await page.waitForFunction(() => !document.querySelector(".aura-loader:not(.is-done)"), null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => window.__aura.info());
  meta[vp.n] = { shots: info.shots, size: info.size, tier: info.tier, device: info.device, mode: info.mode, rail: info.rail };
  const chapters = await page.evaluate((sel) => [...document.querySelectorAll(sel)].map((e) => ({ a: +(e.dataset.a ?? e.dataset.auraA ?? 0), b: +(e.dataset.b ?? e.dataset.auraB ?? 1), text: (e.textContent || "").trim().replace(/\s+/g, " "), words: (e.querySelector("h1,h2,h3")?.textContent || e.textContent || "").trim().split(/\s+/).filter(Boolean).length, giant: !!e.matches("[data-fit],.aura-giant") })), CFG.chapters);
  const light = info.mode === "light";
  /* v4: SETTLED STOPS. Evenly spaced stops often land inside a chapter's fade (opacity 0.4, blurred) and fail contrast for a frame no visitor lingers on.
     Every chapter is also sampled at the middle of its window: the nearest even stop is snapped there if within 0.07, otherwise one is added. */
  const stops = mkStops(vp.N);
  for (const c of chapters.filter((q) => !q.giant)) {
    const mid = +((c.a + c.b) / 2).toFixed(4); if (mid <= 0 || mid >= 1) continue;
    let k = 0; stops.forEach((q, i) => { if (Math.abs(q - mid) < Math.abs(stops[k] - mid)) k = i; });
    if (Math.abs(stops[k] - mid) < 0.07 && k > 0 && k < stops.length - 1) stops[k] = mid; else if (!stops.includes(mid)) stops.push(mid);
  }
  stops.sort((a, b) => a - b);
  const rows = [];
  for (const p of stops) {
    await page.evaluate((q) => window.__aura.seek(q), p);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(gpu ? 120 : 450);
    const dom = await page.evaluate(COLLECT, CFG);
    const png = PNG.sync.read(await page.screenshot({ path: `${out}/${vp.n}-${String(Math.round(p * 100)).padStart(3, "0")}.png` }));
    const m = metrics(png);
    dom.contrast = [];
    const body = dom.runs.filter((r) => !r.hud && r.op >= 0.85); // mid-fade text (opacity < .85) is not what a visitor reads — the settled stops judge it
    if (body.length || (flag("poster", false) && p === 0)) {
      const h1 = await page.addStyleTag({ content: TEXT_OFF }); await page.waitForTimeout(60);
      const back = PNG.sync.read(await page.screenshot()); await h1.evaluate((e) => e.remove());
      if (flag("poster", false) && p === 0) writeFileSync(`${out}/poster-${vp.n}.png`, PNG.sync.write(back));
      if (body.length) {
        const h2 = await page.addStyleTag({ content: GLYPHS_ONLY }); await page.waitForTimeout(60);
        const mask = PNG.sync.read(await page.screenshot({ omitBackground: true })); await h2.evaluate((e) => e.remove());
        for (const r of body) { const c = glyphContrast(back, mask, r); if (c) { const large = r.px >= 24 || r.giant; dom.contrast.push({ t: r.t, px: r.px, large, giant: r.giant, cta: r.cta, ...c, fixFail: advise(c, r, back, large ? 2.5 : 3.5), fixWarn: advise(c, r, back, large ? 3.2 : 4.8) }); } }
      }
    }
    rows.push({ p, ...m, dom, png });
    (frames[vp.n] ??= []).push(png);
    if (!vp.touch && vp.n === "desktop") { for (const [k, v] of m.hist) fp.hist.set(k, (fp.hist.get(k) ?? 0) + v); fp.luma.push(m.mean); fp.edge.push(m.edge); fp.sat.push(m.sat); }
  }

  /* per-frame checks */
  rows.forEach((r, i) => {
    const bright = light ? r.mean < 0.3 : r.mean > T.bright, dark = light ? false : r.mean < T.dark;
    if (dark) add(i === 0 ? "BLOCKER" : "WARN", vp.n, r.p, "dark", `frame is nearly black (mean luma ${r.mean.toFixed(3)}) — expose, add a rim/practical, or this is a loader leak`);
    if (bright) add("WARN", vp.n, r.p, "bright", light ? `light-mode frame is murky (luma ${r.mean.toFixed(2)}) — lift the key / ground` : `frame is very bright (${r.mean.toFixed(2)}) — lower exposure, raise bloom threshold`);
    if (r.sd < T.flat && (light || r.mean > 0.02)) add("WARN", vp.n, r.p, "flat", `flat frame (contrast σ ${r.sd.toFixed(3)}) — add a rim light, depth separation or atmosphere`);
    if (r.blown > T.blown && !light) add("WARN", vp.n, r.p, "blown", `${(r.blown * 100).toFixed(1)}% of pixels clipped to white — bloom threshold too low or emissive too hot`);
    if (r.edge < 0.004 && r.mean > 0.02) add("WARN", vp.n, r.p, "empty", `almost no detail (edge energy ${r.edge.toFixed(4)}) — where is the subject?`);
    const { runs, vw, vh, taps } = r.dom;
    for (const e of runs) if (!e.hud && (e.x < -2 || e.r > vw + 2 || e.y < -2 || e.b > vh + 2)) add(e.giant ? "BLOCKER" : "WARN", vp.n, r.p, "clipped-copy", `“${e.t}” leaves the viewport (${Math.round(e.x)},${Math.round(e.y)} → ${Math.round(e.r)},${Math.round(e.b)} of ${vw}×${vh}) — ${vh < 500 ? "short landscape: use the landscape-phone rules in aura.css (narrow column, height-capped giant type)" : "use data-fit for giant type, check the phone layout"}`);
    for (let a = 0; a < runs.length; a++) for (let b = a + 1; b < runs.length; b++) {
      const A = runs[a], B = runs[b]; if (A.owner === B.owner || A.hud || B.hud) continue;
      const ox = Math.min(A.r, B.r) - Math.max(A.x, B.x), oy = Math.min(A.b, B.b) - Math.max(A.y, B.y);
      if (ox > 6 && oy > 6) { const ca = A.chap, cb = B.chap, win = (c) => (c && c.a !== null ? `${c.sel.split("[")[0]} window ${c.a}–${c.b ?? 1}` : "a chapter"); add("BLOCKER", vp.n, r.p, "collision", `“${A.t}” (${win(ca)}, ${ca?.anchor ?? "?"}) overlaps “${B.t}” (${win(cb)}, ${cb?.anchor ?? "?"}) by ${Math.round(ox)}×${Math.round(oy)}px at ${vw}×${vh} → DO: ${vh < 500 ? "in landscape put the giant word in the top band and side copy in the bottom band (aura.css ≥ v19 does; check you did not override .aura-left/.aura-right top/bottom)" : "give one of them another anchor (aura-left / aura-right / aura-center)"}, or end the giant's data-b before the other's data-a (${ca?.a ?? "?"}–${ca?.b ?? "?"} vs ${cb?.a ?? "?"}–${cb?.b ?? "?"})`, { t: A.t + "×" + B.t }); }
    }
    runs.forEach((q) => {
      if (q.px < T.tinyPx) add(q.hud ? "WARN" : "BLOCKER", vp.n, r.p, "tiny-text", `“${q.t}” is ${q.px.toFixed(1)}px — nothing a person must read may be under ${T.tinyPx}px`);
      else if (vp.touch && q.px < T.smallTouchPx) add("WARN", vp.n, r.p, "small-text", `“${q.t}” is ${q.px.toFixed(1)}px on a touch viewport — use ≥${T.smallTouchPx}px (chapter labels, HUD)`);
      if (q.cta && q.lines > 1) add("BLOCKER", vp.n, r.p, "cta-wrap", `CTA “${q.t}” wraps onto ${q.lines} lines — white-space:nowrap + a shorter label`);
      if (q.cta && vp.touch && q.px < T.ctaTouchPx) add("WARN", vp.n, r.p, "cta-font", `CTA “${q.t}” is ${q.px.toFixed(1)}px on a phone — use ≥${T.ctaTouchPx}px`);
    });
    r.dom.contrast.forEach((c) => {
      const fixOf = (f) => `→ DO: ${f.do}`;
      if (c.large ? c.f2 > T.largeFail2 : c.f3 > T.bodyFail3) add("BLOCKER", vp.n, r.p, "contrast-fail", `“${c.t}” — ${Math.round((c.large ? c.f2 : c.f3) * 100)}% of its GLYPH pixels are under ${c.large ? 2 : 3}:1 (worst 10% ≈ ${c.worst.toFixed(1)}:1). ${fixOf(c.fixFail)}`, { t: c.t, fix: c.fixFail });
      else if (c.large ? c.f3 > T.largeWarn3 : c.f45 > T.bodyWarn45) add("WARN", vp.n, r.p, "contrast", `“${c.t}” is borderline (${Math.round((c.large ? c.f3 : c.f45) * 100)}% of glyph pixels under ${c.large ? 3 : 4.5}:1). ${fixOf(c.fixWarn)}`, { t: c.t, fix: c.fixWarn });
    });
    if (vp.touch) taps.forEach((t) => !t.inline && Math.min(t.w, t.h) < T.tap && add("BLOCKER", vp.n, r.p, "tap-target", `“${t.t}” is ${Math.round(t.w)}×${Math.round(t.h)}px — touch targets must be ≥${T.tap}×${T.tap}`));
    if (r.dom.sw > r.dom.vw + 1) add("BLOCKER", vp.n, r.p, "h-scroll", `page is ${r.dom.sw}px wide in a ${r.dom.vw}px viewport — horizontal scroll on a phone`);
    if (i === 0 && !runs.length) add("BLOCKER", vp.n, r.p, "empty-open", "opening frame has no readable type — the first frame must carry the title");
    if (i === rows.length - 1) {
      if (!runs.length) add("BLOCKER", vp.n, r.p, "empty-close", "closing frame has no copy — the last chapter must stay on screen");
      else if (!taps.filter((t) => !t.hud).length) add("BLOCKER", vp.n, r.p, "no-cta", "closing frame shows no link or button — the final image needs ONE obvious action (any a[href]/button; the class name does not matter)");
    }
  });
  for (let i = 1; i < rows.length; i++) {
    const d = delta(rows[i - 1].small.lum, rows[i].small.lum); rows[i].delta = d;
    if (d < T.dead) add("WARN", vp.n, rows[i].p, "dead-zone", `frame barely changes from p=${rows[i - 1].p} (Δ${d.toFixed(2)}) — fine if a deliberate HOLD`);
    if (d > T.jump) add("WARN", vp.n, rows[i].p, "jump-cut", `frame changes violently from p=${rows[i - 1].p} (Δ${d.toFixed(1)}) — a cut, not a glide`);
  }
  {
    const inf = await page.evaluate(() => window.__aura.info());
    if (vp.touch) {
      if (inf.drawCalls > T.phoneCalls) add("WARN", vp.n, null, "mobile-draw-calls", `${inf.drawCalls} draw calls on a phone (budget ${T.phoneCalls})`);
      if (inf.triangles > T.phoneTris) add("WARN", vp.n, null, "mobile-triangles", `${(inf.triangles / 1e3).toFixed(0)}k triangles on a phone (budget ${T.phoneTris / 1e3}k)`);
      if (vp.w / vp.h < 0.85 && inf.rail !== "mobile") add("WARN", vp.n, null, "no-mobile-rail", "portrait is reusing the desktop rail — author scene.shotsMobile");
      if (!inf.coarse) add("WARN", vp.n, null, "touch-emulation", "viewport was not detected as coarse-pointer");
    }
    if (vp.n === "desktop" || vp.n === "mobile") {
      await page.evaluate(() => window.__aura.release()); await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(500);
      await page.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.5)); await page.waitForTimeout(gpu ? 1500 : 4500);
      const after = await page.evaluate(() => { const i = window.__aura.info(); return { p: i.p, locked: i.locked }; });
      if (Math.abs(after.p - 0.5) > 0.12 || after.locked) add("BLOCKER", vp.n, null, "scroll-not-driving", `scrolling to 50% put the playhead at ${after.p.toFixed(2)} (locked=${after.locked}) — scroll must drive the camera`);
    }
  }
  if (vp.n === VIEWPORTS[0].n) {
    const s = info.shots, dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    if (s.length < 5) add("WARN", vp.n, null, "few-shots", `only ${s.length} shots — a 7–10 shot rail reads as a film`);
    if (s[0].at !== 0 || s[s.length - 1].at !== 1) add("BLOCKER", vp.n, null, "rail-range", "shots must start at at:0 and end at at:1");
    for (let i = 1; i < s.length; i++) if (s[i].at <= s[i - 1].at) add("BLOCKER", vp.n, null, "rail-order", `shot ${i} (at ${s[i].at}) is not after shot ${i - 1}`);
    let hold = false; for (let i = 1; i < s.length; i++) if (dist(s[i].pos, s[i - 1].pos) < 1.2 && dist(s[i].look, s[i - 1].look) < 1.2 && s[i].at - s[i - 1].at > 0.05) hold = true;
    if (!hold) add("WARN", vp.n, null, "no-hold", "no HOLD found (two consecutive shots with ~identical pos+look)");
    const fovs = s.map((x) => x.fov ?? 40); let swings = 0; for (let i = 1; i < fovs.length; i++) if (Math.abs(fovs[i] - fovs[i - 1]) >= 8) swings++;
    if (swings < 2) add("WARN", vp.n, null, "no-alternation", "lens never changes character (fov swings < 2) — alternate wide and telephoto");
    for (let i = 1; i < s.length; i++) if (dist(s[i].pos, s[i - 1].pos) > 70) add("WARN", vp.n, null, "teleport", `shots ${i - 1}→${i} move ${dist(s[i].pos, s[i - 1].pos).toFixed(0)} units`);
    const ch = chapters.filter((c) => !c.giant).sort((a, b) => a.a - b.a);
    if (ch.length) { // chapter rhythm only when chapters exist — a differently-built site is skipped, not failed
      if (ch[0].a > 0.001) add("WARN", vp.n, null, "late-open", `first chapter starts at ${ch[0].a}, not 0`);
      if (ch[ch.length - 1].b < 0.999) add("WARN", vp.n, null, "early-close", `last chapter ends at ${ch[ch.length - 1].b}, not 1`);
      let reach = 0; for (const c of ch) { if (c.a - reach > 0.2) add("WARN", vp.n, null, "silence", `no copy between p=${reach.toFixed(2)} and ${c.a.toFixed(2)}`); reach = Math.max(reach, c.b); }
      ch.forEach((c) => c.words > 14 && add("WARN", vp.n, null, "wordy", `chapter “${c.text.slice(0, 30)}…” headline has ${c.words} words — max ~12 per beat`));
    } else meta[vp.n].chaptersSkipped = true;
    if (info.drawCalls > 160) add("WARN", vp.n, null, "draw-calls", `${info.drawCalls} draw calls`);
    if (info.triangles > 1.8e6) add("WARN", vp.n, null, "triangles", `${(info.triangles / 1e6).toFixed(1)}M triangles`);
  }
  meta[vp.n].rows = rows.map(({ p, mean, sd, blown, edge, delta: d }) => ({ p, mean: +mean.toFixed(3), sd: +sd.toFixed(3), blown: +blown.toFixed(4), edge: +edge.toFixed(4), delta: d === undefined ? null : +d.toFixed(2) }));
  meta[vp.n].fps = await page.evaluate(() => window.__aura.perf?.() ?? null);
  logs.forEach((l) => add(/pageerror|Error/i.test(l) ? "BLOCKER" : "WARN", vp.n, null, "console", l.slice(0, 220)));
  const portrait = vp.w / vp.h < 0.85;
  sheet(frames[vp.n], portrait ? 7 : 4, portrait ? 190 : 420, `${out}/contact-${vp.n}.png`);
  await browser.close();
}
[...new Set(assets)].forEach((a) => add("BLOCKER", "all", null, "asset-404", `${a} — a missing asset (or an SPA fallback answering 200 with HTML for a file that does not exist)`));

/* ── 5 · resilience: no WebGL, reduced motion (VERIFIED, not just "no crash") ── */
if (!flag("no-resilience", false)) {
  browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/i.test(t) ? null : g.call(this, t, ...a); }; });
  const pg = await ctx.newPage(); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(url, { waitUntil: "networkidle" }); await pg.waitForTimeout(2000);
  const nw = await pg.evaluate(COLLECT, CFG);
  const loader = await pg.evaluate(() => { const l = document.querySelector(".aura-loader"); return !!l && getComputedStyle(l).visibility !== "hidden" && !l.classList.contains("is-done") && l.getBoundingClientRect().top >= 0; });
  await pg.screenshot({ path: `${out}/fallback-nowebgl.png` });
  if (errs.length) add("BLOCKER", "no-webgl", null, "fallback-crash", "page throws without WebGL: " + errs[0].slice(0, 160));
  else if (loader) add("BLOCKER", "no-webgl", null, "fallback-stuck", "without WebGL the loader never clears — the visitor sees a permanent loading screen");
  else if (nw.text < 120 || !nw.runs.length) add("BLOCKER", "no-webgl", null, "fallback-empty", `without WebGL the visitor sees ${nw.text} characters of copy — the static edition must carry the whole story (headline, support, action)`);
  else if (!nw.taps.length) {
    const any = await pg.evaluate(() => document.querySelectorAll("a[href],button").length);
    add("BLOCKER", "no-webgl", null, "fallback-no-action", any ? `without WebGL there are ${any} link(s)/button(s) but none ABOVE THE FOLD at 1280×800 → DO: use AuraExperience ≥ v19 (it lifts the first a[href]/button into the static header), or add \`.aura-static-head\` yourself — the first screen of the fallback must carry the action` : "without WebGL there is no link or button anywhere on the page → DO: put one real <a href> in the last chapter (class name does not matter); AuraExperience ≥ v19 repeats it in the static header, above the fold");
  }
  { const generic = /^(sans-serif|serif|system-ui|ui-sans-serif|ui-serif|ui-monospace|monospace|cursive|fantasy|ui-rounded)$/i, bad = nw.runs.filter((q) => !generic.test(String(q.ff).split(",").pop().trim().replace(/["']/g, "")));
    if (bad.length) add("BLOCKER", "no-webgl", null, "fallback-font", `“${bad[0].t}” is set in \`${String(bad[0].ff).slice(0, 60)}\` — no generic family at the end of the stack, so the browser falls back to Times while headings stay sans (${bad.length} text run(s)) → DO: give the root a stack that ends in sans-serif / system-ui (aura.css ≥ v19: \`.aura-root { font-family: var(--aura-body) }\`), and make sure custom body elements inherit it`); }
  await ctx.close();

  if (!flag("skip-motion", false)) {
  const rm = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const pr = await rm.newPage(); const e2 = []; pr.on("pageerror", (e) => e2.push(e.message));
  await pr.goto(withQ(url, `tier=${flag("tier-desktop", "high")}`), { waitUntil: "networkidle" });
  await pr.waitForFunction(() => window.__aura, null, { timeout: 60000 }).catch(() => {});
  await pr.waitForTimeout(3500);
  if (e2.length) add("BLOCKER", "reduced-motion", null, "rm-crash", e2[0].slice(0, 160));
  else if (await pr.evaluate(() => !!window.__aura)) {
    const st = await pr.evaluate(() => ({ m: window.__aura.info().motion, anim: document.getAnimations().filter((a) => a.playState === "running" && a.effect?.getTiming().iterations === Infinity).length }));
    const A = PNG.sync.read(await pr.screenshot()); await pr.waitForTimeout(1500); const B = PNG.sync.read(await pr.screenshot());
    const d = delta(metrics(A).small.lum, metrics(B).small.lum);
    if (!st.m.reduced) add("BLOCKER", "reduced-motion", null, "rm-ignored", "prefers-reduced-motion is set but the engine reports reduced=false");
    else if (!st.m.frozen) add("BLOCKER", "reduced-motion", null, "rm-not-frozen", `ambient time advanced to ${st.m.ambientTime.toFixed(2)}s under reduced motion — scene idle motion must be driven by Frame.time`);
    if (d > T.rmDelta) add("BLOCKER", "reduced-motion", null, "rm-moving", `two frames 1.5 s apart differ by Δ${d.toFixed(3)} (limit ${T.rmDelta}) — something is still moving under reduced motion (grain, particles, CSS, video)`);
    if (st.anim) add("WARN", "reduced-motion", null, "rm-css-anim", `${st.anim} infinite CSS animation(s) still running under reduced motion`);
    meta.reducedMotion = { ...st, delta: +d.toFixed(4) };
  }
  await rm.close();
  // the opposite check: a normal-motion page that never changes is a dead scene, not a calm one
  const nm = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const pn = await nm.newPage();
  await pn.goto(withQ(url, `tier=${flag("tier-desktop", "high")}`), { waitUntil: "networkidle" }); await pn.waitForFunction(() => window.__aura, null, { timeout: 60000 }).catch(() => {}); await pn.waitForTimeout(2500);
  if (await pn.evaluate(() => !!window.__aura)) {
    const A = PNG.sync.read(await pn.screenshot()); await pn.waitForTimeout(1200); const B = PNG.sync.read(await pn.screenshot());
    if (delta(metrics(A).small.lum, metrics(B).small.lum) < 0.01) add("WARN", "motion", null, "dead-scene", "nothing moves for 1.2 s at a fixed playhead — add ambient life (drift, shimmer, orbit) driven by Frame.time");
  }
  await nm.close();
  }
}
await browser?.close();
server?.close();

/* ── typecheck ── */
if (flag("tsc", false)) {
  try { execSync("npx tsc --noEmit", { stdio: "pipe" }); } catch (e) { add("BLOCKER", "project", null, "tsc", String(e.stdout || e.message).split("\n").filter(Boolean).slice(0, 3).join(" | ").slice(0, 400)); }
}

/* ── fingerprint of the look (for convergence detection) ── */
const top = [...fp.hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => ({ rgb: [((k >> 4) & 3) * 85, ((k >> 2) & 3) * 85, (k & 3) * 85], share: v }));
const tot = top.reduce((a, b) => a + b.share, 0) || 1; top.forEach((t) => (t.share = +(t.share / tot).toFixed(3)));
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const fingerprint = { palette: top, luma: +avg(fp.luma).toFixed(3), edge: +avg(fp.edge).toFixed(4), sat: +avg(fp.sat).toFixed(3) };
const fpDist = (a, b) => Math.hypot(Math.abs(a.luma - b.luma) * 2, Math.abs(a.sat - b.sat) * 2, Math.abs(a.edge - b.edge) * 20, ...a.palette.slice(0, 2).map((c, i) => Math.hypot(...c.rgb.map((v, k) => (v - (b.palette[i]?.rgb[k] ?? 0)) / 255)) * 0.5));

/* ── score: FLOORS. Per-rule caps so one repeated defect cannot zero a pillar. ── */
const vpm = VIEWPORTS[0].n, rowsD = meta[vpm]?.rows ?? [];
const cnt = (code, vp) => issues.filter((i) => i.code === code && (!vp || i.vp === vp)).length;
const pen = (code, each, cap, vp) => Math.min(cap, cnt(code, vp) * each);
const blockers = issues.filter((i) => i.level === "BLOCKER").length;
const frac = (bad) => Math.max(0, 1 - bad / Math.max(1, rowsD.length));
const atmosphere = Math.round(20 * (frac(cnt("flat", vpm) + cnt("empty", vpm)) * 0.4 + frac(cnt("blown", vpm) + cnt("bright", vpm)) * 0.2 + frac(cnt("dark", vpm)) * 0.4));
const unbroken = Math.max(0, Math.round(15 - pen("jump-cut", 3, 9) - pen("console", 4, 8) - pen("rail-range", 10, 10) - pen("rail-order", 5, 10) - pen("teleport", 3, 6) - pen("no-engine", 20, 20) - pen("asset-404", 5, 10) - pen("tsc", 8, 8) - pen("dead-scene", 3, 3)));
const rhythm = Math.max(0, Math.round(15 - pen("no-hold", 6, 6) - pen("no-alternation", 4, 4) - pen("few-shots", 3, 3) - pen("silence", 2, 6) - pen("dead-zone", 1.2, 5, vpm) - pen("wordy", 1.5, 4.5) - pen("empty-open", 6, 6) - pen("empty-close", 6, 6) - pen("no-cta", 4, 4) - pen("late-open", 2, 2) - pen("early-close", 2, 2)));
const craft = Math.max(0, Math.round(15 - pen("collision", 3, 9) - pen("clipped-copy", 2, 8) - pen("fallback-crash", 8, 8) - pen("fallback-stuck", 8, 8) - pen("fallback-empty", 6, 6) - pen("fallback-no-action", 3, 3) - pen("fallback-font", 3, 3) - pen("draw-calls", 3, 3) - pen("triangles", 3, 3) - pen("rm-moving", 5, 5) - pen("rm-not-frozen", 4, 4) - pen("rm-ignored", 4, 4) - pen("rm-crash", 6, 6)));
const mobilePts = Math.max(0, Math.round(15 - pen("tiny-text", 1.5, 5) - pen("small-text", 0.4, 2) - pen("cta-wrap", 4, 4) - pen("cta-font", 0.5, 1.5) - pen("tap-target", 4, 6) - pen("h-scroll", 6, 6) - pen("contrast", 0.5, 2) - pen("contrast-fail", 1.5, 6) - pen("mobile-draw-calls", 2, 2) - pen("mobile-triangles", 2, 2) - pen("no-mobile-rail", 3, 3) - pen("scroll-not-driving", 8, 8) - pen("touch-emulation", 2, 2)));
const auto = atmosphere + unbroken + rhythm + craft + mobilePts;

/* ── compare ── */
let cmp = "";
const cmpPath = flag("compare", null);
if (typeof cmpPath === "string" && existsSync(cmpPath)) {
  const prev = JSON.parse(readFileSync(cmpPath, "utf8")), key = (i) => `${i.level}|${i.code}|${i.vp}`;
  const a = new Set(prev.issues.map(key)), b = new Set(issues.map(key));
  const fresh = [...b].filter((k) => !a.has(k)), fixed = [...a].filter((k) => !b.has(k));
  const dist = prev.fingerprint ? fpDist(fingerprint, prev.fingerprint) : null;
  cmp = `\n## Compared with ${cmpPath} (audit ${prev.auditVersion ?? "≤2"}, profile ${prev.profile ?? "?"} → now ${AUDIT_VERSION}/${PROFILE})\n` +
    `${prev.auditVersion !== AUDIT_VERSION ? `**The gate itself changed between these runs** (${prev.auditVersion ?? "v2"} → ${AUDIT_VERSION}); score deltas are not comparable. Compare issue lists instead.\n` : "Same gate version: score deltas are comparable.\n"}` +
    `- new: ${fresh.join(", ") || "none"}\n- fixed: ${fixed.join(", ") || "none"}\n` + (dist !== null ? `- look distance: ${dist.toFixed(3)}${dist < 0.12 ? " — **CONVERGENCE: this world looks like the compared one.** Change ground, key/sky colours and grade (looks.ts)." : ""}\n` : "");
  if (dist !== null && dist < 0.12) add("WARN", "all", null, "look-convergence", `look fingerprint is ${dist.toFixed(3)} from ${cmpPath} — pick a different look (references/18)`);
}

const grouped = {};
issues.forEach((i) => {
  const k = `${i.level}|${i.code}|${i.vp}|${i.t ?? ""}`, g = grouped[k];
  if (!g) { grouped[k] = { ...i, ps: [i.p] }; return; }
  g.ps.push(i.p);
  if (i.fix && (!g.fix || (i.fix.plate ?? 0) > (g.fix.plate ?? 0) || (i.fix.kind === "subject" && g.fix.kind !== "subject"))) { g.fix = i.fix; g.msg = i.msg; } // report the WORST frame's number — fixing it fixes the others
});
const lines = Object.values(grouped).sort((a, b) => (a.level === b.level ? 0 : a.level === "BLOCKER" ? -1 : 1)).map((g) => `- **${g.level}** \`${g.code}\` · ${g.vp}${g.ps.some((p) => p !== null) ? ` · p=${[...new Set(g.ps.filter((p) => p !== null))].join(", ")}` : ""} — ${g.msg}`);
/* ordered, deduplicated "do this" list: blockers first; within a level the most frequent finding first */
const doList = (() => {
  const seen = new Map();
  for (const g of Object.values(grouped)) {
    const m = /→ DO: (.*)$/s.exec(g.msg), todo = g.fix?.do ?? (m ? m[1] : null) ?? g.msg, key = g.code + "|" + todo.replace(/\d+(\.\d+)?/g, "#");
    const e = seen.get(key) ?? { level: g.level, code: g.code, vps: new Set(), todo, n: 0 }; e.vps.add(g.vp); e.n += g.ps.length; if (g.level === "BLOCKER") e.level = "BLOCKER"; seen.set(key, e);
  }
  return [...seen.values()].sort((a, b) => (a.level === b.level ? b.n - a.n : a.level === "BLOCKER" ? -1 : 1)).map((e) => ({ level: e.level, code: e.code, where: [...e.vps].join(", "), frames: e.n, todo: e.todo }));
})();
const md = `# AURA audit v${AUDIT_VERSION} (${PROFILE}) — ${url}\n\n**Hygiene score: ${auto}/80** (atmosphere ${atmosphere}/20 · unbroken ${unbroken}/15 · rhythm ${rhythm}/15 · craft ${craft}/15 · mobile & legibility ${mobilePts}/15) · blockers: ${blockers}\n\n` +
  `> This number says nothing is BROKEN. It does not say the work is GOOD — a 6.5/10 and a 7.5/10 site have both scored 80/80 and 65/80. Fill in \`${out}/TASTE.md\` from the contact sheets; ship on the human total.\n${cmp}\n` +
  `## Fix these first (ordered — each line is one concrete move)\n${doList.slice(0, 12).map((d, i) => `${i + 1}. **${d.level}** \`${d.code}\` (${d.where}, ${d.frames} frame${d.frames === 1 ? "" : "s"}) — ${d.todo}`).join("\n") || "_nothing to fix — now fill in TASTE.md_"}\n\n## Every finding\n${lines.join("\n") || "_none_"}\n\n## Device\n${Object.entries(meta).filter(([, v]) => v?.device).map(([k, v]) => `- ${k}: tier **${v.tier}** · ${v.device.renderer.slice(0, 60)} · ${v.device.source}${v.device.gpuMsPerMP ? ` ${v.device.gpuMsPerMP.toFixed(2)} ms/MP` : ""} · ${v.mode} mode · rail ${v.rail}${v.chaptersSkipped ? " · no chapters found (rhythm checks skipped)" : ""}`).join("\n")}\n\n` +
  `## Per-frame (${vpm})\n| p | luma | σ | blown | edge | Δ prev |\n|---|---|---|---|---|---|\n${rowsD.map((r) => `| ${r.p} | ${r.mean} | ${r.sd} | ${r.blown} | ${r.edge} | ${r.delta ?? "—"} |`).join("\n")}\n`;
writeFileSync(`${out}/REPORT.md`, md);
{
  const fpTxt = `${JSON.stringify(fingerprint.palette.slice(0, 2).map((c) => c.rgb))}, luma ${fingerprint.luma}`;
  const tpl = ["TASTE.template.md", "../TASTE.template.md", "../../templates/TASTE.template.md"].map((q) => join(HERE, q)).find((q) => existsSync(q));
  const body = tpl ? readFileSync(tpl, "utf8") : "# TASTE — human rubric\n\nScore the 10 questions in SKILL.md §8 from the contact sheets. Total /100, ship at ≥ 85.\n\nFingerprint: {{FINGERPRINT}}\n";
  writeFileSync(`${out}/TASTE.md`, body.replaceAll("{{FINGERPRINT}}", fpTxt).replaceAll("{{OUT}}", out).replaceAll("{{AUDIT}}", `${auto}/80 · ${blockers} blockers`));
}
writeFileSync(`${out}/fixes.json`, JSON.stringify({ auditVersion: AUDIT_VERSION, blockers, fixes: doList }, null, 2));
writeFileSync(`${out}/report.json`, JSON.stringify({ auditVersion: AUDIT_VERSION, profile: PROFILE, thresholds: T, url, auto: { total: auto, atmosphere, unbroken, rhythm, craft, mobile: mobilePts }, blockers, issues, fingerprint, meta: Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, { ...v, shots: undefined }])) }, null, 2));
console.log(md);
console.log(`\n→ ${out}/REPORT.md (start at “Fix these first”) · ${out}/fixes.json · ${out}/TASTE.md · ${out}/contact-*.png   (now LOOK at the contact sheets)`);
process.exit(blockers ? 1 : 0);
