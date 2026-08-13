"use client";

import { useEffect, useState } from "react";
import { Notice } from "@/components/Notice";
import { PageHero } from "@/components/PageHero";
import { submitEnquiry } from "@/lib/travelos";
import { todayIso } from "@/lib/format";

export default function VisasPage() {
  const [form, setForm] = useState({ customer_name: "", whatsapp: "", email: "", nationality: "", residence_country: "", destination: "", travel_start_date: "", notes: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [showVisaChecker, setShowVisaChecker] = useState(false);
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    // window is unavailable during SSR, so this can't be a lazy useState initializer.
    // Visa Intelligence checker link is a .com-only feature for now — keep it off navigeto.lk.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowVisaChecker(window.location.hostname.endsWith("navigeto.com"));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.customer_name.trim() || !form.whatsapp.trim() || !form.nationality.trim() || !form.destination.trim()) {
      setError("Please enter your name, WhatsApp number, passport nationality and destination.");
      return;
    }
    setPending(true); setError("");
    try {
      const result = await submitEnquiry({
        enquiry_type: "general",
        customer_name: form.customer_name, whatsapp: form.whatsapp, email: form.email, nationality: form.nationality,
        travel_start_date: form.travel_start_date || null,
        subject: `Visa assistance — ${form.nationality} passport to ${form.destination}`,
        notes: form.notes,
        details: { residence_country: form.residence_country, destination: form.destination },
      });
      setReference(result.public_ref);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Your request could not be submitted."); }
    finally { setPending(false); }
  }

  return <>
    <PageHero eyebrow="Visa Assistance" title="Visa guidance and application support, handled by a consultant." description="Tell us your passport nationality, country of residence and destination. A Navigeto consultant checks the current requirements and confirms eligibility, documents and processing time before you apply — we do not guarantee visa approval, since that decision always rests with the issuing authority." />
    {showVisaChecker ? <div className="shell">
      <div className="reference-box">
        <span>Not sure if you need a visa?</span>
        <p>Try our free instant visa checker — enter your passport and destination for a quick, verified answer before you request a consultation.</p>
        <a className="button button-primary" href={`${process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.navigeto.com"}/visa-check`} target="_blank" rel="noreferrer">Check visa requirement</a>
      </div>
    </div> : null}
    <div className="shell content-wrap detail-grid">
      <section className="prose-card">
        {reference ? <div className="reference-box"><span>Your TravelOS reference</span><strong>{reference}</strong><p>Our visa desk will review your request and contact you with the requirements and next steps.</p></div> : <>
          <div className="eyebrow">Check your visa requirement</div><h2>Start with your travel details.</h2>
          <form className="form-grid two" onSubmit={submit}>
            <div className="field"><label>Passport nationality *</label><input className="input" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} placeholder="e.g. Sri Lankan" required /></div>
            <div className="field"><label>Country of residence</label><input className="input" value={form.residence_country} onChange={(e) => set("residence_country", e.target.value)} /></div>
            <div className="field"><label>Destination *</label><input className="input" value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="e.g. UAE, Schengen, UK" required /></div>
            <div className="field"><label>Planned travel date</label><input className="input" type="date" min={todayIso()} value={form.travel_start_date} onChange={(e) => set("travel_start_date", e.target.value)} /></div>
            <div className="field"><label>Name *</label><input className="input" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} required /></div>
            <div className="field"><label>WhatsApp *</label><input className="input" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="Include country code" required /></div>
            <div className="field span-all"><label>Email</label><input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="field span-all"><label>Anything else we should know?</label><textarea className="textarea" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Purpose of travel, prior visa refusals, urgency, etc." /></div>
            {error ? <div className="span-all"><Notice tone="error">{error}</Notice></div> : null}
            <div className="form-actions span-all"><button className="button button-primary" disabled={pending}>{pending ? "Sending…" : "Request visa consultation"}</button></div>
          </form>
        </>}
      </section>
      <aside className="detail-side">
        <div className="eyebrow">How visa assistance works</div><h2>Documents handled carefully, every step.</h2>
        <div className="guide-step"><b>1</b><span>We confirm the current visa type, required documents, embassy fee and processing time for your route.</span></div>
        <div className="guide-step"><b>2</b><span>Any documents you share — passport copies, bank statements, photos — are collected securely and never displayed publicly.</span></div>
        <div className="guide-step"><b>3</b><span>We track your application and update you at each stage.</span></div>
        <div className="guide-step"><b>4</b><span>Final approval is always decided by the destination&apos;s immigration authority, not Navigeto.</span></div>
      </aside>
    </div>
  </>;
}
