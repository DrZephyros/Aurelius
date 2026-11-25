import type { Metadata } from "next";
import { CategoryView } from "@/views/RegistryViews";

export const metadata: Metadata = { title: "Text effects — Aurelius", description: "Import one onto any text: scramble, shimmer, split-reveal, rotating words, typewriter, scroll-lit, highlight, glitch, count-up." };
export default function Page() { return <CategoryView category="text-effects" />; }
