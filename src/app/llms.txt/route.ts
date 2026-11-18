import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { ITINERARY_GUIDES } from "@/lib/itinerary-guides";
import { allPublishedTours } from "@/lib/tour-catalogue";
import { publicVisaCatalog } from "@/lib/visa-catalog-server";
import { visaDestinations } from "@/lib/visa-pages";
import { buildLlmsTxt } from "@/lib/answer-engine";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 21600;

export async function GET() {
  const [tourResult, visaResult] = await Promise.allSettled([allPublishedTours(), publicVisaCatalog()]);
  const tours = tourResult.status === "fulfilled" ? tourResult.value : [];
  // Only officially verified visa destinations, the same rule as the sitemap.
  const visas = visaResult.status === "fulfilled" ? visaDestinations(visaResult.value).filter(item => item.verified) : [];
  const body = buildLlmsTxt(SITE_URL, {
    guides: DESTINATION_GUIDES.map(guide => ({ title: `${guide.name} travel guide`, path: `/sri-lanka/${guide.slug}`, note: guide.intro.split(". ")[0] })),
    itineraries: ITINERARY_GUIDES.map(guide => ({ title: guide.name, path: `/itineraries/${guide.slug}`, note: guide.intro.split(". ")[0] })),
    visas: visas.map(item => ({ title: `${item.name} visa for Sri Lankan passport holders`, path: `/visas/${item.slug}` })),
    tours: tours.map(tour => ({ title: tour.title, path: `/tours/package/${tour.slug}`, note: [tour.duration_days ? `${tour.duration_days} days` : "", tour.country || "Sri Lanka"].filter(Boolean).join(", ") })),
  });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=21600" } });
}
