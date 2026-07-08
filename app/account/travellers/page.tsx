"use client";

import { useEffect, useState } from "react";
import { Notice } from "@/components/Notice";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SavedTraveller } from "@/lib/types";

const emptyForm = { full_name: "", date_of_birth: "", nationality: "", passport_number: "", passport_expiry: "", notes: "" };

export default function TravellersPage() {
  const { user } = useAuth();
  const [travellers, setTravellers] = useState<SavedTraveller[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  function load() {
    if (!user) return;
    Promise.resolve(getSupabaseBrowserClient().from("travelos_public_saved_travellers").select("*").order("created_at", { ascending: false }))
      .then(({ data }) => setTravellers((data as SavedTraveller[]) || [])).finally(() => setLoading(false));
  }
  useEffect(load, [user]);

  const set = (key: keyof typeof emptyForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !form.full_name.trim()) return setError("Traveller name is required.");
    setAdding(true); setError("");
    const { error: insertError } = await getSupabaseBrowserClient().from("travelos_public_saved_travellers").insert({
      customer_id: user.id, full_name: form.full_name,
      date_of_birth: form.date_of_birth || null, nationality: form.nationality || null,
      passport_number: form.passport_number || null, passport_expiry: form.passport_expiry || null, notes: form.notes || null,
    });
    setAdding(false);
    if (insertError) return setError("Unable to save this traveller right now.");
    setForm(emptyForm); load();
  }

  async function remove(id: string) {
    await getSupabaseBrowserClient().from("travelos_public_saved_travellers").delete().eq("id", id);
    load();
  }

  return <>
    <form className="filter-panel" onSubmit={add} style={{marginBottom:24}}>
      <div className="form-grid three" style={{marginBottom:16}}>
        <div className="field"><label>Full name *</label><input className="input" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} /></div>
        <div className="field"><label>Date of birth</label><input className="input" type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} /></div>
        <div className="field"><label>Nationality</label><input className="input" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} /></div>
        <div className="field"><label>Passport number</label><input className="input" value={form.passport_number} onChange={(e) => set("passport_number", e.target.value)} /></div>
        <div className="field"><label>Passport expiry</label><input className="input" type="date" value={form.passport_expiry} onChange={(e) => set("passport_expiry", e.target.value)} /></div>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <button className="button button-primary" type="submit" disabled={adding}>{adding ? "Saving…" : "Add traveller"}</button>
    </form>
    {loading ? null : travellers.length ? <div className="card-grid">{travellers.map((t) => <article className="info-card service-body" key={t.id}>
      <h3>{t.full_name}</h3>
      <p>{t.nationality || "Nationality not set"}{t.passport_number ? ` · Passport ${t.passport_number}` : ""}{t.date_of_birth ? ` · DOB ${t.date_of_birth}` : ""}</p>
      <button className="button button-ghost" type="button" onClick={() => remove(t.id)} style={{marginTop:12}}>Remove</button>
    </article>)}</div> : <div className="empty-state"><b>No saved travellers yet.</b>Add travellers here to speed up future bookings.</div>}
  </>;
}
