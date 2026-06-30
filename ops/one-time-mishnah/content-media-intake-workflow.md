# One Time Content And Media Intake Workflow

Date: 2026-06-15

Status: active Rabbi Scheller / One Time Drive drop-off workflow. This document
defines the two Rabbi-facing intake folders and the operator email notification
watcher. It does not transcribe media, publish content, create Buffer drafts,
write production student/member data, move/delete Drive files, grant member
access, or modify Rabbi-owned systems.

## Purpose

One Time needs a repeatable path from Rabbi/video/class material into useful
review packages without accidentally publishing raw recordings or exposing BNA
school data. The safe first milestone is an internal BNA Operations workflow:

Drive video/audio drops -> recording/session record -> transcript/source notes
-> reviewed source sheets/materials -> worksheets -> question digests -> organic
clips -> ad candidates -> approval package -> posting/reporting after explicit
approval.

Slideshows, PowerPoints, PDFs, worksheets, source sheets, and handouts are a
separate source-material lane. They are indexed for review and can support
class/session/topic work after review, but they do not trigger transcription,
newsletter generation, social publishing, or member-visible output by
themselves.

## Inputs

Main Rabbi-facing intake sources:

- One Time Drive folder `04.00 Upload Here - Videos and Audio for Transcription`
  for class videos, shiur audio, meeting recordings, and anything that should
  become a transcript/parse/content candidate.
- One Time Drive folder `04.05 Upload Here - Slideshows and Source Materials`.

Internal/non-Rabbi-facing workflow folders:

- One Time Drive folder `04.10 Ingestion Queue - Transcribe and Parse`.
- Content jobs already scoped to `one_time_mishnah_class`.
- Meeting Drops for Rabbi/Shloimie planning recordings.
- Manual Operations upload/reference rows created by Shloimie/admin.

## Main Drop-Off Notification Workflow

The operational rule is intentionally simple:

1. Rabbi uploads recordings/media to `04.00 Upload Here - Videos and Audio for
   Transcription`.
2. Rabbi uploads PowerPoints, Google Slides, PDFs, source sheets, worksheets,
   and handouts to `04.05 Upload Here - Slideshows and Source Materials`.
3. The local watcher `scripts/notify-one-time-drive-dropoffs.mjs` checks those
   two folders only.
4. New files trigger an operator email with the file name, folder lane, Drive
   view link, and a direct download link when the original file is downloadable.
5. If Drive creates a native Google Slides conversion beside an original
   downloadable PowerPoint, the watcher prefers the original `.pptx` and
   suppresses the conversion-copy notification so the email points to the file
   most likely to preserve embedded media.

The watcher state lives in
`.runtime/one-time-drive-dropoff-notifier/state.json` and should be baselined
with existing files before enabling scheduled sends.

Notification emails are the only automatic send in this workflow. They do not
transcribe, publish, create student/member tasks, update scores/progress, move
Drive files, call AI, export raw transcripts, or write production data.

Not approved as automatic content intake:

- BNA school parent meeting recordings.
- Student accountability recordings.
- Private BNA family/accounting records.
- Public helper chats.
- Rabbi-owned app media libraries until owner access and target are confirmed.

## Canonical Records

| Workflow object | First-party record | Purpose |
|---|---|---|
| Raw media reference | `bna_content_jobs` with project `one_time_mishnah_class` and Drive metadata | Track source, drive stage, topic, owner, and review state. |
| Meeting summary | `bna_project_meetings` / Meeting Drops | Preserve decisions, open questions, follow-up tasks, and source-media provenance. |
| Review outputs | `bna_content_outputs` | Store internal output lanes such as transcript review, source sheet, worksheet, social plan, newsletter plan, and thumbnail brief. |
| Research/source work | `bna_class_sessions`, Content Research, source-sheet tasks | Convert sourceable topics and questions into reviewed Torah/source work. |
| Question digest | `bna_one_time_question_reviews` plus content outputs | Keep participant questions private until human review. |
| Approval package | action preview / task / decision records | Assemble publish/send/access blockers, approval phrase, rollback, and smoke plan. |
| Reporting | action logs, content statuses, dashboard alerts | Track what is ready, blocked, approved, published, or needs Rabbi/Shloimie review. |

## Workflow Stages

### 1. Intake

- Detect or manually create a One Time content job for a Drive drop.
- Scope the job to `one_time_mishnah_class`.
- Preserve source file id, folder/stage, title, date, speaker/context, and
  source channel.
- Classify the job as one or more of:
  - raw recording
  - class session
  - meeting drop
  - source material
  - launch/social material
  - support/member question material
- Do not publish, send, grant access, or write back to Drive from intake.
- Do not treat every child of `04 Content and Media Intake` as a recording.
  File type and lane classification decide whether an item is transcription
  intake, source material, output review, archive, or needs Shloimie decision.
- PowerPoint and Google Slides files are `slideshow_reference` and
  `source_material`; they are not transcription candidates.
- PDFs, source sheets, worksheets, and handouts are source material; they are
  not transcription candidates and need review before newsletter/member/social
  use.
- Unknown files route to `04.99 Needs Shloimie Decision` and trigger no
  automation.

### 2. Transcript And Session Structure

- Produce or attach transcript text when approved tooling exists.
- Split class sessions from planning meetings.
- Extract:
  - Mishnah/topic references
  - sourceable Torah questions
  - student/member questions
  - worksheet candidates
  - social/clip moments
  - decisions and blockers
  - support/access/payment issues
- Route support/access/payment issues to private tasks or tickets, not public
  content.

### 3. Source Sheets

- Create source-sheet tasks or review outputs for topics that need Torah source
  work.
- Required source-sheet fields:
  - topic
  - source/ref
  - direct Sefaria link where available
  - concise explanation
  - transcript/source provenance
  - open Rabbi/rav review questions
- No source sheet becomes final psak or member-visible material without Rabbi
  or Shloimie approval.

### 4. Worksheets

- Draft worksheet ideas only after the source/topic is reviewed.
- Worksheet draft should include:
  - target audience
  - learning objective
  - prompts/questions
  - source refs
  - teacher notes
  - review status
- Do not post AI-generated worksheets directly to members or Drive.

### 5. Question Digests

- Route participant/member questions through the private moderation queue.
- Digest candidates should be anonymized by default.
- Each digest item must carry:
  - original review id or source job id
  - topic
  - visibility recommendation
  - Rabbi/Shloimie review status
  - answer path: private, class follow-up, source sheet, or reject/archive
- No public forum, member-visible answer, notification, badge, or reward is
  created automatically.

### 6. Organic Clips

- Identify short clip candidates from reviewed recordings or transcript
  moments.
- Clip candidate should include:
  - source job id and timestamp range
  - hook/title
  - caption draft
  - visual/media notes
  - target aspect ratio
  - privacy/sensitivity flags
  - approval status
- Raw clips are not exported, uploaded, scheduled, or published by this plan.

### 7. Ad Candidates

- Promote only approved organic winners or operator-selected clips into ad
  candidates.
- Ad candidate should include:
  - claim/offer
  - audience
  - source proof
  - landing page/destination
  - budget approval state
  - compliance/review notes
  - rollback/no-spend plan
- No ad spend, Meta/Google ad creation, or public proof/testimonial use occurs
  without separate approval.

### 8. Approval Package

Before publishing, sending, or connector work, create a package that names:

- source content job
- destination
- audience and visibility
- hosted media URL or media-host blocker
- copy/body/caption
- source-sheet/worksheet/question-review status
- Buffer/social channel or manual destination
- member-library destination
- notification plan
- rollback/revoke path
- exact approval phrase
- focused smoke plan

Relevant existing approval phrases:

- `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`
- `APPROVE_BUFFER_SOCIAL_DRAFT`
- `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`

### 9. Posting And Reporting

Posting/reporting is not part of the current local workflow. After approval,
future execution paths should record:

- actor
- approved package id or action log id
- destination and channel
- published/draft URL when available
- member visibility or audience
- rollback/revoke result
- smoke result
- engagement or operational metric snapshot

Reports should separate:

- ready for Rabbi/Shloimie review
- waiting on source-sheet review
- waiting on media host
- waiting on approval phrase
- approved but not posted
- posted/published
- rolled back/revoked

## Guardrails

- No raw recording is published automatically.
- No slideshow, PowerPoint, PDF, worksheet, source sheet, or handout is
  transcribed automatically.
- No source-material file becomes a newsletter, social post, WhatsApp update,
  email, source sheet, worksheet, or member-library item until review output is
  created and explicit approval gates are satisfied.
- No source sheet, worksheet, question digest, clip, ad, newsletter, social
  draft, WhatsApp update, email, or member-library item is sent or made visible
  without explicit approval.
- No BNA school/private family/accountability data is copied into One Time
  outputs.
- No Drive/video-host write occurs without connector scope and approval.
- No Buffer draft or publish occurs without `APPROVE_BUFFER_SOCIAL_DRAFT`.
- No member-library publish or member access grant occurs without
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`.
- No Google Classroom/Calendar/Drive live action occurs without
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.
- No ad spend occurs from this workflow.
- No GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ runtime path is part
  of this workflow.

## Implementation Sequence

1. Keep Drive drops as source references, not automatic publish triggers.
2. Normalize One Time content jobs with drive stage, source type, topic, and
   project ownership.
3. Structure recordings into session summaries, sourceable topics, questions,
   and output candidates.
4. Create source-sheet and worksheet review outputs.
5. Create private question digest candidates from moderated question reviews.
6. Create organic clip and ad-candidate review outputs only after source
   provenance is clear.
7. Use publish-package and social-schedule preview actions to assemble blockers
   and approval phrases.
8. Add execution adapters only after approval, connector target, rollback, and
   smoke coverage exist.

## Current Recommendation

Use this workflow to keep the One Time content machine internal-first and
review-first. The useful next build is normalized intake/review state for
recording-derived packages, not live posting. External publishing, member
library writes, Drive/video-host writes, Buffer drafts, WhatsApp/email sends,
Google live actions, billing/access changes, and ad spend remain separate
approval-gated work.
