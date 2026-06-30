# One Time Drive Social Ingestion Map

Updated: 2026-06-28T17:32:08.731Z

Parent folder: [04 Content and Media Intake](https://drive.google.com/drive/folders/1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv)

| Target folder | Actual Drive title | Folder ID | Audience | Lane type | Triggers transcription | Source-material only | Status |
|---|---|---|---|---|---|---|---|
| 04.00 Upload Here - Videos and Audio for Transcription | 04.00 Upload Here - Videos and Audio for Transcription | 1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t | rabbi_facing | transcription | yes | no | reused_exact |
| 04.05 Upload Here - Slideshows and Source Materials | 04.05 Upload Here - Slideshows and Source Materials | 15FF6m32bEIWbXQSdTtqPw4yu_QIVvCPp | rabbi_facing | source_material | no | yes | reused_exact |
| 04.10 Ingestion Queue - Transcribe and Parse | 04.10 Ingestion Queue - Transcribe and Parse | 1E5wS4ZCUzdtN5T0CRKXl7U_qiJ6bHUw8 | internal | transcription_queue | yes | no | reused_exact |
| 04.20 Source Material Review | 04.20 Source Material Review | 1KeOaVsgv2sKXb2yOAddfur2-2HInceWA | super_admin_only | source_material_review | no | yes | reused_exact |
| 04.30 Social and Newsletter Output Drafts - Platform Review | 04.30 Social Output Drafts - Platform Review | 17M05atqKqWw8L206Dx8X9ZcOPTRuLu9h | internal | review_output | no | no | reused_semantic_alias |
| 04.90 Approved and Posted Outputs | 04.90 Approved and Posted Social Outputs | 1DDTvKxcpXCTrFtJGDWu1ZiAQDH4YqmDh | archive | approved_archive | no | no | reused_semantic_alias |
| 04.99 Needs Shloimie Decision | 04.99 Needs Shloimie Decision | 1clXzX1JJRwK5ykRaEf_qF5EhjPBezfxD | super_admin_only | decision_queue | no | no | reused_exact |

## Rabbi-Facing Drop-Off Notification Workflow

- Watcher: `scripts/notify-one-time-drive-dropoffs.mjs`
- Schedule: every 5 minutes when the local scheduled task is registered.
- Recipient: runtime env `ONE_TIME_DRIVE_DROPOFF_NOTIFY_TO`.
- Video/audio folder emails include Drive view and direct download links for original media.
- Slides/source-material folder emails prefer original downloadable files such as `.pptx`; native Google Slides conversion copies are suppressed when the same-title original file exists.
- Guardrail: notification email only. No production DB mutation, student/member write, class backfill, transcription, AI call, Drive move/delete, publish, or social/newsletter send happens from this watcher.

## Classification Guardrails

- Audio/video files route to transcription intake and can create One Time content jobs.
- PowerPoint and Google Slides route to slideshow/source-material, are not transcribed, and stay index-only until reviewed.
- PDFs, source sheets, worksheets, and handouts route to source-material and are not transcribed.
- Unknown files route to Needs Shloimie Decision and do not trigger automation.
- Broad parent-folder children are classified by file type/lane; the parent folder itself never auto-transcribes all children.
