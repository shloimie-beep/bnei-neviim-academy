# One Time Local Beta Release Gate - 2026-06-20

Status: local release gate prepared and local hardening closeout complete;
external release actions withheld.

## Scope

This release gate covers the local-only One Time beta hardening run:

- Run: `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`
- Raw prompt: `raw-input/RAW-20260620-001-onetime-local-beta-hardening-super-prompt.md`
- Raw prompt SHA256:
  `9509DF68F5A5EAE4513049EAF0CEBB8E84A8ABDE56B99B5A4C3310F6FBBA3628`
- Build label: `onetime-local-beta-2026.06.19`

## Current Git State

- Branch: `integration/20260619-platform-finish`
- Base HEAD before this hardening work:
  `4cb03da4f21c94933a06a729fcf757bd2259652b`
- Worktree has local changes and untracked evidence/docs/scripts from the
  hardening run.
- No files were staged.
- No commit was created.
- No push was attempted.
- No pull request was opened or updated.

## Local Verification Completed

Representative gates recorded in the active run:

- Full `npm test`: 990/990 passing.
- Focused One Time synthetic/local suites: 27/27 passing.
- One Time browser acceptance: 8 Playwright journeys passing with screenshots.
- One Time synthetic pilot: 10/10 stages covered, no missing stages, no write
  violations.
- Secret audit: 3360 tracked paths checked, 0 tracked secret-risk files found.
- Watchdog bundle: severity `ok`, 0 findings after provenance repairs.
- UI and visual watchdogs: severity `ok`, 0 findings.
- Execution run validation: passing with all 19 requirements done.
- JSON/JSONL parse checks: passing.
- `git diff --check`: passing with line-ending warnings only.

Key evidence:

- `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/TEST-RESULTS.md`
- `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/EVIDENCE.md`
- `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/evidence/req421-browser-acceptance.json`
- `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/evidence/req421-browser-acceptance/`
- `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/evidence/req422-synthetic-pilot.json`

## Release Blockers

These are intentionally blocked until the operator explicitly approves them:

| Area | Status | Required approval or input |
|---|---|---|
| Commit | Withheld | Operator approval to stage the final scoped file set and create a commit. |
| Push | Withheld | Operator approval to push the current branch or a new release branch. |
| PR | Withheld | Operator approval for PR creation/update and target branch. |
| Deploy | Withheld | Operator approval for Railway deploy and target service/environment. |
| Live smoke | Withheld | Operator approval plus live URL/credentials if needed. |
| Production DB | Withheld | Explicit approval and migration plan. |
| DNS/domain | Withheld | Explicit approval and target records. |
| Email | Withheld | Resend sender/domain approval and send confirmation. |
| Payments | Withheld | Stripe/Green Invoice/live checkout decision and credentials. |
| Zoom/Vimeo/Drive | Withheld | Provider approval, account access, and rollback plan. |
| Member access/library publish | Withheld | Human approval of audience, privacy review, and test member. |

## Candidate Release Notes

- One Time local beta now has explicit product, roles, portal, pricing,
  provider consent, integration, startup/seed/reset, security, browser, and
  synthetic-pilot contracts.
- Public One Time offer routes and geo aliases are registered and locally
  browser-smoked.
- `/one-time/member-login` now serves the protected member-entry surface instead
  of the public offer page.
- Local One Time scripts now include plan, seed, reset, smoke, audit, and
  synthetic pilot commands.
- Stripe and Resend remain local/test/mock only with no live charge or send.
- Zoom/Vimeo/media pipeline remains preview-only with no provider mutation or
  member-library publication.
- Progress/reward views are privacy scoped, and rewards require operator
  approval before any award.
- Announcements-first community keeps replies muted/private and all sends
  blocked without approval.

## Pre-Release Checklist

Before any external release action:

1. Review `git status --short` and decide the exact staged file set.
2. Rerun final local gates from
   `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/TEST-RESULTS.md`.
3. Confirm whether this should become a commit on
   `integration/20260619-platform-finish` or a new release branch.
4. Confirm PR target and whether the PR should be draft or ready.
5. Confirm whether Railway deploy/live smoke is authorized.
6. Confirm provider/live-service approvals for payments, email, Zoom, Vimeo,
   Drive, DNS, and member publishing.

## Explicitly Not Performed

No deploy, Railway mutation, DNS change, production database write, live email
send, live payment, Zoom/Vimeo/Drive provider mutation, member-library publish,
commit, push, PR, or external-account write was performed by this release gate.
