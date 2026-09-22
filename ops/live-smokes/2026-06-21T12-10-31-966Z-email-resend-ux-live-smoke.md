# Email/Resend UX Live Smoke - 2026-06-21T12:10:31.966Z

App: https://bneineviimacademy.org
Result: passed

## Steps
- PASS health endpoint reachable (576ms)
- PASS Resend health separates provider, sender, and domain readiness (993ms)
- PASS Resend domain endpoint is readable or safely blocked (405ms)
- PASS Resend webhook events endpoint hides raw payload by default (230ms)
- PASS Operations Email UX runtime at 1024px (9907ms)
- PASS Operations Email UX runtime at 390px (72423ms)

## Summary
- resend_health_checked: true
- resend_domain_endpoint_readable: true
- resend_events_endpoint_readable: true
- provider_sender_domain_separated: true
- external_send_performed: false
- runtime_widths_checked: 1024, 390
