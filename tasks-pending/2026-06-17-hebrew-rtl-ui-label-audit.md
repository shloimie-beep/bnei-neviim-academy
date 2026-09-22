# Ramble Intake - 2026-06-17 - hebrew-rtl-ui-label-audit

## Raw Intake

| Raw ID | Source | Parse status | Raw storage | Notes |
|---|---|---|---|---|
| RAW-20260617-011 | operations_ui / task #569 | implemented | raw-input/RAW-20260617-011-hebrew-rtl-ui-label-audit.md | Seeded backlog task asks for a Hebrew RTL label audit across parent, student, signup, and provider surfaces. Duplicate raw ID `RAW-20260617-010` was repaired because it belongs to the Rabbi Scheller / OneTime Mishnayos packet. |

## Parsed Requirements

| ID | Requirement | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|
| REQ-20260617-204 | Parent Hebrew labels do not fall back to English | Parent portal Hebrew mode uses Hebrew labels for portal, coaching, and student-login reset controls. | `public/parent.html` | `npm run audit:hebrew-rtl`; `npm run app:smoke:hebrew-rtl` | Done |
| REQ-20260617-205 | Student Hebrew labels do not fall back to English | Student portal Hebrew mode uses Hebrew labels for login, access fallback, logout, and classroom/calendar labels, while brand/product names may remain. | `public/student.html` | `npm run audit:hebrew-rtl`; `npm run app:smoke:hebrew-rtl` | Done |
| REQ-20260617-206 | Hebrew signup remains RTL and Hebrew-first | Hebrew signup page has `lang=he`, `dir=rtl`, Hebrew navigation context, and no known English form-section fallbacks except language switch/brand/year/code. | `public/signup-he.html`; public nav | `npm run audit:hebrew-rtl`; `npm run app:smoke:hebrew-rtl` | Done |
| REQ-20260617-207 | Provider public entry labels are Hebrew where Hebrew UI exists | Public provider/navigation labels in Hebrew mode do not fall back to English; provider portal is documented as English-only until a Hebrew provider portal is requested. | `public/js/bna-site-nav.js`; `public/provider.html` | `npm run audit:hebrew-rtl`; `npm run app:smoke:hebrew-rtl` | Done |
| REQ-20260617-208 | Audit report, regression coverage, deploy, and close task #569 | Add a repeatable audit/test, run full verification, deploy if runtime/public files change, and close the live task with proof. | Scripts / tests / Operations task API | `npm test`; Railway deployment `36870a9c-a4b2-45e8-91b8-310b1f32b3d5`; live smokes | Done |

## Parsed Tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260617-569 | Audit and harden Hebrew RTL UI labels | Codex | Portals / public site | "Hebrew mode must be real Hebrew with RTL layout. English fallback labels inside Hebrew UI are bugs..." | Hebrew fallback issues are fixed or documented, repeatable audit passes, app-visible task #569 is deployed and closed with proof. | Done |

## Guardrails

- Do not perform email, WhatsApp, Telegram send, social publish, payment charge, DNS write, account grant, credential copy, upload, or external connector writes.
- Provider portal is English-only unless a Hebrew provider portal requirement is explicitly created.
- Brand names, URLs, code values, and user-entered content may remain English/Latin in Hebrew UI.

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260617-204 | Done | Parent Hebrew student-login reset labels are translated and live-smoked. | `public/parent.html`; `scripts/audit-hebrew-rtl-ui-labels.mjs`; `scripts/smoke-hebrew-rtl-ui-labels-live.mjs`; `tests/hebrew-rtl-ui-labels.test.js` | `npm run audit:hebrew-rtl`; `npm run app:smoke:hebrew-rtl`; `npm test` | None |
| REQ-20260617-205 | Done | Student Hebrew login/access/classroom labels are translated and live-smoked. | `public/student.html`; `scripts/audit-hebrew-rtl-ui-labels.mjs`; `scripts/smoke-hebrew-rtl-ui-labels-live.mjs`; `tests/hebrew-rtl-ui-labels.test.js` | `npm run audit:hebrew-rtl`; `npm run app:smoke:hebrew-rtl`; `npm test` | None |
| REQ-20260617-206 | Done | Hebrew signup remains `lang=he`, `dir=rtl`, and Hebrew navigation/form-language first. | `public/signup-he.html`; `scripts/audit-hebrew-rtl-ui-labels.mjs`; `scripts/smoke-hebrew-rtl-ui-labels-live.mjs` | `npm run audit:hebrew-rtl`; `npm run app:smoke:hebrew-rtl`; `npm test` | None |
| REQ-20260617-207 | Done | Public Hebrew navigation covers provider entry labels; provider portal remains explicitly English-only. | `public/js/bna-site-nav.js`; `public/provider.html`; `scripts/audit-hebrew-rtl-ui-labels.mjs`; `scripts/smoke-hebrew-rtl-ui-labels-live.mjs` | `npm run audit:hebrew-rtl`; `npm run app:smoke:hebrew-rtl`; `npm test` | None |
| REQ-20260617-208 | Done | Repeatable audit/test/smoke exists; app-visible changes were deployed, live verified, and closed through the official task API. | `package.json`; `scripts/audit-hebrew-rtl-ui-labels.mjs`; `scripts/smoke-hebrew-rtl-ui-labels-live.mjs`; `tests/hebrew-rtl-ui-labels.test.js` | `npm test` passed 721/721; Railway deployment `36870a9c-a4b2-45e8-91b8-310b1f32b3d5` succeeded; live app smoke `ops/live-smokes/2026-06-17T14-40-47-547Z-live-app-smoke.md`; Hebrew live smoke `ops/live-smokes/2026-06-17T14-42-45-838Z-hebrew-rtl-ui-label-live-smoke.md`; task #569 readback `done` / `history` / `completed` with `proof_status: valid` and `done_link_status: done_with_report`. | None |
