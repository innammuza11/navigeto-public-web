"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HotelStartingRate, liveApi } from "@/lib/live-api";
import { Money } from "@/components/money";

const hotelImages = [
  "/media/hotel-forest-v1.webp",
  "/media/hotel-suite-v1.webp",
  "/media/beach-south-coast-v1.webp",
  "/media/heritage-galle-v1.webp",
];
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function AvailableHotels({ title = "Hotels available around your journey.", destination = "", limit = 4 }: { title?: string; destination?: string; limit?: number }) {
  const [hotels, setHotels] = useState<HotelStartingRate[]>([]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = destination || params.get("destination") || params.get("country") || "";
    const request = (query: string) => liveApi.hotelStartingRates({ q: query, max_results: limit });
    request(q)
      .then((result) => result.results.length || !q ? result : request(""))
      .then((result) => setHotels(result.results.slice(0, limit)))
      .catch(() => setHotels([]));
  }, [destination, limit]);
  if (!hotels.length) return null;
  return <section className="available-hotels section pale"><div className="shell">
    <div className="results-head"><div><p className="eyebrow">Live hotel availability</p><h2>{title}</h2></div><Link className="button button-soft" href="/hotels/search">See all hotels →</Link></div>
    <div className="hotel-cross-grid">{hotels.map((hotel, index) => <article className="hotel-cross-card" key={hotel.rate_id}>
      <Link href={`/hotels/${hotel.public_slug || slugify(hotel.hotel_name)}?hotel=${encodeURIComponent(hotel.hotel_name)}`} className={`hotel-cross-art hotel-cross-art-${index % 4}`} style={{backgroundImage:`url("${hotel.cover_image_url || hotelImages[index%hotelImages.length]}")`}}><span>{hotel.star_category || "Published stay"}</span></Link>
      <div><p className="eyebrow">{hotel.destination || "Sri Lanka"}</p><h3>{hotel.hotel_name}</h3><p>{hotel.room_type || "Room"} · {hotel.meal_plan || "Room only"}</p><div><Money value={hotel.starting_rate_per_night} currency={hotel.currency} suffix="Starting from · per room / night"/><Link href={`/hotels/search?q=${encodeURIComponent(hotel.hotel_name)}`}>Check exact rates →</Link></div></div>
    </article>)}</div>
  </div></section>;
}
