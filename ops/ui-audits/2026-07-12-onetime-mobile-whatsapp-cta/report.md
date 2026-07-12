# One Time Mobile CTA And WhatsApp Icon Visual Proof

Generated: 2026-07-12T15:54:31.483Z

| Width | CTA visible first viewport | WhatsApp visible | BNA widget loaded | Overflow | Screenshot |
| --- | --- | --- | --- | --- | --- |
| 1440 | true (758-806) | true (816-878) | false | false | ops/ui-audits/2026-07-12-onetime-mobile-whatsapp-cta/landing-1440.png |
| 768 | true (630-678) | true (816-878) | false | false | ops/ui-audits/2026-07-12-onetime-mobile-whatsapp-cta/landing-768.png |
| 430 | true (488-534) | true (776-830) | false | false | ops/ui-audits/2026-07-12-onetime-mobile-whatsapp-cta/landing-430.png |
| 390 | true (437-483) | true (776-830) | false | false | ops/ui-audits/2026-07-12-onetime-mobile-whatsapp-cta/landing-390.png |

The WhatsApp launcher href stayed on `/api/one-time/public-whatsapp/redirect?intent=lead_capture` in every viewport.

## Local Runtime Route Smoke

Express was started from the isolated hotfix worktree with local-only dummy startup values: a dummy unreachable database URL, dummy Ops credentials, and a dummy non-production WhatsApp number.

Result:

- `/api/one-time/public-whatsapp` returned `configured: true`, `assistant_name: "One Time WhatsApp"`, `full_number_returned: false`, `no_whatsapp_sent: true`, and `external_write_performed: false`.
- `/api/one-time/public-whatsapp/redirect?intent=lead_capture` returned `302` to `wa.me`.
- The composed WhatsApp URL included `My name is:`, `My location is:`, and `please ask me for it instead of guessing`.
