# One Time Vimeo, Zoom, Resend, and Stripe Readiness

The One Time readiness contract reports safe local status for the provider
families needed by the partner program:

- Vimeo or video hosting for recordings and library publication
- Zoom for live class sessions and meeting automation
- Resend for verified-domain email
- Stripe for local/test-mode enrollment and payment mocks

`src/platform/integrations/media-local-pipeline.js` also combines the Vimeo and
Zoom readiness cards with a no-write local media handoff for Zoom recordings,
Vimeo URLs, and approved drop-folder videos.

The route `/api/bna/one-time/integrations/readiness` returns preview-only cards.
It must not expose secret values, create meetings, upload videos, send email,
charge cards, change DNS, deploy, or write production data.

External gates remain until the operator approves account ownership, credential
entry, DNS records, provider verification, deploy, and live smoke.
