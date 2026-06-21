# Ramble Intake - 2026-06-17 - contacts-intake-cleanup

## Raw Intake

| Raw ID | Source | Parse status | Raw storage | Notes |
|---|---|---|---|---|
| RAW-20260617-008 | codex_chat / Operations task #640 | implemented | raw-input/RAW-20260617-008-contacts-intake-cleanup.md | Operator reported that the Contacts intake/ingesting area shows people who are already signed up. |

## Parsed Requirements

| ID | Requirement | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|
| REQ-20260617-135 | Keep signed-up families out of Contacts signup intake | Student-linked, paid, or completed registration rows do not appear in the signup review/intake lane. | Operations Contacts | `signupNeedsIntakeReview` now returns false for `signupIsSignedUpContact`; live readback passed. | Done |
| REQ-20260617-136 | Keep prospects in the interested parent pipeline | Interested parent leads remain in Leads / Interested Parents rather than signup review. | Operations Contacts | Contacts copy and routing keep prospects in Leads / Interested Parents; no lead statuses were routed into signup review. | Done |
| REQ-20260617-137 | Remove confusing intake wording for signed-up students | Contacts copy makes it clear signed-up families are Contacts/Students, and only incomplete/manual records need signup review. | Operations Contacts | Subtab/title changed to `Signup Review`; deployed readback confirmed old `Signup Intake` label removed. | Done |
| REQ-20260617-138 | Add regression coverage | A test guards the Contacts intake classifier and copy. | Tests | `node --test tests/operations-contacts-intake-cleanup.test.js tests/telegram-ramble-routing-regression.test.js` passed. | Done |
| REQ-20260617-139 | Deploy and close task #640 with proof | Live Operations task #640 reaches done/history/completed only after tests, deploy, and live smoke pass. | Operations task API / source of truth | Railway deployment `eff39084-5951-48fb-9e70-ac69668bb0c6`; `npm run app:smoke`; live task readback proof valid. | Done |

## Parsed Tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260617-640 | Clean Contacts signup review lane | Codex | Operations Contacts | "there's people that are already signed up so can we get rid of that section" | Operations Contacts no longer classifies completed/signed-up families as signup review records; task #640 is closed with proof. | Done |

## Implementation Map

| ID | Files/routes/components | Plan | Verification |
|---|---|---|---|
| REQ-20260617-135 | public/operations.html | Add a signed-up/completed signup classifier and make the intake section use it before missing-contact/status checks. | Static regression test, full tests, live smoke. |
| REQ-20260617-136 | public/operations.html | Leave parent leads in the existing Leads / Interested Parents lane and avoid routing lead statuses into signup review. | Static regression test and UI/API smoke. |
| REQ-20260617-137 | public/operations.html | Rename the lane from Signup Intake to Signup Review and update the empty/meta copy. | Static regression test and visual/smoke verification. |
| REQ-20260617-138 | tests/operations-contacts-intake-cleanup.test.js | Add static tests for classifier, subtab label, and meta text. | `node --test tests/operations-contacts-intake-cleanup.test.js`. |
| REQ-20260617-139 | live task #640 | Mark live task done only after deployment/live smoke. | Railway doctor, `npm run app:smoke`, task readback. |

## Guardrails

- Do not perform email, WhatsApp, social, payment, account-grant, DNS, credential, upload, or external connector writes.
- Do not directly edit the database; use app APIs for task closeout.
- Do not mark task #640 complete until app-visible changes are deployed and smoked.

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260617-135 | Done | `public/operations.html` adds `signupIsSignedUpContact` and `signupNeedsIntakeReview`; live readback `ops/live-smokes/2026-06-17T14-09-29-826Z-contacts-intake-cleanup-live-smoke.md`. | `public/operations.html` | `npm test` passed 717/717; live readback passed. | None |
| REQ-20260617-136 | Done | Leads remain in `interested_parents`; signup review copy says prospects live in Leads / Interested Parents. | `public/operations.html` | Focused tests and live readback passed. | None |
| REQ-20260617-137 | Done | Subtab/title are now `Signup Review`; empty/meta copy separates signed-up families from prospects. | `public/operations.html` | Focused tests and live readback confirmed the old `Signup Intake` label is gone. | None |
| REQ-20260617-138 | Done | `tests/operations-contacts-intake-cleanup.test.js` covers classifier, copy, and live-smoke proof prefixes. | `tests/operations-contacts-intake-cleanup.test.js`, `tests/telegram-ramble-routing-regression.test.js` | Focused tests passed; `npm test` passed 717/717. | None |
| REQ-20260617-139 | Done | Live task #640 readback is `done` / `history` / `completed`, `proof_status: valid`, `done_link_status: done_with_report`. | `server.js`, source-of-truth files | Railway deployment `eff39084-5951-48fb-9e70-ac69668bb0c6`, doctor SUCCESS, app smoke `ops/live-smokes/2026-06-17T14-08-21-638Z-live-app-smoke.md`, contacts smoke `ops/live-smokes/2026-06-17T14-09-29-826Z-contacts-intake-cleanup-live-smoke.md`. | None |
