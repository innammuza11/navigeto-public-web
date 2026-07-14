# Navigeto — Travel & Holidays Mobile

Customer-facing Capacitor application connected to the existing Navigeto public catalogue and TravelOS backend.

## Application identity

- App name: `Navigeto — Travel & Holidays`
- iOS bundle ID / Android application ID: `com.navigeto.travel`
- Staff app remains separate as `com.navigeto.travelos`

## Implemented in this foundation

- Public home and services navigation
- Live published-tour catalogue
- Supabase customer account creation and sign-in
- Authenticated trip-request submission through `mobile-customer-api`
- Customer-owned `My Requests` list
- Customer profile editing
- Mobile notification inbox count
- RLS-protected device session and push-token registration
- Network-state and deep-link foundations
- Native Android/iOS Capacitor configuration

## Required backend deployment

From the `navigeto-travelos` repository branch `codex/mobile-release-candidate`:

1. Apply `docs/migrations/SPRINT_54_MOBILE_PLATFORM_FOUNDATION.sql` to a preview Supabase project.
2. Deploy the `mobile-customer-api` Edge Function.
3. Confirm `public-travel-api` and public package data remain available.
4. Do not apply to production until the preview RLS and customer-isolation tests pass.

## Local setup

```bash
cd mobile
cp .env.example .env
# Add only the existing public Supabase anon key.
npm install
npm run build
```

Generate native projects:

```bash
npm run cap:add:android
npm run cap:add:ios
npm run cap:sync
```

Open native IDEs:

```bash
npm run cap:android
npm run cap:ios
```

## Security rules

Never commit or bundle:

- Supabase service-role key
- Payment gateway secret
- Sabre/GDS credentials or tokens
- Gmail/Zoho credentials
- FCM service-account JSON or APNs private key
- Android keystore or password
- Apple certificates or provisioning profiles

## Remaining release-candidate work

- My quotations and accept/reject workflow
- My confirmed bookings and live service status
- Visa application status and document upload
- Voucher, invoice, receipt and itinerary library
- Payment request/status and protected gateway handoff
- Camera/gallery/file uploads connected to the selected case
- Full notification list and mark-read interactions
- Offline itinerary and document cache
- Universal Links and Android App Links
- Account deletion inside the app
- Accessibility and physical-device QA
- Store icons, splash assets, screenshots and privacy disclosures

Do not upload to TestFlight or Google Play Internal Testing until the shared end-to-end test passes:

`customer request → TravelOS lead/customer → quotation → customer approval → reservation → payment status → voucher delivery`.
