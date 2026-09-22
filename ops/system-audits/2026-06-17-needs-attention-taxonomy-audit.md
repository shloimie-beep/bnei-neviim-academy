# Needs Attention Taxonomy Audit - 2026-06-17

Status: passed

## Rule

`Needs Attention` must mean Shloimie or an external system is required. It must
not mean "Codex is waiting in the background."

## Evidence

- `npm run task:reconcile` report `ops/system-audits/2026-06-17T17-50-25-489Z-task-queue-reconciler.md`: active machine tasks `0`, actions `0`.
- `npm run agent:fleet:status`: observable Codex jobs `0`, active Codex task fallback `0`, ready to claim `0`.
- `npm run ops:audit-queue -- --json --requeue-candidates`: requeue candidates `0`.
- Queue audit `ops/queue-audits/2026-06-17T17-49-23-226Z-queue-audit.md` read AGENTS, SYSTEM-STATE, TASKS, live tasks, ledger, changelog, fleet runs, pending briefs, and runtime state.

## Current Meaning

| Lane | Meaning | Current result |
| --- | --- | --- |
| Active Codex / machine work | Codex can execute without a human/external blocker. | `0` active. |
| Needs Shloimie | Human decision/input is required. | Queue audit reports `23`. |
| Pending external | External credentials, providers, account owner action, hardware, or third-party verification is required. | Queue audit reports `97`. |
| Historical stale / abandoned unknown | Old ledger/runtime/source-of-truth markers that need proof-link cleanup or archival, not live Codex jobs. | Present in queue audit, but no requeue candidates. |

## Conclusion

The live executable queue is clear. Needs Attention should show only
human/external requirements; historical ledger-only stale records are cleanup
metadata and must not be presented as waiting Codex work.
