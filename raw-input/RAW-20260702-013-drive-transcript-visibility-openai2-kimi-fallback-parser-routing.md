# RAW-20260702-013

Source channel: `codex_chat`
Captured at: 2026-07-02
Parse status: `registered`
Requirement register: `tasks-pending/2026-07-02-drive-transcript-visibility-openai2-kimi-fallback-parser-routing.md`
Evidence folder: `ops/drive-transcript-visibility/2026-07-02/`
Related active run requirement: `REQ-20260702-103`

## Raw Operator Packet Summary

Shloimie provided a `BNA_GOAL_MODE_EXECUTION_PACKET` asking Codex to fix and
audit the Drive media/transcript pipeline so Drive uploads are discovered,
staged, labeled, parsed, stored logically, and made visible as private Drive
transcript documents for ChatGPT Drive connector use. The packet also requires
OpenAI keyholder v2 credential handling for transcription, Kimi fallback where
real, Job `101` tracing, last-week backlog matrixing, parser-routing audit,
student question routing verification, transcript-derived task queue routing,
and score/progress/grading dry-run readiness only.

## Operator Wording To Preserve

> OpenAPI key should exist in the VNA key holder. Use the later one. There's like number two or something. And Kimi API key should be a fallback. So if you can't use OpenAPI, use Kimi.

Interpretation captured from packet:

- `OpenAPI` means OpenAI API.
- `VNA key holder` means BNA Keyholder.
- `later one / number two` means prefer or validate `openaiv2.txt` when the normal key is invalid.
- Do not print, copy, commit, expose, or log any secret value.

## Guardrails From Packet

- Raw transcripts must not be committed to GitHub.
- Private Drive/app DB may store raw transcript bodies.
- No public publishing, email/WhatsApp/SMS/social sends, payment/account/DNS changes, or score/progress/grading writes without exact approval gates.
- Broad Drive writes, paid transcription retries, and production student writes require dry-run evidence and exact approval unless already authorized by repo policy.
- Ambiguous/unmatched class questions follow the existing class-question dry-run broadcast rule.
- Score/progress/grading remains blocked until row-level before/after rows and explicit approval exist.
