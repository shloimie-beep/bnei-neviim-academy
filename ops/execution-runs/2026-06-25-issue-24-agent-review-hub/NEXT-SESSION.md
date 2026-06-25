# Next Session

Continue Issue #24 from:

- Worktree:
  `C:\Users\User\Documents\Codex\2026-06-25\issue-24-agent-review-hub`
- Branch: `codex/issue-24-agent-review-hub-20260625`
- Active run: `ops/execution-runs/2026-06-25-issue-24-agent-review-hub/`

Open requirements:

- `REQ-20260625-026`: secure Agent Review Hub and review sessions,
  `needs_verification`.
- `REQ-20260625-027`: helper backend/action/link audit and repairs,
  `needs_verification`.
- `REQ-20260625-028`: Agent Mode prompt pack and typed result drop-off,
  `needs_verification`.
- `REQ-20260625-029`: navigation IA and duplicate-control cleanup,
  `needs_verification`.
- `REQ-20260625-030`: integration, deploy, live verification, and GitHub
  closeout, `in_progress`.

Next command:

`npm run bna:run:next`

Then start the secure Agent Review Hub and make sure it surfaces the
`REQ-20260625-025` trace verdict: newest Drive recording matched content job
`83`, but production processing is `PARTIAL` because student-name/progress/
question/accountability proposal stages are unknown.

Current next practical batch:

1. Push the branch, open/update PR, merge, trigger Railway deployment, and run
   live smokes before marking `REQ-20260625-026` through
   `REQ-20260625-030` Done.
2. Keep the raw-intake watchdog findings separate from Issue #24 unless fixing
   old June 17/18 fallback-pointer drift becomes required by the final gate.
3. Post meaningful progress/final evidence back to Issue #24.

Already completed locally: Agent Review Hub browser/API smoke, result readback
`AGR-b9a823fc37acd01b`, focused 62/62 test suite, helper/action/security/
content/communications/navigation watchdogs, visual watchdog, full `npm test`
1345/1345, source coverage, stale-evidence/run validation, and secrets audit.

Do not run class backfill, Drive move/write, paid retranscription, production
worker retry, student-data mutation, send, charge, DNS, credential/account
change, Buffer publish, or public publishing.
