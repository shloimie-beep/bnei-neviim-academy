# One Time UI Consistency And View-As Agent Audit Prompts

Raw source: `RAW-20260707-004`

Related evidence:

- `ops/ui-audits/2026-07-07-telegram-updates-onetime-ui-access/report.md`
- `ops/system-audits/2026-07-07-agent-mode-prompt-reconciliation.md`
- `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/`

Workspace/project:
`rabbi_sheller_provider` / `one_time_mishnah_class`

## Purpose

These prompts are for ChatGPT Agent Mode to audit the parts of the One Time UI
that the earlier prompt series did not fully close:

- consistency of categories, subcategories, filters, toolbars, and buttons;
- clear login-once navigation from Shloimie's Super Admin login into Rabbi /
  provider and student/member perspectives;
- brand separation between BNA Academy and One Time while keeping component
  behavior consistent.

The prompts are audit-only. They do not ask agents to edit code, deploy, send
messages, charge cards, grant access, change DNS, write Drive files, mutate
provider accounts, or change production data.

## Prompt Files

1. `01-navigation-filter-consistency-agent-mode.md`
2. `02-view-as-navigation-agent-mode.md`
3. `03-role-perspective-screen-matrix-agent-mode.md`
4. `04-consistency-view-as-synthesis-agent-mode.md`

## Recommended Run Order

Run `01` and `02` first. Run `03` after `02` identifies the available
view-as/access paths. Run `04` after at least two reports exist.

## Dropoff Rule

Each Agent Mode run must create a repo-visible packet under:
`ops/chatgpt-ramble-dropoff/incoming/<packet-id>/`

Required files:

- `packet.json`
- `RAW.md`
- `CODEX_PROMPT.md`
- `MANIFEST.json`
- `status.json`
- `FINDINGS.md`
- optional redacted `SCREENSHOT_INDEX.md`
- optional redacted `attachments/`

Set `status.json` to `ready_for_codex_audit`.

Fallback: post a marked GitHub issue/PR comment using
`BNA_CHATGPT_DROPOFF_PACKET`.

Last resort: return `CANNOT_WRITE_GITHUB: <exact error>`.

Do not use `/mnt/data`, a ZIP, local downloads, or screenshot-only answers as
the only handoff.
