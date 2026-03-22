import type { SectionHeaderFields } from "@/lib/types";

interface SectionHeaderProps {
  fields: SectionHeaderFields;
  isDark?: boolean;
}

export function SectionHeaderComponent({ fields, isDark }: SectionHeaderProps) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <h2
        className={`font-display text-[clamp(2rem,4vw,3.5rem)] leading-tight mb-4 ${
          isDark ? "text-sand-50" : "text-ocean-900"
        }`}
      >
        {fields.title}
      </h2>
      {fields.subtitle && (
        <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-sand-400" : "text-sand-600"}`}>
          {fields.subtitle}
        </p>
      )}
    </div>
  );
}
