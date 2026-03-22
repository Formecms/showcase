import Link from "next/link";
import { RichText } from "@/components/ui/rich-text";
import { getFields } from "@/lib/types";
import type { DlvEntry, DlvAsset } from "@/lib/types";
import type { BlogPostFields, AuthorFields } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface BlogPostLayoutProps {
  entry: DlvEntry;
  authorEntry?: DlvEntry;
  imageAsset?: DlvAsset;
  authorAvatarAsset?: DlvAsset;
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function BlogPostLayout({
  entry,
  authorEntry,
  imageAsset,
  authorAvatarAsset,
}: BlogPostLayoutProps) {
  const fields = getFields<BlogPostFields>(entry);
  const author = authorEntry ? getFields<AuthorFields>(authorEntry) : undefined;
  const readingTime = estimateReadingTime(fields.body);

  return (
    <article>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-ocean-950/10">
        <div className="h-full bg-reef-500 reading-progress" />
      </div>

      {/* Hero image */}
      {imageAsset && (
        <div className="w-full aspect-[21/9] max-h-[480px] overflow-hidden bg-sand-100">
          <img
            src={imageAsset.url}
            alt={imageAsset.alt ?? fields.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-[680px] mx-auto px-6 py-12 md:py-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-reef-600 hover:text-reef-500 mb-8 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* Category */}
        {fields.category && (
          <span className="inline-block bg-reef-50 text-reef-600 text-meta font-medium px-3 py-1 rounded-full mb-4">
            {fields.category}
          </span>
        )}

        {/* Title */}
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] leading-tight text-ocean-900 mb-6">
          {fields.title}
        </h1>

        {/* Author bar */}
        <div className="flex items-center gap-4 pb-8 mb-8 border-b border-sand-200">
          {author && (
            <div className="flex items-center gap-3">
              {authorAvatarAsset ? (
                <img
                  src={authorAvatarAsset.url}
                  alt={author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-reef-50 flex items-center justify-center text-reef-600 font-semibold text-sm">
                  {author.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-ocean-900">{author.name}</p>
                {author.role && <p className="text-meta text-sand-500">{author.role}</p>}
              </div>
            </div>
          )}

          <div className="ml-auto flex items-center gap-4 text-meta text-sand-500">
            {fields.publishedDate && (
              <time dateTime={fields.publishedDate}>{formatDate(fields.publishedDate)}</time>
            )}
            <span>&middot;</span>
            <span>{readingTime} min read</span>
          </div>
        </div>

        {/* Body */}
        <RichText content={fields.body} />
      </div>
    </article>
  );
}
