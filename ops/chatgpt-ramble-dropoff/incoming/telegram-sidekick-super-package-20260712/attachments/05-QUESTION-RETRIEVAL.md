# 05 — Canonical Question Retrieval Vertical Slice

This is the first end-to-end capability because it reproduces the operator's real failure while exercising intent, date resolution, scope, fresh data, pagination, provenance, rendering, memory references, and no-write safety.

## Capability

Canonical ID: `app.questions.list`

Input contract is in `contracts/list-questions.schema.json`. Major inputs:

- required resolved `from`, `to`, and `timezone`;
- `question_origin`: `asked`, `class_extracted`, `member_submitted`, `course_assigned`, or `all`;
- source types;
- statuses;
- student, class session, course, topic, or text filter;
- actor-visible/private/member/parent/student/community/public visibility;
- sort, limit, and cursor.

Ambiguous “questions” defaults to asked/collected questions, not teacher-assigned worksheet/course prompts. Course questions are returned only when explicitly requested or `question_origin=all`; the response states the interpretation.

## Source normalization

Normalize current sources into one read model:

| Source | Filter/date/text | Default origin |
|---|---|---|
| `bna_accountability_events` | `event_type='question'`; `occurred_at`; `question_text`/notes/title | `asked` |
| `bna_class_sessions.student_questions` | each JSON element; `class_date` or created time | `class_extracted` |
| `bna_one_time_question_reviews` | `created_at`; `question_text`; review/visibility flags | `member_submitted` |
| `bna_course_questions` | `created_at`/due date; `prompt`; status/visibility | `course_assigned` |

Parser/content-job candidates are not automatically equivalent to reviewed questions. If later included, mark them `unreviewed_candidate` and keep source provenance.

Normalized result:

```json
{
  "question_ref": "question:accountability_event:123",
  "origin": "asked",
  "source_type": "accountability_event",
  "source_id": "123",
  "workspace_key": "bna",
  "project_key": "bna",
  "asked_at": "2026-07-10T08:15:00.000Z",
  "asked_at_local": "2026-07-10T11:15:00+03:00",
  "text": "...",
  "topic": null,
  "status": "recorded",
  "visibility": "internal",
  "asker_visible_label": "Approved display label or null",
  "student_id": null,
  "class_session_id": null,
  "course_id": null,
  "context_ref": null,
  "provenance": {"table": "bna_accountability_events", "column": "question_text"}
}
```

Apply workspace/project/relationship and visibility predicates inside the query service before rows reach ranking, planner, or model. Never retrieve globally and redact afterward.

## Question index strategy

The migration includes an additive `assistant_question_index` projection table with a unique source key, normalized text, date, scope, visibility, status, and provenance. Codex may choose direct union queries for the first vertical slice if latency and correctness are proven, but one normalized service remains authoritative.

If the projection table is used:

- existing domain writes enqueue or synchronously upsert the matching projection row;
- an idempotent reconciler backfills/repairs projection rows;
- source tables remain authoritative;
- no trigger or migration silently publishes private/unreviewed content;
- projection consistency status is observable;
- query results include the original source reference.

## Date semantics

All natural-language date ranges resolve in `Asia/Jerusalem`, then convert to UTC instants for storage/query.

“Last two weeks” means current local calendar day plus the preceding 13 local days, inclusive. On 2026-07-12 it resolves to local dates 2026-06-29 through 2026-07-12. The assistant states those dates.

Support:

- today/yesterday;
- this week/last week;
- past/last N days, weeks, months;
- since/until/between explicit dates;
- English and Hebrew equivalents;
- conversation follow-ups that preserve the prior range unless changed.

Store the original phrase, interpretation ID, timezone, UTC bounds, and local inclusive dates in the plan. Never silently fall back “two weeks” to an unrelated day count.

## Dedupe

Dedupe only within permitted rows. Use normalized Unicode text plus source/class proximity; retain a `duplicate_refs` array. Do not collapse semantically different course prompts or two distinct students' private submissions merely because text matches.

## Pagination and privacy

- Stable sort: requested date direction plus source type and ID tie-breaker.
- Opaque signed cursor includes scope hash, filter hash, last sort tuple, and expiry.
- Default 50; maximum 100 per call.
- Count fields are computed only inside permitted scope.
- If an actor may see question text but not asker identity, return a safe label/null.
- Super-admin multi-workspace output is grouped and labeled.
- Rabbi output always carries One Time scope, even if only one group.

## No-write invariant

A query turn may persist the source envelope, conversation message, read plan/run, read audit, result references, and outgoing reply. It must not create or modify a task, ticket, intake record, question, contact, student, class, or any other domain row.

Test this using transaction/database row-count assertions, not source-text inspection.

## Exact acceptance conversation

1. User: `Give me the questions from the last two weeks.`
2. Assistant: states interpreted local dates and scope, returns grouped results/count and pagination.
3. User: `Only unanswered ones.`
4. Assistant: reuses prior range/result context and filters status.
5. User: `Who asked the second one?`
6. Assistant: resolves stored `question_ref`, rechecks visibility, and returns an allowed label or explains the privacy boundary.

Hebrew equivalent:

1. `תן לי את כל השאלות מהשבועיים האחרונים`
2. `רק את אלה שעדיין לא נענו`

Required negatives:

- “Submit this question to the Rabbi” routes to a write/draft capability, not list.
- “Show the course worksheet questions” explicitly includes `course_assigned`.
- Rabbi asks for BNA questions: denied before query with no count/text leakage.
- Public lead asks for private questions: public boundary, no internal tool.
- Exact list request produces zero domain writes and no intake/ticket/task.
