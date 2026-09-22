# Parallel Content Command Center Handoff

Date: 2026-06-26

## Branch / Worktree

- Branch: `codex/parallel-onetime-content-contract-20260626`
- Worktree: `C:\Users\User\Documents\Codex\2026-06-26\parallel-onetime-content-contract`
- Base used: local `codex/onetime-rabbi-ui-preflight-20260626` at `ab6741bd`
- Push status: not pushed
- Deploy/live status: not deployed, not live-smoked
- External writes: none run

## Exported Contract

New pure module:

- `src/platform/instances/one-time-content-command-center.js`

Exports:

- `buildOneTimeContentCommandCenter(reviewDataOrOptions)`
- `ONE_TIME_CONTENT_SECTIONS`
- `buildMeetingDropsSection(reviewData)`
- `buildClassLibrarySection(reviewData)`
- `buildWorksheetsSourceSheetsSection(reviewData)`
- `buildQuestionsRepliesSection(reviewData)`
- `buildApprovedAssetsSection(reviewData)`
- `buildPublishingReadinessSection(reviewData)`
- `buildContentBlockers(reviewData)`
- `buildNoWritePreviewStatus(actionKey, overrides)`

The builder accepts either a resolved `buildOneTimeSharedReviewData(...)` payload or the same options used by that shared review builder.

## Content Sections

1. `meeting_drops`
   - Drive brief / recording intake contract.
   - `ACTION-ONETIME-DRIVE-BRIEF-PREVIEW` no-write status.
   - Transcript/processing status without transcript body duplication.
   - Hosted transcription blocker.

2. `class_library`
   - Class package and manual Vimeo sample/reference contract.
   - Lesson and worksheet links.
   - Package preview, member preview, approve, publish, and rollback statuses.
   - Upload/publish blockers and required approval phrase.

3. `worksheets_source_sheets`
   - Worksheet/source-sheet list attached to the review class/session.
   - Safe open/preview behavior.
   - No Google Classroom, Drive, email, message, or public-post write.

4. `questions_replies`
   - Private student question metadata only.
   - Raw private body withheld.
   - Rabbi moderation states for hold/approve/reject/feature.
   - No forum, parent notification, email, WhatsApp, SMS, or portal notification.

5. `approved_assets`
   - Logo, hero portrait, teaching stills, social image, and press/logo inventory.
   - Sources are `config/brands/one-time.json`, `config/service-provider-sites/one-time.json`, and shared review data.
   - Rights-safe review note included.

6. `publishing_readiness`
   - Ready preview items.
   - Blocked items.
   - Rabbi decisions needed.
   - Shloimie setup needed.
   - Preview-only states and approval phrase.

## Tests Run

- `node --test tests/one-time-content-command-center.test.js` - PASS
- `node --test tests/one-time-shared-review-branding.test.js` - PASS
- `node --test tests/one-time-member-library.test.js` - PASS
- `node --test tests/one-time-classroom-calendar-community-bot.test.js` - PASS
- `node --test tests/one-time-operations-ui-smoke.test.js` - BLOCKED/FAILED locally because `playwright` is not installed in this worktree. No install was attempted.

## Integration Instructions

For the final Rabbi scoped dashboard integration:

1. Import `buildOneTimeContentCommandCenter` from `src/platform/instances/one-time-content-command-center.js`.
2. Build from the existing shared review payload when available:
   - `const review = buildOneTimeSharedReviewData(options);`
   - `const commandCenter = buildOneTimeContentCommandCenter(review);`
3. Render from `commandCenter.section_map` using the six stable section keys above.
4. Treat every `no_write_status`, `preview_action_status`, and `action_statuses.*` object as a UI gate. Do not convert these into live send/upload/publish/meeting/billing actions.
5. Keep manual Vimeo references labeled as manual/sample/review-only.
6. Do not render raw private question bodies or transcript bodies from this contract.
7. Use `publishing_readiness.blocked_items`, `rabbi_decisions_needed`, and `shloimie_setup_needed` as the Rabbi dashboard blocker panel.
8. Leave member-library publish/approve/rollback buttons disabled or approval-gated unless final integration explicitly supplies the approval phrase and live write policy.

## No-Push Confirmation

This lane is local only. No push, merge, deploy, production mutation, Vimeo upload, Zoom creation, notification send, member content publish, or external write was performed.
