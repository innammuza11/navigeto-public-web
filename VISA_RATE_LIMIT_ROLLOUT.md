# Paired Visa rate-limit rollout — not deployed

This branch pairs with admin branch codex/visa-durable-rate-limit. Both contain
the same visitor-identity-protocol.ts; keep the wire format compatible.

Required: dedicated server-only VISA_PROXY_IDENTITY_SECRET (32 random bytes as
64 lowercase hex), identical on both approved sites. No credentials were created
or configured by this code change. No NEXT_PUBLIC prefix or fallback shared secret.
Missing key or platform identity returns 503 intentionally, including local dev.

Prove actual Netlify Next.js ingress overwrites spoofed x-nf-client-connection-ip
before rollout. Ordinary x-forwarded-for and caller signed metadata are ignored by
the proxy. No raw visitor IP is forwarded; the secret-keyed hash is signed with
request method/path/query and timestamp. Responses do not expose signed metadata.
Upstream redirects are rejected; 429/503 Retry-After is propagated with no-store.

Configure credentials only after approval, verify paired isolated candidates and
database permissions/concurrency, then deploy the public proxy before the new admin
limiter. An older admin ignores signed metadata. Never publish the public branch
without its key or the admin limiter before compatible forwarding is deployed.
Rollback order: admin first, then public; retain the key while either requires it.

The signed envelope identifies a quota subject only. It is not a document-access
token, a one-time request, or body authorization. Admin still enforces intake
tokens. Replays in the 60-second validity interval consume the same quota.

Validated locally: complete public test suite (34 tests), TypeScript, targeted
Visa lint and production build. No live mutation, secret setup or hosted ingress
probe. Full hosted CI must pass before merge/release approval.
