# One Time Partnership Drive Map

Updated: 2026-06-28T17:32:08.731Z

Project folder: [One Time Mishnah Class - Rabbi Elie Scheller](https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2)

Content/media parent: [04 Content and Media Intake](https://drive.google.com/drive/folders/1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv)

## Content And Media Intake Folders

| Target folder | Actual Drive title | Folder ID | Audience | Lane type | Triggers transcription | Status |
|---|---|---|---|---|---|---|
| 04.00 Upload Here - Videos and Audio for Transcription | 04.00 Upload Here - Videos and Audio for Transcription | 1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t | rabbi_facing | transcription | yes | reused_exact |
| 04.05 Upload Here - Slideshows and Source Materials | 04.05 Upload Here - Slideshows and Source Materials | 15FF6m32bEIWbXQSdTtqPw4yu_QIVvCPp | rabbi_facing | source_material | no | reused_exact |
| 04.10 Ingestion Queue - Transcribe and Parse | 04.10 Ingestion Queue - Transcribe and Parse | 1E5wS4ZCUzdtN5T0CRKXl7U_qiJ6bHUw8 | internal | transcription_queue | yes | reused_exact |
| 04.20 Source Material Review | 04.20 Source Material Review | 1KeOaVsgv2sKXb2yOAddfur2-2HInceWA | super_admin_only | source_material_review | no | reused_exact |
| 04.30 Social and Newsletter Output Drafts - Platform Review | 04.30 Social Output Drafts - Platform Review | 17M05atqKqWw8L206Dx8X9ZcOPTRuLu9h | internal | review_output | no | reused_semantic_alias |
| 04.90 Approved and Posted Outputs | 04.90 Approved and Posted Social Outputs | 1DDTvKxcpXCTrFtJGDWu1ZiAQDH4YqmDh | archive | approved_archive | no | reused_semantic_alias |
| 04.99 Needs Shloimie Decision | 04.99 Needs Shloimie Decision | 1clXzX1JJRwK5ykRaEf_qF5EhjPBezfxD | super_admin_only | decision_queue | no | reused_exact |

## Rabbi-Facing Drop-Off Notification Workflow

- Watcher: `scripts/notify-one-time-drive-dropoffs.mjs`
- Schedule: every 5 minutes when the local scheduled task is registered.
- Recipient: runtime env `ONE_TIME_DRIVE_DROPOFF_NOTIFY_TO`.
- The watcher monitors only the two Rabbi-facing upload folders and emails the operator with a direct download link when the file is downloadable.
- Original PowerPoint/media files are preferred over native Google conversion copies for download/playback.
