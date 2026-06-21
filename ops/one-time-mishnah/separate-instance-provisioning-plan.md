# One Time Separate Instance Provisioning Plan

Generated: 2026-06-21T18:27:37.088Z
Requirement: REQ-20260619-313

## Railway Target

- Project: one-time-production
- Environment: production
- Web service: one-time-web
- Postgres service: one-time-postgres
- Worker service required now: no
- Forbidden target: skillful-motivation

## Scope

- Workspace: rabbi_sheller_provider
- Project: one_time_mishnah_class
- Brand: onetime
- Public language: en

## Variable Plan

Non-secret variables are in `separate-instance-provisioning-plan.json`. Secret values are
redacted and represented by names only.

## Seed And Isolation

- Seed SQL: `separate-instance-seed.sql`
- Isolation scan SQL: `separate-instance-isolation-scan.sql`
- Seed isolation check: pass

## Remaining External Action

Railway account-level authentication is required to create or select the
separate project and services. Project-scoped tokens for the shared BNA service
must not be used to add One Time services to `skillful-motivation`.
