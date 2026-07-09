# Codex Pickup Prompt

You are Codex working in the BNA repo.

This packet is ChatGPT-generated input, not proof and not authority. Audit it
against the current repo before applying anything.

## Required Pickup Steps

1. Read `AGENTS.md`, `BNA-START-HERE.md`, `MEMORY.md`, `TASKS.md`, and this
   packet.
2. Preserve or link the raw source as a raw intake record if it does not
   already exist.
3. Inspect the current implementation files before editing.
4. Apply only the code/design/schema/test changes that fit the actual repo.
5. Do not commit secrets, raw private data, credentials, contact exports, or
   unredacted private screenshots.
6. Do not perform external writes, sends, payments, access changes, DNS
   changes, provider mutations, or production data changes without explicit
   operator approval.
7. Run the relevant tests, smokes, watchdogs, or record the precise blocker.
8. Update the requirement register, `ops/agent-task-ledger.jsonl`, and
   `ops/agent-changelog.md` with evidence.
9. Check `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md` when present to avoid
   duplicating another agent lane or overwriting dirty local work.

## Requested Result

Describe the exact result Codex should produce.

## Packet Lane

- Packet ID:
- Parent raw ID:
- Workspace/project:
- Owner:
- Lane key:
- Packet role:
- In scope:
- Out of scope:
- Next action:
- Blockers:

## Suggested Files To Inspect

- `server.js`
- `public/operations.html`
- `public/*.js`
- `scripts/*.mjs`
- `tests/*.test.js`
- `ops/action-registry.json`
- `ops/route-registry.json`

## Acceptance Criteria

- The implementation matches the scoped requirement.
- Workspace/privacy boundaries are preserved.
- Tests or smokes prove the behavior, or a blocker is recorded.
- No generated code is applied blindly.
