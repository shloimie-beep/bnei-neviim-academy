# Evidence

Source/protocol evidence:

- Raw intake:
  `raw-input/RAW-20260712-001-onetime-pr129-completion-followup.md`
- Daily memory capture: `memory/2026-07-12.md`
- Register:
  `tasks-pending/2026-07-12-onetime-p0p1-corrective-completion.md`
- Requirements: `requirements.json`
- Prior run continuation marker:
  `ops/execution-runs/2026-07-11-onetime-p0p1-owner-crm-landing-corrective/run.json`
- Control tower readback:
  `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md`

Git/PR evidence:

- Branch: `codex/onetime-p0p1-corrective-20260711`
- PR #129: https://github.com/shloimie-beep/bnei-neviim-academy/pull/129
- PR head at capture: `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`
- Base/master at capture: `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a`

Implementation evidence will be added as requirements are completed.

REQ-20260712-002 evidence:

- Repeatable focused test script added:
  `npm run test:onetime:focused`
- July 11 run/register stale "push/open PR" language reconciled to existing
  draft PR #129 at head `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`.
- CI workflow publishing is blocked by GitHub credential scope:
  `git push` rejected `.github/workflows/onetime-corrective.yml` because the
  OAuth App lacks `workflow` scope. The workflow file was removed from the
  pushed commit candidate; an authorized maintainer/token must add it.
- Local gate passed:
  `npm run operations:check-generated`,
  `npm run operations:check-canonical`,
  `npm run operations:build` plus generated asset `git diff --exit-code`,
  `npm run test:onetime:focused`, and `npm run secrets:audit`.

REQ-20260712-003 evidence:

- Canonical browser smoke updated:
  `tests/one-time-operations-ui-smoke.test.js`
- The smoke now serves `/operations` from
  `public/operations-bootstrap.html`, records generated asset requests, and
  asserts that raw `public/operations.html` is not served as canonical proof.
- Operations splitter updated:
  `scripts/split-operations-shell.mjs`
- Generated shell rebuilt so shared helper functions required before deferred
  renderer loading are available in `public/js/operations-shell.js`.
- Local gate passed:
  `npm run operations:build`,
  `npm run operations:check-generated`,
  `npm run operations:check-canonical`, and
  `npm run test:onetime:focused` (42/42).

REQ-20260712-012 evidence:

- Addendum raw intake:
  `raw-input/RAW-20260712-002-onetime-signup-reminder-workflow-addendum.md`
- Addendum register:
  `tasks-pending/2026-07-12-onetime-signup-reminder-workflow-addendum.md`
- Daily memory update:
  `memory/2026-07-12.md`
- Machine-readable run now includes `RAW-20260712-002` and
  `REQ-20260712-012` through `REQ-20260712-023`.
- Current priority batch is `direct-signup-page` / `REQ-20260712-013`.

REQ-20260712-004 evidence:

- Server provider-session bridge added:
  `server.js`
- Normal One Time provider login now returns a canonical `/operations` redirect
  for One Time provider accounts, while signed One Time provider sessions can
  satisfy `requireAdmin` only through a project-scoped Operations identity.
- `/provider`, `/provider.html`, and `/provider-dashboard` redirect signed One
  Time provider sessions to canonical `/operations`.
- Browser credential/session proof added:
  `tests/one-time-provider-operations-login.test.js`
- Focused gate passed:
  `node --check server.js`,
  `npm run operations:check-generated`,
  `npm run operations:check-canonical`, and
  `npm run test:onetime:focused` (44/44).
- Targeted internal disabled-state phrases removed from Operations
  source/generated assets:
  `Implementation note`, `persistence endpoint`, `needs persistence`,
  `template persistence`, and `not persisted as a first-class`.

REQ-20260712-013 evidence:

- Required-marker/UI correction raw intake:
  `raw-input/RAW-20260712-003-onetime-signup-required-markers-consent.md`
- Canonical direct signup route added:
  `public/one-time/signup.html` served by `server.js` at `/one-time/signup`
  and `/one-time/signup/`.
- Public Sign Up Now CTAs now route to `/one-time/signup` from
  `public/one-time/index.html`; helper signup actions route there through
  `public/js/bna-bot-widget.js`.
- The signup page includes contact name, Family/School, unambiguous city with
  city/timezone metadata, email, phone required only for WhatsApp/Both
  reminders, required no-preselected reminder choice, red required markers, and
  a clicked acknowledgment checkbox for selected-city class-time use and
  selected reminder consent. The customer-facing form does not say "phone
  optional" or show optional-style phone guidance. The phone required marker
  and "Required for WhatsApp reminders" hint are hidden until WhatsApp/Both is
  selected. It does not ask for student name and does not show Member Login or
  portal actions.
- Route/action/config coverage updated:
  `ops/route-registry.json`, `ops/action-registry.json`, and
  `config/service-provider-sites/one-time.json`.
- Focused browser proof added:
  `tests/one-time-direct-signup-page.test.js` loads the signup route at 1440,
  1024, 768, 430, and 390 widths, checks no horizontal overflow, validates
  red required markers, no preselected reminder choice, hidden phone
  marker/hint before WhatsApp, visible phone marker/hint after WhatsApp,
  submits to `/api/one-time/interest`, and confirms the first-party payload has
  no student field.
- Visual screenshot proof added:
  `ops/evidence/one-time-signup-reminder/2026-07-12/visual-smoke.json` with
  screenshots at 1440, 1024, 768, 430, and 390 widths. The refreshed smoke
  confirms no horizontal overflow, visible form, Back to Home, loaded One Time
  logo, no preselected reminder, visible red required dots, the phone required
  dot hidden until WhatsApp is selected, the acknowledgment checkbox visible,
  no customer-facing optional-phone wording, WhatsApp selection making phone
  required, and no overlapping robot artwork.
- Signup/reminder proof matrix added:
  `ops/evidence/one-time-signup-reminder/2026-07-12/REQUIREMENT-MATRIX.md`.
  It maps each urgent P0 signup/reminder requirement to source files, local
  tests, screenshot evidence, redacted readiness reports, and remaining
  live/provider/operator blockers without claiming terminal Done.
- Local gates passed:
  `node --check server.js`,
  `node --test tests/one-time-direct-signup-page.test.js` (2/2),
  `node --test tests/one-time-direct-signup-page.test.js tests/one-time-signup-reminder-workflow.test.js`
  (12/12),
  `node --test tests/one-time-focused-landing.test.js tests/one-time-signup-reminder-workflow.test.js`
  (12/12),
  `node --test tests/one-time-direct-signup-page.test.js tests/one-time-focused-landing.test.js tests/one-time-product-system.test.js tests/one-time-brand-helper-isolation.test.js tests/one-time-signup-reminder-workflow.test.js`
  (33/33),
  `npm run test:onetime:focused` (57/57),
  `npm run watchdog:actions` (finding_count 0), and
  `npm run watchdog:protocol-drift`, and
  `npm run bna:run:validate` after statuses were corrected to open
  non-terminal deployment-required work.
- Production deploy/live proof is not claimed. It remains gated by
  `REQ-20260712-011` and `REQ-20260712-022`.

REQ-20260712-010 / REQ-20260712-023 matrix evidence:

- The urgent signup/reminder slice now has a requirement-by-requirement matrix:
  `ops/evidence/one-time-signup-reminder/2026-07-12/REQUIREMENT-MATRIX.md`.
- The matrix covers Family/School, direct route/Back to Home, responsive
  signup screenshots, internal-copy removal, city/timezone/DST behavior,
  worldwide instant, local display, phone gating, no-reminder confirmation,
  explicit consent, CRM/outbox/idempotency, paused/canceled class suppression,
  unsubscribe/STOP/wrong-number suppression, missing/changed class-link
  handling, Rabbi Telegram, WAPI readiness, local-class preview/activation
  gate, no portal/payment/access paths, cross-workspace isolation, `.invalid`
  no-send tests, and operator-test blockers.
- `tests/one-time-signup-reminder-workflow.test.js` now explicitly asserts the
  dedicated reminder path contains `ONE_TIME_CLASS_ACTIVE`,
  `class_paused_or_canceled`, `oneTimeReminderSuppressionReason`,
  `email_unsubscribed`, `whatsapp_stop`, and `wrong_number` guardrails.
- The broader older REQ-20260712-010 screenshot/matrix requirement remains
  in progress, because landing, Family/School continuation, provider login,
  Operations, CRM, mailbox, and Robot live/deployed screenshots are not all
  complete in this urgent signup/reminder slice.

REQ-20260712-005 evidence:

- First-party CRM DTO enriched:
  `src/lib/bna/crm-contact-model.js` now maps contact, lead,
  family/school classification, membership/access, mailbox, support,
  follow-up task, class/trial/access, and timeline context into one scoped
  contact card.
- CRM API implementation updated:
  `server.js` list/timeline/PATCH routes now read/write first-party BNA rows,
  include follow-up task rows in the timeline, use allowed local
  `bna_contact_communications.source = 'dashboard'`, create scoped local
  `bna_tasks` follow-ups, and keep no-send/no-checkout/no-access/no-import
  guard flags.
- Operations UI updated:
  `public/operations.html`, `public/js/operations-shell.js`, and
  `public/js/operations-deferred-renderers.js` expose editable name/email/
  phone/lifecycle/follow-up/owner/tags/note fields, detail context for local
  access/mailbox/support/follow-up data, and a targeted Rabbi / One Time
  mailbox filter that can be cleared.
- Local browser/API responsive proof:
  `npm run one-time:smoke:operations-crm-workbench-local` PASS with report
  `ops/evidence/one-time-crm-journey/2026-07-12/report.md` and screenshots at
  1440, 1024, 768, 430, and 390.
- Required real local/test DB proof is blocked, not claimed:
  `scripts/smoke-onetime-crm-journey-local-db.mjs` was added and run; it wrote
  `ops/evidence/one-time-crm-journey-local-db/2026-07-12T06-54-16-286Z-report.md`
  with blocker `BNA_ONETIME_CRM_TEST_DATABASE_URL` missing.

REQ-20260712-008 evidence:

- Added canonical ramble-to-done service:
  `src/platform/ingestion/operator-ramble-service.js` exposes
  `ingestOperatorRamble()` plus compatibility graph helpers. It emits source
  statements with offsets/hashes/classification, stable requirement/job
  projections, receipts, worker-health truth, status propagation, and
  `codex_done` migration/rejection.
- Operations intake API uses the service:
  `server.js` now attaches compact `ramble_to_done` receipts/status to
  `/api/bna/intake/parse` results and parse-run metadata while preserving the
  existing raw-intake/parse-run persistence path.
- ChatGPT/Codex dropoff uses the service:
  `scripts/chatgpt-dropoff-ingestor.mjs` now validates legacy `codex_done`
  through the canonical lifecycle and adds a compact canonical-ingestion
  receipt to queued Codex task payloads.
- Telegram coverage remains through the canonical app API:
  `scripts/telegram-kimi-bridge.mjs` already posts both `telegram_ramble` and
  `telegram_scoped_task` inputs to `/api/bna/intake/parse`, which now runs the
  shared service.
- Corrected stale duplicate task ID evidence:
  `ops/chatgpt-ramble-dropoff/incoming/onetime-launch-priority-ui-crm-automation-20260710-001/status.json`
  no longer claims `task_ids_created: ["1945"]`; the status now records that
  task `#1945` belongs to
  `onetime-agent-prompt-series-20260706-911`.
- Regenerated dropoff coordination:
  `npm run chatgpt:dropoff:tower` PASS and rewrote
  `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md` /
  `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.json`.
- Verification:
  `node --check src/platform/ingestion/operator-ramble-service.js`,
  `node --check server.js`, and
  `node --check scripts/chatgpt-dropoff-ingestor.mjs` PASS;
  `node --test tests/ingestion/*.test.js tests/chatgpt-dropoff-ingestor.test.js tests/telegram-ramble-routing-regression.test.js tests/ramble-protocol-hardening.test.js tests/watchdog-raw-intake-drift.test.js tests/one-time-intake-api-readback.test.js`
  PASS 56/56;
  focused REQ-008 rerun PASS 15/15;
  `npm run test:onetime:focused` PASS 54/54;
  `npm run watchdog:raw` PASS finding_count 0;
  `npm run watchdog:actions` PASS finding_count 0;
  `npm run watchdog:protocol-drift` PASS;
  `npm run secrets:audit` PASS;
  `npm run bna:run:validate` PASS.

REQ-20260712-008 / REQ-20260712-009 final local regression pass:

- Shared packet-status contract added:
  `src/platform/ingestion/packet-status.js`.
- ChatGPT dropoff ingestor and control tower now normalize packet states
  through the shared contract:
  `scripts/chatgpt-dropoff-ingestor.mjs`,
  `scripts/chatgpt-dropoff-control-tower.mjs`, and
  `tests/chatgpt-dropoff-control-tower.test.js`.
- Operations worker-health wording now reports queued work without heartbeat as
  `Stored; worker offline`, and the generated shell assets were rebuilt:
  `public/operations.html`, `public/js/operations-shell.js`, and
  `public/js/operations-deferred-renderers.js`.
- Mandatory regression coverage added/confirmed in
  `tests/ingestion/operator-ramble-service.test.js`,
  `tests/ingestion/ramble-regression-suite.test.js`,
  `tests/chatgpt-dropoff-ingestor.test.js`,
  `tests/chatgpt-dropoff-control-tower.test.js`, and
  `tests/one-time-intake-api-readback.test.js`.
- Current local verification passed:
  `node --check` for the service, packet contract, server, ingestor, and
  control tower;
  `node --test tests/ingestion/operator-ramble-service.test.js` PASS 6/6;
  `node --test tests/ingestion/ramble-regression-suite.test.js` PASS 4/4;
  `node --test tests/ingestion/ramble-regression-suite.test.js tests/ingestion/operator-ramble-service.test.js tests/ingestion/w3-intake-service.test.js tests/ingestion/w3-parser-queue.test.js tests/ingestion/w3-intake-persistence.test.js tests/chatgpt-dropoff-ingestor.test.js tests/chatgpt-dropoff-control-tower.test.js tests/one-time-intake-api-readback.test.js tests/watchdog-raw-intake-drift.test.js`
  PASS 41/41;
  `node --test tests/chatgpt-dropoff-ingestor.test.js tests/chatgpt-dropoff-control-tower.test.js tests/one-time-intake-api-readback.test.js`
  PASS 12/12;
  `npm run operations:build`, `npm run operations:check-generated`,
  `npm run operations:check-canonical`, `npm run test:onetime:focused` PASS
  54/54, `npm run watchdog:raw` PASS finding_count 0,
  `npm run watchdog:actions` PASS finding_count 0,
  `npm run watchdog:protocol-drift`, `npm run secrets:audit`, and
  `npm run bna:run:validate`.
- Terminal Done is not claimed for REQ-008 or REQ-009. Both remain
  release/live-smoke gated under `REQ-20260712-011`.

REQ-20260712-007 local landing / Robot proof:

- `public/one-time/index.html` now removes the unverified teaching carousel and
  public placeholder asset instructions, uses the required landing hierarchy,
  and keeps the sole prominent signup CTA as `Sign Up Now`.
- `config/service-provider-sites/one-time.json` now sets
  `assets.teaching_gallery` to `[]`; `ops/action-registry.json` marks the old
  teaching-carousel actions `hidden_until_verified_assets`.
- `public/assets/one-time/robot/robot-scheller-whatsapp.png` was optimized from
  1,681,110 bytes to 403,234 bytes without resizing its 1254x1254 bounds.
- `public/js/bna-bot-widget.js` renders the One Time public Robot launcher at
  84x84 on desktop/tablet and 76x76 on mobile, using the contained Robot PNG
  and accessible label `Open Rabbi Scheller’s WhatsApp assistant.`.
- Local browser proof used the real Express `/one-time` route in
  `ONE_TIME_REVIEW_ONLY_NO_DB=1` mode; no production DB, deploy, external send,
  payment, access grant, provider mutation, or production-data mutation was
  performed.
- Screenshots were captured and force-added under
  `ops/execution-runs/2026-07-12-onetime-p0p1-corrective-completion/screenshots/landing-20260712-local/`:
  `landing-1440.png`, `landing-768.png`, `landing-430.png`,
  `landing-390.png`, plus `robot-launcher-1440.png`,
  `robot-launcher-768.png`, `robot-launcher-430.png`, and
  `robot-launcher-390.png`.
- Verification passed: `node --test tests/one-time-focused-landing.test.js`
  2/2, `npm run test:onetime:focused` 57/57, `npm run operations:build`,
  `npm run operations:check-generated`, `npm run operations:check-canonical`,
  `npm run watchdog:actions`, `npm run watchdog:protocol-drift`,
  `npm run secrets:audit`, `npm run bna:run:validate`, and Playwright local
  route screenshot proof at 1440, 768, 430, and 390 widths with no console
  warnings.
- Terminal Done is not claimed. REQ-20260712-007 remains blocked on release
  authorization, deployment of the exact PR #129 SHA, and live-smoke proof.
