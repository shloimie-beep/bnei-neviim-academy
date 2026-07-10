# One Time Provider CRM Layout Local Smoke

Status: PASS
Generated: 2026-07-10T11:18:50.490Z

Local signed One Time provider CRM layout smoke; no database, sends, payments, external accounts, or production writes.

| Viewport | Passed | Overflow | Fixture leak | Diagnostics leak | Helper | Screenshot |
|---|---:|---:|---:|---:|---|---|
| 1440x960 | true | false | false | false | Robot Scheller | ops/ui-audits/2026-07-09-onetime-provider-crm-layout-local/desktop-1440-crm.png |
| 768x1024 | true | false | false | false | Robot Scheller | ops/ui-audits/2026-07-09-onetime-provider-crm-layout-local/tablet-768-crm.png |
| 390x844 | true | false | false | false | Robot Scheller | ops/ui-audits/2026-07-09-onetime-provider-crm-layout-local/mobile-390-crm.png |

Checks:

- CRM renders as one workbench shell with list and detail regions.
- CRM is the active visible provider section from the direct URL.
- No horizontal overflow on desktop, tablet, or 390px mobile.
- Rabbi-facing CRM text does not expose TEST Parent/Student names, `.example.test` emails, Message Actions duplicates, BNA Academy, or platform setup diagnostics.
- Helper loads as the One Time provider helper, not the BNA helper.
- No console errors, page errors, or failed requests.
