import fs from "node:fs";
import path from "node:path";
import { ELEMENTS } from "@/lib/collections";
import { DemoView } from "@/views/client";

export const dynamicParams = false;
export const generateStaticParams = () => ELEMENTS.map((d) => ({ slug: d.slug }));

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const source = fs.readFileSync(path.join(process.cwd(), "kit-src", "elements", slug + ".html"), "utf8");
  return <DemoView kind="element" slug={slug} source={source} />;
}
