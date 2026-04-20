import { getPage } from "@/lib/content";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFields } from "@/lib/types";
import type { PageFields } from "@/lib/types";

export const revalidate = 3;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};

  const fields = getFields<PageFields>(page.entry);
  return {
    title: fields.seoTitle ?? `${fields.title} | Forme Showcase`,
    description: fields.seoDescription ?? undefined,
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;

  // Don't handle known routes
  if (slug === "home" || slug === "about" || slug === "blog" || slug === "stories") {
    notFound();
  }

  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return <SectionRenderer sections={page.sections} includes={page.includes} />;
}
