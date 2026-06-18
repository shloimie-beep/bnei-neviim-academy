# Ramble Intake - 2026-06-18 - operations-ui-audit-harness

## Raw intake

Shloimie requested a production-safe, repeatable Playwright-based UI audit
harness for the complete authenticated BNA Operations frontend. The harness is
audit tooling only: no UI redesign, product changes, publishing, sends, real
record mutation, or deployment.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260618-002 |
| Source | codex_chat |
| Parse status | implemented |
| Requirement register | tasks-pending/2026-06-18-operations-ui-audit-harness.md |

## Parsed requirements

| ID | Requirement | Source quote | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|---|
| REQ-20260618-AUDIT-001 | Build secure manual auth storage flow. | "User runs one auth command." | `npm run ops:audit:auth` opens headed browser, waits for manual login, verifies auth, saves `.runtime/auth/operations-storage-state.json`. | Playwright auth tooling | `npm run ops:audit:help`; missing-storage behavior; code syntax checks. | Done |
| REQ-20260618-AUDIT-002 | Build safe authenticated Operations crawler. | "The harness crawls the complete Operations UI safely." | `npm run ops:audit` loads storage state, verifies auth, maps routes/states, skips risky controls, blocks mutating requests. | Playwright crawler | Unit tests; unauth smoke; full crawl pending operator auth state. | Done |
| REQ-20260618-AUDIT-003 | Produce privacy-safe audit package. | "The ZIP contains the report, route map, findings, and redacted screenshots." | Timestamped run directory, reports, JSON artifacts, screenshots/contact sheets, gallery, ZIP, latest pointer. | Reports/package export | Unit tests for ZIP exclusion and report helpers; report generator tests. | Done |
| REQ-20260618-AUDIT-004 | Document canonical Operations source and operator workflow. | "Determine which implementation actually serves `/operations` in production." | `docs/OPERATIONS-UI-AUDIT.md` documents Express/static canonical surface and exact commands. | Docs | File inspection and documentation review. | Done |

## Parsed tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260618-AUDIT-001 | Implement Operations UI audit harness | Codex | Audit tooling | "Do not merely describe the proposed harness. Build it, test it, and commit the implementation." | Harness, docs, tests, verification, and commit are complete; no deploy or live mutation occurred. | Done |

## Implementation map

| ID | Files/routes/components | Plan | Verification |
|---|---|---|---|
| REQ-20260618-AUDIT-001..004 | `tools/ops-ui-audit.js`; `tools/ops-ui-audit/*`; package scripts; docs; tests | Add CLI, auth, crawler, safe actions, privacy redaction, detectors, screenshots/contact sheets, reports, ZIP package, docs, and tests. | Required verification commands plus unauth login smoke. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260618-AUDIT-001 | Done | `tools/ops-ui-audit/auth.js` and `tools/ops-ui-audit.js` implement headed manual login and local storage-state save. | `tools/ops-ui-audit.js`; `tools/ops-ui-audit/auth.js`; `.gitignore`; `package.json` | `npm run ops:audit:help` PASS; missing-state run exits with auth instruction. | Operator still needs to run the manual login before the first authenticated crawl. |
| REQ-20260618-AUDIT-002 | Done | `tools/ops-ui-audit/crawler.js`, `safe-actions.js`, and `detectors.js` implement safe state discovery, request blocking, route/state maps, and detectors. | `tools/ops-ui-audit/crawler.js`; `tools/ops-ui-audit/safe-actions.js`; `tools/ops-ui-audit/detectors.js`; `tools/ops-ui-audit/state-discovery.js` | `node --test tests/ops-ui-audit-harness.test.js` PASS; `npm test` PASS 771/771; `npm run ops:audit -- smoke-login` PASS. | Full authenticated crawl was not run because `.runtime/auth/operations-storage-state.json` is absent in this Codex environment. |
| REQ-20260618-AUDIT-003 | Done | Report, screenshot, contact-sheet, gallery, latest pointer, and ZIP generation are implemented with exclusion tests for storage/secrets/raw files. | `tools/ops-ui-audit/reporter.js`; `tools/ops-ui-audit/screenshots.js`; `tools/ops-ui-audit/package-export.js`; `tools/ops-ui-audit/privacy.js`; `tests/ops-ui-audit-harness.test.js` | `node --test tests/ops-ui-audit-harness.test.js` PASS; package exclusion test PASS. | No production audit ZIP exists yet until the operator runs the authenticated audit. |
| REQ-20260618-AUDIT-004 | Done | Canonical Operations source is documented as Express `GET /operations` with `requireAdmin` serving `public/operations.html`; login shell is `public/operations-login.html`; no active `src/app/operations/` exists. | `docs/OPERATIONS-UI-AUDIT.md`; `tasks-pending/2026-06-18-operations-ui-audit-harness.md` | Preflight file inspection completed; docs reviewed. | None. |
