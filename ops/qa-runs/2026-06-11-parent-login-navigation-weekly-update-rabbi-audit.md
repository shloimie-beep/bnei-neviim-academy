# Parent Login, Navigation, Weekly Update, Rabbi Audit

Started: 2026-06-12
Completed local QA: 2026-06-12T13:21:32+03:00

Prompt saved:

- `ops/pro-codex/inbox/2026-06-11-parent-login-navigation-weekly-update-rabbi-audit.md`

Scope:

- Parent portal login readiness and weekly update placement.
- Parent/student portal navigation, helpers, localization, read-only boundaries, and private meeting display.
- Operations navigation, compact task/decision UX, and action registry support.
- Parent signup to login workflow audit.
- Rabbi Sheller intake/audit scaffold.
- Meeting parser audit.
- Local tests, smoke checks, and screenshots.

Running notes:

- Active workspace is `C:\Users\User\BNA v2.0` on `master`.
- Worktree was already heavily dirty before this pass; unrelated changes are being left untouched.
- No deployment is approved for this pass.
- No secrets from chat are being used or persisted.

## Implemented

- Parent weekly update now stays first on the parent home surface and uses localized student display names.
- Parent portal no longer renders normal-parent child access/reset buttons in the visible child title row.
- Parent help has a `Report a problem / suggestion` category. Problem reports create review support tickets and do not automatically create Codex tasks.
- Parent help posts route, language, viewport, category, student id, and message context.
- Student helper copy now says `Ask BNA Helper` instead of rabbi-specific wording.
- Weekly private meeting fallback is Sunday-Thursday, 09:40-10:00, one 20-minute slot before the 10:00 school start.
- Portal visibility guards hide records marked `hide_from_portals` or `portal_hidden`, including the corrected coastal transcript artifact.
- Action registry now includes `create_report_problem_ticket`; generated action-registry artifacts were refreshed.
- Operations decision detail cards now render visible option cards with Pros, Cons, recommendation, and choose actions.
- Rabbi Sheller intake scaffold was added under `ops/provider-intake/rabbi-sheller/`.

## Verification

- PASS `node --check server.js`
- PASS `node --check scripts\telegram-kimi-bridge.mjs`
- PASS `node --check src\lib\actions\registry.js`
- PASS `node --check src\lib\actions\actions\operations.js`
- PASS `node --check scripts\correct-audio-parse-2026-06-08.mjs`
- PASS focused tests: `node --test tests\parent-student-portal-contract.test.js tests\parent-student-polish-contract.test.js tests\action-registry-telegram-ui-bot.test.js` (39/39)
- PASS `npm test` (276/276)
- PASS `npm run screenshot` (no horizontal scroll at 360, 390, 430, 768, 1440)
- PASS `npm run app:smoke` with `BNA_APP_URL=http://127.0.0.1:8102`, `OPS_USERNAME=local`, `OPS_PASSWORD=localpass`
- PASS `npm run railway:doctor`
- FAIL `npm run openai:smoke`: local OpenAI key is invalid; OpenAI returned 401.
- WARN Lighthouse wrote `lighthouse-report.html` for `http://127.0.0.1:8102/`, then exited nonzero on Windows temp cleanup `EPERM`.

Lighthouse extracted scores from the generated report:

- Performance: 64
- Accessibility: 84
- Best Practices: 100
- SEO: 100
- Agentic browsing: 50

## Screenshots

Screenshot folder:

- `ops/qa-runs/2026-06-11-parent-login-navigation-weekly-update-screenshots/`

Index:

- `ops/qa-runs/2026-06-11-parent-login-navigation-weekly-update-screenshot-index.md`

Notes:

- Parent/student screenshots use controlled demo portal payloads so no real parent/student session is exposed.
- Operations navigation/settings/task screenshots use real local authenticated Operations routes.
- The decision-card screenshot uses an unsaved in-page fixture through the real Operations renderer because the live route did not load task data during capture even though `/api/bna/tasks` returned 249 tasks and 18 decision tasks.

## Remaining Blockers

- No deployment was run or approved.
- Current workspace is still dirty and not a clean deploy workspace.
- OpenAI smoke is blocked until a valid local OpenAI key is configured outside chat.
- True provider `near me` radius remains blocked until geocoder/PostGIS or equivalent approved location infrastructure exists.
- Live parent/provider rollout still needs explicit send/deploy approval; this pass did not send login links or provider invitations.
