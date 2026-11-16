"use client";
import Link from "next/link";
import { useState } from "react";
import WebsitePreview from "./WebsitePreview";
import { cleanAgencyName, WEBSITE_THEMES } from "./website-themes";
import s from "./sales.module.css";

const adminRows = [
  ["NQ-1042", "Mr & Mrs Perera · 5N Culture & Tea", "Quoted", "USD 1,380"],
  ["NQ-1041", "Patel family · 7N South & Hills", "Confirmed", "USD 3,240"],
  ["NQ-1039", "Lee group (12) · 4N Beaches", "Costing", "USD 6,900"],
];

/** "See it live": the agency admin and the customer website, side by side in tabs. */
export default function LiveDemos() {
  const [tab, setTab] = useState<"admin" | "website">("website");
  const [themeId, setThemeId] = useState(WEBSITE_THEMES[0].id);
  const [agency, setAgency] = useState("");
  const theme = WEBSITE_THEMES.find((t) => t.id === themeId) ?? WEBSITE_THEMES[0];
  const websiteHref = `/one/website-demo?theme=${theme.id}${agency.trim() ? `&agency=${encodeURIComponent(agency.trim())}` : ""}`;

  return <div className={s.live}>
    <div className={s.liveTabs} role="tablist" aria-label="Choose a demo">
      <button role="tab" id="tab-website" aria-controls="panel-website" aria-selected={tab === "website"} onClick={() => setTab("website")}>
        <b>Your customer website</b><small>4 theme models · your name on it</small>
      </button>
      <button role="tab" id="tab-admin" aria-controls="panel-admin" aria-selected={tab === "admin"} onClick={() => setTab("admin")}>
        <b>Your agency admin</b><small>Cost · quote · book · settle</small>
      </button>
    </div>

    {tab === "website" ? <div role="tabpanel" id="panel-website" aria-labelledby="tab-website" className={s.livePanel}>
      <div className={s.liveControls}>
        <label className={s.agencyField}>Type your agency name
          <input value={agency} onChange={(e) => setAgency(cleanAgencyName(e.target.value))} placeholder="e.g. Lanka Journeys" maxLength={32} autoComplete="organization" />
        </label>
        <fieldset className={s.themePicker}><legend>Pick a theme</legend>
          {WEBSITE_THEMES.map((t) => <label key={t.id} className={t.id === theme.id ? s.themeOn : undefined}>
            <input type="radio" name="theme" value={t.id} checked={t.id === theme.id} onChange={() => setThemeId(t.id)} />
            <span className={s.swatch} style={{ background: `linear-gradient(135deg, ${t.vars["--w-bg"]} 0 50%, ${t.vars["--w-accent"]} 50% 100%)` }} aria-hidden="true" />
            <span><b>{t.name}</b><small>{t.mood}</small></span>
          </label>)}
        </fieldset>
        <Link href={websiteHref} className={s.cta}>Open the full website demo <span aria-hidden="true">↗</span></Link>
        <p className={s.liveNote}>Sample website with example tours and prices. Your real site uses your logo, tours and contact details.</p>
      </div>
      <div className={s.browser}><div className={s.browserBar} aria-hidden="true"><i /><i /><i /><span>{(agency.trim() || "youragency").toLowerCase().replace(/[^a-z0-9]+/g, "")}.com</span></div><WebsitePreview theme={theme} agency={agency} compact /></div>
    </div> : <div role="tabpanel" id="panel-admin" aria-labelledby="tab-admin" className={s.livePanel}>
      <div className={s.liveControls}>
        <h3>Every enquiry, from first quote to final settlement.</h3>
        <ul className={s.ticks}>
          <li>Build a cost sheet from hotels, transport and extras</li>
          <li>Send a branded quotation in your agency’s name</li>
          <li>Turn a “yes” into a reservation with vouchers</li>
          <li>See profit per booking after real supplier costs</li>
        </ul>
        <Link href="/one/demo" className={s.cta}>Open the interactive admin demo <span aria-hidden="true">↗</span></Link>
        <p className={s.liveNote}>Sample workspace. Nothing is booked, paid or sent.</p>
      </div>
      <div className={s.browser}><div className={s.browserBar} aria-hidden="true"><i /><i /><i /><span>admin.navigeto.com</span></div>
        <div className={s.admin} aria-label="Sample agency admin screen">
          <aside><b>Navigeto One</b>{["Dashboard", "Quick Cost", "Quotations", "Reservations", "Hotels", "Accounts"].map((m, i) => <span key={m} className={i === 2 ? s.adminOn : undefined}>{m}</span>)}</aside>
          <div className={s.adminMain}>
            <div className={s.adminKpis}><div><small>Open quotes</small><b>18</b></div><div><small>Confirmed this month</small><b>7</b></div><div><small>Margin (sample)</small><b>21%</b></div></div>
            <table><thead><tr><th>Ref</th><th>Client & trip</th><th>Stage</th><th>Selling</th></tr></thead>
              <tbody>{adminRows.map(([ref, trip, stage, price]) => <tr key={ref}><td>{ref}</td><td>{trip}</td><td><span data-stage={stage}>{stage}</span></td><td>{price}</td></tr>)}</tbody></table>
          </div>
        </div>
      </div>
    </div>}
  </div>;
}
