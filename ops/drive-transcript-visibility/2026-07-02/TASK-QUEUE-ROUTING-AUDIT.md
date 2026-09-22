# Task Queue Routing Audit

Status: verified/planned; no duplicate production tasks created.

## Requirement

Transcript-derived tasks should not stay buried in transcript text. Candidate
tasks must carry owner, category, priority, dependencies, related source,
privacy classification, source job, and idempotency key.

## Current Implementation Status

The repo-safe transcript digest exporter produces task candidate metadata and
focused tests verify that task candidates include routing metadata required by
the run. This packet did not create production Operations tasks from the scoped
week because the audit found 0 scoped task candidates and job 101 lacks
structured parser output.

## Scoped Week Result

| Metric | Count |
|---|---:|
| Scoped jobs | 7 |
| Task candidates found | 0 |
| Codex queue tasks created | 0 |
| Duplicate tasks created | 0 |

## Safe Path

When a future parser run emits task candidates:

- Codex/system work routes to the canonical agent lifecycle, not human Pending.
- Visible task titles must be distilled and privacy-safe.
- Source job/ref/hash must be preserved.
- Idempotency key must prevent duplicates on reprocess.
- Private student text must not appear in task title/body.

## Evidence

- `tests/transcript-digest-export.test.js`
- `ops/drive-transcript-visibility/2026-07-02/BACKLOG-20260625-20260702.json`
