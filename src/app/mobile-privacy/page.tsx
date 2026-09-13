import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/privacy-page.module.css";

export const metadata: Metadata = {
  title: "Navigeto app privacy policy",
  description: "How Navigeto Holidays (Pvt) Ltd handles personal data in the Navigeto customer app.",
  alternates: { canonical: "/mobile-privacy" },
};

export default function MobilePrivacyPage() {
  return <main className={styles.page}>
    <Link href="/">Navigeto · Home</Link>
    <h1>Navigeto app privacy policy</h1>
    <p>Updated 13 September 2026. This policy covers the Navigeto customer app for Android and iOS, operated by NAVIGETO HOLIDAYS (PVT) LTD, No. 420, 2/1, Elvitigala Mawatha, Colombo 05, Sri Lanka. Contact <a href="mailto:info@navigeto.com">info@navigeto.com</a> about your privacy.</p>
    <h2>Information the app uses</h2>
    <ul>
      <li>Account information: email, authentication credentials and the name you provide when signing up.</li>
      <li>Profile information you choose to add: phone, WhatsApp number, nationality and marketing preference.</li>
      <li>Travel requests: travel dates, group size, destinations, notes and the contact details you submit.</li>
      <li>App information: notification activity, device installation identifier, device model, platform, app version and push token when notifications are enabled.</li>
      <li>Service logs: request timing, response status and an IP-derived identifier used to limit abuse. Hosting providers may also process network addresses in their security logs.</li>
    </ul>
    <h2>Why we use it</h2>
    <p>We use this information to authenticate your account, maintain your profile, respond to travel requests, show enquiry progress, deliver notifications and protect the service. Your travel requests are passed to our TravelOS operations team. Marketing preferences are optional and can be changed in your profile.</p>
    <h2>Service providers and sharing</h2>
    <p>Supabase provides authentication, database and API infrastructure. Apple and Google deliver push notifications when enabled. Our hosting and communications providers process information needed to run these services. If you ask us to arrange travel, the information necessary to fulfil that request may be shared with the relevant travel suppliers. We may disclose information when required by law.</p>
    <p>The customer app does not include advertising trackers or sell personal data. Opening an external website, email service or sharing destination is subject to that service&apos;s privacy practices. Those services may process data outside Sri Lanka.</p>
    <h2>Security and your choices</h2>
    <p>The app communicates with its services over encrypted connections. Account sessions are stored on your device so you can stay signed in. You can sign out, edit your profile, change marketing preferences and disable notifications in device settings. Do not include passport, payment card or other sensitive information in free-text travel notes.</p>
    <h2>Account deletion and retention</h2>
    <p>You can request deletion of your entire account and associated personal data in the app under You → Delete account, or use our <Link href="/delete-account">account deletion page</Link> without reinstalling the app. We aim to complete requests within 30 days and provide email confirmation. Account deletion does not cancel existing bookings.</p>
    <p>Deletion covers your account, profile, device tokens, notification history and personal enquiry data that we are not legally required to keep. Booking, payment, tax or dispute records may need to be retained for applicable legal obligations; access to retained records is restricted. We will explain relevant exceptions when completing your request. Backup copies are removed through the backup retention cycle. Until deletion, information is retained as needed to provide the service and meet these obligations.</p>
    <h2>Children and updates</h2>
    <p>The app is intended for adults arranging travel. If you believe a child has provided personal information without appropriate authorization, contact us to request its removal. We will update this page when our practices change.</p>
    <p><Link href="/delete-account">Request account deletion</Link> · <a href="mailto:info@navigeto.com">Privacy support</a></p>
  </main>;
}
