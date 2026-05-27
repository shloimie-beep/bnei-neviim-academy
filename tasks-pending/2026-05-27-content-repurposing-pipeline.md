# BNA Content Repurposing Pipeline

Date: 2026-05-27

## Goal

One raw Telegram upload should become a structured content job:

1. Ingest raw video/audio/image from Telegram.
2. Store the media in the local media inbox and queue it for processing.
3. Transcribe audio/video, preferably with speaker labels.
4. Parse the transcript into class notes, questions, tasks, accountability items, parent notes, and teaching-philosophy memory.
5. Draft platform-specific outputs.
6. Ask Shloimie for approval before publishing to GHL/social channels or permanently updating student/accountability records.

## Output Types

- WhatsApp daily update caption (current priority)
- Facebook post (later channel)
- YouTube title/description (later channel)
- Google Business Profile post (later channel)
- Blog draft (later todo, not current focus)
- Weekly newsletter section
- Daily class report
- Parent email/update
- Teaching philosophy note
- Short clip instructions

## Current Implementation

- `bna_content_jobs` stores each raw upload or manual content item.
- `bna_content_outputs` stores platform drafts attached to a content job.
- Operations dashboard has a `Content` tab.
- Google OAuth setup now creates a `BNA V2` Drive root with matching stage folders and a `BNA Brand Kit`.
- Telegram media uploads now create a content job with placeholder output drafts.
- GHL media upload is deferred until an explicit publish/approval command.
- Long videos are prepared for transcription by extracting compressed audio chunks before calling OpenAI.
- WhatsApp-captioned videos are also split/re-encoded into shareable MP4 parts and sent back through Telegram when they fit upload limits.
- Oversized videos can bypass Telegram upload limits by placing the file in `media-drop/inbox` and sending `/ingest_drop WhatsApp update: ...` to the Academy bot.
- The job appears in `/operations?view=content`.
- WhatsApp drafts are returned to Telegram with approve/reject buttons.
- Approval status exists at the job/output level; broader per-channel approval buttons are still future work.

## Current Priority

Focus on the first working lane only:

1. Upload one raw video in Telegram or place it into the Drive `01 Raw Intake` folder.
2. Queue it as an ingested content job.
3. Split/re-encode the video for WhatsApp when needed.
4. Transcribe the recording.
5. Draft WhatsApp text under the video.
6. Let Shloimie approve/reject the WhatsApp text from Telegram.

Do not prioritize blogs right now. Keep blog strategy, GHL social posting, YouTube, Google Business Profile, and natural-language video-editor templates as later channels after the WhatsApp lane is reliable.

## Drive Pipeline

Top-level folder: `BNA V2`

- `01 Raw Intake`
- `02 Ingesting`
- `03 Transcribed`
- `04 Parsed`
- `05 WhatsApp Ready`
- `06 Newsletter Candidates`
- `07 Social Candidates`
- `08 Blog Candidates`
- `09 Brand Kit Suggestions`
- `10 Approved`
- `11 Published`
- `99 Failed`
- `BNA Brand Kit`

The BNA database remains the source of truth. Drive folders make file stage movement visible from phone/browser.

## Transcription Research

- OpenAI is the preferred first provider because the project already has an OpenAI key and the current transcription endpoint supports `gpt-4o-transcribe`.
- OpenAI also documents `gpt-4o-transcribe-diarize`, which returns speaker-aware transcripts with `diarized_json`; use this for class recordings where multiple boys may ask questions.
- AssemblyAI and Deepgram also support diarization and can be fallback providers if OpenAI struggles with Hebrew/English classroom audio.

## Video Editing API Research

- Shotstack is the preferred first API for timeline-style rendering because it uses a REST API and JSON edit descriptions for clips, assets, trims, titles, audio, and animations.
- Creatomate is strong for template-driven render jobs where we create reusable branded formats and swap text/video/image fields.
- Cloudinary is useful for simpler transformations: resizing, trimming, overlays, subtitles, and delivery, but it is not a full timeline editor.
- CapCut/Descript/Premiere are still better human editing tools, but public API automation is less clean for our approval-first Telegram workflow.

## Next Build Steps

- Wire OpenAI transcription for Telegram audio/video uploads.
- Save raw transcript and diarized JSON onto `bna_content_jobs`.
- Add parser that creates proposed outputs without publishing.
- Add edit/regenerate flow for WhatsApp drafts after reject.
- Add final publish adapters for GHL social, YouTube, Google Business Profile, blog, and newsletter later.
- Add a weekly newsletter builder that pulls approved class recordings and parent-update videos.

## Prompt Rule For Kimi

When responding in Telegram, do not use a vague heading called `Next`.
Use:

- `Captured`
- `Already filed`
- `Queued work`
- `Blocked` only when something actually blocks progress

If Codex has created or updated this file, assume Codex and Kimi are sharing the same project state.
