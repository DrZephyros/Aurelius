"use client";

import { Marquee } from "./marquee";

const chip: React.CSSProperties = { padding: "10px 20px", borderRadius: 999, border: "1px solid rgb(255 255 255/.14)", background: "rgb(255 255 255/.05)", whiteSpace: "nowrap", fontSize: 14 };

export default function Demo() {
  const a = ["Next.js", "React", "Tailwind", "Three.js", "Drizzle", "Postgres", "Vercel", "TypeScript"];
  return (
    <div style={{ width: "100%", display: "grid", gap: 14 }}>
      <Marquee duration={26}>{a.map((x) => <span key={x} style={chip}>{x}</span>)}</Marquee>
      <Marquee duration={32} reverse>{a.slice().reverse().map((x) => <span key={x} style={chip}>{x}</span>)}</Marquee>
    </div>
  );
}
