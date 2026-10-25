import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/travelos/:path*", destination: "/one/:path*", permanent: true },
      { source: "/navigeto-one/:path*", destination: "/one/:path*", permanent: true },
      {
        source: "/vietnamescape",
        destination: "https://navigeto-vietnam-december-2026.innammuza.chatgpt.site",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return { beforeFiles: [{ source: "/guest-album", destination: "/guest-album/index.html" }], afterFiles: [], fallback: [] };
  },
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
