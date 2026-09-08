/** Pointer-only polish on existing homepage links. Never intercept navigation. */
export function mountSkyMotion(root: HTMLElement): () => void {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  let active: HTMLElement | null = null;
  let frame = 0;
  let clientX = 0, clientY = 0;
  const selector = ".journey-card, .service-flow-card";
  function clear() {
    cancelAnimationFrame(frame); frame = 0;
    if (active) {
      for (const name of ["--sky-tilt-x", "--sky-tilt-y", "--sky-light-x", "--sky-light-y"])
        active.style.removeProperty(name);
      delete active.dataset.skyHover;
    }
    active = null;
  }
  function render() {
    frame = 0;
    if (!active || media.matches || !fine.matches) return;
    const bounds = active.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - bounds.left) / Math.max(bounds.width, 1)));
    const y = Math.max(0, Math.min(1, (clientY - bounds.top) / Math.max(bounds.height, 1)));
    active.style.setProperty("--sky-tilt-x", `${(0.5 - y) * 4}deg`);
    active.style.setProperty("--sky-tilt-y", `${(x - 0.5) * 4}deg`);
    active.style.setProperty("--sky-light-x", `${x * 100}%`);
    active.style.setProperty("--sky-light-y", `${y * 100}%`);
  }
  function move(event: PointerEvent) {
    if (event.pointerType !== "mouse" || media.matches || !fine.matches) return;
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>(selector) : null;
    if (target !== active) {
      clear(); active = target;
      if (active) active.dataset.skyHover = "true";
    }
    if (!active) return;
    clientX = event.clientX; clientY = event.clientY;
    if (!frame) frame = requestAnimationFrame(render);
  }
  function leave(event: PointerEvent) {
    if (!(event.relatedTarget instanceof Node) || !active?.contains(event.relatedTarget)) clear();
  }
  root.addEventListener("pointermove", move, { passive: true });
  root.addEventListener("pointerout", leave, { passive: true });
  window.addEventListener("blur", clear);
  media.addEventListener("change", clear);
  fine.addEventListener("change", clear);
  return () => {
    clear();
    root.removeEventListener("pointermove", move);
    root.removeEventListener("pointerout", leave);
    window.removeEventListener("blur", clear);
    media.removeEventListener("change", clear);
    fine.removeEventListener("change", clear);
  };
}
