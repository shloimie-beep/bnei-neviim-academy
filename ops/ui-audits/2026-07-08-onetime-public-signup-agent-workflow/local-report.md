# OneTime Public Signup Agent Workflow Local Smoke

Generated: 2026-07-08T16:10:23.979Z
Base URL: http://127.0.0.1:56805

## Landing Viewports

- desktop-1440: PASS, inputs=email, no old fields, no overflow, logoFilter=brightness(0) contrast(1.2), screenshot=ops/ui-audits/2026-07-08-onetime-public-signup-agent-workflow/desktop-1440-onetime-signup.png
- tablet-1024: PASS, inputs=email, no old fields, no overflow, logoFilter=brightness(0) contrast(1.2), screenshot=ops/ui-audits/2026-07-08-onetime-public-signup-agent-workflow/tablet-1024-onetime-signup.png
- tablet-768: PASS, inputs=email, no old fields, no overflow, logoFilter=brightness(0) contrast(1.2), screenshot=ops/ui-audits/2026-07-08-onetime-public-signup-agent-workflow/tablet-768-onetime-signup.png
- mobile-430: PASS, inputs=email, no old fields, no overflow, logoFilter=brightness(0) contrast(1.2), screenshot=ops/ui-audits/2026-07-08-onetime-public-signup-agent-workflow/mobile-430-onetime-signup.png
- mobile-390: PASS, inputs=email, no old fields, no overflow, logoFilter=brightness(0) contrast(1.2), screenshot=ops/ui-audits/2026-07-08-onetime-public-signup-agent-workflow/mobile-390-onetime-signup.png

## Synthetic Signup Submit

- PASS mocked no-send endpoint captured payload: {"email":"agent-mode+20260708@example.invalid","consent":"yes","source_landing_page":"/one-time#start-free"}
- No real lead, email, WhatsApp, checkout, payment, access grant, Zoom, Vimeo, Drive, or external provider write was performed.

## Agent Review Prompt Copy

- PASS prompt moved to lane: running
- PASS prompt start calls: 1
- PASS prompt copied result saves: 1
- Screenshot: ops/ui-audits/2026-07-08-onetime-public-signup-agent-workflow/agent-review-prompt-lanes.png
