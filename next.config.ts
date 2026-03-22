import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The @formecms/sdk@0.1.0 npm package has a known exports issue
// (points to src/ which isn't published). Resolve to dist directly.
// Remove this workaround once @formecms/sdk exports are fixed.
const sdkDist = path.join(
  __dirname,
  "node_modules",
  "@formecms",
  "sdk",
  "dist",
  "index.js",
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "*.forme.build" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = { ...config.resolve.alias, "@formecms/sdk": sdkDist };
    return config;
  },
};

export default nextConfig;
