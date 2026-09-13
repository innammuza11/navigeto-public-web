/* eslint-disable @next/next/no-img-element */
import styles from './guest-album-teaser.module.css';

export function GuestAlbumTeaser() {
  return <section className={`section shell ${styles.album}`} aria-labelledby="guest-album-title">
    <div className={styles.copy}><p className="eyebrow">The Navigeto guest album</p><h2 id="guest-album-title">Real guests.<br/><em>Beautiful memories.</em></h2><p>Warm welcomes, shared adventures and the people behind the journeys we’ve had the pleasure of handling.</p><a className="button button-primary" href="/guest-album">Explore our guest album <span aria-hidden="true">↗</span></a></div>
    <a className={styles.photos} href="/guest-album" aria-label="Explore Navigeto guest photographs"><img src="/guest-album/images/099-small.webp" alt="Navigeto guests together in Colombo" width="640" height="480" loading="lazy"/><img src="/guest-album/images/023-small.webp" alt="Guests enjoying a hill-country view" width="600" height="800" loading="lazy"/></a>
  </section>;
}
