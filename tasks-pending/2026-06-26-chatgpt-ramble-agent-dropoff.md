# REQ-20260626-901 - Build ChatGPT Ramble Agent Drop-off + apply helper control plane

Source raw ID: `RAW-20260626-901`
Primary package: `ops/chatgpt-ramble-dropoff/incoming/RAW-20260626-901-helper-control-plane/attachments/bna-helper-control-plane-code.zip`
Package SHA256: `017ee06bef516c1cf378e58bb49dd6c70a484ba14c690af3c38f062067ea576f`

## Goal

Make the durable workflow real:

```text
Shloimie rambles to ChatGPT
→ ChatGPT audits the repo/system context
→ ChatGPT writes concrete implementation code
→ ChatGPT drops a structured packet into a repo-visible queue
→ the background agent fleet/Codex picks up the packet
→ Codex applies code, runs tests, records result
→ result is visible in the repo/app
```

## Required implementation

1. Add the ChatGPT ramble drop-off code in this package:
   - `src/lib/bna/ramble-agent-dropoff/packet.js`
   - `src/lib/bna/ramble-agent-dropoff/filesystem-queue.js`
   - `scripts/chatgpt-ramble-dropoff.mjs`
   - `scripts/agent-fleet-ramble-dropoff.mjs`
   - `tests/chatgpt-ramble-dropoff.test.js`

2. Apply the helper control-plane code package:
   - unzip `ops/chatgpt-ramble-dropoff/incoming/RAW-20260626-901-helper-control-plane/attachments/bna-helper-control-plane-code.zip`
   - copy its `src/`, `tests/`, `ops/`, and `docs/` files into repo root
   - do not overwrite unrelated files without inspecting conflicts

3. Update `AGENTS.md` with the addendum in:
   - `ops/chatgpt-ramble-dropoff/AGENTS-ADDENDUM.md`

4. Wire agent pickup:
   - inspect `scripts/agent-fleet-supervisor.mjs`
   - add a safe polling step or documented invocation for `scripts/agent-fleet-ramble-dropoff.mjs --once`
   - preserve existing `agent:fleet:*` behavior
   - do not make autonomous external writes

5. Add package scripts:
   - `ramble:dropoff:create`
   - `ramble:dropoff:pickup`
   - `ramble:dropoff:once`
   - optional `ramble:dropoff:status`

6. Run tests:
   - `node --test tests/chatgpt-ramble-dropoff.test.js`
   - `node --test tests/helper-control-plane.test.js`
   - `node --test tests/helper-control-plane-matrix.test.js`
   - `npm test`

## Acceptance criteria

- A ChatGPT-created packet under `ops/chatgpt-ramble-dropoff/incoming/*` can be claimed by the repo script.
- Claiming creates/updates:
  - a raw input markdown file under `raw-input/`
  - a Codex handoff under `tasks-pending/`
  - an append-only ledger row under `ops/agent-task-ledger.jsonl`
  - status files inside the drop-off packet
- Helper control-plane tests pass.
- No code assumes `/mnt/data` or any ChatGPT sandbox path is agent-visible.
- `AGENTS.md` says this is the standard ramble workflow:
  - ChatGPT first audits and writes code/packet
  - Codex/agent fleet applies repo-visible packets
  - Done requires tests/evidence/result record

## Codex closeout - 2026-06-26T11:26:05+03:00

Status: `Done` / `done_verified_local`

Implementation evidence:

- Created the repo-visible drop-off queue seed under
  `ops/chatgpt-ramble-dropoff/incoming/RAW-20260626-901-helper-control-plane/`.
- Added packet creation/queue helpers in `src/lib/bna/ramble-agent-dropoff/`
  and scripts `scripts/chatgpt-ramble-dropoff.mjs` plus
  `scripts/agent-fleet-ramble-dropoff.mjs`.
- Applied the helper control-plane bundle under
  `src/lib/bna/helper/control-plane/`, with the evaluation matrix and
  integration doc.
- Added `src/lib/bna/helper/destination-resolver.js` so generated
  route-control code resolves through the repo route registry.
- Restored the missing two-week class intake audit helper at
  `src/lib/bna/class-drive-intake-reconcile.js`, because full-suite
  verification exposed that pre-existing missing module.
- Added `ramble:dropoff:create`, `ramble:dropoff:pickup`,
  `ramble:dropoff:once`, and `ramble:dropoff:status` package scripts.
- Wired `scripts/agent-fleet-supervisor.mjs` to pick up one repo-visible
  ChatGPT drop-off packet before normal app task claiming, with dry-run
  support and `AGENT_FLEET_RAMBLE_DROPOFF=0` as the local disable switch.
- Merged the ChatGPT ramble drop-off protocol into `AGENTS.md`.
- Claimed packet `RAW-20260626-901-helper-control-plane`; packet
  `status.json` is now `done`.

Verification:

- PASS `node --check` for the new scripts, helper control-plane modules,
  destination resolver, class-drive reconcile helper, and supervisor.
- PASS `node --test tests/chatgpt-ramble-dropoff.test.js`.
- PASS `node --test tests/helper-control-plane.test.js`.
- PASS `node --test tests/helper-control-plane-matrix.test.js`.
- PASS `node scripts/agent-fleet-supervisor.mjs --once --dry-run --no-reconcile --no-telegram --max-tasks 1`.
- PASS `node scripts/agent-fleet-ramble-dropoff.mjs --once`; this created the
  ledger claim row and moved the packet to `picked_up` before closeout.
- PASS `node --test tests/two-week-class-intake-audit.test.js`.
- PASS `node scripts/generate-one-time-action-coverage.mjs`.
- PASS `node scripts/generate-universal-action-parity.mjs`.
- PASS `node --test tests/watchdog-action-registry.test.js`.
- PASS `npm test` with 1156/1156 passing.

Final audit:

| Acceptance criterion | Status | Evidence |
| --- | --- | --- |
| Repo-visible packet can be claimed | Done | `node scripts/agent-fleet-ramble-dropoff.mjs --once`; `status.json` updated |
| Claim creates/updates raw input | Done | `raw-input/RAW-20260626-901-chatgpt-ramble-agent-dropoff.md` |
| Claim creates/updates task handoff | Done | `tasks-pending/2026-06-26-chatgpt-ramble-agent-dropoff.md` |
| Claim appends ledger row | Done | `ops/agent-task-ledger.jsonl` `chatgpt_ramble_packet_claimed` row |
| Helper control-plane bundle applied | Done | `src/lib/bna/helper/control-plane/*`, tests passing |
| Agent fleet has safe pickup path | Done | `scripts/agent-fleet-supervisor.mjs` dry-run proof |
| No `/mnt/data` real queue assumption | Done | Queue root is `ops/chatgpt-ramble-dropoff/incoming/` |
| Evidence/result records exist | Done | This closeout, packet `status.json`, ledger, changelog |

Deployment/live smoke:

- Not run and not required for this local workflow batch. The packet explicitly
  forbids external writes, deploys, credential changes, DNS changes, sends, and
  live access grants. No public/server route was added in this batch.
