# NAVI Public — Phase 0 Audit

Status: **Verified foundation identified — no production behavior changed**

Branch: `feature/navi-phase-0`

## 1. Key finding

The public website already contains a working trip-assistant foundation. NAVI should upgrade and reuse it rather than introduce a second competing chat system.

Verified existing pieces:

- `FloatingAssistant` is already mounted globally from the root layout.
- The floating control is governed by the public site configuration flag `assistant_enabled`.
- `/trip-assistant` already provides a conversational interface with quick options, message history and failure fallback.
- The public site already calls the shared Supabase Edge Function `public-travel-api`.
- The current assistant action is exposed through `public-travel-api?action=assistant`.
- Existing public APIs already support tours, hotel search, hotel booking requests, transfers, vehicles and enquiries.

## 2. Current public assistant flow

```text
Global root layout
    ↓
FloatingAssistant
    ↓
/trip-assistant
    ↓
assistantReply(...)
    ↓
Supabase Edge Function: public-travel-api?action=assistant
```

The current UI is a dedicated page and the global floating element is a link. NAVI can evolve this into an expandable desktop panel and full-screen mobile experience while preserving `/trip-assistant` as a fallback/deep-link route.

## 3. Reusable public APIs

The current `lib/travelos.ts` client provides reusable calls for:

- site configuration
- tour list and detail
- hotel suggestions and hotel search
- hotel booking requests
- transfer quotes
- public vehicle catalogue
- enquiry submission
- assistant replies

NAVI product cards should call these approved public endpoints instead of accessing internal TravelOS tables from the browser.

## 4. Current risks and limitations

- Assistant requests are browser-to-Edge-Function calls using the public anonymous key.
- The present assistant response shape is limited to reply text, options and an optional enquiry reference.
- No visible citation, source, freshness or confidence structure is currently returned.
- The current client-side session identifier is generated from React `useId`, which is useful for UI continuity but is not a durable cross-channel identity.
- The current interface has no structured product-card protocol.
- The current interface does not show consent capture before customer matching or lead creation.
- The current floating button is not yet the NAVI leopard experience.

## 5. Required public NAVI response contract

The upgraded public endpoint should return a strict structure similar to:

```ts
type NaviPublicResponse = {
  message: string;
  status: "answered" | "needs_clarification" | "handoff" | "degraded";
  checkedAt?: string;
  citations: Array<{
    label: string;
    sourceType: "navigeto" | "official" | "approved_external";
    sourceId?: string;
    url?: string;
    effectiveFrom?: string;
    effectiveTo?: string;
  }>;
  cards: Array<
    | { type: "tour"; id: string; title: string; summary: string; href: string }
    | { type: "hotel"; id: string; title: string; summary: string; href?: string }
    | { type: "visa"; destination: string; summary: string }
    | { type: "transfer"; summary: string }
    | { type: "handoff"; channel: "whatsapp" | "staff"; summary: string }
  >;
  quickActions: string[];
  consentRequest?: {
    purpose: "lead_creation" | "customer_match" | "save_preferences";
    message: string;
  };
  enquiryRef?: string;
};
```

The final implementation should use runtime validation and must not trust arbitrary model output.

## 6. Public data boundary

Allowed:

- published tours and destinations
- approved public hotel content
- public selling prices intentionally released to B2C users
- public visa guidance
- approved FAQs and service policies
- current visitor's consented inquiry information

Forbidden:

- supplier net rates
- markup, margin and internal pricing logic
- staff notes and internal communications
- contracts
- other customer records
- private attachments
- API secrets, service-role credentials or logs

## 7. Upgrade path

### Step 1 — preserve existing flow

Keep the current floating link and `/trip-assistant` route operational while the new NAVI panel is behind a feature flag.

### Step 2 — shared NAVI client types

Add strict public response, card, citation, consent and handoff types.

### Step 3 — panel shell

Upgrade `FloatingAssistant` into:

- leopard launcher
- desktop side panel
- mobile full-screen panel
- streaming message area
- quick actions
- product cards
- source drawer
- human handoff control

### Step 4 — endpoint hardening

Enhance the server/Edge Function response with:

- policy classification
- public-only retrieval
- structured cards
- citations and checked dates
- rate limits
- consent-aware lead conversion
- audit-safe error handling

### Step 5 — lead handoff

Reuse the existing enquiry flow and unified customer/lead logic. Customer matching or lead creation must happen only after clear consent.

## 8. First-release quick actions

- Plan a Sri Lanka trip
- Find a tour
- Hotel request
- Visa guidance
- Search flights
- Airport transfer
- International holiday
- Talk to a travel expert

## 9. Acceptance tests

- public NAVI cannot receive internal net/markup fields
- assistant works with JavaScript errors and API failures safely handled
- launcher does not materially delay page rendering
- mobile interaction is keyboard and screen-reader accessible
- reduced-motion preference is respected
- consent is required before lead/customer mutation
- citations are rendered only from approved structured source data
- no raw model tool call is accepted by the browser
- current `/trip-assistant` remains usable during staged rollout

## 10. Current decision

Use the existing assistant as NAVI's public foundation. Do not create a second public AI endpoint or duplicate customer-enquiry workflow unless the deeper Edge Function audit proves reuse is unsafe.
