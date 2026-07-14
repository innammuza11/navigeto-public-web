import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { TourIcon } from "@/components/icons";
import type { PublicPackage } from "@/lib/types";

export function TourCard({ tour }: { tour: PublicPackage; index?: number }) {
  return (
    <article className="tour-card">
      <div
        className="tour-art"
        style={tour.hero_image_url ? { backgroundImage: `url(${tour.hero_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {tour.featured ? <span className="badge" style={{ alignSelf: "flex-start" }}>Featured</span> : <span />}
        <span className="duration">{tour.duration_nights} nights · {tour.duration_days} days</span>
        {!tour.hero_image_url ? <TourIcon size={48} className="tour-icon" /> : null}
      </div>
      <div className="tour-body">
        <h3>{tour.title}</h3>
        <div className="tour-destinations">{tour.destinations.join(" · ")}</div>
        <p>{tour.summary}</p>
        <div className="tag-row">{tour.tags.slice(0, 4).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
        <div className="tour-bottom">
          <strong>{formatMoney(tour.price_from, tour.currency || "USD")}</strong>
          <Link className="text-link" href={`/tours/${tour.slug}`}>View itinerary →</Link>
        </div>
      </div>
    </article>
  );
}
