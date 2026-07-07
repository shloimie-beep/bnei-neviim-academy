# Email/Resend UX Live Smoke - 2026-07-07T06:53:21.693Z

App: https://bneineviimacademy.org
Result: passed

## Steps
- PASS health endpoint reachable (975ms)
- PASS Resend health separates provider, sender, and domain readiness (849ms)
- PASS Resend domain endpoint is readable or safely blocked (359ms)
- PASS Resend webhook events endpoint hides raw payload by default (369ms)
- PASS Configured Resend domain status endpoint is readable or safely blocked (351ms)
- PASS Operations Email UX runtime at 1024px (14041ms)
- PASS Operations Email UX runtime at 390px (11452ms)

## Summary
- resend_health_checked: true
- resend_domain_endpoint_readable: true
- resend_events_endpoint_readable: true
- provider_sender_domain_separated: true
- external_send_performed: false
- runtime_widths_checked: 1024, 390
