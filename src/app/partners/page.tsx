import Link from "next/link";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import styles from "@/components/partner-access.module.css";

export const metadata: Metadata = {
  title: "Partner registration & sign in | Navigeto",
  description: "Join Navigeto as a travel agent, hotel or driver. Already registered? Sign in to your existing partner account.",
};

const partners = [
  { type: "agent", title: "Travel agents", action: "Register your agency", copy: "Plan Sri Lanka journeys, prepare quotations and manage your agency’s enquiries and bookings.", prepare: "Have your agency name, contact details and email ready.", path: "M4 7h16v13H4z M9 7V4h6v3 M4 12h16 M10 12v3h4v-3" },
  { type: "hotel", title: "Hotels & properties", action: "Register your hotel", copy: "Connect your property with Navigeto and submit room rates, property details and photos for review.", prepare: "Have your property name, location and business contact details ready.", path: "M5 21V3h14v18 M9 21v-5h6v5 M8 7h2 M14 7h2 M8 11h2 M14 11h2" },
  { type: "driver", title: "Drivers & transport", action: "Register as a driver", copy: "Share your driver and vehicle profile. Once approved, sign in to manage your assigned trips.", prepare: "Have your licence, insurance and driver and vehicle photos ready.", path: "M3 16V9h11v7H3z M14 11h4l3 3v2h-7 M5 16a2 2 0 1 0 4 0 M15 16a2 2 0 1 0 4 0" },
];

export default function PartnersPage() {
  return <SiteShell hideNavi><section className={styles.page}><div className="shell">
    <div className={styles.intro}><span className="eyebrow">Navigeto partner portal</span><h1>Your partnership starts here.</h1><p>New to Navigeto? Choose your business below to register. Already have an account? Go straight to sign in.</p></div>
    <section className={styles.returning} aria-labelledby="partner-signin-title"><div><h2 id="partner-signin-title">Already registered?</h2><p>Use your registered email. Sign in with an email link or your password.</p></div><div className={styles.returnActions}><a className="button button-primary" href="https://admin.navigeto.com/partner/login">Sign in to your account ↗</a><a className={styles.helpLink} href="https://admin.navigeto.com/partner/forgot-password">Forgot password?</a></div></section>
    <h2 className={styles.sectionTitle}>Create your partner account</h2><p className={styles.sectionCopy}>Choose one account type to open the right registration form.</p>
    <div className={styles.grid}>{partners.map(partner => <article className={styles.card} key={partner.type}><div className={styles.icon}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={partner.path}/></svg></div><h3>{partner.title}</h3><p>{partner.copy}</p><p className={styles.prepare}>{partner.prepare}</p><a className="button button-primary" href={`https://admin.navigeto.com/partner/register?type=${partner.type}`}>{partner.action} →</a></article>)}</div>
    <section className={styles.steps} aria-labelledby="registration-next"><h2 id="registration-next">What happens next?</h2><ol><li><strong>Complete your profile</strong>Enter your details on the secure Navigeto partner portal.</li><li><strong>Confirm your email</strong>Follow the email instructions. If you received an invitation, use that link instead of registering again.</li><li><strong>Access your workspace</strong>Our team reviews or links your profile. Then sign in with the same email to access your account.</li></ol></section>
    <p className={styles.support}>Need help with registration or approval? <a href="mailto:info@navigeto.com">Contact info@navigeto.com</a>. Planning a holiday? <Link href="/custom-trip">Send a trip enquiry</Link> — no partner account needed.</p>
  </div></section></SiteShell>;
}
