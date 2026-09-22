# One Time Vimeo, Zoom, and Resend Readiness

The One Time readiness contract reports safe local status for the three
provider families needed by the partner program:

- Vimeo for recordings and library publication
- Zoom for live class sessions and meeting automation
- Resend for verified-domain email

The route `/api/bna/one-time/integrations/readiness` returns preview-only cards.
It must not expose secret values, create meetings, upload videos, send email,
change DNS, deploy, or write production data.

Vimeo is the selected One Time video-hosting direction. Manual Vimeo URL
attachment and approval-gated first-party member-library publishing are usable
now. Automated Vimeo upload remains disabled until the operator approves the
authenticated Vimeo user, account owner, plan/quota, upload scope, folder,
privacy default, allowed embed domains, callback URL, token state, deploy, and
live upload smoke.

External gates remain until the operator approves account ownership, credential
entry, DNS records, provider verification, deploy, and live smoke.
