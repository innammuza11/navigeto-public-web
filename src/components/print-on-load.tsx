"use client";

import { useEffect } from "react";

/** Opens the print dialog (Save as PDF) when the sheet is opened with ?print=1. */
export function PrintOnLoad() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("print") !== "1") return;
    const timer = window.setTimeout(() => window.print(), 600);
    return () => window.clearTimeout(timer);
  }, []);
  return <button type="button" className="button button-gold itinerary-sheet-print" onClick={() => window.print()}>Save as PDF</button>;
}
