import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aurelius — 3D websites, components, and the skill that makes them",
  description:
    "Project Aurelius: cinematic scroll-driven 3D websites, app pages, a modular component library — and the agent skill that builds AAA-grade immersive 3D websites from scratch.",
};

export const viewport: Viewport = { themeColor: "#03050b" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
