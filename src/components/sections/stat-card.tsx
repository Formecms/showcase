import type { StatCardFields } from "@/lib/types";

interface StatCardProps {
  fields: StatCardFields;
}

export function StatCardComponent({ fields }: StatCardProps) {
  return (
    <div className="text-center p-6">
      <div className="text-reef-400 font-display text-[clamp(2.5rem,5vw,4rem)] leading-none mb-2">
        {fields.value}
        {fields.suffix && (
          <span className="text-reef-500/70 text-[0.6em] ml-1">{fields.suffix}</span>
        )}
      </div>
      <p className="text-sand-400 text-sm font-medium uppercase tracking-wider">{fields.label}</p>
    </div>
  );
}
