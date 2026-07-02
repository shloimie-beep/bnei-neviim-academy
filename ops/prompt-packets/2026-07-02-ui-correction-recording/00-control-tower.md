# 00 Control Tower - UI Correction Recording

Packet ID: `PKT-20260702-201`
Parent raw ID: `RAW-20260702-006`
Stage: `STAGE_0_RAW_CAPTURE`
Role: `CONTROL_TOWER`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

You are Stage 0 of parent raw input `RAW-20260702-006`. Do not solve the whole
parent ramble. Produce only this packet's output contract and hand back exact
blockers/next packets.

## Scope

Coordinate Drive recording trace, UI correction packet generation, mock data,
task-view readback, and verifier closeout for One Time UI review.

## Current Source Coverage

- Newest Drive recording was found: `drive_file:f07607f3f9f8`.
- Matched content job: `content_job:101`.
- Transcript chars: `39920`.
- Parser output: not available.
- UI correction statements from recording: `0`.
- Prior visual audit exists:
  `ops/ui-audits/2026-07-01-rabbi-onetime-current-state/report.md`.

## Decision

Do not implement visual/UI changes from the unparsed recording. Generate packet
slots now, mark UI implementation packets blocked until source parsing or
explicit audit selection exists, and proceed with independently safe mock-data
and setup/readback work.

## Required Child Packets

- `01-source-coverage.md`
- `02-brand-kit-and-design-reference-alignment.md`
- `03-ia-nav-filter-cleanup.md`
- `04-crm-pipeline-contact-detail.md`
- `05-community-classes-questions-provider-pipeline.md`
- `06-content-library-provider-pipeline.md`
- `07-member-parent-student-basic-portal.md`
- `08-task-view-next-action-cleanup.md`
- `09-mock-data-and-test-identities.md`
- `10-verifier-deploy-live-smoke.md`

## Forbidden

No raw transcript export, no broad Rabbi UI implementation, no production data
hard delete, no bulk email, no WhatsApp broadcast, no live Stripe payment, no
apex/root DNS mutation, no GHL/LeadConnector runtime.

## Next Packet

Run `09-mock-data-and-test-identities.md` because it is independent and safe in
dry-run mode.
