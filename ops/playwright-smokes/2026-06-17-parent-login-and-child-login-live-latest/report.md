# Parent Login And Child Login Live Smoke - 2026-06-17

Base URL: https://bneineviimacademy.org
Deployment: ff95e44f-f1f5-4eeb-a83d-fc8f9456674b

- Parent login continue panel rendered for mocked existing parent session.
- Switch-parent action called `/api/parent/auth/logout` and returned to login form.
- Parent portal account page rendered child-specific login labels and copy for Mendy Smoke.
- Student username/password submit used `/api/parent-portal/students/123/login-account`.
- Student access reset button used `/api/parent-portal/students/123/access-code`.

Screenshots:

- `continue-panel-mobile.png`
- `switch-parent-mobile.png`
- `child-login-settings-mobile.png`
