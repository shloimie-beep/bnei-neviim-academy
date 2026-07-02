# Telegram And Website Assistant Control Plane

Requirement: `REQ-20260623-011`
Source: `RAW-20260623-005`, GitHub issue #7 comment `4780321517`

## Purpose

Telegram and the website assistant are adapters over one canonical natural
language control plane. They do not own separate business logic, action
registries, intake pipelines, provider onboarding systems, agent queues, or
approval paths.

The control plane lets a user speak naturally, then resolves identity,
workspace, conversation context, source provenance, typed actions, previews,
approvals, execution, evidence, reminders, tickets, and Agent Work through
shared services.

## Shared Layers

Every supported assistant surface must use the same durable layer for:

- authenticated identity
- workspace and role
- conversation state
- source envelope
- file and media intake
- action registry
- action planner
- permission engine
- preview system
- approval system
- audit event
- draft, template, and versioning
- reminders and notifications
- ticketing
- Agent Work handoff
- progress and completion state

The exported contract in `src/platform/assistant/control-plane.js` names these
layers as `SHARED_CONTROL_PLANE_LAYERS`.

## Surfaces

Canonical channels:

- `telegram`
- `website_assistant`
- `operations_helper`
- `provider_portal_assistant`
- `parent_portal_assistant`
- `student_portal_assistant`
- `future_approved_channel`

Channel adapters may render differently. They may not create competing
business rules.

Telegram adapter responsibilities:

- Telegram buttons
- Telegram reminders
- forwarded messages
- Telegram file downloads
- concise status replies
- secure deep links

Website assistant responsibilities:

- website cards
- browser previews
- page-aware context
- website upload controls
- apply/undo buttons
- secure deep links

Provider, parent, and student portal assistants may add page context and
portal-specific pickers or preview cards, but still call the shared action
planner and permission engine.

## Forbidden Duplicates

The following are explicitly forbidden:

- second Telegram architecture
- separate website-bot action system
- duplicate action registry
- duplicate intake pipeline
- duplicate agent queue
- duplicate provider onboarding system
- separate provider page builder
- browser-click substitution for ordinary typed actions

Service-provider creation and editing must use Service Provider Studio as the
canonical system. Telegram and website assistant can collect answers, upload
assets, show previews, and open secure Studio links, but they do not build a
new page builder.

## Action Flow

The shared flow is:

```text
natural language or upload
-> source envelope
-> identity, workspace, and role resolution
-> conversation state
-> registry-constrained action plan
-> permission check
-> dry-run or preview when needed
-> approval when needed
-> typed action execution once
-> audit event
-> delivery/rendering in the current channel
-> progress, ticket, reminder, or Agent Work state
```

The model may suggest a plan, but model text alone never executes. Unknown
action IDs are rejected. Risky actions require preview and explicit approval.

## Role Scope

Super admin can use every authorized platform capability through typed actions,
with no permission bypass and no silent external sends.

Service-provider owners/admins are scoped to their provider workspace and use
Studio for profile, listing, website, brand, class, course, community, and
communication drafts.

Parents are scoped to linked children only. They may configure display layouts,
submit allowed updates for review, ask questions, create tickets, and manage
reminders/preferences. They may not alter official attendance, scores, or
another child's records.

Students, where enabled, are scoped to their own schedule, classes, courses,
worksheets, progress, approved achievements, questions, tickets, and display
preferences.

## Evidence Contract

Every app-visible implementation batch must record:

- source requirement IDs
- inspected files/routes/workflows
- implementation files
- tests
- route/action registry coverage
- deploy evidence
- live smoke proof
- explicit blockers for external sends, billing, DNS, OAuth, credentials, or
  account-owner actions

This document defines the contract only. Later requirements add schema,
planner, preview/versioning, media intake, provider onboarding, parent
self-service, campaigns, automations, tickets, reminders, Operations Control
Center, and cross-channel QA.
