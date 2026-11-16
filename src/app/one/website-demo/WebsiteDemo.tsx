"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import WebsitePreview from "../WebsitePreview";
import { cleanAgencyName, themeById, WEBSITE_THEMES } from "../website-themes";
import s from "../sales.module.css";

export default function WebsiteDemo() {
  const params = useSearchParams();
  const [themeId, setThemeId] = useState(() => themeById(params.get("theme")).id);
  const [agency, setAgency] = useState(() => cleanAgencyName(params.get("agency") || ""));
  const theme = themeById(themeId);
  return <div className={s.demoPage}>
    <div className={s.demoBar}>
      <Link href="/one" className={s.demoBack}>← Navigeto One</Link>
      <span className={s.demoBadge}>SAMPLE CUSTOMER WEBSITE</span>
      <label className={s.demoName}><span className={s.srOnly}>Agency name</span><input value={agency} onChange={(e) => setAgency(cleanAgencyName(e.target.value))} placeholder="Your agency name" maxLength={32} /></label>
      <div className={s.demoThemes} role="radiogroup" aria-label="Theme">
        {WEBSITE_THEMES.map((t) => <button key={t.id} role="radio" aria-checked={t.id === theme.id} onClick={() => setThemeId(t.id)}>
          <span className={s.swatch} style={{ background: `linear-gradient(135deg, ${t.vars["--w-bg"]} 0 50%, ${t.vars["--w-accent"]} 50% 100%)` }} aria-hidden="true" />{t.name}
        </button>)}
      </div>
      <a className={s.cta} href="https://admin.navigeto.com/partner/register?type=agent">Start free trial <span aria-hidden="true">↗</span></a>
    </div>
    <WebsitePreview theme={theme} agency={agency} />
    <div className={s.demoFoot}><p>Example tours and prices for illustration. Your website is set up by the Navigeto team with your logo, tours, hotels and contact details. Website scope and price are confirmed in your written proposal.</p><Link href="/one#demo">Talk to us about your website ↗</Link></div>
  </div>;
}
