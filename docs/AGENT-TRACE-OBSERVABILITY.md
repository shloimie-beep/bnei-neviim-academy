# Agent Trace Observability

Every broad ramble, compiler, implementation, verification, and closeout loop
must produce a trace record before the work is marked Done.

Trace files:

- `ops/agent-traces/YYYY-MM-DD-<raw-id>-<slug>.json`
- `ops/agent-traces/YYYY-MM-DD-<raw-id>-<slug>.md`

Required fields:

- `trace_id`
- `parent_raw_id`
- `raw_id`
- `packet_ids`
- stage transitions;
- `source_files_read`
- `source_statements_mapped`
- repo surface map path;
- `compiler_schema_version`
- `validation_results`
- `tool_actions_taken`
- `tool_actions_skipped`
- `skipped_action_reasons`
- `browser_routes_visited`
- `screenshots_captured`
- `aria_snapshots_captured`
- `accessibility_scans`
- `tests_run`
- `watchdogs_run`
- `external_actions_blocked`
- `decisions_created_or_updated`
- `blockers`
- `implementation_files_changed`
- `commits`
- `PR`
- `deployment`
- `live_smoke`
- `final_status`
- `next_packet`
- `evidence_paths`

Trace first, optimize second. BNA agents should be able to debug what happened,
what was skipped, which tools ran, which external actions were blocked, and why
a packet reached Done, Blocked, Failed, or Needs operator decision.

## Minimal Validation

`npm run pqc:trace:validate` validates trace JSON files when they exist. No
trace files is a pass for a repo-only protocol packet, but broad product/UI
implementation packets must create one and link it from the requirement
register.

For v3 product-quality work, the trace must also show router classification,
packet DAG transitions, context-budget decisions, visual-audit evidence, and
any skipped implementation or provider actions with exact reasons.
