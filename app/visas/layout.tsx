import { createSeoMetadata, STATIC_SEO } from "@/lib/seo";
export const metadata = createSeoMetadata(STATIC_SEO.visas);
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
