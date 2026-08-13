export function PageHero({ eyebrow, title, description, image, children }: { eyebrow: string; title: string; description: string; image?: string; children?: React.ReactNode }) {
  const style = image
    ? { backgroundImage: `linear-gradient(100deg, var(--navy) 8%, rgba(7,26,47,.86) 34%, rgba(7,26,47,.35) 68%, rgba(7,26,47,.15)), url(${image})`, backgroundSize: "cover", backgroundPosition: "center right" }
    : undefined;
  return <section className={`page-hero${image ? " page-hero-image" : ""}`} style={style}><div className="shell"><div className="eyebrow light">{eyebrow}</div><h1>{title}</h1><p>{description}</p>{children}</div></section>;
}
