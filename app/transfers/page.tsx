"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Notice } from "@/components/Notice";
import { formatMoney, todayIso } from "@/lib/format";
import { listVehicles, quoteTransfer, submitEnquiry } from "@/lib/travelos";
import type { CatalogVehicle, TransferQuote } from "@/lib/types";
import { CloseIcon } from "@/components/icons";

const vehicles = ["Sedan Car", "Toyota KDH", "Mini Coach", "Large Coach"];
const PRICED_TRIP_TYPES = new Set(["one_way", "return"]);
const tripTypeOptions = [
  { value: "one_way", label: "One way", group: "Instant customer rate" },
  { value: "return", label: "Return", group: "Instant customer rate" },
  { value: "hourly", label: "Hourly hire", group: "Request a quote" },
  { value: "full_day", label: "Full-day vehicle", group: "Request a quote" },
  { value: "multi_stop", label: "Multi-stop / city-to-city", group: "Request a quote" },
  { value: "corporate", label: "Corporate transfer", group: "Request a quote" },
  { value: "group_coach", label: "Group coach", group: "Request a quote" },
];

function TransfersContent() {
  const params = useSearchParams();
  const [form, setForm] = useState({
    origin: params.get("origin") || "Bandaranaike International Airport", destination: params.get("destination") || "",
    travel_date: params.get("date") || "", vehicle_type: params.get("vehicle") || "Sedan Car", passengers: "2", trip_type: "one_way",
    flight_number: "", luggage: "", child_seat: false,
  });
  const [quote, setQuote] = useState<TransferQuote | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [catalog, setCatalog] = useState<CatalogVehicle[]>([]);
  const isPriced = PRICED_TRIP_TYPES.has(form.trip_type);
  const set = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => { listVehicles().then(setCatalog).catch(() => undefined); }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setQuote(null);
    if (!isPriced) { setEnquiryOpen(true); return; }
    setLoading(true);
    try { setQuote(await quoteTransfer({ ...form, passengers: Number(form.passengers) })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Transfer pricing is temporarily unavailable."); }
    finally { setLoading(false); }
  }

  const grouped = tripTypeOptions.reduce<Record<string, typeof tripTypeOptions>>((acc, opt) => { (acc[opt.group] ||= []).push(opt); return acc; }, {});

  return <>
    <PageHero eyebrow="Private Sri Lanka Transport" title="Airport and city transfers, priced from approved route data." description="Choose your route and vehicle. TravelOS applies internal rate and markup rules without exposing operational costs." />
    <div className="shell content-wrap">
      <form className="filter-panel form-grid" onSubmit={submit}>
        <div className="field span-2"><label>Pick-up location</label><input className="input" value={form.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Airport, hotel or city" required /></div>
        <div className="field span-2"><label>Drop-off location</label><input className="input" value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Kandy, Galle, Ella…" required /></div>
        <div className="field"><label>Travel date</label><input className="input" type="date" min={todayIso()} value={form.travel_date} onChange={(e) => set("travel_date", e.target.value)} required /></div>
        <div className="field"><label>Vehicle</label><select className="select" value={form.vehicle_type} onChange={(e) => set("vehicle_type", e.target.value)}>{vehicles.map((vehicle) => <option key={vehicle}>{vehicle}</option>)}</select></div>
        <div className="field"><label>Passengers</label><input className="input" type="number" min="1" value={form.passengers} onChange={(e) => set("passengers", e.target.value)} /></div>
        <div className="field"><label>Trip type</label><select className="select" value={form.trip_type} onChange={(e) => set("trip_type", e.target.value)}>{Object.entries(grouped).map(([group, opts]) => <optgroup label={group} key={group}>{opts.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</optgroup>)}</select></div>
        <div className="field"><label>Flight number</label><input className="input" value={form.flight_number} onChange={(e) => set("flight_number", e.target.value)} placeholder="Optional" /></div>
        <div className="field"><label>Luggage pieces</label><input className="input" type="number" min="0" value={form.luggage} onChange={(e) => set("luggage", e.target.value)} placeholder="Optional" /></div>
        <div className="field" style={{alignSelf:"end"}}><label className="checkbox-field"><input type="checkbox" checked={form.child_seat} onChange={(e) => set("child_seat", e.target.checked)} /> Child seat required</label></div>
        <div className="form-actions span-all"><button className="button button-primary" type="submit" disabled={loading}>{loading ? "Checking approved rates…" : isPriced ? "Get transfer rate" : "Request a quote"}</button></div>
      </form>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {!isPriced && !quote ? <Notice>This trip type is priced by our team based on route, duration and vehicle availability — submit a request and we&apos;ll confirm a rate.</Notice> : null}
      {quote ? <div className="transfer-result">
        {quote.quote_available ? <><div className="eyebrow">Customer transfer quote</div><h2>{quote.origin} → {quote.destination}</h2><div className="meta-grid"><div className="meta-item"><small>Vehicle</small><b>{quote.vehicle_name || quote.vehicle_type}</b></div><div className="meta-item"><small>Approved route</small><b>{quote.route_name || "Direct transfer"}</b></div><div className="meta-item"><small>Passenger capacity</small><b>{quote.capacity ? `${quote.capacity} pax` : "See vehicle guide"}</b></div><div className="meta-item"><small>Trip type</small><b>{form.trip_type === "return" ? "Return" : "One way"}</b></div></div><ul className="clean-list">{(quote.included || ["Private air-conditioned vehicle", "Professional chauffeur", "Fuel and standard route charges"]).map((item) => <li key={item}>{item}</li>)}</ul>{quote.excluded && quote.excluded.length ? <ul className="clean-list exclusions">{quote.excluded.map((item) => <li key={item}>{item}</li>)}</ul> : null}<div className="quote-total"><div><small>Estimated customer selling price</small><strong>{formatMoney(quote.total_amount, quote.currency)}</strong></div><button className="button button-primary" onClick={() => setEnquiryOpen(true)}>Request this transfer</button></div></> : <><div className="eyebrow">Manual route review</div><h2>We need to check this route.</h2><p>{quote.message || "This route does not yet have an approved public rate. Send the request and our team will confirm it."}</p><button className="button button-primary" onClick={() => setEnquiryOpen(true)}>Send transfer request</button></>}
      </div> : <section className="section white" style={{paddingBottom:0}}><div className="section-heading"><div><div className="eyebrow">Vehicle choices</div><h2>Private vehicles for different group sizes.</h2></div><p>Final vehicle assignment depends on passengers, luggage and route conditions.</p></div><div className="card-grid">{catalog.length ? catalog.map((vehicle) => <div className="info-card service-body" key={vehicle.vehicle_name}><h3>🚐 {vehicle.vehicle_name}</h3><p>{vehicle.capacity ? `Up to ${vehicle.capacity} passengers.` : ""} {vehicle.inclusions.slice(0,2).join(", ")}</p></div>) : <>
        <div className="info-card service-body"><h3>🚗 Sedan Car</h3><p>Best for couples or two travellers with standard luggage.</p></div>
        <div className="info-card service-body"><h3>🚐 Toyota KDH</h3><p>Comfortable private option for families and small groups.</p></div>
        <div className="info-card service-body"><h3>🚌 Coaches</h3><p>Mini and large coach arrangements for groups and corporate tours.</p></div>
      </>}</div></section>}
    </div>
    {enquiryOpen ? <TransferEnquiry form={form} quote={quote} onClose={() => setEnquiryOpen(false)} /> : null}
  </>;
}

function TransferEnquiry({ form, quote, onClose }: { form: Record<string, unknown>; quote: TransferQuote | null; onClose: () => void }) {
  const [guest, setGuest] = useState({ customer_name: "", whatsapp: "", email: "", nationality: "", notes: "" }); const [pending, setPending] = useState(false); const [error, setError] = useState(""); const [reference, setReference] = useState("");
  const set = (key: string, value: string) => setGuest((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) { event.preventDefault(); if (!guest.customer_name || !guest.whatsapp) return setError("Name and WhatsApp are required."); setPending(true); setError(""); try { const result = await submitEnquiry({ enquiry_type: "transfer", ...guest, travel_start_date: form.travel_date, pax: Number(form.passengers), details: { ...form, quoted: quote } }); setReference(result.public_ref); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to submit request."); } finally { setPending(false); } }
  return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><h2>Transfer request</h2><p>{String(form.origin)} → {String(form.destination)}</p></div><button className="close-button" onClick={onClose} aria-label="Close"><CloseIcon size={18} /></button></div><div className="modal-body">{reference ? <div className="reference-box"><span>Your TravelOS reference</span><strong>{reference}</strong><p>Our team will contact you to confirm the transfer.</p></div> : <form id="transfer-request" className="form-grid two" onSubmit={submit}><div className="field"><label>Name *</label><input className="input" value={guest.customer_name} onChange={(e) => set("customer_name", e.target.value)} /></div><div className="field"><label>WhatsApp *</label><input className="input" value={guest.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div><div className="field"><label>Email</label><input className="input" type="email" value={guest.email} onChange={(e) => set("email", e.target.value)} /></div><div className="field"><label>Nationality</label><input className="input" value={guest.nationality} onChange={(e) => set("nationality", e.target.value)} /></div><div className="field span-all"><label>Additional notes</label><textarea className="textarea" value={guest.notes} onChange={(e) => set("notes", e.target.value)} /></div>{error ? <div className="span-all"><Notice tone="error">{error}</Notice></div> : null}</form>}</div><div className="modal-foot"><button className="button button-ghost" onClick={onClose}>{reference ? "Close" : "Cancel"}</button>{!reference ? <button className="button button-primary" type="submit" form="transfer-request" disabled={pending}>{pending ? "Submitting…" : "Submit request"}</button> : null}</div></div></div>;
}

export default function TransfersPage() { return <Suspense fallback={null}><TransfersContent /></Suspense>; }
