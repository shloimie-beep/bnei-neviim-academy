# Codex Prompt

You are auditing a harmless BNA ChatGPT-to-Codex dropoff smoke test.

Packet ID: `chatgpt-dropoff-smoke-test-20260705-001`
Packet type: `memory_candidate`
Status: `ready_for_codex_audit`
Target folder after collection: `ops/chatgpt-ramble-dropoff/incoming/chatgpt-dropoff-smoke-test-20260705-001/`

## Scope

Confirm that ChatGPT can hand Codex a repo-visible packet/comment and that Codex can collect it automatically.

## Required Work

1. Audit this packet against the current repo dropoff protocol.
2. If collecting from GitHub comments, run or exercise the trusted collector/ingestor path for marked comments.
3. Confirm the packet materializes or is discoverable at the target folder/path expected by the dropoff workflow.
4. Record evidence of collector/ingestor behavior, including commands run and resulting packet path or blocker.
5. Confirm no app/source files were changed.
6. Confirm no production code was generated.
7. Confirm no secrets, private data, credentials, contact exports, or raw private messages were included.

## Do Not Do

- Do not edit `public/`, `src/`, `server.js`, or other app/source runtime files.
- Do not generate production code.
- Do not perform external writes, sends, payment actions, access changes, DNS changes, credential changes, or production mutations.
- Do not promote this to durable memory without normal Codex audit and evidence.

## Suggested Verification

Use the repo's existing dropoff collector/ingestor commands if available, such as:

```bash
npm run chatgpt:dropoff:comments:apply
npm run chatgpt:dropoff:apply
```

If the exact commands are unavailable or blocked, record the precise blocker and the next action.

## Expected Handback

Return:

1. Whether GitHub comment collection worked.
2. The materialized packet folder path or blocker.
3. Commands run.
4. Evidence path(s).
5. Confirmation that no app/source files changed.
6. Confirmation that no secrets/private data were included.
