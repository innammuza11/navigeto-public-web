"use client";

import { tourEnquiryDetails } from "@/lib/tour-enquiry";
import { destinationArtwork } from "@/lib/destination-art";
import { DestinationCover } from "./destination-cover";
import { SketchArt } from "./sketch-art";
import { tourDisplayName, tourDurationLabel, customerTourSummary, matchesTourQuery } from "@/lib/tour-presentation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HolidaySketchCollections } from "./holiday-sketch-collections";
import { HotelManualQuote } from "@/components/hotel-manual-quote";
import { EnquiryRecoveryActions } from "@/components/enquiry-recovery-actions";
import { hotelPartyStatus } from "@/lib/hotel-party-policy";
import { flightSearchDates, transferSearchDate, journeySearchHref } from "@/lib/journey-search-dates";
import { hotelSearchDates } from "@/lib/hotel-search-dates";
import { hotelProfileHref } from "@/lib/hotel-navigation";
import { hotelParty, hotelBookingDetails, hotelSearchHref, type HotelStaySelection } from "@/lib/hotel-checkout";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { HotelRequestSession } from "@/lib/hotel-request-session";
import { hotels, rooms, tourItineraries, tours } from "@/lib/commerce-data";
import { AvailableHotels } from "@/components/available-hotels";
import { ModuleSearch } from "@/components/module-search";
import { FlightOfferCard, FlightJourneySummary } from "@/components/flight-offer-card";
import { Money } from "@/components/money";
import { InteractiveItineraryMap, type ItineraryDay } from "@/components/interactive-itinerary-map";
import {
  FlightOffer,
  HotelRate,
  liveApi,
  loadSelection,
  TransferQuote,
  PublicTour,
  PublicTourRateCard,
  saveSelection,
  Vehicle,
  VisaProduct,
  visaDestinations,
} from "@/lib/live-api";

const hotelImages = [
 "/media/hotel-forest-v1.webp",
 "/media/hotel-suite-v1.webp",
 "/media/beach-south-coast-v1.webp",
 "/media/heritage-galle-v1.webp",
];

const itineraryText = (item: Record<string, unknown>, keys: string[], fallback: string) => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
};
const itineraryList = (item: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = item[key];
    if (!Array.isArray(value)) continue;
    return value.flatMap((entry) => {
      if (typeof entry === "string" && entry.trim()) return [entry.trim()];
      if (!entry || typeof entry !== "object") return [];
      const record = entry as Record<string, unknown>;
      const text = itineraryText(record, ["title", "name", "activity", "description", "copy"], "");
      return text ? [text] : [];
    });
  }
  return [];
};

type TourPresentation = Pick<PublicTour, "title" | "destinations" | "highlights" | "summary" | "tags">;

const cleanPlace = (value: string) => {
  const cleaned = value
    .replace(/local sightseeing/gi, "")
    .replace(/arrival in/gi, "")
    .replace(/south beach/gi, "South Coast")
    .replace(/colombo international airport|colombo airport/gi, "Colombo")
    .replace(/[^\p{L}\p{N}\s&'’\-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  if (cleaned === cleaned.toUpperCase()) return cleaned.toLowerCase().replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
  return cleaned;
};

const tourPlaces = (tour: TourPresentation) => {
  const values = tour.destinations.flatMap((destination) => destination.split(/\s*(?:→|->|·|–|—)\s*/));
  const unique: string[] = [];
  for (const value of values) {
    const place = cleanPlace(value);
    if (!place || place.length > 34 || unique.some((item) => item.toLowerCase() === place.toLowerCase())) continue;
    unique.push(place);
  }
  return unique;
};

const tourMood = (tour: TourPresentation) => {
  const text = [tour.title, tour.summary, ...tour.destinations, ...tour.highlights, ...tour.tags].join(" ").toLowerCase();
  const coast = /coast|beach|bentota|galle|mirissa|trincomalee|pasikuda/.test(text);
  const hills = /tea|ella|nuwara|kandy|highland/.test(text);
  const wildlife = /wildlife|safari|yala|elephant/.test(text);
  const culture = /culture|heritage|sigiriya|dambulla|kingdom|temple/.test(text);
  if (wildlife && coast) return "Wildlife & coast";
  if (hills && coast) return "Hills & coast";
  if (culture && coast) return "Culture & coast";
  if (wildlife) return "Wildlife";
  if (hills) return "Tea country";
  if (culture) return "Culture";
  if (coast) return "Coast";
  return "Classic Sri Lanka";
};

const conciseTourSummary = (tour: TourPresentation, duration?: number) => {
  const summary = customerTourSummary(tour.summary);
  if (summary) return summary.length > 190 ? `${summary.slice(0, 187).replace(/\s+\S*$/, "")}…` : summary;
  const places = tourPlaces(tour).slice(0, 4);
  return `${duration ? `${duration}-day ` : ""}private journey${places.length ? ` through ${places.join(", ")}` : " across Sri Lanka"}, shaped around your pace.`;
};

const cleanDayTitle = (value: string) => {
  const parts = value.split(/\s+[–—-]\s+/).map(cleanPlace).filter(Boolean);
  if (!parts.length) return "A day shaped around your journey";
  if (/^airport$/i.test(parts[0]) && /south coast/i.test(parts.at(-1)||"")) return "Airport welcome → South Coast";
  if (/^airport$/i.test(parts.at(-1)||"")) parts[parts.length-1]="Airport farewell";
  return parts.join(" → ");
};

const dayLabel = (value: string, index: number) => /^day\s+/i.test(value.trim()) ? value.trim() : `Day ${Number(value)||index+1}`;

type CheckoutSelection = HotelStaySelection & {
  title?: string; name?: string; slug?: string; preferred_departure?: string; hotel_style?: string;
  airline?: string;
  slices?: FlightOffer["slices"];
  cabin_class?: string | null;
  hotel_name?: string;
  room_type?: string;
  rate_id?: string;
  rooms?: number;
  checkin?: string;
  checkout?: string;
  total_amount?: number;
  price_from?: number;
  currency?: string;
  vehicle?: { vehicle_name?: string };
  date?: string;
  pickup_time?: string;
  passengers?: number;
  luggage?: number;
  quote?: TransferQuote;
  origin?: string;
  destination?: string;
};

export function Progress({step}:{step:number}){
 return <div className="commerce-progress shell">{["Choose","Details","Review","Confirm"].map((x,i)=><div key={x} className={i+1<=step?"done":""}><span>{i+1<step?"✓":i+1}</span><b>{x}</b></div>)}</div>
}

export function FlightResults(){
 const [search,setSearch]=useState("");
 const [providerMessage,setProviderMessage]=useState("");
 const [sort,setSort]=useState("recommended"); const [directOnly,setDirectOnly]=useState(false); const [offers,setOffers]=useState<FlightOffer[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [route,setRoute]=useState("Your flight search");
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const origin=p.get("origin")||"CMB";const destination=p.get("destination")||"KUL";const dates=flightSearchDates(p);if(dates.error){queueMicrotask(()=>{setError(dates.error);setLoading(false);});return;}p.set("depart_date",dates.depart_date);if(dates.return_date)p.set("return_date",dates.return_date);else p.delete("return_date");p.set("origin",origin);p.set("destination",destination);const direct=p.get("direct_only")==="true";liveApi.flights({origin,destination,trip_type:p.get("trip_type")||"return",depart_date:dates.depart_date,return_date:dates.return_date||undefined,adults:Number(p.get("adults")||1),children:Number(p.get("children")||0),infants:Number(p.get("infants")||0),cabin_class:p.get("cabin_class")||"economy"}).then(r=>{setSearch(p.toString());setDirectOnly(direct);setRoute(`${origin} to ${destination}`);if(r.mode==="test"||!r.provider_connected){setProviderMessage(r.mode==="test"?"Airline connection is in test mode. Live fares require confirmation by our ticketing team.":r.message||"Live airline fares are not connected yet. Contact our ticketing team for a confirmed fare.");setOffers([]);}else{setProviderMessage(r.message||"");setOffers(r.offers);}}).catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[]);
 const rows=useMemo(()=>{const filtered=directOnly?offers.filter(offer=>offer.slices.every(slice=>slice.stops===0)):offers;return sort==="price"?[...filtered].sort((a,b)=>a.total_amount-b.total_amount):filtered;},[sort,offers,directOnly]);
 const choose=(offer:FlightOffer)=>{saveSelection("flight",{...offer,search_query:search}); window.location.assign("/flights/booking");};
 return <><ModuleSearch type="flight"/><div className="commerce-layout shell"><aside className="filter-panel"><h3>Refine results</h3><p>Fares come directly from the connected airline marketplace and are rechecked before ticketing.</p><div><b>Stops</b><label><input type="checkbox" checked={directOnly} onChange={e=>setDirectOnly(e.target.checked)}/> Direct flights only</label></div></aside>
 <section className="results-column"><div className="results-head"><div><p className="eyebrow">{route} · live fares</p><h2>{loading?"Searching airlines…":`${rows.length} available options`}</h2></div><select value={sort} onChange={e=>setSort(e.target.value)}><option value="recommended">Recommended</option><option value="price">Lowest price</option></select></div>
 {error&&<div className="notice" role="alert">{error}</div>}
 {providerMessage&&<div className="notice">{providerMessage}</div>}
 {!loading&&!error&&!rows.length&&<div className="empty-state"><h3>No flights match this filter.</h3><p>Remove “direct only” or change the route and dates.</p></div>}
 {rows.map(offer=><FlightOfferCard key={offer.id} offer={offer} onChoose={()=>choose(offer)}/>)}
 </section></div><AvailableHotels title="Stay options for this flight itinerary."/></>;
}

export function HotelResults(){
 const [manualSelection,setManualSelection]=useState<(CheckoutSelection & {q?:string})|null>(null);
 const [sort,setSort]=useState<"price"|"name">("price"); const [rates,setRates]=useState<HotelRate[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [search,setSearch]=useState("");
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const dates=hotelSearchDates(p);if(dates.error){queueMicrotask(()=>{setError(dates.error);setLoading(false);});return;}const start=dates.checkin;const end=dates.checkout;p.set("checkin",start);p.set("checkout",end);if(!p.has("meal_plan"))p.set("meal_plan","any");if(!p.has("market"))p.set("market","All Markets");const currentSearch=p.toString();liveApi.hotels({q:p.get("q")||"",checkin:start,checkout:end,rooms:Number(p.get("rooms")||1),occupancy:p.get("occupancy")||"double",adults:Number(p.get("adults")||2),children:Number(p.get("children")||0),meal_plan:p.get("meal_plan")==="any"?undefined:p.get("meal_plan")||undefined,market:p.get("market")||"All Markets",max_results:100}).then(r=>{setSearch(currentSearch);if(hotelPartyStatus(hotelParty(p)).kind!=="automatic"||r.meta.manual_quote_required){setManualSelection({...hotelParty(p),checkin:start,checkout:end,q:p.get("q")||"",meal_plan:p.get("meal_plan")||"any",market:p.get("market")||"All Markets"});setRates([]);}else setRates(r.results);}).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 const choose=(rate:HotelRate)=>{const p=new URLSearchParams(search);const checkin=p.get("checkin")!;const checkout=p.get("checkout")!;saveSelection("hotel",{...rate,...hotelParty(p),checkin,checkout,search_query:p.toString()});window.location.assign("/hotels/booking");};
 const hotelRows=useMemo(()=>[...rates].sort((a,b)=>sort==="price"?a.total_amount-b.total_amount:a.hotel_name.localeCompare(b.hotel_name)),[rates,sort]);
 if(manualSelection)return <><ModuleSearch type="hotel"/><HotelManualQuote selection={manualSelection}/></>;
 return <><ModuleSearch type="hotel"/><section className="shell results-section"><div className="results-head"><div><p className="eyebrow">Live stays for your exact dates</p><h2>{loading?"Checking hotel contracts…":`${rates.length} available room options`}</h2></div><select value={sort} onChange={e=>setSort(e.target.value as "price"|"name")}><option value="price">Lowest price</option><option value="name">Hotel name</option></select></div>
 {loading&&<div className="notice">Checking approved TravelOS hotel contracts…</div>}{error&&<div className="notice">{error}</div>}
 {!loading&&!error&&!hotelRows.length&&<div className="empty-state"><h3>No approved rooms match these dates.</h3><p>Try a nearby destination, different room basis, or flexible dates.</p></div>}
 <div className="hotel-grid">{hotelRows.map((h,i)=>{
   const detailParams=new URLSearchParams(search);
   detailParams.set("hotel",h.hotel_name);
   detailParams.set("rate_id",h.rate_id);
   const profileHref=hotelProfileHref(h.public_slug,detailParams);
   const cover=h.cover_image_url||hotelImages[i%hotelImages.length];
   const imageStyle={backgroundImage:`url("${cover}")`};
   return <article className="hotel-card" key={h.rate_id}>
     {profileHref
       ? <Link href={profileHref} className="hotel-image" style={imageStyle} aria-label={`View ${h.hotel_name}`}><span>{h.hotel_category||"Approved rate"}</span></Link>
       : <div className="hotel-image" style={imageStyle} role="img" aria-label={`${h.hotel_name} stay`}><span>{h.hotel_category||"Approved rate"}</span></div>}
     <div className="hotel-body">
       <p className="eyebrow">{h.destination||"Sri Lanka"}</p>
       {profileHref ? <Link href={profileHref}><h3>{h.hotel_name}</h3></Link> : <h3>{h.hotel_name}</h3>}
       <p className="rating"><b>{h.room_type||"Room"}</b> · {h.meal_plan||"Room only"}</p>
       <ul><li>✓ Exact rate for your preferences</li><li>✓ {h.nights} nights · {h.rooms} room</li>{h.cancellation_policy&&<li>✓ Policy available before confirmation</li>}</ul>
       <div className="hotel-price"><div><small>Exact stay total · {h.nights} nights</small><Money value={h.total_amount} currency={h.currency}/></div>
         <div className="hotel-card-actions">{profileHref&&<Link className="button button-soft" href={profileHref}>View hotel</Link>}<button className="button button-primary" onClick={()=>choose(h)}>Request room</button></div>
       </div>
     </div>
   </article>;
 })}</div></section></>;

}

export function HotelDetail({slug}:{slug:string}){
 const [dateError,setDateError]=useState(""); const hotel=hotels.find(h=>h.slug===slug)||hotels[0]; const [selected,setSelected]=useState(0); const [liveRates,setLiveRates]=useState<HotelRate[]>([]); const [loading,setLoading]=useState(true); const [query,setQuery]=useState<{checkin:string;checkout:string;rooms:number;adults:number;hotel:string}>({checkin:"",checkout:"",rooms:1,adults:2,hotel:hotel.name});
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const dates=hotelSearchDates(p);if(dates.error){queueMicrotask(()=>{setDateError(dates.error);setLoading(false);});return;}const next={checkin:dates.checkin,checkout:dates.checkout,rooms:Number(p.get("rooms")||1),adults:Number(p.get("adults")||2),hotel:p.get("hotel")||hotel.name};liveApi.hotels({q:next.hotel,checkin:next.checkin,checkout:next.checkout,rooms:next.rooms,adults:next.adults,children:Number(p.get("children")||0),occupancy:p.get("occupancy")||"double",max_results:60}).then(result=>{const exact=result.results.filter(rate=>rate.hotel_name.toLowerCase()===next.hotel.toLowerCase());setQuery(next);setLiveRates(exact.length?exact:result.results.slice(0,8));}).catch(()=>setLiveRates([])).finally(()=>setLoading(false));},[hotel.name]);
 if(dateError)return <><ModuleSearch type="hotel"/><section className="shell results-section"><div className="notice" role="alert">{dateError}</div></section></>;
 const name=liveRates[0]?.hotel_name||query.hotel; const place=liveRates[0]?.destination||hotel.place; const nights=liveRates[0]?.nights||4;
 const chooseLive=(rate:HotelRate)=>saveSelection("hotel",{...rate,...hotelParty(new URLSearchParams(window.location.search)),checkin:query.checkin,checkout:query.checkout,search_query:window.location.search});
 const chooseFallback=()=>saveSelection("hotel",{hotel_name:name,total_amount:rooms[selected].price*nights,currency:"LKR",checkin:query.checkin,checkout:query.checkout,rooms:query.rooms});
 return <><section className="detail-top shell hotel-detail-top"><p className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/hotels">Hotels</Link> / {place}</p><div className="detail-title"><div><p className="eyebrow">{place} · Sri Lanka</p><h1>{name}</h1><p className="rating"><b>{hotel.rating}</b> ★ Guest favourite · live rooms checked for {new Date(query.checkin).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</p></div><Link className="button button-soft" href={`/hotels/search?q=${encodeURIComponent(name)}`}>Change dates</Link></div><div className="gallery hotel-gallery"><div style={{backgroundImage:`url("${hotelImages[0]}")`}}/><div style={{backgroundImage:`url("${hotelImages[1]}")`}}/><div style={{backgroundImage:`url("${hotelImages[2]}")`}}/><span className="gallery-badge">Bright stays, professionally selected</span></div></section>
 <nav className="anchor-nav"><div className="shell"><a href="#overview">Overview</a><a href="#rooms">Rooms</a><a href="#facilities">Facilities</a><a href="#policies">Policies</a><a href="#location">Location</a></div></nav>
 <section className="shell detail-layout" id="overview"><div><p className="eyebrow">A stay worth travelling for</p><h2>Considered design, warm service and a real sense of place.</h2><p className="body-copy">{name} is presented with approved public selling information and room rates returned by Navigeto TravelOS. Choose a live room below, review its meal basis and policy, then continue to a secure booking request.</p><div className="amenity-grid">{["Swimming pool","Restaurant","Free Wi‑Fi","Airport transfers","Family friendly","Local support"].map(x=><div key={x}>◇ <b>{x}</b></div>)}</div></div><aside className="sticky-summary"><p>{query.checkin} → {query.checkout}</p>{liveRates[0]?<Money value={liveRates[0].total_amount} currency={liveRates[0].currency}/>:<Money value={rooms[selected].price*nights}/>}<small>{query.rooms} room · {query.adults} adults · approved selling rate</small><a className="button button-gold" href="#rooms">Choose your room</a><span>✓ No hidden booking fees</span></aside></section>
 <section className="pale section" id="rooms"><div className="shell"><div className="section-title"><p className="eyebrow">Available for your dates</p><h2>{loading?"Checking live rooms…":"Choose the room that fits."}</h2></div>{liveRates.length?<div className="room-list">{liveRates.map((rate,i)=><article className={selected===i?"room selected":"room"} key={rate.rate_id}><div className="room-image" style={{backgroundImage:`url("${hotelImages[(i+1)%hotelImages.length]}")`}}/><div><h3>{rate.room_type||"Hotel room"}</h3><p>{rate.meal_plan||"Room only"} · {rate.nights} nights · {rate.rooms} room</p><b>✓ Live approved selling rate</b><small>✓ {rate.cancellation_policy||"Policy confirmed before payment"}</small></div><div><Money value={rate.total_amount} currency={rate.currency}/><small>Taxes and basis as displayed</small><button onClick={()=>setSelected(i)}>{selected===i?"Selected ✓":"Select room"}</button></div></article>)}</div>:!loading?<div className="room-list">{rooms.map((r,i)=><article className={selected===i?"room selected":"room"} key={r.name}><div className="room-image" style={{backgroundImage:`url("${hotelImages[(i+1)%hotelImages.length]}")`}}/><div><h3>{r.name}</h3><p>{r.detail}</p><b>✓ {r.board}</b><small>✓ Live confirmation required</small></div><div><Money value={r.price*nights}/><small>{nights} nights</small><button onClick={()=>setSelected(i)}>{selected===i?"Selected ✓":"Select room"}</button></div></article>)}</div>:null}<div className="selection-bar"><div><span>{liveRates[selected]?.room_type||rooms[selected].name}</span>{liveRates[selected]?<Money value={liveRates[selected].total_amount} currency={liveRates[selected].currency}/>:<Money value={rooms[selected].price*nights}/>}</div><Link href="/hotels/booking" className="button button-gold" onClick={()=>liveRates[selected]?chooseLive(liveRates[selected]):chooseFallback()}>Continue to booking →</Link></div></div></section>
 <section className="section shell" id="facilities"><div className="split"><div><p className="eyebrow">Good to know</p><h2>Everything important, clear before you commit.</h2><p className="body-copy">Room basis, cancellation terms, child policy and availability are verified from the connected hotel inventory before your booking is confirmed.</p></div><div className="policy-card" id="policies"><h3>Booking confidence</h3><p>Choose from approved public selling rates. Navigeto confirms availability and any supplier-specific conditions before payment.</p><h3 id="location">Local assistance</h3><p>Airport transfers, private touring and special requests can be coordinated with the stay.</p></div></div></section></>;
}

export function TourResults(){
 const pathname=usePathname();
 const international=pathname==="/tours/international";
 const sriLankaOnly=pathname==="/tours/sri-lanka";
 const [liveTours,setLiveTours]=useState<PublicTour[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [activeMood,setActiveMood]=useState("All journeys");
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const theme=(p.get("theme")||"").toLowerCase();const duration=p.get("duration")||"any";const pace=p.get("pace")||"any";const hotelStyle=p.get("hotel_style")||"any";const budget=p.get("budget")||"any";liveApi.tours({country:p.get("country")||""}).then(r=>setLiveTours(r.results.filter(t=>{const isSriLanka=/^sri\s*lanka$/i.test(t.country||"Sri Lanka");if(international&&isSriLanka||sriLankaOnly&&!isSriLanka)return false;const searchable=[t.title,t.summary,t.package_type,...t.tags,...t.highlights].join(" ").toLowerCase();const themeMatch=!theme||searchable.includes(theme)||(theme==="family"&&searchable.includes("group"));const durationMatch=duration==="any"||(duration==="1-5"&&(t.duration_days||0)<=5)||(duration==="6-9"&&(t.duration_days||0)>=6&&(t.duration_days||0)<=9)||(duration==="10+"&&(t.duration_days||0)>=10);const paceMatch=pace==="any"||searchable.includes(pace);const hotelMatch=hotelStyle==="any"||searchable.includes(hotelStyle);const budgetMatch=budget==="any"||!t.price_from||t.price_from<=Number(budget);return themeMatch&&durationMatch&&paceMatch&&hotelMatch&&budgetMatch;}))).catch(e=>setError(e instanceof Error?e.message:"Published tours are temporarily unavailable.")).finally(()=>setLoading(false));},[international,sriLankaOnly]);
 const [query, setQuery] = useState("");
 const [visibleCount, setVisibleCount] = useState(12);
 const moodOptions=["All journeys","Culture","Tea country","Wildlife","Coast","Short escapes"];
 const visibleTours=useMemo(()=>liveTours.filter((tour)=>matchesTourQuery(tour, query) && (activeMood==="All journeys"||(activeMood==="Short escapes"?(tour.duration_days||0)<=5:tourMood(tour).toLowerCase().includes(activeMood.toLowerCase())))),[activeMood,liveTours,query]);
 return <><section className="tour-collection-hero"><div className="tour-collection-wash"/><div className="shell tour-collection-layout"><div className="tour-collection-copy"><p className="eyebrow">Private journeys · Sri Lanka and beyond</p><h1>Find your kind<br/><em>of journey.</em></h1><p>{international?"City discoveries, faraway coastlines and your next favourite place. Explore journeys designed around your pace.":"From first light above Sigiriya to the last gold on the southern coast—journeys shaped around how a place feels, not just where it sits on a list."}</p><div className="tour-collection-actions"><a className="button button-gold" href="#tour-search">Shape your route</a><a className="button-dark-soft" href="#tour-collection">Explore journeys</a></div><div className="tour-collection-proof"><span><b>01</b> Private by design</span><span><b>02</b> Real local knowledge</span><span><b>03</b> Live TravelOS connection</span></div></div><div className="editorial-tour-art">{international?<DestinationCover identity="world-journey-intro" country="Worldwide" title="International journeys"/>:<SketchArt variant="island"/>}</div></div><div className="tour-hero-index">07° 52′ N <i/> 80° 46′ E</div></section>
 <div id="tour-search" className="tour-search-stage"><ModuleSearch type="tour" international={international}/></div>
 <section className="shell tour-collection-section tour-collection-redesign" id="tour-collection"><div className="tour-collection-heading"><div><p className="eyebrow">Published Navigeto journeys</p><h2>{loading?"Finding the journeys that fit…":liveTours.length?"Find the route that feels like you.":"Begin with an idea. Make it entirely yours."}</h2></div><p>Discover private journeys with day-by-day itineraries and clear starting prices. Adjust the route, pace and hotels with our team.</p></div>
 {error&&<div className="notice">{error} You can still explore our signature journey ideas and request a tailored version.</div>}
 {loading&&<div className="tour-loading-grid" aria-label="Loading published journeys"><i/><i/><i/></div>}
 {!loading&&liveTours.length>0&&<><label className="tour-quick-search"><span>Search journeys</span><input type="search" value={query} placeholder="Try Ella, coast or Singapore" onChange={(event)=>{setQuery(event.target.value);setVisibleCount(12);}} /></label><div className="tour-mood-bar" aria-label="Filter journeys by travel style"><div>{moodOptions.map((mood)=><button type="button" key={mood} className={activeMood===mood?"is-active":""} aria-pressed={activeMood===mood} onClick={()=>{setActiveMood(mood);setVisibleCount(12);}}>{mood}</button>)}</div><span role="status"><b>{visibleTours.length}</b> matching journeys</span></div><div className="tour-editorial-grid">{visibleTours.slice(0,visibleCount).map((t)=>{const places=tourPlaces(t);const title=tourDisplayName(t);const mood=tourMood(t);return <article className="tour-editorial-card" key={t.slug}><Link href={`/tours/package/${t.slug}`} className="tour-editorial-art illustrated-tour-art" prefetch={false} aria-label={`Explore ${title}`}><DestinationCover identity={t.slug} country={t.country||"Sri Lanka"} title={title} places={places}/><div className="tour-editorial-badges"><span>{t.featured?"Signature journey":mood}</span><small>{tourDurationLabel(t.duration_days,t.duration_nights)}</small></div><div><p>{places.slice(0,4).join(" → ")||t.country||"Sri Lanka"}</p><h3 title={t.title}>{title}</h3></div></Link><div className="tour-editorial-body"><p>{conciseTourSummary(t,t.duration_days)}</p><ul>{t.highlights.slice(0,2).map((highlight,index)=><li key={`${highlight}-${index}`}><span>{String(index+1).padStart(2,"0")}</span>{highlight}</li>)}</ul><footer><div>{t.price_from?<Money value={t.price_from} currency={t.currency} suffix="Starting from · per person"/>:<><small>Designed around you</small><b>Tailor-made price</b></>}</div><Link prefetch={false} className="tour-editorial-link" href={`/tours/package/${t.slug}`}>View journey <span>↗</span></Link></footer></div></article>})}</div>{visibleTours.length>0&&<div className="tour-load-more"><p role="status">Showing {Math.min(visibleCount,visibleTours.length)} of {visibleTours.length} journeys</p>{visibleCount<visibleTours.length&&<button type="button" className="button button-primary" onClick={()=>setVisibleCount(count=>count+12)}>Show more journeys</button>}</div>}{!visibleTours.length&&<div className="tour-filter-empty"><p className="eyebrow">No exact match</p><h3>Let’s build this one around you.</h3><p>Choose another style or ask our team for a private route with your preferred pace and stays.</p><button type="button" className="button button-primary" onClick={()=>{setActiveMood("All journeys");setQuery("");setVisibleCount(12);}}>Show every journey</button></div>}</>}
 {international&&!loading&&!liveTours.length&&<HolidaySketchCollections/>}
 {!international&&!loading&&!liveTours.length&&<><div className="tour-cinematic-grid tour-idea-grid">{tours.map((t)=><article className="tour-cinematic-card" key={t.slug}><Link href={`/tours/package/${t.slug}`} className="tour-cinematic-art illustrated-tour-art"><DestinationCover identity={t.slug} country="Sri Lanka" title={t.name} places={t.route.split(" → ")}/><span>{t.tag}</span><div><small>{t.days} · {t.pace}</small><h3>{t.name}</h3><p>{t.route}</p></div><i aria-hidden="true">↗</i></Link><div className="tour-cinematic-meta"><p>Use this signature route as a starting point, then change the pace, stays and experiences with a specialist.</p><div><b>Tailor-made</b><Link className="button button-primary" href={`/tours/package/${t.slug}`}>Enter journey</Link></div></div></article>)}</div><div className="tour-tailor-callout"><div><p className="eyebrow">Nothing ordinary</p><h3>Your route does not need to exist yet.</h3><p>Tell us what you want to feel, and our Sri Lanka team will design the sequence around you.</p></div><Link className="button button-gold" href="/custom-trip">Create my journey</Link></div></>}
 <div className="tour-tailor-callout tour-tailor-callout-redesign"><div><p className="eyebrow">Need a different rhythm?</p><h3>Start with a feeling. We’ll design the route.</h3><p>Change the number of nights, hotel category, pace, wildlife, beaches or cultural stops—without starting over.</p></div><Link className="button button-gold" href="/custom-trip">Create my private journey</Link></div></section><AvailableHotels title="Available stays to pair with your tour."/></>;
}

const publicRateFields = [
  ["double_sharing", "Double sharing"],
  ["triple_sharing", "Triple sharing"],
  ["single_sharing", "Single room"],
  ["single_supplement", "Single supplement"],
  ["child_sharing_bed", "Child with bed"],
  ["child_no_bed", "Child without bed"],
  ["child_extra_bed", "Child extra bed"],
] as const satisfies ReadonlyArray<readonly [keyof PublicTourRateCard, string]>;

const hasSellingAmount = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value > 0;
const availablePublicRateCards = (cards?: PublicTourRateCard[]) => (cards || []).filter((card) => publicRateFields.some(([field]) => hasSellingAmount(card[field])));
const sellingRate = (value: number, currency: string) => `${currency || "USD"} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const publicRateDate = (value?: string | null) => {
  if (!value) return "";
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

function TourSellingRates({ cards }: { cards: PublicTourRateCard[] }) {
  const grouped = Array.from(cards.reduce((groups, card) => {
    const label = card.star_category?.trim() || "Published hotel category";
    groups.set(label, [...(groups.get(label) || []), card]);
    return groups;
  }, new Map<string, PublicTourRateCard[]>()).entries());

  return <section className="tour-rates-section" id="rates">
    <div className="shell">
      <div className="tour-rates-heading">
        <div><p className="eyebrow">Available public selling rates</p><h2>Choose the band that fits your party.</h2></div>
        <p>Per person in USD unless another currency is shown. Only approved available rate bands are displayed; hotels and final availability are reconfirmed for your dates.</p>
      </div>
      <div className="tour-rate-groups">
        {grouped.map(([category, rateCards], groupIndex) => <details className="tour-rate-group" open={groupIndex === 0} key={category}>
          <summary><span><small>Hotel category</small><b>{category}</b></span><em>{rateCards.length} available {rateCards.length === 1 ? "band" : "bands"}</em><i aria-hidden="true">+</i></summary>
          <div className="tour-rate-card-grid">
            {rateCards.map((card, index) => {
              const validity = [publicRateDate(card.validity_start), publicRateDate(card.validity_end)].filter(Boolean).join(" – ");
              const pax = card.band_label || (card.min_pax && card.max_pax ? `${card.min_pax}–${card.max_pax} travellers` : card.min_pax ? `From ${card.min_pax} travellers` : "Published party band");
              return <article className="tour-rate-card" key={`${category}-${card.season_label || "season"}-${pax}-${index}`}>
                <header><div><small>{card.season_label || "Published season"}</small><h3>{pax}</h3></div>{card.market ? <span>{card.market}</span> : null}</header>
                {validity ? <p className="tour-rate-validity">Travel validity · {validity}</p> : null}
                <div className="tour-rate-values">
                  {publicRateFields.flatMap(([field, label]) => {
                    const value = card[field];
                    return hasSellingAmount(value) ? [<div key={field}><span>{label}</span><b>{sellingRate(value, card.currency)}</b></div>] : [];
                  })}
                </div>
              </article>;
            })}
          </div>
        </details>)}
      </div>
      <p className="tour-rates-note">These are final customer-facing selling rates for the published bands. Your exact travel date, party size, hotel allocation and availability are checked before confirmation.</p>
    </div>
  </section>;
}

export function TourDetail({slug}:{slug:string}){
 const fallback=tours.find(t=>t.slug===slug)||tours[0];
 const [tour,setTour]=useState<PublicTour|null>(null);
 const [hotelLevel,setHotelLevel]=useState("Boutique");
 const [tourAdults,setTourAdults]=useState(2);
 const [tourChildren,setTourChildren]=useState(0);
 const [departure,setDeparture]=useState("");
 const [loading,setLoading]=useState(true);
 useEffect(()=>{liveApi.tour(slug).then(r=>setTour(r.result)).catch(()=>setTour(null)).finally(()=>setLoading(false));},[slug]);
 const book=()=>saveSelection("tour",{...(tour||fallback),title:tour?.title||fallback.name,adults:tourAdults,children:tourChildren,preferred_departure:departure,hotel_style:hotelLevel});
 const routeDestinations=useMemo(()=>tour?.destinations?.length?tourPlaces(tour):fallback.route.split(" · ").map(cleanPlace).filter(Boolean),[tour,fallback.route]);
 const liveItinerary:ItineraryDay[]=useMemo(()=>tour?.itinerary?.length?tour.itinerary.map((item,index)=>{
   const activities=itineraryList(item,["activities","experiences","programme","program"]);
   const optionalActivities=itineraryList(item,["optional_activities","optionalActivities","optional"]);
   const routeTitle=itineraryText(item,["route","title","heading","name"],`Day ${index+1}`);
   const routeEnd=routeTitle.split(/\s+[–—-]\s+/).at(-1)?.trim()||"";
   return {
     day:dayLabel(itineraryText(item,["day","day_label","day_number"],String(index+1)),index),
     title:cleanDayTitle(itineraryText(item,["title","heading","name","route"],routeTitle)),
     copy:itineraryText(item,["description","copy","summary","details"],activities.length?`${activities.length} published experiences, paced privately around this part of the journey.`:"A privately arranged day shaped around this route."),
     location:itineraryText(item,["location","destination","place","city"],routeEnd||itineraryText(item,["overnight"],routeDestinations[index]||"")),
     activities,
     optionalActivities,
     meals:itineraryText(item,["meals","meal_plan","mealPlan"],""),
     hotel:itineraryText(item,["hotel_name","hotel","accommodation"],""),
     overnight:itineraryText(item,["overnight","overnight_location","overnightLocation"],""),
   };
 }):tourItineraries[fallback.slug].map((item)=>({...item})),[tour,routeDestinations,fallback.slug]);

 const publicTitle=tour?tourDisplayName(tour):fallback.name;
 const durationDays=tour?.duration_days||Number.parseInt(fallback.days)||liveItinerary.length;
 const durationNights=tour?.duration_nights??Math.max(0,durationDays-1);
 const routeLine=routeDestinations.slice(0,6).join(" → ");
 const journeyCountry=tour?.country?.trim()||"Sri Lanka";
 const hero=`/art/watercolour/${destinationArtwork({identity:slug,country:journeyCountry,title:publicTitle,places:routeDestinations})}.webp`;
 const isSriLankaJourney=/^(sri\s*lanka|lk)$/i.test(journeyCountry);
 const publicSummary=tour?conciseTourSummary(tour,durationDays):`A private ${journeyCountry} journey with each day arranged around your pace.`;
 const highlightRows=tour?.highlights?.length?tour.highlights.slice(0,4):["Private airport welcome","Thoughtful route pacing","Local support throughout"];
 const publicRates=availablePublicRateCards(tour?.rate_cards);
 return <>
  <section className="tour-detail-hero tour-detail-hero-next tour-detail-hero-redesign editorial-detail-hero"><div className="shell editorial-detail-grid"><div className="tour-hero-content"><Link className="tour-back-link" href="/tours">← All private journeys</Link><p className="eyebrow">{loading?"Loading journey":tour?tourMood(tour):`Private ${journeyCountry} journey`}</p><h1>{publicTitle}</h1><p className="tour-hero-route-line">{routeLine||fallback.route}</p><div className="tour-hero-tags"><span>{durationDays} days · {durationNights} nights</span><span>{isSriLankaJourney?"Private chauffeur":"Private transfers"}</span><span>Flexible hotel style</span><span>Local support</span></div><SketchArt variant="route"/><a className="button button-primary" href="#journey">Explore this journey ↘</a></div><figure className="editorial-detail-photo"><DestinationCover identity={slug} country={journeyCountry} title={publicTitle} places={routeDestinations}/><figcaption>{journeyCountry} · At your own pace.</figcaption></figure></div></section>
  <section className="tour-glance"><div className="shell"><div><small>Duration</small><b>{durationDays} days · {durationNights} nights</b></div><div><small>Journey style</small><b>Private & adjustable</b></div><div><small>Route</small><b>{routeDestinations.slice(0,3).join(" · ")||journeyCountry}</b></div><div><small>Starting price</small>{tour?.price_from?<Money value={tour.price_from} currency={tour.currency} suffix="Per person · starting from"/>:<b>Tailor-made</b>}</div><Link href="#customize">Personalize this trip <span>↗</span></Link></div></section>
  <nav className="anchor-nav tour-anchor-nav"><div className="shell"><a href="#journey">Overview</a><a href="#itinerary">Day by day</a>{publicRates.length?<a href="#rates">Rates</a>:null}<a href="#included">Included</a><a href="#hotels">Hotels</a><a href="#customize">Price & customize</a></div></nav>
  <section className="shell tour-story-grid tour-story-redesign" id="journey"><div><p className="eyebrow">The journey</p><h2>{tour?.subtitle||publicTitle}</h2><p className="body-copy">{publicSummary}</p>{tour&&tour.title!==publicTitle&&<details className="tour-full-name"><summary>Full package name</summary><p>{tour.title}</p></details>}<div className="tour-highlight-grid tour-highlight-redesign">{highlightRows.map((highlight,index)=><div key={`${highlight}-${index}`}><span>{String(index+1).padStart(2,"0")}</span><b>{highlight}</b></div>)}</div><div className="tour-route-ribbon"><small>Your private route</small><p>{routeLine||`Designed around your preferred ${journeyCountry} experiences`}</p></div></div><aside className="customizer tour-customizer-next tour-customizer-redesign" id="customize"><p className="eyebrow">Your version of this journey</p><h3>Make it yours.</h3><p>Choose the travel style below. Our team verifies the final hotels, availability and exact selling price before confirmation.</p><label>Hotel style<select value={hotelLevel} onChange={e=>setHotelLevel(e.target.value)}><option>Boutique</option><option>Luxury</option><option>Essential</option></select></label><label>Adults<input type="number" min="1" max="100" value={tourAdults} onChange={e=>setTourAdults(Number(e.target.value))}/></label><label>Children<input type="number" min="0" max="99" value={tourChildren} onChange={e=>setTourChildren(Number(e.target.value))}/></label><label>Preferred departure<input type="date" value={departure} onChange={e=>setDeparture(e.target.value)}/><small>Leave blank if your dates are flexible.</small></label><div className="tour-customizer-price"><span>Starting price · per person</span>{tour?.price_from?<Money value={tour.price_from} currency={tour.currency} suffix="Per person · final price confirmed for your dates"/>:<b>Tailor-made</b>}</div><Link className="button button-gold" href={`/tours/booking?tour=${slug}`} aria-disabled={loading||!tour} onClick={e=>{if(loading||!tour)e.preventDefault();else book();}}>{loading?"Loading tour…":tour?"Check my dates":"Tour details unavailable"}</Link><a className="button tour-button-outline" href="https://wa.me/94774206166">Talk to a travel specialist</a><small>No payment now. Exact availability is checked before confirmation.</small></aside></section>
  <div className="itinerary-world"><div className="shell"><InteractiveItineraryMap days={liveItinerary} destinations={routeDestinations} country={journeyCountry} journeyImage={isSriLankaJourney?null:hero}/></div></div>
  {publicRates.length?<TourSellingRates cards={publicRates}/>:null}
  <section className="shell tour-after-map" id="included"><div className="tour-inclusions"><div><p className="eyebrow">Included</p><h3>Handled as one journey.</h3><ul>{(tour?.inclusions?.length?tour.inclusions:["Private transport","Selected accommodation","Published experiences","Navigeto local support"]).map(x=><li key={x}>✓ {x}</li>)}</ul></div><div><p className="eyebrow">Before you confirm</p><h3>Clear from the start.</h3><ul>{(tour?.exclusions?.length?tour.exclusions:["International flights unless stated","Visa and insurance","Personal expenses"]).map(x=><li key={x}>— {x}</li>)}</ul></div></div></section><div id="hotels"><AvailableHotels title="Hotels currently available for this journey." destination={tour?.destinations?.[0]||""}/></div>
 </>;
}

export function TransferResults(){
 const [selected,setSelected]=useState(0);
 const [search,setSearch]=useState("");
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 const [liveVehicles,setLiveVehicles]=useState<Vehicle[]>([]);
 const [quotes,setQuotes]=useState<Record<number,TransferQuote>>({});
 useEffect(()=>{
   const p=new URLSearchParams(window.location.search);
   const origin=p.get("origin")||"Bandaranaike Airport";
   const destination=p.get("destination")||"Galle";
   const dates=transferSearchDate(p);
   if(dates.error){queueMicrotask(()=>{setError(dates.error);setLoading(false);});return;}
   const travelDate=dates.travel_date;
   p.set("travel_date",travelDate);
   const tripType=p.get("trip_type")||"one_way";
   const requested=p.get("vehicle_type")||"any";
   const passengers=Number(p.get("passengers")||2);
   const luggage=Number(p.get("luggage")||2);
   const pickup_time=p.get("pickup_time")||"09:30";
   liveApi.vehicles().then(async r=>{
      const eligible=r.results.filter(v=>(!v.capacity||v.capacity>=passengers)&&(requested==="any"||v.vehicle_name.toLowerCase().includes(requested.toLowerCase())));
      setSearch(p.toString());
      setLiveVehicles(eligible);
      const pairs=await Promise.all(eligible.map(async(v,i)=>[
        i,
        await liveApi.transferQuote({
          origin,
          destination,
          vehicle_type:v.vehicle_name,
          travel_date:travelDate,
          trip_type:tripType,
          passengers,
          luggage,
          pickup_time,
        }).catch(() => ({ quote_available:false, message:"Manual quote" })),
      ] as const));
      setQuotes(Object.fromEntries(pairs));
   }).catch(reason=>setError(reason instanceof Error?reason.message:"Transfers could not be loaded. Please try again.")).finally(()=>setLoading(false));
 },[]);
 const pick=()=>{
   if(loading||error||!liveVehicles[selected])return;
   const p=new URLSearchParams(search);
   const transferDetails = {
     vehicle:liveVehicles[selected],
     quote:quotes[selected],
     origin:p.get("origin")||"Bandaranaike Airport",
     destination:p.get("destination")||"Galle",
     date:p.get("travel_date")!,
     search_query:search,
     pickup_time:p.get("pickup_time")||"09:30",
     passengers:Number(p.get("passengers")||2),
     luggage:Number(p.get("luggage")||2),
   };
   saveSelection("transfer", transferDetails);
   window.location.assign("/transfers/booking");
 };
 return <>
  <ModuleSearch type="transfer"/>
  <section className="shell results-section">
   <div className="results-head">
    <div><p className="eyebrow">Vehicles suitable for your party</p><h2>Choose your private transfer.</h2></div>
    <p>Capacity and approved route pricing from TravelOS</p>
   </div>
   {loading&&<div className="notice">Checking available transfers for your travel date…</div>}
   {error&&<div className="notice" role="alert">{error}</div>}
   {!loading&&!error&&!liveVehicles.length&&<div className="empty-state"><h3>No catalog vehicle matches this capacity or type.</h3><p>Choose “Best available” or reduce the passenger count, and our operations team can also arrange a custom vehicle.</p></div>}
   <div className="vehicle-list">
    {liveVehicles.map((v,i)=>{
      const quote=quotes[i];
      const sections=quote?.itinerary?.sections || quote?.itinerary_sections || [];
      return (
        <article className={selected===i?"vehicle selected":"vehicle"} key={v.vehicle_name}>
          <div className="vehicle-art">▱</div>
          <div>
            <em>{v.capacity?`Up to ${v.capacity} travellers`:"Private transfer"}</em>
            <h3>{v.vehicle_name}</h3>
            <p>{v.inclusions.slice(0,2).join(" · ")}</p>
            <small>{quote?.message||"Professional chauffeur · Approved route pricing"}</small>
            {sections.length ? (
              <details>
                <summary>Detailed itinerary</summary>
                <div className="itinerary-snippet">
                  {sections.map((section)=>(
                    <article key={section.title}>
                      <b>{section.title}</b>
                      <ul>{section.rows.map((row)=><li key={row}>{row}</li>)}</ul>
                    </article>
                  ))}
                </div>
              </details>
            ):null}
          </div>
          <div>
            {quote?.quote_available ? (
              <Money value={quote?.total_amount||0} currency={quote?.currency}/>
            ):<b>On request</b>}
            <button onClick={()=>setSelected(i)}>{selected===i?"Selected ✓":"Select"}</button>
          </div>
        </article>
      );
    })}
   </div>
   {liveVehicles.length>0&&(
   <div className="selection-bar">
     <div>
      <span>{liveVehicles[selected]?.vehicle_name}</span>
      {quotes[selected]?.quote_available ? <Money value={quotes[selected].total_amount||0} currency={quotes[selected].currency}/>:null}
     </div>
     <button className="button button-gold" onClick={pick} disabled={loading||!!error}>Generate transfer quotation →</button>
   </div>
   )}
  </section>
  <AvailableHotels title="Available hotels near your transfer route."/>
 </>;
}

export function VisaApplication(){
 const reviewLock=useRef(false);
 const [reviewBusy,setReviewBusy]=useState(false);
 const [reviewError,setReviewError]=useState("");
 const [reviewRef,setReviewRef]=useState("");
 const [step,setStep]=useState(1);
 const [eligible,setEligible]=useState(false);
 const [products]=useState<VisaProduct[]>(visaDestinations);
 const [destination,setDestination]=useState("GB");
 const [purpose,setPurpose]=useState("tourism");
 const [departure,setDeparture]=useState("2026-09-01");
 const [entryType,setEntryType]=useState("single");
 const [stayLength,setStayLength]=useState("14");
 const [previousRefusal,setPreviousRefusal]=useState("no");
 const [applicant,setApplicant]=useState("");
 const [whatsapp,setWhatsapp]=useState("");
 useEffect(()=>{const frame=requestAnimationFrame(()=>{const p=new URLSearchParams(window.location.search);setDestination(p.get("destination")||"GB");setPurpose(p.get("purpose")||"tourism");setDeparture(p.get("depart_date")||"2026-09-01");setEntryType(p.get("entry_type")||"single");setStayLength(p.get("stay_length")||"14");setPreviousRefusal(p.get("previous_refusal")||"no");});return()=>cancelAnimationFrame(frame);},[]);
 const product=products.find(x=>x.iso2===destination);
 const requestReview=async()=>{if(reviewLock.current||!applicant.trim()||!whatsapp.trim())return;reviewLock.current=true;setReviewBusy(true);setReviewError("");try{const result=await liveApi.enquiry({enquiry_type:"visa",customer_name:applicant,whatsapp,subject:`Visa assistance: ${product?.destination||destination}`,notes:"Visa requirements, eligibility, processing time and fees require current human verification.",details:{destination:product,purpose,departure,entry_type:entryType,stay_length:stayLength,previous_refusal:previousRefusal}});setReviewRef(result.enquiry.public_ref);}catch(reason){setReviewError(reason instanceof Error?reason.message:"Your request could not be confirmed. Retry with the same details.");}finally{reviewLock.current=false;setReviewBusy(false);}};
 if(reviewRef)return <section className="shell confirmation"><h1>Review request received</h1><p>Reference {reviewRef}. The visa team will verify the requirements.</p><EnquiryRecoveryActions onReset={()=>{setReviewRef("");setReviewError("");}}/></section>;
 return <>
  <ModuleSearch type="visa"/>
  <Progress step={step}/>
  <section className="shell visa-layout">
   <div><p className="eyebrow">Visa assistance</p><h1>Know what you need before you apply.</h1><p className="body-copy">A structured visa request followed by verification from Navigeto&apos;s visa team. Requirements and eligibility are never guessed.</p><div className="visa-benefits">{["Destination-specific checklist","Human document review","Clear processing expectations","Application status updates"].map(x=><span key={x}>✓ {x}</span>)}</div></div>
   <div className="application-card">
    <div className="mini-progress"><span style={{width:`${step*25}%`}}/></div>
    {step===1&&<><p className="eyebrow">Step 1 of 4</p><h2>Where are you travelling?</h2><label>Destination<select value={destination} onChange={e=>setDestination(e.target.value)}>{products.map(x=><option key={x.iso2} value={x.iso2}>{x.destination}</option>)}</select></label><label>Passport country<select><option>Sri Lanka</option></select></label><label>Purpose<select value={purpose} onChange={e=>setPurpose(e.target.value)}><option value="tourism">Tourism</option><option value="business">Business</option><option value="family_visit">Visit family</option><option value="transit">Transit</option></select></label></>}
    {step===2&&<><p className="eyebrow">Step 2 of 4</p><h2>Your travel plan</h2><label>Intended departure<input type="date" value={departure} onChange={e=>setDeparture(e.target.value)}/></label><label>Entry type<select value={entryType} onChange={e=>setEntryType(e.target.value)}><option value="single">Single entry</option><option value="multiple">Multiple entry</option><option value="transit">Transit</option></select></label><label>Length of stay<select value={stayLength} onChange={e=>setStayLength(e.target.value)}><option value="14">Up to 14 days</option><option value="30">15–30 days</option><option value="90">31–90 days</option><option value="91">More than 90 days</option></select></label><label>Previous refusals?<select value={previousRefusal} onChange={e=>setPreviousRefusal(e.target.value)}><option value="no">No</option><option value="yes">Yes</option></select></label></>}
    {step===3&&<><p className="eyebrow">Step 3 of 4</p><h2>Verification status</h2><div className="eligibility"><b>Human review required</b><p>Your visa team will verify the current official requirements for your passport, destination, purpose and dates before providing a checklist or price.</p></div><label className="toggle"><input type="checkbox" checked={eligible} onChange={e=>setEligible(e.target.checked)}/><span/> I understand the issuing authority makes the final decision</label></>}
    {step===4&&<><p className="eyebrow">Step 4 of 4</p><h2>Your preliminary document plan</h2><ul className="document-list">{["Valid passport","Bank statements","Employment evidence","Travel itinerary","Accommodation details"].map(x=><li key={x}>✓ {x}<small>Subject to verification</small></li>)}</ul><label>Your full name<input required value={applicant} onChange={e=>setApplicant(e.target.value)}/></label><label>WhatsApp number<input required value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+94"/></label></>}
    {reviewError&&<><p role="alert">{reviewError}</p><EnquiryRecoveryActions disabled={reviewBusy} onReset={()=>setReviewError("")}/></>}
    <div className="form-nav">{step>1&&<button type="button" disabled={reviewBusy} onClick={()=>setStep(step-1)}>← Back</button>}<button type="button" disabled={reviewBusy||(step===3&&!eligible)||(step===4&&(!applicant.trim()||!whatsapp.trim()))} className="button button-gold" onClick={()=>step===4?requestReview():setStep(Math.min(4,step+1))}>{reviewBusy?"Sending request…":step===4?"Request human review":"Continue →"}</button></div>
   </div>
  </section>
  <AvailableHotels title="Available stays for your visa travel plan."/>
 </>;
}

function HotelCheckoutSummary({ selection }: { selection: CheckoutSelection }) {
  const formatDate = (value?: string) => {
    if (!value) return "Not selected";
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime())
      ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
      : "Not selected";
  };
  const nights = selection.checkin && selection.checkout
    ? (Date.parse(`${selection.checkout}T00:00:00Z`) - Date.parse(`${selection.checkin}T00:00:00Z`)) / 86400000
    : 0;
  const mealPlans: Record<string, string> = { RO: "Room only", BB: "Breakfast", HB: "Half board", FB: "Full board", AI: "All inclusive" };
  return <div aria-label="Selected hotel stay">
    <small>Check-in</small><p>{formatDate(selection.checkin)}</p>
    <small>Check-out</small><p>{formatDate(selection.checkout)}{Number.isInteger(nights) && nights > 0 ? ` · ${nights} ${nights === 1 ? "night" : "nights"}` : ""}</p>
    <small>Room type</small><p>{selection.room_type || "Not specified"}</p>
    <small>Meal plan</small><p>{selection.meal_plan ? mealPlans[selection.meal_plan] || selection.meal_plan : "Not specified"}</p>
    <small>Rooms and guests</small><p>{selection.rooms ?? "—"} {selection.rooms === 1 ? "room" : "rooms"} · {selection.adults ?? "—"} {selection.adults === 1 ? "adult" : "adults"} · {selection.children ?? "—"} {selection.children === 1 ? "child" : "children"}</p>
  </div>;
}

export function BookingFlow({type}:{type:"flight"|"hotel"|"tour"|"transfer"}){
 const submitLock=useRef(false);
 const hotelRequest=useRef<HotelRequestSession|null>(null);
 const [step,setStep]=useState(2); const [reference,setReference]=useState(""); const [submitting,setSubmitting]=useState(false); const [error,setError]=useState(""); const [selection,setSelection]=useState<CheckoutSelection|null>(null);
 useEffect(()=>{const frame=requestAnimationFrame(()=>setSelection(loadSelection<CheckoutSelection>(type)));return()=>cancelAnimationFrame(frame);},[type]);
 const transferRoute=selection?.origin&&selection?.destination ? `${selection.origin} → ${selection.destination}`:"Private transfer";
 const labels={flight:selection?.airline?`${selection.airline} · ${selection.slices?.[0]?.origin} → ${selection.slices?.[0]?.destination}`:"Flight request",hotel:selection?.hotel_name||"Hotel request",tour:selection?.title||selection?.name||"Tour request",transfer:selection?.vehicle?.vehicle_name?`${selection.vehicle.vehicle_name} · ${transferRoute}`:transferRoute};
 const transferSections=selection?.quote?.itinerary?.sections || selection?.quote?.itinerary_sections || [];
 const total=Number(selection?.total_amount||selection?.quote?.total_amount||selection?.price_from||0); const currency=selection?.currency||selection?.quote?.currency||"LKR";
 const submitLabel = type === "transfer" ? "Generate transfer quotation" : "Confirm request";
 const transferPax = Math.max(1, Number(selection?.passengers) || 0);
 const submit=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();if(submitLock.current)return;submitLock.current=true;setSubmitting(true);setError("");const data=new FormData(e.currentTarget);const name=`${data.get("first_name")||""} ${data.get("last_name")||""}`.trim();const common={customer_name:name,whatsapp:String(data.get("mobile")||""),email:String(data.get("email")||""),nationality:String(data.get("nationality")||""),notes:String(data.get("notes")||""),consent_contact:true};
  try{if(type==="hotel"){
    hotelRequest.current??=new HotelRequestSession(()=>sessionStorage);
    const {rate_id,checkin,checkout,rooms,adults,children,occupancy}=selection||{};
    const payload={customer_name:name,customer_whatsapp:common.whatsapp,customer_email:common.email,nationality:common.nationality,special_requests:common.notes,rate_id,checkin,checkout,rooms,adults,children,occupancy};
    const r=await hotelRequest.current.submit(payload,()=>{hotelBookingDetails(selection);},liveApi.hotelBooking);setReference(r.booking.public_ref);
  }else{
    const today=new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Colombo"});
    const request=type==="tour"?tourEnquiryDetails(selection,{adults:data.get("adults"),children:data.get("children"),departure:String(data.get("departure")||""),hotelStyle:String(data.get("hotel_style")||"")},today):{subject:`${type} request: ${labels[type]}`,pax:type==="transfer"?transferPax:2,...(type==="transfer"&&selection?.date?{travel_start_date:selection.date}:{}),details:{selection,quotation_type:type==="transfer"?"transfer-quote":"standard"}};
    const r=await liveApi.enquiry({...common,enquiry_type:type,...request});setReference(r.enquiry.public_ref);
  } }catch(err){setError(err instanceof Error?err.message:"Request could not be submitted.");}finally{submitLock.current=false;setSubmitting(false);}};
 const separateRequest=()=>{if(!window.confirm("The earlier request may already have been received. Starting a separate request does not cancel it and may create another booking request. Continue?"))return;try{hotelRequest.current??=new HotelRequestSession(()=>sessionStorage);hotelRequest.current.startSeparateRequest();setReference("");setError("");}catch{setError("Could not reset booking recovery storage. Please contact Navigeto before submitting again.");}};
 if(type==="hotel"&&selection&&hotelPartyStatus(selection,true).kind!=="automatic")return <HotelManualQuote selection={selection}/>;
 if(reference)return <section className="confirmation shell"><span>✓</span><p className="eyebrow">{type === "transfer" ? "Transfer quotation generated" : "Request received"}</p><h1>Your journey is in good hands.</h1><p>Reference {reference}. {type==="tour"?`${labels.tour}. `:""}A Navigeto specialist will verify live availability and send the next confirmation or payment step.</p><div><Link href="/">Back to home</Link>{type==="hotel"?<button type="button" onClick={separateRequest}>Start a separate hotel request</button>:<EnquiryRecoveryActions onReset={()=>{setReference("");setError("");}}/>}</div></section>;
 const backHref={flight:journeySearchHref("flight",selection?.search_query),hotel:hotelSearchHref(selection),tour:"/tours/sri-lanka",transfer:journeySearchHref("transfer",selection?.search_query)}[type];
 return <><Progress step={step}/>{type==="hotel"&&error&&<div className="shell"><button type="button" disabled={submitting} onClick={separateRequest}>Start a separate hotel request</button></div>}{type!=="hotel"&&error&&<div className="shell"><EnquiryRecoveryActions disabled={submitting} onReset={()=>setError("")}/></div>}<form onSubmit={submit} className="shell checkout-layout"><div className="checkout-main"><p className="eyebrow">{type} request</p><h1>Traveller details</h1><div className="notice">Prices and availability are rechecked before any payment or ticket issuance.</div>{error&&<div className="notice">{error}</div>}<div className="traveller-form"><h2>Lead traveller</h2><div className="form-grid"><label>Title<select><option>Mr</option><option>Ms</option><option>Mrs</option></select></label><label>First name<input name="first_name" required placeholder="As shown on passport"/></label><label>Last name<input name="last_name" required placeholder="As shown on passport"/></label><label>Email<input name="email" required type="email" placeholder="name@example.com"/></label><label>Mobile / WhatsApp<input name="mobile" required placeholder="+94"/></label><label>Nationality<select name="nationality"><option>Sri Lankan</option><option>Other</option></select></label></div>{type==="tour"&&<><h2>Your trip</h2><div className="form-grid"><label>Adults<input name="adults" type="number" min="1" max="100" required defaultValue={selection?.adults??2} key={`adults-${selection?.adults}`}/></label><label>Children<input name="children" type="number" min="0" max="99" required defaultValue={selection?.children??0} key={`children-${selection?.children}`}/></label><label>Preferred departure<input name="departure" type="date" defaultValue={selection?.preferred_departure||""} key={`departure-${selection?.preferred_departure}`}/><small>Leave blank if flexible.</small></label><label>Hotel style<select name="hotel_style" defaultValue={selection?.hotel_style||"Boutique"} key={`style-${selection?.hotel_style}`}><option>Boutique</option><option>Luxury</option><option>Essential</option></select></label></div></>}<h2>Preferences</h2><label>Notes<textarea name="notes" rows={3} placeholder="Meal, accessibility, celebration or timing requests"/></label></div><div className="checkout-actions"><Link href={backHref}>← Back</Link><button type="button" className="button button-gold" onClick={e=>{if(e.currentTarget.form?.reportValidity())setStep(3);}}>Review request →</button></div></div><aside className="price-summary"><p className="eyebrow">Your live selection</p><h3>{labels[type]}</h3><div className="summary-art"/>{type==="hotel"&&selection&&<HotelCheckoutSummary selection={selection}/>} {type==="flight"&&selection&&<FlightJourneySummary offer={selection}/>} {type==="transfer"&&selection&&(<div><small>Route</small><p>{selection.origin} → {selection.destination}</p><small>Travel date</small><p>{selection.date} {selection.pickup_time?`· ${selection.pickup_time}`:""}</p><small>Party</small><p>{selection.passengers||0} passengers · {selection.luggage||0} luggage</p>{selection.quote?.trip_type&&(<><small>Trip type</small><p>{selection.quote.trip_type==="return"?"Return transfer":"One-way transfer"}</p></>)}{transferSections.length?(
  <><small>Detailed itinerary</small><div>{transferSections.map((section)=><article key={section.title}><b>{section.title}</b><ul>{section.rows.map((row)=><li key={row}>{row}</li>)}</ul></article>)}</div></>
) : null}{selection.quote?.included?.length ? <><small>Included</small><ul>{selection.quote.included.map((item) => <li key={item}>✓ {item}</li>)}</ul></> : null}{selection.quote?.excluded?.length ? <><small>Not included</small><ul>{selection.quote.excluded.map((item) => <li key={item}>— {item}</li>)}</ul></> : null}</div>)}{total>0?<div className="summary-total"><span>{type==="tour"?"Starting price per person":"Current total"}</span><Money value={total} currency={currency}/></div>:<p>Price will be confirmed by a Navigeto specialist.</p>}<small>No payment is collected with this request. Final availability and pricing are checked before confirmation.</small>{step>=3&&<button type="submit" disabled={submitting} className="button button-gold">{submitting?(type==="transfer"?"Generating quotation…":"Sending securely…"):submitLabel}</button>}</aside></form></>;
}
