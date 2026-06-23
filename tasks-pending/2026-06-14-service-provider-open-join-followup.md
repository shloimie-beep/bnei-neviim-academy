# Service Provider Open Join Follow-up

Created: 2026-06-14
Owner: Codex
Status: implemented/deployed; credential automation follow-up completed 2026-06-14

## Operator Intent

The operator wants service providers to be able to join the system without a
screening queue for now: if they know about the provider join path, they can
come in. BNA can kick out, pause, reject, hide, or archive a provider later.

## Implemented

- `POST /api/provider-onboarding` now creates active free listings:
  - provider `status = 'approved'`
  - `provider_status = 'listed_free'`
  - public listing/signup enabled
  - provider profile/workspace bridge created immediately
  - default approved service row created so the directory can show the provider
- `POST /api/providers/signup` follows the same open free-listing behavior.
- `/providers/join` copy now says open join/active listing instead of review
  application.
- `/service-providers`, parent portal provider labels, and Operations provider
  onboarding copy now use active/open-listing wording.
- Provider join still does not enable checkout, live billing, payouts, email,
  WhatsApp, or social automation.
- Provider portal edits and provider-submitted additional services still move
  to `pending_review`.

## Verification

- PASS `node --check server.js`
- PASS focused provider/workspace tests 19/19
- PASS `npm test` 372/372
- PASS local browser check for `http://127.0.0.1:8080/providers/join`:
  `ops/playwright-smokes/2026-06-14-provider-open-join-local/report.md`
- PASS Railway deployment `9333f378-1565-475f-a938-3cefd96a3e0b`
- PASS post-deploy `npm run railway:doctor`
- PASS live app smoke:
  `ops/live-smokes/2026-06-14T17-27-25-882Z-live-app-smoke.md`
- PASS live `/providers/join` HTML check: open-join copy present, old
  review-application copy absent.

## Follow-up Completed: Provider Setup Email

Completed 2026-06-14:

- Added provider-specific setup token storage:
  `bna_provider_password_setup_tokens`.
- Public provider signup and `/api/provider-onboarding` now send a provider
  portal password setup email after the provider listing is committed.
- `/provider?setup=...` renders a password setup panel, validates the token,
  sets `bna_service_providers.password_hash`, and signs the provider into the
  portal.
- Operations provider workspace cards include a `Send Setup Email` resend
  action backed by `POST /api/bna/service-providers/:id/setup-email`.
- Public provider join now asks only 10 conversational questions; additional
  details can be completed later in the provider portal.

Verification:

- PASS `node --check server.js`
- PASS focused provider tests 12/12
- PASS nearby parent/provider/One Time tests 39/39
- PASS local browser smoke:
  `ops/playwright-smokes/2026-06-14-provider-setup-email-local/report.md`
- PASS `npm test` 376/376
- PASS Railway deployment `f8e8a7bb-52f5-4427-bc50-2f6e70e8d40e`
- PASS `npm run railway:doctor`
- PASS live app smoke:
  `ops/live-smokes/2026-06-14T18-57-24-784Z-live-app-smoke.md`
- PASS live provider setup readback:
  `ops/live-smokes/2026-06-14T18-58-10-provider-setup-email-live-readback.md`
