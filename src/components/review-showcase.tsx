const reviewSources = [
  {
    name: "Google Reviews",
    mark: "G",
    rating: "4.9",
    count: "196 Google reviews",
    checked: "13 September 2026",
    copy: "Open the verified Google listing to read every available customer review.",
    href: "https://www.google.com/maps?cid=9325873036199648930",
    className: "review-google",
  },
  {
    name: "Tripadvisor",
    mark: "●",
    rating: "4.8",
    count: "20 traveller reviews",
    checked: "23 August 2026",
    copy: "Multi-day tours, transfers and Sri Lanka journeys reviewed by travellers.",
    href: "https://www.tripadvisor.com/Attraction_Review-g293962-d23952772-Reviews-Navigeto_Travels_Pvt_Ltd-Colombo_Western_Province.html",
    className: "review-tripadvisor",
  },
  {
    name: "Trustpilot",
    mark: "★",
    rating: "4.5",
    count: "13 customer reviews",
    checked: "23 August 2026",
    copy: "International holidays, Visa assistance and trip planning reviewed by customers.",
    href: "https://www.trustpilot.com/review/navigeto.lk",
    className: "review-trustpilot",
  },
] as const;

export function ReviewShowcase() {
  return <section className="review-section" id="reviews" aria-label="Independent customer reviews">
    <div className="shell review-layout">
      <div className="review-copy"><p className="eyebrow">Real travellers · independent platforms</p><h2>Don&apos;t take our word for it.<br/><em>Read theirs.</em></h2><p>Read what travellers say about Navigeto. Ratings below are dated snapshots; visit each platform for the latest score and all reviews.</p></div>
      <div className="review-source-grid">
        {reviewSources.map((source) => <a className={`review-source-card ${source.className}`} href={source.href} target="_blank" rel="noreferrer" key={source.name}>
          <div className="review-source-head"><span>{source.mark}</span><b>{source.name}</b><i aria-hidden="true">↗</i></div>
          {source.rating ? <div className="review-score"><strong>{source.rating}</strong><span aria-label={`${source.rating} out of 5`}>★ {source.rating} / 5</span></div> : <div className="review-score review-score-google"><strong>Live profile</strong><span>Current rating on Google</span></div>}
          <small>{source.count}</small><small>Checked {source.checked}</small><p>{source.copy}</p><b>Read all on {source.name}</b>
        </a>)}
      </div>
    </div>
  </section>;
}
