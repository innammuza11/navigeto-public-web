"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { readMarketingConsent } from "@/lib/marketing";
import { showsEnquiryBar, whatsappLeadMessage, whatsappLink } from "@/lib/seo-schema";

function trackContactIntent(method: "whatsapp" | "enquiry_form") {
  const config = window.__navigetoMarketingConfig || {};
  if (!readMarketingConsent(config.consentRequired !== false)) return;
  // A click is intent, not a lead: the TravelOS reference conversion stays the only Lead event.
  window.gtag?.("event", "contact_click", { method, page_path: window.location.pathname });
  if (config.googleTagId?.toUpperCase().startsWith("GTM-")) window.dataLayer?.push({ event: "contact_click", method, page_path: window.location.pathname });
}

/** Phone-width enquiry bar: WhatsApp (prefilled with the current page) and the existing custom-trip form. */
export function EnquiryBar({ whatsappNumber }: { whatsappNumber: string }) {
  const pathname = usePathname() || "/";
  if (!showsEnquiryBar(pathname)) return null;
  const fallback = whatsappLink(whatsappNumber, whatsappLeadMessage(pathname));
  return <nav className="enquiry-bar" aria-label="Plan with Navigeto">
    <a
      className="enquiry-bar-whatsapp"
      href={fallback}
      target="_blank"
      rel="noreferrer"
      onClick={event => { event.currentTarget.href = whatsappLink(whatsappNumber, whatsappLeadMessage(pathname, document.title)); trackContactIntent("whatsapp"); }}
    >WhatsApp us</a>
    <Link className="enquiry-bar-quote" href={`/custom-trip?from=${encodeURIComponent(pathname)}`} onClick={() => trackContactIntent("enquiry_form")}>Get a free quote</Link>
  </nav>;
}
