import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/space-grotesk";
import "@fontsource/jetbrains-mono/500.css";
import ExampleExperience from "./aura/ExampleExperience";
import UmbraExperience from "./aura/UmbraExperience";

// ?world=umbra shows the second reference world (an event site). Default: Obsidian Gate (a product / object).
const World = new URLSearchParams(location.search).get("world") === "umbra" ? UmbraExperience : ExampleExperience;

// Replace ExampleExperience with your own <AuraExperience build={yourScene}>…chapters…</AuraExperience>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <World />
  </StrictMode>,
);
