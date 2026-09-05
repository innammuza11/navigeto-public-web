# Hotel request retry client — release gate

Do not deploy this client before TravelOS PR #332's approved database migration
and customer-hotels backend are deployed and verified. The old backend ignores
request_id and cannot guarantee retries are safe.

One booking intent per browser tab is persisted before the first POST. Recovery
metadata contains a random UUID, SHA-256 fingerprint and optional minimal public
receipt, not contacts or raw form details. Exact accepted booking fields are
fingerprinted; unknown fields, client costs and transient UI state are excluded.
The server independently derives its own fingerprint and stores only a scoped
hash of the token. Tokens never enter URLs or marketing calls.

Same-detail retries reuse the key after failed responses and refresh. Successful
receipts are cached to avoid another submission on same-detail refresh. If a
pending request is retried after midnight, client freshness validation is skipped
but all server checks still apply to a request that was not already committed.
First submissions still use the existing strict checkout validation.

Changed details require explicit confirmation to start a separate request. The
confirmation warns that this does not cancel the earlier request and may create
another one. Storage unavailable/corrupt/unwritable fails closed before sending;
there is no silent fresh-key fallback. A synchronous in-flight guard blocks
double submissions. Success-cache failure preserves the original pending key.

Scope: automatic hotel bookings only. Manual hotel quotes and other enquiries
are not claimed as protected. Session storage recovery is per tab/session, not
cross-device or guaranteed after clearing storage/closing the session. Users must
re-enter identical contact details after refresh because contacts are not saved.

Local validation: 21 Node tests; TypeScript; ESLint (three existing navigation
warnings, no errors); production build; three intercepted browser scenarios
covering dropped response/refresh/completed receipt recovery, double-submit,
edited details, canceled/confirmed reset and storage failure. No live booking,
enquiry or payment writes.

Release order: approve and apply additive schema, deploy backend, preview this
client and test with all booking writes intercepted, then promote verified web
artifact. Keep backend receipt support during rollback; reverting it to an older
handler while keyed clients exist would silently remove duplicate protection.
