# Ramble Intake - 2026-06-17 - parent-pwa-tablet-filter-setup

## Raw Intake

| Raw ID | Source | Parse status | Raw storage | Notes |
|---|---|---|---|---|
| RAW-20260617-012 | operations_ui / task #567 | implemented | raw-input/RAW-20260617-012-parent-pwa-tablet-filter-setup.md | Seeded backlog task asks for parent PWA tablet install and filter setup flow verification. |

## Parsed Requirements

| ID | Requirement | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|
| REQ-20260617-209 | Parent PWA manifest stays scoped to parent portal | Parent install uses `/parent-manifest.json`, starts at `/parent?source=parent-pwa`, and does not open Operations. | `public/parent-manifest.json`; `public/parent.html`; `public/sw.js` | Focused tests; targeted live smoke | Done |
| REQ-20260617-210 | Parent setup section has tablet install prompt/fallback | Parent setup UI has an install/open button, captures `beforeinstallprompt`, and falls back to browser install instructions when unsupported. | `public/parent.html` | Focused tests; targeted live smoke | Done |
| REQ-20260617-211 | Parent setup wizard resumes after reload | Parent portal can deep link or restore the setup section instead of dropping parents back into an unrelated view. | `public/parent.html` | Focused tests; targeted live smoke | Done |
| REQ-20260617-212 | Setup code/status handling is scoped and statusful | Parent-submitted setup code/status requires a parent household session, rejects empty submissions, and updates setup status to `submitted` without enabling remote control. | `server.js`; parent setup API | Focused tests; targeted live smoke with mocked parent APIs and anonymous live auth-gate checks | Done |
| REQ-20260617-213 | Phone/tablet smoke and live proof exist | Add focused tests/smoke, run full verification, deploy if public/runtime files change, and close task #567 with evidence. | Tests / scripts / Operations task API | `npm test`; Railway deployment; live smokes; task readback | Done |

## Parsed Tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260617-567 | Verify parent PWA tablet and filter setup flow | Codex | Parent portal / PWA | "Smoke parent portal at phone/tablet widths, install prompt, setup wizard resume, and parent-submitted setup code/status handling." | Parent PWA setup flow is implemented or verified, live-smoked, deployed if changed, and task #567 is closed with proof. | Done |

## Guardrails

- Do not send email, WhatsApp, Telegram, social posts, payments, DNS changes, account grants, credential copies, uploads, or external connector writes.
- Do not mutate real parent/household setup data in live smoke. Live proof may verify static assets and auth gates; stateful setup writes must use contract tests or temporary test data only if safely isolated and cleaned.
- Keep public, parent, and Operations PWA manifest identities separate.

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260617-209 | Done | Parent manifest live readback is scoped to `/parent` and `/parent?source=parent-pwa`; no Operations launch reference. | `public/parent-manifest.json`; `public/parent.html`; `public/sw.js`; `tests/parent-pwa-tablet-filter-setup.test.js`; `scripts/smoke-parent-pwa-tablet-filter-setup-live.mjs` | `node --test tests/parent-pwa-tablet-filter-setup.test.js`; `npm run app:smoke:parent-pwa-setup` | None |
| REQ-20260617-210 | Done | Setup panel includes `data-parent-install-app`, `beforeinstallprompt` capture, and fallback install copy. | `public/parent.html`; `tests/parent-pwa-tablet-filter-setup.test.js`; `scripts/smoke-parent-pwa-tablet-filter-setup-live.mjs` | Focused tests; targeted live smoke at 390px, 820px, 1024px | None |
| REQ-20260617-211 | Done | Setup panel resumes from `?section=setup` and `bna.parent.activeSection` local storage. | `public/parent.html`; `tests/operations-saas-crm-redesign.test.js`; `tests/parent-student-portal-contract.test.js`; `tests/parent-pwa-tablet-filter-setup.test.js` | Focused tests; targeted live smoke confirmed URL/localStorage setup persistence | None |
| REQ-20260617-212 | Done | Setup APIs remain `requireHouseholdContext` scoped, empty submissions reject, submitted code/status moves to `submitted`, and remote control stays false. | `server.js`; `tests/parent-pwa-tablet-filter-setup.test.js`; `scripts/smoke-parent-pwa-tablet-filter-setup-live.mjs` | Focused tests; live anonymous setup API returns 401; mocked parent APIs verify submit behavior without live data mutation | None |
| REQ-20260617-213 | Done | Full verification, deploy, live smokes, and task closeout are complete. | `package.json`; `scripts/smoke-parent-pwa-tablet-filter-setup-live.mjs`; repo closeout files | `npm test` passed 724/724; Railway deployment `f2787527-a42b-4285-817f-7bba15903d1e` succeeded; live app smoke `ops/live-smokes/2026-06-17T14-57-32-156Z-live-app-smoke.md`; parent PWA live smoke `ops/live-smokes/2026-06-17T14-57-31-807Z-parent-pwa-tablet-filter-setup-live-smoke.md`; task #567 readback `done` / `history` / `completed` with valid proof | None |
