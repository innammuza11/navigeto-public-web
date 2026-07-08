"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CustomerEnquiry } from "@/lib/types";

export default function EnquiriesPage() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.resolve(getSupabaseBrowserClient().from("travelos_public_enquiries")
      .select("id,public_ref,enquiry_type,status,subject,travel_start_date,travel_end_date,created_at")
      .order("created_at", { ascending: false }))
      .then(({ data }) => setEnquiries((data as CustomerEnquiry[]) || [])).finally(() => setLoading(false));
  }, [user]);

  if (loading) return null;
  if (!enquiries.length) return <div className="empty-state"><b>No enquiries yet.</b>Requests you submit while signed in will appear here with their TravelOS reference and status.</div>;

  return <div className="card-grid">{enquiries.map((e) => <article className="info-card service-body" key={e.id}>
    <div className="card-top"><h3 style={{textTransform:"capitalize"}}>{e.enquiry_type.replace(/_/g, " ")}</h3><span className={`badge`}>{e.status}</span></div>
    <p>Reference <b>{e.public_ref}</b></p>
    {e.subject ? <p>{e.subject}</p> : null}
    {e.travel_start_date ? <p className="location">{e.travel_start_date}{e.travel_end_date ? ` – ${e.travel_end_date}` : ""}</p> : null}
    <p className="location">Submitted {new Date(e.created_at).toLocaleDateString()}</p>
  </article>)}</div>;
}
