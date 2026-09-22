# Test Results

Updated: 2026-06-24T20:41:31+03:00

## Completed Before Final Patch

| Command | SHA | Timestamp | Result |
|---|---|---|---|
| `npm run railway:doctor` | `116fea3339a922b045857f7ece8cc9a64e7cda64` | 2026-06-24T17:25+03:00 | PASS; Railway deployment `c0aafbc5-a6fa-42ca-828e-38ac8ee02cc7` success |
| `npm run app:smoke` | `116fea3339a922b045857f7ece8cc9a64e7cda64` | 2026-06-24T17:25:03Z report | PASS; `ops/live-smokes/2026-06-24T17-25-03-642Z-live-app-smoke.md` |
| `npm run app:smoke:public-privacy` | `116fea3339a922b045857f7ece8cc9a64e7cda64` | 2026-06-24T17:25:11Z report | PASS; `ops/live-smokes/2026-06-24T17-25-11-405Z-public-route-privacy-smoke.md` |
| `npm run secrets:audit` | `116fea3339a922b045857f7ece8cc9a64e7cda64` | 2026-06-24T17:27+03:00 | PASS; 0 tracked secret-risk files |
| `npm run watchdog:raw` | `116fea3339a922b045857f7ece8cc9a64e7cda64` | 2026-06-24T17:27+03:00 | PASS; report `ops/watchdog-audits/2026-06-24T17-27-raw-intake-drift.md`, 2 historical medium fallback findings |
| `railway run node scripts/task-decision-census.mjs --json` | local branch before acceptance commit | 2026-06-24T17:34:13Z report | PASS after query fix; workspace isolation passed |
| `railway run node scripts/task-decision-production-cleanup.mjs --limit=1000 --apply` | local branch before acceptance commit | 2026-06-24T17:34+03:00 | PASS; applied 3 reversible One Time scope reclassifications |
| `railway run node scripts/task-queue-reconciler.mjs` | local branch before acceptance commit | 2026-06-24T17:35:53Z report | PASS; active machine tasks 0; no apply |
| `node --check scripts/task-decision-census.mjs` | local branch before acceptance commit | 2026-06-24T17:34+03:00 | PASS |
| `node --test tests/task-decision-census.test.js` | local branch before acceptance commit | 2026-06-24T17:34+03:00 | PASS, 5 tests |
| `node --check scripts/task-decision-production-cleanup.mjs` | local branch before acceptance commit | 2026-06-24T17:34+03:00 | PASS |
| `node --test tests/task-decision-production-cleanup.test.js` | local branch before acceptance commit | 2026-06-24T17:34+03:00 | PASS, 1 test |
| `node --check scripts/clean-slate-synthetic-ramble-proof.mjs` | local branch before acceptance commit | 2026-06-24T17:30+03:00 | PASS |
| `node scripts/clean-slate-synthetic-ramble-proof.mjs` | local branch before acceptance commit | 2026-06-24T17:30Z report | PASS; all acceptance flags true |
| `npm run bna:run:status` | local branch before acceptance commit | 2026-06-24T20:50+03:00 | PASS; status counts in_progress 3, blocked 1, done 5 |
| `npm run bna:run:validate` | local branch before acceptance commit | 2026-06-24T20:50+03:00 | PASS |
| `npm run bna:run:blockers` | local branch before acceptance commit | 2026-06-24T20:50+03:00 | PASS; blocker is `REQ-20260624-028` |
| `npm run bna:run:next` | local branch before acceptance commit | 2026-06-24T20:50+03:00 | PASS; next batch was acceptance closeout before final status update |
| `npm run bna:run:source-coverage` | local branch before acceptance commit | 2026-06-24T20:52+03:00 | PASS; 9/9 statements mapped, 0 unmapped executable |
| `npm run bna:run:stale-evidence` | local branch before acceptance commit | 2026-06-24T20:52+03:00 | PASS; stale evidence detection none |
| `railway run node scripts/task-decision-census.mjs --json --no-write` | local branch before acceptance commit | 2026-06-24T17:58:23Z report | PASS read-only; Decisions 19, Done / Activity 308, Tasks 625, Codex Queue 17 |
| `npm run watchdog:raw` | local branch before acceptance commit | 2026-06-24T17:58Z report | PASS; `ops/watchdog-audits/2026-06-24T17-58-raw-intake-drift.md`, ok=true, 2 historical medium findings |
| `node <BOM-tolerant JSON/JSONL parser>` | local branch before acceptance commit | 2026-06-24T20:58+03:00 | PASS; 418 JSON files and 3 JSONL files parsed |
| `npm run secrets:audit` | local branch before acceptance commit | 2026-06-24T20:58+03:00 | PASS; 4600 tracked paths, 0 tracked secret-risk files |
| `git diff --check` | local branch before acceptance commit | 2026-06-24T20:58+03:00 | PASS; CRLF warnings only |
| `gh pr merge 19 --merge --delete-branch=false` | `1cd38d10f0aabde2ea6b40dcb0aae257c681ea43` | 2026-06-24T18:02:23Z | PASS; merged to master at `7a5bfa06e45353fc8fb4869ec2ed1d79bdec1772` |
| Railway auto-deployment readback | `7a5bfa06e45353fc8fb4869ec2ed1d79bdec1772` | 2026-06-24T21:04+03:00 | PASS; deployment `f8362b06-06b5-41f2-b4eb-102f67a91b85` SUCCESS |
| `npm run railway:doctor` | `7a5bfa06e45353fc8fb4869ec2ed1d79bdec1772` | 2026-06-24T21:04+03:00 | PASS |
| `npm run app:smoke` | `7a5bfa06e45353fc8fb4869ec2ed1d79bdec1772` | 2026-06-24T18:04:22Z report | PASS |
| `npm run app:smoke:public-privacy` | `7a5bfa06e45353fc8fb4869ec2ed1d79bdec1772` | 2026-06-24T18:04:30Z report | PASS |
| `node -e fetch('/api/health')` | `7a5bfa06e45353fc8fb4869ec2ed1d79bdec1772` | 2026-06-24T21:04+03:00 | PASS; HTTP 200, status ok, database connected, Buffer provider |

## Final Validation To Record

After this status update, rerun:

- `npm run bna:run:status`
- `npm run bna:run:validate`
- `npm run bna:run:blockers`
- `npm run bna:run:next`
- `npm run bna:run:source-coverage`
- `npm run bna:run:stale-evidence`
