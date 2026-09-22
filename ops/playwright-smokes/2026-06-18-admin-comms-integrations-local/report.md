# Admin / Communications / Integrations Local Smoke - 2026-06-18

Result: passed

Checked local Operations on http://127.0.0.1:8094 with throwaway local Operations credentials.

## Assertions
- BNA Admin > Users requests people with project_key=bna.
- BNA Communications requests contact communications with project_key=bna.
- BNA Communications Integrations requests social drafts with project_key=bna.
- BNA Communications Integrations requests email drafts with project_key=bna.
- BNA Communications Integrations requests DNS tasks with project_key=bna.
- BNA Automations requests automations with project_key=bna.
- BNA Integrations readiness deep link does not fetch global integration status.
- BNA Integrations readiness deep link does not render global Integration Readiness.
- Platform Integrations readiness fetches global integration status explicitly.
- Platform Integrations readiness renders global Integration Readiness.
- One Time provider Automations requests automations with project_key=one_time_mishnah_class.
- No body/document horizontal overflow on final desktop viewport.

## Screenshots
- ops/playwright-smokes/2026-06-18-admin-comms-integrations-local/bna-admin-users-mobile.png
- ops/playwright-smokes/2026-06-18-admin-comms-integrations-local/bna-communications-mobile.png
- ops/playwright-smokes/2026-06-18-admin-comms-integrations-local/bna-integrations-communications-mobile.png
- ops/playwright-smokes/2026-06-18-admin-comms-integrations-local/bna-automations-mobile.png
- ops/playwright-smokes/2026-06-18-admin-comms-integrations-local/bna-integrations-readiness-hidden-mobile.png
- ops/playwright-smokes/2026-06-18-admin-comms-integrations-local/platform-integrations-readiness-desktop.png
- ops/playwright-smokes/2026-06-18-admin-comms-integrations-local/onetime-automations-desktop.png
