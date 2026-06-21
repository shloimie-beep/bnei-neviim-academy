# One Time Vimeo, Zoom, and Resend Readiness

The One Time readiness contract reports safe local status for the three
provider families needed by the partner program:

- Vimeo or video hosting for recordings and library publication
- Zoom for live class sessions and meeting automation
- Resend for verified-domain email

The route `/api/bna/one-time/integrations/readiness` returns preview-only cards.
It must not expose secret values, create meetings, upload videos, send email,
change DNS, deploy, or write production data.

External gates remain until the operator approves account ownership, credential
entry, DNS records, provider verification, deploy, and live smoke.
