"use client";

import { useState } from "react";
import { AdvancedSearchForm, type SearchType } from "@/components/module-search";

const tabs: Array<{ type: SearchType; label: string; icon: string; copy: string }> = [
  { type: "hotel", label: "Hotels", icon: "🏝", copy: "Stays & rooms" },
  { type: "tour", label: "Tours", icon: "🧭", copy: "Private journeys" },
  { type: "flight", label: "Flights", icon: "✈", copy: "Live fares" },
  { type: "visa", label: "Visas", icon: "◎", copy: "Requirements" },
  { type: "transfer", label: "Transfers", icon: "🚐", copy: "Private vehicles" },
];

export function BookingSearch() {
  const [tab, setTab] = useState<SearchType>("hotel");
  return <div className="search-panel home-search-panel">
    <div className="search-tabs" role="tablist" aria-label="Travel search services">{tabs.map((item) => <button key={item.type} type="button" role="tab" aria-selected={tab === item.type} className={tab === item.type ? "active" : ""} onClick={() => setTab(item.type)}><span aria-hidden="true">{item.icon}</span><b>{item.label}</b><small>{item.copy}</small></button>)}</div>
    <AdvancedSearchForm key={tab} type={tab} surface="home"/>
  </div>;
}
