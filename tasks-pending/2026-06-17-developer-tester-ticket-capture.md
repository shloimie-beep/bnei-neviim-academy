# Ramble Intake - 2026-06-17 - developer-tester-ticket-capture

## Raw Intake

| Raw ID | Source | Parse status | Raw storage | Notes |
|---|---|---|---|---|
| RAW-20260617-014 | operations_ui / task #564 | registered | raw-input/RAW-20260617-014-developer-tester-ticket-capture.md | Backlog task asks for approved developer testers to file assistant tickets safely. |

## Parsed Requirements

| ID | Requirement | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|
| REQ-20260617-219 | Developer tester is an explicit assistant role | Tester requests normalize to `developer_tester` only through the approved setup/tester path and do not become admin or Codex-capable actors. | `server.js`; setup assistant | Focused tests; live smoke | Pending |
| REQ-20260617-220 | Tester assistant can create tickets only | Tester role can create support/problem tickets and cannot create tasks, Codex jobs, or load private parent/student/provider records. | Universal assistant permissions | Focused tests | Pending |
| REQ-20260617-221 | Ticket captures page/device/screenshot/log context | Tester tickets persist sanitized page path, surface, viewport/device, screenshot/log references, and no external-send metadata. | Universal assistant ticket source context | Focused tests; live smoke | Pending |
| REQ-20260617-222 | Private parent/student data is excluded | Tester source context excludes household/student/provider identifiers and any private selected records from ticket metadata. | Universal assistant context loading/source context | Focused tests | Pending |
| REQ-20260617-223 | Task #564 closes with deployed proof | Add tests/smoke coverage, deploy runtime changes, run live verification, close task #564, and ensure the linked agent job is terminal. | Tests / scripts / Operations task API | `npm test`; Railway deployment; live smokes; task readback | Pending |

## Parsed Tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260617-564 | Enable developer tester assistant ticket capture | Codex | Universal assistant / support tickets | "Let approved developer testers submit tickets with page, device, screenshot/log context, and no access to private parent/student data." | Developer tester ticket capture is implemented, tested, deployed, live-smoked, and task #564 is closed with valid proof. | Running |

## Guardrails

- Do not send email, WhatsApp, Telegram, social posts, payments, DNS changes, account grants, credential copies, uploads, or external connector writes.
- Do not expose private parent, student, household, provider, payment, or admin records to developer testers.
- Tester ticket live smoke may create and then verify an internal support ticket only if it uses synthetic/safe content and no private data.

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260617-219 | Pending |  |  |  |  |
| REQ-20260617-220 | Pending |  |  |  |  |
| REQ-20260617-221 | Pending |  |  |  |  |
| REQ-20260617-222 | Pending |  |  |  |  |
| REQ-20260617-223 | Pending |  |  |  |  |
