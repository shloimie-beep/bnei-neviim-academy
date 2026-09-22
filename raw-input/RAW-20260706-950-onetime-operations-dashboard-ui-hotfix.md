# RAW-20260706-950 - One Time Operations Dashboard UI Hotfix

Source: codex_chat  
Captured at: 2026-07-06  
Workspace: `rabbi_sheller_provider`  
Project: `one_time_mishnah_class`

## Raw Source

Shloimie reported that he does not have logins for every page yet, but he is
currently looking at the One Time class Operations page and the UI is still not
fixed. He called out this live route:

`https://bneineviimacademy.org/operations?view=dashboard&section=overview&workspace=rabbi_sheller_provider`

He said the UI looks ridiculous and asked why it was not fixed already.

## Parsed Requirement

- `REQ-20260706-950`: The exact Rabbi / One Time Operations dashboard URL must
  render a scoped, professional One Time workspace view, not the generic BNA
  Operations dashboard with platform-internal queue/status material.
- The sidebar should not expose the full workspace directory categories for the
  scoped Rabbi provider workspace.
- Studio must be visible as a first-class One Time module.
- Short/internal labels such as `Comms`, `Auto`, `Connectors`, and `Setup`
  should be replaced with full, consistent labels.
- The top status chips on One Time Operations pages should be scoped to members,
  classes, Studio, and setup instead of generic Codex/student/platform alerts.

## Guardrails

- No passwords, cookies, raw contact exports, WhatsApp bodies, payment data, or
  private screenshots are stored here.
- No external sends, payment/access changes, DNS changes, provider-account
  mutations, Drive writes, or production data mutations are authorized by this
  raw input.
