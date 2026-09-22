# Hosted Transcription Credential Audit

Date: 2026-06-21
Requirement: REQ-20260621-902

## Result

The hosted transcription blocker remains external. No valid approved
replacement credential was found locally, so no Railway variable propagation,
service restart, content-job reprocess, or transcription retry was performed.

## Provider And Key Slot

- Runtime transcription path: OpenAI audio transcription.
- Required credential slot: `OPENAI_API_KEY`.
- Transcription model setting: `OPENAI_TRANSCRIPTION_MODEL`
  (`gpt-4o-mini-transcribe` by current example/default).
- Blocked live job: content job `#78`, `Drive Class Sunday balak`.

## Readiness Checks

- Approved local secret file `openai-api-key.txt`: present, but validation
  against the OpenAI API returned HTTP `401`.
- Approved local `.env.local` `OPENAI_API_KEY`: present and different from the
  secret-file value, but validation against the OpenAI API returned HTTP `401`.
- Railway variable-name readback for the linked shared project: unavailable
  with current auth (`railway variable list --json` unauthorized/unavailable).

No secret values, token prefixes, hashes, or provider response bodies were
printed or committed.

## Exact External Action

Provide or rotate a valid OpenAI API key for the hosted transcription path
through the approved secure storage/Railway workflow. Then restart only the
service that reads `OPENAI_API_KEY` and rerun:

```powershell
node scripts/telegram-kimi-bridge.mjs --profile bna reprocess-drive-job 78 --parse
npm run app:smoke:class-upload-trace -- 78
```

Do not retry job `#78` again until a valid replacement credential is installed.
