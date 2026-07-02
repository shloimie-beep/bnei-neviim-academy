# Source

## Current Raw Input

- Raw ID: `RAW-20260621-001`
- Repo pointer: `raw-input/RAW-20260621-001-one-time-master-completion-goal.md`
- Source channel: `codex_chat`
- Captured: 2026-06-21T11:05:00+03:00
- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`

## Predecessor Inputs Preserved

- Prior master packet: `RAW-20260619-005`
- Prior register: `tasks-pending/2026-06-19-one-time-master-recovery-register.md`
- Prior matrix: `ops/one-time-mishnah/master-backlog-reconciliation.md`
- Future-only backlog input now activated by the operator:
  `ops/one-time-mishnah/next-master-backlog-input.md`
- Latest dry-run meeting parse:
  `ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json`
- Meeting reconciliation:
  `ops/ingestion-runs/2026-06-19-rabbi-scheller-meeting-reconciliation/RECONCILIATION.md`

## Queued Future Source

- Raw ID: `RAW-20260622-001`
- Canonical parent ID: `PARENT-20260622-001`
- Queue-registration requirement: `REQ-20260622-001`
- Source: GitHub issue #7,
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/7`
- Raw storage:
  `raw-input/RAW-20260622-001-github-issue-7-canonical-agent-execution-system.md`
- Internal queued handoff:
  `tasks-pending/2026-06-22-github-issue-7-canonical-agent-execution-queued.md`

Issue #7 is registered only as a queued canonical source. It must not create a
second active execution run, duplicate visible Tasks, or any implementation
work inside PR #5. Start its dedicated branch/worktree only after this active
run is closed or explicitly paused.

## Queued Addendum To Issue 7

- Raw ID: `RAW-20260623-005`
- Canonical parent ID: `PARENT-20260622-001`
- Queue-registration requirement: `REQ-20260623-010`
- Source: GitHub issue #7 comment `4780321517` plus expanded Codex chat packet
- Raw storage:
  `raw-input/RAW-20260623-005-telegram-website-control-plane-addendum.md`
- Internal register:
  `tasks-pending/2026-06-23-telegram-website-control-plane-addendum.md`

This addendum extends issue #7 into one universal natural-language control
plane for Telegram and the website assistant. It explicitly covers
service-provider onboarding/self-service, parent linked-child control, student
scope where enabled, super-admin automation/campaigns, BNA/family, One Time,
file/media intake, previews, reminders, tickets, and durable Agent Work. It
also explicitly forbids duplicate bot architectures, action registries, intake
pipelines, agent queues, provider onboarding systems, and execution runs.

GitHub PR #5 was checked on 2026-06-23 and is now merged. The local active run
still has open requirements and a dirty worktree, so full issue #7/addendum
implementation should still wait for a clean sequencing point or an explicit
pause. The overlapping safe batch is the current active run's workspace
users/roles/security work, `REQ-20260619-303`.

## Operator Intent

Complete every currently possible, credential-free and decision-free One Time
workstream. The current prompt explicitly authorizes commits, push to PR #5,
safe app-visible Railway deployment, and focused live smokes. External writes,
real sends, billing, DNS, account ownership changes, hard deletes, real Zoom
class creation, real Vimeo uploads/publication, and PR merge remain blocked
unless separately authorized.

## Active Follow-On Source - Integration Navigation Owner Review

- Raw ID: `RAW-20260624-001`
- Source: Codex chat assessment and prompt packet
- Raw storage:
  `raw-input/RAW-20260624-001-integration-navigation-owner-review-closeout.md`
- Requirement register:
  `tasks-pending/2026-06-24-integration-navigation-owner-review-closeout.md`
- Requirement IDs: `REQ-20260624-001` through `REQ-20260624-011`
- Workspace/project:
  `bna_platform / integration_navigation_owner_review`

This packet explicitly says the prior Telegram/website assistant closeout did
not prove the full application is integrated, discoverable, navigable, and
owner-review ready. The new pass must consolidate PR #12, PR #13, and any
discoverable final running-agent SHA into one credential-free integration
candidate; automatically inventory routes/pages/links/forms/manifests/
service-worker/login/logout/deep-link destinations; repair navigation and
information architecture; canonicalize One Time; verify role journeys locally
with synthetic fixtures and mock integrations; rerun the UX backlog; add
permanent release gates; and produce an owner-review packet.

Guardrails: no external credentials, production readback, production database
mutation, backfill application, deploy, live production smoke, email/Telegram
send, publish, upload, charge, DNS, OAuth/account-owner action, or secret
request.
