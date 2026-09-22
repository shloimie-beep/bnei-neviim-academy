# Ramble Intake - 2026-07-07 - Parent And Student Login UI Polish

## Raw Intake

Source raw record:
`raw-input/RAW-20260707-010-parent-student-login-ui-polish.md`

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260707-100 | Compile the parent/student login polish complaint into a bounded Product Quality packet and Agent Mode audit prompts. | RAW-20260707-010 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | product-quality-protocol | P0 | 0 | none | Raw intake, register, and PQC packet exist; prompts name exact routes and drop-off URLs; PQC validation passes. | raw/register/prompt packet | no | Done |
| REQ-20260707-101 | Run/collect Agent Mode audits for student login, parent login, and cross-role entry consistency through Operations drop-off. | RAW-20260707-010 | One Time review routes + Operations | Agent Mode / Codex | ui-audit | P0 | 1 | REQ-20260707-100 | Each Agent Mode report uses the correct drop-off key and reports failures in the drop-off or final answer. | Agent Review results/register | no | Prompts supplied in chat; awaiting reports |
| REQ-20260707-102 | Capture current desktop/mobile visual evidence for parent and student entry UI before code edits. | RAW-20260707-010 | parent/student/member/student portal entry | Codex | visual-audit | P0 | 1 | REQ-20260707-100 | Evidence covers 1440 and 390 widths for `/student.html?review=one-time`, `/student/login`, `/parent/login`, and `/parent.html?review=one-time`; findings use visual defect codes. | audit script/report/screenshots | no | Done |
| REQ-20260707-103 | Implement first scoped parent/student entry UI polish pass. | RAW-20260707-010 | parent/student/member/student portal entry | Codex | ui-implementation | P0 | 2 | REQ-20260707-102 | Buttons, cards, labels, forms, spacing, and mobile wrapping are consistent and professional; no role-scope leakage; no external sends/payments/data mutation. | `public/student.html`, `public/parent.html`, `public/parent-login.html`, shared CSS/helper widget | yes | Done deployed |
| REQ-20260707-104 | Verify and release parent/student login UI polish. | RAW-20260707-010 | BNA production + One Time review routes | Codex | verification-release | P0 | 3 | REQ-20260707-103 | Focused tests pass; screenshot proof exists; route/action/privacy checks pass; commit/push/deploy succeed; live smoke proves current production. | tests/evidence/register/changelog/ledger | yes | Done deployed/live-smoked |

## Product Quality Compiler Gate

- Trigger phrases: `terrible`, `unprofessional`, `not even`, `not spaced out well`, `ridiculous`, `fix up this UI`.
- Compiled standard: parent/student login and entry surfaces must have consistent spacing, equal-height buttons, professional card/form hierarchy, mobile 390px fit, clear role labels, no horizontal overflow, no random admin/debug content, and no parent/student/provider scope leakage.
- Definition of Ready for implementation: current-state desktop/mobile evidence exists, affected files/routes are bounded, no external provider write is required, and the Product Quality packet validates.
- Definition of Done: implementation evidence, focused tests, visual proof, registry/privacy checks where relevant, commit/push, deployment, live smoke, and this register updated.

## Agent Mode Prompt Keys

| Prompt | Prompt key | Drop-off URL |
|---|---|---|
| Student Login / Student Portal UI Audit | `student-login-ui-polish-audit` | `/agent-review-dropoff.html?prompt_key=student-login-ui-polish-audit&context_key=one-time-ui-polish&requirement_id=REQ-STUDENT-LOGIN-UI-POLISH&autosave=1` |
| Parent Login / Parent Portal UI Audit | `parent-login-ui-polish-audit` | `/agent-review-dropoff.html?prompt_key=parent-login-ui-polish-audit&context_key=one-time-ui-polish&requirement_id=REQ-PARENT-LOGIN-UI-POLISH&autosave=1` |
| Cross-Role Login Consistency Audit | `cross-role-login-consistency-audit` | `/agent-review-dropoff.html?prompt_key=cross-role-login-consistency-audit&context_key=one-time-ui-polish&requirement_id=REQ-CROSS-ROLE-LOGIN-CONSISTENCY&autosave=1` |

## Initial Known Risks

- Student and parent entry routes may be using older portal styling that does not match the newer One Time shared-review visual system.
- Mobile 390px may expose uneven card spacing, inconsistent button heights, or cramped form controls.
- Parent/student routes must not expose admin/provider/private cross-student data during visual audit or screenshots.
- There is unrelated dirty work in the repository; this packet must not stage or revert it.

## Final Audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260707-100 | Done | `raw-input/RAW-20260707-010-parent-student-login-ui-polish.md`; `ops/prompt-packets/2026-07-07-parent-student-login-ui-polish/00-parent-student-login-ui-polish.product-quality.json`; Agent Mode prompts supplied in chat. | PASS `npm run pqc:validate -- ops\prompt-packets\2026-07-07-parent-student-login-ui-polish\00-parent-student-login-ui-polish.product-quality.json` | None |
| REQ-20260707-101 | Awaiting external reports | Prompts sent in Codex chat with exact drop-off URLs and failure-reporting rules. | Pending Agent Review drop-off reports. | External Agent Mode audits have not been collected yet. |
| REQ-20260707-102 | Done | Before audit: `ops/ui-audits/2026-07-07-parent-student-login-ui-polish/report.md` and screenshots; 20 screenshots, 22 findings captured. | PASS `node --check scripts\audit-parent-student-login-ui-polish.mjs`; PASS `npm run audit:parent-student-login-ui` before implementation. | None |
| REQ-20260707-103 | Done deployed | Implemented compact mobile topbars, consistent 44px controls, parent/student login copy cleanup, student EN localization repair, helper launcher placement, and One Time review mobile control normalization in `public/student.html`, `public/parent.html`, `public/parent-login.html`, `public/css/bna-app-shell.css`, `public/css/one-time-shared-review.css`, and `public/js/bna-bot-widget.js`. Final local audit: `ops/ui-audits/2026-07-07-parent-student-login-ui-polish-local-after-final-2/report.md`, 20 screenshots, 0 findings. Production live audit: `ops/ui-audits/2026-07-07-parent-student-login-ui-polish-live-after-deploy/report.md`, 20 screenshots, 0 findings. | PASS `npm run audit:parent-student-login-ui -- --base-url=http://127.0.0.1:8080 --out-dir=ops\ui-audits\2026-07-07-parent-student-login-ui-polish-local-after-final-2`; PASS `node --test tests\parent-student-portal-contract.test.js tests\public-route-privacy-contract.test.js tests\one-time-shared-review-branding.test.js`; PASS `npm run watchdog:protocol-drift` with 0 findings; PASS production deployment `810c8ef6-28c9-4599-9b4c-25dd185cd2b6` for commit `eb9e2ee6`; PASS production visual smoke on `https://bneineviimacademy.org`. | None for scoped UI implementation. |
| REQ-20260707-104 | Done deployed/live-smoked | Commit `eb9e2ee6` pushed to `origin/master`; Railway deployment `810c8ef6-28c9-4599-9b4c-25dd185cd2b6` reached SUCCESS; live visual smoke evidence exists at `ops/ui-audits/2026-07-07-parent-student-login-ui-polish-live-after-deploy/report.md`. | PASS focused contract tests, local visual audit, protocol drift watchdog, Railway deployment success, and production visual smoke with 0 findings. | External Agent Mode reports for REQ-20260707-101 remain pending; they are follow-up audit inputs, not blockers for this deployed UI patch. |
