"use client";

import { useState } from "react";
import s from "./travelos.module.css";

const steps = ["Cost the trip", "Shape the quote", "Run the booking"];
export default function WorkflowPreview() {
  const [step, setStep] = useState(0);
  const [rate, setRate] = useState(80);
  const total = rate * 5 + 240 + 60;
  return <div className={s.previewWrap}>
    <div className={s.previewTop}><span><i aria-hidden="true" /> WORKFLOW PREVIEW</span><small>Illustrative data · not a live booking</small></div>
    <div className={s.preview}>
      <aside className={s.previewSidebar}><strong>Travel<span>OS</span><small>AGENCY WORKSPACE</small></strong><div className={s.previewNav} aria-label="Explore the sample workflow">{steps.map((label, i) => <button key={label} type="button" aria-pressed={step === i} onClick={() => setStep(i)}><span aria-hidden="true">0{i + 1}</span>{label}</button>)}</div><p>Your team.<br />One booking file.</p></aside>
      <div className={s.previewBody}>
        <div className={s.previewBreadcrumb}>Sample agency <span>/</span> Sri Lanka escape</div>
        <div className={s.previewTitle}><div><small>6 DAYS · 5 NIGHTS · 2 ADULTS</small><h3>{step === 0 ? "A clear cost for every detail." : step === 1 ? "A journey worth saying yes to." : "Ready for the next step."}</h3></div><span className={s.sampleBadge}>Sample</span></div>
        {step === 0 ? <>
          <div className={s.costHeader}><span>Service</span><span>Cost · USD</span></div>
          <div className={s.costRow}><div><strong>Hotel stays</strong><small>1 room × 5 nights</small></div><div className={s.rateEditor}><label htmlFor="sample-nightly-rate">Per night</label><span>$<input id="sample-nightly-rate" type="number" min={0} max={9999} step={1} value={rate} onChange={e => setRate(Math.min(9999, Math.max(0, Number(e.target.value) || 0)))} /></span></div><b>{(rate * 5).toFixed(2)}</b></div>
          <div className={s.costRow}><div><strong>Private transport</strong><small>Route, mileage & driver</small></div><b>240.00</b></div>
          <div className={s.costRow}><div><strong>Experiences & extras</strong><small>Entrance fees & tour essentials</small></div><b>60.00</b></div>
          <div className={s.costTotal}><span>Total sample cost</span><strong>USD {total.toFixed(2)}</strong></div>
          <p className={s.previewHint}>Try changing the nightly rate. See the total update.</p>
        </> : step === 1 ? <div className={s.quotePreview}><div className={s.quotePhoto}><span>YOUR AGENCY</span><h4>Sri Lanka,<br />at your own pace.</h4></div><div className={s.quoteDetails}><span>YOUR PRIVATE JOURNEY</span><h4>Culture. Tea country. Coast.</h4><p>Kandy → Nuwara Eliya → Bentota → Colombo</p><ul><li>Day-by-day programme</li><li>Selected hotels & rooming</li><li>Clear inclusions & conditions</li></ul><span className={s.documentTag}>Agency-branded quotation</span></div></div> : <div className={s.bookingPreview}><div className={s.bookingLine}><span className={s.stepCircle}>1</span><div><strong>Hotel request</strong><small>Dates, rooms and agreed rates</small></div><span className={s.statusNeutral}>To request</span></div><div className={s.bookingLine}><span className={s.stepCircle}>2</span><div><strong>Confirmation & voucher</strong><small>Review, amend and issue</small></div><span className={s.statusNeutral}>To confirm</span></div><div className={s.bookingLine}><span className={s.stepCircle}>3</span><div><strong>Payments & settlement</strong><small>Quoted costs beside actual costs</small></div><span className={s.statusNeutral}>To review</span></div><p className={s.bookingNote}>The agency subscription workflow is being prepared for pilot onboarding.</p></div>}
        <div className={s.previewBottom}><span>Explore the connected workflow</span><button type="button" onClick={() => setStep((step + 1) % steps.length)}>{step === 2 ? "Back to costing" : steps[step + 1]} <span aria-hidden="true">→</span></button></div>
      </div>
    </div>
  </div>;
}
