const reviewSources = [
  {
    name: "Google Reviews",
    mark: "G",
    rating: null,
    count: "Current rating on Google",
    copy: "Open the verified Google listing to read every available customer review.",
    href: "https://www.google.com/maps/search/?api=1&query=Navigeto%20Travels%2C%20420%202%2F1%20Elvitigala%20Mawatha%2C%20Colombo",
    className: "review-google",
  },
  {
    name: "Tripadvisor",
    mark: "●",
    rating: "4.8",
    count: "20 traveller reviews",
    copy: "Multi-day tours, transfers and Sri Lanka journeys reviewed by travellers.",
    href: "https://www.tripadvisor.com/Attraction_Review-g293962-d23952772-Reviews-Navigeto_Travels_Pvt_Ltd-Colombo_Western_Province.html",
    className: "review-tripadvisor",
  },
  {
    name: "Trustpilot",
    mark: "★",
    rating: "4.5",
    count: "13 customer reviews",
    copy: "International holidays, Visa assistance and trip planning reviewed by customers.",
    href: "https://www.trustpilot.com/review/navigeto.lk",
    className: "review-trustpilot",
  },
] as const;

export function ReviewShowcase() {
  return <section className="review-section">
    <div className="shell review-layout">
      <div className="review-copy"><p className="eyebrow">Real travellers · independent platforms</p><h2>Don&apos;t take our word for it.<br/><em>Read theirs.</em></h2><p>Ratings are a provider snapshot verified on 23 August 2026. The linked provider profile remains the source of truth for the current rating and every review.</p></div>
      <div className="review-source-grid">
        {reviewSources.map((source) => <a className={`review-source-card ${source.className}`} href={source.href} target="_blank" rel="noreferrer" key={source.name}>
          <div className="review-source-head"><span>{source.mark}</span><b>{source.name}</b><i aria-hidden="true">↗</i></div>
          {source.rating ? <div className="review-score"><strong>{source.rating}</strong><span>★★★★★</span></div> : <div className="review-score review-score-google"><strong>Live profile</strong><span>Current rating on Google</span></div>}
          <small>{source.count}</small><p>{source.copy}</p><b>Read all on {source.name}</b>
        </a>)}
      </div>
    </div>
  </section>;
}
