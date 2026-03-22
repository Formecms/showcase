import type { TestimonialCardFields } from "@/lib/types";
import type { DlvAsset } from "@/lib/types";

interface TestimonialCardProps {
  fields: TestimonialCardFields;
  avatarAsset?: DlvAsset;
  isDark?: boolean;
}

export function TestimonialCardComponent({ fields, avatarAsset, isDark }: TestimonialCardProps) {
  return (
    <div
      className={`rounded-lg p-6 md:p-8 ${
        isDark
          ? "bg-ocean-900 border border-ocean-700"
          : "bg-white border border-sand-200 shadow-sm"
      }`}
    >
      {/* Quote icon */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`mb-4 ${isDark ? "text-reef-500/30" : "text-reef-200"}`}
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
      </svg>

      <blockquote
        className={`text-base leading-relaxed mb-6 ${isDark ? "text-sand-300" : "text-sand-700"}`}
      >
        &ldquo;{fields.quote}&rdquo;
      </blockquote>

      <div className="flex items-center gap-3">
        {avatarAsset ? (
          <img
            src={avatarAsset.url}
            alt={fields.personName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              isDark ? "bg-reef-500/20 text-reef-400" : "bg-reef-50 text-reef-600"
            }`}
          >
            {fields.personName.charAt(0)}
          </div>
        )}
        <div>
          <p className={`text-sm font-semibold ${isDark ? "text-sand-200" : "text-ocean-900"}`}>
            {fields.personName}
          </p>
          {fields.personRole && (
            <p className={`text-meta ${isDark ? "text-sand-400" : "text-sand-500"}`}>
              {fields.personRole}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
