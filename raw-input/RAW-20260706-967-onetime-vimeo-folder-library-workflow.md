# RAW-20260706-967 - One Time Vimeo folder-to-library workflow

- raw_id: `RAW-20260706-967`
- source_channel: `codex_chat`
- parse_status: `registered`
- created_at: `2026-07-06T16:55:00+03:00`
- workspace_key: `rabbi_sheller_provider`
- project_key: `one_time_mishnah_class`
- privacy: `no_secret_values`
- requirement_register: `tasks-pending/2026-07-06-onetime-vimeo-folder-library-workflow.md`

## Raw Source

> I saved the Vimeo access token. It's in a file called Vimeo secret stuff in downloads. And I want you to build out the whole workflow that we're able to save stuff in a folder and have it sent directly to the, you know, the library.

## Parsed Lanes

- `REQ-20260706-965`: Safely ingest the Vimeo access token into the BNA
  keyholder by fingerprint/status only; do not print, commit, screenshot, or
  push it to Railway without explicit target approval.
- `REQ-20260706-966`: Build a Rabbi Scheller / One Time scoped folder-to-
  library workflow: folder scan, safe media discovery, queue/report,
  Vimeo upload readiness, scoped class-session/media metadata, internal review,
  and member-library publish handoff.
- `REQ-20260706-967`: Keep real external writes gated. Real Vimeo upload,
  member-library publish, member visibility, sends, billing/access changes,
  Drive writes/moves/deletes, and deployment remain blocked until exact
  approval gates and smoke evidence are present.
- `MEM-20260706-967`: The Vimeo token and resulting workflow are scoped to
  `rabbi_sheller_provider` / `one_time_mishnah_class`.

## Guardrails

- Do not expose the Vimeo token value.
- Do not upload real class recordings to Vimeo without an explicit approved
  apply/smoke command.
- Do not publish member-library items or grant access without
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`.
- Do not move/delete source folder files without a separate approval.
- Do not route records to global BNA, BNA Academy, or another provider.
