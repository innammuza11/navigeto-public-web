"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { Notice } from "@/components/Notice";
import { todayIso } from "@/lib/format";
import { getActiveFlightProvider } from "@/lib/flights/providers";
import { CloseIcon } from "@/components/icons";
import type { CabinClass, FlightSegment, TripType } from "@/lib/flights/types";
import { submitEnquiry } from "@/lib/travelos";

const cabinClasses: Array<{ value: CabinClass; label: string }> = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
];

function emptySegment(): FlightSegment { return { origin: "", destination: "", depart_date: "" }; }

export default function FlightsPage() {
  const providerConnected = Boolean(getActiveFlightProvider());
  const [tripType, setTripType] = useState<TripType>("round_trip");
  const [segments, setSegments] = useState<FlightSegment[]>([emptySegment()]);
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [infants, setInfants] = useState("0");
  const [cabinClass, setCabinClass] = useState<CabinClass>("economy");
  const [preferredAirline, setPreferredAirline] = useState("");
  const [directOnly, setDirectOnly] = useState(false);
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [contact, setContact] = useState({ customer_name: "", whatsapp: "", email: "", nationality: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  const setSegment = (index: number, key: keyof FlightSegment, value: string) =>
    setSegments((current) => current.map((seg, i) => (i === index ? { ...seg, [key]: value } : seg)));
  const addSegment = () => setSegments((current) => [...current, emptySegment()]);
  const removeSegment = (index: number) => setSegments((current) => current.filter((_, i) => i !== index));
  const setContactField = (key: string, value: string) => setContact((current) => ({ ...current, [key]: value }));

  function changeTripType(next: TripType) {
    setTripType(next);
    if (next === "multi_city") setSegments((current) => (current.length > 1 ? current : [...current, emptySegment()]));
    else setSegments((current) => [current[0] || emptySegment()]);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!contact.customer_name.trim() || !contact.whatsapp.trim()) return setError("Name and WhatsApp are required.");
    if (segments.some((seg) => !seg.origin.trim() || !seg.destination.trim() || !seg.depart_date)) return setError("Please complete every flight segment.");
    if (tripType === "round_trip" && !returnDate) return setError("Please select a return date.");
    setPending(true); setError("");
    try {
      const result = await submitEnquiry({
        enquiry_type: "flight",
        ...contact,
        travel_start_date: segments[0].depart_date,
        travel_end_date: tripType === "round_trip" ? returnDate : segments[segments.length - 1].depart_date,
        pax: Number(adults) + Number(children) + Number(infants),
        details: {
          trip_type: tripType, segments, return_date: tripType === "round_trip" ? returnDate : null,
          adults: Number(adults), children: Number(children), infants: Number(infants),
          cabin_class: cabinClass, preferred_airline: preferredAirline || null, direct_only: directOnly, flexible_dates: flexibleDates,
        },
      });
      setReference(result.public_ref);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to submit your flight request."); }
    finally { setPending(false); }
  }

  return <>
    <PageHero eyebrow="Flight Reservations" title="Tell us your route. We'll find the fare." description="No live GDS connection is active yet, so every search is checked and quoted by a Navigeto travel consultant — never a guessed or invented fare." />
    <div className="shell content-wrap">
      {reference ? <div className="reference-box"><span>Your TravelOS reference</span><strong>{reference}</strong><p>Our team will check availability and send you fare options shortly.</p></div> : <form className="filter-panel" onSubmit={submit}>
        {!providerConnected ? <div style={{marginBottom:18}}><Notice>Live fare search isn&apos;t connected yet. Submit your route and dates below and our team will confirm availability and pricing directly.</Notice></div> : null}
        <div className="form-grid three" style={{marginBottom:18}}>
          <div className="field"><label>Trip type</label><select className="select" value={tripType} onChange={(e) => changeTripType(e.target.value as TripType)}>
            <option value="one_way">One way</option><option value="round_trip">Round trip</option><option value="multi_city">Multi-city</option>
          </select></div>
          <div className="field"><label>Cabin class</label><select className="select" value={cabinClass} onChange={(e) => setCabinClass(e.target.value as CabinClass)}>{cabinClasses.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          <div className="field"><label>Preferred airline</label><input className="input" value={preferredAirline} onChange={(e) => setPreferredAirline(e.target.value)} placeholder="Optional" /></div>
        </div>

        {segments.map((segment, index) => <div className="form-grid three" key={index} style={{marginBottom:12}}>
          <div className="field"><label>From{tripType === "multi_city" ? ` (leg ${index + 1})` : ""}</label><input className="input" value={segment.origin} onChange={(e) => setSegment(index, "origin", e.target.value)} placeholder="Colombo (CMB)" required /></div>
          <div className="field"><label>To</label><input className="input" value={segment.destination} onChange={(e) => setSegment(index, "destination", e.target.value)} placeholder="Dubai (DXB)" required /></div>
          <div className="field">
            <label>Departure date</label>
            <div style={{display:"flex", gap:8}}>
              <input className="input" type="date" min={todayIso()} value={segment.depart_date} onChange={(e) => setSegment(index, "depart_date", e.target.value)} required />
              {tripType === "multi_city" && segments.length > 1 ? <button type="button" className="button button-ghost" onClick={() => removeSegment(index)} aria-label="Remove flight"><CloseIcon size={16} /></button> : null}
            </div>
          </div>
        </div>)}
        {tripType === "multi_city" ? <button type="button" className="text-link" style={{marginBottom:18}} onClick={addSegment}>+ Add another flight</button> : null}
        {tripType === "round_trip" ? <div className="field" style={{marginBottom:18, maxWidth:260}}><label>Return date</label><input className="input" type="date" min={segments[0]?.depart_date || todayIso()} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required /></div> : null}

        <div className="form-grid three" style={{marginBottom:18}}>
          <div className="field"><label>Adults</label><input className="input" type="number" min="1" value={adults} onChange={(e) => setAdults(e.target.value)} /></div>
          <div className="field"><label>Children</label><input className="input" type="number" min="0" value={children} onChange={(e) => setChildren(e.target.value)} /></div>
          <div className="field"><label>Infants</label><input className="input" type="number" min="0" value={infants} onChange={(e) => setInfants(e.target.value)} /></div>
        </div>
        <div style={{display:"flex", gap:24, marginBottom:24}}>
          <label className="checkbox-field"><input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} /> Direct flights only</label>
          <label className="checkbox-field"><input type="checkbox" checked={flexibleDates} onChange={(e) => setFlexibleDates(e.target.checked)} /> Flexible dates (± 3 days)</label>
        </div>

        <div className="form-grid two" style={{marginBottom:18}}>
          <div className="field"><label>Name *</label><input className="input" value={contact.customer_name} onChange={(e) => setContactField("customer_name", e.target.value)} /></div>
          <div className="field"><label>WhatsApp *</label><input className="input" value={contact.whatsapp} onChange={(e) => setContactField("whatsapp", e.target.value)} placeholder="Include country code" /></div>
          <div className="field"><label>Email</label><input className="input" type="email" value={contact.email} onChange={(e) => setContactField("email", e.target.value)} /></div>
          <div className="field"><label>Nationality</label><input className="input" value={contact.nationality} onChange={(e) => setContactField("nationality", e.target.value)} /></div>
        </div>
        {error ? <Notice tone="error">{error}</Notice> : null}
        <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Submitting…" : "Request flight availability"}</button>
      </form>}
    </div>
  </>;
}
