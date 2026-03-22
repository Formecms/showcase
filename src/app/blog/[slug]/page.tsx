import { getBlogPost, getAllBlogPosts, resolveEntryRef, resolveAssetRef } from "@/lib/content";
import { BlogPostLayout } from "@/components/blog/blog-post-layout";
import { BlogCard } from "@/components/blog/blog-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFields } from "@/lib/types";
import type { BlogPostFields, AuthorFields } from "@/lib/types";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogPost(slug);
  if (!result) return {};

  const fields = getFields<BlogPostFields>(result.post);
  return {
    title: `${fields.title} | Forme Showcase`,
    description: fields.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const result = await getBlogPost(slug);

  if (!result) {
    notFound();
  }

  const { post, includes } = result;
  const fields = getFields<BlogPostFields>(post);

  // Resolve author and image
  const authorEntry = resolveEntryRef(fields.author, includes) ?? undefined;
  const imageAsset = resolveAssetRef(fields.featuredImage, includes) ?? undefined;
  const authorAvatarAsset = authorEntry
    ? (resolveAssetRef(getFields<AuthorFields>(authorEntry).avatar, includes) ?? undefined)
    : undefined;

  // Get related posts (other posts in same category or just latest)
  const { posts: allPosts, includes: allIncludes } = await getAllBlogPosts();
  const relatedPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <>
      <div className="pt-16">
        <BlogPostLayout
          entry={post}
          authorEntry={authorEntry}
          imageAsset={imageAsset}
          authorAvatarAsset={authorAvatarAsset}
        />
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-sand-100 py-16 md:py-24 border-t border-sand-200">
          <div className="max-w-content mx-auto px-6">
            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl text-ocean-900 mb-8">
                More from the blog
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard
                    key={relatedPost.id}
                    entry={relatedPost}
                    authorEntry={
                      resolveEntryRef(relatedPost.fields.author, allIncludes) ?? undefined
                    }
                    imageAsset={
                      resolveAssetRef(relatedPost.fields.featuredImage, allIncludes) ?? undefined
                    }
                  />
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}
    </>
  );
}
