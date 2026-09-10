"use client";

import Image from "next/image";

// Public reference: https://biataxi.lk/airport-transfers, checked 2026-09-10.
// Indicative selling proposals, not approved supplier costs or automatic quotes.
const airportRoutes = [
  { destination: "Colombo City Center", vehicle: "Executive Sedan", duration: "45 minutes", amount: 8500 },
  { destination: "Negombo Beach", vehicle: "Premium Sedan", duration: "20 minutes", amount: 4500 },
  { destination: "Galle / Unawatuna", vehicle: "Executive Mini-Van", duration: "2 hours", amount: 18500 },
  { destination: "Kandy City", vehicle: "Luxury SUV", duration: "3 hours", amount: 15500 },
  { destination: "Sigiriya / Dambulla", vehicle: "Executive Sedan", duration: "4 hours", amount: 22000 },
];
const fleet = [
  { name: "Mercedes-Benz Sedan", image: "mercedes-sedan", copy: "A chauffeur-driven sedan for airport arrivals, city transfers and business travel." },
  { name: "Mercedes-Benz Vito", image: "vito", copy: "A private passenger van for family transfers and journeys with your group." },
  { name: "Toyota Hiace", image: "hiace", copy: "A passenger van option for group transfers and private touring." },
  { name: "Toyota Alphard", image: "alphard", copy: "A luxury MPV option for private transfers and comfortable chauffeur-driven journeys." },
  { name: "Toyota Land Cruiser Prado", image: "prado", copy: "A private SUV option for airport transfers and journeys through Sri Lanka." },
  { name: "Toyota Land Cruiser", image: "land-cruiser", copy: "Travel between cities or plan a longer journey with a private chauffeur." },
  { name: "Range Rover", image: "range-rover", copy: "A premium SUV option for private airport transfers and touring." },
];

export type TransferInterest = { origin?: string; destination?: string; vehicle: string; indicative_amount?: number; currency?: string; trip_type?: string };

export function TransferShowcase({ onSelect }: { onSelect: (selection: TransferInterest) => void }) {
  function choose(selection: TransferInterest) {
    onSelect(selection);
    document.getElementById("enquire")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return <div className="transfer-showcase">
    <section className="section shell" aria-labelledby="airport-routes-heading">
      <div className="section-title"><p className="eyebrow">From Bandaranaike International Airport</p><h2 id="airport-routes-heading">Popular airport transfers.</h2><p>Indicative prices per private vehicle, one way. Share your dates and group details for a confirmed quotation.</p></div>
      <div className="airport-route-grid">{airportRoutes.map((route) => <article className="airport-route-card" key={route.destination}>
        <p className="eyebrow">BIA airport →</p><h3>{route.destination}</h3><p>{route.vehicle}</p><p className="transfer-duration">Approx. {route.duration}</p>
        <div className="transfer-fare"><span>Indicative price</span><strong>LKR {route.amount.toLocaleString("en-US")}</strong><span>Per vehicle · one way</span></div>
        <button type="button" className="button button-gold" onClick={() => choose({ origin: "Bandaranaike International Airport", destination: route.destination, vehicle: route.vehicle, indicative_amount: route.amount, currency: "LKR", trip_type: "one_way" })}>Request this route</button>
      </article>)}</div>
      <p className="transfer-terms">Travel times vary with traffic. Your final quotation will confirm vehicle availability, tolls, parking, taxes, waiting time and any additional stops.</p>
    </section>
    <section className="section pale" aria-labelledby="transfer-fleet-heading"><div className="shell">
      <div className="section-title"><p className="eyebrow">Choose your vehicle</p><h2 id="transfer-fleet-heading">Find the right vehicle for your journey.</h2><p>Request your preferred model. We will confirm passenger and luggage capacity, availability and the price for your journey.</p></div>
      <div className="transfer-fleet-grid">{fleet.map((vehicle) => <article className="transfer-vehicle-card" key={vehicle.name}>
        <div className="transfer-vehicle-image"><Image src={`/media/transfers/${vehicle.image}.png`} alt={`${vehicle.name} exterior`} fill sizes="(max-width: 700px) 100vw, 50vw" /></div>
        <div className="transfer-vehicle-copy"><h3>{vehicle.name}</h3><p>{vehicle.copy}</p><p className="transfer-vehicle-rate">Rate on request</p><button type="button" className="button button-primary" onClick={() => choose({ vehicle: vehicle.name })}>Request this vehicle</button></div>
      </article>)}</div>
    </div></section>
  </div>;
}
