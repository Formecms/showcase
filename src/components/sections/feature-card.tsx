import type { FeatureCardFields } from "@/lib/types";

// Icon map — maps icon names from CMS to SVG paths
const ICONS: Record<string, string> = {
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  zap: "M13 2L3 14h9l-1 10 10-12h-9l1-10z",
  globe:
    "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  cpu: "M4 4h16v16H4zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
  database:
    "M12 2C6.48 2 2 4.02 2 6.5v11C2 19.98 6.48 22 12 22s10-2.02 10-4.5v-11C22 4.02 17.52 2 12 2zM2 11.5c0 2.48 4.48 4.5 10 4.5s10-2.02 10-4.5",
  sparkles:
    "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1zM19 13l.5 1.5L21 15l-1.5.5L19 17l-.5-1.5L17 15l1.5-.5L19 13z",
};

interface FeatureCardProps {
  fields: FeatureCardFields;
}

export function FeatureCardComponent({ fields }: FeatureCardProps) {
  const iconPath = fields.iconName ? ICONS[fields.iconName] : ICONS.sparkles;

  return (
    <div className="bg-white border border-sand-200 rounded-lg p-6 card-hover hover:shadow-lg hover:border-reef-200 group">
      {/* Icon */}
      <div className="w-10 h-10 rounded-md bg-reef-50 flex items-center justify-center mb-4 group-hover:bg-reef-100 transition-colors">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-reef-600"
        >
          <path d={iconPath} />
        </svg>
      </div>

      <h3 className="text-ocean-900 font-semibold text-base mb-2">{fields.title}</h3>
      {fields.description && (
        <p className="text-sand-600 text-sm leading-relaxed">{fields.description}</p>
      )}
    </div>
  );
}
