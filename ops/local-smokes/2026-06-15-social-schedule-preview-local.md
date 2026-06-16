# Social Schedule Preview Local Smoke

Timestamp: 2026-06-15T04:00:35+03:00

Scope: Phase 14 Buffer/social scheduling helper preview.

## Command

```text
node -e equivalent via PowerShell here-string:
runAction({
  action_id: 'preview_social_schedule_package',
  source: 'local_smoke',
  inputs: {
    source_text: 'Schedule this Facebook post one post per day this week starting 2026-06-22 09:00: Registration is open.',
    channels: ['facebook'],
    post_count: 7,
    schedule_start: '2026-06-22T09:00:00',
    cadence: 'daily',
    workspace_key: 'rabbi_sheller_provider'
  },
  actor: { user_id: 'local-smoke', role: 'operator', workspace_id: 'rabbi_sheller_provider' }
})
```

## Result

- `success: true`
- `executed: false`
- `approval_required: true`
- `action_id: preview_social_schedule_package`
- `preview_created: true`
- `provider: buffer`
- `slots: 7`
- first slot: `2026-06-22T09:00:00`
- last slot: `2026-06-28T09:00:00`
- blocker: `Final Buffer draft approval phrase has not been supplied.`

## Guardrail

The local smoke performed no Buffer write, no social publish, no external
write, and no send:

- `buffer_write: false`
- `publish: false`
- `external_write: false`
- `no_send: true`
