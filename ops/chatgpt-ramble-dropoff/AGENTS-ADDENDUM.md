## ChatGPT Ramble Drop-off Protocol

When Shloimie uses ChatGPT for a broad ramble, correction packet, architecture request, or implementation request, ChatGPT is the first audit/code-prep surface.

Required workflow:

1. ChatGPT preserves the raw ramble.
2. ChatGPT audits the current repo/system context when available.
3. ChatGPT writes concrete repo-ready code or a detailed implementation bundle that saves Codex work.
4. ChatGPT creates a structured packet under the repo-visible queue:
   `ops/chatgpt-ramble-dropoff/incoming/<packet-id>/`
5. Codex/background agents must only pick up repo-visible packets, not ChatGPT sandbox paths such as `/mnt/data`.
6. The packet must include:
   - `packet.json`
   - `RAW.md`
   - `CODEX_PROMPT.md`
   - `MANIFEST.json`
   - `status.json`
   - optional `attachments/`
7. The agent pickup must create or update:
   - `raw-input/RAW-*.md`
   - `tasks-pending/*.md`
   - `ops/agent-task-ledger.jsonl`
   - packet `status.json`
8. Codex must audit first, apply prepared code second, run tests, and record proof.
9. No task is done merely because ChatGPT or Codex generated code. Done requires repo changes, verification, evidence, and result record.
10. If the packet contains generated code, Codex should apply it carefully, inspect conflicts, and adapt it to actual repo files rather than re-planning from scratch.

Current implementation seed packet:

`ops/chatgpt-ramble-dropoff/incoming/RAW-20260626-901-helper-control-plane/`
