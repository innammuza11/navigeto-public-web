/* eslint-disable @next/next/no-img-element -- brand logo uses a direct request, as in the site header */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintOnLoad } from "@/components/print-on-load";
import { printableItinerary } from "@/lib/itinerary-print";
import { liveApi } from "@/lib/live-api";
import { SITE_URL } from "@/lib/seo";
import { tourDisplayName } from "@/lib/tour-presentation";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default async function ItinerarySheet({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await liveApi.tour(slug).then(result => result.result).catch(() => null);
  if (!tour) notFound();
  const sheet = printableItinerary(tour);
  return <main className="itinerary-sheet">
    <header><img src="/media/navigeto-logo.webp" width={2000} height={655} alt="Navigeto Travels"/><PrintOnLoad/></header>
    <p className="eyebrow">Private journey · {tour.country || "Sri Lanka"}</p>
    <h1>{tourDisplayName(tour)}</h1>
    {sheet.length || sheet.route ? <p className="itinerary-sheet-meta">{[sheet.length, sheet.route].filter(Boolean).join(" · ")}</p> : null}
    {sheet.summary ? <p>{sheet.summary}</p> : null}
    <h2>Day by day</h2>
    <ol>{sheet.days.map(day => <li key={`${day.label}-${day.title}`}><b>{day.label}: {day.title}</b>{day.description ? <p>{day.description}</p> : null}{day.overnight || day.meals ? <small>{[day.overnight && `Overnight: ${day.overnight}`, day.meals && `Meals: ${day.meals}`].filter(Boolean).join(" · ")}</small> : null}</li>)}</ol>
    {sheet.inclusions.length ? <><h2>Included</h2><ul>{sheet.inclusions.map(item => <li key={item}>{item}</li>)}</ul></> : null}
    {sheet.exclusions.length ? <><h2>Not included</h2><ul>{sheet.exclusions.map(item => <li key={item}>{item}</li>)}</ul></> : null}
    <footer><p>Every route can be adjusted: nights, hotels, pace and stops. Prices and availability are confirmed for your dates before booking.</p><p><b>Navigeto Travels</b> · WhatsApp +94 77 420 6166 · info@navigeto.com · {SITE_URL.replace(/^https?:\/\//, "")}/tours/package/{tour.slug}</p></footer>
  </main>;
}
