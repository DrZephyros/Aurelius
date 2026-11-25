import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/space-grotesk/wght.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — 3D websites, components and text effects for vibecoders`,
  description: "Project Aurelius: cinematic scroll-driven 3D websites, app pages and a modular library of drop-in components and text effects — as plain code with an agent-ready README for every piece.",
};
export const viewport: Viewport = { themeColor: "#03050b" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-fg antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
