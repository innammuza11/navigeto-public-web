"use client";

import { useEffect, useState } from "react";
import { visaDestinations } from "@/lib/live-api";

export type SearchType = "flight" | "hotel" | "tour" | "visa" | "transfer";
type Values = Record<string, string>;
type SearchSurface = "module" | "home";

function dateAfter(days: number) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

const defaults: Record<SearchType, Values> = {
  flight: { trip_type: "return", origin: "CMB", destination: "KUL", depart_date: dateAfter(30), return_date: dateAfter(37), adults: "1", children: "0", infants: "0", cabin_class: "economy", direct_only: "false" },
  hotel: { q: "Sri Lanka", checkin: dateAfter(30), checkout: dateAfter(34), rooms: "1", adults: "2", children: "0", occupancy: "double", meal_plan: "any", market: "All Markets" },
  tour: { country: "Sri Lanka", theme: "culture", duration: "any", month: dateAfter(30).slice(0, 7), travellers: "2", pace: "any", hotel_style: "any", budget: "any" },
  visa: { passport: "LK", destination: "MY", purpose: "tourism", depart_date: dateAfter(45), entry_type: "single", stay_length: "14", previous_refusal: "no" },
  transfer: { origin: "Bandaranaike Airport", destination: "Galle", travel_date: dateAfter(30), pickup_time: "09:30", passengers: "2", luggage: "2", trip_type: "one_way", vehicle_type: "any" },
};

const actions: Record<SearchType, string> = {
  flight: "/flights/search",
  hotel: "/hotels/search",
  tour: "/tours/sri-lanka",
  visa: "/visas/apply",
  transfer: "/transfers/search",
};

const headings: Record<SearchType, [string, string]> = {
  flight: ["Search live flights", "Compare routes, dates, passengers and cabin preferences in one search."],
  hotel: ["Find an available stay", "Search exact dates, rooms, guests and the stay basis that suits you."],
  tour: ["Find your kind of journey", "Match destination, travel style, duration, pace and budget."],
  visa: ["Check visa assistance", "Start with your passport, destination, purpose and intended journey."],
  transfer: ["Book the right transfer", "Match the route, timing, group size, luggage and vehicle."],
};

const advancedCounts: Record<SearchType, number> = { flight: 5, hotel: 4, tour: 3, visa: 3, transfer: 3 };

function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function Field({ label, children, span = 2 }: { label: string; children: React.ReactNode; span?: 1 | 2 | 3 }) {
  return <label className={`module-field field-span-${span}`}><span>{label}</span>{children}</label>;
}

function Choice({ label, copy, checked, onChange }: { label: string; copy: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="module-choice"><input name="direct_only" type="checkbox" value="true" checked={checked} onChange={(event) => onChange(event.target.checked)}/><span aria-hidden="true"/><div><b>{label}</b><small>{copy}</small></div></label>;
}

export function AdvancedSearchForm({ type, surface = "module" }: { type: SearchType; surface?: SearchSurface }) {
  const [values, setValues] = useState<Values>({ ...defaults[type] });
  const [advanced, setAdvanced] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const next = { ...defaults[type] };
      for (const key of Object.keys(next)) if (params.get(key)) next[key] = params.get(key) as string;
      if (params.get("direct_only") === "true") next.direct_only = "true";
      setValues(next);
    });
    return () => cancelAnimationFrame(frame);
  }, [type]);

  const set = (key: string, value: string) => setValues((current) => {
    const next = { ...current, [key]: value };
    if (key === "depart_date" && next.return_date && next.return_date <= value) next.return_date = addDays(value, 7);
    if (key === "checkin" && next.checkout && next.checkout <= value) next.checkout = addDays(value, 2);
    return next;
  });
  const remember = () => {
    try { window.localStorage.setItem(`navigeto:last-search:${type}`, JSON.stringify(values)); } catch { /* Device storage is optional. */ }
  };
  const submitLabel = type === "visa" ? "Check requirements" : type === "tour" ? "Find journeys" : type === "transfer" ? "Find vehicles" : `Search ${type}s`;

  return <div className={`advanced-search advanced-search-${surface}`}>
    <div className="search-modebar"><div><span className="live-search-dot"/> <b>Advanced {type} search</b><small>Connected to Navigeto TravelOS</small></div><button type="button" aria-expanded={advanced} onClick={() => setAdvanced((open) => !open)}><span>{advanced ? "Hide" : "Show"} advanced options</span><b>{advancedCounts[type]}</b><i aria-hidden="true">{advanced ? "−" : "+"}</i></button></div>
    <form action={actions[type]} className="module-search-form" onSubmit={remember}>
      <div className="search-primary-fields">
        {type === "flight" && <>
          <Field label="Trip type" span={1}><select name="trip_type" value={values.trip_type} onChange={(event) => set("trip_type", event.target.value)}><option value="return">Return</option><option value="one_way">One way</option></select></Field>
          <Field label="From"><input name="origin" required value={values.origin} onChange={(event) => set("origin", event.target.value.toUpperCase())} placeholder="Airport or city" autoComplete="off"/></Field>
          <button type="button" className="swap-button" aria-label="Swap airports" onClick={() => setValues((current) => ({ ...current, origin: current.destination, destination: current.origin }))}>⇄</button>
          <Field label="To"><input name="destination" required value={values.destination} onChange={(event) => set("destination", event.target.value.toUpperCase())} placeholder="Airport or city" autoComplete="off"/></Field>
          <Field label="Departure"><input name="depart_date" required type="date" value={values.depart_date} onChange={(event) => set("depart_date", event.target.value)}/></Field>
          {values.trip_type === "return" && <Field label="Return"><input name="return_date" required type="date" min={values.depart_date} value={values.return_date} onChange={(event) => set("return_date", event.target.value)}/></Field>}
        </>}
        {type === "hotel" && <>
          <Field label="Destination or hotel" span={3}><input name="q" required value={values.q} onChange={(event) => set("q", event.target.value)} placeholder="City, region or hotel" autoComplete="off"/></Field>
          <Field label="Check-in"><input name="checkin" required type="date" value={values.checkin} onChange={(event) => set("checkin", event.target.value)}/></Field>
          <Field label="Check-out"><input name="checkout" required type="date" min={values.checkin} value={values.checkout} onChange={(event) => set("checkout", event.target.value)}/></Field>
          <Field label="Rooms" span={1}><select name="rooms" value={values.rooms} onChange={(event) => set("rooms", event.target.value)}>{[1,2,3,4,5].map((count) => <option key={count}>{count}</option>)}</select></Field>
          <Field label="Adults" span={1}><select name="adults" value={values.adults} onChange={(event) => set("adults", event.target.value)}>{[1,2,3,4,5,6,7,8].map((count) => <option key={count}>{count}</option>)}</select></Field>
        </>}
        {type === "tour" && <>
          <Field label="Destination"><input name="country" required value={values.country} onChange={(event) => set("country", event.target.value)} placeholder="Country or region"/></Field>
          <Field label="Travel style"><select name="theme" value={values.theme} onChange={(event) => set("theme", event.target.value)}><option value="culture">Culture & heritage</option><option value="wildlife">Wildlife</option><option value="beach">Beach</option><option value="honeymoon">Honeymoon</option><option value="family">Family</option><option value="wellness">Wellness</option></select></Field>
          <Field label="Duration"><select name="duration" value={values.duration} onChange={(event) => set("duration", event.target.value)}><option value="any">Any length</option><option value="1-5">1–5 days</option><option value="6-9">6–9 days</option><option value="10+">10+ days</option></select></Field>
          <Field label="Travel month"><input name="month" type="month" value={values.month} onChange={(event) => set("month", event.target.value)}/></Field>
          <Field label="Travellers" span={1}><select name="travellers" value={values.travellers} onChange={(event) => set("travellers", event.target.value)}>{[1,2,3,4,5,6,8,10,12].map((count) => <option key={count}>{count}</option>)}</select></Field>
        </>}
        {type === "visa" && <>
          <Field label="Passport"><select name="passport" value={values.passport} onChange={(event) => set("passport", event.target.value)}><option value="LK">Sri Lanka</option></select></Field>
          <Field label="Destination" span={3}><select name="destination" value={values.destination} onChange={(event) => set("destination", event.target.value)}>{visaDestinations.map((item) => <option key={item.iso2} value={item.iso2}>{item.destination}</option>)}</select></Field>
          <Field label="Purpose"><select name="purpose" value={values.purpose} onChange={(event) => set("purpose", event.target.value)}><option value="tourism">Tourism</option><option value="business">Business</option><option value="family_visit">Family visit</option><option value="transit">Transit</option></select></Field>
          <Field label="Intended departure"><input name="depart_date" required type="date" value={values.depart_date} onChange={(event) => set("depart_date", event.target.value)}/></Field>
        </>}
        {type === "transfer" && <>
          <Field label="Pick-up" span={2}><input name="origin" required value={values.origin} onChange={(event) => set("origin", event.target.value)} placeholder="Airport, hotel or address" autoComplete="off"/></Field>
          <button type="button" className="swap-button" aria-label="Swap locations" onClick={() => setValues((current) => ({ ...current, origin: current.destination, destination: current.origin }))}>⇄</button>
          <Field label="Drop-off" span={2}><input name="destination" required value={values.destination} onChange={(event) => set("destination", event.target.value)} placeholder="Airport, hotel or address" autoComplete="off"/></Field>
          <Field label="Date"><input name="travel_date" required type="date" value={values.travel_date} onChange={(event) => set("travel_date", event.target.value)}/></Field>
          <Field label="Pick-up time" span={1}><input name="pickup_time" required type="time" value={values.pickup_time} onChange={(event) => set("pickup_time", event.target.value)}/></Field>
          <Field label="Passengers" span={1}><select name="passengers" value={values.passengers} onChange={(event) => set("passengers", event.target.value)}>{[1,2,3,4,5,6,7,8,10,12,16].map((count) => <option key={count}>{count}</option>)}</select></Field>
        </>}
        <button className="button button-gold module-submit" type="submit">{submitLabel} <span aria-hidden="true">→</span></button>
      </div>
      {advanced && <div className="search-advanced-fields">
        {type === "flight" && <>
          <Field label="Adults"><select name="adults" value={values.adults} onChange={(event) => set("adults", event.target.value)}>{[1,2,3,4,5,6,7,8,9].map((count) => <option key={count}>{count}</option>)}</select></Field>
          <Field label="Children (2–11)"><select name="children" value={values.children} onChange={(event) => set("children", event.target.value)}>{[0,1,2,3,4,5,6].map((count) => <option key={count}>{count}</option>)}</select></Field>
          <Field label="Infants"><select name="infants" value={values.infants} onChange={(event) => set("infants", event.target.value)}>{[0,1,2,3,4].map((count) => <option key={count}>{count}</option>)}</select></Field>
          <Field label="Cabin"><select name="cabin_class" value={values.cabin_class} onChange={(event) => set("cabin_class", event.target.value)}><option value="economy">Economy</option><option value="premium_economy">Premium economy</option><option value="business">Business</option><option value="first">First</option></select></Field>
          <Choice label="Direct flights" copy="Prioritise non-stop options" checked={values.direct_only === "true"} onChange={(checked) => set("direct_only", checked ? "true" : "false")}/>
        </>}
        {type === "hotel" && <>
          <Field label="Children"><select name="children" value={values.children} onChange={(event) => set("children", event.target.value)}>{[0,1,2,3,4,5,6].map((count) => <option key={count}>{count}</option>)}</select></Field>
          <Field label="Room basis"><select name="occupancy" value={values.occupancy} onChange={(event) => set("occupancy", event.target.value)}><option value="single">Single</option><option value="double">Double / twin</option><option value="triple">Triple</option><option value="quadruple">Family / quadruple</option></select></Field>
          <Field label="Meal plan"><select name="meal_plan" value={values.meal_plan} onChange={(event) => set("meal_plan", event.target.value)}><option value="any">Any meal plan</option><option value="RO">Room only</option><option value="BB">Breakfast</option><option value="HB">Half board</option><option value="FB">Full board</option><option value="AI">All inclusive</option></select></Field>
          <Field label="Guest market"><select name="market" value={values.market} onChange={(event) => set("market", event.target.value)}><option>All Markets</option><option>Local</option><option>India</option><option>Asia Middle East</option><option>Europe</option></select></Field>
        </>}
        {type === "tour" && <>
          <Field label="Travel pace"><select name="pace" value={values.pace} onChange={(event) => set("pace", event.target.value)}><option value="any">Any pace</option><option value="relaxed">Relaxed</option><option value="balanced">Balanced</option><option value="active">Active</option></select></Field>
          <Field label="Hotel style"><select name="hotel_style" value={values.hotel_style} onChange={(event) => set("hotel_style", event.target.value)}><option value="any">Any style</option><option value="essential">Essential</option><option value="boutique">Boutique</option><option value="luxury">Luxury</option></select></Field>
          <Field label="Budget per traveller"><select name="budget" value={values.budget} onChange={(event) => set("budget", event.target.value)}><option value="any">Any budget</option><option value="250000">Up to LKR 250,000</option><option value="500000">Up to LKR 500,000</option><option value="1000000">Up to LKR 1,000,000</option></select></Field>
        </>}
        {type === "visa" && <>
          <Field label="Entry type"><select name="entry_type" value={values.entry_type} onChange={(event) => set("entry_type", event.target.value)}><option value="single">Single entry</option><option value="multiple">Multiple entry</option><option value="transit">Transit</option></select></Field>
          <Field label="Expected stay"><select name="stay_length" value={values.stay_length} onChange={(event) => set("stay_length", event.target.value)}><option value="14">Up to 14 days</option><option value="30">15–30 days</option><option value="90">31–90 days</option><option value="91">More than 90 days</option></select></Field>
          <Field label="Previous refusal"><select name="previous_refusal" value={values.previous_refusal} onChange={(event) => set("previous_refusal", event.target.value)}><option value="no">No</option><option value="yes">Yes</option></select></Field>
        </>}
        {type === "transfer" && <>
          <Field label="Large bags"><select name="luggage" value={values.luggage} onChange={(event) => set("luggage", event.target.value)}>{[0,1,2,3,4,5,6,8,10].map((count) => <option key={count}>{count}</option>)}</select></Field>
          <Field label="Journey"><select name="trip_type" value={values.trip_type} onChange={(event) => set("trip_type", event.target.value)}><option value="one_way">One way</option><option value="return">Return</option></select></Field>
          <Field label="Vehicle"><select name="vehicle_type" value={values.vehicle_type} onChange={(event) => set("vehicle_type", event.target.value)}><option value="any">Best available</option><option value="sedan">Sedan</option><option value="van">Van</option><option value="mini coach">Mini coach</option><option value="coach">Coach</option></select></Field>
        </>}
      </div>}
    </form>
    <div className="search-assurance"><span>✓ Live connected inventory</span><span>✓ Relevant filters only</span><span>✓ Prices rechecked before confirmation</span><span>✓ No hidden booking fee</span></div>
  </div>;
}

export function ModuleSearch({ type }: { type: SearchType }) {
  return <section className={`module-search module-search-${type}`}>
    <div className="shell">
      <div className="module-search-heading"><p className="eyebrow">Navigeto Travels · {type}</p><h1>{headings[type][0]}</h1><p>{headings[type][1]}</p></div>
      <AdvancedSearchForm type={type}/>
    </div>
  </section>;
}
