import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Security headers for every page. netlify.toml [[headers]] do not reach
// responses rendered by the Next.js server function (12 Nov 2026: live pages
// only had HSTS + nosniff and leaked x-powered-by). Nothing needs to frame
// navigeto.com, so framing is denied outright (protects /pay and the visa
// document portal from clickjacking). A full script CSP is a later,
// report-only rollout because GTM can inject extra tags.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The visa document portal URL carries a private upload token: never
      // send it to other sites in the Referer header.
      { source: "/visas/application/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }, { key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
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
