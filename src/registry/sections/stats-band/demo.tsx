"use client";

import { StatsBand } from "./stats-band";

export default function Demo() {
  return <div style={{ width: "100%", maxWidth: 760 }}><StatsBand stats={[{ value: 12400, suffix: "+", label: "Teams shipping" }, { value: 99.99, suffix: "%", label: "Uptime", decimals: 2 }, { value: 38, suffix: "ms", label: "Median latency" }]} /></div>;
}
