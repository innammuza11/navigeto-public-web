# Navigeto public website

Customer-facing website for [navigeto.com](https://navigeto.com), deployed as Netlify project `navigeto-b2c`.

## Architecture

- Tour heading rules: [Tour presentation](docs/TOUR_PRESENTATION.md).
- Next.js 16 App Router UI under `src/app`
- Next.js local development and production build
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
npm audit
```

The unused Vinext/Cloudflare template toolchain was removed during the September
2026 audit. Its Vite configuration depended on untracked files that are absent
from a clean checkout; neither the npm scripts nor Netlify used it. The original
configuration and Worker entry point remain recoverable in Git history.

## Release safety

The Next.js lint plugin's `fast-glob` dependency is scoped to the pinned
`tinyglobby` npm alias in `package.json` to remove the unpatched `braces`
dependency (GHSA-vfj7-8cjw-p6xm). Next uses only `globSync` with
`onlyDirectories`; the root-discovery regression test covers directory globs,
multiple roots, and actual enforcement of the internal-navigation lint rule.
Review this override when updating Next's lint plugin. Keep the full dependency
audit enabled.

1. Merge only after the quality workflow passes.
2. Inspect a Netlify preview for `navigeto-b2c`.
3. Exercise hotel, tour, transfer, flight, and Visa journeys.
4. Publish to `navigeto.com` only after explicit production approval.
5. Retain the previous production deployment for rollback.

Never deploy this repository to `navigeto-next`; that project serves `admin.navigeto.com`.
