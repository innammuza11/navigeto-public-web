"use client";
import Link from "next/link";
import { HotelManualQuote } from "@/components/hotel-manual-quote";
import { hotelPartyStatus } from "@/lib/hotel-party-policy";
import { hotelParty, hotelBookingDetails, type HotelStaySelection } from "@/lib/hotel-checkout";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { hotels, rooms, tourItineraries, tours } from "@/lib/commerce-data";
import { AvailableHotels } from "@/components/available-hotels";
import { ModuleSearch } from "@/components/module-search";
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
const tourImages = [
 "/media/tour-sigiriya-v1.webp",
 "/media/tour-tea-train-v1.webp",
 "/media/wildlife-yala-v1.webp",
 "/media/culture-kandy-v1.webp",
 "/media/heritage-galle-v1.webp",
 "/media/beach-south-coast-v1.webp",
];
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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

const cleanTourTitle = (tour: TourPresentation) => {
  const base = tour.title.split("|")[0].replace(/\s+/g, " ").trim();
  const leadTitle = base.split(/\s+[—–]\s+/)[0]?.trim() || base;
  const publicBase = base.length > 56 && leadTitle.length >= 18 ? leadTitle : base;
  if (!/^sri lanka holiday package$/i.test(publicBase)) return publicBase || "A private Sri Lanka journey";
  const places = tourPlaces(tour).filter((place) => !/^colombo$/i.test(place));
  return places.length ? `${places.slice(0, 3).join(", ")} Journey` : "A private Sri Lanka journey";
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

const tourImage = (tour: TourPresentation & Pick<PublicTour, "hero_image_url">, index: number) => {
  if (tour.hero_image_url) return tour.hero_image_url;
  const text = [tourMood(tour), ...tourPlaces(tour)].join(" ").toLowerCase();
  if (/wildlife|yala|elephant/.test(text)) return "/media/wildlife-yala-v1.webp";
  if (/tea|ella|nuwara|highland/.test(text)) return "/media/tour-tea-train-v1.webp";
  if (/coast|beach|bentota|mirissa/.test(text)) return "/media/beach-south-coast-v1.webp";
  if (/galle/.test(text)) return "/media/heritage-galle-v1.webp";
  if (/kandy/.test(text)) return "/media/culture-kandy-v1.webp";
  return tourImages[index % tourImages.length];
};

const conciseTourSummary = (tour: TourPresentation, duration?: number) => {
  const summary = tour.summary?.replace(/\s+/g, " ").trim();
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
  airline?: string;
  slices?: Array<{ origin?: string; destination?: string }>;
  hotel_name?: string;
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
 const [sort,setSort]=useState("recommended"); const [directOnly,setDirectOnly]=useState(false); const [offers,setOffers]=useState<FlightOffer[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [route,setRoute]=useState("CMB to LHR");
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const origin=p.get("origin")||"CMB";const destination=p.get("destination")||"LHR";const direct=p.get("direct_only")==="true";liveApi.flights({origin,destination,depart_date:p.get("depart_date")||"2026-08-15",return_date:p.get("trip_type")!=="one_way"?(p.get("return_date")||"2026-08-24"):undefined,adults:Number(p.get("adults")||1),children:Number(p.get("children")||0),infants:Number(p.get("infants")||0),cabin_class:p.get("cabin_class")||"economy"}).then(r=>{setDirectOnly(direct);setRoute(`${origin} to ${destination}`);setOffers(r.offers);}).catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[]);
 const rows=useMemo(()=>{const filtered=directOnly?offers.filter(offer=>offer.slices.every(slice=>slice.stops===0)):offers;return sort==="price"?[...filtered].sort((a,b)=>a.total_amount-b.total_amount):filtered;},[sort,offers,directOnly]);
 const choose=(offer:FlightOffer)=>{saveSelection("flight",offer); window.location.assign("/flights/booking");};
 return <><ModuleSearch type="flight"/><div className="commerce-layout shell"><aside className="filter-panel"><h3>Refine results</h3><p>Fares come directly from the connected airline marketplace and are rechecked before ticketing.</p><div><b>Stops</b><label><input type="checkbox" checked={directOnly} onChange={e=>setDirectOnly(e.target.checked)}/> Direct flights only</label></div></aside>
 <section className="results-column"><div className="results-head"><div><p className="eyebrow">{route} · live fares</p><h2>{loading?"Searching airlines…":`${rows.length} available options`}</h2></div><select value={sort} onChange={e=>setSort(e.target.value)}><option value="recommended">Recommended</option><option value="price">Lowest price</option></select></div>
 {error&&<div className="notice">{error} You can still submit a flight request.</div>}
 {!loading&&!error&&!rows.length&&<div className="empty-state"><h3>No flights match this filter.</h3><p>Remove “direct only” or change the route and dates.</p></div>}
 {rows.map((f,i)=>{const s=f.slices[0];return <article className="flight-card" key={f.id}><div className="airline"><span>{f.airline_code||"✈"}</span><div><b>{f.airline||"Airline"}</b><small>{s?.segments?.[0]?.carrier_code}{s?.segments?.[0]?.flight_number} · {f.cabin_class||"Economy"}</small></div></div><div className="flight-times"><div><strong>{new Date(s.departing_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</strong><small>{s.origin}</small></div><div className="flight-line"><span>{s.duration?.replace("PT","").toLowerCase()}</span><i/><small>{s.stops?`${s.stops} stop${s.stops>1?"s":""}`:"Direct"}</small></div><div><strong>{new Date(s.arriving_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</strong><small>{s.destination}</small></div></div><div className="fare"><em>{i===0?"Lowest live fare":"Live fare"}</em><small>Final rules checked by our ticketing team</small><Money value={f.total_amount} currency={f.currency}/><button className="button button-gold" onClick={()=>choose(f)}>Choose fare</button></div></article>})}
 </section></div><AvailableHotels title="Stay options for this flight itinerary."/></>;
}

export function HotelResults(){
 const [manualSelection,setManualSelection]=useState<(CheckoutSelection & {q?:string})|null>(null);
 const [sort,setSort]=useState<"price"|"name">("price"); const [rates,setRates]=useState<HotelRate[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [search,setSearch]=useState("");
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const currentSearch=p.toString();const start=p.get("checkin")||"2026-08-15";const end=p.get("checkout")||"2026-08-19";liveApi.hotels({q:p.get("q")||"",checkin:start,checkout:end,rooms:Number(p.get("rooms")||1),occupancy:p.get("occupancy")||"double",adults:Number(p.get("adults")||2),children:Number(p.get("children")||0),meal_plan:p.get("meal_plan")==="any"?undefined:p.get("meal_plan")||undefined,market:p.get("market")||"All Markets",max_results:100}).then(r=>{setSearch(currentSearch);if(hotelPartyStatus(hotelParty(p)).kind!=="automatic"||r.meta.manual_quote_required){setManualSelection({...hotelParty(p),checkin:start,checkout:end,q:p.get("q")||"",meal_plan:p.get("meal_plan")||"any",market:p.get("market")||"All Markets"});setRates([]);}else setRates(r.results);}).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 const choose=(rate:HotelRate)=>{const p=new URLSearchParams(window.location.search);const checkin=p.get("checkin")||"2026-08-15";const checkout=p.get("checkout")||"2026-08-19";saveSelection("hotel",{...rate,...hotelParty(p),checkin,checkout});window.location.assign("/hotels/booking");};
 const hotelRows=useMemo(()=>[...rates].sort((a,b)=>sort==="price"?a.total_amount-b.total_amount:a.hotel_name.localeCompare(b.hotel_name)),[rates,sort]);
 if(manualSelection)return <><ModuleSearch type="hotel"/><HotelManualQuote selection={manualSelection}/></>;
 return <><ModuleSearch type="hotel"/><section className="shell results-section"><div className="results-head"><div><p className="eyebrow">Live stays for your exact dates</p><h2>{loading?"Checking hotel contracts…":`${rates.length} available room options`}</h2></div><select value={sort} onChange={e=>setSort(e.target.value as "price"|"name")}><option value="price">Lowest price</option><option value="name">Hotel name</option></select></div>
 {loading&&<div className="notice">Checking approved TravelOS hotel contracts…</div>}{error&&<div className="notice">{error}</div>}
 {!loading&&!error&&!hotelRows.length&&<div className="empty-state"><h3>No approved rooms match these dates.</h3><p>Try a nearby destination, different room basis, or flexible dates.</p></div>}
 <div className="hotel-grid">{hotelRows.map((h,i)=>{const detailParams=new URLSearchParams(search);detailParams.set("hotel",h.hotel_name);detailParams.set("rate_id",h.rate_id);const publicSlug=h.public_slug||slugify(h.hotel_name);const cover=h.cover_image_url||hotelImages[i%hotelImages.length];return <article className="hotel-card" key={h.rate_id}><Link href={`/hotels/${publicSlug}?${detailParams}`} className="hotel-image" style={{backgroundImage:`url("${cover}")`}} aria-label={`View ${h.hotel_name}`}><span>{h.hotel_category||"Approved rate"}</span></Link><div className="hotel-body"><p className="eyebrow">{h.destination||"Sri Lanka"}</p><Link href={`/hotels/${publicSlug}?${detailParams}`}><h3>{h.hotel_name}</h3></Link><p className="rating"><b>{h.room_type||"Room"}</b> · {h.meal_plan||"Room only"}</p><ul><li>✓ Exact rate for your preferences</li><li>✓ {h.nights} nights · {h.rooms} room</li>{h.cancellation_policy&&<li>✓ Policy available before confirmation</li>}</ul><div className="hotel-price"><div><small>Exact stay total · {h.nights} nights</small><Money value={h.total_amount} currency={h.currency}/></div><div className="hotel-card-actions"><Link className="button button-soft" href={`/hotels/${publicSlug}?${detailParams}`}>View hotel</Link><button className="button button-primary" onClick={()=>choose(h)}>Request room</button></div></div></div></article>})}</div></section></>;
}

export function HotelDetail({slug}:{slug:string}){
 const hotel=hotels.find(h=>h.slug===slug)||hotels[0]; const [selected,setSelected]=useState(0); const [liveRates,setLiveRates]=useState<HotelRate[]>([]); const [loading,setLoading]=useState(true); const [query,setQuery]=useState<{checkin:string;checkout:string;rooms:number;adults:number;hotel:string}>({checkin:"2026-08-15",checkout:"2026-08-19",rooms:1,adults:2,hotel:hotel.name});
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const next={checkin:p.get("checkin")||"2026-08-15",checkout:p.get("checkout")||"2026-08-19",rooms:Number(p.get("rooms")||1),adults:Number(p.get("adults")||2),hotel:p.get("hotel")||hotel.name};liveApi.hotels({q:next.hotel,checkin:next.checkin,checkout:next.checkout,rooms:next.rooms,adults:next.adults,children:Number(p.get("children")||0),occupancy:p.get("occupancy")||"double",max_results:60}).then(result=>{const exact=result.results.filter(rate=>rate.hotel_name.toLowerCase()===next.hotel.toLowerCase());setQuery(next);setLiveRates(exact.length?exact:result.results.slice(0,8));}).catch(()=>setLiveRates([])).finally(()=>setLoading(false));},[hotel.name]);
 const name=liveRates[0]?.hotel_name||query.hotel; const place=liveRates[0]?.destination||hotel.place; const nights=liveRates[0]?.nights||4;
 const chooseLive=(rate:HotelRate)=>saveSelection("hotel",{...rate,...hotelParty(new URLSearchParams(window.location.search)),checkin:query.checkin,checkout:query.checkout});
 const chooseFallback=()=>saveSelection("hotel",{hotel_name:name,total_amount:rooms[selected].price*nights,currency:"LKR",checkin:query.checkin,checkout:query.checkout,rooms:query.rooms});
 return <><section className="detail-top shell hotel-detail-top"><p className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/hotels">Hotels</Link> / {place}</p><div className="detail-title"><div><p className="eyebrow">{place} · Sri Lanka</p><h1>{name}</h1><p className="rating"><b>{hotel.rating}</b> ★ Guest favourite · live rooms checked for {new Date(query.checkin).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</p></div><Link className="button button-soft" href={`/hotels/search?q=${encodeURIComponent(name)}`}>Change dates</Link></div><div className="gallery hotel-gallery"><div style={{backgroundImage:`url("${hotelImages[0]}")`}}/><div style={{backgroundImage:`url("${hotelImages[1]}")`}}/><div style={{backgroundImage:`url("${hotelImages[2]}")`}}/><span className="gallery-badge">Bright stays, professionally selected</span></div></section>
 <nav className="anchor-nav"><div className="shell"><a href="#overview">Overview</a><a href="#rooms">Rooms</a><a href="#facilities">Facilities</a><a href="#policies">Policies</a><a href="#location">Location</a></div></nav>
 <section className="shell detail-layout" id="overview"><div><p className="eyebrow">A stay worth travelling for</p><h2>Considered design, warm service and a real sense of place.</h2><p className="body-copy">{name} is presented with approved public selling information and room rates returned by Navigeto TravelOS. Choose a live room below, review its meal basis and policy, then continue to a secure booking request.</p><div className="amenity-grid">{["Swimming pool","Restaurant","Free Wi‑Fi","Airport transfers","Family friendly","Local support"].map(x=><div key={x}>◇ <b>{x}</b></div>)}</div></div><aside className="sticky-summary"><p>{query.checkin} → {query.checkout}</p>{liveRates[0]?<Money value={liveRates[0].total_amount} currency={liveRates[0].currency}/>:<Money value={rooms[selected].price*nights}/>}<small>{query.rooms} room · {query.adults} adults · approved selling rate</small><a className="button button-gold" href="#rooms">Choose your room</a><span>✓ No hidden booking fees</span></aside></section>
 <section className="pale section" id="rooms"><div className="shell"><div className="section-title"><p className="eyebrow">Available for your dates</p><h2>{loading?"Checking live rooms…":"Choose the room that fits."}</h2></div>{liveRates.length?<div className="room-list">{liveRates.map((rate,i)=><article className={selected===i?"room selected":"room"} key={rate.rate_id}><div className="room-image" style={{backgroundImage:`url("${hotelImages[(i+1)%hotelImages.length]}")`}}/><div><h3>{rate.room_type||"Hotel room"}</h3><p>{rate.meal_plan||"Room only"} · {rate.nights} nights · {rate.rooms} room</p><b>✓ Live approved selling rate</b><small>✓ {rate.cancellation_policy||"Policy confirmed before payment"}</small></div><div><Money value={rate.total_amount} currency={rate.currency}/><small>Taxes and basis as displayed</small><button onClick={()=>setSelected(i)}>{selected===i?"Selected ✓":"Select room"}</button></div></article>)}</div>:!loading?<div className="room-list">{rooms.map((r,i)=><article className={selected===i?"room selected":"room"} key={r.name}><div className="room-image" style={{backgroundImage:`url("${hotelImages[(i+1)%hotelImages.length]}")`}}/><div><h3>{r.name}</h3><p>{r.detail}</p><b>✓ {r.board}</b><small>✓ Live confirmation required</small></div><div><Money value={r.price*nights}/><small>{nights} nights</small><button onClick={()=>setSelected(i)}>{selected===i?"Selected ✓":"Select room"}</button></div></article>)}</div>:null}<div className="selection-bar"><div><span>{liveRates[selected]?.room_type||rooms[selected].name}</span>{liveRates[selected]?<Money value={liveRates[selected].total_amount} currency={liveRates[selected].currency}/>:<Money value={rooms[selected].price*nights}/>}</div><Link href="/hotels/booking" className="button button-gold" onClick={()=>liveRates[selected]?chooseLive(liveRates[selected]):chooseFallback()}>Continue to booking →</Link></div></div></section>
 <section className="section shell" id="facilities"><div className="split"><div><p className="eyebrow">Good to know</p><h2>Everything important, clear before you commit.</h2><p className="body-copy">Room basis, cancellation terms, child policy and availability are verified from the connected hotel inventory before your booking is confirmed.</p></div><div className="policy-card" id="policies"><h3>Booking confidence</h3><p>Choose from approved public selling rates. Navigeto confirms availability and any supplier-specific conditions before payment.</p><h3 id="location">Local assistance</h3><p>Airport transfers, private touring and special requests can be coordinated with the stay.</p></div></div></section></>;
}

export function TourResults(){
 const [liveTours,setLiveTours]=useState<PublicTour[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [activeMood,setActiveMood]=useState("All journeys");
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const theme=(p.get("theme")||"").toLowerCase();const duration=p.get("duration")||"any";const pace=p.get("pace")||"any";const hotelStyle=p.get("hotel_style")||"any";const budget=p.get("budget")||"any";liveApi.tours({country:p.get("country")||""}).then(r=>setLiveTours(r.results.filter(t=>{const searchable=[t.title,t.summary,t.package_type,...t.tags,...t.highlights].join(" ").toLowerCase();const themeMatch=!theme||searchable.includes(theme)||(theme==="family"&&searchable.includes("group"));const durationMatch=duration==="any"||(duration==="1-5"&&(t.duration_days||0)<=5)||(duration==="6-9"&&(t.duration_days||0)>=6&&(t.duration_days||0)<=9)||(duration==="10+"&&(t.duration_days||0)>=10);const paceMatch=pace==="any"||searchable.includes(pace);const hotelMatch=hotelStyle==="any"||searchable.includes(hotelStyle);const budgetMatch=budget==="any"||!t.price_from||t.price_from<=Number(budget);return themeMatch&&durationMatch&&paceMatch&&hotelMatch&&budgetMatch;}))).catch(e=>setError(e instanceof Error?e.message:"Published tours are temporarily unavailable.")).finally(()=>setLoading(false));},[]);
 const moodOptions=["All journeys","Culture","Tea country","Wildlife","Coast","Short escapes"];
 const visibleTours=useMemo(()=>liveTours.filter((tour)=>activeMood==="All journeys"||(activeMood==="Short escapes"?(tour.duration_days||0)<=5:tourMood(tour).toLowerCase().includes(activeMood.toLowerCase()))),[activeMood,liveTours]);
 return <><section className="tour-collection-hero"><div className="tour-collection-wash"/><div className="shell tour-collection-layout"><div className="tour-collection-copy"><p className="eyebrow">Private journeys · Sri Lanka and beyond</p><h1>Don’t just visit.<br/><em>Move with the island.</em></h1><p>From first light above Sigiriya to the last gold on the southern coast—journeys shaped around how a place feels, not just where it sits on a list.</p><div className="tour-collection-actions"><a className="button button-gold" href="#tour-search">Shape your route</a><a className="button-dark-soft" href="#tour-collection">Explore journeys</a></div><div className="tour-collection-proof"><span><b>01</b> Private by design</span><span><b>02</b> Real local knowledge</span><span><b>03</b> Live TravelOS connection</span></div></div><div className="tour-depth-scene" aria-hidden="true"><div className="tour-depth-card tour-depth-sigiriya"><span>Ancient</span><b>Sigiriya</b></div><div className="tour-depth-card tour-depth-ella"><span>Highlands</span><b>Ella</b></div><div className="tour-depth-card tour-depth-yala"><span>Wild</span><b>Yala</b></div><i className="tour-depth-orbit"/><div className="tour-depth-badge"><small>8° N</small><b>Sri Lanka</b><span>Tap into wonder</span></div></div></div><div className="tour-hero-index">07° 52′ N <i/> 80° 46′ E</div></section>
 <div id="tour-search" className="tour-search-stage"><ModuleSearch type="tour"/></div>
 <section className="shell tour-collection-section tour-collection-redesign" id="tour-collection"><div className="tour-collection-heading"><div><p className="eyebrow">Published Navigeto journeys</p><h2>{loading?"Finding the journeys that fit…":liveTours.length?"Find the route that feels like you.":"Begin with an idea. Make it entirely yours."}</h2></div><p>Clear routes, real day-by-day programmes and starting prices from the connected Tour Library. Every journey remains private and adjustable.</p></div>
 {error&&<div className="notice">{error} You can still explore our signature journey ideas and request a tailored version.</div>}
 {loading&&<div className="tour-loading-grid" aria-label="Loading published journeys"><i/><i/><i/></div>}
 {!loading&&liveTours.length>0&&<><div className="tour-mood-bar" aria-label="Filter journeys by travel style"><div>{moodOptions.map((mood)=><button type="button" key={mood} className={activeMood===mood?"is-active":""} aria-pressed={activeMood===mood} onClick={()=>setActiveMood(mood)}>{mood}</button>)}</div><span><b>{visibleTours.length}</b> private journeys</span></div><div className="tour-editorial-grid">{visibleTours.map((t,i)=>{const places=tourPlaces(t);const title=cleanTourTitle(t);const mood=tourMood(t);return <article className="tour-editorial-card" key={t.slug}><Link href={`/tours/package/${t.slug}`} className="tour-editorial-art" style={{backgroundImage:`linear-gradient(180deg,rgba(24,19,78,.02),rgba(24,19,78,.8)),url("${tourImage(t,i)}")`}} aria-label={`Explore ${title}`}><div className="tour-editorial-badges"><span>{t.featured?"Signature journey":mood}</span><small>{t.duration_days||"—"} days</small></div><div><p>{places.slice(0,4).join(" → ")||t.country||"Sri Lanka"}</p><h3>{title}</h3></div></Link><div className="tour-editorial-body"><p>{conciseTourSummary(t,t.duration_days)}</p><ul>{t.highlights.slice(0,2).map((highlight,index)=><li key={`${highlight}-${index}`}><span>{String(index+1).padStart(2,"0")}</span>{highlight}</li>)}</ul><footer><div>{t.price_from?<Money value={t.price_from} currency={t.currency} suffix="Starting from · per person"/>:<><small>Designed around you</small><b>Tailor-made price</b></>}</div><Link className="tour-editorial-link" href={`/tours/package/${t.slug}`}>View journey <span>↗</span></Link></footer></div></article>})}</div>{!visibleTours.length&&<div className="tour-filter-empty"><p className="eyebrow">No exact match</p><h3>Let’s build this one around you.</h3><p>Choose another style or ask our team for a private route with your preferred pace and stays.</p><button type="button" className="button button-primary" onClick={()=>setActiveMood("All journeys")}>Show every journey</button></div>}</>}
 {!loading&&!liveTours.length&&<><div className="tour-cinematic-grid tour-idea-grid">{tours.map((t,i)=><article className="tour-cinematic-card" key={t.slug}><Link href={`/tours/package/${t.slug}`} className="tour-cinematic-art" style={{backgroundImage:`linear-gradient(180deg,rgba(24,19,78,.04),rgba(24,19,78,.86)),url("${tourImages[i%tourImages.length]}")`}}><span>{t.tag}</span><div><small>{t.days} · {t.pace}</small><h3>{t.name}</h3><p>{t.route}</p></div><i aria-hidden="true">↗</i></Link><div className="tour-cinematic-meta"><p>Use this signature route as a starting point, then change the pace, stays and experiences with a specialist.</p><div><b>Tailor-made</b><Link className="button button-primary" href={`/tours/package/${t.slug}`}>Enter journey</Link></div></div></article>)}</div><div className="tour-tailor-callout"><div><p className="eyebrow">Nothing ordinary</p><h3>Your route does not need to exist yet.</h3><p>Tell us what you want to feel, and our Sri Lanka team will design the sequence around you.</p></div><Link className="button button-gold" href="/custom-trip">Create my journey</Link></div></>}
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
 const [loading,setLoading]=useState(true);
 useEffect(()=>{liveApi.tour(slug).then(r=>setTour(r.result)).catch(()=>setTour(null)).finally(()=>setLoading(false));},[slug]);
 const book=()=>saveSelection("tour",tour||fallback);
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
 const hero=tour?.hero_image_url||tourImages[0];
 const publicTitle=tour?cleanTourTitle(tour):fallback.name;
 const durationDays=tour?.duration_days||Number.parseInt(fallback.days)||liveItinerary.length;
 const durationNights=tour?.duration_nights??Math.max(0,durationDays-1);
 const routeLine=routeDestinations.slice(0,6).join(" → ");
 const journeyCountry=tour?.country?.trim()||"Sri Lanka";
 const isSriLankaJourney=/^(sri\s*lanka|lk)$/i.test(journeyCountry);
 const publicSummary=tour?conciseTourSummary(tour,durationDays):`A private ${journeyCountry} journey with each day arranged around your pace.`;
 const highlightRows=tour?.highlights?.length?tour.highlights.slice(0,4):["Private airport welcome","Thoughtful route pacing","Local support throughout"];
 const publicRates=availablePublicRateCards(tour?.rate_cards);
 return <>
  <section className="tour-detail-hero tour-detail-hero-next tour-detail-hero-redesign" style={{backgroundImage:`linear-gradient(90deg,rgba(24,19,78,.93),rgba(24,19,78,.38) 58%,rgba(24,19,78,.08)),url("${hero}")`}}><div className="tour-detail-film"/><div className="shell tour-hero-content"><Link className="tour-back-link" href="/tours">← All private journeys</Link><p className="eyebrow">{loading?"Loading published journey":tour?tourMood(tour):`Private ${journeyCountry} journey`}</p><h1>{publicTitle}</h1><p className="tour-hero-route-line">{routeLine||fallback.route}</p><div className="tour-hero-tags"><span>{durationDays} days · {durationNights} nights</span><span>{isSriLankaJourney?"Private chauffeur":"Private transfers"}</span><span>Flexible hotel style</span><span>Local support</span></div><a className="tour-hero-scroll" href="#journey"><small>See the journey</small><i>↓</i></a></div><div className="tour-hero-routeglass"><span>Route at a glance</span><b>{routeLine||`${journeyCountry}, your way`}</b><small>Full interactive itinerary below</small></div><div className="tour-hero-orbit" aria-hidden="true"><i/><i/><i/></div></section>
  <section className="tour-glance"><div className="shell"><div><small>Duration</small><b>{durationDays} days · {durationNights} nights</b></div><div><small>Journey style</small><b>Private & adjustable</b></div><div><small>Route</small><b>{routeDestinations.slice(0,3).join(" · ")||journeyCountry}</b></div><div><small>Starting price</small>{tour?.price_from?<Money value={tour.price_from} currency={tour.currency} suffix="Per person · starting from"/>:<b>Tailor-made</b>}</div><Link href="#customize">Personalize this trip <span>↗</span></Link></div></section>
  <nav className="anchor-nav tour-anchor-nav"><div className="shell"><a href="#journey">Overview</a><a href="#itinerary">Day by day</a>{publicRates.length?<a href="#rates">Rates</a>:null}<a href="#included">Included</a><a href="#hotels">Hotels</a><a href="#customize">Price & customize</a></div></nav>
  <section className="shell tour-story-grid tour-story-redesign" id="journey"><div><p className="eyebrow">The journey</p><h2>{tour?.subtitle||publicTitle}</h2><p className="body-copy">{publicSummary}</p><div className="tour-highlight-grid tour-highlight-redesign">{highlightRows.map((highlight,index)=><div key={`${highlight}-${index}`}><span>{String(index+1).padStart(2,"0")}</span><b>{highlight}</b></div>)}</div><div className="tour-route-ribbon"><small>Your private route</small><p>{routeLine||`Designed around your preferred ${journeyCountry} experiences`}</p></div></div><aside className="customizer tour-customizer-next tour-customizer-redesign" id="customize"><p className="eyebrow">Your version of this journey</p><h3>Make it yours.</h3><p>Choose the travel style below. Our team verifies the final hotels, availability and exact selling price before confirmation.</p><label>Hotel style<select value={hotelLevel} onChange={e=>setHotelLevel(e.target.value)}><option>Boutique</option><option>Luxury</option><option>Essential</option></select></label><label>Travellers<select><option>2 adults</option><option>Family of 4</option><option>Private group</option></select></label><label>Preferred departure<input type="date" defaultValue="2026-09-15"/></label><div className="tour-customizer-price"><span>Starting price · per person</span>{tour?.price_from?<Money value={tour.price_from} currency={tour.currency} suffix="Per person · final price confirmed for your dates"/>:<b>Tailor-made</b>}</div><Link className="button button-gold" href={`/tours/booking?tour=${slug}`} onClick={book}>Check my dates</Link><a className="button tour-button-outline" href="https://wa.me/94774206166">Talk to a travel specialist</a><small>No payment now. Exact availability is checked before confirmation.</small></aside></section>
  <div className="itinerary-world"><div className="shell"><InteractiveItineraryMap days={liveItinerary} destinations={routeDestinations} country={journeyCountry} journeyImage={isSriLankaJourney?null:hero}/></div></div>
  {publicRates.length?<TourSellingRates cards={publicRates}/>:null}
  <section className="shell tour-after-map" id="included"><div className="tour-inclusions"><div><p className="eyebrow">Included</p><h3>Handled as one journey.</h3><ul>{(tour?.inclusions?.length?tour.inclusions:["Private transport","Selected accommodation","Published experiences","Navigeto local support"]).map(x=><li key={x}>✓ {x}</li>)}</ul></div><div><p className="eyebrow">Before you confirm</p><h3>Clear from the start.</h3><ul>{(tour?.exclusions?.length?tour.exclusions:["International flights unless stated","Visa and insurance","Personal expenses"]).map(x=><li key={x}>— {x}</li>)}</ul></div></div></section><div id="hotels"><AvailableHotels title="Hotels currently available for this journey." destination={tour?.destinations?.[0]||""}/></div>
 </>;
}

export function TransferResults(){
 const [selected,setSelected]=useState(0);
 const [liveVehicles,setLiveVehicles]=useState<Vehicle[]>([]);
 const [quotes,setQuotes]=useState<Record<number,TransferQuote>>({});
 useEffect(()=>{
   const p=new URLSearchParams(window.location.search);
   const origin=p.get("origin")||"Bandaranaike Airport";
   const destination=p.get("destination")||"Galle";
   const travelDate=p.get("travel_date")||"2026-08-15";
   const tripType=p.get("trip_type")||"one_way";
   const requested=p.get("vehicle_type")||"any";
   const passengers=Number(p.get("passengers")||2);
   const luggage=Number(p.get("luggage")||2);
   const pickup_time=p.get("pickup_time")||"09:30";
   liveApi.vehicles().then(async r=>{
      const eligible=r.results.filter(v=>(!v.capacity||v.capacity>=passengers)&&(requested==="any"||v.vehicle_name.toLowerCase().includes(requested.toLowerCase())));
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
   });
 },[]);
 const pick=()=>{
   const p=new URLSearchParams(window.location.search);
   const transferDetails = {
     vehicle:liveVehicles[selected],
     quote:quotes[selected],
     origin:p.get("origin")||"Bandaranaike Airport",
     destination:p.get("destination")||"Galle",
     date:p.get("travel_date")||"2026-08-15",
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
   {!liveVehicles.length&&<div className="empty-state"><h3>No catalog vehicle matches this capacity or type.</h3><p>Choose “Best available” or reduce the passenger count, and our operations team can also arrange a custom vehicle.</p></div>}
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
     <button className="button button-gold" onClick={pick}>Generate transfer quotation →</button>
   </div>
   )}
  </section>
  <AvailableHotels title="Available hotels near your transfer route."/>
 </>;
}

export function VisaApplication(){
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
 const requestReview=async()=>{if(!applicant.trim()||!whatsapp.trim())return;const result=await liveApi.enquiry({enquiry_type:"visa",customer_name:applicant,whatsapp,subject:`Visa assistance: ${product?.destination||destination}`,notes:"Visa requirements, eligibility, processing time and fees require current human verification.",details:{destination:product,purpose,departure,entry_type:entryType,stay_length:stayLength,previous_refusal:previousRefusal}});alert(`Request received: ${result.enquiry.public_ref}`);};
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
    <div className="form-nav">{step>1&&<button type="button" onClick={()=>setStep(step-1)}>← Back</button>}<button type="button" disabled={(step===3&&!eligible)||(step===4&&(!applicant.trim()||!whatsapp.trim()))} className="button button-gold" onClick={()=>step===4?requestReview():setStep(Math.min(4,step+1))}>{step===4?"Request human review":"Continue →"}</button></div>
   </div>
  </section>
  <AvailableHotels title="Available stays for your visa travel plan."/>
 </>;
}

export function BookingFlow({type}:{type:"flight"|"hotel"|"tour"|"transfer"}){
 const [step,setStep]=useState(2); const [reference,setReference]=useState(""); const [submitting,setSubmitting]=useState(false); const [error,setError]=useState(""); const [selection,setSelection]=useState<CheckoutSelection|null>(null);
 useEffect(()=>{const frame=requestAnimationFrame(()=>setSelection(loadSelection<CheckoutSelection>(type)));return()=>cancelAnimationFrame(frame);},[type]);
 const transferRoute=selection?.origin&&selection?.destination ? `${selection.origin} → ${selection.destination}`:"Private transfer";
 const labels={flight:selection?.airline?`${selection.airline} · ${selection.slices?.[0]?.origin} → ${selection.slices?.[0]?.destination}`:"Flight request",hotel:selection?.hotel_name||"Hotel request",tour:"Tailor-made tour",transfer:selection?.vehicle?.vehicle_name?`${selection.vehicle.vehicle_name} · ${transferRoute}`:transferRoute};
 const transferSections=selection?.quote?.itinerary?.sections || selection?.quote?.itinerary_sections || [];
 const total=Number(selection?.total_amount||selection?.quote?.total_amount||selection?.price_from||0); const currency=selection?.currency||selection?.quote?.currency||"LKR";
 const submitLabel = type === "transfer" ? "Generate transfer quotation" : "Confirm request";
 const transferPax = Math.max(1, Number(selection?.passengers) || 0);
 const submit=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();setSubmitting(true);setError("");const data=new FormData(e.currentTarget);const name=`${data.get("first_name")||""} ${data.get("last_name")||""}`.trim();const common={customer_name:name,whatsapp:String(data.get("mobile")||""),email:String(data.get("email")||""),nationality:String(data.get("nationality")||""),notes:String(data.get("notes")||""),consent_contact:true};
  try{if(type==="hotel"){const r=await liveApi.hotelBooking({...common,customer_whatsapp:common.whatsapp,customer_email:common.email,...hotelBookingDetails(selection),special_requests:common.notes});setReference(r.booking.public_ref);}else{const r=await liveApi.enquiry({...common,enquiry_type:type,subject:`${type} request: ${labels[type]}`,pax:type==="transfer"?transferPax:2,details:{selection,quotation_type:type==="transfer"?"transfer-quote":"standard"}});setReference(r.enquiry.public_ref);} }catch(err){setError(err instanceof Error?err.message:"Request could not be submitted.");}finally{setSubmitting(false);}};
 if(type==="hotel"&&selection&&hotelPartyStatus(selection,true).kind!=="automatic")return <HotelManualQuote selection={selection}/>;
 if(reference)return <section className="confirmation shell"><span>✓</span><p className="eyebrow">{type === "transfer" ? "Transfer quotation generated" : "Request received"}</p><h1>Your journey is in good hands.</h1><p>Reference {reference}. A Navigeto specialist will verify live availability and send the next confirmation or payment step.</p><div><Link href="/">Back to home</Link></div></section>;
 const backHref={flight:"/flights/search",hotel:"/hotels/search",tour:"/tours/sri-lanka",transfer:"/transfers/search"}[type];
 return <><Progress step={step}/><form onSubmit={submit} className="shell checkout-layout"><div className="checkout-main"><p className="eyebrow">{type} request</p><h1>Traveller details</h1><div className="notice">Prices and availability are rechecked before any payment or ticket issuance.</div>{error&&<div className="notice">{error}</div>}<div className="traveller-form"><h2>Lead traveller</h2><div className="form-grid"><label>Title<select><option>Mr</option><option>Ms</option><option>Mrs</option></select></label><label>First name<input name="first_name" required placeholder="As shown on passport"/></label><label>Last name<input name="last_name" required placeholder="As shown on passport"/></label><label>Email<input name="email" required type="email" placeholder="name@example.com"/></label><label>Mobile / WhatsApp<input name="mobile" required placeholder="+94"/></label><label>Nationality<select name="nationality"><option>Sri Lankan</option><option>Other</option></select></label></div><h2>Preferences</h2><label>Notes<textarea name="notes" rows={3} placeholder="Meal, accessibility, celebration or timing requests"/></label></div><div className="checkout-actions"><Link href={backHref}>← Back</Link><button type="button" className="button button-gold" onClick={()=>setStep(3)}>Review request →</button></div></div><aside className="price-summary"><p className="eyebrow">Your live selection</p><h3>{labels[type]}</h3><div className="summary-art"/>{type==="transfer"&&selection&&(<div><small>Route</small><p>{selection.origin} → {selection.destination}</p><small>Travel date</small><p>{selection.date} {selection.pickup_time?`· ${selection.pickup_time}`:""}</p><small>Party</small><p>{selection.passengers||0} passengers · {selection.luggage||0} luggage</p>{selection.quote?.trip_type&&(<><small>Trip type</small><p>{selection.quote.trip_type==="return"?"Return transfer":"One-way transfer"}</p></>)}{transferSections.length?(
  <><small>Detailed itinerary</small><div>{transferSections.map((section)=><article key={section.title}><b>{section.title}</b><ul>{section.rows.map((row)=><li key={row}>{row}</li>)}</ul></article>)}</div></>
) : null}{selection.quote?.included?.length ? <><small>Included</small><ul>{selection.quote.included.map((item) => <li key={item}>✓ {item}</li>)}</ul></> : null}{selection.quote?.excluded?.length ? <><small>Not included</small><ul>{selection.quote.excluded.map((item) => <li key={item}>— {item}</li>)}</ul></> : null}</div>)}{total>0?<div className="summary-total"><span>Current total</span><Money value={total} currency={currency}/></div>:<p>Price will be confirmed by a Navigeto specialist.</p>}<small>No payment is collected on this test deployment. Final availability and fare rules are checked before confirmation.</small>{step>=3&&<button type="submit" disabled={submitting} className="button button-gold">{submitting?(type==="transfer"?"Generating quotation…":"Sending securely…"):submitLabel}</button>}</aside></form></>;
}
