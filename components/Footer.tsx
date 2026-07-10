"use client";

import Image from "next/image";
import Link from "next/link";
import { useSite } from "./SiteProvider";
import { whatsappUrl } from "@/lib/format";

export function Footer() {
  const { config } = useSite();
  return <footer className="footer">
    <div className="shell footer-grid">
      <div>
        <Image src="/logo.webp" alt="Navigeto Travels" width={2000} height={655} className="footer-logo" />
        <p>{config.tagline}</p>
        <a className="footer-wa" href={whatsappUrl(config.whatsapp_number, "Hi Navigeto, I would like to plan my trip.")} target="_blank" rel="noreferrer">Chat on WhatsApp →</a>
      </div>
      <div><h4>Book with us</h4>{config.hotel_enabled?<Link href="/hotels">Hotels</Link>:null}{config.transfer_enabled?<Link href="/transfers">Private Transfers</Link>:null}{config.tour_enabled?<><Link href="/tours">All Tours</Link><Link href="/tours/sri-lanka">Sri Lanka Tours</Link><Link href="/tours/international">International Tours</Link></>:null}<Link href="/custom-trip">Custom Trip</Link></div>
      <div><h4>Company</h4><Link href="/about">About Navigeto</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      <div><h4>Contact</h4><a href={`tel:${config.phone.replace(/\s/g, "")}`}>{config.phone}</a><a href={`mailto:${config.email}`}>{config.email}</a><span>{config.office_address}</span><a href={process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.navigeto.com"} target="_blank" rel="noreferrer">Staff Login</a></div>
    </div>
    <div className="shell footer-bottom"><span>© {new Date().getFullYear()} Navigeto Travels (Pvt) Ltd.</span><span>Live services powered by Navigeto TravelOS Enterprise.</span></div>
  </footer>;
}
