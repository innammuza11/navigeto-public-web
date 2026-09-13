import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/privacy-page.module.css";

export const metadata: Metadata = {
  title: "Delete your Navigeto account",
  description: "Request deletion of your Navigeto account and associated personal data without reinstalling the app.",
  alternates: { canonical: "/delete-account" },
};

export default function DeleteAccountPage() {
  const email = "mailto:info@navigeto.com?subject=Navigeto%20account%20deletion%20request&body=Please%20delete%20my%20Navigeto%20account%20and%20associated%20personal%20data.%0A%0AMy%20account%20email%20is%3A%20";
  return <main className={styles.page}>
    <Link href="/">Navigeto · Home</Link>
    <h1>Delete your Navigeto account</h1>
    <p>NAVIGETO HOLIDAYS (PVT) LTD provides this page for users of the Navigeto Android and iOS customer app. You can request deletion even if you have uninstalled the app.</p>
    <h2>Request by email</h2>
    <p>Send an email from your account&apos;s registered email address to <a href={email}>info@navigeto.com</a> with the subject “Navigeto account deletion request”. Ask us to delete your account and associated personal data. You do not need to give a reason or send your password, identity documents or payment information.</p>
    <p><a className="button button-primary" href={email}>Compose deletion request</a></p>
    <p>This opens your email app; you must send the message to submit the request. If no email app opens, copy info@navigeto.com into your email service. If you cannot access your registered email, contact the same address for account ownership verification.</p>
    <h2>Request inside the app</h2>
    <p>Sign in, open You → Delete account, and confirm the deletion request. You receive a reference in the app. No separate email or phone call is required for an in-app request.</p>
    <h2>What happens next</h2>
    <p>We aim to complete requests within 30 days and email you when deletion is complete. Until then, a request confirmation means the request has been received, not that deletion is finished.</p>
    <p>We delete your account, profile, device tokens, notification history and associated personal enquiry data that we are not legally required to retain. Booking, payment, tax or dispute records may be retained to meet legal obligations, with restricted access. We will explain applicable exceptions in the completion response. Backup copies expire through the backup retention cycle.</p>
    <p>Deleting your account does not cancel a booking or request a refund. Contact our team separately to change existing travel arrangements. Signing out or uninstalling the app does not delete your account.</p>
    <p><Link href="/mobile-privacy">Read the Navigeto app privacy policy</Link></p>
  </main>;
}
