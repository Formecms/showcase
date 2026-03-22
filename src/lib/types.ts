/**
 * TypeScript interfaces for the Forme Showcase app.
 *
 * Includes Delivery API response types (DlvEntry, DlvAsset) and
 * typed field interfaces for each content model.
 *
 * Field values assume ?locale=en-US is used (flat values, not locale-keyed objects).
 */

// ── Delivery API types ───────────────────────────────────────────────

export interface DlvEntry {
  readonly id: string;
  readonly contentModel: { readonly id: string; readonly apiId: string };
  readonly fields: Readonly<Record<string, unknown>>;
  readonly publishedAt: string;
  readonly publishedVersion: number | null;
  readonly firstPublishedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DlvAsset {
  readonly id: string;
  readonly title: string | null;
  readonly description: string | null;
  readonly alt: string | null;
  readonly filename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly url: string;
  readonly publishedAt: string;
}

export interface DeliveryIncludes {
  readonly entries: readonly DlvEntry[];
  readonly assets: readonly DlvAsset[];
}

export interface DeliveryListResponse {
  readonly items: readonly DlvEntry[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly includes?: DeliveryIncludes;
}

// ── Helper ───────────────────────────────────────────────────────────

/** Type-safe field extraction from a DlvEntry. */
export function getFields<T>(entry: DlvEntry): T {
  return entry.fields as unknown as T;
}

// ── Data Models ──────────────────────────────────────────────────────

export interface SiteSettingsFields {
  siteName: string;
  tagline?: string;
  footerText?: string;
  copyrightYear?: number;
  socialLinks?: Array<{ platform: string; url: string }>;
}

export interface NavigationMenuFields {
  location: "header" | "footer";
  items: Array<{ label: string; href: string }>;
}

export interface AuthorFields {
  name: string;
  role?: string;
  bio?: string;
  avatar?: { id: string };
}

// ── Component Models ─────────────────────────────────────────────────

export interface HeroSectionFields {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  style?: "gradient" | "dark" | "light";
  backgroundImage?: { id: string };
}

export interface SectionHeaderFields {
  title: string;
  subtitle?: string;
  style?: "light" | "dark";
  sortOrder?: number;
}

export interface FeatureCardFields {
  title: string;
  description?: string;
  iconName?: string;
  sortOrder?: number;
}

export interface ContentBlockFields {
  title?: string;
  body: string;
  image?: { id: string };
  imagePosition?: "left" | "right" | "full";
  showBackground?: boolean;
}

export interface StatCardFields {
  value: string;
  label: string;
  suffix?: string;
  sortOrder?: number;
}

export interface TestimonialCardFields {
  quote: string;
  personName: string;
  personRole?: string;
  avatar?: { id: string };
  sortOrder?: number;
}

export interface CallToActionFields {
  title: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
  style?: "primary" | "dark" | "gradient";
}

// ── Page Models ──────────────────────────────────────────────────────

export interface PageFields {
  title: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: { id: string };
  sections?: Array<{ id: string }>;
}

export interface BlogPostFields {
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  author?: { id: string };
  featuredImage?: { id: string };
  publishedDate?: string;
  category?: string;
  featured?: boolean;
}

// ── Content model API IDs ────────────────────────────────────────────

export const MODEL_API_IDS = {
  SiteSettings: "SiteSettings",
  NavigationMenu: "NavigationMenu",
  Author: "Author",
  HeroSection: "HeroSection",
  SectionHeader: "SectionHeader",
  FeatureCard: "FeatureCard",
  ContentBlock: "ContentBlock",
  StatCard: "StatCard",
  TestimonialCard: "TestimonialCard",
  CallToAction: "CallToAction",
  Page: "Page",
  BlogPost: "BlogPost",
} as const;
