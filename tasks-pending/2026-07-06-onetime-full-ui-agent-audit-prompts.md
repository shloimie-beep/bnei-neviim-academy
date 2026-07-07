# 2026-07-06 - One Time Full UI Agent Audit Prompt Series

Raw source: `RAW-20260706-911`

Workspace/project: `rabbi_sheller_provider / one_time_mishnah_class`

Purpose: give Shloimie a small series of high-quality ChatGPT Agent Mode prompts
for a full front-end/product-readiness audit of the One Time system, with exact
links and a repo-visible report dropoff path.

## Requirement Register

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| REQ-20260706-911 | Create a ChatGPT meta-prompt that can write the One Time Agent Mode prompt series into the repo-visible dropoff workflow. | Done | `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/00-chatgpt-meta-prompt.md` |
| REQ-20260706-912 | Create multiple Agent Mode audit prompts for a full One Time front-end/product-readiness audit. | Done | Prompt files `01` through `05` in the packet folder |
| REQ-20260706-913 | Include exact live links, routes, scopes, login handling, safety boundaries, and report dropoff instructions. | Done | README plus each prompt's `Dropoff` and `Routes` sections |
| REQ-20260706-914 | Cover toolbar/font/filter/nav/category/subcategory consistency, dead-end links, irrelevant information, cross-scope leaks, bot testing, and production-readiness click testing. | Done | Audit checklist sections in each prompt |
| REQ-20260706-915 | Audit and repair the ChatGPT dropoff packet `onetime-agent-prompt-series-20260706-911` after agent-fleet pickup. | Done | Packet `PROMPTS.md` rebuilt from the five canonical prompt source files; `status.json` set to `done_verified`; evidence report `ops/chatgpt-ramble-dropoff/pickups/2026-07-07T09-15-13-onetime-agent-prompt-series-audit.md` |

## Prompt Files

- `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/00-chatgpt-meta-prompt.md`
- `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/01-control-tower-current-state-agent-mode.md`
- `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/02-public-funnel-agent-mode.md`
- `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/03-rabbi-operations-backend-agent-mode.md`
- `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/04-portals-classroom-agent-mode.md`
- `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/05-cross-system-consistency-agent-mode.md`

## Recommended Run Order

1. Run `01-control-tower-current-state-agent-mode.md` first.
2. Run prompts `02`, `03`, and `04` in parallel after the control-tower agent
   confirms the target map.
3. Run `05-cross-system-consistency-agent-mode.md` after at least two of the
   surface audits have dropped reports.

## Safety

- No source edits.
- No deploys.
- No external sends or payments.
- No access grants, DNS changes, provider account mutations, Drive writes, or
  production data mutations.
- Login may happen only through browser takeover; no credentials in prompts,
  packets, comments, screenshots, or chat output.

## Codex Pickup Audit - 2026-07-07

Task: live task `#1945` / packet
`ops/chatgpt-ramble-dropoff/incoming/onetime-agent-prompt-series-20260706-911`.

Audit finding:

- The packet was valid prompt-generation scope and contained no patches or app
  implementation request.
- `PROMPTS.md` contained the five prompt bodies, but it was not a normalized
  copy of the canonical source prompt files. The most important gap was Prompt
  `05`, where the source file's `Protocol Coverage` section was absent from the
  dropoff packet.

Repair:

- Rebuilt packet `PROMPTS.md` mechanically from:
  - `01-control-tower-current-state-agent-mode.md`
  - `02-public-funnel-agent-mode.md`
  - `03-rabbi-operations-backend-agent-mode.md`
  - `04-portals-classroom-agent-mode.md`
  - `05-cross-system-consistency-agent-mode.md`
- Updated packet `status.json` to `done_verified`.

Closeout:

- The prompts are ready for Shloimie or a GitHub-connected Agent Mode session to
  run in the existing order: `01` first, `02`/`03`/`04` after the control-tower
  map, and `05` after at least two audit reports exist.
- Verification passed:
  - normalized prompt comparison confirmed the packet contains all five
    canonical prompt files;
  - `npm run chatgpt:dropoff:scan` skipped the packet as terminal
    `done_verified` with `queued_count` `0`;
  - `npm run watchdog:protocol-drift` produced `finding_count` `0`;
  - `npm run secrets:audit` found `0` tracked secret-risk files;
  - packet/status/report/watchdog JSON and `ops/agent-task-ledger.jsonl`
    parsed successfully.
- No product UI implementation, source app code, deploy, external send,
  payment/access/DNS, credential, provider-account, Drive, or production-data
  mutation was performed.
