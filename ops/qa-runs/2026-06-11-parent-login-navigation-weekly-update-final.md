# Parent Login / Navigation / Weekly Update / Rabbi Audit - Final

Date: 2026-06-12

## Result

Local implementation and QA are complete. No deploy was run.

## Main Changes

- Parent portal: weekly update first, localized student names, report-problem category, route/language/viewport help context, no visible normal-parent student access/reset buttons, 09:40-10:00 weekly private meeting fallback.
- Student portal: helper copy now says `Ask BNA Helper`.
- Server: problem reports create support tickets without Codex task creation; portal visibility guards hide flagged/bad transcript items; parent payloads include English/Hebrew name fields.
- Operations: decision cards now show visible option cards with Pros, Cons, recommendation, and choose actions.
- Action registry: added `create_report_problem_ticket` and regenerated registry artifacts.
- Rabbi Sheller: intake/audit scaffold added under `ops/provider-intake/rabbi-sheller/`.

## Verification

- PASS syntax checks for touched JS/MJS files.
- PASS focused tests (39/39).
- PASS `npm test` (276/276).
- PASS `npm run screenshot`.
- PASS `npm run app:smoke` against `http://127.0.0.1:8102`.
- PASS `npm run railway:doctor`.
- FAIL `npm run openai:smoke`: invalid local OpenAI key, 401.
- WARN Lighthouse report generated, but CLI exited nonzero on Windows temp cleanup `EPERM`.

## Visual QA

- 19 screenshots captured in `ops/qa-runs/2026-06-11-parent-login-navigation-weekly-update-screenshots/`.
- Index: `ops/qa-runs/2026-06-11-parent-login-navigation-weekly-update-screenshot-index.md`.

## Deployment Gate

Deployment was not run. This workspace is dirty and should not be treated as the clean release/deploy workspace.

## Follow-Up

- Configure a valid OpenAI key locally and rerun `npm run openai:smoke`.
- Use a clean deploy workspace/branch for production.
- Approve live parent/provider send targets before login-link or provider-invitation rollout.
- Implement real provider radius search only after location/geocoder/PostGIS infrastructure is approved.
