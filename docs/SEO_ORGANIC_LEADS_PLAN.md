# SEO audit and organic lead-generation plan

Audit date: 2 November 2026. Scope: navigeto.com, built from this repository
(`navigeto-public-web`). The `public-web/` folder inside `navigeto-travelos` is
an older copy and does not serve the live site (see `AGENTS.md`).

## Why this matters now

Real data from `travelos_public_enquiries` (read-only query, last 60 days):

| | Count |
|---|---|
| Website enquiries | 181 |
| Navigeto One software demo requests (mostly bots, see PR #57) | 170 |
| Genuine travel enquiries (tour, transfer, flight, hotel, contact, custom trip) | ~11 |

That is about 1–2 travel enquiries a week from the website. Organic search
should be the cheapest way to grow that number. Today, crawlers see very little
of the catalogue.

## Audit findings (live site, before this PR)

Evidence was gathered with `curl` against production, using the HTML before
JavaScript runs. That is what most crawlers and AI answer engines read.

### Critical

1. **Tour pages had no content before JavaScript ran.** On
   `/tours/package/november-2026-heritage-capital`, the main content was 11
   words, with `<h1>Loading journey…</h1>`. All 170 live packages were affected.
   Google renders JavaScript later and less reliably. Bing, social previews and
   AI crawlers see the loading state. **Fixed in this PR:** the same page now
   ships 686 words, the real H1, the itinerary, inclusions and the price.
2. **The sitemap was missing 70 of 170 published tours.** The live
   `sitemap.xml` had exactly 100 `/tours/package/` URLs, because `tour-list` in
   `public-travel-api` is limited to 100 rows. `travelos_public_packages_live`
   has 170 rows (97 Sri Lanka, 73 international). **Fixed:** the sitemap now
   merges country-filtered calls and lists all 170. It also adds
   `/tours/sri-lanka`, `/tours/international` and `/partners`.
3. **`/visas` had no metadata.** It used the homepage title, had no canonical,
   and duplicated the homepage description. `STATIC_SEO["/visas"]` existed but
   the page never used it. **Fixed.**
4. **Hotel pages have no content before JavaScript runs** (9 words, no H1) on
   all 218 hotel profiles. They wait for date-based rate search on the client.
   **Not fixed here.** This is plan item P1.2.

### High

5. **Mobile has no visible enquiry route.** At 375 px, the first screen is
   partner chrome: Partner portal, Sign in, Register, then currency. The header
   WhatsApp button is `desktop-only`. Fixed elements are only the consent
   banner and the Navi chat launcher. **Fixed:** a mobile-only enquiry bar now
   offers "WhatsApp us" (prefilled with the page name and URL) and "Get a free
   quote". It is hidden on checkout, payment, partner, Navigeto One and pages
   that already have a form.
6. **The consent banner's "Decline marketing" button was invisible**: white
   text on the editorial theme's white panel. That is a consent-UX and
   compliance problem. **Fixed** (ink text, visible border).
7. **No breadcrumbs anywhere.** Tour schema was a bare `TouristTrip` with no
   `Offer`, provider or itinerary list. **Fixed:** tours now emit
   `TouristTrip` + `ItemList` itinerary + `Offer` (published selling price
   only) + `BreadcrumbList`. Hotels now also emit `BreadcrumbList`.
8. **`/tours` has no crawlable links to packages.** The list is fetched on the
   client, so the HTML of `/tours`, the homepage and `/holidays` links to zero
   tour or hotel pages. Packages are reachable only through the sitemap. Plan
   item P1.1.
9. **No `FAQPage`, `Review` or `AggregateRating` markup**, and no FAQ content.
   `/reviews` links out to Google, Tripadvisor and Trustpilot without
   structured data. Plan items P2.3 and P3.2.

### Medium

10. Inconsistent title suffixes: "| Navigeto" vs "| Navigeto Travels", and
    `/group-tours` and `/partners` had a doubled brand
    ("… | Navigeto | Navigeto Travels"). **Fixed for those two.**
11. `/partners` had no canonical. **Fixed.**
12. `/tours` has two `<h1>` elements: the hero and a search heading.
13. Thin pages: `/group-tours` (42 words), `/pay` (101), `/reviews` (137),
    `/visas` (144). `/visas` and `/group-tours` should carry real copy.
14. `/tours/[category]` accepts any slug and renders the full catalogue with a
    self-canonical. For example, `/tours/anything` is indexable duplicate
    content. Restrict it to known categories or use `noindex` for the rest.
15. Images: 6 decorative `<img>` elements without `alt` across About,
    Contact, Custom trip, Flights, Tours and Transfers. Decorative images
    should have `alt=""` so the omission is explicit.
16. Performance, home page, desktop pane: 1.4 MB transferred (1.05 MB images,
    185 KB JS), TTFB ~1.2 s, CLS 0. PageSpeed Insights quota was exhausted
    during the audit, so there are no lab LCP numbers. Run Search Console's
    Core Web Vitals report once access is shared.

### Already good

- One canonical host: `www` and `navigeto.lk` 301-redirect to `navigeto.com`.
- `robots.txt` blocks booking and checkout, `/api/` and visa application
  pages, and advertises the sitemap.
- Organization/TravelAgency + WebSite JSON-LD on every page, with Tripadvisor
  and Trustpilot `sameAs`.
- Self-referencing canonicals and Open Graph images on most routes.
- A Google site-verification file is published, so Search Console ownership
  likely exists already.
- Visa content comes from the Visa Intelligence API (`/api/visa` proxy), which
  reads `visa_rules_active`. Nothing in this PR changes that.

## Prioritised plan

Each item has an owner type, expected lead impact and risk. Items 1–3 can
ship without new content approval. Items marked **content** need business
sign-off on the wording.

### P1 — this month (technical, low risk)

1. **Server-render the tour catalogue** (`/tours`, `/tours/sri-lanka`,
   `/tours/international`, homepage featured tours). Pass the server-loaded list
   into `TourResults`, as this PR does for `TourDetail`. This creates
   crawlable links to every package.
2. **Server-render hotel profiles.** Render the profile (name, description,
   photos, facilities, room types) from the server-fetched hotel. Keep rate
   search on the client.
3. **Add a `tour-sitemap` action, or raise the `tour-list` limit for the
   sitemap,** in `public-travel-api`. This removes the per-country fan-out.
   Note that 5 published packages have no country; check they are in the
   first 100 (they are listed today).
4. Restrict `/tours/[category]` to known categories (404 otherwise).
5. Give decorative images `alt=""`, keep one H1 per page, and normalise title
   suffixes to "| Navigeto Travels".
6. **Search Console:** submit the sitemap and watch "Discovered – not indexed"
   for the 170 tours and 218 hotels. Needs the user's access (below).

### P2 — next 4–6 weeks (content + templates)

1. **Destination landing pages** `/sri-lanka/[place]` for Sigiriya, Kandy,
   Ella, Nuwara Eliya, Yala, Galle, Mirissa, Trincomalee, Jaffna,
   Anuradhapura, Arugam Bay and Colombo. Each page: a unique 400–700 word guide
   (best time, how many days, getting there by private car, what to pair it
   with), the published tours that include the place (from
   `travelos_public_packages`), hotels in the destination, a map snippet, an
   FAQ and an inline enquiry form. These target "things to do in Ella",
   "Sigiriya tour from Colombo" and similar. **Content**
2. **Itinerary-length pages**: "Sri Lanka 7-day itinerary", "10 days", "14
   days", "Sri Lanka honeymoon", "Sri Lanka family holiday", "Sri Lanka
   wildlife safari". Each is a curated view over published packages plus
   editorial copy. These are high-intent searches that convert to quotes.
   **Content**
3. **FAQ blocks with `FAQPage` markup** on tours, visas, transfers and custom
   trip. Cover price ranges, best season, driver and guide, payment, and
   cancellation. Use only facts the business confirms. Google shows FAQ rich
   results only for a few sites now, but the copy still ranks and feeds AI
   answers. **Content**
4. **Visa pages per destination and nationality**, for example
   `/visas/schengen/sri-lankan-passport` and
   `/visas/sri-lanka-eta/indian-passport`. Generate them from
   `visa_rules_active` through the existing Visa Intelligence API only. Index a
   combination only when a verified active rule exists; otherwise
   `noindex` with an enquiry form. Show a "last verified" date. Never publish
   unverified rules (architecture rule 16).
5. **Inline enquiry form on tour pages** with a short version: name,
   WhatsApp, month, travellers. It posts through `liveApi.enquiry` with
   `enquiry_type: "tour"` and the package slug, the same keyed and idempotent
   path as every other form. It feeds `/api/inquiries/public-web` and identity
   matching in TravelOS. No new lead system.
6. **Exit-intent (desktop) and scroll-depth (mobile) prompt** on tour,
   destination and guide pages: "Get this itinerary as a PDF + a quote".
   Show it once per session, dismiss with Escape, respect reduced motion. It
   uses the same enquiry path.

### P3 — 2–3 months (authority and local)

1. **Guides/blog** (`/guides/...`): 2 posts a month, each linking to 2–3
   tours and a destination page. Themes:
   - Inbound: best time to visit Sri Lanka by month, train Kandy to Ella, Yala
     vs Udawalawe vs Wilpattu, Sri Lanka ETA how-to, cost of a private driver,
     whale watching season, Sri Lanka with kids.
   - Outbound (Sri Lankan travellers): Schengen visa checklist for Sri Lankans,
     Thailand / Singapore / Malaysia / Dubai visa for Sri Lankans, Vietnam &
     Cambodia from Colombo, group tours from Sri Lanka.
2. **Reviews:** show real Google, Tripadvisor and Trustpilot ratings on
   `/reviews` and tour pages. Add `AggregateRating` only for first-party
   reviews collected on navigeto.com, since self-serving review markup for
   third-party reviews is against Google policy. Ask every completed
   reservation for a Google review (automate in TravelOS after trip end).
3. **Google Business Profile:** verify the Colombo listing. Set category to
   "Tour agency" / "Travel agency", add services that match the site menu,
   weekly posts linking to tours, photos from the guest album, and a WhatsApp
   chat link. Keep name, address and phone identical to the footer and
   Organization schema (+94 77 420 6166, info@navigeto.com). Add the Google
   Maps URL to `sameAs`. **Needs the user's GBP access.**
4. **Lead magnets:** "Download this itinerary (PDF)" on each tour, gated by
   name + WhatsApp/email through `liveApi.enquiry` (type `tour`,
   `details.lead_magnet`). Also a "Sri Lanka first-timer's planning guide" PDF.
   The PDF builder already exists in TravelOS (`itinerary-pdf`).
5. **Link building:** Tripadvisor and Trustpilot profiles exist. Add
   SLTDA-approved operator listings, hotel partner backlinks (the partner
   portal already has the hotels) and Sri Lanka travel directories.

### Keyword themes by market

| Market | Example themes | Landing page type |
|---|---|---|
| UK, Germany, France, Netherlands | "Sri Lanka tour with private driver", "Sri Lanka 2 week itinerary", "Sri Lanka round trip" (DE: "Sri Lanka Rundreise mit Fahrer") | Itinerary-length + tour pages |
| India | "Sri Lanka tour package from India", "Ramayana tour Sri Lanka", "Sri Lanka honeymoon package" | Themed packages + visa ETA page |
| Australia | "Sri Lanka family holiday", "Sri Lanka surf + culture trip" | Destination + family pages |
| Russia, China | "Sri Lanka beach holiday", "Sri Lanka tour" (localised later) | Destination pages; consider translation in P3 |
| Middle East expats | "Sri Lanka holiday package from Dubai", short 4–6 night breaks | Short-escape collection |
| Sri Lankan residents (outbound) | "Thailand tour package from Sri Lanka", "Schengen visa Sri Lanka", "group tours from Sri Lanka" | International tours, group tours, visa pages |
| Corporate / MICE | "Sri Lanka DMC", "MICE Sri Lanka", "incentive trip Sri Lanka" | `/corporate` with case studies |

### Measurement

- Leads: count `travelos_public_enquiries` by `details.source_page` (added in
  this PR for enquiries from the mobile bar) and `enquiry_type`, excluding
  demo requests.
- Clicks: a `contact_click` analytics event (consent-gated) for WhatsApp and
  quote taps. It is deliberately not counted as a Lead conversion; the TravelOS
  reference stays the only Lead.
- WhatsApp: the prefilled message names the page, so staff and the WhatsApp
  sales agent see which page the chat came from.
- Search: impressions, clicks and indexed pages per template in Search
  Console. Review monthly.

## Needs the user

1. **Search Console:** add the agent's Google account (or share an export) for
   the `navigeto.com` property, so the sitemap can be submitted and
   indexing/Core Web Vitals checked.
2. **Google Analytics / Tag Manager:** confirm the GA4 property behind the
   tag in site settings and grant read access to report lead sources.
3. **Google Business Profile** access for the Colombo listing.
4. **Content approval:** destination copy, FAQ answers (prices, cancellation,
   payment terms), and which visa routes to publish first.
5. Decide whether the stale `navigeto-travelos/public-web/` copy should be
   archived, since it misleads tooling and agents about where the live site is.
