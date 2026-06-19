# Test Results

Verified on 2026-06-18:

- PASS `node --check scripts/bna-execution-run.mjs`.
- PASS `node --test tests/bna-execution-run.test.js` 7/7.
- PASS `npm test` 778/778.
- PASS `npm run bna:run:validate`; active run has 11 blocked requirements,
  work remains, and validation passed.

Verified on 2026-06-19:

- PASS `node --check server.js`.
- PASS `node --check src/lib/bna/agent-control.js`.
- PASS inline Operations script syntax check by extracting the app script from
  `public/operations.html` and compiling it with `new Function`.
- PASS `node --test tests/agent-control-center.test.js` 5/5.
- PASS JSON validation for `ops/action-registry.json`,
  `ops/execution-runs/2026-06-18-bna-platform-completion/requirements.json`,
  and all `ops/agent-task-ledger.jsonl` rows.
- PASS `npm run bna:run:validate`; active run has 11 blocked,
  7 needs-verification, 3 in-progress, 1 not-started, and 1 done requirement.

Still required before local completion:

- Manual Agent Mode smoke using the generated prompt.
- Full-suite regression after DB/API/browser smoke changes.

Verified on 2026-06-19 for One Time ramble/agent/integrations follow-up:

- PASS `node --check server.js`.
- PASS `node --check src/lib/bna/one-time-drive-brief.js`.
- PASS Operations inline script syntax check by extracting inline scripts from
  `public/operations.html` and compiling them with `new Function`.
- PASS JSON validation for `ops/action-registry.json`,
  `ops/route-registry.json`,
  `ops/execution-runs/2026-06-18-bna-platform-completion/requirements.json`,
  and `ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json`.
- PASS focused suite 49/49:
  `node --test tests/one-time-drive-brief-ingestion.test.js
  tests/one-time-external-user-portal.test.js
  tests/one-time-meeting-drops.test.js
  tests/int05-integrations-closeout.test.js`.
- PASS `npm run bna:run:validate`; status counts after registration:
  `not_started: 1`, `in_progress: 17`, `needs_verification: 9`,
  `blocked: 2`, `done: 2`.

Verified on 2026-06-19 for canonical future intake hardening continuation:

- PASS `node --check src/lib/bna/intake-parser.js`.
- PASS `node --check src/lib/bna/intake-schema.js`.
- PASS `node --check src/lib/bna/ramble-protocol.js`.
- PASS `node --check src/lib/bna/goal-registry.js`.
- PASS `node --check src/lib/bna/goal-memory.js`.
- PASS focused parser/routing suite 37/37:
  `node --test tests/one-time-intake-scope-hardening.test.js
  tests/one-time-drive-brief-ingestion.test.js
  tests/intake-parser-class-recording.test.js
  tests/intake-parser-communications.test.js
  tests/intake-parser-goals.test.js
  tests/intake-parser-student-questions.test.js
  tests/intake-parser.test.js tests/telegram-ramble-routing-regression.test.js`.
- PASS `git diff --cached --check`.
- PASS staged secret-word scan; only harmless evidence/stable-ID literals
  matched.

Verified on 2026-06-19 for ambiguous workspace and One Time RBAC continuation:

- PASS baseline command from `NEXT-SESSION.md` 26/26:
  `node --test tests/one-time-intake-scope-hardening.test.js
  tests/intake-parser.test.js tests/telegram-ramble-routing-regression.test.js`.
- PASS focused ambiguity/RBAC/helper suite 21/21:
  `node --test tests/one-time-rbac-negative-isolation.test.js
  tests/one-time-drive-brief-ingestion.test.js
  tests/intake-parser-workspace-ambiguity.test.js
  tests/one-time-intake-scope-hardening.test.js tests/bna-helper-tools.test.js`.

Verified on 2026-06-19 for local raw/API readback and scoped One Time auth:

- PASS `node --check server.js`.
- PASS `node --check tests/one-time-intake-api-readback.test.js`.
- PASS focused One Time intake/API/RBAC suite 14/14:
  `node --test tests/one-time-intake-api-readback.test.js
  tests/one-time-rbac-negative-isolation.test.js
  tests/intake-parser-workspace-ambiguity.test.js
  tests/one-time-drive-brief-ingestion.test.js
  tests/one-time-intake-scope-hardening.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `not_started: 1`, `in_progress: 14`,
  `needs_verification: 8`, `blocked: 2`, `done: 6`.

Not run for this batch:

- No full `npm test`.
- No Playwright screenshot smoke.
- No production DB write/readback.
- No deployment.
- No external Zoom/Vimeo/Resend/DNS/Stripe write.

Verified on 2026-06-19 for One Time Operations UI/browser smoke:

- PASS `node --check server.js`.
- PASS `node --check tests/one-time-operations-ui-smoke.test.js`.
- PASS `node --test tests/one-time-operations-ui-smoke.test.js` 1/1.
- PASS focused One Time UI/RBAC/regression suite 55/55:
  `node --test tests/one-time-operations-ui-smoke.test.js
  tests/operations-module-scoping.test.js
  tests/one-time-external-user-portal.test.js
  tests/one-time-rbac-negative-isolation.test.js
  tests/one-time-drive-brief-ingestion.test.js
  tests/one-time-intake-api-readback.test.js tests/one-time-meeting-drops.test.js`.
- PASS local Playwright screenshots and report:
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md`.

Not run for this batch:

- No broad UI crawl or audit harness rebuild.
- No production DB write/readback.
- No deployment.
- No external Zoom/Vimeo/Resend/DNS/Stripe/Drive/Telegram write.

Verified on 2026-06-19 for Agent Control DB/API readback:

- PASS `node --check server.js`.
- PASS `node --check tests/agent-control-api-readback.test.js`.
- PASS `node --test tests/agent-control-api-readback.test.js` 2/2.
- PASS focused Agent Control suite 7/7:
  `node --test tests/agent-control-center.test.js
  tests/agent-control-api-readback.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `not_started: 1`, `in_progress: 14`,
  `needs_verification: 7`, `blocked: 2`, `done: 7`.
- The API smoke used fake Express and in-memory Postgres only. It verified a
  safe demo task run lifecycle: create run, claim, progress, evidence attach,
  blocked submit, blocked seal, task comment/activity updates, one linked
  operator Decision, and scoped non-Super Admin denial before writes.

Not run for this batch:

- No Super Admin browser screenshot smoke yet.
- No manual Agent Mode/browser-judgment smoke yet.
- No full `npm test`.
- No production DB write/readback.
- No deployment.
- No external account, Drive, Telegram, Zoom, Vimeo, Resend, DNS, payment, or
  social write.

Verified on 2026-06-19 for PWA public-vs-Operations separation:

- PASS `node --check tests/pwa-separation-contract.test.js`.
- PASS `node --test tests/pwa-separation-contract.test.js` 3/3.
- PASS adjacent local PWA suite 17/17:
  `node --test tests/pwa-separation-contract.test.js
  tests/operations-pwa-login.test.js
  tests/parent-pwa-tablet-filter-setup.test.js`.
- Formal run evidence for this commit uses only
  `tests/pwa-separation-contract.test.js`; the adjacent broader test files
  passed locally but remain part of the pre-existing dirty worktree.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `in_progress: 13`, `needs_verification: 9`, `blocked: 2`,
  `done: 7`.

Not run for this batch:

- No browser screenshot crawl.
- No production DB write/readback.
- No deployment.
- No external account, Drive, Telegram, Zoom, Vimeo, Resend, DNS, payment, or
  social write.

Verified on 2026-06-19 for module scoping:

- PASS `node --check tests/operations-module-scoping.test.js`.
- PASS focused module/RBAC suite 9/9:
  `node --test tests/operations-module-scoping.test.js
  tests/one-time-rbac-negative-isolation.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `in_progress: 12`, `needs_verification: 9`, `blocked: 2`,
  `done: 8`.
- The test proves selected workspace/project filters across Community, Content,
  Live Classes, communications, integrations, automations, admin data,
  social/email drafts, and DNS tasks, plus One Time scoped helper/action
  denial for cross-project, cross-workspace, and secret-bearing tools.

Not run for this batch:

- No browser screenshot crawl.
- No production DB write/readback.
- No deployment.
- No external account, Drive, Telegram, Zoom, Vimeo, Resend, DNS, payment, or
  social write.

Verified on 2026-06-19 for workspace/RBAC:

- PASS `node --check tests/workspace-rbac-negative-isolation.test.js`.
- PASS focused workspace/RBAC suite 15/15:
  `node --test tests/workspace-rbac-negative-isolation.test.js
  tests/workspace-person-household-provider-contract.test.js
  tests/one-time-rbac-negative-isolation.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `in_progress: 11`, `needs_verification: 9`, `blocked: 2`,
  `done: 9`.
- The suite proves canonical workspace schema/directory expectations,
  membership-scoped workspace switcher behavior, student/content route
  ownership guards, public/parent/provider portal separation, and negative
  provider/parent/student/One Time helper isolation.

Not run for this batch:

- No browser screenshot crawl.
- No production DB write/readback.
- No deployment.
- No external account, Drive, Telegram, Zoom, Vimeo, Resend, DNS, payment, or
  social write.

Verified on 2026-06-19 for Agent Control notification/audit-history hooks:

- PASS `node --check server.js`.
- PASS `node --check tests/agent-control-api-readback.test.js`.
- PASS focused Agent Control notification/API suite 7/7:
  `node --test tests/agent-control-center.test.js
  tests/agent-control-api-readback.test.js`.
- PASS focused Agent Control suite 8/8:
  `node --test tests/agent-control-center.test.js
  tests/agent-control-api-readback.test.js
  tests/agent-control-browser-smoke.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `in_progress: 14`, `needs_verification: 8`, `blocked: 2`,
  `done: 7`.
- The API smoke verifies ready and blocked Agent Run notifications are private
  in-app rows only, progress updates do not create notification spam,
  notifications preserve `no_send: true`, and no external write flags are set.

Not run for this batch:

- No manual Agent Mode/browser-judgment smoke yet.
- No production DB write/readback.
- No deployment.
- No external account, Drive, Telegram, Zoom, Vimeo, Resend, DNS, payment, or
  social write.

Verified on 2026-06-19 for Agent Control browser smoke:

- PASS `node --check tests/agent-control-browser-smoke.test.js`.
- PASS `node --test tests/agent-control-browser-smoke.test.js` 1/1.
- PASS focused Agent Control suite 8/8:
  `node --test tests/agent-control-center.test.js
  tests/agent-control-api-readback.test.js
  tests/agent-control-browser-smoke.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `in_progress: 15`, `needs_verification: 7`, `blocked: 2`,
  `done: 7`.
- PASS local Playwright screenshots/report:
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.md`.
- Viewports covered: 1440x900, 768x1024, 390x844, and 360x800.
- The browser smoke used fake local Agent Control API payloads only and proved
  no horizontal overflow, no console/page errors, rendered Agent Control list,
  rendered Agent Run portal, prompt text without secrets, evidence controls,
  Submit / Seal controls, Blocker / Operator Decision controls, and handoff
  buttons.

Not run for this batch:

- No broad UI crawl or audit harness rebuild.
- No manual Agent Mode/browser-judgment smoke yet.
- No production DB write/readback.
- No deployment.
- No external account, Drive, Telegram, Zoom, Vimeo, Resend, DNS, payment, or
  social write.
