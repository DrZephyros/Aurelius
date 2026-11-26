# 12 · Product-hero playbook — websites that revolve around a 3D render of the product

Use this when the object is the reason the site exists (earbuds, headphones, watch, bottle, sneaker, phone, camera, instrument, jewellery, gadget, supplement jar). The goal: the visitor believes they are looking at a **marketing render from a $200k Cinema4D/Octane pipeline** — in real time.

## 1 · Where does the product come from? (pick the best you can get)

| Source | Quality | When |
| --- | --- | --- |
| **Client GLB / CAD export** | ★★★★★ | Ask for it first. Run `gltf-transform optimize --compress meshopt --texture-compress webp`. Re-author materials (see §3) — client materials are never good enough. |
| **AI image → 3D** (Meshy, Tripo, Hunyuan3D, Rodin, Luma) | ★★★☆☆ | Generate 4 clean orthographic reference images first (white background, 3/4 view, front, side, top). Export GLB, then **retopo-light**: decimate to < 80k tris, re-bake normals, replace materials. Always inspect for melted details; hide flaws with camera distance + rim light. |
| **Procedural, coded from primitives** | ★★★★☆ for hard-surface | Earbuds, dials, bottles, rings, lenses, knobs, cases: lathe + capsule + bevelled boxes + boolean-looking details. `starter/src/aura/objects.ts` has working builders you can restyle in minutes. Looks *cleaner* than a bad scan. |
| **Generated hero plate (image) + depth plane** | ★★★★☆ | When you only need ~±8° of parallax. Generate the product on its environment, depth-displace (`createDepthPlane`), put real particles in front. |

**Rule:** never ship an AI-generated mesh straight from the generator. Never ship a client mesh with its original materials.

## 2 · The environment is half the product
Hero-in-a-void is a template. Hero-in-a-**place** is a campaign. Pick an environment that *expresses the benefit* (see direction 01). Build it from `rock.ts` (cratered displaced ground, boulders), `terrain.ts` (dunes), or a mirror floor + backdrop. Use `scene.fog` to bury the far field so you only light what you need.

**Studio environment map (mandatory):** `createStudioEnv(renderer, {...})` in `studio.ts` builds a PMREM from a *procedural room of softboxes*: it gives metal and clearcoat something to reflect. A product without a designed environment map looks like a toy. Tune the **strip lights** in the env: long thin rectangles produce the luxury "highlight line" down curved surfaces.

## 3 · Material recipes that read as expensive
| Surface | Recipe |
| --- | --- |
| Piano-black lacquer | `obsidian()`: roughness .2–.3, clearcoat 1, clearcoatRoughness .03 |
| Anodised aluminium | metalness 1, roughness .32–.45 + `noiseTexture` as roughnessMap (±.08), subtle anisotropy |
| Brushed steel | roughnessMap from stretched noise (repeat 1×60), anisotropy .8 |
| Frosted glass / silicone | `MeshPhysicalMaterial` transmission .6, roughness .5, thickness 1, `sheen` 1 for soft-touch |
| Rubber/ear tip | roughness .75, sheen .6, sheenColor = accent 20 % |
| Emissive LED | `emissive(accent, 3)` + a tiny `PointLight` + `createGlow` sprite |
| Engraving / text | bump/normal from a canvas texture; never flat decals |
Add **micro-bevel everywhere** (round 0.01–0.03 units): sharp edges are the #1 tell of cheap CG — highlights live on bevels.

## 4 · Light rig for a product (Altar / Showroom)
1. **Key:** hard, cool, low-angle from the side opposite the environment's relief.
2. **Rim:** the strongest light. Behind and above; colour = accent or cold white. It separates the product from a dark background.
3. **Kicker strip:** an emissive plane / `RectAreaLight` (long & thin) grazing the curve — drives the highlight line.
4. **Fill:** hemisphere at 0.2–0.4 — never more; you want shadows.
5. **Practical:** the product's own light (LED, display, seam) — animate its intensity on a hold.
6. **Contact shadow:** a blurred dark disc under the product if it rests on something — mandatory for grounding.

## 5 · The five camera shots every product film needs
1. **Reveal** — silhouette/edge-light in the dark; product barely there.
2. **Macro A** — the signature material (fov 14–20°, 10–15 cm away, rack the highlight across it).
3. **Anatomy** — exploded view, camera slightly high, parts levitate in order of assembly.
4. **Context** — pull back into the environment; the object is small but still the brightest thing.
5. **Hero** — three-quarter, slightly low, perfectly lit, **hold ≥ 12 % of scroll**; the wordmark behind, the CTA reserved.

## 6 · Exploded-view technique (reuse)
- Model the product as a `Group` of named parts with a `rest` position and an `explode` vector (in local axis, usually Y or Z).
- Each part has its own **stagger window** within the explode chapter: `t_i = seg(p, a + i*δ, a + i*δ + w)`.
- Position = rest + explode × ease(t_i) · spread; add tiny rotation (≤ 6°) and a *label* (HTML, pinned via `project(part)`), drawn as a 1 px line + mono caption.
- Keep the parts aligned on ONE axis. A chaotic burst reads as "broken".

## 7 · Spec & copy rules for products
- 3 claims, not 12. Each a number + unit + noun ("48 dB", "30 h", "5.4 g").
- Numbers **count up** with the playhead (scrubbed, reversible).
- Spec table, reviews, FAQ, pricing → *after* the final frame on the same page, or on `/specs`, `/buy`. The film never has a content wall.
- The CTA says what happens: "Pre-order — ships March" beats "Learn more".

## 8 · Product film QA add-ons
- Take a still of frames at p = 0.05 / 0.45 / 0.8 and ask: *could this be in the brand's Instagram?* If not: lighting or materials.
- Zoom the screenshot to 200 %: are edges bevelled and highlights continuous? Aliasing on a hero edge = raise `msaa` / pixel ratio for that shot.
- Product occupies ≥ 38 % of frame height in the hero frame on desktop, ≥ 45 % on mobile.
