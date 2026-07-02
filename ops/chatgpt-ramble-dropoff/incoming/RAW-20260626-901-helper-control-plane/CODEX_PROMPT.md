# CODEX IMPLEMENTATION PROMPT - REQ-20260626-901

You are Codex working in `shloimie-beep/bnei-neviim-academy`.

## Start by reading

1. `AGENTS.md`
2. `BNA-START-HERE.md` if present
3. `docs/BNA-RAMBLE-TO-DONE.md` if present
4. `ops/chatgpt-ramble-dropoff/incoming/RAW-20260626-901-helper-control-plane/packet.json`
5. `tasks-pending/2026-06-26-chatgpt-ramble-agent-dropoff.md`

## Mission

Implement the ChatGPT → Ramble Packet → Agent Queue → Codex Run → Result Record workflow and apply the attached helper control-plane package.

The operator wants ChatGPT to be the first ramble/audit/code-writing surface. ChatGPT will generate concrete repo-ready code and drop it into a repo-visible packet. The background agent fleet/Codex must be able to pick up that packet, apply it, test it, and record proof.

## Hard constraints

- Do not use `/mnt/data` or any ChatGPT sandbox path as the real queue.
- The real queue is repo-visible:
  `ops/chatgpt-ramble-dropoff/incoming/`
- Preserve existing raw-intake protocol. The repo already treats raw rambles as first-class source input.
- Do not replace existing agent-fleet behavior. Add a safe pickup path.
- Do not perform external writes, sends, deploys, charges, DNS changes, credential changes, or live access grants.
- Every done claim requires tests/evidence/result record.

## Step 1 - Apply generated files

Copy the files from this packet into the repo root:

- `src/lib/bna/ramble-agent-dropoff/packet.js`
- `src/lib/bna/ramble-agent-dropoff/filesystem-queue.js`
- `scripts/chatgpt-ramble-dropoff.mjs`
- `scripts/agent-fleet-ramble-dropoff.mjs`
- `tests/chatgpt-ramble-dropoff.test.js`
- `ops/chatgpt-ramble-dropoff/AGENTS-ADDENDUM.md`

Then unzip and apply:

`ops/chatgpt-ramble-dropoff/incoming/RAW-20260626-901-helper-control-plane/attachments/bna-helper-control-plane-code.zip`

Apply the helper-control-plane bundle carefully:
- copy new files directly
- inspect conflicts
- do not overwrite unrelated hand-written code blindly

## Step 2 - Wire scripts

Update `package.json` scripts with:

```json
{
  "ramble:dropoff:create": "node scripts/chatgpt-ramble-dropoff.mjs",
  "ramble:dropoff:pickup": "node scripts/agent-fleet-ramble-dropoff.mjs",
  "ramble:dropoff:once": "node scripts/agent-fleet-ramble-dropoff.mjs --once",
  "ramble:dropoff:status": "node scripts/agent-fleet-ramble-dropoff.mjs --status"
}
```

## Step 3 - Wire agent fleet

Inspect `scripts/agent-fleet-supervisor.mjs`.

Add one of these, using the least invasive approach:
1. On each agent-fleet loop, call the drop-off queue claim function once.
2. Or make `agent:fleet:once` run `ramble:dropoff:once` before normal queue reconciliation.
3. Or document the supervisor-controlled command if direct integration is too risky.

Expected result:
- when a packet exists in `ops/chatgpt-ramble-dropoff/incoming/*/status.json` with status `queued`,
- the agent can claim it,
- generate raw-input and tasks-pending readbacks,
- append `ops/agent-task-ledger.jsonl`,
- mark status `claimed` or `picked_up`,
- and start/continue the Codex implementation run.

## Step 4 - Update AGENTS.md

Merge `ops/chatgpt-ramble-dropoff/AGENTS-ADDENDUM.md` into `AGENTS.md`.

The rule must say:
- all broad rambles go through ChatGPT first when Shloimie is using ChatGPT,
- ChatGPT audits context and writes repo-ready code/packet,
- ChatGPT drops the packet into repo-visible drop-off, not sandbox,
- Codex/agent fleet picks up only repo-visible packets,
- done requires evidence.

## Step 5 - Verification

Run:

```bash
node --test tests/chatgpt-ramble-dropoff.test.js
node --test tests/helper-control-plane.test.js
node --test tests/helper-control-plane-matrix.test.js
npm test
```

Also run the new dry pickup manually:

```bash
node scripts/agent-fleet-ramble-dropoff.mjs --status
node scripts/agent-fleet-ramble-dropoff.mjs --once --dry-run
```

## Step 6 - Result record

Append or create the appropriate result/evidence records using existing repo conventions:
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`
- execution-run status/evidence files if this creates a run
- Agent Review Hub result if applicable

The final response must include:
- files changed
- tests run
- pass/fail/blockers
- exact remaining integration points
- whether helper-control-plane bundle was applied
- whether drop-off pickup was wired into the agent fleet
