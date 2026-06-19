# Full Queue Audit - 2026-06-17

Status: passed with historical-cleanup notes

## Commands

- `npm run task:reconcile`
- `npm run agent:fleet:status`
- `npm run ops:audit-queue -- --json --requeue-candidates`
- `npm run prompts:audit`

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Live machine queue | Active machine tasks `0`; actions `0`. | `ops/system-audits/2026-06-17T17-50-25-489Z-task-queue-reconciler.md` |
| Agent fleet | Observable jobs `0`; active fallback `0`; ready to claim `0`. | `npm run agent:fleet:status` output, 2026-06-17 17:50 local |
| Requeue candidates | `0`. | `ops/queue-audits/2026-06-17T17-49-23-226Z-queue-audit.md` |
| Prompt register | `253` prompt sources scanned; `205` deployed/verified; `39` superseded; `9` blocked. | `ops/system-audits/2026-06-17-prompt-intake-register.md` |
| Watchdog source-of-truth audit | Severity `ok`; findings `0`. | `ops/watchdog-audits/2026-06-17T17-50-watchdog-audit.md` |

## Queue Counts From Audit

- Active fresh: `0`
- Active stale: `134`
- Blocked: `28`
- Needs Shloimie: `23`
- Pending external: `97`
- Completed verified: `351`
- Done missing report: `41`
- Duplicate: `303`
- Abandoned/unknown: `186`
- Do not redo: `669`

## Interpretation

The stale/unknown counts are historical ledger/runtime/source-of-truth hygiene,
not currently executable Codex jobs. The live task reconciler and agent fleet
agree that there are no active machine tasks and no jobs ready for Codex.
