import { SiteShell } from "@/components/site-shell";
import { VisaDocumentPortal } from "@/components/visa-storefront";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SiteShell><VisaDocumentPortal token={token} /></SiteShell>;
}
