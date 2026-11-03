"use client";

import { FormEvent, useRef, useState } from "react";
import { BotTrapField } from "@/components/bot-trap-field";
import { EnquiryRecoveryActions } from "@/components/enquiry-recovery-actions";
import { hotelToday } from "@/lib/hotel-search-dates";
import { liveApi } from "@/lib/live-api";
import { tourQuickEnquiry, type TourEnquirySelection } from "@/lib/tour-enquiry";

type Choices = { adults: number; children: number; departure: string; hotelStyle: string };

/** Name + WhatsApp quote request on the tour page, through the same keyed enquiry path as every form. */
export function TourQuickEnquiry({ selection, choices }: { selection: TourEnquirySelection | null; choices: Choices }) {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true; setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const payload = tourQuickEnquiry(selection, { ...choices, name: String(form.get("name") || ""), whatsapp: String(form.get("whatsapp") || "") }, hotelToday());
      const result = await liveApi.enquiry(payload);
      setReference(result.enquiry.public_ref);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your request could not be sent.");
    } finally { lock.current = false; setPending(false); }
  }
  if (reference) return <div className="tour-quick-quote reference-box" role="status"><span>Quote request received</span><strong>{reference}</strong><p>A Navigeto specialist will WhatsApp you with prices for your dates.</p><EnquiryRecoveryActions onReset={() => { setReference(""); setError(""); }}/></div>;
  return <form className="tour-quick-quote" onSubmit={submit}>
    <BotTrapField/>
    <p className="tour-quick-quote-title">Get a quote for these choices</p>
    <label>Your name<input name="name" autoComplete="name" required/></label>
    <label>WhatsApp number<input name="whatsapp" type="tel" autoComplete="tel" placeholder="Include country code" required/></label>
    {error ? <><p role="alert" className="tour-quick-quote-error">{error}</p><EnquiryRecoveryActions disabled={pending} onReset={() => setError("")}/></> : null}
    <button className="button button-gold" type="submit" disabled={pending || !selection}>{pending ? "Sending…" : "Send my quote request"}</button>
  </form>;
}
