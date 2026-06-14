# Live Google Workspace Settings Playwright Smoke

Generated: 2026-06-14T14:55:08.841Z
Base URL: https://bneineviimacademy.org
Deployment: e38167f2-5e6d-4447-b9d4-e195375c4315

## Checks

- PASS operations login
- PASS desktop Google Workspace UI (1440x1100) - desktop-google-workspace-settings.png
- PASS mobile Google Workspace UI (390x844) - mobile-google-workspace-settings.png

## Notes

- Verified live Operations login via session cookie without printing credentials.
- Verified Settings > Google Workspace renders Drive, Calendar, Classroom, and Google Business Profile cards.
- Verified no console/page errors and no horizontal overflow at desktop and 390px mobile widths.
- Verified `/api/bna/integrations/google/status` responds successfully from the live authenticated page.
