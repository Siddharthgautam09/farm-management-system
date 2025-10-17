import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Static export for Electron
  images: {
    unoptimized: true, // Required for static export
  },
  // Only for Electron build
  ...(process.env.ELECTRON_BUILD && {
    distDir: 'out',
  }),
};

export default nextConfig;
