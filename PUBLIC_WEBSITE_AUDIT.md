# Navigeto Public Website — Audit (2026-07-08)

## Scope of this audit

`public-web` is a **separate git repository** (`navigeto-public-web`, origin
`github.com/innammuza11/navigeto-public-web`), deployed independently from the
admin ERP (`navigeto-travelos` / `admin.navigeto.com`). It shares the same
Supabase project (`drtunalervcihvyxtxbi`) and talks to it only through two
public Edge Functions — no direct table access from the browser, no
service-role key in this codebase. Baseline `npm run typecheck` passes clean
with zero errors on `main` before any changes in this branch.

## What exists today

~750 lines across 21 files. A deliberately minimal, request-based MVP:

| Route | Purpose |
|---|---|
| `/` | Homepage: hero, unified search, featured destinations, tours preview |
| `/hotels` | Search `travelos_hotel_rate_library_active` via `customer-hotels`, request-booking modal |
| `/tours`, `/tours/[slug]` | List/detail of `travelos_public_packages_live`, request-quote CTA |
| `/transfers` | Route+vehicle price quote via `public-travel-api`, request-transfer modal |
| `/custom-trip`, `/trip-assistant` | Free-form enquiry forms into `travelos_public_enquiries` |
| `/about`, `/contact`, `/privacy`, `/terms` | Static content |

Design system: hand-rolled CSS custom properties in `app/globals.css` (no
Tailwind) — already covers buttons, cards, badges, forms, modals, skeletons,
tags, tag rows, empty states. This is a legitimate base for section 15 of the
marketplace spec, not a blocker.

Backend contract (both Edge Functions, action-routed, POST-only, rate-limited
on write actions, friendly errors only — raw errors never reach the browser):

- `public-travel-api`: `site-config`, `tour-list`, `tour-detail`,
  `transfer-quote`, `enquiry`, `assistant`.
- `customer-hotels`: `suggestions`, `search`, `booking`.

All pricing (hotel markup, transfer markup) is computed server-side inside
these functions; `hotel_rate_library`/`transport_rates`/mileage master net
costs and markup percentages are never serialized into a response.

## Gap vs. the full marketplace spec (23 sections)

This is the honest scale comparison. Building all 23 sections to
"production-ready" is a multi-week program, not a single session. Rough
sizing, most-to-least backend-dependent:

| Spec section | Status | What's actually missing |
|---|---|---|
| Hotels (7) | Partial | No image/amenity/geo columns exist on `travelos_hotel_rate_library` — a rate table, not a hotel-content table. `cancellation_policy`/`child_policy` text exists but buried in an unindexed `raw_data` JSONB blob never selected by the public function. |
| Sri Lanka Tours (8) | Partial | `travelos_public_packages` already carries `hero_image_url`, `tags`, full itinerary/inclusions/exclusions — richer filtering/detail is buildable today with zero schema change. |
| Transfers (11) | Partial | `travelos_transport_rates.capacity` and the curated `travelos_b2c_transport_catalog` (public vehicle name, capacity, inclusions/exclusions) already exist but aren't wired into the public quote response. Multi-stop/hourly/full-day hire have no rate model at all — no `rate_basis` for them. |
| Flights (6) | Not started | No GDS provider credentials configured anywhere. Provider-adapter architecture can be scaffolded; live fares cannot. |
| International Holidays (9) | Not started | No content table. Would reuse the `travelos_public_packages` pattern with a `destination_country` field. |
| Visas (10) | Not started | No content table, no document-upload security design yet. |
| Customer accounts (13) | Not started | Requires enabling public Supabase Auth + new RLS policies on the same project that runs the internal admin ERP — a security-architecture decision, tracked separately. |
| CMS contract (16) | In progress elsewhere | A `website_media` table (`SPRINT_19_WEBSITE_MEDIA_LIBRARY_MIGRATION.sql`) and admin media-library UI are mid-flight, uncommitted, in the `navigeto-travelos` working tree as of this audit — unrelated to this session, not touched here. |
| SEO/analytics/testing (17,19-21) | Not started this phase | Deferred; homepage/mega-nav and SEO were explicitly deprioritized in favor of upgrading Hotels/Tours/Transfers first. |

## This phase's scope (confirmed)

1. Surface existing-but-unexposed backend fields (hotel cancellation/child
   policy, transfer vehicle capacity/curated inclusions) — code-only changes
   to the two Edge Functions, no migration, redeploy required before the
   frontend change takes effect in production.
2. Upgrade Hotels, Sri Lanka Tours, Transfers pages to use the fuller field
   set, add real (non-fabricated) filters/sort, and — for transfer types with
   no rate model (hourly, full-day, multi-stop, corporate, group coach) —
   route straight to a "request a quote" flow instead of a fake instant price.
3. Flights: request-only module with a provider-adapter interface, no live
   fares, per explicit direction.
4. Customer accounts: scoped separately (Supabase Auth + RLS design), any
   migration confirmed explicitly before running against the shared
   production project.

## Non-negotiables carried forward from `CLAUDE.md` / prior handoff doc

- Public hotel search reads only `travelos_hotel_rate_library_active`.
- Transfer/hotel selling prices are always computed server-side.
- No supplier net rates, markup percentages, or internal remarks ever reach
  the browser — enforced by allow-listing specific fields out of `raw_data`,
  never forwarding the blob itself.
- All migrations additive, confirmed before running.

---

## Addendum (2026-07-09) — full 23-section marketplace spec

A follow-up brief asked for the complete premium marketplace vision: flights,
international holidays, visas, a unified trip basket, a fully expanded
customer account (quotes/bookings/payments/documents/messages), deep
Schema.org coverage, analytics, and 10 deliverable documents. Building all 23
sections to "production-ready" is realistically a multi-month program for a
team, not a single session — several sections require infrastructure that
doesn't exist yet (GDS credentials, payment gateway, per-country visa content
sourced by the business, a hotel content model beyond a rate table). Rather
than produce a giant plan and stop, this phase shipped the largest slice that
is honestly buildable today with zero fabricated data and no new
infrastructure decisions, and this addendum records the real per-section
status so the next phase starts from ground truth, not the original wishlist.

### Section-by-section status

| # | Section | Status | Notes |
|---|---|---|---|
| 4 | Navigation | **Done this phase** | Header now covers Flights, Hotels, Tours, Holidays, Visas, Transfers, Custom Trip, Corporate (icons, not emoji) + utility row (Trip Assistant, About, Contact, Sign in/My Account, WhatsApp). This is a comprehensive flat nav, not literal hover mega-panels with sub-columns/imagery — that's a real design task deferred to Phase 2, tracked below. Search/currency-switcher/language-switcher/My Trips/Saved Trips/Help Centre utility items were **not** added — building them would mean either fake functionality (currency conversion with one supported currency, a language switcher with one language) or duplicate entry points to pages that don't exist yet (My Trips/Saved Trips need the trip basket, section 12). |
| 5 | Homepage | **Partial this phase** | Sections shipped: announcement bar, header, hero, unified search, service grid (now 7 cards: hotels/transfers/tours/flights/holidays/visas/corporate), Sri Lanka destinations, why-Navigeto, CTA, footer, floating assistant — that's 9 of the 23 listed sections. **Not shipped**: featured promotions, flight deals, hotel offers, travel styles, customer reviews, trust/accreditation badges, blog/guides, newsletter signup, app-promo area. Reviews and accreditation badges specifically were skipped rather than faked — there is no real testimonial or accreditation data to display, and inventing customer quotes or trust-mark logos would be dishonest. These need real content (via the CMS, section 16) before they can ship. |
| 6 | Flights | **Was already built** (prior phase) | `/flights` request-only flow, `FlightProvider` adapter interface (Amadeus/Sabre/Travelport stubs, all `null`), no fabricated fares — matches spec exactly. `/flights/search`, `/flights/results`, `/flights/booking/[reference]` don't exist — there's nothing for them to show without a connected GDS; building empty shells would be exactly the "placeholder button" the spec's definition-of-done forbids. |
| 7 | Hotels | **Unchanged, partial** (prior phase) | Search/filter/sort/detail/policies already upgraded against real `travelos_hotel_rate_library_active` fields. Image gallery, room comparison, amenities and map view are **not buildable** without schema changes — the Hotel Master is a rate table, not a hotel-content table (no image/amenity/geo columns). This needs a scoped content-model migration, explicitly confirmed, in a future phase. |
| 8 | Sri Lanka Tours | **Unchanged, largely done** (prior phase) | Categories, filters, rich detail pages already shipped against real `travelos_public_packages` data. |
| 9 | International Holidays | **New this phase, landing only** | `/holidays` ships with the 12 spec-listed destinations shown as honest scope-of-service tags (not fake packages), and an enquiry form. `/holidays/[destination]/[slug]` package detail pages are **not built** — there's no content table and no real package data (price, hotel, inclusions) to populate them with; fabricating package prices/hotels would directly violate the "never invent fares/prices" rule. Needs a content table + admin authoring flow before real listing pages can exist. |
| 10 | Visas | **New this phase, consultation only** | `/visas` ships with a real intake form (nationality, residence, destination, dates) into TravelOS. `/visas/[country]` static content pages (eligibility, documents, fees, processing time per country) are **not built** — that's real embassy/consular data that has to be sourced and kept current by the business, not invented. `/visas/apply` and `/visas/track` (secure document upload + reference-gated status tracking) need the same document-security design as `/account/documents` (section 13) — deferred together. |
| 11 | Transfers | **Unchanged, partial** (prior phase) | Route/vehicle quoting already upgraded with the curated catalogue. Hourly/full-day/multi-stop/corporate/group-coach have no rate model in `travelos_transport_rates` at all — still routes to request-a-quote, not a fake price, per the prior audit. |
| 12 | Unified trip basket | **Not started** | Real feature work: persistent basket state (cart-like), combined quotation request, save-for-later, promo codes. No fake "add to trip" button was added anywhere in this phase. |
| 13 | Customer account | **Partial** (prior phase: profile/travellers/enquiries) | `/account/quotes`, `/bookings`, `/payments`, `/documents`, `/saved`, `/messages` are **not built** — each needs a real backing data model already populated by TravelOS (quotations linked to the customer's auth user, booking/payment status, a documents table with restricted storage + RLS) that doesn't exist for the public customer identity yet. Building the pages without that data would mean permanent empty states, which isn't the same as a placeholder button but isn't real either — flagged rather than shipped. |
| 14 | Multi-step booking forms | **Not started as a system** | Existing forms (`EnquiryForm`, flights, visas, corporate) are single-step with validation and idempotent-enough submission (one `submitEnquiry` call, reference shown, form replaced). A shared multi-step wizard with autosave/progress-indicator is a real component-architecture task, not done here. |
| 15 | Design system | **Meaningfully advanced this phase** | New `components/icons.tsx` — 18 professional inline-SVG icons — replaced emoji across Header, HomeSearch tabs, homepage service/destination/feature cards, and the three close-buttons in flights/transfers/hotels modals. Remaining emoji: small category/vehicle/amenity badges inside `tours`, `transfers`, `hotels` listing pages (🌴🏯🐘🚂🚌🚐🚗📍🛡🧒) and the floating-assistant trigger (✦) — deferred to Phase 2 rather than rushed, since it needs several more icon glyphs (wildlife, train, bus, van, baby, mountain) designed with the same care as this phase's set. Toasts, drawers, and a documented tokens page are not built. |
| 16 | CMS contract | **Not started this phase** | `docs/WEBSITE_CMS_CONTRACT.md` was not written. A `travelos_website_media` table and admin media-library UI are mid-flight, uncommitted, on the `navigeto-travelos` side (Sprint 19/21 work) — unrelated to and untouched by this session. Writing a content contract against a CMS that isn't finished yet risks specifying the wrong shape; recommend sequencing this after the admin CMS core lands. |
| 17 | SEO | **Foundational layer shipped this phase** | `app/sitemap.ts` (static routes + live tour slugs, degrades gracefully if the API is down), `app/robots.ts` (disallows `/account`, `/login`, `/signup`; points at the sitemap), `TravelAgency` JSON-LD in the root layout, expanded root metadata (OG + Twitter card). **Not done**: per-listing Product/Offer/Hotel/Tour/FAQ/Breadcrumb schema — the hotel/tours/transfers pages are `"use client"` components, which can't export the `generateMetadata`/structured-data Next.js needs per-page; that requires restructuring those routes toward server components first, a real architecture change deferred to Phase 2. No `public/logo.png` exists yet, so the schema omits a `logo` field rather than link a 404. |
| 18 | Performance | **Not evaluated this phase** | No Lighthouse/Core Web Vitals run performed. Existing pages already avoid client-side polling and use server-computed pricing; image optimization is moot today since there are no hotel/tour images in the data model yet (section 7/8 gap). |
| 19 | Accessibility | **Not audited this phase** | Existing forms have labels; focus states rely on default browser/CSS — no explicit audit or `prefers-reduced-motion` handling added. |
| 20 | Analytics | **Not started** | No consent-aware event layer exists. |
| 21 | Testing | **Not started for public-web** | `navigeto-travelos` has vitest coverage for quote-maker/reservations; `public-web` has zero automated tests. `npm run typecheck && npm run lint && npm run build` were run and made to pass for everything shipped this phase (see below). |
| 22 | 10 deliverable docs | **1 of 10 exists** | Only this audit doc. `PUBLIC_ARCHITECTURE.md`, `WEBSITE_CMS_CONTRACT.md`, `PUBLIC_API_INTEGRATIONS.md`, `SEO_IMPLEMENTATION.md`, `PERFORMANCE_REPORT.md`, `TESTING.md`, `DEPLOYMENT.md`, `PUBLIC_WEBSITE_HANDOFF.md`, `CHANGELOG.md` are not written — writing all 10 accurately requires the underlying work (testing, SEO depth, performance numbers) to exist first; writing them now would mean documenting work that hasn't happened. |

### One backend change prepared, not deployed

The existing `/flights` page already sent `enquiry_type: "flight"` to
`public-travel-api`, but `travelos_public_enquiries.enquiry_type` has a DB
`CHECK` constraint limited to `(general, custom_trip, tour, transfer, hotel,
assistant)` — so it was silently downgraded to `general` server-side, losing
the category. `holiday`, `visa`, `corporate` (added this phase) have the same
issue. Prepared, **not run/deployed**:

- `SPRINT_23_PUBLIC_ENQUIRY_TYPES_MIGRATION.sql` (additive constraint widen,
  rollback + `navigeto_sql_migrations` registration included) at the
  `navigeto-travelos` repo root.
- Paired Edge Function allowlist widen in
  `supabase/functions/public-travel-api/index.ts` (already edited locally).

Both need your explicit go-ahead to run/deploy per the migration-approval
rule. Until then, every new form still works end-to-end — enquiries land in
TravelOS with a valid reference — they just show up tagged `general` instead
of the more specific type.

### Recommended phase order from here

1. **Phase 2 — design polish**: remaining emoji→icon pass (tours/transfers/hotels category badges), hover mega-menu panels with destination imagery, mobile nav polish.
2. **Phase 3 — content infrastructure**: `WEBSITE_CMS_CONTRACT.md`, hotel content-model migration (images/amenities/geo), international-holidays content table, per-country visa content — all real content work, sequenced with whoever owns sourcing that data.
3. **Phase 4 — trip basket + account expansion**: unified basket, `/account/quotes`, `/bookings`, `/documents` (needs a document-security design decision), `/payments` (needs a payment gateway decision).
4. **Phase 5 — SEO depth + testing + analytics**: convert listing pages toward server components for per-page schema, consent-aware analytics layer, a real public-web test suite, Lighthouse pass.
5. **Phase 6 — remaining 9 docs**, written against what's actually built at that point, not aspirationally now.

None of this is a rejection of the brief — it's the same "audit honestly, ship
real slices, never fabricate" discipline the original audit established,
applied to a much larger spec.
