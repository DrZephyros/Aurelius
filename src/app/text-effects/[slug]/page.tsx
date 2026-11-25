import { notFound } from "next/navigation";
import { TEXT_EFFECTS, getItem, itemsOf } from "@/lib/registry";
import { readItem } from "@/lib/registry-server";
import { ItemView } from "@/views/RegistryViews";

export const dynamicParams = false;
export const generateStaticParams = () => itemsOf(TEXT_EFFECTS).map((i) => ({ slug: i.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getItem(TEXT_EFFECTS, slug);
  return { title: item ? `${item.name} — Aurelius text effects` : "Not found", description: item?.tagline };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getItem(TEXT_EFFECTS, slug);
  if (!item) notFound();
  const { code, readme, body } = readItem(TEXT_EFFECTS, slug);
  return <ItemView item={item} code={code} readme={readme} body={body} />;
}
