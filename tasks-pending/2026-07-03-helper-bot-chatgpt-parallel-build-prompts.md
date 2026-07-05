# Helper Bot ChatGPT Parallel Build Prompts - 2026-07-03

## Raw intake

See `raw-input/RAW-20260703-004-helper-bot-chatgpt-parallel-build-prompts.md`.

## Purpose

Create prompts Shloimie can paste into multiple ChatGPT windows so ChatGPT can
prepare repo-ready code/spec packages for the workspace-scoped helper bot.
Codex will later audit and apply the generated package. This register does not
authorize product implementation by Codex yet.

## Output files

Prompt packet folder:

`ops/prompt-packets/2026-07-03-helper-bot-workspace-agent-chatgpt/`

Files:

- `README.md`
- `00-master-superprompt.md`
- `01-current-state-audit-capability-map.md`
- `02-scoped-query-filter-results.md`
- `03-action-execution-confirmation-tools.md`
- `04-agent-console-ui.md`
- `05-tests-smokes-codex-dropoff.md`

## Requirements

| ID | Requirement | Status |
|---|---|---|
| REQ-20260703-301 | Produce one master ChatGPT prompt for the whole helper bot build. | Done |
| REQ-20260703-302 | Produce separate parallel ChatGPT prompts so multiple windows can work on independent slices. | Done |
| REQ-20260703-303 | Require ChatGPT to hand back a repo-visible structured package compatible with Codex pickup. | Done |
| REQ-20260703-304 | Preserve helper privacy, workspace scope, no-GHL, no external-write, and confirmation-gate guardrails. | Done |
| REQ-20260703-305 | Harden parallel helper-bot dropoff pickup before packets arrive. | Done |

## Handoff rule

Each ChatGPT window should output a package into:

`ops/chatgpt-ramble-dropoff/incoming/helper-bot-workspace-agent-<packet-id>/`

If ChatGPT gets `403 Resource not accessible by integration` while trying to
write repo files, it must not return only a local ZIP/download link. It should
post a GitHub issue/PR comment marked `BNA_CHATGPT_DROPOFF_PACKET` with
complete fenced `### File: ...` blocks for every required file. Codex collects
those marked comments with `npm run chatgpt:dropoff:comments:apply`, then the
normal packet ingestor validates and queues them.

Required files in each package:

- `packet.json`
- `RAW.md`
- `CODEX_PROMPT.md`
- `MANIFEST.json`
- `status.json`
- `PATCHES.md` or complete replacement file sections
- optional `attachments/`

Codex must audit the package before applying code.

## Hardening closeout

`REQ-20260703-305` completed after the operator said he had sent the prompts:

- Prompt packet README now lists exact allowed parallel packet IDs.
- Each lane prompt tells ChatGPT to make the folder name, `packet.json`,
  `status.json`, and `MANIFEST.json` use the same exact packet ID.
- The `05-tests-smokes-codex-dropoff.md` sample packet ID now matches the
  required folder: `helper-bot-workspace-agent-05-tests-dropoff`.
- `scripts/chatgpt-dropoff-ingestor.mjs` now blocks missing ready status,
  mismatched packet IDs, unknown helper-bot lanes, helper-bot folder/ID
  mismatch, declared secrets, and declared external writes.
- Focused verification passed:
  `node --check scripts/chatgpt-dropoff-ingestor.mjs`;
  `node --check scripts/agent-fleet-supervisor.mjs`;
  `node --test tests/chatgpt-dropoff-ingestor.test.js tests/agent-fleet-hardening.test.js`
  10/10;
  `npm run chatgpt:dropoff:scan` packet_count=0 queued_count=0;
  `npm run agent:fleet:status` reports supervisor PID 21636 running with
  ChatGPT dropoff ingest enabled.
