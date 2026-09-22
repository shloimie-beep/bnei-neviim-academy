# Source

Primary source:
`raw-input/RAW-20260712-001-onetime-pr129-completion-followup.md`

This is a July 12 continuation prompt from the operator for the existing One
Time P0/P1 corrective lane. It explicitly says to continue PR #129 on branch
`codex/onetime-p0p1-corrective-20260711`, not create a competing
implementation or parallel PR.

Context sources:

- Prior raw packet:
  `raw-input/RAW-20260711-001-onetime-p0p1-owner-crm-landing-corrective.md`
- Prior run:
  `ops/execution-runs/2026-07-11-onetime-p0p1-owner-crm-landing-corrective/`
- Prior register:
  `tasks-pending/2026-07-11-onetime-p0p1-owner-crm-landing-corrective.md`
- Robot/image context:
  `raw-input/RAW-20260710-008-onetime-public-landing-asset-architecture-addendum.md`
  and `raw-input/RAW-20260710-009-onetime-robot-scheller-bubble-image.md`

PR truth at capture:

- PR URL: https://github.com/shloimie-beep/bnei-neviim-academy/pull/129
- PR head: `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`
- Base/master at audit time: `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a`
- Existing corrective commits:
  `e49bd3b00291818bb44e4a483fdd69b35f599c28`,
  `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`

Guardrails:

- No deploy, merge, external send, campaign, charge, access grant, historical
  import, DNS/account mutation, credential mutation, or external-provider write
  is authorized by this prompt.

P0 addendum:
`raw-input/RAW-20260712-002-onetime-signup-reminder-workflow-addendum.md`

The addendum keeps the same PR #129 delivery lane but changes the active
priority: the standalone `/one-time/signup` workflow, CRM capture, immediate
confirmation email, Rabbi Telegram alert, reminder dispatcher, WAPI gates, and
local-class preview now come before remaining landing polish and older
provider-login/ramble-service batches.

Additional addendum guardrails:

- No duplicate signup implementations.
- No public JavaScript or repo evidence containing the raw Zoom join URL.
- No Zoom host/start URL or new Zoom meeting creation.
- No portal/member/login/password/payment/access/classroom/recovery-code
  workflows from the signup form.
- No WhatsApp send unless the signup explicitly selects WhatsApp or both.
- No local-class contact activation until the operator personal end-to-end
  test passes and the scoped preview count is exactly three.
