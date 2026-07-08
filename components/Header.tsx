"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSite } from "./SiteProvider";
import { whatsappUrl } from "@/lib/format";

const baseLinks = [
  ["Flights", "/flights", "always"],
  ["Hotels", "/hotels", "hotel_enabled"],
  ["Transfers", "/transfers", "transfer_enabled"],
  ["Tours", "/tours", "tour_enabled"],
  ["Custom Trip", "/custom-trip", "always"],
  ["About", "/about", "always"],
  ["Contact", "/contact", "always"],
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { config } = useSite();
  const links = baseLinks.filter(([, , feature]) => feature === "always" || Boolean(config[feature]));
  return (
    <>
      {config.announcement_text ? <div className="announcement">{config.announcement_text}</div> : null}
      <header className="site-header">
        <div className="shell header-inner">
          <Link href="/" className="brand" onClick={() => setOpen(false)} aria-label="Navigeto home">
            <span className="brand-mark" aria-hidden="true">N</span>
            <span><strong>NAVIGETO</strong><small>TRAVELS · SRI LANKA</small></span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([label, href]) => <Link key={href} href={href} className={pathname === href || pathname.startsWith(`${href}/`) ? "active" : ""}>{label}</Link>)}
          </nav>
          <div className="header-actions">
            {config.assistant_enabled ? <Link className="button button-ghost desktop-only" href="/trip-assistant">Trip Assistant</Link> : null}
            <a className="button button-primary desktop-only" href={whatsappUrl(config.whatsapp_number, "Hi Navigeto, I would like help planning a Sri Lanka trip.")} target="_blank" rel="noreferrer">WhatsApp</a>
            <button className="menu-button" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Open navigation">{open ? "✕" : "☰"}</button>
          </div>
        </div>
        {open ? <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          {config.assistant_enabled ? <Link href="/trip-assistant" onClick={() => setOpen(false)}>Trip Assistant</Link> : null}
          <a href={whatsappUrl(config.whatsapp_number, "Hi Navigeto, I would like help planning a Sri Lanka trip.")} target="_blank" rel="noreferrer">WhatsApp Navigeto</a>
        </nav> : null}
      </header>
    </>
  );
}
