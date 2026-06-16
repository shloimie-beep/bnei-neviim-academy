# Agent Work Gap Audit

Cycle ID: `2026-06-16-one-time-integrations-access-agent-audit`

## Goal

Audit prior prompt/agent work against actual repo evidence so work is not marked
complete just because a task, prompt, or agent response says it is complete.

## Prompt Packet Workstreams To Audit

1. `01_chatgpt_pro_ui_brand_public_operations.md`
2. `02_chatgpt_pro_operations_workflows_data_tasks_decisions.md`
3. `03_chatgpt_pro_agentic_bna_helper_scoped_tools.md`
4. `04_chatgpt_pro_rabbi_scheller_product_funnels_calendar_pricing.md`
5. `05_chatgpt_pro_integrations_zoom_vimeo_stripe_resend_buffer_telegram.md`
6. `06_chatgpt_pro_learning_community_course_gamification_parent_portal.md`
7. `07_chatgpt_pro_master_parallel_closeout_orchestrator.md`

## Evidence Standard

Mark a capability complete only when all relevant evidence exists:

- Code or data model exists in the active app path.
- UI/route/API exists in `server.js`, `public/operations.html`, or active public
  portal files, not only archived prototypes.
- Focused test or smoke exists and passes.
- Live/deployed evidence exists for app-visible/server-visible/dashboard-visible
  changes, unless explicitly recorded as local-only pending deploy.
- No known external blocker remains for that capability.

## Required Output

Create `ops/audits/2026-06-16-agent-work-gap-audit.md` with a gap table:

- Workstream
- Expected capabilities
- Repo evidence found
- Live/deployed evidence if smoke-tested
- Status: `not_started`, `partially_done`, `done_needs_proof`,
  `blocked_external`, or `implemented_verified`
- Files involved
- Tests/smokes run
- Next Codex task

Also summarize the audit in `SYSTEM-STATE.md`.

## Suspected Gaps To Check First

- UI brand/Operations consistency.
- Decision reprocess and Add Decision Comment behavior.
- Pending/access dedupe and received/done flow.
- One real BNA Helper with scoped server-side tools.
- Provider-scoped integrations and secret storage.
- Buffer, Resend, Vimeo, Zoom, WAPI, Stripe, and DNS readiness.
- Learning/community/course/gamification/parent portal proof.
- Task/ledger/changelog coherence.
- Local verified versus live deployed status drift.
