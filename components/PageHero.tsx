export function PageHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <section className="page-hero"><div className="shell"><div className="eyebrow light">{eyebrow}</div><h1>{title}</h1><p>{description}</p>{children}</div></section>;
}
