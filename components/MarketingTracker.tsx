"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "./SiteProvider";
import {
  captureMarketingAttribution, marketingConsentDecision, readMarketingConsent, saveMarketingConsent,
} from "@/lib/marketing";

function initializeGoogle(ids: string[]) {
  const tagIds = [...new Set(ids.filter(Boolean))];
  if (!tagIds.length) return;
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args); };
    window.gtag("js", new Date());
  }
  window.gtag("consent", "update", { ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
  for (const id of tagIds) window.gtag("config", id, { send_page_view: false, anonymize_ip: true });
  const loaderId = tagIds[0];
  if (!document.querySelector("script[data-navigeto-google]")) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(loaderId)}`;
    script.dataset.navigetoGoogle = loaderId;
    document.head.appendChild(script);
  }
}

function initializeGoogleTagManager(id: string) {
  if (document.querySelector(`script[data-navigeto-gtm="${id}"]`)) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  script.dataset.navigetoGtm = id;
  document.head.appendChild(script);
}

function initializeMeta(pixelId: string) {
  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else {
        fbq.queue = fbq.queue || [];
        fbq.queue.push(args);
      }
    } as NonNullable<Window["fbq"]>;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
  }
  if (!document.querySelector(`script[data-navigeto-meta="${pixelId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.dataset.navigetoMeta = pixelId;
    document.head.appendChild(script);
  }
  if (document.documentElement.dataset.navigetoMetaPixel !== pixelId) {
    window.fbq("init", pixelId);
    document.documentElement.dataset.navigetoMetaPixel = pixelId;
  }
}

export function MarketingTracker() {
  const pathname = usePathname();
  const { config } = useSite();
  const [decision, setDecision] = useState<string | null>(null);
  const hasTracking = Boolean(config.google_tag_id || config.google_ads_conversion_id || config.meta_pixel_id);
  const consentRequired = config.marketing_consent_required !== false;

  useEffect(() => {
    window.__navigetoMarketingConfig = {
      googleTagId: config.google_tag_id,
      googleAdsConversionId: config.google_ads_conversion_id,
      googleAdsConversionLabel: config.google_ads_conversion_label,
      metaPixelId: config.meta_pixel_id,
      adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL,
      consentRequired,
    };
    const saved = consentRequired ? marketingConsentDecision() : "granted";
    const timer = window.setTimeout(() => setDecision(saved), 0);
    if (saved === "granted") captureMarketingAttribution(true);
    return () => window.clearTimeout(timer);
  }, [config, consentRequired]);

  useEffect(() => {
    if (!hasTracking || decision !== "granted" || !readMarketingConsent(consentRequired)) return;
    const configuredGoogleTag = config.google_tag_id?.trim() || "";
    const tagManagerId = configuredGoogleTag.toUpperCase().startsWith("GTM-") ? configuredGoogleTag : "";
    if (tagManagerId) initializeGoogleTagManager(tagManagerId);
    initializeGoogle([
      tagManagerId ? "" : configuredGoogleTag,
      config.google_ads_conversion_id?.trim() || "",
    ]);
    if (config.meta_pixel_id) initializeMeta(config.meta_pixel_id);
    window.gtag?.("event", "page_view", { page_path: pathname, page_location: window.location.href });
    if (tagManagerId) window.dataLayer?.push({ event: "virtual_page_view", page_path: pathname, page_location: window.location.href });
    window.fbq?.("track", "PageView");
  }, [config.google_tag_id, config.google_ads_conversion_id, config.meta_pixel_id, consentRequired, hasTracking, pathname, decision]);

  if (!hasTracking || !consentRequired || decision) return null;
  function decide(granted: boolean) {
    saveMarketingConsent(granted);
    setDecision(granted ? "granted" : "denied");
  }
  return <div className="marketing-consent" role="dialog" aria-label="Privacy and marketing choices">
    <div><b>Privacy choices</b><p>With your permission, Navigeto uses Google and Meta advertising tools to measure which campaigns lead to genuine travel enquiries. Essential website functions always remain available.</p></div>
    <div className="marketing-consent-actions"><button type="button" className="button button-ghost" onClick={() => decide(false)}>Decline marketing</button><button type="button" className="button button-primary" onClick={() => decide(true)}>Allow marketing</button></div>
  </div>;
}
