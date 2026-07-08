"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { LoadingCards } from "@/components/Loading";
import { Notice } from "@/components/Notice";
import { FALLBACK_PACKAGES } from "@/lib/defaults";
import { formatMoney } from "@/lib/format";
import { listTours } from "@/lib/travelos";
import type { PublicPackage } from "@/lib/types";

function ToursContent() {
  const params = useSearchParams();
  const [rows, setRows] = useState<PublicPackage[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [duration, setDuration] = useState(params.get("duration") || ""); const [type, setType] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");
  useEffect(() => { listTours().then((result) => setRows(result.length ? result : FALLBACK_PACKAGES)).catch(() => { setRows(FALLBACK_PACKAGES); setError("Live package publishing is not connected yet, so starter programs are shown."); }).finally(() => setLoading(false)); }, []);

  const styles = useMemo(() => [...new Set(rows.map((tour) => tour.package_type).filter(Boolean))] as string[], [rows]);
  const tags = useMemo(() => [...new Set(rows.flatMap((tour) => tour.tags))].sort((a, b) => a.localeCompare(b)), [rows]);
  const toggleTag = (tag: string) => setActiveTags((current) => current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]);

  const filtered = useMemo(() => rows.filter((tour) =>
    (!duration || (duration === "5" ? tour.duration_nights <= 5 : duration === "7" ? tour.duration_nights >= 6 && tour.duration_nights <= 7 : tour.duration_nights >= 8)) &&
    (!type || tour.package_type === type) &&
    (!featuredOnly || tour.featured) &&
    (!maxPrice || !tour.price_from || tour.price_from <= Number(maxPrice)) &&
    (activeTags.length === 0 || activeTags.every((tag) => tour.tags.includes(tag)))
  ), [rows, duration, type, featuredOnly, maxPrice, activeTags]);

  return <>
    <PageHero eyebrow="Sri Lanka Tour Packages" title="Start with a proven route. Personalise every detail." description="Choose a published Navigeto program, then adjust hotels, pace, activities, meal plan and transport for your travellers." />
    <div className="shell content-wrap">
      <div className="filter-panel form-grid three">
        <div className="field"><label>Duration</label><select className="select" value={duration} onChange={(e) => setDuration(e.target.value)}><option value="">Any duration</option><option value="5">Up to 5 nights</option><option value="7">6–7 nights</option><option value="10">8+ nights</option></select></div>
        <div className="field"><label>Tour style</label><select className="select" value={type} onChange={(e) => setType(e.target.value)}><option value="">All styles</option>{styles.map((style) => <option key={style} value={style}>{style.replace(/_/g, " ")}</option>)}</select></div>
        <div className="field"><label>Max starting price (USD)</label><input className="input" type="number" min="0" placeholder="Any price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} /></div>
        <div className="field span-2" style={{alignSelf:"end"}}><label className="checkbox-field"><input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} /> Featured programs only</label></div>
        <div className="form-actions" style={{alignSelf:"end"}}><Link className="button button-primary" href="/custom-trip">Create a custom tour</Link></div>
      </div>
      {tags.length ? <div className="tag-filter-row">{tags.map((tag) => <button key={tag} type="button" className={`tag-filter${activeTags.includes(tag) ? " active" : ""}`} onClick={() => toggleTag(tag)}>{tag}</button>)}</div> : null}
      {error ? <Notice>{error}</Notice> : null}
      <div className="results-header"><div><h2>Published tour ideas</h2><p>Prices are shown only when published by Navigeto.</p></div><b>{filtered.length} package{filtered.length === 1 ? "" : "s"}</b></div>
      {loading ? <LoadingCards count={6} /> : filtered.length ? <div className="card-grid">{filtered.map((tour, index) => <article className="tour-card" key={tour.id}>
        <div className="tour-art" style={tour.hero_image_url ? { backgroundImage: `url(${tour.hero_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
          {tour.featured ? <span className="badge" style={{alignSelf:"flex-start"}}>Featured</span> : <span />}
          <span className="duration">{tour.duration_nights} nights · {tour.duration_days} days</span>
          {!tour.hero_image_url ? <span className="tour-emoji">{["🏯","🚂","🌴","🐘"][index % 4]}</span> : null}
        </div>
        <div className="tour-body"><h3>{tour.title}</h3><div className="tour-destinations">{tour.destinations.join(" · ")}</div><p>{tour.summary}</p><div className="tag-row">{tour.tags.slice(0,4).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><div className="tour-bottom"><strong>{formatMoney(tour.price_from, tour.currency || "USD")}</strong><Link className="text-link" href={`/tours/${tour.slug}`}>View itinerary →</Link></div></div></article>)}</div>
        : <div className="empty-state"><b>No tours match these filters.</b>Try widening your duration, price or category selection.</div>}
    </div>
  </>;
}
export default function ToursPage(){return <Suspense fallback={<LoadingCards count={3}/>}><ToursContent/></Suspense>}
