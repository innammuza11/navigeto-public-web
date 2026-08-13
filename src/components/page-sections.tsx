"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { BookingSearch } from "./booking-search";
import { AvailableHotels } from "./available-hotels";
import { ModuleSearch, type SearchType } from "./module-search";
import { liveApi, type PublicSiteConfig } from "@/lib/live-api";
type Data={
 eyebrow:string; title:string; copy:string; action:string;
 stats:readonly (readonly [string,string])[];
 cards:readonly (readonly [string,string])[];
};
export function ProductPage({data,kind}:{data:Data;kind:string}) {
  const searchType = ({ flights:"flight", hotels:"hotel", visas:"visa", transfers:"transfer" } as Record<string,SearchType>)[kind];
  const primaryHref=kind==="flight"?"/flights/search":kind==="hotel"?"/hotels/search":kind==="tour"?"/tours/sri-lanka":kind==="visa"?"/visas/apply":kind==="transfer"?"/transfers/search":"#enquire";
  return <>
    {searchType?<ModuleSearch type={searchType}/>:<section className="inner-hero"><div className="shell inner-grid"><div><p className="eyebrow">{data.eyebrow}</p><h1>{data.title}</h1><p className="lede">{data.copy}</p><div className="hero-actions"><Link href={primaryHref} className="button button-gold">{data.action}</Link><a href="https://wa.me/94774206166" className="button button-soft">Talk to a specialist</a></div></div><div className="glass-orb"><span>{kind.slice(0,1).toUpperCase()}</span><small>Navigeto<br/>TravelOS connected</small></div></div></section>}
    <section className="stats shell">{data.stats.map(([label,value])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>
    {kind==="hotels" && <AvailableHotels title="Published stays, priced clearly from the start." limit={8}/>}
    <section className="section shell"><div className="section-title"><p className="eyebrow">Designed around real travel</p><h2>Everything important, clearly handled.</h2></div><div className="card-grid">{data.cards.map(([title,copy],i)=><article className="rich-card" key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p><a href="#enquire">Learn more →</a></article>)}</div></section>
    <section className="section pale"><div className="shell split"><div><p className="eyebrow">Why Navigeto Travels</p><h2>Modern tools behind the scenes. Real people when it matters.</h2><p>TravelOS keeps rates, enquiries and operational handovers organised. Your experience stays simple, transparent and personal.</p></div><div className="check-list">{["Approved public selling information only","Clear inclusions and next steps","Sri Lanka-based support","No supplier costs or internal data exposed"].map(x=><div key={x}><span>✓</span>{x}</div>)}</div></div></section>
    <section className="section shell" id="enquire"><div className="enquiry-card"><div><p className="eyebrow">Start planning</p><h2>Tell us what you need.</h2><p>Share a few details and our team will turn them into a useful next step.</p></div><ConnectedEnquiryForm kind={kind}/></div></section>
    <section className="cta"><div className="shell"><div><p className="eyebrow">A better way to plan</p><h2>Ready to go further?</h2></div><Link className="button button-gold" href="/custom-trip">Build my private trip</Link></div></section>
  </>;
}

function ConnectedEnquiryForm({ kind }: { kind: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError("");
    const target = event.currentTarget;
    const form = new FormData(target);
    try {
      const result = await liveApi.enquiry({
        enquiry_type: kind === "flights" ? "flight" : kind === "hotels" ? "hotel" : kind === "visas" ? "visa" : kind === "transfers" ? "transfer" : kind === "corporate" ? "corporate" : kind === "holidays" ? "holiday" : kind === "tours" ? "tour" : "custom_trip",
        customer_name: String(form.get("name") || ""),
        whatsapp: String(form.get("contact") || ""),
        subject: `${kind.replaceAll("-", " ")} website enquiry`,
        notes: String(form.get("details") || ""),
        consent_contact: true,
      });
      setReference(result.enquiry.public_ref);
      target.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your enquiry could not be sent.");
    } finally { setPending(false); }
  }
  if (reference) return <div className="reference-box"><span>TravelOS reference</span><strong>{reference}</strong><p>Your request is now visible to the Navigeto team.</p></div>;
  return <form onSubmit={submit}><input name="name" aria-label="Name" placeholder="Your name" required/><input name="contact" aria-label="WhatsApp number" placeholder="WhatsApp number with country code" required/><textarea name="details" aria-label="Trip details" placeholder="Dates, destination and what matters to you" rows={4}/>{error && <p role="alert">{error}</p>}<button className="button button-gold" type="submit" disabled={pending}>{pending ? "Sending to TravelOS…" : "Send enquiry"}</button></form>;
}

export function LegalPage({kind}:{kind:"privacy"|"terms"}) {
 const privacy=kind==="privacy";
 return <section className="legal shell"><p className="eyebrow">Navigeto Travels</p><h1>{privacy?"How Navigeto handles website enquiries.":"Important information before confirming travel services."}</h1><p className="lede">{privacy?"We collect only the information needed to respond, plan and operate requested travel services.":"These terms explain quotations, payments, changes, supplier conditions and traveller responsibilities."}</p>
 {[
   [privacy?"Information we collect":"Quotations and availability",privacy?"Contact details, traveller preferences and trip information you choose to provide.":"All services remain subject to availability until confirmed in writing and any required payment is received."],
   [privacy?"How it is used":"Prices and payments",privacy?"To answer enquiries, prepare quotations, coordinate bookings and provide support.":"Your quotation states inclusions, currency, payment schedule and applicable cancellation conditions."],
   [privacy?"Sharing and retention":"Changes and cancellations",privacy?"Information is shared only with relevant service providers where needed to deliver your trip.":"Supplier-specific rules apply and will be communicated before confirmation."],
   [privacy?"Your choices":"Traveller responsibility",privacy?"You may request access, correction or deletion by contacting info@navigeto.com.":"Travellers are responsible for valid passports, visas, insurance and timely arrival for booked services."],
 ].map(([h,p])=><article key={h}><h2>{h}</h2><p>{p}</p></article>)}
 </section>;
}

export function HomeSections(){
 const [config,setConfig]=useState<PublicSiteConfig>({});
 useEffect(()=>{let active=true;liveApi.siteConfig().then(value=>{if(active)setConfig(value)}).catch(()=>undefined);return()=>{active=false}},[]);
 const journeyMoments=[
  ["beach","The south coast","Barefoot days, quietly luxurious.","/tours/sri-lanka?theme=beach"],
  ["ella","Ella by rail","Blue trains through a world of green.","/tours/sri-lanka?theme=culture"],
  ["wildlife","The wild","Meet the island on its own terms.","/tours/sri-lanka?theme=wildlife"],
  ["heritage","Living history","Ancient stories, still unfolding.","/tours/sri-lanka?theme=culture"],
 ] as const;
 const worldDestinations=[
  ["NRT","Japan","Tradition. Design. Discovery."],["DXB","United Arab Emirates","Desert light. City nights."],
  ["LHR","United Kingdom","Icons, culture and countryside."],["MLE","Maldives","Nothing between you and blue."],
  ["BKK","Thailand","Flavour, energy and islands."],["IST","Türkiye","Where continents meet."],
 ] as const;
 const services=[
  ["hotel","01","Hotels","Handpicked stays with real rooms and live selling rates.","/hotels"],
  ["tour","02","Private tours","Journeys designed around the way you want to feel.","/tours"],
  ["flight","03","Flights","International routes, considered connections and human help.","/flights"],
  ["transfer","04","Transfers","A seamless welcome from airport to coast and hills.","/transfers"],
  ["visa","05","Visas","Clear requirements and practical support before you fly.","/visas"],
  ["custom","06","Tailor-made","Your whole holiday, shaped in one conversation.","/custom-trip"],
 ] as const;
 return <>
  <section className="home-hero cinematic-hero">
   <div className="hero-image cinematic-hero-art"/>
   <div className="hero-shade"/>
   <div className="hero-film" aria-hidden="true"/>
   <div className="hero-route" aria-hidden="true"><span>CMB</span><i/><span>WORLD</span></div>
   <div className="shell cinematic-hero-layout">
    <div className="home-copy cinematic-copy">
     <p className="eyebrow">{config.tagline||"Bespoke journeys · Sri Lanka and beyond"}</p>
     <h1>Travel,<br/><em>beautifully</em><br/>connected.</h1>
     <p>From Ella&apos;s misty tea country to the cities and coastlines calling you next—every detail, considered by people who know travel.</p>
     <div className="hero-actions">
      <Link className="button button-gold" href="/custom-trip">Design my journey <span aria-hidden="true">↗</span></Link>
      <Link className="button button-soft" href="/tours">Explore the island</Link>
     </div>
     <div className="hero-proof" aria-label="Navigeto travel services"><span><b>01</b> Private journeys</span><span><b>02</b> Worldwide flights</span><span><b>03</b> Local expertise</span></div>
    </div>
   </div>
   <div className="hero-scroll" aria-hidden="true"><i/><span>Scroll to wander</span></div>
   <div className="shell search-wrap"><BookingSearch/></div>
  </section>
  <section className="experience-ribbon" aria-label="Navigeto experiences">
   <div><span>THE INDIAN OCEAN</span><i>—</i><span>ELLA BY RAIL</span><i>—</i><span>WILD ENCOUNTERS</span><i>—</i><span>ANCIENT KINGDOMS</span><i>—</i><span>THE WORLD BEYOND</span><i>—</i><span aria-hidden="true">THE INDIAN OCEAN</span><i aria-hidden="true">—</i><span aria-hidden="true">ELLA BY RAIL</span><i aria-hidden="true">—</i></div>
  </section>
  <section className="section journey-section">
   <div className="shell">
    <div className="section-title journey-heading"><div><p className="eyebrow">Sri Lanka, frame by frame</p><h2>Come for the view.<br/><em>Stay for the feeling.</em></h2></div><p>Warm water in the morning, cool tea-country air by evening. We turn the island&apos;s contrasts into one effortless journey.</p></div>
    <div className="journey-grid">{journeyMoments.map(([className,label,title,href],index)=><Link href={href} className={`journey-card journey-card-${className}`} key={label}><span>0{index+1} / {label}</span><div><h3>{title}</h3><b>Discover this side of Sri Lanka <i aria-hidden="true">↗</i></b></div></Link>)}</div>
   </div>
  </section>
  <section className="section world-section">
   <div className="shell world-grid">
    <div className="world-copy"><p className="eyebrow">The world, from Colombo</p><h2>Sri Lanka is only<br/><em>the beginning.</em></h2><p>Flights, visa guidance and the kind of practical human support that makes a faraway place feel closer.</p><div className="hero-actions"><Link className="button button-gold" href="/flights">Find an international flight</Link><Link className="button button-dark-soft" href="/visas">Explore visa support</Link></div></div>
    <div className="destination-board" aria-label="Popular international destinations">
     <div className="destination-board-head"><span>Departing</span><b>Colombo · CMB</b><i>Live routes</i></div>
     {worldDestinations.map(([code,country,mood])=><Link className="destination-line" href="/flights" key={country}><span>{code}</span><div><b>{country}</b><small>{mood}</small></div><i aria-hidden="true">↗</i></Link>)}
    </div>
   </div>
  </section>
  <section className="section service-flow-section">
   <div className="shell">
    <div className="section-title service-flow-heading"><div><p className="eyebrow">One journey. One connected team.</p><h2>Every detail,<br/><em>in rhythm.</em></h2></div><p>Search independently or let us bring the whole journey together—without losing the personal service that makes travel feel easy.</p></div>
    <div className="service-flow-grid">{services.map(([kind,number,title,copy,href])=><Link className={`service-flow-card service-flow-${kind}`} href={href} key={title}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div><b>Explore <i aria-hidden="true">↗</i></b></Link>)}</div>
   </div>
  </section>
  <section className="trust shell">{[["TravelOS connected","Live public selling information"],["Human support","Real people when it matters"],["Clear pricing","Transparent selling rates"],["Flexible planning","Thoughtfully handled changes"]].map(([h,p],index)=><div key={h}><span>0{index+1}</span><p><b>{h}</b><small>{p}</small></p></div>)}</section>
 </>;
}
