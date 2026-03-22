import { getPage } from "@/lib/content";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFields } from "@/lib/types";
import type { PageFields } from "@/lib/types";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  if (!page) return {};

  const fields = getFields<PageFields>(page.entry);
  return {
    title: fields.seoTitle ?? `${fields.title} | Forme Showcase`,
    description: fields.seoDescription ?? undefined,
  };
}

export default async function AboutPage() {
  const page = await getPage("about");

  if (!page) {
    notFound();
  }

  return <SectionRenderer sections={page.sections} includes={page.includes} />;
}
