# Rabbi CRM Config Noise Cleanup - 2026-07-07

## Source

- Raw input: raw-input/RAW-20260707-012-rabbi-crm-config-noise-cleanup.md
- Product Quality packet: ops/prompt-packets/2026-07-07-rabbi-crm-config-noise-cleanup/00-rabbi-crm-config-noise-cleanup.product-quality.json

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| REQ-20260707-121 | Rabbi/provider CRM view must show a clean CRM workspace with contacts, conversation cues, and actions instead of setup/configuration diagnostics. | Locally verified | `public/provider.html` now renders a Rabbi-facing CRM inbox/action workspace; `node --test tests/one-time-provider-review-navigation.test.js tests/provider-mailbox-portal.test.js` passed. |
| REQ-20260707-122 | Rabbi/provider mailbox view must clearly show where One Time emails live and provide safe mailbox/draft actions without exposing webhook/runtime/provider readiness labels. | Locally verified | Mailbox copy now uses role-facing CRM language; webhook/runtime/Bulk email labels removed from Rabbi mailbox; focused tests passed. |
| REQ-20260707-123 | Configuration/readiness panels such as Payments, Integrations, Access Checklist, configured/not configured, and setup diagnostics must be removed from One Time Rabbi review/view-as navigation. | Locally verified | One Time review/view-as section model excludes `commercial`, `integrations`, and `access`; direct old section URLs fall back to Dashboard in browser tests. |
| REQ-20260707-124 | Focused tests must prove Rabbi CRM/mailbox views avoid configuration noise and remain mobile-safe. | Locally verified | PQC validator passed; focused browser tests passed; protocol drift watchdog passed. Deployment/live smoke still pending. |

## Out Of Scope

- No live send approval.
- No provider password disclosure.
- No Stripe/WhatsApp/Zoom/Vimeo/Drive/DNS/payment/access mutations.
- No unrelated BNA Academy, parent, student, or other provider records.

## Definition Of Ready

- Raw operator wording captured.
- Affected route is limited to `/provider.html?review=one-time` and signed view-as Rabbi sessions using the same render branch.
- Current code inspection found setup/readiness copy in the One Time provider review navigation, CRM, mailbox, integrations, commercial, and access panels.
- External writes remain blocked.

## Definition Of Done

- Rabbi/provider review navigation only includes role-facing workspace sections.
- CRM and mailbox panels show clear actions and storage location.
- Rabbi/provider branch does not show configured/not configured/setup/readiness internals.
- Focused tests pass.
- App-visible change is committed, pushed, deployed, and live-smoked, or blocked with exact owner/next action.

## Verification

- `npm run pqc:validate -- ops/prompt-packets/2026-07-07-rabbi-crm-config-noise-cleanup/00-rabbi-crm-config-noise-cleanup.product-quality.json`: passed.
- `node --test tests/one-time-provider-review-navigation.test.js tests/provider-mailbox-portal.test.js`: passed, 12/12.
- `npm run watchdog:protocol-drift`: passed, findings 0.

## Deployment Status

- Local implementation is verified.
- Commit, push, deployment, and live smoke are the remaining closeout steps.
