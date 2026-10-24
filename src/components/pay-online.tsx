"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { liveApi } from "@/lib/live-api";
import {
  bookingStatusLabel,
  isTrustedProductionMarxUrl,
  type OnlineBookingSummary,
} from "@/lib/public-payment";
function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency }).format(
    amount,
  );
}

export function PayOnline() {
  const [reference, setReference] = useState(""),
    [email, setEmail] = useState(""),
    [booking, setBooking] = useState<OnlineBookingSummary | null>(null),
    [loading, setLoading] = useState(false),
    [opening, setOpening] = useState<string | null>(null),
    [error, setError] = useState(""),
    [accepted, setAccepted] = useState(false),
    [changeType, setChangeType] = useState<"cancellation" | "refund">(
      "cancellation",
    ),
    [changeMessage, setChangeMessage] = useState(""),
    [requestPending, setRequestPending] = useState(false),
    [requestNotice, setRequestNotice] = useState("");
  const request = useRef(0),
    paymentLock = useRef(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const ref = new URLSearchParams(location.search).get("reference");
      if (ref && /^[A-Z0-9-]{6,50}$/.test(ref)) setReference(ref);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  function change() {
    request.current++;
    setLoading(false);
    setBooking(null);
    setAccepted(false);
    setRequestNotice("");
    setError("");
  }
  async function lookup(e?: FormEvent) {
    e?.preventDefault();
    if (paymentLock.current) return;
    const id = ++request.current;
    setLoading(true);
    setError("");
    setBooking(null);
    setAccepted(false);
    try {
      const b = await liveApi.bookingStatus({
        bookingReference: reference,
        email,
      });
      if (id === request.current) setBooking(b);
    } catch (e) {
      if (id === request.current)
        setError(
          e instanceof Error ? e.message : "Booking status is unavailable.",
        );
    } finally {
      if (id === request.current) setLoading(false);
    }
  }
  async function pay(id: string) {
    if (paymentLock.current || !accepted || !booking?.terms) return;
    paymentLock.current = true;
    setOpening(id);
    setError("");
    try {
      const link = await liveApi.createPaymentLink({
        bookingReference: reference,
        email,
        paymentId: id,
        acceptTerms: true,
      });
      if (
        link.environment !== "production" ||
        !isTrustedProductionMarxUrl(link.payUrl)
      )
        throw Error(
          "The secure payment page could not be verified. Please contact Navigeto.",
        );
      location.assign(link.payUrl);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Payment could not be opened. Check booking status before retrying.",
      );
      setBooking(null);
      setAccepted(false);
      setOpening(null);
      paymentLock.current = false;
    }
  }
  async function requestChange() {
    if (
      !booking?.reservationReference ||
      requestPending ||
      changeMessage.trim().length < 10
    )
      return;
    setRequestPending(true);
    setRequestNotice("");
    setError("");
    try {
      const result = await liveApi.requestBookingChange({
        bookingReference: reference,
        email,
        requestType: changeType,
        message: changeMessage,
      });
      setRequestNotice(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your request.");
    } finally {
      setRequestPending(false);
    }
  }
  return (
    <section className="pay-online-shell shell">
      <div className="pay-online-card">
        <div className="pay-online-intro">
          <p className="eyebrow">Your journey, beautifully organised</p>
          <h1>
            Your booking.
            <br />
            One secure place.
          </h1>
          <p>
            Track your request, review your confirmed arrangements and pay your
            deposit or balance through Marx.
          </p>
          <div className="pay-assurances">
            <span>
              <b>Availability first</b> Our team confirms supplier availability
              before opening checkout.
            </span>
            <span>
              <b>Clear, fixed pricing</b> Review the total, amount due and
              cancellation terms before paying.
            </span>
            <span>
              <b>Protected checkout</b> Card details and bank verification stay
              on the Marx payment page.
            </span>
          </div>
        </div>
        <div className="pay-online-panel">
          <form onSubmit={lookup}>
            <label>
              Booking or request reference
              <input
                required
                maxLength={50}
                value={reference}
                disabled={Boolean(opening) || requestPending}
                onChange={(e) => {
                  change();
                  setReference(e.target.value.toUpperCase());
                }}
                placeholder="Reference from your booking request"
                autoComplete="off"
              />
            </label>
            <label>
              Booking email
              <input
                required
                type="email"
                maxLength={254}
                value={email}
                disabled={Boolean(opening) || requestPending}
                onChange={(e) => {
                  change();
                  setEmail(e.target.value);
                }}
                autoComplete="email"
                placeholder="name@example.com"
              />
            </label>
            <button
              className="button button-primary"
              disabled={loading || Boolean(opening)}
            >
              {loading ? "Checking your booking…" : "View booking & payments →"}
            </button>
          </form>
          {error && (
            <p role="alert" className="pay-message pay-message-error">
              {error}
            </p>
          )}
          {booking && (
            <div className="pay-options" aria-live="polite">
              <p className="eyebrow">{booking.reference}</p>
              <h2>{bookingStatusLabel(booking.status)}</h2>
              {booking.reservationReference && (
                <p>
                  Reservation {booking.reservationReference} ·{" "}
                  {booking.service.replace(/_/g, " ")}
                </p>
              )}
              {booking.travelStart && (
                <p>
                  {booking.travelStart}
                  {booking.travelEnd ? ` – ${booking.travelEnd}` : ""}
                </p>
              )}
              {booking.total !== null && booking.currency && (
                <p>
                  <b>Booking total {money(booking.total, booking.currency)}</b>
                </p>
              )}
              {!booking.payable && (
                <p className="notice">
                  Online payment is not currently open. We will confirm
                  availability, the final price and your payment terms before
                  requesting payment. If you have already paid, check the
                  payment status below before trying again.
                </p>
              )}
              {booking.terms && (
                <>
                  <h3>Your agreed booking terms</h3>
                  <p style={{ whiteSpace: "pre-wrap" }}>{booking.terms}</p>
                  {booking.checkoutExpiresAt && (
                    <p>
                      Checkout available until{" "}
                      {new Date(booking.checkoutExpiresAt).toLocaleString()}.
                    </p>
                  )}
                </>
              )}
              {booking.payments.map((p) => (
                <article key={p.id}>
                  <div>
                    <b>{p.label}</b>
                    <strong>{money(p.amount, p.currency)}</strong>
                    <small>{bookingStatusLabel(p.status)}</small>
                  </div>
                  {p.canPay && booking.terms && (
                    <button
                      type="button"
                      className="button button-primary"
                      disabled={!accepted || Boolean(opening)}
                      onClick={() => pay(p.id)}
                    >
                      {opening === p.id ? "Opening Marx…" : "Pay securely →"}
                    </button>
                  )}
                </article>
              ))}
              {booking.payable &&
                booking.terms &&
                booking.payments.some((p) => p.canPay) && (
                  <label className="pay-terms">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      disabled={Boolean(opening) || requestPending}
                    />{" "}
                    I have reviewed my booking details and accept the booking,
                    cancellation and refund terms shown above.
                  </label>
                )}
              {booking.changeRequests?.length > 0 && (
                <section>
                  <h3>Your cancellation &amp; refund requests</h3>
                  {booking.changeRequests.map((c, i) => (
                    <article key={i}>
                      <b>
                        {c.type} · {c.status}
                      </b>
                      {c.outcome && <p>{c.outcome}</p>}
                    </article>
                  ))}
                </section>
              )}
              {booking.reservationReference && (
                <details>
                  <summary>Request a cancellation or refund</summary>
                  <p>
                    We will review this against your agreed terms. Sending a
                    request does not cancel your booking or issue a refund.
                  </p>
                  <label>
                    Request type
                    <select
                      value={changeType}
                      onChange={(e) =>
                        setChangeType(
                          e.target.value as "cancellation" | "refund",
                        )
                      }
                    >
                      <option value="cancellation">Cancellation</option>
                      <option value="refund">Refund review</option>
                    </select>
                  </label>
                  <label>
                    Tell us what you need
                    <textarea
                      value={changeMessage}
                      onChange={(e) => setChangeMessage(e.target.value)}
                      maxLength={2000}
                      minLength={10}
                      rows={3}
                    />
                  </label>
                  <button
                    type="button"
                    className="button button-outline"
                    disabled={
                      requestPending ||
                      Boolean(opening) ||
                      changeMessage.trim().length < 10
                    }
                    onClick={requestChange}
                  >
                    {requestPending
                      ? "Saving request…"
                      : "Send request for review"}
                  </button>
                  {requestNotice && <p role="status">{requestNotice}</p>}
                </details>
              )}
              <p>
                Payment approval does not issue an airline ticket or replace
                supplier confirmation. A received payment may remain pending
                Finance posting before a final receipt is available.
              </p>
              <button
                type="button"
                className="button button-outline"
                onClick={() => lookup()}
                disabled={loading || Boolean(opening)}
              >
                Refresh booking status
              </button>
            </div>
          )}
          <p className="pay-help">
            Need help or a cancellation/refund?{" "}
            <a href="mailto:info@navigeto.com">Contact Navigeto</a> with your
            booking reference. If a payment is still being confirmed, do not pay
            again.
          </p>
        </div>
      </div>
    </section>
  );
}
