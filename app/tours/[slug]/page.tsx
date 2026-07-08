"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingCards } from "@/components/Loading";
import { FALLBACK_PACKAGES } from "@/lib/defaults";
import { formatMoney } from "@/lib/format";
import { getTour } from "@/lib/travelos";
import type { PublicPackage } from "@/lib/types";

export default function TourDetailPage(){
  const params=useParams<{slug:string}>(); const slug=String(params.slug||""); const[tour,setTour]=useState<PublicPackage|null>(null); const[loading,setLoading]=useState(true);
  useEffect(()=>{getTour(slug).then((result)=>setTour(result||FALLBACK_PACKAGES.find((item)=>item.slug===slug)||null)).catch(()=>setTour(FALLBACK_PACKAGES.find((item)=>item.slug===slug)||null)).finally(()=>setLoading(false))},[slug]);
  if(loading)return <div className="shell content-wrap"><LoadingCards count={2}/></div>;
  if(!tour)return <div className="shell content-wrap"><div className="empty-state"><b>Tour not found.</b><Link className="text-link" href="/tours">Return to all tours</Link></div></div>;
  const itinerary: Array<{day:number;title:string;description:string;overnight?:string}> = tour.itinerary.length ? tour.itinerary : Array.from({length:tour.duration_days}).map((_,i)=>({day:i+1,title:`Day ${i+1} – Tailor-made program`,description:"This day will be customised according to your flight timing, hotel plan, interests and preferred pace."}));
  return <><section className="page-hero"><div className="shell"><div className="eyebrow light">{tour.duration_nights} Nights / {tour.duration_days} Days</div><h1>{tour.title}</h1><p>{tour.summary}</p><div className="tag-row">{tour.destinations.map((item)=><span className="tag" key={item}>{item}</span>)}</div></div></section><div className="shell content-wrap detail-grid"><div className="detail-main"><div className="content-section" style={{marginTop:0}}><div className="eyebrow">Day-by-day journey</div><h2>Your starting itinerary</h2><div className="itinerary-list">{itinerary.map((day)=><article className="day-card" key={day.day}><div className="day-number">D{day.day}</div><div><h3>{day.title}</h3><p>{day.description}</p>{day.overnight?<div className="location">Overnight: {day.overnight}</div>:null}</div></article>)}</div></div><div className="content-section split-lists"><div><h2>Inclusions</h2><ul className="clean-list">{tour.inclusions.map((item)=><li key={item}>{item}</li>)}</ul></div><div><h2>Exclusions</h2><ul className="clean-list exclusions">{tour.exclusions.map((item)=><li key={item}>{item}</li>)}</ul></div></div></div><aside className="detail-side"><div className="eyebrow">Package guide</div><h2 className="detail-title">{formatMoney(tour.price_from,tour.currency||"USD")}</h2><p>{tour.price_from?"Starting selling price. Final rate depends on dates, hotels, occupancy and group size.":"Send your dates and group details for the live TravelOS quotation."}</p><div className="meta-grid"><div className="meta-item"><small>Duration</small><b>{tour.duration_nights} nights</b></div><div className="meta-item"><small>Style</small><b>{tour.package_type||"Private"}</b></div><div className="meta-item"><small>Minimum</small><b>{tour.min_pax||1} traveller</b></div><div className="meta-item"><small>Route</small><b>{tour.destinations.length} regions</b></div></div><Link className="button button-primary button-block" href={`/custom-trip?package=${encodeURIComponent(tour.title)}`}>Customise this tour</Link><Link className="button button-ghost button-block" style={{marginTop:10}} href="/trip-assistant">Ask the trip assistant</Link></aside></div></>;
}
