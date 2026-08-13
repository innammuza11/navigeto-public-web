import Link from "next/link";
import { notFound } from "next/navigation";
import { Notice } from "@/components/Notice";
import { getCachedHotel } from "@/lib/server-public-data";
import HotelDetailClient from "./HotelDetailClient";

export default async function HotelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let hotel;
  try {
    hotel = await getCachedHotel(slug);
  } catch {
    return <div className="shell content-wrap"><Notice>Hotel details are temporarily unavailable. Please try again shortly or contact Navigeto directly.</Notice><Link className="text-link" href="/hotels">Return to hotel search</Link></div>;
  }
  if (!hotel) notFound();
  return <HotelDetailClient hotel={hotel} />;
}
