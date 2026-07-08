export function LoadingCards({ count = 3 }: { count?: number }) {
  return <div className="card-grid">{Array.from({ length: count }).map((_, i) => <div className="skeleton-card" key={i}><span/><span/><span/></div>)}</div>;
}
