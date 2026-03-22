import { Button } from "@/components/ui/button";
import type { HeroSectionFields } from "@/lib/types";
import type { DlvAsset } from "@/lib/types";

interface HeroSectionProps {
  fields: HeroSectionFields;
  backgroundAsset?: DlvAsset;
}

export function HeroSection({ fields, backgroundAsset }: HeroSectionProps) {
  const style = fields.style ?? "gradient";
  const isDark = style === "dark" || style === "gradient";

  return (
    <section
      className={`relative min-h-[85vh] flex items-center justify-center overflow-hidden ${
        isDark ? "bg-ocean-950" : "bg-sand-50"
      }`}
    >
      {/* Gradient blobs */}
      {style === "gradient" && (
        <>
          <div className="absolute inset-0 bg-gradient-hero opacity-80" aria-hidden="true" />
          <div
            className="absolute w-[600px] h-[600px] rounded-full bg-reef-500/10 blur-[120px] -top-32 -left-32 animate-float"
            aria-hidden="true"
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full bg-coral-500/8 blur-[100px] bottom-0 right-0 animate-float-delayed"
            aria-hidden="true"
          />
        </>
      )}

      {/* Background image */}
      {backgroundAsset && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${backgroundAsset.url})` }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-content mx-auto px-6 py-32 text-center">
        <div className="animate-hero-enter">
          {/* Glass card container */}
          <div
            className={
              style === "gradient"
                ? "glass-card p-12 md:p-16 max-w-4xl mx-auto"
                : "max-w-4xl mx-auto"
            }
          >
            <h1
              className={`font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.1] mb-6 ${
                isDark ? "text-sand-50" : "text-ocean-900"
              }`}
            >
              {fields.title}
            </h1>

            {fields.subtitle && (
              <p
                className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 ${
                  isDark ? "text-sand-400" : "text-sand-600"
                }`}
              >
                {fields.subtitle}
              </p>
            )}

            {/* CTAs */}
            {(fields.ctaText || fields.secondaryCtaText) && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {fields.ctaText && fields.ctaLink && (
                  <Button href={fields.ctaLink} variant="primary">
                    {fields.ctaText}
                  </Button>
                )}
                {fields.secondaryCtaText && fields.secondaryCtaLink && (
                  <Button href={fields.secondaryCtaLink} variant={isDark ? "dark" : "secondary"}>
                    {fields.secondaryCtaText}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      {isDark && (
        <div
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sand-50 to-transparent"
          aria-hidden="true"
        />
      )}
    </section>
  );
}
