/**
 * Content fetching helpers with reference resolution.
 *
 * All functions use the Delivery API with ?locale=en-US&include=1
 * to get flat field values and hydrated references in a single call.
 */

import { delivery } from "./client";
import type { DlvEntry, DlvAsset, DeliveryIncludes } from "./types";
import { MODEL_API_IDS } from "./types";

// ── Types ────────────────────────────────────────────────────────────

type Includes = DeliveryIncludes;

export interface ResolvedPage {
  entry: DlvEntry;
  sections: DlvEntry[];
  includes: Includes;
}

// ── Content model ID cache ───────────────────────────────────────────

const modelIdCache = new Map<string, string>();

async function getContentModelId(apiId: string): Promise<string | null> {
  const cached = modelIdCache.get(apiId);
  if (cached) return cached;

  const result = await delivery.contentModels.list({ limit: 100 });
  if (!result.ok || !result.data) return null;

  for (const model of result.data.items) {
    modelIdCache.set(model.apiId, model.id);
  }

  return modelIdCache.get(apiId) ?? null;
}

// ── Reference resolution ─────────────────────────────────────────────

export function resolveEntryRef(ref: unknown, includes: Includes): DlvEntry | undefined {
  if (!ref || typeof ref !== "object" || !("id" in ref)) return undefined;
  const id = (ref as { id: string }).id;
  return includes.entries.find((e) => e.id === id);
}

export function resolveEntryRefs(refs: unknown, includes: Includes): DlvEntry[] {
  if (!Array.isArray(refs)) return [];
  return refs
    .map((ref) => resolveEntryRef(ref, includes))
    .filter((e): e is DlvEntry => e !== undefined);
}

/**
 * Asset URLs come directly from the Delivery API — when CDN_BASE_URL is
 * configured on the server, `asset.url` is already a public CDN URL
 * (https://cdn.forme.build/...) that works in `<img>` tags without auth.
 * No proxy needed.
 */
function resolveAssetUrl(asset: DlvAsset): DlvAsset {
  return asset;
}

export function resolveAssetRef(ref: unknown, includes: Includes): DlvAsset | undefined {
  if (!ref || typeof ref !== "object" || !("id" in ref)) return undefined;
  const id = (ref as { id: string }).id;
  const asset = includes.assets.find((a) => a.id === id);
  return asset ? resolveAssetUrl(asset) : undefined;
}

export function emptyIncludes(): Includes {
  return { entries: [], assets: [] };
}

function extractIncludes(data: { includes?: Includes }): Includes {
  return data.includes ?? emptyIncludes();
}

// ── Page fetching ────────────────────────────────────────────────────

export async function getPage(slug: string): Promise<ResolvedPage | null> {
  const modelId = await getContentModelId(MODEL_API_IDS.Page);
  if (!modelId) return null;

  // Server-side filter by slug — one row returned, no client-side scan.
  const result = await delivery.entries.list({
    contentModelId: modelId,
    include: 1,
    locale: "en-US",
    fields: { slug },
    limit: 1,
  });

  if (!result.ok || !result.data) return null;

  const page = (result.data as unknown as { items: DlvEntry[] }).items[0];
  if (!page) return null;

  const includes = extractIncludes(result.data as unknown as { includes?: Includes });
  const sections = resolveEntryRefs(page.fields.sections, includes);

  return { entry: page, sections, includes };
}

// ── Blog fetching ────────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<{
  posts: DlvEntry[];
  includes: Includes;
}> {
  const modelId = await getContentModelId(MODEL_API_IDS.BlogPost);
  if (!modelId) return { posts: [], includes: emptyIncludes() };

  const result = await delivery.entries.list({
    contentModelId: modelId,
    include: 1,
    locale: "en-US",
    limit: 100,
  });

  if (!result.ok || !result.data) return { posts: [], includes: emptyIncludes() };

  const items = (result.data as unknown as { items: DlvEntry[] }).items;
  const sorted = [...items].sort((a: DlvEntry, b: DlvEntry) => {
    const dateA = a.fields.publishedDate as string | undefined;
    const dateB = b.fields.publishedDate as string | undefined;
    if (!dateA || !dateB) return 0;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return {
    posts: sorted,
    includes: extractIncludes(result.data as unknown as { includes?: Includes }),
  };
}

export async function getBlogPost(
  slug: string,
): Promise<{ post: DlvEntry; includes: Includes } | null> {
  const modelId = await getContentModelId(MODEL_API_IDS.BlogPost);
  if (!modelId) return null;

  // Server-side filter by slug.
  const result = await delivery.entries.list({
    contentModelId: modelId,
    include: 1,
    locale: "en-US",
    fields: { slug },
    limit: 1,
  });

  if (!result.ok || !result.data) return null;

  const post = (result.data as unknown as { items: DlvEntry[] }).items[0];
  if (!post) return null;

  return { post, includes: extractIncludes(result.data as unknown as { includes?: Includes }) };
}

// ── Site settings & navigation ───────────────────────────────────────

export async function getSiteSettings(): Promise<DlvEntry | null> {
  const modelId = await getContentModelId(MODEL_API_IDS.SiteSettings);
  if (!modelId) return null;

  const result = await delivery.entries.list({
    contentModelId: modelId,
    locale: "en-US",
    limit: 1,
  });

  if (!result.ok || !result.data) return null;
  const items = (result.data as unknown as { items: DlvEntry[] }).items;
  if (items.length === 0) return null;
  return items[0];
}

export async function getNavigation(location: "header" | "footer"): Promise<DlvEntry | null> {
  const modelId = await getContentModelId(MODEL_API_IDS.NavigationMenu);
  if (!modelId) return null;

  // Server-side filter by location (header / footer).
  const result = await delivery.entries.list({
    contentModelId: modelId,
    locale: "en-US",
    fields: { location },
    limit: 1,
  });

  if (!result.ok || !result.data) return null;
  const items = (result.data as unknown as { items: DlvEntry[] }).items;
  return items[0] ?? null;
}
