"use client";

import { ComparisonCards } from "./comparison-cards";

export default function Demo() {
  return (
    <div style={{ width: "100%", maxWidth: 880 }}>
      <ComparisonCards
        eyebrow="The difference"
        title={<>Same request. <span style={{ color: "#a58bff" }}>Different result.</span></>}
        labels={["Just an AI", "With AURA"]}
        rows={[
          { title: "Looks", before: "Like every other AI site.", after: "Custom 3D, made for your brand." },
          { title: "Your time", before: "Hours of back and forth.", after: "One prompt. Done." },
          { title: "Result", before: "Forgettable.", after: "People stop and remember it." },
        ]}
      />
    </div>
  );
}
