# RAW-20260705-003 - Operations Login Blinking Glitch

- source_channel: codex_chat
- created_at: 2026-07-05T15:05:00+03:00
- parse_status: implemented
- workspace_key: bna
- project_key: operations
- privacy: internal_bug_report
- created_requirement_ids: REQ-20260705-007

## Raw Operator Text

Can you fix the glitch? There's like, the screen is like blinking and glitching and not letting me log in. Can you fix that?

## Source Metadata

- Screenshot supplied in Codex chat:
  `C:/Users/User/AppData/Local/Temp/codex-clipboard-6fc00946-ef84-46ce-97c3-d1693ad79300.png`
- Visible URL: `https://bneineviimacademy.org/operations-login.html?returnTo=%2Foperations`
- Visible surface: BNA Operations login

## Parsed Requirement

### REQ-20260705-007 - Stop Operations login blink/redirect loop

- owner: Codex
- category: app_bug
- status: Done
- affected_routes:
  - `/operations-login.html`
  - `/operations`
  - `/api/bna/auth/me`
  - `/api/operations/login`
- expected_result:
  - Operations login stays visually stable while credentials are entered.
  - Non-Operations parent/provider/student sessions must not auto-redirect the Operations login page into `/operations`.
  - The unauthenticated Operations login page must not load the full helper widget before sign-in.
- verification:
  - Focused login/auth tests.
  - Browser smoke for login page stability.
- guardrails:
  - Do not print or store passwords.
  - Do not mutate production data.
  - Do not send email, WhatsApp, Telegram, payments, access grants, DNS, or credential changes.

## Implementation Evidence

- Changed `public/operations-login.html` so the initial `/api/bna/auth/me`
  check only redirects when the current session role is an Operations role:
  `super_admin`, `project_owner`, or `project_manager`.
- Removed the unauthenticated login page's helper-widget script include so the
  full BNA Helper dock and viewport handlers do not load before sign-in.
- Added focused regression checks in `tests/operations-pwa-login.test.js`.

## Verification

- PASS `node --test tests/operations-pwa-login.test.js tests/portal-agnostic-auth-contract.test.js tests/portal-operations-login-fallback.test.js tests/universal-assistant-contract.test.js`
  - 33/33 tests passed.
- PASS Playwright local browser smoke with `/api/bna/auth/me` mocked as an
  authenticated parent session:
  - stayed on `/operations-login.html?returnTo=%2Foperations`;
  - preserved typed username `shloimie`;
  - did not request `/js/bna-bot-widget.js`;
  - found zero helper launcher/panel nodes.
- Screenshot evidence:
  `ops/playwright-smokes/2026-07-05-operations-login-glitch/local-parent-session-login-stable.png`

## Deploy And Live Verification

- PR #92 merged to `master` at merge commit
  `9327068b85f709b1bf0827f03d71d5a5521d2c79`.
- PASS approved deploy gate with explicit BNA target and approved optional
  provider/readback deferrals; no secret values printed.
- PASS `npm run railway:doctor` against BNA Railway project
  `skillful-motivation`, production service `skillful-motivation`.
- PASS `npm run railway:redeploy`; Railway deployment
  `e45e6ca7-5282-4ff2-939c-0d9e4b6ba54e` reached `SUCCESS`.
- PASS live HTML readback for
  `https://bneineviimacademy.org/operations-login.html?returnTo=%2Foperations`:
  role-gated `isOperationsSession` check present, old
  `data.authenticated === true || data.success === true` redirect condition
  absent, and `/js/bna-bot-widget.js` absent.
- PASS live Playwright smoke with `/api/bna/auth/me` mocked as an authenticated
  parent session:
  - stayed on `/operations-login.html?returnTo=%2Foperations`;
  - preserved typed username `shloimie`;
  - did not request `/js/bna-bot-widget.js`;
  - found zero helper launcher/panel nodes;
  - recorded one main-frame navigation.
- Live screenshot evidence:
  `ops/playwright-smokes/2026-07-05-operations-login-glitch/live-parent-session-login-stable.png`

## Remaining Closeout

- None for this reported login glitch. Optional provider/readback gates unrelated
  to this login page remain deferred and are not claimed complete.
