import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return { beforeFiles: [{ source: "/guest-album", destination: "/guest-album/index.html" }], afterFiles: [], fallback: [] };
  },
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
