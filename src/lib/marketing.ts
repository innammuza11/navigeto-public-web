import type { MarketingAttribution } from "./marketing-types";

const CONSENT_KEY = "navigeto_marketing_consent";
const ATTRIBUTION_KEY = "navigeto_marketing_attribution";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string };
    __navigetoMarketingConfig?: {
      googleTagId?: string | null;
      googleAdsConversionId?: string | null;
      googleAdsConversionLabel?: string | null;
      metaPixelId?: string | null;
      adminUrl?: string | null;
      consentRequired?: boolean;
    };
  }
}

export function readMarketingConsent(required = true) {
  if (!required) return true;
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CONSENT_KEY) === "granted";
}

export function marketingConsentDecision() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CONSENT_KEY);
}

export function saveMarketingConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  if (granted) captureMarketingAttribution(true);
}

export function captureMarketingAttribution(force = false): MarketingAttribution {
  if (typeof window === "undefined") return {};
  const required = window.__navigetoMarketingConfig?.consentRequired !== false;
  if (!force && !readMarketingConsent(required)) return {};
  const params = new URLSearchParams(window.location.search);
  let stored: MarketingAttribution = {};
  try { stored = JSON.parse(window.localStorage.getItem(ATTRIBUTION_KEY) || "{}"); } catch { stored = {}; }
  const current: MarketingAttribution = {
    source: params.get("utm_source") || stored.source || null,
    medium: params.get("utm_medium") || stored.medium || null,
    campaign: params.get("utm_campaign") || stored.campaign || null,
    term: params.get("utm_term") || stored.term || null,
    content: params.get("utm_content") || stored.content || null,
    gclid: params.get("gclid") || stored.gclid || null,
    fbclid: params.get("fbclid") || stored.fbclid || null,
    landing_page: stored.landing_page || `${window.location.origin}${window.location.pathname}`,
    referrer: stored.referrer || document.referrer || null,
    consent_granted: true,
  };
  window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(current));
  return current;
}

export function trackTravelosConversion(input: { sourceRef: string; value?: number | null; currency?: string | null }) {
  if (typeof window === "undefined") return;
  const config = window.__navigetoMarketingConfig || {};
  const consentGranted = readMarketingConsent(config.consentRequired !== false);
  const eventId = `travelos:${input.sourceRef}:Lead`;
  const attribution = consentGranted ? captureMarketingAttribution() : {};
  const payload = { event_id: eventId, transaction_id: eventId, value: input.value ?? 0, currency: input.currency || "USD" };
  if (consentGranted && window.gtag) window.gtag("event", "generate_lead", { ...payload, ...(config.googleAdsConversionId && config.googleAdsConversionLabel ? { send_to: `${config.googleAdsConversionId}/${config.googleAdsConversionLabel}` } : {}) });
  if (consentGranted && config.googleTagId?.toUpperCase().startsWith("GTM-") && !(config.googleAdsConversionId && config.googleAdsConversionLabel)) window.dataLayer?.push({ event: "generate_lead", ...payload });
  if (consentGranted && window.fbq) window.fbq("track", "Lead", { value: input.value ?? 0, currency: input.currency || "USD" }, { eventID: eventId });
  const adminUrl = String(config.adminUrl || process.env.NEXT_PUBLIC_ADMIN_URL || "").replace(/\/$/, "");
  if (!adminUrl) return;
  void fetch(`${adminUrl}/api/marketing/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event_id: eventId, event_name: "Lead", source_ref: input.sourceRef, event_source_url: window.location.href, value: input.value ?? null, currency: input.currency || null, consent_granted: consentGranted, attribution }), keepalive: true }).catch(() => undefined);
}
