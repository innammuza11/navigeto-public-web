"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Money } from "@/components/money";

type VisaProduct = {
  id: string;
  destinationCode: string;
  destination: string;
  region?: string | null;
  flag?: string | null;
  visaType: string;
  packageName: string;
  totalEstimate: number;
  currency: string;
  governmentFeeIncluded: boolean;
  processingTime: string;
  maxStayDays?: number | null;
  entryType?: string | null;
  resultLabel: string;
  inclusions: string[];
  exclusions: string[];
  lastVerifiedAt?: string | null;
  requiredDocuments: string[];
  conditionalDocuments: { name: string; when: string }[];
  documentStatus: "officially_verified" | "profile_review_required";
  documentSourceUrl?: string | null;
  financialEvidenceGuidance: string;
};
type VisaCountry = {
  code: string;
  name: string;
  region?: string | null;
  flag?: string | null;
  productCount: number;
  fromPrice?: number | null;
  currency?: string | null;
  products: VisaProduct[];
};
type PortalDocument = {
  id: string;
  name: string;
  status: string;
  uploaded: boolean;
  verified: boolean;
  actionRequired: boolean;
  replacementReason: string | null;
};
type PortalData = {
  application: {
    id: string;
    reference: string;
    destination: string;
    visaType: string;
    status: string;
    uploadAllowed: boolean;
    linkExpiresAt: string | null;
  };
  documents: PortalDocument[];
  passportExtraction: {
    id: string;
    status: "processing" | "needs_review" | "confirmed" | "failed";
    extraction_json: Record<string, string | number | string[] | null>;
    confidence_score: number | null;
    fields_requiring_review: string[];
    error_message: string | null;
  } | null;
};
type VisaIntakeResult = { application?: { uploadToken?: string } | null };
const EXTRA_DOCUMENT_OPTIONS = [
  "Passport bio-data page",
  "Current passport additional pages",
  "Previous passport and previous visas",
  "Passport-style photograph",
  "Cover letter and travel plan",
  "Flight reservation or travel itinerary",
  "Hotel booking or accommodation evidence",
  "Invitation letter and host documents",
  "Travel medical insurance",
  "Personal bank statements",
  "Bank balance confirmation letter",
  "Sponsor letter and sponsor financial evidence",
  "Employment letter and approved leave",
  "Salary slips and EPF evidence",
  "Business registration and company financial evidence",
  "Student letter and approved leave",
  "Civil-status and family-tie documents",
  "Property, asset or home-country tie evidence",
  "Minor applicant birth certificate and parental consent",
  "VFS or embassy form, declaration or appointment letter",
  "Additional supporting document",
];

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false)
    throw new Error(
      result.error || "The Visa service is temporarily unavailable.",
    );
  return (result.data ?? result) as T;
}

export function VisaStorefront() {
  const [countries, setCountries] = useState<VisaCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState<VisaCountry | null>(
    null,
  );
  const [selected, setSelected] = useState<VisaProduct | null>(null);
  useEffect(() => {
    jsonRequest<{ countries: VisaCountry[] }>("/api/visa/catalog")
      .then((data) => setCountries(data.countries || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  const regions = useMemo(
    () => [
      "All",
      ...new Set(
        countries.map((item) => item.region).filter(Boolean) as string[],
      ),
    ],
    [countries],
  );
  const visible = useMemo(
    () =>
      countries.filter(
        (item) =>
          (region === "All" || item.region === region) &&
          `${item.name} ${item.products.map((product) => `${product.packageName} ${product.visaType}`).join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [countries, query, region],
  );
  return (
    <>
      <section className="visa-commerce-hero">
        <div className="shell visa-commerce-hero-inner">
          <div>
            <p className="eyebrow">
              Navigeto Visa · secure digital applications
            </p>
            <h1>
              Your visa journey,
              <br />
              <em>beautifully organised.</em>
            </h1>
            <p>
              Compare published Visa services, understand the verified
              checklist, submit your application and upload every document
              through one protected workspace.
            </p>
            <a className="button button-gold" href="#visa-catalogue">
              Explore Visa services →
            </a>
          </div>
          <div className="visa-trust-panel">
            <b>Built around verified requirements</b>
            <span>✓ Live TravelOS Visa products</span>
            <span>✓ Private document handling</span>
            <span>✓ Human verification before submission</span>
            <span>✓ Application progress in one place</span>
          </div>
        </div>
      </section>
      <section className="shell visa-catalogue" id="visa-catalogue">
        <div className="visa-catalogue-head">
          <div>
            <p className="eyebrow">Published Visa catalogue</p>
            <h2>Choose where you&apos;re going.</h2>
            <p>
              Only active services from the Navigeto Visa Master appear here.
            </p>
          </div>
          <div className="visa-search">
            <input
              aria-label="Search Visa services"
              placeholder="Search destination or Visa type"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              aria-label="Filter by region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              {regions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
        {loading && (
          <div className="visa-loading">Loading published Visa services…</div>
        )}
        {error && <div className="notice">{error}</div>}
        {!loading && !error && !visible.length && (
          <div className="empty-state">
            <h3>No published Visa service matches.</h3>
            <p>
              Try another destination or contact our Visa desk for a verified
              review.
            </p>
          </div>
        )}
        <div className="visa-product-grid">
          {visible.map((item) => (
            <article
              className="visa-product-card visa-country-card"
              key={item.code}
            >
              <div className="visa-product-top">
                <span>{item.flag || item.code}</span>
                <small>{item.region || "International"}</small>
              </div>
              <p className="eyebrow">
                {item.productCount} Visa{" "}
                {item.productCount === 1 ? "option" : "options"}
              </p>
              <h3>{item.name}</h3>
              <p className="visa-country-copy">
                Compare every published Visa type, duration and entry option for
                this country.
              </p>
              <div className="visa-product-price">
                <div>
                  <small>Selling prices</small>
                  {item.fromPrice != null && item.currency ? (
                    <>
                      <em>From</em>
                      <Money value={item.fromPrice} currency={item.currency} />
                    </>
                  ) : (
                    <b>View available rates</b>
                  )}
                </div>
                <button
                  className="button button-primary"
                  onClick={() => setSelectedCountry(item)}
                >
                  View Visa rates
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="visa-process">
        <div className="shell">
          <p className="eyebrow">Clear from start to decision</p>
          <h2>A VFS-style process, with Navigeto beside you.</h2>
          <div>
            {[
              [
                "01",
                "Choose",
                "Select a published Visa product and review its service scope.",
              ],
              [
                "02",
                "Check",
                "Answer eligibility questions against the verified rules.",
              ],
              [
                "03",
                "Upload",
                "Use your private checklist to send each requested document.",
              ],
              [
                "04",
                "Verify",
                "Navigeto reviews, requests corrections and prepares submission.",
              ],
              [
                "05",
                "Track",
                "Return to your protected workspace for progress updates.",
              ],
            ].map(([n, t, c]) => (
              <article key={n}>
                <b>{n}</b>
                <h3>{t}</h3>
                <p>{c}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      {selectedCountry && !selected && (
        <VisaCountryRates
          country={selectedCountry}
          close={() => setSelectedCountry(null)}
          apply={(product) => setSelected(product)}
        />
      )}
      {selected && (
        <VisaApplicationModal
          product={selected}
          close={() => setSelected(null)}
        />
      )}
    </>
  );
}

function ChecklistView({ product }: { product: VisaProduct }) {
  if (product.documentStatus !== "officially_verified")
    return (
      <p>
        The Visa desk will verify the current VFS, embassy or immigration
        checklist before requesting final documents. A generic list is not
        presented as an official requirement.
      </p>
    );
  return (
    <>
      <h4>Required for every applicant</h4>
      <ul>
        {product.requiredDocuments.map((document) => (
          <li key={document}>✓ {document}</li>
        ))}
      </ul>
      {product.conditionalDocuments?.length > 0 && (
        <>
          <h4>Upload if this applies to you</h4>
          <ul>
            {product.conditionalDocuments.map((document) => (
              <li key={document.name}>
                <span>○ {document.name}</span>
                <small>{document.when}</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function VisaCountryRates({
  country,
  close,
  apply,
}: {
  country: VisaCountry;
  close: () => void;
  apply: (product: VisaProduct) => void;
}) {
  return (
    <div
      className="visa-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${country.name} Visa rates`}
    >
      <div className="visa-country-rates">
        <button
          type="button"
          className="visa-modal-close"
          onClick={close}
          aria-label="Close"
        >
          ×
        </button>
        <header>
          <span>{country.flag || country.code}</span>
          <div>
            <p className="eyebrow">Published selling prices</p>
            <h2>{country.name} Visa options</h2>
            <p>
              Select the Visa type that matches your journey. Government, VFS
              and third-party charges may be separate. Document and financial
              requirements depend on the applicant profile and are confirmed
              against the official authority checklist.
            </p>
          </div>
        </header>
        <div className="visa-rate-list">
          {country.products.map((product) => (
            <article key={product.id}>
              <div className="visa-rate-main">
                <p className="eyebrow">{product.resultLabel}</p>
                <h3>{product.packageName}</h3>
                <div className="visa-rate-facts">
                  <span>
                    <small>Processing</small>
                    {product.processingTime}
                  </span>
                  <span>
                    <small>Entry</small>
                    {product.entryType || product.visaType}
                  </span>
                  {product.maxStayDays && (
                    <span>
                      <small>Maximum stay</small>
                      {product.maxStayDays} days
                    </span>
                  )}
                </div>
                <div
                  className={`visa-document-guidance ${product.documentStatus}`}
                >
                  <b>
                    {product.documentStatus === "officially_verified"
                      ? "Official document checklist"
                      : "Applicant-specific checklist review"}
                  </b>
                  <ChecklistView product={product} />
                  <p>
                    <strong>Financial evidence:</strong>{" "}
                    {product.financialEvidenceGuidance}
                  </p>
                  {product.documentSourceUrl && (
                    <a
                      href={product.documentSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View official requirement source ↗
                    </a>
                  )}
                </div>
              </div>
              <div className="visa-rate-action">
                <small>Navigeto selling price</small>
                <Money
                  value={product.totalEstimate}
                  currency={product.currency}
                />
                <em>
                  {product.governmentFeeIncluded
                    ? "Government fee included"
                    : "Government / VFS fees may be separate"}
                </em>
                <button
                  className="button button-primary"
                  onClick={() => apply(product)}
                >
                  Apply Visa →
                </button>
                <span className="visa-upload-next">
                  Secure document upload opens immediately after application.
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisaApplicationModal({
  product,
  close,
}: {
  product: VisaProduct;
  close: () => void;
}) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    travelDate: "",
    stayDays: "14",
    purpose: "tourism",
    previousRefusal: "no",
    travelerType: "adult",
    fundingType: "self_funded",
    employmentStatus: "employed",
    accommodationType: "hotel",
    customerNotes: "",
    consentGranted: false,
  });
  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const data = await jsonRequest<VisaIntakeResult>("/api/visa/intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          createApplication: true,
          passportCountryIso2: "LK",
          destinationCountryIso2: product.destinationCode,
          passportType: "ordinary",
          visaType: product.visaType,
          stayDays: Number(form.stayDays),
          channel: "www.navigeto.com",
          customerNotes: `${form.customerNotes}\nSelected product: ${product.packageName} (${product.id})\nPrevious refusal: ${form.previousRefusal}`,
        }),
      });
      const token = data.application?.uploadToken;
      if (!token)
        throw new Error(
          "Your application was created, but the secure upload link could not be opened.",
        );
      window.location.replace(
        `/visas/application/${encodeURIComponent(token)}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Application could not be submitted.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div
      className="visa-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Apply for ${product.destination}`}
    >
      <form className="visa-apply-card" onSubmit={submit}>
        <button
          type="button"
          className="visa-modal-close"
          onClick={close}
          aria-label="Close"
        >
          ×
        </button>
        <div className="visa-apply-summary">
          <span>{product.flag || product.destinationCode}</span>
          <div>
            <p className="eyebrow">{product.destination}</p>
            <h2>{product.packageName}</h2>
            <Money value={product.totalEstimate} currency={product.currency} />
          </div>
        </div>
        <div className="mini-progress">
          <span style={{ width: `${step * 25}%` }} />
        </div>
        {error && <div className="notice">{error}</div>}
        {step === 1 && (
          <div className="visa-form-step">
            <p className="eyebrow">Step 1 of 4 · service</p>
            <h3>Review your Visa service</h3>
            <div className="visa-scope">
              <div>
                <b>Included</b>
                {product.inclusions.map((item) => (
                  <span key={item}>✓ {item}</span>
                ))}
              </div>
              <div>
                <b>Not included</b>
                {product.exclusions.map((item) => (
                  <span key={item}>— {item}</span>
                ))}
              </div>
            </div>
            <div className={`visa-document-guidance ${product.documentStatus}`}>
              <b>
                {product.documentStatus === "officially_verified"
                  ? "Document checklist"
                  : "Document review required"}
              </b>
              <ChecklistView product={product} />
              <p>
                <strong>Financial evidence:</strong>{" "}
                {product.financialEvidenceGuidance}
              </p>
            </div>
            <p className="visa-disclaimer">
              Visa issuance is decided only by the relevant authority. Navigeto
              verifies documents and assists with the application; approval is
              never guaranteed.
            </p>
          </div>
        )}
        {step === 2 && (
          <div className="visa-form-step">
            <p className="eyebrow">Step 2 of 4 · journey and profile</p>
            <h3>Tell us about your trip</h3>
            <div className="form-grid">
              <label>
                Purpose
                <select
                  value={form.purpose}
                  onChange={(e) => set("purpose", e.target.value)}
                >
                  <option value="tourism">Tourism</option>
                  <option value="business">Business</option>
                  <option value="family_visit">Visit family</option>
                  <option value="transit">Transit</option>
                </select>
              </label>
              <label>
                Intended travel date
                <input
                  required
                  type="date"
                  value={form.travelDate}
                  onChange={(e) => set("travelDate", e.target.value)}
                />
              </label>
              <label>
                Length of stay
                <input
                  required
                  min="1"
                  max="3650"
                  type="number"
                  value={form.stayDays}
                  onChange={(e) => set("stayDays", e.target.value)}
                />
              </label>
              <label>
                Applicant
                <select
                  value={form.travelerType}
                  onChange={(e) => set("travelerType", e.target.value)}
                >
                  <option value="adult">Adult</option>
                  <option value="minor">Child under 18</option>
                </select>
              </label>
              <label>
                Trip funding
                <select
                  value={form.fundingType}
                  onChange={(e) => set("fundingType", e.target.value)}
                >
                  <option value="self_funded">Self-funded</option>
                  <option value="sponsored">Sponsored by another person</option>
                </select>
              </label>
              <label>
                Current status
                <select
                  value={form.employmentStatus}
                  onChange={(e) => set("employmentStatus", e.target.value)}
                >
                  <option value="employed">Employed</option>
                  <option value="self_employed">
                    Self-employed / business owner
                  </option>
                  <option value="student">Student</option>
                  <option value="retired">Retired</option>
                  <option value="unemployed">Not employed</option>
                </select>
              </label>
              <label>
                Accommodation
                <select
                  value={form.accommodationType}
                  onChange={(e) => set("accommodationType", e.target.value)}
                >
                  <option value="hotel">Hotel / paid accommodation</option>
                  <option value="host">Staying with family or host</option>
                </select>
              </label>
              <label>
                Previous refusal?
                <select
                  value={form.previousRefusal}
                  onChange={(e) => set("previousRefusal", e.target.value)}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="visa-form-step">
            <p className="eyebrow">Step 3 of 4 · applicant</p>
            <h3>Your contact details</h3>
            <div className="form-grid">
              <label>
                Full name as in passport
                <input
                  required
                  value={form.customerName}
                  onChange={(e) => set("customerName", e.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => set("customerEmail", e.target.value)}
                />
              </label>
              <label>
                WhatsApp / mobile
                <input
                  required
                  value={form.customerPhone}
                  onChange={(e) => set("customerPhone", e.target.value)}
                  placeholder="+94"
                />
              </label>
              <label>
                Additional notes
                <textarea
                  value={form.customerNotes}
                  onChange={(e) => set("customerNotes", e.target.value)}
                  rows={3}
                />
              </label>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="visa-form-step">
            <p className="eyebrow">Step 4 of 4 · consent</p>
            <h3>Submit for verification</h3>
            <div className="visa-review">
              <span>
                <b>Destination</b>
                {product.destination}
              </span>
              <span>
                <b>Applicant</b>
                {form.customerName}
              </span>
              <span>
                <b>Travel date</b>
                {form.travelDate}
              </span>
              <span>
                <b>Selling price</b>
                {product.currency} {product.totalEstimate.toLocaleString()}
              </span>
            </div>
            <label className="visa-consent">
              <input
                required
                type="checkbox"
                checked={form.consentGranted}
                onChange={(e) => set("consentGranted", e.target.checked)}
              />
              <span>
                I consent to Navigeto securely processing my personal and travel
                documents for Visa assessment and understand that fees and
                eligibility are reverified before submission.
              </span>
            </label>
          </div>
        )}
        <div className="form-nav">
          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              className="button button-gold"
              onClick={() => setStep(step + 1)}
            >
              Continue →
            </button>
          ) : (
            <button
              disabled={submitting || !form.consentGranted}
              className="button button-gold"
              type="submit"
            >
              {submitting
                ? "Opening secure document upload…"
                : "Apply Visa & upload documents →"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function PassportExtractionReview({ data, token, refresh }: { data: PortalData; token: string; refresh: () => Promise<unknown> }) {
  const extraction = data.passportExtraction;
  const values = extraction?.extraction_json || {};
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    passportHolderName: String(values.passport_holder_name || ""),
    passportNumber: String(values.passport_number || ""),
    passportNationality: String(values.passport_nationality || values.passport_country || ""),
    passportDateOfBirth: String(values.passport_date_of_birth || ""),
    passportSex: String(values.passport_sex || ""),
    passportIssueDate: String(values.passport_issue_date || ""),
    passportExpiry: String(values.passport_expiry || ""),
  });
  const [error, setError] = useState("");
  if (!extraction) return null;
  if (extraction.status === "processing") return <div className="visa-passport-review"><b>Reading passport details…</b><p>Secure OCR is checking the passport bio-data page. Refresh shortly if this message remains.</p></div>;
  if (extraction.status === "failed") return <div className="visa-passport-review"><b>Enter passport details manually</b><p>{extraction.error_message || "The passport could not be read automatically. Navigeto will verify it manually."}</p></div>;
  if (extraction.status === "confirmed") return <div className="visa-passport-review confirmed"><b>Passenger passport details confirmed ✓</b><p>Navigeto will still verify the uploaded passport before submission.</p></div>;
  const set = (name: keyof typeof form, value: string) => setForm((current) => ({ ...current, [name]: value }));
  async function confirm() {
    setSaving(true); setError("");
    try {
      await jsonRequest(`/api/visa/intake/${data.application.id}/passport/confirm`, { method: "POST", headers: { "content-type": "application/json", "x-visa-intake-token": token }, body: JSON.stringify(form) });
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Passport details could not be confirmed."); }
    finally { setSaving(false); }
  }
  return <div className="visa-passport-review"><div><b>Confirm passenger details read from passport</b><p>Check every character. OCR suggestions are never saved until you confirm them.</p></div>{error && <div className="notice">{error}</div>}<div className="form-grid"><label>Full name<input value={form.passportHolderName} onChange={(e) => set("passportHolderName", e.target.value)}/></label><label>Passport number<input value={form.passportNumber} onChange={(e) => set("passportNumber", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}/></label><label>Nationality<input value={form.passportNationality} onChange={(e) => set("passportNationality", e.target.value)}/></label><label>Date of birth<input type="date" value={form.passportDateOfBirth} onChange={(e) => set("passportDateOfBirth", e.target.value)}/></label><label>Sex<input value={form.passportSex} onChange={(e) => set("passportSex", e.target.value)}/></label><label>Issue date<input type="date" value={form.passportIssueDate} onChange={(e) => set("passportIssueDate", e.target.value)}/></label><label>Expiry date<input type="date" value={form.passportExpiry} onChange={(e) => set("passportExpiry", e.target.value)}/></label></div><button type="button" className="button button-gold" disabled={saving} onClick={() => void confirm()}>{saving ? "Saving…" : "Confirm passenger details"}</button></div>;
}

export function VisaDocumentPortal({ token }: { token: string }) {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState("");
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [extraDocument, setExtraDocument] = useState(EXTRA_DOCUMENT_OPTIONS[0]);
  const [customDocument, setCustomDocument] = useState("");
  const refresh = useCallback(
    () =>
      jsonRequest<PortalData>(`/api/visa/portal/${encodeURIComponent(token)}`, {
        cache: "no-store",
      }).then(setData),
    [token],
  );
  useEffect(() => {
    refresh()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refresh]);
  async function upload(document: PortalDocument, file: File) {
    if (!data) return;
    setUploading(document.id);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      await jsonRequest(
        `/api/visa/intake/${data.application.id}/documents/${document.id}`,
        { method: "PATCH", headers: { "x-visa-intake-token": token }, body },
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading("");
    }
  }
  async function addDocument() {
    if (!data) return;
    const documentName =
      extraDocument === "Additional supporting document"
        ? customDocument
        : extraDocument;
    if (!documentName.trim()) {
      setError("Enter a name for the additional document.");
      return;
    }
    setAdding(true);
    setError("");
    try {
      await jsonRequest(`/api/visa/intake/${data.application.id}/documents`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-visa-intake-token": token,
        },
        body: JSON.stringify({ documentName }),
      });
      setCustomDocument("");
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Document could not be added.",
      );
    } finally {
      setAdding(false);
    }
  }
  async function submitDocuments() {
    if (!data) return;
    setSubmitting(true);
    setError("");
    try {
      await jsonRequest(`/api/visa/intake/${data.application.id}/submit`, {
        method: "POST",
        headers: { "x-visa-intake-token": token },
      });
      setSubmitted(true);
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Documents could not be submitted for verification.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  const canSubmit =
    data &&
    (data.application.status === "new" ||
      data.application.status === "docs_pending");
  return (
    <main className="visa-portal-page">
      <section className="shell visa-portal">
        <div className="visa-portal-header">
          <p className="eyebrow">Application received · next step</p>
          <h1>
            {data
              ? `Upload documents · ${data.application.reference}`
              : "Upload your Visa documents"}
          </h1>
          <p>
            Your Visa application is ready. Upload each checklist document now,
            then submit the completed file set to the Navigeto Visa desk for
            verification.
          </p>
        </div>
        {loading && (
          <div className="visa-loading">Opening your secure checklist…</div>
        )}
        {error && <div className="notice">{error}</div>}
        {submitted && (
          <div className="visa-submit-success">
            <b>Documents submitted for verification ✓</b>
            <p>
              The Navigeto Visa desk will review your files and contact you if
              anything must be replaced or added.
            </p>
          </div>
        )}
        {data && (
          <>
            <div className="visa-status-row">
              <span>
                <small>Destination</small>
                {data.application.destination}
              </span>
              <span>
                <small>Visa type</small>
                {data.application.visaType}
              </span>
              <span>
                <small>Status</small>
                {data.application.status.replaceAll("_", " ")}
              </span>
            </div>
            <PassportExtractionReview data={data} token={token} refresh={refresh} />
            <div className="visa-document-list">
              <div>
                <h2>Document checklist</h2>
                <p>JPEG, PNG, WEBP or PDF · maximum 10MB each.</p>
              </div>
              {!data.documents.length && (
                <div className="visa-empty-checklist">
                  No upload slots are listed yet. Add the first supporting
                  document below to begin.
                </div>
              )}
              {data.documents.map((document) => (
                <article key={document.id}>
                  <div>
                    <b>{document.name}</b>
                    <span>
                      {document.verified
                        ? "Verified ✓"
                        : document.uploaded
                          ? "Received for review"
                          : document.actionRequired
                            ? "Replacement required"
                            : "Waiting for upload"}
                    </span>
                    {document.replacementReason && (
                      <em>{document.replacementReason}</em>
                    )}
                  </div>
                  {!document.verified && data.application.uploadAllowed && (
                    <label className="button button-primary">
                      {uploading === document.id
                        ? "Uploading…"
                        : document.uploaded
                          ? "Replace file"
                          : "Choose file"}
                      <input
                        hidden
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        disabled={Boolean(uploading)}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void upload(document, file);
                          event.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </article>
              ))}
            </div>
            {data.application.uploadAllowed && (
              <div className="visa-add-document">
                <div>
                  <b>Upload another supporting document</b>
                  <p>
                    Add every item requested by VFS, the embassy or your Visa
                    consultant.
                  </p>
                </div>
                <select
                  aria-label="Additional document type"
                  value={extraDocument}
                  onChange={(event) => setExtraDocument(event.target.value)}
                >
                  {EXTRA_DOCUMENT_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                {extraDocument === "Additional supporting document" && (
                  <input
                    aria-label="Custom document name"
                    placeholder="Enter document name"
                    value={customDocument}
                    onChange={(event) => setCustomDocument(event.target.value)}
                  />
                )}
                <button
                  className="button button-primary"
                  type="button"
                  disabled={adding}
                  onClick={() => void addDocument()}
                >
                  {adding ? "Adding…" : "Add upload slot"}
                </button>
              </div>
            )}
            {canSubmit && !submitted && (
              <div className="visa-submit-documents">
                <div>
                  <b>Finished uploading?</b>
                  <p>
                    Every checklist item must have a file before you can submit
                    it for verification.
                  </p>
                </div>
                <button
                  className="button button-gold"
                  type="button"
                  disabled={submitting}
                  onClick={() => void submitDocuments()}
                >
                  {submitting
                    ? "Submitting…"
                    : "Submit documents for verification →"}
                </button>
              </div>
            )}
            <div className="visa-security-note">
              <b>Your documents stay private.</b>
              <p>
                This page uses a time-limited, application-specific access link.
                Never forward it to anyone outside your application.
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
