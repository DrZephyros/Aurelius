"use client";

import { Skeleton, SkeletonText } from "./skeleton";

export default function Demo() {
  return (
    <div style={{ width: "100%", maxWidth: 340, display: "grid", gap: 16, padding: 18, borderRadius: 20, border: "1px solid rgb(255 255 255/.1)" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}><Skeleton width={46} height={46} radius={999} /><div style={{ flex: 1, display: "grid", gap: 8 }}><Skeleton height={14} width="55%" /><Skeleton height={11} width="35%" /></div></div>
      <Skeleton height={120} radius={14} />
      <SkeletonText lines={3} />
    </div>
  );
}
