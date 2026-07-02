# Transcription Provider Fallback Design

Status: implemented locally for OpenAI credential fallback; Kimi audio
transcription remains blocked as unsupported/unverified.

## Interface Implemented

The Drive/Telegram media transcription path now records structured status
around provider attempts:

```text
transcribeMedia(input) -> {
  provider,
  provider_source,
  model,
  status,
  transcript_status,
  text,
  chunks,
  provider_attempts,
  fallback_attempted,
  fallback_provider,
  fallback_result,
  kimi_fallback,
  processing
}
```

On provider failure, the stored `transcript_json`/failure record includes:

- `openai_auth_failed`
- `fallback_attempted`
- `fallback_provider`
- `fallback_result`
- `transcript_status`
- `error_class`
- `retryable`
- `next_action`

## Provider Chain

1. OpenAI transcription with the configured transcription model and runtime env
   key if it works.
2. If OpenAI returns auth/401/invalid key, try `keyholder:openaiv2.txt`.
3. If that is absent/invalid, try `keyholder:openai-api-key.txt`, then the
   repo `.secrets` fallback.
4. If no OpenAI candidate succeeds, mark the job
   `transcription_blocked_provider_auth_or_unavailable`.
5. Kimi is recorded as post-transcription fallback only unless a verified audio
   transcription endpoint is added later.
6. Existing text/VTT/SRT/Google Doc transcript import remains the safe manual
   lane when no audio provider is available.

## Error Handling

`auth_invalid_key` does not hot-loop the same OpenAI key. The worker records the
failed candidate source, redacts provider error text, and attempts the next
candidate once. All-provider failure is resumable and preserves the source
media/job.

## Files Changed

- `src/lib/integrations/ai-credential-resolver.js`
- `scripts/telegram-kimi-bridge.mjs`
- `scripts/sync-drive-content-library.mjs`
- `tests/ai-credential-resolver.test.js`

## Remaining Production Work

No production Drive write or paid backlog transcription retry was run. Job 101
already has transcript text, but it still needs parser/Drive-doc follow-up.
