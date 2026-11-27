import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/space-grotesk";
import "@fontsource/jetbrains-mono/500.css";
import ExampleExperience from "./aura/ExampleExperience";
import UmbraExperience from "./aura/UmbraExperience";
import HaloExperience from "./aura/HaloExperience";
import FolioExperience from "./aura/FolioExperience";
import MeridianExperience from "./aura/MeridianExperience";

// ?world=halo   → NOCTA, a PRODUCT altar (exploded ascent, studio env, asteroid)
// ?world=umbra  → an EVENT / terrain world (eclipse sky, light shafts)
// ?world=folio  → Mira, a FOLIO (portfolio / studio: projects on a helix, plates ignite on hold)
// ?world=meridian → MERIDIAN, a LIGHT world on the frontier modules (SDF hero, GPU particles, splats, AO + bokeh, probe, audio)
// default       → Obsidian Gate, an OBJECT world (crystal, rings, mirror floor)
const w = new URLSearchParams(location.search).get("world");
const World = w === "meridian" ? MeridianExperience : w === "folio" ? FolioExperience : w === "halo" ? HaloExperience : w === "umbra" ? UmbraExperience : ExampleExperience;

// Replace with your own <AuraExperience build={yourScene}>…chapters…</AuraExperience>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <World />
  </StrictMode>,
);
