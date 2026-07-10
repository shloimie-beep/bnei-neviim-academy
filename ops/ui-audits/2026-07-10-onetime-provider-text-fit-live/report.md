# One Time Provider Text Fit Live Readback

Status: PASS
Generated: 2026-07-10T08:15:37.282Z
Base URL: https://join.onetimeonetime.com
Deployment: f338b59b-a545-40ab-b952-13b4111ecd2a
Commit: f3368cfe

Scope: overview CRM inbox metric, CRM record meta email chip, and mailbox readiness email chip for One Time provider review. No auth, sends, payments, external accounts, or production writes.

| Viewport | Passed | Overview overflow | CRM overflow | Mailbox overflow | Overview screenshot | CRM screenshot | Mailbox screenshot |
|---|---:|---:|---:|---:|---|---|---|
| 390x844 | true | false | false | false | ops/ui-audits/2026-07-10-onetime-provider-text-fit-live/mobile-390-overview.png | ops/ui-audits/2026-07-10-onetime-provider-text-fit-live/mobile-390-crm.png | ops/ui-audits/2026-07-10-onetime-provider-text-fit-live/mobile-390-mailbox.png |
| 430x932 | true | false | false | false | ops/ui-audits/2026-07-10-onetime-provider-text-fit-live/mobile-430-overview.png | ops/ui-audits/2026-07-10-onetime-provider-text-fit-live/mobile-430-crm.png | ops/ui-audits/2026-07-10-onetime-provider-text-fit-live/mobile-430-mailbox.png |
| 1440x960 | true | false | false | false | ops/ui-audits/2026-07-10-onetime-provider-text-fit-live/desktop-1440-overview.png | ops/ui-audits/2026-07-10-onetime-provider-text-fit-live/desktop-1440-crm.png | ops/ui-audits/2026-07-10-onetime-provider-text-fit-live/desktop-1440-mailbox.png |

Checks:

- Fit values keep the full email in text/title/aria-label while rendering on one line with hidden overflow and ellipsis.
- Overview, CRM, and mailbox routes have no horizontal document overflow at 390, 430, and 1440 widths.
- CRM explanatory copy uses normal word boundaries and remains contained in its card.
- No console errors, page errors, or failed HTTP responses were observed.
