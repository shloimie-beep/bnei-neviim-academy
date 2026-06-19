# Requirements

The machine-readable requirements are in `requirements.json`.

Imported June 18 areas:

- audit harness / audit package
- PWA public-vs-Operations separation
- workspace model and RBAC
- Operations shell/navigation
- design system
- task manager / intake / calendar
- module scoping
- students / Goal Board / Hebrew
- unified OpenAI helper
- public copy and portal headers
- test data and acceptance tests

Audit-dependent remediation areas `REQ-20260618-101` through
`REQ-20260618-111` remain blocked until the local audit package or audit output
path is available.

Agent Control Center intake from `RAW-20260619-001` was added as unblocked
requirements `REQ-20260618-112` through `REQ-20260618-123` because the prior
run was blocked solely on the external audit package and this work does not
depend on screenshot-specific findings.

Local statuses after the 2026-06-19 batch:

- `REQ-20260618-112` open: parent Agent Control Center requirement.
- `REQ-20260618-113` needs verification: agent profile schema/seed.
- `REQ-20260618-114` needs verification: run schema/state machine.
- `REQ-20260618-115` needs verification: Agents menu and task handoff UI.
- `REQ-20260618-116` needs verification: versioned prompt generation.
- `REQ-20260618-117` needs verification: Agent Run portal/progress controls.
- `REQ-20260618-118` needs verification: evidence and Seal Run validation.
- `REQ-20260618-119` done locally: failed/blocked feedback and Decision routing.
- `REQ-20260618-120` needs verification: Super Admin/project-scope controls.
- `REQ-20260618-121` in progress: verification policy/Playwright integration.
- `REQ-20260618-122` in progress: notifications and audit history.
- `REQ-20260618-123` not started: safe demo data, E2E, manual Agent Mode smoke.
