import { SiteShell } from "@/components/site-shell";
import { GroupDepartures } from "@/components/group-departures";
import { seoMetadata } from "@/lib/seo";
export const metadata = seoMetadata("/group-tours", { title: "International group departures from Sri Lanka | Navigeto", description: "Explore future international group tours from Sri Lanka. Review departure dates, adult prices, flight and visa terms, then request your places." });
export default async function Page({ searchParams }: { searchParams: Promise<{ departure?: string | string[] }> }) { const query = await searchParams; const departureId = typeof query.departure === "string" ? query.departure : ""; return <SiteShell><GroupDepartures departureId={departureId}/></SiteShell>; }
