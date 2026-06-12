# Deployment Blockers - 2026-06-11

Deployment is blocked from the original workspace. Deployment has now been
completed from the clean release worktree.

2026-06-12 update: the clean Operations/mobile follow-up was deployed again
from a detached clean worktree at commit `6344863`.

- Railway deployment: `65e96817-8172-4288-a32e-8dd816207eba`
- Production health marker: `2026-06-12-clean-mobile-queue-3ecd6a0`
- Production app smoke:
  `ops/live-smokes/2026-06-12T12-15-04-039Z-live-app-smoke.md`
- Production OpenAI smoke:
  `ops/openai-smokes/2026-06-12T12-16-00-075Z-openai-sidekick-smoke.md`
- Live queue status: 0 active Codex tasks and 0 open support tickets.

## Why

- The original worktree contains 353 dirty git status entries and 1957 individual tracked/untracked classified file entries.
- 1163 entries are unrelated, unknown, or unsafe (D/E/F).
- 100 entries are unsafe tracked deletions/renames and must not be included without manual review.
- 732 generated artifacts are present and should not be deployed accidentally.
- The original branch is `master`; it remains dirty.

## Clean Branch Status

- Clean worktree: `C:\Users\User\bna-release-clean`
- Branch: `release/operations-parent-student-action-registry-2026-06-11`
- Curated patch files: 62
- Clean branch checks before deploy: npm test, screenshot, app smoke, and
  Railway doctor passed.
- Lighthouse generated a report but exited with the known Windows Chrome temp cleanup EPERM.
- Railway production deployment `5a01eea4-345a-428e-a2f2-01e00b208cd5`
  reached `SUCCESS`.
- Production app smoke passed:
  `ops/live-smokes/2026-06-11T16-28-00-888Z-live-app-smoke.md`.
- OpenAI smoke is no longer blocked. It passed after the fresh key was stored
  locally outside chat and Drive smoke secrets were present:
  `ops/openai-smokes/2026-06-12T06-22-48-616Z-openai-sidekick-smoke.md`.

## Safe Release Path

Continue using `C:\Users\User\bna-release-clean` for this release branch. Do not
deploy the original dirty workspace.

## Classification Detail

See `ops/release/2026-06-11-operations-release-cleanup/changed-files-classification.md` and `ops/release/2026-06-11-operations-release-cleanup/classification-summary.json`.
