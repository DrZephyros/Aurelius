import type { Metadata } from "next";
import { ComponentsHub } from "@/views/RegistryViews";

export const metadata: Metadata = { title: "Components — Aurelius", description: "Drop-in React components with an agent-ready README for each." };
export default function Page() { return <ComponentsHub />; }
