# One Time Full UI Agent Audit Prompt Series

Raw source: `RAW-20260706-911`

Workspace/project: `rabbi_sheller_provider / one_time_mishnah_class`

Canonical One Time production target: `https://join.onetimeonetime.com/`

BNA preview/fallback target: `https://bneineviimacademy.org/one-time/`

## What This Packet Is

This packet gives Shloimie a small set of prompts for ChatGPT Agent Mode to run
a full front-end/product-readiness audit of the One Time system.

The prompts are audit-only. They do not ask agents to edit code, deploy,
change data, send messages, charge cards, grant access, rotate credentials, or
touch external provider accounts.

## Files

- `00-chatgpt-meta-prompt.md`: give this to a GitHub-connected ChatGPT session
  when you want ChatGPT to prepare repo-visible Agent Mode prompt packets.
- `01-control-tower-current-state-agent-mode.md`: route map, surface inventory,
  shared checklist, and child-audit coordination.
- `02-public-funnel-agent-mode.md`: public landing/signup/member-login funnel.
- `03-rabbi-operations-backend-agent-mode.md`: logged-in Rabbi Operations,
  backend UI, categories, subcategories, filters, CRM, WhatsApp, Studio, and
  action states.
- `04-portals-classroom-agent-mode.md`: provider, member, parent, student,
  classroom, and email review portals.
- `05-cross-system-consistency-agent-mode.md`: toolbar/font/filter/nav
  consistency synthesis and implementation-packet recommendations.
- `agent-mode-prompt-series.json`: machine-readable manifest.

## Report Dropoff Rule

Each Agent Mode run must report in one of these ways:

1. Preferred repo-file packet:
   `ops/chatgpt-ramble-dropoff/incoming/<packet-id>/`
2. Fallback marked GitHub issue/PR comment with marker:
   `BNA_CHATGPT_DROPOFF_PACKET`
3. Last resort chat output:
   the complete packet file tree and contents, only if GitHub file/comment
   write access fails.

Do not use `/mnt/data`, a ZIP, a local download, or a screenshot-only answer as
the only handoff. Codex cannot automatically pick those up.

## Recommended Parallel Plan

Run `01` first. After it creates the target map, run `02`, `03`, and `04` in
parallel. Run `05` last as the synthesis pass.

Suggested timeboxes:

- `01`: 15-25 minutes.
- `02`: 20-35 minutes.
- `03`: 35-60 minutes because it is the biggest logged-in surface.
- `04`: 25-45 minutes.
- `05`: 20-35 minutes after the other reports exist.

## Login Rule

If an agent reaches a login page, it should ask for browser takeover and let
Shloimie type credentials directly into the browser. The agent must not ask
for, store, screenshot, or repeat passwords, cookies, API keys, recovery codes,
or session tokens.

## Universal Defect Codes

- `P0-SCOPE`: private, wrong-workspace, wrong-role, or secret exposure.
- `P0-ACTION`: unsafe send, payment, access grant, DNS, deploy, provider
  mutation, or data write path exposed without approval.
- `P1-BROKEN`: route, page, tab, filter, action, or login path is broken.
- `P1-DEADEND`: button/link opens nowhere, stale placeholder, or no useful
  empty state.
- `P1-IA`: category/subcategory/filter placement is confusing or inconsistent.
- `P2-TOOLBAR`: toolbar, topbar, tab, or filter pattern differs from sibling
  pages without a reason.
- `P2-TYPOGRAPHY`: font, size, spacing, or hierarchy differs from One Time
  black/yellow brand shell or the public website.
- `P2-RELEVANCE`: irrelevant backend/admin/debug/super-admin information is
  visible to Rabbi/provider/member/parent/student roles.
- `P2-RESPONSIVE`: overflow, overlap, clipped controls, unreadable mobile, or
  broken tablet layout.
- `P2-BOT`: bot/helper gives wrong links, wrong scope, fake claims, or unsafe
  action guidance.
- `P3-POLISH`: visual polish, copy, empty state, or hierarchy issue that does
  not block production.

## Universal Output Shape

Every audit packet should include:

- `packet.json`
- `RAW.md`
- `CODEX_PROMPT.md`
- `MANIFEST.json`
- `status.json`
- `FINDINGS.md`
- optional `SCREENSHOT_INDEX.md`
- optional redacted `attachments/`

Set `status.json` to `ready_for_codex_audit`.
