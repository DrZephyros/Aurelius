"use client";

import { useState } from "react";
import { OtpInput } from "./otp-input";

export default function Demo() {
  const [state, setState] = useState<"idle" | "bad" | "ok">("idle");
  return (
    <div className="text-center">
      <OtpInput key={state} error={state === "bad"} autoFocus onChange={() => setState("idle")} onComplete={(c) => setState(c === "424242" ? "ok" : "bad")} />
      <div style={{ marginTop: 16, fontSize: 13, height: 20, color: state === "ok" ? "#5cffc4" : state === "bad" ? "#ff6b81" : undefined, opacity: state === "idle" ? 0.55 : 1 }}>
        {state === "ok" ? "Verified ✓" : state === "bad" ? "Wrong code — try again" : "Try 424242 (paste works too)"}
      </div>
    </div>
  );
}
