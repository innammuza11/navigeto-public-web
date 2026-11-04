"use client";

import { FormEvent, useRef, useState } from "react";
import { BotTrapField } from "@/components/bot-trap-field";
import { EnquiryRecoveryActions } from "@/components/enquiry-recovery-actions";
import { itineraryDownloadEnquiry } from "@/lib/itinerary-print";
import { liveApi } from "@/lib/live-api";

/** Lead magnet: send name + WhatsApp, then open the print-ready itinerary to save as PDF. */
export function TourItineraryDownload({ tour }: { tour: { id?: string; slug: string; title: string } }) {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const sheetHref = `/tours/package/${tour.slug}/itinerary`;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true; setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const request = itineraryDownloadEnquiry(tour, { name: String(form.get("name") || ""), whatsapp: String(form.get("whatsapp") || ""), email: String(form.get("email") || "") });
      const result = await liveApi.enquiry(request);
      setReference(result.enquiry.public_ref);
      window.open(`${sheetHref}?print=1`, "_blank", "noopener");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your request could not be sent.");
    } finally { lock.current = false; setPending(false); }
  }
  return <section className="shell itinerary-download" aria-labelledby="itinerary-download-title">
    <div><p className="eyebrow">Take it with you</p><h3 id="itinerary-download-title">Download this itinerary as a PDF.</h3><p>Get the day-by-day plan to read later or share with your travel partner. A specialist can also answer questions on WhatsApp.</p></div>
    {reference ? <div className="reference-box" role="status"><span>Itinerary ready</span><strong>{reference}</strong><p>Your itinerary opened in a new tab: choose “Save as PDF” in the print window. <a className="text-link" href={`${sheetHref}?print=1`} target="_blank" rel="noopener">Open it again</a></p><EnquiryRecoveryActions onReset={() => { setReference(""); setError(""); }}/></div>
    : <form onSubmit={submit}>
      <BotTrapField/>
      <label>Your name<input name="name" autoComplete="name" required/></label>
      <label>WhatsApp number<input name="whatsapp" type="tel" autoComplete="tel" placeholder="Include country code" required/></label>
      <label>Email (optional)<input name="email" type="email" autoComplete="email"/></label>
      {error ? <><p role="alert" className="tour-quick-quote-error">{error}</p><EnquiryRecoveryActions disabled={pending} onReset={() => setError("")}/></> : null}
      <button className="button button-gold" type="submit" disabled={pending}>{pending ? "Preparing…" : "Get the itinerary"}</button>
    </form>}
  </section>;
}
