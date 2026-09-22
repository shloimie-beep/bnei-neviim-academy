# Email/Resend UX Live Smoke - 2026-07-07T04:39:25.748Z

App: https://bneineviimacademy.org
Result: passed

## Steps
- PASS health endpoint reachable (560ms)
- PASS Resend health separates provider, sender, and domain readiness (706ms)
- PASS Resend domain endpoint is readable or safely blocked (360ms)
- PASS Resend webhook events endpoint hides raw payload by default (254ms)
- PASS Configured Resend domain status endpoint is readable or safely blocked (498ms)
- PASS Operations Email UX runtime at 1024px (12375ms)
- PASS Operations Email UX runtime at 390px (15986ms)

## Summary
- resend_health_checked: true
- resend_domain_endpoint_readable: true
- resend_events_endpoint_readable: true
- provider_sender_domain_separated: true
- external_send_performed: false
- runtime_widths_checked: 1024, 390
