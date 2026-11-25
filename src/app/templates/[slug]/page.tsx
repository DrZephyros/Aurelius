import { TEMPLATES } from "@/lib/templates";
import { readSource } from "@/lib/zip";
import { TemplateView } from "@/views/client";

export const dynamicParams = false;
export const generateStaticParams = () => TEMPLATES.map((t) => ({ slug: t.slug }));

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const files = (["main.js", "index.html", "style.css"] as const).map((name) => ({ name, code: readSource(slug, name) }));
  return <TemplateView slug={slug} files={files} />;
}
