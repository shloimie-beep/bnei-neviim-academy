# One Time Trial Referral Live Smoke - 2026-06-21T14:50:38.537Z

App: https://bneineviimacademy.org
Result: passed

## Checks
- PASS Operations login: cookie bna_ops_session
- PASS Trial/referral config API responds with no-write policy: 30-day trial, $67 renewal, card rule, first-paid-cycle referral, and no-write gates returned
- PASS Operations ships trial/referral UX markers: Trial/referral panel markers shipped

## Policy Snapshot
- Trial days: 30
- Renewal cents: 6700
- Card required: true
- Referral trigger: first_successful_paid_cycle
- Acceptance table: bna_one_time_policy_acceptances
- Promotion policy count: 3

## Guardrails
- Smoke is read-only: it does not create checkout sessions, payment links, charges, invoices, invoice credits, access grants, email sends, WhatsApp sends, or external CRM writes.
- The report records policy metadata only and does not include raw private contact bodies or payment credentials.
