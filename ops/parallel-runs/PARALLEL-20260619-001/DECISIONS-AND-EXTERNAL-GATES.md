# Decisions And External Gates

These are gates, not global blockers for local worker implementation. Workers
must complete local code, mocks, docs, tests, and integration notes wherever
possible.

## Operator Decisions

- Approve whether One Time remains a scoped BNA workspace for launch or moves
  immediately to a partner-owned single-tenant deployment.
- Approve final shared-file integration in Prompt 05.
- Approve any production deploy, Railway doctor, live smoke, screenshot, or
  PR/push action.
- Approve any credential entry or keyholder-to-runtime copy.
- Approve production test identities for live BNA/One Time isolation proof.

## External Gates

- DNS
- Railway
- production deployment
- production DB migration
- live OAuth/account authorization
- real Vimeo upload
- live Zoom mutation
- live Resend sending
- unapproved credential entry

## Current Known Blockers From Prior Run

- Prior run left 14 operator-decision items open.
- Local server smoke was blocked by unavailable `DATABASE_URL`,
  `OPS_USERNAME`, and `OPS_PASSWORD`.
- No push, deploy, Railway doctor, live smoke, screenshot, DNS, database, or
  external action was performed in the checkpoint.
