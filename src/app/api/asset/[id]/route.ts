/**
 * Asset proxy route.
 *
 * The Delivery API requires a Bearer token to serve assets, but <img> tags
 * in the browser cannot send Authorization headers. This route proxies
 * asset requests, adding the auth header server-side.
 *
 * Usage: <img src="/api/asset/{assetId}" />
 */

import { NextRequest, NextResponse } from "next/server";

const DELIVERY_URL = process.env.FORME_DELIVERY_URL ?? "http://localhost:3002";
const READ_KEY = process.env.FORME_READ_KEY ?? "";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ASSET_SIZE = 20 * 1024 * 1024; // 20 MB
const SAFE_MIME_PREFIXES = ["image/", "video/", "audio/", "application/pdf"];

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return new NextResponse(null, { status: 400 });
  }

  const res = await fetch(`${DELIVERY_URL}/delivery/assets/${id}/file`, {
    headers: { Authorization: `Bearer ${READ_KEY}` },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  // Guard against unbounded response size
  const contentLength = Number(res.headers.get("content-length") ?? "0");
  if (contentLength > MAX_ASSET_SIZE) {
    return new NextResponse(null, { status: 413 });
  }

  // Only proxy safe content types to prevent stored XSS via HTML uploads
  const upstreamType = res.headers.get("content-type") ?? "application/octet-stream";
  const isSafe = SAFE_MIME_PREFIXES.some((p) => upstreamType.startsWith(p));
  const contentType = isSafe ? upstreamType : "application/octet-stream";

  const body = await res.arrayBuffer();

  if (body.byteLength > MAX_ASSET_SIZE) {
    return new NextResponse(null, { status: 413 });
  }

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      // Cache for 1 hour (not immutable) so republished assets refresh
      "Cache-Control": "public, max-age=3600",
    },
  });
}
