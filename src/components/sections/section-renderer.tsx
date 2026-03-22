/**
 * SectionRenderer — the core architectural component.
 *
 * Receives an array of resolved DlvEntry objects from a Page's `sections`
 * reference field. Checks each entry's contentModel.apiId and renders the
 * corresponding React component.
 *
 * Consecutive same-type entries (FeatureCard, StatCard, TestimonialCard)
 * are auto-grouped into grid/flex layouts. SectionHeader entries wrap the
 * next group with a title.
 */

import { getFields } from "@/lib/types";
import type { DlvEntry, DlvAsset } from "@/lib/types";
import { resolveAssetRef, emptyIncludes } from "@/lib/content";
import { HeroSection } from "./hero-section";
import { SectionHeaderComponent } from "./section-header";
import { FeatureCardComponent } from "./feature-card";
import { ContentBlockComponent } from "./content-block";
import { StatCardComponent } from "./stat-card";
import { TestimonialCardComponent } from "./testimonial-card";
import { CallToActionComponent } from "./call-to-action";
import { ScrollReveal, StaggerChild } from "@/components/ui/scroll-reveal";
import type {
  HeroSectionFields,
  SectionHeaderFields,
  FeatureCardFields,
  ContentBlockFields,
  StatCardFields,
  TestimonialCardFields,
  CallToActionFields,
} from "@/lib/types";

// Types that should be grouped when consecutive
const GROUPABLE_TYPES = new Set(["FeatureCard", "StatCard", "TestimonialCard"]);

interface SectionGroup {
  type: "single" | "group";
  apiId: string;
  entries: DlvEntry[];
  header?: DlvEntry; // SectionHeader that precedes this group
}

interface SectionRendererProps {
  sections: DlvEntry[];
  includes?: {
    entries: readonly DlvEntry[];
    assets: readonly DlvAsset[];
  };
}

/**
 * Groups consecutive same-type entries and attaches SectionHeaders.
 */
function groupSections(sections: DlvEntry[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  let pendingHeader: DlvEntry | undefined;

  for (let i = 0; i < sections.length; i++) {
    const entry = sections[i];
    const apiId = entry.contentModel.apiId;

    // SectionHeader attaches to the next group/entry
    if (apiId === "SectionHeader") {
      pendingHeader = entry;
      continue;
    }

    if (GROUPABLE_TYPES.has(apiId)) {
      // Collect all consecutive entries of the same type
      const group: DlvEntry[] = [entry];
      while (i + 1 < sections.length && sections[i + 1].contentModel.apiId === apiId) {
        group.push(sections[++i]);
      }
      groups.push({
        type: "group",
        apiId,
        entries: group,
        header: pendingHeader,
      });
      pendingHeader = undefined;
    } else {
      groups.push({
        type: "single",
        apiId,
        entries: [entry],
        header: pendingHeader,
      });
      pendingHeader = undefined;
    }
  }

  return groups;
}

export function SectionRenderer({ sections, includes }: SectionRendererProps) {
  const resolved = includes ?? emptyIncludes();
  const groups = groupSections(sections);

  // Track alternation separately from idx, skipping hero/CTA (they have own bg)
  let altIndex = 0;

  return (
    <>
      {groups.map((group, idx) => {
        // Hero and CTA manage their own backgrounds — don't count in alternation
        const selfManaged = group.apiId === "HeroSection" || group.apiId === "CallToAction";
        // Stats always render dark
        const isStats = group.apiId === "StatCard";
        const isDark = isStats ? true : selfManaged ? false : altIndex % 2 === 1;
        if (!selfManaged && !isStats) altIndex++;

        switch (group.apiId) {
          case "HeroSection":
            return (
              <HeroSection
                key={idx}
                fields={getFields<HeroSectionFields>(group.entries[0])}
                backgroundAsset={resolveAssetRef(
                  (group.entries[0].fields as Record<string, unknown>).backgroundImage,
                  resolved,
                )}
              />
            );

          case "ContentBlock": {
            const fields = getFields<ContentBlockFields>(group.entries[0]);
            return (
              <section
                key={idx}
                className={`py-20 md:py-28 ${isDark ? "bg-ocean-950" : "bg-sand-50"}`}
              >
                <div className="max-w-content mx-auto px-6">
                  <ScrollReveal>
                    {group.header && (
                      <SectionHeaderComponent
                        fields={getFields<SectionHeaderFields>(group.header)}
                        isDark={isDark}
                      />
                    )}
                    <ContentBlockComponent
                      fields={fields}
                      imageAsset={resolveAssetRef(
                        (group.entries[0].fields as Record<string, unknown>).image,
                        resolved,
                      )}
                      isDark={isDark}
                    />
                  </ScrollReveal>
                </div>
              </section>
            );
          }

          case "CallToAction":
            return (
              <ScrollReveal key={idx}>
                <CallToActionComponent fields={getFields<CallToActionFields>(group.entries[0])} />
              </ScrollReveal>
            );

          case "FeatureCard":
            return (
              <section
                key={idx}
                className={`py-20 md:py-28 ${isDark ? "bg-ocean-950" : "bg-sand-50"}`}
              >
                <div className="max-w-content mx-auto px-6">
                  <ScrollReveal>
                    {group.header && (
                      <SectionHeaderComponent
                        fields={getFields<SectionHeaderFields>(group.header)}
                        isDark={isDark}
                      />
                    )}
                  </ScrollReveal>
                  <ScrollReveal stagger>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.entries.map((entry) => (
                        <StaggerChild key={entry.id}>
                          <FeatureCardComponent fields={getFields<FeatureCardFields>(entry)} />
                        </StaggerChild>
                      ))}
                    </div>
                  </ScrollReveal>
                </div>
              </section>
            );

          case "StatCard":
            return (
              <section key={idx} className="py-20 md:py-28 bg-ocean-950">
                <div className="max-w-content mx-auto px-6">
                  <ScrollReveal>
                    {group.header && (
                      <SectionHeaderComponent
                        fields={getFields<SectionHeaderFields>(group.header)}
                        isDark
                      />
                    )}
                  </ScrollReveal>
                  <ScrollReveal stagger>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                      {group.entries.map((entry) => (
                        <StaggerChild key={entry.id}>
                          <StatCardComponent fields={getFields<StatCardFields>(entry)} />
                        </StaggerChild>
                      ))}
                    </div>
                  </ScrollReveal>
                </div>
              </section>
            );

          case "TestimonialCard":
            return (
              <section
                key={idx}
                className={`py-20 md:py-28 ${isDark ? "bg-ocean-950" : "bg-sand-50"}`}
              >
                <div className="max-w-content mx-auto px-6">
                  <ScrollReveal>
                    {group.header && (
                      <SectionHeaderComponent
                        fields={getFields<SectionHeaderFields>(group.header)}
                        isDark={isDark}
                      />
                    )}
                  </ScrollReveal>
                  <ScrollReveal stagger>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {group.entries.map((entry) => (
                        <StaggerChild key={entry.id}>
                          <TestimonialCardComponent
                            fields={getFields<TestimonialCardFields>(entry)}
                            avatarAsset={resolveAssetRef(
                              (entry.fields as Record<string, unknown>).avatar,
                              resolved,
                            )}
                            isDark={isDark}
                          />
                        </StaggerChild>
                      ))}
                    </div>
                  </ScrollReveal>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
