"use client";

import { SlidingTabs } from "./sliding-tabs";

export default function Demo() {
  return (
    <SlidingTabs
      tabs={[
        { id: "a", label: "Overview", content: <p style={{ opacity: 0.7 }}>A calm summary of everything that matters.</p> },
        { id: "b", label: "Activity", content: <p style={{ opacity: 0.7 }}>Every event, newest first.</p> },
        { id: "c", label: "Settings", content: <p style={{ opacity: 0.7 }}>Make it yours.</p> },
      ]}
    />
  );
}
