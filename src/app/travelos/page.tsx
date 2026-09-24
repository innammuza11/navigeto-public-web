import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import DemoRequest from "./DemoRequest";
import WorkflowPreview from "./WorkflowPreview";
import { DEMO_WHATSAPP } from "@/lib/travelos-demo";
import { SITE_URL } from "@/lib/seo";
import s from "./travelos.module.css";

const title = "TravelOS by Navigeto | Travel Agency Software & B2B Services";
const description = "Bring tour costing, branded quotations, itineraries and reservation operations together. Explore TravelOS by Navigeto and request an agency pilot demo.";
export const metadata: Metadata = {
  title: { absolute: title }, description, alternates: { canonical: "/travelos" },
  openGraph: { title, description, url: "/travelos", type: "website", images: [{ url: "/travelos/opengraph-image", width: 1200, height: 630, alt: "TravelOS by Navigeto — Less admin. More journeys." }] },
  twitter: { card: "summary_large_image", title, description, images: ["/travelos/opengraph-image"] },
};

const modules = [
  ["01", "Cost with clarity", "Quick Cost & Costing Engine", "Bring hotels, transport, mileage and extras into a detailed cost sheet. Review your figures before you quote."],
  ["02", "Make every proposal yours", "Quotation Studio & branding", "Present a polished itinerary with your agency identity, hotel plan, inclusions and booking conditions."],
  ["03", "Build on your best journeys", "AI Itinerary Studio & Tour Library", "Start with a reusable programme, adapt the route and review the details for each new enquiry."],
  ["04", "Keep your rates close", "Hotel Library & Rate Upload", "Organise hotel information and contracts, with room types, meal plans and validity dates ready to review."],
  ["05", "Move from yes to booked", "Reservations & vouchers", "Carry the confirmed trip into operations. Manage supplier confirmations and prepare branded booking documents."],
  ["06", "See what changed", "Costs, purchases & settlement", "Compare the quotation with updated booking costs, track payments and review the final tour result."],
];
const questions = [
  ["Is TravelOS available to other travel agencies?", "We are preparing the agency subscription pilot. Request a demo to review the workflow, modules and onboarding scope with our team. Access is configured after that review; submitting this form does not start a subscription."],
  ["Can we use our own suppliers as well as Navigeto services?", "That is the planned agency model: manage your own contracts and suppliers, and access Navigeto services where required. Private agency data separation and the booking hand-off are part of the pilot validation before access is enabled."],
  ["Will quotations and vouchers use our branding?", "Agency branding is part of the planned subscription offering. We will review your logo, company details and document layout during setup, and confirm the available document types in your demo."],
  ["How much will it cost?", "Pilot pricing and included users, modules and usage limits will be confirmed with your agency before activation. Travel services booked through Navigeto are quoted separately from the software subscription."],
  ["Can you help us get started?", "The proposed onboarding covers your agency details, users, branding and a sample enquiry-to-booking walkthrough. Bring one of your usual itineraries to the demo so we can review the fit with your team."],
];

export default function TravelosLanding() {
  const structured = { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: `${SITE_URL}/travelos`, about: { "@type": "SoftwareApplication", name: "TravelOS by Navigeto", applicationCategory: "BusinessApplication", operatingSystem: "Web browser", url: `${SITE_URL}/travelos` }, publisher: { "@id": `${SITE_URL}/#organization` } };
  return <div className={s.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    <a className={s.skip} href="#main">Skip to content</a>
    <header className={`${s.header} brand-signature`}><div className={s.headerInner}>
      <Link href="/travelos" className={s.logo} aria-label="TravelOS by Navigeto home"><Image unoptimized src="/media/navigeto-logo.webp" alt="Navigeto Travels" width={2000} height={655} priority /><span>TravelOS</span></Link>
      <nav className={s.nav} aria-label="TravelOS navigation"><a href="#workflow">How it works</a><a href="#modules">Modules</a><a href="#pilot">Agency pilot</a></nav>
      <div className={s.headerActions}><a className={s.login} href="https://admin.navigeto.com/partner/login?as=agent">Partner login</a><a href="#demo" className={s.primary}>Book a demo <span aria-hidden="true">↗</span></a></div>
    </div></header>
    <main id="main">
      <section className={`${s.container} ${s.hero}`}>
        <div className={s.heroCopy}><p className={s.eyebrow}><span /> TRAVELOS BY NAVIGETO</p><h1>Less admin.<br /><span>More journeys.</span></h1><p className={s.heroIntro}>Your next chapter as a travel agency starts with a more connected way to work.</p><p className={s.heroDescription}>Bring costing, itineraries, quotations and bookings together. Spend more time with your clients, with the details in one place.</p><div className={s.heroActions}><a href="#demo" className={s.primary}>Explore TravelOS with us <span aria-hidden="true">↗</span></a><a href="#workflow" className={s.secondary}>See the workflow <span aria-hidden="true">↓</span></a></div><div className={s.pilotNote}><span className={s.dot} /><p>Agency subscription pilot in preparation.<br /><strong>Book a demo to explore the fit for your team.</strong></p></div></div>
        <div className={s.heroVisual}><div className={s.journeyCard}><div className={s.journeyImage}><Image src="/media/tour-tea-train-v1.webp" alt="Train through Sri Lanka’s tea country" fill sizes="(max-width: 800px) 90vw, 45vw" priority /><span>FROM FIRST ENQUIRY<br />TO THE JOURNEY AHEAD</span></div><div className={s.journeyCopy}><div><small>A CONNECTED WORKFLOW</small><h2>One trip.<br />Every detail.</h2></div><span className={s.journeyArrow} aria-hidden="true">↗</span></div><div className={s.journeyStages}><span>Cost</span><i>→</i><span>Quote</span><i>→</i><span>Book</span><i>→</i><span>Settle</span></div></div><div className={s.floatingNote}><span aria-hidden="true">✓</span><div><strong>Built around travel operations</strong><small>From the team at Navigeto Travels</small></div></div></div>
      </section>
      <div className={s.audience}><div className={s.container}><p>FOR THE PEOPLE BEHIND THE JOURNEY</p><span>Travel agencies</span><span>Tour operators</span><span>Destination specialists</span><span>B2B travel teams</span></div></div>
      <section id="workflow" className={`${s.container} ${s.section}`}><div className={s.sectionHeading}><div><p className={s.eyebrow}>THE WORKFLOW</p><h2>From “Can you quote this?”<br />to a trip ready to run.</h2></div><p>Follow a sample trip through costing, presentation and operations. The preview uses example figures, so you can explore freely.</p></div><WorkflowPreview /></section>
      <section id="modules" className={s.modulesSection}><div className={s.container}><div className={s.sectionHeading}><div><p className={s.eyebrow}>THE AGENCY TOOLKIT</p><h2>Your day, connected.</h2></div><p>Explore these TravelOS modules in your demo. Agency access and the included features will be agreed during pilot onboarding.</p></div><div className={s.moduleGrid}>{modules.map(([number, heading, name, text]) => <article key={number} className={s.module}><span>{number}</span><h3>{heading}</h3><small>{name}</small><p>{text}</p></article>)}</div></div></section>
      <section id="pilot" className={`${s.container} ${s.section} ${s.pilotSection}`}><div><p className={s.eyebrow}>YOUR AGENCY. YOUR WAY.</p><h2>Your expertise.<br />A connected workspace.</h2><p className={s.sectionIntro}>We are building the subscription around how travel agencies actually operate: your own services, Navigeto services, or a combination of both.</p><a href="#demo" className={s.textLink}>Discuss your agency setup <span aria-hidden="true">↗</span></a></div><div className={s.servicePaths}><article><span className={s.pathLabel}>YOUR OWN SERVICES · PLANNED PILOT</span><h3>Your contracts. Your pricing.</h3><p>Bring your supplier relationships, hotel contracts, brand and commercial approach into your agency workspace.</p></article><article><span className={s.pathLabel}>NAVIGETO B2B SERVICES</span><h3>A destination partner, too.</h3><p>Access Navigeto’s offered services for the trips you need us to handle. Service quotations and software subscriptions are separate.</p></article><p className={s.pilotFootnote}>Agency isolation, permissions and booking hand-offs are being validated before subscriber access is enabled.</p></div></section>
      <section className={s.onboarding}><div className={s.container}><p className={s.eyebrow}>START WITH A REAL CONVERSATION</p><h2>Let’s build your better workday.</h2><div className={s.onboardingSteps}><div><b>01</b><h3>Show us your workflow</h3><p>Bring one typical enquiry, itinerary or costing sheet to your demo.</p></div><div><b>02</b><h3>Agree your setup</h3><p>Review the modules, users, branding, scope and pilot pricing together.</p></div><div><b>03</b><h3>Begin with a guided pilot</h3><p>After validation, configure your agency and walk through a sample booking.</p></div></div></div></section>
      <section id="demo" className={`${s.container} ${s.section} ${s.demoSection}`}><div><p className={s.eyebrow}>LET’S TALK TRAVELOS</p><h2>Bring your questions.<br />We’ll bring the walkthrough.</h2><p className={s.sectionIntro}>Tell us a little about your agency. We’ll contact you to arrange a demo and discuss the right pilot setup.</p><ul className={s.demoBenefits}><li>See the enquiry-to-booking workflow</li><li>Discuss your own services and Navigeto B2B</li><li>Review branding, modules and onboarding</li></ul><a href={DEMO_WHATSAPP} target="_blank" rel="noreferrer" className={s.textLink}>Prefer WhatsApp? Talk to our team ↗</a><div className={s.contactDetails}><a href="mailto:info@navigeto.com">info@navigeto.com</a><a href="tel:+94753310101">+94 75 331 0101</a></div></div><div className={s.formCard}><span className={s.formKicker}>YOUR AGENCY’S NEXT STEP</span><h3>Request a personal demo</h3><DemoRequest /></div></section>
      <section className={`${s.container} ${s.faqSection}`}><div><p className={s.eyebrow}>A FEW USEFUL ANSWERS</p><h2>Before we meet.</h2></div><div>{questions.map(([q, a]) => <details key={q} className={s.faq}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
    </main>
    <footer className={`${s.footer} brand-signature`}><div className={s.container}><div><strong>TravelOS <span>by Navigeto</span></strong><p>For the people who make journeys happen.</p></div><nav aria-label="Footer"><Link href="/">Navigeto Travels</Link><Link href="/privacy">Privacy</Link><a href="mailto:info@navigeto.com">Contact us</a></nav><small>© 2026 Navigeto Travels (Pvt) Ltd.</small></div></footer>
  </div>;
}
