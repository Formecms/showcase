/**
 * Forme SDK client setup.
 *
 * Uses the Delivery client for fetching published content in the app,
 * and the Management client for the seed script.
 */

import { createClient } from "@formecms/sdk";

const deliveryUrl = process.env.FORME_DELIVERY_URL ?? "http://localhost:3002";
const readKey = process.env.FORME_READ_KEY ?? "";

// Create delivery client lazily to avoid throwing during build
// when env vars aren't set. The SDK validates the key prefix on creation.
function createDeliveryClient() {
  if (!readKey || !readKey.startsWith("ce_read_")) {
    // Return a stub that always returns "not ok" so pages render gracefully
    return {
      entries: {
        list: async () => ({ ok: false as const, status: 0, error: { code: "NO_API_KEY" } }),
        get: async () => ({ ok: false as const, status: 0, error: { code: "NO_API_KEY" } }),
      },
      contentModels: {
        list: async () => ({ ok: false as const, status: 0, error: { code: "NO_API_KEY" } }),
      },
      assets: {
        list: async () => ({ ok: false as const, status: 0, error: { code: "NO_API_KEY" } }),
      },
      locales: {
        list: async () => ({ ok: false as const, status: 0, error: { code: "NO_API_KEY" } }),
      },
    } as unknown as ReturnType<typeof createClient>;
  }
  return createClient({ baseUrl: deliveryUrl, apiKey: readKey });
}

export const delivery = createDeliveryClient();
