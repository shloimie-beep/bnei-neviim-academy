# Status

Run created and active.

- `REQ-20260712-001` is verified: July 12 raw prompt, Robot correction context,
  register, run files, and latest pointer have been created.
- `REQ-20260712-002` needs operator decision for CI workflow publishing: PR
  truth has been confirmed, stale July 11 "push/open PR" claims were corrected,
  and the local focused test script/gates pass. The GitHub Actions workflow
  file cannot be pushed with the current OAuth token because it lacks
  `workflow` scope.
- `REQ-20260712-003` is verified locally: the canonical browser smoke now
  serves `public/operations-bootstrap.html` plus generated CSS/IA/shell/deferred
  JS and explicitly rejects raw `public/operations.html` as proof.
- `REQ-20260712-004` is verified locally: normal One Time provider credentials
  now establish a scoped provider session that lands on canonical `/operations`,
  provider aliases redirect away from the old dashboard, and targeted internal
  disabled-state copy was removed from the normal shell.
- `REQ-20260712-012` is verified: the urgent signup/reminder workflow addendum
  has been captured and attached to this active run.
- `REQ-20260712-013` needs operator decision for deployment/live verification:
  canonical
  `/one-time/signup` is locally implemented, all public Sign Up Now actions use
  it, route/action registries are current, and responsive browser proof passes.
- `REQ-20260712-014`, `REQ-20260712-020`, and `REQ-20260712-021` also need
  operator decision for deployment/live verification after local implementation.
- `REQ-20260712-015` through `REQ-20260712-019` and `REQ-20260712-023` are in
  progress: local CRM/outbox/reminder/WhatsApp/Telegram/test-matrix pieces are
  implemented, but hosted delivery/readiness/provider evidence remains open.
- `REQ-20260712-005` is blocked only on real local/test Postgres proof: the
  first-party CRM DTO/API/UI implementation, focused tests, responsive
  browser/API smoke, cross-workspace denial, and targeted mailbox proof are
  local-pass, but the required real persistence journey cannot run until
  `BNA_ONETIME_CRM_TEST_DATABASE_URL` is provided.
- `REQ-20260712-006` is locally implemented but blocked on terminal proof:
  direct signup now stores exact product/CRM IDs and attribution, continuation
  validates those IDs plus Family/School required fields, and the server
  verifies the product lead and CRM lead match the original One Time capture
  before local writes. Real local/test DB persistence still needs
  `BNA_ONETIME_CRM_TEST_DATABASE_URL`, and live proof still needs release
  authorization.
- `REQ-20260712-008` needs operator decision for release/live proof but is
  verified locally: canonical ramble-to-done service,
  Operations API receipts, ChatGPT dropoff canonical preview, `codex_done`
  migration/rejection, worker-offline truth, duplicate task `#1945` packet
  correction, and control-tower regeneration all pass local tests/watchdogs.
- `REQ-20260712-009` needs operator decision for release/live proof but is
  verified locally: mandatory ramble-to-done regressions now cover adapter
  recognition, source offsets/hashes, no-lost mapping, exact execution IDs,
  blocked-decision independence, failed verification staying open, UI
  release/live gating, intake API readback, packet-status migration/rejection,
  and worker-offline truth.
- `REQ-20260712-007` and `REQ-20260712-010` remain open; `REQ-20260712-006`
  remains blocked only for the real persistence/live proof gates above.
- `REQ-20260712-022` is blocked on release authorization and the operator's
  personal deployed end-to-end test.
- `REQ-20260712-011` is blocked on explicit release authorization.
- Current safe local pointer: run `npm run bna:run:next`; `REQ-20260712-005`
  remains blocked on a local/test DB URL, and deploy/operator-test items remain
  release-gated.

Current PR:
https://github.com/shloimie-beep/bnei-neviim-academy/pull/129

No production deploy or external mutation has been performed in this
continuation run.
