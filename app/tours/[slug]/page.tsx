"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingCards } from "@/components/Loading";
import { useSite } from "@/components/SiteProvider";
import { formatMoney, whatsappUrl } from "@/lib/format";
import { getTour, listTours } from "@/lib/travelos";
import { TourIcon } from "@/components/icons";
import type { PublicPackage } from "@/lib/types";

export default function TourDetailPage(){
  const params=useParams<{slug:string}>(); const slug=String(params.slug||""); const[tour,setTour]=useState<PublicPackage|null>(null); const[loading,setLoading]=useState(true);
  const[related,setRelated]=useState<PublicPackage[]>([]);
  const { config } = useSite();
  useEffect(()=>{getTour(slug).then((result)=>setTour(result)).catch(()=>setTour(null)).finally(()=>setLoading(false))},[slug]);
  useEffect(()=>{ if(!tour) return; listTours().then((all)=>setRelated(all.filter((item)=>item.slug!==tour.slug && (item.package_type===tour.package_type || item.tags.some((tag)=>tour.tags.includes(tag)))).slice(0,3))).catch(()=>undefined); },[tour]);
  if(loading)return <div className="shell content-wrap"><LoadingCards count={2}/></div>;
  if(!tour)return <div className="shell content-wrap"><div className="empty-state"><b>Tour not found.</b><Link className="text-link" href="/tours">Return to all tours</Link></div></div>;
  const itinerary: PublicPackage["itinerary"] = tour.itinerary.length ? tour.itinerary : Array.from({length:tour.duration_days}).map((_,i)=>({day:i+1,title:`Day ${i+1} – Tailor-made program`,description:"This day will be customised according to your flight timing, hotel plan, interests and preferred pace."}));
  const shareMessage = `Hi Navigeto, I'm interested in "${tour.title}" (${tour.duration_nights} nights / ${tour.duration_days} days). Please send me availability and pricing.`;
  return <>
    <section className="page-hero" style={tour.hero_image_url ? { backgroundImage: `linear-gradient(120deg, rgba(6,24,43,.82), rgba(11,86,116,.75)), url(${tour.hero_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
      <div className="shell"><div className="eyebrow light">{tour.duration_nights} Nights / {tour.duration_days} Days</div><h1>{tour.title}</h1><p>{tour.summary}</p><div className="tag-row">{tour.destinations.map((item)=><span className="tag" key={item}>{item}</span>)}</div></div>
    </section>
    <div className="shell content-wrap detail-grid">
      <div className="detail-main">
        <div className="content-section" style={{marginTop:0}}><div className="eyebrow">Day-by-day journey</div><h2>Your starting itinerary</h2><div className="itinerary-list">{itinerary.map((day)=><DayCard key={day.day} day={day}/>)}</div></div>
        <div className="content-section split-lists"><div><h2>Inclusions</h2><ul className="clean-list">{tour.inclusions.map((item)=><li key={item}>{item}</li>)}</ul></div><div><h2>Exclusions</h2><ul className="clean-list exclusions">{tour.exclusions.map((item)=><li key={item}>{item}</li>)}</ul></div></div>
        {related.length ? <div className="content-section"><div className="eyebrow">You may also like</div><h2>Related programs</h2><div className="card-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>{related.map((item)=><article className="tour-card" key={item.id}><div className="tour-art" style={item.hero_image_url ? { backgroundImage:`url(${item.hero_image_url})`, backgroundSize:"cover", backgroundPosition:"center" } : undefined}><span className="duration">{item.duration_nights} nights</span>{!item.hero_image_url ? <TourIcon size={40} className="tour-icon" /> : null}</div><div className="tour-body"><h3>{item.title}</h3><div className="tour-bottom"><strong>{formatMoney(item.price_from,item.currency||"USD")}</strong><Link className="text-link" href={`/tours/${item.slug}`}>View →</Link></div></div></article>)}</div></div> : null}
      </div>
      <aside className="detail-side">
        <div className="eyebrow">Package guide</div>
        <h2 className="detail-title">{formatMoney(tour.price_from,tour.currency||"USD")}</h2>
        <p>{tour.price_from?"Starting selling price. Final rate depends on dates, hotels, occupancy and group size.":"Send your dates and group details for the live TravelOS quotation."}</p>
        <div className="meta-grid">
          <div className="meta-item"><small>Duration</small><b>{tour.duration_nights} nights</b></div>
          <div className="meta-item"><small>Style</small><b>{tour.package_type||"Private"}</b></div>
          <div className="meta-item"><small>Minimum</small><b>{tour.min_pax||1} traveller</b></div>
          <div className="meta-item"><small>Maximum</small><b>{tour.max_pax?`${tour.max_pax} travellers`:"Flexible"}</b></div>
        </div>
        <Link className="button button-primary button-block" href={`/custom-trip?package=${encodeURIComponent(tour.title)}`}>Customise this tour</Link>
        <Link className="button button-ghost button-block" style={{marginTop:10}} href="/trip-assistant">Ask the trip assistant</Link>
        <a className="button button-ghost button-block" style={{marginTop:10}} href={whatsappUrl(config.whatsapp_number, shareMessage)} target="_blank" rel="noreferrer">Share on WhatsApp</a>
        <button type="button" className="button button-ghost button-block" style={{marginTop:10}} onClick={() => window.print()}>Download / print itinerary</button>
      </aside>
    </div>
  </>;
}

function DayCard({ day }: { day: PublicPackage["itinerary"][number] }) {
  const activities = day.activities || [];
  const optionalActivities = day.optional_activities || [];
  const overnightLine = [day.hotel_name, day.overnight].filter(Boolean).join(" · ");
  const meta = [day.service_type, day.meals && `Meals: ${day.meals}`].filter(Boolean) as string[];
  return (
    <article className="day-card day-card--banner">
      <div className="day-banner"><span className="day-number">DAY {String(day.day).padStart(2, "0")}</span><span>{day.date ? ` — ${day.date}` : ""}</span></div>
      <div className="day-body">
        {day.route ? <p className="day-route">{day.route}</p> : null}
        {overnightLine ? <p className="day-overnight"><strong>Overnight Stay: </strong>{overnightLine}</p> : null}
        {day.description ? <p>{day.description}</p> : null}
        {activities.length ? <>
          <h4 className="day-section-label">Included Visits / Activities</h4>
          {activities.map((activity, i) => (
            <div className="day-activity" key={i}>
              <h4>{activity.icon ? `${activity.icon} ` : ""}{activity.title}</h4>
              {activity.description ? <p>{activity.description}</p> : null}
            </div>
          ))}
        </> : null}
        {optionalActivities.length ? <>
          <h4 className="day-section-label">Optional Experiences</h4>
          <ul className="clean-list">{optionalActivities.map((item) => <li key={item}>{item}</li>)}</ul>
        </> : null}
        {meta.length ? <div className="day-meta">{meta.map((item) => <span key={item}>{item}</span>)}</div> : null}
        {day.notes ? <p className="day-note">Note: {day.notes}</p> : null}
      </div>
    </article>
  );
}
