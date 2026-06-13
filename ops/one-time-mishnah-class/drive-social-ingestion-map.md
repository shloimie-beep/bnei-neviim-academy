# One Time Drive And Social Ingestion Map - 2026-06-12T13:14:14.825Z

Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Drive root: [One Time Mishnah Class - Rabbi Elie Scheller](https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2)

## Backend Mapping

- Content jobs: one_time_mishnah_class / rabbi_sheller_provider
- Drive fields: bna_content_jobs.drive_file_id, bna_content_jobs.drive_folder_id, bna_content_jobs.drive_stage
- Output table: bna_content_outputs
- Output types: facebook_post, linkedin_post, youtube_description, whatsapp_update, weekly_newsletter, website_blog
- Guard: Buffer/social writes require explicit approval and configured connector settings.

## Drive Lanes

- [04.00 Upload Here - Rabbi Video Drops](https://drive.google.com/drive/folders/1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t) - one_time_video_drop. Raw Rabbi video/audio drops and source media waiting for ingestion.
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

- Status: hold_login_until_drive_social_ready_and_contact_confirmed
- Required before sending login: Drive root and content/media intake folders confirmed
- Required before sending login: Video-drop, ingestion, and social-output folders mapped in backend settings
- Required before sending login: Shloimie reviews platform destinations for Facebook, LinkedIn, YouTube, Instagram, and WhatsApp Status
- Required before sending login: Rabbi email collected and stored on the provider/project member record
- Required before sending login: Rabbi WhatsApp/contact phone confirmed and stored before any login link is sent
- Required before sending login: Scoped username confirmed on the One Time project member/provider record
- Current blocker: Provider record lacks Rabbi contact email
- Current blocker: Provider record lacks Rabbi WhatsApp/contact phone
- Current blocker: Provider record lacks provider login username

## WhatsApp Copy

Hi Rabbi Elie, before I send the scoped One Time login, can you please send the best email address to attach to your account? I am finishing the Drive and social setup first so the login only goes out after the workspace is ready.

