# BNA Full App UI Audit - 2026-06-11

Base URL: https://bneineviimacademy.org
Screenshots captured: 893
Capture errors: 0

## Executive Summary

- Average desktop rating: 9.1/10.
- Average mobile rating: 8.6/10.
- Lowest-rated states: Operations / BNA School Workspace / Service Providers / Workspaces mobile (5.1); Operations / Rabbi Sheller Provider Workspace / Service Providers / Workspaces mobile (5.1); Operations / BNA School Workspace / Content / Research mobile (6); Operations / BNA School Workspace / Content / Repurpose mobile (6); Operations / Rabbi Sheller Provider Workspace / Content / Library mobile (6); Operations / Rabbi Sheller Provider Workspace / Content / Research mobile (6); Operations / Rabbi Sheller Provider Workspace / Content / Repurpose mobile (6).
- The audit is intentionally conservative: risky live actions were not clicked, but every visible action is inventoried in `manifest.json`.

## Priority Optimizations

- 0 states show horizontal overflow; fix these first because they break trust immediately on mobile.
- 20 states have too many visible actions; consolidate secondary actions into menus and detail drawers.
- 10 states overuse disabled/not-configured wording; replace big placeholder blocks with real settings rows and small helper text.
- 18 portal/login states were captured without private demo login; create safe demo credentials so parent/student/provider private workflows can be audited end-to-end.
- Standardize page headers: workspace chip, role chip, section title, one primary action, and compact filters.
- Use the manifest action inventory to remove dead buttons or convert unsupported actions into disabled controls with one-line explanations.

## Screenshot Catalog

- [Public Website](public-website.md): 20 screenshots
- [Auth / Login](auth-login.md): 2 screenshots
- [Parent Portal](parent-portal.md): 6 screenshots
- [Student Workspace](student-workspace.md): 4 screenshots
- [Provider Portal](provider-portal.md): 2 screenshots
- [Provider Onboarding](provider-onboarding.md): 4 screenshots
- [Operations](operations.md): 852 screenshots
- [Operations Chrome](operations-chrome.md): 3 screenshots

## Auth / Safety Notes

- Operations screenshots used existing admin auth without printing credentials.
- Real send, publish, payment, delete, archive, password reset, and data-changing actions were inventoried but not executed.
- Parent/student/provider private portal screenshots require safe demo credentials or generated access links; unauthenticated login states are captured here.

