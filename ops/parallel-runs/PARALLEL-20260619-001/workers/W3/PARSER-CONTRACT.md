# Parser Contract

Contract version: `w3-platform-parser-v1`

Module: `src/platform/ingestion/canonical-parser.js`

## Output Schema

```json
{
  "workspace": {},
  "participants": [],
  "decisions": [],
  "tasks": [],
  "calendar_events": [],
  "content_items": [],
  "community_items": [],
  "integration_items": [],
  "notes": [],
  "unresolved": [],
  "deduplication_keys": []
}
```

## Local Guarantees

- Validates required top-level arrays before writes.
- Wraps the existing canonical BNA parser instead of creating a second parser.
- Creates deterministic idempotency keys from workspace, type, title, and source excerpt.
- Dedupes against supplied active/recent records.
- Uses high/medium/low confidence labels.
- Creates one Decision for ambiguous person, scope, low-confidence, or workspace-routing findings.
- Rewrites visible titles through task shaping; raw transcript text is provenance only.
- Routes private student/accountability content away from public content.
- Reroutes general system work out of student notes.
- Adds an unresolved finding instead of inferring Zoom attendance.
- Suppresses retry/watchdog noise as visible Tasks unless it is an actionable repair/decision.
- Resolves One Time aliases to `one_time_mishnah_class`.

## Focused Tests

- `tests/ingestion/w3-parser-queue.test.js`
