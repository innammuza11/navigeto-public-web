"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { themeForPath, type NatureSurface } from "./nature-theme";

/** A decorative sibling to existing UI. No content, layout, or business state. */
export function NatureTheme({ children, surface }: { children: ReactNode; surface: NatureSurface }) {
  const pathname = usePathname() ?? "/";
  const theme = themeForPath(pathname, surface);
  const shell = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const container = shell.current;
    if (!element || !container) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    // Data-saving mode keeps the CSS theme without downloading the renderer.
    if (connection?.saveData) return;
    const timer = window.setTimeout(() => {
      void import("./nature-renderer").then(({ mountNatureRenderer }) => {
        if (!cancelled) dispose = mountNatureRenderer(element, theme, surface, (ready) => {
          container.dataset.natureReady = String(ready);
        });
      }).catch(() => { container.dataset.natureReady = "false"; });
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      dispose?.();
      container.dataset.natureReady = "false";
    };
  }, [theme, surface]);

  return <div ref={shell} className="nature-shell" data-nature-theme={theme} data-nature-surface={surface} data-nature-entry={surface === "admin" && pathname === "/login" ? "true" : undefined}>
    <div className="nature-environment" aria-hidden="true"><canvas ref={canvas} className="nature-canvas"/><div className="nature-light"/></div>
    {children}
  </div>;
}
