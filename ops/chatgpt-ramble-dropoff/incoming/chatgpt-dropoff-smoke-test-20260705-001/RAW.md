# RAW

Source channel: ChatGPT conversation
Packet ID: chatgpt-dropoff-smoke-test-20260705-001
Packet type: memory_candidate
Date: 2026-07-05

## Sanitized Source Summary

- Operator requested a safe workflow smoke test for the BNA ChatGPT-to-Codex dropoff workflow.
- Preferred mode was repo-file packet creation at `ops/chatgpt-ramble-dropoff/incoming/chatgpt-dropoff-smoke-test-20260705-001/`.
- Repo-file creation returned `403 Resource not accessible by integration`, so fallback mode is this marked GitHub PR comment on PR #90.
- Scope is to confirm that ChatGPT can hand Codex a repo-visible packet/comment and that Codex can collect it automatically.
- This packet is harmless and must not change app/source files or generate production code.

## Privacy Boundary

This RAW.md intentionally does not include raw private messages, secrets, credentials, private data, contact exports, or production data. It preserves only the safe workflow instructions needed for Codex audit.
