import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Also fine for server builds; required for static export
  },
  // Only enable static export when building the Electron bundle
  ...(process.env.ELECTRON_BUILD
    ? {
        output: 'export' as const,
        distDir: 'out',
      }
    : {}),
};

export default nextConfig;
