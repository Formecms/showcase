/**
 * Forme Showcase — Seed Script
 *
 * Creates all content models, entries, and publishes them to demonstrate
 * Forme's composable content modeling capabilities.
 *
 * Usage:
 *   FORME_MANAGEMENT_URL=http://localhost:3001 \
 *   FORME_SECRET_KEY=ce_secret_... \
 *   pnpm seed
 *
 * Prerequisites:
 *   - Forme Management API running
 *   - Valid Secret Key from `pnpm seed` output
 */

// ── Configuration ────────────────────────────────────────────────────

const MGMT_URL = process.env.FORME_MANAGEMENT_URL ?? "http://localhost:3001";
const SECRET_KEY = process.env.FORME_SECRET_KEY ?? "";

if (!SECRET_KEY) {
  console.error("ERROR: FORME_SECRET_KEY is required.");
  console.error("Set it via: FORME_SECRET_KEY=ce_secret_... pnpm seed");
  process.exit(1);
}

// ── HTTP Client (standalone — no SDK dependency at runtime) ──────────

interface ApiResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: { code: string; message?: string };
}

async function mgmtRequest<T>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  const res = await fetch(`${MGMT_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = await res.json().catch(() => ({}));
  if (res.ok) return { ok: true, status: res.status, data: json as T };
  return {
    ok: false,
    status: res.status,
    error: (json as { error?: { code: string; message?: string } }).error ?? {
      code: "UNKNOWN",
    },
  };
}

// ── Types ────────────────────────────────────────────────────────────

interface ContentModelInput {
  apiId: string;
  name: string;
  description?: string;
  type?: "page" | "component" | "data";
  fields: readonly Record<string, unknown>[];
}

// ── Helpers ──────────────────────────────────────────────────────────

async function findOrCreateModel(input: ContentModelInput): Promise<string> {
  // Check if model already exists
  const existing = await mgmtRequest<{
    data: Array<{ id: string; apiId: string }>;
  }>("GET", `/management/content-models?apiId=${input.apiId}&limit=1`);

  if (existing.ok && existing.data && existing.data.data.length > 0) {
    console.log(`  ✓ Model "${input.apiId}" already exists`);
    return existing.data.data[0].id;
  }

  const result = await mgmtRequest<{ id: string }>("POST", "/management/content-models", input);
  if (!result.ok) {
    throw new Error(`Failed to create model "${input.apiId}": ${JSON.stringify(result.error)}`);
  }
  console.log(`  + Created model "${input.apiId}"`);
  return result.data!.id;
}

async function createEntry(
  contentModelId: string,
  fields: Record<string, unknown>,
): Promise<string> {
  const result = await mgmtRequest<{ id: string }>("POST", "/management/entries", {
    contentModelId,
    fields,
  });
  if (!result.ok) {
    throw new Error(`Failed to create entry: ${JSON.stringify(result.error)}`);
  }
  return result.data!.id;
}

async function publishEntry(id: string): Promise<void> {
  const result = await mgmtRequest<unknown>("POST", `/management/entries/${id}/publish`);
  if (!result.ok) {
    throw new Error(`Failed to publish entry ${id}: ${JSON.stringify(result.error)}`);
  }
}

async function createAndPublish(
  contentModelId: string,
  fields: Record<string, unknown>,
): Promise<string> {
  const id = await createEntry(contentModelId, fields);
  await publishEntry(id);
  return id;
}

/**
 * Check whether ANY of the given content models have entries.
 * Detects both complete and partial prior seed runs.
 */
async function hasAnyEntries(modelIds: Record<string, string>): Promise<boolean> {
  for (const id of Object.values(modelIds)) {
    const list = await mgmtRequest<{
      data: Array<{ id: string }>;
      pagination: { total: number };
    }>("GET", `/management/entries?contentModelId=${id}&limit=1`);

    if (list.ok && list.data && list.data.pagination.total > 0) return true;
  }
  return false;
}

/**
 * Delete ALL entries for a content model (paginated).
 * Only used with --reset flag — destructive by design.
 */
async function deleteAllEntries(contentModelId: string): Promise<number> {
  let count = 0;
  let hasMore = true;

  while (hasMore) {
    const list = await mgmtRequest<{
      data: Array<{ id: string; status: string }>;
      pagination: { total: number };
    }>("GET", `/management/entries?contentModelId=${contentModelId}&limit=100`);

    if (!list.ok || !list.data || list.data.data.length === 0) break;

    for (const entry of list.data.data) {
      if (entry.status === "published") {
        await mgmtRequest("POST", `/management/entries/${entry.id}/unpublish`);
      }
      await mgmtRequest("DELETE", `/management/entries/${entry.id}`);
      count++;
    }

    hasMore = list.data.pagination.total > list.data.data.length;
  }
  return count;
}

/**
 * Delete assets whose filename starts with the _seed_ prefix.
 * Only touches seed-owned assets. Never touches user uploads.
 * Paginates. Collects IDs first to avoid shifting during deletion.
 */
async function deleteSeedAssets(): Promise<number> {
  const toDelete: Array<{ id: string; status: string }> = [];
  let offset = 0;
  const pageSize = 100;

  while (true) {
    const page = await mgmtRequest<{
      data: Array<{ id: string; filename: string; status: string }>;
      pagination: { total: number };
    }>("GET", `/management/assets?limit=${pageSize}&offset=${offset}`);

    if (!page.ok || !page.data || page.data.data.length === 0) break;

    for (const a of page.data.data) {
      if (a.filename.startsWith(SEED_FILENAME_PREFIX)) toDelete.push(a);
    }

    offset += page.data.data.length;
    if (offset >= page.data.pagination.total) break;
  }

  for (const asset of toDelete) {
    if (asset.status === "published") {
      await mgmtRequest("POST", `/management/assets/${asset.id}/unpublish`);
    }
    await mgmtRequest("DELETE", `/management/assets/${asset.id}`);
  }

  return toDelete.length;
}

// Localized field helper
function l(value: string): Record<string, string> {
  return { "en-US": value };
}

// ── Content Model Definitions ────────────────────────────────────────

const MODELS: ContentModelInput[] = [
  // Data models
  {
    apiId: "SiteSettings",
    name: "Site Settings",
    type: "data",
    fields: [
      { apiId: "siteName", name: "Site Name", type: "shortText", required: true },
      { apiId: "tagline", name: "Tagline", type: "shortText" },
      { apiId: "footerText", name: "Footer Text", type: "shortText" },
      { apiId: "copyrightYear", name: "Copyright Year", type: "number", integerOnly: true },
      { apiId: "socialLinks", name: "Social Links", type: "json" },
    ],
  },
  {
    apiId: "NavigationMenu",
    name: "Navigation Menu",
    type: "data",
    fields: [
      {
        apiId: "location",
        name: "Location",
        type: "shortText",
        required: true,
        in: ["header", "footer"],
      },
      { apiId: "items", name: "Items", type: "json", required: true },
    ],
  },
  {
    apiId: "Author",
    name: "Author",
    type: "data",
    fields: [
      { apiId: "name", name: "Name", type: "shortText", required: true, localized: true },
      { apiId: "role", name: "Role", type: "shortText" },
      { apiId: "bio", name: "Bio", type: "longText", localized: true },
      { apiId: "avatar", name: "Avatar", type: "asset" },
    ],
  },

  // Component models
  {
    apiId: "HeroSection",
    name: "Hero Section",
    type: "component",
    fields: [
      { apiId: "title", name: "Title", type: "shortText", required: true, localized: true },
      { apiId: "subtitle", name: "Subtitle", type: "longText", localized: true },
      { apiId: "ctaText", name: "CTA Text", type: "shortText" },
      { apiId: "ctaLink", name: "CTA Link", type: "shortText" },
      { apiId: "secondaryCtaText", name: "Secondary CTA Text", type: "shortText" },
      { apiId: "secondaryCtaLink", name: "Secondary CTA Link", type: "shortText" },
      { apiId: "style", name: "Style", type: "shortText", in: ["gradient", "dark", "light"] },
      { apiId: "backgroundImage", name: "Background Image", type: "asset" },
    ],
  },
  {
    apiId: "SectionHeader",
    name: "Section Header",
    type: "component",
    fields: [
      { apiId: "title", name: "Title", type: "shortText", required: true, localized: true },
      { apiId: "subtitle", name: "Subtitle", type: "longText", localized: true },
      { apiId: "style", name: "Style", type: "shortText", in: ["light", "dark"] },
      { apiId: "sortOrder", name: "Sort Order", type: "number" },
    ],
  },
  {
    apiId: "FeatureCard",
    name: "Feature Card",
    type: "component",
    fields: [
      { apiId: "title", name: "Title", type: "shortText", required: true, localized: true },
      { apiId: "description", name: "Description", type: "longText", localized: true },
      { apiId: "iconName", name: "Icon Name", type: "shortText" },
      { apiId: "sortOrder", name: "Sort Order", type: "number" },
    ],
  },
  {
    apiId: "ContentBlock",
    name: "Content Block",
    type: "component",
    fields: [
      { apiId: "title", name: "Title", type: "shortText", localized: true },
      { apiId: "body", name: "Body", type: "richText", required: true, localized: true },
      { apiId: "image", name: "Image", type: "asset" },
      {
        apiId: "imagePosition",
        name: "Image Position",
        type: "shortText",
        in: ["left", "right", "full"],
      },
      { apiId: "showBackground", name: "Show Background", type: "boolean" },
    ],
  },
  {
    apiId: "StatCard",
    name: "Stat Card",
    type: "component",
    fields: [
      { apiId: "value", name: "Value", type: "shortText", required: true },
      { apiId: "label", name: "Label", type: "shortText", required: true, localized: true },
      { apiId: "suffix", name: "Suffix", type: "shortText" },
      { apiId: "sortOrder", name: "Sort Order", type: "number" },
    ],
  },
  {
    apiId: "TestimonialCard",
    name: "Testimonial Card",
    type: "component",
    fields: [
      { apiId: "quote", name: "Quote", type: "longText", required: true, localized: true },
      { apiId: "personName", name: "Person Name", type: "shortText", required: true },
      { apiId: "personRole", name: "Person Role", type: "shortText" },
      { apiId: "avatar", name: "Avatar", type: "asset" },
      { apiId: "sortOrder", name: "Sort Order", type: "number" },
    ],
  },
  {
    apiId: "CallToAction",
    name: "Call to Action",
    type: "component",
    fields: [
      { apiId: "title", name: "Title", type: "shortText", required: true, localized: true },
      { apiId: "description", name: "Description", type: "longText", localized: true },
      { apiId: "buttonText", name: "Button Text", type: "shortText", required: true },
      { apiId: "buttonLink", name: "Button Link", type: "shortText", required: true },
      { apiId: "style", name: "Style", type: "shortText", in: ["primary", "dark", "gradient"] },
    ],
  },

  // Page models
  {
    apiId: "Page",
    name: "Page",
    type: "page",
    fields: [
      { apiId: "title", name: "Title", type: "shortText", required: true, localized: true },
      { apiId: "slug", name: "Slug", type: "shortText", required: true, unique: true },
      { apiId: "seoTitle", name: "SEO Title", type: "shortText", localized: true },
      { apiId: "seoDescription", name: "SEO Description", type: "longText", localized: true },
      { apiId: "ogImage", name: "OG Image", type: "asset" },
      {
        apiId: "header",
        name: "Header Navigation",
        type: "reference",
        allowedModels: ["NavigationMenu"],
      },
      {
        apiId: "footer",
        name: "Footer Navigation",
        type: "reference",
        allowedModels: ["NavigationMenu"],
      },
      {
        apiId: "sections",
        name: "Sections",
        type: "reference",
        many: true,
        allowedModels: [
          "HeroSection",
          "SectionHeader",
          "FeatureCard",
          "ContentBlock",
          "StatCard",
          "TestimonialCard",
          "CallToAction",
        ],
      },
    ],
  },
  {
    apiId: "BlogPost",
    name: "Blog Post",
    type: "page",
    fields: [
      { apiId: "title", name: "Title", type: "shortText", required: true, localized: true },
      { apiId: "slug", name: "Slug", type: "shortText", required: true, unique: true },
      { apiId: "excerpt", name: "Excerpt", type: "longText", localized: true },
      { apiId: "body", name: "Body", type: "richText", required: true, localized: true },
      { apiId: "author", name: "Author", type: "reference", allowedModels: ["Author"] },
      { apiId: "featuredImage", name: "Featured Image", type: "asset" },
      { apiId: "publishedDate", name: "Published Date", type: "dateTime" },
      { apiId: "category", name: "Category", type: "shortText" },
      { apiId: "featured", name: "Featured", type: "boolean" },
    ],
  },
];

// ── Image Upload ─────────────────────────────────────────────────────

const IMAGES: Record<string, { url: string; title: string; alt: string }> = {
  heroWave: {
    url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=85&fit=crop",
    title: "Dramatic ocean wave at sunset",
    alt: "A powerful ocean wave rising against a golden sunset sky",
  },
  aerialOcean: {
    url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=85&fit=crop",
    title: "Aerial view of ocean meeting shore",
    alt: "Bird's eye view of turquoise ocean waves meeting a white sand beach",
  },
  calmSea: {
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=85&fit=crop",
    title: "Calm ocean surface at dusk",
    alt: "Peaceful dark ocean water surface with soft light on the horizon",
  },
  sunsetBeach: {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85&fit=crop",
    title: "Golden hour at the seashore",
    alt: "Warm golden light washing over gentle waves on a tropical beach",
  },
  underwaterCave: {
    url: "https://images.unsplash.com/photo-1682687982167-d7fb3ed8541d?w=1920&q=85&fit=crop",
    title: "Diver exploring underwater cave",
    alt: "A freediver gliding through a sunlit underwater cave with coral walls",
  },
  aerialSurfers: {
    url: "https://images.unsplash.com/photo-1513553404607-988bf2703777?w=1920&q=85&fit=crop",
    title: "Aerial view of surfers and waves",
    alt: "Drone view of turquoise waves breaking on shore with surfers in the water",
  },
  waterSurface: {
    url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1920&q=85&fit=crop",
    title: "Ocean wave at water level",
    alt: "Close up view from water level of a wave rolling toward shore",
  },
  sunsetWater: {
    url: "https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?w=1920&q=85&fit=crop",
    title: "Sunset reflections on ocean surface",
    alt: "Purple and pink sunset light reflecting on the calm ocean surface",
  },
  seaTurtle: {
    url: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=1920&q=85&fit=crop",
    title: "Sea turtle swimming in open water",
    alt: "A green sea turtle gliding gracefully through clear blue ocean water",
  },
  surfer: {
    url: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?w=1920&q=85&fit=crop",
    title: "Surfer riding a wave",
    alt: "A surfer carving through a clean turquoise wave",
  },
};

// Seed filenames are prefixed to avoid collisions with user uploads.
const SEED_FILENAME_PREFIX = "_seed_";

/**
 * Find an existing seed asset by its namespaced filename, or upload a new one.
 *
 * Identity: filenames are prefixed with `_seed_` (e.g. `_seed_heroWave.jpg`)
 * to avoid collisions with user-uploaded files. Users are unlikely to name
 * their own uploads with a `_seed_` prefix.
 *
 * Matches any status (draft or published). If a draft match is found from a
 * partial prior run, it is published rather than re-uploaded.
 *
 * Paginates through all assets to handle workspaces with 100+ files.
 */
async function findOrUploadImage(key: string): Promise<string> {
  const img = IMAGES[key];
  const seedFilename = `${SEED_FILENAME_PREFIX}${key}.jpg`;

  // Paginate through all assets looking for a namespaced _seed_ match.
  // No legacy fallback — workspaces from older seeds should use --reset.
  let offset = 0;
  const pageSize = 100;
  while (true) {
    const page = await mgmtRequest<{
      data: Array<{ id: string; filename: string; status: string }>;
      pagination: { total: number };
    }>("GET", `/management/assets?limit=${pageSize}&offset=${offset}`);

    if (!page.ok || !page.data || page.data.data.length === 0) break;

    const match = page.data.data.find((a) => a.filename === seedFilename);
    if (match) {
      if (match.status !== "published") {
        const pubResult = await mgmtRequest("POST", `/management/assets/${match.id}/publish`);
        if (!pubResult.ok) {
          throw new Error(
            `Failed to publish recovered asset ${match.id}: ${JSON.stringify(pubResult.error)}`,
          );
        }
        console.log(`    ✓ ${key} found as draft, published`);
      } else {
        console.log(`    ✓ ${key} already exists`);
      }
      return match.id;
    }

    offset += page.data.data.length;
    if (offset >= page.data.pagination.total) break;
  }

  // Download and upload
  console.log(`    Downloading ${key}...`);
  const response = await fetch(img.url);
  if (!response.ok) throw new Error(`Failed to download image: ${img.url}`);
  const buffer = await response.arrayBuffer();

  const formData = new FormData();
  formData.append("file", new Blob([buffer], { type: "image/jpeg" }), seedFilename);
  formData.append("title", img.title);
  formData.append("alt", img.alt);

  const res = await fetch(`${MGMT_URL}/management/assets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SECRET_KEY}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload ${key}: ${err}`);
  }
  const asset = (await res.json()) as { id: string };

  const pubResult = await mgmtRequest("POST", `/management/assets/${asset.id}/publish`);
  if (!pubResult.ok) {
    throw new Error(`Failed to publish asset ${asset.id}: ${JSON.stringify(pubResult.error)}`);
  }
  console.log(`    Uploaded + published: ${key}`);
  return asset.id;
}

// ── Seed Content ─────────────────────────────────────────────────────

const RESET_MODE = process.argv.includes("--reset");

async function seed() {
  console.log("\n🌊 Cold Water Stories — Seeding Content\n");
  console.log(`  Management API: ${MGMT_URL}`);
  console.log(`  Secret Key: ce_secret_***`);
  if (RESET_MODE) console.log(`  Mode: RESET (will delete existing seed entries)`);
  console.log("");

  // 1. Create all content models
  console.log("📐 Creating content models...");
  const modelIds: Record<string, string> = {};

  for (const model of MODELS) {
    modelIds[model.apiId] = await findOrCreateModel(model);
  }
  console.log(`  ${Object.keys(modelIds).length} models ready\n`);

  // 2. Check for existing content (across ALL showcase models)
  if (RESET_MODE) {
    // Explicit reset: delete showcase entries + seed-owned assets.
    console.log("🧹 Resetting (--reset flag)...");
    let totalDeleted = 0;
    for (const apiId of Object.keys(modelIds)) {
      const deleted = await deleteAllEntries(modelIds[apiId]);
      if (deleted > 0) console.log(`  Deleted ${deleted} ${apiId} entries`);
      totalDeleted += deleted;
    }
    const assetsDeleted = await deleteSeedAssets();
    if (assetsDeleted > 0) console.log(`  Deleted ${assetsDeleted} seed assets`);
    console.log(`  ${totalDeleted} entries + ${assetsDeleted} assets cleared\n`);
  } else {
    // Safe default: skip if ANY showcase model has entries (catches partial seeds too)
    if (await hasAnyEntries(modelIds)) {
      console.log("  Existing content detected (entries found in showcase models).");
      console.log("  This could be from a complete or partial prior seed run.");
      console.log("  To re-seed, run with --reset flag: pnpm seed -- --reset");
      console.log("  ⚠  --reset deletes entries + seed assets, then re-creates.\n");
      console.log("✅ Nothing to do. Existing content is intact.\n");
      return;
    }
  }

  // 3. Upload images
  console.log("🖼️  Uploading images...");
  const assetIds: Record<string, string> = {};
  for (const key of Object.keys(IMAGES)) {
    assetIds[key] = await findOrUploadImage(key);
  }
  console.log(`  ${Object.keys(assetIds).length} images uploaded\n`);

  // 3. Create data entries
  console.log("📦 Creating data entries...");

  await createAndPublish(modelIds.SiteSettings, {
    siteName: "Cold Water Stories",
    tagline: "Where the ocean meets the wild.",
    footerText:
      "Stories from the edge of the sea. Celebrating nature, surf, and the beauty of cold water.",
    copyrightYear: 2026,
    socialLinks: [
      { platform: "Instagram", url: "https://instagram.com" },
      { platform: "YouTube", url: "https://youtube.com" },
    ],
  });
  console.log("  + SiteSettings");

  const headerNavId = await createAndPublish(modelIds.NavigationMenu, {
    location: "header",
    items: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Stories", href: "/blog" },
    ],
  });
  console.log("  + NavigationMenu (header)");

  const footerNavId = await createAndPublish(modelIds.NavigationMenu, {
    location: "footer",
    items: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Stories", href: "/blog" },
    ],
  });
  console.log("  + NavigationMenu (footer)");

  const author1Id = await createAndPublish(modelIds.Author, {
    name: l("Ingrid Halvorsen"),
    role: "Cold Water Surfer & Writer",
    bio: l(
      "Ingrid grew up on the coast of Northern Norway and has been surfing Arctic waters since she was sixteen. She writes about the raw beauty of cold oceans and the people who find peace in them.",
    ),
  });
  console.log("  + Author: Ingrid Halvorsen");

  const author2Id = await createAndPublish(modelIds.Author, {
    name: l("Tomás Reyes"),
    role: "Ocean Photographer",
    bio: l(
      "Tomás is a marine photographer based in Galicia, Spain. His work captures the wild Atlantic coast and the surfers who chase its waves through every season.",
    ),
  });
  console.log("  + Author: Tomás Reyes\n");

  // 4. Create HOME page sections
  console.log("🏠 Creating Home page sections...");

  const homeHeroId = await createAndPublish(modelIds.HeroSection, {
    title: l("Where the ocean meets the wild."),
    subtitle: l(
      "Stories of cold water surfing, untamed coastlines, and the quiet courage it takes to paddle out when the world is frozen and the waves are calling.",
    ),
    ctaText: "Read Our Stories",
    ctaLink: "/blog",
    secondaryCtaText: "Learn More",
    secondaryCtaLink: "/about",
    style: "gradient",
    backgroundImage: { id: assetIds.heroWave },
  });
  console.log("  + HeroSection (Home)");

  const featureHeaderId = await createAndPublish(modelIds.SectionHeader, {
    title: l("The pull of cold water"),
    subtitle: l(
      "There is something about the northern ocean that strips everything away. No crowds, no warmth, no comfort. Just you, your board, and the raw power of the sea.",
    ),
    style: "light",
    sortOrder: 1,
  });
  console.log("  + SectionHeader (Features)");

  const featureIds: string[] = [];
  const features = [
    {
      title: "Arctic Swells",
      description:
        "In the fjords of Norway and the bays of Iceland, winter brings waves that few will ever ride. The water is near freezing, the sessions are short, and every single one is unforgettable.",
      iconName: "globe",
      sortOrder: 1,
    },
    {
      title: "Dawn Patrols",
      description:
        "The best sessions happen before the world wakes up. When the first light touches the water and the offshore wind holds the faces of the waves clean, time seems to stop.",
      iconName: "zap",
      sortOrder: 2,
    },
    {
      title: "Ocean Wilderness",
      description:
        "Beyond the break, the sea stretches to the horizon. Seals surface beside you. Birds dive into the swell. Out here, you remember that the ocean belongs to no one.",
      iconName: "sparkles",
      sortOrder: 3,
    },
    {
      title: "Tidal Rhythms",
      description:
        "Every coast has its own pulse. Learning to read the tides, the wind, and the swell is a lifelong practice. The ocean teaches patience to those willing to listen.",
      iconName: "layers",
      sortOrder: 4,
    },
    {
      title: "Salt and Stone",
      description:
        "The coastlines where cold water surfing thrives are carved from ancient rock. Basalt cliffs, black sand beaches, and granite headlands shaped by millennia of relentless surf.",
      iconName: "shield",
      sortOrder: 5,
    },
    {
      title: "Community of the Cold",
      description:
        "Cold water surfers share something that goes beyond the sport. A nod in the parking lot at dawn, a thermos of coffee passed between strangers. The cold builds bonds that warmth never could.",
      iconName: "database",
      sortOrder: 6,
    },
  ];

  for (const feat of features) {
    const id = await createAndPublish(modelIds.FeatureCard, {
      title: l(feat.title),
      description: l(feat.description),
      iconName: feat.iconName,
      sortOrder: feat.sortOrder,
    });
    featureIds.push(id);
  }
  console.log(`  + ${features.length} FeatureCards`);

  const contentBlockId = await createAndPublish(modelIds.ContentBlock, {
    title: l("The art of reading the sea"),
    body: l(
      "Every wave is a story written by the wind across hundreds of miles of open ocean. Learning to read the sea means learning to see what is invisible to most people.\n\nThe texture of the water's surface tells you about the current beneath. The shape of the clouds reveals the wind that will arrive in hours. The color of the horizon at dawn hints at the swell that traveled through the night to reach your shore.\n\nThis is the knowledge that cold water surfers carry. Not from books or forecasts alone, but from years of watching, waiting, and paddling out into the unknown.",
    ),
    imagePosition: "right",
    showBackground: true,
  });
  console.log("  + ContentBlock");

  const statsHeaderId = await createAndPublish(modelIds.SectionHeader, {
    title: l("By the numbers"),
    subtitle: l("The cold water surfing world in perspective."),
    style: "dark",
    sortOrder: 2,
  });
  console.log("  + SectionHeader (Stats)");

  const statIds: string[] = [];
  const stats = [
    { value: "4°C", label: "Winter Water Temp", suffix: "", sortOrder: 1 },
    { value: "68°N", label: "Northernmost Break", suffix: "", sortOrder: 2 },
    { value: "6mm", label: "Wetsuit Thickness", suffix: "", sortOrder: 3 },
    { value: "365", label: "Days of Surf", suffix: "", sortOrder: 4 },
  ];

  for (const stat of stats) {
    const id = await createAndPublish(modelIds.StatCard, {
      value: stat.value,
      label: l(stat.label),
      suffix: stat.suffix || undefined,
      sortOrder: stat.sortOrder,
    });
    statIds.push(id);
  }
  console.log(`  + ${stats.length} StatCards`);

  const testimonialHeaderId = await createAndPublish(modelIds.SectionHeader, {
    title: l("Voices from the lineup"),
    subtitle: l("Surfers, swimmers, and ocean lovers share what draws them to cold water."),
    style: "light",
    sortOrder: 3,
  });
  console.log("  + SectionHeader (Testimonials)");

  const testimonialIds: string[] = [];
  const testimonials = [
    {
      quote:
        "The first time I surfed in Norway, I could not feel my hands for an hour afterward. But the light on the water, the silence between sets, the mountains rising behind the beach... I have never felt more alive. I go back every winter.",
      personName: "Katrine Moen",
      personRole: "Surfer, Lofoten Islands",
      sortOrder: 1,
    },
    {
      quote:
        "People ask why I swim in the North Sea in January. I tell them: because the world is so loud everywhere else. In cold water, your mind goes quiet. There is nothing but your breath and the rhythm of the waves.",
      personName: "Ewan Fletcher",
      personRole: "Open Water Swimmer, Scotland",
      sortOrder: 2,
    },
    {
      quote:
        "I have photographed oceans on every continent. But nothing compares to the Arctic light on a winter swell. The water turns from black to silver to gold in the space of a single wave. It is the most beautiful thing I have ever seen.",
      personName: "Yuki Tanaka",
      personRole: "Marine Photographer, Hokkaido",
      sortOrder: 3,
    },
  ];

  for (const test of testimonials) {
    const id = await createAndPublish(modelIds.TestimonialCard, {
      quote: l(test.quote),
      personName: test.personName,
      personRole: test.personRole,
      sortOrder: test.sortOrder,
    });
    testimonialIds.push(id);
  }
  console.log(`  + ${testimonials.length} TestimonialCards`);

  const homeCTAId = await createAndPublish(modelIds.CallToAction, {
    title: l("The water is calling."),
    description: l(
      "Read our stories of cold water adventure, ocean conservation, and the surfers who find meaning in the waves.",
    ),
    buttonText: "Explore Stories",
    buttonLink: "/blog",
    style: "gradient",
  });
  console.log("  + CallToAction (Home)\n");

  // 5. Create HOME page
  console.log("📄 Creating Home page...");

  const homeSections = [
    homeHeroId,
    featureHeaderId,
    ...featureIds,
    contentBlockId,
    statsHeaderId,
    ...statIds,
    testimonialHeaderId,
    ...testimonialIds,
    homeCTAId,
  ];

  await createAndPublish(modelIds.Page, {
    title: l("Home"),
    slug: "home",
    seoTitle: l("Cold Water Stories | Where the Ocean Meets the Wild"),
    seoDescription: l(
      "Stories of cold water surfing, untamed coastlines, and the quiet courage it takes to paddle out when the world is frozen.",
    ),
    ogImage: { id: assetIds.heroWave },
    header: { id: headerNavId },
    footer: { id: footerNavId },
    sections: homeSections.map((id) => ({ id })),
  });
  console.log(`  + Home page (${homeSections.length} sections)\n`);

  // 6. Create ABOUT page sections
  console.log("📋 Creating About page sections...");

  const aboutHeroId = await createAndPublish(modelIds.HeroSection, {
    title: l("Our Story"),
    subtitle: l(
      "We believe the most powerful stories are the ones the ocean tells. Cold Water Stories exists to share them.",
    ),
    style: "dark",
    backgroundImage: { id: assetIds.calmSea },
  });
  console.log("  + HeroSection (About)");

  const aboutStoryId = await createAndPublish(modelIds.ContentBlock, {
    title: l("Born from the North Atlantic"),
    body: l(
      'Cold Water Stories began on a winter morning in the Faroe Islands. The air was below freezing, the swell was overhead, and three surfers shared a single thermos of tea in a gravel parking lot overlooking the break.\n\nOne of them said: "Someone should write about this."\n\nThat simple idea became this publication. We write about the places where the ocean is wildest, the water is coldest, and the people who paddle out are driven by something deeper than sport. We write about nature, solitude, and the transformative power of immersing yourself in the sea.\n\nOur writers are surfers, swimmers, photographers, and marine biologists. What unites them is a love for cold water and a belief that these stories matter.',
    ),
    imagePosition: "left",
    showBackground: false,
  });
  console.log("  + ContentBlock (Our Story)");

  const aboutMissionId = await createAndPublish(modelIds.ContentBlock, {
    title: l("What we stand for"),
    body: l(
      "**The ocean does not belong to us. We belong to it.**\n\nCold Water Stories is built on three principles:\n\n**Respect for the sea.** Every story we publish honors the power and fragility of the ocean. We never glorify recklessness. We celebrate the surfers, swimmers, and sailors who approach the water with humility.\n\n**Conservation through storytelling.** The best way to protect wild places is to help people fall in love with them. Our stories are invitations to care about coastlines, marine life, and the health of our oceans.\n\n**Honesty in every word.** We do not chase clicks or manufacture drama. Cold water surfing is already dramatic enough. We simply tell the truth about what it feels like to be out there.",
    ),
    imagePosition: "right",
    showBackground: true,
  });
  console.log("  + ContentBlock (Mission)");

  const aboutCTAId = await createAndPublish(modelIds.CallToAction, {
    title: l("Come along for the ride"),
    description: l(
      "New stories published every week. Follow the journey from Arctic Norway to the wild coasts of Patagonia.",
    ),
    buttonText: "Read the Latest",
    buttonLink: "/blog",
    style: "dark",
  });
  console.log("  + CallToAction (About)");

  await createAndPublish(modelIds.Page, {
    title: l("About"),
    slug: "about",
    seoTitle: l("About Cold Water Stories"),
    seoDescription: l(
      "Born from the North Atlantic. Stories of cold water surfing, ocean conservation, and the beauty of wild coastlines.",
    ),
    ogImage: { id: assetIds.calmSea },
    header: { id: headerNavId },
    footer: { id: footerNavId },
    sections: [aboutHeroId, aboutStoryId, aboutMissionId, aboutCTAId].map((id) => ({ id })),
  });
  console.log("  + About page (4 sections)\n");

  // 7. Create blog posts
  console.log("📝 Creating blog posts...");

  await createAndPublish(modelIds.BlogPost, {
    title: l("Surfing the Arctic: A Winter in Lofoten"),
    slug: "surfing-the-arctic-winter-in-lofoten",
    excerpt: l(
      "Above the Arctic Circle, where the Northern Lights dance over the lineup and the water temperature hovers near freezing, a small community of surfers has discovered something extraordinary.",
    ),
    body: l(`# Surfing the Arctic: A Winter in Lofoten

The alarm goes off at five in the morning, but it hardly matters. In December in Lofoten, the sun will not rise for another three hours. The darkness outside is total, broken only by the faint glow of snow on the mountains.

I pull on three layers of wool, then a 6mm wetsuit with integrated hood, gloves, and booties. The neoprene is stiff from the cold. It takes ten minutes just to zip up.

## The Drive to the Beach

The road to Unstad follows the coast through a series of tunnels carved into the mountainside. Between them, headlights catch glimpses of the sea: black water, white foam, the suggestion of swell moving through the fjord.

At the parking lot, two other cars are already here. Their windows are fogged from the inside. Someone is sitting in the driver's seat, drinking coffee, staring at the ocean. We nod to each other. No words needed.

## Paddling Out

The water hits your face like electricity. Every nerve fires at once. Your breath catches, then steadies. In thirty seconds, the shock passes and something else takes its place: absolute clarity.

The lineup is empty except for me and two others. The waves are chest high, clean, and peeling along the sandbar with mechanical perfection. Behind us, the mountains are black silhouettes against a sky that is just beginning to turn from ink to deep blue.

## The Light

And then it comes. The Arctic light.

It arrives slowly, a pale gold glow on the southern horizon that never climbs higher than a hand's width above the mountains. For two hours, this low winter sun paints everything in colors that have no name: the water turns from black to dark green to a luminous silver. The snow on the peaks catches fire.

I sit on my board, straddling the water, and watch the light move across the bay. A set rolls in. I turn, paddle three strokes, and drop into a wave that carries me across a canvas of reflected gold.

## Why We Come Back

People ask if the cold is worth it. But they are asking the wrong question. The cold is not something you endure to get to the surfing. The cold *is* the experience. It sharpens every sensation. It makes every wave a gift.

In warm water, surfing is recreation. In cold water, surfing is a conversation with something ancient and immense. You do not conquer these waves. You are simply allowed to share in them for a moment.

When I finally walk out of the water, my hands are so numb I cannot grip the car keys. I sit on the bumper, peeling off my wetsuit in the darkness, watching the stars appear one by one over the fjord.

Tomorrow morning, I will do it all again.`),
    author: { id: author1Id },
    featuredImage: { id: assetIds.aerialOcean },
    publishedDate: "2026-03-10T08:00:00Z",
    category: "Adventure",
    featured: true,
  });
  console.log("  + Blog: Surfing the Arctic");

  await createAndPublish(modelIds.BlogPost, {
    title: l("The Underwater Cathedrals of the Atlantic"),
    slug: "underwater-cathedrals-atlantic",
    excerpt: l(
      "Beneath the surface of the cold Atlantic, a hidden world of kelp forests, sea caves, and ancient rock formations reveals itself to those brave enough to dive in.",
    ),
    body: l(`# The Underwater Cathedrals of the Atlantic

Most people see the Atlantic Ocean as a surface: waves, whitecaps, the distant line where water meets sky. But drop beneath that surface along the coasts of Ireland, Scotland, or Norway, and you enter a world that feels like another planet.

## The Kelp Forests

The first thing you notice is the light. Filtered through meters of cold, clear water, sunlight becomes something liquid and golden. It moves in shifting columns through forests of kelp that sway with the current like trees in a slow wind.

These are not small plants. Bull kelp can grow to thirty meters, anchored to the seabed by holdfasts that grip the rock with extraordinary strength. Swimming through a mature kelp forest is like walking through a cathedral with a living, breathing roof.

## The Caves

Along the western coast of Ireland, the limestone cliffs hide sea caves that extend deep into the rock. Some are barely wide enough to enter. Others open into chambers so large that your torch cannot reach the ceiling.

The walls are covered in life: orange and purple sponges, clusters of jewel anemones that glow like stained glass, and the occasional lobster peering out from a crack with antennae longer than your arm.

## Life in Cold Water

There is a common misconception that cold water means lifeless water. The opposite is true. Cold oceans are among the most productive ecosystems on Earth.

The nutrient rich waters of the North Atlantic support an abundance of life that tropical reefs can only dream of. Plankton blooms in spring feed vast shoals of fish, which in turn feed seals, dolphins, whales, and enormous colonies of seabirds.

Swimming through these waters in winter, when visibility can reach thirty meters, is like floating through liquid crystal. The water is so clear it barely feels like water at all.

## A World Worth Protecting

These underwater landscapes are fragile. Bottom trawling, pollution, and rising sea temperatures threaten kelp forests around the world. In Norway, sea urchin populations have exploded in warmer waters, turning lush kelp forests into barren rock.

Every dive in cold water is a reminder of what we stand to lose. And every story we tell about these places is an argument for their protection.`),
    author: { id: author2Id },
    featuredImage: { id: assetIds.underwaterCave },
    publishedDate: "2026-03-14T10:00:00Z",
    category: "Ocean Life",
    featured: false,
  });
  console.log("  + Blog: Underwater Cathedrals");

  await createAndPublish(modelIds.BlogPost, {
    title: l("Dawn Patrol: The Sacred Hour Before Sunrise"),
    slug: "dawn-patrol-sacred-hour",
    excerpt: l(
      "There is a window of time each morning when the ocean belongs entirely to those who are willing to greet it in the dark. This is the story of the dawn patrol.",
    ),
    body: l(`# Dawn Patrol: The Sacred Hour Before Sunrise

The parking lot is empty. The dashboard clock reads 5:47. Outside the car, the world is a palette of deep blue and charcoal grey. The sound of waves reaches you through the closed windows, steady and rhythmic, like breathing.

## The Ritual

Every dawn patroller has their own ritual. Some drink coffee in silence. Some stretch on the cold asphalt. Some simply stand at the water's edge, watching the dark shapes of waves rise and fall, reading the conditions by sound as much as sight.

There is no rushing this. The ocean will be there when you are ready. And there is something sacred about this unhurried preparation, this slow transition from the warmth of sleep to the cold of the sea.

## In the Water

Paddling out in near darkness changes everything about surfing. You cannot see the waves coming until they are almost upon you. You learn to feel them instead: the lift of the water beneath your board, the pull of the current, the subtle shift in sound as a set approaches.

Your first wave is always a leap of faith. You hear it, feel the water rise, turn your board, and paddle. The takeoff is pure instinct. And then you are up, gliding across a wave you can barely see, guided by nothing but the feel of the water beneath your feet.

## The Light Arrives

And then, slowly, the light comes.

It begins as a thin line of pale gold on the eastern horizon. The sky shifts from black to deep indigo to a wash of rose and amber. The water, which moments ago was featureless and dark, begins to reveal itself: the texture of the surface, the color of the sand beneath, the spray off the lip of each wave catching the first rays of sun.

This is the reward. Not just the waves, which are often perfect in the calm of early morning. But this front row seat to the daily miracle of sunrise over the ocean.

## Why We Wake Up

Non surfers think the dawn patrol is about dedication or discipline. But that misses the point entirely. We do not drag ourselves out of bed to surf. We are *pulled* out of bed by the ocean.

The dawn patrol is not a sacrifice. It is a privilege. It is the knowledge that while the rest of the world sleeps, you are out there in the water, watching the day begin from the best seat in the house.

Tomorrow the alarm will ring again at five. And once again, getting up will be the easiest decision of the day.`),
    author: { id: author1Id },
    featuredImage: { id: assetIds.sunsetBeach },
    publishedDate: "2026-03-18T06:00:00Z",
    category: "Surf Culture",
    featured: false,
  });
  console.log("  + Blog: Dawn Patrol");

  await createAndPublish(modelIds.BlogPost, {
    title: l("Following the Sea Turtles of the Azores"),
    slug: "sea-turtles-azores",
    excerpt: l(
      "In the deep blue waters surrounding the Azores, loggerhead sea turtles complete one of the longest migrations in the animal kingdom. We spent a month swimming alongside them.",
    ),
    body: l(`# Following the Sea Turtles of the Azores

The water around the Azores is not cold in the Arctic sense. At 18°C in autumn, it sits in that bracing middle ground: cool enough to remind you that you are a visitor here, warm enough to stay in for hours.

But it is the clarity that takes your breath away. Fifty meters of visibility is common. On a calm day, you can float on the surface and see the volcanic seabed thirty meters below, every rock and crevice sharp as glass.

## The Travelers

Loggerhead turtles are born on the beaches of Florida and the Caribbean. Within days of hatching, they enter the Atlantic Ocean and begin a journey that will take them across the entire ocean basin. Many pass through the waters of the Azores, where the seamounts and currents create a rich feeding ground.

Some turtles spend years here before continuing their journey. They feed on jellyfish, crabs, and sea urchins, growing slowly in the cool, nutrient dense waters of the mid Atlantic.

## Swimming Together

To swim with a sea turtle is to experience time differently. They move with a patience that has been perfected over two hundred million years of evolution. Each stroke of their flippers is deliberate, unhurried, and impossibly graceful.

When a turtle allows you to swim alongside it, there is an understanding that passes between you. It knows you are there. It has chosen not to flee. In that shared moment, the boundary between human and ocean creature dissolves.

## What They Teach Us

Sea turtles navigate by the Earth's magnetic field, by the position of the stars, and by currents so subtle that no human instrument can detect them. They cross entire oceans and return to the exact beach where they were born, decades later, to lay their own eggs.

They are living proof that the ocean is not an empty space to be crossed. It is a world unto itself, with its own geography, its own seasons, and its own ancient inhabitants.

## The Threat

Plastic pollution kills an estimated one thousand sea turtles every year. They mistake floating plastic bags for jellyfish and swallow them. Fishing nets entangle flippers and shells. Light pollution on nesting beaches disorients hatchlings, drawing them away from the ocean toward roads and buildings.

Every turtle we swam with in the Azores carried the scars of human carelessness. Small marks on their shells, old entanglement wounds on their flippers. They survive, but they should not have to.

To tell the story of sea turtles is to tell the story of our relationship with the ocean. And right now, that story needs a different ending.`),
    author: { id: author2Id },
    featuredImage: { id: assetIds.seaTurtle },
    publishedDate: "2026-03-21T09:00:00Z",
    category: "Conservation",
    featured: false,
  });
  console.log("  + Blog: Sea Turtles of the Azores\n");

  // 8. Create Stories listing page
  console.log("📄 Creating Stories page...");

  const storiesHeroId = await createAndPublish(modelIds.HeroSection, {
    title: l("Stories"),
    subtitle: l("Dispatches from the coldest, wildest, most beautiful waters on Earth."),
    style: "dark",
    backgroundImage: { id: assetIds.aerialSurfers },
  });
  console.log("  + HeroSection (Stories)");

  await createAndPublish(modelIds.Page, {
    title: l("Stories"),
    slug: "stories",
    seoTitle: l("Stories | Cold Water Stories"),
    seoDescription: l(
      "Dispatches from the coldest, wildest, most beautiful waters on Earth. Cold water surfing, ocean conservation, and nature stories.",
    ),
    header: { id: headerNavId },
    footer: { id: footerNavId },
    sections: [storiesHeroId].map((id) => ({ id })),
  });
  console.log("  + Stories page\n");

  // Done!
  console.log("✅ Seeding complete!\n");
  console.log("  Content models:  12");
  console.log("  Images:          10");
  console.log("  Data entries:    5 (SiteSettings, 2x Nav, 2x Authors)");
  console.log("  Components:      ~22 (sections for Home + About + Stories)");
  console.log("  Pages:           3 (Home, About, Stories)");
  console.log("  Blog posts:      4");
  console.log("");
  console.log("  Start the app:   cd examples/nextjs && pnpm dev");
  console.log("  Open:            http://localhost:3000");
  console.log("");
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
