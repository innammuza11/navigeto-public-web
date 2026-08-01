"use client";

import { useEffect, useMemo, useState } from "react";
import { listVisaDestinations, checkVisa, type VisaListItem, type VisaCheckResult } from "@/lib/visa";
import "./visa-checker.css";

const PURPOSES: Array<{ value: string; label: string }> = [
  { value: "tourism", label: "Tourism" },
  { value: "business", label: "Business" },
  { value: "family_visit", label: "Family visit" },
  { value: "transit", label: "Transit" },
];

const GOOD_RESULTS = new Set(["visa_free", "evisa", "visa_on_arrival", "eta"]);

function toText(item: unknown): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const o = item as Record<string, unknown>;
    return String(o.name || o.label || o.title || o.text || o.description || "").trim();
  }
  return "";
}

function money(amount: number | null | undefined, currency: string | null | undefined): string | null {
  if (amount == null) return null;
  try {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: currency || "LKR", maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency || "LKR"} ${Math.round(amount).toLocaleString()}`;
  }
}

const REQUIREMENT_LABELS: Array<{ key: keyof NonNullable<VisaCheckResult["requirements"]>; label: string }> = [
  { key: "appointment", label: "Appointment" },
  { key: "biometrics", label: "Biometrics" },
  { key: "interview", label: "Interview" },
  { key: "insurance", label: "Travel insurance" },
  { key: "return_ticket", label: "Return ticket" },
  { key: "proof_of_funds", label: "Proof of funds" },
  { key: "hotel_booking", label: "Hotel booking" },
];

export function VisaChecker({
  requestHref = "/visas/apply",
  specialistHref = "/contact",
  passportName = "Sri Lanka",
}: {
  requestHref?: string;
  specialistHref?: string;
  passportName?: string;
}) {
  const [destinations, setDestinations] = useState<VisaListItem[]>([]);
  const [destination, setDestination] = useState("");
  const [purpose, setPurpose] = useState("tourism");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VisaCheckResult | null>(null);

  useEffect(() => {
    listVisaDestinations()
      .then((rows) => {
        setDestinations(rows);
        if (rows.length && !destination) setDestination(rows[0].destination_iso2);
      })
      .catch(() => setError("We couldn't load the visa destinations right now. Please try again shortly."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!destination) return;
    setLoading(true); setError(""); setResult(null);
    try {
      setResult(await checkVisa(destination, purpose));
    } catch (err) {
      setError(err instanceof Error ? err.message : "The visa check failed. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  const activeReqs = useMemo(() => {
    if (!result?.requirements) return [];
    return REQUIREMENT_LABELS.filter((r) => result.requirements?.[r.key]);
  }, [result]);

  const isGood = result?.visa_result ? GOOD_RESULTS.has(result.visa_result) : false;
  const fee = result ? money(result.total_fee_amount ?? result.fee_amount, result.total_fee_currency ?? result.fee_currency) : null;
  const docs = (result?.documents_required || []).map(toText).filter(Boolean);
  const warnings = (result?.warnings || []).map(toText).filter(Boolean);

  return (
    <div className="vc">
      <form className="vc-form" onSubmit={submit}>
        <div className="vc-field">
          <label>Destination</label>
          <select className="vc-select" value={destination} onChange={(e) => setDestination(e.target.value)}>
            {destinations.length === 0 ? <option value="">Loading destinations…</option> : null}
            {destinations.map((d) => (
              <option key={d.destination_iso2} value={d.destination_iso2}>
                {d.flag ? `${d.flag} ` : ""}{d.destination_name}
              </option>
            ))}
          </select>
        </div>
        <div className="vc-field">
          <label>Passport</label>
          <select className="vc-select" value="LK" disabled>
            <option value="LK">{passportName}</option>
          </select>
        </div>
        <div className="vc-field">
          <label>Purpose</label>
          <select className="vc-select" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <button className="vc-btn" type="submit" disabled={loading || !destination}>
          {loading ? "Checking…" : "Check requirements"}
        </button>
      </form>

      {error ? <div className="vc-error">{error}</div> : null}

      {loading && !result ? (
        <div className="vc-loading"><span className="vc-spinner" />Checking the live Navigeto visa rules…</div>
      ) : null}

      {result ? (
        result.found ? (
          <div className="vc-result">
            <div className="vc-result-head">
              {result.destination?.flag ? <span className="vc-flag">{result.destination.flag}</span> : null}
              <div>
                <h3>{result.result_label || "Visa requirement"}</h3>
                <p className="vc-route">{passportName} passport → {result.destination?.name}</p>
              </div>
              <span className={`vc-pill ${isGood ? "good" : "warn"}`}>{isGood ? "Straightforward" : "Requires application"}</span>
            </div>

            <div className="vc-result-body">
              <div className="vc-facts">
                <div className="vc-fact fee">
                  <small>Government / e-visa fee</small>
                  {fee ? <b>{fee}</b> : <b>On request</b>}
                  {!fee ? <span>Fee confirmed by our visa desk for this route.</span> : null}
                </div>
                <div className="vc-fact">
                  <small>Processing time</small>
                  <b style={{ fontSize: 18 }}>{result.processing_time_text ? "" : "On request"}</b>
                  {result.processing_time_text ? <span>{result.processing_time_text}</span> : null}
                </div>
                <div className="vc-fact">
                  <small>Stay / entry</small>
                  <b style={{ fontSize: 18 }}>{result.max_stay_days ? `Up to ${result.max_stay_days} days` : "As granted"}</b>
                  {result.entry_type ? <span>{String(result.entry_type).replace(/_/g, " ")}</span> : null}
                </div>
              </div>

              {result.customer_summary ? (
                <div className="vc-block"><h4>What this means</h4><p className="vc-summary">{result.customer_summary}</p></div>
              ) : null}

              {activeReqs.length ? (
                <div className="vc-block">
                  <h4>Also required</h4>
                  <div className="vc-checks">
                    {activeReqs.map((r) => (
                      <span className="vc-check" key={r.key}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        {r.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {docs.length ? (
                <div className="vc-block">
                  <h4>Documents you&apos;ll need</h4>
                  <ul className="vc-docs">{docs.slice(0, 10).map((d, i) => <li key={i}>{d}</li>)}</ul>
                </div>
              ) : null}

              {warnings.length ? (
                <div className="vc-warn-box"><b>Good to know</b>{warnings.slice(0, 3).join(" ")}</div>
              ) : null}

              <div className="vc-actions">
                <a className="vc-cta primary" href={`${requestHref}?destination=${result.destination?.iso2 || ""}`}>Request visa assistance</a>
                {result.official_application_url ? (
                  <a className="vc-cta ghost" href={result.official_application_url} target="_blank" rel="noreferrer">Official portal</a>
                ) : (
                  <a className="vc-cta ghost" href={specialistHref}>Talk to a specialist</a>
                )}
                <p className="vc-disclaimer">Requirements are verified by Navigeto&apos;s visa team; final approval always rests with the issuing authority.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="vc-result">
            <div className="vc-result-head">
              {result.destination?.flag ? <span className="vc-flag">{result.destination.flag}</span> : null}
              <div>
                <h3>Let our visa desk confirm this</h3>
                <p className="vc-route">{passportName} passport → {result.destination?.name}</p>
              </div>
            </div>
            <div className="vc-result-body">
              <p className="vc-summary">{result.message || "We don't have a published rule for this route yet — our visa team will confirm the requirement and fee for you."}</p>
              <div className="vc-actions">
                <a className="vc-cta primary" href={`${requestHref}?destination=${result.destination?.iso2 || ""}`}>Request visa assistance</a>
                <a className="vc-cta ghost" href={specialistHref}>Talk to a specialist</a>
              </div>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}

export default VisaChecker;
