import { bump } from "@/lib/stats";
import { bundleBySlug } from "./data";

/* Zips the real source of src/bundles (engine, scenes, pages, CSS) — built in the browser. */

export async function downloadBundle(slug: string) {
  const b = bundleBySlug(slug);
  if (!b) return;
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const root = zip.folder(`aurelius-bundle-${slug}`)!;
  const { default: SRC } = await import("@/generated/raw-bundles");
  for (const [path, text] of Object.entries(SRC)) root.file(path.replace("/src/bundles/", "src/bundles/"), text);
  root.file("README.md", `# ${b.name} — Aurelius bundle

${b.blurb}

## What is inside
- \`src/bundles/scenes/${slug}.ts\` — the WebGL world (spline camera rail, lights, geometry, particles)
- \`src/bundles/engine.ts\` — the cinematic runtime: damped scroll playhead, bloom, grain, FOV kick, banking
- \`src/bundles/BundleLanding.tsx\` — scroll-driven chapters + HUD
- \`src/bundles/BundlePages.tsx\` — pricing, sign-in, reserve/order and account pages (localStorage-backed)
- \`src/bundles/data.ts\` — **all copy, theme tokens and prices live here**
- \`src/bundles/bundle.css\` — styles, themed through CSS variables

## Use it
1. \`npm i three\` in a React + Vite project.
2. Copy \`src/bundles\` in. It imports \`Link\` and \`navigate\` from a tiny router (\`@/lib/router\`) — swap those two imports for your own router.
3. Render \`<BundleShell slug="${slug}" page={page} />\` for the routes \`/${slug}\`, \`/${slug}/pricing\`, \`/${slug}/signin\`, \`/${slug}/reserve\`, \`/${slug}/account\`.

## Make it yours
- Change copy, prices and colours in \`data.ts\`.
- Re-route the camera by editing the \`rail\` keyframes at the bottom of the scene file — position and look-at points are plain arrays.
- To ship only this bundle, delete the other scenes and trim \`SCENES\` in \`BundleShell.tsx\` (BundleLanding reads \`helmHeading\` from helm.ts — inline it if you remove that file).

## Prompt for your coding agent
> Read src/bundles/data.ts and the ${slug} scene. Rebrand this bundle for [YOUR BRAND]: new name, copy and prices in data.ts, new palette tokens, and keep the camera rail. Do not touch engine.ts.
`);
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `aurelius-bundle-${slug}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  bump("bundle-" + slug, "download");
}
