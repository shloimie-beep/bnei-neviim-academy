# RAW-20260626-008 - PR #45 content-card/topic-filter addendum

Source: GitHub PR #45 comment `4809202212`

URL: https://github.com/shloimie-beep/bnei-neviim-academy/pull/45#issuecomment-4809202212

Captured at: 2026-06-26T14:50:00+03:00

Workspace/project: bna / class_drive_intake

Privacy classification: internal_operations_ui_digest_repair

## Raw instruction

Continue Issue #41 after the #83 Drive sync evidence is pushed. Do not mark
Issue #41 done yet.

Implement the content-card and topic-filter repair batch:

- audit all 29 digest recordings;
- fix bad/gibberish/missing card titles;
- show clean generated title, main points, summary, categories, parse status,
  digest status, routing status, and next action;
- fix the top topic filter so it uses normalized topic/category data from
  digest/classification output;
- make uncategorized/unparsed items show clear states like Needs title, Needs
  parse, Needs digest, Needs routing, Needs topic classification;
- add tests;
- no Drive writes, no production mutation, no class backfill, no raw transcript
  export.

## Parsed items

- `REQ-20260626-129`: Register this PR #45 addendum and keep Issue #41 open.
- `REQ-20260626-130`: Audit all 29 digest recordings for content-card and
  topic-filter readiness.
- `REQ-20260626-131`: Implement safe digest-derived content-card display.
- `REQ-20260626-132`: Implement normalized multi-topic topic filter behavior.
- `REQ-20260626-133`: Verify with focused tests and privacy-safe audits, with
  no external writes.
