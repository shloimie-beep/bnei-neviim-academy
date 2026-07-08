# OneTime Vimeo Folder V1 Surface Map

Date: 2026-07-08

Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`.

## Routes And Entry Points

| Surface | Route/command | Role | Notes |
|---|---|---|---|
| Local Drive-synced folder intake | `scripts/one-time-vimeo-studio-pipeline.mjs --folder <path>` | `INTERNAL_AGENT_SUPPORT` | Accepts local folders such as Google Drive Desktop paths. |
| Existing Vimeo/library dry-run | `npm run one-time:vimeo-library -- --folder <processed>` | `SHLOIMIE_PLATFORM_SUPPORT` | No-write scan/review package handoff. |
| Member library readback | `/member-library`, `/api/member-library` | `MEMBER_PARENT_PORTAL`, `STUDENT_PORTAL` | Later visibility target; not changed in v1 local processor. |
| Classroom readback | `/one-time-classroom`, `/api/one-time-classroom` | `MEMBER_PARENT_PORTAL`, `STUDENT_PORTAL` | Later latest-class visibility target; not changed in v1 local processor. |
| Helper/bot knowledge | helper knowledge/source-grounding modules | `STUDENT_PORTAL`, `MEMBER_PARENT_PORTAL` | Later approved transcript context target. |

## Database And Readback Sources

- `bna_content_jobs`: scoped source media/transcription job metadata.
- `bna_class_sessions`: class package, transcript status, media URL, source sheet draft, latest class/session metadata.
- `one_time_member_library_items`: member-visible publication after approval.
- `bna_helper_knowledge_items` and helper source-grounding modules: future approved bot knowledge target.

## Existing Code To Reuse

- `src/lib/bna/one-time-vimeo-folder-library.js`
- `scripts/one-time-vimeo-folder-library.mjs`
- `src/lib/integrations/vimeo.js`
- `scripts/vimeo-private-smoke.mjs`
- `src/lib/bna/one-time-drive-intake-map.js`
- `ops/one-time-mishnah/content-media-intake-workflow.md`

## Files Added In V1

- `src/lib/bna/one-time-vimeo-studio-pipeline.js`
- `scripts/one-time-vimeo-studio-pipeline.mjs`
- `tests/one-time-vimeo-studio-pipeline.test.js`

## External Provider Setup Points

- Google Drive local sync path or Drive folder ID.
- Vimeo target account/project/folder and upload token capability.
- Private/unlisted privacy defaults and allowed embed domains.
- Duplicate and rollback/delete policy.
- Transcript/bot knowledge promotion policy.

## Guardrails

- No Vimeo upload in v1 without explicit confirmation and private smoke.
- No production DB write in v1 synthetic test.
- No member/student portal visibility change in v1 synthetic test.
- No raw transcript body committed to GitHub.
- No BNA Academy media/classroom records may be used as One Time records without explicit cross-workspace link.

