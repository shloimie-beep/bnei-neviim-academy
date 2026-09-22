# AI Usage Metering

Studio usage events are stored in `bna_studio_usage_events`.

## Event Fields

- `studio_project_id`
- `job_id`
- `project_id`
- `workspace_key`
- `actor`
- `provider`
- `model`
- `operation`
- `input_tokens`
- `output_tokens`
- `media_seconds`
- `estimated_cost_usd`
- `latency_ms`
- `status`
- `metadata`

## Rollups

`buildUsageRollup()` returns an event count, token/media/cost totals, and budget threshold state. Studio usage appears in:

- `/operations?view=studio&section=usage`
- `/operations?view=api_usage`
- `/api/bna/studio/usage`

## Scope

Usage event and budget reads use the same Studio scope helper. Provider-scoped users can see only rows for their project/workspace. Platform users can see global rows unless a workspace/project filter is supplied.
