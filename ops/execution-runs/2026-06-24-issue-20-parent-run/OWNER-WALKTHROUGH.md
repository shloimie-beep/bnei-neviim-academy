# Issue 20 Owner Setup and Walkthrough

Requirement: `REQ-20260624-047`

Status: Done after merge, Railway auto-deploy, and live verification.

Public page: `/issue-20-owner-walkthrough.html`

## Current Truth

- Issue 20 implementation PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/22`
- Issue 20 implementation merge commit:
  `378cc562a7dd4ffc8f2cc81a7341502df42d0295`
- Issue 20 branch: `codex/issue-20-parent-run-20260624`
- Issue 20 branch head verified before PR #22 merge:
  `729fb7684dd938e99baec37cad8cc2b50794b9d3`
- Live health readback: `https://bneineviimacademy.org/api/health` returned
  HTTP 200 with database connected.
- Railway deployment proof for PR #22:
  `4e4f38c5-73f3-49a4-b399-2dcc647bb7fa` from
  `378cc562a7dd4ffc8f2cc81a7341502df42d0295`.
- Final closeout docs/page deploy proof is posted back to GitHub Issue #20
  after the closeout PR auto-deploys.

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

- The Issue #20 implementation release used the existing GitHub `master` to
  Railway auto-deploy path; no class backfill was applied.
- No GitHub status comment was posted.
- No production data mutation, send, charge, DNS change, credential/account
  change, class backfill, Drive write, browser private capture, public
  publishing, or secret exposure was performed.
- The page is credential-safe and does not include parent, student, provider,
  member, or Operations private data.

## Next Action

No Issue #20 implementation batch remains. For future rambles, start from the
current `BNA-START-HERE.md`, run `npm run bna:run:status`, and create a fresh
raw intake/register instead of reopening this run.
