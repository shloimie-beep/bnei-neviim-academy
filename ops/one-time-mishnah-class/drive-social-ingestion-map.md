# One Time Drive And Social Ingestion Map - 2026-06-12T13:14:14.825Z

Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Drive root: [One Time Mishnah Class - Rabbi Elie Scheller](https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2)

## Backend Mapping

- Content jobs: one_time_mishnah_class / rabbi_sheller_provider
- Drive fields: bna_content_jobs.drive_file_id, bna_content_jobs.drive_folder_id, bna_content_jobs.drive_stage
- PowerPoint/Slides intake: `/api/bna/one-time/presentation-intake` preserves original Drive files, stores open/download URLs, and sends the Shloimie email notification when an email recipient and provider are configured.
- Drive dropoff email notifier: `scripts/one-time-drive-dropoff-email-watch.mjs` is the scheduled production path for Rabbi Drive dropoffs. It watches the approved video/audio drop folder, slideshows/source-materials folder, and the current `04 Content and Media Intake` office upload folder for PowerPoint/Google Slides files. It calls `/api/bna/one-time/drive-dropoff-intake` and sends email notifications only. It does not start Telegram polling, and Telegram `409 conflict` logs are out of scope unless they actively break this email-only watcher.
- Output table: bna_content_outputs
- Output types: facebook_post, linkedin_post, youtube_description, whatsapp_update, weekly_newsletter, website_blog
- Guard: Buffer/social writes require explicit approval and configured connector settings.

## Drive Lanes

- [04.00 Upload Here - Rabbi Video Drops](https://drive.google.com/drive/folders/1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t) - one_time_video_drop. Raw Rabbi video/audio drops and source media waiting for ingestion; first ingestion creates a content job classified as `video_audio_for_transcription` and sends one email with Drive open/download links when `ONETIME_DRIVE_DROPOFF_NOTIFY_EMAIL` or an approved fallback recipient is configured.
- [04.05 Upload Here - Slideshows and Source Materials](https://drive.google.com/drive/folders/15FF6m32bEIWbXQSdTtqPw4yu_QIVvCPp) - one_time_presentation_source_material. Rabbi PowerPoint/Google Slides/source-sheet files are preserved as full original Drive files, surfaced as content jobs with open/download links, classified as `slideshow_source_sheet_material`, and notify Shloimie by email on first ingestion when `ONETIME_DRIVE_DROPOFF_NOTIFY_EMAIL`, `ONETIME_POWERPOINT_NOTIFY_EMAIL`, or an admin/Shloimie fallback email is configured.
- [04 Content and Media Intake](https://drive.google.com/drive/folders/1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv) - current Academy office upload URL used by Rabbi PowerPoint drops. The email watcher accepts presentation-like files from this folder and rejects non-presentation files from this broader folder so random uploads do not trigger source-material emails.
- [04.10 Ingestion Queue - Transcribe and Parse](https://drive.google.com/drive/folders/1E5wS4ZCUzdtN5T0CRKXl7U_qiJ6bHUw8) - one_time_ingestion_queue. Files being turned into transcripts, source notes, clip plans, and draft content jobs.
- [04.30 Social Output Drafts - Platform Review](https://drive.google.com/drive/folders/17M05atqKqWw8L206Dx8X9ZcOPTRuLu9h) - one_time_social_output_review. Facebook, LinkedIn, YouTube, Instagram, WhatsApp status, and email/newsletter drafts awaiting Shloimie/Rabbi review.
- [04.90 Approved and Posted Social Outputs](https://drive.google.com/drive/folders/1DDTvKxcpXCTrFtJGDWu1ZiAQDH4YqmDh) - one_time_social_approved_posted. Approved exports, destination URLs, screenshots, metrics, and rollback notes after an approved post/draft.

## Social Platform Setup

- Facebook: needs_shloimie_channel_mapping. Destination: Buffer Facebook channel or Meta page. Required: BUFFER_FACEBOOK_CHANNEL_ID or approved manual destination.
- LinkedIn: needs_shloimie_channel_mapping. Destination: Buffer LinkedIn channel. Required: BUFFER_LINKEDIN_CHANNEL_ID or approved manual destination.
- YouTube: needs_shloimie_channel_mapping. Destination: YouTube channel upload/description workflow. Required: BUFFER_YOUTUBE_CHANNEL_ID for text drafts; media upload remains manual/approved.
- Instagram: manual_destination_pending. Destination: Meta/Instagram or manual uploader. Required: approved Instagram account and media-hosted URL path.
- WhatsApp Status: manual_destination_pending. Destination: Manual WhatsApp status or community message. Required: Rabbi/Shloimie WhatsApp sender decision.

## Login Release Guard

- Status: task_manager_login_handoff_sent_2026_06_14
- Sent: 2026-06-14T14:45:06+03:00
- Required before sending login: Drive root and content/media intake folders confirmed
- Required before sending login: Video-drop, ingestion, and social-output folders mapped in backend settings
- Required before sending login: Shloimie reviews platform destinations for Facebook, LinkedIn, YouTube, Instagram, and WhatsApp Status
- Required before sending login: Rabbi email collected and stored on the provider/project member record
- Required before sending login: Rabbi WhatsApp/contact phone confirmed and stored before any login link is sent
- Required before sending login: Scoped username confirmed on the One Time project member/provider record
- Current blocker: Personal password setup/change for the scoped One Time Operations account is not yet a finished user-facing flow

## One Time App Access Readiness

- Status: blocked_pending_owner_approved_external_app_access
- Live app write ready: no
- Admin access reset ready: no
- Member-library publish ready: no
- Required before live access: Current One Time admin URL and deployment target confirmed
- Required before live access: Owner-approved admin reset path or Shloimie/admin login confirmed
- Required before live access: Rabbi/member test login confirmed for read-only smoke checks
- Required before live access: Production or staging database URL/source confirmed for the One Time app
- Required before live access: Vimeo/media hosting destination and hosted media URL path confirmed
- Required before live access: Resend sender/domain and approved notification copy confirmed before any email send
- Required before live access: Billing provider, tier mapping, refund/cancellation policy, and rollback/revoke path approved
- Required before live access: APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING present only for the exact one-item publishing smoke
- Current app blocker: Do not invent or store One Time admin/member credentials in BNA docs.
- Current app blocker: External One Time app has not been approved as a BNA write target.
- Current app blocker: Member-library destination, audience, visibility rules, hosted media URL, and rollback plan are still required before publish.
- Current app blocker: Email/WhatsApp/member notifications remain no-send until sender, recipients, copy, and approval are explicit.
- Current app blocker: Billing/access grants remain blocked until trusted payment source, tier mapping, and revoke path are approved.
- No-write guard: no_admin_password_reset, no_member_access_grant, no_member_library_publish, no_drive_or_video_host_write, no_resend_email, no_whatsapp_or_sms, no_checkout_or_billing_write, no_external_crm_write
- Audit source: ops/rabbi-scheller/2026-06-14-one-time-app-audit.md

## WhatsApp Copy

Hi Rabbi Elie, this is Shloimie. Here is your One Time task manager access. Right now the task manager is working. We have not configured everything else yet, so the rest of the workspace/social/content setup is still in progress.

## Handoff Verification

- Provider/project records have confirmed contact email, WhatsApp/contact phone, and scoped login username.
- Gmail sent One Time task manager access on 2026-06-14.
- WhatsApp delivered One Time task manager access on communication #1160.
