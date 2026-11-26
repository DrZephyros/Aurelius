import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/space-grotesk";
import "@fontsource/jetbrains-mono/500.css";
import ExampleExperience from "./aura/ExampleExperience";
import UmbraExperience from "./aura/UmbraExperience";
import HaloExperience from "./aura/HaloExperience";

// ?world=halo   → NOCTA, a PRODUCT altar (exploded ascent, studio env, asteroid)
// ?world=umbra  → an EVENT / terrain world (eclipse sky, light shafts)
// default       → Obsidian Gate, an OBJECT world (crystal, rings, mirror floor)
const w = new URLSearchParams(location.search).get("world");
const World = w === "halo" ? HaloExperience : w === "umbra" ? UmbraExperience : ExampleExperience;

// Replace with your own <AuraExperience build={yourScene}>…chapters…</AuraExperience>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <World />
  </StrictMode>,
);
