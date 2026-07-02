# One Time Landing / Signup Definition Of Ready - 2026-07-01

Requirement: `REQ-20260701-602`
Parent raw input: `RAW-20260701-006`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Do not solve the whole parent ramble. Complete only the landing/signup scope
and record the next packet or blocker.

## Scope

In scope:

- `/one-time` public fallback route.
- Campaign-root rendered page once `onetimeonetime.com` reaches Railway.
- Primary CTA, public signup section, visible offer copy, and form success copy.
- Route/action registry updates needed for the new action meaning.
- Static and local browser verification.

Out of scope:

- DNS mutation.
- Bulk campaign send.
- Imported-lead send.
- WhatsApp send.
- Stripe checkout or payment method collection.
- Zoom meeting creation or direct public Zoom link.
- GHL or LeadConnector runtime.
- Cancellation, refund, subscription, or paid-user migration action.

## Definition Of Ready

- Current-state audit exists:
  `ops/ui-audits/2026-07-01-rabbi-onetime-current-state/report.md`.
- Public page files inspected:
  `public/one-time/index.html`.
- Relevant API inspected:
  `/api/one-time/interest` currently creates only no-send interest leads.
- Existing trial-preview helper inspected:
  `src/lib/bna/one-time-launch-readiness.js`.
- Action registry inspected:
  `ACTION-ONETIME-JOIN-SHIR-CTA`,
  `ACTION-ONETIME-INTEREST-FORM`, and
  `ACTION-ONETIME-MEMBER-LOGIN-LINK`.
- Route registry inspected:
  `/one-time`, `/one-time/interest`, `/api/one-time/interest`, and
  `https://onetimeonetime.com/`.

## Implementation Requirements

- Public hero and primary CTA must say that the visitor can start the 30-day
  free Mishnayos class/trial with no card required.
- Form submit label and status copy must reflect signup, not generic interest.
- The current public API may remain no-external-write, but the response and
  client copy must no longer claim the user has only saved interest if the
  funnel creates a local 30-day trial/signup preview or grant.
- If actual access grant persistence is not implemented in this packet, copy
  must say the signup is captured for trial setup and cannot imply working
  member access yet.
- No direct Zoom URL may appear on the public page.
- No payment link, checkout request, Stripe call, Green Invoice call, or card
  collection may be added.
- Public page must remain scoped to One Time and must not replace the BNA
  academy homepage.
- Public page must keep the member login as a gated entry, not as direct class
  link exposure.

## Acceptance Criteria

- `/one-time` shows the 30-day free/no-card offer above the fold.
- Primary CTA points to the signup section.
- Signup form copy and button text match the 30-day free trial funnel.
- Static tests prove there is no direct Zoom link, no checkout link, no payment
  call, and no GHL/LeadConnector copy/runtime.
- Browser audit proves desktop and mobile render the new offer without console
  errors or failed requests.
- Real campaign send remains blocked until final copy, exact segment/list,
  domain proof, and explicit send approval.

## Verification Commands

- `node --test tests/one-time-focused-landing.test.js tests/one-time-product-system.test.js tests/one-time-launch-readiness.test.js`
- `npm run watchdog:actions`
- Desktop/mobile Playwright screenshot audit for `/one-time`.

## Blockers

- Production campaign domain is still externally blocked:
  `onetimeonetime.com` serves legacy Google Frontend content and
  `www.onetimeonetime.com` does not resolve.
- Actual persisted access grant may belong to `REQ-20260701-604`; if not
  completed in this packet, do not claim member access is live.
