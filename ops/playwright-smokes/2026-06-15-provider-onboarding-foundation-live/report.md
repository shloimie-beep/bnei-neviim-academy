# Provider Onboarding Foundation Live Smoke

- Base URL: `https://bneineviimacademy.org`
- Result: PASS
- Deployment verified by Railway doctor before this smoke: `1a60aabe-b1a7-4adc-a788-de4e71abd0bd`
- Public API: `GET /api/service-providers` returned sanitized provider data without password/setup/refresh/access-token fields.
- Browser routes checked: `/service-providers`, `/providers/join`, `/provider/login`, `/parent/login`.
- Screenshots: `service-providers-desktop.png`, `service-providers-mobile.png`, `providers-join-desktop.png`, `provider-login-desktop.png`, `parent-login-desktop.png`.
- Guardrail: no provider signup, provider intake submission, parent-provider message, provider reply, email, WhatsApp, billing, Google API call, connector write, or external CRM write was executed.

## Checks

- PASS GET /api/service-providers returned 200
- PASS Public provider API returns an array payload
- PASS Public provider API does not expose password_hash
- PASS Public provider API does not expose setup_token
- PASS Public provider API does not expose refresh_token
- PASS Public provider API does not expose access_code
- PASS Public provider API does not expose student_access_code
- PASS Public provider API does not expose parent_password_hash
- PASS Public provider API does not expose raw credentials
- PASS Public provider cards omit direct contact_email field
- PASS Public provider cards omit password_hash field
- PASS Service provider index renders public provider CTA
- PASS Service provider index links parent login
- PASS Service provider index does not render private credential terms
- PASS Mobile service provider index renders CTA
- PASS Provider join page explains free listing behavior
- PASS Provider join page references the BNA index
- PASS Provider join page includes services offered field
- PASS Provider join page includes preferred CTA field
- PASS Provider join page no longer presents a screening queue
- PASS Provider join form exposes provider_name
- PASS Provider join form exposes contact_name
- PASS Provider join form exposes email
- PASS Provider join form exposes website
- PASS Provider join form exposes cta_preference
- PASS Provider join form exposes services_offered
- PASS Provider join form exposes community_affiliation
- PASS Provider login portal renders
- PASS Provider portal identifies scoped workspace
- PASS Provider portal renders login controls
- PASS Provider portal includes setup-token password flow markup
- PASS Provider portal includes Google Business profile readiness markup
- PASS Provider portal does not render secret fields
- PASS Parent login route renders without a session
- PASS Parent login route does not expose private student/provider message data while logged out
