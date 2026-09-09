"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { themeForPath, type NatureSurface } from "./nature-theme";

/** A decorative sibling to existing UI. No content, layout, or business state. */
export function NatureTheme({ children, surface }: { children: ReactNode; surface: NatureSurface }) {
  const pathname = usePathname() ?? "/";
  const theme = themeForPath(pathname, surface);
  const skyJourney = surface === "public" && pathname === "/";
  const shell = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const container = shell.current;
    if (!element || !container) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    let disposeMotion: (() => void) | undefined;
    let idle: number | undefined;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    // Data-saving mode keeps the CSS theme without downloading the renderer.
    if (connection?.saveData) return;
    const start = () => {
      if (cancelled) return;
      if (skyJourney) {
        void import("./landscape-scene").then(({ mountLandscapeScene }) => {
          if (!cancelled) dispose = mountLandscapeScene(element, container, ready => {
            container.dataset.natureReady = String(ready);
          });
        }).catch(() => { if (!cancelled) container.dataset.natureReady = "false"; });
      } else {
        void import("./nature-renderer").then(({ mountNatureRenderer }) => {
          if (!cancelled) dispose = mountNatureRenderer(element, theme, surface, ready => {
            container.dataset.natureReady = String(ready);
          });
        }).catch(() => { if (!cancelled) container.dataset.natureReady = "false"; });
      }
      if (skyJourney) void import("./sky-motion").then(({ mountSkyMotion }) => {
        if (!cancelled) disposeMotion = mountSkyMotion(container);
      }).catch(() => {});
    };
    // Keep initial text, search controls and photography ahead of GPU compilation.
    const timer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(start, { timeout: 2000 });
      else start();
    }, skyJourney ? 900 : 150);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      dispose?.();
      disposeMotion?.();
      container.dataset.natureReady = "false";
    };
  }, [theme, surface, skyJourney]);

  return <div ref={shell} className="nature-shell" data-cinematic-journey={skyJourney ? "true" : undefined} data-nature-theme={theme} data-nature-surface={surface} data-nature-entry={surface === "admin" && pathname === "/login" ? "true" : undefined}>
    <div className="nature-environment" aria-hidden="true"><canvas ref={canvas} className="nature-canvas"/><div className="nature-light"/></div>
    {children}
  </div>;
}
