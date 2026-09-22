# Local Playwright Smoke - BNA Operations Internal-First CRM Pass

Date: 2026-06-10T19:23:57Z

Result: passed

Local target: `http://127.0.0.1:8099`

## Checked

- Operations login through the real form.
- Platform workspace: Pipelines / Stale Work rendered and `New Pipeline Card` opened the expected prompt.
- BNA School Workspace: Calendar rendered and `New Event` opened the expected prompt.
- Platform Settings: Email Identities rendered connector settings for BNA and Rabbi Sheller, and `Save Settings` wrote the settings save marker.
- BNA Service Providers: provider directory rendered and `Add Provider` opened the expected prompt.
- Rabbi Sheller Provider Workspace: Internal Dialogue rendered and `Add Note` opened the expected prompt.
- Mobile BNA dashboard rendered without horizontal overflow.
- Mobile hamburger opened the full navigation page and switched to Rabbi Sheller Provider Workspace.
- Provider-scoped Operations login rendered only provider-safe navigation.
- Parent/student Hebrew buttons set `lang=he` and `dir=rtl` on mobile with no horizontal overflow.
- Provider portal rendered on desktop with no horizontal overflow.

## Screenshots

- `tmp/smoke/operations-platform-pipelines-desktop.png`
- `tmp/smoke/operations-bna-calendar-desktop.png`
- `tmp/smoke/operations-settings-email-identities-desktop.png`
- `tmp/smoke/operations-bna-provider-directory-desktop.png`
- `tmp/smoke/operations-provider-dialogue-desktop.png`
- `tmp/smoke/operations-mobile-bna-dashboard.png`
- `tmp/smoke/operations-mobile-provider-drawer.png`
- `tmp/smoke/operations-provider-scoped-nav.png`
- `tmp/smoke/parent-portal-hebrew-mobile.png`
- `tmp/smoke/student-portal-hebrew-mobile.png`
- `tmp/smoke/provider-portal-desktop.png`
