# Ramble Intake - 2026-07-08 - One Time Performance, Media, And Classroom Workflow

## Raw Intake

Source raw record:
`raw-input/RAW-20260708-006-onetime-performance-media-classroom-workflow.md`

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260708-006 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-08-onetime-performance-media-classroom-workflow.md |

## Goal-Mode Execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | n/a |
| Goal tool used | no |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260708-021 and REQ-20260708-030 |

## Router Result

Classification: `SUPER_RAMBLE`, `PRODUCT_QUALITY`, `BUG_REPORT`,
`UI_VISUAL_AUDIT`, `UI_IMPLEMENTATION`, `COMMUNITY_CLASSROOM`,
`SECURITY_PRIVACY`, `PROVIDER_SETUP`, `EXTERNAL_WRITE_REQUEST`,
`DECISION_REQUIRED`, `DEPLOY_RELEASE`.

This must be split. The first executable batch is performance/current-state
audit and safe app-local lag reduction. External Drive-to-Vimeo upload remains
blocked until target folder, Vimeo upload permission/privacy defaults, and
explicit external-write approval are in place.

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260708-021 | Diagnose and reduce visible lag/button-click delay across the One Time member library/classroom surfaces. | RAW-20260708-006 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | performance | P0 | 1 | REQ-20260708-030 | Performance audit records load/click timings, identifies top UI/main-thread causes, and the first fix improves or removes the worst local cause without weakening security. | `public/member-library.html`, `scripts/smoke-one-time-vimeo-member-library-live.mjs`, tests | yes | Done deployed/live-smoked |
| REQ-20260708-022 | Upgrade One Time member-library filters for newest uploads and useful class navigation. | RAW-20260708-006 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | library-filters | P0 | 1 | REQ-20260708-030 | Library has clear filters/sorts for newest uploaded/published, continue watching, completed, Masechta, Perek, worksheets/assets, and review materials; mobile toolbar does not create horizontal lag or confusing pills. | `public/member-library.html`, tests | yes | Done deployed/live-smoked |
| REQ-20260708-023 | Define and build the safe Drive drop -> Vimeo upload automation path. | RAW-20260708-006 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex + owner approval | media-automation | P0 | 2 | DEC-20260708-006 | There is a clear no-surprises pipeline from approved One Time Drive intake folder to Vimeo private upload to member-library draft, with duplicate detection, privacy defaults, rollback, and no automatic publish/send/access grant. | `scripts`, `src/lib/integrations/vimeo.js`, Drive intake docs/tests | yes | Blocked pending external-write decision |
| REQ-20260708-024 | Add class-specific slideshow section beside the video. | RAW-20260708-006 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | classroom-materials | P1 | 2 | REQ-20260708-031 | Student/parent classroom can view the slideshow for the selected class/session when approved, without exposing raw editable PowerPoint files by default. | `server.js`, `public/one-time-classroom.html`, tests | yes | Done deployed/live-smoked |
| REQ-20260708-025 | Add class-specific worksheet section clearly tied to each class/video. | RAW-20260708-006 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | classroom-materials | P1 | 2 | REQ-20260708-031 | Worksheets/source sheets show under the relevant class, with clear labels and no cross-class confusion. | `server.js`, `public/one-time-classroom.html`, tests | yes | Done deployed/live-smoked |
| REQ-20260708-026 | Perform a video/slides/materials security audit and publish policy. | RAW-20260708-006 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex + owner decision | security-privacy | P0 | 1 | none | Security packet states what can and cannot be prevented, recommends private Vimeo embeds/no raw downloads/watermarking/signed links/view-only slides, and names residual risks such as screen recording. | `server.js`, `public/one-time-classroom.html`, ops security packet | yes | Done deployed/live-smoked |
| REQ-20260708-027 | Remove the confusing "join classroom by code" feeling for logged-in parent/student users while preserving access control. | RAW-20260708-006 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | auth-ux | P0 | 2 | REQ-20260708-030 | Parent/student session or magic-link access opens library/classroom directly; any code field becomes fallback/support-only and not the primary classroom UX. | auth/session routes, `public/member-library.html`, `public/one-time-classroom.html` | yes | Verified locally; pending commit/push/deploy/live-smoke |
| REQ-20260708-028 | Implement the moderated comment publication loop for video/class comments and replies. | RAW-20260708-006 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | moderation-community | P0 | 3 | REQ-20260708-026 | Parent/student comments are private pending review; Rabbi/admin can publish; published comments become member-visible; replies enter the same pending-review cycle. | `server.js`, Operations moderation UI, classroom/member UI, tests | yes | Done deployed/live-smoked |
| REQ-20260708-029 | Add student update/awards/progress feed tied to public comment updates and scoreboard changes. | RAW-20260708-006 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | gamification-updates | P1 | 3 | REQ-20260708-028 | Student portal shows approved public updates, award/progress notices, and scoreboard achievements with positive wording and no shame/private data. | student/classroom UI, tests | yes | Done deployed/live-smoked |
| REQ-20260708-030 | Create current-state performance and visual audit evidence before implementation. | RAW-20260708-006 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | audit-first | P0 | 0 | none | Audit captures current routes, click/load timings, DOM/media counts, screenshots for mobile/desktop, and the initial hypothesis for lag. | `ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/` | no | Done local |
| REQ-20260708-031 | Create Product Quality Compiler/DAG packets for the split work. | RAW-20260708-006 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | protocol | P0 | 0 | none | Control tower and current-state audit packets exist and validate; later implementation packets remain split by surface. | `ops/prompt-packets/2026-07-08-onetime-performance-media-classroom-workflow/` | no | In progress; packets 00-03 and 05 done/validate; packet 06 verified locally; packet 04 blocked |

## Parsed Tasks

No broad human-visible task fan-out yet. This register is the canonical
machine-work queue. External account actions are Decisions below.

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260708-006 | Approve Drive-to-Vimeo automation target and external-write policy. | Exact Drive folder ID, Vimeo account/project target, token with upload/private-link permission, privacy defaults, duplicate policy, rollback/delete policy, and approval phrase. | Shloimie / account owner | Start with a no-write watcher that creates member-library draft/upload-intent records, then enable real Vimeo upload only after a synthetic private-upload smoke passes. | Manual Vimeo upload plus paste URL; direct Drive embed only; delay automation. | Full automation without this can upload the wrong file, expose raw media, duplicate assets, or publish before review. | Provide/confirm target folder and Vimeo upload policy, then explicitly approve the upload smoke. | REQ-20260708-023 | Needs operator decision |
| DEC-20260708-007 | Choose slideshow exposure policy. | Whether students should see view-only rendered slides/PDF images, Google Slides view-only embeds, or downloadable PowerPoint files. | Shloimie / Rabbi | Default to member-only view-only rendered slides or PDF/image deck with watermark/no-download UI; do not expose editable `.pptx` files by default. | Public slides; downloadable PowerPoint; no slides. | Editable downloads are easy to copy; public links leak course material; view-only still cannot stop screenshots. | Approve the default view-only member slides policy or name a different policy. | REQ-20260708-024, REQ-20260708-026 | Recommended pending |

## Open Questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260708-004 | Is the lag mostly on Operations, parent/student/member pages, or specifically One Time library/classroom pages? | The first audit will measure One Time surfaces, but "entire app" may require a separate Operations performance packet. | No for One Time first batch | Open |
| Q-20260708-005 | Should worksheets be view-only in the portal or downloadable/printable for parents? | Worksheet UX and security differ from slides/video. | No for current-state audit | Open |

## Durable Memory Candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260708-002 | One Time students/parents should not be asked to "join classroom" by code after authenticated login; access should resolve from login/session/magic link and codes should be fallback-only. | Yes | Durable UX/auth expectation for One Time portals. |
| MEM-20260708-003 | One Time class materials should be class/session-specific: video, slideshow, worksheets/source sheets, comments, updates, awards, and progress must attach to the same class context. | Yes | Durable IA rule for classroom content. |
| MEM-20260708-004 | One Time media security should not promise impossible anti-copy protection; use member-only access, private embeds, view-only slides, watermarking, no direct raw downloads, audit logs, and residual-risk language. | Yes | Durable security policy. |

## Product Quality Packet DAG

| Packet | Role | Status | Purpose |
|---|---|---|---|
| `00-control-tower.product-quality.json` | CONTROL_TOWER | Done local | Split the super-ramble, define batches, and block unsafe external writes. |
| `01-current-state-performance-visual-audit.product-quality.json` | VISUAL_AUDITOR | Done local | Measured app lag/current UI state before code changes. |
| `02-member-library-performance-filters.product-quality.json` | IMPLEMENTATION_PACKET | Done deployed/live-smoked | First implementation packet after audit: reduce lag and improve library filters. |
| `03-media-security-slides-worksheets.product-quality.json` | IMPLEMENTATION_PACKET | Done deployed/live-smoked | Security policy plus slides/worksheets UX. |
| `04-drive-to-vimeo-automation.product-quality.json` | PROVIDER_SETUP_PACKET | Blocked | External Drive/Vimeo upload automation after approval. |
| `05-moderated-comments-updates-awards.product-quality.json` | IMPLEMENTATION_PACKET | Done deployed/live-smoked | Comment publication loop and update/awards feed. |
| `06-access-code-session-ux.product-quality.json` | IMPLEMENTATION_PACKET | Verified locally; pending release | Replace primary "join by code" feeling with current secure access and fallback/support-only code entry. |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260708-030 | `/member-library`, `/one-time-classroom`, `/api/member-library`, `/api/one-time-classroom` | Run Playwright timing and DOM/media count audit; capture screenshots/report. | PASS: `ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/member-library-performance-audit.md`; caveat: live TEST member-library access returned 401/0 cards, so populated proof uses synthetic local smoke. | Pending | Pending | Not required |
| REQ-20260708-031 | `ops/prompt-packets/2026-07-08-onetime-performance-media-classroom-workflow/` | Create control tower, current-state audit, and first implementation PQC packets; validate. | PASS: `npm run pqc:validate -- ops/prompt-packets/2026-07-08-onetime-performance-media-classroom-workflow/00-control-tower.product-quality.json ops/prompt-packets/2026-07-08-onetime-performance-media-classroom-workflow/01-current-state-performance-visual-audit.product-quality.json ops/prompt-packets/2026-07-08-onetime-performance-media-classroom-workflow/02-member-library-performance-filters.product-quality.json` | Pending | Pending | Not required |
| REQ-20260708-021..022 | member library UI | Lazy-activate Vimeo/HTML5 media only after Play Video; remove raw Vimeo media link; add Newest, Materials, and Worksheets filters; debounce search; cap desktop card width so one item does not become a full-width slab; update smoke proof. | PASS: `node --test tests/one-time-member-library.test.js tests/one-time-classroom-calendar-community-bot.test.js tests/one-time-canonical-journey.test.js`; PASS local browser smoke `ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/member-library-local-lazy-media-smoke.md`; PASS live smoke `ops/live-smokes/2026-07-08T08-29-27-722Z-one-time-member-library-lazy-media-live-smoke.md`. | `13563239` | `13563239` | PASS Railway deployment `f40dc034-bd33-48cd-a9e4-fa10c550983f` SUCCESS and production readback/smoke passed. |
| REQ-20260708-024..026 | classroom materials/security | Add `slideshow` and `slide_deck` as One Time class asset types; repair the DB asset-type check; include approved slide assets in member-safe snapshots while suppressing editable `.ppt/.pptx/.key` slide sources; render classroom Class Materials groups for Slides, Worksheets, and Source Sheets; lazy-activate classroom video after `Play Video`; remove the raw Vimeo fallback link; fix mobile classroom toolbar clipping. | PASS: expanded One Time tests 23/23 plus community/gamification tests 14/14; PASS PQC packets 00-03 validate; PASS local Playwright smoke `ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/classroom-materials-local-smoke.md` across 1440/430/390 with zero iframes before Play Video, one iframe after, no overflow, and no toolbar clipping; PASS watchdog/secrets/diff checks; PASS live smoke `ops/live-smokes/2026-07-08T08-59-04-813Z-one-time-classroom-materials-live-smoke.md`. | `856cee8f` | `856cee8f` | PASS Railway deployment `ab2651c8-1c4f-497b-be3a-ea8b5745a4af` SUCCESS and live smoke passed. |
| REQ-20260708-028..029 | classroom moderation/updates feed | Add server-side `class_updates` read model derived only from approved visible messages and approved classroom participation events; keep member-safe `participation_events` hidden; render classroom Class Updates with published comments, reward/progress cards, and positive-only points; preserve private-first response submission. | PASS: PQC packet 05 validate; PASS focused tests 21/21; PASS local Playwright smoke `ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/class-updates-local-smoke.md` across 1440/390 with no overflow and visible published/progress updates; PASS protocol drift; PASS secrets audit; PASS `git diff --check`; PASS live smoke `ops/live-smokes/2026-07-08T09-21-15-474Z-one-time-class-updates-live-smoke.md`. | `0cee2a86` | `0cee2a86` | PASS Railway deployment `d1cd18ac-fdbb-4e61-8834-98aa3fe601f5` SUCCESS and live smoke passed. |
| REQ-20260708-027 | member library/classroom access UX | Convert member library and classroom access panels to current secure-access copy with code entry hidden inside `Use fallback access code`; carry current access from library to classroom; make normal classroom route light/member-facing instead of always using review-shell class; keep review shell conditional on `?review=one-time`. | PASS: PQC packet 06 validates; PASS focused tests 17/17; PASS local Playwright smoke `ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/access-session-ux-local-smoke.md` across 1440/390 with no overflow, no console errors, fallback-only code drawer, current-access connected state, and zero eager Vimeo iframes. | Pending | Pending | Pending commit/push/deploy/live-smoke. |

## Initial Security Advice

- We can reduce casual copying; we cannot honestly prevent screen recording or
  all browser capture once a user can watch a video or view slides.
- Recommended default: member-only pages, private Vimeo embed, no raw download
  button, no public listing, restricted embed domain where Vimeo plan allows,
  per-user access logging/progress events, visible terms, optional watermark,
  and view-only rendered slide/PDF deck rather than editable PowerPoint.
- Public slides should be limited to marketing/sample material. Class slides
  and AI video source material should be member-only unless Rabbi/Shloimie
  explicitly approves public exposure.

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260708-030 | Done local | `ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/member-library-performance-audit.md` plus screenshots for 1440/1024/768/430/390. | `ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/` | PASS Playwright current-state audit; caveat: live TEST member-library returned 401/0 cards. | Populated live member-library proof still needs valid access after deploy. |
| REQ-20260708-031 | In progress | Packets 00-03 and 05 exist and are done/validated; packet 06 exists and is locally verified. | `ops/prompt-packets/2026-07-08-onetime-performance-media-classroom-workflow/` | PASS PQC validation for packets 00-03, 05, and 06. | Packet 04 remains blocked by Drive/Vimeo external-write decision DEC-20260708-006. |
| REQ-20260708-021 | Done deployed/live-smoked | Lazy media activation added; raw Vimeo Open Media link hidden; local and live browser smokes confirm 0 iframes before Play Video and 1 after, no overflow, no progress POST without access code, and desktop card cap. | `public/member-library.html`; `scripts/smoke-one-time-vimeo-member-library-live.mjs`; `tests/one-time-member-library.test.js` | PASS focused tests; PASS local smoke; PASS live smoke `ops/live-smokes/2026-07-08T08-29-27-722Z-one-time-member-library-lazy-media-live-smoke.md`. | The broader app may still need separate Operations/portal lag audits; this member-library batch is terminal Done. |
| REQ-20260708-022 | Done deployed/live-smoked | Filters now include `Newest`, `Materials`, and `Worksheets`; search includes asset title/type and is debounced; production readback confirms old `Recently Added` label is absent. | `public/member-library.html`; `tests/one-time-member-library.test.js`; `scripts/smoke-one-time-vimeo-member-library-live.mjs` | PASS focused tests; PASS local smoke; PASS live smoke `ops/live-smokes/2026-07-08T08-29-27-722Z-one-time-member-library-lazy-media-live-smoke.md`. | Remaining slides/worksheets/auth-code/comment/update work is tracked in later packets. |
| REQ-20260708-024 | Done deployed/live-smoked | `slideshow` and `slide_deck` are accepted class asset types in production; member-safe preview includes `slide_deck` and hides editable `.pptx` slide sources. | `server.js`; `public/one-time-classroom.html`; `tests/one-time-member-library.test.js`; `tests/one-time-classroom-calendar-community-bot.test.js`; `tests/one-time-shared-review-branding.test.js` | PASS expanded One Time tests; PASS classroom local Playwright smoke; PASS live smoke `ops/live-smokes/2026-07-08T08-59-04-813Z-one-time-classroom-materials-live-smoke.md`. | Drive-to-Vimeo automation remains blocked separately by DEC-20260708-006. |
| REQ-20260708-025 | Done deployed/live-smoked | Classroom renders class-specific Class Materials groups for Slides, Worksheets, and Source Sheets under the active class/video, with a reviewed-materials empty state. | `public/one-time-classroom.html`; tests | PASS local Playwright smoke across 1440/430/390; PASS production browser smoke across 1440/430/390; mobile toolbar no longer clips. | Auth/session access-code UX remains separate REQ-20260708-027. |
| REQ-20260708-026 | Done deployed/live-smoked | Classroom Vimeo video lazy-activates after `Play Video`, raw Vimeo fallback link is removed, and the UI states the residual screenshot/screen-recording risk. | `server.js`; `public/one-time-classroom.html`; `ops/prompt-packets/2026-07-08-onetime-performance-media-classroom-workflow/03-media-security-slides-worksheets.product-quality.json` | PASS PQC packet 03; PASS watchdog/secrets/diff; PASS local and live smoke confirm zero iframes before Play Video and one after. | Vimeo/Drive account privacy automation remains blocked separately. |
| REQ-20260708-028 | Done deployed/live-smoked | `class_updates` is built from approved visible messages and approved classroom participation events only; public response submission remains hidden/private pending Rabbi/admin review; admin review route remains the publish/participation gate. | `server.js`; `tests/one-time-classroom-calendar-community-bot.test.js`; `tests/one-time-community-moderation-workflow.test.js`; `ops/live-smokes/2026-07-08T09-21-15-474Z-one-time-class-updates-live-smoke.md` | PASS focused tests 21/21; PASS PQC packet 05; PASS protocol drift; PASS secrets/diff; PASS Railway deployment `d1cd18ac-fdbb-4e61-8834-98aa3fe601f5`; PASS production live smoke. | Personal persistent pending history still depends on REQ-20260708-027/session identity work; the approved publication loop is terminal Done. |
| REQ-20260708-029 | Done deployed/live-smoked | Classroom renders a Class Updates feed with published comments, progress/award rows, positive labels, and mobile-safe stacked layout. | `public/one-time-classroom.html`; tests; `ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/class-updates-local-smoke.md`; `ops/live-smokes/2026-07-08T09-21-15-474Z-one-time-class-updates-live-smoke.md` | PASS local Playwright smoke across 1440/390; PASS production live smoke across 1440/390; no horizontal overflow; screenshots captured. | Broader parent/student portal login and session UX remains separate REQ-20260708-027. |
| REQ-20260708-027 | Verified locally; pending release | Member library/classroom now show current secure access first, fallback code drawer second; classroom no longer renders the internal review shell on normal member access; local browser smoke captured desktop/mobile screenshots and no-overflow proof. | `public/member-library.html`; `public/one-time-classroom.html`; `tests/one-time-member-library.test.js`; `tests/one-time-classroom-calendar-community-bot.test.js`; `tests/one-time-canonical-journey.test.js`; `ops/prompt-packets/2026-07-08-onetime-performance-media-classroom-workflow/06-access-code-session-ux.product-quality.json`; `ops/ui-audits/2026-07-08-onetime-performance-media-classroom-workflow/access-session-ux-local-smoke.md` | PASS PQC packet 06; PASS focused tests 17/17; PASS local Playwright smoke across 1440/390 with zero overflow, zero console errors, connected current-access state, fallback drawer behavior, and no eager Vimeo iframes. | Commit/push/deploy/live-smoke still required before terminal Done. |
