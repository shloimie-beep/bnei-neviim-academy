# Rabbi Scheller Provider API Usage Local Smoke

Status: PASS

Scope: local static Provider Portal render with mocked `/api/provider-portal/session`; no database, credentials, external accounts, sends, billing, or production data writes.

| Viewport | Result | Screenshot | Notes |
|---|---|---|---|
| 390x844 | PASS | ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-api-usage-local/mobile-390.png | API Usage nav active; honest empty state visible; no fake usage; no horizontal overflow. |
| 768x1024 | PASS | ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-api-usage-local/tablet-768.png | API Usage nav active; honest empty state visible; no fake usage; no horizontal overflow. |
| 1440x900 | PASS | ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-api-usage-local/desktop-1440.png | API Usage nav active; honest empty state visible; no fake usage; no horizontal overflow. |

Checks:

- Provider title visible as Rabbi Elie Scheller.
- API Usage nav appears only through preview entitlement/query flag.
- Direct section deep link opens API Usage, refresh preserves it, clicking API Usage updates the URL, and browser back returns to Overview.
- API Usage section shows the not-instrumented empty state.
- No fabricated request, token, or cost values are displayed.
- No horizontal overflow at 390x844, 768x1024, or 1440x900.
- No console errors, page errors, or failed requests.
