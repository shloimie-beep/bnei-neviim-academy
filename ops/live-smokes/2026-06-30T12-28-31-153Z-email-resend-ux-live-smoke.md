# Email/Resend UX Live Smoke - 2026-06-30T12:28:31.153Z

App: https://bneineviimacademy.org
Result: passed

## Steps
- PASS health endpoint reachable (678ms)
- PASS Resend health separates provider, sender, and domain readiness (975ms)
- PASS Resend domain endpoint is readable or safely blocked (371ms)
- PASS Resend webhook events endpoint hides raw payload by default (236ms)
- PASS Configured Resend domain status endpoint is readable or safely blocked (354ms)
- PASS Operations Email UX runtime at 1024px (10568ms)
- PASS Operations Email UX runtime at 390px (14191ms)

## Summary
- resend_health_checked: true
- resend_domain_endpoint_readable: true
- resend_events_endpoint_readable: true
- provider_sender_domain_separated: true
- external_send_performed: false
- runtime_widths_checked: 1024, 390
