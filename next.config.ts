import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Also fine for server builds; required for static export
  },
  // Performance optimizations for Electron
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    turbotrace: {
      logLevel: 'error'
    }
  },
  // Only enable static export when building the Electron bundle
  ...(process.env.ELECTRON_BUILD
    ? {
        output: 'export' as const,
        distDir: 'out',
        trailingSlash: true,
        generateEtags: false,
      }
    : {}),
};

export default nextConfig;
