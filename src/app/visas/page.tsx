import { SiteShell } from "@/components/site-shell";
import { VisaStorefront } from "@/components/visa-storefront";
import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata("/visas");

export default function Page() {
  return <SiteShell><VisaStorefront /></SiteShell>;
}
