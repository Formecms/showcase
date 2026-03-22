import { Button } from "@/components/ui/button";
import type { CallToActionFields } from "@/lib/types";

interface CallToActionProps {
  fields: CallToActionFields;
}

export function CallToActionComponent({ fields }: CallToActionProps) {
  const style = fields.style ?? "primary";
  const isDark = style === "dark" || style === "gradient";

  return (
    <section className={`relative overflow-hidden ${isDark ? "bg-ocean-950" : "bg-sand-50"}`}>
      {style === "gradient" && (
        <>
          <div className="absolute inset-0 bg-gradient-hero opacity-60" aria-hidden="true" />
          <div
            className="absolute w-[300px] h-[300px] rounded-full bg-reef-500/10 blur-[80px] top-1/2 left-1/4 -translate-y-1/2"
            aria-hidden="true"
          />
        </>
      )}

      <div className="relative z-10 max-w-content mx-auto px-6 py-20 md:py-28 text-center">
        <h2
          className={`font-display text-[clamp(2rem,4vw,3.5rem)] leading-tight mb-4 ${
            isDark ? "text-sand-50" : "text-ocean-900"
          }`}
        >
          {fields.title}
        </h2>

        {fields.description && (
          <p
            className={`text-lg max-w-xl mx-auto mb-8 ${
              isDark ? "text-sand-400" : "text-sand-600"
            }`}
          >
            {fields.description}
          </p>
        )}

        <Button
          href={fields.buttonLink}
          variant={isDark ? "primary" : "secondary"}
          className="text-base px-8 py-4"
        >
          {fields.buttonText}
        </Button>
      </div>
    </section>
  );
}
