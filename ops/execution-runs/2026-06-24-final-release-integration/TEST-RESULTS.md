# Test Results

Preflight commands on 2026-06-24:

- PASS `git fetch --all --prune`
- PASS remote lane RESULT inspection for all seven lane branches
- PASS `npm run bna:run:status` on the clean-slate control run
- PASS `npm run bna:run:validate` on the clean-slate control run
- PASS `npm run bna:run:next` on the clean-slate control run
- PASS `npm run bna:run:blockers` on the clean-slate control run

- PASS `npm run bna:run:validate` on the final-release run
- PASS `npm run bna:run:status` on the final-release run
- PASS `npm run bna:run:next` selected `REQ-20260624-020`
- PASS `npm run bna:run:blockers` lists only `REQ-20260624-028`
- PASS JSON/JSONL parse for final-release run files and ledger
- PASS `git diff --check`
- PASS `npm run secrets:audit`

Release base sync commands:

- PASS `git fetch --all --prune`
- PASS `git status --short --branch` clean on
  `codex/clean-slate-integration-20260624`
- PASS `git merge-base HEAD origin/master` equals `origin/master`
- PASS `git rev-list --left-right --count HEAD...origin/master` returned
  `89 0`; no `origin/master` commits are missing from the release branch
