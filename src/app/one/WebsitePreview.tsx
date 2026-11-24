"use client";
import Image from "next/image";
import type { CSSProperties } from "react";
import { SAMPLE_TOURS, type WebsiteTheme } from "./website-themes";
import s from "./sales.module.css";

/** A sample customer website rendered in one theme model. Nothing here is bookable. */
export default function WebsitePreview({ theme, agency, compact = false }: { theme: WebsiteTheme; agency: string; compact?: boolean }) {
  const name = agency.trim() || "Your Agency";
  const style = { ...theme.vars } as CSSProperties;
  return <div className={`${s.site} ${theme.serif ? s.siteSerif : ""} ${compact ? s.siteCompact : ""}`} style={style} aria-label={`Sample customer website for ${name} in the ${theme.name} theme`}>
    <div className={s.siteNav}>
      <strong className={s.siteLogo}>{name}</strong>
      <span className={s.siteLinks} aria-hidden="true"><span>Tours</span><span>Hotels</span><span>Visas</span><span>Contact</span></span>
      <span className={s.siteCta}>Enquire</span>
    </div>
    <div className={s.siteHero}>
      <Image src={theme.heroImage} alt="" fill sizes={compact ? "(max-width: 900px) 92vw, 640px" : "100vw"} />
      <div className={s.siteHeroCopy}>
        <small>{name.toUpperCase()} · SRI LANKA HOLIDAYS</small>
        <h3>Sri Lanka, planned around you.</h3>
        <p>Private tours with hand-picked hotels, a driver-guide and 24/7 local support.</p>
        <div className={s.siteSearch} aria-hidden="true"><span>Where to?</span><span>When?</span><span>2 adults</span><b>Search</b></div>
      </div>
    </div>
    <div className={s.siteTours}>
      <p className={s.siteKicker}>Popular tours</p>
      <div className={s.siteTourGrid}>
        {SAMPLE_TOURS.slice(0, compact ? 2 : 3).map((tour) => <article key={tour.name} className={s.siteTour}>
          <div className={s.siteTourImg}><Image src={tour.image} alt="" fill sizes="(max-width: 900px) 45vw, 300px" /></div>
          <div className={s.siteTourBody}><h4>{tour.name}</h4><small>{tour.places}</small><p><span>{tour.nights} nights · from</span> <b>USD {tour.from}</b></p></div>
        </article>)}
      </div>
    </div>
  </div>;
}
