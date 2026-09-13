# Mobile privacy page release

New routes: `/mobile-privacy` and `/delete-account`. The pages name NAVIGETO HOLIDAYS (PVT) LTD and the Navigeto customer app, explain collected data and retention exceptions, and provide a web deletion request via email. Opening the mail link does not submit a request; the page tells users to send it.

Do not publish until the owner confirms info@navigeto.com is monitored daily for deletion requests, the proposed 30-day completion target, actual provider/backup retention periods, and handling of legally retained booking/financial/dispute records. The companion mobile PR adds a durable authenticated request queue; it does not perform erasure automatically. Its backend migration/API and manual completion procedure must be deployed and tested before the page advertises an available in-app path.

Validation: production Next build and TypeScript passed; lint passed with three existing navigation warnings in commerce-ui.tsx; all 44 existing tests passed. Both new pages return HTTP 200 locally and fit a 375px viewport. Inspect the Netlify preview and normal customer journeys before production publication. No live website or store release was made by this change.
