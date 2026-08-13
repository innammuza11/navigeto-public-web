"use client";

import { useState } from "react";
import { Notice } from "@/components/Notice";
import { PageHero } from "@/components/PageHero";
import { submitEnquiry } from "@/lib/travelos";

export default function CorporatePage() {
  const [form, setForm] = useState({ customer_name: "", company_name: "", whatsapp: "", email: "", pax: "", notes: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.customer_name.trim() || !form.whatsapp.trim() || !form.company_name.trim()) {
      setError("Please enter your name, company name and WhatsApp number.");
      return;
    }
    setPending(true); setError("");
    try {
      const result = await submitEnquiry({
        enquiry_type: "general",
        customer_name: form.customer_name, whatsapp: form.whatsapp, email: form.email,
        pax: Number(form.pax || 0) || undefined,
        subject: `Corporate travel — ${form.company_name}`,
        notes: form.notes,
        details: { company_name: form.company_name },
      });
      setReference(result.public_ref);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Your request could not be submitted."); }
    finally { setPending(false); }
  }

  return <>
    <PageHero image="/headers/corporate.webp" eyebrow="Corporate & Group Travel" title="Corporate travel, MICE and group programs for Sri Lanka." description="Business travel, incentive trips, conferences and group tours — coordinated by one account team with consolidated invoicing and a dedicated point of contact." />
    <div className="shell content-wrap detail-grid">
      <section className="prose-card">
        {reference ? <div className="reference-box"><span>Your TravelOS reference</span><strong>{reference}</strong><p>Our corporate team will contact you to scope your program.</p></div> : <>
          <div className="eyebrow">Tell us about your program</div><h2>Start a corporate or group request.</h2>
          <form className="form-grid two" onSubmit={submit}>
            <div className="field"><label>Contact name *</label><input className="input" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} required /></div>
            <div className="field"><label>Company / organisation *</label><input className="input" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} required /></div>
            <div className="field"><label>WhatsApp *</label><input className="input" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="Include country code" required /></div>
            <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="field"><label>Approximate group size</label><input className="input" type="number" min="1" value={form.pax} onChange={(e) => set("pax", e.target.value)} /></div>
            <div className="field span-all"><label>Program details</label><textarea className="textarea" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Conference, incentive trip, business travel policy, dates, budget range, etc." /></div>
            {error ? <div className="span-all"><Notice tone="error">{error}</Notice></div> : null}
            <div className="form-actions span-all"><button className="button button-primary" disabled={pending}>{pending ? "Sending…" : "Request corporate consultation"}</button></div>
          </form>
        </>}
      </section>
      <aside className="detail-side">
        <div className="eyebrow">Built for business</div><h2>One team, every moving part.</h2>
        <div className="guide-step"><b>1</b><span>Flights, hotels, transfers, venues and tours coordinated under one account manager.</span></div>
        <div className="guide-step"><b>2</b><span>Consolidated invoicing for finance teams — no per-traveller reconciliation.</span></div>
        <div className="guide-step"><b>3</b><span>Group rates and availability negotiated directly with our supplier network.</span></div>
        <div className="guide-step"><b>4</b><span>On-ground support throughout the program, not just at booking.</span></div>
      </aside>
    </div>
  </>;
}
