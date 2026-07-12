# One Time CRM API Pagination Local Report

Date: 2026-07-12
Run: `2026-07-12-onetime-crm-portal-production-correction`
Requirement: `REQ-20260712-105`
Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

This is a local code-path and fixture report. It contains no production contact
rows, message bodies, names, emails, phones, or exported CRM data.

## Implemented

- `/api/bna/crm/contacts` accepts `limit` and `cursor`.
- Default page size is 50.
- Maximum page size is 100.
- Response keeps existing `cards`, `total`, and `filtered_total` fields and adds
  `returned_count`, `limit`, `has_more`, `next_cursor`, and `page`.
- CRM source queries are capped by the cursor window instead of pulling a fixed
  500 rows from each source by default.
- Timeline data remains selected-contact only through
  `/api/bna/crm/contacts/:id/timeline`.

## Local Fixture

- `tests/crm-contact-model.test.js` includes a 10,000-contact fixture.
- The fixture returns a 50-card page, `has_more: true`, and a `next_cursor`
  instead of returning bulk rows.

## Release Evidence Still Needed

- Production-like database `EXPLAIN`/readback for the One Time scoped CRM list.
- Live smoke for first page, next cursor page, and selected-contact timeline.
- Commit/push/deploy through the approved release path.
