"use client";

/* eslint-disable @next/next/no-img-element */
/* The deployed Vinext image optimizer does not serve this original brand asset
   reliably, so the logo intentionally uses a direct browser request. */
import Link from "next/link";
import { useEffect, useState } from "react";
import { displayCurrencies, useCurrency } from "@/components/currency-context";
import { NaviChat } from "@/components/navi-chat";
import { MarketingTracker } from "@/components/marketing-tracker";
import { liveApi, type PublicSiteConfig } from "@/lib/live-api";
import { nav } from "@/lib/site-data";

const DEFAULT_CONFIG: PublicSiteConfig = {
  announcement_text: "Plan hotels, transfers and tours in one place.",
  whatsapp_number: "94774206166",
  tagline: "Your Sri Lanka journey, professionally handled.",
  phone: "+94 77 420 6166",
  email: "info@navigeto.com",
  office_address: "Colombo, Sri Lanka",
};

function whatsappHref(number?: string) {
  return `https://wa.me/${String(number || DEFAULT_CONFIG.whatsapp_number).replace(/\D/g, "")}`;
}

export function Header({ config = DEFAULT_CONFIG }: { config?: PublicSiteConfig }) {
  const [open, setOpen] = useState(false);
  const { currency, setCurrency, updatedAt } = useCurrency();
  return <>
    <div className="announcement"><div className="announcement-track"><span>{config.announcement_text || DEFAULT_CONFIG.announcement_text}</span><span aria-hidden="true">SRI LANKA · BEAUTIFULLY CONNECTED · WORLDWIDE</span><span aria-hidden="true">{config.announcement_text || DEFAULT_CONFIG.announcement_text}</span><span aria-hidden="true">SRI LANKA · BEAUTIFULLY CONNECTED · WORLDWIDE</span></div></div>
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" aria-label="Navigeto Travels home"><img src="/media/navigeto-logo.webp" width={2000} height={655} fetchPriority="high" decoding="async" alt="Navigeto Travels" className="brand-logo"/></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
        <div className="header-actions">
          <label className="currency-control" title={updatedAt ? `Display rates updated ${updatedAt}` : "Loading current exchange rates"}>
            <span>Currency</span>
            <select aria-label="Display currency" value={currency} onChange={(event) => setCurrency(event.target.value)}>
              {displayCurrencies.map((code) => <option key={code}>{code}</option>)}
            </select>
          </label>
          <a className="button button-primary desktop-only" href={whatsappHref(config.whatsapp_number)} target="_blank" rel="noreferrer">● WhatsApp</a>
          <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"}><span/><span/><span/></button>
        </div>
      </div>
      {open && <nav className="mobile-nav" aria-label="Mobile navigation">{nav.map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} href={href}>{label}<span>→</span></Link>)}</nav>}
    </header>
  </>;
}

export function Footer({ config = DEFAULT_CONFIG }: { config?: PublicSiteConfig }) {
  return <footer className="footer"><div className="footer-sun" aria-hidden="true"/><div className="shell footer-intro"><p className="eyebrow">Where will you go next?</p><h2>The world is waiting.<br/><em>Let&apos;s make it yours.</em></h2><Link className="button button-gold" href="/custom-trip">Begin a private journey ↗</Link></div><div className="shell footer-grid">
    <div className="footer-brand"><img src="/media/navigeto-logo.webp" width={2000} height={655} loading="lazy" decoding="async" alt="Navigeto Travels"/><p>{config.tagline || DEFAULT_CONFIG.tagline}</p><a href={whatsappHref(config.whatsapp_number)}>Chat on WhatsApp →</a></div>
    <div><h4>Book with us</h4><Link href="/hotels">Hotels</Link><Link href="/transfers">Private Transfers</Link><Link href="/tours">All Tours</Link><Link href="/custom-trip">Custom Trip</Link></div>
    <div><h4>Company</h4><Link href="/about">About Navigeto</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
    <div><h4>Partner login</h4><a href="https://admin.navigeto.com/partner/login?as=driver">Driver Login</a><a href="https://admin.navigeto.com/partner/login?as=hotel">Hotel Login</a><a href="https://admin.navigeto.com/partner/login?as=agent">Travel Agent (B2B)</a></div>
    <div><h4>Contact</h4><a href={`tel:${String(config.phone || DEFAULT_CONFIG.phone).replace(/[^+\d]/g, "")}`}>{config.phone || DEFAULT_CONFIG.phone}</a><a href={`mailto:${config.email || DEFAULT_CONFIG.email}`}>{config.email || DEFAULT_CONFIG.email}</a><span>{config.office_address || DEFAULT_CONFIG.office_address}</span></div>
  </div><div className="shell footer-bottom"><span>© 2026 Navigeto Travels (Pvt) Ltd.</span><span>Live services powered by Navigeto TravelOS Enterprise.</span></div></footer>;
}

export function SiteShell({children, hideNavi = false}:{children:React.ReactNode;hideNavi?:boolean}) {
  const [config, setConfig] = useState<PublicSiteConfig>(DEFAULT_CONFIG);
  useEffect(() => {
    let active = true;
    liveApi.siteConfig().then((value) => { if (active) setConfig({ ...DEFAULT_CONFIG, ...value }); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  return <><MarketingTracker config={config}/><Header config={config}/><main>{children}</main><Footer config={config}/>{!hideNavi && config.assistant_enabled !== false && <NaviChat/>}</>;
}
