import { SiteShell } from "@/components/site-shell";
import { VisaStorefront } from "@/components/visa-storefront";
import { VisaDestinationIndex } from "@/components/visa-destination-index";
import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata("/visas");

export const revalidate = 21600;

export default function Page() {
  return <SiteShell><VisaStorefront /><VisaDestinationIndex /></SiteShell>;
}
