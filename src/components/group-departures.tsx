"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { liveApi } from "@/lib/live-api";
import { canRequestGroup, groupRequest, type GroupDeparture } from "@/lib/group-departures";
import { DestinationCover } from "./destination-cover";
import styles from "./group-departures.module.css";
const date = (value:string) => new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(`${value}T12:00:00Z`));
const money = (value:number,currency:string) => `${currency} ${Number(value).toLocaleString(undefined,{maximumFractionDigits:2})}`;
export function GroupDepartures({ packageSlug, departureId = "" }: { packageSlug?: string; departureId?: string }) {
  const [rows,setRows] = useState<GroupDeparture[]>([]), [loading,setLoading] = useState(true), [error,setError] = useState("");
  const [hasMore,setHasMore] = useState(false), [country,setCountry] = useState("");
  const [selected,setSelected] = useState<GroupDeparture|null>(null), [busy,setBusy] = useState(false), [requestError,setRequestError] = useState("");
  const [reference,setReference] = useState(""); const lock = useRef(false); const requestRef = useRef<HTMLDivElement>(null);
  const deepLink = packageSlug ? "" : departureId;
  useEffect(()=>{
    let active=true;
    const departure = packageSlug ? "" : departureId;
    liveApi.groupDepartures({package_slug:packageSlug,departure_id:departure || undefined}).then(result=>{
      if (!active) return;setRows(result.results);setHasMore(result.has_more);setSelected(null);setReference("");setCountry("");
    }).catch(()=>{if(active)setError("Future departures are temporarily unavailable. Please contact Navigeto or try again later.");}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[packageSlug,departureId]);
  async function loadMore() {
    setLoading(true);setError("");
    try {const result=await liveApi.groupDepartures({package_slug:packageSlug,offset:rows.length});setRows(previous=>[...previous,...result.results]);setHasMore(result.has_more);}
    catch {setError("More departures could not be loaded. Please try again.");} finally {setLoading(false);}
  }
  function choose(row:GroupDeparture) {if(lock.current)return;if(reference)liveApi.startSeparateEnquiry();setSelected(row);setReference("");setRequestError("");requestRef.current?.scrollIntoView({behavior:"smooth",block:"start"});}
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(lock.current||!selected)return;
    lock.current=true;setBusy(true);setRequestError("");
    const data=new FormData(event.currentTarget);const pax=Number(data.get("travellers"));
    try {
      const selection=groupRequest(selected,pax);
      const result=await liveApi.enquiry({...selection,customer_name:String(data.get("name")||""),email:String(data.get("email")||""),whatsapp:String(data.get("whatsapp")||""),notes:String(data.get("notes")||""),consent_contact:true},()=>{groupRequest(selected,pax);});
      setReference(result.enquiry.public_ref);
    } catch(err) {setRequestError(err instanceof Error?err.message:"Your request could not be submitted. Retry with the same details.");}
    finally {lock.current=false;setBusy(false);}
  }
  if(packageSlug&&!loading&&!rows.length&&!error)return null;
  return <section className={`shell ${styles.section}`} id="group-departures">
    <div className={styles.intro}><span className={styles.rule} aria-hidden="true"/><p className="eyebrow">International group journeys</p>{packageSlug?<h2>Choose your departure.</h2>:<h1>A date to look forward to.<br/><em>A world to share.</em></h1>}<p>Thoughtfully arranged journeys from Sri Lanka, with a small group and a clear plan. Choose a date, review what’s included and let us confirm your places.</p></div>
    {!packageSlug&&rows.length>0&&<div className={styles.toolbar}><label>Destination <select value={country} onChange={event=>setCountry(event.target.value)}><option value="">All loaded destinations</option>{[...new Set(rows.map(row=>row.country))].sort().map(value=><option key={value}>{value}</option>)}</select></label><Link href="/tours/international">Explore every international itinerary ↗</Link>{deepLink&&<Link href="/group-tours">View all departures</Link>}</div>}
    {loading&&!rows.length&&<p role="status">Finding future journeys…</p>}{error&&<p className={styles.notice} role="alert">{error}</p>}
    {!loading&&!rows.length&&!error&&<p className={styles.notice}>New group departures are being prepared. <Link href="/custom-trip">Tell us where you’d love to go →</Link></p>}
    <div className={styles.grid}>{rows.filter(row=>!country||row.country===country).map(row=><article key={row.id} className={styles.card}>
      {!packageSlug&&<div className={styles.art}><DestinationCover identity={row.package_slug} country={row.country} title={row.package_title} places={row.destinations}/></div>}
      <div className={styles.body}><p className="eyebrow">{row.country} · {row.label}</p><h3>{row.package_title}</h3><span className={styles.status}>{!canRequestGroup(row)?"Currently full / closed":row.status==="on_request"?"Availability on request":"Open for requests"}</span>
      <div className={styles.dates}><div><small>Departure</small><b>{date(row.departure_date)}</b></div><div><small>Return</small><b>{date(row.return_date)}</b></div></div>
      <p>From {row.departure_airport}<br/>Book by {date(row.booking_deadline)}<br/>{row.status === "sold_out" ? "Group currently full" : `${row.places_available} indicative places`} · minimum group {row.minimum_group}</p>
      <div className={styles.price}><small>Adult price per person · {row.room_basis}</small><strong>{money(row.price_per_person,row.currency)}</strong><p>{row.deposit_per_person>0?`Deposit ${money(row.deposit_per_person,row.currency)} per person after confirmation.`:"Deposit arranged after confirmation."}</p></div>
      <details className={styles.terms}><summary>Flights, visa &amp; booking terms</summary><p><b>Flights:</b> {row.flight_terms}</p><p><b>Visa:</b> {row.visa_terms}</p><p><b>Single supplement:</b> {money(row.single_supplement,row.currency)} per person.</p><p>{row.booking_terms}</p></details>
      <div className={styles.actions}><button className="button button-primary" disabled={!canRequestGroup(row)||busy} onClick={()=>choose(row)}>Request places →</button><Link href={`/tours/package/${encodeURIComponent(row.package_slug)}`}>Full itinerary</Link><Link href={`/group-tours?departure=${encodeURIComponent(row.id)}`}>Departure link ↗</Link></div></div>
    </article>)}</div>
    {hasMore&&<div className={styles.toolbar}><button className="button button-primary" disabled={loading} onClick={loadMore}>{loading?"Loading…":"More departures"}</button></div>}
    <div ref={requestRef}>{selected&&<div className={styles.request}>{reference?<div role="status"><p className="eyebrow">Place request received</p><h2>Something wonderful is taking shape.</h2><p>Your reference is <b>{reference}</b>. Our team will confirm availability, the final price and deposit instructions. Your places are not reserved yet.</p></div>:<form onSubmit={submit}><p className="eyebrow">{selected.label} · {date(selected.departure_date)}</p><h2>Join this journey.</h2><p className={styles.notice}>No payment now. Places, child prices, room arrangements and minimum group operation are confirmed by our team.</p><fieldset disabled={busy}><legend>Your contact details</legend><div className={styles.formGrid}><label>Name<input name="name" required maxLength={160} autoComplete="name"/></label><label>Email<input name="email" required type="email" maxLength={200} autoComplete="email"/></label><label>WhatsApp<input name="whatsapp" required maxLength={80} autoComplete="tel"/></label><label>Travellers (including children)<input name="travellers" required type="number" min={1} max={Math.min(20,selected.places_available)} defaultValue={1}/></label></div><label>Room preferences, children’s ages or questions<textarea name="notes" maxLength={2500} rows={3}/></label><label className={styles.consent}><input type="checkbox" required/>I agree to be contacted about this departure and understand this is a request, subject to availability and the published booking terms.</label></fieldset>{requestError&&<p role="alert" className={styles.error}>{requestError}</p>}<div className={styles.actions}><button className="button button-primary" disabled={busy}>{busy?"Submitting…":"Send place request →"}</button>{requestError&&<button type="button" disabled={busy} onClick={()=>{liveApi.startSeparateEnquiry();setRequestError("");}}>Start a separate request</button>}</div></form>}</div>}</div>
  </section>;
}
