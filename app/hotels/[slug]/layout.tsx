import type { Metadata } from "next";
import { getCachedHotel } from "@/lib/server-public-data";
import { createSeoMetadata, PUBLIC_SITE_URL, safeJsonLd } from "@/lib/seo";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Pick<Props,"params">): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getCachedHotel(slug).catch(() => null);
  if (!hotel) return createSeoMetadata({ title: "Hotel not found | Navigeto Travels", description: "This hotel page is not currently available.", path: `/hotels/${slug}`, noIndex: true });
  const title = hotel.seo_title || `${hotel.hotel_name} in ${hotel.destination} | Navigeto Travels`;
  const description = hotel.seo_description || hotel.short_description || `Discover ${hotel.hotel_name} in ${hotel.destination} and request current availability and customer-ready rates from Navigeto Travels.`;
  return createSeoMetadata({ title, description, path: `/hotels/${hotel.slug}`, image: hotel.cover_image_url });
}

export default async function HotelSeoLayout({ children, params }: Props) {
  const { slug } = await params;
  const hotel = await getCachedHotel(slug).catch(() => null);
  if (!hotel) return children;
  const images = [hotel.cover_image_url,...hotel.gallery.map((image) => image.url)].filter(Boolean);
  const canonical = `${PUBLIC_SITE_URL}/hotels/${hotel.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Hotel",
        "@id": `${canonical}/#hotel`,
        name: hotel.hotel_name,
        url: canonical,
        description: hotel.seo_description || hotel.short_description || hotel.full_description || undefined,
        image: images,
        address: {
          "@type": "PostalAddress",
          streetAddress: hotel.address || undefined,
          addressLocality: hotel.city || hotel.destination,
          addressCountry: hotel.country || "LK",
        },
        geo: hotel.latitude != null && hotel.longitude != null ? { "@type": "GeoCoordinates", latitude: hotel.latitude, longitude: hotel.longitude } : undefined,
        checkinTime: hotel.check_in_time || undefined,
        checkoutTime: hotel.check_out_time || undefined,
        amenityFeature: hotel.facilities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: PUBLIC_SITE_URL },
          { "@type": "ListItem", position: 2, name: "Hotels", item: `${PUBLIC_SITE_URL}/hotels` },
          { "@type": "ListItem", position: 3, name: hotel.hotel_name, item: canonical },
        ],
      },
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJsonLd(schema)}} />{children}</>;
}
