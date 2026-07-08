"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Notice } from "@/components/Notice";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true); setError("");
    const { error: signInError } = await getSupabaseBrowserClient().auth.signInWithPassword({ email, password });
    setPending(false);
    if (signInError) return setError(signInError.message === "Invalid login credentials" ? "Incorrect email or password." : "Unable to sign in right now. Please try again shortly.");
    router.push(params.get("next") || "/account");
  }

  return <>
    <PageHero eyebrow="My Account" title="Welcome back." description="Sign in to view your enquiries, bookings and saved travellers." />
    <div className="shell content-wrap" style={{maxWidth:480, margin:"0 auto"}}>
      <form className="filter-panel" onSubmit={submit}>
        <div className="field" style={{marginBottom:16}}><label>Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field" style={{marginBottom:20}}><label>Password</label><input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error ? <Notice tone="error">{error}</Notice> : null}
        <button className="button button-primary button-block" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
        <p style={{textAlign:"center", marginTop:16, fontSize:13, color:"var(--muted)"}}>New to Navigeto? <Link className="text-link" href="/signup">Create an account</Link></p>
      </form>
    </div>
  </>;
}

export default function LoginPage() { return <Suspense fallback={null}><LoginContent /></Suspense>; }
