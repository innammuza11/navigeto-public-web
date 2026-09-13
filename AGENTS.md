<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Navigeto brand colours for future development

Read `docs/BRAND_SYSTEM.md` for styling changes. Use `shared/brand/palette.json`
and generated `--brand-*` CSS tokens. Navigeto red is #D7193F: a small decorative
accent with the existing blue and green. Preserve semantic status/error colours,
main action colours and all partner branding. Use the shared signature on
Navigeto chrome; avoid red on routine pending states or every repeated row.
Run `npm run brand:generate` after palette edits and `npm run brand:check`.
