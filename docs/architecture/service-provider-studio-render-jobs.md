# Service Provider Studio Render Jobs

Studio render jobs are local, deterministic mock jobs in this implementation.

## Job Types

- `outline`
- `storyboard`
- `prompt_compile`
- `image_mock`
- `render_mock`
- `content_handoff`

Jobs are stored in `bna_studio_jobs` with status, provider/model, idempotency key, request payload, result payload, attempts, errors, and timestamps.

## Mock Render Contract

`render_mock` creates deterministic local assets from storyboard scenes. The server records:

- job row in `bna_studio_jobs`
- asset rows in `bna_studio_assets`
- usage row in `bna_studio_usage_events`

The response includes `external_write_performed: false`.

## Future Live Adapter Rule

Live provider adapters must be added behind explicit configuration, approval, scoped usage metering, and a no-secret/no-private-log review. This first slice intentionally performs no vendor render calls.
