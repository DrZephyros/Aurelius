"use client";

import { useState } from "react";
import { FloatingLabelInput } from "./floating-label-input";

export default function Demo() {
  const [email, setEmail] = useState("");
  const bad = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email);
  return (
    <div style={{ width: "100%", maxWidth: 340, display: "grid", gap: 14 }}>
      <FloatingLabelInput label="Full name" autoComplete="name" />
      <FloatingLabelInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={bad ? "Enter a valid email address" : undefined} hint="We'll never share it." />
    </div>
  );
}
