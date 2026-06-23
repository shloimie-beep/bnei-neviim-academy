# One Time Backend And UI Review Readiness Tracker

Updated: 2026-06-22
Run: `ops/execution-runs/2026-06-21-one-time-master-completion`
Requirement: `REQ-20260619-313`

## Operator Direction Captured

The target is a clean, reusable One Time implementation from the canonical BNA
codebase: backend foundations should work first, Stripe/email/Zoom/billing and
the rest of the operational surfaces should be real or explicitly gated, and
the UI should be professional enough for Shloimie's review before any later
clone/separate workspace deployment for Rabbi Scheller.

The operator also emphasized that the worktree must stay clean and aligned with
the branch, unrelated dirty files must not become mixed into implementation
commits, and these topics must remain visible rather than living only in chat.

## Durable Topics

| Topic | Current buildable status | External blocker | Next Codex action |
| --- | --- | --- | --- |
| Clean branch hygiene | Canonical branch is aligned with origin at the latest checked HEAD. New work must be committed in scoped batches only. | Existing unrelated dirty/generated files are present in the local worktree and must not be reset without explicit cleanup authorization. | Stage only this requirement's files; use a fresh clean worktree if future broad implementation needs a clean base. |
| Separate One Time instance | Package, seed SQL, isolation scan, preflight, live-smoke script, guarded Railway apply runner, guarded DB bootstrap runner, and one empty kept Railway project exist. Kept project: `ce55ef20-1418-4ad3-aafa-f877fb992dc8`. | Operator needs to decide when to create services/DB/deploy after duplicate cleanup. DNS remains external later. | If proceeding, run `npm run one-time:railway-provision:apply -- --project-id ce55ef20-1418-4ad3-aafa-f877fb992dc8 --apply --confirm PROVISION_ONE_TIME_INSTANCE`, then `npm run one-time:db:bootstrap -- --apply --confirm BOOTSTRAP_ONE_TIME_DATABASE`. |
| DNS | Domain handoff file exists; no stale DNS records are reused. | Railway must first attach `app.onetimeonetime.com` to the One Time web service and return fresh records; DNS entry remains operator/provider-side unless authenticated DNS tooling is available. | Capture records from the apply report and update `ops/one-time-mishnah/onetime-domain-handoff.md`. |
| Stripe and billing | Test/readiness-only Stripe, checkout preview, trial/referral/access model, webhook/idempotency, and no-live-charge gates are implemented. | Live billing, final product/legal wording, and real charges require explicit approval. | Keep live charge actions disabled; verify test-mode readiness on the separate instance after deploy. |
| Email and Resend | Resend API readiness, domain/sender state, outbox/templates, webhook signature verification, and event storage are implemented without sending live email. | Sender/domain DNS and from/reply-to decisions remain external. | Verify on separate instance after deploy; do not enable send until readiness and approval pass. |
| Zoom | API client/readiness, secure meeting intent, protected join reference, webhooks, and attendance foundation are implemented without real meeting creation by default. | Real meeting creation requires approved account readiness and duplicate-safe workflow. | Verify readiness on separate instance; keep real meeting creation gated. |
| Vimeo/library | Manual Vimeo reference workflow and member-library foundation are implemented; automated upload is feature-flagged. | User-level Vimeo token/upload authorization and manual publication policy remain external. | Verify manual reference playback/metadata on separate instance; do not run automated upload. |
| Parent/student/provider portals | Role-scoped parent, student, and provider routes/foundations are implemented and single-tenant helper hides BNA-only bot/accountability surfaces. | Separate live verification waits for the One Time deployment and isolated database. | Run `npm run app:smoke:onetime-separate-instance -- <base-url>` after deploy. |
| UI polish | Operations navigation/filter-rail/action coverage work is implemented and live-verified on the shared deployment. | Shloimie's next ramble is needed for subjective UI corrections after review. | Prepare review package/screenshots after separate deploy; do not over-polish ahead of review. |
| Hosted transcription | Credential audit confirms approved local candidate keys return HTTP 401. | Valid hosted transcription/OpenAI credential from keyholder. | Preserve `REQ-20260621-902` blocker; do not retry repeatedly until a valid key exists. |

## Clean Worktree Rule

Implementation commits for this topic must include only scoped code, tests, and
evidence. Existing dirty files such as website blog data, old Playwright smoke
images/reports, and old watchdog audit artifacts are intentionally excluded
unless the operator gives a separate cleanup instruction.

## Next Review Sequence

1. Get Railway account-level auth or a scoped One Time project token.
2. Run the guarded apply command.
3. Apply migrations/seed to the separate Postgres database.
4. Run isolation scan and portal smokes.
5. Attach `app.onetimeonetime.com` and record fresh DNS records.
6. Fill the operator UI review package with live routes and screenshots.
7. Shloimie reviews and provides the next UI-correction ramble.
