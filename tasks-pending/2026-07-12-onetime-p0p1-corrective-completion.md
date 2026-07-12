# One Time P0/P1 Corrective Completion

Raw source: `raw-input/RAW-20260712-001-onetime-pr129-completion-followup.md`
Execution run: `ops/execution-runs/2026-07-12-onetime-p0p1-corrective-completion`
Continues prior run:
`ops/execution-runs/2026-07-11-onetime-p0p1-owner-crm-landing-corrective`

## Delivery Truth

- Delivery lane: PR #129,
  `codex/onetime-p0p1-corrective-20260711`
- PR URL: https://github.com/shloimie-beep/bnei-neviim-academy/pull/129
- PR state: merged
- PR head at capture:
  `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`
- PR head at merge:
  `598f66238f68293575d5f9e6195bb6b032ebb156`
- Base/master at audit time:
  `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a`
- Merge commit:
  `8e22e5d79844e994e94c4f3ed92ac51422649b8c`
- Deployed/live-smoked runtime source SHA:
  `5bf521c539e608543c6a54028cccdc8903667081`
- Railway deployment:
  `bc45a0fa-76b1-4170-80d2-cf18dbca70c9`
- Live URL:
  https://join.onetimeonetime.com

Use a fresh clean worktree from `origin/master` for future work. The original
PR worktree later acquired unrelated dirty `server.js` /
`src/lib/bna/one-time-delivery-outbox.js` changes and must not be treated as
clean Git truth until reconciled by its owner.

## Requirements

| ID | Status | Current result | Remaining blocker |
| --- | --- | --- | --- |
| REQ-20260712-001 | Verified | July 12 raw prompt, Robot/image context, register, run files, latest pointer, and prior-run continuation state exist. | None |
| REQ-20260712-002 | Needs operator decision | PR/run truth is current and local gates pass. | GitHub credential lacks `workflow` scope for `.github/workflows/onetime-corrective.yml`. |
| REQ-20260712-003 | Verified | Browser tests load real `/operations` bootstrap/generated CSS/JS assets, not raw `public/operations.html`. | None |
| REQ-20260712-004 | Verified | Normal One Time provider login establishes scoped Operations session and redirects provider aliases to canonical `/operations`. | None |
| REQ-20260712-005 | Verified | First-party One Time CRM DTO/API/UI and the production fake-contact journey passed: search/select, edit, note, follow-up task, reload persistence, cross-workspace isolation, targeted mailbox, return state, task cleanup, and lead archive. | None |
| REQ-20260712-006 | Verified | Direct signup and Family/School continuation linkage are verified with operator-approved production personal-contact proof, redacted evidence, and cleanup. | None |
| REQ-20260712-007 | Needs verification | Landing hierarchy, Robot asset optimization/launcher, config sync, and live smoke are complete. | Full screenshot/matrix set remains open for non-landing surfaces. |
| REQ-20260712-008 | Needs operator decision | Canonical `ingestOperatorRamble()` service, adapter routing, receipts, packet-status contract, and local regressions are implemented and deployed. | Production intake/dropoff write-smoke would create live raw/parse records and needs a scoped production test packet. |
| REQ-20260712-009 | Needs operator decision | Mandatory ramble-to-done regression coverage passes locally and deployed server code is live-smoked. | Same production write-smoke decision as REQ-008. |
| REQ-20260712-010 | In progress | Signup/landing screenshot proof and partial requirement matrix exist. | Remaining screenshots/matrix for provider login, Operations dashboard, CRM, mailbox, and Robot launcher. |
| REQ-20260712-011 | Needs verification | Release authorization, PR merge, Railway deploy, exact deployed SHA readback, and live smokes are complete. | Machine status remains open until the final-matrix dependency closes. |
| REQ-20260712-012 | Verified | Urgent signup/reminder workflow addendum captured into the active run. | None |
| REQ-20260712-013 | Verified | Canonical `/one-time/signup` and direct public Sign Up Now routing are implemented, deployed, and live-smoked. | None |
| REQ-20260712-014 | Verified | City/timezone signup schedule behavior is implemented, tested, deployed, and covered by live route proof. | None |
| REQ-20260712-015 through REQ-20260712-019 | In progress / needs verification | CRM/outbox/reminder/Telegram/WAPI pieces have local implementation and guarded tests; One Time WAPI provider setup is now configured. | Real DB proof, live auto-reply/Telegram approval, scheduler readiness, and no-send/operator-test evidence remain open where applicable. |
| REQ-20260712-020 / REQ-20260712-021 | Needs operator decision | Release/deploy/live SHA proof is complete. | Terminal closeout depends on blocked persistence/operator personal test evidence. |
| REQ-20260712-022 | Needs operator decision | Guarded reminder simulation and readiness checks are implemented locally; One Time WAPI provider setup is configured and deployed; operator personal signup/continuation proof is complete. | Exact live-send behavior/copy and scheduler/CRON readiness remain open; no external sends were performed. |
| REQ-20260712-023 | In progress | Signup/reminder evidence matrix exists. | Broader final matrix and remaining live screenshots are incomplete. |

## Verification

Pre-merge/local gates passed:

- `npm run operations:build`
- `npm run operations:check-generated`
- `npm run operations:check-canonical`
- `npm run secrets:audit`
- `npm run watchdog:actions`
- `npm run watchdog:protocol-drift`
- `node --test tests/release-captain.test.js`
- `npm run test:onetime:focused` at 67/67 before merge

Release/live gates passed:

- `npm run bna:release-gate -- --allow-detached --remote-branch master`
- `npm run one-time:railway-target:guard`
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 5bf521c539e608543c6a54028cccdc8903667081`
- `npm run app:smoke:one-time-interest-crm-e2e`
- `npm run app:smoke:one-time-personal-continuation`
- `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`
- Direct `GET https://join.onetimeonetime.com/api/deploy-info` returned
  `commit_sha` = `5bf521c539e608543c6a54028cccdc8903667081`.

## Decisions And Blockers

| ID | Status | Owner | Next action |
| --- | --- | --- | --- |
| DEC-20260712-001 | Completed | Operator / reviewer | Release authorization was given and PR #129 was merged/deployed/live-smoked. |
| DEC-20260712-002 | Completed for CRM | Operator / Codex | Operator approved a production fake-contact write-smoke; `REQ-20260712-005` CRM persistence proof passed with task cleanup and lead archive. |
| DEC-20260712-003 | Needs operator decision | Operator / reviewer | Decide whether to run a production intake/dropoff write-smoke packet that creates live raw/parse records. |
| DEC-20260712-004 | Needs operator decision | Operator / provider setup owner | Personal deployed signup/continuation proof is complete. Decide whether to approve exact live WAPI/email/Telegram send behavior and copy before any external send proof. |

No production email/WhatsApp/Telegram/campaign send, charge/refund, access
grant, historical import, DNS/account mutation, credential mutation, or
external-provider write was performed.
