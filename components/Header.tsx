"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSite } from "./SiteProvider";
import { whatsappUrl } from "@/lib/format";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  PlaneIcon, HotelIcon, TourIcon, HolidayIcon, VisaIcon, TransferIcon, CorporateIcon, CustomTripIcon,
  WhatsappIcon, AccountIcon, MenuIcon, CloseIcon,
} from "./icons";

const baseLinks = [
  ["Flights", "/flights", "always", PlaneIcon],
  ["Hotels", "/hotels", "hotel_enabled", HotelIcon],
  ["Tours", "/tours", "tour_enabled", TourIcon],
  ["Holidays", "/holidays", "always", HolidayIcon],
  ["Visas", "/visas", "always", VisaIcon],
  ["Transfers", "/transfers", "transfer_enabled", TransferIcon],
  ["Custom Trip", "/custom-trip", "always", CustomTripIcon],
  ["Corporate", "/corporate", "always", CorporateIcon],
] as const;

const utilityLinks = [
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { config } = useSite();
  const { user, loading } = useAuth();
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
            {links.map(([label, href, , Icon]) => <Link key={href} href={href} className={pathname === href || pathname.startsWith(`${href}/`) ? "active" : ""}><Icon size={16} className="nav-icon" />{label}</Link>)}
          </nav>
          <div className="header-actions">
            {!loading ? <Link className="button button-ghost desktop-only" href={user ? "/account" : "/login"}><AccountIcon size={16} />{user ? "My Account" : "Sign in"}</Link> : null}
            <a className="button button-primary desktop-only" href={whatsappUrl(config.whatsapp_number, "Hi Navigeto, I would like help planning a Sri Lanka trip.")} target="_blank" rel="noreferrer"><WhatsappIcon size={16} />WhatsApp</a>
            <button className="menu-button" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Open navigation">{open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}</button>
          </div>
        </div>
        {open ? <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map(([label, href, , Icon]) => <Link key={href} href={href} onClick={() => setOpen(false)}><Icon size={17} className="nav-icon" />{label}</Link>)}
          {config.assistant_enabled ? <Link href="/trip-assistant" onClick={() => setOpen(false)}>Trip Assistant</Link> : null}
          {utilityLinks.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          {!loading ? <Link href={user ? "/account" : "/login"} onClick={() => setOpen(false)}><AccountIcon size={17} className="nav-icon" />{user ? "My Account" : "Sign in"}</Link> : null}
          <a href={whatsappUrl(config.whatsapp_number, "Hi Navigeto, I would like help planning a Sri Lanka trip.")} target="_blank" rel="noreferrer"><WhatsappIcon size={17} className="nav-icon" />WhatsApp Navigeto</a>
        </nav> : null}
      </header>
    </>
  );
}
