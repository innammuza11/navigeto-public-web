# Public TravelOS demonstration

`/travelos/demo` is a Navigeto sales walkthrough without authentication. `/travelos` links to it prominently and retains the personal demo lead form, video gallery and WhatsApp contact.

Eight modules cover enquiry, itineraries, hotel examples, costing, customer quotations, draft reservations, accounts and DMC discovery. All state stays in React memory and resets on refresh. Reservation reviews and deposits are explicitly simulated; nothing is saved to production and no external requests are sent by the demonstration controls.

The route catalogue includes only public destination names and durations. It contains no customer records, source IDs, private contracts, supplier net rates or credentials. The four hotel entries are examples; their allowance is fictional and editable. The directory links to seven official company websites and does not claim a partnership or verification. Suggested route programmes are illustrative.

Costing uses double/twin sharing with rooms rounded up for odd parties. Markup applies to cost, not selling price. LKR display uses a labelled sample rate of 335. Printable customer quotations omit internal cost and markup and explicitly exclude flights, visas and entrance fees. The print button opens the browser's print/save-PDF dialog.

Validation: calculation tests, full existing test suite, lint, typecheck, shared brand check, dependency audit, production build, browser flow and responsive checks. Public-site release rules in AGENTS.md apply; never deploy the private My Holiday fork over this site.
