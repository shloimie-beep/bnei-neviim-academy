# Test Results

## Registration/Baseline

- PASS `git fetch origin master --prune`
- PASS `git rev-parse origin/master` -> `b8fb9e6dceb1b4c995108e3510cb3c2f9867a17b`
- PASS `git worktree add -b codex/issue-24-agent-review-hub-20260625 ... origin/master`
- PASS existing configured checkout `npm run railway:doctor`
- PASS existing configured checkout `npm run app:smoke`
- PASS clean worktree `npm run app:smoke:public-privacy`
- PASS clean worktree `npm ci`
- FAIL expected clean worktree `npm run bna:run:status` against predecessor
  Issue #20 due missing generated `ops/live-smokes/` evidence files in the
  committed tree; work remains no. Carried as baseline defect, not Issue #24
  proof.

## REQ-20260625-025 Newest Drive Recording Trace

- PASS `node --check src/lib/bna/newest-drive-recording-trace.js`
- PASS `node --check scripts/trace-newest-drive-recording.cjs`
- PASS `node --test tests/newest-drive-recording-trace.test.js` (4/4)
- PASS `npm run drive:trace-newest-recording -- --out-dir
  ops/class-drive-intake/2026-06-25-issue-24-newest-recording`
- PASS sanitized evidence check: no transcript body phrase and no
  `transcript_text` field in `NEWEST-RECORDING-TRACE.json`.
- PARTIAL production verdict recorded: `content_job:83` matched newest Drive
  recording `drive_file:9f6f75a5d602`; source, queue, transcript, parser,
  class-session, canonical/read-model stages are confirmed; student-name,
  progress, question, profile, and accountability proposal stages are unknown.

## REQ-20260625-026 Secure Agent Review Hub

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/agent-review-hub.js`
- PASS `node --check scripts/generate-agent-review-prompts.cjs`
- PASS `node --test tests/agent-review-hub.test.js` (6/6)
- PASS review-session unit coverage for owner-only context creation,
  short-lived scoped sessions, one-time exchange URL, HttpOnly session cookie,
  review banner, Exit, typed result persistence, and readback shape.
- PASS local browser smoke: owner login, owner-only hub protection,
  9 contexts, 11 prompt links, newest-recording trace status `PARTIAL /
  content_job:83`, clean server-side exchange redirect, cookie-backed reload,
  banner, Exit, no all-access URL, and scoped session metadata.
- PENDING live deployment smoke.

## REQ-20260625-027 Helper Backend/Action/Link Audit

- PASS `node --check src/lib/bna/helper/destination-resolver.js`
- PASS `node --check src/lib/bna/helper/context.js`
- PASS `node --check src/lib/bna/issue24-helper-audit.js`
- PASS `node --check scripts/audit-issue-24-helper-surfaces.cjs`
- PASS `node --test tests/helper-destination-resolver.test.js` (6/6)
- PASS `node --test tests/issue24-helper-audit.test.js` (4/4)
- PASS `npm run issue24:helper-audit`: 9 surfaces, 25 single-turn cases,
  10 multi-turn conversations, 8 roles, 280/280 static resolver evaluations.
- PASS `npm run watchdog:helper-destinations`.
- PASS helper-related coverage in `npm run watchdog:actions` and
  `npm run watchdog:security`.
- PENDING live helper response verification after deployment.

## REQ-20260625-028 Agent Mode Prompt Pack and Result Drop-Off

- PASS prompt pack generated 11 mobile-copyable Agent Mode files plus
  `index.json`.
- PASS `node --test tests/agent-review-hub.test.js` (6/6)
- PASS unit readback proves typed review-result persistence shape.
- PASS local browser result drop-off persisted
  `AGR-b9a823fc37acd01b` through the typed session UI/API and readback.
- PENDING live readback.

## REQ-20260625-029 Navigation IA Duplicate Cleanup

- PASS `node --check src/lib/bna/issue24-navigation-ia.js`
- PASS `node --check scripts/watchdog-navigation-ia-duplicates.cjs`
- PASS `node --test tests/issue24-navigation-ia.test.js tests/operations-task-queue-visibility.test.js tests/one-time-external-user-portal.test.js`
  (42/42)
- PASS `npm run watchdog:navigation-ia`: ok true, findings 0.
- PASS `node scripts/watchdog-visual-baseline.mjs --base-url=http://127.0.0.1:18824`:
  ok true, severity ok, finding_count 0.
- PASS 390px Agent Review Hub screenshot captured all 9 contexts, prompt pack,
  and result form without visible horizontal page overflow.
- PARTIAL separate scripted 390px review-session screenshot attempt timed out
  after the hub capture; session/result behavior remains covered by
  `agent-review-local-smoke.md`.
- PENDING live deployment verification.

## Current Run Validation

- PASS `npm run bna:run:status`: 2 done, 4 needs_verification,
  1 in_progress, work remains yes.
- PASS focused suite:
  `node --test tests/agent-review-hub.test.js tests/helper-destination-resolver.test.js tests/issue24-helper-audit.test.js tests/issue24-navigation-ia.test.js tests/newest-drive-recording-trace.test.js tests/operations-task-queue-visibility.test.js tests/one-time-external-user-portal.test.js`
  (62/62).
- PASS `npm run watchdog:actions`: ok true, finding_count 0.
- PASS `npm run watchdog:helper-destinations`.
- PASS `npm run watchdog:security`: ok true, finding_count 0.
- PASS `npm run secrets:audit`: 4754 tracked paths checked, 0 tracked
  secret-risk files found.
- PASS `npm run watchdog:content`: ok true, finding_count 0.
- PASS `npm run watchdog:communications`: ok true, finding_count 0.
- PASS `npm run bna:run:source-coverage`: 15 source statements mapped,
  0 unmapped executable statements.
- PASS_WITH_BASELINE_FINDINGS `npm run watchdog:raw`: ok true, finding_count
  2, medium severity. Findings are older June 17/18 raw fallback-pointer drift,
  not Issue #24 intake loss.
- PASS `npm run bna:run:stale-evidence`: validation passed, stale evidence
  detection none.
- PASS `npm run bna:run:validate`: validation passed.
- PASS `npm test`: 1345/1345.
- PENDING push/merge/deploy and live smokes.
