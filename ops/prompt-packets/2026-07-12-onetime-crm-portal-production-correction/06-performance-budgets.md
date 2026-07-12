# PKT-20260712-111 - One Time Performance Budgets

Parent raw ID: `RAW-20260712-004`
Requirement: `REQ-20260712-111`
Workspace/project: `rabbi_sheller_provider / one_time_mishnah_class`

## Scope

Implement only the local performance budget slice:

- Keep `/operations` as a small bootstrap with split shell assets.
- Bring `public/js/operations-shell.js` below the 1.2 MB startup budget without raising the test threshold.
- Preserve CRM bounded list/detail behavior, public landing no-write proof, and private/public cache policy contracts.
- Record local shell bytes, CRM metrics, landing metrics, cache policy proof, and exact deploy-only compression/header blockers.

## Out Of Scope

- No deploy, live SHA verification, production compression/header claim, external send, payment/access change, DNS/provider-account mutation, production data mutation, GHL, LeadConnector, or external CRM write.
- No broad UI redesign.
- Do not solve the whole parent ramble. Complete only this packet's scope and record the next packet or blocker.

## Acceptance

- Focused PQC validates before code edits.
- `operations-shell.js` normalized byte size is under `1200000`.
- Operations shell/navigation and cache policy tests pass.
- CRM and landing smokes still pass with no POST/write requests.
- Local performance report names exact evidence and carries deploy/live-only proof into `REQ-20260712-112`.
