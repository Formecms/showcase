import Link from "next/link";
import { getFields } from "@/lib/types";
import type { DlvEntry, DlvAsset } from "@/lib/types";
import type { BlogPostFields, AuthorFields } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface BlogCardProps {
  entry: DlvEntry;
  authorEntry?: DlvEntry;
  imageAsset?: DlvAsset;
}

export function BlogCard({ entry, authorEntry, imageAsset }: BlogCardProps) {
  const fields = getFields<BlogPostFields>(entry);
  const author = authorEntry ? getFields<AuthorFields>(authorEntry) : undefined;
  const slug = fields.slug;

  return (
    <Link href={`/blog/${slug}`} className="group block card-hover">
      <article className="bg-white border border-sand-200 rounded-lg overflow-hidden h-full hover:shadow-lg hover:border-reef-200 transition-all flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/9] bg-sand-100 flex-shrink-0">
          {imageAsset ? (
            <img
              src={imageAsset.url}
              alt={imageAsset.alt ?? fields.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out-expo"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-reef-50 to-sand-100">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-reef-300"
              >
                <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            </div>
          )}

          {/* Category badge */}
          {fields.category && (
            <span className="absolute top-4 left-4 bg-reef-500 text-white text-meta font-medium px-3 py-1 rounded-full">
              {fields.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 flex flex-col flex-grow">
          <h2 className="font-semibold text-ocean-900 group-hover:text-reef-600 transition-colors mb-2 text-base">
            {fields.title}
          </h2>

          {fields.excerpt && (
            <p className="text-sand-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
              {fields.excerpt}
            </p>
          )}

          {/* Meta — pushed to bottom */}
          <div className="flex items-center gap-3 text-meta text-sand-500 mt-auto">
            {author && (
              <>
                <span className="font-medium text-sand-700">{author.name}</span>
                <span>&middot;</span>
              </>
            )}
            {fields.publishedDate && (
              <time dateTime={fields.publishedDate}>{formatDate(fields.publishedDate)}</time>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
