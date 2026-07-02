# OpenAI / Kimi Credential Audit

Status: done for local/read-only credential audit; production mutation not
performed.

## Results

| Check | Result |
|---|---|
| `BNA_KEYHOLDER_DIR` exists | Yes: `C:\Users\User\BNA-Keyholder` |
| `openaiv2.txt` exists | Yes; present and selected by diagnostics |
| `openai-api-key.txt` exists | File exists but is empty/not present in keyholder diagnostics |
| `.secrets/openai-api-key.txt` | Present but different from selected keyholder v2 |
| `.env.local:OPENAI_API_KEY` | Present but different from selected keyholder v2 |
| Selected OpenAI diagnostics source | `keyholder:openaiv2.txt` |
| OpenAI `/v1/models` smoke | Passed, HTTP 200 |
| OpenAI small response smoke | Passed, HTTP 200 |
| Railway `OPENAI_API_KEY` readback | Present and fingerprint matches `openaiv2.txt` |
| Kimi key local config | Not configured locally in keyholder or `.secrets` |

No secret values were printed or written to repo evidence. Fingerprints are
reported only because the existing repo diagnostics already use that convention.

## Code Gap Found

Before this packet, OpenAI/Kimi provider fallback covered hosted chat/content
paths, but the transcription worker still relied on a single OpenAI key path.
That meant a 401 from a stale runtime `OPENAI_API_KEY` could strand media
transcription without trying the later keyholder candidate.

## Fix Applied

Added `src/lib/integrations/ai-credential-resolver.js` and wired it into:

- `scripts/telegram-kimi-bridge.mjs`
- `scripts/sync-drive-content-library.mjs`

The transcription path now builds ordered OpenAI credential candidates:

1. `runtime-env:OPENAI_API_KEY`
2. `keyholder:openaiv2.txt`
3. `keyholder:openai-api-key.txt`
4. `.secrets:openai-api-key.txt`

If a candidate fails with `auth_invalid_key`, the transcription path records
the failure and tries the next configured OpenAI candidate instead of leaving
the job as a generic dead error.

## Kimi Boundary

Kimi is still valid as a post-transcription AI fallback for chat, labeling,
summary, and parsing stages when configured. It is not wired as an audio
transcription provider because the current official Kimi/Moonshot API docs list
OpenAI-compatible chat/files endpoints, not an audio transcription endpoint.

Sources checked:

- https://platform.kimi.ai/docs/api/overview
- https://platform.kimi.ai/docs/guide/migrating-from-openai-to-kimi

## Evidence

- `ops/qa-runs/2026-07-02T15-42-05-723Z-keyholder-diagnostics.json`
- `ops/qa-runs/2026-07-02T15-42-13-606Z-openai-diagnostics.json`
- `ops/qa-runs/2026-07-02T15-42-03-867Z-provider-credential-diagnostics.json`
- `tests/ai-credential-resolver.test.js`
