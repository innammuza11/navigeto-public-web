"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageHero } from "@/components/PageHero";
import { LoadingCards } from "@/components/Loading";
import { useAuth } from "@/lib/auth/AuthProvider";

const tabs = [
  ["Profile", "/account"],
  ["Saved Travellers", "/account/travellers"],
  ["My Enquiries", "/account/enquiries"],
] as const;

export function AccountShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, pathname, router]);

  if (loading || !user) return <div className="shell content-wrap"><LoadingCards count={2} /></div>;
  return <>
    <PageHero eyebrow="My Account" title="Manage your Navigeto account." description={user.email || ""} />
    <div className="shell content-wrap">
      <div className="filter-panel" style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14, marginBottom:24}}>
        <nav style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          {tabs.map(([label, href]) => <Link key={href} href={href} className={`button ${pathname === href ? "button-primary" : "button-ghost"}`}>{label}</Link>)}
        </nav>
        <button className="button button-ghost" type="button" onClick={() => { void signOut(); router.push("/"); }}>Sign out</button>
      </div>
      {children}
    </div>
  </>;
}
