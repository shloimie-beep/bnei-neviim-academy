# Transcription Walkthrough

Purpose: media transcription for Telegram, Drive, drop folders, class recovery,
content jobs, and review workflows.

1. Open `/integration-setup.html#transcription`.
2. Open https://platform.openai.com/api-keys.
3. Confirm `OPENAI_TRANSCRIPTION_MODEL`.
4. Confirm `TRANSCRIPTION_MAX_BYTES`.
5. Use these variable names:
   - `OPENAI_API_KEY`
   - `OPENAI_TRANSCRIPTION_MODEL`
   - `TRANSCRIPTION_MAX_BYTES`
   - `OPENAI_BASE_URL`
6. Store the key only in approved secret storage.
7. Run `npm run owner-review:external-readiness` for credential-free routing.
8. For a real smoke, use one approved non-sensitive audio/video file.
9. Expected success: transcript text or diarized/JSON output is returned from
   the provider.
10. Expected failure: exact quota, rate, model, auth, or file-size error is
    recorded.
11. External effects: real transcription uploads approved test media and uses
    provider quota.
12. Live acceptance requires scoped transcript privacy, no public transcript
    leak, and visible handling of provider errors.
