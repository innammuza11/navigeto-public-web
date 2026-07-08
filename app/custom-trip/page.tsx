"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PageHero } from "@/components/PageHero";

function CustomTripContent() {
  const params = useSearchParams();
  const packageName = params.get("package") || params.get("destination") || "";
  return <>
    <PageHero eyebrow="Tailor-made Sri Lanka" title="Build a private journey around your dates, pace and budget." description="Send one clear request. Navigeto TravelOS connects it to live hotel rates, approved transport data and our operations team." />
    <div className="shell content-wrap detail-grid">
      <section className="prose-card">
        <div className="eyebrow">Start your journey</div><h2>Tell us what the perfect trip looks like.</h2>
        <EnquiryForm initialSubject={packageName} />
      </section>
      <aside className="detail-side">
        <div className="eyebrow">What happens next</div><h2>Human expertise, powered by TravelOS.</h2>
        <div className="guide-step"><b>1</b><span>Your request enters our live sales and operations workflow.</span></div>
        <div className="guide-step"><b>2</b><span>We match approved hotels, transport and experiences for your travel dates.</span></div>
        <div className="guide-step"><b>3</b><span>You receive a clear Navigeto quotation without hidden supplier information.</span></div>
        <div className="guide-step"><b>4</b><span>Once accepted, our operations team confirms each service and manages the tour.</span></div>
      </aside>
    </div>
  </>;
}
export default function CustomTripPage(){return <Suspense fallback={null}><CustomTripContent /></Suspense>}
