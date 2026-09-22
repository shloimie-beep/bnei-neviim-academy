# BNA UX Click Map Audit

Date: 2026-06-11
App URL: https://bneineviimacademy.org
Screenshots: 2237
Routes: 2205
Actions inventoried/mapped: 42606
Issues: 3429 (P0 0, P1 3234, P2 195, P3 0)

## How To Read This Folder

- `manifest.json` is the canonical screenshot metadata file. Every screenshot has a `screen_id`.
- `screenshots.csv` is the spreadsheet-friendly screenshot index.
- `actions.csv` maps visible buttons, nav clicks, subnav clicks, drawers, dropdowns, and risky/disabled actions.
- `routes.csv` explains route ownership, audience, role/workspace state, and bot presence.
- `flows.csv` summarizes the major product flows and blockers.
- `issues.csv` is the structured issue registry.
- `navigation-map.md`, `role-workspace-matrix.md`, `context-clarity-failures.md`, `button-action-audit.md`, `mobile-audit.md`, `top-findings.md`, and `implementation-backlog.md` are designer/implementation reports.

## Safety Rules Used During Audit

- No real emails were sent.
- No real WhatsApps were sent.
- No social posts were published.
- No payments were charged.
- No destructive delete/archive/reset actions were executed.
- Production-risk actions were inventoried and classified instead of clicked.

## Known Blockers

- Parent private dashboard, student private dashboard, provider authenticated portal, and provider/member participant portal require safe demo credentials or generated access links for a complete private workflow walkthrough.
- The package maps visible actions and safe navigation states; production-mutating actions are marked `unsafe`, `blocked_by_config`, or `not_tested` where appropriate.
