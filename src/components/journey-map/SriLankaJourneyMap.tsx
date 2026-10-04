'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { places, project, straightLineKm, destinationThemes, destinationTheme, findDestinations, type DestinationTheme } from './places';
import { attractions, DEFAULT_JOURNEY_BUFFER_KM, journeyMileage, tourIdeas, type BufferMode } from './allowances';
import { chartDistance, CHART_NAME, CHART_SOURCE } from './chart-distances';
import { referenceRoute, REFERENCE_DATE, type RoutePreference } from './reference-routes';
import './journey-map.css';

// Coastline: Natural Earth 1:10m, public domain; simplified for illustration.
const island = 'M503.9 413.5 L506.4 422.9 L497.1 450.8 L493.9 459.6 L489.1 467.4 L486.9 476.1 L455.6 504.8 L416.6 526.2 L389.7 534.3 L388.2 531.6 L386.9 531.9 L385.0 536.0 L377.8 538.6 L347.9 545.0 L331.6 550.3 L322.5 550.9 L306.4 561.0 L296.6 561.0 L287.8 565.0 L282.6 564.6 L276.7 562.7 L262.7 562.1 L260.5 559.3 L250.5 560.2 L248.0 559.2 L245.1 558.5 L243.0 559.3 L241.3 557.7 L240.6 557.4 L229.2 554.6 L222.6 551.7 L219.7 552.1 L201.5 538.3 L201.0 537.8 L200.4 535.6 L190.4 520.9 L190.1 518.6 L189.9 516.8 L183.9 504.3 L180.9 495.7 L178.9 494.2 L180.8 493.3 L179.9 486.4 L161.7 450.6 L159.2 430.4 L161.5 425.5 L153.3 402.0 L155.0 402.0 L158.4 408.5 L160.5 408.3 L161.4 407.7 L161.5 403.7 L159.4 400.1 L156.1 399.1 L156.4 396.2 L147.4 347.1 L149.8 347.1 L151.1 341.0 L149.1 336.0 L148.6 328.9 L142.2 309.4 L133.5 282.7 L134.2 278.8 L134.6 279.4 L133.5 267.0 L140.8 260.1 L147.4 250.0 L141.6 258.9 L143.7 261.2 L145.7 265.2 L142.5 268.3 L141.7 273.2 L138.8 282.4 L142.8 288.4 L152.7 297.3 L154.7 291.0 L152.1 288.3 L155.6 277.7 L153.8 274.2 L153.3 269.0 L153.2 267.6 L152.1 266.3 L152.9 263.0 L156.0 256.7 L160.2 237.1 L162.6 233.6 L165.9 223.8 L171.1 220.0 L173.1 215.7 L176.6 199.3 L173.1 180.6 L172.2 175.9 L172.2 172.8 L185.9 165.4 L194.3 158.9 L203.0 140.4 L204.7 135.1 L204.8 125.7 L196.2 122.3 L194.1 116.3 L199.8 111.6 L208.9 109.6 L213.8 105.2 L218.5 104.0 L214.9 99.7 L196.5 90.4 L204.7 89.7 L227.3 97.3 L230.2 102.2 L230.2 104.8 L242.2 105.1 L270.7 102.7 L289.5 107.5 L270.4 99.5 L266.3 97.4 L262.6 96.8 L259.0 97.5 L255.7 96.9 L247.7 96.6 L230.4 86.1 L216.6 81.2 L216.1 85.3 L217.9 89.3 L214.2 88.3 L201.0 81.7 L206.2 85.4 L199.9 85.1 L181.3 76.8 L178.1 75.4 L175.3 74.1 L173.2 69.5 L169.6 65.6 L183.0 58.5 L203.3 58.8 L206.6 63.5 L210.0 65.0 L215.7 67.2 L219.5 66.7 L220.9 66.6 L227.6 71.3 L260.1 90.5 L254.3 87.3 L220.9 64.8 L208.2 59.7 L216.5 57.9 L229.3 59.4 L254.7 85.2 L311.5 118.7 L314.8 122.3 L318.7 128.0 L317.4 127.5 L314.6 125.4 L310.2 125.3 L319.9 132.9 L322.0 132.8 L324.0 129.8 L328.5 136.8 L330.1 145.3 L328.2 147.5 L333.4 149.2 L335.0 152.0 L336.6 150.8 L338.3 152.9 L344.0 161.2 L347.9 163.2 L345.5 165.4 L341.2 162.0 L335.1 161.4 L341.9 169.0 L342.1 171.3 L343.2 174.4 L350.2 170.2 L357.5 173.7 L368.3 183.3 L375.4 192.2 L380.5 194.5 L385.4 203.4 L386.9 203.1 L392.8 208.9 L393.1 214.1 L389.8 216.2 L392.6 215.6 L396.9 221.4 L393.2 225.1 L391.1 221.0 L391.4 226.3 L389.8 229.0 L382.0 226.0 L377.8 230.3 L386.4 229.8 L395.0 234.9 L403.7 230.5 L411.8 228.6 L415.8 231.0 L421.0 244.7 L419.0 247.1 L414.7 243.8 L416.6 250.0 L418.8 250.8 L424.0 256.4 L425.8 262.5 L429.9 272.9 L428.2 282.1 L423.6 270.6 L422.4 276.0 L422.1 276.3 L422.9 278.3 L424.7 279.0 L429.1 283.4 L433.9 280.4 L436.7 287.0 L441.2 291.9 L445.3 294.3 L445.8 295.6 L446.5 296.4 L446.8 297.3 L450.3 295.6 L451.2 297.2 L450.3 300.1 L453.6 303.9 L455.4 306.3 L454.2 306.9 L452.9 309.9 L458.4 317.4 L463.2 316.9 L466.1 321.8 L476.2 333.0 L470.7 332.9 L461.5 326.7 L459.2 326.8 L458.3 331.8 L463.2 330.2 L467.7 332.0 L470.1 335.4 L476.0 340.9 L474.9 342.4 L477.0 343.6 L478.4 342.4 L486.4 351.7 L485.4 355.6 L486.4 357.4 L483.8 359.8 L485.8 362.4 L487.6 364.1 L486.1 366.1 L489.9 365.0 L491.1 372.2 L492.3 372.1 L493.6 367.0 L494.6 364.8 L495.4 363.9 L497.9 368.8 L503.9 413.5 Z';
type Distance = { available: boolean; km?: number; minutes?: number; via?: string; source?: 'published_chart' | 'google_routes' | 'reference_table' };

export function SriLankaJourneyMap({ mode = 'discover' }: { mode?: 'discover' | 'planning' }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, '');
  const [stops, setStops] = useState<string[]>(['colombo', 'sigiriya', 'kandy', 'nuwara-eliya', 'galle', 'colombo']);
  const [routePreference, setRoutePreference] = useState<RoutePreference>('shortest');
  const [showRivers, setShowRivers] = useState(false);
  const [showParks, setShowParks] = useState(true);
  const [showRail, setShowRail] = useState(false);
  const [showRoads, setShowRoads] = useState(false);
  const [planOpen, setPlanOpen] = useState(mode === 'planning');
  const [days, setDays] = useState(7);
  const [localKmPerDay, setLocalKmPerDay] = useState(0);
  const [extraKm, setExtraKm] = useState(0);
  const [bufferMode, setBufferMode] = useState<BufferMode>('fixed');
  const [bufferValue, setBufferValue] = useState(DEFAULT_JOURNEY_BUFFER_KM);
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState<DestinationTheme>('All destinations');
  const matches = findDestinations(query, theme);
  const filtered = query.trim().length > 0 || theme !== 'All destinations';
  const [zoom, setZoom] = useState(1);
  const [zoomCenter, setZoomCenter] = useState<[number, number]>([310,345]);
  const [detail, setDetail] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [distances, setDistances] = useState<Record<string, Distance>>(() => { const initial: Record<string, Distance> = {}; for (const a of places) for (const b of places) { const km = chartDistance(a.id, b.id); if (km !== null && a.id !== b.id) initial[`${a.id}:${b.id}`] = { available: true, km, source: 'published_chart' }; } return initial; });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const selected = stops.map(id => places.find(p => p.id === id)!);
  const legs = selected.slice(1).map((to, i) => ({ from: selected[i], to, key: `${selected[i].id}:${to.id}` }));
  const resolvedDistances = { ...distances };
  for (const l of legs) { const ref = referenceRoute(l.from.id,l.to.id,routePreference); if (ref) resolvedDistances[l.key] = { available:true, ...ref, source:'reference_table' }; }
  const signature = legs.map(l => l.key).join(',');
  useEffect(() => {
    const controller = new AbortController();
    const keys = signature.split(',').filter(Boolean);
    keys.forEach(key => {
      const [from, to] = key.split(':');
      if (referenceRoute(from,to) || chartDistance(from, to) !== null) return;
      fetch(`/api/journey-distance?from=${from}&to=${to}`, { signal: controller.signal })
        .then(r => r.ok ? r.json() : { available: false })
        .then((value: Distance) => { if (!controller.signal.aborted) setDistances(prev => ({ ...prev, [key]: value })); })
        .catch(() => { if (!controller.signal.aborted) setDistances(prev => ({ ...prev, [key]: { available: false } })); });
    });
    return () => controller.abort();
  }, [signature]);
  const allRoad = legs.length > 0 && legs.every(l => resolvedDistances[l.key]?.available && typeof resolvedDistances[l.key].km === 'number');
  const pending = legs.some(l => !resolvedDistances[l.key]);
  const total = legs.reduce((sum, l) => sum + (allRoad ? resolvedDistances[l.key].km! : straightLineKm(l.from, l.to)), 0);
  const mileage = journeyMileage({ routeKm: total, days, localKmPerDay, extraKm, bufferMode, bufferValue, hasJourney: legs.length > 0 });
  const hasChart = legs.some(l => resolvedDistances[l.key]?.source !== 'google_routes');
  const allLiveDurations = allRoad && legs.every(l => Boolean(resolvedDistances[l.key]?.minutes));
  const minutes = allLiveDurations ? legs.reduce((n, l) => n + (resolvedDistances[l.key].minutes || 0), 0) : 0;
  function moveStop(index: number, direction: number) { setStops(prev => { const next = [...prev]; const target = index + direction; if (target < 0 || target >= next.length) return prev; [next[index], next[target]] = [next[target], next[index]]; return next; }); }
  const active = places.find(p => p.id === hovered);
  const lastStop = selected.at(-1);
  const previous = active ? selected[selected.findIndex(p => p.id === active.id) - 1] ?? lastStop : undefined;
  const hoverRoute = active && previous && active.id !== previous.id ? referenceRoute(previous.id, active.id, routePreference) : null;
  const hoverDistance = active && previous && active.id !== previous.id ? distances[`${previous.id}:${active.id}`] : undefined;
  const hoverKm = hoverRoute?.km ?? (hoverDistance?.available ? hoverDistance.km : undefined) ?? null;
  const hoverMinutes = hoverRoute?.minutes ?? hoverDistance?.minutes;
  const activeArt = attractions.find(a => a.destination === active?.id);
  const descriptions: Record<string, string> = {
    sigiriya: 'Explore the rock fortress and its gardens in the cultural triangle.',
    kandy: 'Discover the sacred temple city, lake and hill-country heritage.',
    ella: 'Explore Nine Arch Bridge, walking trails and sweeping hill views.',
    galle: 'Wander the fort streets and lighthouse along the southern coast.',
    yala: 'A safari gateway for wildlife and dry-zone landscapes.',
    'nuwara-eliya': 'Discover tea plantations and cool highland landscapes.',
    anuradhapura: 'Explore ancient stupas and the sacred city.',
    polonnaruwa: 'Discover the ruins and monuments of an ancient kingdom.',
    mirissa: 'Enjoy southern beaches and coastal scenery.',
    trincomalee: 'Discover the harbour, temples and east-coast beaches.',
    jaffna: 'Explore northern culture, temples and the peninsula.',
    bentota: 'Explore the river and west-coast beaches.',
    nilaveli: 'A sandy east-coast escape north of Trincomalee.',
    uppuveli: 'A beach base close to Trincomalee’s coastal sights.',
    unawatuna: 'A palm-fringed beach near Galle’s historic coast.',
    weligama: 'Explore the broad surf bay and fishing-town coastline.',
    hiriketiya: 'A compact curved bay with beach and surf scenery.',
    dikwella: 'Explore the southern beach and nearby coastal villages.',
    rekawa: 'Discover a quiet coastal stretch and lagoon landscape.',
    kosgoda: 'Explore the turtle coast and nearby southern beaches.',
    beruwala: 'Discover beach scenery and coastal lighthouse heritage.',
    ambalangoda: 'Explore mask-making traditions and southern coastal culture.',
    koneswaram: 'Discover a temple setting above Trincomalee’s rocky coast.',
    nallur: 'Explore the Hindu temple heritage of Jaffna.',
    'point-pedro': 'Discover the northern coast and peninsula scenery.',
    mannar: 'Explore the coastal town and its island-gateway heritage.',
    mihintale: 'Discover sacred hill monuments near Anuradhapura.',
    aukana: 'Explore the ancient standing Buddha statue and its setting.',
    yapahuwa: 'Discover the rock fortress and carved stone staircase.',
    pidurangala: 'Explore the rock viewpoint near Sigiriya.',
    ritigala: 'Discover the forest setting and ruins of an ancient monastery.',
    knuckles: 'Explore mountain scenery and forest trails.',
    haputale: 'A hill-country base for tea estates and sweeping viewpoints.',
    'liptons-seat': 'Discover a viewpoint above the surrounding tea-country landscape.',
    'adams-peak': 'Explore the pilgrimage mountain and surrounding highlands.',
    kitulgala: 'Discover river scenery, rainforest and adventure experiences.',
    'ravana-falls': 'A waterfall stop in the hill country near Ella.',
    diyaluma: 'Discover the waterfall and surrounding highland scenery.',
    bambarakanda: 'Explore a mountain waterfall and its forested surroundings.',
    bundala: 'Discover wetland landscapes and birdlife at a safari gateway.',
    kaudulla: 'Explore a national-park gateway associated with elephant safaris.',
    'gal-oya': 'Discover reservoir scenery and the national-park gateway.',
  };

  const viewWidth = 470 / zoom, viewHeight = 590 / zoom;
  const viewX = Math.max(75, Math.min(545-viewWidth, zoomCenter[0]-viewWidth/2));
  const viewY = Math.max(30, Math.min(620-viewHeight, zoomCenter[1]-viewHeight/2));
  function explore(id: string) { setHovered(id); const p = places.find(p => p.id === id); if (p && zoom > 1) setZoomCenter(project(p)); }
  function add(id: string) { setStops(prev => prev.length < 12 && prev.at(-1) !== id ? [...prev, id] : prev); }
  return <section className="sl-journey" aria-label="Interactive Sri Lanka journey planner">
    <div className="sl-intro"><span className="sl-eyebrow">A little island. Endless journeys.</span><h2>Discover Sri Lanka,<br />one beautiful stop at a time.</h2><p>{mode === 'planning' ? 'Build your itinerary and review road, sightseeing and buffer kilometres.' : 'Explore the landmarks. Hover for details, then click to build your journey.'}</p></div>
    <div className="sl-tour-ideas" aria-label="Tour inspiration">{tourIdeas.map(idea => <button type="button" key={idea.name} onClick={() => { setStops([...idea.stops]); setDays(idea.days); }}><span>{idea.days} day inspiration</span><strong>{idea.name}</strong><small>{idea.description}</small></button>)}</div>
    <div className="sl-summary-ribbon"><div><span>{selected.length} stops · {days} days</span><strong>{selected.map(p => p.name).join(' → ') || 'Choose your first destination'}</strong></div><div><span>{allRoad ? (hasChart ? 'Chart route + extras + buffer' : 'Driving route + extras + buffer') : 'Illustrative route + extras + buffer'}</span><strong>{mileage.totalKm.toFixed(0)} <small>KM</small></strong></div><button type="button" onClick={() => setPlanOpen(!planOpen)} aria-expanded={planOpen}>{planOpen ? 'Close journey planner −' : 'Edit journey & mileage +'}</button></div>
    <div className="sl-mileage-equation" aria-live="polite"><span>{allRoad ? 'Road' : 'Illustrative route'} <strong>{mileage.routeKm.toFixed(0)} km</strong></span><b>+</b><span>Sightseeing & detours <strong>{(mileage.sightseeingKm+mileage.extraKm).toFixed(0)} km</strong></span><b>+</b><span>Buffer <strong>{mileage.bufferKm.toFixed(0)} km</strong></span><b>=</b><span>Planned total <strong>{mileage.totalKm.toFixed(0)} km</strong></span></div>
    <div className="sl-discover-controls"><label>Find your next experience<input type="search" placeholder="Search beaches, temples, waterfalls…" value={query} onChange={e => setQuery(e.target.value)} /></label><div className="sl-theme-filters" aria-label="Destination themes">{destinationThemes.map(t => <button type="button" key={t} aria-pressed={theme === t} onClick={() => setTheme(t)}>{t}</button>)}</div><p>{matches.length} destinations to explore · {attractions.length} landmark sketches</p></div>
    <div className="sl-map-toolbar"><span>Explore the island</span><div className="sl-zoom-controls" aria-label="Map zoom"><button type="button" aria-label="Zoom out map" disabled={zoom === 1} onClick={() => setZoom(Math.max(1, zoom-.5))}>−</button><span>{zoom}×</span><button type="button" aria-label="Zoom in map" disabled={zoom === 2} onClick={() => { if (active) setZoomCenter(project(active)); setZoom(Math.min(2, zoom+.5)); }}>+</button><button type="button" onClick={() => setZoom(1)}>Whole island</button>{zoom > 1 && <>{([['North',0,-90],['South',0,90],['West',-90,0],['East',90,0]] as const).map(([label,dx,dy]) => <button type="button" key={label} aria-label={`Pan map ${label.toLowerCase()}`} onClick={() => setZoomCenter(([x,y]) => [Math.max(75+viewWidth/2,Math.min(545-viewWidth/2,x+dx)),Math.max(30+viewHeight/2,Math.min(620-viewHeight/2,y+dy))])}>{label}</button>)}</>}</div><button type="button" aria-pressed={detail} onClick={() => setDetail(!detail)}>{detail ? 'Show main destinations' : 'Show all destination labels'}</button><label><input type="checkbox" checked={showRoads} onChange={e=>setShowRoads(e.target.checked)} /> Road corridors</label><label><input type="checkbox" checked={showRivers} onChange={e=>setShowRivers(e.target.checked)} /> Rivers</label><label><input type="checkbox" checked={showParks} onChange={e=>setShowParks(e.target.checked)} /> Parks</label><label><input type="checkbox" checked={showRail} onChange={e=>setShowRail(e.target.checked)} /> Rail corridors</label></div>
    <p className="sl-source-inline">Distance/time reference: supplied table · 28 February 2014. Landmark sketches and route connections are illustrative. Pins show approximate destination and gateway locations.</p>
    <div className={`sl-layout ${planOpen ? 'sl-planning' : ''}`}>

      <div className="sl-map" ref={mapRef} onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: (e.clientY - r.top - r.height / 2) / r.height * -5, y: (e.clientX - r.left - r.width / 2) / r.width * 5 }); }} onPointerLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(null); }}>
        <div className="sl-map-caption">THE SRI LANKA COLLECTION<span>Heritage · highlands · wild coast</span><span className="sl-mobile-pan">Swipe to explore the whole island →</span></div>
        <svg viewBox={`${viewX} ${viewY} ${viewWidth} ${viewHeight}`} className="sl-island" style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }} aria-label="Illustrated Sri Lanka destination map">
          <defs><linearGradient id={`${uid}-land`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c0dea1"/><stop offset=".45" stopColor="#e8efbf"/><stop offset="1" stopColor="#edd4a0"/></linearGradient><clipPath id={`${uid}-clip`}><path d={island}/></clipPath><filter id={`${uid}-shadow`}><feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="#537f77" floodOpacity=".25"/></filter></defs>
          <ellipse cx="244" cy="583" rx="127" ry="18" fill="#93c9cb" opacity=".22"/>
          <path d={island} transform="translate(0 12)" fill="#80aa83" stroke="#739876" strokeWidth="3"/>
          <path d={island} fill={`url(#${uid}-land)`} stroke="#658f71" strokeWidth="2" filter={`url(#${uid}-shadow)`}/>
          <g clipPath={`url(#${uid}-clip)`} fill="none" stroke="#659565" opacity=".3" strokeWidth="2"><path d="M90 340 Q240 290 400 360 M90 348 Q240 298 400 368 M100 455 Q240 398 380 452 M120 463 Q240 406 380 460 M155 220 Q220 250 310 218 M152 227 Q220 258 310 225"/><path d="M212 423 l22 -43 25 43 M230 418 l23 -51 25 51 M259 425 l19 -34 24 34" fill="#75ac7b" opacity=".9"/></g>
          <g aria-hidden="true" pointerEvents="none">{attractions.filter(a => !filtered || stops.includes(a.destination) || matches.some(p => p.id === a.destination)).map(a => {
            const destination = places.find(p => p.id === a.destination)!;
            const [x,y] = project(destination);
            const mainPositions: Record<string, [number,number]> = {sigiriya:[270,228],kandy:[255,365],ella:[380,425],galle:[170,535],yala:[410,500],'nuwara-eliya':[285,420]};
            const [artX,artY] = mainPositions[a.destination] ?? [a.x,a.y];
            const width = a.destination === 'jaffna' || a.destination === 'anuradhapura' ? 65 : 50;
            return <g key={a.destination}><path d={`M${x} ${y} L${artX+width/2} ${artY+25}`} stroke="#6e8e81" strokeWidth=".7" strokeDasharray="2 3"/><svg x={artX} y={artY} width={width} height="58" viewBox={`${a.col*a.cellWidth+a.cellWidth*.08} ${a.row*a.cellHeight+a.cellHeight*.08} ${a.cellWidth*.84} ${a.cellHeight*.84}`}><image href={a.asset} width={a.sheetWidth} height={a.sheetHeight} preserveAspectRatio="none"/></svg></g>;
          })}</g>
          <g clipPath={`url(#${uid}-clip)`} aria-hidden="true" pointerEvents="none">
            {showParks && <g className="sl-parks" fill="var(--brand-green)" opacity=".18"><ellipse cx="195" cy="240" rx="30" ry="48"/><ellipse cx="349" cy="296" rx="28" ry="20"/><ellipse cx="422" cy="525" rx="42" ry="26"/><ellipse cx="337" cy="498" rx="24" ry="22"/><ellipse cx="275" cy="502" rx="30" ry="14"/></g>}
            {showRivers && <g fill="none" stroke="#23a7cb" strokeWidth="1.8" opacity=".7"><path d="M291 436 Q314 390 319 362 Q380 335 392 300 Q401 259 392 225"/><path d="M305 468 Q252 449 208 467 Q188 468 160 470"/><path d="M333 485 Q330 519 313 547 L286 571"/><path d="M299 429 Q230 417 165 433"/></g>}
            {showRoads && <g fill="none" stroke="#cc7b60" strokeWidth="1.4" opacity=".7"><path d="M162 435 Q161 385 177 323 Q195 270 254 255 L189 80 M162 435 Q215 410 293 388 L314 301 L257 255 M314 301 L358 303 L392 219 M162 435 Q180 492 223 548 Q265 571 320 553 L424 522 L497 446 M293 388 Q326 415 363 443 L424 522 M363 443 L497 446 L450 306 L392 219"/></g>}
            {showRail && <g fill="none" stroke="#607086" strokeWidth="2" strokeDasharray="3 3"><path d="M161 435 L166 397 Q202 420 293 388 Q303 414 319 432 L363 443 M161 435 Q170 500 223 548 L277 562 M166 397 L254 255 Q209 174 189 80"/></g>}
          </g>
          <text x="45" y="300" className="sl-sea-label" transform="rotate(-90 45 300)">INDIAN OCEAN</text>
          <g fill="none" stroke="var(--brand-blue)" strokeWidth="3" strokeDasharray="5 7">{legs.map((l, i) => { const a = project(l.from), b = project(l.to); return <g key={`${l.key}-${i}`}><path d={`M${a.join(' ')} L${b.join(' ')}`}/>{resolvedDistances[l.key]?.available && <g stroke="none"><rect x={(a[0]+b[0])/2-22} y={(a[1]+b[1])/2-16} width="44" height="17" rx="8" fill="#fffdf5"/><text x={(a[0]+b[0])/2} y={(a[1]+b[1])/2-4} textAnchor="middle" fill="var(--brand-blue)" fontSize="8" fontWeight="700">{resolvedDistances[l.key].km} km</text>{resolvedDistances[l.key].minutes ? <text x={(a[0]+b[0])/2} y={(a[1]+b[1])/2+8} textAnchor="middle" fill="var(--brand-navy)" fontSize="7">{Math.floor(resolvedDistances[l.key].minutes! / 60)}h {resolvedDistances[l.key].minutes! % 60}m</text> : null}</g>}</g>; })}</g>
          {places.filter(p => !filtered || matches.some(m => m.id === p.id) || stops.includes(p.id)).map(p => { const [x, y] = project(p); const included = stops.includes(p.id); const colors: Record<DestinationTheme,string> = {'All destinations':'var(--brand-green)',Heritage:'#a77535',Beaches:'#078bb1',Wildlife:'#36885c','Hills & nature':'#607e53','Cities & gateways':'#64748b'}; const pinColor = colors[destinationTheme(p.id)]; return <g key={p.id} role="button" tabIndex={0} aria-label={`Add ${p.name} to journey`} onClick={() => { explore(p.id); add(p.id); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(p.id); } }} onPointerEnter={() => setHovered(p.id)} onFocus={() => setHovered(p.id)} onBlur={() => setHovered(null)} className={`sl-pin ${places.indexOf(p) >= 15 ? `sl-secondary-pin ${detail || zoom > 1 || filtered ? 'sl-detail-pin' : ''}` : ''} ${included ? 'sl-selected-pin' : ''}`}><title>{`${p.name} · ${p.kind}`}</title><circle cx={x} cy={y} r="8" fill="white" opacity=".9"/><circle cx={x} cy={y} r={included ? 5 : 3} fill={included ? 'var(--brand-blue)' : pinColor} stroke="white" strokeWidth="2"/><text x={x + 12} y={y + (p.id === 'airport' ? 20 : p.id === 'negombo' ? -8 : p.id === 'sigiriya' ? -10 : p.id === 'polonnaruwa' ? 18 : p.id === 'nuwara-eliya' ? -8 : p.id === 'ella' ? 16 : 4)}>{p.id === 'airport' ? 'Airport' : p.name.replace(' · entrance', '')}</text></g>; })}
        </svg>
        <div className="sl-hover sl-destination-card" aria-live="polite">{active ? <>
          {activeArt && <svg className="sl-hover-art" aria-hidden="true" viewBox={`${activeArt.col*activeArt.cellWidth+activeArt.cellWidth*.08} ${activeArt.row*activeArt.cellHeight+activeArt.cellHeight*.08} ${activeArt.cellWidth*.84} ${activeArt.cellHeight*.84}`}><image href={activeArt.asset} width={activeArt.sheetWidth} height={activeArt.sheetHeight} preserveAspectRatio="none"/></svg>}
          <div><small>{active.kind}</small><strong>{activeArt?.name ?? active.name}</strong><p>{descriptions[active.id] ?? `Explore ${active.name} and its ${active.kind.toLowerCase()} attractions.`}</p>
          <span>{hoverKm !== null && previous ? `${hoverKm} KM from ${previous.name}${hoverMinutes ? ` · approx. ${Math.floor(hoverMinutes / 60)}h ${hoverMinutes % 60}m` : ''}` : previous && previous.id !== active.id ? `Road distance from ${previous.name} needs a routing lookup` : 'Choose this destination as your starting point'}</span>
          {hoverKm !== null && <small>{hoverRoute ? 'Estimated road journey' : hoverDistance?.source === 'google_routes' ? 'Google driving estimate' : 'Published chart estimate'}</small>}<span>Click or press Enter to add destination</span></div>
        </> : <><div><strong>Your island, your pace</strong><span>Hover or focus a destination for its landmark, distance and travel time.</span></div></>}</div>
      </div>
      <div className="sl-plan" hidden={!planOpen}><div className="sl-plan-heading"><h3>Your journey</h3><button type="button" onClick={() => setStops([])}>Clear</button></div>
        <label className="sl-select">Road route preference<select value={routePreference} onChange={e=>setRoutePreference(e.target.value as RoutePreference)}><option value="shortest">Shortest listed distance</option><option value="highway">Prefer highway when listed</option><option value="scenic">Prefer routes without highway</option></select></label>
        <label className="sl-select">Add a destination<select value="" onChange={e => add(e.target.value)} disabled={stops.length >= 12}><option value="">Choose a stop…</option>{places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        {!stops.length && <p>Choose your starting point on the map or from the list.</p>}
        <ol className="sl-stops">{selected.map((p, i) => <li key={`${p.id}-${i}`}><span className="sl-number">{i + 1}</span><div><strong>{p.name}</strong>{i > 0 && <small>{!resolvedDistances[legs[i - 1].key] ? 'Checking road distance…' : resolvedDistances[legs[i - 1].key].available ? `${resolvedDistances[legs[i - 1].key].km} km · ${resolvedDistances[legs[i - 1].key].source === 'reference_table' ? `Estimated route${resolvedDistances[legs[i - 1].key].via ? ' · via ' + resolvedDistances[legs[i - 1].key].via : ''}` : resolvedDistances[legs[i - 1].key].source === 'published_chart' ? 'published chart' : 'Google driving'}` : `${straightLineKm(selected[i - 1], p)} km straight-line · road unavailable`}</small>}{i > 0 && resolvedDistances[legs[i - 1].key]?.minutes ? <small>Approx. {Math.floor(resolvedDistances[legs[i - 1].key].minutes! / 60)}h {resolvedDistances[legs[i - 1].key].minutes! % 60}m</small> : null}</div><div className="sl-order"><button type="button" disabled={i === 0} aria-label={`Move stop ${i + 1} earlier`} onClick={() => moveStop(i, -1)}>↑</button><button type="button" disabled={i === stops.length - 1} aria-label={`Move stop ${i + 1} later`} onClick={() => moveStop(i, 1)}>↓</button></div><button type="button" aria-label={`Remove stop ${i + 1}: ${p.name}`} onClick={() => setStops(prev => prev.filter((_, index) => index !== i))}>×</button></li>)}</ol>
        <button type="button" className="sl-return" disabled={stops.length < 2 || stops.length >= 12 || stops[0] === stops.at(-1)} onClick={() => add(stops[0])}>↩ Return to starting point</button>
        <div className="sl-allowances"><h4>Sightseeing & mileage allowances</h4><p>Set the extra driving your tour needs, then add one buffer for the whole journey.</p><div className="sl-input-grid">
          <label>Tour days<input type="number" min="1" max="60" step="1" value={days} onChange={e => setDays(Math.max(1, Math.min(60, Math.round(Number(e.target.value)) || 1)))} /></label>
          <label>Local sightseeing · km/day<input type="number" min="0" max="500" step="1" value={localKmPerDay} onChange={e => setLocalKmPerDay(Math.min(500, Math.max(0, Number(e.target.value))))} /></label>
          <label>Other detours · km/tour<input type="number" min="0" max="10000" step="1" value={extraKm} onChange={e => setExtraKm(Math.min(10000, Math.max(0, Number(e.target.value))))} /></label>
          <label>Buffer method<select value={bufferMode} onChange={e => { const mode = e.target.value as BufferMode; setBufferMode(mode); setBufferValue(mode === 'percent' ? 10 : mode === 'per-day' ? 10 : DEFAULT_JOURNEY_BUFFER_KM); }}><option value="fixed">Fixed km per tour</option><option value="per-day">Km per day</option><option value="percent">Percentage of route + extras</option><option value="none">No buffer</option></select></label>
          {bufferMode !== 'none' && <label>Buffer · {bufferMode === 'percent' ? '%' : bufferMode === 'per-day' ? 'km/day' : 'km/tour'}<input type="number" min="0" max={bufferMode === 'percent' ? 100 : 500} step="1" value={bufferValue} onChange={e => setBufferValue(Math.min(bufferMode === 'percent' ? 100 : 500, Math.max(0, Number(e.target.value))))} /></label>}
        </div><small>Allowances are editable planning estimates. Include sightseeing already visited by your route only once. The default 50 km buffer applies once per tour.</small></div>
        <div className="sl-total" aria-live="polite"><span>{allRoad ? 'Total planned driving mileage' : 'Illustrative mileage · road distance unconfirmed'}</span><strong>{mileage.totalKm.toFixed(1)} <small>km</small></strong><dl className="sl-breakdown"><div><dt>{allRoad ? (hasChart ? 'Published road route' : 'Driving route') : 'Straight-line route'}</dt><dd>{mileage.routeKm.toFixed(1)} km</dd></div><div><dt>Sightseeing ({days} × {localKmPerDay} km)</dt><dd>+ {mileage.sightseeingKm.toFixed(1)} km</dd></div><div><dt>Other detours</dt><dd>+ {mileage.extraKm.toFixed(1)} km</dd></div><div><dt>Buffer allowance</dt><dd>+ {mileage.bufferKm.toFixed(1)} km</dd></div></dl>{minutes > 0 && <p className="sl-duration">Approximately {Math.floor(minutes / 60)}h {minutes % 60}m road travel, excluding stops and sightseeing.</p>}<p>{pending ? 'Checking driving distances…' : allRoad ? (hasChart ? 'Reference-table routes use historical estimates dated 28 February 2014; other published chart values and Google Routes fill coverage gaps. Confirm current routes before final costing.' : 'Road distances from Google Routes between destination landmarks.') : 'Road distance unavailable. This total includes a straight-line route with your allowances. Confirm driving distances before using it for transport costing.'}</p></div>
        <p className="sl-note">Primary reference: your supplied distance/time table, {REFERENCE_DATE}. Secondary reference: <a href={CHART_SOURCE} target="_blank" rel="noreferrer">{CHART_NAME} ↗</a>. Chart publication date is not stated. The inconsistent Anuradhapura–Galle pair is excluded. Unlisted route pairs need a routing lookup. Corridors and geographic artwork are illustrative; they do not show turn-by-turn navigation.</p>
        <p className="sl-note">Illustrated map and dotted connections are schematic. Distances use fixed destination landmarks; hotel pickups, detours and sightseeing add kilometres. Up to 12 stops. Tap destinations on mobile.</p>
      </div>
    </div>
    <details className="sl-destination-directory" open={filtered}><summary>Browse {matches.length} destinations <span>+</span></summary><div className="sl-directory-grid">{matches.map(p => <div key={p.id}><button type="button" className="sl-explore-place" aria-label={`Preview ${p.name}`} onClick={() => { explore(p.id); mapRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }}><small>{destinationTheme(p.id)}</small><strong>{p.name}</strong><span>{p.kind}</span></button><button type="button" aria-label={`Add ${p.name} from destination list`} disabled={stops.length >= 12 || stops.at(-1) === p.id} onClick={() => add(p.id)}>+</button></div>)}</div>{!matches.length && <p>No matching destinations. Try another name or theme.</p>}</details>
    <details className="sl-art-gallery"><summary>Explore the landmark sketches <span>+</span></summary><div className="sl-attractions-heading"><h3>Sketches from the island</h3><p>Explore the main attractions, then add their destination to your journey.</p></div>
    <div className="sl-attractions">{attractions.map(a => <button type="button" key={a.destination} onClick={() => add(a.destination)} disabled={stops.length >= 12} aria-label={`Add ${a.name} destination to journey`}><svg className="sl-attraction-art" aria-hidden="true" viewBox={`${a.col * a.cellWidth} ${a.row * a.cellHeight} ${a.cellWidth} ${a.cellHeight}`} overflow="hidden"><defs><clipPath id={`${uid}-card-${a.destination}`}><rect x={a.col * a.cellWidth + a.cellWidth * .08} y={a.row * a.cellHeight + a.cellHeight * .08} width={a.cellWidth * .84} height={a.cellHeight * .84} /></clipPath></defs><image href={a.asset} width={a.sheetWidth} height={a.sheetHeight} preserveAspectRatio="none" clipPath={`url(#${uid}-card-${a.destination})`} /></svg><small>{a.category}</small><strong>{a.name}</strong><span className="sl-attraction-add">Add destination +</span></button>)}</div>
    </details><p className="sl-art-note">Artist impressions of Sri Lanka’s attractions. Place and gateway positions are approximate. Landmark artwork is illustrative; destination markers determine route distance.</p>
  </section>;
}
