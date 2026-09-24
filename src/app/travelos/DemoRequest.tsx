"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { liveApi } from "@/lib/live-api";
import { DEMO_WHATSAPP, demoRequestPayload } from "@/lib/travelos-demo";
import s from "./travelos.module.css";

export default function DemoRequest() {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const lock = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const payload = demoRequestPayload(new FormData(event.currentTarget), window.location.search);
      const result = await liveApi.travelosDemo(payload);
      setReference(result.enquiry.public_ref);
    } catch (reason) {
      setError(reason instanceof Error && reason.name !== "TimeoutError" ? reason.message : "We could not confirm your request yet. Retry with the same details; we will use the same request reference.");
    } finally { lock.current = false; setBusy(false); }
  }
  function startSeparate() {
    if (!window.confirm("Your earlier request may already have reached us. Start a separate demo request with these new details?")) return;
    try { liveApi.startSeparateTravelosDemo(); setError(""); }
    catch { setError("Please contact us on WhatsApp to check your earlier request."); }
  }
  if (reference) return <div className={s.receipt} role="status">
    <span className={s.successMark} aria-hidden="true">✓</span><h3>Your demo request is in.</h3>
    <p>Keep this reference: <strong>{reference}</strong>. The Navigeto team will contact you using the details you provided.</p>
    <p>No subscription or payment has been started.</p><a className={s.textLink} href={DEMO_WHATSAPP} target="_blank" rel="noreferrer">Talk to us on WhatsApp ↗</a>
  </div>;
  return <form className={s.form} onSubmit={submit} aria-label="Request a TravelOS demo">
    <fieldset disabled={busy}>
      <div className={s.formPair}><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={160} placeholder="Full name" /></label><label>Agency name<input name="agency" autoComplete="organization" required minLength={2} maxLength={160} placeholder="Your travel company" /></label></div>
      <label>Work email<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@youragency.com" /></label>
      <label>WhatsApp with country code<input name="phone" type="tel" autoComplete="tel" required maxLength={40} placeholder="+94 77 123 4567" /></label>
      <label>What would help your team most?<select name="goal" defaultValue="Complete workflow"><option>Complete workflow</option><option>Costing and quotations</option><option>Itineraries and branding</option><option>Reservations and vouchers</option><option>Navigeto B2B services</option><option>My own suppliers and rates</option></select></label>
      <label className={s.consent}><input name="consent" type="checkbox" required /><span>Navigeto may contact me about this demo. I have read the <Link href="/privacy">privacy policy</Link>.</span></label>
      <button className={s.primary} type="submit" disabled={busy}>{busy ? "Sending your request…" : "Request my demo"}<span aria-hidden="true">↗</span></button>
    </fieldset>
    {error && <div role="alert" className={s.formError}><p>{error}</p><button type="button" onClick={startSeparate}>Start a separate request</button></div>}
    <p className={s.formNote}>A conversation with our team. No card required.</p>
  </form>;
}
