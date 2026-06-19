# Ramble Intake - 2026-06-17 - helper-deep-link-navigation

## Raw Intake

| Raw ID | Source | Parse status | Raw storage | Notes |
|---|---|---|---|---|
| RAW-20260617-009 | codex_chat / Operations task #581 | implemented | raw-input/RAW-20260617-009-helper-deep-link-navigation.md | Operator asked for helper links/navigation to bring him directly to the relevant page or do the navigation. |

## Parsed Requirements

| ID | Requirement | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|
| REQ-20260617-140 | Preserve current Operations page for "this page" navigation | Helper navigation requests like "open this page" use current view, section, and workspace when no explicit target is named. | BNA Helper planner | `tests/bna-helper-tools.test.js`; live helper smoke deep-link step | Done |
| REQ-20260617-141 | Support Settings Calendar/Classroom deep links | Calendar/Classroom requests from Settings route to `view=settings&section=calendar_classroom` instead of generic Tasks schedule. | BNA Helper planner / Operations route | `tests/bna-helper-tools.test.js`; live helper smoke deep-link step | Done |
| REQ-20260617-142 | Keep result links usable | Helper `open_operations_view` output includes a direct `/operations?...` URL and result card. | Helper tool registry / UI | `tests/bna-helper-tools.test.js`; `ops/live-smokes/2026-06-17T14-22-01-724Z-operations-helper-live-smoke.md` | Done |
| REQ-20260617-143 | Add regression coverage and close task #581 | Tests cover current-page and Settings Calendar/Classroom navigation, then live task #581 is closed with proof. | Tests / Operations task API | full `npm test`; live task #581 readback valid | Done |

## Parsed Tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260617-581 | Harden helper page deep links | Codex | BNA Helper / Operations | "open links you bring me right to the link to that page or you do it for me" | Helper plans direct Operations links for current-page and settings calendar/classroom requests; task #581 is closed with proof. | Done |

## Guardrails

- Do not perform email, WhatsApp, social, payment, account-grant, DNS, credential, upload, or external connector writes.
- Use app APIs for task closeout; no direct DB writes.
- Deploy and smoke before marking app-visible task #581 complete.

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260617-140 | Done | Current-page helper request preserves `view=settings`, `section=calendar_classroom`, and `workspace=bna`. | `src/lib/bna/helper/planner.js`; `tests/bna-helper-tools.test.js`; `scripts/smoke-operations-helper-live.mjs` | `node --test tests/bna-helper-tools.test.js`; live helper smoke | None |
| REQ-20260617-141 | Done | Explicit `open settings calendar classroom` plans `open_operations_view` with `view=settings&section=calendar_classroom&workspace_key=bna`. | `src/lib/bna/helper/planner.js`; `tests/bna-helper-tools.test.js`; `scripts/smoke-operations-helper-live.mjs` | `node --test tests/bna-helper-tools.test.js`; live helper smoke | None |
| REQ-20260617-142 | Done | `open_operations_view` returns direct Operations URL output; live helper smoke verified planning without executing unsafe actions. | `tests/bna-helper-tools.test.js`; `scripts/smoke-operations-helper-live.mjs` | `ops/live-smokes/2026-06-17T14-22-01-724Z-operations-helper-live-smoke.md` | None |
| REQ-20260617-143 | Done | Task #581 closed through the app API with valid proof. | `raw-input/RAW-20260617-009-helper-deep-link-navigation.md`; this register; `memory/2026-06-17.md`; `ops/agent-changelog.md`; `ops/agent-task-ledger.jsonl` | `npm test` passed 720/720; Railway deployment `4dbbb91e-b1e8-49a5-b189-80f39a8fad06`; live app smoke; task #581 readback `done` / `history` / `completed` with `proof_status: valid` | None |
