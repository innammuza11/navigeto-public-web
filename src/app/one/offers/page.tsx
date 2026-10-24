import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import s from "./offers.module.css";

const trialUrl = "https://admin.navigeto.com/partner/register?type=agent";
const whatsappUrl = "https://wa.me/94753310101?text=Hi%20Navigeto%2C%20I%27d%20like%20to%20discuss%20the%20Navigeto%20One%20agency%20offers.";
export const metadata: Metadata = {
  title: { absolute: "Navigeto One | Agency Pricing & 14-Day Free Trial" },
  description: "Try Navigeto One free for 14 days. Explore the LKR 15,000/month agency pilot and USD 4,000 installation offer for the first five agencies. No automatic charge.",
  alternates: { canonical: "/one/offers" },
  openGraph: { title: "Navigeto One - Your agency. One workspace.", description: "14-day free trial. No card or automatic charge. Introductory offers for Sri Lankan travel companies.", url: "/one/offers", images: [{ url: "/one-offers/whatsapp-offer.png", width: 1080, height: 1660, alt: "Navigeto One introductory agency offers" }] },
};

export default function AgencyOffers() {
  return <div className={s.page}>
    <a className={s.skip} href="#offers-main">Skip to offers</a>
    <header className={`${s.header} brand-signature`}><div className={s.headerInner}>
      <Link className={s.brand} href="/one"><Image unoptimized src="/media/navigeto-logo.webp" width={142} height={47} alt="Navigeto Travels" priority /><span>Navigeto One</span></Link>
      <nav aria-label="Product navigation"><Link href="/one">Product overview</Link><Link href="/one/demo">Interactive demo</Link><a href="https://admin.navigeto.com/partner/login?as=agent">Sign in</a></nav>
    </div></header>
    <main id="offers-main" className={s.main}>
      <section className={s.hero}><p className={s.eyebrow}>FOR SRI LANKAN TRAVEL COMPANIES</p><h1>Your operation.<br />Your journeys.<br /><span>One system.</span></h1><p className={s.intro}>Bring your costing, quotations, reservations and account follow-up into one travel workspace.</p></section>
      <section className={s.trial} aria-labelledby="trial-title"><div className={s.trialDays}>14 DAYS</div><div><p className={s.eyebrow}>FREE TRIAL - NOW AVAILABLE</p><h2 id="trial-title">Try your agency workspace.</h2><p>No card required. No automatic charge.<br />2 named users. Up to 100 saved trial records.</p><a className={s.primary} href={trialUrl}>Start your free trial <span aria-hidden="true">↗</span></a><p className={s.small}>Verify your email, then create your private agency workspace. Your 14 days start when the workspace is created.</p></div></section>
      <section className={s.workflow} aria-label="Your agency workflow">{[["PLAN", "Costing & itineraries"], ["SELL", "Branded quotations"], ["MANAGE", "Booking follow-up"]].map(([label, title]) => <div key={label}><p className={s.eyebrow}>{label}</p><h2>{title}</h2></div>)}</section>
      <p className={s.small}>A private workspace for your agency. Included modules depend on your agreed edition; the full staff ERP shown in a demo is not automatically included.</p>
      <section className={s.pricing} aria-label="Introductory pricing">
        <article className={s.hosted}><p className={s.eyebrow}>HOSTED AGENCY PILOT</p><h2>LKR 15,000</h2><p>per agency / month</p><p className={s.eligibility}>First five eligible Sri Lankan agencies</p><ul><li>Up to 2 named staff users</li><li>Normal workspace hosting included</li><li>No setup fee</li><li>One guided onboarding session</li><li>Monthly price locked for 12 months</li></ul><p className={s.small}>Agency costing, quotations, itineraries and agreed reservation, supplier and account-record scope. Paid AI and custom development are excluded.</p><a className={s.primary} href={trialUrl}>Try free for 14 days <span aria-hidden="true">↗</span></a></article>
        <article><p className={s.eyebrow}>FIRST 05 TRAVEL AGENCIES ONLY</p><h2>USD 4,000</h2><p>one-time lifetime software licence</p><ul><li>One initial installation and configuration</li><li>For your own business</li><li>Agreed modules and user scope</li><li>No source code or ownership transfer</li></ul><p className={s.small}>Hosting, domain, third-party/API usage, maintenance, ongoing support and future development are separate. No resale rights. Scope and recurring costs are agreed in writing before payment.</p><a className={s.secondary} href={whatsappUrl} target="_blank" rel="noopener noreferrer">Discuss your installation <span aria-hidden="true">↗</span></a></article>
      </section>
      <section className={s.notes}><h2>A clear starting point.</h2><p>Your free trial does not create a paid subscription. Trial access expires after 336 hours; saved records are preserved, and you can contact us for an export.</p><p>Paid AI and live checkout are disabled. Offer availability, module scope, support, applicable taxes and commercial terms are confirmed in your written proposal.</p><div className={s.downloads}><a href="/one-offers/agency-offers.pdf" download>Download the pricing PDF <span aria-hidden="true">↓</span></a><a href="/one-offers/whatsapp-offer.png" download>Download the WhatsApp offer <span aria-hidden="true">↓</span></a></div></section>
    </main>
    <footer className={s.footer}><div><strong>Navigeto One</strong><p>For the people who make journeys happen.</p></div><div><a href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp +94 75 331 0101</a><a href="tel:+94774206166">Call +94 77 420 6166</a><a href="mailto:info@navigeto.com">info@navigeto.com</a></div><Link href="/one">Back to Navigeto One <span aria-hidden="true">↗</span></Link></footer>
  </div>;
}
