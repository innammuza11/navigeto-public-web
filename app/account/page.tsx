"use client";

import { useEffect, useState } from "react";
import { Notice } from "@/components/Notice";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CustomerProfile } from "@/lib/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.resolve(getSupabaseBrowserClient().from("travelos_public_customer_profiles").select("*").eq("id", user.id).maybeSingle())
      .then(({ data, error: loadError }) => {
        if (loadError) { setError("Unable to load your profile right now."); return; }
        setProfile((data as CustomerProfile) || { id: user.id, full_name: null, email: user.email || null, phone: null, whatsapp: null, nationality: null, marketing_opt_in: false });
      }).finally(() => setLoading(false));
  }, [user]);

  const set = (key: keyof CustomerProfile, value: string | boolean) => setProfile((current) => current ? { ...current, [key]: value } : current);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !profile) return;
    setSaving(true); setError(""); setSaved(false);
    const { error: saveError } = await getSupabaseBrowserClient().from("travelos_public_customer_profiles")
      .upsert({ id: user.id, full_name: profile.full_name, phone: profile.phone, whatsapp: profile.whatsapp, nationality: profile.nationality, marketing_opt_in: profile.marketing_opt_in, email: profile.email || user.email });
    setSaving(false);
    if (saveError) return setError("Unable to save your profile right now.");
    setSaved(true);
  }

  if (loading || !profile) return null;

  return <form className="filter-panel" onSubmit={save}>
    <div className="form-grid two" style={{marginBottom:18}}>
      <div className="field"><label>Full name</label><input className="input" value={profile.full_name || ""} onChange={(e) => set("full_name", e.target.value)} /></div>
      <div className="field"><label>Email</label><input className="input" value={profile.email || user?.email || ""} disabled /></div>
      <div className="field"><label>Phone</label><input className="input" value={profile.phone || ""} onChange={(e) => set("phone", e.target.value)} /></div>
      <div className="field"><label>WhatsApp</label><input className="input" value={profile.whatsapp || ""} onChange={(e) => set("whatsapp", e.target.value)} /></div>
      <div className="field"><label>Nationality</label><input className="input" value={profile.nationality || ""} onChange={(e) => set("nationality", e.target.value)} /></div>
    </div>
    <label className="checkbox-field" style={{marginBottom:20}}><input type="checkbox" checked={profile.marketing_opt_in} onChange={(e) => set("marketing_opt_in", e.target.checked)} /> Send me offers and travel inspiration by email</label>
    {error ? <Notice tone="error">{error}</Notice> : null}
    {saved ? <Notice tone="success">Profile saved.</Notice> : null}
    <button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
  </form>;
}
