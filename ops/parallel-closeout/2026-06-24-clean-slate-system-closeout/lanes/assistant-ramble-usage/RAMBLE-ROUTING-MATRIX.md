# Ramble Routing Matrix

Generated for branch `codex/closeout-assistant-ramble-usage-20260624`.

## Scope

This lane adds a pure routing package in `src/lib/bna/ramble-routing.js`. It does not write the synthetic acceptance ramble to the canonical queue. The package produces durable provenance and queue-ready state that the post-release acceptance lane can persist through the live intake system.

## Pipeline Coverage

| Required step | Implementation | Test evidence |
| --- | --- | --- |
| Raw source envelope | `buildSourceEnvelope` creates `raw_id`, channel, workspace, project, privacy class, raw hash, and raw text. | `mixed ramble creates durable provenance...` |
| Normalized statements | `buildStatementRecords` uses existing intake fragment splitting and assigns `STMT-*` IDs plus hashes. | `mixed ramble creates durable provenance...` |
| Stable source ID | `formatStableId('raw', ...)` is used when a caller has not supplied a raw ID. | `mixed ramble creates durable provenance...` |
| Requirement mapping | `buildRambleRoutingPackage` maps statements into requirements, tasks, tickets, decisions, and memory candidates. | `mixed ramble creates durable provenance...` |
| Deduplication | `existingMatches` detects hash, canonical-key, and high-overlap repeats. | `repeated ramble is deduplicated...` |
| Executable Codex task | Task, ticket, and requirement statements owned by Codex are exposed under `executable_codex_tasks` when unblocked. | `mixed ramble creates durable provenance...` |
| Owner/external Decision | Decision-like statements and owner/external blockers produce `Needs operator decision` or `Blocked` items. | `mixed ramble creates durable provenance...` |
| Memory/context update | Durable-memory statements are exposed under `memory_context_updates` without writing central memory in this lane. | `mixed ramble creates durable provenance...` |
| Queue visibility | `queue_visibility.active_items` excludes terminal, duplicate, and completed items while preserving history. | `completed work leaves active queue...` |
| Completion evidence | Items keep `evidence_paths`; unsupported done claims are flagged unless evidence exists. | `unsupported done claim is not treated as complete...` |
| Automatic re-evaluation | `reevaluateRambleQueueAfterDecision` unblocks dependent tasks after the linked Decision is decided. | `decision completion unblocks dependent task...` |

## Test Scenarios

| Scenario | Status | Evidence |
| --- | --- | --- |
| Mixed ramble with UI work, code work, owner Decision, and memory context | PASS | `tests/ramble-routing-pipeline.test.js` |
| Repeated ramble deduplication | PASS | `tests/ramble-routing-pipeline.test.js` |
| Contradiction/supersession | PASS | `tests/ramble-routing-pipeline.test.js` |
| No lost sentence | PASS | `source_statement_mappings` must map or explicitly exclude every statement. |
| No unsupported done claim | PASS | `unsupported_done_claim` is set and the item remains non-terminal without evidence. |
| Decision completion unblocks dependent task | PASS | `reevaluateRambleQueueAfterDecision` returns the task to `queued`. |
| Completed work leaves active queue | PASS | `activeQueueItems` filters terminal and duplicate items. |
| Historical evidence remains | PASS | `queue_visibility.completed_hidden_from_active` preserves terminal/evidence items. |

## Persistence Boundary

No production queue, central `TASKS.md`, central `MEMORY.md`, ledger, changelog, or active execution-run file was written by this lane. The routing output is ready for the canonical intake/runtime lane to persist after release approval.
