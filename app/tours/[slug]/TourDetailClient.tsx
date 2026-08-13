"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSite } from "@/components/SiteProvider";
import { formatMoney, whatsappUrl } from "@/lib/format";
import { TourIcon } from "@/components/icons";
import type { PublicMedia, PublicPackage } from "@/lib/types";

export default function TourDetailClient({ tour, related }: { tour: PublicPackage; related: PublicPackage[] }){
  const[selectedImage,setSelectedImage]=useState<PublicMedia|null>(null);
  const { config } = useSite();
  const itinerary: PublicPackage["itinerary"] = tour.itinerary.length ? tour.itinerary : Array.from({length:tour.duration_days}).map((_,i)=>({day:i+1,title:`Day ${i+1} – Tailor-made program`,description:"This day will be customised according to your flight timing, hotel plan, interests and preferred pace."}));
  const gallery=(tour.gallery||[]).filter((item)=>item.url);
  const shareMessage = `Hi Navigeto, I'm interested in "${tour.title}" (${tour.duration_nights} nights / ${tour.duration_days} days). Please send me availability and pricing.`;
  return <>
    <section className="page-hero">
      {tour.hero_image_url ? <><Image className="seo-hero-image" src={tour.hero_image_url} alt="" fill priority sizes="100vw" /><div className="seo-hero-overlay" /></> : null}
      <div className="shell seo-hero-content"><div className="eyebrow light">{tour.duration_nights} Nights / {tour.duration_days} Days</div><h1>{tour.title}</h1><p>{tour.summary}</p><div className="tag-row">{tour.destinations.map((item)=><span className="tag" key={item}>{item}</span>)}</div></div>
    </section>
    <div className="shell content-wrap detail-grid">
      <div className="detail-main">
        {gallery.length ? <div className="content-section tour-gallery-section" style={{marginTop:0}}><div className="gallery-heading"><div><div className="eyebrow">Tour gallery</div><h2>Places and experiences</h2></div><span>{gallery.length} photo{gallery.length===1?"":"s"}</span></div><div className="photo-grid">{gallery.slice(0,8).map((image,index)=><button type="button" className="photo-tile" key={`${image.url}-${index}`} onClick={()=>setSelectedImage(image)}><Image src={image.url} alt={image.alt_text||image.caption||tour.title} fill sizes="(max-width: 640px) 100vw, 25vw"/>{image.caption?<span>{image.caption}</span>:null}</button>)}</div></div> : null}
        <div className="content-section" style={{marginTop:gallery.length?undefined:0}}><div className="eyebrow">Day-by-day journey</div><h2>Your starting itinerary</h2><div className="itinerary-list">{itinerary.map((day)=><DayCard key={day.day} day={day} onImage={setSelectedImage}/>)}</div></div>
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
    {selectedImage?<div className="lightbox" role="dialog" aria-modal="true" onClick={()=>setSelectedImage(null)}><button type="button" className="lightbox-close" onClick={()=>setSelectedImage(null)}>×</button><Image src={selectedImage.url} alt={selectedImage.alt_text||selectedImage.caption||tour.title} width={1600} height={1000} sizes="92vw" priority/>{selectedImage.caption?<p>{selectedImage.caption}</p>:null}</div>:null}
  </>;
}

function DayCard({ day,onImage }: { day: PublicPackage["itinerary"][number]; onImage:(image:PublicMedia)=>void }) {
  const activities = day.activities || [];
  const optionalActivities = day.optional_activities || [];
  const images=(day.images||[]).filter((item)=>item.url);
  const overnightLine = [day.hotel_name, day.overnight].filter(Boolean).join(" · ");
  const meta = [day.service_type, day.meals && `Meals: ${day.meals}`].filter(Boolean) as string[];
  return (
    <article className="day-card day-card--banner">
      <div className="day-banner"><span className="day-number">DAY {String(day.day).padStart(2, "0")}</span><span>{day.date ? ` — ${day.date}` : ""}</span></div>
      {images[0]?<button type="button" className="day-cover-button" onClick={()=>onImage(images[0])}><Image className="day-cover-image" src={images[0].url} alt={images[0].alt_text||images[0].caption||day.title} fill sizes="(max-width: 1000px) 100vw, 70vw"/></button>:null}
      <div className="day-body">
        {day.route ? <p className="day-route">{day.route}</p> : null}
        {overnightLine ? <p className="day-overnight"><strong>Overnight Stay: </strong>{overnightLine}</p> : null}
        {day.description ? <p>{day.description}</p> : null}
        {activities.length ? <><h4 className="day-section-label">Included Visits / Activities</h4>{activities.map((activity, i) => <div className="day-activity" key={i}><h4>{activity.icon ? `${activity.icon} ` : ""}{activity.title}</h4>{activity.description ? <p>{activity.description}</p> : null}</div>)}</> : null}
        {optionalActivities.length ? <><h4 className="day-section-label">Optional Experiences</h4><ul className="clean-list">{optionalActivities.map((item) => <li key={item}>{item}</li>)}</ul></> : null}
        {images.length>1?<div className="day-photo-strip">{images.slice(1,5).map((image,index)=><button type="button" key={`${image.url}-${index}`} onClick={()=>onImage(image)}><Image src={image.url} alt={image.alt_text||image.caption||day.title} fill sizes="(max-width: 640px) 50vw, 18vw"/></button>)}</div>:null}
        {meta.length ? <div className="day-meta">{meta.map((item) => <span key={item}>{item}</span>)}</div> : null}
        {day.notes ? <p className="day-note">Note: {day.notes}</p> : null}
      </div>
    </article>
  );
}
