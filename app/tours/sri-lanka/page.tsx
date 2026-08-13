import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { TourCard } from "@/components/TourCard";
import { getCachedCountryTours } from "@/lib/server-public-data";
import type { PublicPackage } from "@/lib/types";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Sri Lanka Tour Packages | Navigeto Travels",
  description: "Browse Navigeto's published Sri Lanka tour packages — cultural triangle, hill country, wildlife and beach routes, ready to personalise.",
  path: "/tours/sri-lanka",
});

async function loadSriLankaTours(): Promise<PublicPackage[]> {
  try {
    return await getCachedCountryTours("Sri Lanka");
  } catch {
    return [];
  }
}

export default async function SriLankaToursPage() {
  const tours = await loadSriLankaTours();

  return (
    <>
      <PageHero
        eyebrow="Sri Lanka"
        title="Sri Lanka Tour Packages"
        description="Cultural triangle heritage, hill-country tea estates, wildlife safaris and south-coast beaches — proven routes you can personalise with Navigeto."
      />
      <div className="shell content-wrap">
        <div className="results-header">
          <div><h2>Published Sri Lanka programs</h2><p>Prices are shown only when published by Navigeto.</p></div>
          <b>{tours.length} package{tours.length === 1 ? "" : "s"}</b>
        </div>
        {tours.length ? (
          <div className="card-grid">
            {tours.map((tour, index) => <TourCard key={tour.id} tour={tour} index={index} />)}
          </div>
        ) : (
          <div className="empty-state"><b>No Sri Lanka packages published yet.</b>Check back soon, or <Link className="text-link" href="/custom-trip">create a custom tour</Link>.</div>
        )}
        <div className="content-section" style={{ textAlign: "center" }}>
          <Link className="button button-primary" href="/custom-trip?destination=Sri+Lanka">Create a custom Sri Lanka trip</Link>
        </div>
      </div>
    </>
  );
}
