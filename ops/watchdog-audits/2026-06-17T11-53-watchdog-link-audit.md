# Watchdog Link Audit

Generated at 2026-06-17T11:53:39.462Z.

This watchdog is local-safe and read-only except for writing this report.

## Summary

- Severity: medium
- Findings: 25
- Registered routes: 11
- Internal hrefs scanned: 64

## Findings

- **MEDIUM** Linked route /he is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/index.html -> /he
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /student/login is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/index.html -> /student/login
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /student/login is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/index.html -> /student/login
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /student/login is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/index.html -> /student/login
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /operations-login.html is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/index.html -> /operations-login.html
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /operations-login.html is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/index.html -> /operations-login.html
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /operations-login.html is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/index.html -> /operations-login.html
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /signup.html is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/index.html -> /signup.html
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /school is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/index.html -> /school
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /parents is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/index.html -> /parents
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /signup.html is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/index.html -> /signup.html
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /parents is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/parent-login.html -> /parents
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /student/login is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/parent-login.html -> /student/login
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /parents is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/parent.html -> /parents
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /student/login is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/parent.html -> /student/login
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /parents is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/student.html -> /parents
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /operations-login.html is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/operations.html -> /operations-login.html
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /provider-signup is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/operations.html -> /provider-signup
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /providers/${encodeURIComponent(provider.slug)} is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/operations.html -> /providers/${encodeURIComponent(provider.slug)}
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /rabbi is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/operations.html -> /rabbi
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /rabbi-member is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/operations.html -> /rabbi-member
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /api/google/oauth/start is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/operations.html -> /api/google/oauth/start?role=admin_teacher&features=calendar,classroom,drive_pipeline
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /member-library is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/operations.html -> /member-library
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /one-time-classroom is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/operations.html -> /one-time-classroom
  Fix: Add the linked route to ops/route-registry.json or correct the href.
- **MEDIUM** Linked route /member is not in route registry: Internal links should be declared so privacy and logged-out behavior can be audited.
  Goals: GOAL-CORE-003
  Evidence: public/operations.html -> /member
  Fix: Add the linked route to ops/route-registry.json or correct the href.
