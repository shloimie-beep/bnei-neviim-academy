# BNA Operating Goals

Last updated: 2026-06-16

This register is the durable map for the broad product/operating-system goals
that should survive across Telegram rambles, Codex sessions, prompt packets,
and future automation. It separates local implementation from deployed/live
proof and keeps human/external blockers visible.

## GOAL-001 - Scoped Natural-Language Helper Everywhere

- Scope: public site, Operations, parent portal, student portal, provider
  workspace, One Time/Rabbi workspace, and Family App/Home Accountability.
- Definition of done: each surface has one visible helper named for that scope;
  helper responses and tools are permission-scoped; actions use confirmation
  gates; missing integrations create blockers instead of fake success.
- Current status: Operations helper and helper tool registry foundation is
  deployed in Railway `db7ea5aa-c4cd-49df-9b74-f233c3e53667`; integration
  status readback passed.
- Open decisions: final helper names per workspace; which high-risk tools can
  become live after approval.
- Pending external actions: approval for any high-risk live tool action.
- Codex workstreams: HELPER-03, INT-05, UI-01.
- Proof required: role/scope tests, helper audit readback, desktop/mobile
  screenshots, live Operations smoke, no duplicate helper button proof.

## GOAL-002 - Long Ramble Intake To Decisions, Pending, And Codex Work

- Scope: Telegram, Codex attachments, Downloads prompt files, repo memory,
  Operations task lanes, agent lifecycle, and prompt intake.
- Definition of done: raw rambles are captured, distilled, deduped, mapped to
  decisions, pending access items, Codex work, blocker records, proof files, and
  terminal statuses.
- Current status: observable bot/task lifecycle exists; prompt intake register
  command is added; stale ledger terminal cleanup remains.
- Open decisions: whether to add an automatic Downloads watcher or keep this as
  an explicit audit command.
- Pending external actions: approved queue cleanup decisions.
- Codex workstreams: OPS-02, PROMPT-INTAKE, MASTER-07.
- Proof required: `npm run prompts:audit`, register JSONL/summary, stale-ledger
  closeout report, Operations status readback.

## GOAL-003 - Natural-Language Assignment And Accountability

- Scope: BNA students, parents, admins, One Time Mishnayos participants, goal
  boards, worksheets, questions, checkoffs, and reports.
- Definition of done: parent/admin natural-language notes become scoped
  accountability records; students receive assignments/goals; progress,
  questions, worksheets, participation, and reports remain privacy-scoped.
- Current status: student goal board, WS11 community/progress, worksheet and
  question foundations exist; additive extension is deployed and WS11
  parent-progress live smoke passed.
- Open decisions: tablet/device-control policy details and parent-visible
  reporting defaults.
- Pending external actions: approved parent credential/session path for
  additional parent visual proof, plus tablet/reporting decisions.
- Codex workstreams: COMMUNITY-06, WS11, OPS-02.
- Proof required: student/parent privacy tests, parent progress smoke,
  student-auth smoke, Operations/student screenshots.

## GOAL-004 - Provider Integration Onboarding And Secret Storage

- Scope: provider-owned Resend, Buffer, WAPI/WhatsApp, Vimeo, Zoom, Stripe,
  GoDaddy/DNS, Google Drive, and future connector accounts.
- Definition of done: provider/workspace-scoped integration rows, secret refs,
  redacted audit logs, setup UI, helper tools, readiness tests, and approval
  gates exist; raw secrets are never returned or logged.
- Current status: provider integration foundation is deployed with
  `bna_provider_integrations`, `bna_provider_secret_refs`, and
  `bna_provider_integration_audit_log`; direct live integration status readback
  returned 15 readiness cards.
- Open decisions: whether to add compatibility aliases for the older
  `bna_workspace_integrations` and `bna_secret_refs` naming, or keep the
  current provider-scoped model as canonical.
- Pending external actions: provider account access, DNS records, credentials,
  and explicit approvals for real provider actions.
- Codex workstreams: INT-05, THURSDAY-ACCESS, HELPER-03.
- Proof required: secret redaction tests, `npm run secrets:audit`,
  integration UI smoke, helper tool tests, live migration/readback.

## GOAL-005 - Service Provider Index And Free Basic Landing Pages

- Scope: public provider directory, provider join flow, free basic provider
  pages, provider workspace, provider-specific leads and integrations.
- Definition of done: providers can get a reviewed free basic listing/page from
  uploaded media/info; provider workspace and integrations remain scoped;
  custom domains stay optional/future.
- Current status: provider directory/join/profile and workspace foundations
  exist; media-to-landing-page automation is still a staged workstream.
- Open decisions: exact free listing fields, moderation policy, and upgrade
  packaging.
- Pending external actions: provider source material and approval for public
  listing publication.
- Codex workstreams: UI-01, provider-index, INT-05.
- Proof required: public `/service-providers`, `/providers/join`,
  `/providers/:slug`, provider workspace screenshots and live smoke.

## GOAL-006 - One Time Mishnayos Product, Funnels, Class, And Library

- Scope: Rabbi Scheller / One Time provider workspace, public draft funnels,
  7pm Israel class calendar, product tiers, interest leads, member/library
  workflow, source prep.
- Definition of done: product system is decision-ready, draft/noindex funnels
  exist, class calendar and library workflow are first-party, live checkout and
  access grants happen only after explicit decisions and smoke proof.
- Current status: RABBI-04 implementation is deployed in the accumulated
  release; product/legal/billing/source decisions remain blocked.
- Open decisions: final prices, refunds/legal copy, payment owner, billing
  provider readiness, launch copy, source transcript, and member-library
  destination.
- Pending external actions: Thursday owner-access session, final product/
  payment decisions, and source artifacts.
- Codex workstreams: RABBI-04, COMMUNITY-06, INT-05, THURSDAY-ACCESS.
- Proof required: One Time public/Operations screenshots, tests, live funnel
  smoke, scoped Operations smoke, no checkout/access-grant proof.

## GOAL-007 - Product-Grade UI Cleanup

- Scope: public site, Operations, super admin, service provider workspace,
  parent portal, student portal, Family App/Home Accountability, One Time,
  integration setup, decisions/pending/tasks/detail modals.
- Definition of done: one brand system and predictable navigation per surface;
  mobile-first; no duplicate helper buttons, unreadable panels/cards, random
  duplicate actions, or horizontal overflow at 375px.
- Current status: UI-01 proof exists and the accumulated bundle is deployed;
  additional live UI screenshot proof can be run as a narrow QA follow-up.
- Open decisions: which additional UI surfaces need visual proof before launch.
- Pending external actions: none for deploy; optional live UI screenshot QA.
- Codex workstreams: UI-01, OPS-02, INT-05, HELPER-03.
- Proof required: desktop, 390px, and 375px screenshots across listed surfaces,
  no-overflow smoke, live Operations/public smoke.

## GOAL-008 - Legacy Family Accountability Cleanup While Preserving Family App

- Scope: README, setup docs, archived family-app docs/code, active BNA runtime,
  Family App/Home Accountability workspace.
- Definition of done: repo identity is BNA v2.0; archived family-accountability
  material is historical; any active Family App/Home Accountability product is
  explicitly scoped as one workspace/product, not the whole repo.
- Current status: README and PROJECT-NOTES already reflect BNA; older docs and
  archived references still need periodic audit, not runtime edits.
- Open decisions: whether Family App/Home Accountability is a retained product
  line and what its first live scope should be.
- Pending external actions: Shloimie product decision if the family workspace
  should become active.
- Codex workstreams: FAMILY-CLEANUP, UI-01.
- Proof required: stale-family docs audit, no active archived runtime edits,
  smoke proving BNA/public/Operations identity remains current.
