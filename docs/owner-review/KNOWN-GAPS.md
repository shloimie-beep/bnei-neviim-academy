# Known Gaps

## Code / UI Work

- Full historical 2,205-route click-map regeneration is not complete in this
  PR because the existing full-ui audit harness is production-oriented by
  default. Priority findings are reconciled in
  `UX-BACKLOG-RECONCILIATION.md`.
- Operations provider-workspace IA still needs owner review for whether legacy
  student/accountability sections should remain visible when scoped to provider
  participants.
- Placeholder-heavy Operations settings/integration pages remain a product/UI
  backlog item.
- Provider onboarding form submission screenshots were not produced because
  this pass avoided writes. The provider admin and directory navigation are
  covered.
- Public production still has the homepage header-to-hero gap and missing
  active-filter semantics until PR #14 is merged and deployed. The local PR #14
  branch now fixes both, with computed evidence in `PUBLIC-VISUAL-AUDIT.md`.
- Website assistant persisted chat/message E2E is not proven in this
  credential-free pass because the local no-DB review harness intentionally
  disables database-backed assistant history. `owner-review:assistant-runtime`
  verifies source contracts and anonymous context locally, then records the
  explicit blocker for a local/test DB or approved production readback.
- Class/Drive, Stripe, and Vimeo are proven only to the credential-free
  readiness boundary in `EXTERNAL-READINESS-AUDIT.md`. Real class job readback,
  Drive file access, transcription, Stripe sandbox/live API checks, and Vimeo
  API upload/playback verification remain external/approval gated.

## Product Decision

- Decide whether `/providers` or `/service-providers` should be the long-term
  canonical public directory URL. This PR registers `/providers` as an alias
  and keeps `/service-providers` as the existing canonical target.
- Decide whether Operations provider-workspace participant language should be
  globally renamed away from student/accountability terminology or only hidden
  in user/member-facing pages.

## Credential Required

- Read-only production state and Railway deployment metadata require explicit
  `READ_EXTERNAL_PRODUCTION_STATE` approval and configured credentials.
- Google Drive, Vimeo, Resend, Stripe, Telegram, Zoom, and related live
  connector checks remain unconfigured/unapproved in this pass.
- Live parent/student/provider walkthrough credentials were not requested.
- True website assistant conversation persistence can be smoke-tested with a
  local/test Postgres URL in `BNA_OWNER_REVIEW_ASSISTANT_DATABASE_URL`; the
  script intentionally ignores production `DATABASE_URL` and `.secrets`.
- Real class/Drive readback needs the approved source folder/job range and
  Drive auth. Real Stripe and Vimeo proof needs sandbox/test credentials,
  account-owner policy, and explicit no-live-mutation smoke scope.

## Production Approval Required

- PR #14 is not merged to `master`.
- The integration release candidate is not deployed.
- No live smoke was run.
- No guarded backfill, production DB apply/readback, email/Telegram send,
  upload, charge, DNS, OAuth, or publish action was performed.
