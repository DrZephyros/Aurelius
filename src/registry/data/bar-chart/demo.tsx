"use client";

import { BarChart } from "./bar-chart";

export default function Demo() {
  return <div style={{ width: "100%", maxWidth: 520 }}><BarChart data={[{ label: "Mon", value: 32 }, { label: "Tue", value: 54 }, { label: "Wed", value: 41 }, { label: "Thu", value: 78 }, { label: "Fri", value: 66 }, { label: "Sat", value: 38 }, { label: "Sun", value: 25 }]} format={(v) => `${v}k`} /></div>;
}
