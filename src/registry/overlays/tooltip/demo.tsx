"use client";

import { Tooltip } from "./tooltip";

export default function Demo() {
  const b: React.CSSProperties = { padding: "10px 18px", borderRadius: 999, border: "1px solid rgb(255 255 255/.25)", fontSize: 14 };
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
      {(["top", "right", "bottom", "left"] as const).map((s) => <Tooltip key={s} content={`Tooltip on the ${s}`} side={s}><button style={b}>{s}</button></Tooltip>)}
    </div>
  );
}
