"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { Notice } from "@/components/Notice";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setPending(true); setError("");
    const { error: signUpError } = await getSupabaseBrowserClient().auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/account` },
    });
    setPending(false);
    if (signUpError) return setError(signUpError.message.includes("already registered") ? "An account with this email already exists." : "Unable to create your account right now. Please try again shortly.");
    setDone(true);
  }

  return <>
    <PageHero eyebrow="My Account" title="Create your Navigeto account." description="Save travellers, track enquiries and view your booking history in one place." />
    <div className="shell content-wrap" style={{maxWidth:480, margin:"0 auto"}}>
      {done ? <div className="reference-box"><span>Almost there</span><strong>Check your email</strong><p>We&apos;ve sent a confirmation link to {email}. Click it to activate your account, then sign in.</p></div> : <form className="filter-panel" onSubmit={submit}>
        <div className="field" style={{marginBottom:16}}><label>Full name</label><input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div className="field" style={{marginBottom:16}}><label>Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field" style={{marginBottom:20}}><label>Password</label><input className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error ? <Notice tone="error">{error}</Notice> : null}
        <button className="button button-primary button-block" type="submit" disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>
        <p style={{textAlign:"center", marginTop:16, fontSize:13, color:"var(--muted)"}}>Already have an account? <Link className="text-link" href="/login">Sign in</Link></p>
      </form>}
    </div>
  </>;
}
