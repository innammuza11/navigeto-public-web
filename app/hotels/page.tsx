"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { LoadingCards } from "@/components/Loading";
import { Notice } from "@/components/Notice";
import { formatMoney, todayIso } from "@/lib/format";
import { getHotelSuggestions, requestHotelBooking, searchHotels } from "@/lib/travelos";
import type { HotelResult } from "@/lib/types";
import { CloseIcon } from "@/components/icons";

type HotelForm = { q: string; checkin: string; checkout: string; rooms: string; guests: string; occupancy: string; meal_plan: string; market: string; hotel_category: string };
type SortKey = "recommended" | "price_asc" | "price_desc";

function HotelsContent() {
  const params = useSearchParams();
  const [form, setForm] = useState<HotelForm>({
    q: params.get("q") || "", checkin: params.get("checkin") || "", checkout: params.get("checkout") || "",
    rooms: params.get("rooms") || "1", guests: params.get("guests") || "2", occupancy: "double", meal_plan: "", market: "", hotel_category: "",
  });
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [rows, setRows] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(Boolean(params.get("checkin") && params.get("checkout")));
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<HotelResult | null>(null);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => { getHotelSuggestions().then(setSuggestions).catch(() => undefined); }, []);
  useEffect(() => {
    const checkin = params.get("checkin") || "";
    const checkout = params.get("checkout") || "";
    if (!checkin || !checkout || new Date(checkout) <= new Date(checkin)) return;
    searchHotels({
      q: params.get("q") || "", checkin, checkout,
      rooms: Number(params.get("rooms") || 1), guests: Number(params.get("guests") || 2),
      occupancy: "double", meal_plan: "", market: "", hotel_category: "", max_results: 100,
    }).then(setRows).catch((cause) => setError(cause instanceof Error ? cause.message : "Hotel search is temporarily unavailable.")).finally(() => setLoading(false));
  }, [params]);
  const places = useMemo(() => [...(suggestions.hotel_names || []), ...(suggestions.destinations || [])], [suggestions]);
  const set = (key: keyof HotelForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    if (sort === "price_asc") copy.sort((a, b) => a.selling_rate_per_night - b.selling_rate_per_night);
    if (sort === "price_desc") copy.sort((a, b) => b.selling_rate_per_night - a.selling_rate_per_night);
    return copy;
  }, [rows, sort]);

  async function runSearch(event?: React.FormEvent) {
    event?.preventDefault();
    if (!form.checkin || !form.checkout) return setError("Please select check-in and check-out dates.");
    if (new Date(form.checkout) <= new Date(form.checkin)) return setError("Check-out must be after check-in.");
    setLoading(true); setError("");
    try { setRows(await searchHotels({ ...form, rooms: Number(form.rooms), guests: Number(form.guests), max_results: 100 })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Hotel search is temporarily unavailable."); }
    finally { setLoading(false); }
  }

  return <>
    <PageHero eyebrow="Live Hotel Selling Rates" title="Find the right Sri Lanka hotel." description="Search approved active TravelOS hotel rates. Supplier costs and internal markup rules stay protected." />
    <div className="shell content-wrap">
      <form className="filter-panel form-grid" onSubmit={runSearch}>
        <div className="field span-2"><label>Hotel or destination</label><input list="hotel-places" className="input" value={form.q} onChange={(e) => set("q", e.target.value)} placeholder="Kandy, Bentota, Weligama…" /><datalist id="hotel-places">{places.map((place) => <option key={place} value={place} />)}</datalist></div>
        <div className="field"><label>Check-in</label><input className="input" type="date" min={todayIso()} value={form.checkin} onChange={(e) => set("checkin", e.target.value)} required /></div>
        <div className="field"><label>Check-out</label><input className="input" type="date" min={form.checkin || todayIso()} value={form.checkout} onChange={(e) => set("checkout", e.target.value)} required /></div>
        <div className="field"><label>Rooms</label><input className="input" type="number" min="1" value={form.rooms} onChange={(e) => set("rooms", e.target.value)} /></div>
        <div className="field"><label>Guests</label><input className="input" type="number" min="1" value={form.guests} onChange={(e) => set("guests", e.target.value)} /></div>
        <div className="field"><label>Occupancy</label><select className="select" value={form.occupancy} onChange={(e) => set("occupancy", e.target.value)}><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option></select></div>
        <div className="field"><label>Meal plan</label><select className="select" value={form.meal_plan} onChange={(e) => set("meal_plan", e.target.value)}><option value="">Any meal plan</option>{(suggestions.meal_plans || []).map((meal) => <option key={meal}>{meal}</option>)}</select></div>
        <div className="field"><label>Market</label><select className="select" value={form.market} onChange={(e) => set("market", e.target.value)}><option value="">All markets</option>{(suggestions.markets || []).map((market) => <option key={market}>{market}</option>)}</select></div>
        <div className="field"><label>Hotel category</label><select className="select" value={form.hotel_category} onChange={(e) => set("hotel_category", e.target.value)}><option value="">Any category</option>{(suggestions.hotel_categories || []).map((category) => <option key={category}>{category}</option>)}</select></div>
        <div className="form-actions span-all"><button className="button button-primary" type="submit" disabled={loading}>{loading ? "Searching TravelOS…" : "Search available rates"}</button></div>
      </form>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="results-header">
        <div><h2>Available hotel rates</h2><p>Final customer selling rates for the selected stay.</p></div>
        <div className="results-controls">
          <b>{sortedRows.length} result{sortedRows.length === 1 ? "" : "s"}</b>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort results">
            <option value="recommended">Recommended</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
          <div className="view-toggle" role="group" aria-label="Result layout">
            <button type="button" className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-pressed={view === "grid"}>Grid</button>
            <button type="button" className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-pressed={view === "list"}>List</button>
          </div>
        </div>
      </div>
      {loading ? <LoadingCards count={6} /> : sortedRows.length ? <div className={view === "grid" ? "card-grid" : "results-list"}>{sortedRows.map((row) => <article className="hotel-card" key={row.rate_id}>
        <div className="card-accent"/><div className="hotel-body"><div className="card-top"><div><h3>{row.hotel_name}</h3><div className="location">📍 {row.destination || "Sri Lanka"}{row.hotel_category ? ` · ${row.hotel_category}` : ""}</div></div><span className="badge">{row.meal_plan || "Room only"}</span></div>
        <div className="meta-grid"><div className="meta-item"><small>Room</small><b>{row.room_type || "Standard"}</b></div><div className="meta-item"><small>Stay</small><b>{row.nights} night{row.nights === 1 ? "" : "s"}</b></div><div className="meta-item"><small>Rooms</small><b>{row.rooms}</b></div><div className="meta-item"><small>Market</small><b>{row.market || "All Markets"}</b></div></div>
        {row.cancellation_policy || row.child_policy ? <div className="policy-note">{row.cancellation_policy ? <div>🛡 {row.cancellation_policy}</div> : null}{row.child_policy ? <div>🧒 {row.child_policy}</div> : null}</div> : null}
        <div className="price-block"><small>Per room / night</small><strong>{formatMoney(row.selling_rate_per_night, row.currency)}</strong><span>Stay total: <b>{formatMoney(row.total_amount, row.currency)}</b></span><button className="button button-primary button-block" style={{marginTop:16}} onClick={() => setSelected(row)}>Request this hotel</button></div></div>
      </article>)}</div> : <div className="empty-state"><b>Start with your travel dates.</b>Search the active Hotel Master for customer-ready rates.</div>}
    </div>
    {selected ? <HotelBookingModal rate={selected} search={form} onClose={() => setSelected(null)} /> : null}
  </>;
}

function HotelBookingModal({ rate, search, onClose }: { rate: HotelResult; search: HotelForm; onClose: () => void }) {
  const [form, setForm] = useState({ customer_name: "", customer_email: "", customer_whatsapp: "", nationality: "", adults: search.guests, children: "0", special_requests: "" });
  const [pending, setPending] = useState(false); const [error, setError] = useState(""); const [done, setDone] = useState<{ public_ref: string } | null>(null);
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.customer_name.trim() || !form.customer_whatsapp.trim()) return setError("Guest name and WhatsApp number are required.");
    setPending(true); setError("");
    try { const result = await requestHotelBooking({ ...form, rate_id: rate.rate_id, checkin: search.checkin, checkout: search.checkout, rooms: Number(search.rooms), guests: Number(search.guests), occupancy: search.occupancy }); setDone(result.booking); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The booking request could not be submitted."); }
    finally { setPending(false); }
  }
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal"><div className="modal-head"><div><h2>{done ? "Request received" : `Request ${rate.hotel_name}`}</h2><p>{rate.room_type} · {rate.meal_plan} · {formatMoney(rate.total_amount, rate.currency)}</p></div><button className="close-button" onClick={onClose} aria-label="Close"><CloseIcon size={18} /></button></div><div className="modal-body">
    {done ? <div className="reference-box"><span>Your TravelOS reference</span><strong>{done.public_ref}</strong><p>Our team will confirm availability and the next payment step.</p></div> : <>
      {rate.cancellation_policy || rate.child_policy ? <div className="policy-note" style={{marginBottom:18}}>{rate.cancellation_policy ? <div>🛡 <b>Cancellation:</b> {rate.cancellation_policy}</div> : null}{rate.child_policy ? <div>🧒 <b>Children:</b> {rate.child_policy}</div> : null}</div> : null}
      <form id="hotel-booking" className="form-grid two" onSubmit={submit}>
      <div className="field"><label>Guest name *</label><input className="input" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} /></div><div className="field"><label>WhatsApp *</label><input className="input" value={form.customer_whatsapp} onChange={(e) => set("customer_whatsapp", e.target.value)} placeholder="Include country code" /></div>
      <div className="field"><label>Email</label><input className="input" type="email" value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} /></div><div className="field"><label>Nationality</label><input className="input" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} /></div>
      <div className="field"><label>Adults</label><input className="input" type="number" min="1" value={form.adults} onChange={(e) => set("adults", e.target.value)} /></div><div className="field"><label>Children</label><input className="input" type="number" min="0" value={form.children} onChange={(e) => set("children", e.target.value)} /></div>
      <div className="field span-all"><label>Special requests</label><textarea className="textarea" value={form.special_requests} onChange={(e) => set("special_requests", e.target.value)} /></div>{error ? <div className="span-all"><Notice tone="error">{error}</Notice></div> : null}
    </form></>}
  </div><div className="modal-foot"><button className="button button-ghost" onClick={onClose}>{done ? "Close" : "Cancel"}</button>{!done ? <button className="button button-primary" form="hotel-booking" type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit request"}</button> : null}</div></div></div>;
}

export default function HotelsPage() { return <Suspense fallback={<LoadingCards count={3} />}><HotelsContent /></Suspense>; }
