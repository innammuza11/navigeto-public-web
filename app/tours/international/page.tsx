import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Notice } from "@/components/Notice";
import { TourCard } from "@/components/TourCard";
import { getCachedInternationalTours } from "@/lib/server-public-data";
import type { PublicPackage } from "@/lib/types";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "International Tour Packages | Navigeto Travels",
  description: "Navigeto's published international tour packages beyond Sri Lanka — Thailand, Vietnam, Malaysia, Singapore, Dubai and more.",
  path: "/tours/international",
});

async function loadInternationalTours(): Promise<{ tours: PublicPackage[]; unavailable: boolean }> {
  try {
    const results = await getCachedInternationalTours();
    return { tours: results, unavailable: false };
  } catch {
    return { tours: [], unavailable: true };
  }
}

function groupByCountry(tours: PublicPackage[]): Array<[string, PublicPackage[]]> {
  const groups = new Map<string, PublicPackage[]>();
  for (const tour of tours) {
    const key = tour.country || "Other Destinations";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(tour);
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export default async function InternationalToursPage() {
  const { tours, unavailable } = await loadInternationalTours();
  const grouped = groupByCountry(tours);

  return (
    <>
      <PageHero
        eyebrow="Beyond Sri Lanka"
        title="International Tour Packages"
        description="Thailand, Vietnam, Malaysia, Singapore, Dubai and more — international programs published through the same Navigeto TravelOS you already trust."
      />
      <div className="shell content-wrap">
        {unavailable ? <Notice>Live package publishing is not connected yet — please check back soon or contact us directly.</Notice> : null}
        {!unavailable && tours.length === 0 ? (
          <div className="empty-state"><b>No international packages published yet.</b>Sri Lanka programs are available on our <Link className="text-link" href="/tours/sri-lanka">Sri Lanka Tours</Link> page.</div>
        ) : null}
        {grouped.map(([country, countryTours]) => (
          <div className="content-section" key={country}>
            <div className="eyebrow">{country}</div>
            <h2>{country} Programs</h2>
            <div className="card-grid">
              {countryTours.map((tour, index) => <TourCard key={tour.id} tour={tour} index={index} />)}
            </div>
          </div>
        ))}
        <div className="content-section" style={{ textAlign: "center" }}>
          <Link className="button button-primary" href="/custom-trip">Ask about a custom international trip</Link>
        </div>
      </div>
    </>
  );
}
