# One Time Communications Architecture v1

- Decision ID: `DEC-20260721-002`
- Status: Accepted
- Date: 2026-07-21
- Scope: `platform_control` / `one_time` / `one_time_mishnayos`
- Raw authority: `RAW-20260721-002`
- Supersession: narrows the historical no-GHL rule for the One Time external
  product connector only; it does not supersede BNA School's first-party CRM
  architecture.

## Decision

The platform model is:

```text
Super Admin / Platform Control
  BNA school workspace
  One Time external product connector
```

One Time is not BNA. BNA School remains a first-party school workspace. One
Time is an external product connector whose communications can be coordinated
from Super Admin without turning One Time data into BNA School data.

For the One Time connector only, ownership is:

| Concern | Source of truth | Contract |
| --- | --- | --- |
| Customer communications | GHL / HighLevel | Canonical conversation, draft, send, and status history. |
| Product and account state | One Time app | Accounts, access, enrollment, class, product, and entitlement state. |
| Assigned Torah/content work | Telegram | Rabbi interface only; never the canonical transcript. |
| Security-token email | Resend | Delivery transport only for login, verification, password-reset, and equivalent security tokens. |

Every One Time communication send, draft, or status change must be represented
in GHL. For Resend security-token delivery, GHL receives a redacted delivery
event and status, never the token or secret-bearing message body.

## BNA School Preservation

BNA School keeps its accepted first-party school operations architecture. Its
contacts, parent/student records, communications, tasks, and CRM state remain
in first-party BNA systems. The One Time GHL exception must not be applied to
`bna_school`, used as a default platform policy, or treated as permission to
revive the retired BNA GHL/LeadConnector runtime.

Shared platform primitives may validate connector contracts, display readiness,
and carry source-workspace metadata. They do not change record ownership.

## Human Routing

The default inbound owner for One Time is Shloimie.

Rabbi Eli receives only:

- assigned substantive Torah, Mishnah, or halachic questions;
- Rabbi-authored newsletter or content drafts;
- approved warm enrollment drafts.

Rabbi Eli does not receive:

- login;
- billing;
- support;
- scheduling;
- parent administration;
- unknown or general messages.

AI may classify, redact, summarize, and prepare routing metadata. AI may not
originate a Torah answer in Rabbi Eli's name, impersonate Rabbi Eli, or mark a
Torah answer as Rabbi-approved. An assigned Torah item remains pending Rabbi
action until a Rabbi-authored response is captured.

## Record Ownership

The following are separate record types, not variants of one BNA ticket:

| Record type | Owner | Canonical system | Required scope behavior |
| --- | --- | --- | --- |
| `live_class_question` | One Time | One Time app | One Time class/question context; not a support ticket. |
| `business_conversation` | GHL | GHL | Customer/business thread; defaults to Shloimie unless explicitly assigned. |
| `technical_ticket` | Super Admin | Platform Control | Requires `source_workspace`; One Time technical issues are not BNA School tickets. |

`technical_ticket.source_workspace` must be `bna_school` or `one_time`. A
technical ticket may reference a connector correlation ID, but it must not copy
private One Time conversation bodies into BNA School. One Time must continue to
operate when the Super Admin technical-ticket service is unavailable.

## Rabbi Telegram Contract

Telegram is a scoped interface and alert channel. It stores only the minimum
transport and correlation metadata needed for delivery, assignment, reply
matching, and audit. GHL is the canonical One Time communication transcript.

Telegram routing must enforce the Rabbi allowlist and denylist above. A draft
or status change made through Telegram is not complete until the corresponding
GHL record is written and its correlation/readback is recorded. This decision
does not authorize any Telegram or GHL write.

## Super Admin Connector Contract

The durable machine contract is:

- schema: `docs/architecture/contracts/super-admin-external-product-connector-v1.schema.json`;
- One Time instance: `docs/architecture/contracts/one-time-communications-connector-v1.json`.

Super Admin owns connector readiness, technical escalation, contract
validation, and safe Agent Action handoff. It does not become the source of
truth for One Time product/account data or business conversations.

## Agent Action Contract

Architecture and configuration work for this connector uses the reusable
Agent Action save/readback lifecycle. A job must carry its source ref,
workspace, connector, canonical-system target, record type, allowed and
forbidden actions, evidence, idempotency key, and result readback URL.

The schemas are:

- `docs/architecture/contracts/one-time-communications-agent-action-job-v1.schema.json`;
- `docs/architecture/contracts/one-time-communications-agent-action-result-v1.schema.json`.

The job contract is no-mutation by default. A later execution job needs its own
exact authorization; this architecture lane grants none.

## Explicit Non-Goals

- No BNA School CRM redesign or GHL adoption.
- No email or Telegram send.
- No GHL mutation, import, workflow execution, or transcript write.
- No DNS or credential change.
- No production deployment.
- No consolidation of the three record types into a BNA queue.
- No AI-authored Torah answer in Rabbi Eli's name.

## Consequences

- Historical global no-GHL wording must be read as a BNA School rule plus a
  One Time connector exception.
- One Time communication integrations must treat GHL write/readback as the
  completion boundary while keeping the One Time app authoritative for product
  and account state.
- Super Admin technical tickets must always name their source workspace.
- Contract validation can proceed independently of external provider access,
  sends, mutations, DNS, or deployment.
