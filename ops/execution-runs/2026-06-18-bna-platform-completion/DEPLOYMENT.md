# Deployment

No deployment is allowed for this protocol/tooling setup.

The current task explicitly forbids deployment. App-visible June 18 remediation
requirements remain blocked until audit output exists and a later scoped
implementation/deploy path is approved.

2026-06-19 Agent Control Center note:

- Local implementation was added for Agent Control Center schema/API/UI/tests.
- This is not deployed.
- Do not deploy, run production migrations, or mutate production data until
  local DB/API/browser acceptance passes and Shloimie explicitly approves
  release/deployment.
- Because several Agent Control Center requirements are app-visible and marked
  `live_required`, they remain `needs_verification` or open rather than closed.
