import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ExampleExperience from "./aura/ExampleExperience";

// Replace ExampleExperience with your own <AuraExperience build={yourScene}>…chapters…</AuraExperience>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExampleExperience />
  </StrictMode>,
);
