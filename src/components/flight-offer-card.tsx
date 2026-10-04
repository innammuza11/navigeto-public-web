"use client";

import type { FlightOffer } from "@/lib/live-api";
import { flightDateTime, flightDuration, flightLayover } from "@/lib/flight-selling";
import { Money } from "@/components/money";

type Journey = { airline?: string | null; cabin_class?: string | null; slices?: FlightOffer["slices"] };
const cabin = (value?: string | null) => (value || "Cabin to be confirmed").replaceAll("_", " ");
const stopsLabel = (stops: number) => stops === 0 ? "Non-stop" : `${stops} ${stops === 1 ? "stop" : "stops"}`;

export function FlightJourneySummary({ offer }: { offer: Journey }) {
  return <div className="flight-journey-summary" aria-label="Selected flight itinerary">
    <small>Cabin</small><p>{cabin(offer.cabin_class)}</p>
    {offer.slices?.map((slice, index) => <div key={`${slice.origin}-${index}`}>
      <small>{index === 0 ? "Outbound" : index === 1 ? "Return" : `Journey ${index + 1}`}</small>
      <p><b>{slice.origin} → {slice.destination}</b><br/>Departs {flightDateTime(slice.departing_at).date} · {flightDateTime(slice.departing_at).time}<br/>Arrives {flightDateTime(slice.arriving_at).date} · {flightDateTime(slice.arriving_at).time}<br/>{flightDuration(slice.duration)} · {stopsLabel(slice.stops)}</p>
    </div>)}
  </div>;
}

function FareRule({ label, rule }: { label: string; rule?: { allowed: boolean; penalty_amount?: string | number; penalty_currency?: string } }) {
  return <div><small>{label}</small><p>{!rule ? "To be confirmed before ticketing" : !rule.allowed ? "Not permitted for this fare" : <>{"Permitted"}{rule.penalty_amount != null && rule.penalty_currency ? <> · penalty <Money value={Number(rule.penalty_amount)} currency={rule.penalty_currency}/></> : " · airline conditions apply"}</>}</p></div>;
}

export function FlightOfferCard({ offer, onChoose }: { offer: FlightOffer; onChoose: () => void }) {
  return <article className="flight-offer-card">
    <header><div className="flight-carrier-mark" aria-hidden="true">{offer.airline_code || "✈"}</div><div><h3>{offer.airline || "Airline itinerary"}</h3><p>{offer.slices.map(slice=>slice.segments.map(segment=>`${segment.carrier_code || ""}${segment.flight_number || ""}`).filter(Boolean).join(" · ")).filter(Boolean).join(" / ") || "Flight numbers to be confirmed"}</p></div><span className="flight-cabin-badge">{cabin(offer.cabin_class)}</span></header>
    <div className="flight-offer-body"><div className="flight-slices">
      {offer.slices.map((slice, index) => {
        const departure = flightDateTime(slice.departing_at), arrival = flightDateTime(slice.arriving_at);
        return <section className="flight-slice" key={`${slice.origin}-${index}`} aria-label={index === 0 ? "Outbound journey" : "Return journey"}>
          <p className="eyebrow">{index === 0 ? "Outbound" : index === 1 ? "Return" : `Journey ${index + 1}`}</p>
          <div className="flight-slice-route"><div><strong>{departure.time}</strong><b>{slice.origin}</b><small>{departure.date}</small></div><div className="flight-route-middle"><span>{flightDuration(slice.duration)}</span><i aria-hidden="true">✈</i><small>{stopsLabel(slice.stops)}</small></div><div><strong>{arrival.time}</strong><b>{slice.destination}</b><small>{arrival.date}</small></div></div>
        </section>;
      })}
    </div><aside className="flight-selling-price"><small>Total for selected travellers</small><Money value={offer.total_amount} currency={offer.currency}/><p>Final availability and fare rules checked before ticketing.</p><button className="button button-primary" onClick={onChoose}>Choose this flight <span aria-hidden="true">→</span></button></aside></div>
    <details className="flight-details"><summary>View flight details <span>Itinerary · baggage · fare conditions</span></summary><div className="flight-details-content">
      <div className="flight-segment-list"><h4>Your journey, in detail</h4>
        {offer.slices.map((slice, index)=><section key={`${slice.origin}-${index}`}><p className="eyebrow">{index === 0 ? "Outbound" : "Return"} · {slice.origin} → {slice.destination}</p>
          {slice.segments.map((segment, leg)=>{const connection=leg>0?flightLayover(slice.segments[leg-1],segment):null;return <div key={leg}>{connection&&<p className="flight-connection">Connection at {connection.airport} · {connection.duration} layover</p>}<div className="flight-segment"><span aria-hidden="true">{String(leg+1).padStart(2,"0")}</span><div><b>{segment.carrier || segment.carrier_code || offer.airline || "Operating airline to be confirmed"} {segment.carrier_code}{segment.flight_number}</b>{segment.origin && segment.destination && <p>{segment.origin} → {segment.destination}</p>}{segment.departing_at && segment.arriving_at && <p>{flightDateTime(segment.departing_at).date} · {flightDateTime(segment.departing_at).time} → {flightDateTime(segment.arriving_at).date} · {flightDateTime(segment.arriving_at).time}</p>}{segment.duration && <small>{flightDuration(segment.duration)}</small>}{segment.baggage && <small>{segment.baggage}</small>}</div></div></div>;})}
          {slice.stops > 0 && <p className="flight-detail-note">{slice.stops} connecting {slice.stops === 1 ? "stop" : "stops"}. Connection airports and layover times {slice.segments.every(s=>s.origin && s.destination && s.departing_at && s.arriving_at) ? "are shown in the segment itinerary above." : "will be confirmed before ticketing."}</p>}
        </section>)}<p className="flight-detail-note">Dates and times are displayed as supplied by the airline.</p>
      </div><div className="flight-fare-facts"><h4>Know your fare</h4><div><small>Baggage</small><p>{offer.baggage || "Allowance not supplied with this fare. Our ticketing team will verify cabin and checked baggage before confirmation."}</p></div><FareRule label="Changes" rule={offer.conditions?.change_before_departure}/><FareRule label="Refunds" rule={offer.conditions?.refund_before_departure}/>{offer.expires_at && <div><small>Offer expiry</small><p>{flightDateTime(offer.expires_at).date} · {flightDateTime(offer.expires_at).time}</p></div>}<p className="flight-detail-note">Your request does not issue a ticket or collect payment.</p></div>
    </div></details>
  </article>;
}
