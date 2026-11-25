import { notFound, redirect } from "next/navigation";
import { REG_CATS, TEXT_EFFECTS, catBySlug } from "@/lib/registry";
import { CategoryView } from "@/views/RegistryViews";

export const dynamicParams = false;
export const generateStaticParams = () => REG_CATS.filter((c) => c.slug !== TEXT_EFFECTS).map((c) => ({ category: c.slug }));

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (category === TEXT_EFFECTS) redirect("/text-effects");
  if (!catBySlug(category)) notFound();
  return <CategoryView category={category} />;
}
