# Student Portal Auth Policy

Date: 2026-06-16

Purpose: record the approved student portal auth model for the BNA school
workspace and the guardrails implemented in the app.

## Decision

Parent-managed student username/password login is the student portal auth model.

Parents reset a child's password from the parent portal. There is no
parent-facing student/classroom/library access-code fallback, support recovery
code, or separate classroom password. Student self-reset is out of scope until
BNA separately approves the support process, age-appropriate UX, and recovery
ownership.

## Runtime Policy

- Parent authorization is mandatory before creating or resetting a student
  username/password account.
- Passwords are hashed server-side with scrypt and are never returned to the UI
  after set/reset.
- Student sessions are separate from parent and Operations sessions and use a
  distinct HttpOnly cookie.
- Raw passwords, legacy secure-link tokens, and raw IP addresses are never stored in
  logs, task titles, screenshots, or audit rows.
- Username/password attempts are persistently audited with hashed IP, hashed
  username, route path, outcome, and non-secret metadata.
- Legacy secure-link attempts, where retained for old invite links, remain
  persistently audited with hashed IP and hashed token identifiers.
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
- legacy `GET /api/student-portal?code=...` secure-link support for old links;
  not a parent-facing recovery path

## Rollback

Rollback: disable password-account creation only with an explicit operator
decision. Do not reintroduce a parent-facing access-code fallback, support
recovery code, or separate classroom password without a new approval.

## Guardrail

This policy does not authorize bulk parent sends, student credential emails,
WhatsApp login links, Google/Drive/Classroom writes, billing/access changes,
member-library publishing, external CRM writes, or any Rabbi/One Time live-site
action.
