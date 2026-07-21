# One Time Communications Architecture v1 - Test Results

Date: 2026-07-21

## Result

`PASS` - the decision is represented as a One Time connector exception while
BNA School remains first-party. No product runtime, provider, or production
mutation was performed.

## Checks

- PASS direct Intent Preservation validation: 6/6 hard signals covered, 11/11
  actionable spans covered, generated prompt fingerprint valid.
- PASS `node --test tests/one-time-communications-architecture-contract.test.js`:
  7/7 tests.
- PASS `npm run pqc:validate` against current `origin/master` in an isolated
  disposable worktree.
- PASS `npm run pqc:validate:fixtures`: 13/13 fixtures.
- PASS `npm run pqc:evals`: 8/8 evaluations.
- PASS `npm run watchdog:protocol-drift`: `finding_count=0`.
- PASS `npm run bna:run:validate`: existing active run valid; unrelated work
  remains open.
- PASS `npm run secrets:audit`: 9,635 tracked paths, 0 tracked secret-risk
  files.
- PASS `git diff --check`.

## Contract Assertions

- GHL is canonical only for One Time customer communications.
- The One Time app is canonical for product/account state.
- BNA School retains `first_party_bna_operations` and
  `ghl_exception_applies=false`.
- Shloimie is the default inbound owner.
- Rabbi Eli has an exact three-item allowlist and six-item denylist.
- Telegram is non-canonical and AI Torah origination in Rabbi Eli's name is
  forbidden.
- Resend is security-token email only.
- `live_class_question`, `business_conversation`, and `technical_ticket` have
  distinct ownership; technical tickets require source workspace.
- Agent Action examples require save/readback and record zero external
  mutations.

## Mutation Ledger

- Email sends: 0
- Telegram sends: 0
- GHL mutations: 0
- DNS changes: 0
- Credential changes: 0
- Database/production data changes: 0
- Production deployments: 0
