import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev-only "N" badge; build/runtime errors still show
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  // The affiliate program used to live at /partners
  async redirects() {
    return [
      { source: "/partners", destination: "/affiliates", permanent: true },
      { source: "/partners/:path*", destination: "/affiliates/:path*", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
