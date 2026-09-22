# One Time Operations Dashboard UI Live Smoke - 2026-07-06T14:10:22.946Z

App: https://bneineviimacademy.org
Route: `/operations?view=dashboard&section=overview&workspace=rabbi_sheller_provider`
Result: passed

## Checks
- PASS dashboard route normalized to One Time provider overview - service_providers
- PASS dashboard route active section is overview - overview
- PASS One Time Overview sidebar item is active - Overview OV
- PASS workspace directory options are not rendered for One Time scoped sidebar
- PASS scoped workspace summary names One Time Mishnah Class
- PASS Studio nav item is visible
- PASS topbar chips are One Time scoped - Members, Classes, Studio, Setup
- PASS generic platform dashboard text is absent
- PASS professional One Time labels are visible

## Guardrails
- Authenticated browser readback only.
- No external sends, payment/access/DNS/provider-account mutation, Drive write, or production data mutation was performed.
