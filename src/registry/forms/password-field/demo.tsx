"use client";

import { useState } from "react";
import { PasswordField } from "./password-field";

export default function Demo() {
  const [p, setP] = useState("");
  return <div style={{ width: "100%", maxWidth: 340 }}><PasswordField value={p} onChange={setP} /></div>;
}
