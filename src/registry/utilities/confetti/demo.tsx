"use client";

import { fireConfetti } from "./confetti";

export default function Demo() {
  return (
    <button onClick={(e) => fireConfetti({ x: e.clientX, y: e.clientY })} style={{ padding: "14px 30px", borderRadius: 999, background: "linear-gradient(110deg,#5cffc4,#3de7ff 55%,#a58bff)", color: "#021510", fontWeight: 700, fontSize: 15 }}>
      🎉 Celebrate
    </button>
  );
}
