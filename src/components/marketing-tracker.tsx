"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { PublicSiteConfig } from "@/lib/live-api";
import { captureMarketingAttribution, marketingConsentDecision, readMarketingConsent, saveMarketingConsent } from "@/lib/marketing";

function initializeGoogle(ids: string[]) {
  const tagIds = [...new Set(ids.filter(Boolean))];
  if (!tagIds.length) return;
  if (!window.gtag) { window.dataLayer = window.dataLayer || []; window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args); }; window.gtag("js", new Date()); }
  window.gtag("consent", "update", { ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
  for (const id of tagIds) window.gtag("config", id, { send_page_view: false, anonymize_ip: true });
  if (!document.querySelector("script[data-navigeto-google]")) { const script = document.createElement("script"); script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagIds[0])}`; script.dataset.navigetoGoogle = tagIds[0]; document.head.appendChild(script); }
}

function initializeGtm(id: string) {
  if (document.querySelector(`script[data-navigeto-gtm="${id}"]`)) return;
  window.dataLayer = window.dataLayer || []; window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script"); script.async = true; script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`; script.dataset.navigetoGtm = id; document.head.appendChild(script);
}

function initializeMeta(id: string) {
  if (!window.fbq) { const fbq = function (...args: unknown[]) { if (fbq.callMethod) fbq.callMethod(...args); else { fbq.queue = fbq.queue || []; fbq.queue.push(args); } } as NonNullable<Window["fbq"]>; fbq.loaded = true; fbq.version = "2.0"; fbq.queue = []; window.fbq = fbq; }
  if (!document.querySelector(`script[data-navigeto-meta="${id}"]`)) { const script = document.createElement("script"); script.async = true; script.src = "https://connect.facebook.net/en_US/fbevents.js"; script.dataset.navigetoMeta = id; document.head.appendChild(script); }
  if (document.documentElement.dataset.navigetoMetaPixel !== id) { window.fbq("init", id); document.documentElement.dataset.navigetoMetaPixel = id; }
}

export function MarketingTracker({ config }: { config: PublicSiteConfig }) {
  const pathname = usePathname();
  const [decision, setDecision] = useState<string | null>(null);
  const googleTag = config.google_tag_id || process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || null;
  const googleAdsId = config.google_ads_conversion_id || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || null;
  const googleAdsLabel = config.google_ads_conversion_label || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || null;
  const metaId = config.meta_pixel_id || process.env.NEXT_PUBLIC_META_PIXEL_ID || null;
  const consentRequired = config.marketing_consent_required !== false;
  const hasTracking = Boolean(googleTag || googleAdsId || metaId);

  useEffect(() => {
    window.__navigetoMarketingConfig = { googleTagId: googleTag, googleAdsConversionId: googleAdsId, googleAdsConversionLabel: googleAdsLabel, metaPixelId: metaId, adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL, consentRequired };
    const saved = consentRequired ? marketingConsentDecision() : "granted";
    const timer = window.setTimeout(() => setDecision(saved), 0);
    if (saved === "granted") captureMarketingAttribution(true);
    return () => window.clearTimeout(timer);
  }, [googleTag, googleAdsId, googleAdsLabel, metaId, consentRequired]);

  useEffect(() => {
    if (!hasTracking || decision !== "granted" || !readMarketingConsent(consentRequired)) return;
    const gtm = googleTag?.toUpperCase().startsWith("GTM-") ? googleTag : "";
    if (gtm) initializeGtm(gtm);
    initializeGoogle([gtm ? "" : googleTag || "", googleAdsId || ""]);
    if (metaId) initializeMeta(metaId);
    window.gtag?.("event", "page_view", { page_path: pathname, page_location: window.location.href });
    if (gtm) window.dataLayer?.push({ event: "virtual_page_view", page_path: pathname, page_location: window.location.href });
    window.fbq?.("track", "PageView");
  }, [decision, consentRequired, googleAdsId, googleTag, hasTracking, metaId, pathname]);

  if (!hasTracking || !consentRequired || decision) return null;
  const decide = (granted: boolean) => { saveMarketingConsent(granted); setDecision(granted ? "granted" : "denied"); };
  return <div className="marketing-consent" role="dialog" aria-label="Privacy and marketing choices"><div><b>Privacy choices</b><p>With your permission, Navigeto uses Google and Meta advertising tools to measure which campaigns lead to genuine travel enquiries. Essential website functions always remain available.</p></div><div className="marketing-consent-actions"><button type="button" className="button button-soft" onClick={() => decide(false)}>Decline marketing</button><button type="button" className="button button-gold" onClick={() => decide(true)}>Allow marketing</button></div></div>;
}
