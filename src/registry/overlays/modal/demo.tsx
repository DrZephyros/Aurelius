"use client";

import { useState } from "react";
import { Modal } from "./modal";

export default function Demo() {
  const [p, setP] = useState<null | "center" | "right" | "bottom">(null);
  const b: React.CSSProperties = { padding: "10px 20px", borderRadius: 999, border: "1px solid rgb(255 255 255/.25)", fontSize: 14 };
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
      {(["center", "right", "bottom"] as const).map((x) => <button key={x} style={b} onClick={() => setP(x)}>Open {x}</button>)}
      <Modal open={p !== null} onClose={() => setP(null)} placement={p ?? "center"} title="Invite your team">
        <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: 15 }}>Focus is trapped, Esc closes, the page behind is locked and focus returns to the button.</p>
        <input placeholder="teammate@company.com" style={{ width: "100%", height: 46, marginTop: 14, padding: "0 14px", borderRadius: 12, border: "1px solid rgb(255 255 255/.16)", background: "rgb(255 255 255/.05)", color: "inherit" }} />
        <button onClick={() => setP(null)} style={{ ...b, marginTop: 16, background: "#5cffc4", color: "#021510", border: 0, fontWeight: 600 }}>Send invite</button>
      </Modal>
    </div>
  );
}
