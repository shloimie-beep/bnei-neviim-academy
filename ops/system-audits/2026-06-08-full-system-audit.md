# Full System Audit - 2026-06-08

Result: PASS with cleanup findings.

## Executive Summary

- Production app is healthy on Railway deployment `d01d1d78-d4e2-43f7-bddf-92791ea4de98`.
- Live app smoke passed after the six-document signup/server mismatch was fixed and deployed.
- OpenAI sidekick smoke passed after source-of-truth cleanup.
- Drive audit passed for `office@bneineviimacademy.org` and sees the `BNA V2` pipeline.
- Telegram Academy bridge is running on PID `226264`; stderr is empty.
- Agent fleet supervisor is running on PID `156164`; active Codex queue is `0`.
- No external GHL/social send or publish action was executed during this audit.

## Commands And Evidence

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/smoke-live-app.mjs`
- PASS `node --check scripts/ghl-mcp-stdio.mjs`
- PASS `node --check src/lib/bna/telegram-agent-intent.js`
- PASS `node --check src/lib/bna/telegram-planning-intent.js`
- PASS `npm test` - 46/46
- PASS `npm run agent:fleet:status` - supervisor running, queue 0
- PASS `npm run railway:doctor` - deployment `d01d1d78-d4e2-43f7-bddf-92791ea4de98`, status SUCCESS
- PASS `npm run openai:smoke` - `ops/openai-smokes/2026-06-08T07-23-09-213Z-openai-sidekick-smoke.md`
- PASS `npm run app:smoke -- --require-drive` - `ops/live-smokes/2026-06-08T07-23-17-488Z-live-app-smoke.md`
- PASS `npm run drive:audit` - `ops/drive-audits/2026-06-08T07-22-32-454Z-google-drive-audit.md`
- PASS `git diff --check` - line-ending warnings only, no whitespace errors

## Runtime Status

Telegram bridge:
- Lock: `.runtime/telegram-kimi-bridge.lock`
- PID: `226264`
- Started: `2026-06-08T07:02:52.561Z`
- Chat mode: `openai`
- Offset: `948165228`
- `telegram-kimi-bridge.err.log`: empty
- Pending external-action approvals: none

Agent fleet:
- Supervisor PID: `156164`
- Lock: `.runtime/agent-fleet/supervisor.lock.json`
- Last completed task: #155, report `ops/agent-fleet-runs/2026-06-08T07-01-44-656Z-task-155.md`
- Active Codex tasks: `0`
- Latest stdout shows only `Agent fleet: no Codex-owned tasks ready to claim.`

## Fixes Applied During Audit

- Fixed production signup dry-run mismatch: `/api/submit?dry_run=true` now requires and stores all six required agreement signatures, including Registration/Intake and Parent Agreement/Signature Page.
- Updated the live smoke expectation so credit/cash/bank-transfer dry runs verify all six signatures.
- Deployed the fix to Railway and verified with Railway doctor plus live app smoke.
- Cleaned stale repo brain facts in `MEMORY.md` and `SYSTEM-STATE.md`:
  - GHL status is active/guarded, not globally blocked.
  - `bneineviimacademy.org` is the live production domain.
  - Homepage progress is `3.5/30`, not `2/30`.
  - Weber/Huda and Galambo/Eitan are reconciled paid signup/payment rows, not unresolved `needs_signup` intake.
  - Canonical active student spelling is `Eitan Chaim Golombo`; duplicate `Golambo` row should stay inactive.
  - Current bridge/supervisor PIDs were updated.
  - Website image Drive lane is live-smoke-covered.

## Findings

No current P0/P1 runtime blocker found.

1. Legacy local pending queue still exists.
   - `ops/pending` has 16 JSON files, newest from 2026-06-07.
   - Current live Codex/agent queue is 0, so these look like legacy local media/intake jobs, not active machine work.
   - Recommended cleanup: audit/archive obsolete `ops/pending/*.json` separately.

2. Smoke-test signup/payment artifact is visible in live data.
   - OpenAI smoke sees `Codex Signup Test Student 20260608035051` as a pending payment student.
   - This is expected smoke data, but it should be cleaned or clearly marked if it should not appear in normal Accounting views.

3. Device control remains mock-only.
   - OpenAI smoke reports `devices: 0`.
   - Real tablet shutoff still needs a physical test tablet plus QStudio/Qustodio/Headwind/FreeKiosk credentials.

4. GHL Social diagnostics pass, but the safe write/delete publish smoke remains open.
   - `.mcp.json` has `gohighlevel` through `scripts/ghl-mcp-stdio.mjs`.
   - `@drausal/gohighlevel-mcp` resolves at version `1.0.0`.
   - The PIT token is available outside tracked files at `.secrets/ghl-pit-token.txt`.
   - No live GHL draft write/delete was performed in this audit.

5. Historical logs contain old noise, not current failure.
   - Telegram bridge log includes old 409 conflicts, aborted polls, and Codex CLI timeouts that correctly fell back to the API.
   - Current post-restart bridge stderr is empty.
   - Agent fleet err log has stale 404s for `/api/bna/agent-fleet/status`; current `server.js` now defines GET and POST for that route, and direct fleet status passes.

6. Drive credential is usable but not a Workspace Shared Drive.
   - Drive audit sees `BNA V2` under `office@bneineviimacademy.org`.
   - Workspace Shared Drives visible: `0`.
   - Medium-term recommendation: create a real Google Workspace Shared Drive for BNA Operations when available.

7. Worktree is dirty.
   - Dirty files include current agent/Telegram/signup/MCP changes plus audit updates.
   - No unrelated changes were reverted.

## Current Real Blockers

- Safe GHL draft write/delete smoke for Telegram draft publishing.
- Google posting alias/default selection for multiple connected Google accounts.
- Rabbi Elie Scheller live bot token/chat credentials and scoped login.
- Physical tablet and device-management credentials for real device-control verification.
- Green Invoice sender-side delivery logs/settings access.
- Optional cloud video rendering provider/credentials if local Remotion is not enough.

## Conclusion

The core system is operational: production app, Railway deployment, OpenAI sidekick, Drive visibility, Telegram bridge, and agent fleet are all green. The remaining issues are cleanup/credential/external-write-verification items, not live app outages.
