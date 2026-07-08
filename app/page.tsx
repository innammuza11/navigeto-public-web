"use client";

import Link from "next/link";
import { HomeSearch } from "@/components/HomeSearch";
import { useSite } from "@/components/SiteProvider";
import { whatsappUrl } from "@/lib/format";
import {
  HotelIcon, TransferIcon, TourIcon, PlaneIcon, HolidayIcon, VisaIcon, CorporateIcon,
  MapPinIcon, ShieldIcon, BoltIcon,
} from "@/components/icons";

const services = [
  { key: "hotel_enabled", href: "/hotels", Icon: HotelIcon, title: "Live Hotel Search", body: "Search approved active hotel rates by destination, dates, room occupancy and meal plan.", cta: "Search hotels", art: "hotel" },
  { key: "transfer_enabled", href: "/transfers", Icon: TransferIcon, title: "Private Transfers", body: "Get customer-ready transfer rates from approved route mileage and vehicle masters.", cta: "Check transfer rates", art: "transfer" },
  { key: "tour_enabled", href: "/tours", Icon: TourIcon, title: "Tailor-made Tours", body: "Choose a starting program, then personalise hotels, pace, activities and transport.", cta: "Explore tours", art: "tour" },
  { key: null, href: "/flights", Icon: PlaneIcon, title: "Flight Reservations", body: "Send your route and dates — a consultant checks live availability and fares for you.", cta: "Request a flight", art: "hotel" },
  { key: null, href: "/holidays", Icon: HolidayIcon, title: "International Holidays", body: "Maldives, Dubai, Thailand and more — flights, hotels and tours planned as one trip.", cta: "Plan a holiday", art: "tour" },
  { key: null, href: "/visas", Icon: VisaIcon, title: "Visa Assistance", body: "Eligibility, documents and processing time confirmed by a consultant before you apply.", cta: "Check visa requirements", art: "transfer" },
] as const;

export default function HomePage() {
  const { config } = useSite();
  const visibleServices = services.filter((s) => s.key === null || Boolean(config[s.key]));
  return <>
    <section className="hero">
      <div className="shell hero-grid">
        <div className="hero-copy">
          <div className="eyebrow light">Sri Lanka · Hotels · Transfers · Tours · Flights · Visas</div>
          <h1>{config.hero_title}</h1>
          <p>{config.hero_subtitle}</p>
          <div className="hero-actions">
            <Link className="button button-gold" href="/custom-trip">Build my Sri Lanka trip</Link>
            <a className="button button-ghost" href={whatsappUrl(config.whatsapp_number, "Hi Navigeto, I would like to plan a Sri Lanka holiday.")} target="_blank" rel="noreferrer">Talk to a travel specialist</a>
          </div>
          <div className="hero-trust"><span>TravelOS live pricing</span><span>Private local support</span><span>Tailor-made programs</span></div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="island-card">
            <svg viewBox="0 0 500 500" role="img" aria-label="Sri Lanka travel illustration">
              <defs><linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#68d8e7" stopOpacity=".8"/><stop offset="1" stopColor="#0b5474" stopOpacity=".25"/></linearGradient><linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f0c66c"/><stop offset=".5" stopColor="#7ab78d"/><stop offset="1" stopColor="#2a725f"/></linearGradient></defs>
              <circle cx="250" cy="250" r="205" fill="url(#sea)" opacity=".55"/>
              <path d="M278 65c-47 32-80 92-90 147-8 46 6 80 32 112 21 25 35 57 46 92 11-16 33-38 54-69 30-44 38-96 27-147-11-52-31-101-69-135z" fill="url(#land)" stroke="#fff" strokeOpacity=".5" strokeWidth="4"/>
              <path d="M175 350c-50-13-80 8-108 43M346 104c40-30 75-21 105-4" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeDasharray="7 8"/>
            </svg>
          </div>
          <div className="floating-stat one"><b>Live</b> customer hotel rates</div>
          <div className="floating-stat two"><b>24/7</b> trip enquiry intake</div>
        </div>
      </div>
    </section>
    <div className="shell search-dock"><HomeSearch /></div>

    <section className="section white"><div className="shell">
      <div className="section-heading"><div><div className="eyebrow">Book with confidence</div><h2>Everything for your journey, in one place.</h2></div><p>One connected workflow from your first search to the Navigeto operations team. Public selling prices stay separate from contracted supplier rates.</p></div>
      <div className="card-grid">
        {visibleServices.map((s) => <Link className="service-card" href={s.href} key={s.href}><div className={`service-art ${s.art}`}><s.Icon size={54} className="service-icon" /></div><div className="service-body"><h3>{s.title}</h3><p>{s.body}</p><span className="text-link">{s.cta} →</span></div></Link>)}
        <Link className="service-card" href="/corporate"><div className="service-art transfer"><CorporateIcon size={54} className="service-icon" /></div><div className="service-body"><h3>Corporate & Group Travel</h3><p>Business travel, MICE and group programs with one account team and consolidated invoicing.</p><span className="text-link">Talk to our corporate team →</span></div></Link>
      </div>
    </div></section>

    <section className="section soft"><div className="shell">
      <div className="section-heading"><div><div className="eyebrow">Sri Lanka favourites</div><h2>Four regions. Hundreds of possibilities.</h2></div><p>Start with the places you love. Our operations team can build the route around your arrival, departure, pace and travel style.</p></div>
      <div className="destination-grid">{config.featured_destinations.map((item) => <Link href={`/custom-trip?destination=${encodeURIComponent(item.name)}`} className="destination-card" key={item.name}><MapPinIcon size={26} className="dest-icon" /><h3>{item.name}</h3><p>{item.description}</p></Link>)}</div>
    </div></section>

    <section className="section white"><div className="shell why-grid">
      <div className="why-panel"><div className="eyebrow light">Why Navigeto</div><h2>Technology behind the scenes. Real people on the ground.</h2><p>TravelOS connects approved rates, route mileage, customer enquiries and our operations team. You get a simple booking experience without seeing internal supplier costs or operational calculations.</p><div className="why-number">2017</div></div>
      <div className="feature-list">
        <div className="feature-item"><span className="feature-icon"><ShieldIcon size={22} /></span><div><h3>Approved hotel inventory only</h3><p>Hotel search reads from the active Hotel Master, not temporary uploads or unapproved rates.</p></div></div>
        <div className="feature-item"><span className="feature-icon"><BoltIcon size={22} /></span><div><h3>Fast enquiry response</h3><p>Every hotel, transfer and tour request enters the same TravelOS workflow used by sales and operations.</p></div></div>
        <div className="feature-item"><span className="feature-icon"><ShieldIcon size={22} /></span><div><h3>Protected commercial pricing</h3><p>Supplier rates, markups, margins, internal mileage and notes never appear on the customer website.</p></div></div>
        <div className="feature-item"><span className="feature-icon"><MapPinIcon size={22} /></span><div><h3>Sri Lanka-based support</h3><p>Local destination knowledge, chauffeur coordination and assistance throughout the trip.</p></div></div>
      </div>
    </div></section>

    <section className="cta-section"><div className="shell"><div className="cta-card"><div><h2>Have an itinerary already?</h2><p>Send your dates, cities and traveller details. We will turn it into a workable Sri Lanka plan.</p></div><Link href="/custom-trip" className="button button-gold">Request a custom quotation</Link></div></div></section>
  </>;
}
