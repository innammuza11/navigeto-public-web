"use client";

import Link from "next/link";
import { useSite } from "./SiteProvider";

export function FloatingAssistant() {
  const { config } = useSite();
  if (!config.assistant_enabled) return null;
  return <Link className="floating-assistant" href="/trip-assistant" aria-label="Open trip assistant"><span>✦</span><b>Plan my trip</b></Link>;
}
