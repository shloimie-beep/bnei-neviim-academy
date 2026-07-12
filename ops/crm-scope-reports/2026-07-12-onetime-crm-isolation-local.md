# One Time CRM Isolation Local Report

Date: 2026-07-12
Run: `2026-07-12-onetime-crm-portal-production-correction`
Requirement: `REQ-20260712-104`
Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

This is a redacted local code-path report. It contains no production contact rows,
message bodies, private names, emails, phones, access records, or exported CRM data.

## Checked Boundaries

- CRM contacts from `bna_contacts` require an explicit matching
  `bna_workspace_settings.workspace_key` when the request is scoped to One Time.
- CRM lead rows from `bna_parent_leads` require an explicit matching
  `bna_projects.project_key`.
- Contact timelines for `bna_parent_leads` require the scoped project key before
  returning `bna_contact_communications`.
- Contact timelines for `bna_contacts` require the scoped workspace key before
  returning `bna_communications` or `bna_contact_pipeline_events`.
- General communications lists derive the scoped project through
  `requestedProjectKeyForScopedList(req)`.
- Same-email matching is not used to broaden One Time CRM list/detail/timeline
  reads across workspaces.
- Internal source labels such as `bna_parent_leads` and `bna_contacts` are mapped
  to human-facing labels before they reach CRM cards and filter options.

## Local Evidence

- `server.js`
- `src/lib/bna/crm-contact-model.js`
- `tests/crm-contact-model.test.js`
- `tests/rabbi-scheller-tenant-isolation-contract.test.js`

## Remaining Release Evidence

- Scoped commit/push.
- Deploy through the approved release path.
- Live smoke/readback for One Time CRM list/detail/timeline and cross-workspace
  denial with redacted proof.
