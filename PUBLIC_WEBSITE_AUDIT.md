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
