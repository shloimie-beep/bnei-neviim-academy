# RAW-20260710-005 - One Time Meeting Drop #3 Build Brief

| Field | Value |
|---|---|
| Source channel | `codex_chat` / `agent_fleet` |
| Source task | Agent-fleet task `2258` |
| Source title | Turn Rabbi meeting drop into One Time build brief |
| Source artifact | Meeting artifact #3 |
| Content job | `103` |
| Source media | Google Drive file ID `1HFXw0L_xfhFXTfkgonq0epKupLgU3CeW` |
| Source media URL | `https://drive.google.com/file/d/1HFXw0L_xfhFXTfkgonq0epKupLgU3CeW/view?usp=drivesdk` |
| Workspace | `rabbi_sheller_provider` |
| Project | `one_time_mishnah_class` |
| Privacy classification | Redacted meeting/class transcript; repo fallback stores metadata, summary, and decision gates only |
| Parse status | `registered` |
| Requirement register | `tasks-pending/2026-07-10-onetime-learning-motivation-commandments-build-brief.md` |
| Created requirements | `REQ-20260710-031` through `REQ-20260710-035` |
| Created decisions | `DEC-20260710-005` through `DEC-20260710-009` |

## Raw Task Payload

Meeting artifact #3 / Content job #103: Learning Motivation and Commandments
Discussion.

Imported Learning Motivation and Commandments Discussion as a One Time Mishnah
Class meeting drop.

Working direction: treat legacy CRM as optional infrastructure, not the
default product surface. The internal BNA app should own the clear
parent/student/admin experience unless a legacy CRM feature justifies its
cost.

User access model to settle: Shloimie super admin, Rabbi Elie as One Time
external admin, and project-scoped parent/student accounts split between BNA
and One Time.

Meeting follow-up should clarify the Rabbi software stack, Vimeo/library
analytics, Google Classroom/Workspace account strategy, Zoom scheduling needs,
WhatsApp delivery, and ownership/revenue terms.

## Transcript Handling

The task prompt included a transcript preview from the source media. The repo
fallback record intentionally does not copy the transcript body because meeting
and class transcripts can include student names, student speech, or other
private context. The full media/transcript source remains the Drive file and
the One Time content job. Any future transcript-derived content, bot knowledge,
worksheet, parent update, or member-library item must use the scoped
`rabbi_sheller_provider` / `one_time_mishnah_class` content pipeline and must
keep raw transcript evidence out of public/member/student surfaces unless
explicitly approved.

## Source Statements

| ID | Statement | Routing |
|---|---|---|
| SRC-20260710-005-001 | Meeting artifact #3 / Content job #103 exists as a One Time Mishnah Class meeting drop. | `REQ-20260710-031` |
| SRC-20260710-005-002 | The meeting topic is Learning Motivation and Commandments Discussion. | `REQ-20260710-032` |
| SRC-20260710-005-003 | Internal BNA app should own the clear parent/student/admin experience by default. | `REQ-20260710-033`, `DEC-20260710-005` |
| SRC-20260710-005-004 | Legacy CRM is optional infrastructure only if a feature earns its cost. | `REQ-20260710-033`, `DEC-20260710-005` |
| SRC-20260710-005-005 | Access model must settle Shloimie super admin, Rabbi Elie external admin, and project-scoped parent/student accounts. | `REQ-20260710-034`, `DEC-20260710-006` |
| SRC-20260710-005-006 | Follow-up must clarify Rabbi stack, Vimeo/library analytics, Google Classroom/Workspace, Zoom, WhatsApp delivery, and ownership/revenue terms. | `REQ-20260710-035`, `DEC-20260710-007`, `DEC-20260710-008`, `DEC-20260710-009` |

## Guardrails

- No Drive write, transcript import, member-library publish, bot knowledge
  promotion, email send, WhatsApp/WAPI send, payment/access mutation, Zoom
  write, Vimeo upload, credential change, DNS change, external CRM write, GHL,
  LeadConnector, or production-data mutation was authorized by this intake.
- Legacy CRM language in the task is treated as optional infrastructure only.
  New runtime work remains first-party BNA Operations unless Shloimie makes a
  precise approved Decision.
