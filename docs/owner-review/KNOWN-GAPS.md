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

## Production Approval Required

- PR #14 is not merged to `master`.
- The integration release candidate is not deployed.
- No live smoke was run.
- No guarded backfill, production DB apply/readback, email/Telegram send,
  upload, charge, DNS, OAuth, or publish action was performed.
