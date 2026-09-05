"use client";

import { useRef, useState, type FormEvent } from "react";
import { liveApi } from "@/lib/live-api";
import { EnquiryRecoveryActions } from "@/components/enquiry-recovery-actions";
import { hotelPartyStatus } from "@/lib/hotel-party-policy";
import type { HotelStaySelection } from "@/lib/hotel-checkout";

export function HotelManualQuote({ selection }: { selection: HotelStaySelection & { hotel_name?: string; q?: string } }) {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    setBusy(true); setError("");
    try {
      const data = new FormData(event.currentTarget);
      const party = { rooms: Number(data.get("rooms")), adults: Number(data.get("adults")), children: Number(data.get("children")), occupancy: String(data.get("occupancy")) };
      const status = hotelPartyStatus(party, true);
      if (status.kind === "invalid") throw new Error(status.reason);
      const checkin = String(data.get("checkin")); const checkout = String(data.get("checkout"));
      const validDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0,10) === date;
      if (!validDate(checkin) || !validDate(checkout) || checkout <= checkin) throw new Error("Please choose valid stay dates.");
      const agesText = String(data.get("child_ages") || "").trim();
      const childAges = agesText ? agesText.split(",").map(age => /^\d+$/.test(age.trim()) ? Number(age.trim()) : NaN) : [];
      const bedNeeds = String(data.get("bed_needs") || "").trim();
      if (childAges.length !== party.children || childAges.some(age => !Number.isSafeInteger(age) || age < 0) || (party.children > 0 && !bedNeeds)) throw new Error("Enter one age per child and describe their bed needs.");
      const name = String(data.get("customer_name") || "").trim();
      const whatsapp = String(data.get("whatsapp") || "").trim();
      if (!name || !whatsapp) throw new Error("Please enter your name and WhatsApp number.");
      const result = await liveApi.enquiry({ enquiry_type: "hotel", customer_name: name, whatsapp, email: String(data.get("email") || ""), consent_contact: true,
        subject: `Manual hotel quote: ${String(data.get("hotel"))}`, travel_start_date: checkin, travel_end_date: checkout, pax: party.adults + party.children,
        notes: String(data.get("notes") || ""), details: { quotation_type: "hotel-manual-quote", pricing_status: "unquoted", hotel: String(data.get("hotel")), rate_id: selection.rate_id || null, checkin, checkout, ...party, meal_plan: selection.meal_plan || null, market: selection.market || null, child_ages: childAges, child_bed_needs: bedNeeds } }, () => { if (checkin < new Date().toISOString().slice(0,10)) throw new Error("Please choose upcoming stay dates."); });
      setReference(result.enquiry.public_ref);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Your quote request could not be sent."); }
    finally { locked.current = false; setBusy(false); }
  }
  if (reference) return <section className="shell confirmation"><h1>Quote request received</h1><p>Reference {reference}. Our team will verify room capacity, child policies and the full price before confirmation.</p><EnquiryRecoveryActions onReset={()=>{setReference("");setError("");}}/></section>;
  return <section className="shell results-section"><h1>Manual quote required</h1><p>No automatic total is shown. Our team must verify your party’s room arrangements and any child charges. Room capacity is not confirmed by selecting a room basis.</p>
    <form onSubmit={submit} className="traveller-form">
      {error && <p role="alert">{error}</p>}
      {error && <EnquiryRecoveryActions disabled={busy} onReset={()=>setError("")}/>}
      <div className="form-grid">
        <label>Hotel or destination<input name="hotel" required defaultValue={selection.hotel_name || selection.q || ""}/></label>
        <label>Check-in<input name="checkin" type="date" required defaultValue={selection.checkin}/></label>
        <label>Check-out<input name="checkout" type="date" required defaultValue={selection.checkout}/></label>
        <label>Rooms<input name="rooms" type="number" min="1" step="1" required defaultValue={selection.rooms ?? 1}/></label>
        <label>Adults<input name="adults" type="number" min="1" step="1" required defaultValue={selection.adults ?? 2}/></label>
        <label>Children<input name="children" type="number" min="0" step="1" required defaultValue={selection.children ?? 0}/></label>
        <label>Requested room basis<select name="occupancy" defaultValue={selection.occupancy || "double"}><option value="single">Single</option><option value="double">Double / twin</option><option value="triple">Triple</option><option value="quadruple">Family / quadruple</option></select></label>
        <label>Child ages at check-in<input name="child_ages" placeholder="One age per child, separated by commas"/></label>
        <label>Children’s bed needs<textarea name="bed_needs" placeholder="For each child: sharing existing bed, extra bed, cot, or advice needed"/></label>
        <label>Your name<input name="customer_name" required autoComplete="name"/></label>
        <label>WhatsApp<input name="whatsapp" required autoComplete="tel"/></label>
        <label>Email<input name="email" type="email" autoComplete="email"/></label>
        <label>Notes<textarea name="notes"/></label>
      </div>
      <label><input type="checkbox" required/> I agree to be contacted about this quote request.</label>
      <button type="submit" className="button button-gold" disabled={busy}>{busy ? "Sending request…" : "Request manual quote"}</button>
    </form></section>;
}
