# RAW-20260628-003 - Class question broadcast approval

Source: Codex chat

Captured at: 2026-06-28T12:25:00+03:00

Workspace/project: bna / class_drive_intake

Privacy classification: internal_goal_mode_student_question_routing_rule

## Raw wording

Run those commands and unblock everything, and do as much work as you can in
order for this, if it's just, you know, questions that need human-student
matching, so just leave them on the side, it'll just be, you know, for all the
students. You know, for questions that are not matched to a specific student,
let's just put them, they should just be pushed to every single student, you
know, portal as, you know, class questions, and not their own personal
questions. So just, you know, clean everything up and run those commands and
fix everything you can regarding merging everything, cleaning stuff up,
whatever issue 41 is about the drive, and just make sure the drive works so
I'm able to, you know, the whole workflow, putting stuff on the drive, putting
in the content section, parsing it, having the filter and content working
accordingly, and make sure that the, you know, ChatGPT is able to also access
all the transcripts, either via drive or the repo. So keep working until
everything's done as much as you can.

## Parsed intent

- Continue Issue #41 goal-mode work and run the remaining safe no-write
  commands.
- Treat unmatched or ambiguous student-question matches as class questions
  visible to every active student portal, not as personal questions assigned to
  a possibly wrong student.
- Keep production student writes gated: generate the exact dry-run row-level
  plan and evidence first, but do not mutate production without a separately
  approved apply path.
- Keep Drive workflow evidence current without broad Drive writes.
- Preserve the privacy boundary: ChatGPT/assistant can use repo-safe digest
  memory, while raw transcripts stay in private Drive/app storage unless a
  separate approved private access path exists.
