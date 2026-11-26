"use client";

import { Timeline } from "./timeline";

export default function Demo() {
  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <Timeline items={[{ date: "Jan", title: "Idea", description: "A napkin sketch." }, { date: "Mar", title: "Prototype", description: "First users, first bugs." }, { date: "Jun", title: "Launch", description: "Front page of Hacker News." }]} />
    </div>
  );
}
