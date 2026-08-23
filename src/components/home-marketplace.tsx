"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Money } from "@/components/money";
import { liveApi, type HotelStartingRate, type PublicTour } from "@/lib/live-api";

type VisaSummary = {
  id: string;
  destinationCode: string;
  destination: string;
  packageName: string;
  totalEstimate: number;
  currency: string;
  processingTime?: string | null;
  resultLabel?: string | null;
};

type MarketplaceState = {
  hotels: HotelStartingRate[];
  internationalTours: PublicTour[];
  sriLankaTours: PublicTour[];
  visas: VisaSummary[];
};

const preferredDestinations = [
  { country: "Malaysia", airport: "KUL", flag: "🇲🇾", note: "Kuala Lumpur, Genting and island escapes" },
  { country: "Singapore", airport: "SIN", flag: "🇸🇬", note: "City stays, Sentosa and family breaks" },
  { country: "Thailand", airport: "BKK", flag: "🇹🇭", note: "Bangkok, culture, beaches and food" },
  { country: "Vietnam", airport: "SGN", flag: "🇻🇳", note: "Hanoi, Ho Chi Minh City and beyond" },
  { country: "United Arab Emirates", airport: "DXB", flag: "🇦🇪", note: "Dubai stopovers and city holidays" },
] as const;

const fallbackImages = [
  "/media/tropical-journey-3d-v1.webp",
  "/media/hotel-suite-v1.webp",
  "/media/beach-south-coast-v1.webp",
  "/media/culture-kandy-v1.webp",
  "/media/heritage-galle-v1.webp",
] as const;

const countryOf = (tour: PublicTour) => (tour.country || "").trim().toLowerCase();
const isSriLanka = (tour: PublicTour) => countryOf(tour) === "sri lanka";

function futureDate(days: number) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function visaProducts(payload: unknown): VisaSummary[] {
  const root = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const data = (root.data && typeof root.data === "object" ? root.data : root) as Record<string, unknown>;
  if (Array.isArray(data.products)) return data.products as VisaSummary[];
  if (!Array.isArray(data.countries)) return [];
  return data.countries.flatMap((country) => {
    if (!country || typeof country !== "object") return [];
    const products = (country as { products?: unknown }).products;
    return Array.isArray(products) ? products as VisaSummary[] : [];
  });
}

function MarketplaceHeading({ eyebrow, title, copy, href, action }: { eyebrow: string; title: string; copy: string; href: string; action: string }) {
  return <div className="marketplace-heading">
    <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
    <div><p>{copy}</p><Link href={href}>{action} <span aria-hidden="true">→</span></Link></div>
  </div>;
}

function LoadingCards() {
  return <div className="marketplace-grid" aria-label="Loading live products">
    {[0, 1, 2, 3, 4].map((item) => <div className="market-card market-card-loading" key={item}><div/><span/><b/><i/></div>)}
  </div>;
}

function EmptyMarketplace({ title, copy, href, action }: { title: string; copy: string; href: string; action: string }) {
  return <div className="marketplace-empty"><div><span>Live catalogue</span><h3>{title}</h3><p>{copy}</p></div><Link className="button button-dark-soft" href={href}>{action}</Link></div>;
}

export function HomeMarketplace() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<MarketplaceState>({ hotels: [], internationalTours: [], sriLankaTours: [], visas: [] });
  const flightDates = useMemo(() => ({ depart: futureDate(30), returning: futureDate(37) }), []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      liveApi.hotelStartingRates({ max_results: 5 }),
      liveApi.tours({}),
      fetch("/api/visa/catalog").then((response) => response.ok ? response.json() : Promise.reject(new Error("Visa catalogue unavailable"))),
    ]).then(([hotelResult, tourResult, visaResult]) => {
      if (!active) return;
      const hotels = hotelResult.status === "fulfilled" ? hotelResult.value.results.slice(0, 5) : [];
      const tours = tourResult.status === "fulfilled" ? tourResult.value.results : [];
      const visas = visaResult.status === "fulfilled" ? visaProducts(visaResult.value) : [];
      const preferredVisaNames = preferredDestinations.map((item) => item.country.toLowerCase());
      const sortedVisas = [...visas].sort((left, right) => {
        const leftIndex = preferredVisaNames.indexOf(left.destination.toLowerCase());
        const rightIndex = preferredVisaNames.indexOf(right.destination.toLowerCase());
        return (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex);
      });
      setState({
        hotels,
        internationalTours: tours.filter((tour) => !isSriLanka(tour)).slice(0, 5),
        sriLankaTours: tours.filter(isSriLanka).slice(0, 5),
        visas: sortedVisas.slice(0, 5),
      });
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <section className="marketplace-section" aria-label="Navigeto travel marketplace">
    <div className="shell marketplace-intro">
      <p className="eyebrow">Shop the journey</p>
      <h2>Five ways to go.<br/><em>One beautifully connected place.</em></h2>
      <p>Browse customer-safe published products, then check exact dates and availability with the Navigeto team. Supplier costs and internal calculations stay private.</p>
    </div>

    <div className="shell marketplace-row">
      <MarketplaceHeading eyebrow="Featured hotels" title="Stay somewhere worth remembering." copy="Five published stays with live starting rates from the connected Hotel Master." href="/hotels" action="See all hotels"/>
      {loading ? <LoadingCards/> : state.hotels.length ? <div className="marketplace-grid">
        {state.hotels.map((hotel, index) => <article className="market-card market-hotel-card" key={hotel.rate_id}>
          <Link className="market-card-art" href={`/hotels/${hotel.public_slug}`} style={{ backgroundImage: `linear-gradient(180deg,transparent,rgba(7,30,52,.76)),url("${hotel.cover_image_url || fallbackImages[index]}")` }}>
            <span>{hotel.star_category || "Published stay"}</span><b>{hotel.destination || "Sri Lanka"}</b>
          </Link>
          <div className="market-card-body"><h3>{hotel.hotel_name}</h3><p>{hotel.room_type || "Published room"} · {hotel.meal_plan || "Basis shown at search"}</p><Money value={hotel.starting_rate_per_night} currency={hotel.currency} suffix="Starting from · per room / night"/><Link href={`/hotels/search?q=${encodeURIComponent(hotel.hotel_name)}`}>Check dates <span aria-hidden="true">→</span></Link></div>
        </article>)}
      </div> : <EmptyMarketplace title="Hotel rates are being refreshed." copy="Search your dates and destination for the latest approved public availability." href="/hotels/search" action="Search hotels"/>}
    </div>

    <div className="shell marketplace-row">
      <MarketplaceHeading eyebrow="International tours" title="The world, planned from Colombo." copy="Only published international packages appear as bookable products. Until more pass review, start with a controlled custom trip request." href="/tours/international" action="Explore international tours"/>
      {loading ? <LoadingCards/> : state.internationalTours.length ? <div className="marketplace-grid">
        {state.internationalTours.map((tour, index) => <article className="market-card market-tour-card" key={tour.id}>
          <Link className="market-card-art" href={`/tours/package/${tour.slug}`} style={{ backgroundImage: `linear-gradient(180deg,transparent,rgba(24,19,78,.84)),url("${tour.hero_image_url || fallbackImages[index]}")` }}><span>{tour.duration_days || "Tailor-made"} days</span><b>{tour.country || "International"}</b></Link>
          <div className="market-card-body"><h3>{tour.title}</h3><p>{tour.destinations.slice(0, 3).join(" · ") || tour.summary || "Private international journey"}</p>{tour.price_from ? <Money value={tour.price_from} currency={tour.currency} suffix="Starting from · selling price"/> : <small>Exact selling price checked for your dates</small>}<Link href={`/tours/package/${tour.slug}`}>View journey <span aria-hidden="true">→</span></Link></div>
        </article>)}
      </div> : <div className="marketplace-grid">
        {preferredDestinations.map((destination, index) => <article className={`market-card destination-market-card destination-market-${index + 1}`} key={destination.country}>
          <div className="destination-market-top"><span>{destination.flag}</span><b>{destination.airport}</b></div><div className="market-card-body"><small>Custom international journey</small><h3>{destination.country}</h3><p>{destination.note}. The team verifies the package, price and availability before quoting.</p><Link href={`/custom-trip?destination=${encodeURIComponent(destination.country)}`}>Plan this trip <span aria-hidden="true">→</span></Link></div>
        </article>)}
      </div>}
    </div>

    <div className="shell marketplace-row">
      <MarketplaceHeading eyebrow="Sri Lanka tours" title="Published island journeys, ready to shape." copy="Customer-safe selling prices and full day-by-day programmes from the live Tour Library." href="/tours/sri-lanka" action="See all Sri Lanka tours"/>
      {loading ? <LoadingCards/> : state.sriLankaTours.length ? <div className="marketplace-grid">
        {state.sriLankaTours.map((tour, index) => <article className="market-card market-tour-card" key={tour.id}>
          <Link className="market-card-art" href={`/tours/package/${tour.slug}`} style={{ backgroundImage: `linear-gradient(180deg,transparent,rgba(24,19,78,.82)),url("${tour.hero_image_url || fallbackImages[index]}")` }}><span>{tour.duration_days || "Private"} days</span><b>{tour.destinations[0] || "Sri Lanka"}</b></Link>
          <div className="market-card-body"><h3>{tour.title}</h3><p>{tour.destinations.slice(0, 4).join(" · ") || tour.summary || "Private Sri Lanka journey"}</p>{tour.price_from ? <Money value={tour.price_from} currency={tour.currency} suffix="Starting from · selling price"/> : <small>Exact selling price checked for your dates</small>}<Link href={`/tours/package/${tour.slug}`}>View itinerary <span aria-hidden="true">→</span></Link></div>
        </article>)}
      </div> : <EmptyMarketplace title="Sri Lanka tour inventory is being refreshed." copy="Tell us the route, dates and travellers and the team will prepare a controlled quotation." href="/custom-trip" action="Build a Sri Lanka trip"/>}
    </div>

    <div className="shell marketplace-row">
      <MarketplaceHeading eyebrow="Visa services" title="Know the route before you apply." copy="Five active public Visa products, with provider fees and government-fee treatment kept clear." href="/visas" action="See all Visa services"/>
      {loading ? <LoadingCards/> : state.visas.length ? <div className="marketplace-grid">
        {state.visas.map((visa) => <article className="market-card visa-market-card" key={visa.id}><div className="visa-market-top"><span>{visa.destinationCode}</span><small>{visa.resultLabel || "Human verification before submission"}</small></div><div className="market-card-body"><h3>{visa.destination}</h3><p>{visa.packageName}</p>{visa.totalEstimate > 0 ? <Money value={visa.totalEstimate} currency={visa.currency} suffix="Published Visa service estimate"/> : <small>Rate confirmed after eligibility review</small>}<Link href={`/visas?destination=${encodeURIComponent(visa.destinationCode)}`}>Check service <span aria-hidden="true">→</span></Link></div></article>)}
      </div> : <EmptyMarketplace title="Visa products are temporarily unavailable." copy="Send the destination and passport nationality for a verified human review." href="/visas" action="Request Visa help"/>}
    </div>

    <div className="shell marketplace-row marketplace-row-last">
      <MarketplaceHeading eyebrow="Top flights from Colombo" title="Five routes calling you next." copy="Choose a destination, add your dates, and search the live flight provider. No fare is shown until availability is checked." href="/flights" action="Search all flights"/>
      <div className="marketplace-grid">
        {preferredDestinations.map((destination, index) => {
          const href = `/flights/search?trip_type=return&origin=CMB&destination=${destination.airport}&depart_date=${flightDates.depart}&return_date=${flightDates.returning}&adults=1&children=0&infants=0&cabin_class=economy&direct_only=false`;
          return <article className={`market-card flight-market-card flight-market-${index + 1}`} key={destination.airport}><div className="flight-route"><span>CMB</span><i/><b>{destination.airport}</b></div><div className="market-card-body"><small>{destination.flag} Colombo to</small><h3>{destination.country}</h3><p>{destination.note}</p><em>Live fare and baggage rules checked after dates</em><Link href={href}>Search this route <span aria-hidden="true">→</span></Link></div></article>;
        })}
      </div>
    </div>
  </section>;
}
