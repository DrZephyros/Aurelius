"use client";

import { useState } from "react";
import { CommandPalette } from "./command-palette";

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("—");
  const go = (l: string) => () => setLast(l);
  return (
    <div className="text-center">
      <button onClick={() => setOpen(true)} style={{ padding: "12px 22px", borderRadius: 999, border: "1px solid rgb(255 255 255/.25)", fontSize: 14 }}>Open palette <kbd style={{ marginLeft: 8, opacity: 0.55, fontSize: 12 }}>⌘K</kbd></button>
      <div style={{ marginTop: 14, fontSize: 13, opacity: 0.6 }}>Last action: {last}</div>
      <CommandPalette open={open} onOpenChange={setOpen} commands={[
        { id: "new", label: "Create new project", group: "Actions", hint: "N", onSelect: go("new project") },
        { id: "inv", label: "Invite teammate", group: "Actions", onSelect: go("invite") },
        { id: "dash", label: "Go to dashboard", group: "Navigate", onSelect: go("dashboard") },
        { id: "set", label: "Open settings", group: "Navigate", keywords: "preferences", onSelect: go("settings") },
        { id: "theme", label: "Toggle theme", group: "Preferences", onSelect: go("theme") },
      ]} />
    </div>
  );
}
