# RAW-20260628-002 - Drive backlog parser repair goal

Source: Codex chat

Captured at: 2026-06-28T09:05:00+03:00

Workspace/project: bna / class_drive_intake

Privacy classification: internal_goal_mode_backlog_parser_repair

## Raw wording

Hey, what's the status of the drive? What's going on over here, man? Is
everything that I dropped in, you know, parsed and put into the right place,
and the filters are all set, you know, the content? Can you just give me an
update of what's going on? Because really, what needs to happen is the kids'
scores need to be updated, the questions need to be updated. You know, I
didn't realize this wasn't working for a while. Can you just tell me what's
going on over here?

Can you do all of those things? So, um, it's actually working? Like, I need the
backlog, the questions, the research cards, the tasks, everything filled up from
that drive. And focus on all of these tasks regarding the parsing and the
repair. Can you just make that a goal and work till it's finished?

## Parsed intent

- Continue Issue #41 in goal mode until every safe parsing/backlog/content
  repair requirement is terminal.
- Make PR #45 mergeable and get the content-card/topic-filter repair live when
  safe.
- Run a fresh read-only Drive/class/content audit for current backlog state.
- Fill the backlog, questions, research/content cards, tasks, parse status, and
  routing status from Drive-backed transcript/digest evidence where safe.
- Build an exact dry-run production update plan for student questions and kids'
  scores/progress before any mutation.
- Do not silently mutate production student records, perform broad Drive
  writes, export raw transcript bodies, or run class backfill without exact
  reviewed approval.
