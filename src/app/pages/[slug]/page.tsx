import fs from "node:fs";
import path from "node:path";
import { PAGES } from "@/lib/collections";
import { DemoView } from "@/views/client";

export const dynamicParams = false;
export const generateStaticParams = () => PAGES.map((d) => ({ slug: d.slug }));

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const source = fs.readFileSync(path.join(process.cwd(), "kit-src", "pages", slug + ".html"), "utf8");
  return <DemoView kind="page" slug={slug} source={source} />;
}
