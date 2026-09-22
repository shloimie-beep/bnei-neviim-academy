# Rabbi Scheller Provider Navigation Local Smoke

Status: PASS

Scope: local static Provider Portal render with mocked `/api/provider-portal/session`; no database, credentials, external accounts, sends, billing, or production data writes.

Sections walked: overview, profile, services, class_setup, class_media, media, comments, commercial, entitlements, google_business, upgrade, website_import, communications, integrations, access, activity, api_usage, settings

| Viewport | Result | Screenshot | Notes |
|---|---|---|---|
| 390x844 | PASS | ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-navigation-local/mobile-390.png | Every supported provider section direct-linked and clicked; one active nav and one visible section; browser back and refresh preserved section state; no super-admin nav, failed requests, console errors, or horizontal overflow. |
| 768x1024 | PASS | ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-navigation-local/tablet-768.png | Every supported provider section direct-linked and clicked; one active nav and one visible section; browser back and refresh preserved section state; no super-admin nav, failed requests, console errors, or horizontal overflow. |
| 1440x900 | PASS | ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-navigation-local/desktop-1440.png | Every supported provider section direct-linked and clicked; one active nav and one visible section; browser back and refresh preserved section state; no super-admin nav, failed requests, console errors, or horizontal overflow. |

Checks:

- Provider title visible as Rabbi Elie Scheller.
- Provider nav ids exactly match the supported provider section graph for the fixture.
- Every provider nav button carries `ACTION-PROVIDER-SECTION-NAVIGATION`.
- No Platform Suite, Team/Admin, Accounting, credentials, deployment, or super-admin labels appear in provider nav.
- Every section can be reached by clicking provider nav.
- Every section can be reached by direct `section=` URL.
- Browser back from Settings returns to API Usage.
- Refresh on Settings preserves the Settings section.
- Exactly one nav item is active and exactly one section is visible at a time.
- No horizontal overflow at 390x844, 768x1024, or 1440x900.
- No console errors, page errors, or failed requests.
