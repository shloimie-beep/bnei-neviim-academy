# Admin Users Local Smoke

Date: 2026-06-15

Target: `http://127.0.0.1:3000/operations?view=admin&section=users&workspace=platform`

## Setup

- Started local app with throwaway smoke credentials:
  `OPS_USERNAME=local-smoke-admin` and `OPS_PASSWORD=local-smoke-password`.
- Used the local Operations login API to create a short-lived local access link
  for the smoke account.
- Opened the access link in the in-app browser and verified the rendered
  Operations Admin > Users route.

## Verified

- Operations redirects through local auth and returns to
  `view=admin&section=users&workspace=platform`.
- The `Users / External Access` panel renders.
- The panel shows:
  - `External Users`
  - `Internal Users`
  - `Access Link Gate`
  - `Parent account separation`
  - `One Time app credentials`
- Guardrail copy is visible:
  no email, WhatsApp, password reset, billing, member-library, or external
  connector write runs from this panel.
- The prior `NaN` metric issue is fixed; the access-link gate renders as a
  numeric readiness card.

## Guardrail

This smoke used local throwaway credentials and a local one-time access link
only. It did not send email or WhatsApp, create parent accounts, create One
Time app credentials, grant member-library access, publish, bill, write Google
or Buffer, or modify an external CRM.
