import { notFound, redirect } from "next/navigation";
import { REG_ITEMS, TEXT_EFFECTS, getItem } from "@/lib/registry";
import { readItem } from "@/lib/registry-server";
import { ItemView } from "@/views/RegistryViews";

export const dynamicParams = false;
export const generateStaticParams = () => REG_ITEMS.filter((i) => i.category !== TEXT_EFFECTS).map((i) => ({ category: i.category, slug: i.slug }));

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const item = getItem(category, slug);
  return { title: item ? `${item.name} — Aurelius components` : "Not found", description: item?.tagline };
}

export default async function Page({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  if (category === TEXT_EFFECTS) redirect(`/text-effects/${slug}`);
  const item = getItem(category, slug);
  if (!item) notFound();
  const { code, readme, body } = readItem(category, slug);
  return <ItemView item={item} code={code} readme={readme} body={body} />;
}
