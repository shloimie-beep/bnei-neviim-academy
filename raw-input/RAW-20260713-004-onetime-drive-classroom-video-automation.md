# RAW-20260713-004 - One Time Drive-to-classroom video automation

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260713-004 |
| Source channel | codex_chat |
| Source type | BNA_GOAL_MODE_EXECUTION_PACKET / operator credential correction |
| Created at | 2026-07-13T14:17:00+03:00 |
| Workspace | rabbi_sheller_provider |
| Project | one_time_mishnah_class |
| Privacy classification | secret-adjacent, provider-private, transcript-private, student-sensitive possible |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-13-onetime-drive-classroom-video-automation.md |
| Packet manifest | ops/prompt-packets/2026-07-13-onetime-drive-classroom-video-automation/manifest.json |

## Raw Intake

Operator provided a Codex goal packet titled:

> CODEX GOAL - COMPLETE THE ONE TIME DRIVE-TO-CLASSROOM VIDEO AUTOMATION

The packet directs Codex to work in goal mode and complete the existing One
Time media pipeline as a repeatable workflow:

Google Drive video drop -> stable-file detection -> exactly-once One Time
content job -> conservative beginning/end edit -> private timestamped
transcript -> transcript-derived title and bullet description -> reviewed
Masechta/Perek/Mishnah/topic metadata -> structured handoff to the separate
bot-knowledge agent -> private/unlisted Vimeo upload -> scoped One Time class
review package -> approval-gated member publication -> latest video in the
parent/student portal -> complete older-video classroom/library view.

The packet explicitly says not to create a second media pipeline, to inspect
and extend the existing implementation, and to continue through unblocked
batches. It classifies the request as SUPER_RAMBLE, PRODUCT_QUALITY,
DRIVE_CONTENT_INTAKE, MEDIA_PROCESSING, TRANSCRIPTION,
COMMUNITY_CLASSROOM, BOT_KNOWLEDGE_HANDOFF, PROVIDER_SETUP,
EXTERNAL_WRITE_REQUEST, SECURITY_PRIVACY, and DEPLOY_RELEASE.

The packet requires a child Packet DAG:

- 00-control-tower
- 01-current-state-visual-audit
- 02-drive-intake-orchestrator
- 03-media-edit-and-long-transcription
- 04-transcript-metadata-and-knowledge-handoff
- 05-vimeo-owner-readiness-and-private-upload
- 06-class-package-classroom-and-latest-video
- 07-rabbi-content-processing-ui
- 08-end-to-end-pilot-and-release

The user also pasted two live Vimeo credential values in chat and corrected
that they are the owner-account token/client-ID pair to use. The literal
credential values are intentionally not stored in this tracked raw record.

## Secret Handling

- Literal Vimeo credential values were not written to this file.
- Local keyholder client credential files were updated, outside the repo, with
  timestamped backups.
- Keyholder client ID fingerprint: `2e5d2eab6e21`.
- Keyholder client secret/token-like value fingerprint: `07e84447867c`.
- Existing keyholder user access token fingerprint: `8090e282e42b`.
- The pasted long value failed Vimeo `/me` when used directly as a Bearer token
  with HTTP 401.
- The pasted short+long pair passed Vimeo client-credentials auth and minted a
  client-credentials bearer token.
- Existing `VIMEO_ACCESS_TOKEN` still passed read-only `/me`, folder, and
  recent-video checks for account `Shloimie Dratler`.
- No Vimeo upload, delete, publish, account mutation, Drive write, DB write,
  send, payment, access grant, DNS change, or public publish was performed.

## Router Output

Classifications:

- SUPER_RAMBLE
- PRODUCT_QUALITY
- UI_VISUAL_AUDIT
- DRIVE_CONTENT_INTAKE
- MEDIA_PROCESSING
- TRANSCRIPTION
- COMMUNITY_CLASSROOM
- BOT_KNOWLEDGE_HANDOFF
- PROVIDER_SETUP
- EXTERNAL_WRITE_REQUEST
- SECURITY_PRIVACY
- DEPLOY_RELEASE

Product Quality Compiler required: yes, for UI/product surfaces.

Super-Ramble Packet DAG required: yes.

Current-state visual audit required before UI implementation: yes.

Implementation forbidden until Definition of Ready passes: UI/product code
only. Non-UI backend inspection, source registration, credential read-only
checks, dry-run contracts, and packet generation may proceed.

## Source Statement Map

| Statement ID | Source statement | Mapped item |
|---|---|---|
| SRC-RAW-20260713-004-001 | Complete the One Time Drive-to-classroom video automation as goal mode. | REQ-20260713-912 |
| SRC-RAW-20260713-004-002 | Do not create a second media pipeline; inspect, extend, and consolidate existing implementation. | REQ-20260713-913 |
| SRC-RAW-20260713-004-003 | Create required Packet DAG from control tower through release. | REQ-20260713-912 |
| SRC-RAW-20260713-004-004 | Canonical Drive intake must start from the configured One Time Drive folder/lane with stable-file admission and exactly-once jobs. | REQ-20260713-914 |
| SRC-RAW-20260713-004-005 | Minimal video edit must preserve teaching and avoid semantic overclaiming. | REQ-20260713-915 |
| SRC-RAW-20260713-004-006 | Long-form private transcription must chunk, timestamp, retry, merge, and keep transcript bodies out of Git/logs. | REQ-20260713-916 |
| SRC-RAW-20260713-004-007 | Generate reviewed Torah metadata and bot-knowledge handoff contracts. | REQ-20260713-917 |
| SRC-RAW-20260713-004-008 | Vimeo owner readiness and private upload require protected credentials, readback, synthetic smoke, retry/rollback evidence, and no public publish. | REQ-20260713-918 |
| SRC-RAW-20260713-004-009 | Class package, classroom/member library, latest video, and older-video library require approval-gated publication and workspace isolation. | REQ-20260713-919 |
| SRC-RAW-20260713-004-010 | Rabbi content-processing UI requires audit-first IA, state matrix, mobile/desktop proof, action registry, tests, deploy/live smoke. | REQ-20260713-920 |
| SRC-RAW-20260713-004-011 | Operator supplied owner Vimeo credential material and said these are the values to use. | DEC-20260713-006 |

## Exclusions

- No literal secrets in tracked files.
- No real Vimeo upload until the provider packet reaches the required
  synthetic/private smoke gate.
- No public Vimeo publish.
- No email, WhatsApp, SMS, Telegram sends.
- No payments, checkout, charge, refund, or access grant.
- No GHL or LeadConnector runtime.
- No Drive source-file deletion, rename, overwrite, move, or sharing change.
- No raw transcript bodies, private student data, private account data, or
  private URLs in Git evidence.
