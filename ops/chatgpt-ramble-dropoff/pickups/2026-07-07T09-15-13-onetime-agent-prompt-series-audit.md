# ChatGPT Dropoff Pickup Audit - onetime-agent-prompt-series-20260706-911

Packet:
`ops/chatgpt-ramble-dropoff/incoming/onetime-agent-prompt-series-20260706-911`

Task: `#1945`

Raw/source: `RAW-20260706-911`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Verdict

`done_verified` for prompt-packet pickup and repair.

The packet is prompt-generation/audit setup only. It contains no app patch and
does not authorize source implementation, deploy, sends, payments, access
grants, DNS, credential/account changes, Drive writes, provider mutations, or
production-data mutation.

## Audit Findings

- Required packet files are present:
  `packet.json`, `RAW.md`, `CODEX_PROMPT.md`, `MANIFEST.json`, `status.json`,
  `PROMPTS.md`, and `PATCHES.md`.
- `PATCHES.md` declares no patch content.
- Packet scope matches the current One Time source of truth:
  `rabbi_sheller_provider` / `one_time_mishnah_class`, black/yellow brand,
  canonical production host `https://join.onetimeonetime.com/`, and BNA
  `/one-time` as preview/fallback only.
- Initial packet `PROMPTS.md` contained the five prompt bodies but was not a
  normalized copy of the canonical source files. Prompt `05` was missing the
  source `Protocol Coverage` section with Product Quality Compiler,
  current-state visual audit, Definition of Ready, Definition of Done, and
  watchdog marker requirements.

## Repair Applied

- Rebuilt packet `PROMPTS.md` mechanically from the five canonical files under
  `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/`.
- Updated packet `status.json` to `done_verified` with evidence and next
  action.
- Updated requirement register
  `tasks-pending/2026-07-06-onetime-full-ui-agent-audit-prompts.md` with
  `REQ-20260706-915`.

## Verification

- PASS normalized comparison confirmed packet `PROMPTS.md` contains all five
  canonical prompt files.
- PASS readback confirmed Prompt `05` contains `## Protocol Coverage`,
  `Product Quality Compiler expansion`, `Definition of Ready`,
  `current-state visual audit`, and `Exact watchdog markers`.
- PASS packet `PROMPTS.md` SHA256:
  `F4EE0A7EF01DCD496C136230265C28504EA916278AFB0A840891DFBC5247748B`.
- PASS `npm run chatgpt:dropoff:scan`: packet skipped as terminal
  `done_verified`; `queued_count` stayed `0`.
- PASS `npm run watchdog:protocol-drift`: `finding_count` `0`.
- PASS `npm run secrets:audit`: `6530` tracked paths checked and `0` tracked
  secret-risk files found.
- PASS PowerShell JSON parse for packet/status/report/watchdog JSON and
  `ops/agent-task-ledger.jsonl`.

Note: two JavaScript one-liner attempts failed because PowerShell stripped
quoted strings from the `node -e` payload. They were replaced with the passing
native PowerShell JSON parse above.

## Next Action

Run Prompt `01` first. After it creates the route/surface map, run Prompts
`02`, `03`, and `04`. Run Prompt `05` after at least two audit reports have
dropped repo-visible packets or marked GitHub comments.
