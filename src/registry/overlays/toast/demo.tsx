"use client";

import { ToastProvider, useToast } from "./toast";

function Buttons() {
  const toast = useToast();
  const b: React.CSSProperties = { padding: "10px 18px", borderRadius: 999, border: "1px solid rgb(255 255 255/.25)", fontSize: 14 };
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
      <button style={b} onClick={() => toast({ title: "Changes saved", description: "Your profile is up to date.", type: "success" })}>Success</button>
      <button style={b} onClick={() => toast({ title: "New version available", type: "info" })}>Info</button>
      <button style={b} onClick={() => toast({ title: "Payment failed", description: "Card was declined.", type: "error" })}>Error</button>
    </div>
  );
}

export default function Demo() {
  return <ToastProvider><Buttons /></ToastProvider>;
}
