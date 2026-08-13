import type { Metadata } from "next";
import { getCachedTour } from "@/lib/server-public-data";
import { createSeoMetadata, PUBLIC_SITE_URL, safeJsonLd } from "@/lib/seo";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Pick<Props,"params">): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getCachedTour(slug).catch(() => null);
  if (!tour) return createSeoMetadata({ title: "Tour not found | Navigeto Travels", description: "This tour page is not currently available.", path: `/tours/${slug}`, noIndex: true });
  const title = tour.seo_title || `${tour.title} | Private Tour with Navigeto`;
  const description = tour.seo_description || tour.summary || `Explore ${tour.title} with a private itinerary planned by Navigeto Travels.`;
  return createSeoMetadata({ title, description, path: `/tours/${tour.slug}`, image: tour.hero_image_url });
}

export default async function TourSeoLayout({ children, params }: Props) {
  const { slug } = await params;
  const tour = await getCachedTour(slug).catch(() => null);
  if (!tour) return children;
  const canonical = `${PUBLIC_SITE_URL}/tours/${tour.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        "@id": `${canonical}/#trip`,
        name: tour.title,
        url: canonical,
        description: tour.seo_description || tour.summary,
        image: tour.hero_image_url || undefined,
        touristType: tour.tags,
        itinerary: {
          "@type": "ItemList",
          itemListElement: tour.itinerary.map((day,index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: day.title,
            description: day.description,
          })),
        },
        offers: tour.price_from ? {
          "@type": "Offer",
          price: tour.price_from,
          priceCurrency: tour.currency || "USD",
          availability: "https://schema.org/LimitedAvailability",
          url: canonical,
          seller: { "@id": `${PUBLIC_SITE_URL}/#organization` },
        } : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: PUBLIC_SITE_URL },
          { "@type": "ListItem", position: 2, name: "Tours", item: `${PUBLIC_SITE_URL}/tours` },
          { "@type": "ListItem", position: 3, name: tour.title, item: canonical },
        ],
      },
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJsonLd(schema)}} />{children}</>;
}
