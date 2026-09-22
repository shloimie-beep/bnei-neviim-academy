# Parallel Agent Mode, Mobile Audit, Communications Bug, Dashboard Cards, Email/CRM Status

Raw ID: `RAW-20260707-005`

Created: 2026-07-07 Asia/Jerusalem

Workspace/project: `bna_platform` plus `rabbi_sheller_provider` /
`one_time_mishnah_class`

Goal: Make the One Time Agent Mode audit prompts parallel-runnable, preserve
the operator's live UI observations, clarify email/CRM status, and queue the
communications-loop plus Rabbi dashboard card cleanup as exact audit/repair
requirements.

## Requirements

| ID | Requirement | Source | Workspace/project | Owner | Priority | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|---|---|---|
| `REQ-20260707-050` | Preserve this ramble and register the new parallel-agent/mobile/UI/email-status work. | `RAW-20260707-005` | `bna_platform` | Codex | P0 | none | Raw record and register exist with stable IDs and guardrails. | Done |
| `REQ-20260707-051` | Make Agent Mode audit prompts parallel-runnable. | `RAW-20260707-005` | `agent_ops` | Codex | P0 | `REQ-20260707-050` | Prompt series explains `01`, `02`, and `03` can run concurrently with unique packet IDs; `04` remains synthesis/join after at least two reports. | Done |
| `REQ-20260707-052` | Capture toolbar/top-section whitespace and mobile layout as audit findings. | `RAW-20260707-005` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Agent Mode then Codex | P0 | `REQ-20260707-032`, `REQ-20260707-051` | Agent/Codex packets explicitly audit desktop and mobile spacing, wasted top-section space, responsive collapse, and first-viewport usefulness. | Done for prompt/audit scope; implementation pending audit reports |
| `REQ-20260707-053` | Capture Communications section loop/bad-display bug. | `RAW-20260707-005` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Agent Mode then Codex | P0 | `REQ-20260707-051` | Audit packet identifies exact route, clicks/state transitions, loop trigger, screenshot evidence, console/network errors, and smallest repair packet. | Done for prompt/audit scope; implementation pending audit reports |
| `REQ-20260707-054` | Clarify email/CRM finished versus blocked status. | `RAW-20260707-005` | `bna_platform`; `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | P0 | none | Operator-visible status states what is deployed/live-verified and what remains no-send/guarded/blocked. | Done |
| `REQ-20260707-055` | Remove or gate non-actionable Super Admin/configuration cards from Rabbi dashboard view. | `RAW-20260707-005` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Agent Mode then Codex | P0 | `REQ-20260707-032`, `REQ-20260707-051` | Rabbi/provider dashboard shows only actionable, role-scoped cards; setup/config diagnostics move to Super Admin/support drawer or are hidden. | Done for prompt/audit scope; implementation pending audit reports |

## Product Quality Compiler

Trigger phrases: `run them all together`, `top toolbar`, `empty space`,
`mobile`, `communications section`, `keeps going in circles`, `terrible
display`, `emails`, `CRM`, `Rabbi dashboard`, `random information`, `super
admin stuff`, `not configured`, `yes configured`.

Implementation remains blocked until audit packets produce exact routes,
states, screenshots/blockers, route/action registry expectations, test plan,
and deploy/live-smoke requirements.

## Current Status Notes

- Email/Rabbi inbox switcher and scoped admin-on-provider path are already
  implemented, pushed, deployed, and live-verified under
  `tasks-pending/2026-07-07-onetime-super-admin-mailbox-and-provider-login.md`.
- Real email sending, bulk email, CRM/external writes, access grants, and
  provider mutations remain no-send/approval-gated unless a separate exact send
  packet is approved.
- Full fleet restart remains blocked by stale queue policy and Telegram poller
  ownership, but independent Agent Mode browser sessions can run separate audit
  prompts in parallel.

## Evidence / Files

- Raw intake:
  `raw-input/RAW-20260707-005-parallel-agent-mode-mobile-communications-dashboard-email-status.md`
- Existing current-state audit:
  `ops/ui-audits/2026-07-07-telegram-updates-onetime-ui-access/report.md`
- Existing prompt packet:
  `ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/`
- Email/provider-login status:
  `tasks-pending/2026-07-07-onetime-super-admin-mailbox-and-provider-login.md`
- Current email UX smoke:
  `ops/live-smokes/2026-07-07T06-53-21-693Z-email-resend-ux-live-smoke.md`
- Current One Time CRM smokes:
  `ops/live-smokes/2026-07-07T06-54-02-816Z-one-time-crm-contacts-ux-live-smoke.md`;
  `ops/live-smokes/2026-07-07T06-54-02-818Z-one-time-crm-import-dedupe-live-smoke.md`

## Verification Closeout

- PASS Agent Mode prompt manifest JSON parse.
- PASS `node --check scripts/audit-onetime-role-ui-current-state.mjs`.
- PASS `npm run app:smoke:email-resend-ux` at 1024 and 390 widths.
- PASS `npm run app:smoke:one-time-crm-contacts-ux`; readback reported
  `parent_leads_count` `2608` and `contact_communications_count` `152`.
- PASS `npm run app:smoke:one-time-crm-import-dedupe`; readback reported
  `preview_rows` `2`.
- PASS `npm run watchdog:protocol-drift`.
- PASS `npm run secrets:audit`.

## Operator Status Answer

- Done: Super Admin can filter/view BNA versus Rabbi/One Time inbox context in
  Operations, and can open the Rabbi provider portal through the scoped
  admin-on-provider path. This was implemented, pushed, deployed, and
  live-verified under `RAW-20260707-002`.
- Done/readback: One Time first-party CRM/contact review surfaces and import
  dedupe preview are live-smoked.
- Guarded/not done as live external automation: bulk email, real campaign
  sends, external CRM writes, access grants, payment actions, and provider
  mutations remain approval-gated/no-send.
- Pending UI implementation: toolbar/top-section spacing, mobile cleanup,
  Communications loop repair, and Rabbi dashboard non-actionable card cleanup
  remain pending Agent Mode audit reports and focused Product Quality Compiler
  packets.

## Guardrails

- No UI implementation until a focused Product Quality Compiler packet passes
  Definition of Ready.
- No broad agent-fleet restart until stale-job replay policy and Telegram
  poller ownership are clear.
- No shared passwords, credential capture, external sends, payment/access/DNS
  changes, provider-account mutation, Drive writes, or production-data writes.
