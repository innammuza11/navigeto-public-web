import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Notice } from "@/components/Notice";
import { TourCard } from "@/components/TourCard";
import { listTours } from "@/lib/travelos";
import type { PublicPackage } from "@/lib/types";

function titleCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const name = titleCase(decodeURIComponent(country));
  return {
    title: `${name} Tour Packages | Navigeto Travels`,
    description: `Navigeto's published ${name} tour packages, ready to personalise with hotels, pace and transport.`,
  };
}

async function loadCountryTours(country: string): Promise<{ tours: PublicPackage[]; unavailable: boolean }> {
  try {
    const results = await listTours({ country });
    return { tours: results, unavailable: false };
  } catch {
    return { tours: [], unavailable: true };
  }
}

export default async function CountryToursPage({ params }: { params: Promise<{ country: string }> }) {
  const { country: countrySlug } = await params;
  const country = titleCase(decodeURIComponent(countrySlug));
  const { tours, unavailable } = await loadCountryTours(country);

  return (
    <>
      <PageHero
        eyebrow="Destination"
        title={`${country} Tour Packages`}
        description={`Published ${country} programs from Navigeto TravelOS, ready to personalise.`}
      />
      <div className="shell content-wrap">
        {unavailable ? <Notice>Live package publishing is not connected yet — please check back soon or contact us directly.</Notice> : null}
        <div className="results-header">
          <div><h2>Published {country} programs</h2><p>Prices are shown only when published by Navigeto.</p></div>
          <b>{tours.length} package{tours.length === 1 ? "" : "s"}</b>
        </div>
        {tours.length ? (
          <div className="card-grid">
            {tours.map((tour, index) => <TourCard key={tour.id} tour={tour} index={index} />)}
          </div>
        ) : (
          <div className="empty-state">
            <b>No {country} packages published yet.</b>
            Browse all <Link className="text-link" href="/tours/international">international programs</Link> or <Link className="text-link" href="/custom-trip">ask for a custom trip</Link>.
          </div>
        )}
      </div>
    </>
  );
}
