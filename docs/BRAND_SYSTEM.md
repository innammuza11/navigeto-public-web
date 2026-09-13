# Navigeto shared brand accents

This repository mirrors the approved palette from navigeto-travelos:
`shared/brand/palette.json`. Keep the two repositories aligned when changing
brand colours. Generate CSS with `npm run brand:generate`; CI checks the
committed output with `npm run brand:check`.

Navigeto red is **#D7193F**. Blue #1E86C8 and green #169C58 remain core brand
colours; existing local blue/green UI tokens retain their roles.

Use `.brand-signature` on Navigeto headers/footers: a thin 3px line with 78%
blue, 16% green and 6% red. Use red sparingly for small decorative rules or
heading accents. Do not recolour every card, button, link or pending status.
Use semantic errors/warnings/success colours with clear labels. White on red
and red on white are the standard text pairs; use `--brand-red-on-dark` for
small text on dark surfaces, checking actual contrast. Partner logos and
white-label documents retain their own branding.

The logo artwork, search/enquiry functions, payments, pricing and booking
behaviour remain unchanged. Future UI should reuse these tokens instead of
introducing hardcoded brand hex values.
