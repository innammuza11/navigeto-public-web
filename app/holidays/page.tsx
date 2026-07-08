"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PageHero } from "@/components/PageHero";

const destinations = [
  "Maldives", "Dubai", "Thailand", "Malaysia", "Singapore", "Vietnam",
  "Bali", "Japan", "Turkey", "Egypt", "Kenya", "Seychelles",
];

function HolidaysContent() {
  const params = useSearchParams();
  const destination = params.get("destination") || "";
  return <>
    <PageHero eyebrow="International Holidays" title="Tailor-made holidays beyond Sri Lanka." description="Navigeto's international desk puts together flights, hotels, transfers and tours for the destinations below. Every package is built and quoted by a consultant against real hotel and airline availability — never an invented fare." />
    <div className="shell content-wrap">
      <div className="tag-row" style={{marginBottom:40}}>
        {destinations.map((d) => <span key={d} className="tag">{d}</span>)}
      </div>
      <div className="detail-grid">
        <section className="prose-card">
          <div className="eyebrow">Start planning</div><h2>Tell us your destination and dates.</h2>
          <EnquiryForm enquiryType="general" initialSubject={destination ? `International holiday — ${destination}` : "International holiday enquiry"} />
        </section>
        <aside className="detail-side">
          <div className="eyebrow">What&apos;s included in a quotation</div><h2>One request, a complete itinerary.</h2>
          <div className="guide-step"><b>1</b><span>Flights, hotel and room type, meal basis, transfers and tours — priced together or itemised.</span></div>
          <div className="guide-step"><b>2</b><span>Visa requirements flagged upfront if your nationality needs one for that destination.</span></div>
          <div className="guide-step"><b>3</b><span>Child pricing, single-supplement and cancellation terms shown clearly before you decide.</span></div>
          <div className="guide-step"><b>4</b><span>A dedicated consultant remains your contact from quotation through to return home.</span></div>
        </aside>
      </div>
    </div>
  </>;
}
export default function HolidaysPage() { return <Suspense fallback={null}><HolidaysContent /></Suspense>; }
