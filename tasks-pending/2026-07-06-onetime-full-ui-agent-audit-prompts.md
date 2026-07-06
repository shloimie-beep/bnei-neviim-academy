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
