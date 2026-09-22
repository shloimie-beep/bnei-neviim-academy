# Current Systems Closeout - 2026-06-30

## Executive result

Current BNA / One Time closeout work is locally complete and production-visible
where it was safe to deploy. The canonical release is PR #56, merged to
`master` at `98cfc4649e4bc52009a1aac9ee4616c1f5eeb272`. Railway deployment
`6257a4af-bb62-4fd4-b1b5-aff1ec057f40` reached `SUCCESS` on the production
service `skillful-motivation`, followed by live smokes and targeted readbacks.

The only remaining unfinished product behavior is external/account-owner gated:
Resend live sender/webhook configuration and any real test email send.

## Git, PR, and deployment truth

| Surface | Final truth |
|---|---|
| Release branch | `codex/current-systems-closeout-release-20260630` |
| Release PR | https://github.com/shloimie-beep/bnei-neviim-academy/pull/56 |
| PR state | MERGED at 2026-06-30T12:20:38Z |
| Merge commit | `98cfc4649e4bc52009a1aac9ee4616c1f5eeb272` |
| Superseded PRs | PR #52 and PR #55 closed as superseded by PR #56 |
| Railway project/service | `skillful-motivation` / `skillful-motivation` |
| Railway deployment | `6257a4af-bb62-4fd4-b1b5-aff1ec057f40` |
| Production app | https://bneineviimacademy.org |
| Records branch | `codex/current-systems-closeout-records-20260630` |
| Records PR | https://github.com/shloimie-beep/bnei-neviim-academy/pull/57 |
| Records merge commit | `668072eb85399754f3ce27af228f66912b6d161c` |

## Requirement status

| ID | Status | Result |
|---|---|---|
| REQ-20260630-201 | Done | Raw packet, register, report, execution run, ledger, changelog, and memory note recorded. |
| REQ-20260630-202 | Done | Git/PR/Railway truth reconciled; PR #56 merged and deployed. |
| REQ-20260630-203 | Blocked | Email/contact bridge and no-send UX verified; live Resend sender/webhook/send remains external. |
| REQ-20260630-204 | Done | Content taxonomy/Torah/Class Notes filters repaired, deployed, and live-readback verified. |
| REQ-20260630-205 | Done | Class/Drive intake audited; Issue #41 closed; live class upload trace passed. |
| REQ-20260630-206 | Done | Telegram parser/runtime evidence reconciled; no unauthorized sends. |
| REQ-20260630-207 | Done | Dirty-worktree risk isolated; superseded PRs closed; production/source skew closed. |
| REQ-20260630-208 | Done | Verification and terminal statuses/blockers recorded. |

## Verification evidence

Release branch verification:

- `node --check server.js`: passed.
- `node --check src/lib/integrations/resend-client.js`: passed.
- `node --check src/lib/integrations/resend-inbound-crm.js`: passed.
- `node --check src/lib/bna/content-card-view-model.js`: passed.
- `node --check scripts/audit-content-card-topic-filter.cjs`: passed.
- `node --test tests/resend-client.test.js tests/resend-inbound-crm.test.js tests/resend-inbound-webhook.test.js tests/communications-screening-import-ui.test.js tests/assistant-portal-communications-contract.test.js tests/one-time-communications-workspace.test.js tests/content-card-view-model.test.js tests/operations-content-library-taxonomy.test.js`: 45/45 passed.
- `npm run content:card-topic-audit -- --out-dir ops/class-drive-intake/2026-06-30-content-topic-routing-closeout`: passed; 29 recordings, raw bodies false, generated titles 29, needs parse 10, needs routing 0, needs topic classification 0, Torah topic count 29, Class Notes topic count 29.
- `npm run watchdog:security`: passed; `ops/watchdog-audits/2026-06-30T12-07-watchdog-security-routes.md`.
- `npm run watchdog:communications`: passed; `ops/watchdog-audits/2026-06-30T12-07-communications-alerts.md`.
- `npm run watchdog:content`: passed; `ops/watchdog-audits/2026-06-30T12-07-content-routing.md`.
- `npm run secrets:audit`: passed; 5430 tracked paths, 0 tracked secret-risk.
- `git diff --check`: passed.

Post-deploy live evidence:

- `npm run app:smoke`: passed; `ops/live-smokes/2026-06-30T12-13-06-243Z-live-app-smoke.md`.
- `npm run app:smoke:content-research-scope`: passed; `ops/live-smokes/2026-06-30T12-13-04-186Z-content-research-scope-live-smoke.md`.
- `npm run app:smoke:communications-screening`: passed; `ops/live-smokes/2026-06-30T12-13-04-134Z-communications-screening-live-smoke.md`.
- `npm run app:smoke:operations-helper`: passed; `ops/live-smokes/2026-06-30T12-13-04-196Z-operations-helper-live-smoke.md`.
- Content topic live readback passed; `ops/live-smokes/2026-06-30T12-18-15-254Z-content-topic-filter-live-readback.md`.
- Class upload trace live readback passed; `ops/live-smokes/2026-06-30T12-23-32-198Z-class-upload-trace-live-smoke.md`.
- Email/Resend no-send live UX smoke passed; `ops/live-smokes/2026-06-30T12-28-31-153Z-email-resend-ux-live-smoke.md`.
- One Time CRM contacts scoped live smoke passed; `ops/live-smokes/2026-06-30T12-29-08-404Z-one-time-crm-contacts-ux-live-smoke.md`.

## Content and class intake results

- Content Library renders cards and topic filters after the deployed repair.
- Live readback showed `All topics (65)`, `Torah (25)`, `Class Notes (25)`,
  Torah visible cards 25, Class Notes visible cards 25, and
  `raw_private_body_markers_found=false`.
- Issue #41 is closed. Its final apply/readback/idempotency evidence recorded
  7 personal question rows, 6 class-scoped review rows, 25 private
  task/research review rows, and 0 score/progress/grading or broad fanout rows.
- Issue #18 remains open as read-only historical evidence and is not a current
  executable blocker.
- Live class upload trace verified job #78 as `transcribed` / `04 Parsed` and
  did not write transcript body into the report.

## Email and contact results

- First-party BNA Operations remains the active contact/communications path.
- Email/Resend UX smoke verified provider/sender/domain separation, raw webhook
  payload hiding, and no enabled email send buttons.
- One Time CRM contacts smoke verified scoped parent leads and communications:
  1591 leads with `project_key=one_time_mishnah_class` and 112 scoped
  communications.
- No email, WhatsApp, SMS, Telegram, Buffer, campaign, payment, DNS, external
  CRM/GHL write, or raw provider body export was performed.

## External blockers

| ID | Blocks | Owner | Exact next action |
|---|---|---|---|
| DEC-20260630-201 | Resend live inbound/outbound completion | Shloimie / Resend account owner | Configure/confirm `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET`, and Resend `email.received` webhook to `https://bneineviimacademy.org/api/resend/inbound`, then approve signed inbound replay/readback. |
| EMAIL-SMOKE-20260630-201 | Real email send smoke | Shloimie | Provide one explicit safe test recipient and approve the exact `npm run email:smoke` send. |
| DEC-20260626-101 | Future unsafe raw/class/Drive/write backfills | Shloimie | Provide exact approval ID and scope for any future production write, raw transcript export, Drive write, score/progress/grading update, AI/paid transcription, or send/publish action. |

## Notes on execution-run validation

Before this closeout run was created, `npm run bna:run:validate` still pointed
at the old `2026-06-26-transcript-drive-digest-rebuild` active run and failed
because that historical run referenced three missing June 28 smoke report
paths. This records branch creates `ops/execution-runs/2026-06-30-current-systems-closeout`
and updates `ops/execution-runs/latest.json` so the active run now matches the
actual current goal and evidence.

Final records-branch validation:

- `npm run bna:run:validate`: passed. Requirement status counts: 7 done,
  1 blocked. Warning only: no upstream configured for the records branch.
- `npm run bna:run:next`: passed. Next unblocked executable batch: none.
- `npm run bna:run:blockers`: passed. Remaining blocker:
  `REQ-20260630-203`, owned by Shloimie / Resend account owner.

## Final verdict

The current systems closeout is done for local code, records, deploy, and live
readback. The remaining Resend/send work is intentionally blocked on external
configuration and explicit send approval.
