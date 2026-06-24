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

Lane integration checks:

- PASS public UI: syntax checks, focused suites 35/35, public UI smoke,
  JSON parse, `git diff --check`, `npm run secrets:audit`
- PASS portal/auth/nav: focused suites 77/77 and 12/12, four browser smokes,
  JSON parse, `git diff --check`, `npm run secrets:audit`
- PASS class/Drive: syntax checks, class suite 86/86, JSON parse,
  `git diff --check`, `npm run secrets:audit`; no backfill apply
- PASS assistant/ramble/usage: focused suite 33/33,
  `npm run owner-review:assistant-runtime`, `npm run watchdog:actions`,
  syntax checks, JSON parse, `git diff --check`, `npm run secrets:audit`
- PASS Stripe sandbox: focused suite 21/21, `npm run stripe:sandbox-smoke`
  status `live_key_blocked` and `external_write_performed=false`, syntax
  checks, JSON parse, `git diff --check`, `npm run secrets:audit`
- PASS Vimeo media: focused suite 19/19,
  `node scripts/vimeo-private-smoke.mjs --json` status `preview_only`,
  syntax checks, JSON parse, `git diff --check`, `npm run secrets:audit`
- PASS operator walkthrough: setup suite 7/7, syntax checks, JSON parse,
  `git diff --check`, `npm run secrets:audit`
