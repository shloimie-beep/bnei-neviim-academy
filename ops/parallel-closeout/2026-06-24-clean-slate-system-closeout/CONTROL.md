# Clean-Slate System Closeout Control Manifest

| Field | Value |
|---|---|
| Run ID | `2026-06-24-clean-slate-system-closeout` |
| Raw source | `RAW-20260624-003` |
| Control branch | `codex/clean-slate-integration-20260624` |
| Integration app base SHA | `161f8623c50d7ef226066d101bfa58c28aff2346` |
| Draft PR URL | `https://github.com/shloimie-beep/bnei-neviim-academy/pull/16` |
| Master SHA | `a9528b2d9467174d76d4c25bfb028f9308f24b4f` |
| PR #14 head | `f9625e8c15e0a63a272582e839bf42b100cd6714` |
| PR #15 head | `1ab57eac802ef172a5e96651dabc203d3420cbd9` |
| Deployed SHA | `8f8b0b458a95d146777808dbdf1f760618632615` from read-only Railway deployment message |
| Preservation branch | `codex/preserve-rabbi-closeout-20260624` |
| Preservation SHA | `487a660ba62db91efb139adb62f11f47044d2ffe` |

## Lane Branches

| Lane | Branch | Handoff |
|---|---|---|
| public-ui | `codex/closeout-public-ui-20260624` | `lanes/public-ui/HANDOFF.md` |
| portal-auth-nav | `codex/closeout-portal-auth-nav-20260624` | `lanes/portal-auth-nav/HANDOFF.md` |
| class-drive-intake | `codex/closeout-class-drive-intake-20260624` | `lanes/class-drive-intake/HANDOFF.md` |
| assistant-ramble-usage | `codex/closeout-assistant-ramble-usage-20260624` | `lanes/assistant-ramble-usage/HANDOFF.md` |
| stripe-sandbox | `codex/closeout-stripe-sandbox-20260624` | `lanes/stripe-sandbox/HANDOFF.md` |
| vimeo-media | `codex/closeout-vimeo-media-20260624` | `lanes/vimeo-media/HANDOFF.md` |
| operator-walkthrough | `codex/closeout-operator-walkthrough-20260624` | `lanes/operator-walkthrough/HANDOFF.md` |

## Shared Rules

Lanes branch from `codex/clean-slate-integration-20260624` after this manifest is pushed. Lanes must not edit central source-of-truth files unless the final integrator explicitly asks them to. Each lane writes status into its own `RESULT.json`, `TESTS.md`, `FILES.txt`, and `BLOCKERS.md`.

Forbidden central files for lanes:

- `AGENTS.md`
- `MEMORY.md`
- `TASKS.md`
- `ops/execution-runs/latest.json`
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`
- `ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/CONTROL.json`
- `ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/CONTROL.md`
- `tasks-pending/2026-06-24-clean-slate-control-tower-reconciliation.md`

Reserved final integrator actions:

- merge or cherry-pick lane branches;
- edit central ledger/changelog/task/run pointers;
- open or update the release PR;
- run release-wide validation;
- deploy, mutate production data, send real messages, change DNS, or touch external billing/media accounts.

## Release Gates

1. Every lane result is terminal: Done, Already satisfied, Blocked, Needs operator decision, Failed, or Archived.
2. Final integrator verifies no forbidden central files were changed by lanes.
3. `npm run bna:run:validate`, `status`, `next`, and `blockers` pass or produce explicit blockers.
4. Secrets audit and diff check pass on the integrated release candidate.
5. App-visible/server-visible changes are deployed and live-smoked only after explicit final release approval.
