# Baseline

Status: captured.

Known baseline before this packet:

- Prior OpenAI/Kimi fallback work covered Telegram hosted chat/content paths.
- Prior register explicitly left audio/video transcription on OpenAI.
- Valid local OpenAI key is expected in BNA Keyholder as `openaiv2.txt`.
- Raw transcript bodies must stay out of GitHub.
- Private Drive/app DB transcript storage is allowed when approved and scoped.
- Student question/task/score/progress production writes remain blocked unless
  exact reviewed apply paths and approvals exist.
- Active execution run has `REQ-20260702-103` blocked on content job `101`
  parser/structured-output repair.

Updated baseline after audit:

- `openaiv2.txt` validates locally and Railway readback currently matches the
  selected v2 fingerprint.
- Job `101` is no longer an OpenAI-auth stranded transcription job; it has
  transcript text and is blocked at parser/Drive-doc visibility.
- Private Drive transcript-library sync has an exact dry-run plan but no write
  approval yet.
- Kimi is not configured locally and is not a verified audio transcription
  provider for this repo.
