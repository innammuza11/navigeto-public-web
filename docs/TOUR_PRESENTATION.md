# Tour name presentation

Customer headings use the shared `tourDisplayName` helper on the homepage,
tour collection and tour detail. The 163 published packages reviewed on
2026-09-10 (97 Sri Lanka, 66 international) have individual names in
`src/lib/tour-names.ts`, keyed by immutable package ID. Each name is unique
and at most 30 characters. Names describe the published route or theme;
duration variants receive distinct names, with durations displayed separately.
New, unreviewed packages use the existing fallback: route suffixes and pipe-delimited internal
night/city codes are removed from display headings only. Long names retain
complete thematic phrases up to 56 characters, with a word-boundary fallback.

Duration and destination fields remain separate; records are not renamed,
reordered or deleted. Existing slugs, IDs, booking selections and SEO identity
remain unchanged. Original titles remain available as card title attributes
and in the full package-name disclosure on the detail page.

The change applies to every live tour rendered through these shared surfaces,
including international tours. It does not manufacture prices or durations.

Examples:

- `Romantic Highlands & Coast | 08 NIGHTS 09 DAYS | 02 NEG…`
  becomes `Romantic Highlands & Coast`.
- `Tea Trails & Southern Shores — Bentota, Ella to Colombo | …`
  becomes `Tea Trails & Southern Shores`.

Tests cover code removal, long names, Unicode, empty names, unchanged source
records and duration labels. The library test glob includes new tests in CI.
Production publication requires a separately approved Netlify release.
