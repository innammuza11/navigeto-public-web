import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
