# OT-89B TEST-RESULTS

Updated: 2026-07-16T09:32:58+03:00

## Passed

- `node --check src\lib\bna\support\one-time-support-consumer.js`
- `node --check server.js`
- `node --test tests\ot89b-onetime-support-consumer.test.js`
  - 11 tests passed.
- `node --test tests\ot89b-onetime-support-consumer.test.js tests\rabbi-telegram-notifications.test.js tests\one-time-member-support-questions.test.js tests\telegram-runtime-status.test.js`
  - 44 tests passed.
- `node --test tests\telegram-media-routing.test.js`
  - 12 tests passed.
- `node --test tests\watchdog-action-registry.test.js`
  - 5 tests passed.
- `node -e "JSON.parse(...)"` for action registry, route registry, and generated action reports.
- `git diff --check`
  - Exit 0; Git reported LF-to-CRLF working-tree warnings only.

## Full-Suite Result

Command:

```powershell
npm ci --no-audit --no-fund
npm test
```

Result:

- Exit code: 1.
- Tests reported by Node runner: 11 failing tests after dependencies were installed.
- Log path for local debugging: `C:\Users\User\AppData\Local\Temp\ot89b-npm-test-after-ci-20260716-093138.log`.

Residual failures are outside the OT-89B consumer path and are frozen-base UI/source-smoke expectations:

- `Operations auth allows the Integrations module for admin and provider workspaces`
- `Member library and classroom pages expose classroom navigation, six Sedarim, and moderated private replies`
- `One Time Operations maps Rabbi email contacts as a no-send staging section`
- `One Time parent setup page is isolated from Academy parent portal branding`
- `public One Time launch page is indexable, interest-only, and has no checkout call`
- `final local One Time / Rabbi UI QA harness covers scoped routes without external writes`
- `Operations shell falls back scoped Studio/task-only sessions to allowed views`
- `Operations exposes provider, communications, API usage, settings, and disabled placeholders`
- `provider-scoped Operations identities do not receive BNA super-admin navigation capabilities`
- `Operations API Usage remains an honest empty state and does not present the future provider bot as live`
- `Operations Studio browser smoke renders and exercises the local no-send workflow`

## Acceptance Coverage

- Contract hash and HMAC vector preserved.
- Valid signed support event creates exactly one BNA ticket reference.
- Duplicate deliveries require fresh nonces and remain idempotent.
- Event/source collisions reject as non-retryable conflicts.
- Forged signature, stale/future timestamp, invalid key, invalid entitlement, and schema failures reject before storage.
- Raw customer text is inert and redacted in alerts/views.
- Closed triage classes, bug-candidate gate, read-only diagnostics, and SLA behavior are deterministic.
- Mock attachment fetch validates private headers, MIME/size, SHA, and no redirects.
- Status seam returns only the frozen DTO.
- Telegram decision callbacks use opaque single-use tokens and deny wrong identity, replay, and expiry.
- Routes, registries, migration, and protected operator page are covered.
