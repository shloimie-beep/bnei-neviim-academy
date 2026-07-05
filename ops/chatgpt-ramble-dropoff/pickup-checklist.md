# Codex Pickup Checklist

Use this when picking up a packet from
`ops/chatgpt-ramble-dropoff/incoming/<packet-id>/` or a GitHub comment marked
`BNA_CHATGPT_DROPOFF_PACKET`.

## Audit First

- Confirm the packet has `packet.json`, `RAW.md`, `CODEX_PROMPT.md`,
  `MANIFEST.json`, and `status.json`.
- Confirm the packet source is trusted or explicitly operator-approved.
- Confirm the workspace/project scope is clear.
- Confirm no secrets or raw private data are present.
- Inspect the actual repo files before applying generated code.

## Apply Carefully

- Prefer repo patterns over ChatGPT's invented structure.
- Apply only the pieces that match inspected files.
- Split risky or broad changes into smaller requirements.
- Leave external writes, provider setup, access changes, payments, DNS,
  credentials, sends, and production data changes blocked unless explicitly
  approved.

## Close Out

- Run relevant focused tests first.
- Run broader watchdogs when the work affects shared behavior.
- Update the requirement register.
- Append `ops/agent-task-ledger.jsonl`.
- Append `ops/agent-changelog.md`.
- Update packet `status.json` or record why it stayed blocked.
