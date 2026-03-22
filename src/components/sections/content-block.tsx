import { RichText } from "@/components/ui/rich-text";
import type { ContentBlockFields } from "@/lib/types";
import type { DlvAsset } from "@/lib/types";

interface ContentBlockProps {
  fields: ContentBlockFields;
  imageAsset?: DlvAsset;
  isDark?: boolean;
}

export function ContentBlockComponent({ fields, imageAsset, isDark }: ContentBlockProps) {
  const imagePosition = fields.imagePosition ?? "right";
  const showBg = fields.showBackground ?? false;

  const bgClass = showBg
    ? isDark
      ? "bg-ocean-900/50 rounded-lg p-8 md:p-12"
      : "bg-sand-100 rounded-lg p-8 md:p-12"
    : "";

  // No image — render text-only layout (full width, centered)
  if (!imageAsset || imagePosition === "full") {
    return (
      <div className={`max-w-3xl ${imageAsset ? "" : "mx-auto"} ${bgClass}`}>
        {imageAsset && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={imageAsset.url}
              alt={imageAsset.alt ?? fields.title ?? ""}
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        {fields.title && (
          <h3
            className={`font-display text-2xl md:text-3xl mb-4 ${
              isDark ? "text-sand-50" : "text-ocean-900"
            }`}
          >
            {fields.title}
          </h3>
        )}
        <RichText content={fields.body} dark={isDark} />
      </div>
    );
  }

  // With image — split layout
  const isImageLeft = imagePosition === "left";

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${bgClass}`}>
      {/* Image */}
      <div
        className={`${isImageLeft ? "md:order-first" : "md:order-last"} rounded-lg overflow-hidden`}
      >
        <img
          src={imageAsset.url}
          alt={imageAsset.alt ?? fields.title ?? ""}
          className="w-full h-auto object-cover rounded-lg shadow-lg"
        />
      </div>

      {/* Text */}
      <div className={isImageLeft ? "md:order-last" : "md:order-first"}>
        {fields.title && (
          <h3
            className={`font-display text-2xl md:text-3xl mb-4 ${
              isDark ? "text-sand-50" : "text-ocean-900"
            }`}
          >
            {fields.title}
          </h3>
        )}
        <RichText content={fields.body} dark={isDark} />
      </div>
    </div>
  );
}
