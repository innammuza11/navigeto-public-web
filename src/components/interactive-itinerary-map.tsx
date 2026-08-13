"use client";

import { useMemo, useState } from "react";
import { SRI_LANKA_VECTOR_PATH } from "@/lib/sri-lanka-vector-data";

export type ItineraryDay = {
  day: string;
  title: string;
  copy: string;
  location?: string;
  activities?: string[];
  optionalActivities?: string[];
  meals?: string;
  hotel?: string;
  overnight?: string;
};

type PlaceKind = "gateway" | "heritage" | "hills" | "wildlife" | "coast";
type KnownPlace = { name: string; x: number; y: number; kind: PlaceKind };
type RouteStop = ItineraryDay & KnownPlace;
type AtlasLayer = "all" | "route" | "wildlife" | "heritage" | "hills" | "coast";
type DoodleType = "sigiriya" | "train" | "elephant" | "stupa" | "lighthouse";

const knownPlaces: Array<[string[], KnownPlace]> = [
  [["bandaranaike airport", "colombo airport", "katunayake", "cmb airport", "airport"], { name: "Bandaranaike Airport", x: 23, y: 67, kind: "gateway" }],
  [["anuradhapura"], { name: "Anuradhapura", x: 36, y: 38, kind: "heritage" }],
  [["polonnaruwa"], { name: "Polonnaruwa", x: 55, y: 49, kind: "heritage" }],
  [["trincomalee"], { name: "Trincomalee", x: 68, y: 33, kind: "coast" }],
  [["arugam bay", "pottuvil"], { name: "Arugam Bay", x: 83, y: 74, kind: "coast" }],
  [["nuwara eliya"], { name: "Nuwara Eliya", x: 51, y: 69, kind: "hills" }],
  [["horton plains"], { name: "Horton Plains", x: 49, y: 73, kind: "hills" }],
  [["udawalawe", "uda walawe"], { name: "Udawalawe", x: 55, y: 81, kind: "wildlife" }],
  [["tissamaharama", "tissa"], { name: "Tissamaharama", x: 66, y: 88, kind: "wildlife" }],
  [["pasikuda", "pasikudah"], { name: "Pasikuda", x: 79, y: 47, kind: "coast" }],
  [["sigiriya"], { name: "Sigiriya", x: 49, y: 47, kind: "heritage" }],
  [["dambulla"], { name: "Dambulla", x: 43, y: 50, kind: "heritage" }],
  [["kitulgala"], { name: "Kitulgala", x: 38, y: 68, kind: "hills" }],
  [["haputale"], { name: "Haputale", x: 55, y: 75, kind: "hills" }],
  [["negombo"], { name: "Negombo", x: 20, y: 64, kind: "coast" }],
  [["colombo"], { name: "Colombo", x: 20, y: 71, kind: "gateway" }],
  [["kandy"], { name: "Kandy", x: 42, y: 63, kind: "heritage" }],
  [["tea train", "rail journey", "highlands", "ella"], { name: "Ella", x: 57, y: 74, kind: "hills" }],
  [["yala"], { name: "Yala", x: 69, y: 83, kind: "wildlife" }],
  [["tangalle"], { name: "Tangalle", x: 53, y: 94, kind: "coast" }],
  [["mirissa"], { name: "Mirissa", x: 42, y: 95, kind: "coast" }],
  [["weligama"], { name: "Weligama", x: 38, y: 94, kind: "coast" }],
  [["galle"], { name: "Galle", x: 31, y: 92, kind: "heritage" }],
  [["bentota", "south beach"], { name: "Bentota", x: 25, y: 86, kind: "coast" }],
  [["jaffna"], { name: "Jaffna", x: 25, y: 8, kind: "heritage" }],
];

const dayImages = [
  "/media/beach-south-coast-v1.webp",
  "/media/tour-sigiriya-v1.webp",
  "/media/wildlife-yala-v1.webp",
  "/media/culture-kandy-v1.webp",
  "/media/tour-tea-train-v1.webp",
  "/media/ella-hero-cinematic-v2.webp",
  "/media/heritage-galle-v1.webp",
];

const atlasLandmarks: Array<{ label: string; icon: string; kind: Exclude<AtlasLayer, "all" | "route">; x: number; y: number }> = [
  { label: "Cultural Triangle", icon: "◆", kind: "heritage", x: 48, y: 43 },
  { label: "Kandy", icon: "✦", kind: "heritage", x: 40, y: 61 },
  { label: "Wilpattu", icon: "🐆", kind: "wildlife", x: 23, y: 36 },
  { label: "Yala", icon: "🐘", kind: "wildlife", x: 70, y: 80 },
  { label: "Tea country", icon: "↟", kind: "hills", x: 53, y: 68 },
  { label: "South coast", icon: "≈", kind: "coast", x: 43, y: 95 },
];

const atlasCities: Array<{ name: string; x: number; y: number; anchor: "start" | "end"; capital?: boolean }> = [
  { name: "Jaffna", x: 31, y: 9, anchor: "start" },
  { name: "Anuradhapura", x: 34, y: 39, anchor: "end" },
  { name: "Trincomalee", x: 70, y: 34, anchor: "start" },
  { name: "Sigiriya", x: 49, y: 47, anchor: "end" },
  { name: "Polonnaruwa", x: 59, y: 50, anchor: "start" },
  { name: "Colombo", x: 22, y: 72, anchor: "end", capital: true },
  { name: "Kandy", x: 42, y: 63, anchor: "end" },
  { name: "Nuwara Eliya", x: 51, y: 70, anchor: "end" },
  { name: "Ella", x: 58, y: 75, anchor: "start" },
  { name: "Arugam Bay", x: 81, y: 75, anchor: "start" },
  { name: "Yala", x: 69, y: 84, anchor: "start" },
  { name: "Galle", x: 31, y: 92, anchor: "end" },
];

const atlasRoads = [
  "M31 9 C33 24 31 33 34 39 C39 44 43 46 49 47 C46 53 44 58 42 63 C35 68 27 70 22 72",
  "M34 39 C43 39 54 43 59 50 C66 44 69 38 70 34",
  "M59 50 C66 55 75 62 81 75 C76 79 72 82 69 84 C58 90 43 94 31 92",
  "M42 63 C47 66 49 68 51 70 C54 72 56 74 58 75 C62 78 66 81 69 84",
  "M22 72 C22 81 25 88 31 92 C42 94 54 92 69 84",
  "M34 39 C28 47 24 56 22 72",
  "M49 47 C58 43 64 39 70 34",
];

const atlasRivers = [
  "M43 62 C49 61 53 58 59 50 C62 45 66 40 70 34",
  "M51 69 C56 65 61 62 66 60 C72 59 76 62 79 67",
  "M49 70 C45 75 43 81 44 88",
  "M57 75 C59 80 58 87 55 92",
];

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, " ");

function findKnownPlace(value: string) {
  const text = normalize(value);
  for (const [aliases, place] of knownPlaces) {
    if (aliases.some((alias) => text.includes(alias))) return place;
  }
  return null;
}

function markerLabel(index: number) {
  return String(index + 1).padStart(2, "0");
}

function activityLabel(activity: string, index: number) {
  const cleaned = activity
    .replace(/^[\s\d.)•\-–—]+/, "")
    .replace(/\s+/g, " ")
    .trim();
  const firstThought = cleaned.split(/\s*(?:[:|•]|[–—]\s)\s*/)[0].split(/(?<=[.!?])\s/)[0];
  const withoutTiming = firstThought.replace(/\s*\([^)]*(?:hour|minute|approx|km)[^)]*\)\s*$/i, "").trim();
  const words = withoutTiming.split(" ").filter(Boolean);
  if (!words.length) return `Planned moment ${index + 1}`;
  return `${words.slice(0, 7).join(" ")}${words.length > 7 ? "…" : ""}`;
}

function imageForStop(stop: RouteStop, index: number) {
  const text = normalize(`${stop.name} ${stop.title} ${stop.copy}`);
  if (/sigiriya|dambulla|anuradhapura|polonnaruwa|ancient/.test(text)) return "/media/tour-sigiriya-v1.webp";
  if (/yala|udawalawe|wildlife|safari|elephant/.test(text)) return "/media/wildlife-yala-v1.webp";
  if (/kandy|temple|culture/.test(text)) return "/media/culture-kandy-v1.webp";
  if (/ella|nuwara|haputale|train|tea|highland/.test(text)) return index % 2 ? "/media/ella-hero-cinematic-v2.webp" : "/media/tour-tea-train-v1.webp";
  if (/galle|fort|heritage/.test(text)) return "/media/heritage-galle-v1.webp";
  if (/coast|beach|mirissa|weligama|bentota|negombo|tangalle|arugam/.test(text)) return "/media/beach-south-coast-v1.webp";
  return dayImages[index % dayImages.length];
}

function dayMoments(stop: RouteStop): Array<[string, string]> {
  const text = normalize(`${stop.name} ${stop.title} ${stop.copy}`);
  if (/airport|arrival|ayubowan|negombo/.test(text)) return [
    ["Welcome", "Meet your Navigeto host and settle into the island rhythm."],
    ["Transfer", "Private arrival transfer with time to pause after the flight."],
    ["Evening", "A gentle first night, paced around your landing time."],
  ];
  if (/sigiriya|dambulla|ancient|fortress/.test(text)) return [
    ["First light", "Begin before the day warms and the pathways become busy."],
    ["Signature", "Explore the published heritage experience with a local guide."],
    ["Golden hour", "Slow the pace and return through the rural landscape."],
  ];
  if (/wildlife|safari|yala|udawalawe|elephant/.test(text)) return [
    ["Early start", "Travel when the landscape is cool and wildlife is most active."],
    ["In the wild", "Follow the confirmed park experience with responsible local guidance."],
    ["At leisure", "Return to your stay with room for an unhurried evening."],
  ];
  if (/kandy|temple|culture/.test(text)) return [
    ["Old city", "Enter the cultural capital through its living streets and stories."],
    ["Heritage", "Experience the published cultural highlights at a considered pace."],
    ["Lake light", "An easy evening shaped around your hotel and interests."],
  ];
  if (/train|tea|ella|nuwara|highland|haputale/.test(text)) return [
    ["Into the hills", "Move through tea country as the air, light and scenery change."],
    ["Scenic passage", "Enjoy the day’s confirmed rail, trail or estate experience."],
    ["Mountain calm", "Arrive with time to watch the mist settle over the highlands."],
  ];
  if (/galle|coast|beach|mirissa|weligama|bentota|tangalle/.test(text)) return [
    ["Coastal road", "Travel south with flexible stops where the coastline opens up."],
    ["By the ocean", "Follow the published fort, beach or marine experience."],
    ["Sunset", "Keep the final hours open for the sea and your own pace."],
  ];
  return [
    ["Morning", `Begin in ${stop.name} with the day paced around the published plan.`],
    ["Experience", stop.copy],
    ["Evening", "Your exact timing, transfer and overnight stay are confirmed before travel."],
  ];
}

function doodleForStop(stop: RouteStop): DoodleType {
  const text = normalize(`${stop.name} ${stop.title} ${stop.copy}`);
  if (/train|tea|ella|nuwara|highland|haputale/.test(text)) return "train";
  if (/wildlife|safari|yala|udawalawe|elephant/.test(text)) return "elephant";
  if (/galle|coast|beach|mirissa|weligama|bentota|tangalle/.test(text)) return "lighthouse";
  if (/kandy|temple|anuradhapura|polonnaruwa/.test(text)) return "stupa";
  return "sigiriya";
}

function SriLankaDoodle({ type, className = "" }: { type: DoodleType; className?: string }) {
  return <svg className={`sri-lanka-doodle ${className}`} viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {type === "sigiriya" && <>
      <path d="M17 91C29 82 30 68 40 61C50 54 60 59 68 47C77 34 73 20 88 18C102 16 101 34 110 42C119 51 132 51 143 66V91"/>
      <path d="M43 90L53 78L62 81L72 67L83 70L95 53L106 56"/><path d="M70 47H105M74 40H101M80 33H97"/><circle cx="126" cy="24" r="9"/><path d="M126 7V1M126 47V41M143 24H149M103 24H109"/>
    </>}
    {type === "train" && <>
      <path d="M19 77H139L132 91H29L19 77Z"/><path d="M31 48H84V77H31V48ZM84 57H119L133 69V77H84V57Z"/><path d="M42 57H57V68H42V57ZM64 57H78V68H64V57ZM96 63H112V71H96V63Z"/><circle cx="48" cy="88" r="8"/><circle cx="111" cy="88" r="8"/><path d="M21 97H140M12 101H148"/><path d="M18 35C34 24 47 25 63 35C78 45 91 44 106 33C121 23 134 26 147 38"/>
    </>}
    {type === "elephant" && <>
      <path d="M28 67C28 43 46 29 73 29C97 29 113 40 119 59C122 69 118 84 125 91C133 99 143 91 139 84C137 79 132 80 130 84"/><path d="M31 61V91M53 69V92M94 69V92M116 63V91"/><path d="M39 89H24M62 92H49M103 92H89M123 91H112"/><path d="M104 37C114 28 129 31 131 43C132 53 123 60 114 56"/><circle cx="108" cy="47" r="2"/><path d="M49 32C43 18 55 11 65 23"/><path d="M44 43C36 39 26 41 20 49"/>
    </>}
    {type === "stupa" && <>
      <path d="M27 92H134M39 84H122M45 76H116"/><path d="M48 76C49 53 62 39 80 39C98 39 111 53 113 76"/><path d="M68 39H92L89 32H71L68 39Z"/><path d="M80 32V13M74 25H86M76 19H84M78 13H82L80 5"/><path d="M22 91C17 76 20 63 30 52M138 91C143 76 140 63 130 52"/><path d="M19 59C25 56 29 57 33 63M141 59C135 56 131 57 127 63"/>
    </>}
    {type === "lighthouse" && <>
      <path d="M64 92H103L96 34H72L64 92Z"/><path d="M69 73H99M71 56H97M74 34L80 23H90L95 34M77 23V17H93V23M85 17V8"/><path d="M20 92V46M20 46C27 35 36 30 48 32C36 38 29 44 20 54M20 46C13 38 8 35 3 36C9 42 14 49 20 57"/><path d="M19 62C29 52 38 49 49 52C37 58 29 63 20 70"/><path d="M110 92C119 79 132 77 148 83M111 84C123 69 139 70 151 76"/><path d="M8 99H151"/>
    </>}
  </svg>;
}

function TravellerTukTuk() {
  return <svg className="itinerary-traveller-tuktuk" viewBox="0 0 104 58" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g className="tuktuk-speed-lines" stroke="currentColor" strokeLinecap="round">
      <path d="M4 30H17"/><path d="M1 37H12"/><path d="M8 44H21"/>
    </g>
    <g className="tuktuk-bounce">
      <ellipse className="tuktuk-shadow" cx="58" cy="52" rx="39" ry="4"/>
      <path className="tuktuk-canopy" d="M26 12C35 7 58 6 71 12L79 31H26V12Z"/>
      <path className="tuktuk-body" d="M22 28H78L94 38L91 48H19L16 39L22 28Z"/>
      <path className="tuktuk-nose" d="M78 31H88L97 39L94 43H78V31Z"/>
      <path className="tuktuk-window" d="M32 14H50V29H28L32 14ZM55 14H68L75 29H55V14Z"/>
      <path className="tuktuk-trim" d="M22 34H80M82 39H94M26 11C37 5 59 5 71 11"/>
      <circle className="tuktuk-traveller-head" cx="48" cy="17" r="5"/>
      <path className="tuktuk-traveller" d="M42 28C42 22 44 20 48 20C52 20 54 23 54 28"/>
      <path className="tuktuk-scarf" d="M52 20C58 20 62 23 65 26C60 25 56 25 52 24"/>
      <circle className="tuktuk-wheel" cx="35" cy="47" r="8"/><circle className="tuktuk-wheel-hub" cx="35" cy="47" r="3"/>
      <circle className="tuktuk-wheel" cx="82" cy="47" r="8"/><circle className="tuktuk-wheel-hub" cx="82" cy="47" r="3"/>
      <path className="tuktuk-lamp" d="M91 35L99 38L97 42L91 40V35Z"/>
    </g>
  </svg>;
}

export function InteractiveItineraryMap({ days, destinations = [] }: { days: ItineraryDay[]; destinations?: string[] }) {
  const [selected, setSelected] = useState(0);
  const [layer, setLayer] = useState<AtlasLayer>("all");

  const stops = useMemo<RouteStop[]>(() => {
    const mapped = days.flatMap((day, index) => {
      const destination = destinations[index] || destinations[Math.min(index, destinations.length - 1)] || "";
      const place = (day.location ? findKnownPlace(day.location) : null) || findKnownPlace(`${day.title} ${day.copy}`) || findKnownPlace(destination);
      return place ? [{ ...day, ...place }] : [];
    });
    const visits = new Map<string, number>();
    const placed: RouteStop[] = [];
    return mapped.map((stop, index) => {
      const visit = visits.get(stop.name) || 0;
      visits.set(stop.name, visit + 1);
      const distance = Math.ceil(visit / 2);
      const direction = visit % 2 ? 1 : -1;
      let positioned = visit
        ? { ...stop, x: stop.x + 6.6 * distance * direction, y: stop.y + 2.8 * distance * direction }
        : stop;
      const overlapsAnotherDay = placed.some((previous) => Math.abs(previous.x - positioned.x) < 7 && Math.abs(previous.y - positioned.y) < 6);
      if (overlapsAnotherDay) {
        const collisionDirection = index % 2 ? -1 : 1;
        positioned = {
          ...positioned,
          x: Math.max(15, Math.min(85, positioned.x + 8 * collisionDirection)),
          y: Math.max(7, Math.min(96, positioned.y - 4)),
        };
      }
      placed.push(positioned);
      return positioned;
    });
  }, [days, destinations]);

  const activeIndex = Math.min(selected, Math.max(0, stops.length - 1));
  const selectedStop = stops[activeIndex] || stops[0];
  const routePoints = stops.map((stop) => `${stop.x},${stop.y}`).join(" ");
  const routeProgress = stops.length > 1 ? Math.max(1, (activeIndex / (stops.length - 1)) * 100) : 100;
  const activeImage = selectedStop ? imageForStop(selectedStop, activeIndex) : dayImages[0];
  const moments: Array<[string, string]> = selectedStop?.activities?.length
    ? selectedStop.activities.map((copy, index): [string, string] => [activityLabel(copy, index), copy])
    : selectedStop ? dayMoments(selectedStop) : [];
  const dayFacts = selectedStop ? [
    selectedStop.meals ? { label: "Meals included", value: selectedStop.meals, icon: "○" } : null,
    selectedStop.hotel ? { label: "Your stay", value: selectedStop.hotel, icon: "⌂" } : null,
    selectedStop.overnight ? { label: "Tonight", value: selectedStop.overnight, icon: "☾" } : null,
  ].filter((fact): fact is { label: string; value: string; icon: string } => Boolean(fact)) : [];

  const move = (direction: -1 | 1) => {
    if (!stops.length) return;
    setSelected((current) => (current + direction + stops.length) % stops.length);
  };

  return <section className="itinerary-experience" id="itinerary">
    <div className="itinerary-doodle-cloud" aria-hidden="true"><SriLankaDoodle type="sigiriya"/><SriLankaDoodle type="stupa"/><SriLankaDoodle type="train"/><SriLankaDoodle type="elephant"/><SriLankaDoodle type="lighthouse"/></div>
    <div className="itinerary-intro">
      <div><p className="eyebrow">Your interactive day-by-day journey</p><h2>See the whole route. Then open every day.</h2></div>
      <p>Select any stop to explore the exact Tour Library programme, hotel, meals and overnight plan. The travelling tuk-tuk moves with you across the island.</p>
    </div>
    {stops.length ? <>
      <div className="itinerary-chapter-selector">
        <div className="itinerary-selector-heading">
          <div><span>Journey chapters</span><b>Day {markerLabel(activeIndex)} of {markerLabel(stops.length - 1)}</b></div>
          <div className="itinerary-selector-progress" aria-hidden="true"><i style={{ width: `${((activeIndex + 1) / stops.length) * 100}%` }}/></div>
          <div className="itinerary-selector-arrows"><button type="button" onClick={() => move(-1)} aria-label="Previous itinerary day">←</button><button type="button" onClick={() => move(1)} aria-label="Next itinerary day">→</button></div>
        </div>
        <div className="itinerary-day-rail" style={{ gridTemplateColumns: `repeat(${stops.length}, minmax(150px, 1fr))` }} aria-label="Choose an itinerary day">
          {stops.map((stop, index) => <button type="button" className={index === activeIndex ? "is-active" : ""} key={`${stop.day}-rail-${stop.title}`} aria-pressed={index === activeIndex} onClick={() => setSelected(index)}>
            <span className="itinerary-day-rail-image" style={{ backgroundImage: `linear-gradient(180deg,rgba(24,19,78,.02),rgba(24,19,78,.38)),url("${imageForStop(stop, index)}")` }}/>
            <span className="itinerary-day-rail-copy"><small>{stop.day} · {markerLabel(index)}</small><b>{stop.title}</b><em>{stop.name}</em></span>
            <i className="itinerary-day-rail-dot" aria-hidden="true"/>
          </button>)}
        </div>
      </div>

      <div className="itinerary-map-stage">
        <div className="itinerary-map-shell">
          <div className="itinerary-atlas-toolbar">
            <div><span>Navigeto tour atlas</span><b>{selectedStop.name}</b></div>
            <div className="itinerary-layer-controls" aria-label="Map story layers">
              {(["all", "route", "wildlife", "heritage", "hills", "coast"] as AtlasLayer[]).map((item) => <button type="button" key={item} className={layer === item ? "is-active" : ""} aria-pressed={layer === item} onClick={() => setLayer(item)}>{item === "all" ? "All stories" : item}</button>)}
            </div>
          </div>
          <div className={`itinerary-atlas-frame atlas-layer-${layer}`} role="group" aria-label="Coded interactive vector map of this Sri Lanka itinerary">
            <svg className="itinerary-atlas-vector-map" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-labelledby="atlas-title atlas-description">
              <title id="atlas-title">Navigeto coded Sri Lanka tour atlas</title>
              <desc id="atlas-description">A vector map showing the island outline, central highlands, national parks, rivers, roads, cities and this itinerary route.</desc>
              <defs>
                <linearGradient id="atlas-ocean" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0b4f91"/><stop offset=".48" stopColor="#1078b8"/><stop offset="1" stopColor="#28a8e0"/></linearGradient>
                <linearGradient id="atlas-island" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0" stopColor="#f9fcff"/><stop offset=".55" stopColor="#eef7f4"/><stop offset="1" stopColor="#dfeee8"/></linearGradient>
                <radialGradient id="atlas-highlands"><stop offset="0" stopColor="#2b7b58" stopOpacity=".82"/><stop offset=".45" stopColor="#6fac68" stopOpacity=".64"/><stop offset="1" stopColor="#b9d8a3" stopOpacity="0"/></radialGradient>
                <linearGradient id="atlas-park" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#38b848"/><stop offset="1" stopColor="#7fd34f"/></linearGradient>
                <pattern id="atlas-grid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M8 0H0V8" fill="none" stroke="#fff" strokeOpacity=".08" strokeWidth=".12" vectorEffect="non-scaling-stroke"/></pattern>
                <pattern id="atlas-topography" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3 Q1.5 1.4 3 3 T6 3" fill="none" stroke="#282068" strokeOpacity=".08" strokeWidth=".18" vectorEffect="non-scaling-stroke"/></pattern>
                <clipPath id="atlas-island-clip"><path d={SRI_LANKA_VECTOR_PATH}/></clipPath>
                <filter id="atlas-island-shadow" x="-30%" y="-20%" width="160%" height="160%"><feDropShadow dx="0" dy="7" stdDeviation="3" floodColor="#171248" floodOpacity=".42"/></filter>
                <filter id="atlas-route-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation=".8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <rect width="100" height="100" fill="url(#atlas-ocean)"/>
              <rect width="100" height="100" fill="url(#atlas-grid)"/>
              <g className="atlas-ocean-lines" aria-hidden="true"><path d="M3 22 C12 18 16 27 25 22 S40 18 47 23"/><path d="M66 12 C74 8 82 15 96 10"/><path d="M4 84 C14 78 22 86 30 82"/><path d="M72 92 C80 86 89 92 97 88"/></g>
              <path className="atlas-island-shadow" d={SRI_LANKA_VECTOR_PATH} filter="url(#atlas-island-shadow)"/>
              <g clipPath="url(#atlas-island-clip)">
                <rect x="14" y="1" width="72" height="97" fill="url(#atlas-island)"/>
                <rect className="atlas-terrain-texture" x="14" y="1" width="72" height="97" fill="url(#atlas-topography)"/>
                <g className="atlas-highland-layer">
                  <ellipse cx="51" cy="68" rx="22" ry="20" fill="url(#atlas-highlands)"/>
                  <path d="M35 68 C39 58 47 52 58 54 C67 56 70 64 67 74 C64 82 55 88 46 85 C38 82 32 76 35 68Z" fill="none" stroke="#2d7657" strokeOpacity=".24" strokeWidth=".7" vectorEffect="non-scaling-stroke"/>
                  <path d="M40 69 C43 62 49 58 56 59 C63 60 66 66 64 72 C62 78 56 82 50 81 C44 80 38 75 40 69Z" fill="none" stroke="#2d7657" strokeOpacity=".28" strokeWidth=".55" vectorEffect="non-scaling-stroke"/>
                  <path d="M45 69 C47 65 51 63 56 64 C60 65 61 69 60 73 C58 77 53 78 49 76 C46 75 44 72 45 69Z" fill="none" stroke="#2d7657" strokeOpacity=".34" strokeWidth=".5" vectorEffect="non-scaling-stroke"/>
                </g>
                <g className="atlas-park-layer">
                  <path d="M21 36 C25 31 32 31 36 35 L34 45 C29 49 23 46 20 42Z"/>
                  <path d="M54 43 C60 40 67 42 69 47 L66 56 C60 58 55 54 53 49Z"/>
                  <path d="M63 78 C71 75 78 78 80 84 L73 91 C67 91 62 87 63 78Z"/>
                  <path d="M48 79 C54 76 61 79 62 84 L57 90 C51 90 47 86 48 79Z"/>
                  <path d="M30 83 C36 80 42 82 43 87 L39 92 C34 92 30 89 30 83Z"/>
                </g>
                <g className="atlas-river-layer">
                  {atlasRivers.map((path) => <path d={path} key={path} vectorEffect="non-scaling-stroke"/>)}
                </g>
                <g className="atlas-road-layer">
                  {atlasRoads.map((path, index) => <path className={index < 3 ? "is-highway" : ""} d={path} key={path} vectorEffect="non-scaling-stroke"/>)}
                </g>
              </g>
              <path className="atlas-island-outline" d={SRI_LANKA_VECTOR_PATH} vectorEffect="non-scaling-stroke"/>
              <g className="atlas-city-layer">
                {atlasCities.map((city) => <g className={city.capital ? "atlas-city is-capital" : "atlas-city"} key={city.name} transform={`translate(${city.x} ${city.y})`}><circle r={city.capital ? 1.1 : .72}/><text x={city.anchor === "end" ? -1.6 : 1.6} y=".65" textAnchor={city.anchor}>{city.name}</text></g>)}
              </g>
              <g className="itinerary-atlas-route-lines" filter="url(#atlas-route-glow)" aria-hidden="true">
                <polyline className="itinerary-route-shadow" vectorEffect="non-scaling-stroke" points={routePoints}/>
                <polyline className="itinerary-route-base" vectorEffect="non-scaling-stroke" points={routePoints}/>
                <polyline className="itinerary-route-progress" vectorEffect="non-scaling-stroke" pathLength="100" strokeDasharray={`${routeProgress} 100`} points={routePoints}/>
              </g>
            </svg>
            <div className="itinerary-landmark-layer" aria-hidden="true">
              {atlasLandmarks.filter((landmark) => layer === "all" || layer === landmark.kind).map((landmark, index) => <span className={`itinerary-landmark itinerary-landmark-${landmark.kind}`} style={{ left: `${landmark.x}%`, top: `${landmark.y}%`, animationDelay: `${index * .3}s` }} key={landmark.label}><i>{landmark.icon}</i><b>{landmark.label}</b></span>)}
            </div>
            {stops.map((stop, index) => <button type="button" className={`itinerary-atlas-marker${index === activeIndex ? " is-active" : ""}${index < activeIndex ? " is-past" : ""}`} style={{ left: `${stop.x}%`, top: `${stop.y}%` }} key={`${stop.day}-${stop.title}`} aria-label={`Open ${stop.day}: ${stop.title} in ${stop.name}`} aria-pressed={index === activeIndex} onClick={() => setSelected(index)}><span>{markerLabel(index)}</span><b>{stop.name}</b></button>)}
            <span className="itinerary-atlas-traveller-vehicle" style={{ left: `${selectedStop.x}%`, top: `${selectedStop.y}%` }} aria-hidden="true"><TravellerTukTuk/></span>
            <div className="itinerary-atlas-compass" aria-hidden="true"><b>N</b><i/><span>8° N</span></div>
          </div>
          <div className="itinerary-atlas-legend"><span><i className="legend-vector"/>Coded vector terrain</span><span><i className="legend-route"/>Your journey</span><span><i className="legend-park"/>National parks</span><span><i className="legend-water"/>Water</span><span><i className="legend-place"/>Day stop</span></div>
        </div>

        <article className="itinerary-day-chapter" key={`${selectedStop.day}-${activeIndex}`} aria-live="polite">
          <div className="itinerary-chapter-visual" style={{ backgroundImage: `linear-gradient(180deg,rgba(24,19,78,.03),rgba(24,19,78,.88)),url("${activeImage}")` }}>
            <span className="itinerary-chapter-kicker">A day designed around you</span>
            <div className="itinerary-chapter-coordinate"><small>{selectedStop.kind}</small><b>{selectedStop.name}</b></div>
            <div className="itinerary-chapter-count"><small>Chapter</small><b>{markerLabel(activeIndex)}</b><span>/ {markerLabel(stops.length - 1)}</span></div>
            <i className="itinerary-chapter-orbit" aria-hidden="true"/>
          </div>
          <div className="itinerary-chapter-copy">
            <SriLankaDoodle type={doodleForStop(selectedStop)} className="itinerary-chapter-doodle"/>
            <div className="itinerary-chapter-overline"><p className="eyebrow">{selectedStop.day} · {selectedStop.name}</p><span>Private journey</span></div>
            <h3>{selectedStop.title}</h3>
            <p>{selectedStop.copy}</p>
            {dayFacts.length > 0 && <div className="itinerary-day-facts" aria-label="Published Tour Library day details">
              {dayFacts.map(({ label, value, icon }) => <div key={label}><i aria-hidden="true">{icon}</i><span><small>{label}</small><b>{value}</b></span></div>)}
            </div>}
            <div className="itinerary-programme-heading"><span>Today’s programme</span><i/><small>{moments.length} curated {moments.length === 1 ? "moment" : "moments"}</small></div>
            <div className="itinerary-moment-grid">
              {moments.map(([label, copy], index) => <div key={`${label}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{label}</b><p>{copy}</p></div></div>)}
            </div>
            {selectedStop.optionalActivities?.length ? <div className="itinerary-optional-programme"><b>Optional experiences</b><ul>{selectedStop.optionalActivities.map((activity) => <li key={activity}>{activity}</li>)}</ul></div> : null}
            <div className="itinerary-chapter-footer">
              <span><i/> Flexible private pacing</span>
              <div><button type="button" onClick={() => move(-1)} aria-label="Previous itinerary day">←</button><b>{markerLabel(activeIndex)} / {markerLabel(stops.length - 1)}</b><button type="button" onClick={() => move(1)} aria-label="Next itinerary day">→</button></div>
            </div>
          </div>
        </article>
      </div>
    </> : <div className="itinerary-no-map">
      <p className="eyebrow">Route being tailored</p><h3>Your specialist will plot every confirmed stop here.</h3><p>We only place destinations we can match confidently; no invented route points.</p>
    </div>}
    <p className="itinerary-map-note">Illustrated route overview based on published itinerary stops. Exact roads, timings, activities and overnight stays are verified when your tailored journey is prepared.</p>
  </section>;
}
