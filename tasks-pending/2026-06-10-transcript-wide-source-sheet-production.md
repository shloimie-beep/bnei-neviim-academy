# Transcript-Wide Source-Sheet Production

Captured: 2026-06-10

## Operator Intent

The operator asked to make sure the Telegram bot/task system is actually
processing the worksheet/source-sheet request:

- The first priority is source sheets/worksheets for the total classes already
  given.
- Go through all class recording transcripts and all topics/questions discussed.
- Expand each sourceable topic with actual sources, who discusses it, citations,
  Hebrew excerpts where available, concise English explanation, and direct
  Sefaria links.
- This is not only the Research tab workflow. The actual source sheets need to
  be produced.
- A separate second stage should source public content/videos with books,
  Torah sources where relevant, and scientific or educational literature.

## Current Audit Result

- Existing live task #289 shipped the Operations `Content > Research` workflow
  and `Create Source Sheet Task` action.
- Existing source-sheet files cover only a small subset of questions:
  - `content-memory/source-sheets/2026-06-09-onkelos-the-ger.md`
  - `content-memory/source-sheets/2026-06-09-captured-student-question-sources.md`
  - `content-memory/source-sheets/2026-06-09-baba-sali-sefer.md`
- `content-memory/transcripts/` currently has 52 markdown files including the
  transcript index.
- Therefore the transcript-wide source-sheet production pass is still open.

## Live Tasks Created

- #322 `Generate Sefaria source sheets from every class transcript`
  - Category: `source_sheets`
  - Assigned to: `Codex`
  - Priority: first stage / primary work
  - Live readback: `project_key` is now `bna` after the project-routing fix.
- #323 `Add sourced bibliography workflow for public content videos`
  - Category: `content`
  - Assigned to: `Codex`
  - Priority: second stage, after the class source-sheet production lane is
    underway
- #325 `Fix BNA task list project assignment bug`
  - Category: `operations`
  - Assigned to: `Codex`
  - Status: done/verified on Railway deployment
    `0e351331-0fe5-4b27-96c3-d04a22ce0e04`
  - Created because #322 and other BNA source-sheet/research tasks could
    display under the wrong project. Misrouted duplicate #324 was archived.

## Primary Deliverable For #322

Create a durable source-sheet production pass from class transcripts:

1. Start from `content-memory/transcripts/index.md`.
2. Exclude obvious smoke/admin/system-only transcripts.
3. Prioritize real class recordings and high-value class discussions, especially
   long recordings and titles with Torah/class/topic content.
4. For each transcript/session, create a topic map:
   - transcript file
   - content job number if available
   - sourceable topic/question
   - student/question context if available
   - source status
   - planned source-sheet file
5. Produce markdown source sheets under `content-memory/source-sheets/`.
6. Each source sheet must include:
   - direct Sefaria URL for every Torah source used
   - citation and source title
   - Hebrew excerpt when Sefaria provides it
   - concise English explanation
   - who discusses the topic or where the idea appears
   - how it answers the class question/topic
   - open points that need Shloimie/rav review instead of automated psak
7. Do not invent sources. If Sefaria does not verify a source, mark it as
   unverified or external and explain the limitation.

## Suggested First Batch

Use the transcript index to choose the first batch. Good candidates:

- `004-class-recording-weber-torah-m4a.md`
- `007-all-day-mishnayas-learning-and-micro-schools.md`
- `008-gaava-focus-and-the-jewish-calendar.md`
- `009-free-choice-and-lashon-hara-in-torah.md`
- `018-setting-personal-learning-and-fitness-goals-discussion.md`
- `019-setting-personal-learning-and-fitness-goals.md`
- `020-torah-learning-goals-and-camping-trip-incentive.md`
- `021-bnei-neviim-torah-learning-and-accountability-update.md`
- `025-joshua-s-conquest-and-moses-and-aaron-s-death.md`
- `026-serving-hashem-joy-and-worldly-pleasure-debate.md`
- `031-adam-naming-animals-and-eve-explained-by-rashi.md`

## Second Stage For #323

After #322 is moving, build the content/video sourcing layer:

- Public-facing videos and content rambles need citations from books, Torah
  sources where relevant, and scientific or educational literature.
- This should not block the class source-sheet lane.
- Store source/bibliography artifacts separately from student/class source
  sheets so parent-facing or marketing copy does not get mixed into the
  classroom worksheet/source-sheet workflow.

## Verification For Future Work

- Fresh Sefaria fetches should succeed for every linked Sefaria ref used.
- Markdown files must be UTF-8 clean, with no replacement characters.
- Any live task updates must append to `ops/agent-task-ledger.jsonl`.
- When a batch is completed, append to `ops/agent-changelog.md`.

## Status Update - 2026-06-10T09:12:55+03:00

Task #322 local source-sheet batch was produced at
`content-memory/source-sheets/2026-06-10-transcript-wide-class-source-sheets.md`.

Coverage:

- Audited `content-memory/transcripts/index.md` through job #54.
- Included real BNA class/update transcripts #2, #4-9, #18-21, #25-26,
  #30-31.
- Excluded smoke/admin/system-only recordings #10-17, #22-24, #27-29.
- Reserved public YouTube/content transcripts #32-54 for task #323.
- Consolidated duplicate/overlapping class recordings into 12 source-sheet
  sections with direct Sefaria URLs, Hebrew excerpts, speaker/question context,
  concise explanations, source maps, and Shloimie/rav review notes.

Local verification passed:

- No replacement/mojibake markers in the new workbook.
- 97 extracted Sefaria URLs returned HTTP 200/3xx.
- 15 local markdown links resolved.

Live Operations task #322 was not marked done by this worker; supervisor
baseline verification should make the live-state decision.
