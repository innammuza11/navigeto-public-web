"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_SITE_CONFIG } from "@/lib/defaults";
import { loadSiteConfig } from "@/lib/travelos";
import type { SiteConfig } from "@/lib/types";

type SiteContextValue = { config: SiteConfig; loading: boolean };
const SiteContext = createContext<SiteContextValue>({ config: DEFAULT_SITE_CONFIG, loading: true });

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadSiteConfig()
      .then((live) => {
        if (!active) return;
        setConfig({ ...DEFAULT_SITE_CONFIG, ...live });
      })
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({ config, loading }), [config, loading]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
