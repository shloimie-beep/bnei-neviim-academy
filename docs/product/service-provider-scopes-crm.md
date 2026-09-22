# Scope Decisions: Super Admin, School, Free Provider, Provider Plus, Family

## Canonical tenant types

Keep the repo's current tenant model:

- `school`
- `service_provider`
- `family`

`super_admin` is a global role/context, not a tenant type.

## Roles and plans

| Display | Internal tenant | Plan / entitlement | Notes |
|---|---|---|---|
| Super Admin | none/global | `super_admin` role | Shloimie only for now. Can inspect/switch scopes. No Codex CLI routing from assistant. |
| School | `school` | `school` | Schools are full-featured by definition. Do not create `school_plus`. |
| Free Service Provider | `service_provider` | `free_provider` / `free_listing` | Listing, comments/contact replies, setup bot, provider calendar. No full CRM or portals. |
| Service Provider Plus | `service_provider` | `service_provider_plus` | Full provider operating system: CRM, content, communications, paid portals, automations readiness, reporting. |
| Rabbi Scheller Partner | `service_provider` | `rabbi_scheller_partner` / `revenue_share_partner` | Alias/extension of Provider Plus with One Time-specific partner controls. |
| Family | `family` | `family` | Parent/student portal only inside family scope. |

## Revised provider tiers

### Free service provider

Allowed:

- public profile/listing;
- category/service listing;
- listing comments and parent contact inquiry responses;
- account setup helper;
- provider calendar;
- basic support;
- limited analytics/readback;
- external CTA to website/phone/WhatsApp/email.

Not allowed:

- full CRM contacts/filtering/pipeline;
- parent portal;
- student portal;
- content/video workflow;
- social scheduling/drafts;
- WhatsApp automation;
- email workflows;
- landing/funnel builder;
- payment/access tracking;
- integration settings;
- custom partnership controls.

### Service Provider Plus

Allowed:

- full first-party CRM contacts;
- filters, tags, segments, pipeline stages;
- parent/student portals when enabled/paid;
- provider calendar;
- content/video workflow;
- social draft workflow;
- communications readiness;
- WAPI/WhatsApp readback and approval-gated sends;
- automations/readiness, no live execution without approval;
- reporting;
- integration readiness;
- payment/access readiness;
- support/tickets;
- custom partnership terms if partner.

### Rabbi Scheller / One Time

Use Provider Plus + partner controls:

- workspace: `rabbi_sheller_provider`;
- project: `one_time_mishnah_class`;
- commercial model: `revenue_share` or `custom`;
- entitlement: `rabbi_scheller_partner` / `revenue_share_partner`;
- no BNA school data leakage;
- no external write without approval.

## Bot/helper scope

### Global rule

The assistant/helper must be scope-aware and entitlement-aware. It must not be a hidden backdoor around route/API permissions.

### Remove Codex CLI routing

- Remove web/portal assistant ability to route user requests to Codex CLI.
- Do not show Codex CLI controls in portals.
- Do not expose `codex_cli`, `deploy`, `migration`, `shell`, `railway`, or `secret_copy` actions through portal assistants.
- Keep agent/developer workflows separate from user helper scope.

### Free provider bot

Allowed:

- help complete listing/account setup;
- explain missing listing fields;
- draft responses to parent contact inquiries;
- help manage provider calendar events;
- create support ticket if provider reports a bug.

Not allowed:

- CRM pipeline;
- parent/student portal setup;
- sends/broadcasts;
- content/social posting;
- integrations/secrets;
- payments/access grants.

### School bot

Allowed:

- school CRM, parents/students, assignments, calendar, communications, YouTube assignment scheduling if school role permits.

### Provider Plus bot

Allowed:

- scoped CRM/contact help;
- content/social draft preparation;
- portal setup guidance;
- automations preview;
- reporting summary;
- no external sends/writes without approval.

## Portal decision

Provider parent/student portals are paid/Plus features. Free providers may receive parent inquiries and reply to them, but that is not a parent portal.

## CRM decision

Build the polished CRM as first-party BNA Operations:

- list contacts;
- filter contacts;
- display contact cards;
- expand to timeline/conversations;
- tag and status controls;
- workspace/project scope;
- WAPI/WhatsApp readback;
- no external CRM.
