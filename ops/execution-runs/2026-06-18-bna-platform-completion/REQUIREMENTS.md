# Requirements

The machine-readable requirements are in `requirements.json`.

Imported June 18 areas:

- audit harness / audit package
- PWA public-vs-Operations separation
- workspace model and RBAC
- Operations shell/navigation
- design system
- task manager / intake / calendar
- module scoping
- students / Goal Board / Hebrew
- unified OpenAI helper
- public copy and portal headers
- test data and acceptance tests

Audit-dependent remediation areas `REQ-20260618-101` through
`REQ-20260618-111` remain blocked until the local audit package or audit output
path is available.

Agent Control Center intake from `RAW-20260619-001` was added as unblocked
requirements `REQ-20260618-112` through `REQ-20260618-123` because the prior
run was blocked solely on the external audit package and this work does not
depend on screenshot-specific findings.

Local statuses after the 2026-06-19 batch:

- `REQ-20260618-112` open: parent Agent Control Center requirement.
- `REQ-20260618-113` needs verification: agent profile schema/seed.
- `REQ-20260618-114` needs verification: run schema/state machine.
- `REQ-20260618-115` needs verification: Agents menu and task handoff UI.
- `REQ-20260618-116` needs verification: versioned prompt generation.
- `REQ-20260618-117` needs verification: Agent Run portal/progress controls.
- `REQ-20260618-118` needs verification: evidence and Seal Run validation.
- `REQ-20260618-119` done locally: failed/blocked feedback and Decision routing.
- `REQ-20260618-120` needs verification: Super Admin/project-scope controls.
- `REQ-20260618-121` in progress: verification policy/Playwright integration.
- `REQ-20260618-122` in progress: notifications and audit history.
- `REQ-20260618-123` not started: safe demo data, E2E, manual Agent Mode smoke.

## One Time Master Recovery Packet - 2026-06-19T12:05:00+03:00

New high-level requirements `REQ-20260619-300` through `REQ-20260619-314` were added to the active run. Batch 0 is locally done; remaining rows are open until implementation, verification, and external decisions/deploy proof where required.

## One Time Master Recovery Batch 1 - 2026-06-19T12:45:00+03:00

`REQ-20260619-301` is done locally. The execution-run validator and protocol
now require mapped source statements, source metadata for captured packets,
real repo evidence paths, positive deployment/live-smoke evidence for
live-required closed rows, blocker owner/next action, current git refs when
recorded, a single active run, and non-stale `NEXT-SESSION.md` handoffs.

Remaining One Time master requirements start with `REQ-20260619-302`, the
read-only task and Decision census.

## One Time Master Recovery Batch 2 - 2026-06-19T12:58:00+03:00

`REQ-20260619-302` is terminal as `needs_operator_decision`. The read-only
live/API census and dry-run cleanup plan are complete, but applying archive,
quarantine, lane-repair, proof-link, or visible-title cleanup would mutate live
task records and requires explicit operator approval.

Remaining implementation work starts with `REQ-20260619-303`, the One Time
workspace users, roles, and authorization model.

## One Time Master Recovery Batch 3 - 2026-06-19T13:08:00+03:00

`REQ-20260619-303` is terminal as `needs_operator_decision`. The local
canonical One Time role/auth model is implemented and focused local tests pass,
including the One Time Operations UI smoke. Closing the row as deployed, and
any real invite/remove/deactivate or role-change persistence, requires explicit
operator release/persistence approval.

Remaining implementation work starts with `REQ-20260619-304`, the Operations UI
and shared design system remediation batch.

## One Time Master Recovery Batch 4 - 2026-06-19

`REQ-20260619-304` is terminal as `needs_operator_decision`. The credential-free
current-state UI/design-system delta audit and focused local UI tests pass, and
the generated report records one low-risk raw JSON polish warning. Closing the
row as fully live/deployed requires local Operations audit storage state,
operator-approved authenticated `npm run ops:audit`, and release/live-smoke
approval.

Remaining implementation work starts with `REQ-20260619-305`, the first-party
communications workspace for WhatsApp and email.

## One Time Master Recovery Batch 5 - 2026-06-19

`REQ-20260619-305` is terminal as `needs_operator_decision`. The local
first-party WhatsApp/email communications workspace is implemented and focused
tests pass. Closing the row as fully live/deployed requires release/live-smoke
approval, and any real email/WhatsApp send, Resend sender/domain/DNS/Railway
propagation, or WAPI outbound use remains explicitly operator-gated.

Remaining implementation work starts with `REQ-20260619-306`, the One Time
product, schedule, booking, portal, and billing readiness batch.

## One Time Master Recovery Batch 6 - 2026-06-19

`REQ-20260619-306` is terminal as `needs_operator_decision`. The local One Time
product readiness contract now covers product definitions, schedule/cohort
readiness, consultation booking readiness, parent/student/provider portal
surface requirements, and billing/access gates without enabling live checkout
or external writes. Closing the row as fully live/deployed requires
release/live-smoke approval, plus separate approval for billing provider,
refund/cancellation/failed-payment policy, real booking/schedule rules, Zoom/
calendar writes, portal publishing, and any external sends.

Remaining implementation work starts with `REQ-20260619-307`, the Zoom
attendance and session automation batch.

## One Time Master Recovery Batch 7 - 2026-06-19

`REQ-20260619-307` is terminal as `needs_operator_decision`. The local no-write
Zoom automation contract is implemented and focused local tests pass. It covers
session creation previews, registrant staging previews, member join redirect
guardrails, webhook attendance event mapping previews, and review-only
attendance correction drafts. Closing the row as fully live/deployed, or
creating real Zoom meetings/registrants/webhooks/attendance writes, requires
operator release/live-smoke approval and `DEC-20260619-304`.

Remaining implementation work starts with `REQ-20260619-308`, the recording,
transcript, summary, and Vimeo publication pipeline.

## One Time Master Recovery Batch 8 - 2026-06-19

`REQ-20260619-308` is terminal as `needs_operator_decision`. The local no-write
recording/Vimeo pipeline contract is implemented and focused local tests pass.
It covers recording webhook/sample handling, multiple recording files,
preferred layout and audio-only fallback, transcript/summary readiness, retry,
dead-letter, idempotency, review/correction/approval/rejection states, manual
Vimeo ID review, API upload preview, publication/unpublish/delete gates,
retention checks, entitlement checks, and watch-progress handoff. Closing the
row as fully live/deployed, or running real Vimeo/provider/member visibility
writes, requires operator release/live-smoke approval and the Vimeo upload or
manual-ID policy decision.

Remaining implementation work starts with `REQ-20260619-309`, transcript
privacy and knowledge scoping.

## One Time Master Recovery Batch 9 - 2026-06-19

`REQ-20260619-309` is terminal as `needs_operator_decision`. The local no-write
transcript privacy and knowledge-scope contract is implemented and focused
local tests pass. It covers transcript version metadata, timestamped segment
and speaker confidence metadata, explicit privacy classes, student matching and
review states, audience-scoped retrieval policy previews, public-helper raw
transcript guardrails, and a no-write Operations readiness panel. Closing the
row as fully live/deployed, or importing/publishing raw transcripts, mutating a
vector/public-helper corpus, enabling cross-student retrieval, or publishing
portal transcript access requires operator release/live-smoke approval and live
privacy readback proof.

Remaining implementation work starts with `REQ-20260619-310`, server-side
gamification and badge auditing.

## One Time Master Recovery Batch 10 - 2026-06-19

`REQ-20260619-310` is terminal as `needs_operator_decision`. The local no-write
gamification and badge-audit contract is implemented and focused local tests
pass. It covers automatic badge definitions, Rabbi-awarded badge definitions,
configurable thresholds, stable idempotency keys, source event/class evidence,
parent-safe explanations, manual reversal drafts, badge audit schema, a
readiness-only route, a no-write Operations readiness panel, and removal of the
ranked public points leaderboard from the member classroom page. Closing the
row as fully live/deployed, or writing real badge awards/reversals, sending
notifications, granting access, issuing prizes/credits, or changing
parent/student/member display requires operator release/live-smoke approval and
live readback proof.

Remaining implementation work starts with `REQ-20260619-311`, community and
moderation workflow.

## One Time Master Recovery Batch 11 - 2026-06-19

`REQ-20260619-311` is terminal as `needs_operator_decision`. The local
no-write community/moderation workflow contract is implemented and focused
local tests pass. It covers Rabbi announcements, cohort discussions, private
questions, parent-visible holds, staff-only visibility, moderated posting,
edit/delete history, report/flag flow, private-to-public anonymization preview,
audit metadata, and the preserved no-unrestricted-student-messaging guardrail.
Closing the row as fully live/deployed, or running real public/member
community publication, external notifications, deletion purges, visibility
changes, or unrestricted student messaging, requires operator release/live-smoke
approval and live readback proof.

## One Time Master Recovery Batch 12 - 2026-06-19

`REQ-20260619-312` is terminal as `needs_operator_decision`. The local no-write
Sefaria and scoped study-assistant readiness contract is implemented and
focused local tests pass. It covers approved source-version metadata, content
hashes without body return, explicit quote/summary/index permissions, source
licensing and citation gates, provider/cohort/student-private/restricted
retrieval scopes, restricted/raw/cross-student blockers, a readiness-only
route, a no-write Operations panel, and the disabled study-assistant feature
flag. Closing the row as fully live/deployed, ingesting Sefaria/API content,
mutating a source corpus, publishing portal assistant access, enabling answer
generation, or enabling live retrieval requires operator release/live-smoke
approval plus licensing, citation, privacy, and Rabbi approval proof.

## One Time Master Recovery Batch 13 - 2026-06-19

`REQ-20260619-313` is terminal as `needs_operator_decision`. The local Option B
deployment/domain readiness packet is implemented and focused local tests pass.
It covers the architecture decision record, One Time deployment profile,
identity map, database installation identity guard, schema-vs-client-seed
separation, database bootstrap procedure, Railway runbook, Railway cost
worksheet, asset ownership register, domain/DNS launch checklist, rollback
plan, backup plan, staging smoke plan, and production launch plan. Closing the
row as actually deployed/live-smoked, or creating Railway resources, attaching
a production database, writing Railway variables, changing DNS/domain records,
or launching a One Time production target requires operator approval of
`DEC-20260619-300` / `Q-20260619-300`.

Remaining implementation work starts with `REQ-20260619-314`, final
verification, commit, push, deploy, and live smoke loop.

## One Time Master Recovery Batch 14 - 2026-06-19

`REQ-20260619-314` is terminal as `needs_operator_decision`. The safe local
verification loop is complete and focused repairs from the final suite are
implemented: provider API key helper tools are visible in the permission
contract but denied to project/provider scoped helpers, default Operations
allowedViews includes the Agents module, and stale contract tests now match the
current Agents toolbar/auth behavior. Full `npm test` passed 901/901, run
validation/JSON parse/secret audit/diff check/watchdog audit passed, and the
missing 2026-06-19 website-correction continuation marker was restored.

Closing the row as `Done`, or running commit/push/PR update, deployment,
Railway doctor, production health/privacy/Operations/One Time owner/admin/
platform/parent/student/provider smoke, final screenshot capture, or live
BNA-vs-One-Time data-isolation proof requires explicit operator approval and
approved live/local credentials.
