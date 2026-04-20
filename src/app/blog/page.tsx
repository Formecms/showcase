import { getPage, getAllBlogPosts } from "@/lib/content";
import { resolveEntryRef, resolveAssetRef } from "@/lib/content";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { BlogCard } from "@/components/blog/blog-card";
import { ScrollReveal, StaggerChild } from "@/components/ui/scroll-reveal";
import type { Metadata } from "next";
import { getFields } from "@/lib/types";
import type { PageFields } from "@/lib/types";

export const revalidate = 3;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("stories");
  if (!page) return { title: "Stories | Cold Water Stories" };

  const fields = getFields<PageFields>(page.entry);
  return {
    title: fields.seoTitle ?? `${fields.title} | Cold Water Stories`,
    description: fields.seoDescription ?? undefined,
  };
}

export default async function BlogPage() {
  const [page, { posts, includes }] = await Promise.all([getPage("stories"), getAllBlogPosts()]);

  return (
    <>
      {/* Hero from CMS Page entry */}
      {page && page.sections.length > 0 ? (
        <SectionRenderer sections={page.sections} includes={page.includes} />
      ) : (
        <section className="bg-ocean-950 pt-32 pb-20">
          <div className="max-w-content mx-auto px-6">
            <div className="animate-hero-enter">
              <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-sand-50 mb-4">
                Stories
              </h1>
            </div>
          </div>
        </section>
      )}

      {/* Post grid */}
      <section className="bg-sand-50 py-16 md:py-24">
        <div className="max-w-content mx-auto px-6">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sand-500 text-lg">
                No stories yet. Run the seed script to create sample posts.
              </p>
            </div>
          ) : (
            <ScrollReveal stagger>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {posts.map((post) => {
                  const authorRef = post.fields.author;
                  const imageRef = post.fields.featuredImage;
                  return (
                    <StaggerChild key={post.id}>
                      <BlogCard
                        entry={post}
                        authorEntry={resolveEntryRef(authorRef, includes) ?? undefined}
                        imageAsset={resolveAssetRef(imageRef, includes) ?? undefined}
                      />
                    </StaggerChild>
                  );
                })}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </>
  );
}
