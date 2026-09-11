"use client";

import { FormEvent, useState } from "react";
import { liveApi } from "@/lib/live-api";
import {
  isTrustedProductionMarxUrl,
  type PublicPaymentOption,
} from "@/lib/public-payment";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

export function PayOnline() {
  const [bookingReference, setBookingReference] = useState("");
  const [email, setEmail] = useState("");
  const [payments, setPayments] = useState<PublicPaymentOption[]>([]);
  const [lookingUp, setLookingUp] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookingUp(true);
    setPayments([]);
    setError("");
    try {
      const result = await liveApi.paymentOptions({ bookingReference, email });
      setPayments(result.payments);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "We couldn't find an open payment for those details.");
    } finally {
      setLookingUp(false);
    }
  }

  async function pay(paymentId: string) {
    setOpeningId(paymentId);
    setError("");
    try {
      const link = await liveApi.createPaymentLink({ bookingReference, email, paymentId });
      if (link.environment !== "production" || !isTrustedProductionMarxUrl(link.payUrl)) {
        throw new Error("The secure payment page could not be verified. Please contact Navigeto.");
      }
      window.location.assign(link.payUrl);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "The secure payment page is temporarily unavailable.");
      setOpeningId(null);
    }
  }

  return <section className="pay-online-shell shell">
    <div className="pay-online-card">
      <div className="pay-online-intro">
        <p className="eyebrow">Secure online payment</p>
        <h1>Pay for your Navigeto booking.</h1>
        <p>Enter the booking reference and the email address used on your reservation. You can then choose an open payment already prepared by our team.</p>
        <div className="pay-assurances">
          <span><b>Fixed amount</b> You cannot alter the amount or currency.</span>
          <span><b>Hosted by Marx</b> Card details and OTP are entered only on the secure Marx page.</span>
          <span><b>3-D Secure</b> Your issuing bank may ask you to approve the payment.</span>
        </div>
      </div>

      <div className="pay-online-panel">
        <form onSubmit={lookup}>
          <label>Booking reference
            <input
              value={bookingReference}
              onChange={event => setBookingReference(event.target.value.toUpperCase())}
              placeholder="NAV-RES-2026-000000"
              autoComplete="off"
              maxLength={50}
              required
            />
          </label>
          <label>Email used for the booking
            <input
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="name@example.com"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>
          <button className="button button-gold" disabled={lookingUp || Boolean(openingId)}>
            {lookingUp ? "Checking securely…" : "Find my payment"}
          </button>
        </form>

        {error && <p className="pay-message pay-message-error" role="alert">{error}</p>}

        {payments.length > 0 && <div className="pay-options" aria-live="polite">
          <div>
            <p className="eyebrow">Open payments</p>
            <h2>Choose the payment to continue.</h2>
          </div>
          {payments.map(payment => <article key={payment.id}>
            <div>
              <b>{payment.label}</b>
              <strong>{money(payment.amount, payment.currency)}</strong>
              <small>Amount and currency set by Navigeto</small>
            </div>
            <button
              type="button"
              className="button button-primary"
              disabled={Boolean(openingId)}
              onClick={() => pay(payment.id)}
            >
              {openingId === payment.id ? "Opening Marx…" : "Pay securely →"}
            </button>
          </article>)}
        </div>}

        <p className="pay-help">No open payment? Contact <a href="mailto:info@navigeto.com">info@navigeto.com</a> or WhatsApp <a href="https://wa.me/94774206166">+94 77 420 6166</a>. Never send your full card number, CVV or OTP to anyone.</p>
      </div>
    </div>
  </section>;
}
