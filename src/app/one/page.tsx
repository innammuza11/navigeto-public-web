import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import DemoRequest from "./DemoRequest";
import LiveDemos from "./LiveDemos";
import { DEMO_WHATSAPP } from "@/lib/travelos-demo";
import { SITE_URL } from "@/lib/seo";
import s from "./travelos.module.css";
import x from "./sales.module.css";

const title = "Navigeto One | Travel Agency Software with Your Own Customer Website";
const description = "Cost, quote, book and settle every trip in one system, with a customer website in your own brand. See the live demos and try Navigeto One free for 14 days. No card needed.";
export const metadata: Metadata = {
  title: { absolute: title }, description, alternates: { canonical: "/one" },
  openGraph: { title, description, url: "/one", type: "website", images: [{ url: "/one/opengraph-image", width: 1200, height: 630, alt: "Navigeto One — Your operation. Your journeys. One system." }] },
  twitter: { card: "summary_large_image", title, description, images: ["/one/opengraph-image"] },
};

const SIGNUP = "https://admin.navigeto.com/partner/register?type=agent";

const modules = [
  ["01", "Cost with clarity", "Quick Cost & Costing Engine", "Bring hotels, transport, mileage and extras into a detailed cost sheet. Review your figures before you quote."],
  ["02", "Make every proposal yours", "Quotation Studio & branding", "Present a polished itinerary with your agency identity, hotel plan, inclusions and booking conditions."],
  ["03", "Build on your best journeys", "AI Itinerary Studio & Tour Library", "Start with a reusable programme, adapt the route and review the details for each new enquiry."],
  ["04", "Keep your rates close", "Hotel Library & Rate Upload", "Organise hotel information and contracts, with room types, meal plans and validity dates ready to review."],
  ["05", "Move from yes to booked", "Reservations & vouchers", "Carry the confirmed trip into operations. Manage supplier confirmations and prepare branded booking documents."],
  ["06", "See what changed", "Costs, purchases & settlement", "Compare the quotation with updated booking costs, track payments and review the final tour result."],
];
const questions = [
  ["Is Navigeto One available to other travel agencies?", "Yes. Register, verify your email and create a private agency workspace to start a free 14-day trial. No card or automatic charge. The trial includes 2 named users and up to 100 saved records. Review your ongoing plan and module scope with our team."],
  ["Can we use our own suppliers as well as Navigeto services?", "The private trial lets you maintain your own supplier records, costings and quotations. Contract management, additional modules and Navigeto service booking hand-offs depend on your agreed edition and onboarding scope."],
  ["Will quotations and vouchers use our branding?", "Branded quotations are part of the agency workspace. Review your logo, company details and available document types during onboarding; vouchers and other documents depend on your chosen edition."],
  ["Can we get a customer website too?", "Yes. Pick one of the theme models in the live demo and our team sets up a website with your logo, tours and contact details during onboarding. Website scope and price are confirmed in your written proposal."],
  ["How much will it cost?", "The first-five-agency hosted pilot is LKR 15,000 per agency per month for up to 2 named users, with normal hosting and guided onboarding. The USD 4,000 one-time installation offer is for the first 05 travel agencies only, with no source code or ownership transfer; hosting and ongoing costs are separate. Travel services are quoted separately."],
  ["Can you help us get started?", "Onboarding covers your agency details, users, branding and a sample enquiry-to-booking walkthrough. Bring one of your usual itineraries to the demo so we can review the fit with your team."],
];

export default function NavigetoOneLanding() {
  const structured = { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: `${SITE_URL}/one`, about: { "@type": "SoftwareApplication", name: "Navigeto One", applicationCategory: "BusinessApplication", operatingSystem: "Web browser", url: `${SITE_URL}/one`, offers: { "@type": "Offer", price: "15000", priceCurrency: "LKR", description: "Hosted agency pilot, per agency per month" } }, publisher: { "@id": `${SITE_URL}/#organization` } };
  return <div className={s.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    <a className={s.skip} href="#main">Skip to content</a>
    <header className={`${s.header} brand-signature`}><div className={s.headerInner}>
      <Link href="/one" className={s.logo} aria-label="Navigeto One home"><Image unoptimized src="/media/navigeto-logo.webp" alt="Navigeto Travels" width={2000} height={655} priority /><span>Navigeto One</span></Link>
      <nav className={s.nav} aria-label="Navigeto One navigation"><a href="#live">Live demo</a><a href="#modules">Features</a><a href="#pricing">Pricing</a><a href="#demo">Talk to us</a></nav>
      <div className={s.headerActions}><a className={s.login} href="https://admin.navigeto.com/partner/login?as=agent">Partner login</a><a href={SIGNUP} className={s.primary}>Start free trial <span aria-hidden="true">↗</span></a></div>
    </div></header>
    <main id="main">
      <section className={`${s.container} ${x.hero}`}>
        <div>
          <p className={s.eyebrow}><span /> TRAVEL AGENCY SOFTWARE · BUILT BY A WORKING SRI LANKAN DMC</p>
          <h1>Quote faster.<br />Look bigger.<br /><span>Sell more trips.</span></h1>
          <p className={x.heroLead}>Navigeto One runs your whole agency in one place: costing, branded quotations, bookings and accounts. Add a customer website in your own name, in a theme you choose.</p>
          <div className={x.heroActions}><a href={SIGNUP} className={x.cta}>Start your 14-day free trial <span aria-hidden="true">↗</span></a><a href="#live" className={x.ghost}>See the live demo</a></div>
          <ul className={x.trust}><li>No card. No automatic charge.</li><li>Your own private workspace</li><li>We use it every day at Navigeto Travels</li></ul>
        </div>
        <div className={x.heroStack} aria-hidden="true">
          <div className={x.heroCardBack}><Image src="/media/beach-south-coast-v1.webp" alt="" fill sizes="(max-width: 900px) 80vw, 420px" priority /><span>youragency.com</span></div>
          <div className={x.heroCardFront}><div className={x.miniBar}><i /><i /><i /></div><div className={x.miniBody}><small>QUOTATION · NQ-1042 · SAMPLE</small><b>5 nights · Culture &amp; Tea</b><dl><div><dt>Hotels</dt><dd>USD 600</dd></div><div><dt>Transport</dt><dd>USD 420</dd></div><div><dt>Extras</dt><dd>USD 130</dd></div><div className={x.miniTotal}><dt>Selling price</dt><dd>USD 1,380</dd></div></dl><span className={x.miniSend}>Send to client ✓</span></div></div>
        </div>
      </section>

      <section className={x.outcomes} aria-label="What changes for your agency"><div className={`${s.container} ${x.outcomeGrid}`}>
        <article><b>01</b><h2>Quote while they’re still interested</h2><p>Hotels, transport and extras are already in your library. Build the cost sheet and send a polished quote in one sitting.</p></article>
        <article><b>02</b><h2>Look like a big operator</h2><p>Quotations, vouchers and your customer website all carry your brand, not ours.</p></article>
        <article><b>03</b><h2>Know your profit on every trip</h2><p>Compare what you quoted with what suppliers actually charged, and see the real margin before you settle.</p></article>
      </div></section>

      <section id="live" className={`${s.container} ${x.section}`}>
        <div className={x.sectionHead}><p className={s.eyebrow}><span /> SEE IT LIVE</p><h2>Try it now, no sign-up needed.</h2><p>Type your agency name and switch between the website themes, or open the admin your team would use every day.</p></div>
        <LiveDemos />
      </section>

      <section id="modules" className={s.modulesSection}><div className={s.container}><div className={s.sectionHeading}><div><p className={s.eyebrow}>EVERYTHING IN ONE PLACE</p><h2>Your whole day, connected.</h2></div><p>One login for your team. Each module passes the trip to the next, so nothing is typed twice.</p></div><div className={s.moduleGrid}>{modules.map(([number, heading, name, text]) => <article key={number} className={s.module}><span>{number}</span><h3>{heading}</h3><small>{name}</small><p>{text}</p></article>)}</div></div></section>

      <section id="pricing" className={`${s.container} ${x.section}`} aria-label="Pricing">
        <div className={x.sectionHead}><p className={s.eyebrow}><span /> SIMPLE PRICING</p><h2>Start free. Pay only when it works for you.</h2></div>
        <div className={x.priceGrid}>
          <article className={x.price}><p className={x.priceTag}>FREE TRIAL</p><h3>LKR 0</h3><p className={x.priceUnit}>14 days · no card</p><ul><li>Your private agency workspace</li><li>2 named users</li><li>Up to 100 saved records</li><li>No automatic charge</li></ul><a href={SIGNUP} className={x.ghost}>Start free trial</a></article>
          <article className={`${x.price} ${x.priceBest}`}><p className={x.priceTag}>MOST POPULAR · FIRST 5 AGENCIES</p><h3>LKR 15,000</h3><p className={x.priceUnit}>per agency / month · price held for 12 months</p><ul><li>Up to 2 named staff users</li><li>Hosting included, no setup fee</li><li>Guided onboarding session</li><li>Costing, quotations, itineraries and agreed booking scope</li></ul><a href={SIGNUP} className={x.cta}>Start free, then upgrade</a></article>
          <article className={x.price}><p className={x.priceTag}>FIRST 5 AGENCIES ONLY</p><h3>USD 4,000</h3><p className={x.priceUnit}>one-time software licence</p><ul><li>One installation and set-up</li><li>For your own business</li><li>Agreed modules and users</li><li>Hosting, support and updates billed separately</li></ul><a href="#demo" className={x.ghost}>Ask about the licence</a></article>
        </div>
        <p className={x.priceNote}>Paid AI and custom development are not included. No source code, ownership or resale rights with the licence. Customer website, eligibility and taxes are confirmed in your written proposal. <Link href="/one/offers">Full offer terms and brochure ↗</Link></p>
      </section>

      <section className={s.onboarding}><div className={s.container}><p className={s.eyebrow}>LIVE IN THREE STEPS</p><h2>From sign-up to your first quote.</h2><div className={s.onboardingSteps}><div><b>01</b><h3>Create your workspace</h3><p>Register, verify your email and your 14-day trial starts. No card.</p></div><div><b>02</b><h3>Add your brand and rates</h3><p>Upload your logo, hotels and transport rates, or start from the sample library.</p></div><div><b>03</b><h3>Send your first quote</h3><p>Cost a real enquiry and send the branded quotation to your client.</p></div></div></div></section>

      <section id="demo" className={`${s.container} ${s.section} ${s.demoSection}`}><div><p className={s.eyebrow}>PREFER A WALKTHROUGH?</p><h2>We’ll show you around<br />with your own trip.</h2><p className={s.sectionIntro}>Tell us about your agency. We’ll arrange a short demo using one of your real itineraries.</p><ul className={s.demoBenefits}><li>See an enquiry go from quote to booking</li><li>Pick your customer website theme</li><li>Agree users, branding and pricing</li></ul><a href={DEMO_WHATSAPP} target="_blank" rel="noreferrer" className={s.textLink}>Chat on WhatsApp ↗</a><div className={s.contactDetails}><a href="mailto:info@navigeto.com">info@navigeto.com</a><a href="tel:+94774206166">+94 77 420 6166</a></div></div><div className={s.formCard}><span className={s.formKicker}>YOUR AGENCY’S NEXT STEP</span><h3>Request a personal demo</h3><DemoRequest /></div></section>
      <section className={`${s.container} ${s.faqSection}`}><div><p className={s.eyebrow}>QUESTIONS</p><h2>Before you start.</h2></div><div>{questions.map(([q, a]) => <details key={q} className={s.faq}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
    </main>
    <div className={x.stickyCta}><a href={SIGNUP} className={x.cta}>Start free trial</a><a href="#live" className={x.ghost}>Live demo</a></div>
    <footer className={`${s.footer} brand-signature`}><div className={s.container}><div><strong>Navigeto One</strong><p>For the people who make journeys happen.</p></div><nav aria-label="Footer"><Link href="/">Navigeto Travels</Link><Link href="/privacy">Privacy</Link><a href="mailto:info@navigeto.com">Contact us</a></nav><small>© 2026 Navigeto Travels (Pvt) Ltd.</small></div></footer>
  </div>;
}
