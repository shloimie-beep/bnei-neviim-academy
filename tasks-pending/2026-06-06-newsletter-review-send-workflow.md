# Weekly Newsletter Review/Send Workflow Brief

Date: 2026-06-06
Agent: Agent D, newsletter workflow scout

## Current Implementation Snapshot

- `server.js` already has the Content Prompt Studio backend:
  - prompt tables: `bna_content_prompts`, `bna_content_prompt_versions`, `bna_content_prompt_examples`
  - newsletter bundle tables: `bna_content_bundles`, `bna_content_bundle_items`
  - output linkage: `bna_content_outputs.bundle_id`, `prompt_id`, `prompt_version`
- Existing protected endpoints:
  - `GET /api/bna/content-prompts`
  - `PATCH /api/bna/content-prompts/:platform`
  - `POST /api/bna/content-prompts/:platform/examples`
  - `GET /api/bna/content-bundles`
  - `POST /api/bna/content-bundles`
  - `POST /api/bna/content-bundles/:id/generate`
  - `POST /api/bna/content-jobs/bulk-generate`
  - `PATCH /api/bna/content-outputs/:id`
  - `POST /api/bna/content-outputs/:id/actions`
  - `POST /api/bna/email/send`
- `public/operations.html` already loads `contentBundles` and has API wrappers for bundle list/create/generate.
- `public/operations.html` has `createWeeklyBundleFromSelection()` and `generateBundleNewsletter()` helper functions, but the current visible Content UI appears to use the bulk-generate panel instead of rendering a first-class bundle review panel.
- `scripts/telegram-kimi-bridge.mjs` can generate, edit, and approve weekly newsletter/update drafts through Telegram, but approval only marks/saves text. It does not safely send newsletters.
- Existing generic Gmail helper in `server.js` is usable for a future newsletter send path, and `bna_email_log` already provides per-recipient audit logging.

## Smallest Safe Next Build

Build one richer weekly workflow inside the Operations Content view:

1. Create or select a weekly bundle from existing content jobs.
2. Preview the source list before generation.
3. Generate/regenerate one newsletter draft into `bna_content_outputs` with `output_type = 'weekly_newsletter'` and `bundle_id`.
4. Review/edit subject and body in a textarea.
5. Save the edited draft with `PATCH /api/bna/content-outputs/:id`.
6. Approve text without sending.
7. Dry-run recipient preview.
8. Send a test email to the operator/admin address only.
9. Send live only after typed confirmation and only from Operations.

Do not add Telegram live-send in this pass. Telegram can keep generating, revising, and approving text, but the live newsletter send should remain a dashboard-only action until recipient selection and audit behavior are proven.

## Backend Changes Likely Needed

### Add or extend endpoints in `server.js`

- `GET /api/bna/content-bundles/:id/review`
  - Returns the bundle, included jobs with source summaries, the latest non-archived `weekly_newsletter` output for the bundle, prompt version metadata, and recipient preview candidates.
  - Recipient preview should dedupe by lowercased parent email.
  - Recommended recipient source for MVP: active `bna_students` with `parent_email`, falling back to linked `signups.parent_email`.

- `PATCH /api/bna/content-bundles/:id`
  - Allows updating `title`, `start_date`, `end_date`, `notes`, and optionally replacing `job_ids`.
  - Keep this admin-only and avoid hidden auto-selection side effects.

- `POST /api/bna/content-bundles/:id/send-preview`
  - No email side effects.
  - Payload: `{ output_id, subject, recipient_source, recipients }`.
  - Returns resolved recipients, skipped rows, missing email rows, and readiness flags.

- `POST /api/bna/content-bundles/:id/send-test`
  - Sends one email to `test_to` or a configured operator email.
  - Requires a saved output body and subject.
  - Logs `bna_email_log.email_type = 'weekly_newsletter_test'`.
  - Does not mark the output or bundle published.

- `POST /api/bna/content-bundles/:id/send`
  - Live send.
  - Required payload: `{ output_id, subject, recipient_source, recipients, confirm: 'SEND_WEEKLY_NEWSLETTER' }`.
  - Must require the output status to be `approved`.
  - Must refuse if recipient preview resolves to zero recipients.
  - Must log each attempted recipient to `bna_email_log` with `email_type = 'weekly_newsletter'`.
  - On success, update output status to `published`, set `published_at`, update output metadata with send summary, and set bundle status to `published`.

### Fix approval semantics before live send

Current dashboard approval calls `contentOutputAction(..., 'approve_publish')` for non-Facebook/non-blog output types too. For weekly newsletters, approval should not mean published.

Recommended smallest fix:

- In `public/operations.html`, change newsletter approval to `PATCH /api/bna/content-outputs/:id` with `{ status: 'approved' }`.
- Keep `approve_publish` only for output types with a real external side effect:
  - `facebook_post`: create GHL draft, not live publish.
  - `blog_draft`: publish to website.
- If changing only client behavior feels risky, also harden `server.js` so `approve_publish` for `weekly_newsletter` returns a clear error like `Use approve first, then newsletter send endpoint`.

### Avoid new DB tables for MVP

No new table is required for the first safe version.

- Per-recipient audit: use existing `bna_email_log`.
- Bundle/output state: use existing `bna_content_bundles.status`, `bna_content_outputs.status`, `approved_at`, `published_at`, and `metadata`.
- If a later version needs campaign-level analytics, add `bna_newsletter_sends`; do not add it for this smallest pass.

## Operations UI Changes Likely Needed

Edit `public/operations.html` in the next implementation session:

- Add API methods:
  - `getContentBundleReview(id)`
  - `updateContentBundle(id, payload)`
  - `previewNewsletterSend(id, payload)`
  - `sendNewsletterTest(id, payload)`
  - `sendNewsletterLive(id, payload)`
- Render a `Weekly Newsletter Review` panel near the top of `renderContent()`.
- Show date range controls defaulting to the last 7 days.
- Add a visible `Create Weekly Bundle` button for selected content jobs. The existing `createWeeklyBundleFromSelection()` can be reused, but should pass `start_date` and `end_date` when available.
- Render existing bundles from `contentBundles` with:
  - title, date range, status
  - source item count
  - latest newsletter output id/status if present
  - `Review`, `Generate`, and `Regenerate` actions
- In the review drawer/card:
  - source checklist with job title, upload date, media type, and summary/topics
  - subject input
  - newsletter body textarea
  - save button using `PATCH /api/bna/content-outputs/:id`
  - approve button using `PATCH /api/bna/content-outputs/:id` with status `approved`
  - recipient preview table before any test/live send
  - `Send test` button
  - live send button gated by typing `SEND_WEEKLY_NEWSLETTER`

## Approval-Only Boundaries

- Generating or regenerating a bundle must never send email.
- Editing and saving a draft must never send email.
- Approving a weekly newsletter must only mark the text approved and save it as a reusable example.
- Telegram approval must remain approval-only for newsletters; no live email send from Telegram yet.
- Facebook approval should continue to create a GHL draft only, not live publish.
- Website blog publishing can remain explicit and separate; do not mix it with newsletter approval behavior.
- Live newsletter send requires all of:
  - admin authenticated Operations request
  - saved `weekly_newsletter` output
  - output status `approved`
  - non-empty subject
  - non-empty recipient preview
  - typed confirmation `SEND_WEEKLY_NEWSLETTER`
  - Gmail credentials available

## Recipient Policy For MVP

- Default recipient source: parents of active students only.
- Dedupe by normalized lowercase email.
- Show the exact recipient list before test/live send.
- Allow manual recipient override for testing or one-off sends, but make manual recipients visible in preview.
- Do not email all historical signups by default.
- Do not infer recipients from transcript content or Telegram text.

## Verification Plan

- `node --check server.js`
- Browser smoke for `/operations?view=content`:
  - bundle panel renders
  - create bundle from selected items works
  - generate/regenerate creates one `weekly_newsletter` output with `bundle_id`
  - edit/save preserves body
  - approve sets status `approved`, not `published`
  - send preview has no Gmail side effect
  - test send sends only to `test_to`
  - live send refuses without exact confirm phrase
- Live deploy rule still applies after implementation: deploy Railway, run live doctor/smoke, and only then mark complete.

## Suggested Build Order

1. First PR/session: UI bundle review panel, approval semantics fix, and preview-only endpoint. No live send.
2. Second PR/session: test-send endpoint and UI button.
3. Third PR/session: live-send endpoint with confirmation, email log audit, and Railway live smoke.

