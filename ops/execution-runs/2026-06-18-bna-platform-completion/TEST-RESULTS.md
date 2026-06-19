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

- DB-backed route smoke for the new `bna_agent_*` tables and APIs.
- Negative scoped-identity API tests.
- Browser smoke for `/operations?view=agents` and
  `/operations/agents/runs/:runKey`.
- Safe demo task/run fixture.
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

Not run for this batch:

- No full `npm test`.
- No Playwright screenshot smoke.
- No production DB write/readback.
- No deployment.
- No external Zoom/Vimeo/Resend/DNS/Stripe write.
