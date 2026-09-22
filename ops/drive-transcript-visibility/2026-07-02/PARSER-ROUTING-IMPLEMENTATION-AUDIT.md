# Parser Routing Implementation Audit

Status: partial/blockers recorded.

## Prior Parser Jobs

The dry-run Drive library sync still sees parser/library records for prior
jobs `71`, `59`, `58`, `57`, `56`, `31`, `30`, `26`, `25`, and `21` as existing
Transcript Library update candidates. This proves they are not invisible to the
library sync layer, but it does not prove production student/profile writes.

## Scoped Week Findings

| Job | Parser status | Routing status |
|---|---|---|
| 101 | missing visible parser output | blocked on dry-run reparse |
| 100 | `canonical-intake-parser` | parsed, no student questions found |
| 91 | no transcript | parser skipped |
| 85 | `canonical-intake-parser` | parsed, no student questions found |
| 84 | `canonical-intake-parser` | parsed, no student questions found |
| 83 | `canonical-intake-parser` | parsed, no student questions found |
| 82 | `canonical-intake-parser` | parsed, no student questions found |

## Routing Status By Lane

| Lane | Status |
|---|---|
| Class-question fallback | Implemented as dry-run/repo-safe behavior; unmatched/ambiguous candidates must not become personal student rows. |
| Matched student questions | Allowed only with explicit alias evidence, confidence threshold, no conflict, workspace/session match, and duplicate check. No scoped-week matched rows found. |
| Student scores/progress/grades | Blocked for apply. No row-level before/after plan exists in this packet. |
| Transcript-derived tasks | Supported as digest/task-candidate metadata; scoped week produced 0 task candidates. |
| Newsletter candidates | Not ready for scoped jobs; private/review flags preserved. |
| Source-sheet/research candidates | Must stay in private review/source sheet lane by default. |
| Private support/family/accounting material | Must route to private review/support/ticket lane, not public content. |

## Changes In This Packet

- Fixed credential fallback and structured transcription failure status.
- Did not implement production parser writes for job 101 because the parser
  output is missing and apply is not authorized.
- Preserved the no-blind-score-write rule.

## Next Action

Run a dry-run parser repair for `content_job:101` that produces redacted lane
output. Apply only after exact approval and idempotency/readback evidence.
