# One Time Brand/Helper/Toolbar Agent Review Failed Partial Audit

Recorded at: 2026-07-08T09:20:00+03:00

Source raw ID: `RAW-20260708-002`

Prompt key: `one-time-brand-helper-toolbar-audit`

Requirement: `REQ-20260707-136`

Status: `fail_partial`

Severity: high

Blocker: Agent Mode performed a partial live audit but did not save the
required AGR drop-off result or readback before answering in chat.

This is durable internal evidence only. It is not an AGR readback and does not
mark Issue #24 complete.

## Routes Visited

- `/operations/agent-review?prompt=one-time-brand-helper-toolbar-audit`
- `/one-time`
- `/operations?view=tasks`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email`
- `/provider.html?review=one-time`
- `/provider.html?admin_provider=one-time&section=mailbox`
- `/parent.html?review=one-time`
- `/student.html?review=one-time`
- `/rabbi-member.html?review=one-time`
- `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`

## Partial Findings

- One Time public branding was black/yellow and English-only; no Hebrew toggle
  was seen.
- Public helper leaked `BNA context`, `Shloimie`, and `BNA voice` wording on
  the One Time public route.
- Public helper sometimes stayed in Thinking state for too long.
- Workspace switcher click path to One Time was unclear; direct URL fallback
  worked.
- Communications > Email eventually showed `Rabbi / One Time Inbox`, but
  direct route hydration should be retested.
- Provider review left navigation was cramped/overlapping.
- Provider mailbox helper label said `BNA Helper`, which is brand bleed on the
  One Time provider surface.
- Parent helper was privacy-safe but used BNA/Shloimie wording and did not
  ground library/worksheet answers in visible page context.
- Student route correctly excluded BNA goals and parent billing; worksheet
  answer was generic.
- Member and classroom routes used black/yellow but had dense top navigation
  likely needing mobile collapse.
- Full required viewport matrix was not completed.
- AGR drop-off was not saved, making the audit noncompliant.

## Future Backlog Recommendations

- P0-SCOPE: remove BNA/Shloimie/internal wording from One Time
  public/parent/student/member helper responses.
- P0-SCOPE: ensure One Time provider mailbox helper label is not `BNA Helper`.
- P0-SCOPE: ensure real classroom access codes are never exposed in production
  UI.
- P1-IA: make workspace switcher path to One Time / Rabbi / One Time Mishnah
  Class clear.
- P1-DEADEND: direct communications/email route must hydrate to email
  reliably.
- P1-DEADEND: helper fallback should offer a safe route/action instead of vague
  internal escalation.
- P2-TOOLBAR: reduce top-tab density across Operations, member, classroom, and
  provider surfaces.
- P2-RESPONSIVE: run required viewport checks at 1440, 1024, 768, 430, and 390.
- P2-RELEVANCE: helpers should use visible page context for library, worksheet,
  class, and schedule answers.
- P2-TYPOGRAPHY: clean duplicated `OneTimeOneTime` naming where it reads like
  an accidental duplicate.
- P3-POLISH: keep recording trace language limited to actual evidence.

## Guardrails

- This record does not authorize broad One Time UI implementation in the
  current batch.
- UI/helper fixes should be routed into future scoped Agent Mode prompts after
  the drop-off workflow is reliable.
