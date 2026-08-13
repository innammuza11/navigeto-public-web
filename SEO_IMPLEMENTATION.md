# Public website SEO implementation

## Crawl and canonical policy

- The one canonical origin is `https://navigeto.com`; `www` redirects to the apex domain.
- Every indexable route emits a self-referential canonical in the original HTML.
- Account, login, signup and API routes are excluded from crawling or indexing.
- `robots.txt` advertises the root sitemap and canonical host.
- `sitemap.xml` contains static landing pages, published tours, published hotel pages, international country landings and public image references. Static pages do not claim a fabricated `lastmod`; dynamic records use their real update timestamp when available.

## Rendering and structured data

- Tour listings and tour/hotel detail content are server-rendered with live TravelOS data so crawlers receive headings, copy and internal links without waiting for client effects.
- Missing tour and hotel records return HTTP 404 with `noindex`; temporarily unavailable upstream data is not mislabeled as a missing record.
- The root emits a connected `Organization` / `TravelAgency` and `WebSite` graph.
- Tour pages emit `TouristTrip`, `Offer` when a published price exists, and `BreadcrumbList` data.
- Hotel pages emit `Hotel`, address/geo/amenity fields when present, and `BreadcrumbList` data.
- Remote TravelOS media uses Next image optimization against public Supabase Storage paths.

## Paid-media measurement

- Google tag (`G-` or `GT-`), Google Tag Manager (`GTM-`), Google Ads (`AW-`) and Meta Pixel IDs come only from public site settings.
- Marketing tags load only after the configured consent decision.
- TravelOS enquiry references create idempotent lead event IDs. Google browser events include the same transaction identifier used for server-side click-conversion uploads; Meta browser and Conversions API events share an event ID.
- OAuth credentials and provider tokens remain in Supabase Vault. A release is not considered connected until real OAuth, account discovery/sync and a consented test conversion succeed.

## Verification performed on 2026-08-13

- Public-web TypeScript, ESLint and production build passed.
- Full admin TypeScript and production build passed with the documented 8-GB Node heap allowance.
- Focused Google/Meta provider tests passed 4/4.
- Local production-mode HTTP checks returned 200 for `robots.txt`, `sitemap.xml` and the web manifest.
- Live-data development checks produced 254 canonical sitemap URLs. A real tour and hotel page returned server-rendered content, entity and breadcrumb schema; invalid tour and hotel slugs returned HTTP 404 with `noindex`.

These checks validate the artifact, not the public production release. Production acceptance still requires separate admin and public-site deployments plus provider authorization and test-event confirmation.
