# One Time Operations CRM Workbench Local Smoke

Status: PASS
Generated: 2026-07-13T08:32:04.179Z

Local synthetic Operations One Time CRM workbench smoke; no database, sends, payments, external accounts, or production writes.

| Target | Viewport | Passed | CRM calls | Initial cards | Task action | Root rerenders | Search requests | Legacy table closed/open | Selected detail | Final screenshot |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| split-shell | 1440x960 | true | 1 | 50 | true | 0 | 1 | 0/1 | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-desktop-1440-crm-selected-detail.png | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-desktop-1440-crm-workbench.png |
| monolith | 1440x960 | true | 1 | 50 | true | 0 | 1 | 0/1 | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/monolith-desktop-1440-crm-selected-detail.png | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/monolith-desktop-1440-crm-workbench.png |
| split-shell | 1024x900 | true | 1 | 50 | true | 0 | 1 | 0/1 | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-desktop-1024-crm-selected-detail.png | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-desktop-1024-crm-workbench.png |
| monolith | 1024x900 | true | 1 | 50 | true | 0 | 1 | 0/1 | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/monolith-desktop-1024-crm-selected-detail.png | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/monolith-desktop-1024-crm-workbench.png |
| split-shell | 768x1024 | true | 1 | 50 | true | 0 | 1 | 0/1 | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-tablet-768-crm-selected-detail.png | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-tablet-768-crm-workbench.png |
| monolith | 768x1024 | true | 1 | 50 | true | 0 | 1 | 0/1 | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/monolith-tablet-768-crm-selected-detail.png | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/monolith-tablet-768-crm-workbench.png |
| split-shell | 430x932 | true | 1 | 50 | true | 0 | 1 | 0/1 | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-mobile-430-crm-selected-detail.png | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-mobile-430-crm-workbench.png |
| monolith | 430x932 | true | 1 | 50 | true | 0 | 1 | 0/1 | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/monolith-mobile-430-crm-selected-detail.png | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/monolith-mobile-430-crm-workbench.png |
| split-shell | 390x844 | true | 1 | 50 | true | 0 | 1 | 0/1 | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-mobile-390-crm-selected-detail.png | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-mobile-390-crm-workbench.png |
| monolith | 390x844 | true | 1 | 50 | true | 0 | 1 | 0/1 | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/monolith-mobile-390-crm-selected-detail.png | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/monolith-mobile-390-crm-workbench.png |

Inbox context:

| Target | Viewport | Passed | One Time Inbox | Context | Scope | Send gate | Screenshot |
|---|---|---:|---:|---:|---:|---:|---|
| split-shell | 1024x900 | true | true | true | true | true | ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-desktop-1024-one-time-inbox.png |

Checks:

- One Time Operations CRM route renders the API-backed workbench.
- Split shell and monolith fallback render the API-backed workbench.
- Search/filter/sort controls, Add Contact form, cards, shared CRM contract attributes, three CRM panes, selected detail, profile, class/trial/access context, no-send guard, safe actions, explicit Create task/archive actions, Link member disabled-shell action, and timeline readback are visible.
- Overview, Activity, Conversations, Tasks, Access, Identity, and Family tabs are clickable and render non-disabled workspace panels.
- Mobile selected-contact state hides the list and Back to contacts restores it.
- Scoped One Time Inbox retains selected CRM contact context and keeps send gates visible.
- Initial CRM API calls after auth are <= 3, initial cards are <= 50, contact selection does not replace the app root, and debounced search sends one list request.
- Legacy CRM review/source table is absent while the details panel is closed and present after it is opened.
- Desktop, tablet, and mobile screenshots have no horizontal overflow.
- Synthetic local records only; no external sends, payments, access grants, or external CRM writes.

