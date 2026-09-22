# 2026-06-12 Deep System Debug Audit

Recorded at: 2026-06-12T15:54:53+03:00  
Operator request: run a full system debug/audit and send a natural-language coaching summary to Telegram.

## Executive Summary

The BNA system is alive and passing the core local and production health checks. The application test suite, screenshot QA, local app smoke, Railway doctor, watchdog status, agent fleet status, and task queue reconciliation all passed.

The main risks are not core app failures. They are release hygiene and secret hygiene:

- The current worktree is very dirty and should not be used for a broad `git add .` style release.
- The OpenAI sidekick smoke is blocked by an invalid configured local OpenAI API key.
- Secret-like text exists in local memory/release artifacts and must be redacted before those artifacts are committed, shared, or exported.
- Several older Node listeners are running locally and should be inventoried before stopping anything.

No new deployment was triggered during this audit.

## Checks That Passed

- JavaScript syntax checks passed for key runtime files:
  - `server.js`
  - `scripts/telegram-kimi-bridge.mjs`
  - `scripts/agent-fleet-supervisor.mjs`
  - `scripts/smoke-live-app.mjs`
  - `scripts/smoke-openai-sidekick.mjs`
  - `scripts/task-queue-reconciler.mjs`
  - `src/lib/actions/registry.js`
  - `src/lib/actions/actions/operations.js`
  - `scripts/correct-audio-parse-2026-06-08.mjs`
- `ops/agent-task-ledger.jsonl` parsed successfully: 847 records.
- `npm test` passed: 277/277.
- `npm run screenshot` passed with no horizontal scroll at 360, 390, 430, 768, and 1440 widths.
- Local app smoke passed against `http://127.0.0.1:8104`.
  - Report: `ops/live-smokes/2026-06-12T12-50-09-752Z-live-app-smoke.md`
- `npm run railway:doctor` passed.
  - Project: `skillful-motivation`
  - Environment: `production`
  - Deployment: `65e96817-8172-4288-a32e-8dd816207eba`
  - Status: `SUCCESS`
- `npm run agent:fleet:status` passed.
  - Supervisor running.
  - Active Codex queue: 0.
  - Ready to claim: 0.
  - Baseline smoke: enabled.
  - Auto deploy gate: enabled.
- `npm run watchdog:status` passed.
  - Watchdog running.
  - Latest severity: ok.
  - Latest report: `ops/system-audits/2026-06-12T12-48-19-153Z-watchdog.md`
- `npm run task:reconcile` passed in dry-run mode.
  - Active machine tasks: 0.
  - Actions: 0.
  - True active blockers: none detected.
  - Report: `ops/system-audits/2026-06-12T12-49-22-635Z-task-queue-reconciler.md`

## Browser And Performance Notes

Lighthouse generated `lighthouse-report.html`. The CLI returned nonzero because Chrome temp cleanup hit a Windows `EPERM` file permission error, but the report itself was written.

Extracted scores:

- Performance: 67
- Accessibility: 84
- Best Practices: 100
- SEO: 100
- Agentic Browsing: 50
- Final URL: `http://127.0.0.1:8104/`

This is not a release blocker by itself, but performance, accessibility, and agentic browsing should be improved once the current release hygiene issues are cleaned up.

## OpenAI Smoke

`npm run openai:smoke` failed at the model call with a 401 invalid API key response.

What passed before the failure:

- Repo context files readable.
- Transcript exports readable.
- Protected app APIs readable.
- Operations system endpoints readable.
- Drive folders readable as `office@bneineviimacademy.org`.

Report:

- `ops/openai-smokes/2026-06-12T12-51-34-868Z-openai-sidekick-smoke.md`

Required fix:

- Rotate any OpenAI keys that were pasted into chat.
- Configure a valid new key locally outside chat, either through `.env.local` or `.secrets/openai-api-key.txt`.
- Rerun `npm run openai:smoke`.

## Workspace Hygiene

The current workspace is not clean.

Observed status summary:

- Branch: `master...origin/master [ahead 2]`
- Dirty entries: 368
- Tracked dirty entries: 186
- Untracked entries: 182
- Deleted entries: 100
- Renamed entries: 16

This is the largest operational risk in the current state. Do not deploy or commit from this workspace with broad staging. Use a curated commit, a clean worktree, or a clean clone/release branch for the next deploy.

## Secret Hygiene

A redacted secret-pattern scan found expected environment-variable references in code and also real local risk in non-ignored artifacts:

- `memory/2026-06-11.md` contains an OpenAI-key-looking `sk-proj-` pattern.
- Some release patch artifacts under `ops/release/2026-06-11-operations-release-cleanup/` contain secret/environment-name patterns and need review before commit/share.
- `.env.local` and `.secrets/` exist locally and contain real secrets. They must remain uncommitted.

No secret values are included in this audit report.

Required fix:

- Redact secret-looking strings from local memory/release artifacts before committing or sharing.
- Rotate exposed OpenAI keys.
- Keep `.env.local` and `.secrets/` out of commits.

## Local Process Notes

The temporary audit server on port `8104` was stopped/cleared after the smoke run. No active listener remains on `8104`.

Other older local Node listeners remain active:

- `0.0.0.0:8080`
- `8081`
- `8085`
- `8091`
- `8098`
- `127.0.0.1:8125`

These may be useful local helpers, watchers, or stale development servers. They should be inventoried before anything is stopped.

## Recommended Next Moves

1. Rotate OpenAI keys and configure a valid new key locally outside chat.
2. Redact secret-looking text from memory/release artifacts before commit or export.
3. Create a clean release path: clean worktree, clean clone, or carefully curated branch. Do not use broad staging from the current dirty workspace.
4. Rerun `npm run openai:smoke` after the new local key is configured.
5. If a deploy is needed after cleanup, deploy from the clean release path, then run `npm run railway:doctor`, `npm run app:smoke`, and the relevant browser smoke checks.
6. Inventory old Node listeners and stop only the ones confirmed stale.

## Audit Verdict

Core system health: green.  
Release readiness from this exact workspace: not green.  
Primary blockers: invalid OpenAI key, dirty workspace, and secret-like local artifacts that need redaction.
