<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Navigeto brand colours for future development

Read `docs/BRAND_SYSTEM.md` for styling changes. Use `shared/brand/palette.json`
and generated `--brand-*` CSS tokens. Navigeto red is #D7193F: a small decorative
accent with the existing blue and green. Preserve semantic status/error colours,
main action colours and all partner branding. Use the shared signature on
Navigeto chrome; avoid red on routine pending states or every repeated row.
Run `npm run brand:generate` after palette edits and `npm run brand:check`.

## Public website release source

Build and publish navigeto.com from this repository's latest fetched main,
including all merged releases. Do not substitute the TravelOS `public-web` copy
or an older checkout. Fetch with an explicit `main:refs/remotes/origin/main`
refspec where a checkout tracks only one feature branch. Before publication,
verify HEAD equals the freshly fetched origin/main and the repository is clean.
Check the white editorial homepage, individual destination artwork, a Visa and
hotel page, and the Sri Lanka map together in the same candidate. Adding a map
must preserve the existing theme, pricing, enquiry and analytics changes.
