# Lane 04 — Question Query, Israel-Time Dates, And Read Safety

**Packet role:** implementation vertical slice
**Owner:** Codex
**Depends on:** Lane 03
**Primary files:** shared time resolver, questions query/index service, capability/renderer/tests

## Mission

Make the exact failed request work correctly for Shloimie and Rabbi, proving the shared runtime.

## Implement

- Adapt/test `relative-date-range.js` as the shared `Asia/Jerusalem` parser.
- Implement `app.questions.list` and normalized output across accountability questions, class-session question elements, One Time moderation questions, and explicitly requested course questions.
- Apply scope/visibility in SQL/service before model access.
- Preserve source type/id, status, origin, local/UTC date, workspace/project, allowed asker label, pagination, and provenance.
- Dedupe safely and label parser-only candidates unreviewed.
- Store result object refs for follow-ups.
- Make all query intents bypass capture/intake and assert zero domain writes.

## Exact required result

On 2026-07-12 Israel time, “last two weeks” = local 2026-06-29 through 2026-07-12 inclusive. State those dates in the reply.

Shloimie: active workspace by established context or explicitly grouped/labeled authorized workspaces. Rabbi: One Time only. Public: no private query capability.

## Tests

- Exact English/Hebrew request.
- “Only unanswered ones” follow-up in both languages.
- “Who asked the second one?” visibility recheck.
- Asked versus submitted versus course-assigned disambiguation.
- Rabbi BNA/public private negatives.
- Date boundaries/DST/pagination/dedupe/empty state/connector-free behavior.
- Database assertion: zero task/ticket/intake/domain writes.

## Handback

Return source counts/semantics, query plan evidence, latency, exact fixture results, no-write proof, and any incomplete source backfill blocker.
