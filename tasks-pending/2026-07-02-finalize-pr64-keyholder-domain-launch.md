# Finalize PR #64, Keyholder Alias Discovery, Join Domain, One Time Launch

Raw ID: `RAW-20260702-007`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Owner: Codex
Date: 2026-07-02

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| REQ-20260702-301 | Finalize PR #64 safely after validation. | In progress | PR #64, local validation commands |
| REQ-20260702-302 | Verify `join.onetimeonetime.com` CNAME/TXT DNS without apex/root mutation. | Done | `ops/domain-readbacks/2026-07-02-join-onetimeonetime-domain-task.*` |
| REQ-20260702-303 | Discover keyholder provider aliases by name/fingerprint only. | Done | `ops/keyholder-readbacks/2026-07-02-one-time-provider-alias-inventory.*`, provider diagnostics |
| REQ-20260702-304 | Fix setup/readback scripts so real aliases and current Railway CLI behavior are recognized. | Done | `scripts/check-onetime-external-setup-readiness.mjs`, provider env scripts/tests |
| REQ-20260702-305 | Correct One Time Railway `DATABASE_URL` service reference and verify non-empty readback. | Done | setup checker and Railway variable readback |
| REQ-20260702-306 | Push safe provider env values from keyholder to separate One Time Railway service. | Done | provider env propagation/audit reports |
| REQ-20260702-307 | Attempt guarded One Time DB bootstrap and record exact blocker if local apply cannot reach Railway internal DB. | Blocked | `railway run` DB bootstrap attempts |
| REQ-20260702-308 | Continue Drive recording/parser readiness without committing raw transcript bodies. | In progress | Drive transcript visibility register/evidence |
| REQ-20260702-309 | Commit/push/merge/deploy/live-smoke when gates pass. | In progress | pending validation |

## Current Status

- DNS is verified for the join subdomain.
- One Time Railway web service has a non-empty `DATABASE_URL` service reference.
- Resend, Zoom, and Vimeo client env values were propagated to the separate
  One Time Railway service with deploy skipped; fingerprint readback matched.
- Local DB bootstrap is blocked because Railway Postgres resolves to an
  internal host from the local machine. Run bootstrap from the deployed service
  via Railway SSH after a successful deployment.

## Remaining True Blockers

- Zoom: class session/join alias is still missing.
- Vimeo/Drive: user access token alias and One Time Drive drop-folder alias are
  still missing.
- Stripe: only a live key was found; sandbox test key/product/price aliases are
  still missing.
- Whapi/WAPI: local token material exists, but One Time scoped instance/phone
  aliases are still missing.
- Campaign: final copy, exact segment/list, suppression/unsubscribe proof, and
  seed approval remain separate gates.

## Guardrails

No bulk campaign send, live Stripe payment, WhatsApp broadcast, apex/root DNS
mutation, hard delete, paid-user cancellation, GHL/LeadConnector runtime,
secret exposure, raw transcript body evidence, or private contact/student/parent
data exposure is allowed from this register.
