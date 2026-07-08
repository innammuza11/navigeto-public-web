"use client";

import { useState } from "react";
import { Notice } from "@/components/Notice";
import { submitEnquiry } from "@/lib/travelos";
import { todayIso } from "@/lib/format";

type Props = {
  enquiryType?: string;
  initialSubject?: string;
  compact?: boolean;
};

export function EnquiryForm({ enquiryType = "custom_trip", initialSubject = "", compact = false }: Props) {
  const [form, setForm] = useState({
    customer_name: "", whatsapp: "", email: "", nationality: "", travel_start_date: "", travel_end_date: "",
    adults: "2", children: "0", hotel_category: "4 Star", subject: initialSubject, notes: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.customer_name.trim() || !form.whatsapp.trim()) {
      setError("Please enter your name and WhatsApp number.");
      return;
    }
    setPending(true); setError("");
    try {
      const result = await submitEnquiry({
        enquiry_type: enquiryType,
        customer_name: form.customer_name,
        whatsapp: form.whatsapp,
        email: form.email,
        nationality: form.nationality,
        travel_start_date: form.travel_start_date || null,
        travel_end_date: form.travel_end_date || null,
        pax: Number(form.adults || 0) + Number(form.children || 0),
        subject: form.subject || initialSubject || "Website enquiry",
        notes: form.notes,
        details: { adults: Number(form.adults || 0), children: Number(form.children || 0), hotel_category: form.hotel_category },
      });
      setReference(result.public_ref);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your request could not be submitted.");
    } finally { setPending(false); }
  }

  if (reference) return <div className="reference-box"><span>Your TravelOS reference</span><strong>{reference}</strong><p>Your enquiry is now inside Navigeto TravelOS. Our team will contact you with the next step.</p></div>;

  return <form className={`form-grid two ${compact ? "compact-form" : ""}`} onSubmit={submit}>
    <div className="field"><label>Name *</label><input className="input" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} required /></div>
    <div className="field"><label>WhatsApp *</label><input className="input" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="Include country code" required /></div>
    <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
    <div className="field"><label>Nationality</label><input className="input" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} /></div>
    <div className="field"><label>Arrival date</label><input className="input" type="date" min={todayIso()} value={form.travel_start_date} onChange={(e) => set("travel_start_date", e.target.value)} /></div>
    <div className="field"><label>Departure date</label><input className="input" type="date" min={form.travel_start_date || todayIso()} value={form.travel_end_date} onChange={(e) => set("travel_end_date", e.target.value)} /></div>
    <div className="field"><label>Adults</label><input className="input" type="number" min="1" value={form.adults} onChange={(e) => set("adults", e.target.value)} /></div>
    <div className="field"><label>Children</label><input className="input" type="number" min="0" value={form.children} onChange={(e) => set("children", e.target.value)} /></div>
    <div className="field"><label>Hotel preference</label><select className="select" value={form.hotel_category} onChange={(e) => set("hotel_category", e.target.value)}><option>3 Star</option><option>4 Star</option><option>5 Star</option><option>Luxury Boutique</option><option>Mixed Category</option></select></div>
    <div className="field"><label>Trip / package</label><input className="input" value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Sri Lanka family holiday" /></div>
    <div className="field span-all"><label>Places, interests and special requests</label><textarea className="textarea" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Tell us your preferred route, pace, meals, celebrations, accessibility needs or anything important." /></div>
    {error ? <div className="span-all"><Notice tone="error">{error}</Notice></div> : null}
    <div className="form-actions span-all"><button className="button button-primary" disabled={pending}>{pending ? "Sending to TravelOS…" : "Submit trip request"}</button></div>
  </form>;
}
