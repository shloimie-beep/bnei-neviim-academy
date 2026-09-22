# One Time Operations CRM Workbench Local Smoke

Status: PASS
Generated: 2026-07-12T06:58:58.076Z

Local browser/API Operations One Time CRM journey smoke using isolated first-party test records; no production database, sends, payments, external accounts, or production writes.

| Viewport | Passed | Overflow | Cards | Detail | Timeline | Screenshot |
|---|---:|---:|---:|---:|---:|---|
| 1440x960 | true | false | 6 | true | true | ops/evidence/one-time-crm-journey/2026-07-12/desktop-1440-crm-workbench.png |
| 1024x900 | true | false | 6 | true | true | ops/evidence/one-time-crm-journey/2026-07-12/desktop-1024-crm-workbench.png |
| 768x1024 | true | false | 6 | true | true | ops/evidence/one-time-crm-journey/2026-07-12/tablet-768-crm-workbench.png |
| 430x932 | true | false | 6 | true | true | ops/evidence/one-time-crm-journey/2026-07-12/mobile-430-crm-workbench.png |
| 390x844 | true | false | 6 | true | true | ops/evidence/one-time-crm-journey/2026-07-12/mobile-390-crm-workbench.png |

Checks:

- One Time Operations CRM route renders the API-backed workbench.
- Search/filter/sort controls, cards, selected detail, class/trial/access context, no-send guard, and timeline readback are visible.
- The browser submits one safe PATCH update with name, email, phone, lifecycle, owner, tags, note, and follow-up task data.
- The returned timeline and follow-up task are displayed after reload.
- Opening mailbox routes to the Rabbi / One Time inbox and returning to CRM restores the selected contact.
- A BNA workspace CRM read is denied with HTTP 403.
- Desktop, tablet, and mobile screenshots have no horizontal overflow.
- Synthetic local records only; no external sends, payments, access grants, or external CRM writes.
- Remaining blocker: True local/test Postgres persistence proof was not run because DATABASE_URL/PGHOST is not configured in this session.
