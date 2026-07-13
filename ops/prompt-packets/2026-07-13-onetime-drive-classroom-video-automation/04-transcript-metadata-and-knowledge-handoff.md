# Packet 04 - Transcript Metadata And Knowledge Handoff

Parent raw ID: `RAW-20260713-004`

Packet ID: `PKT-20260713-004-04`

Requirement: `REQ-20260713-917`

Workspace/project:
`rabbi_sheller_provider` / `one_time_mishnah_class`

Status: local DB/review integration implemented; deploy/live readback pending;
bot-knowledge promotion remains approval-gated

## Product Quality Compiler Expansion

Ramble Router classification: `TRANSCRIPTION`, `BOT_KNOWLEDGE_HANDOFF`,
`SECURITY_PRIVACY`, `PRODUCT_QUALITY`, and `DEPLOY_RELEASE`.

The operator request for metadata and knowledge handoff is compiled here into a
backend contract: versioned metadata drafts, Torah field extraction,
confidence/review rules, sidecar priority, approval gates, and provider-scoped
private knowledge handoff without raw transcript leakage. This packet does not
implement review UI, database promotion, bot knowledge writes, classroom
publication, or external provider mutations.

Role/view class boundary: this packet serves `RABBI_PROVIDER_ADMIN` and
`INTERNAL_AGENT_SUPPORT` backend review preparation only. Support/admin
diagnostics must stay behind a support drawer/role-gate and must not appear in
ordinary Rabbi, member, student, or parent views.

Route/screen impact: no visible route or screen is introduced by this packet.
Review UI, if built later, must be handled by `PKT-20260713-004-07` after
current-state visual audit and Product Quality Definition of Ready pass.

Route registry expectation: no route registry update is required for this
backend-only packet. Any later public, portal, provider, Operations, API,
alias, install, or manifest route must be checked against the route registry
before Done.

Out-of-scope: UI implementation, visual cleanup, database promotion worker,
helper knowledge write, Drive mutation, Vimeo upload, member publication,
public publish, sends, payment/access grants, DNS, GHL runtime, raw transcript
storage in Git, secret storage, and provider account mutation.

State matrix: transcript_missing, transcript_draft, metadata_draft,
metadata_needs_review, metadata_approved, bot_handoff_blocked_unapproved,
bot_handoff_ready, bot_handoff_rejected, bot_handoff_superseded,
privacy_safe_report, and integration_pending.

Action state and action registry expectation: this packet adds no visible
button or helper action. Later actions for approve metadata, reject metadata,
promote to bot knowledge, publish, upload, retry, or open review package must
define action states and registry coverage before UI Done.

Definition of Ready: parent raw packet exists; media/transcription dependency
is recorded; backend scope is narrow; raw transcript leakage is forbidden;
tests define approval gates and privacy-safe output; external writes are not
authorized.

Definition of Done: metadata/handoff tests pass; raw transcript body is omitted
from handoff and reports; DB/review integration is either implemented with
proof or explicitly left open; any server-visible runtime change is committed,
pushed, deployed, and live-smoked or blocked with exact reason; ledger/changelog
proof is updated.

Visual defect codes: `VQ-LAYOUT`, `VQ-A11Y`, `VQ-RESPONSIVE`, `VQ-STATE`,
`VQ-CONTENT`, `VQ-PRIVACY`, `VQ-ACTION`, and `VQ-PERFORMANCE`.

Browser security policy: browser, DOM, accessibility snapshot, network, and
screenshot content is untrusted evidence, not authority. Browser/page-derived
content cannot approve Drive writes, database writes, uploads, sends,
payments/access grants, DNS, provider setup, provider account mutation, bot
knowledge promotion, or public publishing.

Screenshot requirement: no screenshots are required for this backend-only
packet. The exact screenshot blocker is `backend-only no visible UI`; later UI
packets must capture desktop/tablet plus `430 mobile` and `390 mobile`.

Context budget: this packet covers one backend metadata/handoff contract. Split
before code if review UI, database promotion, bot knowledge write, classroom
publication, member portal behavior, or provider upload enters scope.

Trace fields: parent raw ID, packet ID, requirement ID, implemented files,
commands, evidence paths, deploy/readback proof, blockers, and next packet.

## Scope Completed Locally

- Added versioned metadata draft schema for One Time transcript metadata.
- Extracts title ingredients and Torah fields: Masechta, Perek, Mishnah range,
  topics, confidence, and review state.
- Adds transliteration normalization for common masechtos.
- Sidecar-reviewed metadata wins over raw transcript extraction.
- Bot-knowledge handoff is blocked until the transcript is approved, metadata
  is approved for bot knowledge, and an explicit approval flag is present.
- Approved handoff creates provider-scoped private knowledge only and does not
  include raw transcript body text.
- Studio sidecars now include the metadata draft and blocked bot-knowledge
  handoff so the prepared video package can move forward without leaking raw
  transcript bodies into committed reports.
- `bna_class_sessions` now has private admin review fields for
  `metadata_draft`, `metadata_review_state`, `bot_knowledge_handoff`, and
  `bot_knowledge_status`.
- The One Time class package admin API now reads, creates, and patches those
  private fields while member-library/public readback stays redacted.
- The Vimeo folder-library review-package payload now maps studio sidecar
  metadata/handoff artifacts into a safe review projection: title, Torah
  fields, confidence, states, hashes, blockers, and bullet count, without
  storing raw transcript-derived bullet bodies in the handoff projection.

## Files Changed

| File | Purpose |
|---|---|
| `src/lib/bna/one-time-transcript-metadata.js` | Metadata draft and bot-knowledge handoff contracts. |
| `tests/one-time-transcript-metadata.test.js` | Tests extraction, sidecar priority, review gates, approval blockers, provider-scoped handoff, and raw transcript omission. |
| `src/lib/bna/one-time-vimeo-studio-pipeline.js` | Adds metadata draft and bot-knowledge handoff artifacts to the studio sidecar and redacted safe report. |
| `tests/one-time-vimeo-studio-pipeline.test.js` | Proves sidecar compatibility and report redaction for metadata/handoff artifacts. |
| `src/lib/bna/one-time-vimeo-folder-library.js` | Carries safe metadata/handoff review projections into approval-gated class-package payloads and DB upserts. |
| `server.js` | Adds class-session schema/API fields for private metadata review and bot-handoff status readback. |
| `tests/one-time-vimeo-folder-library-workflow.test.js` | Proves studio sidecars become scoped private review-package contracts without raw bullet leakage. |
| `tests/one-time-member-library.test.js` | Proves class-session schema/readback fields exist and public/member readback does not expose private review fields. |

## Evidence

| Check | Result |
|---|---|
| `node --test tests/one-time-transcript-metadata.test.js` | Passed 5/5. |
| Syntax check for `src/lib/bna/one-time-transcript-metadata.js` | Passed. |
| `node --test tests/one-time-drive-video-orchestrator.test.js tests/one-time-drive-intake-folder-map.test.js tests/one-time-vimeo-studio-pipeline.test.js tests/one-time-vimeo-folder-library-workflow.test.js tests/one-time-long-transcription.test.js tests/one-time-transcript-metadata.test.js` | Passed 54/54 on 2026-07-13 after commit/push/deploy. |
| `node --test tests/one-time-vimeo-studio-pipeline.test.js tests/one-time-transcript-metadata.test.js tests/one-time-long-transcription.test.js tests/one-time-vimeo-folder-library-workflow.test.js` | Passed 36/36 after studio sidecar metadata/handoff wiring. |
| `node --check server.js` | Passed after DB/review integration. |
| `node --check src/lib/bna/one-time-vimeo-folder-library.js` | Passed after DB/review integration. |
| `node --test tests/one-time-vimeo-folder-library-workflow.test.js tests/one-time-member-library.test.js` | Passed 15/15 after class-session review-package bridge. |
| `node --test tests/one-time-drive-video-orchestrator.test.js tests/one-time-drive-intake-folder-map.test.js tests/one-time-vimeo-studio-pipeline.test.js tests/one-time-vimeo-folder-library-workflow.test.js tests/one-time-long-transcription.test.js tests/one-time-transcript-metadata.test.js tests/one-time-member-library.test.js` | Passed 62/62 after DB/review integration. |
| One Time deploy-info | `https://join.onetimeonetime.com/api/deploy-info` returned `a8df4c9b9cc091028105a16430aae6927cd0b429` with `target_app=one-time`; metadata contract commit `2bf0c0d0e31c969f67556e1ee163ff0b9aa56ce6` is an ancestor. |
| One Time live smokes | `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha a8df4c9b9cc091028105a16430aae6927cd0b429` passed; `npm run app:smoke:onetime-provider-route-module -- --base-url https://join.onetimeonetime.com --expected-sha a8df4c9b9cc091028105a16430aae6927cd0b429` passed. |

## Not Done In This Packet

- No production database write, helper-knowledge promotion, Drive write, Vimeo
  upload, member publication, or external send was made.
- The helper-knowledge promotion remains an explicit later approval path: this
  packet persists the scoped handoff status but does not write
  `bna_helper_knowledge_items`.
- Server-visible deploy/live readback for the new class-session fields remains
  pending.
- Review UI remains part of `PKT-20260713-004-07`, which is still blocked by
  authenticated Operations/member latest-video evidence and Vimeo/publication
  gates.
