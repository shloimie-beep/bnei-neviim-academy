# Student Portal Auth Policy

Date: 2026-06-16

Purpose: record the approved student portal auth model for the BNA school
workspace and the guardrails implemented in the app.

## Decision

Parent-managed student username/password login is the primary student portal auth model.

The existing access-code link remains as a fallback and recovery path. Parents
can open or reset the fallback access-code link from the parent portal. Student
self-reset is out of scope until BNA separately approves the support process,
age-appropriate UX, and recovery ownership.

## Runtime Policy

- Parent authorization is mandatory before creating or resetting a student
  username/password account.
- Passwords are hashed server-side with scrypt and are never returned to the UI
  after set/reset.
- Student sessions are separate from parent and Operations sessions and use a
  distinct HttpOnly cookie.
- Raw passwords, raw access codes, and raw IP addresses are never stored in
  logs, task titles, screenshots, or audit rows.
- Username/password attempts are persistently audited with hashed IP, hashed
  username, route path, outcome, and non-secret metadata.
- Access-code fallback attempts remain persistently audited with hashed IP and
  hashed access-code identifiers.
- Missing, invalid, expired, and disabled credentials return generic errors.
- Failed attempts are rate-limited.
- Parent-created student credentials are first-party BNA records, not GHL,
  LeadConnector, or other external CRM records.

## Implemented State

Implemented tables:

- `bna_student_password_accounts`
- `bna_student_sessions`
- `bna_student_password_auth_attempts`
- `bna_student_portal_auth_attempts`

Implemented parent endpoint:

- `POST /api/parent-portal/students/:studentId/login-account`

Implemented student endpoints:

- `POST /api/student-portal/login`
- `GET /api/student-portal/session`
- `POST /api/student-portal/logout`
- existing `GET /api/student-portal?code=...` access-code fallback

## Rollback

Rollback: disable password-account creation and keep access-code links active.
Existing access-code fallback behavior remains available during rollout, smoke
testing, and any temporary password-login incident.

## Guardrail

This policy does not authorize bulk parent sends, student credential emails,
WhatsApp login links, Google/Drive/Classroom writes, billing/access changes,
member-library publishing, external CRM writes, or any Rabbi/One Time live-site
action.
