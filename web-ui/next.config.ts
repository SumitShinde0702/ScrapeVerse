import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const apiOrigin =
  process.env.CHANGELOG_RADAR_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8787";

const nextConfig: NextConfig = {
  transpilePackages: ["lenis"],
  // Keep file tracing inside this monorepo (ignore stray lockfiles above it)
  outputFileTracingRoot: path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  ),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${apiOrigin}/health`,
      },
    ];
  },
};

export default nextConfig;
