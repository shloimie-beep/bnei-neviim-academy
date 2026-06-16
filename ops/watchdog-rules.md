# BNA Watchdog Rules

Last updated: 2026-06-16

The watchdog is the repo-backed quality and completion layer for long rambles,
prompt packets, Codex work, Telegram captures, Operations tasks, and live-proof
status. It does not replace the agent-fleet runtime watchdog; it audits whether
the system is still aligned with Shloimie's stated goals.

## Source-Of-Truth Rules

- Treat `AGENTS.md`, `MEMORY.md`, `TASKS.md`, `SYSTEM-STATE.md`,
  `ops/agent-task-ledger.jsonl`, `ops/agent-changelog.md`,
  `ops/operating-goals.*`, `ops/prompt-intake-register.jsonl`,
  `tasks-pending/*.md`, and `memory/YYYY-MM-DD.md` as the canonical operating
  trail.
- Do not mark app-visible, server-visible, dashboard-visible, or user-facing
  work done until deployment and live smoke proof exist, unless the record says
  it is local-only or staged.
- Source-of-truth updates must record what changed, where it changed, what was
  verified, what was not deployed, and what remains blocked.
- Append ledger/changelog records; do not rewrite history to hide uncertainty.

## Ramble Intake Rules

- A long ramble is valid input. Capture the raw source in daily memory or a
  prompt register path, then distill it into goals, decisions, pending blockers,
  Codex work, proof requirements, and handoffs.
- Do not use raw ramble text as a visible task title. Visible work should be
  concise, rephrased, and actionable.
- Re-run `npm run prompts:audit` when new Downloads files, Codex attachments,
  prompt zips, Telegram exports, or prompt-like handoffs appear.
- Every prompt/ramble source should end with one of: mapped to task/decision/
  pending/proof, blocked with owner, superseded, deployed verified, or done
  verified.

## Decision Rules

- A decision is a human choice that changes direction, risk, budget, account
  ownership, legal/payment posture, or publication behavior.
- Decisions should name the needed owner: Shloimie, Rabbi, both, provider,
  account owner, or external party.
- Decision comments must either move status, create follow-up work, or leave an
  explicit "still waiting" note.
- Codex must not convert missing external approval into hidden implementation
  work.

## Pending Blocker Rules

- `Pending` means a human or external system is blocking progress. It must not
  mean "waiting for Codex."
- Credentials, DNS, billing, account ownership, OAuth, media assets, legal copy,
  provider opt-in, and source artifacts belong in Pending or Decisions, not as
  vague Codex tasks.
- Thursday access items live in `ops/thursday-access-checklist.md` and should
  remain visible in Operations until resolved.

## Done/Proof Rules

- "Done" means the actual goal is met with proof, not just that code exists.
- Local verification should use `local_verified` or equivalent wording until an
  approved deploy/live smoke is complete.
- Proof should point to tests, screenshots, live-smoke reports, audit reports,
  deployment IDs, or direct readback paths.
- Done records without proof links should be downgraded to "done needs proof" or
  reopened as a proof-only follow-up.

## UI Quality Rules

- Operations must show Decisions, Pending, Codex Work, Proof, Blocked, Done,
  prompt/proof gaps, Thursday blockers, and UI audit issues without becoming a
  second messy queue.
- UI must remain readable on mobile and desktop, with no horizontal overflow at
  phone widths.
- Duplicate helper launchers, broken buttons, unreadable cards, faint panels,
  and stale local-only proof labels are watchdog findings.
- If screenshot tooling is available, UI issues should include screenshot path,
  viewport, route, and what was visually checked.

## Integration/Secret Rules

- Provider-owned integrations are the default for One Time and future provider
  workspaces.
- Raw secrets must stay in the BNA keyholder, Railway env, or approved secret
  stores. They must not appear in chat, tracked files, screenshots, prompt
  summaries, task titles, or logs.
- Diagnostics may report only metadata, configured/not-configured state,
  fingerprints, lengths, and redacted provider/account labels.
- External reads/writes must remain preview-first unless the account, scope,
  owner, and confirmation phrase are explicit.

## Child/Student Safety Rules

- Parent/student/provider helpers must be scoped by current user, workspace,
  role, permissions, data access, tone/knowledge base, and child-safety rules.
- Student helpers must not expose admin tools, other students' records, parent
  private notes, billing data, or provider admin data.
- Public pages may show aggregate Torah progress only; individual student data
  stays in authenticated, scoped contexts.

## External Action Approval Gates

The following require explicit confirmation before any live external action:

- Send email
- Publish or schedule Buffer posts
- Send WAPI/WhatsApp messages
- Create Zoom meetings or apps
- Upload or publish Vimeo videos
- Create Stripe products, prices, checkout sessions, webhooks, or charges
- Change DNS or domain routing
- Grant member/library access
- Delete/archive production records
- Write to Google Drive, Calendar, Classroom, Business Profile, or provider
  systems

## Helper Watchdog Tool Staging

The existing helper architecture already has scoped context, tool registry,
action planning, confirmation gates, audit logging, and result links. The
watchdog goal stages these next natural-language operating tools:

- `capture_ramble`
- `distill_ramble`
- `create_goal`
- `update_goal_status`
- `create_decision`
- `create_pending_item`
- `create_codex_task`
- `link_prompt_to_goal`
- `run_watchdog_audit`
- `show_thursday_blockers`
- `show_goal_status`
- `mark_pending_received`
- `mark_decision_answered`
- `create_ui_audit_issue`

These tool names are staged until each can be wired to existing first-party
tables or explicit new schema without duplicating the current helper registry.
