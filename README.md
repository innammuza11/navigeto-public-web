# Navigeto public website

Customer-facing website for [navigeto.com](https://navigeto.com), deployed as Netlify project `navigeto-b2c`.

## Architecture

- Next.js 16 App Router UI under `src/app`
- Next.js local development and production build; legacy Vinext/Vite configuration remains in the repository
- Netlify hosting
- Public TravelOS services supplied by Supabase Edge Functions
- Visa requests proxied to `admin.navigeto.com`

The public and admin apps share business services. API-contract changes must be verified in both repositories.

## Configuration

Set these variables locally and in the appropriate Netlify context. Never commit their values.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
TRAVELOS_ADMIN_ORIGIN
```

## Local development

Node.js 22 or later is required.

```bash
npm ci
npm run dev
```

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Release safety

1. Merge only after the quality workflow passes.
2. Inspect a Netlify preview for `navigeto-b2c`.
3. Exercise hotel, tour, transfer, flight, and Visa journeys.
4. Publish to `navigeto.com` only after explicit production approval.
5. Retain the previous production deployment for rollback.

Never deploy this repository to `navigeto-next`; that project serves `admin.navigeto.com`.
