"use client";

import { useEffect, useRef, useState } from "react";
import "./itinerary-journey-map.css";

/**
 * ItineraryJourneyMap — a self-contained, drop-in interactive route map for a
 * tour/journey detail page. Styled to match the cinematic "journeys" design
 * (reads --paper/--ink/--forest/--gold from the host app, with fallbacks).
 *
 * Drop-in usage inside the itinerary section:
 *   <ItineraryJourneyMap itinerary={pkg.itinerary} destinations={pkg.destinations} />
 *
 * Clicking a stop scrolls to that day. By default it looks for an element with
 * id `journey-day-${day}` (add that id to each day block), or pass `onSelectDay`
 * to handle selection yourself.
 */

export type JourneyDay = {
  day: number;
  title?: string;
  route?: string | null;
  overnight?: string | null;
  hotel_name?: string | null;
};

type Stop = { name: string; day: number };

function titleCase(input: string): string {
  return input.toLowerCase().split(/\s+/).map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ").trim();
}

/** Build the stop sequence from overnight/hotel per day, collapsing consecutive
 *  duplicates (fixes the "Kandy → Kandy → Nuwara Eliya → Nuwara Eliya" issue).
 *  Falls back to the tour's destination list when overnights aren't set. */
function buildStops(itinerary: JourneyDay[], destinations: string[] = []): Stop[] {
  const stops: Stop[] = [];
  let last = "";
  for (const d of itinerary) {
    const place = titleCase(String(d.overnight || d.hotel_name || ""));
    if (place && place.toLowerCase() !== last) { stops.push({ name: place, day: d.day }); last = place.toLowerCase(); }
  }
  if (stops.length >= 2) return stops.slice(0, 8);
  const dests = [...new Set(destinations.map((x) => titleCase(x)))].filter(Boolean).slice(0, 8);
  if (dests.length < 2) return [];
  const span = Math.max(1, itinerary.length || dests.length);
  return dests.map((name, i) => ({ name, day: Math.max(1, Math.round((i * (span - 1)) / (dests.length - 1)) + 1) }));
}

export function ItineraryJourneyMap({
  itinerary,
  destinations = [],
  onSelectDay,
  dayAnchorId = (day: number) => `journey-day-${day}`,
  title = "The journey, mapped",
  eyebrow = "Your route",
  subtitle = "Tap any stop to jump to that day — every leg is driven privately with your Navigeto chauffeur-guide.",
}: {
  itinerary: JourneyDay[];
  destinations?: string[];
  onSelectDay?: (day: number) => void;
  dayAnchorId?: (day: number) => string;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
}) {
  const trackRef = useRef<SVGPathElement | null>(null);
  const drawRef = useRef<SVGPathElement | null>(null);
  const vehicleRef = useRef<SVGGElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [pins, setPins] = useState<Array<{ x: number; y: number }>>([]);
  const [activeDay, setActiveDay] = useState<number | null>(null);

  const stops = buildStops(itinerary, destinations);
  const VBW = 1000, VBH = 230;
  const d = `M40 ${VBH * 0.62} C ${VBW * 0.2} ${VBH * 0.15}, ${VBW * 0.32} ${VBH * 0.9}, ${VBW * 0.5} ${VBH * 0.5} S ${VBW * 0.78} ${VBH * 0.1}, ${VBW - 40} ${VBH * 0.58}`;
  const stopsKey = stops.map((s) => `${s.name}:${s.day}`).join("|");

  useEffect(() => {
    const track = trackRef.current, draw = drawRef.current, vehicle = vehicleRef.current;
    if (!track || !draw || stops.length < 2) return;
    const len = track.getTotalLength();
    const n = stops.length;
    setPins(stops.map((_, i) => {
      const at = n <= 1 ? 0.5 : i / (n - 1);
      const p = track.getPointAtLength(len * at);
      return { x: p.x, y: p.y };
    }));
    draw.style.strokeDasharray = `${len}`;
    draw.style.strokeDashoffset = `${len}`;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0; let started = false;
    const runVehicle = () => {
      let start = 0;
      const step = (ts: number) => {
        if (!start) start = ts;
        const prog = Math.min((ts - start) / 4800, 1);
        if (vehicle) {
          const p = track.getPointAtLength(len * prog);
          vehicle.setAttribute("transform", `translate(${p.x} ${p.y})`);
          vehicle.style.opacity = prog > 0.002 && prog < 0.999 ? "1" : "0";
        }
        if (prog < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const begin = () => {
      if (started) return; started = true;
      if (reduce) { draw.style.strokeDashoffset = "0"; return; }
      draw.style.transition = "stroke-dashoffset 4.8s cubic-bezier(.4,.1,.2,1)";
      requestAnimationFrame(() => { draw.style.strokeDashoffset = "0"; });
      runVehicle();
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { begin(); io.disconnect(); } });
    }, { threshold: 0.3 });
    if (wrapRef.current) io.observe(wrapRef.current);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopsKey]);

  if (stops.length < 2) return null;

  const select = (day: number) => {
    setActiveDay(day);
    if (onSelectDay) { onSelectDay(day); return; }
    const el = typeof document !== "undefined" ? document.getElementById(dayAnchorId(day)) : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="ijm" ref={wrapRef}>
      <p className="ijm-eyebrow">{eyebrow}</p>
      <h3 className="ijm-title">{title}</h3>
      <p className="ijm-sub">{subtitle}</p>

      <svg className="ijm-svg" viewBox={`0 0 ${VBW} ${VBH}`} role="img" aria-label={`Route: ${stops.map((s) => s.name).join(", ")}`}>
        <defs>
          <linearGradient id="ijmGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9be3df" />
            <stop offset="0.5" stopColor="#d8a45a" />
            <stop offset="1" stopColor="#e0894a" />
          </linearGradient>
        </defs>
        <path ref={trackRef} className="ijm-track" d={d} />
        <path ref={drawRef} className="ijm-draw" d={d} />
        {pins.map((p, i) => (
          <g
            key={i}
            className="ijm-pin"
            transform={`translate(${p.x} ${p.y})`}
            role="button"
            tabIndex={0}
            aria-label={`Day ${stops[i].day}: ${stops[i].name}`}
            onClick={() => select(stops[i].day)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(stops[i].day); } }}
          >
            <circle className="ijm-hit" r="22" />
            <circle className="ijm-ring" r={activeDay === stops[i].day ? 11 : 9} fill="#071914" stroke="#d8a45a" strokeWidth="3" />
            <circle r="3.5" fill="#d8a45a" />
            <text className="ijm-pin-label" x="0" y={i % 2 === 0 ? -20 : 36} textAnchor="middle">{stops[i].name}</text>
            <text className="ijm-pin-day" x="0" y={i % 2 === 0 ? -35 : 50} textAnchor="middle">DAY {stops[i].day}</text>
          </g>
        ))}
        <g ref={vehicleRef} className="ijm-vehicle" style={{ opacity: 0 }}>
          <circle r="13" fill="#faf8f2" />
          <text x="0" y="4.5" textAnchor="middle" fontSize="13">🚙</text>
        </g>
      </svg>

      <div className="ijm-legend">
        {stops.map((s) => (
          <button key={`${s.name}-${s.day}`} type="button" className={`ijm-chip${activeDay === s.day ? " active" : ""}`} onClick={() => select(s.day)}>
            <b>{s.day}</b> {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ItineraryJourneyMap;
