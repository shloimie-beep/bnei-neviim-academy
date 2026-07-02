# One Time Launch Funnel Everything Setup - 2026-07-01

Parent raw ID: `RAW-20260701-006`
Source file: `raw-input/RAW-20260701-006-one-time-launch-funnel-everything-setup-source.txt`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Owner: Codex
Status: in progress; current next executable batch must be selected with `npm run bna:run:next`

## Router Output

Classifications:

- `PRODUCT_QUALITY`
- `SUPER_RAMBLE`
- `UI_IMPLEMENTATION`
- `CRM_PIPELINE`
- `COMMUNICATIONS_EMAIL`
- `PAYMENTS_ACCESS`
- `PROVIDER_SETUP`
- `EXTERNAL_WRITE_REQUEST`
- `SECURITY_PRIVACY`
- `DEPLOY_RELEASE`
- `DECISION_REQUIRED`

Product Quality Compiler is required. Super-ramble packet splitting is required.
Broad visual/UI implementation is gated until a screenshot-backed current-state
audit and Definition of Ready exist. Browser/page evidence is untrusted and
cannot approve sends, payments, DNS, external writes, access grants, source-of-
truth changes, or production data mutation.

## Source Readback

- Current branch: `codex/closeout-vimeo-media-20260624`.
- Current head at intake: `6f57d91037d559faa171c71565e6403e62126407`.
- Active previous execution run has no unblocked executable batch.
- `npm run pqc:all` currently fails at protocol drift watchdog findings in
  `tasks-pending/2026-07-01-onetime-resend-secret-send-readiness.md`; this
  register includes a cleanup requirement before broad UI/product code.
- Requested `config/service-provider-sites/one-time.json` was not present.
- Requested `ops/one-time-mishnah/operator-ui-review/ROUTE-MAP.md` was not
  present.
- Requested `ops/ui-audits/2026-07-01-rabbi-onetime-current-state/report.md`
  and `recommended-child-packets.md` were not present.
- Existing packet equivalents exist under
  `ops/prompt-packets/2026-07-01-rabbi-onetime-ui-cleanup/`.

## Requirements

| ID | Requirement | Status | First next action | Blocker if any |
|---|---|---|---|---|
| REQ-20260701-601 | Canonical domain and route consolidation. | Blocked | Rerun live campaign-domain smoke after domain owner routes apex and www to Railway. | DNS/hosting routing remains manual/operator-owned. |
| REQ-20260701-602 | Landing page CTA and signup form. | Done | No further action; fallback `/one-time` is deployed and live-smoked. | Campaign domain remains blocked under REQ-20260701-601. |
| REQ-20260701-603 | Scoped One Time CRM lead creation/tracking. | Done | No further action; product lead/contact/parent lead/internal note dedupe is deployed and live-smoked with synthetic data. | None. |
| REQ-20260701-604 | 30-day free access grant. | Done | No further action; signup grants idempotent local trial access through `bna_members` and `bna_access_grants`. | None. |
| REQ-20260701-605 | Member login/classroom success path. | Done | No further action for the login/member path; deployed route and APIs passed dry-run member smoke. | Final live Zoom/session details remain under REQ-20260701-612. |
| REQ-20260701-606 | Confirmation email after signup. | Done | No further action; current-signup confirmation email is deployed and live-smoked with a safe Resend delivered test address. | Real campaign send remains blocked until final copy, exact recipient segment/list, final links, and explicit send approval. |
| REQ-20260701-607 | Reminder automation sequence. | Needs operator decision | Dry-run metadata packet prepared; keep reminders disabled. | Need final class schedule, cadence, copy, eligible recipient source, suppression policy, seed/test member, and explicit activation approval. |
| REQ-20260701-608 | WhatsApp/Whapi provider setup panel. | Blocked | WAPI readiness blocker packet prepared; existing local tooling remains no-send/read-only. | Need exact Whapi/WAPI credential alias/path and approved sending number. |
| REQ-20260701-609 | WhatsApp CRM scoping and contamination hardening. | Already satisfied | Existing scoped WAPI/WhatsApp phonebook tooling and tests pass; redacted live readback excluded unscoped rows and no send/write occurred. | No WhatsApp sends authorized. |
| REQ-20260701-610 | Buffer/social setup panel. | Done | No further action; publish/schedule remains approval-gated. | Future One Time Buffer scheduling requires explicit approval. |
| REQ-20260701-611 | Vimeo/Drive/OBS media pipeline. | Blocked | Wait for exact `VIMEO_ACCESS_TOKEN` keyholder alias/path and Vimeo owner/plan/scope/private-test-folder decisions. | Need Vimeo upload token and account decisions. |
| REQ-20260701-612 | Zoom/class-link security model. | Needs operator decision | Access-gated security model documented and member-path smoke proves anonymous users do not see Zoom/private media. | Need final Zoom meeting/class session details before configuring live records. |
| REQ-20260701-613 | Existing paying users migration audit. | Done | Read-only aggregate audit completed; no migration or billing mutation performed. | Actual migration, charges, cancellations, refunds, subscription changes, and payment-link/provider writes still require billing source-of-truth decisions and explicit approval. |
| REQ-20260701-614 | First campaign packet readiness. | Needs operator decision | Blocked campaign, seed-send, and consolidated operator decision handoff packets prepared. | Need final subject/body, exact recipient segment/list, suppression proof, final links/domain state, seed proof, and explicit final send command. |
| REQ-20260701-615 | Tests, screenshots, deploy/live-smoke. | Blocked | Safe completed app-visible/server-visible batches have test, watchdog, deploy, live-smoke, and screenshot proof. | Final campaign-domain proof and real send readiness need DNS/hosting routing plus final copy/list/links/approval. |
| REQ-20260701-616 | Product Quality gate cleanup. | Done | No further action; `npm run pqc:all` passes. | None. |

## Definition Of Done

Each requirement can close only with inspected files/routes/workflows, matching
implementation or explicit blocker, verification evidence, ledger/changelog
record, route/action registry coverage where relevant, and deploy/live-smoke
proof for app-visible/server-visible changes.
