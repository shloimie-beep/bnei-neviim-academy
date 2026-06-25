# Issue 20 Owner Setup and Walkthrough

Requirement: `REQ-20260624-047`

Status: blocked: local implementation verified, deploy/live proof pending under
`REQ-20260624-048`.

Public page: `/issue-20-owner-walkthrough.html`

## Current Truth

- Origin master: `50087ae5d8e120830ae8e1f8dcaab71f61389d7c`
- Issue 20 branch: `codex/issue-20-parent-run-20260624`
- Issue 20 branch head at page creation:
  `9b2696b744e094a2bffe2d178124d94719df2644`
- Live health readback: `https://bneineviimacademy.org/api/health` returned
  HTTP 200 with database connected.
- Deployed SHA: not currently provable through Railway from this worktree
  because Railway targeting is blocked under `REQ-20260624-048`.

## Walkthrough Cards

Each page card includes exact page, step, expected result, validation command,
and recovery action.

| Card | Page | Validation |
|---|---|---|
| Live SHA and Health | `/api/health` plus GitHub master | `Invoke-WebRequest -Uri https://bneineviimacademy.org/api/health` |
| Active Goal and Lanes | `ops/execution-runs/2026-06-24-issue-20-parent-run/` | `npm run bna:run:next` |
| Agent Fleet and Watchdog | `/operations?view=agents` | `npm run watchdog:agent-fleet -- --json` |
| Browser Profiles and ChatGPT Agent | `docs/agent-browser-harness.md` | `npm run agent:browser:health -- --json` |
| Role Links and Bot QA | public, parent, student, provider, Rabbi workspace links | `npm run watchdog:helper-destinations` |
| GitHub Bridge and Agent Results | GitHub Issue 20 | `node --test --test-name-pattern "GitHub intake preview" tests\system-truth-scripts.test.js` |
| Decisions, Queue, and Next Ramble | Operations Tasks owner lanes | `node scripts\task-decision-census.mjs --json --no-live --no-write` |
| Stop, Restart, and Release Gate | deployment/run evidence | `npm run bna:run:validate && npm run secrets:audit && git diff --check` |

## Guardrails

- No deploy or live mutation was performed while creating this walkthrough.
- No GitHub status comment was posted.
- No production data mutation, send, charge, DNS change, credential/account
  change, class backfill, Drive write, browser private capture, public
  publishing, or secret exposure was performed.
- The page is credential-safe and does not include parent, student, provider,
  member, or Operations private data.

## Next Action

Continue to `REQ-20260624-048` only after all prerequisites are terminal. Final
Done status for app-visible Issue 20 work still requires deploy/live proof or a
precise release blocker under `REQ-20260624-048`.
