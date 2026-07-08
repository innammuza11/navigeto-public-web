"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { todayIso } from "@/lib/format";
import { useSite } from "@/components/SiteProvider";
import { HotelIcon, TransferIcon, TourIcon } from "@/components/icons";

type Tab = "hotels" | "transfers" | "tours";
const tabIcons = { hotels: HotelIcon, transfers: TransferIcon, tours: TourIcon } as const;

export function HomeSearch() {
  const router = useRouter();
  const { config } = useSite();
  const [tab, setTab] = useState<Tab>("hotels");
  const availableTabs = ([config.hotel_enabled ? "hotels" : null, config.transfer_enabled ? "transfers" : null, config.tour_enabled ? "tours" : null].filter(Boolean) as Tab[]);
  const activeTab = availableTabs.includes(tab) ? tab : availableTabs[0];
  const [form, setForm] = useState({ destination: "", checkin: "", checkout: "", guests: "2", origin: "Bandaranaike International Airport", transferTo: "", date: "", vehicle: "Sedan Car", duration: "" });
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (activeTab === "hotels") {
      const q = new URLSearchParams({ q: form.destination, checkin: form.checkin, checkout: form.checkout, guests: form.guests });
      router.push(`/hotels?${q.toString()}`);
    } else if (activeTab === "transfers") {
      const q = new URLSearchParams({ origin: form.origin, destination: form.transferTo, date: form.date, vehicle: form.vehicle });
      router.push(`/transfers?${q.toString()}`);
    } else {
      const q = form.duration ? `?duration=${encodeURIComponent(form.duration)}` : "";
      router.push(`/tours${q}`);
    }
  }

  if (!activeTab) return <div className="search-panel"><div className="quick-form"><div className="field span-2"><label>Tailor-made enquiries</label><p>Send your dates and travel requirements directly to the Navigeto team.</p></div><button className="button button-primary" type="button" onClick={() => router.push("/custom-trip")}>Plan a custom trip</button></div></div>;

  return <div className="search-panel">
    <div className="tab-row">
      {availableTabs.map((item) => { const Icon = tabIcons[item]; return <button type="button" className={`tab-button ${activeTab === item ? "active" : ""}`} onClick={() => setTab(item)} key={item}><Icon size={16} className="nav-icon" />{item === "hotels" ? "Hotels" : item === "transfers" ? "Transfers" : "Tours"}</button>; })}
    </div>
    <form className="quick-form" onSubmit={submit}>
      {activeTab === "hotels" ? <>
        <div className="field"><label>Hotel or destination</label><input className="input" value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Kandy, Bentota, Ella…" /></div>
        <div className="field"><label>Check-in</label><input className="input" type="date" min={todayIso()} value={form.checkin} onChange={(e) => set("checkin", e.target.value)} required /></div>
        <div className="field"><label>Check-out</label><input className="input" type="date" min={form.checkin || todayIso()} value={form.checkout} onChange={(e) => set("checkout", e.target.value)} required /></div>
        <div className="field"><label>Guests</label><input className="input" type="number" min="1" value={form.guests} onChange={(e) => set("guests", e.target.value)} /></div>
      </> : activeTab === "transfers" ? <>
        <div className="field"><label>Pick-up</label><input className="input" value={form.origin} onChange={(e) => set("origin", e.target.value)} required /></div>
        <div className="field"><label>Drop-off</label><input className="input" value={form.transferTo} onChange={(e) => set("transferTo", e.target.value)} placeholder="Kandy, Galle, Ella…" required /></div>
        <div className="field"><label>Date</label><input className="input" type="date" min={todayIso()} value={form.date} onChange={(e) => set("date", e.target.value)} required /></div>
        <div className="field"><label>Vehicle</label><select className="select" value={form.vehicle} onChange={(e) => set("vehicle", e.target.value)}><option>Sedan Car</option><option>Toyota KDH</option><option>Mini Coach</option><option>Large Coach</option></select></div>
      </> : <>
        <div className="field"><label>Tour style</label><select className="select"><option>Private Sri Lanka Tour</option><option>Family Holiday</option><option>Honeymoon</option><option>Luxury Journey</option><option>Group Tour</option></select></div>
        <div className="field"><label>Duration</label><select className="select" value={form.duration} onChange={(e) => set("duration", e.target.value)}><option value="">Any duration</option><option value="5">4–5 nights</option><option value="7">6–7 nights</option><option value="10">8+ nights</option></select></div>
        <div className="field"><label>Travellers</label><input className="input" type="number" min="1" value={form.guests} onChange={(e) => set("guests", e.target.value)} /></div>
        <div className="field"><label>Start date</label><input className="input" type="date" min={todayIso()} value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
      </>}
      <button className="button button-primary" type="submit">{activeTab === "hotels" ? "Search hotels" : activeTab === "transfers" ? "Get transfer rate" : "Explore tours"}</button>
    </form>
  </div>;
}
