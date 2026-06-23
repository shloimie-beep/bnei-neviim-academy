# One Time First-Party BNA Operations Capability Map

Date: 2026-06-15

Status: local readiness map for Rabbi Scheller / One Time. This document does
not grant access, publish content, send messages, create billing/access
changes, write Google/Drive/Buffer/Vimeo/Resend/Stripe, or modify Rabbi-owned
systems.

## Purpose

Before any external One Time writes, BNA should know which parts of the Rabbi
Scheller platform can be operated safely inside first-party BNA Operations and
which parts still belong to Rabbi-owned systems until access and approval are
explicit.

This map closes the current planning gap for:

- contacts
- tags and segments
- pipelines and opportunities
- calendars and classes
- payments and access
- workflows and automations
- community and membership support
- social/content posting through Buffer
- browser-only gaps in Rabbi-owned systems

## Source Boundaries

Authoritative BNA-side evidence includes:

- `server.js` first-party schema and API routes.
- `src/lib/actions/registry.js` and generated action-registry artifacts.
- `ops/one-time-mishnah/rabbi-app-access-and-backend-audit.md`.
- `ops/one-time-mishnah-class/drive-social-ingestion-map.md`.
- `ops/bna-helper/bna-helper-tool-audit.md`.
- Existing live-smoked Operations surfaces for Contacts, Content, Calendar,
  Pipelines, Settings, Automations, Integrations, and Admin > Roles.

This is not a fresh live One Time app, Replit, Vimeo, Stripe, Resend, Google,
Buffer, or WhatsApp probe. Current live external access still needs owner
confirmation and explicit approval.

## Capability Matrix

| Capability | First-party BNA owner | Current primitive | Safe current use | External/browser-only gap |
|---|---|---|---|---|
| Contacts and identities | BNA Operations / Rabbi provider workspace | `bna_people`, `bna_contacts`, `bna_parent_leads`, `bna_contact_communications`, `bna_project_members`, provider records | Store One Time leads, Rabbi/provider contacts, participants, internal notes, WAPI/local history, support links, and scoped review records | Existing One Time member/subscriber accounts remain in the Rabbi-owned app until live target/admin/member access is confirmed |
| Tags and segments | BNA Operations | contact/lead tags, provider entitlements, content/job metadata, action preview outputs | Segment school-interest, provider, One Time lead/member-review, referral, question-review, content, and follow-up records for review | No bulk tag sync into external apps, WhatsApp, Buffer, email, or Rabbi-owned systems without explicit connector design |
| Pipelines and opportunities | BNA Operations | `bna_parent_leads`, `bna_pipeline_cards`, `bna_tasks`, `bna_support_tickets`, one-time onboarding route | Track One Time lead capture, referrals, proposal tasks, support tickets, launch milestones, and follow-up ownership | External sales funnel, member billing funnel, and live Rabbi app status are not writable from BNA yet |
| Calendars and classes | BNA Operations | `bna_calendar_events`, `bna_provider_service_sessions`, `bna_provider_sessions`, `bna_class_sessions`, `calendar_batch_launch_plan_preview` | Plan provider sessions, class calendar, internal launch schedule, tasks, and no-write Google Calendar previews | Live Google Calendar/Classroom writes require OAuth/test-user scope approval and `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` |
| Payments and access | BNA Operations readback/review only | `bna_payment_intake`, `bna_payment_log`, `bna_checkout_attempts`, provider entitlements, access checklist, One Time app-access readiness API | Track payment/access decisions, blockers, proposed tier mapping, support cases, and readiness checklist | Stripe/Green Invoice checkout, refunds, member grants, subscription state, and revoke flow remain blocked until processor/source-of-truth approval |
| Workflows and automations | BNA Operations | action registry, bot action logs, automation library, in-app notifications, task/comment lifecycle | Preview typed actions, log dry-runs, create local review tasks, alert admins, and document approval phrases | No live automation sends, billing/access changes, publishing, or connector writes until sender/recipient/source/rollback policy is approved |
| Community and membership support | BNA Operations private-first | `bna_learning_communities`, `bna_learning_community_members`, community threads/messages, `bna_one_time_question_reviews`, private moderation queue | Maintain private review queues, learning-community structure, participant support, internal dialogue, and moderated question workflow | No public forum, member-visible answer feed, leaderboard, reward ledger, or member notification channel is approved |
| Content and media intake | BNA Operations Content | `bna_content_jobs`, `bna_content_outputs`, One Time Library, meeting drops, video-library helper, thumbnail preview, publish-package preview | Convert Drive drops and meeting recordings into internal library cards, transcript review, thumbnail brief, worksheet/source-sheet, newsletter, and social-copy review lanes | Actual member-library publish, video-host/Drive write, and public/member visibility require destination, hosting, rollback, and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` |
| Social/content posting through Buffer | BNA Operations plus Buffer connector | `preview_social_schedule_package`, Buffer diagnostics, channel settings, content outputs, hosted media asset payloads | Preview Facebook/LinkedIn/YouTube schedule packages, hosted image/video URL readiness, blockers, channel readiness, copy, and approval phrase | Actual Buffer draft creation/publish and media attachment require approved source material, channel/account, stable direct hosted media URL, schedule, rollback, and `APPROVE_BUFFER_SOCIAL_DRAFT`; BNA still does not host/upload local media files to Buffer |
| WhatsApp/WAPI communications | BNA Operations plus WAPI/Whapi connector | WAPI phonebook report, Whapi sync runs, local communication history, helper action, correction preview | Import/read local WhatsApp history, group phonebook rows, preview corrections, and log local notes | Actual sends, broadcasts, tag sync, number portability, Wappy vendor choice, and automation require separate approval |

## What BNA Can Own Now

BNA can safely own the operating layer:

- scoped Rabbi provider workspace and project membership
- One Time lead and referral review records
- local contact notes and communication history readback
- provider schedule/class planning
- launch task calendar and internal milestones
- support tickets and comments
- private question moderation
- content intake and review lanes
- publish-package and social schedule previews
- local approval packets and decision previews
- first-party audit logs and in-app admin alerts

These are local, scoped BNA Operations records. They do not replace the live
One Time production app, billing provider, media host, email sender, or
member-library backend.

## What Stays External Until Approved

The following remain browser-only, owner-confirmed, or connector-gated:

- current One Time live URL and deployment target
- Replit/source deployment dashboard
- One Time production/staging database
- One Time admin and member test credentials
- Vimeo/media host and thumbnail upload paths
- Stripe or Green Invoice billing source of truth
- Resend sender/domain/templates
- GoDaddy/domain/DNS
- hotline/phone provider
- Google Calendar/Classroom/Drive/Business Profile live adapters
- Buffer publish/draft creation with media attachment
- WhatsApp Business/Wappy/Whapi outbound automation and number portability

BNA should not write to these systems from natural language or local planning
docs. Each one needs target confirmation, credentials stored outside chat,
approval phrase, rollback path, and a focused smoke.

## No-GHL Rule

No active One Time or BNA capability above depends on GHL, GoHighLevel,
LeadConnector, or LeadConnectorHQ. Historical wording may appear in archived or
old task records only. New runtime work should use first-party BNA Operations
tables/APIs plus approved connectors such as Google, Buffer, WAPI/Whapi, email,
or billing providers after approval.

## Recommended Sequence

1. Keep BNA Operations as the canonical review layer for contacts, tasks,
   content, support, community, and approval packets.
2. Use existing preview helpers for One Time content, launch calendar, Google
   Classroom/Drive planning, social schedule packages, and contact history.
3. Finish the Drive/media intake workflow as a first-party content pipeline
   before any member-library publishing.
4. Confirm the live One Time URL, deployment target, Shloimie/admin login,
   Rabbi/member test login, media host, sender/domain, and billing source.
5. Choose exact smoke items for external publishing/access tests.
6. Only then add connector execution paths, each behind a typed approval phrase
   and rollback/no-send plan.

## Acceptance For External Writes

No external write path should be considered ready until all items are true:

- target system and source of truth are confirmed
- credentials exist outside the repo/chat
- actor role and workspace scope are explicit
- exact record/content item is selected
- preview output is reviewed
- approval phrase is typed
- rollback/revoke path is documented
- focused local and live smokes exist
- audit log records actor, target, inputs, result, and no secret values

## Current Recommendation

Use BNA Operations as the first-party command center and evidence trail. Keep
Rabbi-owned systems as external targets until Shloimie and Rabbi Scheller
approve access, destinations, visibility, billing/access rules, and exact
smoke items. This lets Codex continue building useful internal workflows while
protecting One Time members, BNA school families, and Rabbi-owned production
systems from accidental cross-scope writes.
