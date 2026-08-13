import Link from "next/link";
import { notFound } from "next/navigation";
import { Notice } from "@/components/Notice";
import { getCachedTour, getCachedTours } from "@/lib/server-public-data";
import TourDetailClient from "./TourDetailClient";

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let tour;
  try {
    tour = await getCachedTour(slug);
  } catch {
    return <div className="shell content-wrap"><Notice>Tour details are temporarily unavailable. Please try again shortly or contact Navigeto directly.</Notice><Link className="text-link" href="/tours">Return to all tours</Link></div>;
  }
  if (!tour) notFound();
  const related = await getCachedTours().then((all) => all.filter((item) => item.slug !== tour.slug && (item.package_type === tour.package_type || item.tags.some((tag) => tour.tags.includes(tag)))).slice(0, 3)).catch(() => []);
  return <TourDetailClient tour={tour} related={related} />;
}
